'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'

export default function SessionProvider({ children }) {
  return (
    <NextAuthSessionProvider
      basePath="/api/auth"
      refetchInterval={5 * 60} // Refetch every 5 minutes instead of constantly
      refetchOnWindowFocus={false} // Don't refetch when window regains focus
    >
      {children}
    </NextAuthSessionProvider>
  )
}




