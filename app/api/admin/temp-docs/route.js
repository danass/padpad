import { sql } from '@vercel/postgres'
import { auth } from '@/auth'

export async function GET(request) {
    try {
        const session = await auth()

        // Check if user is admin
        if (!session?.user?.email) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userResult = await sql.query(
            'SELECT isAdmin FROM users WHERE email = $1',
            [session.user.email]
        )

        if (userResult.rows.length === 0 || !userResult.rows[0].isadmin) {
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
