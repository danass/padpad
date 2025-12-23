import { sql } from '@vercel/postgres'
import { getUserId } from '@/lib/auth/getSession'

export async function POST() {
  try {
    const userId = await getUserId()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Assign all documents without user_id to current user
    // Only assign orphaned documents (without user_id), not documents belonging to other users
    const documentsResult = await sql.query(
      `UPDATE documents 
       SET user_id = $1 
       WHERE user_id IS NULL
       RETURNING id, title`,
      [userId]
    )
    
    // Also assign orphaned folders
    const foldersResult = await sql.query(
      `UPDATE folders 
       SET user_id = $1 
       WHERE user_id IS NULL
       RETURNING id, name`,
      [userId]
    )
    
    return Response.json({ 
      success: true,
      documentsAssigned: documentsResult.rows.length,
      foldersAssigned: foldersResult.rows.length
    })
  } catch (error) {
    console.error('Error assigning orphans:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}



