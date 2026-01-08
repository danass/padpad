import { sql } from '@vercel/postgres'
import Link from 'next/link'
import { replayHistory } from '@/lib/editor/history-replay'
import FeaturedClient from './FeaturedClient'

export const metadata = {
    title: 'Featured | Textpad',
    description: 'Explore the best public documents and articles curated by the Textpad community.',
    alternates: {
        canonical: '/featured',
    },
}

export const dynamic = 'force-dynamic'

async function getFeaturedArticles(page = 1, limit = 8, keyword = null) {
    try {
        const offset = (page - 1) * limit

        // Build query with optional keyword filter
        let whereClause = 'd.is_featured = true AND d.is_public = true'
        const queryParams = []
        let paramCount = 1

        if (keyword) {
            whereClause += ` AND $${paramCount++} = ANY(d.keywords)`
            queryParams.push(keyword.toLowerCase().trim())
        }

        const result = await sql.query(
            `SELECT d.*, u.testament_username, u.avatar_url, u.archive_id
             FROM documents d
             LEFT JOIN users u ON d.user_id = u.id
             WHERE ${whereClause}
             ORDER BY d.featured_at DESC NULLS LAST, d.updated_at DESC
             LIMIT $${paramCount++} OFFSET $${paramCount}`,
            [...queryParams, limit, offset]
        )

        const countResult = await sql.query(
            `SELECT COUNT(*) as total FROM documents d WHERE ${whereClause}`,
            queryParams
        )
        const total = parseInt(countResult.rows[0].total)

        // Get all unique keywords from featured public documents
        const keywordsResult = await sql.query(
            `SELECT DISTINCT unnest(keywords) as keyword 
             FROM documents 
             WHERE is_featured = true AND is_public = true AND keywords IS NOT NULL
             ORDER BY keyword`
        )
        const allKeywords = keywordsResult.rows.map(r => r.keyword)

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

                // Prioritize IPFS if enabled
                if (doc.ipfs_enabled && doc.ipfs_cid) {
                    try {
                        const gatewayUrl = `https://ipfs.filebase.io/ipfs/${doc.ipfs_cid}`
                        const ipfsResponse = await fetch(gatewayUrl)
                        if (ipfsResponse.ok) {
                            snapshot.content_json = await ipfsResponse.json()
                        }
                    } catch (ipfsError) {
                        console.error(`Error fetching from IPFS for featured doc ${doc.id}:`, ipfsError)
                    }
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
                featuredAt: doc.featured_at,
                author: {
                    username: doc.testament_username,
                    avatarUrl: doc.avatar_url,
                    // Use archive_id or first 8 chars of user_id (without dashes) as fallback
                    archive_id: doc.archive_id || (doc.user_id ? doc.user_id.replace(/-/g, '').substring(0, 8) : null),
                },
            }
        }))

        return {
            articles,
            allKeywords,
            total,
            totalPages: Math.ceil(total / limit),
            dbError: false
        }
    } catch (error) {
        console.error('Error fetching featured:', error)
        return { articles: [], total: 0, totalPages: 0, dbError: true }
    }
}

export default async function FeaturedPage({ searchParams }) {
    const params = await searchParams
    const page = parseInt(params?.page || '1')
    const keyword = params?.keyword || null
    const { articles, allKeywords, totalPages, dbError } = await getFeaturedArticles(page, 8, keyword)

    // Show error message if database is unavailable
    if (dbError) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md text-center p-8">
                    <div className="text-6xl mb-4">🔧</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Service temporarily unavailable</h1>
                    <p className="text-gray-600 mb-6">
                        We&apos;ve reached our database limit for this month. The service will be restored soon.
                    </p>
                    <a href="/" className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                        Go to Home
                    </a>
                </div>
            </div>
        )
    }

    return (
        <FeaturedClient
            articles={articles}
            allKeywords={allKeywords}
            totalPages={totalPages}
            page={page}
            keyword={keyword}
        />
    )
}
