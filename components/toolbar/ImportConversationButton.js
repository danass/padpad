'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Download } from 'lucide-react'

export default function ImportConversationButton({ editor, isAdmin = false }) {
    // Only show for admins
    if (!isAdmin) return null

    const [showDialog, setShowDialog] = useState(false)
    const [conversationId, setConversationId] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleImport = async () => {
        if (!conversationId.trim()) {
            setError('Please enter a conversation ID')
            return
        }

        setLoading(true)
        setError('')

        try {
            const response = await fetch(`http://localhost:8001/api/conversations/${conversationId}`)

            if (!response.ok) {
                throw new Error('Failed to fetch conversation')
            }

            const conversation = await response.json()

            // Convert conversation to TipTap nodes
            const nodes = convertConversationToNodes(conversation)

            // Insert into editor
            editor.chain().focus().insertContent(nodes).run()

            // Close dialog
            setShowDialog(false)
            setConversationId('')
        } catch (err) {
            setError(err.message || 'Failed to import conversation')
        } finally {
            setLoading(false)
        }
    }

    const convertConversationToNodes = (conversation) => {
        const nodes = []

        // Add title as heading
        nodes.push({
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: conversation.title }]
        })

        // Add timestamp
        nodes.push({
            type: 'paragraph',
            content: [{
                type: 'text',
                text: `Created: ${new Date(conversation.created_at).toLocaleString()}`,
                marks: [{ type: 'italic' }]
            }]
        })

        // Add messages
        conversation.messages.forEach((message) => {
            if (message.role === 'user') {
                // User message
                nodes.push({
                    type: 'heading',
                    attrs: { level: 3 },
                    content: [{ type: 'text', text: '👤 User' }]
                })
                nodes.push({
                    type: 'paragraph',
                    content: [{ type: 'text', text: message.content }]
                })
            } else if (message.role === 'assistant' && message.persona_responses) {
                // Assistant responses
                nodes.push({
                    type: 'heading',
                    attrs: { level: 3 },
                    content: [{ type: 'text', text: '🤖 Assistant' }]
                })

                // Add each persona response
                message.persona_responses.forEach((persona) => {
                    nodes.push({
                        type: 'heading',
                        attrs: { level: 4 },
                        content: [{
                            type: 'text',
                            text: persona.persona_name,
                            marks: [{ type: 'bold' }]
                        }]
                    })

                    // Split response by paragraphs and convert
                    const paragraphs = persona.response.split('\n\n')
                    paragraphs.forEach(para => {
                        if (para.trim()) {
                            nodes.push({
                                type: 'paragraph',
                                content: parseMarkdownText(para.trim())
                            })
                        }
                    })
                })
            }

            // Add separator
            nodes.push({
                type: 'horizontalRule'
            })
        })

        return nodes
    }

    // Parse markdown text with italics and bold
    const parseMarkdownText = (text) => {
        const nodes = []
        if (!text) return nodes

        // Simple manual parsing to handle **bold** and *italic*
        // We use a non-greedy regex to find markers
        const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g)

        parts.forEach(part => {
            if (!part) return

            if (part.startsWith('**') && part.endsWith('**')) {
                // Bold text
                const content = part.slice(2, -2)
                if (content) {
                    nodes.push({
                        type: 'text',
                        text: content,
                        marks: [{ type: 'bold' }]
                    })
                }
            } else if (part.startsWith('*') && part.endsWith('*')) {
                // Italic text
                const content = part.slice(1, -1)
                if (content) {
                    nodes.push({
                        type: 'text',
                        text: content,
                        marks: [{ type: 'italic' }]
                    })
                }
            } else {
                // Plain text
                nodes.push({
                    type: 'text',
                    text: part
                })
            }
        })

        return nodes.length > 0 ? nodes : [{ type: 'text', text: text }]
    }

    return (
        <>
            <button
                onClick={() => setShowDialog(true)}
                className="p-1.5 h-7 w-7 rounded-lg flex items-center justify-center transition-all text-gray-400 hover:bg-white hover:text-gray-900"
                title="Import Conversation"
            >
                <Download className="w-4 h-4" />
            </button>

            {showDialog && createPortal(
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]" style={{ position: 'fixed' }}>
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h2 className="text-lg font-semibold mb-4">Import Conversation</h2>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Conversation ID
                            </label>
                            <input
                                type="text"
                                value={conversationId}
                                onChange={(e) => setConversationId(e.target.value)}
                                placeholder="08d1bbf2-33d9-4bcf-92c8-7f2abde7d073"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={loading}
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setShowDialog(false)
                                    setConversationId('')
                                    setError('')
                                }}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleImport}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading ? 'Importing...' : 'Import'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    )
}
