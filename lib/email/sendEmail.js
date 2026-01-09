import nodemailer from 'nodemailer'

/**
 * Send an email using the configured SMTP credentials
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendEmail({ to, subject, text, html }) {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('SMTP credentials not configured')
      return { success: false, error: 'Email service not configured' }
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    await transporter.sendMail({
      from: `"TextPad" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    })

    return { success: true }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send account suspension notification email
 * @param {string} email - User's email
 * @param {string} reason - Suspension reason
 * @param {string} downloadToken - Secure token for downloading data
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendSuspensionEmail(email, reason, downloadToken) {
  const downloadUrl = `https://textpad.cloud/api/export/${downloadToken}`
  const deletionDate = new Date()
  deletionDate.setDate(deletionDate.getDate() + 30)
  const formattedDate = deletionDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return sendEmail({
    to: email,
    subject: '[TextPad] Your account has been suspended',
    text: `
Your TextPad account has been suspended.

Reason: ${reason || 'Policy violation'}

You have 30 days to download your data before it may be deleted.

Click to download your data: ${downloadUrl}

Deadline: ${formattedDate}

This link is private and will expire in 30 days.

---
TextPad Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ef4444, #dc2626); padding: 24px; border-radius: 12px 12px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 24px; border-radius: 0 0 12px 12px; }
    .warning-box { background: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 8px; margin: 16px 0; }
    .btn { display: inline-block; background: #111827; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px; }
    .footer { text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Account Suspended</h1>
    </div>
    <div class="content">
      <p>Your TextPad account has been suspended.</p>
      
      <div class="warning-box">
        <strong>Reason:</strong> ${reason || 'Policy violation'}
      </div>
      
      <p><strong>You have 30 days to download your data</strong> before it may be permanently deleted.</p>
      
      <p>Deadline: <strong>${formattedDate}</strong></p>
      
      <a href="${downloadUrl}" class="btn">Download My Data</a>
      
      <p style="margin-top: 24px; font-size: 12px; color: #9ca3af;">
        This download link is private and will expire in 30 days.
      </p>
    </div>
    <div class="footer">
      TextPad Team
    </div>
  </div>
</body>
</html>
    `.trim(),
  })
}

