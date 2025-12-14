import { sql } from '@vercel/postgres'
import { getUserId } from '@/lib/auth/getSession'

export async function GET(request, { params }) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = await params
    
    // Verify document exists - if it has no user_id, assign it to current user
    let docCheck = await sql.query(
      'SELECT id, user_id FROM documents WHERE id = $1',
      [id]
    )
    
    if (docCheck.rows.length === 0) {
      return Response.json({ error: 'Document not found' }, { status: 404 })
    }
    
    const doc = docCheck.rows[0]
    
    // If document has no user_id, assign it to current user (migration for old documents)
    if (!doc.user_id) {
      await sql.query(
        'UPDATE documents SET user_id = $1 WHERE id = $2',
        [userId, id]
      )
    } else if (doc.user_id !== userId) {
      // Document belongs to another user
      return Response.json({ error: 'Document not found' }, { status: 404 })
    }
    
    const { searchParams } = new URL(request.url)
    const before = searchParams.get('before') // ISO timestamp
    
    let query = `
      SELECT * FROM document_events
      WHERE document_id = $1
    `
    const params_array = [id]
    
    if (before) {
      query += ' AND created_at <= $2'
      params_array.push(before)
    }
    
    query += ' ORDER BY version ASC'
    
    const result = await sql.query(query, params_array)
    
    // Also get snapshots - newest first
    const snapshotsResult = await sql.query(
      `SELECT * FROM document_snapshots
       WHERE document_id = $1
       ORDER BY created_at DESC`,
      [id]
    )
    
    return Response.json({
      events: result.rows,
      snapshots: snapshotsResult.rows
    })
  } catch (error) {
    console.error('Error fetching history:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

