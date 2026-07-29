import { useRef } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { selectOffline, uiActions, useAppDispatch, useAppSelector } from '@sense/store'
import { TopBar } from './TopBar'
import { CommandPalette } from './CommandPalette'
import { GenerationOverlay } from './GenerationOverlay'
import { ShortcutsModal } from './ShortcutsModal'
import { useHotkeys } from '../lib/useHotkeys'

export const AppShell = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const offline = useAppSelector(selectOffline)
  const queued = useAppSelector((s) => s.connectivity.queue.length)
  const scrollRef = useRef<HTMLDivElement>(null)
  const chordRef = useRef(false)

  useHotkeys({
    'mod+k': () => dispatch(uiActions.setCommandOpen(true)),
    'shift+?': () => dispatch(uiActions.setShortcutsOpen(true)),
    '?': () => dispatch(uiActions.setShortcutsOpen(true)),
    // A two-key chord (g then d / g then p), the way Gmail and GitHub do it.
    g: () => {
      chordRef.current = true
      setTimeout(() => (chordRef.current = false), 900)
    },
    d: () => {
      if (chordRef.current) navigate('/')
      chordRef.current = false
    },
    p: () => {
      if (chordRef.current) navigate('/portfolio')
      chordRef.current = false
    },
  })

  /* Every route change starts at the top of the scroll container. */
  const lastPath = useRef(location.pathname)
  if (lastPath.current !== location.pathname) {
    lastPath.current = location.pathname
    scrollRef.current?.scrollTo({ top: 0 })
  }

  return (
    <div data-app-shell className="flex h-dvh min-h-0 flex-col">
      <TopBar />

      {offline ? (
        <div
          role="status"
          className="no-print flex shrink-0 items-center gap-2.5 border-b border-warn/30 bg-warn-tint px-5 py-2 text-[12px] font-semibold text-warn"
        >
          <span aria-hidden className="size-2 shrink-0 animate-softpulse rounded-full bg-warn" />
          <span>
            Working offline — changes are saved to this device and queued to sync.
            {queued ? ` ${queued} change${queued === 1 ? '' : 's'} queued.` : ''} Drafting falls back
            to the cached approved-language library.
          </span>
        </div>
      ) : null}

      <div ref={scrollRef} data-scroll className="min-h-0 flex-1 overflow-auto">
        <Outlet />
      </div>

      <CommandPalette />
      <ShortcutsModal />
      <GenerationOverlay />
    </div>
  )
}
