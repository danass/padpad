import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { sql } from '@vercel/postgres'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Helper to get provider by ID
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

// POST: Generate pre-signed URL for direct browser upload to Filebase
export async function POST(request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { filename, contentType, providerId } = body

        if (!filename || !contentType) {
            return NextResponse.json({ error: 'Missing filename or contentType' }, { status: 400 })
        }

        const provider = await getProvider(session.user.id, providerId)
        if (!provider) {
            return NextResponse.json({ error: 'IPFS not configured' }, { status: 400 })
        }

        if (provider.provider !== 'filebase') {
            return NextResponse.json({ error: 'Upload only supported for Filebase' }, { status: 400 })
        }

        // Create S3 client for Filebase
        const client = new S3Client({
            endpoint: 'https://s3.filebase.com',
            region: 'us-east-1',
            credentials: {
                accessKeyId: provider.accessKey,
                secretAccessKey: provider.secretKey,
            },
            forcePathStyle: true,
        })

        // Generate unique key with timestamp to avoid overwrites
        const key = `${Date.now()}-${filename}`

        // Create the command
        const command = new PutObjectCommand({
            Bucket: provider.bucket,
            Key: key,
            ContentType: contentType,
        })

        // Generate pre-signed URL (valid for 15 minutes)
        const uploadUrl = await getSignedUrl(client, command, { expiresIn: 900 })

        return NextResponse.json({
            uploadUrl,
            key,
            providerId: provider.id,
            gatewayUrlTemplate: `https://ipfs.filebase.io/ipfs/{CID}`,
        })
    } catch (error) {
        console.error('Error generating upload URL:', error)
        return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 })
    }
}
