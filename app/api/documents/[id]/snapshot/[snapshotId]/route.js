import { sql } from '@vercel/postgres'
import { getUserId } from '@/lib/auth/getSession'
import { isAdmin } from '@/lib/auth/isAdmin'

export async function DELETE(request, { params }) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id, snapshotId } = await params
    const admin = await isAdmin()
    
    // Verify document exists and user owns it
    const docCheck = await sql.query(
      'SELECT id, user_id FROM documents WHERE id = $1',
      [id]
    )
    
    if (docCheck.rows.length === 0) {
      return Response.json({ error: 'Document not found' }, { status: 404 })
    }
    
    const doc = docCheck.rows[0]
    if (doc.user_id !== userId && !admin) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    // Verify snapshot belongs to this document
    const snapshotCheck = await sql.query(
      'SELECT id, document_id FROM document_snapshots WHERE id = $1 AND document_id = $2',
      [snapshotId, id]
    )
    
    if (snapshotCheck.rows.length === 0) {
      return Response.json({ error: 'Snapshot not found' }, { status: 404 })
    }
    
    // Delete the snapshot
    await sql.query(
      'DELETE FROM document_snapshots WHERE id = $1',
      [snapshotId]
    )
    
    // If this was the current_snapshot_id, update document to point to most recent snapshot
    if (doc.current_snapshot_id === snapshotId) {
      const latestSnapshot = await sql.query(
        `SELECT id FROM document_snapshots 
         WHERE document_id = $1 
         ORDER BY created_at DESC 
         LIMIT 1`,
        [id]
      )
      
      const newSnapshotId = latestSnapshot.rows.length > 0 ? latestSnapshot.rows[0].id : null
      
      await sql.query(
        'UPDATE documents SET current_snapshot_id = $1 WHERE id = $2',
        [newSnapshotId, id]
      )
    }
    
    return Response.json({ success: true, message: 'Snapshot deleted' })
  } catch (error) {
    console.error('Error deleting snapshot:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}


