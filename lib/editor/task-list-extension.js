import { Node, mergeAttributes } from '@tiptap/core'
import { BulletList } from '@tiptap/extension-bullet-list'
import { ReactNodeViewRenderer } from '@tiptap/react'
import TaskItemComponent from '@/components/editor/TaskItemComponent'

// TaskItem - individual task with checkbox
export const TaskItem = Node.create({
  name: 'taskItem',
  group: 'block list',
  content: 'paragraph block*',
  defining: true,
  addAttributes() {
    return {
      checked: {
        default: false,
        parseHTML: element => element.getAttribute('data-checked') === 'true',
        renderHTML: attributes => {
          if (!attributes.checked) {
            return {}
          }
          return {
            'data-checked': attributes.checked.toString(),
          }
        },
      },
    }
  },
  parseHTML() {
    return [
      {
        tag: 'li[data-type="taskItem"]',
        priority: 51,
      },
    ]
  },
  renderHTML({ node, HTMLAttributes }) {
    return [
      'li',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'taskItem',
        'data-checked': node.attrs.checked ? 'true' : 'false',
      }),
      0,
    ]
  },
  addKeyboardShortcuts() {
    return {
      Enter: () => this.editor.commands.splitListItem(this.name),
      'Mod-Shift-8': () => this.editor.commands.toggleTaskList(),
    }
  },
  addNodeView() {
    return ReactNodeViewRenderer(TaskItemComponent)
  },
})

// TaskList - container for task items
export const TaskList = BulletList.extend({
  name: 'taskList',
  group: 'block list',
  content: 'taskItem+',
  parseHTML() {
    return [
      {
        tag: 'ul[data-type="taskList"]',
        priority: 51,
      },
    ]
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'ul',
      mergeAttributes(HTMLAttributes, { 'data-type': 'taskList' }),
      0,
    ]
  },
  addCommands() {
    return {
      toggleTaskList: () => ({ commands }) => {
        return commands.toggleList(this.name, 'taskItem')
      },
    }
  },
  addKeyboardShortcuts() {
    return {
      'Mod-Shift-9': () => this.editor.commands.toggleTaskList(),
    }
  },
})




