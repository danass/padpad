import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { sql } from '@vercel/postgres'

// GET: Retrieve user's IPFS config (with masked secrets)
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
            return NextResponse.json({ config: null })
        }

        const config = result.rows[0].ipfs_config

        if (!config) {
            return NextResponse.json({ config: null })
        }

        // Mask sensitive data
        const maskedConfig = {
            ...config,
            accessKey: config.accessKey ? `${config.accessKey.slice(0, 4)}...${config.accessKey.slice(-4)}` : null,
            secretKey: config.secretKey ? '••••••••••••' : null,
        }

        return NextResponse.json({ config: maskedConfig })
    } catch (error) {
        console.error('Error fetching IPFS config:', error)
        return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 })
    }
}

// POST: Save/update IPFS config
export async function POST(request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { provider, accessKey, secretKey, bucket } = body

        if (!provider || !accessKey || !secretKey || !bucket) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const config = {
            provider,
            accessKey,
            secretKey,
            bucket,
            createdAt: new Date().toISOString(),
        }

        await sql`
            UPDATE users 
            SET ipfs_config = ${JSON.stringify(config)}::jsonb
            WHERE id = ${session.user.id}
        `

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error saving IPFS config:', error)
        return NextResponse.json({ error: 'Failed to save config' }, { status: 500 })
    }
}

// DELETE: Remove IPFS config
export async function DELETE() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await sql`
            UPDATE users SET ipfs_config = NULL WHERE id = ${session.user.id}
        `

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting IPFS config:', error)
        return NextResponse.json({ error: 'Failed to delete config' }, { status: 500 })
    }
}
