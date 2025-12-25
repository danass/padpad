import { NextResponse } from 'next/server'

export function middleware(request) {
    const response = NextResponse.next()

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
    }

    return response
}

export const config = {
    matcher: '/api/auth/:path*',
}
