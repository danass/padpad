'use client'

import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import CharacterCount from '@tiptap/extension-character-count'
import Dropcursor from '@tiptap/extension-dropcursor'
import Focus from '@tiptap/extension-focus'
import Gapcursor from '@tiptap/extension-gapcursor'
import Typography from '@tiptap/extension-typography'
import FileHandler from '@tiptap/extension-file-handler'
import FontFamily from '@tiptap/extension-font-family'
import ListKeymap from '@tiptap/extension-list-keymap'
import UniqueID from '@tiptap/extension-unique-id'
import Emoji from '@tiptap/extension-emoji'
import { Youtube } from '@/lib/editor/youtube-extension'
import { LinkPreview } from '@/lib/editor/link-preview-extension'
import { ChatConversation } from '@/lib/editor/chat-extension'
import { Video } from '@/lib/editor/video-extension'
import { Audio } from '@/lib/editor/audio-extension'
import { TaskList, TaskItem } from '@/lib/editor/task-list-extension'
import { ResizableImage } from '@/lib/editor/resizable-image-extension'
import { Drawing } from '@/lib/editor/drawing-extension'
import {
    DraggableParagraph,
    DraggableHeading,
    DraggableBulletList,
    DraggableOrderedList,
    DraggableBlockquote,
    DraggableCodeBlock,
} from '@/lib/editor/draggable-nodes'
import { Details, DetailsSummary, DetailsContent } from '@/lib/editor/details-extension'
import { FontSize } from '@/lib/editor/font-size-extension'
import { LineHeight } from '@/lib/editor/line-height-extension'
import { MarkdownPaste } from '@/lib/editor/markdown-paste-extension'

/**
 * Creates the full set of TipTap extensions for the unified editor
 * @param {Object} options - Configuration options
 * @param {Function} options.onFileDrop - Handler for file drops
 * @param {Function} options.onFilePaste - Handler for file pastes
 * @param {string} options.placeholderText - Custom placeholder text
 * @returns {Array} Array of configured TipTap extensions
 */
export function createEditorExtensions(options = {}) {
    const {
        onFileDrop,
        onFilePaste,
        placeholderText = 'Tell your story...',
        placeholderTitle = 'Title',
    } = options

    return [
        StarterKit.configure({
            paragraph: false, // We use DraggableParagraph instead
            heading: false, // We use DraggableHeading instead
            bulletList: false, // We use DraggableBulletList instead
            orderedList: false, // We use DraggableOrderedList instead
            blockquote: false, // We use DraggableBlockquote instead
            codeBlock: false,
            taskList: false, // We configure it separately with TaskList extension
            dropcursor: false, // We configure it separately
            gapcursor: false, // We configure it separately
        }),
        DraggableParagraph,
        DraggableHeading,
        DraggableBulletList,
        DraggableOrderedList,
        DraggableBlockquote,
        Placeholder.configure({
            placeholder: ({ node }) => {
                if (node.type.name === 'heading') {
                    return placeholderTitle
                }
                return placeholderText
            },
        }),
        ResizableImage.configure({
            inline: false,
            allowBase64: true,
            HTMLAttributes: {
                class: 'max-w-full h-auto rounded',
            },
        }),
        Link.configure({
            openOnClick: false,
            HTMLAttributes: {
                class: 'text-cyan-600 underline cursor-pointer',
            },
        }),
        Underline,
        Subscript,
        Superscript,
        DraggableCodeBlock.configure({
            HTMLAttributes: {
                class: 'bg-gray-100 rounded-md p-4 font-mono text-sm',
            },
        }),
        TextStyle,
        Color,
        Highlight.configure({
            multicolor: true,
        }),
        TextAlign.configure({
            types: ['heading', 'paragraph', 'linkPreview'],
        }),
        CharacterCount,
        Dropcursor.configure({
            color: '#3b82f6',
            width: 2,
        }),
        Focus.configure({
            className: 'has-focus',
            mode: 'all',
        }),
        Gapcursor,
        Typography,
        FileHandler.configure({
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
            onDrop: onFileDrop || ((currentEditor, files, pos) => {
                files.forEach(file => {
                    const fileReader = new FileReader()
                    fileReader.readAsDataURL(file)
                    fileReader.onload = () => {
                        currentEditor.chain().insertContentAt(pos, {
                            type: 'resizableImage',
                            attrs: { src: fileReader.result, alt: file.name },
                        }).focus().run()
                    }
                })
            }),
            onPaste: onFilePaste || ((currentEditor, files, htmlContent) => {
                files.forEach(file => {
                    if (file.type.startsWith('image/')) {
                        const fileReader = new FileReader()
                        fileReader.readAsDataURL(file)
                        fileReader.onload = () => {
                            currentEditor.chain().insertContent({
                                type: 'resizableImage',
                                attrs: { src: fileReader.result, alt: file.name },
                            }).focus().run()
                        }
                    }
                })
            }),
        }),
        FontFamily,
        FontSize,
        LineHeight,
        ListKeymap,
        UniqueID.configure({
            attributeName: 'id',
            types: ['heading', 'paragraph'],
        }),
        Details,
        DetailsSummary,
        DetailsContent,
        Emoji.configure({
            enableEmoticons: true,
            suggestion: {
                char: ':',
                allowSpaces: false,
                allowedPrefixes: [' '],
                startOfLine: false,
            },
        }),
        Youtube.configure({
            width: 640,
            height: 480,
            controls: true,
            nocookie: false,
        }),
        TaskList,
        TaskItem,
        Drawing,
        LinkPreview,
        ChatConversation,
        Video,
        Audio,
        MarkdownPaste,
    ]
}
