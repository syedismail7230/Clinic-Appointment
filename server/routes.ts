import { Router } from 'express';
import { supabase } from './db.js';
import { v4 as uuidv4 } from 'uuid';
import { generateOTP, verifyOTP, generateToken, authenticateToken, optionalAuthenticateToken } from './auth.js';
import { notifyQueueUpdate } from './socket.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const router = Router();
const DEFAULT_TENANT_ID = 'default-tenant';

// Auth Routes
router.post('/auth/otp/send', async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number required' });
    if (phone.length < 10) return res.status(400).json({ error: 'Invalid phone number' });
    try {
        await generateOTP(phone);
        res.json({ message: 'OTP sent' });
    } catch (error: any) {
        res.status(429).json({ error: error.message || 'Too many requests' });
    }
});

router.post('/auth/otp/verify', async (req, res) => {
    const { phone, code } = req.body;
    if (!phone || !code) return res.status(400).json({ error: 'Phone and code are required' });
    
    if (await verifyOTP(phone, code)) {
        // Find or create user
        let { data: user, error } = await supabase.from('users').select('*').eq('phone', phone).single();
        
        if (!user) {
            user = { id: uuidv4(), phone, role: 'patient', tenant_id: null };
        }
        const token = generateToken(user);
        res.json({ token, user });
    } else {
        res.status(401).json({ error: 'Invalid OTP' });
    }
});

// Razorpay Setup
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

router.post('/payments/create-order', async (req, res) => {
    try {
        const options = {
            amount: 100, // ₹1 in paise for testing
            currency: 'INR',
            receipt: `rcpt_${uuidv4().substring(0, 8)}`
        };
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error: any) {
        console.error('Razorpay Error:', error);
        res.status(500).json({ error: 'Failed to create payment order' });
    }
});

