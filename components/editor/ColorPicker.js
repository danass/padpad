'use client'

import { useState, useRef, useEffect } from 'react'

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

export default function ColorPicker({ 
  currentColor, 
  onColorChange, 
  type = 'text', // 'text' or 'background'
  position = { top: 0, left: 0 }
}) {
  const [showPicker, setShowPicker] = useState(false)
  const [customColor, setCustomColor] = useState(currentColor || (type === 'text' ? '#000000' : '#fef08a'))
  const pickerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false)
      }
    }
    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPicker])

  const handleColorSelect = (color) => {
    setCustomColor(color)
    onColorChange(color)
    setShowPicker(false)
  }

  return (
    <div className="relative" ref={pickerRef}>
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="p-1.5 rounded-md transition-all hover:bg-gray-100 text-gray-700 flex items-center gap-1 active:scale-95"
        title={type === 'text' ? 'Text Color' : 'Background Color'}
      >
        <span 
          className="w-5 h-5 rounded border-2 border-gray-300 shadow-sm"
          style={{ backgroundColor: currentColor || (type === 'text' ? '#000000' : '#fef08a') }}
        />
      </button>

      {showPicker && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowPicker(false)}
          />
          <div 
            className="absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg p-3 min-w-[280px]"
            style={{ 
              top: '100%', 
              left: '50%',
              marginTop: '4px',
              transform: 'translateX(-50%)'
            }}
          >
          {/* Preset Colors Grid */}
          <div className="mb-3">
            <div className="text-xs font-semibold text-gray-500 mb-2 px-1">
              Preset Colors
            </div>
            <div className="grid grid-cols-10 gap-1">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  className={`w-6 h-6 rounded border-2 transition-all hover:scale-110 ${
                    currentColor === color 
                      ? 'border-blue-500 ring-2 ring-blue-300' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Custom Color Input */}
          <div className="border-t border-gray-200 pt-3">
            <div className="text-xs font-semibold text-gray-500 mb-2 px-1">
              Custom Color
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value)
                  onColorChange(e.target.value)
                }}
                className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => {
                  const value = e.target.value
                  setCustomColor(value)
                  if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                    onColorChange(value)
                  }
                }}
                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="#000000"
                maxLength={7}
              />
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  )
}

