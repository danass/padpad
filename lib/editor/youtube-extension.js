import { Node, mergeAttributes } from '@tiptap/core'

export const Youtube = Node.create({
  name: 'youtube',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: element => element.getAttribute('src'),
        renderHTML: attributes => {
          if (!attributes.src) {
            return {}
          }
          return { src: attributes.src }
        },
      },
      width: {
        default: 640,
        parseHTML: element => element.getAttribute('width') || 640,
        renderHTML: attributes => {
          if (!attributes.width) {
            return {}
          }
          return { width: attributes.width }
        },
      },
      height: {
        default: 480,
        parseHTML: element => element.getAttribute('height') || 480,
        renderHTML: attributes => {
          if (!attributes.height) {
            return {}
          }
          return { height: attributes.height }
        },
      },
      controls: {
        default: true,
        parseHTML: element => element.getAttribute('controls') !== 'false',
        renderHTML: attributes => {
          if (!attributes.controls) {
            return {}
          }
          return { controls: '' }
        },
      },
      nocookie: {
        default: false,
        parseHTML: element => element.getAttribute('nocookie') === 'true',
        renderHTML: attributes => {
          if (!attributes.nocookie) {
            return {}
          }
          return { 'data-nocookie': 'true' }
        },
      },
    }
  },
  parseHTML() {
    return [
      {
        tag: 'iframe[data-youtube-video]',
        getAttrs: (element) => {
          if (typeof element === 'string') {
            return false
          }
          const src = element.getAttribute('src')
          if (src && src.includes('youtube.com/embed') || src.includes('youtu.be')) {
            return {}
          }
          return false
        },
      },
    ]
  },
  renderHTML({ HTMLAttributes, node }) {
    // Extract YouTube video ID from src
    let videoId = null
    if (node.attrs.src) {
      // Handle different YouTube URL formats
      const patterns = [
        /(?:youtube\.com\/embed\/|youtu\.be\/)([^&\n?#]+)/,
        /youtube\.com\/watch\?v=([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/,
      ]
      
      for (const pattern of patterns) {
        const match = node.attrs.src.match(pattern)
        if (match && match[1]) {
          videoId = match[1]
          break
        }
      }
    }
    
    if (!videoId) {
      return ['div', { class: 'youtube-placeholder', style: 'padding: 1rem; background: #f3f4f6; border-radius: 0.5rem; color: #6b7280;' }, 'Invalid YouTube URL']
    }
    
    // Build embed URL
    const domain = node.attrs.nocookie ? 'youtube-nocookie.com' : 'youtube.com'
    const embedUrl = `https://www.${domain}/embed/${videoId}`
    
    const attrs = mergeAttributes(HTMLAttributes, {
      'data-youtube-video': '',
      frameborder: '0',
      allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
      allowfullscreen: '',
      width: node.attrs.width || 640,
      height: node.attrs.height || 480,
      src: embedUrl,
    })
    
    return ['iframe', attrs]
  },
  addCommands() {
    return {
      setYoutubeVideo: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        })
      },
    }
  },
})



