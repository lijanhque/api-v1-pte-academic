'use client'

import { createContext, ReactNode, useContext, useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export type PTEContextType = 'academic' | 'core'

type PTEState = {
  context: PTEContextType
  setContext: (context: PTEContextType) => void
}

const PTEContext = createContext<PTEState | undefined>(undefined)

/**
 * Provides PTE context to descendant components and synchronizes that context with the current URL path.
 *
 * The provider supplies `{ context, setContext }` to its descendants so they can read and change the active PTE context.
 *
 * @param children - React children to render inside the provider
 * @returns A provider element that supplies `{ context, setContext }` to its descendants
 */
export function PTEProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [context, setContextState] = useState<PTEContextType>('academic')

  // Sync context with URL
  useEffect(() => {
    if (pathname?.includes('/pte/core')) {
      setContextState('core')
    } else if (pathname?.includes('/pte/academic')) {
      setContextState('academic')
    }
  }, [pathname])

  const setContext = (newContext: PTEContextType) => {
    setContextState(newContext)
    
    // Navigate to the new context
    if (pathname) {
      const newPath = pathname.replace(/\/(academic|core)/, `/${newContext}`)
      if (newPath !== pathname) {
        router.push(newPath)
      }
    }
  }

  return (
    <PTEContext.Provider value={{ context, setContext }}>
      {children}
    </PTEContext.Provider>
  )
}

/**
 * Retrieve the current PTE context and its updater from the nearest PTEProvider.
 *
 * @returns The context object with `context` set to `'academic'` or `'core'` and `setContext` to update it.
 * @throws Error if there is no enclosing PTEProvider.
 */
export function usePTE() {
  const context = useContext(PTEContext)
  if (!context) {
    throw new Error('usePTE must be used within a PTEProvider')
  }
  return context
}