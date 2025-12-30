import { sql } from '@vercel/postgres'
import { getUserId } from '@/lib/auth/getSession'
import { createFilebaseClient } from '@/lib/ipfs/filebase-client'

export async function PATCH(request, { params }) {
    try {
        const userId = await getUserId()
        if (!userId) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()
        const { enabled } = body

        // 1. Get document and verify ownership
        const docResult = await sql.query(
            'SELECT * FROM documents WHERE id = $1 AND user_id = $2',
            [id, userId]
        )

        if (docResult.rows.length === 0) {
            return Response.json({ error: 'Document not found or access denied' }, { status: 404 })
        }

        const doc = docResult.rows[0]

        // 2. Get user's IPFS config
        const userResult = await sql.query(
            'SELECT ipfs_config FROM users WHERE id = $1',
            [userId]
        )
        const ipfsConfig = userResult.rows[0]?.ipfs_config
        const providers = Array.isArray(ipfsConfig) ? ipfsConfig : []
        const filebaseProvider = providers.find(p => p.provider === 'filebase')

        if (enabled && !filebaseProvider) {
            return Response.json({ error: 'No Filebase configuration found' }, { status: 400 })
        }

        if (enabled) {
            // Activating IPFS mode
            // Get the latest snapshot
            const snapshotResult = await sql.query(
                'SELECT content_json FROM document_snapshots WHERE document_id = $1 ORDER BY created_at DESC LIMIT 1',
                [id]
            )

            if (snapshotResult.rows.length === 0) {
                return Response.json({ error: 'No snapshot found to upload to IPFS' }, { status: 400 })
            }

            const contentJson = snapshotResult.rows[0].content_json
            const client = createFilebaseClient(filebaseProvider)

            // Upload to IPFS
            const uploadResult = await client.uploadFile(
                `documents/${id}.json`,
                JSON.stringify(contentJson),
                'application/json'
            )

            if (!uploadResult.cid) {
                return Response.json({ error: 'Failed to upload to IPFS' }, { status: 500 })
            }

            await sql.query(
                'UPDATE documents SET ipfs_enabled = TRUE, ipfs_cid = $1 WHERE id = $2',
                [uploadResult.cid, id]
            )

            return Response.json({ success: true, cid: uploadResult.cid })
        } else {
            // Deactivating IPFS mode
            // Copy IPFS version back to local storage if needed
            // Actually, we can just fetch it and create a new snapshot if we want to be sure it's updated
            // But for now, just disabled the flag.
            await sql.query(
                'UPDATE documents SET ipfs_enabled = FALSE WHERE id = $1',
                [id]
            )
            return Response.json({ success: true })
        }
    } catch (error) {
        console.error('Error toggling IPFS:', error)
        return Response.json({ error: error.message }, { status: 500 })
    }
}
