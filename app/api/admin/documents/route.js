import { sql } from '@vercel/postgres'
import { isAdmin } from '@/lib/auth/isAdmin'

export async function GET(request) {
  try {
    // Check if user is admin
    const admin = await isAdmin()
    if (!admin) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    // Get all documents with user info
    const result = await sql.query(
      `SELECT 
        d.id,
        d.title,
        d.user_id as user_email,
        d.created_at,
        d.updated_at,
        d.is_public,
        COUNT(DISTINCT ds.id) as snapshot_count,
        COUNT(DISTINCT de.id) as event_count
       FROM documents d
       LEFT JOIN document_snapshots ds ON ds.document_id = d.id
       LEFT JOIN document_events de ON de.document_id = d.id
       GROUP BY d.id, d.title, d.user_id, d.created_at, d.updated_at, d.is_public
       ORDER BY d.updated_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    )

    // Get total count
    const countResult = await sql.query(
      'SELECT COUNT(*) as count FROM documents'
    )
    const total = parseInt(countResult.rows[0].count)

    return Response.json({
      documents: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching admin documents:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}




