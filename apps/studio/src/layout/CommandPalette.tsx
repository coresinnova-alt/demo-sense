import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  inspectionActions,
  toggleOffline,
  uiActions,
  useAppDispatch,
  useAppSelector,
} from '@sense/store'
import { ROLE_CAPABILITIES } from '@sense/mock'
import { STATUS_LABEL } from '@sense/core'
import { cn } from '@sense/ui'
import { routeForInspection } from '../lib/routeForInspection'

interface Command {
  id: string
  label: string
  hint?: string
  group: string
  run: () => void
}

export const CommandPalette = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const open = useAppSelector((s) => s.ui.commandOpen)
  const inspections = useAppSelector((s) => s.inspections.items)
  const user = useAppSelector((s) => s.auth.user)
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const close = () => {
    dispatch(uiActions.setCommandOpen(false))
    setQuery('')
    setCursor(0)
  }

  const commands = useMemo<Command[]>(() => {
    const caps = user ? ROLE_CAPABILITIES[user.role] : { admin: false }
    const nav: Command[] = [
      { id: 'nav-dash', label: 'Go to Dashboard', group: 'Navigate', run: () => navigate('/') },
      {
        id: 'nav-portfolio',
        label: 'Go to Portfolio analytics',
        group: 'Navigate',
        run: () => navigate('/portfolio'),
      },
    ]
    if (caps.admin) {
      nav.push({ id: 'nav-admin', label: 'Go to Admin', group: 'Navigate', run: () => navigate('/admin') })
    }

    const actions: Command[] = [
      {
        id: 'act-theme',
        label: 'Toggle light / dark theme',
        group: 'Actions',
        run: () => dispatch(uiActions.toggleTheme()),
      },
      {
        id: 'act-offline',
        label: 'Toggle offline simulation',
        group: 'Actions',
        run: () => dispatch(toggleOffline()),
      },
      {
        id: 'act-shortcuts',
        label: 'Show keyboard shortcuts',
        group: 'Actions',
        run: () => dispatch(uiActions.setShortcutsOpen(true)),
      },
    ]

    const records: Command[] = inspections.map((insp) => ({
      id: `insp-${insp.id}`,
      label: insp.property.name || 'New inspection (set-up pending)',
      hint: `${insp.proj} · ${STATUS_LABEL[insp.status]}`,
      group: 'Inspections',
      run: () => {
        dispatch(inspectionActions.setActive({ id: insp.id, compIdx: 0 }))
        navigate(routeForInspection(insp))
      },
    }))

    return [...nav, ...actions, ...records]
  }, [dispatch, inspections, navigate, user])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands.slice(0, 8)
    return commands
      .filter((c) => `${c.label} ${c.hint ?? ''}`.toLowerCase().includes(q))
      .slice(0, 10)
  }, [commands, query])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 10)
  }, [open])

  useEffect(() => {
    setCursor(0)
  }, [query])

  if (!open) return null

  const runAt = (index: number) => {
    const cmd = results[index]
    if (!cmd) return
    close()
    cmd.run()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCursor((c) => Math.min(c + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCursor((c) => Math.max(c - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      runAt(cursor)
    } else if (e.key === 'Escape') {
      close()
    }
  }

  let lastGroup = ''

  return (
    <div className="fixed inset-0 z-100 flex items-start justify-center p-4 pt-[12vh]" role="dialog" aria-modal="true">
      <div className="animate-fade absolute inset-0 bg-[rgb(10_14_20/0.5)] backdrop-blur-[2px]" onClick={close} />
      <div className="animate-rise relative w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-card shadow-e3">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <svg viewBox="0 0 16 16" className="size-4 shrink-0 text-ink-3" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="7" cy="7" r="4.5" />
            <path d="M10.5 10.5L14 14" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search inspections, jump to a screen, run an action…"
            aria-label="Command palette"
            className="h-12 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-3"
          />
          <kbd className="rounded border border-line-2 px-1.5 py-0.5 font-mono text-[9.5px] text-ink-3">ESC</kbd>
        </div>

        <ul className="max-h-80 overflow-auto p-2">
          {results.length === 0 ? (
            <li className="px-3 py-6 text-center text-[12.5px] text-ink-3">No matches</li>
          ) : (
            results.map((cmd, i) => {
              const showGroup = cmd.group !== lastGroup
              lastGroup = cmd.group
              return (
                <li key={cmd.id}>
                  {showGroup ? (
                    <p className="px-3 pt-2.5 pb-1 font-mono text-[9.5px] font-semibold tracking-[0.08em] text-ink-3 uppercase">
                      {cmd.group}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    onMouseEnter={() => setCursor(i)}
                    onClick={() => runAt(i)}
                    className={cn(
                      'flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors',
                      i === cursor ? 'bg-inset' : 'hover:bg-subtle',
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink">
                      {cmd.label}
                    </span>
                    {cmd.hint ? (
                      <span className="shrink-0 font-mono text-[10px] text-ink-3">{cmd.hint}</span>
                    ) : null}
                  </button>
                </li>
              )
            })
          )}
        </ul>
      </div>
    </div>
  )
}
