'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/components/ui/toast'

function LegacyUrlDisplay({ username, slug, birthDate }) {
  const identifier = username || slug
  if (!identifier) return null
  
  const publicUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/public/testament/${identifier}`
    : `/public/testament/${identifier}`
  
  const age99Date = birthDate ? (() => {
    const birth = new Date(birthDate)
    const age99 = new Date(birth)
    age99.setFullYear(birth.getFullYear() + 99)
    return age99.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
  })() : null
  
  return (
    <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
      <p className="text-xs font-medium text-gray-700 mb-2">Your Legacy URL:</p>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-xs sm:text-sm font-mono bg-white px-3 py-2 rounded border border-gray-300 text-gray-900 break-all">
          {publicUrl}
        </code>
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(publicUrl)
            } catch (err) {
              const textArea = document.createElement('textarea')
              textArea.value = publicUrl
              textArea.style.position = 'fixed'
              textArea.style.opacity = '0'
              document.body?.appendChild(textArea)
              textArea.select()
              document.execCommand('copy')
              textArea.remove()
            }
          }}
          className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 flex items-center justify-center transition-all flex-shrink-0"
          title="Copy URL"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
      {age99Date && (
        <p className="text-xs text-gray-500 mt-2">
          This page will become accessible on {age99Date}.
        </p>
      )}
    </div>
  )
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  const [birthDate, setBirthDate] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [testamentUsername, setTestamentUsername] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingAvatar, setSavingAvatar] = useState(false)
  const [savingUsername, setSavingUsername] = useState(false)
  
  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }
    loadData()
  }, [session, router])
  
  const loadData = async () => {
    try {
      const [birthResponse, avatarResponse, usernameResponse] = await Promise.all([
        fetch('/api/users/birth-date'),
        fetch('/api/users/avatar'),
        fetch('/api/users/testament-username')
      ])
      
      if (birthResponse.ok) {
        const birthData = await birthResponse.json()
        if (birthData.birth_date) {
          // Format date for input (YYYY-MM-DD)
          const date = new Date(birthData.birth_date)
          setBirthDate(date.toISOString().split('T')[0])
        }
      }
      
      if (avatarResponse.ok) {
        const avatarData = await avatarResponse.json()
        setAvatarUrl(avatarData.avatar_url || '')
      }
      
      if (usernameResponse.ok) {
        const usernameData = await usernameResponse.json()
        setTestamentUsername(usernameData.testament_username || '')
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleSaveAvatar = async () => {
    setSavingAvatar(true)
    // Small delay for visual feedback
    await new Promise(r => setTimeout(r, 300))
    try {
      const response = await fetch('/api/users/avatar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: avatarUrl || null })
      })
      
      if (response.ok) {
        showToast('Avatar saved successfully', 'success')
        // Reload page to update avatar in header
        setTimeout(() => window.location.reload(), 500)
      } else {
        const data = await response.json()
        showToast(data.error || 'Failed to save avatar', 'error')
        setSavingAvatar(false)
      }
    } catch (error) {
      console.error('Error saving avatar:', error)
      showToast('Failed to save avatar', 'error')
      setSavingAvatar(false)
    }
  }
  
  const handleSaveUsername = async () => {
    setSavingUsername(true)
    await new Promise(r => setTimeout(r, 300))
    try {
      const response = await fetch('/api/users/testament-username', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: testamentUsername || null })
      })
      
      if (response.ok) {
        showToast('Username saved successfully', 'success')
        loadData()
      } else {
        const data = await response.json()
        showToast(data.error || 'Failed to save username', 'error')
      }
    } catch (error) {
      console.error('Error saving username:', error)
      showToast('Failed to save username', 'error')
    } finally {
      setSavingUsername(false)
    }
  }
  
  const handleSave = async () => {
    if (!birthDate) {
      showToast('Please enter your birth date', 'error')
      return
    }
    
    setSaving(true)
    await new Promise(r => setTimeout(r, 300))
    try {
      const response = await fetch('/api/users/birth-date', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birth_date: birthDate })
      })
      
      if (response.ok) {
        showToast('Birth date saved successfully', 'success')
        
        // Calculate and show 99th birthday
        const birth = new Date(birthDate)
        const age99 = new Date(birth)
        age99.setFullYear(birth.getFullYear() + 99)
        showToast(`Your documents will become public on ${age99.toLocaleDateString()} (your 99th birthday)`, 'success')
      } else {
        const data = await response.json()
        showToast(data.error || 'Failed to save birth date', 'error')
      }
    } catch (error) {
      console.error('Error saving birth date:', error)
      showToast('Failed to save birth date', 'error')
    } finally {
      setSaving(false)
    }
  }
  
  const handleClearBirthDate = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 300))
    try {
      const response = await fetch('/api/users/birth-date', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birth_date: null })
      })
      
      if (response.ok) {
        setBirthDate('')
        showToast('Digital Legacy disabled - your documents will remain private', 'success')
      } else {
        showToast('Failed to remove birth date', 'error')
      }
    } catch (error) {
      console.error('Error removing birth date:', error)
      showToast('Failed to remove birth date', 'error')
    } finally {
      setSaving(false)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-sm text-gray-500">Manage your account settings</p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile</h2>
          
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Avatar
              </label>
              <div className="flex items-start gap-4">
                {/* Avatar Preview */}
                <div className="flex-shrink-0">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Avatar" 
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                      onError={(e) => {
                        const defaultUrl = `https://api.dicebear.com/9.x/croodles/svg?seed=${encodeURIComponent(session?.user?.email || session?.user?.name || 'user')}`
                        e.target.src = defaultUrl
                        setAvatarUrl(defaultUrl)
                      }}
                    />
                  ) : (
                    <img 
                      src={session?.user?.image || `https://api.dicebear.com/9.x/croodles/svg?seed=${encodeURIComponent(session?.user?.email || session?.user?.name || 'user')}`}
                      alt="Default Avatar" 
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                    />
                  )}
                </div>
                
                {/* Avatar Options */}
                <div className="flex-1 space-y-3">
                  {/* Icon buttons row */}
                  <div className="flex items-center gap-2">
                    {/* Google Avatar (if available) */}
                    {session?.user?.image && (
                      <button
                        onClick={() => setAvatarUrl(session.user.image)}
                        className={`w-10 h-10 rounded-full border-2 overflow-hidden transition-all hover:scale-110 ${avatarUrl === session.user.image ? 'border-black ring-2 ring-black ring-offset-2' : 'border-gray-300 hover:border-gray-400'}`}
                        title="Use Google avatar"
                      >
                        <img src={session.user.image} alt="Google" className="w-full h-full object-cover" />
                      </button>
                    )}
                    
                    {/* Random Avatar */}
                    <button
                      onClick={() => {
                        const randomSeed = Math.random().toString(36).substring(2, 15)
                        setAvatarUrl(`https://api.dicebear.com/9.x/croodles/svg?seed=${randomSeed}`)
                      }}
                      className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-gray-400 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-all"
                      title="Generate random avatar"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                    
                    {/* Email-based Avatar */}
                    <button
                      onClick={() => {
                        const emailSeed = session?.user?.email || session?.user?.name || 'user'
                        setAvatarUrl(`https://api.dicebear.com/9.x/croodles/svg?seed=${encodeURIComponent(emailSeed)}`)
                      }}
                      className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-gray-400 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-all"
                      title="Use email-based avatar"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </button>
                    
                    {/* Clear */}
                    <button
                      onClick={() => setAvatarUrl('')}
                      className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-red-400 flex items-center justify-center bg-gray-50 hover:bg-red-50 transition-all"
                      title="Reset to default"
                    >
                      <svg className="w-5 h-5 text-gray-600 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    
                    {/* Separator */}
                    <div className="w-px h-8 bg-gray-200 mx-1" />
                    
                    {/* Save button */}
                    <button
                      onClick={handleSaveAvatar}
                      disabled={savingAvatar}
                      className="w-10 h-10 rounded-full border-2 border-black bg-black hover:bg-gray-800 flex items-center justify-center transition-all disabled:opacity-50"
                      title="Save avatar"
                    >
                      {savingAvatar ? (
                        <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  </div>
                  
                  {/* Custom URL input */}
                  <div>
                    <input
                      type="url"
                      id="avatar-url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="Or paste custom avatar URL..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Digital Legacy Section */}
        <div className="bg-white border border-gray-200 rounded-md p-6 mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Digital Legacy</h2>
              <p className="text-sm text-gray-500">Preserve your writings for future generations</p>
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
            <p className="text-sm text-amber-900">
              Your digital legacy is a collection of all your documents that will automatically become 
              accessible to the public on your <strong>99th birthday</strong>. This ensures your writings, 
              thoughts, and memories are preserved for future generations.
            </p>
          </div>
          
          <div className="space-y-6">
            {/* Birth Date */}
            <div>
              <label htmlFor="birth-date" className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  id="birth-date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm"
                />
                <button
                  onClick={handleSave}
                  disabled={saving || !birthDate}
                  className="w-10 h-10 rounded-full border-2 border-black bg-black hover:bg-gray-800 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  title="Save"
                >
                  {saving ? (
                    <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                {birthDate && (
                  <button
                    onClick={handleClearBirthDate}
                    disabled={saving}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-red-400 bg-white hover:bg-red-50 flex items-center justify-center transition-all disabled:opacity-50 flex-shrink-0"
                    title="Disable Digital Legacy"
                  >
                    <svg className="w-4 h-4 text-gray-500 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              {birthDate ? (
                <p className="text-xs text-gray-500 mt-2">
                  Publication date: {(() => {
                    const birth = new Date(birthDate)
                    const age99 = new Date(birth)
                    age99.setFullYear(birth.getFullYear() + 99)
                    return age99.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
                  })()}
                </p>
              ) : (
                <p className="text-xs text-gray-400 mt-2 italic">
                  No birth date set — your documents will remain private forever.
                </p>
              )}
            </div>
            
            {/* Custom URL */}
            <div>
              <label htmlFor="legacy-username" className="block text-sm font-medium text-gray-700 mb-2">
                Custom URL (optional)
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="hidden sm:inline-flex items-center px-3 py-2 text-sm text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md whitespace-nowrap">
                      /public/testament/
                    </span>
                    <input
                      type="text"
                      id="legacy-username"
                      value={testamentUsername}
                      onChange={(e) => setTestamentUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                      placeholder="your-name"
                      className="flex-1 px-3 py-2 border border-gray-300 sm:rounded-l-none rounded-md sm:rounded-r-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSaveUsername}
                  disabled={savingUsername}
                  className="w-10 h-10 rounded-full border-2 border-black bg-black hover:bg-gray-800 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  title="Save"
                >
                  {savingUsername ? (
                    <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Lowercase letters, numbers, hyphens, and underscores only.
              </p>
            </div>
            
            {/* Preview and URL Display */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-700">Preview your legacy page</p>
                <p className="text-xs text-gray-500">See how it will appear to visitors</p>
              </div>
              <Link
                href="/testament/preview"
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


