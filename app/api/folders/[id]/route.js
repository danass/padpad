import { sql } from '@vercel/postgres'
import { getUserId } from '@/lib/auth/getSession'

export async function GET(request, { params }) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = await params
    
    // Get folder - if it has no user_id, assign it to current user
    let result = await sql.query(
      'SELECT * FROM folders WHERE id = $1',
      [id]
    )
    
    if (result.rows.length === 0) {
      return Response.json({ error: 'Folder not found' }, { status: 404 })
    }
    
    const folder = result.rows[0]
    
    // If folder has no user_id, assign it to current user (migration for old folders)
    if (!folder.user_id) {
      await sql.query(
        'UPDATE folders SET user_id = $1 WHERE id = $2',
        [userId, id]
      )
      folder.user_id = userId
    } else if (folder.user_id !== userId) {
      // Folder belongs to another user
      return Response.json({ error: 'Folder not found' }, { status: 404 })
    }
    
    // Get children folders
    const childrenResult = await sql.query(
      'SELECT * FROM folders WHERE parent_id = $1 AND user_id = $2 ORDER BY name ASC',
      [id, userId]
    )
    
    // Get documents in folder
    const documentsResult = await sql.query(
      'SELECT * FROM documents WHERE folder_id = $1 AND user_id = $2 ORDER BY updated_at DESC',
      [id, userId]
    )
    
    return Response.json({
      folder: folder,
      children: childrenResult.rows,
      documents: documentsResult.rows
    })
  } catch (error) {
    console.error('Error fetching folder:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = await params
    const body = await request.json()
    const { name, parent_id } = body
    
    const updates = []
    const values = []
    let paramCount = 1
    
    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`)
      values.push(name)
    }
    
    if (parent_id !== undefined) {
      updates.push(`parent_id = $${paramCount++}`)
      values.push(parent_id)
    }
    
    if (updates.length === 0) {
      return Response.json({ error: 'No fields to update' }, { status: 400 })
    }
    
    values.push(id, userId)
    
    const result = await sql.query(
      `UPDATE folders 
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
       RETURNING *`,
      values
    )
    
    if (result.rows.length === 0) {
      return Response.json({ error: 'Folder not found' }, { status: 404 })
    }
    
    return Response.json({ folder: result.rows[0] })
  } catch (error) {
    console.error('Error updating folder:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = await params
    
    const result = await sql.query(
      'DELETE FROM folders WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    )
    
    if (result.rows.length === 0) {
      return Response.json({ error: 'Folder not found' }, { status: 404 })
    }
    
    return Response.json({ success: true, id })
  } catch (error) {
    console.error('Error deleting folder:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

