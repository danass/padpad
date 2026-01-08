'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useRef } from 'react'
import Analytics from '@/lib/analytics'

export default function PostHogAuthTracker() {
    const { data: session, status } = useSession()
    const hasIdentifiedRef = useRef(false)

    useEffect(() => {
        // Identify user once when they sign in
        if (status === 'authenticated' && session?.user && !hasIdentifiedRef.current) {
            Analytics.identify(
                session.user.email || session.user.id,
                {
                    email: session.user.email,
                    name: session.user.name,
                    avatar: session.user.image,
                    role: session.user.role,
                    isAdmin: session.user.isAdmin,
                }
            )
            hasIdentifiedRef.current = true
        }

        // Reset on logout
        if (status === 'unauthenticated' && hasIdentifiedRef.current) {
            Analytics.reset()
            hasIdentifiedRef.current = false
        }
    }, [status, session])

    return null
}
