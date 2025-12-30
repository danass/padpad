import { sql } from '@vercel/postgres'
import { getUserId } from './getSession'

export async function isAdmin() {
  try {
    const userId = await getUserId()
    if (!userId) {
      return false
    }

    // Check if user has admin role in users table
    const result = await sql.query(
      "SELECT id FROM users WHERE id = $1 AND role = 'admin'",
      [userId]
    )

    return result.rows.length > 0
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}




