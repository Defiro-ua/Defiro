import type { ReactNode } from 'react'
import { cx } from '../lib/cx'
import { Icon, type IconName } from './Icon'

export type NoticeTone = 'info' | 'warning' | 'error' | 'success' | 'soft'

const tones: Record<NoticeTone, { box: string; text: string; icon: IconName }> = {
  info: { box: 'bg-info-soft', text: 'text-info', icon: 'info' },
  warning: { box: 'bg-warning-soft', text: 'text-warning', icon: 'alertCircle' },
  error: { box: 'bg-error-soft', text: 'text-error', icon: 'alertCircle' },
  success: { box: 'bg-success-soft', text: 'text-success', icon: 'check' },
  soft: { box: 'bg-soft', text: 'text-ink-2', icon: 'info' },
}

type NoticeProps = {
  tone?: NoticeTone
  /** Hide the icon (plain tinted note) */
  plain?: boolean
  icon?: IconName
  /** Body text in ink-2 instead of the tone colour */
  neutralText?: boolean
  className?: string
  children: ReactNode
}

/** Tinted inline message with an icon. */
export function Notice({ tone = 'info', plain, icon, neutralText, className, children }: NoticeProps) {
  const t = tones[tone]
  return (
    <p
      className={cx(
        'm-0 flex gap-2.5 rounded-md px-4 py-3.5 text-body-sm',
        t.box,
        neutralText ? 'text-ink-2' : t.text,
        className,
      )}
    >
      {!plain && <Icon name={icon ?? t.icon} size={20} className={t.text} />}
      <span>{children}</span>
    </p>
  )
}
