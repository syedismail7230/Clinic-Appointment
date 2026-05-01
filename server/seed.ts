import db from './db';

const MOCK_CLINICS = [
  {
    id: "c1",
    name: "Downtown Medical Center",
    address: "123 Main St, Metro City",
    distance: "1.2 miles",
    rating: 4.8,
    lat: 12.9716,
    lng: 77.5946,
    doctors: [
      { id: "d1", name: "Dr. Sarah Wilson", specialty: "Cardiologist", availableSlots: ["09:00 AM", "09:30 AM", "10:00 AM", "11:00 AM", "02:00 PM"] },
      { id: "d2", name: "Dr. James Miller", specialty: "Dermatologist", availableSlots: ["10:30 AM", "11:30 AM", "01:00 PM", "03:30 PM", "04:00 PM"] },
    ]
  },
  {
    id: "c2",
    name: "Northside Health Clinic",
    address: "456 Oak Dr, North View",
    distance: "2.5 miles",
    rating: 4.5,
    lat: 13.0358,
    lng: 77.5970,
    doctors: [
      { id: "d3", name: "Dr. Emily Chen", specialty: "Pediatrician", availableSlots: ["09:15 AM", "10:15 AM", "11:45 AM", "02:30 PM"] },
    ]
  }
];

const MOCK_QUEUE = [
  { id: "q1", patientName: "John Doe", phone: "+1 555-0123", status: "completed", doctor: "Dr. Sarah Wilson", time: "09:00 AM", waitTime: "0 mins", token: "A-42" },
  { id: "q2", patientName: "Jane Smith", phone: "+1 555-0198", status: "waiting", doctor: "Dr. James Miller", time: "10:30 AM", waitTime: "15 mins", token: "A-43" },
];

const MOCK_APPOINTMENTS = [
  {
    id: "a1",
    patientName: "John Doe",
    phone: "+1 555-0123",
    date: "2023-11-25",
    time: "09:00 AM",
    doctor: "Dr. Sarah Wilson",
    status: "completed",
    notes: "Regular checkup. Patient is doing well.",
    tags: ["Routine", "Checkup"]
  },
  {
    id: "a2",
    patientName: "Jane Smith",
    phone: "+1 555-0198",
    date: "2023-11-26",
    time: "10:30 AM",
    doctor: "Dr. James Miller",
    status: "booked",
    notes: "Skin rash concern.",
    tags: ["Dermatology"]
  }
];

console.log('Seeding database...');

const DEFAULT_TENANT_ID = 'default-tenant';

// Clear existing data (optional but good for seeding)
db.prepare('DELETE FROM slots').run();
db.prepare('DELETE FROM doctors').run();
db.prepare('DELETE FROM clinics').run();
db.prepare('DELETE FROM queue').run();
db.prepare('DELETE FROM appointments').run();
db.prepare('DELETE FROM patients').run();
db.prepare('DELETE FROM users').run();
db.prepare('DELETE FROM tenants').run();

// Seed Default Tenant
db.prepare('INSERT INTO tenants (id, name, email, phone, status) VALUES (?, ?, ?, ?, ?)')
    .run(DEFAULT_TENANT_ID, 'Default Clinic Group', 'admin@default.com', '1234567890', 'active');

// Seed Root Admin User
db.prepare('INSERT INTO users (id, email, phone, role) VALUES (?, ?, ?, ?)')
    .run('root-1', 'admin@platform.com', '9999999999', 'root');

// Seed Default Clinic Admin User
db.prepare('INSERT INTO users (id, email, phone, role, tenant_id) VALUES (?, ?, ?, ?, ?)')
    .run('admin-1', 'admin@default.com', '1234567890', 'admin', DEFAULT_TENANT_ID);

// Seed Clinics and Doctors
MOCK_CLINICS.forEach(clinic => {
    db.prepare('INSERT OR REPLACE INTO clinics (id, tenant_id, name, address, distance, rating, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .run(clinic.id, DEFAULT_TENANT_ID, clinic.name, clinic.address, clinic.distance, clinic.rating, clinic.lat, clinic.lng);
    
    clinic.doctors.forEach(doctor => {
        db.prepare('INSERT OR REPLACE INTO doctors (id, tenant_id, name, specialty, clinic_id) VALUES (?, ?, ?, ?, ?)')
            .run(doctor.id, DEFAULT_TENANT_ID, doctor.name, doctor.specialty, clinic.id);
        
        doctor.availableSlots.forEach(slot => {
            db.prepare('INSERT INTO slots (doctor_id, slot_time) VALUES (?, ?)')
                .run(doctor.id, slot);
        });
    });
});

// Seed Queue
MOCK_QUEUE.forEach(item => {
    db.prepare(`
        INSERT OR REPLACE INTO queue (id, tenant_id, patientName, phone, status, doctor, time, waitTime, token, medicines)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(item.id, DEFAULT_TENANT_ID, item.patientName, item.phone, item.status, item.doctor, item.time, item.waitTime, item.token, JSON.stringify([]));
});

// Seed Appointments
MOCK_APPOINTMENTS.forEach(item => {
    db.prepare(`
        INSERT OR REPLACE INTO appointments (id, tenant_id, patientName, phone, date, time, doctor, status, notes, tags)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(item.id, DEFAULT_TENANT_ID, item.patientName, item.phone, item.date, item.time, item.doctor, item.status, item.notes, JSON.stringify(item.tags));
});

// Seed Patients (derived from appointments)
const patientsMap = new Map();
MOCK_APPOINTMENTS.forEach(apt => {
    if (!patientsMap.has(apt.phone)) {
        patientsMap.set(apt.phone, {
            id: `p${patientsMap.size + 1}`,
            name: apt.patientName,
            phone: apt.phone,
            lastVisit: apt.date,
            totalVisits: 1
        });
    }
});

patientsMap.forEach(patient => {
    db.prepare('INSERT OR REPLACE INTO patients (id, tenant_id, name, phone, lastVisit, totalVisits) VALUES (?, ?, ?, ?, ?, ?)')
        .run(patient.id, DEFAULT_TENANT_ID, patient.name, patient.phone, patient.lastVisit, patient.totalVisits);
});

console.log('Database seeded successfully!');
