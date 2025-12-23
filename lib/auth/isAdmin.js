import { sql } from '@vercel/postgres'
import { getUserId } from './getSession'

export async function isAdmin() {
  try {
    const userId = await getUserId()
    if (!userId) {
      return false
    }
    
    // Check if user is in admins table
    const result = await sql.query(
      'SELECT id FROM admins WHERE email = $1',
      [userId]
    )
    
    return result.rows.length > 0
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}
