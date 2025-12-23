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
    
    // Check if any admins exist
    const adminsCheck = await sql.query('SELECT COUNT(*) as count FROM admins')
    const adminCount = parseInt(adminsCheck.rows[0].count)
    
    // If admins exist, check if current user is admin
    if (adminCount > 0) {
      const isAdminResult = await sql.query(
        'SELECT id FROM admins WHERE email = $1',
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
    
    // Add admin
    try {
      await sql.query(
        'INSERT INTO admins (email) VALUES ($1) ON CONFLICT (email) DO NOTHING',
        [email]
      )
      return Response.json({ success: true, email, message: 'Admin added successfully' })
    } catch (error) {
      if (error.message.includes('duplicate') || error.message.includes('unique')) {
        return Response.json({ success: true, email, message: 'Admin already exists' })
      }
      throw error
    }
  } catch (error) {
    console.error('Error setting up admin:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

