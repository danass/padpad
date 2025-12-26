'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PostHogProvider({ children }) {
    useEffect(() => {
        if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
            posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
                api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
                person_profiles: 'identified_only',
                capture_pageview: false, // We'll capture manually for SPA
                capture_pageleave: true,
                loaded: (posthog) => {
                    if (process.env.NODE_ENV === 'development') {
                        posthog.debug()
                    }
                }
            })
        }
    }, [])

    return <PHProvider client={posthog}>{children}</PHProvider>
}
