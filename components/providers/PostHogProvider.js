'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PostHogProvider({ children }) {
    useEffect(() => {
        const key = process.env.NEXT_PUBLIC_POSTHOG_KEY

        if (typeof window !== 'undefined' && key) {
            posthog.init(key, {
                api_host: '/ingest',
                ui_host: 'https://eu.posthog.com',
                person_profiles: 'identified_only',
                capture_pageview: false,
                capture_pageleave: true,
                defaults: '2025-11-30',
            })
        }
    }, [])

    return <PHProvider client={posthog}>{children}</PHProvider>
}
