import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendOTPWhatsApp, isWhatsAppConfigured } from './whatsapp.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'quickcare-dev-secret-change-in-production';

// In-memory OTP store. Key = phone, value = { code, expires }.
// In production, replace with Redis for multi-instance deployments.
const OTPS = new Map<string, { code: string; expires: number }>();
const OTP_RATE_LIMIT = new Map<string, { count: number, resetAt: number }>();

const MAX_OTP_PER_HOUR = process.env.NODE_ENV === 'production' ? 5 : 20;

export async function generateOTP(phone: string): Promise<void> {
    // Rate limiting: max 5 OTPs per phone per hour
    const now = Date.now();
    const rateEntry = OTP_RATE_LIMIT.get(phone);

    if (rateEntry) {
        if (now < rateEntry.resetAt) {
            if (rateEntry.count >= MAX_OTP_PER_HOUR) {
                throw new Error('Too many OTP requests. Please try again later.');
            }
            rateEntry.count++;
        } else {
            // Reset window
            OTP_RATE_LIMIT.set(phone, { count: 1, resetAt: now + 60 * 60 * 1000 });
        }
    } else {
        OTP_RATE_LIMIT.set(phone, { count: 1, resetAt: now + 60 * 60 * 1000 });
    }

    // Generate a cryptographically random 6-digit OTP
    const code = (crypto.randomInt(100000, 999999)).toString();
    OTPS.set(phone, { code, expires: now + 5 * 60 * 1000 }); // 5-minute window

    if (!isWhatsAppConfigured()) {
        // Mock fallback: log to console when credentials are not set
        console.warn('[OTP] WhatsApp not configured — using mock mode');
        console.log(`[MOCK OTP] Phone: ${phone}  Code: ${code}`);
        return;
    }

    try {
        await sendOTPWhatsApp(phone, code);
        console.log(`[OTP] Sent to ${phone} via WhatsApp`);
    } catch (err) {
        // Remove the stored OTP so the user can retry cleanly
        OTPS.delete(phone);
        throw err;
    }
}

export async function verifyOTP(phone: string, code: string): Promise<boolean> {
    const entry = OTPS.get(phone);
    if (!entry) return false;

    if (Date.now() > entry.expires) {
        OTPS.delete(phone);
        return false;
    }

    // Constant-time comparison to prevent timing attacks
    const expected = Buffer.from(entry.code);
    const provided = Buffer.from(code);

    if (expected.length !== provided.length) return false;

    const match = crypto.timingSafeEqual(expected, provided);
    if (match) {
        OTPS.delete(phone); // single-use
        return true;
    }

    return false;
}

export function generateToken(user: any) {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role, tenant_id: user.tenant_id, phone: user.phone },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
}

export function authenticateToken(req: any, res: any, next: any) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Authentication required' });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = user;
        next();
    });
}

export function optionalAuthenticateToken(req: any, res: any, next: any) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return next();

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (!err) req.user = user;
        next();
    });
}

export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}
