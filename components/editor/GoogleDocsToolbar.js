'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  ImagePlus,
  Link,
  Undo,
  Redo,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Eraser,
  Highlighter,
  Pencil,
  Type,
  HardDrive,
  Save,
  Check,
} from 'lucide-react'
import Tooltip from '@/components/ui/Tooltip'
import { useLanguage } from '@/app/i18n/LanguageContext'

const FONT_FAMILIES = [
  'Arial',
  'Roboto',
  'Lato',
  'Open Sans',
  'Montserrat',
  'Poppins',
  'Inter',
  'Calibri',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Courier New',
  'Comic Sans MS',
  'Impact',
  'Trebuchet MS',
  'Arial Black',
  'Tahoma',
  'Century Gothic',
  'Lucida Sans Unicode',
  'Palatino'
]

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 36, 40, 48, 56, 64, 72, 96]

const PRESET_COLORS = [
  '#000000', '#434343', '#666666', '#999999', '#B7B7B7', '#CCCCCC', '#D9D9D9', '#EFEFEF', '#F2F2F2', '#FFFFFF',
  '#980000', '#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF', '#4A86E8', '#0000FF', '#9900FF', '#FF00FF',
  '#E6B8AF', '#F4CCCC', '#FCE5CD', '#FFF2CC', '#D9EAD3', '#D0E0E3', '#C9DAF8', '#CFE2F3', '#D9D2E9', '#EAD1DC',
  '#DD7E6B', '#EA9999', '#F9CB9C', '#FFE599', '#B6D7A8', '#A2C4C9', '#A4C2F4', '#9FC5E8', '#B4A7D6', '#D5A6BD',
  '#CC4125', '#E06666', '#F6B26B', '#FFD966', '#93C47D', '#76A5AF', '#6D9EEB', '#6FA8DC', '#8E7CC3', '#C27BA0',
  '#A61C00', '#CC0000', '#E69138', '#F1C232', '#6AA84F', '#45818E', '#3C78D8', '#3D85C6', '#674EA7', '#A64D79',
  '#85200C', '#990000', '#B45F06', '#BF9000', '#38761D', '#134F5C', '#1155CC', '#0B5394', '#351C75', '#741B47',
  '#5B0F00', '#660000', '#783F04', '#7F6000', '#274E13', '#0C343D', '#1C4587', '#073763', '#20124D', '#4C1130',
]

const TEXT_COLORS = PRESET_COLORS

const HIGHLIGHT_COLORS = [
  '#FFFF00', '#FF9900', '#00FF00', '#00FFFF', '#FF00FF', '#FF0000', '#0000FF', '#000000', '#FFFFFF',
  '#FCE5CD', '#FFF2CC', '#D9EAD3', '#D0E0E3', '#C9DAF8', '#CFE2F3', '#D9D2E9', '#EAD1DC', '#F4CCCC',
  '#F9CB9C', '#FFE599', '#B6D7A8', '#A2C4C9', '#A4C2F4', '#9FC5E8', '#B4A7D6', '#D5A6BD', '#EA9999'
]

