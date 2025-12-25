// Generate a random archive ID (8 chars, alphanumeric)
// This is NOT based on email or any PII for privacy
export function generateArchiveId() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}
