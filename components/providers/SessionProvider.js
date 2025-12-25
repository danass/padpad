'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { useState, useEffect, createContext, useContext } from 'react'

// Mock session context that mimics NextAuth's useSession return value
const MockSessionContext = createContext({
  data: null,
  status: 'unauthenticated',
  update: async () => null,
})

// Hook to check if we should use mock session (for subdomains)
export function useMockSession() {
  return useContext(MockSessionContext)
}

// Check subdomain synchronously (for initial render decision)
function getIsSubdomain() {
  if (typeof window === 'undefined') return false
  const hostname = window.location.hostname
  const match = hostname.match(/^([a-z0-9_-]+)\.textpad\.cloud$/i)
  return match && match[1].toLowerCase() !== 'www'
}

export default function SessionProvider({ children }) {
  // Check subdomain on client only
  const [isSubdomain, setIsSubdomain] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setIsSubdomain(getIsSubdomain())
    setHydrated(true)
  }, [])

  // If we haven't hydrated yet, we don't know if we're on a subdomain.
  // To avoid hydration mismatch, we must render a consistent initial state.
  // We'll render the NextAuthSessionProvider by default, but it might trigger a fetch.
  // Actually, a better way is to check synchronously if possible (which we do in getIsSubdomain but that's for window).

  if (!hydrated) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>
  }

  // On subdomains: use mock context ONLY, no NextAuth provider
  if (isSubdomain) {
    return (
      <MockSessionContext.Provider value={{ data: null, status: 'unauthenticated', update: async () => null }}>
        {children}
      </MockSessionContext.Provider>
    )
  }

  // On main domain: use NextAuth provider
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
