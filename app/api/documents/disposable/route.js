import { sql } from '@vercel/postgres'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request) {
    try {
        const body = await request.json()
        const { title = 'Untitled', content } = body

        const id = uuidv4()
        const now = new Date()
        const expiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000) // 48 hours from now
        const nowIso = now.toISOString()
        const expiresAtIso = expiresAt.toISOString()

        // Create document as disposable
        const result = await sql.query(
            `INSERT INTO documents (id, title, user_id, is_disposable, expires_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
            [id, title, null, true, expiresAtIso, nowIso, nowIso]
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

            await sql.query(
                `INSERT INTO document_snapshots (id, document_id, content_json, content_text, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
                [snapshotId, id, JSON.stringify(content), content_text]
            )

            // Update document with snapshot reference
            await sql.query(
                `UPDATE documents 
         SET current_snapshot_id = $1, 
             content_text = $2,
             updated_at = NOW()
         WHERE id = $3`,
                [snapshotId, content_text, id]
            )
        }

        // Fetch updated document
        const updatedDoc = await sql.query(
            'SELECT * FROM documents WHERE id = $1',
            [id]
        )

        return Response.json({
            document: updatedDoc.rows[0],
            expires_at: expiresAtIso
        }, { status: 201 })
    } catch (error) {
        console.error('Error creating disposable document:', error)
        return Response.json({ error: error.message }, { status: 500 })
    }
}
