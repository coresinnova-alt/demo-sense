import { forwardRef, useId } from 'react'
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from './cn'

const CONTROL =
  'w-full rounded-control border border-line-2 bg-card px-3 py-2.5 text-[13.5px] text-ink ' +
  'placeholder:text-ink-3 transition-colors hover:border-line-strong ' +
  'focus:border-brand-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-inset disabled:text-ink-3'

export interface LabelledProps {
  label?: ReactNode
  hint?: ReactNode
  error?: string
  required?: boolean
  className?: string
}

const Wrapper = ({
  label,
  hint,
  error,
  required,
  className,
  htmlFor,
  children,
}: LabelledProps & { htmlFor: string; children: ReactNode }) => (
  <div className={cn('min-w-0', className)}>
    {label ? (
      <label htmlFor={htmlFor} className="mb-1.5 flex items-center gap-1 text-[11.5px] font-semibold text-ink-2">
        {label}
        {required ? (
          <span aria-hidden className="text-signal-500">
            *
          </span>
        ) : null}
      </label>
    ) : null}
    {children}
    {error ? (
      <p role="alert" className="mt-1 text-[11px] font-semibold text-danger">
        {error}
      </p>
    ) : hint ? (
      <p className="mt-1 text-[11px] text-ink-3">{hint}</p>
    ) : null}
  </div>
)

export type InputProps = InputHTMLAttributes<HTMLInputElement> & LabelledProps

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, required, className, ...rest },
  ref,
) {
  const id = useId()
  return (
    <Wrapper label={label} hint={hint} error={error} required={required} className={className} htmlFor={id}>
      <input
        ref={ref}
        id={id}
        aria-invalid={error ? true : undefined}
        className={cn(CONTROL, error && 'border-danger focus:border-danger')}
        {...rest}
      />
    </Wrapper>
  )
})

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & LabelledProps

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, required, className, ...rest },
  ref,
) {
  const id = useId()
  return (
    <Wrapper label={label} hint={hint} error={error} required={required} className={className} htmlFor={id}>
      <textarea
        ref={ref}
        id={id}
        aria-invalid={error ? true : undefined}
        className={cn(CONTROL, 'resize-y leading-relaxed', error && 'border-danger')}
        {...rest}
      />
    </Wrapper>
  )
})

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> &
  LabelledProps & { options: { value: string; label: string }[] }

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, required, className, options, ...rest },
  ref,
) {
  const id = useId()
  return (
    <Wrapper label={label} hint={hint} error={error} required={required} className={className} htmlFor={id}>
      <select ref={ref} id={id} className={cn(CONTROL, 'cursor-pointer appearance-none pr-8')} {...rest}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Wrapper>
  )
})
