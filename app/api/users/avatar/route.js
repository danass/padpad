import { sql } from '@vercel/postgres'
import { getUserId } from '@/lib/auth/getSession'

export async function GET() {
  try {
    const userId = await getUserId()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const result = await sql.query(
      'SELECT avatar_url FROM users WHERE id = $1',
      [userId]
    )
    
    if (result.rows.length === 0) {
      return Response.json({ avatar_url: null })
    }
    
    return Response.json({ avatar_url: result.rows[0].avatar_url })
  } catch (error) {
    console.error('Error fetching avatar:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { avatar_url } = body
    
    if (avatar_url && typeof avatar_url !== 'string') {
      return Response.json({ error: 'avatar_url must be a string' }, { status: 400 })
    }
    
    // Insert or update user
    const result = await sql.query(
      `INSERT INTO users (id, avatar_url, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (id) 
       DO UPDATE SET avatar_url = $2, updated_at = NOW()
       RETURNING avatar_url`,
      [userId, avatar_url || null]
    )
    
    return Response.json({ avatar_url: result.rows[0].avatar_url })
  } catch (error) {
    console.error('Error updating avatar:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

