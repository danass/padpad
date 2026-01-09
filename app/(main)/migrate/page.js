'use client'


import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function MigratePage() {
  const { data: session, status } = useSession() || {}
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [adminEmail, setAdminEmail] = useState('')
  const [adminsExist, setAdminsExist] = useState(false)
  const [checking, setChecking] = useState(true)
  const [schemaStatus, setSchemaStatus] = useState(null)
  const [schemaChecking, setSchemaChecking] = useState(true)

  const checkSchema = async () => {
    setSchemaChecking(true)
    try {
      const response = await fetch('/api/migrate/check')
      if (response.ok) {
        const data = await response.json()
        setSchemaStatus(data)
      }
    } catch (error) {
      console.error('Error checking schema:', error)
    } finally {
      setSchemaChecking(false)
    }
  }

  const runFullMigration = async () => {
    setLoading(true)
    setResult(null)

    try {
      // Run main migration
      const mainResponse = await fetch('/api/migrate', { method: 'POST' })
      const mainData = await mainResponse.json()

      // Run featured migration
      const featuredResponse = await fetch('/api/migrate-featured')
      const featuredData = await featuredResponse.json()

      setResult({
        success: mainData.success && (featuredData.success !== false),
        message: 'All migrations completed successfully!',
        details: {
          main: mainData,
          featured: featuredData
        }
      })

      // Re-check schema after migration
      await checkSchema()
    } catch (error) {
      setResult({ success: false, error: error.message })
    } finally {
      setLoading(false)
      checkAdminsExist()
    }
  }

  const setupAdmin = async () => {
    const email = adminEmail || session?.user?.email
    if (!email || !email.includes('@')) {
      setResult({ success: false, error: 'Please enter a valid email address' })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()
      setResult(data)
      if (data.success) {
        setAdminEmail('')
        checkAdminsExist()
      }
    } catch (error) {
      setResult({ success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const checkAdminsExist = async () => {
    try {
      const response = await fetch('/api/admin/check-exists')
      if (response.ok) {
        const data = await response.json()
        setAdminsExist(data.exists)
      }
    } catch (error) {
      console.error('Error checking admins:', error)
    } finally {
      setChecking(false)
    }
  }

  useEffect(() => {
    checkAdminsExist()
    checkSchema()
  }, [])

  // Redirect non-admins (but allow access if no admins exist yet for initial setup)
  useEffect(() => {
    if (status === 'loading' || checking) return

    // If admins exist and user is not logged in or not admin, redirect
    if (adminsExist) {
      if (status === 'unauthenticated') {
        router.replace('/auth/signin?callbackUrl=/migrate')
        return
      }
      if (session && !session.user?.isAdmin) {
        router.replace('/')
        return
      }
    }
  }, [status, session, adminsExist, checking, router])

  // Determine if we should show the migration button
  const isFullyMigrated = schemaStatus?.isFullyMigrated === true

  // Show loading while checking auth
  if (status === 'loading' || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Block non-admins if admins exist
  if (adminsExist && (!session || !session.user?.isAdmin)) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-8">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <img src="/padpad.png" alt="Textpad" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Database Setup</h1>
        </div>

        <p className="mb-6 text-gray-600 text-center text-sm">
          Creates all tables and indexes. Safe to run multiple times.
        </p>

        {/* Migration Button - show loading during check, hide if not needed */}
        {schemaChecking ? (
          <div className="w-full px-6 py-3 bg-gray-100 text-gray-500 rounded-lg text-center font-medium mb-6 flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
            Checking...
          </div>
        ) : isFullyMigrated || result?.success ? (
          <div className="w-full px-6 py-3 bg-green-100 text-green-700 rounded-lg text-center font-medium mb-6">
            ✓ Database ready!
          </div>
        ) : (
          <button
            onClick={runFullMigration}
            disabled={loading}
            className="w-full px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors mb-6"
          >
            {loading ? 'Running...' : '🚀 Run Migration'}
          </button>
        )}

        {/* Admin Setup - only shown if no admins exist */}
        {!checking && !adminsExist && (
          <div className="border-t pt-6">
            <h2 className="text-sm font-semibold mb-3 text-gray-700">Add First Admin</h2>
            <div className="flex gap-2">
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder={session?.user?.email || "admin@email.com"}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
              <button
                onClick={setupAdmin}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Admin exists indicator */}
        {!checking && adminsExist && (
          <div className="text-center text-sm text-green-600 mb-4">
            ✓ Admin already configured
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`mt-4 p-4 rounded-lg ${result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            <p className="font-medium">
              {result.success ? '✓ ' + (result.message || 'Success!') : '✗ ' + (result.error || 'Failed')}
            </p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t text-center">
          <a href="/" className="text-blue-500 hover:text-blue-600 text-sm">
            ← Back to Home
          </a>
        </div>
      </div>
    </div >
  )
}
