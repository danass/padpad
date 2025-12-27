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
      // Add to admins table (ignore if already exists)
      try {
        await sql.query(
          'INSERT INTO admins (email) VALUES ($1) ON CONFLICT (email) DO NOTHING',
          [email]
        )
      } catch (error) {
        // Ignore duplicate key errors
        if (!error.message.includes('duplicate') && !error.message.includes('unique')) {
          throw error
        }
      }
    }

    // Update role in users table if provided
    if (role !== undefined) {
      await sql.query(
        'UPDATE users SET role = $1 WHERE email = $2',
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



