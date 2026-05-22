/**
 * WhatsApp Business Cloud API Service
 * Uses Meta's Graph API directly (no BSP/platform fee).
 *
 * Setup required:
 *   WHATSAPP_ACCESS_TOKEN     — Permanent system-user token from Meta Business Manager
 *   WHATSAPP_PHONE_NUMBER_ID  — Phone Number ID from WhatsApp > Getting Started
 *
 * All template names below must match exactly what is approved in WhatsApp Manager.
 */

import dotenv from 'dotenv';
dotenv.config();

const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const GRAPH_API_VERSION = 'v21.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

// ─────────────────────────────────────────────────────────────────────────────
// Internal helper — send any template message
// ─────────────────────────────────────────────────────────────────────────────

interface TemplateComponent {
    type: 'body' | 'button';
    sub_type?: 'url' | 'quick_reply' | 'otp';
    index?: string;
    parameters: Array<{ type: 'text'; text: string }>;
}

async function sendTemplate(
    to: string,
    templateName: string,
    languageCode: string,
    components: TemplateComponent[]
): Promise<void> {
    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
        throw new Error('WhatsApp credentials not configured');
    }

    // Ensure international format without + prefix
    const formattedTo = to.replace(/^\+/, '');

    const payload = {
        messaging_product: 'whatsapp',
        to: formattedTo,
        type: 'template',
        template: {
            name: templateName,
            language: { code: languageCode },
            components,
        },
    };

    const url = `${GRAPH_API_BASE}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json() as any;

    if (!response.ok) {
        const errMsg = data?.error?.message || JSON.stringify(data);
        throw new Error(`WhatsApp API error: ${errMsg}`);
    }

    console.log(`[WhatsApp] Message sent to ${to} via template "${templateName}" (msg_id: ${data?.messages?.[0]?.id})`);
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Send OTP verification code via WhatsApp.
 * Template: quickcare_otp (Authentication category)
 * Body: "Your QuickCare verification code is *{{1}}*. Valid for 5 minutes."
 */
export async function sendOTPWhatsApp(phone: string, code: string): Promise<void> {
    await sendTemplate(
        phone,
        'quickcare_otp',
        'en',
        [
            {
                type: 'body',
                parameters: [{ type: 'text', text: code }],
            },
        ]
    );
}

/**
 * Send booking confirmation to a patient.
 * Template: quickcare_booking_confirmed (Utility category)
 * Body: "Hi {{1}}! Your appointment at *QuickCare* has been confirmed.
 *        👨‍⚕️ Doctor: {{2}}  📅 Date: {{3}}  ⏰ Time: {{4}}  🎫 Token: {{5}}"
 */
export async function sendBookingConfirmation(
    phone: string,
    patientName: string,
    doctorName: string,
    date: string,
    time: string,
    token: string
): Promise<void> {
    await sendTemplate(
        phone,
        'quickcare_booking_confirmed',
        'en',
        [
            {
                type: 'body',
                parameters: [
                    { type: 'text', text: patientName },
                    { type: 'text', text: doctorName || 'the doctor' },
                    { type: 'text', text: date },
                    { type: 'text', text: time || 'your scheduled time' },
                    { type: 'text', text: token },
                ],
            },
        ]
    );
}

/**
 * Send queue status update to a patient.
 * Template: quickcare_queue_update (Utility category)
 * Body: "Hi {{1}}! Your queue status at QuickCare has been updated.
 *        🎫 Token: {{2}}  📊 Status: {{3}}"
 */
export async function sendQueueUpdate(
    phone: string,
    patientName: string,
    token: string,
    status: string
): Promise<void> {
    const statusLabel: Record<string, string> = {
        booked: 'Booked ✅',
        'in-progress': 'You are being seen now 🩺',
        completed: 'Visit completed 🎉',
        cancelled: 'Cancelled ❌',
    };

    await sendTemplate(
        phone,
        'quickcare_queue_update',
        'en',
        [
            {
                type: 'body',
                parameters: [
                    { type: 'text', text: patientName },
                    { type: 'text', text: token },
                    { type: 'text', text: statusLabel[status] || status },
                ],
            },
        ]
    );
}

/**
 * Check whether WhatsApp credentials are present.
 * Used to decide between live and mock mode.
 */
export function isWhatsAppConfigured(): boolean {
    return !!(WHATSAPP_ACCESS_TOKEN && WHATSAPP_PHONE_NUMBER_ID);
}
