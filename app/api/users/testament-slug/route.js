import { sql } from '@vercel/postgres'
import { getUserId } from '@/lib/auth/getSession'
import crypto from 'crypto'

export async function GET() {
  try {
    const userId = await getUserId()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await sql.query(
      'SELECT testament_username, testament_slug FROM users WHERE id = $1',
      [userId]
    )

    if (result.rows.length === 0) {
      // User doesn't exist, create one with a slug and archive_id
      const slug = generateSlug(userId)
      const archiveId = userId.replace(/-/g, '').substring(0, 8)
      await sql.query(
        `INSERT INTO users (id, testament_slug, archive_id, updated_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (id) 
         DO UPDATE SET testament_slug = COALESCE(users.testament_slug, $2), updated_at = NOW()
         RETURNING testament_username, testament_slug`,
        [userId, slug, archiveId]
      )
      return Response.json({ testament_slug: slug, testament_username: null })
    }

    const user = result.rows[0]
    let slug = user.testament_slug

    // Generate slug if it doesn't exist
    if (!slug) {
      slug = generateSlug(userId)
      await sql.query(
        'UPDATE users SET testament_slug = $1, updated_at = NOW() WHERE id = $2',
        [slug, userId]
      )
    }

    // Return username if exists, otherwise slug
    return Response.json({
      testament_slug: user.testament_username || slug,
      testament_username: user.testament_username || null
    })
  } catch (error) {
    console.error('Error fetching testament slug:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

function generateSlug(userId) {
  // Generate a unique slug based on user ID
  const hash = crypto.createHash('sha256').update(userId).digest('hex')
  return hash.substring(0, 16)
}

