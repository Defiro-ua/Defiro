import { day, fmtDate, fmtDateTime, isoDate as I, isoDateTime as IT, now } from './dates'
import { personas, withRole } from './people'
import { allowance, eur, expensesSum, tripDays, tripTotal } from './trip'
import type {
  DecisionAction,
  DocContent,
  FieldNote,
  FileRef,
  Notice,
  PersonaId,
  Request,
  RequestSubmission,
  Tone,
  Workflow,
} from './types'
import { arrivedAt, handlerName, handlerOf, idPrefix, stepDays, workflowAC, workflowById } from './workflows'

const D = day

const requester = (nome: string, nif: string, iban: string, unidade: string, cargo: string, chefia: string) => ({
  nome,
  unidade,
  cargo,
  chefia,
  nif,
  iban,
})

/** The requests the demo starts with: Ana's new one, Paulo's, and two waiting for the final validation */
function seed(): Request[] {
  const ana: Request = {
    id: 'AC-2026-0147',
    wf: 'ac',
    req: requester('Ana Ferreira', '234 567 418', 'PT50 0035 0000 1234 5678 9015 4', 'Divisão de Obras Municipais', 'Técnica Superior', 'Rui Matos'),
    requerente: 'ana',
    d: {
      motivo: 'Formação',
      destino: 'Lisboa',
      desc: 'Formação em Contratação Pública',
      partida: IT(D(-14, 7, 30)),
      regresso: IT(D(-12, 19, 40)),
      certIni: I(D(-14)),
      certFim: I(D(-13)),
      transporte: 'Transportes públicos',
    },
    desp: [
      { tipo: 'Comboio', desc: 'Aveiro – Lisboa', data: I(D(-14)), valor: 24.1, comp: { nome: 'bilhete_comboio.pdf', kb: 184 } },
      { tipo: 'Alojamento', desc: '1 noite', data: I(D(-14)), valor: 68, comp: { nome: 'fatura_hotel.pdf', kb: 212 } },
    ],
    anexos: [
      { nome: 'bilhete_comboio.pdf', kb: 184, quando: IT(D(-4, 16, 2)) },
      { nome: 'fatura_hotel.pdf', kb: 212, quando: IT(D(-4, 16, 2)) },
    ],
    passo: 1,
    estado: 'em curso',
    recebido: IT(D(-4, 16, 2)),
    prazo: I(D(3)),
    notas: [],
    versao: 1,
    hist: [
      { q: IT(D(-4, 16, 2)), o: 'Ana Ferreira submeteu o pedido' },
      { q: IT(D(-4, 16, 2)), o: 'Passou ao passo «Validação da chefia», com Rui Matos' },
      { q: IT(D(-3, 9, 15)), o: 'Rui Matos abriu o pedido' },
    ],
  }
  const paulo: Request = {
    id: 'AC-2026-0151',
    wf: 'ac',
    req: requester('Paulo Reis', '198 345 220', 'PT50 0033 0000 4567 8912 3456 7', 'Divisão de Obras Municipais', 'Técnico Superior', 'Rui Matos'),
    requerente: 'paulo',
    d: {
      motivo: 'Reunião',
      destino: 'Porto',
      desc: 'Reunião com a CCDR-N sobre a empreitada da ponte',
      partida: IT(D(-9, 8, 5)),
      regresso: IT(D(-9, 18, 40)),
      certIni: I(D(-9)),
      certFim: I(D(-9)),
      transporte: 'Transportes públicos',
    },
    desp: [{ tipo: 'Comboio', desc: 'Aveiro – Porto, ida e volta', data: I(D(-9)), valor: 14.8, comp: { nome: 'bilhetes_comboio.pdf', kb: 120 } }],
    anexos: [
      { nome: 'bilhetes_comboio.pdf', kb: 120, quando: IT(D(-2, 10, 12)) },
      { nome: 'convocatoria_reuniao.pdf', kb: 88, quando: IT(D(-2, 10, 12)) },
    ],
    passo: 1,
    estado: 'em curso',
    recebido: IT(D(-2, 10, 12)),
    prazo: I(D(5)),
    notas: [],
    versao: 1,
    hist: [
      { q: IT(D(-2, 10, 12)), o: 'Paulo Reis submeteu o pedido' },
      { q: IT(D(-2, 10, 12)), o: 'Passou ao passo «Validação da chefia», com Rui Matos' },
    ],
  }
  const pedro: Request = {
    id: 'AC-2026-0122',
    wf: 'ac',
    req: requester('Pedro Sousa', '211 908 374', 'PT50 0018 0003 3456 1234 0987 1', 'Divisão de Ambiente', 'Técnico Superior', 'Luísa Prata'),
    requerente: 'pedro',
    d: {
      motivo: 'Formação',
      destino: 'Coimbra',
      desc: 'Ação de formação «Segurança em obra»',
      partida: IT(D(-30, 8, 0)),
      regresso: IT(D(-29, 18, 30)),
      certIni: I(D(-30)),
      certFim: I(D(-29)),
      transporte: 'Viatura própria',
    },
    desp: [
      { tipo: 'Quilómetros', desc: '120 km em viatura própria', data: I(D(-30)), valor: 43.2, comp: { nome: 'mapa_quilometros.pdf', kb: 64 } },
      { tipo: 'Alojamento', desc: '1 noite', data: I(D(-30)), valor: 62, comp: { nome: 'fatura_alojamento.pdf', kb: 198 } },
    ],
    anexos: [
      { nome: 'certificado_presenca.pdf', kb: 101, quando: IT(D(-25, 9, 40)) },
      { nome: 'fatura_alojamento.pdf', kb: 198, quando: IT(D(-25, 9, 40)) },
      { nome: 'mapa_quilometros.pdf', kb: 64, quando: IT(D(-25, 9, 40)) },
    ],
    passo: 3,
    estado: 'em curso',
    recebido: IT(D(-8, 15, 2)),
    prazo: I(D(6)),
    notas: [],
    versao: 1,
    hist: [
      { q: IT(D(-25, 9, 40)), o: 'Pedro Sousa submeteu o pedido' },
      { q: IT(D(-22, 11, 5)), o: 'Luísa Prata aprovou o passo «Validação da chefia»' },
      { q: IT(D(-8, 15, 2)), o: 'Carla Dias aprovou o passo «Verificação financeira»' },
      { q: IT(D(-8, 15, 2)), o: 'Passou ao passo «Validação final», com Joana Pires' },
    ],
  }
  const marta: Request = {
    id: 'AC-2026-0119',
    wf: 'ac',
    req: requester('Marta Lopes', '245 110 963', 'PT50 0010 0000 2233 4455 6677 8', 'Divisão de Educação', 'Técnica Superior', 'Nuno Barros'),
    requerente: 'marta',
    d: {
      motivo: 'Formação',
      destino: 'Braga',
      desc: 'Congresso de Educação Inclusiva',
      partida: IT(D(-20, 7, 45)),
      regresso: IT(D(-18, 20, 0)),
      certIni: I(D(-20)),
      certFim: I(D(-19)),
      transporte: 'Transportes públicos',
    },
    desp: [
      { tipo: 'Autocarro', desc: 'Aveiro – Braga, ida e volta', data: I(D(-20)), valor: 21.5, comp: { nome: 'bilhetes_autocarro.pdf', kb: 97 } },
      { tipo: 'Alojamento', desc: '2 noites', data: I(D(-20)), valor: 118, comp: { nome: 'fatura_hotel.pdf', kb: 230 } },
    ],
    anexos: [
      { nome: 'certificado_congresso.pdf', kb: 143, quando: IT(D(-16, 14, 20)) },
      { nome: 'bilhetes_autocarro.pdf', kb: 97, quando: IT(D(-16, 14, 20)) },
      { nome: 'fatura_hotel.pdf', kb: 230, quando: IT(D(-16, 14, 20)) },
    ],
    passo: 3,
    estado: 'em curso',
    recebido: IT(D(-6, 11, 30)),
    prazo: I(D(8)),
    notas: [],
    versao: 1,
    hist: [
      { q: IT(D(-16, 14, 20)), o: 'Marta Lopes submeteu o pedido' },
      { q: IT(D(-13, 10, 0)), o: 'Nuno Barros aprovou o passo «Validação da chefia»' },
      { q: IT(D(-6, 11, 30)), o: 'Carla Dias aprovou o passo «Verificação financeira»' },
      { q: IT(D(-6, 11, 30)), o: 'Passou ao passo «Validação final», com Joana Pires' },
    ],
  }
  return [ana, paulo, pedro, marta]
}

