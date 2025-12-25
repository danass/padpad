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

// Custom session provider that doesn't fetch on subdomains
function NoopSessionProvider({ children }) {
  return (
    <MockSessionContext.Provider value={{ data: null, status: 'unauthenticated', update: async () => null }}>
      {children}
    </MockSessionContext.Provider>
  )
}

export default function SessionProvider({ children }) {
  // Start with null to avoid hydration mismatch - we'll determine on client
  const [isSubdomain, setIsSubdomain] = useState(null)

  useEffect(() => {
    setIsSubdomain(getIsSubdomain())
  }, [])

  // During SSR and initial hydration, render nothing special - 
  // just a simple wrapper that doesn't fetch
  if (isSubdomain === null) {
    // Return children wrapped in mock context to satisfy any useSession calls
    // without triggering actual fetch
    return (
      <MockSessionContext.Provider value={{ data: null, status: 'loading', update: async () => null }}>
        {children}
      </MockSessionContext.Provider>
    )
  }

  // On subdomains, don't use NextAuthSessionProvider at all to avoid decoding errors
  if (isSubdomain) {
    return <NoopSessionProvider>{children}</NoopSessionProvider>
  }

  // On www domain, use the real provider
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
