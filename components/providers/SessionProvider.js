'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'

// Simple subdomain check that runs during render
function checkIsSubdomain() {
  if (typeof window === 'undefined') return false
  const hostname = window.location.hostname
  const match = hostname.match(/^([a-z0-9_-]+)\.textpad\.cloud$/i)
  return match && match[1].toLowerCase() !== 'www'
}

export default function SessionProvider({ children }) {
  // Always use NextAuth provider but configure differently for subdomains
  // On subdomains: set baseUrl to current domain to avoid cross-origin calls
  // The calls will fail silently with 404 which is fine

  return (
    <NextAuthSessionProvider
      basePath="/api/auth"
      refetchInterval={checkIsSubdomain() ? 0 : 5 * 60} // No refetch on subdomain
      refetchOnWindowFocus={false}
    >
      {children}
    </NextAuthSessionProvider>
  )
}
