'use client'

import posthog from 'posthog-js'

const Analytics = {
    // Identify user (for PostHog)
    identify: (userId, properties = {}) => {
        if (typeof window !== 'undefined' && posthog && posthog.identify) {
            posthog.identify(userId, properties)
        }
    },

    // Reset user identity
    reset: () => {
        if (typeof window !== 'undefined' && posthog && posthog.reset) {
            posthog.reset()
        }
    },
}

export default Analytics
