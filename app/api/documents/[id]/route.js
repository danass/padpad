import { sql } from '@vercel/postgres'
import { getUserId } from '@/lib/auth/getSession'
import { isAdmin } from '@/lib/auth/isAdmin'

export async function GET(request, { params }) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { isCurator } = require('@/lib/auth/isCurator')
    const admin = await isAdmin()
    const curator = await isCurator()

    // Get document - if it has no user_id, assign it to current user
    let docResult = await sql.query(
      'SELECT * FROM documents WHERE id = $1',
      [id]
    )

    if (docResult.rows.length === 0) {
      return Response.json({ error: 'Document not found' }, { status: 404 })
    }

    const document = docResult.rows[0]

    // If document has no user_id, assign it to current user (migration for old documents)
    // Use atomic UPDATE with WHERE user_id IS NULL to prevent race conditions
    if (!document.user_id) {
      const updateResult = await sql.query(
        'UPDATE documents SET user_id = $1 WHERE id = $2 AND user_id IS NULL RETURNING user_id',
        [userId, id]
      )
      if (updateResult.rows.length > 0) {
        document.user_id = updateResult.rows[0].user_id
      } else {
        // Another user already claimed it, re-fetch to get current owner
        const recheck = await sql.query(
          'SELECT user_id FROM documents WHERE id = $1',
          [id]
        )
        if (recheck.rows.length > 0) {
          document.user_id = recheck.rows[0].user_id
        }
      }
    }

    if (document.user_id && document.user_id !== userId && !admin && !curator) {
      // Document belongs to another user - only admins/curators can access
      return Response.json({ error: 'Document not found' }, { status: 404 })
    }

    // Always get the most recent snapshot (it's the source of truth)
    // Don't rely on current_snapshot_id which might be outdated
    const latestSnapshotResult = await sql.query(
      `SELECT * FROM document_snapshots 
       WHERE document_id = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [id]
    )

    let snapshot = null
    if (latestSnapshotResult.rows.length > 0) {
      snapshot = latestSnapshotResult.rows[0]
    } else if (document.current_snapshot_id) {
      // Fallback to current_snapshot_id if no snapshots found
      const snapshotResult = await sql.query(
        'SELECT * FROM document_snapshots WHERE id = $1',
        [document.current_snapshot_id]
      )
      if (snapshotResult.rows.length > 0) {
        snapshot = snapshotResult.rows[0]
      }
    }

    // If IPFS is enabled, we try to fetch from IPFS for the content_json
    if (document.ipfs_enabled && document.ipfs_cid) {
      try {
        const gatewayUrl = `https://ipfs.filebase.io/ipfs/${document.ipfs_cid}`
        const ipfsResponse = await fetch(gatewayUrl)
        if (ipfsResponse.ok) {
          const ipfsContent = await ipfsResponse.json()
          if (snapshot) {
            snapshot.content_json = ipfsContent
          } else {
            snapshot = {
              document_id: id,
              content_json: ipfsContent,
              content_text: '', // Text might be outdated but JSON is truth
              created_at: new Date().toISOString()
            }
          }
        }
      } catch (ipfsError) {
        console.error('Error fetching from IPFS:', ipfsError)
        // Fallback to local snapshot if IPFS fails
      }
    }

    // Parse content_json if it's a string
    if (snapshot && snapshot.content_json && typeof snapshot.content_json === 'string') {
      try {
        snapshot.content_json = JSON.parse(snapshot.content_json)
      } catch (e) {
        console.error('Error parsing snapshot content_json:', e)
      }
    }

    return Response.json({
      document,
      snapshot,
      isOwner: document.user_id === userId,
      isAdmin: admin,
      isCurator: curator
    })
  } catch (error) {
    console.error('Error fetching document:', error)
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
    const { title, folder_id, is_full_width, keywords } = body

    const updates = []
    const values = []
    let paramCount = 1

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`)
      values.push(title)
    }

    if (folder_id !== undefined) {
      updates.push(`folder_id = $${paramCount++}`)
      values.push(folder_id)
    }

    if (is_full_width !== undefined) {
      updates.push(`is_full_width = $${paramCount++}`)
      values.push(is_full_width === true)
    }

    if (keywords !== undefined) {
      updates.push(`keywords = $${paramCount++}`)
      // Ensure keywords is an array of trimmed, lowercase strings
      const cleanKeywords = Array.isArray(keywords)
        ? keywords.map(k => k.trim().toLowerCase()).filter(k => k.length > 0)
        : []
      values.push(cleanKeywords.length > 0 ? cleanKeywords : null)
    }

    if (updates.length === 0) {
      return Response.json({ error: 'No fields to update' }, { status: 400 })
    }

    values.push(id)

    const { isCurator } = require('@/lib/auth/isCurator')
    const admin = await isAdmin()
    const curator = await isCurator()

    let whereClause = `id = $${paramCount}`

    // Check permissions
    if (!admin && !curator) {
      // Regular user - must be owner
      whereClause += ` AND user_id = $${paramCount + 1}`
      values.push(userId)
    } else if (curator && !admin) {
      // Curator (but not admin) - check if they are owner or only updating keywords
      const checkOwner = await sql.query('SELECT user_id FROM documents WHERE id = $1', [id])
      const isOwner = checkOwner.rows[0]?.user_id === userId

      if (!isOwner) {
        // If not owner, curator can ONLY update keywords
        if (title !== undefined || folder_id !== undefined || is_full_width !== undefined) {
          return Response.json({ error: 'Curators can only update keywords on documents they do not own' }, { status: 403 })
        }
      }
    }

    const result = await sql.query(
      `UPDATE documents 
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE ${whereClause}
       RETURNING *`,
      values
    )

    if (result.rows.length === 0) {
      return Response.json({ error: 'Document not found' }, { status: 404 })
    }

    return Response.json({ document: result.rows[0] })
  } catch (error) {
    console.error('Error updating document:', error)
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
    const admin = await isAdmin()

    let result
    if (admin) {
      result = await sql.query(
        'DELETE FROM documents WHERE id = $1 RETURNING id',
        [id]
      )
    } else {
      result = await sql.query(
        'DELETE FROM documents WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, userId]
      )
    }

    if (result.rows.length === 0) {
      return Response.json({ error: 'Document not found' }, { status: 404 })
    }

    return Response.json({ success: true, id })
  } catch (error) {
    console.error('Error deleting document:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

