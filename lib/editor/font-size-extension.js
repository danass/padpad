import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

export const FontSize = Extension.create({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
          attributes: {
            fontSize: {
              default: null,
              parseHTML: element => {
                const fontSize = element.style.fontSize
                if (!fontSize) return null
                return fontSize.includes('px') ? fontSize : fontSize + 'px'
              },
              renderHTML: attributes => {
                if (!attributes.fontSize) {
                  return {}
                }
                return {
                  style: `font-size: ${attributes.fontSize}`,
                }
              },
            },
          },
      },
    ]
  },

  addCommands() {
    return {
      setFontSize: (fontSize) => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize })
          .run()
      },
      unsetFontSize: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .removeEmptyTextStyle()
          .run()
      },
    }
  },
})

