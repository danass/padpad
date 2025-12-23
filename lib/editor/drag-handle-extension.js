import DragHandle from '@tiptap/extension-drag-handle-react'
import DragHandleComponent from '../../components/editor/DragHandle'

export const CustomDragHandle = DragHandle.extend({
  addOptions() {
    return {
      ...this.parent?.(),
      render: () => {
        const element = document.createElement('div')
        element.classList.add('custom-drag-handle')
        return element
      },
    }
  },
})





