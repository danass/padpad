// History replay logic
// This reconstructs a document state from a snapshot + events

export function replayHistory(snapshot, events) {
  let currentContent = null

  // 1. Start with snapshot content if it exists
  if (snapshot && snapshot.content_json) {
    let snapshotContent = snapshot.content_json
    if (typeof snapshotContent === 'string') {
      try {
        snapshotContent = JSON.parse(snapshotContent)
      } catch (e) {
        console.error('Error parsing snapshot content_json:', e)
        snapshotContent = null
      }
    }

    if (snapshotContent) {
      currentContent = snapshotContent
    }
  }

  // 2. Apply events in chronological order
  if (events && Array.isArray(events) && events.length > 0) {
    // Ensure events are sorted by version or creation date
    // (The API usually returns them sorted, but we can be safe)
    const sortedEvents = [...events].sort((a, b) => {
      if (a.version !== undefined && b.version !== undefined) {
        return a.version - b.version
      }
      return new Date(a.created_at) - new Date(b.created_at)
    })

    for (const event of sortedEvents) {
      let payload = event.payload
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload)
        } catch (e) {
          console.error('Error parsing event payload:', e)
          continue
        }
      }

      // CURRENT IMPLEMENTATION: Since calculateDiff returns full content in 'meta' events,
      // we just overwrite the content.
      if (payload && payload.content) {
        currentContent = payload.content
      } else if (payload && payload.type === 'doc') {
        // Some events might have the doc structure directly as payload
        currentContent = payload
      }

      // FUTURE: If we implement true incremental steps (e.g. Prosemirror-transform),
      // we would apply them here using currentContent as base.
    }
  }

  // 3. Fallback and Final validation
  if (!currentContent || typeof currentContent !== 'object') {
    currentContent = { type: 'doc', content: [] }
  }

  if (!currentContent.type) {
    currentContent = {
      type: 'doc',
      content: Array.isArray(currentContent) ? currentContent : (currentContent.content || [currentContent])
    }
  }

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
