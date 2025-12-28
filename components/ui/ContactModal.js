'use client'

import { useState } from 'react'
import { X, Send, Loader2, CheckCircle } from 'lucide-react'

export default function ContactModal({ isOpen, onClose }) {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSending(true)

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, message }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to send message')
            }

            setSent(true)
            setTimeout(() => {
                onClose()
                setSent(false)
                setName('')
                setEmail('')
                setMessage('')
            }, 2000)
        } catch (err) {
            setError(err.message || 'Failed to send message')
        } finally {
            setSending(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {sent ? (
                    <div className="text-center py-8">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Message Sent!</h3>
                        <p className="text-gray-500">Thank you for contacting us. We'll get back to you soon.</p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Contact Us</h2>
                        <p className="text-gray-500 mb-6">Have a question or feedback? We'd love to hear from you.</p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Your name"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                                    placeholder="your@email.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    required
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all resize-none"
                                    placeholder="How can we help?"
                                />
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm">{error}</p>
                            )}

                            <button
                                type="submit"
                                disabled={sending}
                                className="w-full py-3 px-6 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {sending ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Send Message
                                    </>
                                )}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    )
}
