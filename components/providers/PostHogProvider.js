'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect, useState } from 'react'

export function PostHogProvider({ children }) {
    const [ready, setReady] = useState(false)

    useEffect(() => {
        const key = process.env.NEXT_PUBLIC_POSTHOG_KEY

        console.log('[PostHog] Key:', key ? 'present' : 'MISSING')

        if (typeof window !== 'undefined' && key) {
            posthog.init(key, {
                api_host: '/ingest',
                ui_host: 'https://eu.posthog.com',
                person_profiles: 'identified_only',
                capture_pageview: false,
                capture_pageleave: true,
                defaults: '2025-11-30',
                loaded: (ph) => {
                    console.log('[PostHog] Loaded! Sending test event...')
                    ph.capture('posthog_test_event', { source: 'textpad_init' })
                    setReady(true)
                },
                bootstrap: {
                    distinctID: undefined,
                },
            })
        }
    }, [])

    return <PHProvider client={posthog}>{children}</PHProvider>
}
