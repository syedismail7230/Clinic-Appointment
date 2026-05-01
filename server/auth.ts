import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'antigravity-secret-key';
const OTPS = new Map<string, { code: string, expires: number }>();

export function generateOTP(phone: string): string {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    OTPS.set(phone, {
        code,
        expires: Date.now() + 5 * 60 * 1000 // 5 minutes
    });
    console.log(`[OTP] Sent to ${phone}: ${code}`); // Mocking SMS delivery
    return code;
}

export function verifyOTP(phone: string, code: string): boolean {
    const entry = OTPS.get(phone);
    if (!entry) return false;
    if (Date.now() > entry.expires) {
        OTPS.delete(phone);
        return false;
    }
    if (entry.code === code) {
        OTPS.delete(phone);
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

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) return res.sendStatus(403);
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
