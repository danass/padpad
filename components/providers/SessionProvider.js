'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { createContext, useContext, useState, useEffect } from 'react'

// Context for subdomain mode where we don't have NextAuth
const SubdomainContext = createContext(false)

export function useIsSubdomain() {
  return useContext(SubdomainContext)
}

export default function SessionProvider({ children }) {
  const [isSubdomain, setIsSubdomain] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check if we're on a subdomain
    const hostname = window.location.hostname
    const subdomain = hostname.match(/^([a-z0-9_-]+)\.textpad\.cloud$/i)
    if (subdomain && subdomain[1].toLowerCase() !== 'www') {
      setIsSubdomain(true)
    }
  }, [])

  // Always render children immediately to avoid hydration issues
  // On subdomains, wrap with a mock session that returns empty data
  if (mounted && isSubdomain) {
    return (
      <SubdomainContext.Provider value={true}>
        <NextAuthSessionProvider
          basePath="/api/auth"
          session={null}
          refetchInterval={0}
          refetchOnWindowFocus={false}
        >
          {children}
        </NextAuthSessionProvider>
      </SubdomainContext.Provider>
    )
  }

  return (
    <SubdomainContext.Provider value={isSubdomain}>
      <NextAuthSessionProvider
        basePath="/api/auth"
        refetchInterval={5 * 60}
        refetchOnWindowFocus={false}
      >
        {children}
      </NextAuthSessionProvider>
    </SubdomainContext.Provider>
  )
}
