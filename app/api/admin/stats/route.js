import { sql } from '@vercel/postgres'
import { isAdmin } from '@/lib/auth/isAdmin'

export async function GET() {
  try {
    // Check if user is admin
    const admin = await isAdmin()
    if (!admin) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    // Get total documents count
    const docsResult = await sql.query(
      'SELECT COUNT(*) as count FROM documents'
    )
    const totalDocuments = parseInt(docsResult.rows[0].count)
    
    // Get documents by user
    const docsByUserResult = await sql.query(
      `SELECT 
        COALESCE(user_id, 'No user') as user_email,
        COUNT(*) as count
       FROM documents
       GROUP BY user_id
       ORDER BY count DESC`
    )
    
    // Get total unique users
    const usersResult = await sql.query(
      `SELECT COUNT(DISTINCT user_id) as count 
       FROM documents 
       WHERE user_id IS NOT NULL`
    )
    const totalUsers = parseInt(usersResult.rows[0].count)
    
    // Get total snapshots
    const snapshotsResult = await sql.query(
      'SELECT COUNT(*) as count FROM document_snapshots'
    )
    const totalSnapshots = parseInt(snapshotsResult.rows[0].count)
    
    // Get total events
    const eventsResult = await sql.query(
      'SELECT COUNT(*) as count FROM document_events'
    )
    const totalEvents = parseInt(eventsResult.rows[0].count)
    
    // Get recent documents (last 7 days)
    const recentDocsResult = await sql.query(
      `SELECT COUNT(*) as count 
       FROM documents 
       WHERE created_at > NOW() - INTERVAL '7 days'`
    )
    const recentDocuments = parseInt(recentDocsResult.rows[0].count)
    
    return Response.json({
      totalDocuments,
      totalUsers,
      totalSnapshots,
      totalEvents,
      recentDocuments,
      documentsByUser: docsByUserResult.rows
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
