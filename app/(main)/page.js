import { sql } from '@vercel/postgres'
import { replayHistory } from '@/lib/editor/history-replay'
import HomeClient from './HomeClient'

export const dynamic = 'force-dynamic'

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

export default async function HomePage() {
    const featuredArticles = await getFeaturedArticles()
    return <HomeClient featuredArticles={featuredArticles} />
}
