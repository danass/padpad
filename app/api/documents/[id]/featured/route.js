import { sql } from '@vercel/postgres'
import { getUserId } from '@/lib/auth/getSession'
import { isAdmin } from '@/lib/auth/isAdmin'

// Toggle featured status for a document (admin only)
export async function POST(request, { params }) {
    try {
        const userId = await getUserId()
        if (!userId) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const admin = await isAdmin()
        if (!admin) {
            return Response.json({ error: 'Admin only' }, { status: 403 })
        }

        const { id } = await params
        const { featured } = await request.json()

        // Update document featured status
        const result = await sql.query(
            `UPDATE documents SET is_featured = $1, featured_at = $2 WHERE id = $3 RETURNING *`,
            [featured === true, featured === true ? new Date() : null, id]
        )

        if (result.rows.length === 0) {
            return Response.json({ error: 'Document not found' }, { status: 404 })
        }

        return Response.json({
            document: result.rows[0],
            message: featured ? 'Document featured' : 'Document unfeatured'
        })
    } catch (error) {
        console.error('Error toggling featured:', error)
        return Response.json({ error: error.message }, { status: 500 })
    }
}
