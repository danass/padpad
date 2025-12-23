// Simple slash command handler
export function handleSlashCommand(editor, query) {
  const command = query.toLowerCase().trim()
  
  if (command === 'h1' || command.startsWith('h1 ')) {
    editor.chain().focus().toggleHeading({ level: 1 }).run()
    return true
  }
  
  if (command === 'h2' || command.startsWith('h2 ')) {
    editor.chain().focus().toggleHeading({ level: 2 }).run()
    return true
  }
  
  if (command === 'h3' || command.startsWith('h3 ')) {
    editor.chain().focus().toggleHeading({ level: 3 }).run()
    return true
  }
  
  if (command === 'bullet' || command === 'ul' || command.startsWith('bullet ')) {
    editor.chain().focus().toggleBulletList().run()
    return true
  }
  
  if (command === 'number' || command === 'ol' || command.startsWith('number ')) {
    editor.chain().focus().toggleOrderedList().run()
    return true
  }
  
  if (command === 'quote' || command.startsWith('quote ')) {
    editor.chain().focus().toggleBlockquote().run()
    return true
  }
  
  if (command === 'divider' || command === 'hr' || command === '---') {
    editor.chain().focus().setHorizontalRule().run()
    return true
  }
  
  if (command.startsWith('image ') || command.startsWith('img ')) {
    const url = command.split(' ').slice(1).join(' ')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
      return true
    }
  }
  
  if (command.startsWith('link ')) {
    const url = command.split(' ').slice(1).join(' ')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
      return true
    }
  }
  
  return false
}

export const slashCommands = [
  { command: '/h1', description: 'Heading 1' },
  { command: '/h2', description: 'Heading 2' },
  { command: '/h3', description: 'Heading 3' },
  { command: '/bullet', description: 'Bullet List' },
  { command: '/number', description: 'Numbered List' },
  { command: '/quote', description: 'Quote' },
  { command: '/divider', description: 'Horizontal Rule' },
  { command: '/image [url]', description: 'Insert Image' },
  { command: '/link [url]', description: 'Insert Link' },
]





