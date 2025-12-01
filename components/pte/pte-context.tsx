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
 * Provides PTE context to descendant components and keeps it synchronized with the URL path.
 *
 * The provider maintains an internal context state (initially "academic"), updates that state when the pathname includes
 * "/pte/core" or "/pte/academic", and exposes `setContext` which updates the state and navigates by replacing the
 * first "/academic" or "/core" segment in the current pathname.
 *
 * @param children - React children that will receive the PTE context
 * @returns The provider element supplying `{ context, setContext }` to its descendants
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
 * Access the PTE context provided by a surrounding PTEProvider.
 *
 * @returns The context object `{ context: 'academic' | 'core'; setContext: (context) => void }`.
 * @throws Error if the hook is used outside of a PTEProvider.
 */
export function usePTE() {
  const context = useContext(PTEContext)
  if (!context) {
    throw new Error('usePTE must be used within a PTEProvider')
  }
  return context
}