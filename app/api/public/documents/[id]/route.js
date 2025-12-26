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

    // Debug log to understand 403 issue
    console.log(`[PUBLIC DOC] ID: ${id}, is_public: ${document.is_public}, type: ${typeof document.is_public}`)

    // Check if document is public OR disposable and not expired
    const isExpired = document.expires_at && new Date(document.expires_at) < new Date()

    if (!document.is_public && !(document.is_disposable && !isExpired)) {
      console.log(`[PUBLIC DOC] 403 - is_public: ${document.is_public}, is_disposable: ${document.is_disposable}, is_expired: ${isExpired}`)
      return Response.json({
        error: isExpired ? 'Document has expired' : 'Document is not public',
        is_expired: isExpired
      }, { status: 403 })
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

    // Get previous and next public documents (same user, ordered by updated_at)
    let prevDoc = null
    let nextDoc = null

    if (document.user_id) {
      // Get previous document (older) - exclude current document
      const prevResult = await sql.query(
        `SELECT id, title FROM documents 
         WHERE user_id = $1 AND is_public = true AND id != $2 AND updated_at <= $3
         ORDER BY updated_at DESC, id DESC LIMIT 1`,
        [document.user_id, document.id, document.updated_at]
      )
      if (prevResult.rows.length > 0) {
        prevDoc = prevResult.rows[0]
      }

      // Get next document (newer) - exclude current document
      const nextResult = await sql.query(
        `SELECT id, title FROM documents 
         WHERE user_id = $1 AND is_public = true AND id != $2 AND updated_at >= $3
         ORDER BY updated_at ASC, id ASC LIMIT 1`,
        [document.user_id, document.id, document.updated_at]
      )
      // Filter out current document if it somehow got included
      if (nextResult.rows.length > 0 && nextResult.rows[0].id !== document.id) {
        nextDoc = nextResult.rows[0]
      }
    }

    // Get user's archive link identifier
    let archiveId = null
    let authorName = null
    if (document.user_id) {
      try {
        const userResult = await sql.query(
          'SELECT id, testament_username, archive_id FROM users WHERE id = $1',
          [document.user_id]
        )

        if (userResult.rows.length > 0) {
          const user = userResult.rows[0]
          archiveId = user.testament_username || user.archive_id
          authorName = user.testament_username || null
        }
      } catch (userError) {
        console.error('Error fetching user:', userError)
        // Continue without archive info
      }
    }

    return Response.json({
      document: {
        id: document.id,
        title: document.title || '',
        is_full_width: document.is_full_width || false,
        created_at: document.created_at,
        updated_at: document.updated_at,
        archive_id: archiveId, // Use testament_username or short hash
        author_name: authorName, // Display name if available
      },
      content,
      navigation: {
        prev: prevDoc ? { ...prevDoc, title: prevDoc.title || '' } : null,
        next: nextDoc ? { ...nextDoc, title: nextDoc.title || '' } : null
      }
    })
  } catch (error) {
    console.error('Error fetching public document:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}




