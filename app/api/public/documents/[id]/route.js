import { sql } from '@vercel/postgres'
import { replayHistory } from '@/lib/editor/history-replay'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    
    // Get document - public access, no authentication required
    let docResult = await sql.query(
      'SELECT * FROM documents WHERE id = $1',
      [id]
    )
    
    if (docResult.rows.length === 0) {
      return Response.json({ error: 'Document not found' }, { status: 404 })
    }
    
    const document = docResult.rows[0]
    
    // Check if document is public
    if (!document.is_public) {
      return Response.json({ error: 'Document is not public' }, { status: 403 })
    }
    
    // Get latest snapshot if exists
    let snapshot = null
    if (document.current_snapshot_id) {
      const snapshotResult = await sql.query(
        'SELECT * FROM document_snapshots WHERE id = $1',
        [document.current_snapshot_id]
      )
      if (snapshotResult.rows.length > 0) {
        snapshot = snapshotResult.rows[0]
        // Parse content_json if it's a string
        if (snapshot.content_json && typeof snapshot.content_json === 'string') {
          try {
            snapshot.content_json = JSON.parse(snapshot.content_json)
          } catch (e) {
            console.error('Error parsing snapshot content_json:', e)
          }
        }
      }
    }
    
    // Get events after snapshot
    let events = []
    if (snapshot) {
      const eventsResult = await sql.query(
        'SELECT * FROM document_events WHERE document_id = $1 AND created_at > $2 ORDER BY created_at ASC',
        [id, snapshot.created_at]
      )
      events = eventsResult.rows.map(event => ({
        ...event,
        payload: typeof event.payload === 'string' ? JSON.parse(event.payload) : event.payload
      }))
    } else {
      // No snapshot, get all events
      const eventsResult = await sql.query(
        'SELECT * FROM document_events WHERE document_id = $1 ORDER BY created_at ASC',
        [id]
      )
      events = eventsResult.rows.map(event => ({
        ...event,
        payload: typeof event.payload === 'string' ? JSON.parse(event.payload) : event.payload
      }))
    }
    
    // Reconstruct content
    const content = replayHistory(snapshot, events)
    
    return Response.json({
      document: {
        id: document.id,
        title: document.title,
        created_at: document.created_at,
        updated_at: document.updated_at,
      },
      content
    })
  } catch (error) {
    console.error('Error fetching public document:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