// Onboarding
router.post('/onboard', async (req, res) => {
    const { name, email, phone, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    
    if (!name || !email || !phone) {
        return res.status(400).json({ error: 'Name, email, and phone are required' });
    }
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        return res.status(400).json({ error: 'Payment verification details required' });
    }
    
    // Verify Payment Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || '')
        .update(body.toString())
        .digest("hex");
        
    if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ error: 'Invalid payment signature' });
    }
    
    const tenantId = uuidv4();
    const userId = uuidv4();
    const clinicId = uuidv4();
    
    try {
        // Insert tenant
        const { error: tenantErr } = await supabase.from('tenants').insert({
            id: tenantId, name, email, phone,
            status: 'active', plan: 'premium',
            subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        });
        if (tenantErr) {
            if (tenantErr.code === '23505') return res.status(409).json({ error: 'A clinic with this email already exists' });
            throw tenantErr;
        }

        // Insert user (admin)
        await supabase.from('users').insert({
            id: userId, email, phone, role: 'admin', tenant_id: tenantId
        });
        
        // Create default clinic
        await supabase.from('clinics').insert({
            id: clinicId, tenant_id: tenantId, name, address: 'Address pending'
        });
        
        res.status(201).json({ success: true, tenantId });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Clinics (Public/Tenant Specific)
router.get('/clinics', async (req, res) => {
    const tenantId = req.query.tenantId || DEFAULT_TENANT_ID;
    
    const { data: clinics } = await supabase.from('clinics').select('*').or(`tenant_id.eq.${tenantId},tenant_id.is.null`);
    const { data: doctors } = await supabase.from('doctors').select('*').or(`tenant_id.eq.${tenantId},tenant_id.is.null`);
    
    const result = (clinics || []).map(clinic => ({
        ...clinic,
        doctors: (doctors || []).filter(doc => doc.clinic_id === clinic.id)
    }));
    
    res.json(result);
});

router.get('/clinics/:id', async (req, res) => {
    const id = req.params.id;
    
    // Try to find by clinic id first
    let { data: clinic } = await supabase.from('clinics').select('*').eq('id', id).single();
    
    // Fallback: search by tenant_id
    if (!clinic) {
        const { data: tenantClinic } = await supabase.from('clinics').select('*').eq('tenant_id', id).limit(1);
        if (tenantClinic && tenantClinic.length > 0) clinic = tenantClinic[0];
    }
    
    if (!clinic) return res.status(404).json({ error: 'Clinic not found' });
    
    const { data: doctors } = await supabase.from('doctors').select('*').eq('clinic_id', clinic.id);
    const docs = doctors || [];
    
    const today = new Date().toISOString().split('T')[0];
    
    const resultDoctors = await Promise.all(docs.map(async (doc) => {
        const { data: slots } = await supabase.from('slots').select('slot_time').eq('doctor_id', doc.id).or(`date.is.null,date.eq.${today}`);
        return { ...doc, availableSlots: (slots || []).map(s => s.slot_time).sort() };
    }));
    
    res.json({ ...clinic, doctors: resultDoctors });
});

// Queue (Public/Patient + Admin)
router.get('/queue', optionalAuthenticateToken, async (req: any, res: any) => {
    let query = supabase.from('queue').select('*');
    
    if (req.user?.role === 'admin' && req.user?.tenant_id) {
        query = query.eq('tenant_id', req.user.tenant_id);
    } else if (req.user?.role === 'patient' && req.user?.phone) {
        query = query.eq('phone', req.user.phone);
    } else if (req.query.tenantId) {
        query = query.eq('tenant_id', req.query.tenantId);
    } else {
        return res.status(400).json({ error: 'tenantId is required to query the queue' });
    }
    
    const { data: queue } = await query;
    
    const result = (queue || []).map(item => ({
        ...item,
        medicines: typeof item.medicines === 'string' ? JSON.parse(item.medicines) : item.medicines || []
    }));
    
    res.json(result);
});

router.post('/queue', optionalAuthenticateToken, async (req: any, res) => {
    const { id: clientProvidedId, patientName, phone, status, doctor, time, waitTime } = req.body;
    
    const tenantId = req.body.tenantId || req.user?.tenant_id;
    if (!tenantId) return res.status(400).json({ error: 'tenantId is required to join a queue' });
    if (!patientName) return res.status(400).json({ error: 'patientName is required' });
    if (!phone) return res.status(400).json({ error: 'phone is required' });
    
    const id = clientProvidedId || uuidv4();
    const todayStr = new Date().toISOString().split('T')[0];

    // Generate token
    const { count } = await supabase.from('queue').select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId).eq('date', todayStr);
    
    const generatedToken = `A-${((count || 0) + 1).toString().padStart(2, '0')}`;
    
    try {
        await supabase.from('queue').insert({
            id, tenant_id: tenantId, patientName, phone, status: status || 'booked',
            doctor, date: todayStr, time, waitTime, token: generatedToken, medicines: []
        });
        
        // Upsert patient
        const { data: existingPatient } = await supabase.from('patients').select('*').eq('tenant_id', tenantId).eq('phone', phone).single();
        
        if (!existingPatient) {
            await supabase.from('patients').insert({
                id: uuidv4(), tenant_id: tenantId, name: patientName, phone, last_visit: new Date().toISOString()
            });
        } else {
            const currentVisits = existingPatient.totalVisits || 1;
            await supabase.from('patients').update({
                last_visit: new Date().toISOString(),
                totalVisits: currentVisits + 1
            }).eq('id', existingPatient.id);
        }

        notifyQueueUpdate(tenantId);
        res.status(201).json({ id, token: generatedToken, tenantId });
    } catch (error: any) {
        console.error('[Queue] Insert error:', error.message);
        res.status(500).json({ error: 'Failed to add to queue' });
    }
});

