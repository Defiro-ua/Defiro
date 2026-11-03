import { cx } from '../../lib/cx'

export type InputSize = 'lg' | 'md' | 'sm'
/** `flagged`: a reviewer left a note on this field */
export type InputTone = 'default' | 'error' | 'flagged' | 'focus' | 'changed'

const sizes: Record<InputSize, string> = {
  lg: 'h-12 px-4 text-body-md rounded-md',
  md: 'h-11 px-3.5 text-body rounded-md',
  sm: 'h-10 px-3 text-body rounded-tile',
}

const tones: Record<InputTone, string> = {
  default: 'border border-field bg-panel',
  error: 'border-emph border-error bg-panel',
  flagged: 'border-emph border-yellow bg-panel',
  focus: 'border-emph border-orange bg-panel shadow-focus-field',
  /** Value differs from the version in force */
  changed: 'border-emph border-changed bg-changed-soft font-semibold',
}

const shared =
  'text-ink transition focus:border-orange focus:shadow-focus-field focus:outline-none ' +
  'disabled:cursor-not-allowed disabled:opacity-60'

/** Classes shared by text inputs and selects. */
export function inputClasses(size: InputSize = 'lg', tone: InputTone = 'default', className?: string) {
  // Full width unless the caller sets its own width (e.g. `w-20` for a number of days)
  const width = /(^|\s)w-/.test(className ?? '') ? undefined : 'w-full'
  return cx(shared, width, sizes[size], tones[tone], className)
}

/** Classes for multi-line text areas. */
export function textareaClasses(tone: InputTone = 'default', className?: string) {
  return cx(shared, 'w-full resize-y rounded-md px-4 py-3 text-body', tones[tone], className)
}
