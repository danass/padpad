import { sql } from '@vercel/postgres'
import { tipTapToMarkdown } from '../../../../../lib/export/markdown.js'
import { tipTapToHTML } from '../../../../../lib/export/html.js'
import { getUserId } from '@/lib/auth/getSession'

export async function GET(request, { params }) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'md'
    
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
    if (!document.user_id) {
      await sql.query(
        'UPDATE documents SET user_id = $1 WHERE id = $2',
        [userId, id]
      )
      document.user_id = userId
    } else if (document.user_id !== userId) {
      // Document belongs to another user
      return Response.json({ error: 'Document not found' }, { status: 404 })
    }
    
    // Get latest snapshot OR reconstruct from events
    let content = null
    if (document.current_snapshot_id) {
      const snapshotResult = await sql.query(
        'SELECT content_json FROM document_snapshots WHERE id = $1',
        [document.current_snapshot_id]
      )
      if (snapshotResult.rows.length > 0) {
        content = snapshotResult.rows[0].content_json
      }
    }
    
    // If no snapshot, get latest events to reconstruct
    if (!content) {
      const eventsResult = await sql.query(
        'SELECT payload FROM document_events WHERE document_id = $1 ORDER BY version DESC LIMIT 1',
        [id]
      )
      if (eventsResult.rows.length > 0) {
        const latestEvent = eventsResult.rows[0]
        if (latestEvent.payload && latestEvent.payload.content) {
          content = latestEvent.payload.content
        }
      }
    }
    
    if (!content) {
      content = { type: 'doc', content: [] }
    }
    
    let output = ''
    let contentType = 'text/plain'
    let filename = `${document.title || 'document'}.${format}`
    
    switch (format) {
      case 'md':
      case 'markdown':
        output = tipTapToMarkdown(content)
        contentType = 'text/markdown'
        break
      
      case 'txt':
      case 'text':
        // Extract plain text
        output = extractPlainText(content)
        contentType = 'text/plain'
        break
      
      case 'html':
        output = tipTapToHTML(content)
        contentType = 'text/html'
        break
      
      case 'json':
        output = JSON.stringify(content, null, 2)
        contentType = 'application/json'
        filename = `${document.title || 'document'}.json`
        break
      
      case 'pdf':
        // For PDF, we'll return HTML that can be printed to PDF
        // In production, you'd use Puppeteer or a PDF library
        output = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${document.title || 'Document'}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
    h1, h2, h3 { color: #333; }
    code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
    pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
    blockquote { border-left: 4px solid #ddd; padding-left: 20px; margin-left: 0; }
  </style>
</head>
<body>
  <h1>${document.title || 'Document'}</h1>
  ${tipTapToHTML(content)}
</body>
</html>
        `.trim()
        contentType = 'text/html'
        filename = `${document.title || 'document'}.html`
        // Note: User can use browser's Print to PDF feature
        break
      
      default:
        return Response.json({ error: 'Invalid format' }, { status: 400 })
    }
    
    return new Response(output, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error) {
    console.error('Error exporting document:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

function extractPlainText(json) {
  if (!json || !json.content) {
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
  
  return json.content.map(extractText).join(' ').trim()
}
