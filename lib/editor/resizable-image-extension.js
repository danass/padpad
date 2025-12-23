import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import ResizableImageComponent from '@/components/editor/ResizableImageComponent'

export const ResizableImage = Node.create({
  name: 'image',
  
  addOptions() {
    return {
      inline: false,
      allowBase64: true,
      HTMLAttributes: {},
    }
  },
  
  inline() {
    return this.options.inline
  },
  
  group() {
    return this.options.inline ? 'inline' : 'block'
  },
  
  draggable: true,
  
  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
      },
      height: {
        default: null,
      },
      align: {
        default: 'center',
      },
    }
  },
  
  parseHTML() {
    return [
      {
        tag: this.options.allowBase64
          ? 'img[src]'
          : 'img[src]:not([src^="data:"])',
        getAttrs: (node) => ({
          src: node.getAttribute('src'),
          alt: node.getAttribute('alt'),
          title: node.getAttribute('title'),
          width: node.getAttribute('width') ? parseInt(node.getAttribute('width')) : null,
          height: node.getAttribute('height') ? parseInt(node.getAttribute('height')) : null,
          align: node.getAttribute('data-align') || 'center',
        }),
      },
    ]
  },
  
  renderHTML({ HTMLAttributes, node }) {
    const attrs = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)
    if (node.attrs.width) attrs.width = node.attrs.width
    if (node.attrs.height) attrs.height = node.attrs.height
    if (node.attrs.align) attrs['data-align'] = node.attrs.align
    return ['img', attrs]
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent)
  },
  
  addCommands() {
    return {
      setImage: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        })
      },
      setImageAlign: (align) => ({ tr, dispatch }) => {
        const { selection } = tr
        const { from } = selection
        
        tr.doc.nodesBetween(from, from, (node, pos) => {
          if (node.type.name === 'image') {
            if (dispatch) {
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                align,
              })
            }
            return false
          }
        })
        
        if (dispatch) dispatch(tr)
        return true
      },
      setImageSize: (width, height) => ({ tr, dispatch }) => {
        const { selection } = tr
        const { from } = selection
        
        tr.doc.nodesBetween(from, from, (node, pos) => {
          if (node.type.name === 'image') {
            if (dispatch) {
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                width,
                height,
              })
            }
            return false
          }
        })
        
        if (dispatch) dispatch(tr)
        return true
      },
    }
  },
})
