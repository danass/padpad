import PublicDocumentClient from './client'

// Generate dynamic metadata for social sharing
export async function generateMetadata({ params }) {
  const documentId = params.id
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://textpad.cloud'

  try {
    // Fetch document data server-side
    const response = await fetch(`${baseUrl}/api/public/documents/${documentId}`, {
      cache: 'no-store'
    })

    if (!response.ok) {
      return {
        title: 'Document | Textpad',
        description: 'View this document on Textpad',
      }
    }

    const data = await response.json()
    const { document, content } = data

    // Extract text content for description
    let textContent = ''
    if (content && content.content) {
      for (const node of content.content) {
        if (node.type === 'paragraph' && node.content) {
          for (const child of node.content) {
            if (child.type === 'text') {
              textContent += child.text + ' '
            }
          }
        }
        if (textContent.length > 200) break
      }
    }

    const title = document.title && document.title !== 'Untitled'
      ? document.title
      : 'Document'

    const description = textContent.trim().substring(0, 200) || 'View this document on Textpad'

    return {
      title: `${title} | Textpad`,
      description: description,
      openGraph: {
        title: `${title} | Textpad`,
        description: description,
        type: 'article',
        url: `${baseUrl}/public/doc/${documentId}`,
        images: [{ url: `${baseUrl}/padpad.png`, width: 512, height: 512, alt: 'Textpad' }],
      },
      twitter: {
        card: 'summary',
        title: `${title} | Textpad`,
        description: description,
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Document | Textpad',
      description: 'View this document on Textpad',
    }
  }
}

export default function PublicDocumentPage({ params }) {
  return <PublicDocumentClient />
}
