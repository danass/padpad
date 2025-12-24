'use client'

import { create } from 'zustand'

export const useEditorStore = create((set, get) => ({
  // Current document state
  currentDocument: null,
  currentContent: null,
  editor: null,
  
  // Unsaved changes tracking
  hasUnsavedChanges: false,
  lastSavedVersion: 0,
  currentVersion: 0,
  
  // History state
  history: [],
  historyLoading: false,
  
  // Actions
  setEditor: (editor) => set({ editor }),
  
  setCurrentDocument: (document) => set({ 
    currentDocument: document,
    hasUnsavedChanges: false,
    lastSavedVersion: 0,
    currentVersion: 0
  }),
  
  setCurrentContent: (content) => set({ 
    currentContent: content,
    hasUnsavedChanges: true,
    currentVersion: get().currentVersion + 1
  }),
  
  markSaved: () => set({ 
    hasUnsavedChanges: false,
    lastSavedVersion: get().currentVersion
  }),
  
  setHistory: (history) => set({ history }),
  
  setHistoryLoading: (loading) => set({ historyLoading: loading }),
  
  reset: () => set({
    currentDocument: null,
    currentContent: null,
    editor: null,
    hasUnsavedChanges: false,
    lastSavedVersion: 0,
    currentVersion: 0,
    history: [],
    historyLoading: false
  })
}))






