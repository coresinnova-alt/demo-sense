import { useState } from 'react'
import type { FormEvent } from 'react'
import { authActions, logAudit, uiActions, useAppDispatch, useAppSelector } from '@sense/store'
import { ROLE_ORDER, ROLE_USERS } from '@sense/mock'
import { Avatar, Button, Input, LogoMark } from '@sense/ui'
import { cn } from '@sense/ui'

export const LoginScreen = () => {
  const dispatch = useAppDispatch()
  const pickedRole = useAppSelector((s) => s.auth.pickedRole)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const user = ROLE_USERS[pickedRole]
    dispatch(authActions.signIn({ role: pickedRole, email }))
    dispatch(logAudit('Signed in', user.title))
    dispatch(uiActions.pushToast(`Welcome back, ${user.name.split(' ')[0]}`, 'success'))
  }

  return (
    <div
      className="flex min-h-dvh items-center justify-center p-6"
      style={{
        background:
          'radial-gradient(1100px 560px at 50% -8%, var(--color-brand-100), var(--srf-page) 62%)',
      }}
    >
      <div className="animate-rise w-full max-w-[28rem]">
        <div className="mb-6 flex items-center justify-center gap-3">
          <LogoMark size={44} />
          <div>
            <h1 className="text-lg leading-tight font-extrabold tracking-tight text-ink">
              Sense Report Studio
            </h1>
            <p className="mt-0.5 text-[11.5px] font-medium text-ink-3">
              AI-assisted building reports · Miami office
            </p>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="rounded-2xl border border-line bg-card p-6 shadow-e2"
          aria-label="Sign in"
        >
          <h2 className="text-[15px] font-bold text-ink">Sign in</h2>
          <p className="mt-1 mb-4 text-[12px] text-ink-3">Demo build — any credentials work</p>

          <div className="flex flex-col gap-3">
            <Input
              label="Email"
              type="email"
              autoComplete="username"
              placeholder="you@sense-eng.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <fieldset className="mt-5">
            <legend className="mb-2 text-[11.5px] font-semibold text-ink-2">Continue as</legend>
            <div className="flex flex-col gap-2">
              {ROLE_ORDER.map((role) => {
                const u = ROLE_USERS[role]
                const selected = pickedRole === role
                return (
                  <button
                    key={role}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => dispatch(authActions.pickRole(role))}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-xl border p-2.5 text-left transition-all duration-150',
                      selected
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-950'
                        : 'border-line-2 bg-card hover:border-line-strong hover:bg-subtle',
                    )}
                  >
                    <Avatar initials={u.initials} tone={selected ? 'brand' : 'muted'} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-bold text-ink">
                        {u.label} — {u.name}
                      </span>
                      <span className="block truncate text-[11px] text-ink-3">{u.desc}</span>
                    </span>
                    {selected ? (
                      <span aria-hidden className="text-brand-600 dark:text-brand-300">
                        ✓
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <Button type="submit" variant="primary" size="lg" fullWidth className="mt-5">
            Sign in →
          </Button>
        </form>

        <p className="mt-4 text-center text-[11px] text-ink-3">
          Prototype for Sense Engineering · PRD v0.1 · work is stored on this device and syncs when
          online
        </p>
      </div>
    </div>
  )
}
