import { useEffect } from 'react'
import { cn } from './cn'

export interface ToastItem {
  id: string
  message: string
  tone: 'default' | 'success' | 'warn' | 'danger'
  detail?: string
}

const TONES = {
  default: 'bg-invert text-ink-invert',
  success: 'bg-success text-white',
  warn: 'bg-warn text-white',
  danger: 'bg-danger text-white',
} as const

const ICONS = { default: '•', success: '✓', warn: '!', danger: '!' } as const

const Toast = ({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) => {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 3200)
    return () => clearTimeout(t)
  }, [toast.id, onDismiss])

  return (
    <div
      className={cn(
        'animate-rise pointer-events-auto flex max-w-[min(90vw,26rem)] items-center gap-3 rounded-xl px-4 py-3 shadow-e3',
        TONES[toast.tone],
      )}
    >
      <span
        aria-hidden
        className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-[11px] font-extrabold"
      >
        {ICONS[toast.tone]}
      </span>
      <div className="min-w-0">
        <p className="text-[13px] font-bold">{toast.message}</p>
        {toast.detail ? <p className="mt-0.5 font-mono text-[10.5px] opacity-80">{toast.detail}</p> : null}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss"
        className="ml-auto cursor-pointer rounded-md p-1 opacity-60 transition-opacity hover:opacity-100"
      >
        <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

export const Toaster = ({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}) => (
  <div
    role="status"
    aria-live="polite"
    className="no-print pointer-events-none fixed inset-x-0 bottom-6 z-120 flex flex-col items-center gap-2 px-4"
  >
    {toasts.map((t) => (
      <Toast key={t.id} toast={t} onDismiss={onDismiss} />
    ))}
  </div>
)
