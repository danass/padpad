import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import LinkPreviewComponent from '@/components/editor/LinkPreviewComponent'

export const LinkPreview = Node.create({
    name: 'linkPreview',

    group: 'block',

    draggable: true,

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
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'link-preview' })]
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
})
