'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PostHogProvider({ children }) {
    useEffect(() => {
        const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
        const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com'

        if (typeof window !== 'undefined' && key) {
            posthog.init(key, {
                api_host: host,
                person_profiles: 'identified_only',
                capture_pageview: false,
                capture_pageleave: true,
                // Disable unused features to reduce bundle size
                disable_surveys: true,
                disable_web_experiments: true,
                autocapture: false,
                persistence: 'localStorage',
                defaults: '2025-11-30',
            })
        }
    }, [])

    return <PHProvider client={posthog}>{children}</PHProvider>
}
