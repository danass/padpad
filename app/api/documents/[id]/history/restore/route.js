import { sql } from '@vercel/postgres'
import { getUserId } from '@/lib/auth/getSession'
import { isAdmin } from '@/lib/auth/isAdmin'

export async function POST(request, { params }) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { snapshotId } = await request.json()

    // Verify document exists
    let docCheck = await sql.query(
      'SELECT id, user_id FROM documents WHERE id = $1',
      [id]
    )

    if (docCheck.rows.length === 0) {
      return Response.json({ error: 'Document not found' }, { status: 404 })
    }

    const doc = docCheck.rows[0]

    // Check ownership
    if (doc.user_id && doc.user_id !== userId) {
      const admin = await isAdmin()
      if (!admin) {
        return Response.json({ error: 'Document not found' }, { status: 404 })
      }
    }

    if (!snapshotId) {
      return Response.json({ error: 'snapshotId is required' }, { status: 400 })
    }

    // Get the requested snapshot
    const snapshotResult = await sql.query(
      `SELECT * FROM document_snapshots
       WHERE id = $1 AND document_id = $2`,
      [snapshotId, id]
    )

    if (snapshotResult.rows.length === 0) {
      return Response.json({ error: 'Snapshot not found' }, { status: 404 })
    }

    const snapshot = snapshotResult.rows[0]
    let content = snapshot.content_json

    // Parse if string
    if (typeof content === 'string') {
      try {
        content = JSON.parse(content)
      } catch (e) {
        console.error('Error parsing snapshot content_json:', e)
        content = { type: 'doc', content: [] }
      }
    }

    return Response.json({ content })
  } catch (error) {
    console.error('Error restoring history:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
