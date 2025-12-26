import Paragraph from '@tiptap/extension-paragraph'
import Heading from '@tiptap/extension-heading'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import Blockquote from '@tiptap/extension-blockquote'
import CodeBlock from '@tiptap/extension-code-block'

// Make all block nodes draggable
export const DraggableParagraph = Paragraph.extend({
  draggable: true,
})

export const DraggableHeading = Heading.extend({
  draggable: true,
})

export const DraggableBulletList = BulletList.extend({
  draggable: true,
})

export const DraggableOrderedList = OrderedList.extend({
  draggable: true,
})

export const DraggableBlockquote = Blockquote.extend({
  draggable: true,
})

export const DraggableCodeBlock = CodeBlock.extend({
  draggable: true,
})





