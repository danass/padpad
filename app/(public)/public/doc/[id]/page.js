import { sql } from '@vercel/postgres'
import { replayHistory } from '@/lib/editor/history-replay'
import PublicDocumentClient from './client'

// Helper to extract text from TipTap JSON content
function extractTextFromContent(content) {
  let text = ''

  function traverse(node) {
    if (!node) return

    // Extract text from text nodes
    if (node.type === 'text' && node.text) {
      text += node.text + ' '
    }

    // Extract text from headings
    if (node.type === 'heading' && node.content) {
      for (const child of node.content) {
        traverse(child)
      }
    }

    // Extract text from paragraphs
    if (node.type === 'paragraph' && node.content) {
      for (const child of node.content) {
        traverse(child)
      }
    }

    // Traverse doc content
    if (node.type === 'doc' && node.content) {
      for (const child of node.content) {
        traverse(child)
        if (text.length > 300) return
      }
    }
  }

  traverse(content)
  return text.trim()
}

// Generate dynamic metadata for social sharing - query DB directly
export async function generateMetadata({ params }) {
  const { id: documentId } = await params
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://textpad.cloud'

  const defaultMeta = {
    title: 'Document | Textpad',
    description: 'View this document on Textpad',
    openGraph: {
      title: 'Document | Textpad',
      description: 'View this document on Textpad',
      type: 'article',
      images: [{ url: `${baseUrl}/padpad.png`, width: 512, height: 512, alt: 'Textpad' }],
    },
  }

  try {
    // Query document directly
    const docResult = await sql.query(
      'SELECT * FROM documents WHERE id = $1',
      [documentId]
    )

    if (docResult.rows.length === 0) {
      return defaultMeta
    }

    const document = docResult.rows[0]

    // Check if document is public
    if (!document.is_public) {
      return defaultMeta
    }

    // Get snapshot and reconstruct content
    let content = null
    if (document.current_snapshot_id) {
      const snapshotResult = await sql.query(
        'SELECT * FROM document_snapshots WHERE id = $1',
        [document.current_snapshot_id]
      )
      if (snapshotResult.rows.length > 0) {
        let snapshot = snapshotResult.rows[0]
        if (snapshot.content_json && typeof snapshot.content_json === 'string') {
          try {
            snapshot.content_json = JSON.parse(snapshot.content_json)
          } catch (e) { }
        }

        // Get events after snapshot
        const eventsResult = await sql.query(
          'SELECT * FROM document_events WHERE document_id = $1 AND created_at > $2 ORDER BY created_at ASC',
          [documentId, snapshot.created_at]
        )
        const events = eventsResult.rows.map(event => ({
          ...event,
          payload: typeof event.payload === 'string' ? JSON.parse(event.payload) : event.payload
        }))

        content = replayHistory(snapshot, events)
      }
    }

    // Extract title
    const title = document.title && document.title !== 'Untitled'
      ? document.title
      : 'Document'

    // Extract description from content
    let description = 'Read this article on Textpad'
    if (content) {
      const extractedText = extractTextFromContent(content)
      if (extractedText) {
        description = extractedText.substring(0, 200)
        if (extractedText.length > 200) {
          description += '...'
        }
      }
    }

    return {
      title: `${title} | Textpad`,
      description: description,
      openGraph: {
        title: title,
        description: description,
        type: 'article',
        url: `${baseUrl}/public/doc/${documentId}`,
        siteName: 'Textpad',
        images: [{ url: `${baseUrl}/padpad.png`, width: 512, height: 512, alt: 'Textpad' }],
      },
      twitter: {
        card: 'summary',
        title: title,
        description: description,
        images: [`${baseUrl}/padpad.png`],
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return defaultMeta
  }
}

export default function PublicDocumentPage({ params }) {
  return <PublicDocumentClient />
}