/** An older request of Ana's, already closed, with its final document */
function closedRequest(): Request {
  const a = personas.ana
  return {
    id: 'AC-2026-0098',
    wf: 'ac',
    req: { nome: a.nome, unidade: a.unidade, cargo: a.papel, chefia: a.chefia, nif: a.nif, iban: a.iban },
    requerente: 'ana',
    d: {
      motivo: 'Reunião',
      destino: 'Coimbra',
      desc: 'Reunião da Comunidade Intermunicipal',
      partida: IT(D(-62, 8, 0)),
      regresso: IT(D(-62, 18, 15)),
      certIni: I(D(-62)),
      certFim: I(D(-62)),
      transporte: 'Viatura de serviço',
    },
    desp: [{ tipo: 'Refeição', desc: 'Almoço', data: I(D(-62)), valor: 9.6, comp: { nome: 'fatura_almoco.pdf', kb: 56 } }],
    anexos: [
      { nome: 'convocatoria_reuniao.pdf', kb: 74, quando: IT(D(-60, 10, 5)) },
      { nome: 'fatura_almoco.pdf', kb: 56, quando: IT(D(-60, 10, 5)) },
    ],
    passo: 4,
    estado: 'fechado',
    recebido: IT(D(-41, 15, 30)),
    prazo: '',
    notas: [],
    versao: 1,
    fechadoPor: 'Joana Pires',
    fechadoEm: IT(D(-41, 15, 30)),
    hist: [
      { q: IT(D(-60, 10, 5)), o: 'Ana Ferreira submeteu o pedido' },
      { q: IT(D(-58, 9, 12)), o: 'Rui Matos aprovou o passo «Validação da chefia»' },
      { q: IT(D(-50, 14, 40)), o: 'Carla Dias aprovou o passo «Verificação financeira»' },
      { q: IT(D(-41, 15, 30)), o: 'Joana Pires validou e fechou o procedimento' },
      { q: IT(D(-41, 15, 30)), o: 'Documento gerado: ordem_reembolso_AC-2026-0098.pdf' },
    ],
  }
}

