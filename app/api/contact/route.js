import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request) {
    try {
        const { name, email, message } = await request.json()

        // Validate input
        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Name, email, and message are required' },
                { status: 400 }
            )
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            )
        }

        // Check if SMTP is configured
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.error('SMTP credentials not configured. SMTP_USER or SMTP_PASS missing.')
            return NextResponse.json(
                { error: 'Email service is not configured. Please contact support directly at daniel@textpad.cloud' },
                { status: 503 }
            )
        }

        // Create transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        })

        // Verify transporter configuration
        try {
            await transporter.verify()
        } catch (verifyError) {
            console.error('SMTP verification failed:', verifyError)
            return NextResponse.json(
                { error: 'Email service configuration error. Please contact support directly at daniel@textpad.cloud' },
                { status: 503 }
            )
        }

        // Send email
        await transporter.sendMail({
            from: `"TextPad Contact" <${process.env.SMTP_USER}>`,
            to: process.env.CONTACT_EMAIL || 'daniel@textpad.cloud',
            replyTo: email,
            subject: `[TextPad Contact] Message from ${name}`,
            text: `
Name: ${name}
Email: ${email}

Message:
${message}

---
Sent from TextPad Contact Form
            `,
            html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #06b6d4, #3b82f6); padding: 20px; border-radius: 12px 12px 0 0; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { background: #f9fafb; padding: 24px; border-radius: 0 0 12px 12px; }
        .field { margin-bottom: 16px; }
        .label { font-weight: 600; color: #374151; font-size: 14px; }
        .value { color: #111827; margin-top: 4px; }
        .message-box { background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; margin-top: 16px; }
        .footer { text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📬 New Contact Message</h1>
        </div>
        <div class="content">
            <div class="field">
                <div class="label">From</div>
                <div class="value">${name}</div>
            </div>
            <div class="field">
                <div class="label">Email</div>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
            </div>
            <div class="message-box">
                <div class="label">Message</div>
                <div class="value" style="white-space: pre-wrap;">${message.replace(/\n/g, '<br>')}</div>
            </div>
        </div>
        <div class="footer">
            Sent from TextPad Contact Form
        </div>
    </div>
</body>
</html>
            `,
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Contact form error:', error)
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            command: error.command
        })
        return NextResponse.json(
            { error: 'Failed to send message. Please try again later or contact support directly at daniel@textpad.cloud' },
            { status: 500 }
        )
    }
}
