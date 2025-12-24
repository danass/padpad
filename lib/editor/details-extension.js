import { Node, mergeAttributes } from '@tiptap/core'

// DetailsSummary node - the clickable summary/title
export const DetailsSummary = Node.create({
  name: 'detailsSummary',
  
  group: 'block',
  
  content: 'inline+',
  
  parseHTML() {
    return [
      {
        tag: 'summary',
      },
    ]
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['summary', mergeAttributes(HTMLAttributes), 0]
  },
})

// DetailsContent node - the collapsible content (everything after summary)
export const DetailsContent = Node.create({
  name: 'detailsContent',
  
  group: 'block',
  
  content: 'block+',
  
  parseHTML() {
    return [
      {
        tag: 'details > :not(summary)',
        getAttrs: () => ({ isDetailsContent: true }),
      },
    ]
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'detailsContent' }), 0]
  },
})

// Details node - the container
export const Details = Node.create({
  name: 'details',
  
  group: 'block',
  
  content: 'detailsSummary detailsContent+',
  
  addAttributes() {
    return {
      open: {
        default: false,
        parseHTML: element => element.hasAttribute('open'),
        renderHTML: attributes => {
          if (!attributes.open) {
            return {}
          }
          return { open: '' }
        },
      },
    }
  },
  
  parseHTML() {
    return [
      {
        tag: 'details',
        getAttrs: element => ({
          open: element.hasAttribute('open'),
        }),
      },
    ]
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['details', mergeAttributes(HTMLAttributes), 0]
  },
  
  addCommands() {
    return {
      setDetails: () => ({ commands, state }) => {
        const { selection } = state
        const { from, to } = selection
        const selectedContent = state.doc.slice(from, to)
        
        // If there's selected content, wrap it; otherwise create empty details
        if (selectedContent.size > 0) {
          const content = selectedContent.content.toJSON().content || []
          return commands.insertContent({
            type: this.name,
            attrs: { open: false },
            content: [
              {
                type: 'detailsSummary',
                content: [
                  {
                    type: 'text',
                    text: 'Click to expand',
                  },
                ],
              },
              {
                type: 'detailsContent',
                content: content.length > 0 ? content : [
                  {
                    type: 'paragraph',
                  },
                ],
              },
            ],
          })
        } else {
          // Insert empty details block
          return commands.insertContent({
            type: this.name,
            attrs: { open: false },
            content: [
              {
                type: 'detailsSummary',
                content: [
                  {
                    type: 'text',
                    text: 'Click to expand',
                  },
                ],
              },
              {
                type: 'detailsContent',
                content: [
                  {
                    type: 'paragraph',
                  },
                ],
              },
            ],
          })
        }
      },
      toggleDetails: () => ({ tr, dispatch, state }) => {
        const { selection } = state
        const { $from } = selection
        
        let detailsNode = null
        let detailsPos = null
        
        tr.doc.nodesBetween($from.start(), $from.end(), (node, pos) => {
          if (node.type.name === 'details') {
            detailsNode = node
            detailsPos = pos
            return false
          }
        })
        
        if (detailsNode && dispatch) {
          const attrs = {
            ...detailsNode.attrs,
            open: !detailsNode.attrs.open,
          }
          tr.setNodeMarkup(detailsPos, undefined, attrs)
          dispatch(tr)
        }
        
        return true
      },
      unsetDetails: () => ({ commands }) => {
        return commands.lift(this.name)
      },
    }
  },
  
  addKeyboardShortcuts() {
    return {
      'Mod-Shift-d': () => this.editor.commands.toggleDetails(),
    }
  },
})




