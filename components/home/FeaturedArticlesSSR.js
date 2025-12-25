import { sql } from '@vercel/postgres'
import Link from 'next/link'
import { replayHistory } from '@/lib/editor/history-replay'
import FeaturedArticleRenderer from './FeaturedArticleRenderer'

// Server-side fetch of featured articles
async function getFeaturedArticles() {
    try {
        const result = await sql.query(
            `SELECT d.*, u.testament_username, u.avatar_url
       FROM documents d
       LEFT JOIN users u ON d.user_id = u.id
       WHERE d.is_featured = true AND d.is_public = true
       ORDER BY d.featured_at DESC NULLS LAST, d.updated_at DESC
       LIMIT 8`
        )

        const articles = await Promise.all(result.rows.map(async (doc) => {
            // Get content
            const snapshotResult = await sql.query(
                `SELECT * FROM document_snapshots 
         WHERE document_id = $1 
         ORDER BY created_at DESC 
         LIMIT 1`,
                [doc.id]
            )

            let content = null
            if (snapshotResult.rows.length > 0) {
                let snapshot = snapshotResult.rows[0]
                if (snapshot.content_json && typeof snapshot.content_json === 'string') {
                    try { snapshot.content_json = JSON.parse(snapshot.content_json) } catch (e) { }
                }
                content = snapshot.content_json || replayHistory(snapshot, [])
            }

            return {
                id: doc.id,
                title: doc.title || 'Untitled',
                content,
                updatedAt: doc.updated_at,
                featuredAt: doc.featured_at,
                author: {
                    username: doc.testament_username,
                    avatarUrl: doc.avatar_url,
                },
            }
        }))

        return articles
    } catch (error) {
        console.error('Error fetching featured:', error)
        return []
    }
}

export default async function FeaturedArticlesSSR() {
    const articles = await getFeaturedArticles()

    if (articles.length === 0) return null

    return (
        <section className="mt-16 border-t border-gray-200 pt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured</h2>

            <div className="space-y-12">
                {articles.map((article) => (
                    <article key={article.id} className="border-b border-gray-100 pb-10 last:border-none">
                        {/* Header */}
                        <div className="mb-4">
                            {article.author?.username && (
                                <div className="flex items-center gap-2 mb-3">
                                    {article.author.avatarUrl ? (
                                        <img src={article.author.avatarUrl} alt="" className="w-8 h-8 rounded-full" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                            <span className="text-sm text-gray-500">{article.author.username.charAt(0).toUpperCase()}</span>
                                        </div>
                                    )}
                                    <span className="text-sm text-gray-600">@{article.author.username}</span>
                                    <span className="text-gray-300">·</span>
                                    <span className="text-sm text-gray-400">
                                        {new Date(article.featuredAt || article.updatedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                            <Link href={`/public/doc/${article.id}`}>
                                <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                                    {article.title}
                                </h3>
                            </Link>
                        </div>

                        {/* Full content - rendered client-side */}
                        {article.content && (
                            <div className="prose max-w-none text-gray-700">
                                <FeaturedArticleRenderer content={article.content} />
                            </div>
                        )}
                    </article>
                ))}
            </div>
        </section>
    )
}
