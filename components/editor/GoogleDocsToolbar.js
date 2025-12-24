'use client'

import { useState, useRef, useEffect } from 'react'
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
  Image,
  Link,
  Undo,
  Redo,
  ChevronDown,
  Minus,
  Plus,
  Eraser,
  Paintbrush
} from 'lucide-react'

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

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 30, 36, 48, 60, 72, 96]

const TEXT_COLORS = [
  '#000000', '#434343', '#666666', '#999999', '#B7B7B7', '#CCCCCC', '#D9D9D9', '#EFEFEF', '#F3F3F3', '#FFFFFF',
  '#980000', '#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF', '#4A86E8', '#0000FF', '#9900FF', '#FF00FF',
  '#E6B8AF', '#F4CCCC', '#FCE5CD', '#FFF2CC', '#D9EAD3', '#D0E0E3', '#C9DAF8', '#CFE2F3', '#D9D2E9', '#EAD1DC',
  '#DD7E6B', '#EA9999', '#F9CB9C', '#FFE599', '#B6D7A8', '#A2C4C9', '#A4C2F4', '#9FC5E8', '#B4A7D6', '#D5A6BD',
  '#CC4125', '#E06666', '#F6B26B', '#FFD966', '#93C47D', '#76A5AF', '#6D9EEB', '#6FA8DC', '#8E7CC3', '#C27BA0',
  '#A61C00', '#CC0000', '#E69138', '#F1C232', '#6AA84F', '#45818E', '#3C78D8', '#3D85C6', '#674EA7', '#A64D79',
  '#85200C', '#990000', '#B45F06', '#BF9000', '#38761D', '#134F5C', '#1155CC', '#0B5394', '#351C75', '#741B47',
  '#5B0F00', '#660000', '#783F04', '#7F6000', '#274E13', '#0C343D', '#1C4587', '#073763', '#20124D', '#4C1130'
]

const HIGHLIGHT_COLORS = [
  '#FFFF00', '#FF9900', '#00FF00', '#00FFFF', '#FF00FF', '#FF0000', '#0000FF', '#000000', '#FFFFFF',
  '#FCE5CD', '#FFF2CC', '#D9EAD3', '#D0E0E3', '#C9DAF8', '#CFE2F3', '#D9D2E9', '#EAD1DC', '#F4CCCC',
  '#F9CB9C', '#FFE599', '#B6D7A8', '#A2C4C9', '#A4C2F4', '#9FC5E8', '#B4A7D6', '#D5A6BD', '#EA9999'
]

