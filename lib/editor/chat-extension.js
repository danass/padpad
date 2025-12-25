import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import ChatComponent from '@/components/editor/ChatComponent'

export const ChatConversation = Node.create({
    name: 'chatConversation',

    group: 'block',

    draggable: true,
    selectable: true,
    atom: true,

    addAttributes() {
        return {
            messages: {
                default: [],
            },
            participants: {
                default: [],
            },
            title: {
                default: null,
            },
            currentUser: {
                default: 'Daniel',
            },
            // UI Customization
            template: {
                default: 'sober', // 'instagram' or 'sober' - default to sober as user prefers minimal
            },
            swapSides: {
                default: false,
            },
            hideStories: {
                default: false,
            },
            minMessageLength: {
                default: 0,
            },
            maxMessageLength: {
                default: 10000,
            },
            participantAlias: {
                default: null,
            },
            hideSenderName: {
                default: false,
            },
            showHeader: {
                default: false, // Header hidden by default
            },
            excludedMessageIds: {
                default: [], // Array of timestamp_ms to exclude
            },
            messageEdits: {
                default: {}, // { [timestamp_ms]: "edited content" }
            },
            hideTimestamps: {
                default: false, // Hide time on each message
            },
            hideDateSeparators: {
                default: false, // Hide date separators between days
            },
        }
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="chat-conversation"]',
            },
        ]
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'chat-conversation' })]
    },

    addNodeView() {
        return ReactNodeViewRenderer(ChatComponent)
    },

    addCommands() {
        return {
            setChatConversation: (options) => ({ commands }) => {
                return commands.insertContent({
                    type: this.name,
                    attrs: {
                        messages: options.messages || [],
                        participants: options.participants || [],
                        title: options.title || null,
                        currentUser: options.currentUser || 'Daniel',
                        template: options.template || 'sober',
                        swapSides: options.swapSides || false,
                        hideStories: options.hideStories || false,
                        minMessageLength: options.minMessageLength || 0,
                        maxMessageLength: options.maxMessageLength || 10000,
                        participantAlias: options.participantAlias || null,
                        hideSenderName: options.hideSenderName || false,
                        showHeader: options.showHeader || false,
                        excludedMessageIds: options.excludedMessageIds || [],
                        messageEdits: options.messageEdits || {},
                    },
                })
            },
        }
    },
})
