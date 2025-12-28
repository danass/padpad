// Convert TipTap JSON to HTML
export function tipTapToHTML(json) {
  if (!json || !json.content) {
    return ''
  }
  
  function nodeToHTML(node) {
    if (node.type === 'text') {
      let text = (node.text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      
      // Apply marks
      if (node.marks) {
        for (const mark of node.marks) {
          if (mark.type === 'bold') {
            text = `<strong>${text}</strong>`
          } else if (mark.type === 'italic') {
            text = `<em>${text}</em>`
          } else if (mark.type === 'strike') {
            text = `<s>${text}</s>`
          } else if (mark.type === 'code') {
            text = `<code>${text}</code>`
          } else if (mark.type === 'link') {
            const href = mark.attrs?.href || '#'
            text = `<a href="${href}">${text}</a>`
          }
        }
      }
      
      return text
    }
    
    if (node.type === 'paragraph') {
      const content = node.content ? node.content.map(nodeToHTML).join('') : ''
      return `<p>${content}</p>`
    }
    
    if (node.type === 'heading') {
      const level = node.attrs?.level || 1
      const content = node.content ? node.content.map(nodeToHTML).join('') : ''
      return `<h${level}>${content}</h${level}>`
    }
    
    if (node.type === 'bulletList') {
      const content = node.content ? node.content.map(nodeToHTML).join('') : ''
      return `<ul>${content}</ul>`
    }
    
    if (node.type === 'orderedList') {
      const content = node.content ? node.content.map(nodeToHTML).join('') : ''
      return `<ol>${content}</ol>`
    }
    
    if (node.type === 'listItem') {
      const content = node.content ? node.content.map(nodeToHTML).join('') : ''
      return `<li>${content}</li>`
    }
    
    if (node.type === 'blockquote') {
      const content = node.content ? node.content.map(nodeToHTML).join('') : ''
      return `<blockquote>${content}</blockquote>`
    }
    
    if (node.type === 'codeBlock') {
      const lang = node.attrs?.language || ''
      const content = node.content ? node.content.map(n => (n.text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')).join('') : ''
      return `<pre><code class="language-${lang}">${content}</code></pre>`
    }
    
    if (node.type === 'horizontalRule') {
      return '<hr>'
    }
    
    if (node.type === 'hardBreak') {
      return '<br>'
    }
    
    // Default: just process content
    if (node.content) {
      return node.content.map(nodeToHTML).join('')
    }
    
    return ''
  }
  
  return json.content.map(nodeToHTML).join('')
}








