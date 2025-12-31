import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import arcjet, { detectBot, shield, fixedWindow, filter } from "@arcjet/next"

const aj = arcjet({
    key: process.env.ARCJET_KEY,
    characteristics: ["ip.src"],
    rules: [
        shield({ mode: "LIVE" }),
        detectBot({
            mode: "LIVE",
            allow: ["CATEGORY:SEARCH_ENGINE"],
        }),
        fixedWindow({
            mode: "LIVE",
            window: "1m",
            max: 60,
        }),
        // Block WordPress probes, env files, git, etc. at Arcjet level
        filter({
            mode: "LIVE",
            deny: [
                'http.request.uri.path wildcard "/wp-admin*"',
                'http.request.uri.path wildcard "/wordpress*"',
                'http.request.uri.path wildcard "/wp-includes*"',
                'http.request.uri.path wildcard "/wp-content*"',
                'http.request.uri.path wildcard "/wp-login*"',
                'http.request.uri.path wildcard "/xmlrpc.php*"',
                'http.request.uri.path wildcard "/.env*"',
                'http.request.uri.path wildcard "/.git*"',
                'http.request.uri.path wildcard "/phpmyadmin*"',
            ],
        }),
    ],
})

export async function proxy(request) {
    const { pathname, hostname } = request.nextUrl
    const isLocalhost = hostname === 'localhost' || hostname.includes('127.0.0.1')

    // 1. Advanced Bot Defense & Rate Limiting with Arcjet
    // Skip for Cron Jobs and localhost development
    if (process.env.ARCJET_KEY && !pathname.startsWith('/api/cron') && !isLocalhost) {
        const decision = await aj.protect(request)
        if (decision.isDenied()) {
            if (decision.reason.isBot()) {
                return new NextResponse(null, { status: 403, statusText: "Bot Access Denied" })
            } else if (decision.reason.isRateLimit()) {
                return new NextResponse(null, { status: 429, statusText: "Too Many Requests" })
            } else {
                return new NextResponse(null, { status: 403, statusText: "Forbidden" })
            }
        }
    }

    // WordPress and probe paths are now blocked by Arcjet filter rule above

    const origin = request.headers.get('origin')
    const allowedOrigins = [
        'https://textpad.cloud',
        'https://textpad.com',
        'https://www.textpad.cloud',
        'https://www.textpad.com',
        'http://localhost:3000',
        'https://eu.posthog.com',
        'https://eu.i.posthog.com',
        'https://eu-assets.i.posthog.com',
    ]

    const isAllowedOrigin = (origin) => {
        if (!origin) return false
        if (allowedOrigins.includes(origin)) return true
        if (origin.endsWith('.textpad.cloud') || origin.endsWith('.textpad.com')) return true
        return false
    }

    const applyCors = (res) => {
        const vary = res.headers.get('Vary') || ''
        if (!vary.includes('Accept-Encoding')) {
            res.headers.set('Vary', vary ? `${vary}, Accept-Encoding` : 'Accept-Encoding')
        }
        if (isAllowedOrigin(origin)) {
            res.headers.set('Access-Control-Allow-Origin', origin)
            res.headers.set('Access-Control-Allow-Credentials', 'true')
            res.headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,DELETE,PATCH')
            res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        }
        return res
    }

    // Handle preflight requests
    if (request.method === 'OPTIONS' && isAllowedOrigin(origin)) {
        return new NextResponse(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': origin,
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PATCH',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
            }
        })
    }

    // Handle subdomain (e.g., username.textpad.cloud)
    const textpadMatch = hostname.match(/^([a-z0-9_-]+)\.textpad\.cloud$/i)
    if (!isLocalhost && textpadMatch) {
        const subdomain = textpadMatch[1].toLowerCase()
        if (subdomain !== 'www') {
            if (pathname.startsWith('/auth') || pathname.startsWith('/api/auth')) {
                const wwwUrl = new URL(pathname, 'https://www.textpad.cloud')
                wwwUrl.search = request.nextUrl.search
                try {
                    const headers = new Headers(request.headers)
                    headers.set('Host', 'www.textpad.cloud')
                    const proxyResponse = await fetch(wwwUrl.toString(), {
                        method: request.method,
                        headers: headers,
                        body: request.method === 'POST' ? await request.arrayBuffer() : undefined,
                        redirect: 'manual'
                    })
                    const responseHeaders = new Headers(proxyResponse.headers)
                    const response = new NextResponse(proxyResponse.body, {
                        status: proxyResponse.status,
                        headers: responseHeaders
                    })
                    return applyCors(response)
                } catch (error) {
                    console.error('Proxy error:', error)
                    const wwwUrlFallback = new URL(pathname, 'https://www.textpad.cloud')
                    wwwUrlFallback.search = request.nextUrl.search
                    return applyCors(NextResponse.redirect(wwwUrlFallback))
                }
            }

            if (pathname === '/' || pathname === '') {
                return applyCors(NextResponse.rewrite(new URL(`/public/archive/${subdomain}`, request.url)))
            }

            return applyCors(NextResponse.next())
        }
    }

    // Skip auth for static files
    const staticFileExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico', '.css', '.js', '.woff', '.woff2', '.ttf', '.eot', '.json']
    if (staticFileExtensions.some(ext => pathname.toLowerCase().endsWith(ext)) || pathname.includes('/_next/')) {
        return applyCors(NextResponse.next())
    }

    // Skip auth for public routes
    const publicPaths = [
        '/', '/auth', '/api/auth', '/api/migrate', '/public',
        '/api/public', '/online-text-editor', '/features',
        '/featured', '/robots.txt', '/sitemap.xml', '/privacy', '/terms', '/credits',
        '/fr', '/en', '/feed', '/api/feed', '/api/documents', '/api/ipfs', '/api/unfurl', '/api/contact',
        '/api/debug/doc', '/api/cron', '/api/migrate-ipfs'
    ]

    if (publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'))) {
        return applyCors(NextResponse.next())
    }

    // Protected paths
    const protectedPaths = [
        '/drive', '/settings', '/admin', '/documents',
        '/api/documents', '/api/folders', '/api/users', '/api/admin'
    ]

    const requiresAuth = protectedPaths.some(path => pathname === path || pathname.startsWith(path + '/'))

    if (requiresAuth) {
        const session = await auth()
        if (!session) {
            if (pathname.startsWith('/api/')) {
                return applyCors(new NextResponse(
                    JSON.stringify({ error: 'Unauthorized' }),
                    { status: 401, headers: { 'Content-Type': 'application/json' } }
                ))
            }
            const signInUrl = new URL('/auth/signin', request.url)
            signInUrl.searchParams.set('callbackUrl', pathname)
            return applyCors(NextResponse.redirect(signInUrl))
        }
    }

    return applyCors(NextResponse.next())
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
