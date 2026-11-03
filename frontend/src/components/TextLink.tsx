import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { cx } from '../lib/cx'
import { Icon, type IconName } from './Icon'

type TextLinkProps = {
  /** Route inside the app; omit for in-page anchors given by `href` */
  to?: string
  href?: string
  iconRight?: IconName
  size?: 'xs' | 'sm' | 'md'
  className?: string
  children: ReactNode
}

/** Underlined text link in accent ink (links inside panels and lists). */
export function TextLink({ to, href, iconRight, size = 'sm', className, children }: TextLinkProps) {
  const classes = cx(
    'inline-flex items-center gap-1.5 font-semibold underline underline-offset-4',
    size === 'xs' ? 'text-label-sm' : size === 'sm' ? 'text-body-sm' : 'text-label-md',
    className,
  )
  const content = (
    <>
      {children}
      {iconRight && <Icon name={iconRight} size={16} />}
    </>
  )
  if (to)
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    )
  if (href)
    return (
      <a href={href} className={classes}>
        {content}
      </a>
    )
  // No destination in the mockup: keep it as a (no-op) button so it is not a dead link
  return (
    <button type="button" className={cx(classes, 'text-accent-ink hover:text-ink')}>
      {content}
    </button>
  )
}
