import { sql } from '@vercel/postgres'
import JSZip from 'jszip'
import { verifyDownloadToken } from '@/lib/auth/downloadToken'
import { tipTapToMarkdown } from '@/lib/export/markdown'

export async function GET(request, { params }) {
    try {
        const { token } = await params

        // Verify and decode token
        const result = verifyDownloadToken(token)

        if (!result.valid) {
            return new Response(
                `<!DOCTYPE html>
        <html>
        <head><title>Invalid Link</title></head>
        <body style="font-family: system-ui; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0;">
          <div style="text-align: center; padding: 2rem;">
            <h1 style="color: #ef4444;">❌ ${result.error === 'Token expired' ? 'Link Expired' : 'Invalid Link'}</h1>
            <p style="color: #666;">${result.error === 'Token expired'
                    ? 'This download link has expired. The 30-day window has passed.'
                    : 'This download link is invalid or has been tampered with.'}</p>
          </div>
        </body>
        </html>`,
                { status: 400, headers: { 'Content-Type': 'text/html' } }
            )
        }

        const email = result.email

        // Verify user exists and is suspended
        const userCheck = await sql.query(
            'SELECT id, suspended_at FROM users WHERE id = $1',
            [email]
        )

        if (userCheck.rows.length === 0) {
            return new Response('User not found', { status: 404 })
        }

        // Get all user documents (including their content)
        const documentsResult = await sql.query(
            `SELECT d.id, d.title, d.created_at, d.updated_at, d.is_public,
              ds.content_json, ds.content_text
       FROM documents d
       LEFT JOIN document_snapshots ds ON d.current_snapshot_id = ds.id
       WHERE d.user_id = $1 AND d.is_disposable = false
       ORDER BY d.updated_at DESC`,
            [email]
        )

        const documents = documentsResult.rows

        // Create ZIP file
        const zip = new JSZip()

        // Add manifest
        const manifest = {
            exportDate: new Date().toISOString(),
            documentCount: documents.length,
            note: 'This export was generated for a suspended account.'
        }
        zip.file('manifest.json', JSON.stringify(manifest, null, 2))

        // Add each document
        for (const doc of documents) {
            const safeName = (doc.title || 'Untitled').replace(/[^a-zA-Z0-9-_\s]/g, '').substring(0, 50)
            const folderName = `${safeName}_${doc.id.substring(0, 8)}`

            // Add markdown version
            let markdown = `# ${doc.title || 'Untitled'}\n\n`
            if (doc.content_json) {
                try {
                    const content = typeof doc.content_json === 'string'
                        ? JSON.parse(doc.content_json)
                        : doc.content_json
                    markdown += tipTapToMarkdown(content)
                } catch (e) {
                    markdown += doc.content_text || ''
                }
            }
            zip.file(`${folderName}/${safeName}.md`, markdown)

            // Add raw JSON
            if (doc.content_json) {
                zip.file(`${folderName}/content.json`,
                    typeof doc.content_json === 'string'
                        ? doc.content_json
                        : JSON.stringify(doc.content_json, null, 2)
                )
            }

            // Add metadata
            zip.file(`${folderName}/metadata.json`, JSON.stringify({
                id: doc.id,
                title: doc.title,
                created_at: doc.created_at,
                updated_at: doc.updated_at,
                is_public: doc.is_public
            }, null, 2))
        }

        // Generate ZIP
        const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })

        return new Response(zipBuffer, {
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="textpad-export-${new Date().toISOString().split('T')[0]}.zip"`
            }
        })
    } catch (error) {
        console.error('Error in public export:', error)
        return new Response('Export failed', { status: 500 })
    }
}
