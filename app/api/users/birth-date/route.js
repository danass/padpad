import { sql } from '@vercel/postgres'
import { getUserId } from '@/lib/auth/getSession'

export async function GET() {
  try {
    const userId = await getUserId()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const result = await sql.query(
      'SELECT birth_date FROM users WHERE id = $1',
      [userId]
    )
    
    if (result.rows.length === 0) {
      return Response.json({ birth_date: null })
    }
    
    return Response.json({ birth_date: result.rows[0].birth_date })
  } catch (error) {
    console.error('Error fetching birth date:', error)
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
    const { birth_date } = body
    
    if (!birth_date) {
      return Response.json({ error: 'birth_date is required' }, { status: 400 })
    }
    
    // Validate date format
    const date = new Date(birth_date)
    if (isNaN(date.getTime())) {
      return Response.json({ error: 'Invalid date format' }, { status: 400 })
    }
    
    // Insert or update user
    const result = await sql.query(
      `INSERT INTO users (id, birth_date, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (id) 
       DO UPDATE SET birth_date = $2, updated_at = NOW()
       RETURNING birth_date`,
      [userId, birth_date]
    )
    
    return Response.json({ birth_date: result.rows[0].birth_date })
  } catch (error) {
    console.error('Error updating birth date:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

