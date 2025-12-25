import { sql } from '@vercel/postgres'
import { replayHistory } from '@/lib/editor/history-replay'

// Get featured articles for public display
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '8')
        const page = parseInt(searchParams.get('page') || '1')
        const offset = (page - 1) * limit

        // Get featured public documents
        const result = await sql.query(
            `SELECT d.*, u.testament_username, u.avatar_url
       FROM documents d
       LEFT JOIN users u ON d.user_id = u.id
       WHERE d.is_featured = true AND d.is_public = true
       ORDER BY d.featured_at DESC NULLS LAST, d.updated_at DESC
       LIMIT $1 OFFSET $2`,
            [limit, offset]
        )

        // Get total count
        const countResult = await sql.query(
            `SELECT COUNT(*) as total FROM documents WHERE is_featured = true AND is_public = true`
        )
        const total = parseInt(countResult.rows[0].total)

        // For each document, get content
        const documents = await Promise.all(result.rows.map(async (doc) => {
            // Get latest snapshot
            const snapshotResult = await sql.query(
                `SELECT * FROM document_snapshots 
         WHERE document_id = $1 
         ORDER BY created_at DESC 
         LIMIT 1`,
                [doc.id]
            )

            let content = null
            let firstImage = null

            if (snapshotResult.rows.length > 0) {
                let snapshot = snapshotResult.rows[0]
                if (snapshot.content_json && typeof snapshot.content_json === 'string') {
                    try {
                        snapshot.content_json = JSON.parse(snapshot.content_json)
                    } catch (e) { }
                }
                content = snapshot.content_json || replayHistory(snapshot, [])

                // Extract first image from content (including drawings)
                if (content && content.content) {
                    for (const node of content.content) {
                        if (node.type === 'image' && node.attrs && node.attrs.src) {
                            firstImage = node.attrs.src
                            break
                        }
                        // Check for drawing nodes - they store paths as SVG data
                        if (node.type === 'drawing' && node.attrs && node.attrs.paths && node.attrs.paths.length > 0) {
                            // Generate a data URL from the drawing paths
                            const width = node.attrs.width || 400
                            const height = node.attrs.height || 300
                            const pathsData = node.attrs.paths.map(p =>
                                `<path d="${p.d}" stroke="${p.color || '#000'}" stroke-width="${p.strokeWidth || 2}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
                            ).join('')
                            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${pathsData}</svg>`
                            firstImage = `data:image/svg+xml,${encodeURIComponent(svg)}`
                            break
                        }
                        // Check nested content for images
                        if (node.content) {
                            for (const child of node.content) {
                                if (child.type === 'image' && child.attrs && child.attrs.src) {
                                    firstImage = child.attrs.src
                                    break
                                }
                            }
                            if (firstImage) break
                        }
                    }
                }
            }

            // Extract text preview
            let textPreview = ''
            if (content && content.content) {
                for (const node of content.content) {
                    if ((node.type === 'paragraph' || node.type === 'heading') && node.content) {
                        for (const child of node.content) {
                            if (child.type === 'text') {
                                textPreview += child.text + ' '
                            }
                        }
                    }
                    if (textPreview.length > 200) break
                }
            }

            return {
                id: doc.id,
                title: doc.title || 'Untitled',
                content: content,
                textPreview: textPreview.trim().substring(0, 200),
                firstImage,
                createdAt: doc.created_at,
                updatedAt: doc.updated_at,
                featuredAt: doc.featured_at,
                author: {
                    username: doc.testament_username,
                    avatarUrl: doc.avatar_url,
                },
            }
        }))

        return Response.json({
            documents,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        })
    } catch (error) {
        console.error('Error fetching featured articles:', error)
        return Response.json({ error: error.message }, { status: 500 })
    }
}
