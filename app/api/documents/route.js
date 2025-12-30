import { sql } from '@vercel/postgres'
import { v4 as uuidv4 } from 'uuid'
import { getUserId } from '@/lib/auth/getSession'

export async function GET(request) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const folderId = searchParams.get('folder_id')

    let query = `
      SELECT 
        d.id,
        d.title,
        d.folder_id,
        d.created_at,
        d.updated_at,
        d.current_snapshot_id,
        LEFT(d.content_text, 120) as preview_text,
        d.word_count,
        d.char_count,
        d.auto_public_date,
        d.is_public
      FROM documents d
      WHERE d.user_id = $1
    `
    const params = [userId]

    if (folderId === 'null' || folderId === null) {
      query += ' AND d.folder_id IS NULL'
    } else if (folderId) {
      query += ' AND d.folder_id = $2'
      params.push(folderId)
    }

    query += ' ORDER BY d.updated_at DESC'

    const result = await sql.query(query, params)

    return Response.json({ documents: result.rows })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title = 'Untitled', folder_id = null, content } = body

    const id = uuidv4()
    const now = new Date().toISOString()

    // Create document
    const result = await sql.query(
      `INSERT INTO documents (id, title, folder_id, user_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, title, folder_id, userId, now, now]
    )

    // If content is provided, create initial snapshot
    if (content) {
      const snapshotId = uuidv4()

      // Extract text content for search
      const extractText = (node) => {
        if (!node) return ''
        if (node.type === 'text') return node.text || ''
        if (node.content && Array.isArray(node.content)) {
          return node.content.map(extractText).join(' ')
        }
        return ''
      }
      const content_text = extractText(content).substring(0, 1000)
      const word_count = content_text.trim().split(/\s+/).filter(w => w.length > 0).length
      const char_count = content_text.length

      await sql.query(
        `INSERT INTO document_snapshots (id, document_id, content_json, content_text, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING *`,
        [snapshotId, id, JSON.stringify(content), content_text]
      )

      // Update document with snapshot reference and stats
      await sql.query(
        `UPDATE documents 
         SET current_snapshot_id = $1, 
             content_text = $2,
             word_count = $3,
             char_count = $4,
             updated_at = NOW()
         WHERE id = $5`,
        [snapshotId, content_text, word_count, char_count, id]
      )
    }

    // Fetch updated document
    const updatedDoc = await sql.query(
      'SELECT * FROM documents WHERE id = $1',
      [id]
    )

    return Response.json({ document: updatedDoc.rows[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating document:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}





