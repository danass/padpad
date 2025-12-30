import { sql } from '@vercel/postgres'
import { isAdmin } from '@/lib/auth/isAdmin'

export async function GET() {
  try {
    // Check if user is admin
    const admin = await isAdmin()
    if (!admin) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get all unique users with their document counts and roles
    const result = await sql.query(
      `SELECT 
         u.id as email,
         u.role,
         COUNT(DISTINCT d.id) as document_count,
         MAX(d.updated_at) as last_activity,
         MIN(d.created_at) as first_created
        FROM users u
        LEFT JOIN documents d ON u.id = d.user_id
        GROUP BY u.id, u.role
        ORDER BY document_count DESC`
    )

    const users = result.rows.map(user => ({
      ...user,
      isAdmin: user.role === 'admin'
    }))

    return Response.json({ users })
  } catch (error) {
    console.error('Error fetching admin users:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}




