import { Extension } from '@tiptap/core'

export const LineHeight = Extension.create({
  name: 'lineHeight',

  addOptions() {
    return {
      types: ['paragraph', 'heading'],
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: element => {
              const lineHeight = element.style.lineHeight
              if (!lineHeight) return null
              // Convert to number if it's a unitless value, or keep as string if it has units
              return lineHeight
            },
            renderHTML: attributes => {
              if (!attributes.lineHeight) {
                return {}
              }
              return {
                style: `line-height: ${attributes.lineHeight}`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setLineHeight: (lineHeight) => ({ chain, state }) => {
        const { selection } = state
        const { from, to } = selection
        
        return chain()
          .command(({ tr, dispatch }) => {
            if (dispatch) {
              state.doc.nodesBetween(from, to, (node, pos) => {
                if (node.type.name === 'paragraph' || node.type.name.startsWith('heading')) {
                  tr.setNodeMarkup(pos, undefined, {
                    ...node.attrs,
                    lineHeight: lineHeight,
                  })
                }
              })
            }
            return true
          })
          .run()
      },
      unsetLineHeight: () => ({ chain, state }) => {
        const { selection } = state
        const { from, to } = selection
        
        return chain()
          .command(({ tr, dispatch }) => {
            if (dispatch) {
              state.doc.nodesBetween(from, to, (node, pos) => {
                if (node.type.name === 'paragraph' || node.type.name.startsWith('heading')) {
                  const { lineHeight, ...attrs } = node.attrs
                  tr.setNodeMarkup(pos, undefined, attrs)
                }
              })
            }
            return true
          })
          .run()
      },
    }
  },
})

