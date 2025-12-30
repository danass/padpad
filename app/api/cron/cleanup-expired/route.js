import { sql } from '@vercel/postgres'
import { isAdmin } from '@/lib/auth/isAdmin'

export const dynamic = 'force-dynamic'

export async function GET(request) {
    // Basic security: Check for Vercel Cron Secret
    const authHeader = request.headers.get('authorization')
    const isCronSecret = process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`

    let isAuthorized = isCronSecret

    // In non-production or if triggered manually by an admin
    if (!isAuthorized) {
        isAuthorized = await isAdmin()
    }

    if (!isAuthorized) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        console.log('[CRON] Starting cleanup of expired disposable pads...')

        // Delete expired documents. 
        // Cascading deletes in the database schema will handle snapshots and events.
        const result = await sql.query(
            `DELETE FROM documents 
             WHERE is_disposable = true 
             AND expires_at < NOW() 
             RETURNING id`
        )

        const deletedCount = result.rowCount

        console.log(`[CRON] Successfully deleted ${deletedCount} expired documents.`)

        return Response.json({
            success: true,
            deletedCount,
            message: `Cleaned up ${deletedCount} expired documents.`
        })
    } catch (error) {
        console.error('[CRON] Cleanup failed:', error)
        return Response.json({ error: error.message }, { status: 500 })
    }
}
