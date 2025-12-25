'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function ArchiveHeader({
    username,
    archiveId,
    documentCount,
    hasCustomUsername,
    ownerId
}) {
    const { data: session } = useSession()
    const [isEditing, setIsEditing] = useState(false)
    const [newUsername, setNewUsername] = useState('')
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)
    const [displayName, setDisplayName] = useState(username || archiveId)
    const [isCustom, setIsCustom] = useState(hasCustomUsername)

    // Check if current user owns this archive
    const isOwner = session?.user?.id === ownerId

    // Can edit only if: owner AND doesn't have custom username yet
    const canEdit = isOwner && !isCustom

    const handleSave = async () => {
        if (!newUsername.trim()) {
            setError('Username cannot be empty')
            return
        }

        const username = newUsername.trim().toLowerCase()

        // Validate format
        if (!/^[a-z0-9_-]+$/.test(username)) {
            setError('Only lowercase letters, numbers, hyphens and underscores allowed')
            return
        }

        if (username.length < 3) {
            setError('Username must be at least 3 characters')
            return
        }

        if (username.length > 30) {
            setError('Username must be less than 30 characters')
            return
        }

        setSaving(true)
        setError('')

        try {
            const response = await fetch('/api/users/testament-username', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            })

            const data = await response.json()

            if (response.ok) {
                setDisplayName(data.testament_username || username)
                setIsCustom(true)
                setIsEditing(false)
                // Redirect to new archive URL
                window.location.href = `/public/archive/${username}`
            } else {
                setError(data.error || 'Failed to save username')
            }
        } catch (err) {
            setError('Failed to save username')
        } finally {
            setSaving(false)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSave()
        } else if (e.key === 'Escape') {
            setIsEditing(false)
            setNewUsername('')
            setError('')
        }
    }

    return (
        <div className="mb-12 text-center">
            {isEditing ? (
                <div className="inline-block">
                    <div className="flex items-center gap-2">
                        <span className="text-3xl font-light text-gray-400">@</span>
                        <input
                            type="text"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value.toLowerCase())}
                            onKeyDown={handleKeyDown}
                            placeholder="your-username"
                            className="text-3xl font-light text-gray-900 bg-transparent border-b-2 border-gray-900 focus:outline-none px-1"
                            autoFocus
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    <div className="mt-3 flex gap-2 justify-center">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-4 py-1.5 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                            onClick={() => { setIsEditing(false); setError(''); }}
                            className="px-4 py-1.5 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <h1
                        className={`text-3xl font-light text-gray-900 mb-2 ${canEdit ? 'cursor-pointer hover:text-blue-600 transition-colors' : ''}`}
                        onClick={() => {
                            if (canEdit) {
                                setIsEditing(true)
                                setNewUsername(displayName)
                            }
                        }}
                        title={canEdit ? 'Click to set your custom username' : undefined}
                    >
                        @{displayName}
                        {canEdit && (
                            <span className="ml-2 text-sm text-gray-400 font-normal">
                                (click to customize)
                            </span>
                        )}
                    </h1>
                </>
            )}
            <p className="text-sm text-gray-500">
                {documentCount} document{documentCount > 1 ? 's' : ''} public{documentCount > 1 ? 's' : ''}
            </p>
        </div>
    )
}
