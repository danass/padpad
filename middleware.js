import { auth } from './auth'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  const session = await auth()
  const { pathname } = request.nextUrl

  // Allow access to auth pages, API auth routes, migration routes, and public routes
  if (pathname.startsWith('/auth') || 
      pathname.startsWith('/api/auth') || 
      pathname.startsWith('/api/migrate') ||
      pathname.startsWith('/public') ||
      pathname.startsWith('/api/public')) {
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
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}
