'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/components/ui/toast'
import { useLanguage } from '@/app/i18n/LanguageContext'

export default function SettingsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  const { t } = useLanguage()

  // Data states
  const [birthDate, setBirthDate] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [testamentUsername, setTestamentUsername] = useState('')

  // Original values for comparison
  const [originalBirthDate, setOriginalBirthDate] = useState('')
  const [originalAvatarUrl, setOriginalAvatarUrl] = useState('')
  const [originalUsername, setOriginalUsername] = useState('')

  // UI states
  const [loading, setLoading] = useState(true)
  const [savingAvatar, setSavingAvatar] = useState(false)
  const [savingUsername, setSavingUsername] = useState(false)
  const [savingBirthDate, setSavingBirthDate] = useState(false)

  // Track if values have changed
  const avatarChanged = avatarUrl !== originalAvatarUrl
  const usernameChanged = testamentUsername !== originalUsername
  const birthDateChanged = birthDate !== originalBirthDate

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
          const date = new Date(birthData.birth_date)
          const formatted = date.toISOString().split('T')[0]
          setBirthDate(formatted)
          setOriginalBirthDate(formatted)
        }
      }

      if (avatarResponse.ok) {
        const avatarData = await avatarResponse.json()
        setAvatarUrl(avatarData.avatar_url || '')
        setOriginalAvatarUrl(avatarData.avatar_url || '')
      }

      if (usernameResponse.ok) {
        const usernameData = await usernameResponse.json()
        setTestamentUsername(usernameData.testament_username || '')
        setOriginalUsername(usernameData.testament_username || '')
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAvatar = async () => {
    setSavingAvatar(true)
    try {
      const response = await fetch('/api/users/avatar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: avatarUrl || null })
      })

      if (response.ok) {
        setOriginalAvatarUrl(avatarUrl)
        showToast(t?.avatarSaved || 'Avatar saved', 'success')
        setTimeout(() => window.location.reload(), 500)
      } else {
        const data = await response.json()
        showToast(data.error || 'Failed to save avatar', 'error')
      }
    } catch (error) {
      showToast('Failed to save avatar', 'error')
    } finally {
      setSavingAvatar(false)
    }
  }

  const handleSaveUsername = async () => {
    setSavingUsername(true)
    try {
      const response = await fetch('/api/users/testament-username', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: testamentUsername || null })
      })

      if (response.ok) {
        setOriginalUsername(testamentUsername)
        showToast(t?.usernameSaved || 'Username saved', 'success')
      } else {
        const data = await response.json()
        showToast(data.error || 'Failed to save username', 'error')
      }
    } catch (error) {
      showToast('Failed to save username', 'error')
    } finally {
      setSavingUsername(false)
    }
  }

  const handleSaveBirthDate = async () => {
    setSavingBirthDate(true)
    try {
      const response = await fetch('/api/users/birth-date', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birth_date: birthDate || null })
      })

      if (response.ok) {
        setOriginalBirthDate(birthDate)
        if (birthDate) {
          const birth = new Date(birthDate)
          const age99 = new Date(birth)
          age99.setFullYear(birth.getFullYear() + 99)
          showToast(`Documents will become public on ${age99.toLocaleDateString()}`, 'success')
        } else {
          showToast('Digital Legacy disabled', 'success')
        }
      } else {
        showToast('Failed to save birth date', 'error')
      }
    } catch (error) {
      showToast('Failed to save birth date', 'error')
    } finally {
      setSavingBirthDate(false)
    }
  }

  const handleClearBirthDate = () => {
    setBirthDate('')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  const subdomainUrl = testamentUsername ? `https://${testamentUsername}.textpad.cloud` : null

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t?.settings || 'Settings'}</h1>
          <p className="text-sm text-gray-500">{t?.accountSettings || 'Manage your account settings'}</p>
        </div>

        {/* Profile Section */}
        <div className="bg-white border border-gray-200 rounded-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Avatar</label>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <img
                    src={avatarUrl || session?.user?.image || `https://api.dicebear.com/9.x/croodles/svg?seed=${encodeURIComponent(session?.user?.email || 'user')}`}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                    onError={(e) => {
                      e.target.src = `https://api.dicebear.com/9.x/croodles/svg?seed=${encodeURIComponent(session?.user?.email || 'user')}`
                    }}
                  />
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {session?.user?.image && (
                      <button
                        onClick={() => setAvatarUrl(session.user.image)}
                        className={`w-10 h-10 rounded-full border-2 overflow-hidden transition-all hover:scale-110 ${avatarUrl === session.user.image ? 'border-black ring-2 ring-black ring-offset-2' : 'border-gray-300'}`}
                        title="Use Google avatar"
                      >
                        <img src={session.user.image} alt="Google" className="w-full h-full object-cover" />
                      </button>
                    )}

                    <button
                      onClick={() => setAvatarUrl(`https://api.dicebear.com/9.x/croodles/svg?seed=${Math.random().toString(36).substring(2)}`)}
                      className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-gray-400 flex items-center justify-center bg-gray-50"
                      title="Random avatar"
                    >
                      🎨
                    </button>

                    <button
                      onClick={() => setAvatarUrl(`https://api.dicebear.com/9.x/pixel-art/svg?seed=${Math.random().toString(36).substring(2)}`)}
                      className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-gray-400 flex items-center justify-center bg-gray-50"
                      title="Pixel art avatar"
                    >
                      👾
                    </button>

                    <button
                      onClick={() => setAvatarUrl('')}
                      className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-red-400 flex items-center justify-center bg-gray-50"
                      title="Reset"
                    >
                      ✕
                    </button>

                    <div className="w-px h-8 bg-gray-200 mx-1" />

                    {/* Save button with state feedback */}
                    <button
                      onClick={handleSaveAvatar}
                      disabled={savingAvatar || !avatarChanged}
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${!avatarChanged
                          ? 'border-gray-200 bg-gray-100 cursor-default'
                          : 'border-black bg-black hover:bg-gray-800'
                        }`}
                      title={avatarChanged ? 'Save' : 'No changes'}
                    >
                      {savingAvatar ? (
                        <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <svg className={`w-5 h-5 ${avatarChanged ? 'text-white' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  </div>

                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="Or paste custom avatar URL..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Public Blog Section - PRIMARY */}
        <div className="bg-white border border-gray-200 rounded-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Public Blog</h2>
              <p className="text-sm text-gray-500">Get your own subdomain for public documents</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <p className="text-sm text-blue-900">
              Set a username to get your own public blog at <strong>username.textpad.cloud</strong>.
              All documents you mark as public will be listed there.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="hidden sm:inline-flex items-center px-3 py-2 text-sm text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md whitespace-nowrap">
                    https://
                  </span>
                  <input
                    type="text"
                    value={testamentUsername}
                    onChange={(e) => setTestamentUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    placeholder="your-name"
                    className="flex-1 px-3 py-2 border border-gray-300 sm:rounded-l-none rounded-md focus:ring-2 focus:ring-black text-sm"
                  />
                  <span className="hidden sm:inline-flex items-center px-3 py-2 text-sm text-gray-500 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md whitespace-nowrap">
                    .textpad.cloud
                  </span>
                </div>
              </div>

              {/* Save button with state feedback */}
              <button
                onClick={handleSaveUsername}
                disabled={savingUsername || !usernameChanged}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${!usernameChanged
                    ? 'bg-gray-100 text-gray-400 cursor-default'
                    : 'bg-black text-white hover:bg-gray-800'
                  }`}
              >
                {savingUsername ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {usernameChanged ? 'Save' : 'Saved'}
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Lowercase letters, numbers, hyphens, and underscores only.
            </p>

            {/* Show URL if username is set */}
            {originalUsername && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-xs font-medium text-green-800 mb-1">Your blog is live:</p>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://${originalUsername}.textpad.cloud`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-700 hover:text-green-900 underline break-all"
                  >
                    https://{originalUsername}.textpad.cloud
                  </a>
                  <button
                    onClick={() => navigator.clipboard.writeText(`https://${originalUsername}.textpad.cloud`)}
                    className="text-green-600 hover:text-green-800 p-1"
                    title="Copy URL"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Digital Legacy Section - SECONDARY/OPTIONAL */}
        <div className="bg-white border border-gray-200 rounded-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Digital Legacy</h2>
              <p className="text-sm text-gray-500">Optional: preserve your writings for future generations</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
            <p className="text-sm text-amber-900">
              Set your birth date to automatically make <strong>all documents public</strong> on your 99th birthday.
              This ensures your writings are preserved for future generations.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black text-sm"
              />

              {birthDate && (
                <button
                  onClick={handleClearBirthDate}
                  className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-red-400 bg-white hover:bg-red-50 flex items-center justify-center"
                  title="Remove birth date"
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              {/* Save button with state feedback */}
              <button
                onClick={handleSaveBirthDate}
                disabled={savingBirthDate || !birthDateChanged}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${!birthDateChanged
                    ? 'bg-gray-100 text-gray-400 cursor-default'
                    : 'bg-black text-white hover:bg-gray-800'
                  }`}
              >
                {savingBirthDate ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {birthDateChanged ? 'Save' : 'Saved'}
              </button>
            </div>

            {originalBirthDate ? (
              <p className="text-xs text-gray-500 mt-2">
                All documents will become public on {(() => {
                  const birth = new Date(originalBirthDate)
                  const age99 = new Date(birth)
                  age99.setFullYear(birth.getFullYear() + 99)
                  return age99.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                })()}
              </p>
            ) : (
              <p className="text-xs text-gray-400 mt-2 italic">
                No birth date set — documents will remain private unless marked public individually.
              </p>
            )}
          </div>

          {/* Preview link */}
          {originalBirthDate && originalUsername && (
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200">
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
          )}
        </div>
      </div>
    </div>
  )
}
