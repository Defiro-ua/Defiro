import type { ChipTone } from '../components/Chip'
import type { IconName } from '../components/Icon'

/* ---------- E12 · Workflows ---------- */

export type WorkflowRow = {
  name: string
  icon: IconName
  /** Retired or expired workflows are shown muted */
  inactive?: boolean
  versions: Array<{ label: string; tone: ChipTone; note?: string }>
  rules: string[]
  starters: string
  changedBy: string
  changedAt: string
  actions: Array<'edit' | 'continue' | 'versions'>
}

export const workflowRows: WorkflowRow[] = [
  {
    name: 'Ajudas de custo',
    icon: 'briefcase',
    versions: [
      { label: 'v4 em vigor', tone: 'success' },
      { label: 'v5 em aprovação', tone: 'info' },
    ],
    rules: ['Valor diário', 'Valor por km'],
    starters: 'Todos os trabalhadores',
    changedBy: 'Sofia Almeida',
    changedAt: '09/10/2026',
    actions: ['edit', 'versions'],
  },
  {
    name: 'Horas extraordinárias',
    icon: 'clock',
    versions: [
      { label: 'v2 em vigor', tone: 'success' },
      { label: 'v3 agendada · 01/11/2026', tone: 'accent' },
    ],
    rules: ['Pagamento de horas extra'],
    starters: 'Todos os trabalhadores',
    changedBy: 'Tiago Mendes',
    changedAt: '02/10/2026',
    actions: ['edit', 'versions'],
  },
  {
    name: 'Formação externa',
    icon: 'graduationCap',
    versions: [{ label: 'v1 em vigor', tone: 'success' }],
    rules: [],
    starters: 'Chefias',
    changedBy: 'Sofia Almeida',
    changedAt: '14/07/2026',
    actions: ['edit', 'versions'],
  },
  {
    name: 'Pedido de férias',
    icon: 'calendar',
    versions: [{ label: 'v1 em vigor', tone: 'success' }],
    rules: [],
    starters: 'Todos os trabalhadores',
    changedBy: 'Sofia Almeida',
    changedAt: '03/02/2026',
    actions: ['edit', 'versions'],
  },
  {
    name: 'Pedido de teletrabalho',
    icon: 'calendar',
    versions: [{ label: 'Rascunho', tone: 'neutral' }],
    rules: [],
    starters: 'Todos os trabalhadores',
    changedBy: 'Sofia Almeida',
    changedAt: '10/10/2026',
    actions: ['continue'],
  },
  {
    name: 'Requisição de material',
    icon: 'package',
    inactive: true,
    versions: [{ label: 'v3 · Retirado · 30/06/2026', tone: 'neutral', note: 'Terminado antes do previsto' }],
    rules: [],
    starters: '—',
    changedBy: 'Tiago Mendes',
    changedAt: '12/06/2026',
    actions: ['versions'],
  },
  {
    name: 'Mapa de férias 2026',
    icon: 'calendar',
    inactive: true,
    versions: [{ label: 'v1 · Expirado · 30/04/2026', tone: 'outline', note: 'Chegou à data de fim agendada' }],
    rules: [],
    starters: '—',
    changedBy: 'Sofia Almeida',
    changedAt: '15/01/2026',
    actions: ['versions'],
  },
]

/* ---------- E13 · Designer ---------- */

export type ReasonType = 'Corrigível' | 'Final'

export type DesignerStep = {
  id: string
  badge: string
  name: string
  line: string
  /** Position on the 800×640 canvas */
  x: number
  y: number
  width: number
  error?: boolean
  owner: string
  ownerNote: string
  deadlineDays?: string
  distribution: 'requester' | 'queue' | 'none'
  reasons: Array<{ name: string; type: ReasonType }>
  fields: string
  integration: string
  rules: string
}

