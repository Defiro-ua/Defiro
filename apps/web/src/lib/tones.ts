import type { IconName } from '../components/Icon'
import type { Tone } from '../domain/types'

/** Icon of a status: check, back arrow, cross or clock */
export const toneIcon: Record<Tone, IconName> = { ok: 'check', warn: 'reset', bad: 'x', info: 'clock', neutro: 'clock' }
