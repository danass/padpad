import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import DrawingComponent from '@/components/editor/DrawingComponent'

export const Drawing = Node.create({
  name: 'drawing',
  
  group: 'block',
  
  draggable: true,
  
  addAttributes() {
    return {
      paths: {
        default: [],
        parseHTML: element => {
          const pathsAttr = element.getAttribute('data-paths')
          return pathsAttr ? JSON.parse(pathsAttr) : []
        },
        renderHTML: attributes => {
          if (!attributes.paths || attributes.paths.length === 0) {
            return {}
          }
          return {
            'data-paths': JSON.stringify(attributes.paths),
          }
        },
      },
      width: {
        default: 400,
        parseHTML: element => parseInt(element.getAttribute('data-width') || '400'),
        renderHTML: attributes => {
          if (!attributes.width) {
            return {}
          }
          return {
            'data-width': attributes.width.toString(),
          }
        },
      },
      height: {
        default: 300,
        parseHTML: element => parseInt(element.getAttribute('data-height') || '300'),
        renderHTML: attributes => {
          if (!attributes.height) {
            return {}
          }
          return {
            'data-height': attributes.height.toString(),
          }
        },
      },
      x: {
        default: null,
        parseHTML: element => {
          const xAttr = element.getAttribute('data-x')
          return xAttr ? parseFloat(xAttr) : null
        },
        renderHTML: attributes => {
          if (attributes.x === null || attributes.x === undefined) {
            return {}
          }
          return {
            'data-x': attributes.x.toString(),
          }
        },
      },
      y: {
        default: null,
        parseHTML: element => {
          const yAttr = element.getAttribute('data-y')
          return yAttr ? parseFloat(yAttr) : null
        },
        renderHTML: attributes => {
          if (attributes.y === null || attributes.y === undefined) {
            return {}
          }
          return {
            'data-y': attributes.y.toString(),
          }
        },
      },
      align: {
        default: 'center',
        parseHTML: element => element.getAttribute('data-align') || 'center',
        renderHTML: attributes => {
          if (!attributes.align) {
            return {}
          }
          return {
            'data-align': attributes.align,
          }
        },
      },
    }
  },
  
  parseHTML() {
    return [
      {
        tag: 'div[data-type="drawing"]',
      },
    ]
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'drawing' })]
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(DrawingComponent)
  },
  
  addCommands() {
    return {
      setDrawing: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: {
            paths: options.paths || [],
            width: options.width || 400,
            height: options.height || 300,
          },
        })
      },
    }
  },
})

