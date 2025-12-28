'use client'

import { useEffect, useState, useRef } from 'react'
import {
  Code,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Minus,
  Type,
  Strikethrough,
  Link,
  Bold,
  Italic,
  Underline,
  Highlighter,
  Superscript,
  Subscript,
  X,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Minimize2,
  ExternalLink
} from 'lucide-react'
import { useLanguage } from '@/app/i18n/LanguageContext'

export default function ContextMenu({ editor }) {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [menuMode, setMenuMode] = useState('selection') // 'selection', 'insertion', or 'node'
  const [targetNode, setTargetNode] = useState(null)
  const [targetPos, setTargetPos] = useState(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const menuRef = useRef(null)

  if (!editor || !editor.isEditable) return null

  useEffect(() => {
    if (!editor) return

    const handleContextMenu = (event) => {
      event.preventDefault()

      // Find node at click coordinates
      const pos = editor.view.posAtCoords({ left: event.clientX, top: event.clientY })
      let detectedNode = null
      let detectedPos = null

      if (pos) {
        const $pos = editor.state.doc.resolve(pos.pos)
        // Check if we clicked on an atom node (image, video, etc)
        const node = $pos.nodeAfter || $pos.nodeBefore
        if (node && (node.type.name === 'image' || node.type.name === 'video' || node.type.name === 'drawing' || node.type.name === 'resizableImage' || node.type.name === 'linkPreview')) {
          detectedNode = node
          // Ensure detectedPos is the start of the node
          detectedPos = $pos.nodeBefore === node ? $pos.pos - node.nodeSize : $pos.pos
        } else {
          // Check parent nodes for specific types if not directly on the element
          for (let d = $pos.depth; d > 0; d--) {
            const parent = $pos.node(d)
            if (parent.type.name === 'image' || parent.type.name === 'video' || parent.type.name === 'drawing' || parent.type.name === 'resizableImage' || parent.type.name === 'linkPreview') {
              detectedNode = parent
              detectedPos = $pos.before(d)
              break
            }
          }
        }
      }

      setTargetNode(detectedNode)
      setTargetPos(detectedPos)

      // Detect if there's a selection
      const { selection } = editor.state
      const hasSelection = !selection.empty

      // Set menu mode
      if (detectedNode) {
        setMenuMode('node')
      } else {
        // If no node detected, we are either in a text selection or insertion
        setMenuMode(hasSelection ? 'selection' : 'insertion')
      }

      // Get initial position
      let x = event.clientX
      let y = event.clientY

      // Estimate menu dimensions based on mode
      const menuWidth = hasSelection ? 240 : 220
      const menuHeight = hasSelection ? 300 : 380

      // Adjust X to keep on screen
      if (x + menuWidth > window.innerWidth) {
        x = window.innerWidth - menuWidth - 10
      }

      // Adjust Y: if menu would overflow bottom, position above cursor or at top
      if (y + menuHeight > window.innerHeight) {
        // Try to position above the click point
        const above = y - menuHeight - 10
        if (above > 0) {
          y = above
        } else {
          // If can't fit above, position at top with scroll
          y = 10
        }
      }

      setPosition({ x: Math.max(10, x), y: Math.max(10, y) })
      setIsOpen(true)

      // Immediate selection for nodes on right-click
      if (detectedNode && detectedPos !== null && editor) {
        try {
          editor.chain().focus().setNodeSelection(detectedPos).run()
        } catch (e) {
          console.error('Failed to set node selection in ContextMenu:', e)
        }
      }
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

  const handleLinkAction = () => {
    if (!editor) return
    setIsOpen(false)

    // Get selection position for LinkEditor
    const { selection } = editor.state
    const { $from } = selection
    const coords = editor.view.coordsAtPos($from.pos)
    const editorContainer = editor.view.dom.closest('.prose') || editor.view.dom.parentElement
    const containerRect = editorContainer?.getBoundingClientRect()

    let position
    if (containerRect) {
      position = {
        top: coords.bottom - containerRect.top + 8,
        left: coords.left - containerRect.left,
      }
    } else {
      position = {
        top: coords.bottom + 8,
        left: coords.left,
      }
    }

    // Dispatch event to show LinkEditor (same as toolbar)
    window.dispatchEvent(new CustomEvent('showLinkEditor', {
      detail: { position }
    }))
  }

  // Selection menu - formatting options
  const selectionMenuItems = [
    {
      label: t?.formatting || 'Formatting',
      items: [
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
          label: t?.highlighted || 'Highlight',
          action: () => editor.chain().focus().toggleHighlight().run(),
          isActive: editor?.isActive('highlight'),
        },
        {
          icon: <Superscript className="w-4 h-4" />,
          label: t?.superscript || 'Superscript',
          action: () => editor.chain().focus().toggleSuperscript().run(),
          isActive: editor?.isActive('superscript'),
        },
        {
          icon: <Subscript className="w-4 h-4" />,
          label: t?.subscript || 'Subscript',
          action: () => editor.chain().focus().toggleSubscript().run(),
          isActive: editor?.isActive('subscript'),
        },
      ]
    },
    {
      label: t?.codeAndLink || 'Code',
      items: [
        {
          icon: <Code className="w-4 h-4" />,
          label: t?.inlineCode || 'Inline code',
          action: () => editor.chain().focus().toggleCode().run(),
          isActive: editor?.isActive('code'),
        },
      ]
    },
    {
      label: t?.alignment || 'Alignment',
      items: [
        {
          icon: <AlignLeft className="w-4 h-4" />,
          label: t?.alignLeft || 'Align Left',
          action: () => editor.chain().focus().setTextAlign('left').run(),
          isActive: editor?.isActive({ textAlign: 'left' }),
        },
        {
          icon: <AlignCenter className="w-4 h-4" />,
          label: t?.alignCenter || 'Align Center',
          action: () => editor.chain().focus().setTextAlign('center').run(),
          isActive: editor?.isActive({ textAlign: 'center' }),
        },
        {
          icon: <AlignRight className="w-4 h-4" />,
          label: t?.alignRight || 'Align Right',
          action: () => editor.chain().focus().setTextAlign('right').run(),
          isActive: editor?.isActive({ textAlign: 'right' }),
        },
      ]
    },
  ]

  // Link editing (if selection is a link)
  const isLink = editor?.isActive('link')
  if (isLink) {
    selectionMenuItems.push({
      label: t?.linkActions || 'Link Actions',
      items: [
        {
          icon: <ExternalLink className="w-4 h-4" />,
          label: t?.editLink || 'Edit Link',
          action: handleLinkAction,
        },
        {
          icon: <Trash2 className="w-4 h-4" />,
          label: t?.removeLink || 'Remove Link',
          action: () => editor.chain().focus().unsetLink().run(),
        }
      ]
    })
  }

  // Insertion menu - insert new content
  const insertionMenuItems = [
    {
      label: t?.insert || 'Insert',
      items: [
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
          icon: <Minus className="w-4 h-4" />,
          label: t?.horizontalRule || 'Horizontal line',
          action: () => editor.chain().focus().setHorizontalRule().run(),
          isActive: false,
        },
      ]
    },
    {
      label: t?.transform || 'Transform line',
      items: [
        {
          icon: <Type className="w-4 h-4" />,
          label: t?.paragraph || 'Paragraph',
          action: () => editor.chain().focus().setParagraph().run(),
          isActive: editor?.isActive('paragraph'),
        },
        {
          icon: <Quote className="w-4 h-4" />,
          label: t?.quote || 'Quote',
          action: () => editor.chain().focus().toggleBlockquote().run(),
          isActive: editor?.isActive('blockquote'),
        },
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
        {
          icon: <Code className="w-4 h-4" />,
          label: t?.codeBlock || 'Code block',
          action: () => editor.chain().focus().toggleCodeBlock().run(),
          isActive: editor?.isActive('codeBlock'),
        },
      ]
    },
  ]

  // Node specific menu (for images, videos, etc)
  const nodeMenuItems = targetNode ? [
    // Only show alignment for linkPreview when size is m or full (not inline sizes like text, xs, s)
    ...((targetNode.attrs.width !== null || (targetNode.type.name === 'linkPreview' && ['m', 'full'].includes(targetNode.attrs.size))) ? [{
      label: t?.alignment || 'Alignment',
      items: [
        {
          icon: <AlignLeft className="w-4 h-4" />,
          label: t?.alignLeft || 'Align Left',
          action: () => editor.chain().focus().updateAttributes(targetNode.type.name, { [targetNode.type.name === 'linkPreview' ? 'textAlign' : 'align']: 'left' }).run(),
          isActive: (targetNode.type.name === 'linkPreview' ? targetNode.attrs.textAlign : targetNode.attrs.align) === 'left',
        },
        {
          icon: <AlignCenter className="w-4 h-4" />,
          label: t?.alignCenter || 'Align Center',
          action: () => editor.chain().focus().updateAttributes(targetNode.type.name, { [targetNode.type.name === 'linkPreview' ? 'textAlign' : 'align']: 'center' }).run(),
          isActive: (targetNode.type.name === 'linkPreview' ? targetNode.attrs.textAlign : targetNode.attrs.align) === 'center' || !(targetNode.type.name === 'linkPreview' ? targetNode.attrs.textAlign : targetNode.attrs.align),
        },
        {
          icon: <AlignRight className="w-4 h-4" />,
          label: t?.alignRight || 'Align Right',
          action: () => editor.chain().focus().updateAttributes(targetNode.type.name, { [targetNode.type.name === 'linkPreview' ? 'textAlign' : 'align']: 'right' }).run(),
          isActive: (targetNode.type.name === 'linkPreview' ? targetNode.attrs.textAlign : targetNode.attrs.align) === 'right',
        },
      ]
    }] : []),
    {
      label: t?.size || 'Size',
      items: [
        ...(targetNode.type.name === 'linkPreview' ? [
          {
            icon: <Type className="w-4 h-4" />,
            label: 'Text',
            action: () => {
              if (targetPos !== null) {
                editor.chain().focus().setNodeSelection(targetPos).updateAttributes('linkPreview', { size: 'text' }).run()
              }
            },
            isActive: targetNode.attrs.size === 'text',
          },
          {
            icon: <Minimize2 className="w-4 h-4" />,
            label: 'XS',
            action: () => {
              if (targetPos !== null) {
                editor.chain().focus().setNodeSelection(targetPos).updateAttributes('linkPreview', { size: 'xs' }).run()
              }
            },
            isActive: targetNode.attrs.size === 'xs',
          },
          {
            icon: <Minimize2 className="w-4 h-4" />,
            label: 'Small',
            action: () => {
              if (targetPos !== null) {
                editor.chain().focus().setNodeSelection(targetPos).updateAttributes('linkPreview', { size: 's' }).run()
              }
            },
            isActive: targetNode.attrs.size === 's',
          },
          {
            icon: <Maximize2 className="w-4 h-4" />,
            label: 'Medium',
            action: () => {
              if (targetPos !== null) {
                editor.chain().focus().setNodeSelection(targetPos).updateAttributes('linkPreview', { size: 'm' }).run()
              }
            },
            isActive: targetNode.attrs.size === 'm',
          },
          {
            icon: <Maximize2 className="w-4 h-4" />,
            label: 'Full',
            action: () => {
              if (targetPos !== null) {
                editor.chain().focus().setNodeSelection(targetPos).updateAttributes('linkPreview', { size: 'full' }).run()
              }
            },
            isActive: targetNode.attrs.size === 'full',
          }
        ] : [
          {
            icon: <Minimize2 className="w-4 h-4" />,
            label: t?.small || 'Small',
            action: () => editor.chain().focus().updateAttributes(targetNode.type.name, { width: 300 }).run(),
            isActive: targetNode.attrs.width === 300,
          },
          {
            icon: <Maximize2 className="w-4 h-4" />,
            label: t?.fullWidth || 'Full Width',
            action: () => editor.chain().focus().updateAttributes(targetNode.type.name, { width: null }).run(),
            isActive: !targetNode.attrs.width,
          }
        ])
      ]
    },
    {
      label: t?.dangerZone || 'Danger Zone',
      items: [
        ...(targetNode.type.name === 'linkPreview' ? [
          {
            icon: <ExternalLink className="w-4 h-4" />,
            label: t?.editLink || 'Edit Link',
            action: () => {
              const newUrl = window.prompt('Edit URL:', targetNode.attrs.url || '')
              if (newUrl !== null && newUrl.trim()) {
                editor.chain().focus().updateAttributes('linkPreview', { url: newUrl.trim(), loading: true, title: null, description: null, image: null }).run()
              }
            },
          },
          {
            icon: <Trash2 className="w-4 h-4" />,
            label: 'Break Link',
            action: () => {
              if (targetPos !== null && targetNode.attrs.url) {
                const url = targetNode.attrs.url
                editor.chain().focus().setNodeSelection(targetPos).deleteSelection().insertContent(url).run()
              }
            },
          }
        ] : []),
        ...(targetNode.type.name === 'drawing' && targetNode.attrs.x !== null ? [
          {
            icon: <Move className="w-4 h-4" />,
            label: 'Toggle Move Mode',
            action: () => {
              window.dispatchEvent(new CustomEvent('toggleDrawingMoveMode', {
                detail: { pos: targetPos }
              }))
            }
          }
        ] : []),
        {
          icon: <Trash2 className="w-4 h-4 text-red-500" />,
          label: t?.delete || 'Delete',
          action: () => {
            if (targetPos !== null) {
              editor.chain().focus().setNodeSelection(targetPos).deleteSelection().run()
            }
          },
        }
      ]
    }
  ] : []

  if (!isOpen || !editor) return null

  // Calculate max height based on available space
  const maxHeight = Math.min(window.innerHeight - position.y - 20, 400)

  // CRITICAL: If we're in node mode, we ONLY want to show nodeMenuItems.
  // We ensure no selection/insertion items leak through.
  const menuItems = menuMode === 'node' ? nodeMenuItems : (menuMode === 'selection' ? selectionMenuItems : insertionMenuItems)
  const headerText = menuMode === 'node'
    ? (targetNode?.type?.name?.toUpperCase() || 'ELEMENT')
    : (menuMode === 'selection' ? (t?.formatSelection || 'Format selection') : (t?.insertOrTransform || 'Insert / Transform'))

  return (
    <div
      ref={menuRef}
      className="fixed bg-white border border-gray-200 rounded-lg shadow-xl z-[1000] py-1 overflow-y-auto"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        minWidth: menuMode === 'selection' ? '220px' : '200px',
        maxHeight: `${maxHeight}px`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 sticky top-0 bg-white">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{headerText}</span>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <X className="w-3 h-3 text-gray-400" />
        </button>
      </div>

      {/* Menu items - Icon Grid for selection mode */}
      {menuMode === 'selection' ? (
        <div className="p-2">
          {menuItems.map((section, sectionIndex) => (
            <div key={section.label}>
              <div className="flex flex-wrap gap-1 justify-center">
                {section.items.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleAction(item.action)}
                    className={`p-2 rounded-md transition-colors ${item.isActive
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    title={item.label + (item.shortcut ? ` (${item.shortcut})` : '')}
                  >
                    {item.icon}
                  </button>
                ))}
              </div>
              {sectionIndex < menuItems.length - 1 && <div className="border-t border-gray-100 my-2" />}
            </div>
          ))}
        </div>
      ) : (
        <div>
          {menuItems.map((section, sectionIndex) => (
            <div key={section.label}>
              <div className="px-3 py-1">
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{section.label}</span>
              </div>
              {section.items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleAction(item.action)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors ${item.isActive
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
              {sectionIndex < menuItems.length - 1 && <div className="border-t border-gray-100 my-1" />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
