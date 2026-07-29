import { cn } from './cn'

export interface AvatarProps {
  initials: string
  name?: string
  size?: 'sm' | 'md' | 'lg'
  tone?: 'ink' | 'brand' | 'muted'
  className?: string
}

const SIZES = {
  sm: 'size-6 text-[9px] rounded-md',
  md: 'size-8 text-[11px] rounded-lg',
  lg: 'size-10 text-[13px] rounded-xl',
} as const

const TONES = {
  ink: 'bg-invert text-ink-invert',
  brand: 'bg-brand-600 text-white',
  muted: 'bg-inset text-ink-2',
} as const

export const Avatar = ({ initials, name, size = 'md', tone = 'ink', className }: AvatarProps) => (
  <span
    title={name}
    aria-label={name}
    className={cn(
      'inline-flex shrink-0 items-center justify-center font-extrabold select-none',
      SIZES[size],
      TONES[tone],
      className,
    )}
  >
    {initials}
  </span>
)
