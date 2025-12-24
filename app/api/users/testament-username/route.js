import { sql } from '@vercel/postgres'
import { getUserId } from '@/lib/auth/getSession'

export async function GET() {
  try {
    const userId = await getUserId()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const result = await sql.query(
      'SELECT testament_username FROM users WHERE id = $1',
      [userId]
    )
    
    if (result.rows.length === 0) {
      return Response.json({ testament_username: null })
    }
    
    return Response.json({ testament_username: result.rows[0].testament_username || null })
  } catch (error) {
    console.error('Error fetching testament username:', error)
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
    let { username } = body
    
    // Validate username format
    if (username) {
      username = username.trim().toLowerCase()
      
      // Only allow alphanumeric, hyphens, and underscores
      if (!/^[a-z0-9_-]+$/.test(username)) {
        return Response.json({ 
          error: 'Username can only contain lowercase letters, numbers, hyphens, and underscores' 
        }, { status: 400 })
      }
      
      // Check length
      if (username.length < 3) {
        return Response.json({ 
          error: 'Username must be at least 3 characters long' 
        }, { status: 400 })
      }
      
      if (username.length > 30) {
        return Response.json({ 
          error: 'Username must be less than 30 characters long' 
        }, { status: 400 })
      }
      
      // Check if username is already taken by another user
      const existingResult = await sql.query(
        'SELECT id FROM users WHERE testament_username = $1 AND id != $2',
        [username, userId]
      )
      
      if (existingResult.rows.length > 0) {
        return Response.json({ 
          error: 'This username is already taken' 
        }, { status: 400 })
      }
    }
    
    // Update username
    const result = await sql.query(
      `UPDATE users 
       SET testament_username = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING testament_username`,
      [username || null, userId]
    )
    
    return Response.json({ testament_username: result.rows[0].testament_username })
  } catch (error) {
    console.error('Error updating testament username:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}