export const initialRequests = (): Request[] => seed().concat([closedRequest()])

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x)) as T

function nextId(requests: Request[], prefix: string) {
  let m = prefix === 'AC' ? 151 : 0
  for (const p of requests) {
    const r = new RegExp('^' + prefix + '-2026-(\\d+)$').exec(p.id)
    if (r) m = Math.max(m, Number(r[1]))
  }
  return prefix + '-2026-' + String(m + 1).padStart(4, '0')
}

export function submitRequest(requests: Request[], wf: Workflow, data: RequestSubmission, pid: PersonaId) {
  const eu = personas[pid]
  const when = now()
  const d = { ...data.d }
  const p: Request = {
    id: nextId(requests, idPrefix(wf)),
    wf: wf.id,
    requerente: pid,
    req: { nome: eu.nome, unidade: eu.unidade, cargo: eu.papel, chefia: eu.chefia, nif: d.nif || eu.nif, iban: d.iban || eu.iban },
    d,
    desp: clone(data.desp || []),
    anexos: (data.anexos || []).map((a) => ({ nome: a.nome, kb: a.kb, quando: when })),
    val: { ...(data.val || {}) },
    passo: 1,
    estado: 'em curso',
    recebido: when,
    prazo: I(D(stepDays(wf, 1))),
    notas: [],
    versao: 1,
    hist: [],
  }
  p.hist = [
    { q: when, o: eu.nome + ' submeteu o pedido' },
    { q: when, o: arrivedAt(wf, 1, p) },
  ]
  return { requests: [p].concat(requests), request: p }
}

