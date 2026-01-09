import { sql } from '@vercel/postgres'
import { isAdmin } from '@/lib/auth/isAdmin'

export async function POST(request, { params }) {
  try {
    // Check if user is admin
    const admin = await isAdmin()
    if (!admin) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { email } = await params
    const body = await request.json()
    const { isAdmin: setAdmin, role } = body

    if (typeof setAdmin !== 'boolean') {
      return Response.json({ error: 'isAdmin must be a boolean' }, { status: 400 })
    }

    if (setAdmin) {
      // Update role to admin in users table
      await sql.query(
        "UPDATE users SET role = 'admin' WHERE id = $1",
        [email]
      )
    } else {
      // Update role to user in users table
      await sql.query(
        "UPDATE users SET role = 'user' WHERE id = $1",
        [email]
      )
    }

    // Explicitly update role if provided in body
    if (role !== undefined && role !== 'admin' && !setAdmin) {
      await sql.query(
        "UPDATE users SET role = $1 WHERE id = $2",
        [role, email]
      )
    }

    return Response.json({
      success: true,
      email,
      isAdmin: setAdmin,
      role
    })
  } catch (error) {
    console.error('Error setting admin status:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Permanently delete user and all their data
export async function DELETE(request, { params }) {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { email } = await params

    // Check if user exists
    const userResult = await sql.query('SELECT id, role FROM users WHERE id = $1', [email])
    if (userResult.rows.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent deleting admin accounts
    if (userResult.rows[0].role === 'admin') {
      return Response.json({ error: 'Cannot delete admin accounts' }, { status: 400 })
    }

    // Get all document IDs for this user (to delete snapshots)
    const docsResult = await sql.query(
      'SELECT id FROM documents WHERE user_id = $1',
      [email]
    )
    const docIds = docsResult.rows.map(d => d.id)

    let snapshotsDeleted = 0
    let documentsDeleted = 0
    let foldersDeleted = 0

    // Delete snapshots for all user documents
    if (docIds.length > 0) {
      const snapshotResult = await sql.query(
        `DELETE FROM document_snapshots WHERE document_id = ANY($1::uuid[])`,
        [docIds]
      )
      snapshotsDeleted = snapshotResult.rowCount
    }

    // Delete all documents
    const docDeleteResult = await sql.query(
      'DELETE FROM documents WHERE user_id = $1',
      [email]
    )
    documentsDeleted = docDeleteResult.rowCount

    // Delete all folders
    const folderDeleteResult = await sql.query(
      'DELETE FROM folders WHERE user_id = $1',
      [email]
    )
    foldersDeleted = folderDeleteResult.rowCount

    // Delete the user
    await sql.query('DELETE FROM users WHERE id = $1', [email])

    return Response.json({
      success: true,
      email,
      deleted: {
        snapshots: snapshotsDeleted,
        documents: documentsDeleted,
        folders: foldersDeleted
      }
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
