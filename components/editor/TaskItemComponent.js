'use client'

import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import { useCallback } from 'react'

export default function TaskItemComponent({ node, updateAttributes }) {
  const handleToggle = useCallback(() => {
    updateAttributes({
      checked: !node.attrs.checked,
    })
  }, [node.attrs.checked, updateAttributes])

  return (
    <NodeViewWrapper
      as="li"
      data-type="taskItem"
      data-checked={node.attrs.checked ? 'true' : 'false'}
      className="task-item"
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', flex: 1 }}>
          <input
            type="checkbox"
            checked={node.attrs.checked}
            onChange={handleToggle}
            contentEditable={false}
            style={{ marginTop: '0.2em', cursor: 'pointer', flexShrink: 0 }}
          />
          <div style={{ flex: 1 }}>
            <NodeViewContent />
          </div>
        </label>
      </div>
    </NodeViewWrapper>
  )
}