export function resendRequest(requests: Request[], id: string, data: RequestSubmission, wfs: Workflow[]) {
  const list = clone(requests)
  const p = list.find((x) => x.id === id)
  if (!p) return { requests: list, request: null }
  const wf = workflowById(wfs, p.wf)
  const when = now()
  const d = data.d
  p.d = { ...p.d, ...d }
  if (d.nif) p.req.nif = d.nif
  if (d.iban) p.req.iban = d.iban
  p.desp = clone(data.desp)
  p.versao = (p.versao || 1) + 1
  p.anexos = data.anexos.map((a: FileRef) => ({ nome: a.nome, kb: a.kb, quando: a.novo ? when : a.quando, v: a.novo ? p.versao : a.v || 1 }))
  p.val = { ...data.val }
  p.estado = 'em curso'
  p.passo = p.devolvidoEm || 1
  p.recebido = when
  p.prazo = I(D(stepDays(wf, p.passo)))
  p.notas = (p.notas || []).map((n) => ({ ...n, resolvida: true }))
  p.hist = (p.hist || []).concat([
    { q: when, o: `${p.req.nome} corrigiu e reenviou o pedido (versão ${p.versao})` },
    { q: when, o: arrivedAt(wf, p.passo, p) },
  ])
  return { requests: list, request: p }
}

export type Decision = {
  acao: DecisionAction
  motivos?: string[]
  mensagem?: string
  notas?: Array<Pick<FieldNote, 'campo' | 'rot' | 'texto'>>
}

export const reasonsText = (ms: string[] = []) => ms.join('; ')

export function decide(requests: Request[], wfs: Workflow[], id: string, o: Decision, pid: PersonaId) {
  const list = clone(requests)
  const p = list.find((x) => x.id === id)
  if (!p) return { requests: list, request: null, acao: o.acao, wf: workflowAC() }
  const wf = workflowById(wfs, p.wf)
  const eu = personas[pid]
  const when = now()
  const passo = wf.passos[p.passo] || { nome: '' }
  const notas: FieldNote[] = (o.notas || []).map((n) => ({ ...n, quem: eu.nome, q: when }))
  const ms = o.motivos || []
  const mTxt = reasonsText(ms)
  const comNotas = notas.length ? ' com ' + (notas.length === 1 ? '1 nota' : notas.length + ' notas') : ''
  const log = (t: string) => {
    p.hist = (p.hist || []).concat([{ q: when, o: t }])
  }
  let acao = o.acao
  if (acao === 'aprovar' && p.passo + 1 >= wf.passos.length) acao = 'fechar'
  if (acao === 'aprovar') {
    log(`${eu.nome} aprovou o passo «${passo.nome}»${comNotas}`)
    p.passo += 1
    p.recebido = when
    p.prazo = I(D(stepDays(wf, p.passo)))
    p.notasInfo = notas
    log(arrivedAt(wf, p.passo, p))
  } else if (acao === 'fechar') {
    log(`${eu.nome} validou e fechou o procedimento${comNotas}`)
    p.estado = 'fechado'
    p.passo = wf.passos.length
    p.prazo = ''
    p.fechadoPor = eu.nome
    p.fechadoEm = when
    log('Documento gerado: ' + finalDoc(p, wf).ficheiro)
  } else if (acao === 'devolver') {
    log(`${eu.nome} devolveu para correção: ${mTxt}${comNotas}`)
    p.estado = 'devolvido'
    p.devolvidoEm = p.passo
    p.passo = 0
    p.motivo = mTxt
    p.motivos = ms
    p.notaGeral = o.mensagem || ''
    p.devolvidoPor = eu.nome
    p.notas = notas
    p.prazo = I(D(10))
    p.recebido = when
  } else if (acao === 'rejeitar') {
    log(`${eu.nome} rejeitou o pedido: ${mTxt}`)
    p.estado = 'rejeitado'
    p.motivo = mTxt
    p.motivos = ms
    p.notaGeral = o.mensagem || ''
    p.rejeitadoPor = eu.nome
    p.notas = notas
    p.prazo = ''
  }
  return { requests: list, request: p, acao, wf }
}

export type NoticeAction = DecisionAction | 'submeter' | 'reenviar'

