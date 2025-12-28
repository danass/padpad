import { sql } from '@vercel/postgres'
import { getUserId } from '@/lib/auth/getSession'
import { generateArchiveId } from '@/lib/utils/archive-id'

export async function GET() {
  try {
    const userId = await getUserId()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await sql.query(
      'SELECT birth_date FROM users WHERE id = $1',
      [userId]
    )

    if (result.rows.length === 0) {
      return Response.json({ birth_date: null })
    }

    return Response.json({ birth_date: result.rows[0].birth_date })
  } catch (error) {
    console.error('Error fetching birth date:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { birth_date } = body

    // Allow null to clear birth date (disable Digital Legacy)
    if (birth_date !== null && birth_date !== undefined) {
      // Validate date format if provided
      const date = new Date(birth_date)
      if (isNaN(date.getTime())) {
        return Response.json({ error: 'Invalid date format' }, { status: 400 })
      }
    }

    // Insert or update user - use random archive_id for privacy
    const archiveId = generateArchiveId()
    const result = await sql.query(
      `INSERT INTO users (id, birth_date, archive_id, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (id) 
       DO UPDATE SET birth_date = $2, updated_at = NOW()
       RETURNING birth_date`,
      [userId, birth_date, archiveId]
    )

    return Response.json({ birth_date: result.rows[0].birth_date })
  } catch (error) {
    console.error('Error updating birth date:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}





