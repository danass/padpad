import crypto from 'crypto'

const SECRET = process.env.SUSPENSION_SECRET || process.env.NEXTAUTH_SECRET || 'default-secret-key'

/**
 * Generate a secure download token for a suspended user
 * @param {string} email - User's email
 * @returns {string} - URL-safe token (base64payload.base64signature)
 */
export function generateDownloadToken(email) {
    const payload = JSON.stringify({
        email,
        exp: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days expiry
    })

    // Base64url encode the payload first (this removes any dots from the equation)
    const payloadB64 = Buffer.from(payload).toString('base64url')

    // Sign the base64 encoded payload
    const hmac = crypto.createHmac('sha256', SECRET)
    hmac.update(payloadB64)
    const signature = hmac.digest('base64url')

    // Combine with dot separator (both parts are base64url safe - no dots possible)
    return `${payloadB64}.${signature}`
}

/**
 * Verify and decode a download token
 * @param {string} token - The token to verify
 * @returns {{ valid: boolean, email?: string, error?: string }}
 */
export function verifyDownloadToken(token) {
    try {
        // Split by dot separator
        const parts = token.split('.')
        if (parts.length !== 2) {
            return { valid: false, error: 'Invalid token format' }
        }

        const [payloadB64, signature] = parts

        // Verify signature
        const hmac = crypto.createHmac('sha256', SECRET)
        hmac.update(payloadB64)
        const expectedSignature = hmac.digest('base64url')

        if (signature !== expectedSignature) {
            return { valid: false, error: 'Invalid signature' }
        }

        // Decode payload from base64url
        const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'))

        // Check expiry
        if (payload.exp && payload.exp < Date.now()) {
            return { valid: false, error: 'Token expired' }
        }

        return { valid: true, email: payload.email }
    } catch (error) {
        console.error('Token verification error:', error)
        return { valid: false, error: 'Token decode error' }
    }
}
