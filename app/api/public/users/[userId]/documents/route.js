import { sql } from '@vercel/postgres'

export async function GET(request, { params }) {
  try {
    const { userId } = await params
    
    if (!userId) {
      return Response.json({ error: 'User ID required' }, { status: 400 })
    }
    
    // The userId param can be:
    // 1. A testament_username (alphanumeric with hyphens/underscores)
    // 2. A short hash (first 8 chars of UUID)
    // 3. A full UUID
    
    let actualUserId = null
    let username = null
    
    // Check if it's a UUID format (full or short)
    const isUUIDish = /^[0-9a-f-]+$/i.test(userId)
    
    if (!isUUIDish) {
      // It's likely a testament_username, look it up
      const userResult = await sql.query(
        'SELECT id, testament_username FROM users WHERE testament_username = $1',
        [userId]
      )
      if (userResult.rows.length > 0) {
        actualUserId = userResult.rows[0].id
        username = userResult.rows[0].testament_username
      }
    }
    
    // If not found by username, try by user_id prefix or full id
    if (!actualUserId) {
      // Try to find user by ID prefix (short hash) or full ID
      const userResult = await sql.query(
        'SELECT id, testament_username FROM users WHERE id LIKE $1 OR id = $2',
        [`${userId}%`, userId]
      )
      if (userResult.rows.length > 0) {
        actualUserId = userResult.rows[0].id
        username = userResult.rows[0].testament_username
      } else {
        // User might exist only in documents table (no users entry yet)
        // Try to get documents directly
        const docCheck = await sql.query(
          'SELECT DISTINCT user_id FROM documents WHERE user_id LIKE $1 OR user_id = $2 LIMIT 1',
          [`${userId}%`, userId]
        )
        if (docCheck.rows.length > 0) {
          actualUserId = docCheck.rows[0].user_id
        }
      }
    }
    
    if (!actualUserId) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Get all public documents for this user
    const result = await sql.query(
      `SELECT 
        d.id,
        d.title,
        d.created_at,
        d.updated_at
       FROM documents d
       WHERE d.user_id = $1 
         AND d.is_public = true
       ORDER BY d.updated_at DESC`,
      [actualUserId]
    )
    
    return Response.json({ 
      documents: result.rows.map(doc => ({
        ...doc,
        title: (doc.title === 'Untitled' || !doc.title) ? '' : doc.title
      })),
      username
    })
  } catch (error) {
    console.error('Error fetching public documents:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

