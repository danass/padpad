'use client'

import { useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

export default function TipTapEditor({ 
  content, 
  onUpdate, 
  editable = true,
  placeholder = 'Start typing...'
}) {
  const [mounted, setMounted] = useState(false)
  
  const editor = useEditor({
    immediatelyRender: false,
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

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!editor) {
    return null
  }

  return (
    <div className="border rounded-lg min-h-[300px] focus-within:ring-2 focus-within:ring-blue-500">
      {mounted && <EditorContent editor={editor} />}
    </div>
  )
}





