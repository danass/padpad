import { sql } from '@vercel/postgres'
import { v4 as uuidv4 } from 'uuid'
import { getUserId } from '@/lib/auth/getSession'
import { isAdmin } from '@/lib/auth/isAdmin'
import { createFilebaseClient } from '@/lib/ipfs/filebase-client'

// Helper function to extract plain text from TipTap JSON
function extractPlainText(contentJson) {
  try {
    if (!contentJson || !contentJson.content) {
      return ''
    }

    function extractText(node) {
      if (node.type === 'text') {
        return node.text || ''
      }

      if (node.content && Array.isArray(node.content)) {
        return node.content.map(extractText).join(' ')
      }

      return ''
    }

    return contentJson.content.map(extractText).join(' ').trim()
  } catch (error) {
    console.error('Error extracting plain text:', error)
    return ''
  }
}

export async function POST(request, { params }) {
  try {
    const userId = await getUserId()
    const { id } = await params
    const body = await request.json()
    const { content_json } = body
    const admin = await isAdmin()

    // Verify document exists
    let docCheck = await sql.query(
      'SELECT id, user_id, is_disposable, expires_at, ipfs_enabled FROM documents WHERE id = $1',
      [id]
    )

    if (docCheck.rows.length === 0) {
      return Response.json({ error: 'Document not found' }, { status: 404 })
    }

    const doc = docCheck.rows[0]
    const isExpired = doc.expires_at && new Date(doc.expires_at) < new Date()

    // If document is disposable and not expired, allow snapshot without auth
    if (doc.is_disposable && !isExpired) {
      // Continue to snapshot creation
    } else if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    } else {
      // Normal auth check
      if (doc.user_id && doc.user_id !== userId && !admin) {
        return Response.json({ error: 'Document not found' }, { status: 404 })
      }
    }

    // If document has no user_id, assign it to current user (migration for old documents)
    // Use atomic UPDATE with WHERE user_id IS NULL to prevent race conditions
    if (!doc.user_id) {
      const updateResult = await sql.query(
        'UPDATE documents SET user_id = $1 WHERE id = $2 AND user_id IS NULL RETURNING id',
        [userId, id]
      )
      // If update didn't affect any rows, another user already claimed it
      if (updateResult.rows.length === 0) {
        // Re-check to see who owns it now
        const recheck = await sql.query(
          'SELECT user_id FROM documents WHERE id = $1',
          [id]
        )
        if (recheck.rows.length > 0 && recheck.rows[0].user_id !== userId && !admin) {
          return Response.json({ error: 'Document not found' }, { status: 404 })
        }
      }
    } else if (doc.user_id !== userId && !admin) {
      // Document belongs to another user - only admins can access
      return Response.json({ error: 'Document not found' }, { status: 404 })
    }

    // Get the last snapshot to compare
    const lastSnapshotResult = await sql.query(
      `SELECT content_json FROM document_snapshots 
       WHERE document_id = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [id]
    )

    // Compare with last snapshot
    if (lastSnapshotResult.rows.length > 0) {
      const lastSnapshot = lastSnapshotResult.rows[0]
      let lastContentJson = lastSnapshot.content_json

      // Parse if it's a string
      if (typeof lastContentJson === 'string') {
        try {
          lastContentJson = JSON.parse(lastContentJson)
        } catch (e) {
          console.error('Error parsing last snapshot:', e)
        }
      }

      // Normalize both JSON objects for comparison (deep sort and stringify)
      const normalizeJSON = (obj) => {
        if (obj === null || typeof obj !== 'object') {
          return obj
        }

        if (Array.isArray(obj)) {
          return obj.map(normalizeJSON).sort((a, b) => {
            const aStr = JSON.stringify(a)
            const bStr = JSON.stringify(b)
            return aStr < bStr ? -1 : aStr > bStr ? 1 : 0
          })
        }

        const sorted = {}
        Object.keys(obj).sort().forEach(key => {
          sorted[key] = normalizeJSON(obj[key])
        })
        return sorted
      }

      // Normalize and compare
      const normalizedCurrent = normalizeJSON(content_json)
      const normalizedLast = normalizeJSON(lastContentJson)
      const currentContentStr = JSON.stringify(normalizedCurrent)
      const lastContentStr = JSON.stringify(normalizedLast)

      if (currentContentStr === lastContentStr) {
        // Content is identical, don't create a new snapshot
        return Response.json(
          { message: 'No changes detected, snapshot not created', skipped: true },
          { status: 200 }
        )
      }
    }

    // Extract plain text
    const content_text = extractPlainText(content_json)
    const word_count = content_text.trim().split(/\s+/).filter(w => w.length > 0).length
    const char_count = content_text.length

    // Check if content is empty (only empty paragraphs)
    const isEmpty = (content) => {
      if (!content || !content.content || !Array.isArray(content.content)) {
        return true
      }

      // Check if all content nodes are empty paragraphs
      const hasNonEmptyContent = content.content.some(node => {
        if (node.type === 'paragraph') {
          // Paragraph is empty if it has no content or only empty text nodes
          if (!node.content || node.content.length === 0) {
            return false
          }
          // Check if all text nodes are empty
          return node.content.some(textNode => {
            if (textNode.type === 'text' && textNode.text && textNode.text.trim().length > 0) {
              return true
            }
            return false
          })
        }
        // Non-paragraph nodes are considered content
        return true
      })

      return !hasNonEmptyContent
    }

    // Don't create snapshot if content is empty
    if (isEmpty(content_json)) {
      return Response.json(
        { message: 'Content is empty, snapshot not created', skipped: true },
        { status: 200 }
      )
    }

    // Create snapshot
    const snapshotId = uuidv4()
    const snapshotResult = await sql.query(
      `INSERT INTO document_snapshots (id, document_id, content_json, content_text, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [snapshotId, id, JSON.stringify(content_json), content_text]
    )

    // Update document with snapshot reference, content_text and stats
    let ipfsUpdate = ''
    let ipfsValues = []
    let valCount = 6

    if (doc.ipfs_enabled) {
      try {
        // Get user's IPFS config
        const userResult = await sql.query(
          'SELECT ipfs_config FROM users WHERE id = $1',
          [userId]
        )
        const ipfsConfig = userResult.rows[0]?.ipfs_config
        const providers = Array.isArray(ipfsConfig) ? ipfsConfig : []
        const filebaseProvider = providers.find(p => p.provider === 'filebase')

        if (filebaseProvider) {
          const client = createFilebaseClient(filebaseProvider)
          const uploadResult = await client.uploadFile(
            `documents/${id}.json`,
            JSON.stringify(content_json),
            'application/json'
          )
          if (uploadResult.cid) {
            ipfsUpdate = `, ipfs_cid = $${valCount++}`
            ipfsValues.push(uploadResult.cid)
          }
        }
      } catch (ipfsError) {
        console.error('Error uploading snapshot to IPFS:', ipfsError)
      }
    }

    await sql.query(
      `UPDATE documents 
       SET current_snapshot_id = $1, 
           content_text = $2,
           word_count = $3,
           char_count = $4,
           updated_at = NOW()
           ${ipfsUpdate}
       WHERE id = $5`,
      [snapshotId, content_text, word_count, char_count, id, ...ipfsValues]
    )

    // Enforce 10 snapshot limit (keep oldest + 9 most recent)
    const countResult = await sql.query(
      'SELECT COUNT(*) FROM document_snapshots WHERE document_id = $1',
      [id]
    )
    const snapshotCount = parseInt(countResult.rows[0].count)

    if (snapshotCount > 10) {
      // Get the oldest snapshot ID to preserve
      const oldestResult = await sql.query(
        `SELECT id FROM document_snapshots WHERE document_id = $1 ORDER BY created_at ASC LIMIT 1`,
        [id]
      )
      const oldestId = oldestResult.rows[0].id

      // Delete the 2nd oldest snapshot (preserving the oldest)
      await sql.query(
        `DELETE FROM document_snapshots 
         WHERE id = (
           SELECT id FROM document_snapshots 
           WHERE document_id = $1 AND id != $2 
           ORDER BY created_at ASC 
           LIMIT 1
         )`,
        [id, oldestId]
      )
    }

    return Response.json({ snapshot: snapshotResult.rows[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating snapshot:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

