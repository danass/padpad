// History replay logic
// This reconstructs a document state from a snapshot + events

export function replayHistory(snapshot, events) {
  // Start with snapshot content
  let currentContent = null
  
  // Parse snapshot content_json if it exists
  if (snapshot && snapshot.content_json) {
    if (typeof snapshot.content_json === 'string') {
      try {
        currentContent = JSON.parse(snapshot.content_json)
      } catch (e) {
        console.error('Error parsing snapshot content_json:', e)
        currentContent = { type: 'doc', content: [] }
      }
    } else {
      currentContent = snapshot.content_json
    }
  }
  
  // Default to empty doc if no snapshot
  if (!currentContent) {
    currentContent = {
      type: 'doc',
      content: []
    }
  }
  
  // If events contain full content, use the latest one
  // This is a simplified approach - in production, you'd replay ProseMirror steps
  if (events && events.length > 0) {
    // Find the latest event with content
    for (let i = events.length - 1; i >= 0; i--) {
      const event = events[i]
      let payload = event.payload
      
      // Parse payload if it's a string
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload)
        } catch (e) {
          console.error('Error parsing event payload:', e)
          continue
        }
      }
      
      if (payload && payload.content) {
        currentContent = payload.content
        break
      }
    }
  }
  
  // Ensure content has valid structure
  if (!currentContent || typeof currentContent !== 'object') {
    currentContent = { type: 'doc', content: [] }
  }
  
  // Ensure it has type and content
  if (!currentContent.type) {
    currentContent = {
      type: 'doc',
      content: Array.isArray(currentContent) ? currentContent : (currentContent.content || [currentContent])
    }
  }
  
  return currentContent
}

// Get content at a specific point in time
export function getContentAtTime(snapshot, events, targetTime) {
  // Find the latest snapshot before targetTime
  let baseSnapshot = snapshot
  
  // Filter events up to targetTime
  const relevantEvents = events.filter(
    event => new Date(event.created_at) <= new Date(targetTime)
  )
  
  // Replay events
  return replayHistory(baseSnapshot, relevantEvents)
}
