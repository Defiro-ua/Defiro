import { cx } from '../lib/cx'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type AvatarTone = 'brand' | 'neutral' | 'soft'

const sizes: Record<AvatarSize, string> = {
  xs: 'size-7 text-micro',
  sm: 'size-8 text-micro',
  md: 'size-9 text-caption',
  lg: 'size-10 text-label-sm',
  xl: 'size-11 text-body-sm',
}

const tones: Record<AvatarTone, string> = {
  brand: 'bg-brand text-on-brand font-extrabold',
  neutral: 'bg-line text-ink-2 font-extrabold',
  soft: 'bg-soft text-accent-ink font-semibold',
}

type AvatarProps = {
  initials: string
  size?: AvatarSize
  tone?: AvatarTone
  className?: string
}

/** Initials in a circle. Decorative: the person's name is always written next to it. */
export function Avatar({ initials, size = 'md', tone = 'brand', className }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cx('grid shrink-0 place-items-center rounded-full', sizes[size], tones[tone], className)}
    >
      {initials}
    </span>
  )
}
