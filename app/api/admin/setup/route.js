import { sql } from '@vercel/postgres'
import { getUserId } from '@/lib/auth/getSession'

// This endpoint allows setting the first admin if no admins exist
// After the first admin is set, this endpoint becomes restricted
export async function POST(request) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if any admins exist in users table
    const adminsCheck = await sql.query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'")
    const adminCount = parseInt(adminsCheck.rows[0].count)

    // If admins exist, check if current user is admin
    if (adminCount > 0) {
      const isAdminResult = await sql.query(
        "SELECT id FROM users WHERE id = $1 AND role = 'admin'",
        [userId]
      )
      if (isAdminResult.rows.length === 0) {
        return Response.json({ error: 'Unauthorized - admins already exist' }, { status: 403 })
      }
    }

    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return Response.json({ error: 'Email is required' }, { status: 400 })
    }

    // Update or insert user with admin role
    try {
      await sql.query(
        "UPDATE users SET role = 'admin' WHERE id = $1",
        [email]
      )
      // Check if user was actually updated (in case they haven't signed in yet)
      const checkUpdate = await sql.query("SELECT id FROM users WHERE id = $1 AND role = 'admin'", [email])

      if (checkUpdate.rows.length === 0) {
        // Option 1: Create a skeleton user record
        // Generate random archive_id
        const archiveId = Math.random().toString(36).substring(2, 10)
        await sql.query(
          "INSERT INTO users (id, role, archive_id) VALUES ($1, 'admin', $2) ON CONFLICT (id) DO UPDATE SET role = 'admin'",
          [email, archiveId]
        )
      }

      return Response.json({ success: true, email, message: 'Admin role granted successfully' })
    } catch (error) {
      console.error('Migration error:', error)
      throw error
    }
  } catch (error) {
    console.error('Error setting up admin:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}




