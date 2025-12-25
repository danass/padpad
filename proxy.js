import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export async function proxy(request) {
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

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
