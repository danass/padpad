'use client'

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import LinkExtension from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import Typography from '@tiptap/extension-typography'
import FontFamily from '@tiptap/extension-font-family'
import { FontSize } from '@/lib/editor/font-size-extension'
import { LineHeight } from '@/lib/editor/line-height-extension'
import { ResizableImage } from '@/lib/editor/resizable-image-extension'
import { Drawing } from '@/lib/editor/drawing-extension'
import { Youtube } from '@/lib/editor/youtube-extension'
import { TaskList, TaskItem } from '@/lib/editor/task-list-extension'
import { Details, DetailsSummary, DetailsContent } from '@/lib/editor/details-extension'
import { LinkPreview } from '@/lib/editor/link-preview-extension'
import Emoji from '@tiptap/extension-emoji'

export default function FeaturedArticleRenderer({ content }) {
    const editor = useEditor({
        editable: false,
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3, 4, 5, 6] },
                codeBlock: false,
            }),
            ResizableImage.configure({ HTMLAttributes: { class: 'max-w-full h-auto' } }),
            Youtube, TaskList, TaskItem, Details, DetailsSummary, DetailsContent,
            LinkExtension.configure({ openOnClick: true, HTMLAttributes: { class: 'text-blue-500 underline' } }),
            Underline, TextStyle, Color, Highlight.configure({ multicolor: true }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Typography, FontFamily, FontSize, LineHeight, Drawing, LinkPreview,
            Emoji.configure({ enableEmoticons: true }),
        ],
        content: content,
    })

    if (!editor) return null
    return <EditorContent editor={editor} />
}
