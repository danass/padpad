import { sql } from '@vercel/postgres'

export async function GET(request, { params }) {
  try {
    const { slug } = await params
    
    // Find user by testament_username first, then by testament_slug
    let userResult = await sql.query(
      'SELECT id, birth_date FROM users WHERE testament_username = $1',
      [slug]
    )
    
    // If not found by username, try by slug
    if (userResult.rows.length === 0) {
      userResult = await sql.query(
        'SELECT id, birth_date FROM users WHERE testament_slug = $1',
        [slug]
      )
    }
    
    if (userResult.rows.length === 0) {
      return Response.json({ error: 'Testament not found' }, { status: 404 })
    }
    
    const user = userResult.rows[0]
    
    // Check if user is 99 years old or older
    let shouldBePublic = false
    let age99Date = null
    if (user.birth_date) {
      const birth = new Date(user.birth_date)
      const age99 = new Date(birth)
      age99.setFullYear(birth.getFullYear() + 99)
      age99Date = age99
      
      // Check if user has reached 99 years old
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const age99DateOnly = new Date(age99)
      age99DateOnly.setHours(0, 0, 0, 0)
      
      if (today >= age99DateOnly) {
        shouldBePublic = true
        
        // Automatically publish all documents if user is 99 or older
        await sql.query(
          `UPDATE documents 
           SET is_public = TRUE 
           WHERE user_id = $1 AND is_public = FALSE`,
          [user.id]
        )
      } else {
        // User is less than 99 years old - make documents private
        // This ensures testament is only accessible when user is 99+
        shouldBePublic = false
        
        // Make all documents private if user is less than 99
        await sql.query(
          `UPDATE documents 
           SET is_public = FALSE 
           WHERE user_id = $1 AND is_public = TRUE`,
          [user.id]
        )
      }
    }
    
    // Get all public documents for this user
    // Only show documents if user is 99 or older
    const docsResult = await sql.query(
      `SELECT id, title, created_at, updated_at, content_text
       FROM documents 
       WHERE user_id = $1 AND is_public = TRUE
       ORDER BY updated_at DESC`,
      [user.id]
    )
    
    return Response.json({
      user: {
        id: user.id,
        birth_date: user.birth_date
      },
      documents: docsResult.rows,
      age99Date: age99Date?.toISOString() || null
    })
  } catch (error) {
    console.error('Error fetching public testament:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

