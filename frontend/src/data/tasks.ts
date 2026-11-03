import { paths } from '../routes'
import type { DeadlineState, ProcedureKind, ProcedureStep } from './types'

/* ---------- E02 · Caixa de tarefas (Rui) ---------- */

export type InboxTask = {
  id: string
  kind: ProcedureKind
  title: string
  meta: string
  deadline: string
  deadlineState: DeadlineState
  /** Only AC-2026-0147 has a review screen in the mockup */
  to?: string
  tag?: string
  highlight?: boolean
}

export type QueueTask = {
  id: string
  kind: ProcedureKind
  title: string
  since: string
  autoAssign: string
  deadline: string
}

export const myTasks: InboxTask[] = [
  {
    id: 'HE-2026-0088',
    kind: 'HE',
    title: 'Horas extraordinárias · João Neves',
    meta: 'HE-2026-0088 · Validação da chefia · recebida a 01/10/2026',
    deadline: 'Em atraso há 2 dias',
    deadlineState: 'late',
  },
  {
    id: 'AC-2026-0147',
    kind: 'AC',
    title: 'Ajudas de custo · Ana Ferreira',
    meta: 'AC-2026-0147 · Validação da chefia · recebida a 08/10/2026',
    deadline: 'Faltam 3 dias',
    deadlineState: 'soon',
    to: paths.review,
    highlight: true,
  },
  {
    id: 'FE-2026-0021',
    kind: 'FE',
    title: 'Formação externa · Ana Ferreira',
    meta: 'FE-2026-0021 · Validação da chefia · recebida a 09/10/2026',
    deadline: 'Faltam 4 dias',
    deadlineState: 'ok',
  },
  {
    id: 'PF-2026-0310',
    kind: 'PF',
    title: 'Pedido de férias · Carla Dias',
    meta: 'PF-2026-0310 · ninguém a assumiu em 1 dia útil; atribuída a 10/10/2026 por ter menos tarefas do que a média',
    deadline: 'Faltam 5 dias',
    deadlineState: 'ok',
    tag: 'Atribuída automaticamente',
  },
  {
    id: 'AC-2026-0151',
    kind: 'AC',
    title: 'Ajudas de custo · Paulo Reis',
    meta: 'AC-2026-0151 · Validação da chefia · recebida a 10/10/2026',
    deadline: 'Faltam 5 dias',
    deadlineState: 'ok',
  },
]

/** The task Marta Lopes wants to hand over, once accepted */
export const transferredTask: InboxTask = {
  id: 'AC-2026-0158',
  kind: 'AC',
  title: 'Ajudas de custo · Bruno Matias',
  meta: 'AC-2026-0158 · Validação da chefia · transferida hoje por Marta Lopes',
  deadline: 'Faltam 6 dias',
  deadlineState: 'ok',
  tag: 'Transferida para si',
}

export const groupQueue: QueueTask[] = [
  {
    id: 'AC-2026-0149',
    kind: 'AC',
    title: 'Ajudas de custo · Sofia Lemos',
    since: 'na fila desde 09/10/2026, 11:30',
    autoAssign: 'Atribuição automática dentro de 2 horas, se ninguém assumir',
    deadline: 'Faltam 4 dias',
  },
  {
    id: 'HE-2026-0091',
    kind: 'HE',
    title: 'Horas extraordinárias · Inês Couto',
    since: 'na fila desde 09/10/2026, 14:05',
    autoAssign: 'Atribuição automática hoje às 14:05, se ninguém assumir',
    deadline: 'Faltam 5 dias',
  },
  {
    id: 'PF-2026-0312',
    kind: 'PF',
    title: 'Pedido de férias · Miguel Santos',
    since: 'na fila desde 10/10/2026, 08:10',
    autoAssign: 'Atribuição automática amanhã às 08:10, se ninguém assumir',
    deadline: 'Faltam 5 dias',
  },
]

export type PersonalRequest = {
  id: 'transfer' | 'substitute'
  initials: string
  title: string
  detail: string
  reason?: string
  note: string
  accepted: string
  declined: string
}

