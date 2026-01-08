import { sql } from '@vercel/postgres'
import { cache } from 'react'
import TempPadClient from './TempClient'

export const dynamic = 'force-dynamic'

// Memoize data request
const getTempDocumentData = cache(async (documentId) => {
    // Validate UUID format to prevent DB errors
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(documentId)) {
        return { error: 'not_found' }
    }

    try {
        const docResult = await sql.query(
            'SELECT * FROM documents WHERE id = $1',
            [documentId]
        )

        if (docResult.rows.length === 0) {
            return { error: 'not_found' }
        }

        const document = docResult.rows[0]

        // Check if document is disposable or public
        const isExpired = document.expires_at && new Date(document.expires_at) < new Date()

        if (!document.is_disposable && !document.is_public) {
            return { error: 'not_public' }
        }

        if (document.is_disposable && isExpired) {
            return { error: 'Document has expired' }
        }

        // Get latest snapshot
        let content = null
        if (document.current_snapshot_id) {
            const snapshotResult = await sql.query(
                'SELECT * FROM document_snapshots WHERE id = $1',
                [document.current_snapshot_id]
            )
            if (snapshotResult.rows.length > 0) {
                let snapshot = snapshotResult.rows[0]
                if (snapshot.content_json && typeof snapshot.content_json === 'string') {
                    try { snapshot.content_json = JSON.parse(snapshot.content_json) } catch (e) { }
                }

                // Prioritize IPFS if enabled
                if (document.ipfs_enabled && document.ipfs_cid) {
                    try {
                        const gatewayUrl = `https://ipfs.filebase.io/ipfs/${document.ipfs_cid}`
                        const ipfsResponse = await fetch(gatewayUrl)
                        if (ipfsResponse.ok) {
                            const ipfsContent = await ipfsResponse.json()
                            snapshot.content_json = ipfsContent
                        }
                    } catch (ipfsError) {
                        console.error('Error fetching from IPFS for temp pad:', ipfsError)
                        // Fallback to local snapshot if IPFS fails
                    }
                }

                if (snapshot.content_json) {
                    content = snapshot.content_json
                } else {
                    content = { type: 'doc', content: [] }
                }
            }
        }

        return {
            document: {
                id: document.id,
                title: document.title || '',
                expires_at: document.expires_at,
                is_disposable: document.is_disposable,
            },
            content
        }
    } catch (error) {
        console.error('Error loading temp document:', error)
        return { error: 'server_error' }
    }
})

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

export async function generateMetadata({ params }) {
    const { id } = await params
    const data = await getTempDocumentData(id)

    const title = data.document?.title && data.document.title !== 'Untitled'
        ? data.document.title
        : 'Temporary Pad'

    let description = 'View this temporary document on TextPad. This pad is disposable and will expire automatically.'
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
        title: `${title} | TextPad`,
        description,
        alternates: {
            canonical: `/public/temp/${id}`,
        },
    }
}

export default async function TempPadPage({ params }) {
    const { id } = await params
    const data = await getTempDocumentData(id)

    // If invalid ID, not found, or server error, redirect to home
    if (data.error === 'not_found' || data.error === 'server_error' || data.error === 'Document has expired') {
        const { redirect } = await import('next/navigation')
        redirect('/')
    }

    // If document is already claimed, redirect to the permanent editor view
    if (data.document && !data.document.is_disposable) {
        const { redirect } = await import('next/navigation')
        redirect(`/doc/${id}`)
    }

    return <TempPadClient serverData={data} />
}
