import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { sql } from '@vercel/postgres'
import { createFilebaseClient } from '@/lib/ipfs/filebase-client'

// Helper to get user's IPFS client
async function getIpfsClient(userId) {
    const result = await sql`
        SELECT ipfs_config FROM users WHERE id = ${userId}
    `

    if (result.rows.length === 0 || !result.rows[0].ipfs_config) {
        return null
    }

    const config = result.rows[0].ipfs_config

    if (config.provider === 'filebase') {
        return createFilebaseClient(config)
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
        const prefix = searchParams.get('prefix') || ''
        const maxKeys = parseInt(searchParams.get('maxKeys') || '100')

        const client = await getIpfsClient(session.user.id)
        if (!client) {
            return NextResponse.json({ error: 'IPFS not configured' }, { status: 400 })
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

        return NextResponse.json({ files: filesWithCids })
    } catch (error) {
        console.error('Error listing IPFS files:', error)
        return NextResponse.json({ error: 'Failed to list files' }, { status: 500 })
    }
}

// POST: Upload file to IPFS
export async function POST(request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file')
        const path = formData.get('path') || ''

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        const client = await getIpfsClient(session.user.id)
        if (!client) {
            return NextResponse.json({ error: 'IPFS not configured' }, { status: 400 })
        }

        // Create file key with optional path prefix
        const key = path ? `${path}/${file.name}` : file.name
        const buffer = Buffer.from(await file.arrayBuffer())

        const result = await client.uploadFile(key, buffer, file.type)

        return NextResponse.json({
            success: true,
            file: {
                key: result.key,
                cid: result.cid,
                gatewayUrl: result.gatewayUrl,
                size: file.size,
                type: file.type,
            },
        })
    } catch (error) {
        console.error('Error uploading to IPFS:', error)
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
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

        if (!key) {
            return NextResponse.json({ error: 'No file key provided' }, { status: 400 })
        }

        const client = await getIpfsClient(session.user.id)
        if (!client) {
            return NextResponse.json({ error: 'IPFS not configured' }, { status: 400 })
        }

        await client.deleteFile(key)

        return NextResponse.json({ success: true, deleted: key })
    } catch (error) {
        console.error('Error deleting from IPFS:', error)
        return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
    }
}
