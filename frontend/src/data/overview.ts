import type { DeadlineState } from './types'

export type GroupId = 'dom' | 'fin' | 'rh'

export type Group = {
  name: string
  /** Average open tasks per person, as written in the UI */
  average: string
  members: Array<{ name: string; open: number; absent?: string }>
}

export const groups: Record<GroupId, Group> = {
  dom: {
    name: 'Chefia · Divisão de Obras Municipais',
    average: '5',
    members: [
      { name: 'Paulo Reis', open: 4 },
      { name: 'Rui Matos', open: 5 },
      { name: 'Marta Lopes', open: 6 },
    ],
  },
  fin: {
    name: 'Divisão Financeira',
    average: '5',
    members: [
      { name: 'André Silva', open: 3 },
      { name: 'Sara Pinto', open: 4 },
      { name: 'Diogo Marques', open: 5 },
      { name: 'Teresa Rocha', open: 5 },
      { name: 'Luís Pereira', open: 6 },
      { name: 'Carla Dias', open: 7 },
    ],
  },
  rh: {
    name: 'RH · Formação',
    average: '3,5',
    members: [
      { name: 'Joana Pires', open: 2 },
      { name: 'Inês Moura', open: 3 },
      { name: 'Pedro Costa', open: 4 },
      { name: 'Rita Gomes', open: 5, absent: 'Ausente desde 08/10, sem substituto' },
    ],
  },
}

export type Blocker = {
  kind: string
  since: string
  action: 'assign' | 'remind'
  reason: string
  howTo: string
}

export type OverviewTask = {
  id: string
  name: string
  step: string
  /** Current holder ('' = nobody) */
  holder: string
  group?: GroupId
  deadline: string
  deadlineState: DeadlineState
  note?: string
  /** Waiting in the group queue: when it will be assigned automatically */
  queue?: string
  /** With the requester: nothing to assign */
  withRequester?: boolean
  blocker?: Blocker
}