export const designerSteps: DesignerStep[] = [
  {
    id: '1',
    badge: '1',
    name: 'Pedido',
    line: 'Requerente · todos',
    x: 280,
    y: 40,
    width: 240,
    owner: 'Requerente',
    ownerNote: 'Qualquer trabalhador pode iniciar este workflow.',
    distribution: 'requester',
    reasons: [],
    fields: '15',
    integration: 'Nenhuma',
    rules: 'Valor por quilómetro',
  },
  {
    id: '2',
    badge: '2',
    name: 'Validação da chefia',
    line: 'Chefias da unidade · 3 dias',
    x: 280,
    y: 168,
    width: 240,
    owner: 'Chefias da unidade do requerente',
    ownerNote: 'Vem do Microsoft Entra ID. Na Divisão de Obras Municipais são 3 chefias.',
    deadlineDays: '3',
    distribution: 'queue',
    reasons: [
      { name: 'Preenchido incorretamente', type: 'Corrigível' },
      { name: 'Falta documento comprovativo', type: 'Corrigível' },
      { name: 'Deslocação não autorizada', type: 'Final' },
      { name: 'Fora do prazo legal', type: 'Final' },
    ],
    fields: '2',
    integration: 'Nenhuma',
    rules: 'Nenhuma',
  },
  {
    id: '3',
    badge: '3',
    name: 'Verificação financeira',
    line: 'Divisão Financeira · 10 dias',
    x: 280,
    y: 296,
    width: 240,
    owner: 'Divisão Financeira',
    ownerNote: 'Grupo do Microsoft Entra ID · 6 pessoas',
    deadlineDays: '10',
    distribution: 'queue',
    reasons: [
      { name: 'Preenchido incorretamente', type: 'Corrigível' },
      { name: 'Falta documento comprovativo', type: 'Corrigível' },
      { name: 'Despesa não elegível', type: 'Final' },
    ],
    fields: '4',
    integration: 'Nenhuma',
    rules: 'Valor diário das ajudas de custo',
  },
  {
    id: '4',
    badge: '4',
    name: 'Validação final',
    line: 'RH · Formação · 10 dias',
    x: 280,
    y: 424,
    width: 240,
    owner: 'RH · Formação',
    ownerNote: 'Grupo do Microsoft Entra ID · 4 pessoas',
    deadlineDays: '10',
    distribution: 'queue',
    reasons: [
      { name: 'Falta o certificado de presença', type: 'Corrigível' },
      { name: 'Fora do prazo legal', type: 'Final' },
    ],
    fields: '1',
    integration: 'Nenhuma',
    rules: 'Nenhuma',
  },
  {
    id: 'parecer',
    badge: '!',
    name: 'Parecer jurídico',
    line: 'Sem ligação · sem responsável',
    x: 560,
    y: 40,
    width: 200,
    error: true,
    owner: 'Sem responsável',
    ownerNote: 'Escolha o grupo que dá o parecer e ligue o passo ao fluxo.',
    distribution: 'none',
    reasons: [],
    fields: '3',
    integration: 'Nenhuma',
    rules: 'Nenhuma',
  },
]

export const paletteItems: Array<{ label: string; icon: IconName; tone: 'soft' | 'success' | 'error' }> = [
  { label: 'Passo de pedido', icon: 'file', tone: 'soft' },
  { label: 'Passo de revisão', icon: 'eye', tone: 'soft' },
  { label: 'Validação final', icon: 'checkSquare', tone: 'soft' },
  { label: 'Integração', icon: 'plug', tone: 'soft' },
  { label: 'Fim · aprovado', icon: 'check', tone: 'success' },
  { label: 'Fim · rejeitado', icon: 'x', tone: 'error' },
]

export const workflowSummary = [
  { label: 'Quem pode iniciar', value: 'Todos os trabalhadores' },
  { label: 'Passos', value: '5, um deles por ligar' },
  { label: 'Prazo legal, somando os passos', value: 'Até 23 dias' },
  { label: 'Assinatura', value: 'Quem aprova assina com a Chave Móvel Digital' },
  { label: 'Regras de negócio', value: 'Valor diário das ajudas de custo · Valor por quilómetro' },
]

export const workflowRuleLinks = [
  {
    rule: 'Valor diário das ajudas de custo',
    current: 'v3 · desde 01/03/2026',
    next: undefined,
    step: '3 · Verificação financeira',
    purpose: 'Calcula as ajudas de custo por escalão',
  },
  {
    rule: 'Valor por quilómetro',
    current: 'v1 · desde 02/09/2024',
    next: 'v2 aprovada · por agendar',
    step: '1 · Pedido',
    purpose: 'Calcula as despesas com viatura própria',
  },
]

/* ---------- E14 · Formulário do passo ---------- */

export type ValueSource = 'req' | 'entra' | 'cmd'

export type FormFieldDef = {
  id: string
  label: string
  type: string
  source: ValueSource
  /** Attribute read from Entra ID or CMD */
  attribute?: string
  required: boolean
  isNew?: boolean
  options?: string[]
}

export const valueSources: Record<ValueSource, { name: string; short: string; tone: ChipTone; description: string }> = {
  req: { name: 'Preenchido pelo requerente', short: 'Requerente', tone: 'accent', description: 'Campo editável no pedido' },
  entra: { name: 'Microsoft Entra ID', short: 'Entra ID', tone: 'info', description: 'Vem do perfil municipal da pessoa' },
  cmd: { name: 'Chave Móvel Digital', short: 'CMD', tone: 'success', description: 'Vem da autenticação com a CMD' },
}

