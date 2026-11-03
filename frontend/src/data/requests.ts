import type { IconName } from '../components/Icon'
import type { MiniStepState } from '../components/MiniProgress'
import type { FileItem } from '../components/FileList'
import { paths } from '../routes'
import type { ProcedureStep, RequestStatus } from './types'

/* ---------- E03 · Novo pedido ---------- */

export type Procedure = {
  id: string
  title: string
  description: string
  needs: string
  icon: IconName
  /** Only "Ajudas de custo" has a form in the mockup */
  to?: string
}

export const savedDraft = {
  title: 'Ajudas de custo · Reunião em Coimbra',
  meta: 'Guardado a 09/10/2026 às 18:40 · 3 de 6 secções preenchidas',
}

export const procedures: Procedure[] = [
  {
    id: 'AC',
    title: 'Ajudas de custo',
    description: 'Reembolso de despesas de deslocação em serviço: transporte, alojamento e refeições.',
    needs: 'Vai precisar de: faturas, bilhetes e certificado de presença.',
    icon: 'briefcase',
    to: paths.requestForm,
  },
  {
    id: 'HE',
    title: 'Horas extraordinárias',
    description: 'Registo e pagamento de trabalho suplementar.',
    needs: 'Vai precisar de: registo de horas validado pela chefia.',
    icon: 'clock',
  },
  {
    id: 'PF',
    title: 'Pedido de férias',
    description: 'Marcação de dias de férias, com validação da chefia.',
    needs: 'Vai precisar de: as datas pretendidas.',
    icon: 'calendar',
  },
  {
    id: 'FE',
    title: 'Formação externa',
    description: 'Inscrição numa ação de formação fora da Câmara.',
    needs: 'Vai precisar de: programa e custo da formação.',
    icon: 'graduationCap',
  },
]

/* ---------- E04 · Formulário do pedido ---------- */

export const requestSteps: ProcedureStep[] = [
  { label: 'Pedido', meta: 'Ana Ferreira' },
  { label: 'Validação da chefia', meta: 'Chefias da unidade' },
  { label: 'Verificação financeira', meta: 'Divisão Financeira' },
  { label: 'Validação final', meta: 'RH · Formação' },
]

export const requesterProfile = [
  { label: 'Nome', value: 'Ana Ferreira' },
  { label: 'Unidade orgânica', value: 'Divisão de Obras Municipais' },
  { label: 'Cargo', value: 'Técnica Superior' },
  { label: 'Chefia direta', value: 'Rui Matos' },
]

export const tripReasons = ['Formação', 'Reunião', 'Serviço externo']
export const transportOptions = ['Viatura própria', 'Transportes públicos', 'Viatura municipal']

export type Expense = { id: string; type: string; date: string; amount: string }

export const initialExpenses: Expense[] = [
  { id: 'e1', type: 'Comboio · Aveiro – Lisboa', date: '01/10/2026', amount: '24,10 €' },
  { id: 'e2', type: 'Alojamento · 1 noite', date: '01/10/2026', amount: '68,00 €' },
]

export const initialAttachments: FileItem[] = [
  { name: 'bilhete_comboio.pdf', meta: '184 KB' },
  { name: 'fatura_hotel.pdf', meta: '212 KB' },
]

export const estimate = {
  lines: [
    { label: 'Ajudas de custo · 2 dias', value: '95,30 €' },
    { label: 'Transporte', value: '24,10 €' },
    { label: 'Alojamento', value: '68,00 €' },
  ],
  total: '187,40 €',
  note: 'Calculado com as regras em vigor a 10/10/2026. O valor final é confirmado pela Divisão Financeira.',
}

/** Checklist items that are always complete in the mockup */
export const completedChecks = ['Os seus dados', 'NIF e IBAN', 'Despesas', 'Faturas e bilhetes']

/* ---------- E05 · Assinar com CMD ---------- */

export const signSummary = {
  title: 'Pedido AC-2026-0147 · Ajudas de custo',
  rows: [
    { label: 'Requerente', value: 'Ana Ferreira' },
    { label: 'Total', value: '187,40 €' },
    { label: 'Anexos', value: '3 ficheiros' },
  ],
}

export const signedSteps: ProcedureStep[] = [
  { label: 'Pedido', meta: 'Ana Ferreira · 08/10' },
  { label: 'Validação da chefia', meta: 'Chefias da unidade' },
  { label: 'Verificação financeira', meta: 'Divisão Financeira' },
  { label: 'Validação final', meta: 'RH · Formação' },
]

/* ---------- E06 · Os meus pedidos ---------- */

export type MyRequestAction =
  | { kind: 'primary' | 'secondary'; label: string; to?: string; icon?: IconName }
  | { kind: 'link'; label: string }

