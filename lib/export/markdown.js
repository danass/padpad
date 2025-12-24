// Convert TipTap JSON to Markdown
export function tipTapToMarkdown(json) {
  if (!json || !json.content) {
    return ''
  }
  
  function nodeToMarkdown(node) {
    if (node.type === 'text') {
      let text = node.text || ''
      
      // Apply marks
      if (node.marks) {
        for (const mark of node.marks) {
          if (mark.type === 'bold') {
            text = `**${text}**`
          } else if (mark.type === 'italic') {
            text = `*${text}*`
          } else if (mark.type === 'strike') {
            text = `~~${text}~~`
          } else if (mark.type === 'code') {
            text = `\`${text}\``
          }
        }
      }
      
      return text
    }
    
    if (node.type === 'paragraph') {
      const content = node.content ? node.content.map(nodeToMarkdown).join('') : ''
      return content + '\n\n'
    }
    
    if (node.type === 'heading') {
      const level = node.attrs?.level || 1
      const prefix = '#'.repeat(level) + ' '
      const content = node.content ? node.content.map(nodeToMarkdown).join('') : ''
      return prefix + content + '\n\n'
    }
    
    if (node.type === 'bulletList') {
      const items = node.content ? node.content.map(nodeToMarkdown).join('') : ''
      return items
    }
    
    if (node.type === 'orderedList') {
      const items = node.content ? node.content.map((item, index) => {
        const content = item.content ? item.content.map(nodeToMarkdown).join('') : ''
        return `${index + 1}. ${content}`
      }).join('\n') : ''
      return items + '\n\n'
    }
    
    if (node.type === 'listItem') {
      const content = node.content ? node.content.map(nodeToMarkdown).join('') : ''
      return `- ${content.trim()}\n`
    }
    
    if (node.type === 'blockquote') {
      const content = node.content ? node.content.map(nodeToMarkdown).join('') : ''
      return '> ' + content.split('\n').join('\n> ') + '\n\n'
    }
    
    if (node.type === 'codeBlock') {
      const lang = node.attrs?.language || ''
      const content = node.content ? node.content.map(n => n.text || '').join('') : ''
      return '```' + lang + '\n' + content + '\n```\n\n'
    }
    
    if (node.type === 'horizontalRule') {
      return '---\n\n'
    }
    
    if (node.type === 'hardBreak') {
      return '\n'
    }
    
    // Default: just process content
    if (node.content) {
      return node.content.map(nodeToMarkdown).join('')
    }
    
    return ''
  }
  
  return json.content.map(nodeToMarkdown).join('').trim()
}






