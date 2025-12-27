import { sql } from '@vercel/postgres'
import { getUserId } from './getSession'
import { isAdmin } from './isAdmin'

export async function isCurator() {
    try {
        // Admins are always curators
        if (await isAdmin()) {
            return true
        }

        const userId = await getUserId()
        if (!userId) {
            return false
        }

        // Check if user has curator role in users table
        const result = await sql.query(
            "SELECT role FROM users WHERE id = $1 AND role = 'curator'",
            [userId]
        )

        return result.rows.length > 0
    } catch (error) {
        console.error('Error checking curator status:', error)
        return false
    }
}
