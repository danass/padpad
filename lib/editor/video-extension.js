import { Node, mergeAttributes } from '@tiptap/core'

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
        }
    },

    parseHTML() {
        return [
            {
                tag: 'video',
            },
        ]
    },

    renderHTML({ HTMLAttributes }) {
        return ['video', mergeAttributes(HTMLAttributes, {
            controls: HTMLAttributes.controls !== false,
            style: 'max-width: 100%; border-radius: 8px;',
        })]
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
})
