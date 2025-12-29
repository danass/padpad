'use client'

/**
 * Shared cache for admin status to avoid multiple components 
 * fetching the same data repeatedly.
 */

const adminCache = {
    isAdmin: null,
    checkedAt: 0,
    userEmail: null,
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
    isFetching: false,
    fetchPromise: null
}

export async function getAdminStatus(userEmail) {
    const now = Date.now()

    // 1. If user changed, reset cache
    if (userEmail !== adminCache.userEmail) {
        adminCache.isAdmin = null
        adminCache.checkedAt = 0
        adminCache.userEmail = userEmail
    }

    // 2. Return cached value if valid
    if (adminCache.isAdmin !== null && (now - adminCache.checkedAt) < adminCache.CACHE_DURATION) {
        return adminCache.isAdmin
    }

    // 3. Deduplicate concurrent requests
    if (adminCache.isFetching) {
        return adminCache.fetchPromise
    }

    // 4. Fetch from API
    adminCache.isFetching = true
    adminCache.fetchPromise = (async () => {
        try {
            const response = await fetch('/api/admin/check')
            if (response.ok) {
                const data = await response.json()
                adminCache.isAdmin = !!data.isAdmin
                adminCache.checkedAt = Date.now()
            } else {
                adminCache.isAdmin = false
            }
        } catch (error) {
            console.error('Error checking admin status:', error)
            adminCache.isAdmin = false
        } finally {
            adminCache.isFetching = false
            adminCache.fetchPromise = null
        }
        return adminCache.isAdmin
    })()

    return adminCache.fetchPromise
}
