import type { FieldType, StepType, WorkflowDraft } from './types'

/** A new workflow starts with the request step and one review step */
export function newDraft(): WorkflowDraft {
  return {
    nome: '',
    desc: '',
    seq: 4,
    passos: [
      {
        id: 'n1',
        nome: 'Pedido',
        tipo: 'submissao',
        quem: 'Todos os trabalhadores',
        prazo: '',
        campos: [
          { id: 'c1', rot: 'Nome', tipo: 'Texto', origem: 'idp', obrig: true },
          { id: 'c2', rot: 'Unidade orgânica', tipo: 'Texto', origem: 'idp', obrig: true },
          { id: 'c3', rot: 'Chefia direta', tipo: 'Pessoa', origem: 'idp', obrig: true },
        ],
        motivos: [],
      },
      {
        id: 'n2',
        nome: 'Validação da chefia',
        tipo: 'revisao',
        quem: '',
        prazo: '',
        campos: [],
        motivos: [
          { nome: 'Preenchido incorretamente', fix: true },
          { nome: 'Pedido não autorizado', fix: false },
        ],
      },
    ],
  }
}

export type DraftAction =
  | { t: 'nome' | 'desc'; v: string }
  | { t: 'passo'; passo: string; k: 'nome' | 'quem' | 'prazo'; v: string }
  | { t: 'addPasso'; tipo: Exclude<StepType, 'submissao'> }
  | { t: 'rmPasso'; passo: string }
  | { t: 'movePasso'; passo: string; d: number }
  | { t: 'addMotivo'; passo: string; nome: string; fix: boolean }
  | { t: 'motivo'; passo: string; m: number; v: string }
  | { t: 'rmMotivo'; passo: string; m: number }
  | { t: 'addCampo'; passo: string }
  | { t: 'campo'; passo: string; campo: string; k: 'rot' | 'tipo' | 'opcoes' | 'obrig'; v: string | boolean }
  | { t: 'rmCampo'; passo: string; campo: string }
  | { t: 'moveCampo'; passo: string; campo: string; d: number }

/** Every change to a draft, as a pure function */
export function reduceDraft(w: WorkflowDraft, a: DraftAction): WorkflowDraft {
  const c = JSON.parse(JSON.stringify(w)) as WorkflowDraft
  const P = c.passos
  const i = 'passo' in a ? P.findIndex((p) => p.id === a.passo) : -1
  const p = i >= 0 ? P[i] : undefined
  switch (a.t) {
    case 'nome':
      c.nome = a.v
      break
    case 'desc':
      c.desc = a.v
      break
    case 'passo':
      if (p) p[a.k] = a.v
      break
    case 'addPasso': {
      // the final validation closes the procedure: there is at most one, and it stays the last step
      const final = P.findIndex((x) => x.tipo === 'validacao')
      if (a.tipo === 'validacao' && final >= 0) break
      const id = 'n' + c.seq++
      P.splice(final >= 0 ? final : P.length, 0, {
        id,
        nome: a.tipo === 'validacao' ? 'Validação final' : 'Revisão',
        tipo: a.tipo,
        quem: '',
        prazo: '',
        campos: [],
        motivos: [
          { nome: 'Preenchido incorretamente', fix: true },
          { nome: 'Pedido não autorizado', fix: false },
        ],
      })
      c.ultimo = id
      break
    }
    case 'rmPasso':
      if (p && p.tipo !== 'submissao') P.splice(i, 1)
      break
    case 'movePasso':
      if (p && p.tipo === 'revisao') {
        const j = i + a.d
        if (j >= 1 && j < P.length && P[j].tipo !== 'validacao') {
          P.splice(i, 1)
          P.splice(j, 0, p)
        }
      }
      break
    case 'addMotivo':
      p?.motivos?.push({ nome: a.nome, fix: a.fix })
      break
    case 'motivo':
      if (p?.motivos?.[a.m]) p.motivos[a.m].nome = a.v
      break
    case 'rmMotivo':
      p?.motivos?.splice(a.m, 1)
      break
    case 'addCampo':
      if (p) {
        const id = 'c' + c.seq++
        p.campos = (p.campos || []).concat([{ id, rot: '', tipo: 'Texto', origem: 'req', obrig: false, opcoes: '' }])
        c.campoSel = id
      }
      break
    case 'campo': {
      const f = p?.campos?.find((x) => x.id === a.campo)
      if (f) {
        if (a.k === 'obrig') f.obrig = !!a.v
        else if (a.k === 'tipo') f.tipo = a.v as FieldType
        else f[a.k] = String(a.v)
      }
      break
    }
    case 'rmCampo': {
      const k = p?.campos?.findIndex((x) => x.id === a.campo) ?? -1
      if (p?.campos && k >= 0) p.campos.splice(k, 1)
      break
    }
    case 'moveCampo': {
      const list = p?.campos
      if (!list) break
      const k = list.findIndex((x) => x.id === a.campo)
      const j = k + a.d
      if (k >= 0 && j >= 0 && j < list.length) {
        const f = list.splice(k, 1)[0]
        list.splice(j, 0, f)
      }
      break
    }
  }
  return c
}