export const formSections: Array<{ name: string; fields: FormFieldDef[] }> = [
  {
    name: 'Os seus dados',
    fields: [
      { id: 'nome', label: 'Nome', type: 'Texto', source: 'entra', attribute: 'Nome a apresentar', required: true },
      { id: 'unidade', label: 'Unidade orgânica', type: 'Texto', source: 'entra', attribute: 'Departamento', required: true },
      { id: 'cargo', label: 'Cargo', type: 'Texto', source: 'entra', attribute: 'Cargo', required: true },
      { id: 'chefia', label: 'Chefia direta', type: 'Pessoa', source: 'entra', attribute: 'Gestor', required: true },
    ],
  },
  {
    name: 'Dados fiscais e bancários',
    fields: [
      { id: 'nif', label: 'NIF', type: 'Número', source: 'cmd', attribute: 'NIF', required: true },
      { id: 'iban', label: 'IBAN', type: 'IBAN', source: 'req', required: true },
    ],
  },
  {
    name: 'Deslocação',
    fields: [
      { id: 'motivo', label: 'Motivo', type: 'Escolha única', source: 'req', required: true, options: ['Formação', 'Reunião', 'Serviço externo'] },
      {
        id: 'pais',
        label: 'País de destino',
        type: 'Lista',
        source: 'req',
        required: true,
        isNew: true,
        options: ['Portugal (predefinido)', 'Espanha', 'França', 'Mais 246 países (ISO 3166)'],
      },
      { id: 'destino', label: 'Destino', type: 'Texto', source: 'req', required: true },
      { id: 'partida', label: 'Partida', type: 'Data e hora', source: 'req', required: true },
      { id: 'regresso', label: 'Regresso', type: 'Data e hora', source: 'req', required: true },
      {
        id: 'transporte',
        label: 'Transporte',
        type: 'Escolha única',
        source: 'req',
        required: true,
        options: ['Viatura própria', 'Transportes públicos', 'Viatura municipal'],
      },
    ],
  },
  {
    name: 'Despesas e anexos',
    fields: [
      { id: 'despesas', label: 'Despesas', type: 'Tabela', source: 'req', required: false },
      { id: 'anexos', label: 'Anexos', type: 'Ficheiros', source: 'req', required: true },
      { id: 'certificado', label: 'Datas no certificado de presença', type: 'Intervalo de datas', source: 'req', required: true },
    ],
  },
]

export const formSteps = [
  { n: '1', name: 'Pedido', fields: '15 campos', mark: { label: '1 alteração', tone: 'warning' as ChipTone }, active: true },
  { n: '2', name: 'Validação da chefia', fields: '2 campos' },
  { n: '3', name: 'Parecer jurídico', fields: '3 campos', mark: { label: 'Novo', tone: 'success' as ChipTone } },
  { n: '4', name: 'Verificação financeira', fields: '4 campos' },
  { n: '5', name: 'Validação final', fields: '1 campo' },
]

/* ---------- E15 · Submeter alteração ---------- */

export const v5Changes: Array<{ part: string; text: string; type: 'Novo' | 'Alterado' }> = [
  { part: 'Fluxo', text: 'Novo passo Parecer jurídico, só para deslocações ao estrangeiro', type: 'Novo' },
  { part: 'Fluxo', text: 'Prazo da Validação da chefia passa de 5 para 3 dias', type: 'Alterado' },
  { part: 'Formulários', text: 'Campo País de destino no formulário do Pedido', type: 'Novo' },
  { part: 'Formulários', text: 'Formulário do Parecer jurídico, com 3 campos', type: 'Novo' },
]

export const v5Description =
  'Acrescenta o parecer jurídico para deslocações ao estrangeiro, como pedido pelo gabinete jurídico, e reduz o prazo da chefia de 5 para 3 dias, para os reembolsos chegarem mais cedo à Divisão Financeira.'

export const approvalStages: Array<{ name: string; when: string; state: 'done' | 'current' | 'next' }> = [
  { name: 'Submetida por Sofia Almeida', when: '09/10/2026, 15:20', state: 'done' },
  { name: 'Em aprovação · Helena Costa', when: 'Agora', state: 'current' },
  { name: 'Aprovada', when: 'À espera', state: 'next' },
  { name: 'Agendada para entrar em vigor', when: 'Escolhe a data depois de aprovada', state: 'next' },
]

/* ---------- E16 · Aprovar alteração ---------- */

export type FlowNode = { n: string; name: string; note?: string; days?: string; change?: 'new' | 'changed'; changeLabel?: string }

export const v4Flow: FlowNode[] = [
  { n: '1', name: 'Pedido' },
  { n: '2', name: 'Validação da chefia', days: '5 dias' },
  { n: '3', name: 'Verificação financeira', days: '10 dias' },
  { n: '4', name: 'Validação final', days: '10 dias' },
]

