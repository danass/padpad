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

  // On subdomains after hydration: use mock context to avoid NextAuth fetches
  // But we still wrap with NextAuthSessionProvider as outer to provide context
  const content = (hydrated && isSubdomain) ? (
    <MockSessionContext.Provider value={{ data: null, status: 'unauthenticated', update: async () => null }}>
      {children}
    </MockSessionContext.Provider>
  ) : children

  return (
    <NextAuthSessionProvider
      basePath="/api/auth"
      refetchInterval={isSubdomain ? 0 : 5 * 60}
      refetchOnWindowFocus={false}
    >
      {content}
    </NextAuthSessionProvider>
  )
}
