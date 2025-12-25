import { NextResponse } from 'next/server'

// Fetch OG metadata from a URL
export async function POST(request) {
    try {
        const { url } = await request.json()

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 })
        }

        // Validate URL
        let parsedUrl
        try {
            parsedUrl = new URL(url)
        } catch {
            return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
        }

        // Fetch the URL with a timeout
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 5000)

        const response = await fetch(parsedUrl.toString(), {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; TextpadBot/1.0; +https://textpad.cloud)',
                'Accept': 'text/html,application/xhtml+xml',
            },
            signal: controller.signal,
        })

        clearTimeout(timeout)

        if (!response.ok) {
            return NextResponse.json({
                url,
                title: parsedUrl.hostname,
                description: null,
                image: null,
                siteName: parsedUrl.hostname,
            })
        }

        const html = await response.text()

        // Parse OG metadata
        const getMetaContent = (property) => {
            // Try og: prefix first
            const ogMatch = html.match(new RegExp(`<meta[^>]*property=["']og:${property}["'][^>]*content=["']([^"']*)["']`, 'i'))
                || html.match(new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:${property}["']`, 'i'))
            if (ogMatch) return ogMatch[1]

            // Try twitter: prefix
            const twitterMatch = html.match(new RegExp(`<meta[^>]*name=["']twitter:${property}["'][^>]*content=["']([^"']*)["']`, 'i'))
                || html.match(new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*name=["']twitter:${property}["']`, 'i'))
            if (twitterMatch) return twitterMatch[1]

            // Try regular meta name
            const metaMatch = html.match(new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i'))
                || html.match(new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${property}["']`, 'i'))
            if (metaMatch) return metaMatch[1]

            return null
        }

        // Get title from og:title or <title> tag
        let title = getMetaContent('title')
        if (!title) {
            const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
            title = titleMatch ? titleMatch[1].trim() : parsedUrl.hostname
        }

        // Get description
        const description = getMetaContent('description')

        // Get image
        let image = getMetaContent('image')
        if (image && !image.startsWith('http')) {
            // Make relative URL absolute
            image = new URL(image, parsedUrl.origin).toString()
        }

        // Get site name
        const siteName = getMetaContent('site_name') || parsedUrl.hostname

        // Get favicon
        let favicon = null
        const faviconMatch = html.match(/<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']*)["']/i)
            || html.match(/<link[^>]*href=["']([^"']*)["'][^>]*rel=["'](?:icon|shortcut icon)["']/i)
        if (faviconMatch) {
            favicon = faviconMatch[1]
            if (!favicon.startsWith('http')) {
                favicon = new URL(favicon, parsedUrl.origin).toString()
            }
        } else {
            // Default to /favicon.ico
            favicon = `${parsedUrl.origin}/favicon.ico`
        }

        return NextResponse.json({
            url,
            title: title ? decodeHTMLEntities(title) : parsedUrl.hostname,
            description: description ? decodeHTMLEntities(description) : null,
            image,
            siteName: decodeHTMLEntities(siteName),
            favicon,
        })

    } catch (error) {
        console.error('Unfurl error:', error)

        // Return basic info even on error
        try {
            const { url } = await request.json()
            const parsedUrl = new URL(url)
            return NextResponse.json({
                url,
                title: parsedUrl.hostname,
                description: null,
                image: null,
                siteName: parsedUrl.hostname,
            })
        } catch {
            return NextResponse.json({ error: 'Failed to unfurl URL' }, { status: 500 })
        }
    }
}

// Helper to decode HTML entities
function decodeHTMLEntities(text) {
    const entities = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&apos;': "'",
        '&#x27;': "'",
        '&#x2F;': '/',
        '&#47;': '/',
        '&nbsp;': ' ',
    }

    return text.replace(/&[^;]+;/g, match => entities[match] || match)
}
