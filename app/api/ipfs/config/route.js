import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { sql } from '@vercel/postgres'
import { v4 as uuidv4 } from 'uuid'

// GET: Retrieve user's IPFS providers (with masked secrets)
export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const result = await sql`
            SELECT ipfs_config FROM users WHERE id = ${session.user.id}
        `

        if (result.rows.length === 0) {
            return NextResponse.json({ providers: [] })
        }

        let config = result.rows[0].ipfs_config

        // Handle legacy single-provider config (migrate to array)
        if (config && !Array.isArray(config)) {
            config = [{ id: uuidv4(), ...config }]
        }

        if (!config) {
            return NextResponse.json({ providers: [] })
        }

        // Mask sensitive data
        const maskedProviders = config.map(provider => ({
            ...provider,
            accessKey: provider.accessKey ? `${provider.accessKey.slice(0, 4)}...${provider.accessKey.slice(-4)}` : undefined,
            secretKey: provider.secretKey ? '••••••••••••' : undefined,
        }))

        return NextResponse.json({ providers: maskedProviders })
    } catch (error) {
        console.error('Error fetching IPFS config:', error)
        return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 })
    }
}

// POST: Add new IPFS provider
export async function POST(request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { name, provider, accessKey, secretKey, bucket, rootCid, gateway } = body

        if (!name || !provider) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Get current config
        const result = await sql`
            SELECT ipfs_config FROM users WHERE id = ${session.user.id}
        `

        let currentConfig = result.rows[0]?.ipfs_config || []

        // Handle legacy single-provider config
        if (currentConfig && !Array.isArray(currentConfig)) {
            currentConfig = [{ id: uuidv4(), ...currentConfig }]
        }

        // Create new provider entry
        const newProvider = {
            id: uuidv4(),
            name,
            provider,
            createdAt: new Date().toISOString(),
        }

        // Add provider-specific fields
        if (provider === 'filebase') {
            if (!accessKey || !secretKey || !bucket) {
                return NextResponse.json({ error: 'Filebase requires accessKey, secretKey, and bucket' }, { status: 400 })
            }
            newProvider.accessKey = accessKey
            newProvider.secretKey = secretKey
            newProvider.bucket = bucket
        } else if (provider === 'storacha_gateway') {
            if (!rootCid) {
                return NextResponse.json({ error: 'Storacha gateway requires rootCid' }, { status: 400 })
            }
            newProvider.rootCid = rootCid
            newProvider.gateway = gateway || 'w3s.link'
        }

        // Add to array
        currentConfig.push(newProvider)

        await sql`
            UPDATE users 
            SET ipfs_config = ${JSON.stringify(currentConfig)}::jsonb
            WHERE id = ${session.user.id}
        `

        return NextResponse.json({ success: true, provider: { ...newProvider, secretKey: undefined } })
    } catch (error) {
        console.error('Error saving IPFS config:', error)
        return NextResponse.json({ error: 'Failed to save config' }, { status: 500 })
    }
}

// DELETE: Remove specific IPFS provider by ID
export async function DELETE(request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const providerId = searchParams.get('id')

        if (!providerId) {
            return NextResponse.json({ error: 'Provider ID required' }, { status: 400 })
        }

        // Get current config
        const result = await sql`
            SELECT ipfs_config FROM users WHERE id = ${session.user.id}
        `

        let currentConfig = result.rows[0]?.ipfs_config || []

        // Handle legacy single-provider config
        if (currentConfig && !Array.isArray(currentConfig)) {
            currentConfig = [{ id: uuidv4(), ...currentConfig }]
        }

        // Remove provider
        const newConfig = currentConfig.filter(p => p.id !== providerId)

        await sql`
            UPDATE users 
            SET ipfs_config = ${JSON.stringify(newConfig)}::jsonb
            WHERE id = ${session.user.id}
        `

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting IPFS config:', error)
        return NextResponse.json({ error: 'Failed to delete config' }, { status: 500 })
    }
}
