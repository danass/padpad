import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import LinkPreviewComponent from '@/components/editor/LinkPreviewComponent'
import { Plugin, PluginKey } from 'prosemirror-state'

// URL regex for detecting standalone URLs
const URL_REGEX = /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])$/

export const LinkPreview = Node.create({
    name: 'linkPreview',

    group: 'inline',
    inline: true,

    draggable: true,
    selectable: true,
    atom: true,

    addAttributes() {
        return {
            url: {
                default: null,
            },
            title: {
                default: null,
            },
            description: {
                default: null,
            },
            image: {
                default: null,
            },
            siteName: {
                default: null,
            },
            favicon: {
                default: null,
            },
            loading: {
                default: false,
            },
            size: {
                default: 's', // 'text', 'xs' (30px), 's' (100px), 'm' (300px), 'full'
            },
            showImage: {
                default: true,
            },
            textAlign: {
                default: 'left',
            },
        }
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="link-preview"]',
            },
        ]
    },

    renderHTML({ HTMLAttributes }) {
        const { textAlign, ...rest } = HTMLAttributes
        const style = textAlign ? `text-align: ${textAlign}` : null
        return ['div', mergeAttributes(rest, { 'data-type': 'link-preview', style })]
    },

    addNodeView() {
        return ReactNodeViewRenderer(LinkPreviewComponent)
    },

    addCommands() {
        return {
            setLinkPreview: (options) => ({ commands }) => {
                return commands.insertContent({
                    type: this.name,
                    attrs: {
                        url: options.url,
                        title: options.title || null,
                        description: options.description || null,
                        image: options.image || null,
                        siteName: options.siteName || null,
                        favicon: options.favicon || null,
                        loading: options.loading || false,
                    },
                })
            },
        }
    },

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('linkPreviewPaste'),
                props: {
                    handlePaste: (view, event, slice) => {
                        const text = event.clipboardData?.getData('text/plain')?.trim()

                        // Check if pasted content is a standalone URL
                        if (text && URL_REGEX.test(text)) {
                            // Check if current line is empty or only whitespace
                            const { state } = view
                            const { selection } = state
                            const { $from, empty } = selection

                            // Get the current node
                            const node = $from.parent
                            const isAtStartOfBlock = $from.parentOffset === 0
                            const isAtEndOfBlock = $from.parentOffset === node.content.size
                            const isBlockEmpty = node.content.size === 0

                            // Only trigger link preview if we are on an empty line or at a position 
                            // that looks like a standalone line intended for a preview
                            if (isBlockEmpty || (isAtStartOfBlock && isAtEndOfBlock)) {
                                event.preventDefault()

                                // Insert a link preview node with loading state
                                this.editor.commands.insertContent({
                                    type: 'linkPreview',
                                    attrs: {
                                        url: text,
                                        loading: true,
                                    },
                                })

                                return true
                            }
                        }

                        return false
                    },
                },
            }),
        ]
    },
})
