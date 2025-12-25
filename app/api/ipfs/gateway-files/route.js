import { NextResponse } from 'next/server'
import { auth } from '@/auth'

// GET: List files from an IPFS gateway using a directory CID
// This works for Storacha/web3.storage and public IPFS directories
export async function GET(request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const rootCid = searchParams.get('cid')
        const gateway = searchParams.get('gateway') || 'w3s.link'

        if (!rootCid) {
            return NextResponse.json({ error: 'CID required' }, { status: 400 })
        }

        // Fetch directory listing from IPFS gateway
        // The gateway returns an HTML page with file links for directories
        const gatewayUrl = `https://${rootCid}.ipfs.${gateway}/`

        const response = await fetch(gatewayUrl, {
            headers: {
                'Accept': 'text/html',
            },
        })

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch from gateway' }, { status: 500 })
        }

        const html = await response.text()

        // Parse the directory listing HTML
        // IPFS gateways typically return HTML with links to files
        const files = []

        // Match links in the HTML (various gateway formats)
        const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/gi
        let match

        while ((match = linkRegex.exec(html)) !== null) {
            const href = match[1]
            const name = match[2]

            // Skip parent directory and other navigation links
            if (name === '..' || name === '../' || href.startsWith('?') || href.startsWith('#')) {
                continue
            }

            // Clean up the filename
            const cleanName = decodeURIComponent(name.replace(/\/$/, ''))

            // Build the gateway URL for this file
            const fileUrl = href.startsWith('http')
                ? href
                : `https://${rootCid}.ipfs.${gateway}${href.startsWith('/') ? href : '/' + href}`

            // Determine file type from extension
            const ext = cleanName.split('.').pop()?.toLowerCase() || ''
            const isDirectory = href.endsWith('/')

            if (!isDirectory && cleanName) {
                files.push({
                    key: cleanName,
                    gatewayUrl: fileUrl,
                    type: ext,
                    cid: rootCid,
                })
            }
        }

        return NextResponse.json({
            files,
            rootCid,
            gateway,
        })
    } catch (error) {
        console.error('Error fetching gateway files:', error)
        return NextResponse.json({ error: 'Failed to list files' }, { status: 500 })
    }
}
