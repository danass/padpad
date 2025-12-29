import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

// GET: Fetch paginated public articles
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
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

        // Get total count with filter
        const countResult = await sql.query(
            `SELECT COUNT(*) as total FROM documents d WHERE ${whereClause}`,
            queryParams
        )
        const total = parseInt(countResult.rows[0]?.total || 0)
        const totalPages = Math.ceil(total / limit)

        const result = await sql.query(
            `SELECT 
                d.id,
                d.title,
                d.created_at,
                d.updated_at,
                d.keywords,
                u.avatar_url as author_avatar,
                u.testament_username as author_username,
                COALESCE(u.archive_id, SUBSTRING(REPLACE(d.user_id::text, '-', ''), 1, 8)) as author_archive_id,
                s.content_json
            FROM documents d
            LEFT JOIN users u ON d.user_id = u.id
            LEFT JOIN document_snapshots s ON d.current_snapshot_id = s.id
            WHERE ${whereClause}
            ORDER BY d.updated_at DESC
            LIMIT $${paramCount++} OFFSET $${paramCount}`,
            [...queryParams, limit, offset]
        )

        // Get all available keywords for filter UI
        const allKeywordsResult = await sql.query(
            `SELECT DISTINCT unnest(keywords) as keyword 
             FROM documents 
             WHERE is_public = true 
             LIMIT 50`
        )
        const allKeywords = allKeywordsResult.rows.map(r => r.keyword).filter(Boolean).sort()

        const articles = result.rows.map(row => {
            let content = row.content_json
            if (content && typeof content === 'string') {
                try { content = JSON.parse(content) } catch (e) { }
            }
            return {
                ...row,
                content_json: content
            }
        })

        return NextResponse.json({
            articles,
            allKeywords,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            }
        })
    } catch (error) {
        console.error('Error fetching feed:', error)
        return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 })
    }
}
