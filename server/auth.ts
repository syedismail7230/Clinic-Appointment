import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'quickcare-dev-secret-change-in-production';
const MESSAGE_CENTRAL_CUSTOMER_ID = process.env.MESSAGE_CENTRAL_CUSTOMER_ID;
const MESSAGE_CENTRAL_AUTH_TOKEN = process.env.MESSAGE_CENTRAL_AUTH_TOKEN;

// Temporary store for verification IDs. In production, this might be Redis.
const OTPS = new Map<string, { verificationId: string, expires: number }>();
const OTP_RATE_LIMIT = new Map<string, { count: number, resetAt: number }>();

const MAX_OTP_PER_HOUR = 5;

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

    if (!MESSAGE_CENTRAL_CUSTOMER_ID || !MESSAGE_CENTRAL_AUTH_TOKEN) {
        console.warn('Missing Message Central keys, falling back to mock OTP');
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        OTPS.set(phone, { verificationId: code, expires: Date.now() + 5 * 60 * 1000 });
        console.log(`[MOCK OTP] Sent to ${phone}: ${code}`);
        return;
    }

    // Call Message Central API
    const url = `https://cpaas.messagecentral.com/verification/v3/send?countryCode=91&customerId=${MESSAGE_CENTRAL_CUSTOMER_ID}&flowType=SMS&mobileNumber=${phone}`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'authToken': MESSAGE_CENTRAL_AUTH_TOKEN
        }
    });

    const result = await response.json();
    
    if (result.responseCode === 200 && result.data?.verificationId) {
        OTPS.set(phone, {
            verificationId: result.data.verificationId,
            expires: Date.now() + 5 * 60 * 1000 // 5 minutes local expiration
        });
        console.log(`[OTP] Dispatched to ${phone} via Message Central (ID: ${result.data.verificationId})`);
    } else {
        console.error('[OTP] Message Central Error:', result);
        throw new Error(result.message || 'Failed to send OTP via provider');
    }
}

export async function verifyOTP(phone: string, code: string): Promise<boolean> {
    const entry = OTPS.get(phone);
    if (!entry) return false;
    
    if (Date.now() > entry.expires) {
        OTPS.delete(phone);
        return false;
    }

    if (!MESSAGE_CENTRAL_CUSTOMER_ID || !MESSAGE_CENTRAL_AUTH_TOKEN) {
        // Mock fallback
        if (entry.verificationId === code) {
            OTPS.delete(phone);
            return true;
        }
        return false;
    }

    const verificationId = entry.verificationId;
    const url = `https://cpaas.messagecentral.com/verification/v3/validateOtp?countryCode=91&mobileNumber=${phone}&verificationId=${verificationId}&customerId=${MESSAGE_CENTRAL_CUSTOMER_ID}&code=${code}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'authToken': MESSAGE_CENTRAL_AUTH_TOKEN
            }
        });

        const result = await response.json();

        if (result.responseCode === 200 && result.data?.verificationStatus === 'VERIFICATION_COMPLETED') {
            OTPS.delete(phone);
            return true;
        }
    } catch (error) {
        console.error('[OTP] Validation error:', error);
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
