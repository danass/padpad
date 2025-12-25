import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import AudioComponent from '@/components/editor/AudioComponent'

export const Audio = Node.create({
    name: 'audio',

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
        }
    },

    parseHTML() {
        return [
            {
                tag: 'audio',
                getAttrs: (node) => ({
                    src: node.getAttribute('src'),
                    controls: node.hasAttribute('controls'),
                    autoplay: node.hasAttribute('autoplay'),
                    loop: node.hasAttribute('loop'),
                    muted: node.hasAttribute('muted'),
                }),
            },
        ]
    },

    renderHTML({ HTMLAttributes }) {
        return ['audio', mergeAttributes(HTMLAttributes, {
            controls: HTMLAttributes.controls !== false,
            style: 'width: 100%;',
        })]
    },

    addNodeView() {
        return ReactNodeViewRenderer(AudioComponent)
    },

    addCommands() {
        return {
            setAudio: (options) => ({ commands }) => {
                return commands.insertContent({
                    type: this.name,
                    attrs: options,
                })
            },
        }
    },
})
