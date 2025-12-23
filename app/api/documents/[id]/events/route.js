import { sql } from '@vercel/postgres'
import { v4 as uuidv4 } from 'uuid'
import { getUserId } from '@/lib/auth/getSession'
import { isAdmin } from '@/lib/auth/isAdmin'

export async function POST(request, { params }) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = await params
    const body = await request.json()
    const { type, payload, version } = body
    
    if (!type || !payload || version === undefined) {
      return Response.json(
        { error: 'Missing required fields: type, payload, version' },
        { status: 400 }
      )
    }
    
    if (!['insert', 'delete', 'format', 'meta'].includes(type)) {
      return Response.json(
        { error: 'Invalid event type' },
        { status: 400 }
      )
    }
    
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
    // Use atomic UPDATE with WHERE user_id IS NULL to prevent race conditions
    if (!doc.user_id) {
      const updateResult = await sql.query(
        'UPDATE documents SET user_id = $1 WHERE id = $2 AND user_id IS NULL RETURNING id',
        [userId, id]
      )
      // If update didn't affect any rows, another user already claimed it
      if (updateResult.rows.length === 0) {
        // Re-check to see who owns it now
        const recheck = await sql.query(
          'SELECT user_id FROM documents WHERE id = $1',
          [id]
        )
        if (recheck.rows.length > 0 && recheck.rows[0].user_id !== userId && !admin) {
          return Response.json({ error: 'Document not found' }, { status: 404 })
        }
      }
    } else if (doc.user_id !== userId && !admin) {
      // Document belongs to another user - only admins can access
      return Response.json({ error: 'Document not found' }, { status: 404 })
    }
    
    // Insert event
    const eventId = uuidv4()
    const result = await sql.query(
      `INSERT INTO document_events (id, document_id, type, payload, version, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [eventId, id, type, JSON.stringify(payload), version]
    )
    
    // Update document updated_at
    await sql.query(
      'UPDATE documents SET updated_at = NOW() WHERE id = $1',
      [id]
    )
    
    return Response.json({ event: result.rows[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

