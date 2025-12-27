import { Node, mergeAttributes, nodePasteRule } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import VideoComponent from '@/components/editor/VideoComponent'
import { Plugin, PluginKey } from 'prosemirror-state'

export const Video = Node.create({
    name: 'video',

    group: 'block',

    draggable: true,
    selectable: true,
    atom: true,

    addAttributes() {
        return {
            src: {
                default: null,
            },
            controls: {
                default: true,
            },
            autoplay: {
                default: false,
            },
            loop: {
                default: false,
            },
            muted: {
                default: false,
            },
            poster: {
                default: null,
            },
            width: {
                default: null,
            },
            align: {
                default: 'center',
            },
        }
    },

    parseHTML() {
        return [
            {
                tag: 'video',
                getAttrs: (node) => ({
                    src: node.getAttribute('src'),
                    controls: node.hasAttribute('controls'),
                    autoplay: node.hasAttribute('autoplay'),
                    loop: node.hasAttribute('loop'),
                    muted: node.hasAttribute('muted'),
                    poster: node.getAttribute('poster'),
                    width: node.getAttribute('width') ? parseInt(node.getAttribute('width')) : null,
                    align: node.getAttribute('data-align') || 'center',
                }),
            },
        ]
    },

    renderHTML({ HTMLAttributes, node }) {
        const attrs = mergeAttributes(HTMLAttributes, {
            controls: HTMLAttributes.controls !== false,
            style: 'max-width: 100%; border-radius: 8px;',
        })
        if (node.attrs.width) attrs.width = node.attrs.width
        if (node.attrs.align) attrs['data-align'] = node.attrs.align
        return ['video', attrs]
    },

    addNodeView() {
        return ReactNodeViewRenderer(VideoComponent)
    },

    addCommands() {
        return {
            setVideo: (options) => ({ commands }) => {
                return commands.insertContent({
                    type: this.name,
                    attrs: options,
                })
            },
        }
    },

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('videoPaste'),
                props: {
                    handlePaste: (view, event, slice) => {
                        const text = event.clipboardData?.getData('text/plain')?.trim()
                        const VIDEO_REGEX = /https?:\/\/\S+\.(mp4|webm|ogg|mov|mkv|avi)\b/gi

                        if (text && text.match(VIDEO_REGEX)) {
                            // Only trigger video render if we are on an empty line
                            const { state } = view
                            const { selection } = state
                            const { $from } = selection

                            const node = $from.parent
                            const isAtStartOfBlock = $from.parentOffset === 0
                            const isAtEndOfBlock = $from.parentOffset === node.content.size
                            const isBlockEmpty = node.content.size === 0

                            if (isBlockEmpty || (isAtStartOfBlock && isAtEndOfBlock)) {
                                event.preventDefault()

                                this.editor.commands.insertContent({
                                    type: 'video',
                                    attrs: {
                                        src: text,
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
