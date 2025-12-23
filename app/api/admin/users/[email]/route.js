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
    const { isAdmin: setAdmin } = body
    
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
    } else {
      // Remove from admins table
      await sql.query(
        'DELETE FROM admins WHERE email = $1',
        [email]
      )
    }
    
    return Response.json({ 
      success: true, 
      email,
      isAdmin: setAdmin 
    })
  } catch (error) {
    console.error('Error setting admin status:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

