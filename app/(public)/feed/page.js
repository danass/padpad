import { sql } from '@vercel/postgres'
import { cache } from 'react'
import FeedClient from './FeedClient'

export const dynamic = 'force-dynamic'

export const metadata = {
    title: 'Feed | TextPad',
    description: 'Discover latest public documents on TextPad.',
    alternates: {
        canonical: '/feed',
    },
}

const getFeedData = cache(async (page = 1, limit = 10) => {
    try {
        const offset = (page - 1) * limit

        // Get total count
        const countResult = await sql`
            SELECT COUNT(*) as total 
            FROM documents 
            WHERE is_public = true
        `
        const total = parseInt(countResult.rows[0]?.total || 0)
        const totalPages = Math.ceil(total / limit)

        const result = await sql`
            SELECT 
                d.id,
                d.title,
                d.created_at,
                d.updated_at,
                u.avatar_url as author_avatar,
                u.testament_username as author_username,
                s.content_json
            FROM documents d
            LEFT JOIN users u ON d.user_id = u.id
            LEFT JOIN document_snapshots s ON d.current_snapshot_id = s.id
            WHERE d.is_public = true
            ORDER BY d.updated_at DESC
            LIMIT ${limit} OFFSET ${offset}
        `

        return {
            articles: result.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            }
        }
    } catch (error) {
        console.error('Error fetching feed data:', error)
        return { articles: [], pagination: null }
    }
})

export default async function FeedPage() {
    const initialData = await getFeedData(1, 10)
    return <FeedClient initialData={initialData} />
}
