import { sql } from '@vercel/postgres'
import { getUserId } from '@/lib/auth/getSession'
import { isAdmin } from '@/lib/auth/isAdmin'

export async function GET(request, { params }) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = await params
    const admin = await isAdmin()
    
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
    // Use atomic UPDATE with WHERE user_id IS NULL to prevent race conditions
    if (!document.user_id) {
      const updateResult = await sql.query(
        'UPDATE documents SET user_id = $1 WHERE id = $2 AND user_id IS NULL RETURNING user_id',
        [userId, id]
      )
      if (updateResult.rows.length > 0) {
        document.user_id = updateResult.rows[0].user_id
      } else {
        // Another user already claimed it, re-fetch to get current owner
        const recheck = await sql.query(
          'SELECT user_id FROM documents WHERE id = $1',
          [id]
        )
        if (recheck.rows.length > 0) {
          document.user_id = recheck.rows[0].user_id
        }
      }
    }
    
    if (document.user_id && document.user_id !== userId && !admin) {
      // Document belongs to another user - only admins can access
      return Response.json({ error: 'Document not found' }, { status: 404 })
    }
    
    // Always get the most recent snapshot (it's the source of truth)
    // Don't rely on current_snapshot_id which might be outdated
    const latestSnapshotResult = await sql.query(
      `SELECT * FROM document_snapshots 
       WHERE document_id = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [id]
    )
    
    let snapshot = null
    if (latestSnapshotResult.rows.length > 0) {
      snapshot = latestSnapshotResult.rows[0]
    } else if (document.current_snapshot_id) {
      // Fallback to current_snapshot_id if no snapshots found
      const snapshotResult = await sql.query(
        'SELECT * FROM document_snapshots WHERE id = $1',
        [document.current_snapshot_id]
      )
      if (snapshotResult.rows.length > 0) {
        snapshot = snapshotResult.rows[0]
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
    const { title, folder_id, is_full_width } = body
    
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
    
    if (is_full_width !== undefined) {
      updates.push(`is_full_width = $${paramCount++}`)
      values.push(is_full_width === true)
    }
    
    if (updates.length === 0) {
      return Response.json({ error: 'No fields to update' }, { status: 400 })
    }
    
    values.push(id)
    
    const admin = await isAdmin()
    let whereClause = `id = $${paramCount}`
    if (!admin) {
      whereClause += ` AND user_id = $${paramCount + 1}`
      values.push(userId)
    }
    
    const result = await sql.query(
      `UPDATE documents 
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE ${whereClause}
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
    const admin = await isAdmin()
    
    let result
    if (admin) {
      result = await sql.query(
        'DELETE FROM documents WHERE id = $1 RETURNING id',
        [id]
      )
    } else {
      result = await sql.query(
        'DELETE FROM documents WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, userId]
      )
    }
    
    if (result.rows.length === 0) {
      return Response.json({ error: 'Document not found' }, { status: 404 })
    }
    
    return Response.json({ success: true, id })
  } catch (error) {
    console.error('Error deleting document:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

