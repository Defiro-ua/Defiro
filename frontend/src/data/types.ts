import type { ChipTone } from '../components/Chip'
import type { IconName } from '../components/Icon'

export type PersonaId = 'ana' | 'rui' | 'joana' | 'sofia' | 'helena'

export type Persona = {
  id: PersonaId
  name: string
  firstName: string
  initials: string
  jobTitle: string
  /** Role in the demo ("Ver como" menu) */
  role: string
  roleDescription: string
  /** First screen for this persona */
  home: string
}

export type NotificationKind = 'task' | 'deadline' | 'ok' | 'info'

export type AppNotification = {
  kind: NotificationKind
  title: string
  detail?: string
  when: string
  unread: boolean
  to: string
  action?: string
}

export type ProcedureStep = { label: string; meta?: string }

/** Kind of procedure, shown as the icon of its tile */
export type ProcedureKind = 'AC' | 'HE' | 'FE' | 'PF'

export const procedureIcon: Record<ProcedureKind, IconName> = {
  AC: 'briefcase',
  HE: 'clock',
  FE: 'graduationCap',
  PF: 'calendar',
}

/** Deadline chips: overdue, close, fine */
export type DeadlineState = 'late' | 'soon' | 'ok' | 'paused'

export const deadlineTone: Record<DeadlineState, ChipTone> = {
  late: 'error',
  soon: 'warning',
  ok: 'neutral',
  paused: 'muted',
}

/** States a request or task can be in, as shown in chips */
export type RequestStatus = 'draft' | 'review' | 'returned' | 'done' | 'rejected' | 'withdrawn'

export const statusChip: Record<RequestStatus, { label: string; tone: ChipTone }> = {
  draft: { label: 'Rascunho', tone: 'neutral' },
  review: { label: 'Em análise', tone: 'info' },
  returned: { label: 'Devolvido para correção', tone: 'warning' },
  done: { label: 'Concluído', tone: 'success' },
  rejected: { label: 'Rejeitado', tone: 'error' },
  withdrawn: { label: 'Retirado', tone: 'neutral' },
}
