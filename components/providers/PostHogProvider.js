'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { usePathname } from 'next/navigation'

export function PostHogProvider({ children }) {
    const pathname = usePathname()

    useEffect(() => {
        const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
        const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com'

        if (typeof window !== 'undefined' && key) {
            const initPostHog = () => {
                // Only enable session recording on critical app pages to save main thread on landing
                const shouldRecord = pathname?.startsWith('/doc/') || pathname?.startsWith('/drive')

                posthog.init(key, {
                    api_host: host,
                    person_profiles: 'identified_only',
                    capture_pageview: false,
                    capture_pageleave: true,
                    // Disable unused features to reduce bundle size
                    disable_surveys: true,
                    disable_web_experiments: true,
                    // Conditional session recording
                    disable_session_recording: !shouldRecord,
                    // autocapture enabled for heatmaps and session recordings
                    persistence: 'localStorage',
                    defaults: '2025-11-30',
                })
            }

            if (document.readyState === 'complete') {
                initPostHog()
            } else {
                window.addEventListener('load', initPostHog)
                return () => window.removeEventListener('load', initPostHog)
            }
        }
    }, [pathname])

    return <PHProvider client={posthog}>{children}</PHProvider>
}
