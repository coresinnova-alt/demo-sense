import { NavLink, useNavigate } from 'react-router-dom'
import {
  authActions,
  logAudit,
  selectOffline,
  toggleOffline,
  uiActions,
  useAppDispatch,
  useAppSelector,
} from '@sense/store'
import { ROLE_CAPABILITIES } from '@sense/mock'
import { Avatar, Button, LogoMark, Toggle, cn } from '@sense/ui'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-full px-3.5 py-2 text-[12.5px] font-semibold transition-colors duration-150',
    isActive ? 'bg-invert text-ink-invert' : 'text-ink-2 hover:bg-inset hover:text-ink',
  )

export const TopBar = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((s) => s.auth.user)!
  const theme = useAppSelector((s) => s.ui.theme)
  const offline = useAppSelector(selectOffline)
  const manualOffline = useAppSelector((s) => s.connectivity.manualOffline)
  const syncing = useAppSelector((s) => s.connectivity.syncing)
  const queued = useAppSelector((s) => s.connectivity.queue.length)
  const caps = ROLE_CAPABILITIES[user.role]

  const syncLabel = syncing
    ? `Syncing ${queued} change${queued === 1 ? '' : 's'}…`
    : offline
      ? queued
        ? `Offline · ${queued} queued`
        : 'Offline · saving locally'
      : 'Online · synced'

  return (
    <header className="no-print sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b border-line bg-card/85 px-4 backdrop-blur-md">
      <NavLink to="/" className="flex items-center gap-2.5" aria-label="Sense Report Studio home">
        <LogoMark size={28} />
        <span className="hidden text-[13.5px] font-extrabold tracking-tight text-ink sm:block">
          Sense Report Studio
        </span>
      </NavLink>
      <span className="hidden rounded bg-brand-50 px-1.5 py-0.5 font-mono text-[9px] font-semibold tracking-[0.08em] text-brand-800 lg:block dark:bg-brand-950 dark:text-brand-200">
        MVP PILOT
      </span>

      <nav className="ml-2 flex items-center gap-1" aria-label="Primary">
        <NavLink to="/" end className={navLinkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/portfolio" className={navLinkClass}>
          Portfolio
        </NavLink>
        {caps.admin ? (
          <NavLink to="/admin" className={navLinkClass}>
            Admin
          </NavLink>
        ) : null}
      </nav>

      <div className="flex-1" />

      <button
        type="button"
        onClick={() => dispatch(uiActions.setCommandOpen(true))}
        className="hidden items-center gap-2 rounded-lg border border-line-2 bg-subtle px-2.5 py-1.5 text-[11.5px] text-ink-3 transition-colors hover:border-line-strong hover:text-ink-2 md:flex"
      >
        <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="7" cy="7" r="4.5" />
          <path d="M10.5 10.5L14 14" strokeLinecap="round" />
        </svg>
        Search
        <kbd className="rounded border border-line-2 bg-card px-1 font-mono text-[9px]">⌘K</kbd>
      </button>

      <div
        className={cn(
          'hidden items-center gap-2 rounded-full border px-3 py-1.5 text-[11.5px] font-semibold lg:flex',
          offline ? 'border-warn/40 bg-warn-tint text-warn' : 'border-line bg-subtle text-ink-2',
        )}
      >
        <span
          aria-hidden
          className={cn(
            'size-1.5 rounded-full',
            syncing ? 'animate-softpulse bg-brand-500' : offline ? 'animate-softpulse bg-warn' : 'bg-success',
          )}
        />
        {syncLabel}
      </div>

      <Toggle
        checked={manualOffline}
        onChange={() => dispatch(toggleOffline())}
        label="Offline"
        tone="warn"
        title="Simulate loss of connectivity"
        className="hidden sm:flex"
      />

      <button
        type="button"
        onClick={() => dispatch(uiActions.toggleTheme())}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        className="cursor-pointer rounded-lg border border-line-2 p-2 text-ink-2 transition-colors hover:bg-inset hover:text-ink"
      >
        {theme === 'dark' ? (
          <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8" cy="8" r="3.2" />
            <path d="M8 1v1.6M8 13.4V15M15 8h-1.6M2.6 8H1M12.9 3.1l-1.1 1.1M4.2 11.8l-1.1 1.1M12.9 12.9l-1.1-1.1M4.2 4.2L3.1 3.1" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M13.5 9.6A5.8 5.8 0 016.4 2.5a5.8 5.8 0 107.1 7.1z" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <div className="h-6 w-px bg-line" />

      <div className="flex items-center gap-2.5">
        <Avatar initials={user.initials} name={user.name} />
        <div className="hidden xl:block">
          <p className="text-[12px] leading-tight font-bold text-ink">{user.name}</p>
          <p className="text-[10px] leading-tight text-ink-3">{user.title}</p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            dispatch(logAudit('Signed out'))
            dispatch(authActions.signOut())
            navigate('/')
          }}
        >
          Log out
        </Button>
      </div>
    </header>
  )
}
