'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'

export default function SessionProvider({ children }) {
  // Check if we're on a subdomain - if so, skip session fetching entirely
  const isSubdomain = typeof window !== 'undefined' &&
    window.location.hostname.match(/^[a-z0-9_-]+\.textpad\.cloud$/i) &&
    !window.location.hostname.startsWith('www.')

  // On subdomains, just render children without session provider
  if (isSubdomain) {
    return <>{children}</>
  }

  return (
    <NextAuthSessionProvider
      basePath="/api/auth"
      refetchInterval={5 * 60}
      refetchOnWindowFocus={false}
    >
      {children}
    </NextAuthSessionProvider>
  )
}
