'use client'

import { Button } from '@/components/ui/button'
import { usePTE } from './pte-context'
import { Badge } from '@/components/ui/badge'

/**
 * Renders a mode switcher to choose between "academic" and "core" PTE contexts.
 *
 * Highlights the active mode, updates the PTE context when a mode is selected,
 * and displays the current context in a badge.
 *
 * @returns A JSX element with two buttons for switching modes and a badge showing the active context.
 */
export function PTEContextSwitcher() {
  const { context, setContext } = usePTE()

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Mode:</span>
      <div className="flex gap-1 p-1 bg-muted rounded-lg">
        <Button
          size="sm"
          variant={context === 'academic' ? 'default' : 'ghost'}
          onClick={() => setContext('academic')}
          className="h-8"
        >
          PTE Academic
        </Button>
        <Button
          size="sm"
          variant={context === 'core' ? 'default' : 'ghost'}
          onClick={() => setContext('core')}
          className="h-8"
        >
          PTE Core
        </Button>
      </div>
      <Badge variant="outline" className="capitalize">
        {context}
      </Badge>
    </div>
  )
}