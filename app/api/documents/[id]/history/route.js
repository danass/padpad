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
    } else if (doc.user_id !== userId && !admin) {
      // Document belongs to another user - only admins can access
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

    // Parse content_json for snapshots if it's a string
    const snapshots = snapshotsResult.rows.map(snapshot => {
      if (snapshot.content_json && typeof snapshot.content_json === 'string') {
        try {
          snapshot.content_json = JSON.parse(snapshot.content_json)
        } catch (e) {
          console.error('Error parsing snapshot content_json in history:', e)
        }
      }
      return snapshot
    })

    return Response.json({
      events: result.rows,
      snapshots: snapshots
    })
  } catch (error) {
    console.error('Error fetching history:', error)
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

    // Verify document exists and check ownership
    let docCheck = await sql.query(
      'SELECT id, user_id FROM documents WHERE id = $1',
      [id]
    )

    if (docCheck.rows.length === 0) {
      return Response.json({ error: 'Document not found' }, { status: 404 })
    }

    const doc = docCheck.rows[0]
    if (doc.user_id && doc.user_id !== userId && !admin) {
      return Response.json({ error: 'Document not found' }, { status: 404 })
    }

    // Delete all events for this document
    const result = await sql.query(
      'DELETE FROM document_events WHERE document_id = $1',
      [id]
    )

    return Response.json({
      success: true,
      count: result.rowCount,
      message: `Successfully cleared ${result.rowCount} events`
    })
  } catch (error) {
    console.error('Error clearing history events:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
