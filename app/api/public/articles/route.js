import { sql } from '@vercel/postgres'
import { replayHistory } from '@/lib/editor/history-replay'

// Get public articles with optional keyword filtering and pagination
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '8')
        const keyword = searchParams.get('keyword')?.toLowerCase().trim() || null
        const offset = (page - 1) * limit

        // Build query with optional keyword filter
        let whereClause = 'd.is_public = true'
        const queryParams = []
        let paramCount = 1

        if (keyword) {
            whereClause += ` AND $${paramCount++} = ANY(d.keywords)`
            queryParams.push(keyword)
        }

        // Get articles
        const result = await sql.query(
            `SELECT d.*, u.testament_username, u.avatar_url, u.archive_id
       FROM documents d
       LEFT JOIN users u ON d.user_id = u.id
       WHERE ${whereClause}
       ORDER BY d.updated_at DESC
       LIMIT $${paramCount++} OFFSET $${paramCount}`,
            [...queryParams, limit, offset]
        )

        // Get total count
        const countResult = await sql.query(
            `SELECT COUNT(*) as total FROM documents d WHERE ${whereClause}`,
            queryParams
        )
        const total = parseInt(countResult.rows[0].total)

        // Get all unique keywords from public documents
        const keywordsResult = await sql.query(
            `SELECT DISTINCT unnest(keywords) as keyword 
       FROM documents 
       WHERE is_public = true AND keywords IS NOT NULL
       ORDER BY keyword`
        )
        const allKeywords = keywordsResult.rows.map(r => r.keyword)

        // Process articles to add preview data
        const articles = await Promise.all(result.rows.map(async (doc) => {
            const snapshotResult = await sql.query(
                `SELECT * FROM document_snapshots 
         WHERE document_id = $1 
         ORDER BY created_at DESC 
         LIMIT 1`,
                [doc.id]
            )

            let firstImage = null
            let textPreview = ''

            if (snapshotResult.rows.length > 0) {
                let snapshot = snapshotResult.rows[0]
                if (snapshot.content_json && typeof snapshot.content_json === 'string') {
                    try { snapshot.content_json = JSON.parse(snapshot.content_json) } catch (e) { }
                }
                const content = snapshot.content_json || replayHistory(snapshot, [])

                // Extract first image
                if (content && content.content) {
                    for (const node of content.content) {
                        if (node.type === 'image' && node.attrs && node.attrs.src) {
                            firstImage = node.attrs.src
                            break
                        }
                        if (node.type === 'drawing' && node.attrs && node.attrs.paths && node.attrs.paths.length > 0) {
                            const width = node.attrs.width || 400
                            const height = node.attrs.height || 300
                            const pathsData = node.attrs.paths.map(p =>
                                `<path d="${p.d}" stroke="${p.color || '#000'}" stroke-width="${p.strokeWidth || 2}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
                            ).join('')
                            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${pathsData}</svg>`
                            firstImage = `data:image/svg+xml,${encodeURIComponent(svg)}`
                            break
                        }
                    }

                    // Extract text preview
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
            }

            return {
                id: doc.id,
                title: doc.title || 'Untitled',
                textPreview: textPreview.trim().substring(0, 200),
                firstImage,
                keywords: doc.keywords || [],
                updatedAt: doc.updated_at,
                author: {
                    username: doc.testament_username,
                    avatarUrl: doc.avatar_url,
                    archiveId: doc.archive_id || (doc.user_id ? doc.user_id.replace(/-/g, '').substring(0, 8) : null),
                },
            }
        }))

        return Response.json({
            articles,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            allKeywords,
            currentKeyword: keyword,
        })
    } catch (error) {
        console.error('Error fetching public articles:', error)
        return Response.json({ error: error.message }, { status: 500 })
    }
}
