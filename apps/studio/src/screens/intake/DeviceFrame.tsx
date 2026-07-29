import type { ReactNode } from 'react'
import { selectOffline, useAppSelector } from '@sense/store'
import { cn } from '@sense/ui'

/**
 * The field app runs on a tablet, so intake is framed as a device rather than
 * a browser page — it keeps reviewers oriented about where the data comes from.
 */
export const DeviceFrame = ({
  title,
  children,
  className,
}: {
  title: string
  children: ReactNode
  className?: string
}) => {
  const offline = useAppSelector(selectOffline)
  const clock = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  return (
    <div className={cn('mx-auto w-full rounded-[30px] bg-[#22262C] p-3 shadow-device', className)}>
      <div className="flex min-h-[640px] flex-col overflow-hidden rounded-[19px] bg-page">
        <div className="flex shrink-0 items-center border-b border-line bg-card px-4 py-2">
          <span className="tnum flex-1 font-mono text-[11px] font-semibold text-ink-2">{clock}</span>
          <span className="text-[11px] font-bold tracking-wide text-ink-3">{title}</span>
          <span className="flex flex-1 items-center justify-end gap-1.5">
            <span
              aria-hidden
              className={cn('size-1.5 rounded-full', offline ? 'bg-warn' : 'bg-success')}
            />
            <span className="text-[10.5px] font-semibold text-ink-2">
              {offline ? 'Offline · saving to device' : 'Online · syncing live'}
            </span>
          </span>
        </div>
        {children}
      </div>
    </div>
  )
}
