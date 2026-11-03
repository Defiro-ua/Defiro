import { cx } from '../lib/cx'
import { Icon, type IconName } from './Icon'

type TileSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl'
type TileTone = 'soft' | 'bg' | 'muted' | 'success' | 'error'

const sizes: Record<TileSize, { box: string; radius: string; icon: number }> = {
  sm: { box: 'size-8', radius: 'rounded-sm', icon: 18 },
  md: { box: 'size-10', radius: 'rounded-tile', icon: 20 },
  lg: { box: 'size-12', radius: 'rounded-md', icon: 22 },
  xl: { box: 'size-13', radius: 'rounded-md', icon: 24 },
  '2xl': { box: 'size-18', radius: 'rounded-lg', icon: 32 },
}

const tones: Record<TileTone, string> = {
  soft: 'bg-soft text-accent-ink',
  bg: 'bg-bg text-accent-ink',
  muted: 'bg-soft text-ink-3',
  success: 'bg-success-soft text-success',
  error: 'bg-error-soft text-error',
}

type IconTileProps = {
  icon: IconName
  size?: TileSize
  tone?: TileTone
  round?: boolean
  strokeWidth?: number
  className?: string
}

/** Decorative icon on a tinted square (or circle). */
export function IconTile({ icon, size = 'lg', tone = 'soft', round, strokeWidth, className }: IconTileProps) {
  const s = sizes[size]
  return (
    <span
      aria-hidden="true"
      className={cx('grid shrink-0 place-items-center', s.box, round ? 'rounded-full' : s.radius, tones[tone], className)}
    >
      <Icon name={icon} size={s.icon} strokeWidth={strokeWidth} />
    </span>
  )
}