export default function GoogleDocsToolbar({ editor, onOpenIpfsBrowser, onSave, saving, hasChanges = true }) {
  const { t } = useLanguage()
  const [showFontFamily, setShowFontFamily] = useState(false)
  const [showFontSize, setShowFontSize] = useState(false)
  const [showLineHeight, setShowLineHeight] = useState(false)
  const [showTextColor, setShowTextColor] = useState(false)
  const [showHighlightColor, setShowHighlightColor] = useState(false)
  const [showAlign, setShowAlign] = useState(false)
  const [fontFamilyPosition, setFontFamilyPosition] = useState({ top: 0, left: 0 })
  const [textColorPosition, setTextColorPosition] = useState({ top: 0, left: 0 })
  const [highlightColorPosition, setHighlightColorPosition] = useState({ top: 0, left: 0 })
  const [alignPosition, setAlignPosition] = useState({ top: 0, left: 0 })
  const [lineHeightPosition, setLineHeightPosition] = useState({ top: 0, left: 0 })
  const fontFamilyRef = useRef(null)
  const fontSizeRef = useRef(null)
  const lineHeightRef = useRef(null)
  const textColorRef = useRef(null)
  const highlightColorRef = useRef(null)
  const alignRef = useRef(null)

  // Active style state - stores the current active formatting
  const [activeStyle, setActiveStyle] = useState({
    fontFamily: 'Arial',
    fontSize: 16,
    bold: false,
    italic: false,
    underline: false,
    color: '#000000',
    highlightColor: null,
    lineHeight: null,
    align: 'left'
  })

  // Paint mode state
  const PAINT_MODE_KEY = 'textpad_paint_mode'
  const PAINT_MODE_TOOLTIP_KEY = 'textpad_paint_mode_tooltip_shown'
  const [paintMode, setPaintMode] = useState(false)
  const [showPaintTooltip, setShowPaintTooltip] = useState(false)

  // Load paint mode from localStorage on mount
  useEffect(() => {
    const savedPaintMode = localStorage.getItem(PAINT_MODE_KEY)
    if (savedPaintMode === 'true') {
      setPaintMode(true)
    }

    const tooltipShown = localStorage.getItem(PAINT_MODE_TOOLTIP_KEY)
    if (tooltipShown !== 'true') {
      setShowPaintTooltip(true)
    }
  }, [])

  // Save paint mode to localStorage
  const togglePaintMode = () => {
    const newPaintMode = !paintMode
    setPaintMode(newPaintMode)
    localStorage.setItem(PAINT_MODE_KEY, newPaintMode.toString())

    // Show tooltip on first activation
    if (newPaintMode && !localStorage.getItem(PAINT_MODE_TOOLTIP_KEY)) {
      setShowPaintTooltip(true)
      localStorage.setItem(PAINT_MODE_TOOLTIP_KEY, 'true')
    }
  }

  const dismissPaintTooltip = () => {
    setShowPaintTooltip(false)
    localStorage.setItem(PAINT_MODE_TOOLTIP_KEY, 'true')
  }

  if (!editor) {
    return null
  }

  // Get current font family
  const currentFontFamily = editor.getAttributes('textStyle')?.fontFamily || 'Arial'
  const currentFontSizeAttr = editor.getAttributes('textStyle')?.fontSize
  const currentFontSizeNum = currentFontSizeAttr ? parseInt(currentFontSizeAttr.replace('px', '')) : null
  const [fontSize, setFontSize] = useState(currentFontSizeNum || 16)
  const [fontSizeDisplay, setFontSizeDisplay] = useState(currentFontSizeNum ? currentFontSizeNum.toString() : 'inherited')

  // Get current colors - prefer activeStyle (which includes user selections) over editor attributes
  // This ensures the preview updates when color is selected even if not yet applied to text
  const currentTextColor = activeStyle.color || editor.getAttributes('textStyle')?.color || '#000000'
  const currentHighlightColor = activeStyle.highlightColor || editor.getAttributes('highlight')?.color || null

  // Get current align - check for image first, then text using isActive for accuracy
  const getCurrentAlign = () => {
    // Use editor.isActive for accurate alignment detection
    if (editor.isActive({ textAlign: 'center' })) return 'center'
    if (editor.isActive({ textAlign: 'right' })) return 'right'
    if (editor.isActive({ textAlign: 'justify' })) return 'justify'

    // Check for image alignment
    const { selection } = editor.state
    const { $from } = selection
    let imageNode = null

    // Check if selection is on an image
    editor.state.doc.nodesBetween($from.start(), $from.end(), (node) => {
      if (node.type && node.type.name === 'image') {
        imageNode = node
        return false
      }
    })

    if (imageNode) {
      return imageNode.attrs.align || 'center'
    }

    return editor.getAttributes('textAlign')?.textAlign || 'left'
  }

  const currentAlign = getCurrentAlign()

  // Get current line height from the selected node
  const getCurrentLineHeight = () => {
    const { selection } = editor.state
    const { $from } = selection
    const node = $from.parent
    return node.attrs.lineHeight || null
  }
  const [currentLineHeight, setCurrentLineHeight] = useState(getCurrentLineHeight())
  const [selectedFontIndex, setSelectedFontIndex] = useState(-1)
  const [selectedLineHeightIndex, setSelectedLineHeightIndex] = useState(-1)

  // Update fontSize state when editor selection changes
  useEffect(() => {
    const updateFontSize = () => {
      const sizeAttr = editor.getAttributes('textStyle')?.fontSize
      if (sizeAttr) {
        const sizeNum = parseInt(sizeAttr.replace('px', ''))
        if (!isNaN(sizeNum)) {
          setFontSize(sizeNum)
          setFontSizeDisplay(sizeNum.toString())
        } else {
          setFontSizeDisplay('inherited')
          setFontSize(16)
        }
      } else {
        setFontSizeDisplay('inherited')
        setFontSize(16) // Default for editing (matches browser default)
      }
    }

    const updateLineHeight = () => {
      const lineHeight = getCurrentLineHeight()
      setCurrentLineHeight(lineHeight)
    }

    // Initial update
    updateFontSize()
    updateLineHeight()

    editor.on('selectionUpdate', () => {
      updateFontSize()
      updateLineHeight()
    })
    editor.on('transaction', () => {
      updateFontSize()
      updateLineHeight()
    })
    return () => {
      editor.off('selectionUpdate', updateFontSize)
      editor.off('transaction', updateFontSize)
    }
  }, [editor])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside and dropdowns are open
      if (fontFamilyRef.current && showFontFamily && !fontFamilyRef.current.contains(event.target)) {
        setShowFontFamily(false)
      }
      if (fontSizeRef.current && showFontSize && !fontSizeRef.current.contains(event.target)) {
        setShowFontSize(false)
      }
      if (lineHeightRef.current && showLineHeight && !lineHeightRef.current.contains(event.target)) {
        setShowLineHeight(false)
      }
      // For color pickers, check if click is outside both button and picker
      if (textColorRef.current && showTextColor) {
        const isClickOnButton = textColorRef.current.contains(event.target)
        // Check if click is on the color picker div (has fixed bg-white class)
        const isClickOnPicker = event.target.closest('.fixed.bg-white.border.border-gray-300.rounded-md.shadow-lg')
        if (!isClickOnButton && !isClickOnPicker) {
          setShowTextColor(false)
        }
      }
      if (highlightColorRef.current && showHighlightColor) {
        const isClickOnButton = highlightColorRef.current.contains(event.target)
        // Check if click is on the color picker div (has fixed bg-white class)
        const isClickOnPicker = event.target.closest('.fixed.bg-white.border.border-gray-300.rounded-md.shadow-lg')
        if (!isClickOnButton && !isClickOnPicker) {
          setShowHighlightColor(false)
        }
      }
      if (alignRef.current && showAlign && !alignRef.current.contains(event.target)) {
        setShowAlign(false)
      }
    }

    // Only add listener if at least one dropdown is open
    const hasOpenDropdown = showFontFamily || showFontSize || showLineHeight || showTextColor || showHighlightColor || showAlign

    if (hasOpenDropdown) {
      // Use setTimeout to avoid immediate execution during render
      const timeoutId = setTimeout(() => {
        if (typeof document !== 'undefined') {
          document.addEventListener('mousedown', handleClickOutside)
        }
      }, 0)

      return () => {
        clearTimeout(timeoutId)
        if (typeof document !== 'undefined') {
          document.removeEventListener('mousedown', handleClickOutside)
        }
      }
    }
  }, [showFontFamily, showFontSize, showLineHeight, showTextColor, showHighlightColor, showAlign])

  const handleFontFamilyChange = (font) => {
    if (!editor) return
    editor.chain().focus().setFontFamily(font).run()
    setActiveStyle(prev => ({ ...prev, fontFamily: font }))
    shouldApplyActiveStyleRef.current = true
    setShowFontFamily(false)
  }

  // Keyboard shortcuts for font family
  useEffect(() => {
    if (!editor) return

    const handleKeyDown = (e) => {
      // Command+Shift+[ to go to previous font
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === '[') {
        e.preventDefault()
        const currentIndex = FONT_FAMILIES.indexOf(currentFontFamily)
        const prevIndex = currentIndex <= 0 ? FONT_FAMILIES.length - 1 : currentIndex - 1
        const prevFont = FONT_FAMILIES[prevIndex]
        handleFontFamilyChange(prevFont)
      }
      // Command+Shift+] to go to next font
      else if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === ']') {
        e.preventDefault()
        const currentIndex = FONT_FAMILIES.indexOf(currentFontFamily)
        const nextIndex = (currentIndex + 1) % FONT_FAMILIES.length
        const nextFont = FONT_FAMILIES[nextIndex]
        handleFontFamilyChange(nextFont)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editor, currentFontFamily, handleFontFamilyChange])

  // Keyboard shortcuts for font size (Command+Shift+> to increase, Command+Shift+< to decrease)
  useEffect(() => {
    if (!editor) return

    const handleKeyDown = (e) => {
      // Command+Shift+> or Command+Shift+. to increase font size
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === '>' || e.key === '.')) {
        e.preventDefault()
        const currentValue = fontSizeDisplay === 'inherited' ? fontSize : parseInt(fontSizeDisplay) || fontSize
        const currentIndex = FONT_SIZES.indexOf(currentValue)
        if (currentIndex >= 0 && currentIndex < FONT_SIZES.length - 1) {
          const newSize = FONT_SIZES[currentIndex + 1]
          setFontSize(newSize)
          setFontSizeDisplay(newSize.toString())
          editor.chain().focus().setFontSize(`${newSize}px`).run()
          setActiveStyle(prev => ({ ...prev, fontSize: newSize }))
          shouldApplyActiveStyleRef.current = true
        } else if (currentIndex === -1 && currentValue < FONT_SIZES[FONT_SIZES.length - 1]) {
          const largerSize = FONT_SIZES.find(s => s > currentValue)
          if (largerSize) {
            setFontSize(largerSize)
            setFontSizeDisplay(largerSize.toString())
            editor.chain().focus().setFontSize(`${largerSize}px`).run()
            setActiveStyle(prev => ({ ...prev, fontSize: largerSize }))
            shouldApplyActiveStyleRef.current = true
          }
        }
      }
      // Command+Shift+< or Command+Shift+, to decrease font size
      else if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === '<' || e.key === ',')) {
        e.preventDefault()
        const currentValue = fontSizeDisplay === 'inherited' ? fontSize : parseInt(fontSizeDisplay) || fontSize
        const currentIndex = FONT_SIZES.indexOf(currentValue)
        if (currentIndex > 0) {
          const newSize = FONT_SIZES[currentIndex - 1]
          setFontSize(newSize)
          setFontSizeDisplay(newSize.toString())
          editor.chain().focus().setFontSize(`${newSize}px`).run()
          setActiveStyle(prev => ({ ...prev, fontSize: newSize }))
          shouldApplyActiveStyleRef.current = true
        } else if (currentIndex === -1 && currentValue > FONT_SIZES[0]) {
          const smallerSize = FONT_SIZES.filter(s => s < currentValue).pop()
          if (smallerSize) {
            setFontSize(smallerSize)
            setFontSizeDisplay(smallerSize.toString())
            editor.chain().focus().setFontSize(`${smallerSize}px`).run()
            setActiveStyle(prev => ({ ...prev, fontSize: smallerSize }))
            shouldApplyActiveStyleRef.current = true
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editor, fontSize, fontSizeDisplay])

  const handleFontSizeChange = (size) => {
    editor.chain().focus().setFontSize(`${size}px`).run()
    setFontSize(size)
    setActiveStyle(prev => ({ ...prev, fontSize: size }))
    shouldApplyActiveStyleRef.current = true
    setShowFontSize(false)
  }

  const handleFontSizeInput = (e) => {
    const value = e.target.value
    // Allow typing numbers and empty string
    if (value === '' || /^\d*$/.test(value)) {
      setFontSizeDisplay(value)
    }
  }

  const handleFontSizeDecrease = () => {
    const currentSize = fontSizeDisplay === 'inherited' ? 16 : fontSize
    const newSize = Math.max(8, currentSize - 2)
    setFontSize(newSize)
    setFontSizeDisplay(newSize.toString())
    editor.chain().focus().setFontSize(`${newSize}px`).run()
    setActiveStyle(prev => ({ ...prev, fontSize: newSize }))
    shouldApplyActiveStyleRef.current = true
  }

  const handleFontSizeIncrease = () => {
    const currentSize = fontSizeDisplay === 'inherited' ? 16 : fontSize
    const newSize = Math.min(400, currentSize + 2)
    setFontSize(newSize)
    setFontSizeDisplay(newSize.toString())
    editor.chain().focus().setFontSize(`${newSize}px`).run()
    setActiveStyle(prev => ({ ...prev, fontSize: newSize }))
    shouldApplyActiveStyleRef.current = true
  }

  // Auto-repeat refs for font size buttons
  const fontSizeIntervalRef = useRef(null)
  const fontSizeTimeoutRef = useRef(null)

  const startFontSizeRepeat = (action) => {
    action() // Immediate action
    fontSizeTimeoutRef.current = setTimeout(() => {
      fontSizeIntervalRef.current = setInterval(action, 80)
    }, 400) // Start repeating after 400ms
  }

  const stopFontSizeRepeat = () => {
    if (fontSizeTimeoutRef.current) clearTimeout(fontSizeTimeoutRef.current)
    if (fontSizeIntervalRef.current) clearInterval(fontSizeIntervalRef.current)
  }

  const handleTextColorChange = (color) => {
    // Always apply color to editor (even if selection is empty, for future text)
    // This ensures color is applied when typing on a new line
    editor.chain().focus().setColor(color).run()

    // Always update active style and dispatch event (for future text and drawing)
    setActiveStyle(prev => ({ ...prev, color }))
    shouldApplyActiveStyleRef.current = true

    // Store color globally for drawing component to read
    window.__drawingPenColor = color

    // Dispatch custom event for drawing component to update color
    window.dispatchEvent(new CustomEvent('textColorChanged', { detail: { color } }))

    // Don't close the color picker automatically - let user close it manually or by clicking outside
    // setShowTextColor(false)
  }

  const handleHighlightColorChange = (color) => {
    // Always apply highlight color (even if selection is empty, for future text)
    // This ensures highlight is applied when typing on a new line
    // Similar to text color - always apply to editor
    if (!editor.state.selection.empty) {
      // Text is selected - apply highlight directly
      editor.chain().focus().toggleHighlight({ color }).run()
    } else {
      // No selection - set highlight for future text
      // Use setMark to prepare the highlight for the next typed text
      editor.chain().focus().setHighlight({ color }).run()
    }

    // Always update active style
    setActiveStyle(prev => ({ ...prev, highlightColor: color }))
    shouldApplyActiveStyleRef.current = true

    // Don't close the color picker automatically - let user close it manually or by clicking outside
    // setShowHighlightColor(false)
  }

  const handleAlignChange = (align) => {
    // Check if an image is selected
    const { selection } = editor.state
    const { $from } = selection
    let imageNode = null
    let imagePos = null

    // Check if selection is on an image
    editor.state.doc.nodesBetween($from.start(), $from.end(), (node, pos) => {
      if (node.type && node.type.name === 'image') {
        imageNode = node
        imagePos = pos
        return false
      }
    })

    if (imageNode && editor.can().setImageAlign) {
      // Use image align command
      editor.chain().focus().setImageAlign(align).run()
    } else {
      // Use text align command
      editor.chain().focus().setTextAlign(align).run()
    }

    setActiveStyle(prev => ({ ...prev, align }))
    shouldApplyActiveStyleRef.current = true
    // Don't close dropdown - let user click outside when done
  }

  const handleLineHeightChange = (lineHeight) => {
    if (lineHeight === null) {
      editor.chain().focus().unsetLineHeight().run()
    } else {
      editor.chain().focus().setLineHeight(lineHeight).run()
    }
    setActiveStyle(prev => ({ ...prev, lineHeight }))
    shouldApplyActiveStyleRef.current = true
    setShowLineHeight(false)
  }

  // Apply active style to selected text
  const applyActiveStyle = () => {
    if (!editor) return

    const chain = editor.chain().focus()

    // Apply font family
    chain.setFontFamily(activeStyle.fontFamily)

    // Apply font size
    chain.setFontSize(`${activeStyle.fontSize}px`)

    // Apply text color
    chain.setColor(activeStyle.color)

    // Apply line height
    if (activeStyle.lineHeight) {
      chain.setLineHeight(activeStyle.lineHeight)
    } else {
      chain.unsetLineHeight()
    }

    // Apply alignment
    chain.setTextAlign(activeStyle.align)

    // Apply bold, italic, underline
    if (activeStyle.bold) {
      chain.setBold()
    } else {
      chain.unsetBold()
    }

    if (activeStyle.italic) {
      chain.setItalic()
    } else {
      chain.unsetItalic()
    }

    if (activeStyle.underline) {
      chain.setUnderline()
    } else {
      chain.unsetUnderline()
    }

    // Apply highlight
    if (activeStyle.highlightColor) {
      chain.setHighlight({ color: activeStyle.highlightColor })
    } else {
      chain.unsetHighlight()
    }

    chain.run()
  }

  // Track if we should apply active style (set to true when style is changed via toolbar)
  const shouldApplyActiveStyleRef = useRef(false)

  // Listen for selection changes and apply active style
  // In paint mode, always apply active style to selections and when typing
  useEffect(() => {
    if (!editor) return

    let lastSelection = null

    const handleSelectionUpdate = () => {
      const { selection } = editor.state

      // Only apply if there's a selection (not just a cursor)
      if (selection.empty) {
        lastSelection = null
        shouldApplyActiveStyleRef.current = false
        return
      }

      // Check if this is a new selection (different from last)
      const selectionKey = `${selection.from}-${selection.to}`
      if (lastSelection === selectionKey) {
        return // Same selection, don't reapply
      }

      lastSelection = selectionKey

      // In paint mode, always apply active style to new selections
      if (paintMode) {
        setTimeout(() => {
          if (!editor.state.selection.empty) {
            applyActiveStyle()
          }
        }, 10)
      } else {
        // Normal mode: only apply if we just changed a style in toolbar
        if (shouldApplyActiveStyleRef.current) {
          setTimeout(() => {
            if (!editor.state.selection.empty) {
              applyActiveStyle()
            }
          }, 10)
          shouldApplyActiveStyleRef.current = false
        }
      }
    }

    // In paint mode, also apply style when typing (on transaction)
    const handleTransaction = () => {
      if (paintMode && editor.state.selection.empty) {
        // Apply active style to the current cursor position when typing
        setTimeout(() => {
          applyActiveStyle()
        }, 10)
      }
    }

    editor.on('selectionUpdate', handleSelectionUpdate)
    if (paintMode) {
      editor.on('transaction', handleTransaction)
    }

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate)
      if (paintMode) {
        editor.off('transaction', handleTransaction)
      }
    }
  }, [editor, activeStyle, paintMode])

  // Update active style from editor when selection changes (but don't apply it back)
  // In paint mode, we don't update the active style from selection
  useEffect(() => {
    if (!editor) return

    const updateActiveStyleFromEditor = () => {
      // In paint mode, don't update active style from selection
      if (paintMode) return

      // Only update if we're not in the middle of applying active style
      if (shouldApplyActiveStyleRef.current) return

      // Check if an image is selected
      const { selection } = editor.state
      const { $from } = selection
      let imageNode = null

      editor.state.doc.nodesBetween($from.start(), $from.end(), (node) => {
        if (node.type && node.type.name === 'image') {
          imageNode = node
          return false
        }
      })

      let align = 'left'
      if (imageNode) {
        align = imageNode.attrs.align || 'center'
      } else {
        align = editor.getAttributes('textAlign')?.textAlign || 'left'
      }

      const attrs = editor.getAttributes('textStyle')
      const isBold = editor.isActive('bold')
      const isItalic = editor.isActive('italic')
      const isUnderline = editor.isActive('underline')
      const highlight = editor.getAttributes('highlight')

      setActiveStyle(prev => ({
        ...prev,
        fontFamily: attrs.fontFamily || prev.fontFamily,
        fontSize: attrs.fontSize ? parseInt(attrs.fontSize.replace('px', '')) : prev.fontSize,
        bold: isBold,
        italic: isItalic,
        underline: isUnderline,
        color: attrs.color || prev.color,
        highlightColor: highlight?.color || prev.highlightColor,
        align: align
      }))
    }

    editor.on('selectionUpdate', updateActiveStyleFromEditor)

    return () => {
      editor.off('selectionUpdate', updateActiveStyleFromEditor)
    }
  }, [editor, paintMode])

  const LINE_HEIGHT_OPTIONS = [
    { value: null, label: 'Default' },
    { value: '1.0', label: '1.0' },
    { value: '1.15', label: '1.15' },
    { value: '1.5', label: '1.5' },
    { value: '2.0', label: '2.0' },
    { value: '2.5', label: '2.5' },
  ]

  return (
    <div className="flex items-center gap-1 md:gap-1 p-2 md:p-1.5 bg-white/90 backdrop-blur-xl border border-gray-100 overflow-x-auto flex-wrap sticky top-2 z-[60] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] font-['DM_Sans',sans-serif]" style={{ position: 'sticky', top: '0.5rem', zIndex: 60 }}>
      {/* Font Family with navigation */}
      <div className="flex items-center bg-gray-50 rounded-xl border border-gray-100 p-0.5 overflow-hidden">
        <button
          onClick={() => {
            const currentIndex = FONT_FAMILIES.indexOf(currentFontFamily)
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : FONT_FAMILIES.length - 1
            handleFontFamilyChange(FONT_FAMILIES[prevIndex])
          }}
          className="p-1 h-7 w-7 rounded-lg hover:bg-white flex items-center justify-center transition-colors"
          title={t?.prevFont || 'Previous font'}
          aria-label={t?.prevFont || 'Previous font'}
        >
          <ChevronLeft className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
        </button>
        <div className="relative" ref={fontFamilyRef}>
          <button
            onClick={() => {
              if (fontFamilyRef.current) {
                const rect = fontFamilyRef.current.getBoundingClientRect()
                setFontFamilyPosition({ top: rect.bottom + 4, left: rect.left })
              }
              const currentIndex = FONT_FAMILIES.indexOf(currentFontFamily)
              setSelectedFontIndex(currentIndex >= 0 ? currentIndex : 0)
              setShowFontFamily(!showFontFamily)
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                e.stopPropagation()
                if (!showFontFamily) {
                  setShowFontFamily(true)
                  const currentIndex = FONT_FAMILIES.indexOf(currentFontFamily)
                  setSelectedFontIndex(currentIndex >= 0 ? currentIndex : 0)
                } else {
                  setSelectedFontIndex(prev => Math.min(prev + 1, FONT_FAMILIES.length - 1))
                }
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                e.stopPropagation()
                if (!showFontFamily) {
                  setShowFontFamily(true)
                  const currentIndex = FONT_FAMILIES.indexOf(currentFontFamily)
                  setSelectedFontIndex(currentIndex >= 0 ? currentIndex : 0)
                } else {
                  setSelectedFontIndex(prev => Math.max(prev - 1, 0))
                }
              } else if (e.key === 'Enter') {
                e.preventDefault()
                if (showFontFamily && selectedFontIndex >= 0 && selectedFontIndex < FONT_FAMILIES.length) {
                  handleFontFamilyChange(FONT_FAMILIES[selectedFontIndex])
                  setShowFontFamily(false)
                }
              } else if (e.key === 'Escape') {
                e.preventDefault()
                setShowFontFamily(false)
              }
            }}
            className="px-2.5 h-7 text-xs hover:bg-white flex items-center justify-between gap-2 max-w-[120px] rounded-lg transition-colors"
            title={currentFontFamily}
            aria-label={`Font family: ${currentFontFamily}`}
          >
            <span style={{ fontFamily: currentFontFamily }} className="truncate flex-1 font-medium">{currentFontFamily}</span>
            <ChevronDown className="w-3 h-3 text-gray-400 flex-shrink-0" />
          </button>
          {showFontFamily && createPortal(
            <>
              <div
                className="fixed inset-0"
                onClick={() => {
                  setShowFontFamily(false)
                  setSelectedFontIndex(-1)
                }}
                style={{ zIndex: 60 }}
              />
              <div
                className="fixed bg-white border border-gray-300 rounded shadow-lg max-h-64 overflow-y-auto w-48"
                style={{
                  zIndex: 70,
                  position: 'fixed',
                  top: `${fontFamilyPosition.top}px`,
                  left: `${fontFamilyPosition.left}px`
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    setSelectedFontIndex(prev => Math.min(prev + 1, FONT_FAMILIES.length - 1))
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    setSelectedFontIndex(prev => Math.max(prev - 1, 0))
                  } else if (e.key === 'Enter') {
                    e.preventDefault()
                    if (selectedFontIndex >= 0 && selectedFontIndex < FONT_FAMILIES.length) {
                      handleFontFamilyChange(FONT_FAMILIES[selectedFontIndex])
                      setShowFontFamily(false)
                      setSelectedFontIndex(-1)
                    }
                  } else if (e.key === 'Escape') {
                    e.preventDefault()
                    setShowFontFamily(false)
                    setSelectedFontIndex(-1)
                  }
                }}
                tabIndex={0}
              >
                {FONT_FAMILIES.map((font, index) => (
                  <button
                    key={font}
                    onClick={() => {
                      handleFontFamilyChange(font)
                      setShowFontFamily(false)
                      setSelectedFontIndex(-1)
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between ${index === selectedFontIndex ? 'bg-blue-50' : ''
                      } ${currentFontFamily === font ? 'font-semibold' : ''}`}
                    style={{ fontFamily: font }}
                    aria-label={`Select font ${font}`}
                  >
                    <span>{font}</span>
                    {currentFontFamily === font && (
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </>,
            document.body
          )}
        </div>
        <button
          onClick={() => {
            const currentIndex = FONT_FAMILIES.indexOf(currentFontFamily)
            const nextIndex = currentIndex < FONT_FAMILIES.length - 1 ? currentIndex + 1 : 0
            handleFontFamilyChange(FONT_FAMILIES[nextIndex])
          }}
          className="p-1 h-7 w-7 rounded-lg hover:bg-white flex items-center justify-center transition-colors"
          title={t?.nextFont || 'Next font'}
          aria-label={t?.nextFont || 'Next font'}
        >
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
        </button>
      </div>

      {/* Font Size */}
      <div className="relative flex items-center bg-gray-50 rounded-xl border border-gray-100 h-8 p-0.5" ref={fontSizeRef}>
        <button
          onMouseDown={() => startFontSizeRepeat(handleFontSizeDecrease)}
          onMouseUp={stopFontSizeRepeat}
          onMouseLeave={stopFontSizeRepeat}
          onTouchStart={() => startFontSizeRepeat(handleFontSizeDecrease)}
          onTouchEnd={stopFontSizeRepeat}
          className="w-7 h-7 rounded-lg hover:bg-white text-gray-400 hover:text-gray-900 flex items-center justify-center transition-colors select-none"
          aria-label="Decrease font size"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <div className="relative h-full flex items-center">
          <input
            type="number"
            value={fontSizeDisplay === 'inherited' ? '' : fontSizeDisplay}
            onChange={handleFontSizeInput}
            onFocus={(e) => {
              if (fontSizeDisplay === 'inherited') {
                e.target.value = fontSize.toString()
                setFontSizeDisplay(fontSize.toString())
              }
            }}
            onBlur={(e) => {
              const value = e.target.value.trim()
              if (!value || value === '' || value === 'inherited') {
                setFontSizeDisplay('inherited')
                editor.chain().focus().unsetFontSize().run()
              } else {
                const numValue = parseInt(value)
                if (!isNaN(numValue) && numValue > 0) {
                  setFontSize(numValue)
                  setFontSizeDisplay(numValue.toString())
                  editor.chain().focus().setFontSize(`${numValue}px`).run()
                  setActiveStyle(prev => ({ ...prev, fontSize: numValue }))
                  shouldApplyActiveStyleRef.current = true
                }
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.target.blur()
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                const currentValue = fontSizeDisplay === 'inherited' ? fontSize : parseInt(fontSizeDisplay) || fontSize
                const currentIndex = FONT_SIZES.indexOf(currentValue)
                if (currentIndex > 0) {
                  const newSize = FONT_SIZES[currentIndex - 1]
                  setFontSize(newSize)
                  setFontSizeDisplay(newSize.toString())
                  editor.chain().focus().setFontSize(`${newSize}px`).run()
                  setActiveStyle(prev => ({ ...prev, fontSize: newSize }))
                  shouldApplyActiveStyleRef.current = true
                } else if (currentIndex === -1 && currentValue > FONT_SIZES[0]) {
                  // Find closest smaller size
                  const smallerSize = FONT_SIZES.filter(s => s < currentValue).pop()
                  if (smallerSize) {
                    setFontSize(smallerSize)
                    setFontSizeDisplay(smallerSize.toString())
                    editor.chain().focus().setFontSize(`${smallerSize}px`).run()
                    setActiveStyle(prev => ({ ...prev, fontSize: smallerSize }))
                    shouldApplyActiveStyleRef.current = true
                  }
                }
              } else if (e.key === 'ArrowDown') {
                e.preventDefault()
                e.stopPropagation() // Prevent cursor movement in editor
                const currentValue = fontSizeDisplay === 'inherited' ? fontSize : parseInt(fontSizeDisplay) || fontSize
                const currentIndex = FONT_SIZES.indexOf(currentValue)
                if (currentIndex >= 0 && currentIndex < FONT_SIZES.length - 1) {
                  const newSize = FONT_SIZES[currentIndex + 1]
                  setFontSize(newSize)
                  setFontSizeDisplay(newSize.toString())
                  editor.chain().focus().setFontSize(`${newSize}px`).run()
                  setActiveStyle(prev => ({ ...prev, fontSize: newSize }))
                  shouldApplyActiveStyleRef.current = true
                } else if (currentIndex === -1 && currentValue < FONT_SIZES[FONT_SIZES.length - 1]) {
                  // Find closest larger size
                  const largerSize = FONT_SIZES.find(s => s > currentValue)
                  if (largerSize) {
                    setFontSize(largerSize)
                    setFontSizeDisplay(largerSize.toString())
                    editor.chain().focus().setFontSize(`${largerSize}px`).run()
                    setActiveStyle(prev => ({ ...prev, fontSize: largerSize }))
                    shouldApplyActiveStyleRef.current = true
                  }
                }
              }
            }}
            min="8"
            max="400"
            className="w-10 px-0 h-7 text-center text-xs focus:outline-none focus:ring-0 font-medium bg-transparent text-gray-700"
            style={{
              WebkitAppearance: 'textfield',
              MozAppearance: 'textfield'
            }}
            placeholder="—"
            aria-label="Font size"
          />
        </div>
        <button
          onMouseDown={() => startFontSizeRepeat(handleFontSizeIncrease)}
          onMouseUp={stopFontSizeRepeat}
          onMouseLeave={stopFontSizeRepeat}
          onTouchStart={() => startFontSizeRepeat(handleFontSizeIncrease)}
          onTouchEnd={stopFontSizeRepeat}
          className="w-7 h-7 rounded-lg hover:bg-white text-gray-400 hover:text-gray-900 flex items-center justify-center transition-colors select-none"
          aria-label="Increase font size"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Line break on mobile - font and size on first row, rest on second row */}
      <div className="w-full md:hidden" />

      {/* Group: Core Tools */}
      <div className="flex items-center bg-gray-50 rounded-xl border border-gray-100 p-0.5 overflow-hidden">
        <Tooltip label={t?.brushMode || 'Brush mode'}>
          <button
            onClick={togglePaintMode}
            className={`p-1.5 h-8 w-8 rounded-lg hover:bg-white flex items-center justify-center transition-all ${paintMode ? 'bg-cyan-100 text-cyan-600 shadow-sm' : 'text-gray-400'
              }`}
            aria-label={t?.brushMode || 'Brush mode'}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 11l-8-8-8.6 8.6a2 2 0 000 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11z" />
              <path d="M5 17l-2 4" strokeLinecap="round" />
              <path d="M21 21c0-1.5-1.5-3-3-3s-3 1.5-3 3 1.5 3 3 3 3-1.5 3-3z" fill="currentColor" />
            </svg>
          </button>
        </Tooltip>
      </div>

      {showPaintTooltip && paintMode && createPortal(
        <>
          <div
            className="fixed inset-0 z-[10002] bg-black bg-opacity-50"
            onClick={dismissPaintTooltip}
          />
          <div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 bg-gray-900 text-white text-sm rounded-lg p-4 shadow-xl z-[10003]"
          >
            <div className="font-semibold mb-2 text-lg">Paint Mode</div>
            <div className="text-gray-300 text-sm mb-4">
              When Paint Mode is active, your current style settings (font, size, color, etc.) will be automatically applied to any text you select or click on. The style won't change when you click on different text - it stays fixed to your preset.
            </div>
            <button
              onClick={dismissPaintTooltip}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
            >
              Got it
            </button>
          </div>
        </>,
        document.body
      )}

      <div className="w-px h-8 md:h-6 bg-gray-300 mx-1 md:mx-0.5 hidden md:block" />

      {/* Group: Basic Formatting */}
      <div className="flex items-center bg-gray-50 rounded-xl border border-gray-100 p-0.5 overflow-hidden">
        <div className="hidden xs:block">
          <Tooltip label={t?.bold || 'Bold'} shortcut={['⌘', 'B']}>
            <button
              onClick={() => {
                const newBold = !editor.isActive('bold')
                editor.chain().focus().toggleBold().run()
                setActiveStyle(prev => ({ ...prev, bold: newBold }))
                shouldApplyActiveStyleRef.current = true
              }}
              className={`p-1.5 h-7 w-7 rounded-lg flex items-center justify-center transition-all ${editor.isActive('bold') ? 'bg-white text-cyan-600 shadow-sm' : 'text-gray-500 hover:bg-white hover:text-gray-900'
                }`}
              aria-label={t?.bold || 'Bold'}
            >
              <Bold className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>

        {/* Italic - hidden on mobile */}
        <div className="hidden xs:block">
          <Tooltip label={t?.italic || 'Italic'} shortcut={['⌘', 'I']}>
            <button
              onClick={() => {
                const newItalic = !editor.isActive('italic')
                editor.chain().focus().toggleItalic().run()
                setActiveStyle(prev => ({ ...prev, italic: newItalic }))
                shouldApplyActiveStyleRef.current = true
              }}
              className={`p-1.5 h-7 w-7 rounded-lg flex items-center justify-center transition-all ${editor.isActive('italic') ? 'bg-white text-cyan-600 shadow-sm' : 'text-gray-500 hover:bg-white hover:text-gray-900'
                }`}
              aria-label={t?.italic || 'Italic'}
            >
              <Italic className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>

        {/* Underline - hidden on mobile */}
        <div className="hidden xs:block">
          <Tooltip label={t?.underline || 'Underline'} shortcut={['⌘', 'U']}>
            <button
              onClick={() => {
                const newUnderline = !editor.isActive('underline')
                editor.chain().focus().toggleUnderline().run()
              }}
              className={`p-1.5 h-7 w-7 rounded-lg flex items-center justify-center transition-all ${editor.isActive('underline') ? 'bg-white text-cyan-600 shadow-sm' : 'text-gray-500 hover:bg-white hover:text-gray-900'
                }`}
              aria-label={t?.underline || 'Underline'}
            >
              <Underline className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>

        <Tooltip label={t?.clearFormatting || 'Clear formatting'}>
          <button
            onClick={() => {
              editor.chain().focus()
                .unsetBold()
                .unsetItalic()
                .unsetUnderline()
                .unsetStrike()
                .unsetColor()
                .unsetHighlight()
                .unsetLink()
                .unsetFontFamily()
                .unsetFontSize()
                .setTextAlign('left')
                .run()
            }}
            className="p-1.5 h-7 w-7 rounded-lg text-gray-400 hover:bg-white hover:text-gray-900 flex items-center justify-center transition-all"
            aria-label={t?.clearFormatting || 'Clear formatting'}
          >
            <Eraser className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>

      <div className="w-px h-6 md:h-5 bg-gray-100 mx-1 md:mx-0.5" />

      {/* Group: Colors */}
      <div className="flex items-center bg-gray-50 rounded-xl border border-gray-100 p-0.5 overflow-hidden">
        {/* Text Color */}
        <div className="relative" ref={textColorRef}>
          <Tooltip label={t?.textColor || 'Text color'}>
            <button
              onClick={() => {
                if (textColorRef.current) {
                  const rect = textColorRef.current.getBoundingClientRect()
                  setTextColorPosition({ top: rect.bottom + 4, left: rect.left })
                }
                setShowTextColor(!showTextColor)
              }}
              className={`p-1.5 h-8 w-8 rounded-lg hover:bg-white flex items-center justify-center transition-all ${showTextColor ? 'bg-white shadow-sm' : ''
                }`}
              aria-label={t?.textColor || 'Text color'}
            >
              <div className="flex flex-col items-center justify-center">
                <span className="text-sm font-bold leading-none" style={{ color: currentTextColor }}>A</span>
                <div
                  className="w-4 h-1 rounded-sm mt-0.5"
                  style={{ backgroundColor: currentTextColor }}
                />
              </div>
            </button>
          </Tooltip>
          {showTextColor && createPortal(
            <>
              <div
                className="fixed inset-0"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setShowTextColor(false)
                  }
                }}
                style={{ zIndex: 60 }}
              />
              <div
                className="fixed bg-white border border-gray-100 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] p-3 min-w-[280px]"
                style={{
                  zIndex: 70,
                  top: `${textColorPosition.top}px`,
                  left: `${textColorPosition.left}px`
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                {/* Preset Colors Grid */}
                <div className="mb-3">
                  <div className="text-xs font-semibold text-gray-500 mb-2 px-1">
                    {t?.presetColors || 'Preset Colors'}
                  </div>
                  <div className="grid grid-cols-10 gap-1">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTextColorChange(color)
                        }}
                        className={`w-6 h-6 rounded border-2 transition-all hover:scale-110 ${currentTextColor === color
                          ? 'border-blue-500 ring-2 ring-blue-300'
                          : 'border-gray-300 hover:border-gray-400'
                          }`}
                        style={{ backgroundColor: color }}
                        title={color}
                        aria-label={`Select text color ${color}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Custom Color */}
                <div className="border-t border-gray-200 pt-3">
                  <div className="text-xs font-semibold text-gray-500 mb-2 px-1">
                    {t?.customColor || 'Custom Color'}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentTextColor}
                      onChange={(e) => handleTextColorChange(e.target.value)}
                      className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
                      aria-label="Custom text color picker"
                    />
                    <input
                      type="text"
                      value={currentTextColor}
                      onChange={(e) => {
                        const value = e.target.value
                        if (/^#[0-9A-Fa-f]{0,6}$/.test(value) || value === '') {
                          if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                            handleTextColorChange(value)
                          }
                        }
                      }}
                      onBlur={(e) => {
                        const value = e.target.value
                        if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                          handleTextColorChange(value)
                        } else {
                          e.target.value = currentTextColor
                        }
                      }}
                      className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="#000000"
                      maxLength={7}
                      aria-label="Custom text color hex code"
                    />
                  </div>
                </div>
              </div>
            </>,
            document.body
          )}
        </div>

        {/* Highlight Color */}
        <div className="relative" ref={highlightColorRef}>
          <Tooltip label={t?.highlighter || 'Highlighter'}>
            <button
              onClick={() => {
                if (highlightColorRef.current) {
                  const rect = highlightColorRef.current.getBoundingClientRect()
                  setHighlightColorPosition({ top: rect.bottom + 4, left: rect.left })
                }
                setShowHighlightColor(!showHighlightColor)
              }}
              className={`p-1.5 h-8 w-8 rounded-lg hover:bg-white flex items-center justify-center transition-all ${showHighlightColor ? 'bg-white shadow-sm' : ''
                }`}
              aria-label={t?.highlighter || 'Highlighter'}
            >
              <div className="flex flex-col items-center justify-center">
                <Highlighter className="w-4 h-4 text-gray-500" />
                <div
                  className="w-4 h-1 rounded-sm mt-0.5"
                  style={{ backgroundColor: currentHighlightColor || '#FFFF00' }}
                />
              </div>
            </button>
          </Tooltip>
          {showHighlightColor && createPortal(
            <>
              <div
                className="fixed inset-0"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setShowHighlightColor(false)
                  }
                }}
                style={{ zIndex: 60 }}
              />
              <div
                className="fixed bg-white border border-gray-300 rounded-md shadow-lg p-3 min-w-[280px]"
                style={{
                  zIndex: 70,
                  top: `${highlightColorPosition.top}px`,
                  left: `${highlightColorPosition.left}px`
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                {/* Preset Colors Grid */}
                <div className="mb-3">
                  <div className="text-xs font-semibold text-gray-500 mb-2 px-1">
                    {t?.presetColors || 'Preset Colors'}
                  </div>
                  <div className="grid grid-cols-10 gap-1">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleHighlightColorChange(color)
                        }}
                        className={`w-6 h-6 rounded border-2 transition-all hover:scale-110 ${currentHighlightColor === color
                          ? 'border-blue-500 ring-2 ring-blue-300'
                          : 'border-gray-300 hover:border-gray-400'
                          }`}
                        style={{ backgroundColor: color }}
                        title={color}
                        aria-label={`Select highlight color ${color}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Custom Color */}
                <div className="border-t border-gray-200 pt-3">
                  <div className="text-xs font-semibold text-gray-500 mb-2 px-1">
                    {t?.customColor || 'Custom Color'}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentHighlightColor || '#fef08a'}
                      onChange={(e) => handleHighlightColorChange(e.target.value)}
                      className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
                      aria-label="Custom highlight color picker"
                    />
                    <input
                      type="text"
                      value={currentHighlightColor || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        if (/^#[0-9A-Fa-f]{0,6}$/.test(value) || value === '') {
                          if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                            handleHighlightColorChange(value)
                          }
                        }
                      }}
                      onBlur={(e) => {
                        const value = e.target.value
                        if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                          handleHighlightColorChange(value)
                        } else {
                          e.target.value = currentHighlightColor || ''
                        }
                      }}
                      className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="#fef08a"
                      maxLength={7}
                      aria-label="Custom highlight color hex code"
                    />
                  </div>
                </div>
              </div>
            </>,
            document.body
          )}
        </div>
      </div>

      <div className="w-px h-6 md:h-5 bg-gray-100 mx-1 md:mx-0.5 hidden xs:block" />

      {/* Group: Alignment */}
      <div className="flex items-center bg-gray-50 rounded-xl border border-gray-100 p-0.5 overflow-hidden">
        {/* Alignment - hidden on mobile */}
        <div className="relative hidden xs:block" ref={alignRef}>
          <Tooltip label={t?.alignment || 'Alignment'}>
            <button
              onClick={() => {
                if (alignRef.current) {
                  const rect = alignRef.current.getBoundingClientRect()
                  setAlignPosition({ top: rect.bottom + 4, left: rect.left })
                }
                setShowAlign(!showAlign)
              }}
              className={`p-1.5 h-8 rounded-lg hover:bg-white flex items-center justify-center gap-1 transition-all ${showAlign ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              aria-label={t?.alignment || 'Alignment'}
            >
              {currentAlign === 'left' && <AlignLeft className="w-4 h-4" />}
              {currentAlign === 'center' && <AlignCenter className="w-4 h-4" />}
              {currentAlign === 'right' && <AlignRight className="w-4 h-4" />}
              {currentAlign === 'justify' && <AlignJustify className="w-4 h-4" />}
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>
          </Tooltip>
          {showAlign && createPortal(
            <>
              <div
                className="fixed inset-0"
                onClick={() => setShowAlign(false)}
                style={{ zIndex: 60 }}
              />
              <div
                className="fixed bg-white border border-gray-300 rounded-lg shadow-lg p-1 flex gap-0.5"
                style={{
                  zIndex: 70,
                  position: 'fixed',
                  top: `${alignPosition.top}px`,
                  left: `${alignPosition.left}px`
                }}
              >
                <button
                  onClick={() => handleAlignChange('left')}
                  className={`p-2 rounded hover:bg-gray-100 ${currentAlign === 'left' ? 'bg-gray-200' : ''
                    }`}
                  title={t?.left || 'Left'}
                  aria-label={t?.left || 'Left'}
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleAlignChange('center')}
                  className={`p-2 rounded hover:bg-gray-100 ${currentAlign === 'center' ? 'bg-gray-200' : ''
                    }`}
                  title={t?.center || 'Center'}
                  aria-label={t?.center || 'Center'}
                >
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleAlignChange('right')}
                  className={`p-2 rounded hover:bg-gray-100 ${currentAlign === 'right' ? 'bg-gray-200' : ''
                    }`}
                  title={t?.right || 'Right'}
                  aria-label={t?.right || 'Right'}
                >
                  <AlignRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleAlignChange('justify')}
                  className={`p-2 rounded hover:bg-gray-100 ${currentAlign === 'justify' ? 'bg-gray-200' : ''
                    }`}
                  title={t?.justified || 'Justified'}
                  aria-label={t?.justified || 'Justified'}
                >
                  <AlignJustify className="w-4 h-4" />
                </button>
              </div>
            </>,
            document.body
          )}
        </div>
      </div>

      <div className="w-px h-6 md:h-5 bg-gray-100 mx-1 md:mx-0.5 hidden xs:block" />

      {/* Lists - hidden on mobile */}
      <div className="hidden xs:flex items-center bg-gray-50 rounded-xl border border-gray-100 p-0.5 overflow-hidden">
        <Tooltip label={t?.bulletList || 'Bullet list'} shortcut={['⌘', '⇧', '8']}>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 h-7 w-7 rounded-lg hover:bg-white flex items-center justify-center transition-all ${editor.isActive('bulletList') ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'
              }`}
            aria-label={t?.bulletList || 'Bullet list'}
          >
            <List className="w-4 h-4" />
          </button>
        </Tooltip>

        <Tooltip label={t?.numberedList || 'Numbered list'} shortcut={['⌘', '⇧', '7']}>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 h-7 w-7 rounded-lg hover:bg-white flex items-center justify-center transition-all ${editor.isActive('orderedList') ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'
              }`}
            aria-label={t?.numberedList || 'Numbered list'}
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>

      <div className="w-px h-6 md:h-5 bg-gray-100 mx-1 md:mx-0.5" />

      {/* Group: Objects & Links */}
      <div className="flex items-center bg-gray-50 rounded-xl border border-gray-100 p-0.5 overflow-hidden">
        {/* Image */}
        <Tooltip label={t?.insertImage || 'Insert image'}>
          <button
            aria-label={t?.insertImage || 'Insert image'}
            onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = 'image/*'
              input.multiple = false
              input.style.cssText = 'position:absolute;top:-9999px;left:-9999px;opacity:0;'
              document.body.appendChild(input)

              const handleChange = (e) => {
                const file = e.target.files?.[0]
                if (file) {
                  if (!file.type.startsWith('image/')) {
                    alert('Please select an image file')
                    cleanup()
                    return
                  }
                  const reader = new FileReader()
                  reader.onload = () => {
                    if (reader.result) {
                      editor.chain().focus().insertContent({
                        type: 'image',
                        attrs: { src: reader.result, alt: file.name || 'image' },
                      }).run()
                    }
                    cleanup()
                  }
                  reader.onerror = (err) => {
                    console.error('Error reading file:', err)
                    alert('Failed to load image')
                    cleanup()
                  }
                  reader.readAsDataURL(file)
                } else {
                  cleanup()
                }
              }

              const cleanup = () => {
                input.removeEventListener('change', handleChange)
                if (input.parentNode) {
                  input.parentNode.removeChild(input)
                }
              }

              input.addEventListener('change', handleChange)
              setTimeout(() => {
                input.click()
              }, 100)
            }}
            className="p-1.5 h-7 w-7 rounded-lg text-gray-500 hover:bg-white hover:text-gray-900 flex items-center justify-center transition-all"
          >
            <ImagePlus className="w-4 h-4" />
          </button>
        </Tooltip>

        {/* Drawing */}
        <Tooltip label={t?.drawingArea || 'Drawing area'}>
          <button
            aria-label={t?.drawingArea || 'Drawing area'}
            onClick={() => {
              if (editor && editor.can().setDrawing) {
                const isMobile = window.innerWidth < 768
                const width = isMobile ? Math.min(window.innerWidth - 48, 320) : 400
                const height = isMobile ? Math.round(width * 0.75) : 300
                editor.chain().focus().setDrawing({ paths: [], width, height }).run()
              }
            }}
            className="p-1.5 h-7 w-7 rounded-lg text-gray-500 hover:bg-white hover:text-gray-900 flex items-center justify-center transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M7 17c3-3 5-8 10-10" strokeLinecap="round" />
              <circle cx="17" cy="7" r="1.5" fill="currentColor" stroke="none" />
            </svg>
          </button>
        </Tooltip>

        {/* IPFS Storage - hidden on mobile */}
        <div className="hidden xs:block">
          <Tooltip label="IPFS Storage">
            <button
              aria-label="IPFS Storage"
              onClick={onOpenIpfsBrowser}
              className="p-1.5 h-7 w-7 rounded-lg text-gray-400 hover:bg-white hover:text-purple-600 flex items-center justify-center transition-all"
            >
              <HardDrive className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>

        {/* Import Instagram Chat - hidden on mobile */}
        <div className="hidden xs:block">
          <Tooltip label={t?.importInstagramChat || 'Import Instagram Chat'}>
            <button
              aria-label={t?.importInstagramChat || 'Import Instagram Chat'}
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = '.json'
                input.onchange = async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  try {
                    const text = await file.text()
                    const data = JSON.parse(text)
                    const { decodeInstagramObject } = await import('@/lib/utils/instagram-decoder')
                    const decoded = decodeInstagramObject(data)
                    if (editor && editor.can().setChatConversation) {
                      editor.chain().focus().setChatConversation({
                        messages: decoded.messages || [],
                        participants: decoded.participants || [],
                        title: decoded.title || null,
                        currentUser: 'Daniel',
                      }).run()
                    }
                  } catch (err) {
                    console.error('Error importing Instagram chat:', err)
                    alert('Failed to import chat: ' + err.message)
                  }
                }
                setTimeout(() => {
                  input.click()
                }, 100)
              }}
              className="p-1.5 h-7 w-7 rounded-lg text-gray-400 hover:bg-white hover:text-gray-900 flex items-center justify-center transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </Tooltip>
        </div>

        {/* Link */}
        <div className="hidden xs:block">
          <Tooltip label={t?.insertLink || 'Insert link'} shortcut={['⌘', 'K']}>
            <button
              aria-label={t?.insertLink || 'Insert link'}
              onClick={() => {
                const { selection } = editor.state
                const { $from, $to } = selection
                if ($from.pos === $to.pos) {
                  editor.chain().focus().setLink({ href: '' }).run()
                }
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
                window.dispatchEvent(new CustomEvent('showLinkEditor', {
                  detail: { position }
                }))
              }}
              className={`p-1.5 h-7 w-7 rounded-lg flex items-center justify-center transition-all ${editor.isActive('link') ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:bg-white hover:text-gray-900'
                }`}
            >
              <Link className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      </div>

      <div className="w-px h-6 md:h-5 bg-gray-100 mx-1 md:mx-0.5 hidden md:block" />

      {/* Group: History */}
      <div className="flex items-center bg-gray-50 rounded-xl border border-gray-100 p-0.5 overflow-hidden">
        <Tooltip label={t?.undo || 'Undo'} shortcut={['⌘', 'Z']}>
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            className="p-1.5 h-7 w-7 rounded-lg text-gray-500 hover:bg-white hover:text-gray-900 disabled:opacity-30 disabled:hover:bg-transparent flex items-center justify-center transition-all"
            aria-label={t?.undo || 'Undo'}
          >
            <Undo className="w-4 h-4" />
          </button>
        </Tooltip>

        <Tooltip label={t?.redo || 'Redo'} shortcut={['⌘', '⇧', 'Z']}>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            className="p-1.5 h-7 w-7 rounded-lg text-gray-500 hover:bg-white hover:text-gray-900 disabled:opacity-30 disabled:hover:bg-transparent flex items-center justify-center transition-all"
            aria-label={t?.redo || 'Redo'}
          >
            <Redo className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>

      {/* Save button / Status indicator - icon only, aligned right */}
      {onSave && (
        <div className="ml-auto">
          {saving ? (
            /* Saving in progress */
            <div className="h-8 px-3 rounded-xl flex items-center gap-1.5 bg-amber-50 text-amber-600 border border-amber-100">
              <div className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium hidden xs:inline">{t?.saving || 'Saving'}</span>
            </div>
          ) : hasChanges ? (
            /* Has unsaved changes - clickable to force save */
            <Tooltip label={t?.save || 'Save'} shortcut={['⌘', 'S']}>
              <button
                onClick={onSave}
                className="h-8 px-3 rounded-xl flex items-center gap-1.5 bg-gray-900 text-white hover:bg-black hover:scale-[1.02] active:scale-95 transition-all shadow-md shadow-gray-200"
                aria-label={t?.save || 'Save'}
              >
                <Save className="w-4 h-4" />
                <span className="text-xs font-medium hidden xs:inline">{t?.save || 'Save'}</span>
              </button>
            </Tooltip>
          ) : (
            /* All saved */
            <div className="h-8 px-3 rounded-xl flex items-center gap-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Check className="w-4 h-4" />
              <span className="text-xs font-medium hidden xs:inline">{t?.saved || 'Saved'}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


