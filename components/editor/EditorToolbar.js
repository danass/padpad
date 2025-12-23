'use client'

import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Image, 
  Link, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Minus, 
  Undo, 
  Redo, 
  Code2,
  Palette
} from 'lucide-react'

export default function EditorToolbar({ editor }) {
  if (!editor) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 p-1 sm:p-1.5 border-b border-gray-200 bg-white overflow-x-auto">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-1.5 sm:p-2 rounded-md transition-all ${
          editor.isActive('bold')
            ? 'bg-gray-100 text-gray-900'
            : 'hover:bg-gray-100 text-gray-700'
        } disabled:opacity-50 active:scale-95`}
        title="Bold (Ctrl+B)"
      >
        <Bold className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-1.5 sm:p-2 rounded-md transition-all disabled:opacity-50 ${
          editor.isActive('italic')
            ? 'bg-gray-100 text-gray-900'
            : 'hover:bg-gray-100 text-gray-700'
        } active:scale-95`}
        title="Italic (Ctrl+I)"
      >
        <Italic className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`p-1.5 sm:p-2 rounded-md transition-all disabled:opacity-50 ${
          editor.isActive('strike')
            ? 'bg-gray-100 text-gray-900'
            : 'hover:bg-gray-100 text-gray-700'
        } active:scale-95`}
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-1.5 rounded-md transition-all ${
          editor.isActive('underline')
            ? 'bg-gray-100 text-gray-900'
            : 'hover:bg-gray-100 text-gray-700'
        } active:scale-95`}
        title="Underline (Ctrl+U)"
      >
        <Underline className="w-4 h-4" />
      </button>
      
      <div className="w-px h-6 bg-gray-200 mx-0.5" />
      
      <button
        onClick={() => {
          const input = document.createElement('input')
          input.type = 'file'
          input.accept = 'image/*'
          input.onchange = (e) => {
            const file = e.target.files[0]
            if (file) {
              const reader = new FileReader()
              reader.onload = () => {
                editor.chain().focus().setImage({ src: reader.result, alt: file.name }).run()
              }
              reader.readAsDataURL(file)
            }
          }
          input.click()
        }}
        className="p-1.5 rounded-md transition-all hover:bg-gray-100 text-gray-700 active:scale-95"
        title="Upload Image"
      >
        <Image className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => {
          const url = window.prompt('Enter URL:', editor.getAttributes('link')?.href || '')
          if (url) {
            editor.chain().focus().setLink({ href: url }).run()
          }
        }}
        className={`p-1.5 rounded-md transition-all ${
          editor.isActive('link')
            ? 'bg-gray-100 text-gray-900'
            : 'hover:bg-gray-100 text-gray-700'
        } active:scale-95`}
        title="Insert Link"
      >
        <Link className="w-4 h-4" />
      </button>
      
      <div className="w-px h-6 bg-gray-200 mx-0.5" />
      
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-1.5 rounded-md transition-all ${
          editor.isActive('heading', { level: 1 })
            ? 'bg-gray-100 text-gray-900'
            : 'hover:bg-gray-100 text-gray-700'
        } active:scale-95`}
        title="Heading 1"
      >
        <Heading1 className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-1.5 rounded-md transition-all ${
          editor.isActive('heading', { level: 2 })
            ? 'bg-gray-100 text-gray-900'
            : 'hover:bg-gray-100 text-gray-700'
        } active:scale-95`}
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-1.5 rounded-md transition-all ${
          editor.isActive('heading', { level: 3 })
            ? 'bg-gray-100 text-gray-900'
            : 'hover:bg-gray-100 text-gray-700'
        } active:scale-95`}
        title="Heading 3"
      >
        <Heading3 className="w-4 h-4" />
      </button>
      
      <div className="w-px h-6 bg-gray-200 mx-0.5" />
      
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded-md transition-all ${
          editor.isActive('bulletList')
            ? 'bg-gray-100 text-gray-900'
            : 'hover:bg-gray-100 text-gray-700'
        } active:scale-95`}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded-md transition-all ${
          editor.isActive('orderedList')
            ? 'bg-gray-100 text-gray-900'
            : 'hover:bg-gray-100 text-gray-700'
        } active:scale-95`}
        title="Numbered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      
      <div className="w-px h-6 bg-gray-200 mx-0.5" />
      
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-1.5 rounded-md transition-all ${
          editor.isActive('blockquote')
            ? 'bg-gray-100 text-gray-900'
            : 'hover:bg-gray-100 text-gray-700'
        } active:scale-95`}
        title="Blockquote"
      >
        <Quote className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="p-1.5 rounded-md transition-all hover:bg-gray-100 text-gray-700 active:scale-95"
        title="Horizontal Rule"
      >
        <Minus className="w-4 h-4" />
      </button>
      
      <div className="w-px h-6 bg-gray-200 mx-0.5" />
      
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-1.5 rounded-md transition-all hover:bg-gray-100 text-gray-700 disabled:opacity-50 active:scale-95"
        title="Undo (Ctrl+Z)"
      >
        <Undo className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-1.5 rounded-md transition-all hover:bg-gray-100 text-gray-700 disabled:opacity-50 active:scale-95"
        title="Redo (Ctrl+Y)"
      >
        <Redo className="w-4 h-4" />
      </button>
      
      <div className="w-px h-6 bg-gray-200 mx-0.5" />
      
      <button
        onClick={() => {
          const color = window.prompt('Enter color (hex, e.g. #ff0000):', editor.getAttributes('textStyle').color || '#000000')
          if (color) {
            editor.chain().focus().setColor(color).run()
          }
        }}
        className="p-1.5 rounded-md transition-all hover:bg-gray-100 text-gray-700 active:scale-95"
        title="Text Color"
      >
        <Palette className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-1.5 rounded-md transition-all ${
          editor.isActive('codeBlock')
            ? 'bg-gray-100 text-gray-900'
            : 'hover:bg-gray-100 text-gray-700'
        } active:scale-95`}
        title="Code Block"
      >
        <Code2 className="w-4 h-4" />
      </button>
    </div>
  )
}
