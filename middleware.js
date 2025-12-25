import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export async function middleware(request) {
    const response = NextResponse.next()

    // --- CORS LOGIC START ---
    const origin = request.headers.get('origin')
    // Allow requests from subdomains of textpad.cloud and textpad.com
    if (origin && (
        origin.endsWith('.textpad.cloud') ||
        origin.endsWith('.textpad.com') ||
        origin === 'https://textpad.cloud' ||
        origin === 'https://textpad.com' ||
        origin === 'https://www.textpad.cloud' ||
        origin === 'https://www.textpad.com'
    )) {
        response.headers.set('Access-Control-Allow-Origin', origin)
        response.headers.set('Access-Control-Allow-Credentials', 'true')
        response.headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

        // Handle preflight requests
        if (request.method === 'OPTIONS') {
            return response
        }
    }
    // --- CORS LOGIC END ---

    const { pathname, hostname } = request.nextUrl

    // Check for subdomain (e.g., username.textpad.cloud)
    const isLocalhost = hostname === 'localhost' || hostname.includes('127.0.0.1')

    // Check if this is a user subdomain (xxx.textpad.cloud where xxx is not www)
    const textpadMatch = hostname.match(/^([a-z0-9_-]+)\.textpad\.cloud$/i)
    if (!isLocalhost && textpadMatch) {
        const subdomain = textpadMatch[1].toLowerCase()

        // Skip www subdomain - treat as main domain
        if (subdomain !== 'www') {
            // For auth routes on subdomain, redirect to www
            if (pathname.startsWith('/auth') || pathname.startsWith('/api/auth')) {
                const wwwUrl = new URL(pathname, 'https://www.textpad.cloud')
                wwwUrl.search = request.nextUrl.search
                return NextResponse.redirect(wwwUrl)
            }

            // ONLY for root path, rewrite to user's archive page
            if (pathname === '/' || pathname === '') {
                return NextResponse.rewrite(new URL(`/public/archive/${subdomain}`, request.url))
            }

            // For ALL other paths, just let them through normally (no rewrite)
            // This means /public/doc/xxx will work the same as on www
            return NextResponse.next()
        }
    }

    // For main domain and other cases, continue with normal auth flow
    const session = await auth()

    // Allow access to static files (images, fonts, etc.)
    const staticFileExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico', '.css', '.js', '.woff', '.woff2', '.ttf', '.eot']
    if (staticFileExtensions.some(ext => pathname.toLowerCase().endsWith(ext))) {
        return NextResponse.next()
    }

    // Allow access to auth pages, API auth routes, migration routes, public routes, SEO routes, and root page
    if (pathname === '/' ||
        pathname.startsWith('/auth') ||
        pathname.startsWith('/api/auth') ||
        pathname.startsWith('/api/migrate') ||
        pathname.startsWith('/public') ||
        pathname.startsWith('/api/public') ||
        pathname.startsWith('/online-text-editor') ||
        pathname.startsWith('/features') ||
        pathname === '/featured' ||
        pathname === '/robots.txt' ||
        pathname === '/sitemap.xml' ||
        pathname === '/privacy' ||
        pathname === '/terms') {
        return NextResponse.next()
    }

    // Require authentication for all other pages
    if (!session) {
        const signInUrl = new URL('/auth/signin', request.url)
        signInUrl.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(signInUrl)
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
