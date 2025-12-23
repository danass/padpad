import { sql } from '@vercel/postgres'
import { v4 as uuidv4 } from 'uuid'
import { getUserId } from '@/lib/auth/getSession'

export async function GET(request) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get('parent_id')
    
    let query = 'SELECT * FROM folders WHERE user_id = $1'
    const params = [userId]
    
    if (parentId === 'null' || parentId === null) {
      query += ' AND parent_id IS NULL'
    } else if (parentId) {
      query += ' AND parent_id = $2'
      params.push(parentId)
    }
    
    query += ' ORDER BY name ASC'
    
    const result = await sql.query(query, params)
    
    return Response.json({ folders: result.rows })
  } catch (error) {
    console.error('Error fetching folders:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { name, parent_id = null } = body
    
    if (!name) {
      return Response.json({ error: 'Name is required' }, { status: 400 })
    }
    
    const id = uuidv4()
    const now = new Date().toISOString()
    
    const result = await sql.query(
      `INSERT INTO folders (id, name, parent_id, user_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, name, parent_id, userId, now, now]
    )
    
    return Response.json({ folder: result.rows[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating folder:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}





