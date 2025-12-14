'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

export default function TipTapEditor({ 
  content, 
  onUpdate, 
  editable = true,
  placeholder = 'Start typing...'
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: content || null,
    editable,
    onUpdate: ({ editor }) => {
      if (onUpdate) {
        onUpdate(editor.getJSON())
      }
    },
  })

  if (!editor) {
    return null
  }

  return (
    <div className="border rounded-lg min-h-[300px] focus-within:ring-2 focus-within:ring-blue-500">
      <EditorContent editor={editor} />
    </div>
  )
}


