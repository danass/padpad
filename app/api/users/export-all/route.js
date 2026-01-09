import { sql } from '@vercel/postgres'
import { getUserId } from '@/lib/auth/getSession'
import { tipTapToMarkdown } from '@/lib/export/markdown.js'
import JSZip from 'jszip'

export async function GET(request) {
    try {
        const userId = await getUserId()
        if (!userId) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get all user's documents
        const docsResult = await sql.query(
            `SELECT d.id, d.title, d.current_snapshot_id, d.created_at, d.updated_at
       FROM documents d
       WHERE d.user_id = $1 AND d.is_disposable = false
       ORDER BY d.updated_at DESC`,
            [userId]
        )

        if (docsResult.rows.length === 0) {
            return Response.json({ error: 'No documents found' }, { status: 404 })
        }

        const zip = new JSZip()
        const manifest = {
            exportedAt: new Date().toISOString(),
            userId: userId,
            documentCount: docsResult.rows.length,
            documents: []
        }

        // Process each document
        for (const doc of docsResult.rows) {
            let content = null

            if (doc.current_snapshot_id) {
                const snapshotResult = await sql.query(
                    'SELECT content_json FROM document_snapshots WHERE id = $1',
                    [doc.current_snapshot_id]
                )
                if (snapshotResult.rows.length > 0) {
                    content = snapshotResult.rows[0].content_json
                    if (typeof content === 'string') {
                        try { content = JSON.parse(content) } catch (e) { }
                    }
                }
            }

            if (!content) {
                content = { type: 'doc', content: [] }
            }

            // Convert to markdown
            const markdown = tipTapToMarkdown(content)
            const safeTitle = (doc.title || 'Untitled').replace(/[^a-zA-Z0-9-_ ]/g, '').trim() || 'document'
            const filename = `${safeTitle}.md`

            // Add to zip
            zip.file(filename, markdown)

            // Add to manifest
            manifest.documents.push({
                id: doc.id,
                title: doc.title || 'Untitled',
                filename: filename,
                createdAt: doc.created_at,
                updatedAt: doc.updated_at
            })

            // Also save the raw JSON for completeness
            zip.file(`json/${safeTitle}.json`, JSON.stringify(content, null, 2))
        }

        // Add manifest
        zip.file('manifest.json', JSON.stringify(manifest, null, 2))

        // Generate ZIP
        const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })

        return new Response(zipBuffer, {
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="textpad-export-${new Date().toISOString().split('T')[0]}.zip"`
            }
        })
    } catch (error) {
        console.error('Error exporting all data:', error)
        return Response.json({ error: error.message }, { status: 500 })
    }
}
