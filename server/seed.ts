import { supabase } from './db.js';

async function seed() {
    console.log('Seeding database to Supabase...');

    // 1. Tenants
    const { data: tenant, error: tenantErr } = await supabase.from('tenants').insert({
        id: 'default-tenant',
        name: 'City Care Clinic',
        email: 'admin@citycare.com',
        phone: '1234567890',
        status: 'active',
        plan: 'premium'
    }).select().single();

    if (tenantErr && tenantErr.code !== '23505') console.error('Tenant insert error:', tenantErr);

    // 2. Users (Platform Admin & Clinic Admin)
    const { error: usersErr } = await supabase.from('users').upsert([
        {
            id: 'root-1',
            email: 'admin@quickcare.com',
            phone: '9999999999',
            role: 'root',
            tenant_id: null
        },
        {
            id: 'admin-1',
            email: 'admin@citycare.com',
            phone: '1234567890',
            role: 'admin',
            tenant_id: 'default-tenant'
        }
    ]);

    if (usersErr) console.error('Users insert error:', usersErr);

    // 3. Clinics
    const { error: clinicErr } = await supabase.from('clinics').upsert([
        {
            id: 'clinic-1',
            tenant_id: 'default-tenant',
            name: 'City Care Clinic - Main Branch',
            address: '123 Health Avenue, Medical District',
            distance: '1.2 km',
            rating: 4.8,
            lat: 12.9716,
            lng: 77.5946
        }
    ]);
    
    if (clinicErr) console.error('Clinic insert error:', clinicErr);

    // 4. Doctors
    const { error: docsErr } = await supabase.from('doctors').upsert([
        {
            id: 'doc-1',
            tenant_id: 'default-tenant',
            name: 'Dr. Sarah Wilson',
            specialty: 'General Physician',
            clinic_id: 'clinic-1'
        },
        {
            id: 'doc-2',
            tenant_id: 'default-tenant',
            name: 'Dr. James Chen',
            specialty: 'Pediatrician',
            clinic_id: 'clinic-1'
        }
    ]);
    
    if (docsErr) console.error('Doctors insert error:', docsErr);

    console.log('Database seeded successfully!');
    console.log('---');
    console.log('Seed credentials:');
    console.log('  Root Admin:   phone=9999999999');
    console.log('  Clinic Admin: phone=1234567890');
    console.log('  OTP codes are logged to server console when you call /api/auth/otp/send');
}

seed().catch(console.error);
