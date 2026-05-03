-- Supabase PostgreSQL Schema for QuickCare

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tenants (Clinic Owners/Entities)
CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    status TEXT DEFAULT 'pending', -- pending, active, suspended
    plan TEXT DEFAULT 'basic',
    subscription_end TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Users (Admins, Doctors, Staff)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password_hash TEXT,
    role TEXT NOT NULL, -- root, admin, doctor
    tenant_id TEXT REFERENCES tenants(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Clinics table
CREATE TABLE IF NOT EXISTS clinics (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    tenant_id TEXT REFERENCES tenants(id),
    name TEXT NOT NULL,
    address TEXT,
    maps_link TEXT,
    logo_url TEXT,
    gst_number TEXT,
    distance TEXT,
    rating REAL,
    lat REAL,
    lng REAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    tenant_id TEXT REFERENCES tenants(id),
    name TEXT NOT NULL,
    specialty TEXT,
    clinic_id TEXT REFERENCES clinics(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Available Slots table
CREATE TABLE IF NOT EXISTS slots (
    id SERIAL PRIMARY KEY,
    doctor_id TEXT REFERENCES doctors(id) ON DELETE CASCADE,
    slot_time TEXT,
    date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Queue table
CREATE TABLE IF NOT EXISTS queue (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    tenant_id TEXT REFERENCES tenants(id),
    "patientName" TEXT NOT NULL,
    phone TEXT,
    status TEXT, -- 'booked', 'waiting', 'in-consultation', 'completed'
    doctor TEXT,
    date DATE DEFAULT CURRENT_DATE,
    time TEXT,
    "waitTime" TEXT,
    token TEXT,
    prescription TEXT,
    medicines JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    tenant_id TEXT REFERENCES tenants(id),
    "patientName" TEXT NOT NULL,
    phone TEXT,
    date TEXT,
    time TEXT,
    doctor TEXT,
    status TEXT,
    notes TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    prescription TEXT,
    medicines JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    tenant_id TEXT REFERENCES tenants(id),
    name TEXT NOT NULL,
    phone TEXT,
    last_visit TEXT,
    "totalVisits" INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