export const v5Flow: FlowNode[] = [
  { n: '1', name: 'Pedido' },
  { n: '2', name: 'Validação da chefia', change: 'changed', changeLabel: '5 → 3 dias' },
  { n: '3', name: 'Parecer jurídico', note: 'Só deslocações ao estrangeiro', change: 'new', changeLabel: 'Novo' },
  { n: '4', name: 'Verificação financeira', days: '10 dias' },
  { n: '5', name: 'Validação final', days: '10 dias' },
]

export const approvalNotes = [
  {
    initials: 'HC',
    name: 'Helena Costa',
    when: '09/10/2026, 17:05',
    text: 'O parecer jurídico só se aplica a deslocações ao estrangeiro? Nas nacionais não deve aparecer.',
  },
  {
    initials: 'SA',
    name: 'Sofia Almeida',
    when: '10/10/2026, 09:12',
    text: 'Sim: a transição para o passo 3 só acontece quando o destino é fora de Portugal. Nas nacionais passa diretamente para a Verificação financeira.',
  },
]

export type PendingChange = {
  id: 'wf' | 'regra'
  kind: 'Workflow' | 'Regra'
  name: string
  who: string
  titleA: string
  titleB: string
  short: string
  submitted: string
}

export const pendingChanges: PendingChange[] = [
  {
    id: 'wf',
    kind: 'Workflow',
    name: 'Ajudas de custo · v5',
    who: 'Sofia Almeida · 09/10/2026',
    titleA: 'Ajudas de custo',
    titleB: 'v5',
    short: 'Ajudas de custo v5',
    submitted: '09/10/2026 às 15:20',
  },
  {
    id: 'regra',
    kind: 'Regra',
    name: 'Pagamento de horas extraordinárias · v3',
    who: 'Sofia Almeida · 10/10/2026',
    titleA: 'Pagamento de horas extraordinárias',
    titleB: 'v3',
    short: 'Pagamento de horas extraordinárias v3',
    submitted: '10/10/2026 às 16:40',
  },
]

export const overtimeRuleDiff = [
  { param: 'Dia útil · primeira hora', current: '+25 %', proposed: '+25 %' },
  { param: 'Dia útil · horas seguintes', current: '+37,5 %', proposed: '+37,5 %' },
  { param: 'Dia de descanso ou feriado', current: '+50 %', proposed: '+50 %' },
  { param: 'Máximo de horas por mês', current: '20 horas', proposed: '25 horas' },
  { param: 'Máximo em julho e agosto', current: '30 horas', proposed: '30 horas' },
]

/* ---------- E18 · Versões e agendamento ---------- */

export const startDates = [
  { date: '01/11/2026', note: 'Início do mês · sugerido' },
  { date: '16/10/2026', note: 'Daqui a 6 dias' },
  { date: '01/12/2026', note: 'Início de dezembro' },
]

export type VersionState = 'toSchedule' | 'scheduled' | 'live' | 'archived'

export const versionTone: Record<VersionState, ChipTone> = {
  toSchedule: 'success',
  scheduled: 'info',
  live: 'warning',
  archived: 'neutral',
}

export const olderVersions: Array<{ v: string; state: VersionState; label: string; period: string; summary: string }> = [
  {
    v: '4',
    state: 'live',
    label: 'Em vigor',
    period: 'Desde 02/03/2026 · 214 procedimentos, 12 em curso',
    summary: 'Assinatura com Chave Móvel Digital na validação da chefia.',
  },
  { v: '3', state: 'archived', label: 'Arquivada', period: '01/09/2025 – 01/03/2026 · 386 procedimentos', summary: 'Anexos obrigatórios no pedido.' },
  {
    v: '2',
    state: 'archived',
    label: 'Arquivada',
    period: '06/01/2025 – 31/08/2025 · 297 procedimentos',
    summary: 'Validação final passa para RH · Formação.',
  },
  {
    v: '1',
    state: 'archived',
    label: 'Arquivada',
    period: '02/09/2024 – 05/01/2025 · 151 procedimentos',
    summary: 'Primeira versão, migrada do processo em papel.',
  },
]

export const versionHistory = [
  { who: 'Helena Costa', initials: 'HC', action: 'aprovou a v5', note: '', when: '10/10, 11:05' },
  { who: 'Sofia Almeida', initials: 'SA', action: 'submeteu a v5 para aprovação', note: '4 alterações · aprovadora: Helena Costa', when: '09/10, 15:20' },
  { who: 'Sistema', initials: '·', action: 'pôs a v4 em vigor', note: 'Agendada por Tiago Mendes', when: '02/03, 00:00' },
  { who: 'Helena Costa', initials: 'HC', action: 'aprovou a v4', note: '', when: '18/02, 10:12' },
  { who: 'Tiago Mendes', initials: 'TM', action: 'submeteu a v4 para aprovação', note: '1 alteração · aprovadora: Helena Costa', when: '16/02, 17:40' },
]