export const personalRequests: PersonalRequest[] = [
  {
    id: 'transfer',
    initials: 'ML',
    title: 'Marta Lopes quer transferir-lhe uma tarefa',
    detail: 'Ajudas de custo · Bruno Matias · AC-2026-0158 · Validação da chefia · faltam 6 dias',
    reason: 'vou estar ausente a partir de amanhã.',
    note: 'Se aceitar, a tarefa passa para si com o mesmo prazo. Até lá continua com a Marta.',
    accepted: 'Aceitou. A tarefa está agora em «Atribuídas a mim».',
    declined: 'Recusou. A Marta Lopes foi avisada e a tarefa continua com ela.',
  },
  {
    id: 'substitute',
    initials: 'PR',
    title: 'Paulo Reis pede-lhe que o substitua durante uma ausência',
    detail: 'De 20/10/2026, 09:00 a 23/10/2026, 18:00 · as tarefas que lhe chegarem nesse período vêm para si',
    note: 'A substituição só começa se aceitar. O motivo da ausência não é partilhado.',
    accepted: 'Aceitou substituir Paulo Reis de 20/10 a 23/10.',
    declined: 'Recusou. O Paulo Reis foi avisado e pode escolher outro substituto.',
  },
]

/** Banner shown on the inbox after deciding on AC-2026-0147 */
export type ReviewDecision = 'aprovado' | 'devolvido' | 'rejeitado'

export const decisionBanner: Record<ReviewDecision, { title: string; text: string }> = {
  aprovado: {
    title: 'AC-2026-0147 aprovado e assinado',
    text: 'Seguiu para a Divisão Financeira e a Ana Ferreira foi notificada. Estas são as tarefas que ainda tem para rever.',
  },
  devolvido: {
    title: 'AC-2026-0147 devolvido à Ana Ferreira',
    text: 'Volta para correção, com as suas notas. Estas são as tarefas que ainda tem para rever.',
  },
  rejeitado: {
    title: 'AC-2026-0147 rejeitado',
    text: 'O procedimento terminou e a Ana Ferreira foi notificada do motivo. Estas são as tarefas que ainda tem para rever.',
  },
}

/* ---------- E02b · Caixa de tarefas (RH) ---------- */

export type HrTask = InboxTask & { conflict?: string }

export const hrTasks: HrTask[] = [
  {
    id: 'AC-2026-0122',
    kind: 'AC',
    title: 'Ajudas de custo · Pedro Sousa',
    meta: 'AC-2026-0122 · Validação final · recebida a 07/10/2026',
    deadline: 'Faltam 6 dias',
    deadlineState: 'ok',
    to: paths.finalValidation,
    highlight: true,
  },
  {
    id: 'FE-2026-0019',
    kind: 'FE',
    title: 'Formação externa · Tiago Mendes',
    meta: 'FE-2026-0019 · Validação final · recebida a 09/10/2026',
    deadline: 'Faltam 8 dias',
    deadlineState: 'ok',
    tag: 'Datas em conflito',
    conflict:
      'Detetado automaticamente: o certificado indica 21/09/2026 e a formação foi pedida para 21–22/09/2026.',
  },
]

/* ---------- E08 · Rever documento ---------- */

export const reviewSteps: ProcedureStep[] = [
  { label: 'Pedido', meta: 'Ana Ferreira · assinado a 08/10' },
  { label: 'Validação da chefia', meta: 'Você · desde 09/10' },
  { label: 'Verificação financeira', meta: 'Divisão Financeira' },
  { label: 'Validação final', meta: 'RH · Formação' },
]

export const reviewRequester = [
  { label: 'Nome', value: 'Ana Ferreira' },
  { label: 'Unidade orgânica', value: 'Divisão de Obras Municipais' },
  { label: 'NIF', value: '2•• ••• 418', numeric: true },
  { label: 'IBAN', value: 'PT50 •••• •••• •••• 9015 4', numeric: true },
]

