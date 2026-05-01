import { Router } from 'express';
import db from './db';
import { v4 as uuidv4 } from 'uuid';
import { generateOTP, verifyOTP, generateToken, authenticateToken, optionalAuthenticateToken } from './auth';
import { notifyQueueUpdate } from './socket';

const router = Router();
const DEFAULT_TENANT_ID = 'default-tenant';

// Auth Routes
router.post('/auth/otp/send', (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number required' });
    generateOTP(phone);
    res.json({ message: 'OTP sent' });
});

router.post('/auth/otp/verify', (req, res) => {
    const { phone, code } = req.body;
    if (verifyOTP(phone, code)) {
        // Find or create user
        let user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
        if (!user) {
            // Check if it's a patient or potential admin
            // For now, let's just return a role-less token or specific logic
            user = { id: uuidv4(), phone, role: 'patient', tenant_id: null };
        }
        const token = generateToken(user);
        res.json({ token, user });
    } else {
        res.status(401).json({ error: 'Invalid OTP' });
    }
});

// Onboarding
router.post('/onboard', (req, res) => {
    const { name, email, phone } = req.body;
    const tenantId = uuidv4();
    const userId = uuidv4();
    
    try {
        db.prepare('INSERT INTO tenants (id, name, email, phone) VALUES (?, ?, ?, ?)').run(tenantId, name, email, phone);
        db.prepare('INSERT INTO users (id, email, phone, role, tenant_id) VALUES (?, ?, ?, ?, ?)').run(userId, email, phone, 'admin', tenantId);
        
        // Also create a default clinic for this tenant
        const clinicId = uuidv4();
        db.prepare('INSERT INTO clinics (id, tenant_id, name, address) VALUES (?, ?, ?, ?)').run(clinicId, tenantId, name, 'Address pending');
        
        res.status(201).json({ success: true, tenantId });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Clinics (Public/Tenant Specific)
router.get('/clinics', (req, res) => {
    const tenantId = req.query.tenantId || DEFAULT_TENANT_ID;
    const clinics = db.prepare('SELECT * FROM clinics WHERE tenant_id = ? OR tenant_id IS NULL').all(tenantId) as any[];
    const doctors = db.prepare('SELECT * FROM doctors WHERE tenant_id = ? OR tenant_id IS NULL').all(tenantId) as any[];
    
    const result = clinics.map(clinic => ({
        ...clinic,
        doctors: doctors.filter(doc => doc.clinic_id === clinic.id)
    }));
    
    res.json(result);
});

router.get('/clinics/:id', (req, res) => {
    let clinic = db.prepare('SELECT * FROM clinics WHERE id = ?').get(req.params.id) as any;
    
    // Fallback: If scanned via a Tenant QR code, get the first clinic belonging to that tenant
    if (!clinic) {
        clinic = db.prepare('SELECT * FROM clinics WHERE tenant_id = ?').get(req.params.id) as any;
    }
    
    if (!clinic) return res.status(404).json({ error: 'Clinic not found' });
    
    const doctors = db.prepare('SELECT * FROM doctors WHERE clinic_id = ?').all(clinic.id) as any[];
    
    // Attach availableSlots to each doctor (fetch recurring or today's specific slots)
    const today = new Date().toISOString().split('T')[0];
    const resultDoctors = doctors.map(doc => {
        const slots = db.prepare('SELECT slot_time FROM slots WHERE doctor_id = ? AND (date IS NULL OR date = ?)').all(doc.id, today) as any[];
        return { ...doc, availableSlots: slots.map(s => s.slot_time).sort() };
    });
    
    res.json({ ...clinic, doctors: resultDoctors });
});

// Queue (Public/Patient + Admin)
router.get('/queue', optionalAuthenticateToken, (req: any, res: any) => {
    let queue: any[] = [];
    
    // 1. Clinic Admin fetching their own queue
    if (req.user?.role === 'admin' && req.user?.tenant_id) {
        queue = db.prepare('SELECT * FROM queue WHERE tenant_id = ?').all(req.user.tenant_id) as any[];
    }
    // 2. Logged-in Patient fetching their own records across all clinics
    else if (req.user?.role === 'patient' && req.user?.phone) {
        queue = db.prepare('SELECT * FROM queue WHERE phone = ?').all(req.user.phone) as any[];
    }
    // 3. Anonymous Patient fetching a specific clinic's queue (via QR code)
    else if (req.query.tenantId) {
        queue = db.prepare('SELECT * FROM queue WHERE tenant_id = ?').all(req.query.tenantId) as any[];
    }
    else {
        return res.status(400).json({ error: 'tenantId is required to query the queue' });
    }
    // Parse medicines JSON string
    const result = queue.map(item => ({
        ...item,
        medicines: item.medicines ? JSON.parse(item.medicines) : []
    }));
    res.json(result);
});

router.post('/queue', (req, res) => {
    const { id: clientProvidedId, patientName, phone, status, doctor, time, waitTime, tenantId } = req.body;
    if (!tenantId) return res.status(400).json({ error: 'tenantId is required to join a queue' });
    
    const id = clientProvidedId || uuidv4();
    const finalTenantId = tenantId;
    const todayStr = new Date().toISOString().split('T')[0];

    // Generate dynamic sequence token securely from database state
    const sequence = db.prepare(`
        SELECT COUNT(*) as count FROM queue 
        WHERE tenant_id = ? AND date = ?
    `).get(finalTenantId, todayStr) as any;
    const generatedToken = `A-${(sequence.count + 1).toString().padStart(2, '0')}`;
    
    db.prepare(`
        INSERT INTO queue (id, tenant_id, patientName, phone, status, doctor, date, time, waitTime, token, medicines)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, finalTenantId, patientName, phone, status || 'booked', doctor, todayStr, time, waitTime, generatedToken, JSON.stringify([]));
    
    // Upsert patient into clinic's patient registry
    const existingPatient = db.prepare('SELECT * FROM patients WHERE tenant_id = ? AND phone = ?').get(finalTenantId, phone);
    if (!existingPatient) {
        db.prepare('INSERT INTO patients (id, tenant_id, name, phone, last_visit) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)').run(uuidv4(), finalTenantId, patientName, phone);
    } else {
        db.prepare('UPDATE patients SET last_visit = CURRENT_TIMESTAMP WHERE tenant_id = ? AND phone = ?').run(finalTenantId, phone);
    }

    notifyQueueUpdate(finalTenantId);
    res.status(201).json({ id, ...req.body });
});

router.patch('/queue/:id', authenticateToken, (req: any, res) => {
    const { status, prescription, medicines } = req.body;
    const updates: string[] = [];
    const params: any[] = [];
    
    if (status) {
        updates.push('status = ?');
        params.push(status);
    }
    if (prescription !== undefined) {
        updates.push('prescription = ?');
        params.push(prescription);
    }
    if (medicines) {
        updates.push('medicines = ?');
        params.push(JSON.stringify(medicines));
    }
    
    if (updates.length === 0) return res.status(400).json({ error: 'No updates provided' });
    
    params.push(req.params.id);
    db.prepare(`UPDATE queue SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    
    // Find tenant_id to notify
    const item = db.prepare('SELECT tenant_id FROM queue WHERE id = ?').get(req.params.id) as any;
    if (item?.tenant_id) notifyQueueUpdate(item.tenant_id);

    res.json({ success: true });
});

// Appointments (Protected by Clinic Admin)
router.get('/appointments', authenticateToken, (req: any, res) => {
    const tenantId = req.user.tenant_id;
    if (!tenantId) return res.status(403).json({ error: 'Unauthorized clinic access' });
    
    const appointments = db.prepare('SELECT * FROM appointments WHERE tenant_id = ?').all(tenantId) as any[];
    const result = appointments.map(item => ({
        ...item,
        tags: item.tags ? JSON.parse(item.tags) : []
    }));
    res.json(result);
});

router.patch('/appointments/:id', authenticateToken, (req: any, res) => {
    const { status, notes } = req.body;
    const tenantId = req.user.tenant_id;
    const updates: string[] = [];
    const params: any[] = [];
    
    if (status) {
        updates.push('status = ?');
        params.push(status);
    }
    if (notes !== undefined) {
        updates.push('notes = ?');
        params.push(notes);
    }
    
    if (updates.length === 0) return res.status(400).json({ error: 'No updates provided' });
    
    params.push(req.params.id);
    let query = `UPDATE appointments SET ${updates.join(', ')} WHERE id = ?`;
    if (tenantId) {
        query += ' AND tenant_id = ?';
        params.push(tenantId);
    }
    
    db.prepare(query).run(...params);
    res.json({ success: true });
});

// Patients (Protected by Clinic Admin)
router.get('/patients', authenticateToken, (req: any, res) => {
    const tenantId = req.user.tenant_id;
    if (!tenantId) return res.status(403).json({ error: 'Unauthorized clinic access' });
    
    const patients = db.prepare('SELECT * FROM patients WHERE tenant_id = ?').all(tenantId) as any[];
    res.json(patients);
});

// Clinic Profile Settings (Protected by Clinic Admin)
router.get('/admin/clinic', authenticateToken, (req: any, res) => {
    const tenantId = req.user.tenant_id;
    if (!tenantId) return res.status(403).json({ error: 'Unauthorized clinic access' });
    const clinic = db.prepare('SELECT * FROM clinics WHERE tenant_id = ?').get(tenantId);
    res.json(clinic || {});
});

router.patch('/admin/clinic', authenticateToken, (req: any, res) => {
    const tenantId = req.user.tenant_id;
    if (!tenantId) return res.status(403).json({ error: 'Unauthorized clinic access' });
    
    const { name, address } = req.body;
    const updates: string[] = [];
    const params: any[] = [];
    
    if (name) { updates.push('name = ?'); params.push(name); }
    if (address) { updates.push('address = ?'); params.push(address); }
    
    if (updates.length === 0) return res.status(400).json({ error: 'No updates provided' });
    
    params.push(tenantId);
    db.prepare(`UPDATE clinics SET ${updates.join(', ')} WHERE tenant_id = ?`).run(...params);
    res.json({ success: true });
});

// Admin Slots Manager
router.get('/admin/slots', authenticateToken, (req: any, res) => {
    const tenantId = req.user.tenant_id;
    if (!tenantId) return res.status(403).json({ error: 'Unauthorized clinic access' });
    
    const doctors = db.prepare('SELECT id FROM doctors WHERE tenant_id = ?').all(tenantId) as any[];
    if (doctors.length === 0) return res.json([]);
    
    const doctorIds = doctors.map(d => `'${d.id}'`).join(',');
    const slots = db.prepare(`SELECT * FROM slots WHERE doctor_id IN (${doctorIds})`).all();
    res.json(slots);
});

router.post('/admin/slots', authenticateToken, (req: any, res) => {
    const { doctor_id, slot_time, date } = req.body;
    db.prepare('INSERT INTO slots (doctor_id, slot_time, date) VALUES (?, ?, ?)').run(doctor_id, slot_time, date);
    res.json({ success: true });
});

router.delete('/admin/slots', authenticateToken, (req: any, res) => {
    const { doctor_id, slot_time, date } = req.body;
    if (date) {
        db.prepare('DELETE FROM slots WHERE doctor_id = ? AND slot_time = ? AND date = ?').run(doctor_id, slot_time, date);
    } else {
        db.prepare('DELETE FROM slots WHERE doctor_id = ? AND slot_time = ? AND date IS NULL').run(doctor_id, slot_time);
    }
    res.json({ success: true });
});

// Root Admin - Tenant Management
router.get('/admin/tenants', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'root') return res.status(403).json({ error: 'Root access required' });
    const tenants = db.prepare('SELECT * FROM tenants').all() as any[];
    res.json(tenants);
});

router.post('/admin/tenants/:id/qr', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'root') return res.status(403).json({ error: 'Root access required' });
    const { id } = req.params;
    // In a real app, generate and save/return a QR code URL
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(process.env.APP_URL || 'http://localhost:3000')}/clinic/${id}`;
    res.json({ qrUrl });
});

export default router;
