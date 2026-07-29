import { clsx } from 'clsx'
import type { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Conditional class names with Tailwind conflict resolution, so a `className`
 * prop passed by a caller always wins over the component's own defaults.
 */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))
