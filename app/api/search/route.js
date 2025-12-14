import { sql } from '@vercel/postgres'
import { getUserId } from '@/lib/auth/getSession'

export async function POST(request) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { query: searchQuery, folder_id } = body
    
    if (!searchQuery || searchQuery.trim().length === 0) {
      return Response.json({ documents: [], folders: [] })
    }
    
    let docQuery = `
      SELECT 
        d.id,
        d.title,
        d.folder_id,
        d.created_at,
        d.updated_at,
        d.content_text,
        ts_rank(to_tsvector('simple', COALESCE(d.content_text, '')), plainto_tsquery('simple', $1)) as rank
      FROM documents d
      WHERE d.user_id = $2
        AND to_tsvector('simple', COALESCE(d.content_text, '')) @@ plainto_tsquery('simple', $1)
    `
    
    const params = [searchQuery, userId]
    let paramCount = 3
    
    if (folder_id !== undefined && folder_id !== null) {
      docQuery += ` AND d.folder_id = $${paramCount++}`
      params.push(folder_id)
    }
    
    docQuery += ` ORDER BY rank DESC, d.updated_at DESC LIMIT 50`
    
    const docResult = await sql.query(docQuery, params)
    
    // Also search folder names
    let folderQuery = `
      SELECT * FROM folders
      WHERE user_id = $1 AND LOWER(name) LIKE LOWER($2)
    `
    const folderParams = [userId, `%${searchQuery}%`]
    
    if (folder_id !== undefined && folder_id !== null) {
      folderQuery += ` AND parent_id = $3`
      folderParams.push(folder_id)
    }
    
    folderQuery += ` ORDER BY name ASC LIMIT 20`
    
    const folderResult = await sql.query(folderQuery, folderParams)
    
    return Response.json({
      documents: docResult.rows,
      folders: folderResult.rows
    })
  } catch (error) {
    console.error('Error searching:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}


