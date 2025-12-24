import { sql } from '@vercel/postgres'
import { getUserId } from '@/lib/auth/getSession'

export async function GET(request) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get ALL documents recursively (including those in all subfolders)
    // This uses a simple query that gets all documents for the user
    // regardless of folder structure
    const query = `
      SELECT 
        d.id,
        d.title,
        d.folder_id,
        d.created_at,
        d.updated_at,
        d.current_snapshot_id,
        d.content_text,
        d.auto_public_date,
        d.is_public
      FROM documents d
      WHERE d.user_id = $1
      ORDER BY d.updated_at DESC
    `
    
    const result = await sql.query(query, [userId])
    
    return Response.json({ documents: result.rows })
  } catch (error) {
    console.error('Error fetching all documents:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}



