import logo from '../assets/logo-defiro.png'
import logoWhite from '../assets/logo-defiro-branco.png'
import { cx } from '../lib/cx'

type LogoProps = {
  /** `white` for dark grounds (footer) */
  variant?: 'color' | 'white'
  alt?: string
  className?: string
}

export function Logo({ variant = 'color', alt = 'defiro', className }: LogoProps) {
  return (
    <img
      src={variant === 'white' ? logoWhite : logo}
      alt={alt}
      width={800}
      height={247}
      className={cx('block w-auto', className)}
    />
  )
}