router.patch('/queue/:id', authenticateToken, async (req: any, res) => {
    const { status, prescription, medicines } = req.body;
    const updates: any = {};
    
    if (status) updates.status = status;
    if (prescription !== undefined) updates.prescription = prescription;
    if (medicines) updates.medicines = medicines;
    
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No updates provided' });
    
    await supabase.from('queue').update(updates).eq('id', req.params.id);
    
    const { data: item } = await supabase.from('queue').select('*').eq('id', req.params.id).single();
    
    if (item?.tenant_id) notifyQueueUpdate(item.tenant_id);

    // Sync appointment
    if (status === 'completed' && item) {
        try {
            const { data: existingApt } = await supabase.from('appointments').select('id').eq('tenant_id', item.tenant_id).eq('phone', item.phone).eq('date', item.date).eq('doctor', item.doctor).single();
            
            if (existingApt) {
                await supabase.from('appointments').update({
                    status: 'completed',
                    notes: prescription || '',
                    prescription: prescription || '',
                    medicines: medicines || item.medicines || []
                }).eq('id', existingApt.id);
            } else {
                await supabase.from('appointments').insert({
                    id: uuidv4(), tenant_id: item.tenant_id, patientName: item.patientName, phone: item.phone,
                    date: item.date, time: item.time, doctor: item.doctor, status: 'completed',
                    notes: prescription || '', tags: [], prescription: prescription || '',
                    medicines: medicines || item.medicines || []
                });
            }
        } catch (err: any) {
            console.error('[Appointment Sync] Error:', err.message);
        }
    }

    res.json({ success: true });
});

// Appointments
router.get('/appointments', authenticateToken, async (req: any, res) => {
    const tenantId = req.user.tenant_id;
    if (!tenantId) return res.status(403).json({ error: 'Unauthorized clinic access' });
    
    const { data: appointments } = await supabase.from('appointments').select('*').eq('tenant_id', tenantId);
    res.json(appointments || []);
});

router.post('/appointments', authenticateToken, async (req: any, res) => {
    const tenantId = req.user.tenant_id;
    if (!tenantId) return res.status(403).json({ error: 'Unauthorized clinic access' });
    
    const { patientName, phone, date, time, doctor, status, notes, tags } = req.body;
    if (!patientName || !phone) return res.status(400).json({ error: 'patientName and phone are required' });
    
    const id = uuidv4();
    try {
        await supabase.from('appointments').insert({
            id, tenant_id: tenantId, patientName, phone, date, time, doctor,
            status: status || 'booked', notes: notes || '', tags: tags || []
        });
        res.status(201).json({ id, success: true });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to create appointment' });
    }
});

router.patch('/appointments/:id', authenticateToken, async (req: any, res) => {
    const { status, notes, tags } = req.body;
    const tenantId = req.user.tenant_id;
    const updates: any = {};
    
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;
    if (tags !== undefined) updates.tags = tags;
    
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No updates provided' });
    
    let query = supabase.from('appointments').update(updates).eq('id', req.params.id);
    if (tenantId) query = query.eq('tenant_id', tenantId);
    
    await query;
    res.json({ success: true });
});

// Patients
router.get('/patients', authenticateToken, async (req: any, res) => {
    const tenantId = req.user.tenant_id;
    if (!tenantId) return res.status(403).json({ error: 'Unauthorized clinic access' });
    
    const { data: patients } = await supabase.from('patients').select('*').eq('tenant_id', tenantId);
    res.json(patients || []);
});

// Clinic Settings
router.get('/admin/clinic', authenticateToken, async (req: any, res) => {
    const tenantId = req.user.tenant_id;
    if (!tenantId) return res.status(403).json({ error: 'Unauthorized clinic access' });
    
    const { data: clinic } = await supabase.from('clinics').select('*').eq('tenant_id', tenantId).single();
    res.json(clinic || {});
});

router.patch('/admin/clinic', authenticateToken, async (req: any, res) => {
    const tenantId = req.user.tenant_id;
    if (!tenantId) return res.status(403).json({ error: 'Unauthorized clinic access' });
    
    const { name, address, maps_link, logo_url, gst_number } = req.body;
    const updates: any = {};
    
    if (name) updates.name = name;
    if (address !== undefined) updates.address = address;
    if (maps_link !== undefined) updates.maps_link = maps_link;
    if (logo_url !== undefined) updates.logo_url = logo_url;
    if (gst_number !== undefined) updates.gst_number = gst_number;
    
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No updates provided' });
    
    await supabase.from('clinics').update(updates).eq('tenant_id', tenantId);
    res.json({ success: true });
});

// Patient History
router.get('/patients/:phone/history', authenticateToken, async (req: any, res) => {
    const tenantId = req.user.tenant_id;
    if (!tenantId) return res.status(403).json({ error: 'Unauthorized clinic access' });
    
    const { data: appointments } = await supabase.from('appointments').select('*')
        .eq('tenant_id', tenantId).eq('phone', req.params.phone).order('date', { ascending: false }).order('time', { ascending: false });
        
    const { data: queueHistory } = await supabase.from('queue').select('*')
        .eq('tenant_id', tenantId).eq('phone', req.params.phone).eq('status', 'completed').order('date', { ascending: false });
        
    res.json({ appointments: appointments || [], queueHistory: queueHistory || [] });
});

