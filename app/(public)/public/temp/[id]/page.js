import { sql } from '@vercel/postgres'
import { replayHistory } from '@/lib/editor/history-replay'
import TempPadClient from './TempClient'

export const dynamic = 'force-dynamic'

async function getTempDocumentData(documentId) {
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
