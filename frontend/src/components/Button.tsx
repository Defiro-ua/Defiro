import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'
import { cx } from '../lib/cx'
import { Icon, type IconName } from './Icon'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'danger-outline'
  | 'accent-outline'
  | 'ghost'
  | 'dashed'
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const base =
  'inline-flex items-center justify-center gap-2 rounded-pill font-semibold text-center transition ' +
  'disabled:cursor-not-allowed disabled:opacity-50'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-on-brand hover:brightness-107 hover:text-on-brand disabled:hover:brightness-100',
  secondary: 'border border-line-strong bg-bg text-ink hover:bg-soft hover:text-ink',
  danger: 'bg-error text-on-status hover:brightness-110 hover:text-on-status',
  'danger-outline': 'border border-error bg-bg text-error hover:bg-error-soft hover:text-error',
  'accent-outline': 'border-emph border-orange bg-bg text-ink hover:bg-soft hover:text-ink',
  ghost: 'bg-transparent text-accent-ink hover:bg-soft hover:text-ink',
  dashed: 'border-emph border-dashed border-line-strong bg-transparent text-accent-ink hover:bg-soft hover:text-ink',
}

const sizes: Record<ButtonSize, string> = {
  xs: 'min-h-10 text-body-sm',
  sm: 'min-h-11 text-label-md',
  md: 'min-h-12 text-label-md',
  lg: 'min-h-13 text-label-md',
  xl: 'min-h-14 text-body-md',
}

const paddings: Record<ButtonSize, string> = {
  xs: 'px-4',
  sm: 'px-5',
  md: 'px-6',
  lg: 'px-7',
  xl: 'px-8',
}

type CommonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Leading icon */
  icon?: IconName
  /** Trailing icon */
  iconRight?: IconName
  iconSize?: number
  /** Orange glow under primary buttons */
  glow?: boolean
  /** Full width */
  block?: boolean
  /** `tight`: text buttons inside lists · `none`: inline with text */
  pad?: 'default' | 'tight' | 'none'
  className?: string
  children?: ReactNode
}

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & { to?: undefined }
type ButtonAsLink = CommonProps & Omit<LinkProps, keyof CommonProps> & { to: LinkProps['to'] }

export type ButtonProps = ButtonAsButton | ButtonAsLink

function buttonClasses({
  variant = 'primary',
  size = 'md',
  glow = false,
  block = false,
  pad = 'default',
  className,
}: Pick<CommonProps, 'variant' | 'size' | 'glow' | 'block' | 'pad' | 'className'>) {
  const padding = pad === 'tight' ? 'px-3.5' : pad === 'none' ? 'px-0' : paddings[size]
  return cx(base, variants[variant], sizes[size], padding, glow && 'shadow-primary', block && 'flex w-full', className)
}

export function Button(props: ButtonProps) {
  const { variant, size, icon, iconRight, iconSize = 18, glow, block, pad, className, children, ...rest } = props
  const classes = buttonClasses({ variant, size, glow, block, pad, className })
  const content = (
    <>
      {icon && <Icon name={icon} size={iconSize} />}
      {children}
      {iconRight && <Icon name={iconRight} size={iconSize} />}
    </>
  )

  if (rest.to !== undefined) {
    return (
      <Link {...(rest as LinkProps)} className={classes}>
        {content}
      </Link>
    )
  }
  const { type = 'button', ...buttonRest } = rest as ButtonHTMLAttributes<HTMLButtonElement>
  return (
    <button type={type} {...buttonRest} className={classes}>
      {content}
    </button>
  )
}
