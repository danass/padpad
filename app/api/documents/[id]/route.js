import { sql } from '@vercel/postgres'
import { getUserId } from '@/lib/auth/getSession'

export async function GET(request, { params }) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = await params
    
    // Get document - if it has no user_id, assign it to current user
    let docResult = await sql.query(
      'SELECT * FROM documents WHERE id = $1',
      [id]
    )
    
    if (docResult.rows.length === 0) {
      return Response.json({ error: 'Document not found' }, { status: 404 })
    }
    
    const document = docResult.rows[0]
    
    // If document has no user_id, assign it to current user (migration for old documents)
    if (!document.user_id) {
      await sql.query(
        'UPDATE documents SET user_id = $1 WHERE id = $2',
        [userId, id]
      )
      document.user_id = userId
    } else if (document.user_id !== userId) {
      // Document belongs to another user
      return Response.json({ error: 'Document not found' }, { status: 404 })
    }
    
    // Get latest snapshot (prefer current_snapshot_id, but fallback to most recent)
    let snapshot = null
    if (document.current_snapshot_id) {
      const snapshotResult = await sql.query(
        'SELECT * FROM document_snapshots WHERE id = $1',
        [document.current_snapshot_id]
      )
      if (snapshotResult.rows.length > 0) {
        snapshot = snapshotResult.rows[0]
      }
    }
    
    // If no snapshot found via current_snapshot_id, get the most recent one
    if (!snapshot) {
      const latestSnapshotResult = await sql.query(
        `SELECT * FROM document_snapshots 
         WHERE document_id = $1 
         ORDER BY created_at DESC 
         LIMIT 1`,
        [id]
      )
      if (latestSnapshotResult.rows.length > 0) {
        snapshot = latestSnapshotResult.rows[0]
      }
    }
    
    // Parse content_json if it's a string
    if (snapshot && snapshot.content_json && typeof snapshot.content_json === 'string') {
      try {
        snapshot.content_json = JSON.parse(snapshot.content_json)
      } catch (e) {
        console.error('Error parsing snapshot content_json:', e)
      }
    }
    
    // Get events after snapshot (or all events if no snapshot)
    let events = []
    if (snapshot) {
      const eventsResult = await sql.query(
        `SELECT * FROM document_events 
         WHERE document_id = $1 AND created_at > $2
         ORDER BY version ASC`,
        [id, snapshot.created_at]
      )
      // Parse payload if it's a string
      events = eventsResult.rows.map(event => ({
        ...event,
        payload: typeof event.payload === 'string' ? JSON.parse(event.payload) : event.payload
      }))
    } else {
      const eventsResult = await sql.query(
        `SELECT * FROM document_events 
         WHERE document_id = $1
         ORDER BY version ASC`,
        [id]
      )
      // Parse payload if it's a string
      events = eventsResult.rows.map(event => ({
        ...event,
        payload: typeof event.payload === 'string' ? JSON.parse(event.payload) : event.payload
      }))
    }
    
    return Response.json({
      document,
      snapshot,
      events
    })
  } catch (error) {
    console.error('Error fetching document:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = await params
    const body = await request.json()
    const { title, folder_id } = body
    
    const updates = []
    const values = []
    let paramCount = 1
    
    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`)
      values.push(title)
    }
    
    if (folder_id !== undefined) {
      updates.push(`folder_id = $${paramCount++}`)
      values.push(folder_id)
    }
    
    if (updates.length === 0) {
      return Response.json({ error: 'No fields to update' }, { status: 400 })
    }
    
    values.push(id, userId)
    
    const result = await sql.query(
      `UPDATE documents 
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
       RETURNING *`,
      values
    )
    
    if (result.rows.length === 0) {
      return Response.json({ error: 'Document not found' }, { status: 404 })
    }
    
    return Response.json({ document: result.rows[0] })
  } catch (error) {
    console.error('Error updating document:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = await params
    
    const result = await sql.query(
      'DELETE FROM documents WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    )
    
    if (result.rows.length === 0) {
      return Response.json({ error: 'Document not found' }, { status: 404 })
    }
    
    return Response.json({ success: true, id })
  } catch (error) {
    console.error('Error deleting document:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