// Doctors
router.get('/admin/doctors', authenticateToken, async (req: any, res) => {
    const tenantId = req.user.tenant_id;
    if (!tenantId) return res.status(403).json({ error: 'Unauthorized clinic access' });
    
    // We do a manual join for now since foreign keys are simple
    const { data: doctors } = await supabase.from('doctors').select('*').eq('tenant_id', tenantId);
    const { data: clinics } = await supabase.from('clinics').select('id, name').eq('tenant_id', tenantId);
    
    const result = (doctors || []).map(doc => {
        const clinic = (clinics || []).find(c => c.id === doc.clinic_id);
        return { ...doc, clinic_name: clinic?.name };
    });
    
    res.json(result);
});

router.post('/admin/doctors', authenticateToken, async (req: any, res) => {
    const tenantId = req.user.tenant_id;
    if (!tenantId) return res.status(403).json({ error: 'Unauthorized clinic access' });
    
    const { name, specialty, clinic_id } = req.body;
    if (!name) return res.status(400).json({ error: 'Doctor name is required' });
    
    let clinicId = clinic_id;
    if (!clinicId) {
        const { data: clinic } = await supabase.from('clinics').select('id').eq('tenant_id', tenantId).limit(1).single();
        clinicId = clinic?.id;
    }
    
    const id = uuidv4();
    await supabase.from('doctors').insert({
        id, tenant_id: tenantId, name, specialty: specialty || '', clinic_id: clinicId
    });
    res.status(201).json({ id, success: true });
});

router.delete('/admin/doctors/:id', authenticateToken, async (req: any, res) => {
    const tenantId = req.user.tenant_id;
    if (!tenantId) return res.status(403).json({ error: 'Unauthorized clinic access' });
    
    await supabase.from('slots').delete().eq('doctor_id', req.params.id);
    await supabase.from('doctors').delete().eq('id', req.params.id).eq('tenant_id', tenantId);
    res.json({ success: true });
});

// Slots
router.get('/admin/slots', authenticateToken, async (req: any, res) => {
    const tenantId = req.user.tenant_id;
    if (!tenantId) return res.status(403).json({ error: 'Unauthorized clinic access' });
    
    const { data: doctors } = await supabase.from('doctors').select('id').eq('tenant_id', tenantId);
    if (!doctors || doctors.length === 0) return res.json([]);
    
    const doctorIds = doctors.map(d => d.id);
    const { data: slots } = await supabase.from('slots').select('*').in('doctor_id', doctorIds);
    res.json(slots || []);
});

router.post('/admin/slots', authenticateToken, async (req: any, res) => {
    const { doctor_id, slot_time, date } = req.body;
    if (!doctor_id || !slot_time) return res.status(400).json({ error: 'doctor_id and slot_time are required' });
    await supabase.from('slots').insert({ doctor_id, slot_time, date });
    res.json({ success: true });
});

router.delete('/admin/slots', authenticateToken, async (req: any, res) => {
    const { doctor_id, slot_time, date } = req.body;
    let query = supabase.from('slots').delete().eq('doctor_id', doctor_id).eq('slot_time', slot_time);
    if (date) {
        query = query.eq('date', date);
    } else {
        query = query.is('date', null);
    }
    await query;
    res.json({ success: true });
});

// Root Admin
router.get('/admin/tenants', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'root') return res.status(403).json({ error: 'Root access required' });
    const { data: tenants } = await supabase.from('tenants').select('*');
    res.json(tenants || []);
});

router.patch('/admin/tenants/:id', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'root') return res.status(403).json({ error: 'Root access required' });
    
    const { status, plan } = req.body;
    const updates: any = {};
    if (status) updates.status = status;
    if (plan) updates.plan = plan;
    
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No updates provided' });
    
    await supabase.from('tenants').update(updates).eq('id', req.params.id);
    res.json({ success: true });
});

export default router;
