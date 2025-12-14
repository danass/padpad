'use client'

import { useEffect, useState } from 'react'

const commands = [
  { 
    title: 'Heading 1', 
    icon: 'H1', 
    description: 'Big section heading',
    keywords: ['h1', 'heading', 'title'],
    action: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleHeading({ level: 1 }).run()
    }
  },
  { 
    title: 'Heading 2', 
    icon: 'H2', 
    description: 'Medium section heading',
    keywords: ['h2', 'heading', 'subtitle'],
    action: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleHeading({ level: 2 }).run()
    }
  },
  { 
    title: 'Heading 3', 
    icon: 'H3', 
    description: 'Small section heading',
    keywords: ['h3', 'heading'],
    action: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleHeading({ level: 3 }).run()
    }
  },
  { 
    title: 'Bullet List', 
    icon: '•', 
    description: 'Create a bulleted list',
    keywords: ['bullet', 'list', 'ul', 'unordered'],
    action: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run()
    }
  },
  { 
    title: 'Numbered List', 
    icon: '1.', 
    description: 'Create a numbered list',
    keywords: ['number', 'list', 'ol', 'ordered'],
    action: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run()
    }
  },
  { 
    title: 'Quote', 
    icon: '"', 
    description: 'Capture a quote',
    keywords: ['quote', 'blockquote'],
    action: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run()
    }
  },
  { 
    title: 'Code Block', 
    icon: '</>', 
    description: 'Insert a code block',
    keywords: ['code', 'codeblock', 'pre', 'syntax'],
    action: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
    }
  },
  { 
    title: 'Divider', 
    icon: '─', 
    description: 'Visually divide blocks',
    keywords: ['divider', 'hr', 'horizontal', 'rule'],
    action: (editor, range) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run()
    }
  },
  { 
    title: 'Details / Collapsible', 
    icon: '▼', 
    description: 'Create a collapsible section',
    keywords: ['details', 'collapse', 'accordion', 'expand', 'toggle'],
    action: (editor, range) => {
      editor.chain().focus().deleteRange(range).setDetails().run()
    }
  },
  { 
    title: 'Task List', 
    icon: '☑️', 
    description: 'Create a task list with checkboxes',
    keywords: ['task', 'todo', 'checkbox', 'checklist', 'tasklist'],
    action: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run()
    }
  },
  { 
    title: 'YouTube Video', 
    icon: '▶️', 
    description: 'Embed a YouTube video',
    keywords: ['youtube', 'video', 'embed', 'yt'],
    action: (editor, range) => {
      editor.chain().focus().deleteRange(range).run()
      const url = prompt('Enter YouTube video URL:')
      if (url) {
        editor.chain().focus().setYoutubeVideo({ src: url }).run()
      }
    }
  },
  { 
    title: 'Emoji', 
    icon: '😀', 
    description: 'Insert an emoji',
    keywords: ['emoji', 'emoticon', 'smiley'],
    action: (editor, range) => {
      editor.chain().focus().deleteRange(range).run()
      // Trigger emoji suggestion - typing : will trigger it
      editor.chain().insertContent(':').run()
    }
  },
  { 
    title: 'Image', 
    icon: '🖼️', 
    description: 'Upload or embed with a link',
    keywords: ['image', 'img', 'picture', 'photo'],
    action: (editor, range) => {
      editor.chain().focus().deleteRange(range).run()
      
      // Create file input
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
    }
  },
  { 
    title: 'Link', 
    icon: '🔗', 
    description: 'Create or edit a link',
    keywords: ['link', 'url', 'href'],
    action: (editor, range) => {
      editor.chain().focus().deleteRange(range).run()
      const url = window.prompt('Enter URL:')
      if (url) {
        editor.chain().focus().setLink({ href: url }).run()
      }
    }
  },
]

export default function SlashMenu({ editor, menuState, onClose }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  
  if (!menuState || !menuState.active) return null
  
  const filtered = commands.filter(cmd => {
    const queryLower = menuState.query.toLowerCase()
    return (
      cmd.title.toLowerCase().includes(queryLower) ||
      cmd.description?.toLowerCase().includes(queryLower) ||
      cmd.keywords?.some(kw => kw.toLowerCase().includes(queryLower))
    )
  }).slice(0, 8)
  
  useEffect(() => {
    setSelectedIndex(0)
  }, [menuState.query])
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!menuState.active) return
      
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % filtered.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + filtered.length) % filtered.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filtered[selectedIndex] && menuState.range) {
          filtered[selectedIndex].action(editor, menuState.range)
          onClose()
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIndex, filtered, editor, menuState, onClose])
  
  if (filtered.length === 0) return null
  
  return (
    <div
      className="fixed z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-y-auto min-w-[280px]"
      style={{
        top: `${menuState.position.top}px`,
        left: `${menuState.position.left}px`,
      }}
    >
      {filtered.map((cmd, index) => (
        <button
          key={cmd.title}
          onClick={() => {
            if (menuState.range) {
              cmd.action(editor, menuState.range)
            }
            onClose()
          }}
          className={`w-full text-left px-3 py-2 flex items-start gap-3 transition-colors ${
            index === selectedIndex
              ? 'bg-gray-100'
              : 'hover:bg-gray-50'
          }`}
        >
          <div className="flex-shrink-0 w-8 h-8 rounded flex items-center justify-center bg-gray-100 text-sm font-semibold mt-0.5">
            {cmd.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className={`font-medium text-sm ${
              index === selectedIndex 
                ? 'text-gray-900' 
                : 'text-gray-900'
            }`}>
              {cmd.title}
            </div>
            {cmd.description && (
              <div className="text-xs text-gray-500 mt-0.5">
                {cmd.description}
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}
