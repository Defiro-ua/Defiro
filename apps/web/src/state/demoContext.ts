import { createContext, useContext } from 'react'
import type { Decision } from '../domain/requests'
import type { Notice, PersonaId, Request, RequestSubmission, Workflow, WorkflowDraft } from '../domain/types'

export type DemoData = {
  persona: PersonaId | null
  pedidos: Request[]
  wfs: Workflow[]
  /** The workflow being drawn in «Criar workflow», kept while moving between screens */
  rasc: WorkflowDraft | null
}

export type DemoApi = DemoData & {
  /** Signs in as (or switches to) a persona and opens the inbox */
  entrar: (pid: PersonaId) => void
  sair: () => void
  /** Puts the requests and workflows back as they started */
  repor: () => void
  submeter: (wfId: string, data: RequestSubmission) => void
  reenviar: (id: string, data: RequestSubmission) => void
  decidir: (id: string, decision: Decision) => void
  /** Undoes the last decision, if `undoId` is still the last one */
  desfazer: (undoId: string) => void
  podeDesfazer: (undoId?: string) => boolean
  criarWf: (w: Workflow, notice: Notice) => void
  setRasc: (w: WorkflowDraft | null) => void
}

export const DemoContext = createContext<DemoApi | null>(null)

export function useDemo(): DemoApi {
  const value = useContext(DemoContext)
  if (!value) throw new Error('useDemo needs <DemoProvider>')
  return value
}

/** State carried by a navigation: a notice to show, where the person came from, notes to restore */
export type NavState = {
  flash?: Notice & { n?: number }
  /** Name of the screen «Anterior» goes back to */
  de?: string
  notas?: Array<{ campo: string; texto: string }>
  /** Workflow whose summary opens in the list */
  abrir?: string
}
