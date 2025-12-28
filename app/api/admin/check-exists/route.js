import { sql } from '@vercel/postgres'

export async function GET() {
  try {
    // Check if admins table exists and has any records
    const result = await sql.query('SELECT COUNT(*) as count FROM admins')
    const count = parseInt(result.rows[0].count)
    return Response.json({ exists: count > 0, count })
  } catch (error) {
    // If table doesn't exist, return false
    if (error.message.includes('does not exist') || error.message.includes('relation')) {
      return Response.json({ exists: false, count: 0 })
    }
    console.error('Error checking admins:', error)
    return Response.json({ exists: false, count: 0 })
  }
}




