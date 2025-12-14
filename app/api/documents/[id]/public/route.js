import { sql } from '@vercel/postgres'
import { getUserId } from '@/lib/auth/getSession'

export async function PATCH(request, { params }) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = await params
    const body = await request.json()
    const { is_public } = body
    
    // Verify document exists and belongs to user
    let docResult = await sql.query(
      'SELECT id, user_id FROM documents WHERE id = $1',
      [id]
    )
    
    if (docResult.rows.length === 0) {
      return Response.json({ error: 'Document not found' }, { status: 404 })
    }
    
    const document = docResult.rows[0]
    
    // If document has no user_id, assign it to current user
    if (!document.user_id) {
      await sql.query(
        'UPDATE documents SET user_id = $1 WHERE id = $2',
        [userId, id]
      )
    } else if (document.user_id !== userId) {
      // Document belongs to another user
      return Response.json({ error: 'Document not found' }, { status: 404 })
    }
    
    // Update is_public status
    const result = await sql.query(
      'UPDATE documents SET is_public = $1 WHERE id = $2 RETURNING id, is_public',
      [is_public === true, id]
    )
    
    return Response.json({ 
      document: {
        id: result.rows[0].id,
        is_public: result.rows[0].is_public
      }
    })
  } catch (error) {
    console.error('Error updating document public status:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
