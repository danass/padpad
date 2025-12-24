import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export async function proxy(request) {
  const session = await auth()
  const { pathname } = request.nextUrl

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
    '/((?!api/auth|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}