/** The small card after an action: a short title; the details are read out to screen readers */
export function noticeFor(acao: NoticeAction, p: Request, wf: Workflow): Notice {
  const nome = withRole(p.req.nome)
  const prox = wf.passos[p.passo] || { nome: '' }
  const para = `o passo «${prox.nome || ''}», com ${withRole(handlerName(wf, p.passo, p))}`
  const ms = p.motivos || (p.motivo ? [p.motivo] : [])
  const motivos = (ms.length === 1 ? 'Motivo: ' : 'Motivos: ') + reasonsText(ms) + '.'
  const M: Record<NoticeAction, Notice> = {
    aprovar: { tom: 'ok', titulo: 'Pedido aprovado', texto: `${p.id} seguiu para ${para}.` },
    fechar: { tom: 'ok', titulo: 'Procedimento fechado', texto: `${p.id}: foi gerado o documento final. ${nome} já o pode transferir.`, doc: true },
    devolver: { tom: 'warn', titulo: 'Pedido devolvido para correção', texto: `${p.id} voltou para ${nome}. ${motivos}` },
    rejeitar: { tom: 'bad', titulo: 'Pedido rejeitado', texto: `${p.id} foi encerrado. ${motivos}` },
    submeter: { tom: 'ok', titulo: 'Pedido submetido', texto: `Referência ${p.id}. Seguiu para ${para}.` },
    reenviar: { tom: 'ok', titulo: 'Pedido reenviado', texto: `A versão ${p.versao} de ${p.id} seguiu para ${para}.` },
  }
  return { ...M[acao], id: p.id }
}

export type TaskKind = 'corrigir' | 'rever' | 'validar'
export type Task = { tipo: TaskKind; p: Request; wf: Workflow }

/** What is waiting for a persona: requests to correct (theirs) and steps they handle */
export function tasksOf(requests: Request[], wfs: Workflow[], pid: PersonaId): Task[] {
  const out: Task[] = []
  for (const p of requests) {
    const wf = workflowById(wfs, p.wf)
    if (p.estado === 'devolvido' && p.requerente === pid) out.push({ tipo: 'corrigir', p, wf })
    else if (p.estado === 'em curso' && p.passo >= 1 && handlerOf(wf, p.passo) === pid)
      out.push({ tipo: wf.passos[p.passo]?.tipo === 'validacao' ? 'validar' : 'rever', p, wf })
  }
  return out.sort((a, b) => String(a.p.prazo).localeCompare(String(b.p.prazo)))
}

export function statusOf(p: Request, wf: Workflow): { txt: string; tom: Tone } {
  if (p.estado === 'fechado') return { txt: 'Concluído', tom: 'ok' }
  if (p.estado === 'rejeitado') return { txt: 'Rejeitado', tom: 'bad' }
  if (p.estado === 'devolvido') return { txt: 'Devolvido para correção', tom: 'warn' }
  const s = wf.passos[p.passo]
  return { txt: 'Em ' + String(s?.nome || 'curso').toLowerCase(), tom: 'info' }
}

/** The request's data as label/value rows, each with a key reviewers can attach notes to */
export function requestFields(p: Request, wf: Workflow) {
  if (p.wf === 'ac') {
    const d = p.d
    return [
      { k: 'motivo', rot: 'Motivo', v: d.motivo },
      { k: 'destino', rot: 'Destino', v: d.destino },
      { k: 'desc', rot: 'Descrição', v: d.desc || '—' },
      { k: 'partida', rot: 'Partida', v: fmtDateTime(d.partida) },
      { k: 'regresso', rot: 'Regresso', v: fmtDateTime(d.regresso) },
      { k: 'cert', rot: 'Datas do certificado', v: fmtDate(d.certIni) + (d.certFim && d.certFim !== d.certIni ? ' a ' + fmtDate(d.certFim) : '') },
      { k: 'transporte', rot: 'Transporte', v: d.transporte },
      { k: 'nif', rot: 'NIF', v: p.req.nif },
      { k: 'iban', rot: 'IBAN', v: p.req.iban },
    ]
  }
  return (wf.passos[0]?.campos || [])
    .filter((c) => c.origem === 'req' && c.tipo !== 'Ficheiros')
    .map((c) => ({ k: c.id, rot: c.rot, v: String(p.val?.[c.id] || '—') }))
}

