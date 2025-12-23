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
    const folderId = searchParams.get('folder_id')
    
    let query = `
      SELECT 
        d.id,
        d.title,
        d.folder_id,
        d.created_at,
        d.updated_at,
        d.current_snapshot_id,
        d.content_text
      FROM documents d
      WHERE d.user_id = $1
    `
    const params = [userId]
    
    if (folderId === 'null' || folderId === null) {
      query += ' AND d.folder_id IS NULL'
    } else if (folderId) {
      query += ' AND d.folder_id = $2'
      params.push(folderId)
    }
    
    query += ' ORDER BY d.updated_at DESC'
    
    const result = await sql.query(query, params)
    
    return Response.json({ documents: result.rows })
  } catch (error) {
    console.error('Error fetching documents:', error)
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
    const { title = 'Untitled', folder_id = null } = body
    
    const id = uuidv4()
    const now = new Date().toISOString()
    
    const result = await sql.query(
      `INSERT INTO documents (id, title, folder_id, user_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, title, folder_id, userId, now, now]
    )
    
    return Response.json({ document: result.rows[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating document:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}




