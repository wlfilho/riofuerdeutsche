'use client'

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react'
import { markPageAsRead, markPageAsUnread } from '@/app/actions/guideProgress'

interface ReadingState {
  readPageIds: string[]
  toggleRead: (pageId: string) => Promise<void>
  isPageRead: (pageId: string) => boolean
}

const ReadingContext = createContext<ReadingState | undefined>(undefined)

export function ReadingProvider({ 
  initialReadPageIds, 
  children 
}: { 
  initialReadPageIds: string[], 
  children: ReactNode 
}) {
  const [readPageIds, setReadPageIds] = useState<string[]>(initialReadPageIds)

  const toggleRead = async (pageId: string) => {
    const isCurrentlyRead = readPageIds.includes(pageId)
    
    // Optimistic Update
    setReadPageIds(prev => 
      isCurrentlyRead ? prev.filter(id => id !== pageId) : [...prev, pageId]
    )

    try {
      if (isCurrentlyRead) {
        await markPageAsUnread(pageId)
      } else {
        await markPageAsRead(pageId)
      }
    } catch (err) {
      // Revert on error
      setReadPageIds(prev => 
        isCurrentlyRead ? [...prev, pageId] : prev.filter(id => id !== pageId)
      )
      console.error('Failed to toggle read status:', err)
    }
  }

  const isPageRead = (pageId: string) => readPageIds.includes(pageId)

  const value = useMemo(() => ({
    readPageIds,
    toggleRead,
    isPageRead
  }), [readPageIds])

  return (
    <ReadingContext.Provider value={value}>
      {children}
    </ReadingContext.Provider>
  )
}

export function useReading() {
  const context = useContext(ReadingContext)
  if (context === undefined) {
    throw new Error('useReading must be used within a ReadingProvider')
  }
  return context
}
