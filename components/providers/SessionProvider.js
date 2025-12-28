'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'

export default function SessionProvider({ children, session }) {
  // Always wrap in NextAuthSessionProvider
  // This ensures useSession() calls don't throw "must be wrapped" errors
  return (
    <NextAuthSessionProvider
      session={session}
      basePath="/api/auth"
      refetchInterval={5 * 60}
      refetchOnWindowFocus={false}
    >
      {children}
    </NextAuthSessionProvider>
  )
}


