import { sql } from '@vercel/postgres'

/**
 * This endpoint should be called daily (via cron job) to automatically
 * publish documents when the user reaches 99 years old
 */
export async function POST(request) {
  try {
    // Optional: Add a secret token for security
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.TESTAMENT_CRON_SECRET
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Find all users who turn 99 today
    const usersResult = await sql.query(
      `SELECT id, birth_date 
       FROM users 
       WHERE birth_date IS NOT NULL
         AND EXTRACT(YEAR FROM AGE(birth_date)) = 99
         AND EXTRACT(MONTH FROM birth_date) = EXTRACT(MONTH FROM CURRENT_DATE)
         AND EXTRACT(DAY FROM birth_date) = EXTRACT(DAY FROM CURRENT_DATE)`
    )
    
    const publishedDocs = []
    
    for (const user of usersResult.rows) {
      // Find ALL documents for this user (they all become public on 99th birthday)
      const docsResult = await sql.query(
        `SELECT id, title 
         FROM documents 
         WHERE user_id = $1 
           AND is_public = FALSE`,
        [user.id]
      )
      
      // Publish all documents
      for (const doc of docsResult.rows) {
        await sql.query(
          'UPDATE documents SET is_public = TRUE WHERE id = $1',
          [doc.id]
        )
        publishedDocs.push({
          document_id: doc.id,
          title: doc.title,
          user_id: user.id
        })
      }
    }
    
    return Response.json({ 
      success: true,
      published_count: publishedDocs.length,
      published_documents: publishedDocs
    })
  } catch (error) {
    console.error('Error in auto-publish cron:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}




