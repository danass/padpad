import { neon } from '@neondatabase/serverless'

// Database URLs from environment
const PRIMARY_DB_URL = process.env.POSTGRES_URL_PRIMARY
const SECONDARY_DB_URL = process.env.POSTGRES_URL_SECONDARY || process.env.POSTGRES_URL

// In-memory flag to track if primary is down (resets on cold start)
let primaryDbDown = false

/**
 * Get a database connection, with automatic fallback to secondary if primary fails
 * @returns {Object} { query: Function, isPrimary: boolean }
 */
export function getDb() {
    const primaryUrl = PRIMARY_DB_URL
    const secondaryUrl = SECONDARY_DB_URL

    // If we know primary is down, skip it
    if (primaryDbDown && secondaryUrl) {
        console.log('[DB] Using secondary DB (primary known to be down)')
        const secondarySql = neon(secondaryUrl)
        return {
            query: async (text, params) => {
                try {
                    return await secondarySql(text, params)
                } catch (error) {
                    console.error('[DB Secondary] Query error:', error.message)
                    throw error
                }
            },
            isPrimary: false
        }
    }

    // Try primary first
    if (primaryUrl) {
        const primarySql = neon(primaryUrl)
        const secondarySql = secondaryUrl ? neon(secondaryUrl) : null

        return {
            query: async (text, params) => {
                try {
                    return await primarySql(text, params)
                } catch (error) {
                    // Check if it's a quota exceeded error
                    if (error.message?.includes('exceeded') ||
                        error.message?.includes('quota') ||
                        error.message?.includes('limit')) {
                        console.warn('[DB Primary] Quota exceeded, falling back to secondary')
                        primaryDbDown = true

                        // Try secondary if available
                        if (secondarySql) {
                            try {
                                return await secondarySql(text, params)
                            } catch (secondaryError) {
                                console.error('[DB Secondary] Query error:', secondaryError.message)
                                throw secondaryError
                            }
                        }
                    }
                    throw error
                }
            },
            isPrimary: true
        }
    }

    // Fallback: use secondary only
    if (secondaryUrl) {
        const secondarySql = neon(secondaryUrl)
        return {
            query: async (text, params) => secondarySql(text, params),
            isPrimary: false
        }
    }

    throw new Error('No database URL configured')
}

/**
 * Simple query function that uses the fallback system
 */
export async function query(text, params = []) {
    const db = getDb()
    return db.query(text, params)
}

/**
 * Reset primary DB status (for testing or manual reset)
 */
export function resetPrimaryStatus() {
    primaryDbDown = false
}

/**
 * Check if primary DB is currently marked as down
 */
export function isPrimaryDown() {
    return primaryDbDown
}