/** The document generated when the procedure is closed */
export function finalDoc(p: Request, wf: Workflow): DocContent {
  const when = p.fechadoEm || now()
  if (p.wf === 'ac') {
    const dias = tripDays(p.d)
    return {
      titulo: 'Ordem de reembolso',
      sub: 'Ajudas de custo · ' + p.id,
      ficheiro: `ordem_reembolso_${p.id}.pdf`,
      linhas: [
        ['Requerente', withRole(p.req.nome)],
        ['Unidade orgânica', p.req.unidade],
        ['NIF', p.req.nif],
        ['IBAN', p.req.iban],
        ['Deslocação', p.d.destino + ' · ' + p.d.motivo],
        ['Período', fmtDateTime(p.d.partida) + ' a ' + fmtDateTime(p.d.regresso)],
        ['Ajudas de custo · ' + dias + (dias === 1 ? ' dia' : ' dias'), eur(allowance(p.d))],
        ['Despesas com fatura', eur(expensesSum(p.desp))],
        ['Total a reembolsar', eur(tripTotal(p.d, p.desp))],
        ['Validado por', withRole(p.fechadoPor || 'Joana Pires') + ' a ' + fmtDate(when)],
      ],
      nota: 'Documento gerado pela defiro quando o procedimento foi fechado. O pagamento é feito por transferência para o IBAN indicado.',
    }
  }
  const campos = (wf.passos[0]?.campos || []).filter((c) => c.origem === 'req' && c.tipo !== 'Ficheiros')
  return {
    titulo: 'Comprovativo de conclusão',
    sub: wf.nome + ' · ' + p.id,
    ficheiro: `comprovativo_${p.id}.pdf`,
    linhas: [
      ['Requerente', withRole(p.req.nome)] as [string, string],
      ['Unidade orgânica', p.req.unidade] as [string, string],
    ]
      .concat(campos.map((c) => [c.rot, String(p.val?.[c.id] || '—')] as [string, string]))
      .concat([['Concluído por', withRole(p.fechadoPor || '') + ' a ' + fmtDate(when)]]),
    nota: 'Documento gerado pela defiro quando o procedimento foi fechado.',
  }
}

/** A simulated preview of a file joined to the request */
export function attachmentDoc(p: Request, a: FileRef): DocContent {
  const n = String(a.nome).toLowerCase()
  const d = p.d
  let titulo = 'Documento junto'
  let linhas: Array<[string, string]>
  if (/certificado/.test(n)) {
    titulo = 'Certificado de presença'
    linhas = [
      ['Participante', p.req.nome],
      ['Ação', d.desc || d.motivo || '—'],
      ['Local', d.destino || '—'],
      ['Datas de presença', fmtDate(d.certIni) + (d.certFim && d.certFim !== d.certIni ? ' a ' + fmtDate(d.certFim) : '')],
      ['Entidade', 'Instituto Nacional de Administração'],
    ]
  } else if (/bilhete|comboio|autocarro/.test(n)) {
    titulo = 'Bilhete de transporte'
    const x = p.desp.find((y) => /Comboio|Autocarro/.test(y.tipo))
    linhas = [
      ['Passageiro', p.req.nome],
      ['Percurso', x?.desc || '—'],
      ['Data', fmtDate(x?.data)],
      ['Valor', eur(x?.valor || 0)],
    ]
  } else if (/fatura|hotel|aloj|almoco/.test(n)) {
    titulo = 'Fatura'
    const x = p.desp.find((y) => /Alojamento|Refeição/.test(y.tipo))
    linhas = [
      ['Cliente', p.req.nome + ' · NIF ' + p.req.nif],
      ['Descrição', (x?.tipo || '—') + (x?.desc ? ' · ' + x.desc : '')],
      ['Data', fmtDate(x?.data)],
      ['Total', eur(x?.valor || 0)],
    ]
  } else
    linhas = [
      ['Ficheiro', a.nome],
      ['Tamanho', a.kb + ' KB'],
      ['Junto a', fmtDateTime(a.quando)],
    ]
  return { titulo, sub: a.nome, ficheiro: a.nome, linhas, nota: 'Pré-visualização simulada no protótipo. Na aplicação real aparece o ficheiro original.' }
}
