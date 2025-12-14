import { sql } from '@vercel/postgres'
import { getContentAtTime } from '../../../../../../lib/editor/history-replay'
import { getUserId } from '@/lib/auth/getSession'

export async function POST(request, { params }) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = await params
    const { targetTime } = await request.json()
    
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
    
    if (!targetTime) {
      return Response.json({ error: 'targetTime is required' }, { status: 400 })
    }
    
    // Get all snapshots
    const snapshotsResult = await sql.query(
      `SELECT * FROM document_snapshots
       WHERE document_id = $1
       ORDER BY created_at DESC`,
      [id]
    )
    
    // Find the latest snapshot before targetTime
    let baseSnapshot = null
    for (const snapshot of snapshotsResult.rows) {
      if (new Date(snapshot.created_at) <= new Date(targetTime)) {
        baseSnapshot = snapshot
        // Parse content_json if it's a string
        if (typeof baseSnapshot.content_json === 'string') {
          try {
            baseSnapshot.content_json = JSON.parse(baseSnapshot.content_json)
          } catch (e) {
            console.error('Error parsing snapshot content_json:', e)
          }
        }
        break
      }
    }
    
    // Get all events up to targetTime
    let events = []
    if (baseSnapshot) {
      // Get events after snapshot and up to targetTime
      const eventsResult = await sql.query(
        `SELECT * FROM document_events
         WHERE document_id = $1 
         AND created_at > $2 
         AND created_at <= $3
         ORDER BY version ASC`,
        [id, baseSnapshot.created_at, targetTime]
      )
      events = eventsResult.rows
    } else {
      // No snapshot, get all events up to targetTime
      const eventsResult = await sql.query(
        `SELECT * FROM document_events
         WHERE document_id = $1 AND created_at <= $2
         ORDER BY version ASC`,
        [id, targetTime]
      )
      events = eventsResult.rows
    }
    
    // Parse payloads if they're strings
    events = events.map(event => {
      if (typeof event.payload === 'string') {
        try {
          event.payload = JSON.parse(event.payload)
        } catch (e) {
          console.error('Error parsing event payload:', e)
        }
      }
      return event
    })
    
    // Reconstruct content at targetTime
    let content = getContentAtTime(baseSnapshot, events, targetTime)
    
    // Ensure content is valid
    if (!content || typeof content !== 'object') {
      content = { type: 'doc', content: [] }
    }
    
    // Ensure it has the correct structure
    if (!content.type && !content.content) {
      content = {
        type: 'doc',
        content: Array.isArray(content) ? content : [content]
      }
    }
    
    return Response.json({ content })
  } catch (error) {
    console.error('Error restoring history:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

