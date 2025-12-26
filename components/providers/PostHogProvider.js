'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PostHogProvider({ children }) {
    useEffect(() => {
        const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
        const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com'

        console.log('[PostHog] Initializing...', { key: key ? 'set' : 'missing', host })

        if (typeof window !== 'undefined' && key) {
            try {
                posthog.init(key, {
                    api_host: host,
                    person_profiles: 'identified_only',
                    capture_pageview: false,
                    capture_pageleave: true,
                    defaults: '2025-11-30',
                    loaded: (ph) => {
                        console.log('[PostHog] Loaded successfully')
                        if (process.env.NODE_ENV === 'development') {
                            ph.debug()
                        }
                    }
                })
            } catch (error) {
                console.error('[PostHog] Init error:', error)
            }
        } else {
            console.warn('[PostHog] Not initialized - key missing or not in browser')
        }
    }, [])

    return <PHProvider client={posthog}>{children}</PHProvider>
}
