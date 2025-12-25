import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

// GET: Fetch paginated public articles
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const offset = (page - 1) * limit

        // Get total count of public documents
        const countResult = await sql`
            SELECT COUNT(*) as total 
            FROM documents 
            WHERE is_public = true
        `
        const total = parseInt(countResult.rows[0]?.total || 0)
        const totalPages = Math.ceil(total / limit)

        // Get paginated public documents with author info
        const result = await sql`
            SELECT 
                d.id,
                d.title,
                d.created_at,
                d.updated_at,
                u.name as author_name,
                u.avatar_url as author_avatar,
                u.testament_username as author_username
            FROM documents d
            LEFT JOIN users u ON d.user_id = u.id
            WHERE d.is_public = true
            ORDER BY d.updated_at DESC
            LIMIT ${limit} OFFSET ${offset}
        `

        return NextResponse.json({
            articles: result.rows,
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
