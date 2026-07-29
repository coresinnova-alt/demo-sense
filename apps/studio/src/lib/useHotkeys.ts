import { useEffect, useRef } from 'react'

export type HotkeyMap = Record<string, (event: KeyboardEvent) => void>

const isTypingTarget = (el: EventTarget | null) => {
  if (!(el instanceof HTMLElement)) return false
  return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)
}

/**
 * Global keyboard shortcuts.
 *
 * Keys are written as `mod+k`, `shift+?` or a bare key such as `1`. Bare keys
 * are ignored while the user is typing in a field; modifier combinations still
 * fire, which is what makes ⌘K work from inside the search box.
 */
export const useHotkeys = (map: HotkeyMap, enabled = true) => {
  const ref = useRef(map)
  ref.current = map

  useEffect(() => {
    if (!enabled) return
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      const parts: string[] = []
      if (mod) parts.push('mod')
      if (e.shiftKey) parts.push('shift')
      parts.push(e.key.toLowerCase())
      const combo = parts.join('+')

      const handler = ref.current[combo]
      if (!handler) return
      if (!mod && isTypingTarget(e.target)) return
      e.preventDefault()
      handler(e)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enabled])
}
