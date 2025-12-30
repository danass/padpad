import { sql } from '@vercel/postgres'

export async function GET() {
  try {
    // Check if any users have the 'admin' role
    const result = await sql.query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'")
    const count = parseInt(result.rows[0].count)
    return Response.json({ exists: count > 0, count })
  } catch (error) {
    console.error('Error checking admins:', error)
    return Response.json({ exists: false, count: 0 })
  }
}




