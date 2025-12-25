import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { sql } from '@vercel/postgres'
import { createFilebaseClient } from '@/lib/ipfs/filebase-client'

// POST: Test IPFS connection
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

        if (provider === 'filebase') {
            const client = createFilebaseClient({ accessKey, secretKey, bucket })
            const result = await client.testConnection()

            if (result.success) {
                return NextResponse.json({ success: true, message: 'Connection successful' })
            } else {
                return NextResponse.json({ success: false, error: result.error }, { status: 400 })
            }
        }

        return NextResponse.json({ error: 'Unknown provider' }, { status: 400 })
    } catch (error) {
        console.error('Error testing IPFS connection:', error)
        return NextResponse.json({
            success: false,
            error: error.message || 'Connection failed'
        }, { status: 500 })
    }
}
