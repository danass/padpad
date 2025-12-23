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
  Plus
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
  const [showTextColor, setShowTextColor] = useState(false)
  const [showHighlightColor, setShowHighlightColor] = useState(false)
  const [showAlign, setShowAlign] = useState(false)
  const fontFamilyRef = useRef(null)
  const fontSizeRef = useRef(null)
  const textColorRef = useRef(null)
  const highlightColorRef = useRef(null)
  const alignRef = useRef(null)

  if (!editor) {
    return null
  }

  // Get current font family
  const currentFontFamily = editor.getAttributes('textStyle')?.fontFamily || 'Arial'
  const currentFontSizeAttr = editor.getAttributes('textStyle')?.fontSize
  const currentFontSizeNum = currentFontSizeAttr ? parseInt(currentFontSizeAttr.replace('px', '')) : null
  const [fontSize, setFontSize] = useState(currentFontSizeNum || 11)
  const [fontSizeDisplay, setFontSizeDisplay] = useState(currentFontSizeNum ? currentFontSizeNum.toString() : 'inherited')
  const currentTextColor = editor.getAttributes('textStyle')?.color || '#000000'
  const currentHighlightColor = editor.getAttributes('highlight')?.color || null
  const currentAlign = editor.getAttributes('textAlign')?.textAlign || 'left'

  // Update fontSize state when editor selection changes
  useEffect(() => {
    const updateFontSize = () => {
      const sizeAttr = editor.getAttributes('textStyle')?.fontSize
      if (sizeAttr) {
        const sizeNum = parseInt(sizeAttr.replace('px', ''))
        setFontSize(sizeNum)
        setFontSizeDisplay(sizeNum.toString())
      } else {
        setFontSizeDisplay('inherited')
        setFontSize(11) // Default for editing
      }
    }
    
    editor.on('selectionUpdate', updateFontSize)
    editor.on('transaction', updateFontSize)
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
    setShowFontFamily(false)
  }

  const handleFontSizeChange = (size) => {
    editor.chain().focus().setFontSize(`${size}px`).run()
    setFontSize(size)
    setShowFontSize(false)
  }

  const handleFontSizeInput = (e) => {
    const value = e.target.value
    if (value === '' || value === 'inherited') {
      setFontSizeDisplay('inherited')
      editor.chain().focus().unsetFontSize().run()
      return
    }
    const numValue = parseInt(value)
    if (!isNaN(numValue) && numValue > 0) {
      setFontSize(numValue)
      setFontSizeDisplay(numValue.toString())
      editor.chain().focus().setFontSize(`${numValue}px`).run()
    }
  }

  const handleFontSizeDecrease = () => {
    const currentSize = fontSizeDisplay === 'inherited' ? 11 : fontSize
    const newSize = Math.max(8, currentSize - 1)
    setFontSize(newSize)
    setFontSizeDisplay(newSize.toString())
    editor.chain().focus().setFontSize(`${newSize}px`).run()
  }

  const handleFontSizeIncrease = () => {
    const currentSize = fontSizeDisplay === 'inherited' ? 11 : fontSize
    const newSize = Math.min(400, currentSize + 1)
    setFontSize(newSize)
    setFontSizeDisplay(newSize.toString())
    editor.chain().focus().setFontSize(`${newSize}px`).run()
  }

  const handleTextColorChange = (color) => {
    editor.chain().focus().setColor(color).run()
    setShowTextColor(false)
  }

  const handleHighlightColorChange = (color) => {
    editor.chain().focus().toggleHighlight({ color }).run()
    setShowHighlightColor(false)
  }

  const handleAlignChange = (align) => {
    editor.chain().focus().setTextAlign(align).run()
    setShowAlign(false)
  }

  return (
    <div className="flex items-center gap-0.5 p-1 border-b border-gray-200 bg-white overflow-x-auto relative">
      {/* Font Family */}
      <div className="relative z-50" ref={fontFamilyRef}>
        <button
          onClick={() => setShowFontFamily(!showFontFamily)}
          className="px-2 py-1.5 min-w-[80px] text-left text-xs border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-between gap-1"
          title={currentFontFamily}
        >
          <span style={{ fontFamily: currentFontFamily }} className="truncate max-w-[60px]">{currentFontFamily}</span>
          <ChevronDown className="w-3 h-3 text-gray-500 flex-shrink-0" />
        </button>
        {showFontFamily && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowFontFamily(false)}
            />
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 max-h-64 overflow-y-auto w-48">
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
      <div className="relative flex items-center border border-gray-300 rounded" ref={fontSizeRef}>
        <button
          onClick={handleFontSizeDecrease}
          className="px-2 py-1.5 hover:bg-gray-100 text-gray-700"
          title="Decrease font size"
        >
          <Minus className="w-4 h-4" />
        </button>
        <input
          type="number"
          value={fontSizeDisplay === 'inherited' ? '' : fontSize}
          onChange={handleFontSizeInput}
          onFocus={(e) => {
            if (fontSizeDisplay === 'inherited') {
              e.target.value = fontSize.toString()
            }
          }}
          onBlur={(e) => {
            if (!e.target.value || e.target.value === '') {
              setFontSizeDisplay('inherited')
              editor.chain().focus().unsetFontSize().run()
            }
          }}
          placeholder="inherited"
          min="8"
          max="400"
          className="w-16 px-2 py-1.5 text-center text-sm border-x border-gray-300 focus:outline-none focus:ring-0"
        />
        <button
          onClick={handleFontSizeIncrease}
          className="px-2 py-1.5 hover:bg-gray-100 text-gray-700"
          title="Increase font size"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-6 bg-gray-300 mx-0.5" />

      {/* Formatting Buttons */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded hover:bg-gray-100 ${
          editor.isActive('bold') ? 'bg-gray-200' : ''
        }`}
        title="Bold (Ctrl+B)"
      >
        <Bold className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded hover:bg-gray-100 ${
          editor.isActive('italic') ? 'bg-gray-200' : ''
        }`}
        title="Italic (Ctrl+I)"
      >
        <Italic className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-1.5 rounded hover:bg-gray-100 ${
          editor.isActive('underline') ? 'bg-gray-200' : ''
        }`}
        title="Underline (Ctrl+U)"
      >
        <Underline className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-0.5" />

      {/* Text Color */}
      <div className="relative z-50" ref={textColorRef}>
        <button
          onClick={() => setShowTextColor(!showTextColor)}
          className={`p-1.5 rounded hover:bg-gray-100 ${
            showTextColor ? 'bg-gray-200' : ''
          }`}
          title="Text Color"
        >
          <div className="relative">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="fixed inset-0 z-40" 
              onClick={() => setShowTextColor(false)}
            />
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 p-3 w-64">
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
              <Plus className="w-4 h-4" />
            </button>
          </div>
          </>
        )}
      </div>

      {/* Highlight Color */}
      <div className="relative z-50" ref={highlightColorRef}>
        <button
          onClick={() => setShowHighlightColor(!showHighlightColor)}
          className={`p-1.5 rounded hover:bg-gray-100 ${
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
              className="fixed inset-0 z-40" 
              onClick={() => setShowHighlightColor(false)}
            />
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 p-3 w-64">
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
              <Plus className="w-4 h-4" />
            </button>
          </div>
          </>
        )}
      </div>

      <div className="w-px h-6 bg-gray-300 mx-0.5" />

      {/* Alignment */}
      <div className="relative z-50" ref={alignRef}>
        <button
          onClick={() => setShowAlign(!showAlign)}
          className={`p-1.5 rounded hover:bg-gray-100 flex items-center gap-1 ${
            showAlign ? 'bg-gray-200' : ''
          }`}
          title="Text Alignment"
        >
          {currentAlign === 'left' && <AlignLeft className="w-4 h-4" />}
          {currentAlign === 'center' && <AlignCenter className="w-4 h-4" />}
          {currentAlign === 'right' && <AlignRight className="w-4 h-4" />}
          {currentAlign === 'justify' && <AlignJustify className="w-4 h-4" />}
          <ChevronDown className="w-3 h-3 text-gray-500" />
        </button>
        {showAlign && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowAlign(false)}
            />
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50">
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

      <div className="w-px h-6 bg-gray-300 mx-0.5" />

      {/* Lists */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded hover:bg-gray-100 ${
          editor.isActive('bulletList') ? 'bg-gray-200' : ''
        }`}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded hover:bg-gray-100 ${
          editor.isActive('orderedList') ? 'bg-gray-200' : ''
        }`}
        title="Numbered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-0.5" />

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
        className="p-1.5 rounded hover:bg-gray-100"
        title="Insert Image"
      >
        <Image className="w-4 h-4" />
      </button>

      {/* Link */}
      <button
        onClick={() => {
          const url = window.prompt('Enter URL:', editor.getAttributes('link')?.href || '')
          if (url) {
            editor.chain().focus().setLink({ href: url }).run()
          }
        }}
        className={`p-1.5 rounded hover:bg-gray-100 ${
          editor.isActive('link') ? 'bg-gray-200' : ''
        }`}
        title="Insert Link"
      >
        <Link className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-0.5" />

      {/* Undo/Redo */}
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50"
        title="Undo (Ctrl+Z)"
      >
        <Undo className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50"
        title="Redo (Ctrl+Y)"
      >
        <Redo className="w-4 h-4" />
      </button>
    </div>
  )
}
