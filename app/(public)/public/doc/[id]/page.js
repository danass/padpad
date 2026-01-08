import { sql } from '@vercel/postgres'
import { auth } from '@/auth'
import { cache } from 'react'
import PublicDocumentClient from './client'

export const dynamic = 'force-dynamic'

// Helper to extract text from TipTap JSON content
function extractTextFromContent(content) {
  if (!content) return ''
  let text = ''

  function traverse(node) {
    if (!node) return

    if (node.type === 'text' && node.text) {
      text += node.text + ' '
    }

    if (node.content && Array.isArray(node.content)) {
      for (const child of node.content) {
        traverse(child)
        if (text.length > 500) break
      }
    }
  }

  traverse(content)
  return text.trim().replace(/\s+/g, ' ')
}

// Fetch document data server-side
const getDocumentData = cache(async (documentId) => {
  try {
    const docResult = await sql.query(
      'SELECT * FROM documents WHERE id = $1',
      [documentId]
    )

    if (docResult.rows.length === 0) {
      return { error: 'not_found' }
    }

    const document = docResult.rows[0]

    if (!document.is_public) {
      return { error: 'not_public' }
    }

    // Get latest snapshot directly from the snapshots table (source of truth)
    const latestSnapshotResult = await sql.query(
      `SELECT * FROM document_snapshots 
       WHERE document_id = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [documentId]
    )

    let snapshot = null
    if (latestSnapshotResult.rows.length > 0) {
      snapshot = latestSnapshotResult.rows[0]
      if (snapshot.content_json && typeof snapshot.content_json === 'string') {
        try { snapshot.content_json = JSON.parse(snapshot.content_json) } catch (e) { }
      }
    }

    // Prioritize IPFS if enabled
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
              document_id: documentId,
              content_json: ipfsContent,
              content_text: '',
              created_at: new Date().toISOString()
            }
          }
        }
      } catch (ipfsError) {
        console.error('Error fetching from IPFS for public doc:', ipfsError)
        // Fallback to local snapshot if IPFS fails
      }
    }

    // Get content from snapshot
    let content = snapshot?.content_json || { type: 'doc', content: [] }
    if (typeof content === 'string') {
      try {
        content = JSON.parse(content)
      } catch (e) {
        console.error('Error parsing snapshot content:', e)
        content = { type: 'doc', content: [] }
      }
    }

    // Get navigation (prev/next public docs from same user)
    let navigation = { prev: null, next: null }
    if (document.user_id) {
      const prevResult = await sql.query(
        `SELECT id, title FROM documents 
         WHERE user_id = $1 AND is_public = true AND created_at < $2 
         ORDER BY created_at DESC LIMIT 1`,
        [document.user_id, document.created_at]
      )
      if (prevResult.rows.length > 0) {
        navigation.prev = prevResult.rows[0]
      }

      const nextResult = await sql.query(
        `SELECT id, title FROM documents 
         WHERE user_id = $1 AND is_public = true AND created_at > $2 
         ORDER BY created_at ASC LIMIT 1`,
        [document.user_id, document.created_at]
      )
      if (nextResult.rows.length > 0) {
        navigation.next = nextResult.rows[0]
      }
    }

    // Get archive info
    let archiveId = null
    let authorName = null
    if (document.user_id) {
      try {
        const userResult = await sql.query(
          "SELECT id, testament_username, COALESCE(archive_id, SUBSTRING(REPLACE(id::text, '-', ''), 1, 8)) as archive_id FROM users WHERE id = $1",
          [document.user_id]
        )
        if (userResult.rows.length > 0) {
          const user = userResult.rows[0]
          archiveId = user.testament_username || user.archive_id
          authorName = user.testament_username || null
        }
      } catch (e) { }
    }

    return {
      document: {
        id: document.id,
        title: document.title || '',
        is_full_width: document.is_full_width || false,
        keywords: document.keywords || [],
        archive_id: archiveId,
        author_name: authorName,
        user_id: document.user_id,
      },
      content,
      navigation
    }
  } catch (error) {
    console.error('Error loading document:', error)
    return { error: 'server_error' }
  }
})

// Generate dynamic metadata for social sharing
export async function generateMetadata({ params }) {
  const { id: documentId } = await params

  const defaultMeta = {
    title: 'Document | Textpad',
    description: 'View this document on Textpad',
    openGraph: {
      title: 'Document | Textpad',
      description: 'View this document on Textpad',
      type: 'article',
      images: [{ url: '/padpad.png', width: 512, height: 512, alt: 'Textpad' }],
    },
    alternates: {
      canonical: `/public/doc/${documentId}`,
    },
  }

  try {
    const data = await getDocumentData(documentId)
    if (data.error) return defaultMeta

    const title = data.document.title && data.document.title !== 'Untitled'
      ? data.document.title
      : `Note ${documentId.slice(0, 8)}`

    let description = 'Read this article on Textpad'
    if (data.content) {
      const extractedText = extractTextFromContent(data.content)
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
        url: `/public/doc/${documentId}`,
        siteName: 'Textpad',
        images: [{ url: '/padpad.png', width: 512, height: 512, alt: 'Textpad' }],
      },
      twitter: {
        card: 'summary',
        title: title,
        description: description,
        images: ['/padpad.png'],
      },
      alternates: {
        canonical: `/public/doc/${documentId}`,
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return defaultMeta
  }
}

export default async function PublicDocumentPage({ params }) {
  const { id: documentId } = await params
  const session = await auth()
  const data = await getDocumentData(documentId)

  // Add isOwner/isAdmin flags
  const isOwner = session?.user?.id && data.document?.user_id && session.user.id === data.document.user_id
  const isAdmin = session?.user?.isAdmin === true

  if (data.document) {
    data.document.isOwner = !!(isOwner || isAdmin)
  }

  return <PublicDocumentClient serverData={data} />
}
