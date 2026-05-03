-- Tenants (Clinic Owners/Entities)
CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    status TEXT DEFAULT 'pending', -- pending, active, suspended
    plan TEXT DEFAULT 'basic',
    subscription_end TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Users (Admins, Doctors, Staff)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password_hash TEXT, -- Will use OTP instead or for specific roles
    role TEXT NOT NULL, -- root, admin, doctor
    tenant_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Clinics table
CREATE TABLE IF NOT EXISTS clinics (
    id TEXT PRIMARY KEY,
    tenant_id TEXT,
    name TEXT NOT NULL,
    address TEXT,
    maps_link TEXT,
    logo_url TEXT,
    gst_number TEXT,
    distance TEXT,
    rating REAL,
    lat REAL,
    lng REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
    id TEXT PRIMARY KEY,
    tenant_id TEXT,
    name TEXT NOT NULL,
    specialty TEXT,
    clinic_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (clinic_id) REFERENCES clinics(id)
);

-- Available Slots table
CREATE TABLE IF NOT EXISTS slots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doctor_id TEXT,
    slot_time TEXT,
    date DATE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);

-- Queue table
CREATE TABLE IF NOT EXISTS queue (
    id TEXT PRIMARY KEY,
    tenant_id TEXT,
    patientName TEXT NOT NULL,
    phone TEXT,
    status TEXT, -- 'booked', 'waiting', 'in-consultation', 'completed'
    doctor TEXT,
    date DATE DEFAULT CURRENT_DATE,
    time TEXT,
    waitTime TEXT,
    token TEXT,
    prescription TEXT,
    medicines TEXT, -- JSON string
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    tenant_id TEXT,
    patientName TEXT NOT NULL,
    phone TEXT,
    date TEXT,
    time TEXT,
    doctor TEXT,
    status TEXT,
    notes TEXT,
    tags TEXT, -- JSON string
    prescription TEXT,
    medicines TEXT, -- JSON string
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    tenant_id TEXT,
    name TEXT NOT NULL,
    phone TEXT,
    last_visit TEXT,
    totalVisits INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);
