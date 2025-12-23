import { sql } from '@vercel/postgres'
import { isAdmin } from '@/lib/auth/isAdmin'

export async function GET() {
  try {
    // Check if user is admin
    const admin = await isAdmin()
    if (!admin) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    // Get all unique users with their document counts
    const result = await sql.query(
      `SELECT 
        COALESCE(d.user_id, 'No user') as email,
        COUNT(DISTINCT d.id) as document_count,
        MAX(d.updated_at) as last_activity,
        MIN(d.created_at) as first_created
       FROM documents d
       WHERE d.user_id IS NOT NULL
       GROUP BY d.user_id
       ORDER BY document_count DESC`
    )
    
    // Get all admins
    const adminsResult = await sql.query(
      'SELECT email FROM admins ORDER BY created_at DESC'
    )
    const adminEmails = new Set(adminsResult.rows.map(r => r.email))
    
    // Merge admin status
    const users = result.rows.map(user => ({
      ...user,
      isAdmin: adminEmails.has(user.email)
    }))
    
    return Response.json({ users })
  } catch (error) {
    console.error('Error fetching admin users:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