export const reviewExpenses = [
  { type: 'Ajudas de custo · 2 dias', date: '01–02/10/2026', amount: '95,30 €' },
  { type: 'Comboio · Aveiro – Lisboa', date: '01/10/2026', amount: '24,10 €' },
  { type: 'Alojamento · 1 noite', date: '01/10/2026', amount: '68,00 €' },
]

export const reviewAttachments = [
  { name: 'certificado_presenca.pdf', meta: '96 KB · acrescentado a 08/10/2026' },
  { name: 'bilhete_comboio.pdf', meta: '184 KB' },
  { name: 'fatura_hotel.pdf', meta: '212 KB' },
]

export const reviewHistory = [
  { when: '08/10 · 16:02', text: 'Ana Ferreira submeteu e assinou com a Chave Móvel Digital' },
  { when: '08/10 · 16:02', text: 'Atribuído à fila Chefia · Divisão de Obras Municipais' },
  { when: '09/10 · 09:15', text: 'Rui Matos assumiu a tarefa' },
  { when: 'Agora', text: 'Aguarda a sua decisão', now: true },
]

export const approvalSummary = [
  { label: 'Pedido', value: 'AC-2026-0147 · Ajudas de custo' },
  { label: 'Requerente', value: 'Ana Ferreira' },
  { label: 'Total', value: '187,40 €' },
  { label: 'Segue para', value: 'Divisão Financeira' },
]

export const colleagues = [
  { id: 'paulo', name: 'Paulo Reis', load: '4 tarefas abertas · abaixo da média do grupo (5)' },
  { id: 'marta', name: 'Marta Lopes', load: '6 tarefas abertas · acima da média do grupo (5)' },
]

/* ---------- E09 · Rejeitar documento ---------- */

export type RejectReason = { id: string; label: string; correctable: boolean }

/** Reasons defined in the "Ajudas de custo" workflow */
export const rejectReasons: RejectReason[] = [
  { id: 'incorreto', label: 'Preenchido incorretamente', correctable: true },
  { id: 'comprovativo', label: 'Falta documento comprovativo', correctable: true },
  { id: 'naoAutorizada', label: 'Deslocação não autorizada', correctable: false },
  { id: 'prazo', label: 'Fora do prazo legal', correctable: false },
]

/* ---------- E10 · Validação final ---------- */

export const finalSteps: ProcedureStep[] = [
  { label: 'Pedido', meta: 'Pedro Sousa · 18/09' },
  { label: 'Validação da chefia', meta: 'Rui Matos · 22/09' },
  { label: 'Verificação financeira', meta: 'Carla Dias · 07/10' },
  { label: 'Validação final', meta: 'Você' },
]

export const finalChecks = [
  {
    title: 'Certificado de presença anexado',
    detail: 'Ação de formação «Segurança em obra», 15–16/09/2026',
    link: 'Abrir certificado',
  },
  { title: 'Valores verificados pela Divisão Financeira', detail: 'Carla Dias · assinado a 07/10/2026' },
  {
    title: 'As datas da deslocação coincidem com o certificado',
    detail: 'Pedido: 15–16/09/2026 · Certificado, indicado pelo requerente: 15–16/09/2026',
    auto: true,
  },
]

export const refundOrder = {
  requester: 'AC-2026-0122 · Pedro Sousa',
  lines: [
    { label: 'Ajudas de custo · 2 dias', value: '95,30 €' },
    { label: 'Transporte', value: '18,40 €' },
    { label: 'Refeições', value: '28,80 €' },
  ],
  total: '142,50 €',
  signatures: [
    { step: 'Requerente', signed: true },
    { step: 'Chefia', signed: true },
    { step: 'Div. Financeira', signed: true },
    { step: 'Validação final', signed: false },
  ],
  facts: [
    { label: 'Total', value: '142,50 €' },
    { label: 'Workflow', value: 'Ajudas de custo · v4' },
    { label: 'Regras', value: 'em vigor a 18/09/2026' },
  ],
}
