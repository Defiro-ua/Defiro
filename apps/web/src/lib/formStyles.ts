import type { KeyboardEvent } from 'react'
import { cx } from './cx'

/** Text inputs: 48px high, 2px red border when wrong */
export const inputClass = (wrong?: boolean, extra?: string) =>
  cx(
    'box-border h-12 w-full rounded-md bg-panel px-4 text-[16px] text-ink',
    wrong ? 'border-2 border-error' : 'border border-field',
    extra,
  )

export const textareaClass = (wrong?: boolean, extra?: string) =>
  cx(
    'box-border w-full rounded-md bg-panel px-3.5 py-2.5 text-[16px] leading-[23px] text-ink',
    wrong ? 'border-2 border-error' : 'border border-field',
    extra,
  )

/** Joins the ids of a field's help and error for aria-describedby */
export const describedBy = (...ids: Array<string | false | undefined>) => ids.filter(Boolean).join(' ') || undefined

/** A radio button or checkbox as a selectable card */
export const cardClass = (on: boolean, extra?: string) =>
  cx(
    'choice-card box-border flex cursor-pointer items-start gap-3 rounded-item px-4 py-3',
    on ? 'border-2 border-orange bg-accent-soft' : 'border border-line-strong bg-panel',
    extra,
  )

/** Big option row of a question (transport, choices of a generic form) */
export const optionClass = (on: boolean, short?: boolean) =>
  cx(
    'choice-card box-border flex cursor-pointer items-center gap-3.5 rounded-item px-5 text-[17px]',
    short ? 'min-h-14 flex-[1_1_180px]' : 'min-h-15 w-full',
    on ? 'border-2 border-orange bg-accent-soft font-semibold' : 'border border-field bg-panel',
  )

export const radioClass = 'm-0 size-5.5 shrink-0 accent-orange'

/** Enter moves on from anywhere in the step (as in Typeform), except where Enter already does something */
export function enterMovesOn(e: KeyboardEvent, next: () => void, blockInputs = false) {
  if (e.key !== 'Enter' || e.defaultPrevented || e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) return
  const t = e.target as HTMLElement
  const tag = t.tagName
  if (tag === 'BUTTON' || tag === 'A' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'SUMMARY') return
  if (tag === 'INPUT' && (t as HTMLInputElement).type === 'file') return
  e.preventDefault()
  if (blockInputs && tag === 'INPUT') return
  next()
}
