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
  
  // Priority: Use snapshot first if it has content, then events
  // If snapshot exists and has content, use it as base
  if (snapshot && snapshot.content_json) {
    let snapshotContent = snapshot.content_json
    if (typeof snapshotContent === 'string') {
      try {
        snapshotContent = JSON.parse(snapshotContent)
      } catch (e) {
        console.error('Error parsing snapshot content_json:', e)
      }
    }
    // Only use snapshot if it has actual content
    if (snapshotContent && snapshotContent.type === 'doc' && 
        snapshotContent.content && Array.isArray(snapshotContent.content) && 
        snapshotContent.content.length > 0) {
      currentContent = snapshotContent
    }
  }
  
  // If events contain full content, use the latest one (overrides snapshot if more recent)
  // This is a simplified approach - in production, you'd replay ProseMirror steps
  if (events && events.length > 0) {
    // Find the latest event with content - search from most recent to oldest
    for (let i = events.length - 1; i >= 0; i--) {
      const event = events[i]
      let payload = event.payload
      
      // Parse payload if it's a string (fallback in case API didn't parse it)
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload)
        } catch (e) {
          console.error('Error parsing event payload:', e)
          continue
        }
      }
      
      // Check if payload has content directly (payload.content)
      if (payload && payload.content) {
        const contentToCheck = payload.content
        // If content is a doc structure with actual content
        if (contentToCheck && contentToCheck.type === 'doc' && 
            Array.isArray(contentToCheck.content) && contentToCheck.content.length > 0) {
          currentContent = contentToCheck
          break
        }
        // If content is an array with items
        if (Array.isArray(contentToCheck) && contentToCheck.length > 0) {
          currentContent = {
            type: 'doc',
            content: contentToCheck
          }
          break
        }
        // If content is an object with nested content array
        if (typeof contentToCheck === 'object' && contentToCheck.content && 
            Array.isArray(contentToCheck.content) && contentToCheck.content.length > 0) {
          currentContent = contentToCheck
          break
        }
      }
      
      // Also check if the payload itself is the content structure
      if (payload && payload.type === 'doc' && Array.isArray(payload.content) && payload.content.length > 0) {
        currentContent = payload
        break
      }
    }
  }
  
  // Final fallback: if we still don't have content but have a snapshot, use snapshot content
  if (!currentContent || (currentContent.type === 'doc' && (!currentContent.content || currentContent.content.length === 0))) {
    if (snapshot && snapshot.content_json) {
      let snapshotContent = snapshot.content_json
      if (typeof snapshotContent === 'string') {
        try {
          snapshotContent = JSON.parse(snapshotContent)
        } catch (e) {
          console.error('Error parsing snapshot content_json:', e)
        }
      }
      if (snapshotContent && snapshotContent.type === 'doc') {
        currentContent = snapshotContent
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
