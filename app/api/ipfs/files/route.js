import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { sql } from '@vercel/postgres'
import { createFilebaseClient } from '@/lib/ipfs/filebase-client'

// Helper to get user's IPFS provider by ID
async function getProvider(userId, providerId) {
    const result = await sql`
        SELECT ipfs_config FROM users WHERE id = ${userId}
    `

    if (result.rows.length === 0 || !result.rows[0].ipfs_config) {
        return null
    }

    let config = result.rows[0].ipfs_config

    // Handle legacy single-provider config
    if (config && !Array.isArray(config)) {
        config = [{ id: 'legacy', ...config }]
    }

    // If no providerId specified, use first Filebase provider
    if (!providerId) {
        return config.find(p => p.provider === 'filebase') || null
    }

    return config.find(p => p.id === providerId) || null
}

// Helper to create client for provider
function createClientForProvider(provider) {
    if (provider.provider === 'filebase') {
        return createFilebaseClient(provider)
    }
    return null
}

// GET: List files in IPFS bucket
export async function GET(request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const providerId = searchParams.get('providerId')
        const prefix = searchParams.get('prefix') || ''
        const maxKeys = parseInt(searchParams.get('maxKeys') || '100')

        const provider = await getProvider(session.user.id, providerId)
        if (!provider) {
            return NextResponse.json({ error: 'IPFS not configured' }, { status: 400 })
        }

        // For gateway providers, redirect to gateway-files API
        if (provider.provider === 'storacha_gateway') {
            return NextResponse.json({
                error: 'Use /api/ipfs/gateway-files for gateway providers',
                redirect: `/api/ipfs/gateway-files?cid=${provider.rootCid}&gateway=${provider.gateway}`
            }, { status: 400 })
        }

        const client = createClientForProvider(provider)
        if (!client) {
            return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 })
        }

        const files = await client.listFiles(prefix, maxKeys)

        // Get CIDs for each file
        const filesWithCids = await Promise.all(
            files.map(async (file) => {
                const cid = await client.getFileCid(file.key)
                return {
                    ...file,
                    cid,
                    gatewayUrl: cid ? client.getGatewayUrl(cid) : null,
                }
            })
        )

        return NextResponse.json({ files: filesWithCids, providerId: provider.id })
    } catch (error) {
        console.error('Error listing IPFS files:', error)
        return NextResponse.json({ error: 'Failed to list files' }, { status: 500 })
    }
}

// DELETE: Remove file from IPFS
export async function DELETE(request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const key = searchParams.get('key')
        const providerId = searchParams.get('providerId')

        if (!key) {
            return NextResponse.json({ error: 'No file key provided' }, { status: 400 })
        }

        const provider = await getProvider(session.user.id, providerId)
        if (!provider) {
            return NextResponse.json({ error: 'IPFS not configured' }, { status: 400 })
        }

        const client = createClientForProvider(provider)
        if (!client) {
            return NextResponse.json({ error: 'Unsupported provider or read-only' }, { status: 400 })
        }

        await client.deleteFile(key)

        return NextResponse.json({ success: true, deleted: key })
    } catch (error) {
        console.error('Error deleting from IPFS:', error)
        return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
    }
}
