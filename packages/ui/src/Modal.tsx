import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { cn } from './cn'

export interface ModalProps {
  open: boolean
  onClose?: () => void
  title?: ReactNode
  description?: ReactNode
  footer?: ReactNode
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
  /** Hides the close affordances for blocking states such as generation. */
  dismissible?: boolean
  className?: string
}

const SIZES = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' } as const

export const Modal = ({
  open,
  onClose,
  title,
  description,
  footer,
  children,
  size = 'md',
  dismissible = true,
  className,
}: ModalProps) => {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissible) onClose?.()
    }
    document.addEventListener('keydown', onKey)
    // Focus the panel so Escape and Tab are scoped to the dialog immediately.
    panelRef.current?.focus()
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [open, dismissible, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-90 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="animate-fade absolute inset-0 bg-[rgb(10_14_20/0.55)] backdrop-blur-[3px]"
        onClick={dismissible ? onClose : undefined}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          'animate-rise relative w-full rounded-2xl border border-line bg-card shadow-e3 outline-none',
          SIZES[size],
          className,
        )}
      >
        {title ? (
          <div className="flex items-start gap-3 px-6 pt-5 pb-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-extrabold tracking-tight text-ink">{title}</h2>
              {description ? <p className="mt-1 text-[12px] text-ink-3">{description}</p> : null}
            </div>
            {dismissible ? (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="-mt-1 -mr-1 cursor-pointer rounded-lg p-1.5 text-ink-3 transition-colors hover:bg-inset hover:text-ink"
              >
                <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" strokeLinecap="round" />
                </svg>
              </button>
            ) : null}
          </div>
        ) : null}
        <div className={cn('px-6', title ? 'pb-5' : 'py-5')}>{children}</div>
        {footer ? (
          <div className="flex items-center justify-end gap-2 border-t border-line px-6 py-4">{footer}</div>
        ) : null}
      </div>
    </div>
  )
}
