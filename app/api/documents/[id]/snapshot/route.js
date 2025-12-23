import { sql } from '@vercel/postgres'
import { v4 as uuidv4 } from 'uuid'
import { getUserId } from '@/lib/auth/getSession'
import { isAdmin } from '@/lib/auth/isAdmin'

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
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = await params
    const body = await request.json()
    const { content_json } = body
    
    if (!content_json) {
      return Response.json(
        { error: 'Missing content_json' },
        { status: 400 }
      )
    }
    
    // Verify document exists - if it has no user_id, assign it to current user
    let docCheck = await sql.query(
      'SELECT id, user_id FROM documents WHERE id = $1',
      [id]
    )
    
    if (docCheck.rows.length === 0) {
      return Response.json({ error: 'Document not found' }, { status: 404 })
    }
    
    const doc = docCheck.rows[0]
    
    // If document has no user_id, assign it to current user (migration for old documents)
    if (!doc.user_id) {
      await sql.query(
        'UPDATE documents SET user_id = $1 WHERE id = $2',
        [userId, id]
      )
    } else {
      // Check if user is admin
      const admin = await isAdmin()
      if (doc.user_id !== userId && !admin) {
        // Document belongs to another user
        return Response.json({ error: 'Document not found' }, { status: 404 })
      }
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
    
    // Create snapshot
    const snapshotId = uuidv4()
    const snapshotResult = await sql.query(
      `INSERT INTO document_snapshots (id, document_id, content_json, content_text, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [snapshotId, id, JSON.stringify(content_json), content_text]
    )
    
    // Update document with snapshot reference and content_text
    await sql.query(
      `UPDATE documents 
       SET current_snapshot_id = $1, 
           content_text = $2,
           updated_at = NOW()
       WHERE id = $3`,
      [snapshotId, content_text, id]
    )
    
    return Response.json({ snapshot: snapshotResult.rows[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating snapshot:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

