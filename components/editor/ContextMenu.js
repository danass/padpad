'use client'

import { useEffect, useState, useRef } from 'react'
import { 
  Code, 
  Quote, 
  Heading1, 
  Heading2, 
  Heading3, 
  Heading4,
  List, 
  ListOrdered, 
  CheckSquare,
  Minus,
  Type,
  Strikethrough,
  Subscript,
  Superscript,
  Link,
  Bold,
  Italic,
  Underline,
  Highlighter,
  X
} from 'lucide-react'
import { useLanguage } from '@/app/i18n/LanguageContext'

export default function ContextMenu({ editor }) {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const menuRef = useRef(null)

  useEffect(() => {
    if (!editor) return

    const handleContextMenu = (event) => {
      // Only show custom menu if there's a selection
      const { selection } = editor.state
      if (selection.empty) return // No selection, let native menu show

      event.preventDefault()
      
      // Get position
      const x = event.clientX
      const y = event.clientY
      
      // Adjust position to keep menu on screen
      const menuWidth = 220
      const menuHeight = 400
      const adjustedX = Math.min(x, window.innerWidth - menuWidth - 10)
      const adjustedY = Math.min(y, window.innerHeight - menuHeight - 10)
      
      setPosition({ x: adjustedX, y: adjustedY })
      setIsOpen(true)
    }

    const handleClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    // Add listener to the editor's DOM element
    const editorElement = editor.view.dom
    editorElement.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      editorElement.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [editor])

  const handleAction = (action) => {
    if (!editor) return
    action()
    setIsOpen(false)
    editor.chain().focus().run()
  }

  const menuItems = [
    {
      label: `${t?.blocks || 'Blocks'} ${t?.blocksHint || '(whole paragraph)'}`,
      items: [
        {
          icon: <Type className="w-4 h-4" />,
          label: t?.paragraph || 'Paragraph',
          action: () => editor.chain().focus().setParagraph().run(),
          isActive: editor?.isActive('paragraph'),
        },
        {
          icon: <Heading1 className="w-4 h-4" />,
          label: t?.heading1 || 'Heading 1',
          action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
          isActive: editor?.isActive('heading', { level: 1 }),
        },
        {
          icon: <Heading2 className="w-4 h-4" />,
          label: t?.heading2 || 'Heading 2',
          action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
          isActive: editor?.isActive('heading', { level: 2 }),
        },
        {
          icon: <Heading3 className="w-4 h-4" />,
          label: t?.heading3 || 'Heading 3',
          action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
          isActive: editor?.isActive('heading', { level: 3 }),
        },
        {
          icon: <Heading4 className="w-4 h-4" />,
          label: t?.heading4 || 'Heading 4',
          action: () => editor.chain().focus().toggleHeading({ level: 4 }).run(),
          isActive: editor?.isActive('heading', { level: 4 }),
        },
      ]
    },
    {
      label: t?.codeAndQuote || 'Code & Quote',
      items: [
        {
          icon: <Code className="w-4 h-4 opacity-60" />,
          label: t?.inlineCode || 'Inline code',
          action: () => editor.chain().focus().toggleCode().run(),
          isActive: editor?.isActive('code'),
          hint: t?.formattingHint?.replace(/[()]/g, '') || 'selection',
        },
        {
          icon: <Code className="w-4 h-4" />,
          label: t?.codeBlock || 'Code block',
          action: () => editor.chain().focus().toggleCodeBlock().run(),
          isActive: editor?.isActive('codeBlock'),
          hint: t?.blocksHint?.replace(/[()]/g, '') || 'paragraph',
        },
        {
          icon: <Quote className="w-4 h-4" />,
          label: t?.quote || 'Quote',
          action: () => editor.chain().focus().toggleBlockquote().run(),
          isActive: editor?.isActive('blockquote'),
          hint: t?.blocksHint?.replace(/[()]/g, '') || 'paragraph',
        },
      ]
    },
    {
      label: `${t?.lists || 'Lists'} ${t?.blocksHint || '(paragraph)'}`,
      items: [
        {
          icon: <List className="w-4 h-4" />,
          label: t?.bulletList || 'Bullet list',
          action: () => editor.chain().focus().toggleBulletList().run(),
          isActive: editor?.isActive('bulletList'),
        },
        {
          icon: <ListOrdered className="w-4 h-4" />,
          label: t?.numberedList || 'Numbered list',
          action: () => editor.chain().focus().toggleOrderedList().run(),
          isActive: editor?.isActive('orderedList'),
        },
        {
          icon: <CheckSquare className="w-4 h-4" />,
          label: t?.taskList || 'Task list',
          action: () => editor.chain().focus().toggleTaskList().run(),
          isActive: editor?.isActive('taskList'),
        },
      ]
    },
    {
      label: `${t?.formatting || 'Formatting'} ${t?.formattingHint || '(selection)'}`,
      items: [
        {
          icon: <Bold className="w-4 h-4" />,
          label: t?.bold || 'Bold',
          action: () => editor.chain().focus().toggleBold().run(),
          isActive: editor?.isActive('bold'),
          shortcut: '⌘B',
        },
        {
          icon: <Italic className="w-4 h-4" />,
          label: t?.italic || 'Italic',
          action: () => editor.chain().focus().toggleItalic().run(),
          isActive: editor?.isActive('italic'),
          shortcut: '⌘I',
        },
        {
          icon: <Underline className="w-4 h-4" />,
          label: t?.underline || 'Underline',
          action: () => editor.chain().focus().toggleUnderline().run(),
          isActive: editor?.isActive('underline'),
          shortcut: '⌘U',
        },
        {
          icon: <Strikethrough className="w-4 h-4" />,
          label: t?.strikethrough || 'Strikethrough',
          action: () => editor.chain().focus().toggleStrike().run(),
          isActive: editor?.isActive('strike'),
        },
        {
          icon: <Highlighter className="w-4 h-4" />,
          label: t?.highlighted || 'Highlighted',
          action: () => editor.chain().focus().toggleHighlight().run(),
          isActive: editor?.isActive('highlight'),
        },
        {
          icon: <Subscript className="w-4 h-4" />,
          label: t?.subscript || 'Subscript',
          action: () => editor.chain().focus().toggleSubscript().run(),
          isActive: editor?.isActive('subscript'),
        },
        {
          icon: <Superscript className="w-4 h-4" />,
          label: t?.superscript || 'Superscript',
          action: () => editor.chain().focus().toggleSuperscript().run(),
          isActive: editor?.isActive('superscript'),
        },
      ]
    },
    {
      label: t?.other || 'Other',
      items: [
        {
          icon: <Minus className="w-4 h-4" />,
          label: t?.horizontalRule || 'Horizontal rule',
          action: () => editor.chain().focus().setHorizontalRule().run(),
          isActive: false,
        },
        {
          icon: <Link className="w-4 h-4" />,
          label: t?.link || 'Link',
          action: () => {
            const url = window.prompt(t?.linkUrl || 'Link URL:')
            if (url) {
              let formattedUrl = url.trim()
              if (formattedUrl && !/^https?:\/\//i.test(formattedUrl)) {
                formattedUrl = `https://${formattedUrl}`
              }
              editor.chain().focus().setLink({ href: formattedUrl }).run()
            }
          },
          isActive: editor?.isActive('link'),
        },
      ]
    },
  ]

  if (!isOpen || !editor) return null

  // Split menu items into two columns
  const leftColumn = menuItems.slice(0, 3) // Blocks, Code & Quote, Lists
  const rightColumn = menuItems.slice(3) // Formatting, Other

  return (
    <div
      ref={menuRef}
      className="fixed bg-white border border-gray-200 rounded-lg shadow-xl z-[1000] py-1 max-h-[80vh] overflow-y-auto"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        minWidth: '420px',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t?.convertTo || 'Convert to'}</span>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <X className="w-3 h-3 text-gray-400" />
        </button>
      </div>

      {/* Two column layout */}
      <div className="flex">
        {/* Left column */}
        <div className="flex-1 border-r border-gray-100">
          {leftColumn.map((section, sectionIndex) => (
            <div key={section.label}>
              {sectionIndex > 0 && <div className="border-t border-gray-100 my-1" />}
              <div className="px-3 py-1">
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{section.label}</span>
              </div>
              {section.items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleAction(item.action)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors ${
                    item.isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className={item.isActive ? 'text-blue-600' : 'text-gray-500'}>
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {item.hint && (
                    <span className="text-[10px] text-gray-400 italic">{item.hint}</span>
                  )}
                  {item.isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
        
        {/* Right column */}
        <div className="flex-1">
          {rightColumn.map((section, sectionIndex) => (
            <div key={section.label}>
              {sectionIndex > 0 && <div className="border-t border-gray-100 my-1" />}
              <div className="px-3 py-1">
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{section.label}</span>
              </div>
              {section.items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleAction(item.action)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors ${
                    item.isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className={item.isActive ? 'text-blue-600' : 'text-gray-500'}>
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {item.shortcut && (
                    <span className="text-xs text-gray-400">{item.shortcut}</span>
                  )}
                  {item.isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

