'use client'

import { useState, useMemo } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import { MessageSquare, ExternalLink, ChevronDown, ChevronUp, Settings, X, Eye, EyeOff, Edit2, Check, Heart } from 'lucide-react'

// Context Menu Component
function ChatMenu({ position, onClose, settings, onSettingsChange, messages, excludedIds, onToggleExclusion }) {
    // Calculate message length stats
    const messageLengths = messages.map(m => (m.content || '').length)
    const minLen = Math.min(...messageLengths, 0)
    const maxLen = Math.max(...messageLengths, 100)

    return (
        <>
            <div className="fixed inset-0 z-50" onClick={onClose} />
            <div
                className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-[280px] max-h-[80vh] overflow-y-auto"
                style={{ top: position.y, left: position.x }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900 text-sm">Paramètres du chat</h4>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                </div>

                {/* Template */}
                <div className="mb-4">
                    <label className="text-xs font-medium text-gray-600 mb-2 block">Style</label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onSettingsChange({ template: 'instagram' })}
                            className={`flex-1 px-3 py-2 text-xs rounded-lg border transition-all ${settings.template === 'instagram'
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-transparent'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            Instagram
                        </button>
                        <button
                            onClick={() => onSettingsChange({ template: 'sober' })}
                            className={`flex-1 px-3 py-2 text-xs rounded-lg border transition-all ${settings.template === 'sober'
                                ? 'bg-gray-900 text-white border-transparent'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            Sobre
                        </button>
                    </div>
                </div>

                {/* Show Header */}
                <div className="mb-4 flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-600">Afficher l'en-tête</label>
                    <button
                        onClick={() => onSettingsChange({ showHeader: !settings.showHeader })}
                        className={`w-10 h-6 rounded-full transition-colors ${settings.showHeader ? 'bg-blue-500' : 'bg-gray-300'
                            }`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.showHeader ? 'translate-x-5' : 'translate-x-1'
                            }`} />
                    </button>
                </div>

                {/* Swap Sides */}
                <div className="mb-4 flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-600">Inverser les côtés</label>
                    <button
                        onClick={() => onSettingsChange({ swapSides: !settings.swapSides })}
                        className={`w-10 h-6 rounded-full transition-colors ${settings.swapSides ? 'bg-blue-500' : 'bg-gray-300'
                            }`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.swapSides ? 'translate-x-5' : 'translate-x-1'
                            }`} />
                    </button>
                </div>

                {/* Hide Stories */}
                <div className="mb-4 flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-600">Masquer les stories</label>
                    <button
                        onClick={() => onSettingsChange({ hideStories: !settings.hideStories })}
                        className={`w-10 h-6 rounded-full transition-colors ${settings.hideStories ? 'bg-blue-500' : 'bg-gray-300'
                            }`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.hideStories ? 'translate-x-5' : 'translate-x-1'
                            }`} />
                    </button>
                </div>

                {/* Hide Sender Name */}
                <div className="mb-4 flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-600">Masquer les noms</label>
                    <button
                        onClick={() => onSettingsChange({ hideSenderName: !settings.hideSenderName })}
                        className={`w-10 h-6 rounded-full transition-colors ${settings.hideSenderName ? 'bg-blue-500' : 'bg-gray-300'
                            }`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.hideSenderName ? 'translate-x-5' : 'translate-x-1'
                            }`} />
                    </button>
                </div>

                {/* Hide Timestamps */}
                <div className="mb-4 flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-600">Masquer les heures</label>
                    <button
                        onClick={() => onSettingsChange({ hideTimestamps: !settings.hideTimestamps })}
                        className={`w-10 h-6 rounded-full transition-colors ${settings.hideTimestamps ? 'bg-blue-500' : 'bg-gray-300'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.hideTimestamps ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                </div>

                {/* Hide Date Separators */}
                <div className="mb-4 flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-600">Masquer les dates</label>
                    <button
                        onClick={() => onSettingsChange({ hideDateSeparators: !settings.hideDateSeparators })}
                        className={`w-10 h-6 rounded-full transition-colors ${settings.hideDateSeparators ? 'bg-blue-500' : 'bg-gray-300'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.hideDateSeparators ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                </div>

                {/* Message Length Filter */}
                <div className="mb-4">
                    <label className="text-xs font-medium text-gray-600 mb-2 block">
                        Longueur min. ({settings.minMessageLength} car.)
                    </label>
                    <input
                        type="range"
                        min={minLen}
                        max={maxLen}
                        value={settings.minMessageLength}
                        onChange={(e) => onSettingsChange({ minMessageLength: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                {/* Participant Alias */}
                <div className="mb-4">
                    <label className="text-xs font-medium text-gray-600 mb-2 block">Renommer le contact</label>
                    <input
                        type="text"
                        placeholder="Nom d'origine..."
                        value={settings.participantAlias || ''}
                        onChange={(e) => onSettingsChange({ participantAlias: e.target.value || null })}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Message Selection */}
                <div className="border-t border-gray-100 pt-4 mt-4">
                    <label className="text-xs font-medium text-gray-600 mb-2 block">
                        Sélection des messages ({messages.length - excludedIds.length}/{messages.length})
                    </label>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                        {messages.slice().sort((a, b) => a.timestamp_ms - b.timestamp_ms).map((msg, i) => {
                            const isExcluded = excludedIds.includes(msg.timestamp_ms)
                            return (
                                <div
                                    key={msg.timestamp_ms}
                                    onClick={() => onToggleExclusion(msg.timestamp_ms)}
                                    className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-all ${isExcluded ? 'bg-gray-100 opacity-50' : 'hover:bg-gray-50'
                                        }`}
                                >
                                    {isExcluded ? (
                                        <EyeOff className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                    ) : (
                                        <Eye className="w-3 h-3 text-green-500 flex-shrink-0" />
                                    )}
                                    <span className={`text-xs truncate ${isExcluded ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                        {(msg.content || '[Story]').substring(0, 40)}...
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </>
    )
}

export default function ChatComponent({ node, updateAttributes, deleteNode, editor, selected }) {
    const {
        messages = [],
        participants = [],
        title,
        currentUser = 'Daniel',
        template = 'instagram',
        swapSides = false,
        hideStories = false,
        minMessageLength = 0,
        maxMessageLength = 10000,
        participantAlias = null,
        hideSenderName = false,
        showHeader = false,
        excludedMessageIds = [],
        messageEdits = {},
        hideTimestamps = false,
        hideDateSeparators = false,
    } = node.attrs

    const [isCollapsed, setIsCollapsed] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [menuPos, setMenuPos] = useState({ x: 0, y: 0 })
    const [editingMessageId, setEditingMessageId] = useState(null)
    const [editText, setEditText] = useState('')
    const [selectedMessageIds, setSelectedMessageIds] = useState([])
    const [selectMode, setSelectMode] = useState(false)

    // Get other participant's name
    const otherParticipant = participants.find(p => p.name !== currentUser)?.name || 'Unknown'
    const displayParticipant = participantAlias || otherParticipant

    // Process messages: detect "Liked a message" and add hearts
    const { processedMessages, likedMessageIds } = useMemo(() => {
        let sorted = [...messages].sort((a, b) => a.timestamp_ms - b.timestamp_ms)
        const likedIds = new Set()

        // Detect "Liked a message" patterns
        sorted.forEach((msg, index) => {
            if (msg.content === 'Liked a message' || msg.content?.toLowerCase()?.includes('liked a message')) {
                // Find the most recent message from the OTHER person before this one
                for (let i = index - 1; i >= 0; i--) {
                    if (sorted[i].sender_name !== msg.sender_name) {
                        likedIds.add(sorted[i].timestamp_ms)
                        break
                    }
                }
            }
        })

        return { processedMessages: sorted, likedMessageIds: likedIds }
    }, [messages])

    // Filter and sort messages
    const filteredMessages = useMemo(() => {
        let filtered = [...processedMessages]

        // Filter excluded
        filtered = filtered.filter(m => !excludedMessageIds.includes(m.timestamp_ms))

        // Filter "Liked a message" messages (we show hearts instead)
        filtered = filtered.filter(m => m.content !== 'Liked a message' && !m.content?.toLowerCase()?.includes('liked a message'))

        // Filter stories
        if (hideStories) {
            filtered = filtered.filter(m => !m.share?.link)
        }

        // Filter by length
        filtered = filtered.filter(m => {
            const len = (m.content || '').length
            return len >= minMessageLength && len <= maxMessageLength
        })

        return filtered
    }, [processedMessages, excludedMessageIds, hideStories, minMessageLength, maxMessageLength])

    // Format timestamp
    const formatDate = (timestamp_ms) => {
        const date = new Date(timestamp_ms)
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        })
    }

    // Format date separator
    const formatDateSeparator = (timestamp_ms) => {
        const date = new Date(timestamp_ms)
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        })
    }

    // Check if we need a date separator
    const needsDateSeparator = (index) => {
        if (index === 0) return true
        const prevDate = new Date(filteredMessages[index - 1].timestamp_ms).toDateString()
        const currDate = new Date(filteredMessages[index].timestamp_ms).toDateString()
        return prevDate !== currDate
    }

    // Context menu handler
    const handleContextMenu = (e) => {
        if (!editor?.isEditable) return
        e.preventDefault()
        e.stopPropagation()
        setMenuPos({ x: Math.min(e.clientX, window.innerWidth - 300), y: Math.min(e.clientY, window.innerHeight - 400) })
        setMenuOpen(true)
    }

    // Toggle message exclusion
    const toggleExclusion = (timestamp_ms) => {
        const newExcluded = excludedMessageIds.includes(timestamp_ms)
            ? excludedMessageIds.filter(id => id !== timestamp_ms)
            : [...excludedMessageIds, timestamp_ms]
        updateAttributes({ excludedMessageIds: newExcluded })
    }

    // Toggle message selection
    const toggleSelection = (timestamp_ms) => {
        if (selectedMessageIds.includes(timestamp_ms)) {
            setSelectedMessageIds(selectedMessageIds.filter(id => id !== timestamp_ms))
        } else {
            setSelectedMessageIds([...selectedMessageIds, timestamp_ms])
        }
    }

    // Delete selected messages
    const deleteSelected = () => {
        const newExcluded = [...new Set([...excludedMessageIds, ...selectedMessageIds])]
        updateAttributes({ excludedMessageIds: newExcluded })
        setSelectedMessageIds([])
        setSelectMode(false)
    }

    // Cancel selection
    const cancelSelection = () => {
        setSelectedMessageIds([])
        setSelectMode(false)
    }

    // Start editing a message
    const startEdit = (msg) => {
        setEditingMessageId(msg.timestamp_ms)
        setEditText(messageEdits[msg.timestamp_ms] || msg.content || '')
    }

    // Save edit
    const saveEdit = () => {
        if (editingMessageId) {
            updateAttributes({
                messageEdits: { ...messageEdits, [editingMessageId]: editText }
            })
            setEditingMessageId(null)
            setEditText('')
        }
    }

    // Get message content (with edits)
    const getContent = (msg) => messageEdits[msg.timestamp_ms] ?? msg.content

    // Alignment based on swapSides
    const getAlignment = (isCurrentUser) => {
        const userOnRight = !swapSides
        return (isCurrentUser === userOnRight) ? 'justify-end' : 'justify-start'
    }

    const isSober = template === 'sober'

    return (
        <NodeViewWrapper
            className={`chat-conversation-wrapper my-6 ${selected ? 'ring-2 ring-blue-500 rounded-xl' : ''}`}
            data-drag-handle
            onContextMenu={handleContextMenu}
        >
            <div className={`rounded-xl overflow-hidden ${isSober ? 'bg-white border border-gray-100' : 'bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-sm'
                }`}>
                {/* Header (optional) */}
                {showHeader && (
                    <div
                        className={`flex items-center justify-between px-4 py-3 cursor-pointer ${isSober ? 'bg-white border-b border-gray-100' : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                            }`}
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSober ? 'bg-gray-100' : 'bg-white/20'
                                }`}>
                                <MessageSquare className={`w-5 h-5 ${isSober ? 'text-gray-600' : 'text-white'}`} />
                            </div>
                            <div>
                                <h3 className={`font-semibold ${isSober ? 'text-gray-900' : 'text-white'}`}>
                                    {title || displayParticipant}
                                </h3>
                                <p className={`text-xs ${isSober ? 'text-gray-500' : 'text-white/80'}`}>
                                    {filteredMessages.length} messages
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {editor?.isEditable && (
                                <button onClick={(e) => { e.stopPropagation(); handleContextMenu(e); }}
                                    className={`p-1.5 rounded ${isSober ? 'hover:bg-gray-100' : 'hover:bg-white/20'}`}>
                                    <Settings className={`w-4 h-4 ${isSober ? 'text-gray-500' : 'text-white'}`} />
                                </button>
                            )}
                            <button className={`p-1 rounded ${isSober ? 'hover:bg-gray-100' : 'hover:bg-white/20'}`}>
                                {isCollapsed ? <ChevronDown className={`w-5 h-5 ${isSober ? 'text-gray-500' : 'text-white'}`} />
                                    : <ChevronUp className={`w-5 h-5 ${isSober ? 'text-gray-500' : 'text-white'}`} />}
                            </button>
                        </div>
                    </div>
                )}

                {/* Settings and Select buttons when no header */}
                {!showHeader && editor?.isEditable && (
                    <div className="absolute top-2 right-2 z-10 flex gap-1">
                        <button
                            onClick={() => setSelectMode(!selectMode)}
                            className={`p-1.5 rounded-full shadow-sm border ${selectMode ? 'bg-blue-500 text-white border-blue-500' : 'bg-white/80 hover:bg-white border-gray-200'}`}
                        >
                            <Check className={`w-4 h-4 ${selectMode ? 'text-white' : 'text-gray-500'}`} />
                        </button>
                        <button onClick={handleContextMenu}
                            className="p-1.5 bg-white/80 hover:bg-white rounded-full shadow-sm border border-gray-200">
                            <Settings className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>
                )}

                {/* Selection action bar */}
                {selectMode && selectedMessageIds.length > 0 && (
                    <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-2 bg-blue-500 text-white rounded-t-lg">
                        <span className="text-sm font-medium">{selectedMessageIds.length} sélectionné(s)</span>
                        <div className="flex gap-2">
                            <button onClick={cancelSelection} className="px-3 py-1 text-sm bg-white/20 hover:bg-white/30 rounded">
                                Annuler
                            </button>
                            <button onClick={deleteSelected} className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 rounded flex items-center gap-1">
                                <X className="w-3 h-3" /> Supprimer
                            </button>
                        </div>
                    </div>
                )}

                {/* Messages */}
                {(!showHeader || !isCollapsed) && (
                    <div className={`p-4 space-y-3 max-h-[600px] overflow-y-auto relative ${isSober ? 'bg-white' : ''}`}>
                        {filteredMessages.map((message, index) => {
                            const isCurrentUser = message.sender_name === currentUser
                            const showDateSeparator = needsDateSeparator(index)
                            const isEditing = editingMessageId === message.timestamp_ms
                            const content = getContent(message)

                            return (
                                <div key={`${message.timestamp_ms}-${index}`}>
                                    {showDateSeparator && !hideDateSeparators && (
                                        <div className="flex items-center justify-center my-4">
                                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${isSober ? 'bg-gray-50 text-gray-500 border border-gray-100' : 'bg-gray-200 text-gray-600'
                                                }`}>
                                                {formatDateSeparator(message.timestamp_ms)}
                                            </div>
                                        </div>
                                    )}

                                    <div className={`flex ${getAlignment(isCurrentUser)} group`}>
                                        <div
                                            className={`max-w-[75%] px-4 py-2 rounded-2xl relative cursor-pointer transition-all ${selectMode && selectedMessageIds.includes(message.timestamp_ms)
                                                ? 'ring-2 ring-blue-500 ring-offset-2'
                                                : ''
                                                } ${isSober
                                                    ? isCurrentUser ? 'bg-gray-900 text-white rounded-br-md' : 'bg-gray-50 text-gray-900 rounded-bl-md border border-gray-100'
                                                    : isCurrentUser ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md' : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md shadow-sm'
                                                }`}
                                            onClick={() => selectMode && toggleSelection(message.timestamp_ms)}
                                        >
                                            {/* Select checkbox in select mode */}
                                            {selectMode && (
                                                <div className={`absolute -top-2 -left-2 w-5 h-5 rounded-full flex items-center justify-center ${selectedMessageIds.includes(message.timestamp_ms) ? 'bg-blue-500 text-white' : 'bg-white border-2 border-gray-300'
                                                    }`}>
                                                    {selectedMessageIds.includes(message.timestamp_ms) && <Check className="w-3 h-3" />}
                                                </div>
                                            )}

                                            {/* Edit and Delete buttons (only in edit mode, not select mode) */}
                                            {editor?.isEditable && !isEditing && !selectMode && (
                                                <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); startEdit(message); }}
                                                        className={`p-1 rounded-full ${isCurrentUser ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-600'}`}
                                                    >
                                                        <Edit2 className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); toggleExclusion(message.timestamp_ms); }}
                                                        className={`p-1 rounded-full ${isCurrentUser ? 'bg-red-500 text-white' : 'bg-red-100 text-red-600'}`}
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            )}

                                            {/* Sender name */}
                                            {!isCurrentUser && !hideSenderName && (
                                                <p className={`text-xs font-medium mb-1 ${isSober ? 'text-gray-500' : 'text-purple-600'}`}>
                                                    {participantAlias || message.sender_name}
                                                </p>
                                            )}

                                            {/* Content or edit input */}
                                            {isEditing ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={editText}
                                                        onChange={(e) => setEditText(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                                                        className="flex-1 px-2 py-1 text-sm bg-white text-gray-900 rounded border focus:outline-none"
                                                        autoFocus
                                                    />
                                                    <button onClick={saveEdit} className="p-1 bg-green-500 text-white rounded">
                                                        <Check className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ) : (
                                                content && <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
                                            )}

                                            {/* Story link */}
                                            {message.share?.link && !hideStories && (
                                                <a href={message.share.link} target="_blank" rel="noopener noreferrer"
                                                    className={`flex items-center gap-1 text-xs mt-1 ${isSober
                                                        ? isCurrentUser ? 'text-gray-400' : 'text-gray-500'
                                                        : isCurrentUser ? 'text-blue-200' : 'text-blue-500'
                                                        }`}>
                                                    <ExternalLink className="w-3 h-3" /> Story
                                                </a>
                                            )}

                                            {/* Timestamp */}
                                            {!hideTimestamps && (
                                                <p className={`text-[10px] mt-1 ${isSober ? 'text-gray-400' : isCurrentUser ? 'text-blue-200' : 'text-gray-400'}`}>
                                                    {formatDate(message.timestamp_ms)}
                                                </p>
                                            )}

                                            {/* Heart if message was liked */}
                                            {likedMessageIds.has(message.timestamp_ms) && (
                                                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center">
                                                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Context Menu */}
            {menuOpen && (
                <ChatMenu
                    position={menuPos}
                    onClose={() => setMenuOpen(false)}
                    settings={{ template, swapSides, hideStories, minMessageLength, maxMessageLength, participantAlias, hideSenderName, showHeader, hideTimestamps, hideDateSeparators }}
                    onSettingsChange={updateAttributes}
                    messages={messages}
                    excludedIds={excludedMessageIds}
                    onToggleExclusion={toggleExclusion}
                />
            )}
        </NodeViewWrapper>
    )
}