export default function GoogleDocsToolbar({ editor }) {
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
  const currentTextColor = editor.getAttributes('textStyle')?.color || '#000000'
  const currentHighlightColor = editor.getAttributes('highlight')?.color || null
  const currentAlign = editor.getAttributes('textAlign')?.textAlign || 'left'
  
  // Get current line height from the selected node
  const getCurrentLineHeight = () => {
    const { selection } = editor.state
    const { $from } = selection
    const node = $from.parent
    return node.attrs.lineHeight || null
  }
  const [currentLineHeight, setCurrentLineHeight] = useState(getCurrentLineHeight())

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
      if (fontFamilyRef.current && !fontFamilyRef.current.contains(event.target)) {
        setShowFontFamily(false)
      }
      if (fontSizeRef.current && !fontSizeRef.current.contains(event.target)) {
        setShowFontSize(false)
      }
      if (lineHeightRef.current && !lineHeightRef.current.contains(event.target)) {
        setShowLineHeight(false)
      }
      if (textColorRef.current && !textColorRef.current.contains(event.target)) {
        setShowTextColor(false)
      }
      if (highlightColorRef.current && !highlightColorRef.current.contains(event.target)) {
        setShowHighlightColor(false)
      }
      if (alignRef.current && !alignRef.current.contains(event.target)) {
        setShowAlign(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleFontFamilyChange = (font) => {
    editor.chain().focus().setFontFamily(font).run()
    setActiveStyle(prev => ({ ...prev, fontFamily: font }))
    shouldApplyActiveStyleRef.current = true
    setShowFontFamily(false)
  }

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
    const newSize = Math.max(8, currentSize - 1)
    setFontSize(newSize)
    setFontSizeDisplay(newSize.toString())
    editor.chain().focus().setFontSize(`${newSize}px`).run()
    setActiveStyle(prev => ({ ...prev, fontSize: newSize }))
    shouldApplyActiveStyleRef.current = true
  }

  const handleFontSizeIncrease = () => {
    const currentSize = fontSizeDisplay === 'inherited' ? 16 : fontSize
    const newSize = Math.min(400, currentSize + 1)
    setFontSize(newSize)
    setFontSizeDisplay(newSize.toString())
    editor.chain().focus().setFontSize(`${newSize}px`).run()
    setActiveStyle(prev => ({ ...prev, fontSize: newSize }))
    shouldApplyActiveStyleRef.current = true
  }

  const handleTextColorChange = (color) => {
    editor.chain().focus().setColor(color).run()
    setActiveStyle(prev => ({ ...prev, color }))
    shouldApplyActiveStyleRef.current = true
    setShowTextColor(false)
  }

  const handleHighlightColorChange = (color) => {
    editor.chain().focus().toggleHighlight({ color }).run()
    setActiveStyle(prev => ({ ...prev, highlightColor: color }))
    shouldApplyActiveStyleRef.current = true
    setShowHighlightColor(false)
  }

  const handleAlignChange = (align) => {
    editor.chain().focus().setTextAlign(align).run()
    setActiveStyle(prev => ({ ...prev, align }))
    shouldApplyActiveStyleRef.current = true
    setShowAlign(false)
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
      chain.toggleHighlight({ color: activeStyle.highlightColor })
    } else {
      chain.unsetHighlight()
    }
    
    chain.run()
  }
  
  // Track if we should apply active style (set to true when style is changed via toolbar)
  const shouldApplyActiveStyleRef = useRef(false)
  
  // Listen for selection changes and apply active style
  // In paint mode, always apply active style to selections
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
    
    editor.on('selectionUpdate', handleSelectionUpdate)
    
    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate)
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
      
      const attrs = editor.getAttributes('textStyle')
      const isBold = editor.isActive('bold')
      const isItalic = editor.isActive('italic')
      const isUnderline = editor.isActive('underline')
      const highlight = editor.getAttributes('highlight')
      const align = editor.getAttributes('textAlign')?.textAlign || 'left'
      
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
    <div className="flex items-center gap-1 md:gap-0.5 p-2 md:p-1 border-b border-gray-200 bg-white overflow-x-auto flex-wrap sticky top-0 z-50" style={{ position: 'sticky', top: 0, zIndex: 50 }}>
      {/* Font Family */}
      <div className="relative" ref={fontFamilyRef}>
        <button
          onClick={() => {
            if (fontFamilyRef.current) {
              const rect = fontFamilyRef.current.getBoundingClientRect()
              setFontFamilyPosition({ top: rect.bottom + 4, left: rect.left })
            }
            setShowFontFamily(!showFontFamily)
          }}
          className="px-2 md:px-2 py-2 md:py-1.5 h-10 md:h-8 min-w-[100px] md:min-w-[90px] text-left text-sm md:text-xs border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-between gap-1"
          title={currentFontFamily}
        >
          <span style={{ fontFamily: currentFontFamily }} className="truncate max-w-[70px]">{currentFontFamily}</span>
          <ChevronDown className="w-4 h-4 md:w-3 md:h-3 text-gray-500 flex-shrink-0" />
        </button>
        {showFontFamily && (
          <>
            <div 
              className="fixed inset-0" 
              onClick={() => setShowFontFamily(false)}
              style={{ zIndex: 999 }}
            />
            <div 
              className="fixed bg-white border border-gray-300 rounded shadow-lg max-h-64 overflow-y-auto w-48" 
              style={{ 
                zIndex: 10001,
                position: 'fixed',
                top: `${fontFamilyPosition.top}px`,
                left: `${fontFamilyPosition.left}px`
              }}
            >
            {FONT_FAMILIES.map((font) => (
              <button
                key={font}
                onClick={() => handleFontFamilyChange(font)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between"
                style={{ fontFamily: font }}
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
          </>
        )}
      </div>

      {/* Font Size */}
      <div className="relative flex items-center border border-gray-300 rounded h-10 md:h-8" ref={fontSizeRef}>
        <button
          onClick={handleFontSizeDecrease}
          className="px-2 h-full hover:bg-gray-100 text-gray-700 flex items-center"
          title="Decrease font size"
        >
          <Minus className="w-5 h-5 md:w-4 md:h-4" />
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
              }
            }}
            min="8"
            max="400"
            className="w-24 md:w-20 px-2 h-full text-center text-sm md:text-xs border-x border-gray-300 focus:outline-none focus:ring-0"
            style={{
              WebkitAppearance: 'textfield',
              MozAppearance: 'textfield'
            }}
          />
          {fontSizeDisplay === 'inherited' && (
            <span className="absolute inset-0 flex items-center justify-center text-xs text-gray-400 pointer-events-none px-1">
              inherited
            </span>
          )}
        </div>
        <button
          onClick={handleFontSizeIncrease}
          className="px-2 h-full hover:bg-gray-100 text-gray-700 flex items-center"
          title="Increase font size"
        >
          <Plus className="w-5 h-5 md:w-4 md:h-4" />
        </button>
      </div>

      {/* Line Height */}
      <div className="relative" ref={lineHeightRef}>
        <button
          onClick={() => {
            if (lineHeightRef.current) {
              const rect = lineHeightRef.current.getBoundingClientRect()
              setLineHeightPosition({ top: rect.bottom + 4, left: rect.left })
            }
            setShowLineHeight(!showLineHeight)
          }}
          className="px-2 md:px-2 py-2 md:py-1.5 h-10 md:h-8 min-w-[100px] md:min-w-[90px] text-left text-sm md:text-xs border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-between gap-1"
          title="Line Height"
        >
          <span className="truncate">{currentLineHeight || 'Default'}</span>
          <ChevronDown className="w-4 h-4 md:w-3 md:h-3 text-gray-500 flex-shrink-0" />
        </button>
        {showLineHeight && (
          <>
            <div 
              className="fixed inset-0" 
              onClick={() => setShowLineHeight(false)}
              style={{ zIndex: 999 }}
            />
            <div 
              className="fixed bg-white border border-gray-300 rounded shadow-lg w-32" 
              style={{ 
                zIndex: 10001,
                position: 'fixed',
                top: `${lineHeightPosition.top}px`,
                left: `${lineHeightPosition.left}px`
              }}
            >
              {LINE_HEIGHT_OPTIONS.map((option) => (
                <button
                  key={option.value || 'default'}
                  onClick={() => handleLineHeightChange(option.value)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between ${
                    currentLineHeight === option.value ? 'bg-blue-50 text-blue-600' : ''
                  }`}
                >
                  <span>{option.label}</span>
                  {currentLineHeight === option.value && (
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="w-px h-8 md:h-6 bg-gray-300 mx-1 md:mx-0.5" />

      {/* Paint Mode Toggle */}
      <div className="relative">
        <button
          onClick={togglePaintMode}
          className={`p-2 md:p-1.5 h-10 w-10 md:h-8 md:w-8 rounded hover:bg-gray-100 flex items-center justify-center ${
            paintMode ? 'bg-blue-100 text-blue-600' : ''
          }`}
          title="Paint Mode - Apply active style to all selections"
        >
          <Paintbrush className="w-5 h-5 md:w-4 md:h-4" />
        </button>
        
        {/* Tooltip on first activation */}
        {showPaintTooltip && paintMode && (
          <>
            <div 
              className="fixed inset-0 z-[10002]" 
              onClick={dismissPaintTooltip}
            />
            <div 
              className="absolute top-full left-0 mt-2 w-64 bg-gray-900 text-white text-sm rounded-lg p-3 shadow-xl z-[10003]"
              style={{ position: 'fixed' }}
            >
              <div className="font-semibold mb-1">Paint Mode</div>
              <div className="text-gray-300 text-xs">
                When Paint Mode is active, your current style settings (font, size, color, etc.) will be automatically applied to any text you select or click on. The style won't change when you click on different text - it stays fixed to your preset.
              </div>
              <button
                onClick={dismissPaintTooltip}
                className="mt-2 text-xs text-blue-300 hover:text-blue-200 underline"
              >
                Got it
              </button>
            </div>
          </>
        )}
      </div>

      <div className="w-px h-8 md:h-6 bg-gray-300 mx-1 md:mx-0.5" />

      {/* Formatting Buttons */}
      <button
        onClick={() => {
          const newBold = !editor.isActive('bold')
          editor.chain().focus().toggleBold().run()
          setActiveStyle(prev => ({ ...prev, bold: newBold }))
          shouldApplyActiveStyleRef.current = true
        }}
        className={`p-2 md:p-1.5 h-10 w-10 md:h-8 md:w-8 rounded hover:bg-gray-100 flex items-center justify-center ${
          editor.isActive('bold') ? 'bg-gray-200' : ''
        }`}
        title="Bold (Ctrl+B)"
      >
        <Bold className="w-5 h-5 md:w-4 md:h-4" />
      </button>
      
      <button
        onClick={() => {
          const newItalic = !editor.isActive('italic')
          editor.chain().focus().toggleItalic().run()
          setActiveStyle(prev => ({ ...prev, italic: newItalic }))
          shouldApplyActiveStyleRef.current = true
        }}
        className={`p-2 md:p-1.5 h-10 w-10 md:h-8 md:w-8 rounded hover:bg-gray-100 flex items-center justify-center ${
          editor.isActive('italic') ? 'bg-gray-200' : ''
        }`}
        title="Italic (Ctrl+I)"
      >
        <Italic className="w-5 h-5 md:w-4 md:h-4" />
      </button>
      
      <button
        onClick={() => {
          const newUnderline = !editor.isActive('underline')
          editor.chain().focus().toggleUnderline().run()
          setActiveStyle(prev => ({ ...prev, underline: newUnderline }))
          shouldApplyActiveStyleRef.current = true
        }}
        className={`p-2 md:p-1.5 h-10 w-10 md:h-8 md:w-8 rounded hover:bg-gray-100 flex items-center justify-center ${
          editor.isActive('underline') ? 'bg-gray-200' : ''
        }`}
        title="Underline (Ctrl+U)"
      >
        <Underline className="w-5 h-5 md:w-4 md:h-4" />
      </button>

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
        className="p-1.5 h-8 w-8 rounded hover:bg-gray-100 flex items-center justify-center"
        title="Clear Formatting"
      >
        <Eraser className="w-5 h-5 md:w-4 md:h-4" />
      </button>

      <div className="w-px h-8 md:h-6 bg-gray-300 mx-1 md:mx-0.5" />

      {/* Text Color */}
      <div className="relative" ref={textColorRef}>
        <button
          onClick={() => {
            if (textColorRef.current) {
              const rect = textColorRef.current.getBoundingClientRect()
              setTextColorPosition({ top: rect.bottom + 4, left: rect.left })
            }
            setShowTextColor(!showTextColor)
          }}
          className={`p-2 md:p-1.5 h-10 w-10 md:h-8 md:w-8 rounded hover:bg-gray-100 flex items-center justify-center ${
            showTextColor ? 'bg-gray-200' : ''
          }`}
          title="Text Color"
        >
          <div className="relative">
            <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <div 
              className="absolute bottom-0 left-0 right-0 h-1.5 rounded-b"
              style={{ backgroundColor: currentTextColor }}
            />
          </div>
        </button>
        {showTextColor && (
          <>
            <div 
              className="fixed inset-0" 
              onClick={() => setShowTextColor(false)}
              style={{ zIndex: 999 }}
            />
            <div 
              className="fixed bg-white border border-gray-300 rounded shadow-lg p-3 w-64" 
              style={{ 
                zIndex: 10001,
                position: 'fixed',
                top: `${textColorPosition.top}px`,
                left: `${textColorPosition.left}px`
              }}
            >
            <div className="grid grid-cols-10 gap-1 mb-3">
              {TEXT_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => handleTextColorChange(color)}
                  className={`w-6 h-6 rounded border ${
                    currentTextColor === color ? 'border-blue-600 ring-2 ring-blue-300' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <button
              onClick={() => {
                const color = window.prompt('Enter hex color:', currentTextColor)
                if (color) handleTextColorChange(color)
              }}
              className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center justify-center"
              title="Custom Color"
            >
              <Plus className="w-5 h-5 md:w-4 md:h-4" />
            </button>
          </div>
          </>
        )}
      </div>

      {/* Highlight Color */}
      <div className="relative" ref={highlightColorRef}>
        <button
          onClick={() => {
            if (highlightColorRef.current) {
              const rect = highlightColorRef.current.getBoundingClientRect()
              setHighlightColorPosition({ top: rect.bottom + 4, left: rect.left })
            }
            setShowHighlightColor(!showHighlightColor)
          }}
          className={`p-1.5 h-8 w-8 rounded hover:bg-gray-100 flex items-center justify-center ${
            showHighlightColor ? 'bg-gray-200' : ''
          }`}
          title="Highlight Color"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        {showHighlightColor && (
          <>
            <div 
              className="fixed inset-0" 
              onClick={() => setShowHighlightColor(false)}
              style={{ zIndex: 999 }}
            />
            <div 
              className="fixed bg-white border border-gray-300 rounded shadow-lg p-3 w-64" 
              style={{ 
                zIndex: 10001,
                position: 'fixed',
                top: `${highlightColorPosition.top}px`,
                left: `${highlightColorPosition.left}px`
              }}
            >
            <div className="grid grid-cols-9 gap-1 mb-3">
              {HIGHLIGHT_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => handleHighlightColorChange(color)}
                  className={`w-6 h-6 rounded border ${
                    currentHighlightColor === color ? 'border-blue-600 ring-2 ring-blue-300' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <button
              onClick={() => {
                const color = window.prompt('Enter hex color:', currentHighlightColor || '#FFFF00')
                if (color) handleHighlightColorChange(color)
              }}
              className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center justify-center"
              title="Custom Color"
            >
              <Plus className="w-5 h-5 md:w-4 md:h-4" />
            </button>
          </div>
          </>
        )}
      </div>

      <div className="w-px h-8 md:h-6 bg-gray-300 mx-1 md:mx-0.5" />

      {/* Alignment */}
      <div className="relative" ref={alignRef}>
        <button
          onClick={() => {
            if (alignRef.current) {
              const rect = alignRef.current.getBoundingClientRect()
              setAlignPosition({ top: rect.bottom + 4, left: rect.left })
            }
            setShowAlign(!showAlign)
          }}
          className={`p-2 md:p-1.5 h-10 md:h-8 rounded hover:bg-gray-100 flex items-center justify-center gap-1 ${
            showAlign ? 'bg-gray-200' : ''
          }`}
          title="Text Alignment"
        >
          {currentAlign === 'left' && <AlignLeft className="w-5 h-5 md:w-4 md:h-4" />}
          {currentAlign === 'center' && <AlignCenter className="w-5 h-5 md:w-4 md:h-4" />}
          {currentAlign === 'right' && <AlignRight className="w-5 h-5 md:w-4 md:h-4" />}
          {currentAlign === 'justify' && <AlignJustify className="w-5 h-5 md:w-4 md:h-4" />}
          <ChevronDown className="w-4 h-4 md:w-3 md:h-3 text-gray-500" />
        </button>
        {showAlign && (
          <>
            <div 
              className="fixed inset-0" 
              onClick={() => setShowAlign(false)}
              style={{ zIndex: 999 }}
            />
            <div 
              className="fixed bg-white border border-gray-300 rounded shadow-lg" 
              style={{ 
                zIndex: 10001,
                position: 'fixed',
                top: `${alignPosition.top}px`,
                left: `${alignPosition.left}px`
              }}
            >
            <button
              onClick={() => handleAlignChange('left')}
              className={`w-full px-3 py-2 hover:bg-gray-100 flex items-center justify-center ${
                currentAlign === 'left' ? 'bg-blue-50 text-blue-600' : ''
              }`}
              title="Left"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleAlignChange('center')}
              className={`w-full px-3 py-2 hover:bg-gray-100 flex items-center justify-center ${
                currentAlign === 'center' ? 'bg-blue-50 text-blue-600' : ''
              }`}
              title="Center"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleAlignChange('right')}
              className={`w-full px-3 py-2 hover:bg-gray-100 flex items-center justify-center ${
                currentAlign === 'right' ? 'bg-blue-50 text-blue-600' : ''
              }`}
              title="Right"
            >
              <AlignRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleAlignChange('justify')}
              className={`w-full px-3 py-2 hover:bg-gray-100 flex items-center justify-center ${
                currentAlign === 'justify' ? 'bg-blue-50 text-blue-600' : ''
              }`}
              title="Justify"
            >
              <AlignJustify className="w-4 h-4" />
            </button>
          </div>
          </>
        )}
      </div>

      <div className="w-px h-8 md:h-6 bg-gray-300 mx-1 md:mx-0.5" />

      {/* Lists */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 h-8 w-8 rounded hover:bg-gray-100 flex items-center justify-center ${
          editor.isActive('bulletList') ? 'bg-gray-200' : ''
        }`}
        title="Bullet List"
      >
        <List className="w-5 h-5 md:w-4 md:h-4" />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 h-8 w-8 rounded hover:bg-gray-100 flex items-center justify-center ${
          editor.isActive('orderedList') ? 'bg-gray-200' : ''
        }`}
        title="Numbered List"
      >
        <ListOrdered className="w-5 h-5 md:w-4 md:h-4" />
      </button>

      <div className="w-px h-8 md:h-6 bg-gray-300 mx-1 md:mx-0.5" />

      {/* Image */}
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
        className="p-1.5 h-8 w-8 rounded hover:bg-gray-100 flex items-center justify-center"
        title="Insert Image"
      >
        <Image className="w-5 h-5 md:w-4 md:h-4" />
      </button>

      {/* Link */}
      <button
        onClick={() => {
          const url = window.prompt('Enter URL:', editor.getAttributes('link')?.href || '')
          if (url) {
            editor.chain().focus().setLink({ href: url }).run()
          }
        }}
        className={`p-1.5 h-8 w-8 rounded hover:bg-gray-100 flex items-center justify-center ${
          editor.isActive('link') ? 'bg-gray-200' : ''
        }`}
        title="Insert Link"
      >
        <Link className="w-5 h-5 md:w-4 md:h-4" />
      </button>

      <div className="w-px h-8 md:h-6 bg-gray-300 mx-1 md:mx-0.5" />

      {/* Undo/Redo */}
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-1.5 h-8 w-8 rounded hover:bg-gray-100 disabled:opacity-50 flex items-center justify-center"
        title="Undo (Ctrl+Z)"
      >
        <Undo className="w-5 h-5 md:w-4 md:h-4" />
      </button>
      
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-1.5 h-8 w-8 rounded hover:bg-gray-100 disabled:opacity-50 flex items-center justify-center"
        title="Redo (Ctrl+Y)"
      >
        <Redo className="w-5 h-5 md:w-4 md:h-4" />
      </button>
    </div>
  )
}


