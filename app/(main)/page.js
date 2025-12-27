import { sql } from '@vercel/postgres'
import { replayHistory } from '@/lib/editor/history-replay'
import HomeClient from './HomeClient'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getFeaturedArticles() {
    try {
        const result = await sql.query(
            `SELECT d.*, u.testament_username, u.avatar_url, u.archive_id
             FROM documents d
             LEFT JOIN users u ON d.user_id = u.id
             WHERE d.is_featured = true AND d.is_public = true
             ORDER BY d.featured_at DESC NULLS LAST, d.updated_at DESC
             LIMIT 8`
        )

        const articles = await Promise.all(result.rows.map(async (doc) => {
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
                updatedAt: doc.updated_at?.toISOString() || null,
                featuredAt: doc.featured_at?.toISOString() || null,
                isFullWidth: doc.is_full_width || false,
                showTitle: doc.show_title !== false, // Default to true if not set
                author: {
                    username: doc.testament_username,
                    avatarUrl: doc.avatar_url,
                    archiveId: doc.archive_id || (doc.user_id ? doc.user_id.replace(/-/g, '').substring(0, 8) : null),
                },
            }
        }))

        return { articles, dbError: false }
    } catch (error) {
        console.error('Error fetching featured:', error)
        return { articles: [], dbError: true }
    }
}

// DB Error component
function DBErrorPage() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="max-w-md text-center p-8">
                <img src="/padpad.png" alt="Textpad" className="w-24 h-24 mx-auto mb-6 opacity-50" />
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Service temporarily unavailable</h1>
                <p className="text-gray-600 mb-6">
                    We&apos;ve reached our database limit for this month. The service will be restored soon.
                </p>
                <p className="text-sm text-gray-400 mb-6">
                    Thank you for your patience. Limits reset on the 1st of each month.
                </p>
                <Link
                    href="/"
                    className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                    Try Again
                </Link>
            </div>
        </div>
    )
}

export default async function HomePage() {
    const { articles, dbError } = await getFeaturedArticles()

    if (dbError) {
        return <DBErrorPage />
    }

    return <HomeClient featuredArticles={articles} />
}