export type MyRequest = {
  id: string
  title: string
  status: RequestStatus
  meta: string
  /** One line about where the request is; `holder` is shown in bold */
  detail: string | { holder: string; since: string; deadline: string }
  progress?: { steps: MiniStepState[]; label: string }
  deadline?: string
  action?: MyRequestAction
  moreActions?: boolean
  /** The requester can still withdraw it */
  withdrawable?: boolean
  draft?: boolean
}

export const myRequests: MyRequest[] = [
  {
    id: 'AC-2026-0147',
    title: 'Ajudas de custo · Formação em Contratação Pública',
    status: 'returned',
    meta: 'AC-2026-0147 · submetido a 08/10/2026',
    detail: 'Rui Matos devolveu-o a 10/10/2026 com 2 notas: corrija e volte a enviar.',
    progress: { steps: ['nowWarning', 'todo', 'todo', 'todo'], label: 'Passo 1 de 4: Pedido' },
    action: { kind: 'primary', label: 'Corrigir', to: paths.correct },
    moreActions: true,
  },
  {
    id: 'HE-2026-0079',
    title: 'Horas extraordinárias · setembro',
    status: 'review',
    meta: 'HE-2026-0079 · submetido a 02/10/2026',
    detail: { holder: 'Divisão Financeira', since: '07/10/2026', deadline: '17/10/2026' },
    progress: { steps: ['done', 'done', 'now', 'todo'], label: 'Passo 3 de 4: Verificação financeira' },
    deadline: 'Faltam 7 dias',
    moreActions: true,
    withdrawable: true,
  },
  {
    id: 'FE-2026-0021',
    title: 'Formação externa · Excel avançado',
    status: 'review',
    meta: 'FE-2026-0021 · submetido a 09/10/2026',
    detail: { holder: 'Rui Matos', since: '09/10/2026', deadline: '14/10/2026' },
    progress: { steps: ['done', 'now', 'todo'], label: 'Passo 2 de 3: Validação da chefia' },
    deadline: 'Faltam 4 dias',
    moreActions: true,
  },
  {
    id: 'AC-2026-0102',
    title: 'Ajudas de custo · Visita técnica ao Porto',
    status: 'done',
    meta: 'AC-2026-0102 · concluído a 30/09/2026',
    detail: 'Arquivado. O pagamento é tratado pela Divisão Financeira.',
    progress: { steps: ['done', 'done', 'done', 'done'], label: 'Todos os 4 passos concluídos' },
    action: { kind: 'secondary', label: 'Ordem de reembolso', icon: 'download' },
    moreActions: true,
  },
  {
    id: 'AC-2026-0095',
    title: 'Ajudas de custo · Visita a obra em Ílhavo',
    status: 'rejected',
    meta: 'AC-2026-0095 · rejeitado a 22/09/2026',
    detail: 'Motivo: Deslocação não autorizada (Rui Matos).',
    progress: { steps: ['done', 'rejected', 'faded', 'faded'], label: 'Rejeitado no passo 2 de 4' },
    action: { kind: 'link', label: 'Ver histórico' },
  },
  {
    id: 'rascunho',
    title: 'Ajudas de custo · Reunião em Coimbra',
    status: 'draft',
    meta: 'Guardado a 09/10/2026 às 18:40 · ainda não submetido',
    detail: '',
    action: { kind: 'secondary', label: 'Continuar', to: paths.requestForm },
    moreActions: true,
    draft: true,
  },
]

/* ---------- E07 · Corrigir pedido devolvido ---------- */

export const correctionSteps: ProcedureStep[] = [
  { label: 'Pedido', meta: 'Ana Ferreira · a corrigir' },
  { label: 'Validação da chefia', meta: 'Rui Matos' },
  { label: 'Verificação financeira', meta: 'Divisão Financeira' },
  { label: 'Validação final', meta: 'RH · Formação' },
]

export const returnNotice = {
  title: 'Rui Matos devolveu este pedido a 10/10/2026 · Motivo: Preenchido incorretamente',
  quote:
    '«A data de regresso não bate certo com o certificado. Junte também o certificado de presença com o carimbo da entidade formadora.»',
}

export const reviewerNotes = [
  { field: 'Regresso', anchor: 'campo-regresso', text: 'Indicou 03/10; o certificado diz 02/10.' },
  { field: 'Anexos', anchor: 'campo-anexos', text: 'Falta o certificado de presença.' },
]

export const correctionAttachments: FileItem[] = [
  { name: 'bilhete_comboio.pdf', meta: '184 KB' },
  { name: 'fatura_hotel.pdf', meta: '212 KB' },
  { name: 'certificado_presenca.pdf', meta: '96 KB · acabado de juntar' },
]
