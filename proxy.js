import { auth } from '@/auth'
import { NextResponse } from 'next/server'

const BLOCKED_PATHS = [
    '/wp-admin',
    '/wp-login',
    '/wordpress',
    '/wp-content',
    '/wp-includes',
    '/xmlrpc.php',
    '/.env',
    '/.git',
    '/.well-known',
    '/phpmyadmin',
    '/admin/setup-config.php',
    '/setup-config.php',
    '/wp-admin/setup-config.php'
]

export async function proxy(request) {
    const { pathname, hostname } = request.nextUrl

    // 1. Bot Defense - Block common attack vectors immediately
    if (BLOCKED_PATHS.some(path => pathname.toLowerCase().startsWith(path))) {
        return new NextResponse(null, { status: 404 })
    }

    const origin = request.headers.get('origin')
    const allowedOrigins = [
        'https://textpad.cloud',
        'https://textpad.com',
        'https://www.textpad.cloud',
        'https://www.textpad.com',
        'http://localhost:3000',
        // PostHog analytics
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
        // Add Vary header for compression audits
        const existingVary = res.headers.get('Vary')
        if (!existingVary) {
            res.headers.set('Vary', 'Accept-Encoding')
        } else if (!existingVary.includes('Accept-Encoding')) {
            res.headers.set('Vary', `${existingVary}, Accept-Encoding`)
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
    const isLocalhost = hostname === 'localhost' || hostname.includes('127.0.0.1')
    const textpadMatch = hostname.match(/^([a-z0-9_-]+)\.textpad\.cloud$/i)
    if (!isLocalhost && textpadMatch) {
        const subdomain = textpadMatch[1].toLowerCase()
        if (subdomain !== 'www') {
            // For auth routes on subdomain, proxy to www instead of redirecting
            if (pathname.startsWith('/auth') || pathname.startsWith('/api/auth')) {
                const wwwUrl = new URL(pathname, 'https://www.textpad.cloud')
                wwwUrl.search = request.nextUrl.search

                try {
                    // Clone the request headers
                    const headers = new Headers(request.headers)
                    headers.set('Host', 'www.textpad.cloud')

                    const proxyResponse = await fetch(wwwUrl.toString(), {
                        method: request.method,
                        headers: headers,
                        body: request.method === 'POST' ? await request.arrayBuffer() : undefined,
                        redirect: 'manual'
                    })

                    // Create response from proxy results
                    const responseHeaders = new Headers(proxyResponse.headers)
                    // We will re-apply CORS to these headers via applyCors
                    const response = new NextResponse(proxyResponse.body, {
                        status: proxyResponse.status,
                        headers: responseHeaders
                    })

                    return applyCors(response)
                } catch (error) {
                    console.error('Proxy error:', error)
                    // Fallback to redirect if proxy fails
                    const wwwUrlFallback = new URL(pathname, 'https://www.textpad.cloud')
                    wwwUrlFallback.search = request.nextUrl.search
                    return applyCors(NextResponse.redirect(wwwUrlFallback))
                }
            }

            // ONLY for root path, rewrite to user's archive page
            if (pathname === '/' || pathname === '') {
                return applyCors(NextResponse.rewrite(new URL(`/public/archive/${subdomain}`, request.url)))
            }

            // For ALL other paths, return response with CORS
            return applyCors(NextResponse.next())
        }
    }

    // Auth check for main domain and other cases
    const session = await auth()

    // Allow access to static files
    const staticFileExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico', '.css', '.js', '.woff', '.woff2', '.ttf', '.eot']
    if (staticFileExtensions.some(ext => pathname.toLowerCase().endsWith(ext))) {
        return applyCors(NextResponse.next())
    }

    // Allow access to public routes and root page
    const publicPaths = [
        '/', '/auth', '/api/auth', '/api/migrate', '/public',
        '/api/public', '/online-text-editor', '/features',
        '/featured', '/robots.txt', '/sitemap.xml', '/privacy', '/terms', '/credits',
        '/fr', '/en', '/feed', '/api/feed', '/api/documents', '/api/ipfs', '/api/unfurl', '/api/contact'
    ]

    if (publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'))) {
        return applyCors(NextResponse.next())
    }

    // List of paths that REQUIRE authentication
    const protectedPaths = [
        '/drive', '/settings', '/admin', '/documents',
        '/api/documents', '/api/folders', '/api/users', '/api/admin'
    ]

    const requiresAuth = protectedPaths.some(path => pathname === path || pathname.startsWith(path + '/'))

    // Require authentication ONLY for protected paths
    if (requiresAuth && !session) {
        // Return 401 for API routes instead of redirecting
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

    // For everything else (including junk URLs), let Next.js handle it (showing 404 if non-existent)
    return applyCors(NextResponse.next())
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