export const overviewTasks: OverviewTask[] = [
  {
    id: 'FE-2026-0017',
    name: 'Formação externa · Carlos Nunes',
    step: 'Validação final',
    holder: 'Rita Gomes',
    group: 'rh',
    deadline: '1 dia de atraso',
    deadlineState: 'late',
    note: 'Ausente desde 08/10',
    blocker: {
      kind: 'Ausente sem substituto',
      since: 'Parado há 2 dias',
      action: 'assign',
      reason: 'Rita Gomes está ausente desde 08/10 e não indicou quem a substitui. A tarefa ficou na caixa dela.',
      howTo: 'Atribua a tarefa a outra pessoa de RH · Formação. A Rita é avisada quando voltar.',
    },
  },
  {
    id: 'HE-2026-0095',
    name: 'Horas extraordinárias · Nuno Prata',
    step: 'Validação da chefia',
    holder: '',
    group: 'dom',
    deadline: 'Faltam 2 dias',
    deadlineState: 'soon',
    note: 'Sem unidade definida',
    blocker: {
      kind: 'Sem unidade definida',
      since: 'Parado há 3 dias',
      action: 'assign',
      reason:
        'O requerente não tem unidade orgânica indicada no Microsoft Entra ID, por isso o sistema não sabe para que fila de chefias enviar a tarefa.',
      howTo:
        'Atribua a tarefa a uma chefia da Divisão de Obras Municipais, onde o requerente trabalha, e peça aos Recursos Humanos que corrijam a unidade no Entra ID.',
    },
  },
  {
    id: 'AC-2026-0133',
    name: 'Ajudas de custo · Hugo Sá',
    step: 'Correção pelo requerente',
    holder: 'Hugo Sá',
    deadline: 'Prazo suspenso',
    deadlineState: 'paused',
    note: 'Requerente',
    withRequester: true,
    blocker: {
      kind: 'À espera do requerente',
      since: 'Parado há 10 dias',
      action: 'remind',
      reason: 'Foi devolvido para correção a 30/09 por falta de comprovativo e o requerente ainda não respondeu.',
      howTo: 'Envie um lembrete ao requerente. Enquanto o pedido está com ele, o prazo do passo não conta.',
    },
  },
  { id: 'HE-2026-0088', name: 'Horas extraordinárias · João Neves', step: 'Validação da chefia', holder: 'Rui Matos', group: 'dom', deadline: '2 dias de atraso', deadlineState: 'late', note: 'Chefia · Divisão de Obras Municipais' },
  { id: 'AC-2026-0128', name: 'Ajudas de custo · Luísa Faria', step: 'Verificação financeira', holder: 'Carla Dias', group: 'fin', deadline: '1 dia de atraso', deadlineState: 'late', note: 'Divisão Financeira' },
  { id: 'AC-2026-0149', name: 'Ajudas de custo · Sofia Lemos', step: 'Validação da chefia', holder: '', group: 'dom', deadline: 'Faltam 4 dias', deadlineState: 'ok', queue: 'atribuição automática dentro de 2 horas' },
  { id: 'HE-2026-0091', name: 'Horas extraordinárias · Inês Couto', step: 'Validação da chefia', holder: '', group: 'dom', deadline: 'Faltam 5 dias', deadlineState: 'ok', queue: 'atribuição automática hoje às 14:05' },
  { id: 'PF-2026-0312', name: 'Pedido de férias · Miguel Santos', step: 'Validação da chefia', holder: '', group: 'dom', deadline: 'Faltam 5 dias', deadlineState: 'ok', queue: 'atribuição automática amanhã às 08:10' },
  { id: 'AC-2026-0146', name: 'Ajudas de custo · Filipe Antunes', step: 'Verificação financeira', holder: '', group: 'fin', deadline: 'Faltam 8 dias', deadlineState: 'ok', queue: 'atribuição automática hoje às 15:40' },
  { id: 'AC-2026-0147', name: 'Ajudas de custo · Ana Ferreira', step: 'Validação da chefia', holder: 'Rui Matos', group: 'dom', deadline: 'Faltam 3 dias', deadlineState: 'soon', note: 'Chefia · Divisão de Obras Municipais' },
  { id: 'AC-2026-0158', name: 'Ajudas de custo · Bruno Matias', step: 'Validação da chefia', holder: 'Marta Lopes', group: 'dom', deadline: 'Faltam 6 dias', deadlineState: 'ok', note: 'Transferência pedida a Rui Matos' },
  { id: 'FE-2026-0019', name: 'Formação externa · Tiago Mendes', step: 'Validação final', holder: 'Joana Pires', group: 'rh', deadline: 'Faltam 8 dias', deadlineState: 'ok', note: 'RH · Formação' },
  { id: 'HE-2026-0090', name: 'Horas extraordinárias · Pedro Lima', step: 'Verificação financeira', holder: 'André Silva', group: 'fin', deadline: 'Faltam 7 dias', deadlineState: 'ok', note: 'Divisão Financeira' },
]

export const inProgressTotal = 38

/** Procedures in progress per workflow and step (`late` = how many are overdue) */
export const stepsByWorkflow = [
  { name: 'Ajudas de custo', steps: [{ name: 'Validação da chefia', n: 9, late: 0 }, { name: 'Verificação financeira', n: 5, late: 1 }, { name: 'Validação final', n: 3, late: 0 }] },
  { name: 'Horas extraordinárias', steps: [{ name: 'Validação da chefia', n: 7, late: 1 }, { name: 'Verificação financeira', n: 4, late: 0 }] },
  { name: 'Pedido de férias', steps: [{ name: 'Validação da chefia', n: 6, late: 0 }] },
  { name: 'Formação externa', steps: [{ name: 'Validação da chefia', n: 2, late: 0 }, { name: 'Validação final', n: 2, late: 1 }] },
]
