'use client'

import { useState } from 'react'

export default function MigratePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  
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
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-8">
      <div className="max-w-2xl w-full bg-white border border-gray-200 rounded-md shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Database Migration</h1>
        
        <p className="mb-6 text-gray-600">
          This will create all necessary database tables, indexes, and functions.
          Safe to run multiple times - it will skip existing objects.
        </p>
        
        <button
          onClick={runMigration}
          disabled={loading}
          className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed mb-6 text-sm font-medium transition-colors"
        >
          {loading ? 'Running Migration...' : 'Run Migration'}
        </button>
        
        {result && (
          <div className={`p-4 rounded-lg ${
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




