import { Node, mergeAttributes } from '@tiptap/core'

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
            },
        ]
    },

    renderHTML({ HTMLAttributes }) {
        return ['audio', mergeAttributes(HTMLAttributes, {
            controls: HTMLAttributes.controls !== false,
            style: 'width: 100%;',
        })]
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
