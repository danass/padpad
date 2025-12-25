import { sql } from '@vercel/postgres'
import Link from 'next/link'
import { replayHistory } from '@/lib/editor/history-replay'

export const dynamic = 'force-dynamic'

async function getFeaturedArticles(page = 1, limit = 20) {
    try {
        const offset = (page - 1) * limit

        const result = await sql.query(
            `SELECT d.*, u.testament_username, u.avatar_url, u.archive_id
             FROM documents d
             LEFT JOIN users u ON d.user_id = u.id
             WHERE d.is_featured = true AND d.is_public = true
             ORDER BY d.featured_at DESC NULLS LAST, d.updated_at DESC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        )

        const countResult = await sql.query(
            `SELECT COUNT(*) as total FROM documents WHERE is_featured = true AND is_public = true`
        )
        const total = parseInt(countResult.rows[0].total)

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
                updatedAt: doc.updated_at,
                featuredAt: doc.featured_at,
                author: {
                    username: doc.testament_username,
                    avatarUrl: doc.avatar_url,
                    archiveId: doc.archive_id,
                },
            }
        }))

        return {
            articles,
            total,
            totalPages: Math.ceil(total / limit)
        }
    } catch (error) {
        console.error('Error fetching featured:', error)
        return { articles: [], total: 0, totalPages: 0 }
    }
}

export default async function FeaturedPage({ searchParams }) {
    const params = await searchParams
    const page = parseInt(params?.page || '1')
    const { articles, totalPages } = await getFeaturedArticles(page)

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-6 py-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Home
                    </Link>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Featured</h1>
                </div>
            </header>

            {/* Articles Grid */}
            <main className="max-w-6xl mx-auto px-6 py-12">
                {articles.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-gray-500 text-lg">No featured articles yet.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {articles.map((article) => (
                                <Link
                                    key={article.id}
                                    href={`/public/doc/${article.id}`}
                                    className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all"
                                >
                                    {/* Image */}
                                    {article.firstImage && (
                                        <div className="aspect-video bg-gray-50 overflow-hidden">
                                            <img
                                                src={article.firstImage}
                                                alt={article.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="p-5">
                                        {/* Author */}
                                        {(article.author?.username || article.author?.archiveId) && (
                                            <div className="flex items-center gap-2 mb-3">
                                                {article.author.avatarUrl ? (
                                                    <img
                                                        src={article.author.avatarUrl}
                                                        alt={article.author.username || article.author.archiveId}
                                                        className="w-6 h-6 rounded-full"
                                                    />
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <span className="text-xs text-gray-500">
                                                            {(article.author.username || article.author.archiveId || '?').charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                                <span className="text-sm text-gray-500">@{article.author.username || article.author.archiveId}</span>
                                            </div>
                                        )}

                                        {/* Title */}
                                        <h2 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                            {article.title}
                                        </h2>

                                        {/* Preview text */}
                                        {article.textPreview && (
                                            <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                                                {article.textPreview}
                                            </p>
                                        )}

                                        {/* Date */}
                                        <p className="text-xs text-gray-400">
                                            {new Date(article.featuredAt || article.updatedAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-12">
                                <Link
                                    href={`/featured?page=${Math.max(1, page - 1)}`}
                                    className={`px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 ${page === 1 ? 'opacity-50 pointer-events-none' : ''}`}
                                >
                                    Previous
                                </Link>
                                <span className="px-4 py-2 text-gray-600">
                                    Page {page} of {totalPages}
                                </span>
                                <Link
                                    href={`/featured?page=${Math.min(totalPages, page + 1)}`}
                                    className={`px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 ${page === totalPages ? 'opacity-50 pointer-events-none' : ''}`}
                                >
                                    Next
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}
