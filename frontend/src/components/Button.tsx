import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'
import { cx } from '../lib/cx'
import { Icon, type IconName } from './Icon'

export type ButtonVariant = 'primary' | 'secondary' | 'danger'
export type ButtonSize = 's' | 'm' | 'l' | 'xl'

const base =
  'inline-flex items-center justify-center gap-2 box-border rounded-pill font-semibold leading-[1.25] text-center no-underline ' +
  'transition-[background-color,filter] duration-150 disabled:cursor-not-allowed disabled:opacity-45'

const variants: Record<ButtonVariant, string> = {
  primary:
    'border-0 bg-brand text-on-brand hover:brightness-107 hover:text-on-brand ' +
    'aria-[current=page]:shadow-[0_0_0_3px_var(--color-bg),0_0_0_5px_var(--color-orange)]',
  secondary:
    'border-emph border-field bg-bg text-ink hover:bg-soft hover:text-ink ' +
    'aria-[current=page]:border-orange aria-[current=page]:bg-accent-soft',
  danger: 'border-0 bg-error text-on-status hover:brightness-110 hover:text-on-status',
}

const sizes: Record<ButtonSize, string> = {
  s: 'min-h-11 px-4 text-[14px]',
  m: 'min-h-12 px-5.5 text-[15px]',
  l: 'min-h-13 px-6.5 text-[16px]',
  xl: 'min-h-15 px-8.5 text-[18px]',
}

type CommonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Leading icon */
  icon?: IconName
  /** Trailing icon */
  iconRight?: IconName
  iconSize?: number
  className?: string
  children?: ReactNode
}

type AsButton = CommonProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & { to?: undefined; href?: undefined }
type AsLink = CommonProps & Omit<LinkProps, keyof CommonProps> & { to: LinkProps['to'] }
type AsAnchor = CommonProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & { href: string; to?: undefined }

export type ButtonProps = AsButton | AsLink | AsAnchor

function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'm', className?: string) {
  return cx(base, variants[variant], sizes[size], className)
}

/** Pill button of the design system; renders a link when given `to` or `href`. */
export function Button(props: ButtonProps) {
  const { variant, size, icon, iconRight, iconSize, className, children, ...rest } = props
  const classes = buttonClasses(variant, size, className)
  const glyph = iconSize ?? (size === 's' ? 16 : 18)
  const content = (
    <>
      {icon && <Icon name={icon} size={glyph} />}
      {children}
      {iconRight && <Icon name={iconRight} size={glyph} />}
    </>
  )

  if ('to' in rest && rest.to !== undefined) {
    return (
      <Link data-button {...(rest as LinkProps)} className={classes}>
        {content}
      </Link>
    )
  }
  if ('href' in rest && rest.href !== undefined) {
    return (
      <a data-button {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)} className={classes}>
        {content}
      </a>
    )
  }
  const { type = 'button', ...buttonRest } = rest as ButtonHTMLAttributes<HTMLButtonElement>
  return (
    <button type={type} {...buttonRest} className={classes}>
      {content}
    </button>
  )
}

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  icon: IconName
  /** Accessible name */
  label: string
  danger?: boolean
  iconSize?: number
}

/** Round 44px button with only an icon */
export function IconButton({ icon, label, danger, iconSize = 18, className, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      {...rest}
      className={cx(
        'inline-grid size-11 shrink-0 place-items-center rounded-full border-emph border-field bg-bg p-0 hover:bg-soft disabled:cursor-not-allowed disabled:opacity-40',
        danger ? 'text-error' : 'text-ink',
        className,
      )}
    >
      <Icon name={icon} size={iconSize} />
    </button>
  )
}
