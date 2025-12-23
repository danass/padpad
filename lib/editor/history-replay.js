// History replay logic
// This reconstructs a document state from a snapshot + events

export function replayHistory(snapshot, events) {
  let currentContent = null
  
  // Strategy: Snapshot is the source of truth (contains full content)
  // Events are incremental changes, but we use snapshot as base
  // 1. Use snapshot if it exists and has content (most reliable)
  // 2. If no snapshot or snapshot is empty, try to find content in events
  // 3. Default to empty doc if nothing found
  
  // First priority: Use snapshot (it contains the full document state)
  if (snapshot && snapshot.content_json) {
    let snapshotContent = snapshot.content_json
    
    // Parse if it's a string
    if (typeof snapshotContent === 'string') {
      try {
        snapshotContent = JSON.parse(snapshotContent)
      } catch (e) {
        console.error('Error parsing snapshot content_json:', e)
        snapshotContent = null
      }
    }
    
    // Use snapshot if it has valid content structure
    if (snapshotContent && snapshotContent.type === 'doc') {
      // Use snapshot content even if it appears empty - it's the authoritative source
      currentContent = snapshotContent
      
      // Ensure content array exists
      if (!currentContent.content || !Array.isArray(currentContent.content)) {
        currentContent.content = []
      }
      
      // Debug: log snapshot usage
      console.log('Using snapshot content:', {
        hasContent: currentContent.content && currentContent.content.length > 0,
        contentLength: currentContent.content?.length || 0
      })
    } else {
      console.warn('Snapshot exists but content_json is invalid:', {
        hasSnapshot: !!snapshot,
        hasContentJson: !!snapshot?.content_json,
        contentType: typeof snapshotContent
      })
    }
  } else {
    console.warn('No snapshot found:', { hasSnapshot: !!snapshot })
  }
  
  // Second priority: If no snapshot or snapshot is truly empty, try events
  // (Events might have full content in meta events)
  if (!currentContent || (currentContent.type === 'doc' && 
      (!currentContent.content || currentContent.content.length === 0))) {
    if (events && events.length > 0) {
      // Search events from most recent to oldest
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
        
        // Check if payload has content
        if (payload && payload.content) {
          const contentToCheck = payload.content
          // If it's a valid doc structure with content
          if (contentToCheck && contentToCheck.type === 'doc' && 
              Array.isArray(contentToCheck.content) && contentToCheck.content.length > 0) {
            currentContent = contentToCheck
            break
          }
        }
        
        // Also check if payload itself is the content structure
        if (payload && payload.type === 'doc' && 
            Array.isArray(payload.content) && payload.content.length > 0) {
          currentContent = payload
          break
        }
      }
    }
  }
  
  // Default to empty doc if no content found
  if (!currentContent || typeof currentContent !== 'object') {
    currentContent = { type: 'doc', content: [] }
  }
  
  // Ensure it has the correct structure
  if (!currentContent.type) {
    currentContent = {
      type: 'doc',
      content: Array.isArray(currentContent) ? currentContent : (currentContent.content || [currentContent])
    }
  }
  
  // Final validation: ensure content array exists
  if (!currentContent.content || !Array.isArray(currentContent.content)) {
    currentContent.content = []
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
