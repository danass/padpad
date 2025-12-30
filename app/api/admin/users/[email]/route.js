import { sql } from '@vercel/postgres'
import { isAdmin } from '@/lib/auth/isAdmin'

export async function POST(request, { params }) {
  try {
    // Check if user is admin
    const admin = await isAdmin()
    if (!admin) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { email } = await params
    const body = await request.json()
    const { isAdmin: setAdmin, role } = body

    if (typeof setAdmin !== 'boolean') {
      return Response.json({ error: 'isAdmin must be a boolean' }, { status: 400 })
    }

    if (setAdmin) {
      // Update role to admin in users table
      await sql.query(
        "UPDATE users SET role = 'admin' WHERE id = $1",
        [email]
      )
    } else {
      // Update role to user in users table
      await sql.query(
        "UPDATE users SET role = 'user' WHERE id = $1",
        [email]
      )
    }

    // Explicitly update role if provided in body
    if (role !== undefined && role !== 'admin' && !setAdmin) {
      await sql.query(
        "UPDATE users SET role = $1 WHERE id = $2",
        [role, email]
      )
    }

    return Response.json({
      success: true,
      email,
      isAdmin: setAdmin,
      role
    })
  } catch (error) {
    console.error('Error setting admin status:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}




