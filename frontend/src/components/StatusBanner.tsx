import type { ReactNode } from 'react'
import { cx } from '../lib/cx'
import { Icon, type IconName } from './Icon'

type StatusBannerProps = {
  title: ReactNode
  children?: ReactNode
  tone?: 'success' | 'info'
  icon?: IconName
  /** Extra content on the right (e.g. a download link) */
  action?: ReactNode
  size?: 'md' | 'lg'
  className?: string
}

/** Result of an action ("AC-2026-0147 aprovado e assinado"), announced to screen readers. */
export function StatusBanner({
  title,
  children,
  tone = 'success',
  icon = 'check',
  action,
  size = 'md',
  className,
}: StatusBannerProps) {
  const success = tone === 'success'
  return (
    <div
      role="status"
      className={cx(
        'flex flex-wrap items-start gap-3.5 rounded-md',
        size === 'md' ? 'px-5 py-4' : 'px-6 py-5',
        success ? 'bg-success-soft' : 'bg-info-soft',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cx(
          'grid shrink-0 place-items-center rounded-full text-on-status',
          size === 'md' ? 'size-7' : 'size-8',
          success ? 'bg-success' : 'bg-info',
        )}
      >
        <Icon name={icon} size={size === 'md' ? 16 : 18} strokeWidth={2.4} />
      </span>
      <span className="flex min-w-0 flex-1 basis-80 flex-col gap-0.5">
        <strong className={cx('text-title-md font-semibold', success ? 'text-success' : 'text-info')}>{title}</strong>
        {children && <span className="text-body-sm text-ink-2">{children}</span>}
      </span>
      {action}
    </div>
  )
}
