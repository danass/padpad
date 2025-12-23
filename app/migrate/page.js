'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function MigratePage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [adminEmail, setAdminEmail] = useState('')
  const [adminLoading, setAdminLoading] = useState(false)
  const [adminResult, setAdminResult] = useState(null)
  const [adminsExist, setAdminsExist] = useState(false)
  const [checkingAdmins, setCheckingAdmins] = useState(true)
  
  const runMigration = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/migrate', {
        method: 'POST'
      })
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }
  
  const runAdminMigration = async () => {
    setAdminLoading(true)
    setAdminResult(null)
    
    try {
      const response = await fetch('/api/migrate-admin', {
        method: 'POST'
      })
      
      const data = await response.json()
      setAdminResult(data)
    } catch (error) {
      setAdminResult({ success: false, error: error.message })
    } finally {
      setAdminLoading(false)
    }
  }
  
  const setupAdmin = async () => {
    if (!adminEmail || !adminEmail.includes('@')) {
      setAdminResult({ success: false, error: 'Please enter a valid email address' })
      return
    }
    
    setAdminLoading(true)
    setAdminResult(null)
    
    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail })
      })
      
      const data = await response.json()
      setAdminResult(data)
      if (data.success) {
        setAdminEmail('')
        // Check if admins exist now
        checkAdminsExist()
      }
    } catch (error) {
      setAdminResult({ success: false, error: error.message })
    } finally {
      setAdminLoading(false)
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
      setCheckingAdmins(false)
    }
  }

  useEffect(() => {
    checkAdminsExist()
  }, [])
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-8">
      <div className="max-w-2xl w-full bg-white border border-gray-200 rounded-md shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Database Migration</h1>
        
        <p className="mb-6 text-gray-600">
          This will create all necessary database tables, indexes, and functions.
          Safe to run multiple times - it will skip existing objects.
        </p>
        
        <div className="space-y-4 mb-6">
          <div>
            <button
              onClick={runMigration}
              disabled={loading}
              className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              {loading ? 'Running Migration...' : 'Run Migration'}
            </button>
          </div>
          
          {!checkingAdmins && !adminsExist && (
            <div className="border-t pt-4">
              <h2 className="text-lg font-semibold mb-3 text-gray-900">Admin Setup</h2>
              <p className="mb-4 text-sm text-gray-600">
                First, run the admin migration to create the admins table. Then add your first admin user.
              </p>
              
              <div className="mb-4">
                <button
                  onClick={runAdminMigration}
                  disabled={adminLoading}
                  className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors mb-3"
                >
                  {adminLoading ? 'Running...' : 'Run Admin Migration'}
                </button>
              </div>
              
              <div className="flex gap-2">
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder={session?.user?.email || "Enter admin email"}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <button
                  onClick={setupAdmin}
                  disabled={adminLoading || !adminEmail}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                >
                  {adminLoading ? 'Adding...' : 'Add Admin'}
                </button>
              </div>
            </div>
          )}
        </div>
        
        {result && (
          <div className={`p-4 rounded-lg mb-4 ${
            result.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <h2 className={`font-semibold mb-2 ${
              result.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {result.success ? '✓ Migration Successful' : '✗ Migration Failed'}
            </h2>
            
            {result.error && (
              <p className="text-red-600 mb-4">{result.error}</p>
            )}
            
            {result.results && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {result.results.map((r, i) => (
                  <div key={i} className="text-sm">
                    {r.success ? (
                      <span className="text-green-600">
                        ✓ {r.statement || r.message || 'Success'}
                      </span>
                    ) : (
                      <span className="text-red-600">
                        ✗ {r.error || 'Failed'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {adminResult && (
          <div className={`p-4 rounded-lg ${
            adminResult.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <h2 className={`font-semibold mb-2 ${
              adminResult.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {adminResult.success ? '✓ Admin Setup Successful' : '✗ Admin Setup Failed'}
            </h2>
            
            {adminResult.error && (
              <p className="text-red-600 mb-4">{adminResult.error}</p>
            )}
            
            {adminResult.message && (
              <p className="text-green-600 mb-4">{adminResult.message}</p>
            )}
            
            {adminResult.results && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {adminResult.results.map((r, i) => (
                  <div key={i} className="text-sm">
                    {r.success ? (
                      <span className="text-green-600">
                        ✓ {r.statement || r.message || 'Success'}
                      </span>
                    ) : (
                      <span className="text-red-600">
                        ✗ {r.error || 'Failed'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        <div className="mt-6 pt-6 border-t">
          <a
            href="/drive"
            className="text-blue-500 hover:text-blue-600"
          >
            ← Go to Drive
          </a>
        </div>
      </div>
    </div>
  )
}




