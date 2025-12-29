import { sql } from '@vercel/postgres'
import { auth } from '@/auth'
import { isAdmin } from '@/lib/auth/isAdmin'

export async function GET(request) {
    try {
        const session = await auth()

        // Check if user is admin
        const admin = await isAdmin()
        if (!admin) {
            return Response.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Fetch all disposable documents
        const result = await sql.query(`
            SELECT 
                id,
                title,
                created_at,
                updated_at,
                expires_at,
                is_disposable
            FROM documents
            WHERE is_disposable = true
            ORDER BY created_at DESC
        `)

        return Response.json({
            documents: result.rows
        })
    } catch (error) {
        console.error('Error fetching temp documents:', error)
        return Response.json({ error: error.message }, { status: 500 })
    }
}
