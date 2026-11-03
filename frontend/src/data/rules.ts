import { paths } from '../routes'

/** Where a version of a rule is in its life cycle */
export type RulePhase = 'draft' | 'approval' | 'approved' | 'scheduled'

export type RuleParam = { name: string; current: string; next: string }

export type BusinessRule = {
  id: string
  name: string
  /** Version in force (0 = none yet) */
  liveVersion: number
  usedIn: Array<{ workflow: string; detail: string; to: string }>
  pending?: { version: number; phase: RulePhase; since: string }
  params: RuleParam[]
  changeNote?: string
  history: Array<{ v: string; period: string; who: string }>
}

export const rulePhaseLabel: Record<RulePhase, string> = {
  draft: 'em rascunho',
  approval: 'em aprovação',
  approved: 'aprovada · por agendar',
  scheduled: 'agendada',
}

/** Life cycle shown as a row of steps */
export const ruleLifecycle = ['Rascunho', 'Em aprovação', 'Aprovada', 'Agendada', 'Em vigor']
export const phaseIndex: Record<RulePhase, number> = { draft: 0, approval: 1, approved: 2, scheduled: 3 }

export const businessRules: BusinessRule[] = [
  {
    id: 'horas',
    name: 'Pagamento de horas extraordinárias',
    liveVersion: 2,
    usedIn: [{ workflow: 'Horas extraordinárias', detail: 'passo Validação da chefia · calcula o valor a pagar', to: paths.workflows }],
    pending: { version: 3, phase: 'approval', since: '10/10/2026' },
    params: [
      { name: 'Dia útil · primeira hora', current: '+25 %', next: '+25 %' },
      { name: 'Dia útil · horas seguintes', current: '+37,5 %', next: '+37,5 %' },
      { name: 'Dia de descanso ou feriado', current: '+50 %', next: '+50 %' },
      { name: 'Máximo de horas por mês', current: '20 horas', next: '25 horas' },
      { name: 'Máximo em julho e agosto', current: '30 horas', next: '30 horas' },
    ],
    history: [
      { v: 'v3', period: 'Em aprovação', who: 'Submetida por Sofia Almeida a 10/10/2026 · aprovadora: Helena Costa' },
      { v: 'v2', period: 'Em vigor desde 01/01/2026', who: 'Submetida por Tiago Mendes · aprovada por Helena Costa a 12/12/2025' },
      { v: 'v1', period: '01/01/2025 – 31/12/2025', who: 'Submetida por Tiago Mendes · aprovada por Helena Costa a 10/12/2024' },
    ],
  },
  {
    id: 'diario',
    name: 'Valor diário das ajudas de custo',
    liveVersion: 3,
    usedIn: [{ workflow: 'Ajudas de custo', detail: 'passo Verificação financeira · calcula as ajudas de custo por escalão', to: paths.versions }],
    params: [
      { name: 'Escalão A', current: '62,75 €', next: '63,90 €' },
      { name: 'Escalão B', current: '50,20 €', next: '50,20 €' },
      { name: 'Escalão C', current: '46,86 €', next: '46,86 €' },
    ],
    changeNote: 'Atualiza o valor diário do escalão A.',
    history: [
      { v: 'v3', period: 'Em vigor desde 01/03/2026', who: 'Submetida por Sofia Almeida · aprovada por Helena Costa a 20/02/2026' },
      { v: 'v2', period: '01/01/2025 – 28/02/2026', who: 'Submetida por Tiago Mendes · aprovada por Helena Costa a 15/12/2024' },
    ],
  },
  {
    id: 'km',
    name: 'Valor por quilómetro',
    liveVersion: 1,
    usedIn: [{ workflow: 'Ajudas de custo', detail: 'passo Pedido · calcula as despesas com viatura própria', to: paths.versions }],
    pending: { version: 2, phase: 'approved', since: '09/10/2026' },
    params: [{ name: 'Viatura própria', current: '0,36 €/km', next: '0,40 €/km' }],
    history: [
      { v: 'v2', period: 'Aprovada · por agendar', who: 'Aprovada por Helena Costa a 09/10/2026' },
      { v: 'v1', period: 'Em vigor desde 02/09/2024', who: 'Submetida por Tiago Mendes · aprovada por Helena Costa a 26/08/2024' },
    ],
  },
]

/** The rule created through "Nova regra", once submitted */
export const newRuleDraft = {
  name: 'Limite de alojamento por noite',
  purpose: 'Valor máximo reembolsado por noite de alojamento, conforme a zona.',
  workflows: [
    { name: 'Ajudas de custo', checked: true },
    { name: 'Formação externa', checked: true },
    { name: 'Horas extraordinárias', checked: false },
    { name: 'Pedido de férias', checked: false },
  ],
  params: [
    { name: 'Lisboa e Porto', value: '80,00', unit: '€ por noite' },
    { name: 'Restantes concelhos', value: '65,00', unit: '€ por noite' },
  ],
}

export function submittedNewRule(workflows: string[]): BusinessRule {
  return {
    id: 'aloj',
    name: newRuleDraft.name,
    liveVersion: 0,
    usedIn: workflows.map((workflow) => ({
      workflow,
      detail: 'ainda por ligar a um passo, no designer',
      to: workflow === 'Ajudas de custo' ? paths.versions : paths.workflows,
    })),
    pending: { version: 1, phase: 'approval', since: '10/10/2026' },
    params: newRuleDraft.params.map((p) => ({ name: p.name, current: '', next: `${p.value} ${p.unit}` })),
    history: [{ v: 'v1', period: 'Em aprovação', who: 'Criada e submetida por Sofia Almeida a 10/10/2026 · aprovadora: Helena Costa' }],
  }
}
