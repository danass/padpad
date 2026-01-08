'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'

export function PostHogProvider({ children }) {
    useEffect(() => {
        const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
        const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com'

        if (typeof window !== 'undefined' && key && !posthog.__loaded) {
            posthog.init(key, {
                api_host: host,
                person_profiles: 'identified_only',
                capture_pageview: false,
                capture_pageleave: true,
                disable_surveys: true,
                disable_web_experiments: true,
                persistence: 'localStorage',
            })
        }
    }, [])

    return <PHProvider client={posthog}>{children}</PHProvider>
}
