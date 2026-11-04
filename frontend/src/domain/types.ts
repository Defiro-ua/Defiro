/*
 * Data of the prototype. Field names follow the mockup (Opção 1 · Protótipo
 * único), so the rules ported from it read the same way.
 */

export type PersonaId = 'ana' | 'rui' | 'carla' | 'joana' | 'sofia'

export type Persona = {
  id: PersonaId
  nome: string
  primeiro: string
  papel: string
  funcao: string
  ini: string
  email: string
  unidade: string
  chefia: string
  desc: string
  nif: string
  iban: string
}

export type StepType = 'submissao' | 'revisao' | 'validacao'

export type FieldType =
  | 'Texto'
  | 'Texto longo'
  | 'Número'
  | 'Data'
  | 'Data e hora'
  | 'Escolha única'
  | 'Ficheiros'
  | 'Sim ou não'
  | 'Pessoa'

/** A question of a workflow's request form. `idp` fields come from the identity provider. */
export type FormField = {
  id: string
  rot: string
  tipo: FieldType
  origem: 'idp' | 'req'
  obrig: boolean
  opcoes?: string
}

/** A reason to return (`fix`) or reject a request at a step */
export type Reason = { nome: string; fix: boolean }

export type WorkflowStep = {
  id: string
  nome: string
  tipo: StepType
  /** Group or unit that handles the step (for the first step: who may ask) */
  quem: string
  /** Legal deadline in working days; empty for the request step and while drafting */
  prazo: number | string
  campos?: FormField[]
  motivos?: Reason[]
}

export type Workflow = {
  id: string
  nome: string
  estado: 'Ativo'
  autor: string
  data: string
  desc: string
  precisa: string
  passos: WorkflowStep[]
  /** Just created in this demo */
  novo?: boolean
}

/** A workflow being drawn in «Criar workflow» */
export type WorkflowDraft = {
  nome: string
  desc: string
  seq: number
  passos: WorkflowStep[]
  ultimo?: string
  campoSel?: string
}

export type FileRef = {
  nome: string
  kb: number
  quando?: string
  /** Version of the request the file arrived with */
  v?: number
  /** Added in this session of the form */
  novo?: boolean
}

export type Expense = {
  tipo: string
  desc: string
  data: string
  valor: number
  comp: FileRef | null
}

/** Data of an «Ajudas de custo» request */
export type TripData = {
  motivo: string
  destino: string
  desc: string
  partida: string
  regresso: string
  certIni: string
  certFim: string
  transporte: string
  nif?: string
  iban?: string
}

export type Requester = {
  nome: string
  unidade: string
  cargo: string
  chefia: string
  nif: string
  iban: string
}

/** A reviewer's note about one field */
export type FieldNote = {
  campo: string
  rot: string
  texto: string
  quem: string
  q: string
  resolvida?: boolean
}

export type HistoryEntry = { q: string; o: string }

export type RequestStatus = 'em curso' | 'devolvido' | 'rejeitado' | 'fechado'

export type Request = {
  id: string
  wf: string
  req: Requester
  /** Persona id of the requester (or another id for people outside the demo) */
  requerente: string
  d: TripData
  desp: Expense[]
  anexos: FileRef[]
  /** Answers of a generic workflow's form, by field id */
  val?: Record<string, string>
  passo: number
  estado: RequestStatus
  recebido: string
  prazo: string
  notas: FieldNote[]
  /** Notes left by the previous step when approving, shown to the next reviewer */
  notasInfo?: FieldNote[]
  versao: number
  hist: HistoryEntry[]
  motivo?: string
  motivos?: string[]
  notaGeral?: string
  devolvidoPor?: string
  devolvidoEm?: number
  rejeitadoPor?: string
  fechadoPor?: string
  fechadoEm?: string
}

export type Tone = 'ok' | 'warn' | 'bad' | 'info' | 'neutro'

export type DecisionAction = 'aprovar' | 'fechar' | 'devolver' | 'rejeitar'

/** The small card shown at the top of the screen after an action */
export type Notice = {
  tom: Tone
  titulo: string
  texto?: string
  /** Request the notice is about */
  id?: string
  /** The final document can be opened from the notice */
  doc?: boolean
  /** The action can be undone from the notice */
  undo?: string
}

/** What the request form sends when submitting or resending */
export type RequestSubmission = {
  d: TripData
  desp: Expense[]
  anexos: FileRef[]
  val: Record<string, string>
}

/** Content of a generated PDF (final document or a preview of an attachment) */
export type DocContent = {
  titulo: string
  sub: string
  ficheiro: string
  linhas: Array<[string, string]>
  nota: string
}
