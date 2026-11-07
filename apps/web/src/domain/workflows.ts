import { belongsTo, groups, personas } from './people'
import type { FieldType, PersonaId, Reason, Request, StepType, Workflow } from './types'

/** The workflow every demo request uses */
export function workflowAC(): Workflow {
  return {
    id: 'ac',
    nome: 'Ajudas de custo',
    estado: 'Ativo',
    autor: 'Sofia Almeida',
    data: '14/07/2026',
    desc: 'Reembolso de despesas de deslocação em serviço: transporte, alojamento e refeições.',
    precisa: 'faturas, bilhetes e certificado de presença',
    passos: [
      { id: 'p1', nome: 'Pedido', tipo: 'submissao', quem: 'Todos os trabalhadores', prazo: '' },
      { id: 'p2', nome: 'Validação da chefia', tipo: 'revisao', quem: 'Chefias da unidade do requerente', prazo: 3 },
      { id: 'p3', nome: 'Verificação financeira', tipo: 'revisao', quem: 'Divisão Financeira', prazo: 10 },
      { id: 'p4', nome: 'Validação final', tipo: 'validacao', quem: 'RH · Formação', prazo: 10 },
    ],
  }
}

/** Reasons to return (fix) or reject an «Ajudas de custo» request, by step */
export function reasonsAC(step: number): Array<Reason & { id: string }> {
  if (step === 3)
    return [
      { id: 'cert', nome: 'Falta o certificado de presença ou não está válido', fix: true },
      { id: 'datas', nome: 'Datas do certificado não coincidem', fix: true },
      { id: 'prazo', nome: 'Fora do prazo legal', fix: false },
    ]
  if (step === 2)
    return [
      { id: 'incorreto', nome: 'Preenchido incorretamente', fix: true },
      { id: 'comprovativo', nome: 'Falta documento comprovativo', fix: true },
      { id: 'elegivel', nome: 'Despesa não elegível', fix: false },
    ]
  return [
    { id: 'incorreto', nome: 'Preenchido incorretamente', fix: true },
    { id: 'comprovativo', nome: 'Falta documento comprovativo', fix: true },
    { id: 'naoAutorizada', nome: 'Deslocação não autorizada', fix: false },
    { id: 'prazo', nome: 'Fora do prazo legal', fix: false },
  ]
}

/** The request form of «Ajudas de custo», in the order the requester sees it */
export function fieldsAC(): Array<{ rot: string; tipo: FieldType; origem: 'idp' | 'req'; obrig: boolean }> {
  return [
    { rot: 'Nome, unidade orgânica e chefia', tipo: 'Texto', origem: 'idp', obrig: true },
    { rot: 'NIF', tipo: 'Texto', origem: 'req', obrig: true },
    { rot: 'IBAN', tipo: 'Texto', origem: 'req', obrig: true },
    { rot: 'Motivo da deslocação', tipo: 'Escolha única', origem: 'req', obrig: true },
    { rot: 'Destino', tipo: 'Texto', origem: 'req', obrig: true },
    { rot: 'Descrição', tipo: 'Texto', origem: 'req', obrig: false },
    { rot: 'Partida e regresso', tipo: 'Data e hora', origem: 'req', obrig: true },
    { rot: 'Certificado de presença: datas e ficheiro', tipo: 'Ficheiros', origem: 'req', obrig: true },
    { rot: 'Transporte', tipo: 'Escolha única', origem: 'req', obrig: true },
    { rot: 'Despesas, cada uma com comprovativo', tipo: 'Ficheiros', origem: 'req', obrig: false },
    { rot: 'Outros documentos', tipo: 'Ficheiros', origem: 'req', obrig: false },
  ]
}

export const stepTypes: Record<StepType, { nome: string; desc: string }> = {
  submissao: { nome: 'Pedido', desc: 'Quem inicia preenche o formulário' },
  revisao: { nome: 'Revisão', desc: 'Alguém aprova, devolve ou rejeita' },
  validacao: { nome: 'Validação final', desc: 'Confirma e fecha; gera o documento final' },
}

export const workflowById = (wfs: Workflow[], id: string) => wfs.find((w) => w.id === id) || workflowAC()

/** Persona who handles step `i` in the demo */
export function handlerOf(wf: Workflow, i: number): PersonaId | '' {
  const p = wf.passos[i]
  if (!p || p.tipo === 'submissao') return ''
  const g = groups.find((x) => x.nome === p.quem)
  return g ? g.quem : 'rui'
}

/** Name of whoever handles step `i` of a request */
export function handlerName(wf: Workflow, i: number, req?: { req: { nome?: string; chefia?: string } }) {
  const s = wf.passos[i]
  if (!s) return ''
  if (i === 0) return req?.req.nome || 'Requerente'
  if (req && s.quem === 'Chefias da unidade do requerente' && req.req.chefia) return req.req.chefia
  const h = handlerOf(wf, i)
  return (h && personas[h].nome) || s.quem
}

export function arrivedAt(wf: Workflow, i: number, req: Pick<Request, 'req'>) {
  const s = wf.passos[i] || { nome: '' }
  return `Passou ao passo «${s.nome}», com ${handlerName(wf, i, req)}`
}

export function stepDays(wf: Workflow, i: number) {
  const p = wf.passos[i]
  const n = p ? Number(p.prazo) : 0
  return n > 0 ? n : 10
}

/** Prefix of a workflow's request numbers: «Pedido de material» → PM */
export function idPrefix(wf: Workflow) {
  if (wf.id === 'ac') return 'AC'
  const w = String(wf.nome || '')
    .split(/\s+/)
    .filter((x) => x.length > 2)
  return ((w[0] || 'P')[0] + (w[1] || w[0] || 'D')[0]).toUpperCase()
}

/** Sum of the review steps' deadlines */
export const totalDays = (wf: Workflow) => wf.passos.slice(1).reduce((t, x) => t + (Number(x.prazo) || 0), 0)

/** A persona can start a workflow if it is active and they belong to the group of its first step */
export const canStart = (wf: Workflow, pid: PersonaId) => wf.estado === 'Ativo' && belongsTo(pid, wf.passos[0]?.quem || '')
