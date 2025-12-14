import { Step } from 'prosemirror-transform'
import { DOMParser } from 'prosemirror-model'
import { schema } from 'prosemirror-schema-basic'
import { Transform } from 'prosemirror-transform'

// Simplified diff calculation
// In a real implementation, we'd use ProseMirror's transform system
// For now, we'll create a simple event structure

export function calculateDiff(oldState, newState) {
  // This is a simplified version
  // In production, you'd use ProseMirror's transform system to calculate actual steps
  
  // For now, we'll just return the new state as a "meta" event
  // A proper implementation would:
  // 1. Create a ProseMirror document from oldState
  // 2. Create a ProseMirror document from newState
  // 3. Calculate the transform steps between them
  // 4. Serialize the steps
  
  return {
    type: 'meta',
    payload: {
      content: newState
    }
  }
}

// Helper to extract text content from TipTap JSON
export function extractTextFromJSON(json) {
  if (!json || !json.content) {
    return ''
  }
  
  function extractText(node) {
    if (node.type === 'text') {
      return node.text || ''
    }
    
    if (node.content && Array.isArray(node.content)) {
      return node.content.map(extractText).join(' ')
    }
    
    return ''
  }
  
  return json.content.map(extractText).join(' ').trim()
}