export const optionsOf = (t?: string) =>
  String(t || '')
    .split(/[\n,;]/)
    .map((x) => x.trim())
    .filter(Boolean)

/** What is wrong with a field of the request form */
export function fieldProblem(c: { rot: string; tipo: FieldType; opcoes?: string }) {
  if (!String(c.rot || '').trim()) return 'Falta o rótulo'
  if (c.tipo === 'Escolha única' && optionsOf(c.opcoes).length < 2) return 'Faltam opções de resposta (pelo menos duas)'
  return ''
}

export type DraftError = {
  id: string
  /** Names the step, for the summary */
  txt: string
  /** Shown next to the field itself */
  curto?: string
  vivo?: boolean
}

/** Everything that stops a draft from being created */
export function draftErrors(w: WorkflowDraft): DraftError[] {
  const e: DraftError[] = []
  if (!String(w.nome || '').trim()) e.push({ id: 'wf-nome', txt: 'Dê um nome ao workflow.' })
  if (!w.passos.some((p) => p.tipo !== 'submissao')) e.push({ id: 'wf-add', txt: 'Acrescente pelo menos um passo de revisão ou de validação.' })
  const finals = w.passos.filter((p) => p.tipo === 'validacao').length
  if (finals > 1 || (finals === 1 && w.passos[w.passos.length - 1].tipo !== 'validacao'))
    e.push({ id: 'wf-add', txt: 'A validação final fecha o procedimento: só pode haver uma e tem de ser o último passo.' })
  w.passos.forEach((p, k) => {
    const n = 'Passo ' + (k + 1) + (p.nome ? ` («${p.nome}»)` : '')
    const add = (id: string, msg: string, vivo = false, pre?: string) =>
      e.push({ id, txt: (pre || n) + ': ' + msg + '.', curto: msg.charAt(0).toUpperCase() + msg.slice(1) + '.', vivo })
    if (!String(p.nome || '').trim()) add(`wf-${p.id}-nome`, 'falta o nome')
    if (!p.quem) add(`wf-${p.id}-quem`, 'escolha quem trata')
    if (p.tipo !== 'submissao') {
      const d = Number(p.prazo)
      if (!p.prazo) add(`wf-${p.id}-prazo`, 'indique o prazo legal, de 1 a 90 dias úteis')
      else if (!(d >= 1 && d <= 90)) add(`wf-${p.id}-prazo`, 'o prazo legal tem de ser de 1 a 90 dias úteis', true)
      const ms = p.motivos || []
      if (!ms.length) add(`wf-${p.id}-addm`, 'acrescente pelo menos um motivo para devolver ou rejeitar')
      ms.forEach((m, j) => {
        if (!String(m.nome || '').trim()) add(`wf-${p.id}-m${j}`, 'dê um nome ao motivo ' + (j + 1))
      })
    } else {
      const campos = p.campos || []
      if (!campos.some((f) => f.origem === 'req'))
        add(
          `wf-${p.id}-campos`,
          'ainda não tem perguntas para quem faz o pedido. Nome, unidade orgânica e chefia entram sozinhos; carregue em «Acrescentar campo» e crie pelo menos uma pergunta, por exemplo «Material pedido»',
          false,
          'Formulário do pedido',
        )
      campos.forEach((f, j) => {
        const pr = f.origem === 'req' ? fieldProblem(f) : ''
        if (!pr) return
        const qual = 'campo ' + (j + 1) + (f.rot ? ` («${f.rot}»)` : '') + ': ' + pr.charAt(0).toLowerCase() + pr.slice(1) + '.'
        e.push({ id: `wf-${p.id}-campos`, txt: n + ', ' + qual, curto: qual.charAt(0).toUpperCase() + qual.slice(1) })
      })
    }
  })
  return e
}

export const answerTypes: Array<{ v: FieldType; nome: string; desc: string }> = [
  { v: 'Texto', nome: 'Texto curto', desc: 'Uma linha. Ex.: local, matrícula' },
  { v: 'Texto longo', nome: 'Texto longo', desc: 'Várias linhas. Ex.: justificação' },
  { v: 'Número', nome: 'Número', desc: 'Só algarismos. Ex.: quantidade' },
  { v: 'Data', nome: 'Data', desc: 'Dia, mês e ano' },
  { v: 'Data e hora', nome: 'Data e hora', desc: 'Dia, mês, ano e hora' },
  { v: 'Escolha única', nome: 'Escolha única', desc: 'Uma de várias opções que define' },
  { v: 'Sim ou não', nome: 'Sim ou não', desc: 'Duas opções: sim ou não' },
  { v: 'Ficheiros', nome: 'Ficheiros', desc: 'Documentos que o requerente junta' },
]
