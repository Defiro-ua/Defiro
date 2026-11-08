import { useState, type ReactNode } from 'react'
import { Navigate, useParams } from 'react-router'
import { IconButton } from '../components/Button'
import { Chip } from '../components/Chip'
import { ArrowHint, DateInput, FieldError, FileDrop, NoteFrom, Optional, Req, StepError, StepHeading, WizardFooter } from '../components/form'
import { Icon } from '../components/Icon'
import { WizardLayout } from '../components/layout/WizardLayout'
import {
  dateFromText,
  dateLimits,
  dateMessage,
  fmtDate,
  fmtDateTime,
  maskDate,
  maskTime,
  now,
  textOf,
  timeMessage,
  timeOk,
} from '../domain/dates'
import { personas, withRole } from '../domain/people'
import { allowance, dateConflict, eur, expensesSum, maskIban, maskNif, parseNumber, tripDays, validateTrip, type FormError } from '../domain/trip'
import type { Expense, FileRef, FormField, PersonaId, Request, TripData, Workflow } from '../domain/types'
import { canStart, handlerName, workflowById } from '../domain/workflows'
import { optionsOf } from '../domain/designer'
import { cx } from '../lib/cx'
import { focusSoon } from '../lib/focus'
import { describedBy, enterMovesOn, inputClass, optionClass, radioClass, textareaClass } from '../lib/formStyles'
import { paths } from '../routes'
import { useDemo } from '../state/demoContext'
import { useFeedback } from '../state/feedbackContext'

type StepDef = {
  k: string
  nome: string
  q: string
  ajuda: string
  /** Fields of the step, by element id */
  ids: string[]
  /** Fields reviewers can leave notes on */
  nk: string[]
  opc?: boolean
}

type DateText = { d: string; h: string }

type NewExpense = { tipo: string; desc: string; data: string; dataTxt: string; valor: string; comp: FileRef | null }
type ExpenseErrorCode = { data?: 'vazio' | 'semViagem' | 'fora' | 'formato'; valor?: 'vazio' | 'zero'; comp?: 'vazio' }

type FormState = { d: TripData; desp: Expense[]; cert: FileRef | null; anexos: FileRef[]; val: Record<string, string> }

const fileOf = (f: File): FileRef => ({ nome: f.name, kb: Math.max(1, Math.round(f.size / 1024)), quando: now(), novo: true })

/** What the form starts with: the profile's NIF and IBAN, or the request being corrected */
function initialForm(ped: Request | null, me: { nif: string; iban: string }): FormState {
  if (ped) {
    // split the request's files: the certificate, one receipt per expense, and other documents
    const files = ped.anexos.map((x) => ({ ...x, novo: false }))
    const ac = ped.wf === 'ac'
    const cert = ac ? files.find((a) => /certificado/i.test(a.nome)) || null : null
    const desp = ped.desp.map((x) => ({ ...x, comp: x.comp ? { ...(files.find((a) => a.nome === x.comp?.nome) || {}), ...x.comp, novo: false } : null }))
    const used = new Set<string>()
    if (cert) used.add(cert.nome)
    desp.forEach((x) => x.comp && used.add(x.comp.nome))
    return { d: { ...ped.d, nif: ped.req.nif, iban: ped.req.iban }, desp, cert, anexos: files.filter((a) => !used.has(a.nome)), val: { ...(ped.val || {}) } }
  }
  return {
    d: { nif: me.nif, iban: me.iban, motivo: 'Formação', destino: '', desc: '', partida: '', regresso: '', certIni: '', certFim: '', transporte: '' },
    desp: [],
    cert: null,
    anexos: [],
    val: {},
  }
}

const errorText = 'Para continuar, corrija o campo assinalado.'

/** E04 · Formulário do pedido, passo a passo (UC13, UC15) · E07 · Corrigir pedido devolvido (UC19, UC20) */
export function RequestFormPage({ persona, mode }: { persona: PersonaId; mode: 'novo' | 'corrigir' }) {
  const { wf: wfId, id } = useParams()
  const { pedidos, wfs } = useDemo()
  const ped = mode === 'corrigir' ? pedidos.find((p) => p.id === id) || null : null
  if (mode === 'corrigir' && (!ped || ped.estado !== 'devolvido' || ped.requerente !== persona)) return <Navigate to={paths.inbox} replace />
  // opening the form by its address checks the same rule as the list in «Novo pedido»
  if (mode === 'novo' && !wfs.some((w) => w.id === wfId && canStart(w, persona))) return <Navigate to={paths.newRequest} replace />
  const wf = workflowById(wfs, ped ? ped.wf : wfId || 'ac')
  return <RequestForm key={(ped?.id || wf.id) + persona} persona={persona} wf={wf} ped={ped} />
}

function RequestForm({ persona, wf, ped }: { persona: PersonaId; wf: Workflow; ped: Request | null }) {
  const { submeter, reenviar } = useDemo()
  const feedback = useFeedback()
  const me = personas[persona]
  const correcting = !!ped
  const ac = wf.id === 'ac'

  const [form, setForm] = useState<FormState>(() => initialForm(ped, me))
  const { d, desp, cert, anexos, val } = form
  const genericFields: FormField[] = ac ? [] : (wf.passos[0]?.campos || []).filter((c) => c.origem === 'req')
  const [dt, setDt] = useState<Record<string, DateText>>(() => {
    const t: Record<string, DateText> = {
      partida: textOf(d.partida),
      regresso: textOf(d.regresso),
      certIni: textOf(d.certIni),
      certFim: textOf(d.certFim),
    }
    genericFields.forEach((c) => {
      if (c.tipo === 'Data' || c.tipo === 'Data e hora') t['g-' + c.id] = textOf(val[c.id])
    })
    return t
  })
  const [step, setStep] = useState<string>(correcting ? 'rever' : 'dados')
  const [fromReview, setFromReview] = useState(false)
  const [tried, setTried] = useState<Record<string, boolean>>({})
  const [triedAll, setTriedAll] = useState(false)
  const [adding, setAdding] = useState(false)
  const [nd, setNd] = useState<NewExpense>({ tipo: 'Comboio', desc: '', data: '', dataTxt: '', valor: '', comp: null })
  const [ndErr, setNdErr] = useState<ExpenseErrorCode>({})
  const [ndPending, setNdPending] = useState(false)


  const setD = (patch: Partial<TripData>) => setForm((f) => ({ ...f, d: { ...f.d, ...patch } }))
  const setVal = (k: string, v: string) => setForm((f) => ({ ...f, val: { ...f.val, [k]: v } }))
  const lim = dateLimits(d)

  // dates are typed as dd/mm/aaaa (and hh:mm); the ISO value only exists once the text is a real date
  const withTime = (k: string) => k === 'partida' || k === 'regresso' || (k.startsWith('g-') && genericFields.find((c) => 'g-' + c.id === k)?.tipo === 'Data e hora')
  const isoOf = (k: string, t: DateText) => {
    const day = dateFromText(t.d)
    if (!day) return ''
    if (!withTime(k)) return day
    return timeOk(t.h) ? day + 'T' + t.h : ''
  }
  const writeDate = (k: string, t: DateText) => {
    setDt((all) => ({ ...all, [k]: t }))
    const iso = isoOf(k, t)
    if (k.startsWith('g-')) setVal(k.slice(2), iso)
    else setD({ [k]: iso } as Partial<TripData>)
  }
  const dtOf = (k: string): DateText => dt[k] || { d: '', h: '' }
  const formatMessage = (k: string) => {
    const t = dtOf(k)
    return dateMessage(t.d) || (withTime(k) && dateFromText(t.d) ? timeMessage(t.h) : '')
  }

  // every problem of the request; impossible values show at once, missing ones once the person tries to continue
  let errors: FormError[] = []
  if (ac) {
    errors = validateTrip(d, desp, cert)
    for (const k of ['partida', 'regresso', 'certIni', 'certFim']) {
      const m = formatMessage(k)
      if (!m) continue
      const fid = 'campo-' + k
      const e = errors.find((x) => x.id === fid)
      if (e) e.txt = m
      else errors.push({ id: fid, txt: m })
    }
  } else {
    const L0 = dateLimits({})
    for (const c of genericFields) {
      if (c.tipo === 'Ficheiros') continue
      const v = String(val[c.id] || '').trim()
      const fid = 'g-' + c.id
      const mf = c.tipo === 'Data' || c.tipo === 'Data e hora' ? formatMessage(fid) : ''
      if (mf) {
        errors.push({ id: fid, txt: `«${c.rot}»: ${mf}` })
        continue
      }
      if (!v) {
        if (c.obrig) errors.push({ id: fid, txt: (c.tipo === 'Escolha única' || c.tipo === 'Sim ou não' ? 'Escolha uma opção em «' : 'Preencha «') + c.rot + '».' })
        continue
      }
      if (c.tipo === 'Número' && !/^-?\d+([.,]\d+)?$/.test(v.replace(/\s/g, ''))) errors.push({ id: fid, txt: `«${c.rot}» só aceita algarismos, por exemplo 12 ou 3,5.`, vivo: true })
      if (c.tipo === 'Data' && (v < L0.min || v > L0.max)) errors.push({ id: fid, txt: `A data em «${c.rot}» não é possível.`, vivo: true })
      if (c.tipo === 'Data e hora' && (v < L0.minDT || v > L0.maxDT)) errors.push({ id: fid, txt: `A data em «${c.rot}» não é possível.`, vivo: true })
    }
    if (genericFields.some((c) => c.tipo === 'Ficheiros' && c.obrig) && !anexos.length) errors.push({ id: 'campo-anexos', txt: 'Junte pelo menos um ficheiro.' })
  }

  // the form is a sequence of steps; each groups a few related questions
  const S = (k: string, nome: string, q: string, ajuda: string, ids: string[] = [], nk: string[] = [], opc?: boolean): StepDef => ({ k, nome, q, ajuda, ids, nk, opc })
  const filesRequired = !ac && genericFields.some((c) => c.tipo === 'Ficheiros' && c.obrig)
  let steps: StepDef[] = ac
    ? [
        S('dados', 'Os seus dados', 'Confirme os seus dados', 'Usamos o NIF e o IBAN para fazer o reembolso. Vêm do seu último pedido.', ['campo-nif', 'campo-iban'], ['nif', 'iban']),
        S('deslocacao', 'Deslocação', 'Para onde foi e porquê?', 'Indique o motivo e o destino da deslocação em serviço.', ['campo-motivo', 'campo-destino', 'campo-desc'], ['motivo', 'destino', 'desc']),
        S('datas', 'Datas', 'Quando foi a deslocação?', 'As ajudas de custo diárias são calculadas a partir destas datas.', ['campo-partida', 'campo-regresso'], ['partida', 'regresso']),
        S('cert', 'Certificado de presença', 'Junte o certificado de presença', 'Copie as datas que aparecem no certificado e junte o ficheiro.', ['campo-certIni', 'campo-certFim', 'campo-certFicheiro'], ['cert']),
        S('transporte', 'Transporte', 'Como se deslocou?', 'Escolha uma opção.', ['campo-transporte'], ['transporte']),
        S(
          'despesas',
          'Despesas',
          'Teve despesas com transporte, alojamento ou refeições?',
          'Junte cada despesa com o seu comprovativo: fatura, bilhete ou mapa de quilómetros. Se não teve, continue.',
          ['campo-despesas'],
          ['despesas'],
          true,
        ),
        S('anexos', 'Outros documentos', 'Quer juntar outros documentos?', 'Por exemplo a convocatória ou o programa da formação. Se não tiver, continue.', ['campo-anexos'], ['anexos'], true),
      ]
    : [S('dados', 'Os seus dados', 'Confirme os seus dados', 'Entram no pedido automaticamente.')]
        .concat(
          genericFields
            .filter((c) => c.tipo !== 'Ficheiros')
            .map((c) => S('g-' + c.id, c.rot, c.rot, c.obrig ? 'Resposta obrigatória.' : 'Pode deixar em branco.', ['g-' + c.id], [c.id], !c.obrig)),
        )
        .concat(
          genericFields.some((c) => c.tipo === 'Ficheiros')
            ? [S('anexos', 'Ficheiros', 'Junte os ficheiros do pedido', filesRequired ? 'Pelo menos um ficheiro.' : 'Se não tiver, continue.', ['campo-anexos'], ['anexos'], !filesRequired)]
            : [],
        )
  steps = steps.concat([
    S(
      'rever',
      correcting ? 'Rever e reenviar' : 'Rever e submeter',
      correcting ? 'Corrija o que foi assinalado e reenvie' : 'Confira o pedido antes de submeter',
      correcting ? 'Use «Corrigir» nas partes assinaladas. O resto do pedido mantém-se como estava.' : 'Pode alterar qualquer parte antes de submeter.',
    ),
  ])
  const keys = steps.map((s) => s.k)
  const current = keys.includes(step) ? step : correcting ? 'rever' : 'dados'
  const idx = keys.indexOf(current)
  const PA = steps[idx]
  const stepOfField: Record<string, string> = {}
  steps.forEach((s) => s.ids.forEach((fid) => (stepOfField[fid] = s.k)))
  const visible = errors.filter((e) => e.vivo || triedAll || tried[stepOfField[e.id]])
  const errorOf = (fid: string) => visible.find((x) => x.id === fid)?.txt || ''

  const openNotes = ped ? ped.notas.filter((n) => !n.resolvida).map((n) => ({ ...n, quem: withRole(n.quem) })) : []
  const notesOf = (k: string) => openNotes.filter((n) => n.campo === k)
  const notes = (k: string) => notesOf(k).map((n, i) => <NoteFrom key={'nota-' + i} quem={n.quem} texto={n.texto} />)

  /** wrong, error text and aria-describedby of an «Ajudas de custo» field */
  const fld = (k: string, help?: boolean) => {
    const er = errorOf('campo-' + k)
    return { wrong: !!er, error: er, desc: describedBy(help && 'ajuda-' + k, er && 'erro-' + k) }
  }
  const go = (k: string, review = false) => {
    setStep(k)
    setFromReview(review)
    setNdPending(false)
    focusSoon('passo-titulo')
  }

  const tripKnown = !!(d.partida && d.regresso)
  const days = tripDays(d)
  const conflict = ac ? dateConflict(d) : null
  const nextStep = correcting ? ped?.devolvidoEm || 1 : 1
  const nextTxt = `o passo «${wf.passos[nextStep]?.nome || ''}», com ${withRole(handlerName(wf, nextStep, ped || { req: { chefia: me.chefia } }))}`

  function submit() {
    if (errors.length) {
      setTriedAll(true)
      focusSoon('passo-erro')
      return
    }
    const all = ([] as FileRef[]).concat(cert ? [cert] : [], desp.map((x) => x.comp).filter((x): x is FileRef => !!x), anexos)
    const data = { d: { ...d }, desp: desp.map((x) => ({ ...x, comp: x.comp ? { nome: x.comp.nome, kb: x.comp.kb } : null })), anexos: all, val }
    if (ped) reenviar(ped.id, data)
    else submeter(wf.id, data)
  }

  function next() {
    if (current === 'rever') {
      submit()
      return
    }
    if (current === 'despesas' && adding) {
      setNdPending(true)
      focusSoon('nd-guardar')
      return
    }
    const mine = errors.filter((x) => PA.ids.includes(x.id))
    if (mine.length) {
      // a wrong time with a good date sends the person to the time box
      const fid = mine[0].id
      const k = fid.replace(/^campo-/, '')
      const target = withTime(k) && dateFromText(dtOf(k).d) && document.getElementById(fid + '-hora') ? fid + '-hora' : fid
      setTried((t) => ({ ...t, [current]: true }))
      focusSoon(target)
      return
    }
    go(fromReview ? 'rever' : keys[idx + 1])
  }

  // the step's own message, at the top
  const stepErrors = visible.filter((x) => PA.ids.includes(x.id) && tried[current])
  let stepError = ''
  if (current === 'rever' && triedAll && errors.length)
    stepError =
      errors.length === 1
        ? 'Ainda não pode submeter: falta corrigir 1 coisa, assinalada abaixo.'
        : `Ainda não pode submeter: faltam corrigir ${errors.length} coisas, assinaladas abaixo.`
  else if (current === 'despesas' && ndPending && adding) stepError = 'Acrescente a despesa que está a preencher, ou carregue em «Cancelar».'
  else if (stepErrors.length) stepError = stepErrors.length === 1 ? errorText : `Para continuar, corrija os ${stepErrors.length} campos assinalados.`

  const last = current === 'rever'
  const nextText = last ? (correcting ? 'Reenviar pedido' : 'Submeter pedido') : fromReview ? 'Guardar e voltar à revisão' : keys[idx + 1] === 'rever' ? 'Rever o pedido' : 'Continuar'

  // ——— the new expense being filled in
  const ndTexts = {
    data: {
      vazio: tripKnown ? 'Indique a data da despesa.' : 'Indique a data. Preencha antes a partida e o regresso.',
      semViagem: 'Preencha antes a partida e o regresso da deslocação.',
      fora: `Tem de estar entre ${fmtDate(lim.despMin)} e ${fmtDate(lim.despMax)}.`,
      formato: dateMessage(nd.dataTxt) || 'Escreva a data com dia, mês e ano: dd/mm/aaaa.',
    },
    valor: { vazio: 'Indique o valor da despesa.', zero: 'Indique um valor maior que zero, por exemplo 24,10.' },
    comp: { vazio: 'Junte o comprovativo desta despesa (fatura, bilhete ou mapa de quilómetros).' },
  }
  const ndE = {
    data: ndErr.data ? ndTexts.data[ndErr.data] : '',
    valor: ndErr.valor ? ndTexts.valor[ndErr.valor] : '',
    comp: ndErr.comp ? ndTexts.comp.vazio : '',
  }
  const ndCount = Object.values(ndE).filter(Boolean).length
  const clearNdErr = (k: keyof ExpenseErrorCode) => setNdErr((e) => ({ ...e, [k]: undefined }))
  const ndDate = (txt: string) => {
    setNd((x) => ({ ...x, dataTxt: txt, data: dateFromText(txt) }))
    clearNdErr('data')
  }
  function openExpense() {
    const start = (d.partida || '').slice(0, 10)
    setAdding(true)
    setNdErr({})
    setNd({ tipo: 'Comboio', desc: '', data: start, dataTxt: fmtDate(start), valor: '', comp: null })
    focusSoon('nd-desc')
  }
  function saveExpense() {
    // check every field at once, so the person sees all that is missing
    const v = parseNumber(nd.valor)
    const er: ExpenseErrorCode = {}
    if (!nd.data && String(nd.dataTxt || '').trim()) er.data = 'formato'
    else if (!nd.data) er.data = 'vazio'
    else if (!tripKnown) er.data = 'semViagem'
    else if (nd.data < lim.despMin || nd.data > lim.despMax) er.data = 'fora'
    if (!String(nd.valor || '').trim()) er.valor = 'vazio'
    else if (!(v > 0)) er.valor = 'zero'
    if (!nd.comp) er.comp = 'vazio'
    const first = (['data', 'valor', 'comp'] as const).find((k) => er[k])
    if (first) {
      setNdErr(er)
      focusSoon('nd-' + first)
      return
    }
    setForm((f) => ({ ...f, desp: f.desp.concat([{ tipo: nd.tipo, desc: nd.desc, data: nd.data, valor: v, comp: nd.comp }]) }))
    setAdding(false)
    setNdErr({})
    setNdPending(false)
    focusSoon('btn-despesa')
    feedback('Despesa acrescentada')
  }

  const addFiles = (files: File[]) => {
    if (!files.length) return
    setForm((f) => ({ ...f, anexos: f.anexos.concat(files.map(fileOf)) }))
    feedback(files.length === 1 ? 'Ficheiro junto' : `${files.length} ficheiros juntos`)
  }

  // ——— review: every answer, grouped by step, with a way back to change it
  const byKey: Record<string, StepDef> = {}
  steps.forEach((s) => (byKey[s.k] = s))
  const or = (v?: string) => (v ? String(v) : '—')
  type Section = { s: StepDef; rows: Array<{ rot: string; v: string }>; editable?: boolean }
  const sections: Section[] = !last
    ? []
    : ac
      ? [
          { s: byKey.dados, rows: [{ rot: 'NIF', v: or(d.nif) }, { rot: 'IBAN', v: or(d.iban) }] },
          { s: byKey.deslocacao, rows: [{ rot: 'Motivo', v: or(d.motivo) }, { rot: 'Destino', v: or(d.destino) }, { rot: 'Descrição', v: or(d.desc) }] },
          { s: byKey.datas, rows: [{ rot: 'Partida', v: d.partida ? fmtDateTime(d.partida) : '—' }, { rot: 'Regresso', v: d.regresso ? fmtDateTime(d.regresso) : '—' }] },
          {
            s: byKey.cert,
            rows: [
              { rot: 'Datas', v: d.certIni && d.certFim ? fmtDate(d.certIni) + ' a ' + fmtDate(d.certFim) : '—' },
              { rot: 'Ficheiro', v: cert ? cert.nome : 'Falta juntar' },
            ].concat(conflict ? [{ rot: 'Atenção', v: 'Não coincide com a deslocação. ' + conflict }] : []),
          },
          { s: byKey.transporte, rows: [{ rot: 'Transporte', v: or(d.transporte) }] },
          {
            s: byKey.despesas,
            rows: desp.length
              ? desp.map((x) => ({ rot: x.tipo + (x.desc ? ' · ' + x.desc : ''), v: `${fmtDate(x.data)} · ${eur(x.valor)} · ${x.comp ? x.comp.nome : 'sem comprovativo'}` }))
              : [{ rot: 'Despesas', v: 'Sem despesas.' }],
          },
          { s: byKey.anexos, rows: anexos.length ? anexos.map((a) => ({ rot: 'Ficheiro', v: a.nome })) : [{ rot: 'Ficheiros', v: 'Nenhum.' }] },
        ]
      : [
          {
            s: byKey.dados,
            rows: [
              { rot: 'Nome', v: me.nome },
              { rot: 'Unidade orgânica', v: or(me.unidade) },
              { rot: 'Chefia direta', v: or(me.chefia) },
            ],
            editable: false,
          } as Section,
        ]
          .concat(
            genericFields
              .filter((c) => c.tipo !== 'Ficheiros')
              .map((c) => {
                const v = val[c.id]
                return { s: byKey['g-' + c.id], rows: [{ rot: c.rot, v: !v ? '—' : c.tipo === 'Data' ? fmtDate(v) : c.tipo === 'Data e hora' ? fmtDateTime(v) : String(v) }] }
              }),
          )
          .concat(byKey.anexos ? [{ s: byKey.anexos, rows: anexos.length ? anexos.map((a) => ({ rot: 'Ficheiro', v: a.nome })) : [{ rot: 'Ficheiros', v: 'Nenhum.' }] }] : [])

  const datesOk = !errors.some((x) => x.id === 'campo-partida' || x.id === 'campo-regresso')
  const despSum = expensesSum(desp)
  const allow = allowance(d)

  // ——— the steps
  const tripChoice = (name: 'motivo' | 'transporte', options: string[], short?: boolean) =>
    options.map((v) => (
      <label key={v} className={optionClass(d[name] === v, short)}>
        <input type="radio" name={name} required value={v} checked={d[name] === v} onChange={() => setD({ [name]: v })} className={radioClass} />
        {v}
      </label>
    ))

  const dateBlock = (k: 'partida' | 'regresso', legend: string, help: string, min: string) => {
    const f = fld(k, true)
    const t = dtOf(k)
    return (
      <fieldset aria-describedby={f.desc} className="m-0 flex flex-col gap-1.5 border-0 p-0">
        <legend className="mb-1.5 p-0 text-[16px] leading-[22px] font-semibold">
          {legend} <Req />
          <span className="sr-only"> (obrigatório)</span>
        </legend>
        <span id={'ajuda-' + k} className="text-[14px] leading-5 text-ink-3">
          {help}
        </span>
        <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
          <div className="flex flex-[0_1_236px] flex-col gap-1">
            <label htmlFor={'campo-' + k} className="text-[14px] leading-5 font-semibold">
              Data <span className="font-normal text-ink-3">(dd/mm/aaaa)</span>
            </label>
            <DateInput
              id={'campo-' + k}
              calendarLabel={`Escolher a data de ${legend.toLowerCase()} no calendário`}
              text={t.d}
              iso={dateFromText(t.d)}
              min={min}
              max={lim.max}
              wrong={f.wrong}
              describedBy={f.desc}
              onText={(v) => writeDate(k, { ...t, d: maskDate(v) })}
              onPick={(iso) => writeDate(k, { ...t, d: fmtDate(iso) })}
            />
          </div>
          <div className="flex flex-[0_1_132px] flex-col gap-1">
            <label htmlFor={`campo-${k}-hora`} className="text-[14px] leading-5 font-semibold">
              Hora <span className="font-normal text-ink-3">(hh:mm)</span>
            </label>
            <input
              id={`campo-${k}-hora`}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="hh:mm"
              maxLength={5}
              value={t.h}
              onChange={(e) => writeDate(k, { ...t, h: maskTime(e.target.value) })}
              aria-invalid={f.wrong || undefined}
              aria-describedby={f.desc}
              className={inputClass(f.wrong)}
            />
          </div>
        </div>
        {f.error && <FieldError id={'erro-' + k}>{f.error}</FieldError>}
        {notes(k)}
      </fieldset>
    )
  }

  const certDate = (k: 'certIni' | 'certFim', label: string, min: string) => {
    const f = fld(k)
    const t = dtOf(k)
    const desc = describedBy('ajuda-cert', f.error && 'erro-' + k)
    return (
      <div className="flex flex-[0_1_260px] flex-col gap-1.5">
        <label htmlFor={'campo-' + k} className="text-[16px] leading-[22px] font-semibold">
          {label} <Req /> <span className="font-normal text-ink-3">(dd/mm/aaaa)</span>
        </label>
        <DateInput
          id={'campo-' + k}
          calendarLabel={`Escolher a data de ${label.toLowerCase()} no calendário`}
          text={t.d}
          iso={dateFromText(t.d)}
          min={min}
          max={lim.max}
          wrong={f.wrong}
          describedBy={desc}
          onText={(v) => writeDate(k, { ...t, d: maskDate(v) })}
          onPick={(iso) => writeDate(k, { ...t, d: fmtDate(iso) })}
        />
        {f.error && <FieldError id={'erro-' + k}>{f.error}</FieldError>}
      </div>
    )
  }

  const fileRow = (a: FileRef, onRemove: () => void, extra?: string) => (
    <>
      <Icon name="fileText" size={20} className="text-accent-ink" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[15px] font-semibold [overflow-wrap:anywhere]">{a.nome}</span>
        <span className="text-label-sm text-ink-3">
          {a.kb} KB · {a.novo ? 'acabado de juntar' : 'junto a ' + fmtDate(a.quando)}
        </span>
      </span>
      {a.novo && (
        <Chip tone="ok" size="xs">
          Novo
        </Chip>
      )}
      <IconButton icon="trash" danger label={`Remover ${extra || ''}${a.nome}`} onClick={onRemove} />
    </>
  )

  let body: ReactNode = null
  if (current === 'dados')
    body = (
      <div className="flex flex-col gap-6">
        <div className="edge flex items-start gap-3.5 rounded-item bg-soft px-4.5 py-4">
          <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-bg text-accent-ink">
            <Icon name="user" size={22} />
          </span>
          <div className="flex flex-col gap-0.5 text-[15px] leading-[22px]">
            <p className="m-0 text-[17px] leading-[25px] font-semibold">{me.nome}</p>
            <p className="m-0 text-ink-2">
              {me.papel} · {me.unidade}
            </p>
            <p className="m-0 text-ink-2">Chefia direta: {withRole(me.chefia)}</p>
            <p className="mt-1.5 mb-0 flex items-center gap-1.5 text-label-sm text-ink-3">
              <Icon name="lock" size={14} />
              Vêm do seu perfil e não se editam aqui.
            </p>
          </div>
        </div>
        {ac && (
          <>
            {(['nif', 'iban'] as const).map((k) => {
              const f = fld(k, true)
              return (
                <div key={k} className="flex flex-col gap-1.5">
                  <label htmlFor={'campo-' + k} className="text-[16px] leading-[22px] font-semibold">
                    {k === 'nif' ? 'NIF' : 'IBAN'} <Req />
                  </label>
                  <span id={'ajuda-' + k} className="text-[14px] leading-5 text-ink-3">
                    {k === 'nif' ? '9 algarismos. Os espaços aparecem sozinhos.' : 'A conta onde recebe o reembolso: PT50 e 21 algarismos, em grupos de 4.'}
                  </span>
                  <input
                    id={'campo-' + k}
                    type="text"
                    inputMode={k === 'nif' ? 'numeric' : undefined}
                    autoComplete="off"
                    required
                    maxLength={k === 'nif' ? 11 : 31}
                    placeholder={k === 'nif' ? '123 456 789' : 'PT50 0000 0000 0000 0000 0000 0'}
                    value={d[k] || ''}
                    onChange={(e) => setD({ [k]: k === 'nif' ? maskNif(e.target.value) : maskIban(e.target.value) })}
                    aria-invalid={f.wrong || undefined}
                    aria-describedby={f.desc}
                    className={inputClass(f.wrong, k === 'nif' ? 'max-w-[220px] tracking-[0.04em] tabular-nums' : 'max-w-[460px] tracking-[0.03em] uppercase tabular-nums')}
                  />
                  {f.error && <FieldError id={'erro-' + k}>{f.error}</FieldError>}
                  {notes(k)}
                </div>
              )
            })}
          </>
        )}
      </div>
    )
  else if (current === 'deslocacao') {
    const fDest = fld('destino')
    body = (
      <div className="flex flex-col gap-6">
        <fieldset id="campo-motivo" tabIndex={-1} className="m-0 flex flex-col gap-2 border-0 p-0 outline-none">
          <legend className="mb-2 p-0 text-[16px] leading-[22px] font-semibold">
            Motivo <Req />
            <span className="sr-only"> (obrigatório)</span>
          </legend>
          <ArrowHint />
          <div className="flex flex-wrap gap-2.5">{tripChoice('motivo', ['Formação', 'Reunião', 'Serviço externo'], true)}</div>
          {notes('motivo')}
        </fieldset>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="campo-destino" className="text-[16px] leading-[22px] font-semibold">
            Destino <Req />
          </label>
          <input
            id="campo-destino"
            type="text"
            required
            autoComplete="off"
            placeholder="Ex.: Lisboa"
            value={d.destino}
            onChange={(e) => setD({ destino: e.target.value })}
            aria-invalid={fDest.wrong || undefined}
            aria-describedby={fDest.desc}
            className={inputClass(fDest.wrong, 'max-w-[420px]')}
          />
          {fDest.error && <FieldError id="erro-destino">{fDest.error}</FieldError>}
          {notes('destino')}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="campo-desc" className="text-[16px] leading-[22px] font-semibold">
            Descrição <Optional />
          </label>
          <input
            id="campo-desc"
            type="text"
            autoComplete="off"
            placeholder="Ex.: Formação em Contratação Pública"
            value={d.desc}
            onChange={(e) => setD({ desc: e.target.value })}
            className={inputClass()}
          />
          {notes('desc')}
        </div>
      </div>
    )
  } else if (current === 'datas')
    body = (
      <div className="flex flex-col gap-6">
        {dateBlock('partida', 'Partida', 'Dia e hora em que saiu. Ex.: 12/10/2026 e 08:30.', lim.min)}
        {dateBlock('regresso', 'Regresso', 'Tem de ser depois da partida.', lim.regressoMinD)}
        <div aria-live="polite">
          {tripKnown && datesOk && (
            <p className="edge m-0 flex items-center gap-2.5 rounded-md bg-success-soft px-4 py-3.5 text-[15px] leading-[22px] text-ink">
              <Icon name="check" size={18} className="text-success" />
              <span>
                São {days === 1 ? '1 dia' : days + ' dias'} de ajudas de custo: {eur(allow)}.
              </span>
            </p>
          )}
        </div>
      </div>
    )
  else if (current === 'cert') {
    const fFile = fld('certFicheiro')
    body = (
      <fieldset aria-describedby="ajuda-cert" className="m-0 flex flex-col gap-6 border-0 p-0">
        <legend className="sr-only">Certificado de presença (obrigatório)</legend>
        <span id="ajuda-cert" className="text-[14px] leading-5 text-ink-3">
          O fim não pode ser antes do início. O sistema compara estas datas com as da deslocação.
        </span>
        <div className="flex flex-wrap gap-x-6 gap-y-5">
          {certDate('certIni', 'Início', lim.min)}
          {certDate('certFim', 'Fim', lim.certFimMin)}
        </div>
        <div id="campo-certFicheiro" tabIndex={-1} className="flex flex-col gap-1.5 outline-none">
          <span id="rotulo-certificado" className="text-[16px] leading-[22px] font-semibold">
            Ficheiro do certificado <Req />
            <span className="sr-only"> (obrigatório)</span>
          </span>
          {cert ? (
            <div className="flex items-center gap-3 rounded-md border border-line-strong bg-panel py-2 pr-2 pl-3">
              {fileRow(
                cert,
                () => {
                  setForm((f) => ({ ...f, cert: null }))
                  focusSoon('campo-certFicheiro')
                  feedback('Certificado removido')
                },
                'o certificado ',
              )}
            </div>
          ) : (
            <FileDrop
              labelledBy="rotulo-certificado"
              describedBy={describedBy('ajuda-cert', fFile.error && 'erro-certFicheiro')}
              required
              wrong={fFile.wrong}
              onFiles={(files) => {
                setForm((f) => ({ ...f, cert: fileOf(files[0]) }))
                feedback('Certificado junto')
              }}
              className="flex flex-wrap items-center gap-x-2.5 gap-y-2 bg-panel px-4 py-3.5"
            >
              <Icon name="upload" size={20} className="text-accent-ink" />
              <span className="text-[15px] font-semibold">
                Arraste o certificado ou <span className="text-accent-ink underline underline-offset-4">escolha do computador</span>
                <span className="font-normal text-ink-3"> · PDF, JPG ou PNG</span>
              </span>
            </FileDrop>
          )}
          {fFile.error && <FieldError id="erro-certFicheiro">{fFile.error}</FieldError>}
        </div>
        {notes('cert')}
        <div aria-live="polite" className="text-[15px] leading-[22px] font-semibold">
          {conflict === '' && (
            <span className="flex items-center gap-1.5 text-success">
              <Icon name="check" size={18} /> As datas coincidem com a deslocação.
            </span>
          )}
          {!!conflict && (
            <span className="flex animate-surge items-start gap-2.5 rounded-md border-2 border-error bg-error-soft px-3.5 py-3 font-normal text-ink">
              <Icon name="alertTriangle" size={20} className="mt-px text-error" />
              <span>
                <strong className="block font-bold text-error">As datas não coincidem com a deslocação.</strong>
                {conflict} Pode continuar, mas o pedido vai ser assinalado na validação final.
              </span>
            </span>
          )}
        </div>
      </fieldset>
    )
  } else if (current === 'transporte') {
    const f = fld('transporte')
    body = (
      <fieldset id="campo-transporte" tabIndex={-1} aria-describedby={f.desc} className="m-0 flex flex-col gap-2.5 border-0 p-0 outline-none">
        <legend className="sr-only">Transporte (obrigatório)</legend>
        <ArrowHint />
        {tripChoice('transporte', ['Viatura própria', 'Transportes públicos', 'Viatura de serviço'])}
        {f.error && <FieldError id="erro-transporte">{f.error}</FieldError>}
        {notes('transporte')}
      </fieldset>
    )
  } else if (current === 'despesas') {
    const f = fld('despesas')
    const ndF = (k: 'data' | 'valor' | 'comp', help?: boolean) => ({ wrong: !!ndE[k], error: ndE[k], desc: describedBy(help && 'ajuda-nd-' + k, ndE[k] && 'nd-erro-' + k) })
    const nf = { data: ndF('data', true), valor: ndF('valor', true), comp: ndF('comp') }
    body = (
      <div id="campo-despesas" tabIndex={-1} className="flex flex-col gap-4 outline-none">
        {notes('despesas')}
        {f.error && <FieldError id="erro-despesas">{f.error}</FieldError>}
        {desp.length > 0 && (
          <>
            <div className="overflow-x-auto rounded-md border border-line bg-panel">
              <table className="w-full min-w-[600px] border-collapse text-[15px]">
                <caption className="sr-only">Despesas do pedido</caption>
                <thead>
                  <tr className="bg-soft text-left">
                    {['Despesa', 'Data', 'Comprovativo'].map((h) => (
                      <th key={h} scope="col" className="px-4 py-3 text-label-sm font-semibold text-ink-2">
                        {h}
                      </th>
                    ))}
                    <th scope="col" className="px-4 py-3 text-right text-label-sm font-semibold text-ink-2">
                      Valor
                    </th>
                    <th scope="col" className="w-16 px-4 py-3">
                      <span className="sr-only">Remover</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {desp.map((x, i) => {
                    const nome = x.tipo + (x.desc ? ' · ' + x.desc : '')
                    const outside = tripKnown && !!x.data && (x.data < lim.despMin || x.data > lim.despMax)
                    return (
                      <tr key={i} className="border-t border-line">
                        <td className="px-4 py-3">{nome}</td>
                        <td className="px-4 py-3 tabular-nums">
                          {fmtDate(x.data)}
                          {outside && (
                            <span className="mt-1 flex items-center gap-1 text-caption font-semibold text-error">
                              <Icon name="alertCircle" size={14} />
                              Fora das datas da deslocação
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 text-[14px] [overflow-wrap:anywhere]">
                            <Icon name="paperclip" size={16} className="text-accent-ink" />
                            {x.comp ? x.comp.nome : 'Falta o comprovativo'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">{eur(x.valor)}</td>
                        <td className="px-2 py-1 text-right">
                          <IconButton
                            icon="trash"
                            danger
                            label={`Remover a despesa ${nome}`}
                            onClick={() => {
                              setForm((s) => ({ ...s, desp: s.desp.filter((_, j) => j !== i) }))
                              focusSoon('btn-despesa')
                              feedback('Despesa removida')
                            }}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="m-0 flex justify-between gap-3 text-[16px] font-semibold">
              <span>Total das despesas</span>
              <span className="tabular-nums">{eur(despSum)}</span>
            </p>
          </>
        )}
        {adding ? (
          <fieldset
            onKeyDown={(e) => {
              const t = e.target as HTMLInputElement
              if (e.key === 'Enter' && t.tagName === 'INPUT' && t.type !== 'file') {
                e.preventDefault()
                e.stopPropagation()
                saveExpense()
              }
            }}
            className="m-0 flex flex-col gap-3.5 rounded-md border border-line-strong bg-tint px-5 py-4.5"
          >
            <legend className="-ml-1.5 px-1.5 text-[16px] font-semibold">Nova despesa</legend>
            <p className="m-0 text-label-sm leading-[19px] text-ink-3">
              Os campos com <Req />
              <span className="sr-only">asterisco</span> são obrigatórios.
            </p>
            <div className="flex flex-wrap gap-x-4.5 gap-y-3.5">
              <div className="flex flex-[1_1_180px] flex-col gap-1.5">
                <label htmlFor="nd-tipo" className="text-[14px] font-semibold">
                  Tipo <Req />
                </label>
                <select id="nd-tipo" required value={nd.tipo} onChange={(e) => setNd((x) => ({ ...x, tipo: e.target.value }))} className={inputClass()}>
                  <option value="Comboio">Comboio</option>
                  <option value="Autocarro">Autocarro</option>
                  <option value="Quilómetros">Quilómetros (viatura própria)</option>
                  <option value="Alojamento">Alojamento</option>
                  <option value="Refeição">Refeição</option>
                  <option value="Outra">Outra</option>
                </select>
              </div>
              <div className="flex flex-[2_1_240px] flex-col gap-1.5">
                <label htmlFor="nd-desc" className="text-[14px] font-semibold">
                  Descrição <Optional />
                </label>
                <input id="nd-desc" type="text" placeholder="Ex.: Aveiro – Lisboa" value={nd.desc} onChange={(e) => setNd((x) => ({ ...x, desc: e.target.value }))} className={inputClass()} />
              </div>
              <div className="flex flex-[1_1_220px] flex-col gap-1.5">
                <label htmlFor="nd-data" className="text-[14px] font-semibold">
                  Data <Req /> <span className="font-normal text-ink-3">(dd/mm/aaaa)</span>
                </label>
                <span id="ajuda-nd-data" className="text-[12.5px] leading-[17px] text-ink-3">
                  {tripKnown
                    ? `Entre ${fmtDate(lim.despMin)} e ${fmtDate(lim.despMax)} (datas da deslocação).`
                    : 'Tem de estar entre a partida e o regresso. Preencha-os antes.'}
                </span>
                <DateInput
                  id="nd-data"
                  calendarLabel="Escolher a data da despesa no calendário"
                  text={nd.dataTxt}
                  iso={nd.data}
                  min={lim.despMin}
                  max={lim.despMax}
                  wrong={nf.data.wrong}
                  describedBy={nf.data.desc}
                  onText={(v) => ndDate(maskDate(v))}
                  onPick={(iso) => ndDate(fmtDate(iso))}
                />
                {nf.data.error && <FieldError id="nd-erro-data">{nf.data.error}</FieldError>}
              </div>
              <div className="flex flex-[0_1_200px] flex-col gap-1.5">
                <label htmlFor="nd-valor" className="text-[14px] font-semibold">
                  Valor <Req />
                </label>
                <span id="ajuda-nd-valor" className="text-[12.5px] leading-[17px] text-ink-3">
                  Em euros, com vírgula. Ex.: 24,10
                </span>
                <span className="relative flex max-w-[200px]">
                  <input
                    id="nd-valor"
                    type="text"
                    inputMode="decimal"
                    required
                    placeholder="0,00"
                    value={nd.valor}
                    onChange={(e) => {
                      const v = e.target.value
                      setNd((x) => ({ ...x, valor: v }))
                      clearNdErr('valor')
                    }}
                    aria-invalid={nf.valor.wrong || undefined}
                    aria-describedby={nf.valor.desc}
                    className={inputClass(nf.valor.wrong, 'pr-10 text-right tabular-nums')}
                  />
                  <span aria-hidden="true" className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-[16px] font-semibold text-ink-2">
                    €
                  </span>
                </span>
                {nf.valor.error && <FieldError id="nd-erro-valor">{nf.valor.error}</FieldError>}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <span id="rotulo-comprovativo" className="text-[14px] font-semibold">
                Comprovativo <Req />
                <span className="sr-only"> (obrigatório)</span>
              </span>
              {nd.comp ? (
                <div className="flex items-center gap-2.5 rounded-md border border-line-strong bg-panel py-1.5 pr-1.5 pl-3">
                  <Icon name="paperclip" size={18} className="text-accent-ink" />
                  <span className="min-w-0 flex-1 text-[14px] font-semibold [overflow-wrap:anywhere]">{nd.comp.nome}</span>
                  <IconButton
                    icon="trash"
                    iconSize={16}
                    danger
                    label={`Remover o comprovativo ${nd.comp.nome}`}
                    onClick={() => {
                      setNd((x) => ({ ...x, comp: null }))
                      focusSoon('nd-comp')
                    }}
                  />
                </div>
              ) : (
                <FileDrop
                  inputId="nd-comp"
                  labelledBy="rotulo-comprovativo"
                  describedBy={nf.comp.desc}
                  required
                  wrong={nf.comp.wrong}
                  onFiles={(files) => {
                    setNd((x) => ({ ...x, comp: fileOf(files[0]) }))
                    clearNdErr('comp')
                  }}
                  className="flex flex-wrap items-center gap-x-2.5 gap-y-2 bg-panel px-3.5 py-3"
                >
                  <Icon name="upload" size={18} className="text-accent-ink" />
                  <span className="text-[14px] font-semibold">
                    Arraste a fatura ou o bilhete, ou <span className="text-accent-ink underline underline-offset-4">escolha do computador</span>
                  </span>
                </FileDrop>
              )}
            </div>
            {nf.comp.error && <FieldError id="nd-erro-comp">{nf.comp.error}</FieldError>}
            {ndCount > 0 && (
              <p role="alert" className="m-0 text-[14px] leading-5 font-semibold text-error">
                {ndCount === 1
                  ? 'A despesa ainda não foi acrescentada: corrija o campo assinalado.'
                  : `A despesa ainda não foi acrescentada: corrija os ${ndCount} campos assinalados.`}
              </p>
            )}
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setAdding(false)
                  setNdErr({})
                  setNdPending(false)
                  focusSoon('btn-despesa')
                }}
                className="box-border inline-flex min-h-11 items-center justify-center rounded-pill border-emph border-field bg-bg px-4 text-[14px] font-semibold text-ink hover:bg-soft"
              >
                Cancelar
              </button>
              <button
                type="button"
                id="nd-guardar"
                onClick={saveExpense}
                className="box-border inline-flex min-h-11 items-center justify-center gap-2 rounded-pill border-0 bg-brand px-4 text-[14px] font-semibold text-on-brand hover:brightness-107"
              >
                <Icon name="check" size={18} />
                Acrescentar despesa
              </button>
            </div>
          </fieldset>
        ) : (
          <button
            type="button"
            id="btn-despesa"
            onClick={openExpense}
            className="box-border inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-pill border-emph border-field bg-bg px-4 text-[14px] font-semibold text-ink hover:bg-soft"
          >
            <Icon name="plus" size={18} />
            {desp.length ? 'Adicionar outra despesa' : 'Adicionar despesa'}
          </button>
        )}
      </div>
    )
  } else if (current === 'anexos') {
    const f = fld('anexos', true)
    body = (
      <div id="campo-anexos" tabIndex={-1} className="flex flex-col gap-4 outline-none">
        {notes('anexos')}
        <FileDrop
          label={ac ? 'Juntar outros documentos' : 'Juntar ficheiros'}
          describedBy={describedBy('ajuda-anexos', f.error && 'erro-anexos')}
          required={filesRequired}
          wrong={f.wrong}
          multiple
          onFiles={addFiles}
          className="flex flex-col items-center gap-2 bg-bg px-6 py-7 text-center"
        >
          <span aria-hidden="true" className="grid size-12 place-items-center rounded-md bg-soft text-accent-ink">
            <Icon name="upload" size={22} />
          </span>
          <span className="text-[15px] font-semibold">
            Arraste os ficheiros para aqui ou <span className="text-accent-ink underline underline-offset-4">escolha do computador</span>
          </span>
          <span id="ajuda-anexos" className="text-label-sm text-ink-3">
            PDF, JPG ou PNG até 10 MB.
          </span>
        </FileDrop>
        {f.error && <FieldError id="erro-anexos">{f.error}</FieldError>}
        {anexos.length > 0 && (
          <ul aria-label="Ficheiros juntos" className="edge m-0 list-none rounded-md bg-soft px-5 py-1">
            {anexos.map((a, i) => (
              <li key={a.nome + i} className={cx('flex items-center gap-3.5 py-3', i > 0 && 'border-t border-line-strong')}>
                <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-tile bg-bg text-accent-ink">
                  <Icon name="fileText" size={20} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[15px] font-semibold [overflow-wrap:anywhere]">{a.nome}</span>
                  <span className="text-label-sm text-ink-3">
                    {a.kb} KB · {a.novo ? 'acabado de juntar' : 'junto a ' + fmtDate(a.quando)}
                  </span>
                </span>
                {a.novo && (
                  <Chip tone="ok" size="xs">
                    Novo
                  </Chip>
                )}
                <IconButton
                  icon="trash"
                  danger
                  label={`Remover ${a.nome}`}
                  onClick={() => {
                    setForm((s) => ({ ...s, anexos: s.anexos.filter((_, j) => j !== i) }))
                    feedback('Ficheiro removido')
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  } else if (current.startsWith('g-')) {
    const c = genericFields.find((x) => 'g-' + x.id === current)
    if (c) {
      const fid = 'g-' + c.id
      const er = errorOf(fid)
      const v = val[c.id] || ''
      const choice = c.tipo === 'Escolha única' || c.tipo === 'Sim ou não'
      const isDate = c.tipo === 'Data' || c.tipo === 'Data e hora'
      const help =
        c.tipo === 'Número'
          ? 'Só algarismos. Ex.: 12 ou 3,5'
          : c.tipo === 'Data'
            ? 'Data com dia, mês e ano: dd/mm/aaaa, por exemplo 12/10/2026.'
            : c.tipo === 'Data e hora'
              ? 'Data como dd/mm/aaaa e hora como hh:mm, por exemplo 12/10/2026 e 08:30.'
              : ''
      const desc = describedBy(help && 'ajuda-' + fid, er && 'erro-' + fid)
      const t = dtOf(fid)
      const L1 = dateLimits({})
      const options = c.tipo === 'Sim ou não' ? ['Sim', 'Não'] : optionsOf(c.opcoes)
      body = (
        <div className="flex flex-col gap-2">
          {!choice && (
            <>
              <label htmlFor={fid} className="sr-only">
                {c.rot}
                {c.obrig && ' (obrigatório)'}
              </label>
              {help && (
                <span id={'ajuda-' + fid} className="text-[14px] leading-5 text-ink-3">
                  {help}
                </span>
              )}
              {c.tipo === 'Texto longo' && (
                <textarea
                  id={fid}
                  rows={4}
                  required={c.obrig}
                  value={v}
                  onChange={(e) => setVal(c.id, e.target.value)}
                  aria-invalid={!!er || undefined}
                  aria-describedby={desc}
                  className={textareaClass(!!er, 'min-h-24 px-4 py-3 leading-6')}
                />
              )}
              {isDate && (
                <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
                  <div className="flex flex-[0_1_236px] flex-col gap-1">
                    <span aria-hidden="true" className="text-[14px] leading-5 font-semibold">
                      Data <span className="font-normal text-ink-3">(dd/mm/aaaa)</span>
                    </span>
                    <DateInput
                      id={fid}
                      calendarLabel="Escolher no calendário"
                      text={t.d}
                      iso={dateFromText(t.d)}
                      min={L1.min}
                      max={L1.max}
                      wrong={!!er}
                      describedBy={desc}
                      onText={(x) => writeDate(fid, { ...t, d: maskDate(x) })}
                      onPick={(iso) => writeDate(fid, { ...t, d: fmtDate(iso) })}
                    />
                  </div>
                  {c.tipo === 'Data e hora' && (
                    <div className="flex flex-[0_1_132px] flex-col gap-1">
                      <label htmlFor={fid + '-hora'} className="text-[14px] leading-5 font-semibold">
                        Hora <span className="font-normal text-ink-3">(hh:mm)</span>
                      </label>
                      <input
                        id={fid + '-hora'}
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="hh:mm"
                        maxLength={5}
                        value={t.h}
                        onChange={(e) => writeDate(fid, { ...t, h: maskTime(e.target.value) })}
                        aria-invalid={!!er || undefined}
                        aria-describedby={desc}
                        className={inputClass(!!er)}
                      />
                    </div>
                  )}
                </div>
              )}
              {!isDate && c.tipo !== 'Texto longo' && (
                <input
                  id={fid}
                  type="text"
                  inputMode={c.tipo === 'Número' ? 'decimal' : 'text'}
                  required={c.obrig}
                  value={v}
                  onChange={(e) => setVal(c.id, e.target.value)}
                  aria-invalid={!!er || undefined}
                  aria-describedby={desc}
                  className={inputClass(!!er, c.tipo === 'Número' ? 'max-w-[220px] tabular-nums' : undefined)}
                />
              )}
            </>
          )}
          {choice && (
            <fieldset id={fid} tabIndex={-1} aria-describedby={desc} className="m-0 flex flex-col gap-2.5 border-0 p-0 outline-none">
              <legend className="sr-only">
                {c.rot}
                {c.obrig && ' (obrigatório)'}
              </legend>
              <ArrowHint />
              {(options.length ? options : ['Opção 1', 'Opção 2']).map((o) => (
                <label key={o} className={optionClass(v === o)}>
                  <input type="radio" name={fid} required={c.obrig} value={o} checked={v === o} onChange={() => setVal(c.id, o)} className={radioClass} />
                  {o}
                </label>
              ))}
            </fieldset>
          )}
          {er && <FieldError id={'erro-' + fid}>{er}</FieldError>}
          {notes(c.id)}
        </div>
      )
    }
  } else if (last)
    body = (
      <div className="flex flex-col gap-4">
        {correcting && ped && (
          <div className="edge flex flex-col gap-1.5 rounded-md bg-warning-soft px-5 py-4.5 text-ink">
            <p className="m-0 flex items-center gap-2.5 text-[17px] leading-6 font-semibold">
              <Icon name="reset" size={20} className="text-warning" />
              Devolvido por {withRole(ped.devolvidoPor || 'revisor')}
              {ped.motivo ? ' · ' + ped.motivo : ''}
            </p>
            <p className="m-0 text-[15px] leading-[23px]">
              {ped.notaGeral ? `«${ped.notaGeral}» ` : ''}
              {openNotes.length ? 'As notas estão também junto de cada campo.' : ''}
            </p>
          </div>
        )}
        {sections.map(({ s, rows, editable }) => {
          const sectionNotes = openNotes.filter((n) => s.nk.includes(n.campo))
          const errs = triedAll ? errors.filter((x) => s.ids.includes(x.id)) : []
          return (
            <section
              key={s.k}
              aria-labelledby={'rv-' + s.k}
              className={cx(
                'flex flex-col gap-3 rounded-md bg-panel px-5 py-4.5',
                errs.length ? 'border-2 border-error' : sectionNotes.length ? 'border border-line-strong shadow-[inset_4px_0_0_var(--color-warning)]' : 'border border-line',
              )}
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <h3 id={'rv-' + s.k} className="m-0 flex-[1_1_200px] text-[17px] leading-6 font-semibold">
                  {s.nome}
                </h3>
                {editable !== false && (
                  <button
                    type="button"
                    onClick={() => go(s.k, true)}
                    className="box-border inline-flex min-h-11 items-center justify-center gap-2 rounded-pill border-emph border-field bg-bg px-4 text-[14px] font-semibold text-ink hover:bg-soft"
                  >
                    <Icon name="pen" size={16} />
                    {sectionNotes.length || errs.length ? 'Corrigir' : 'Alterar'}
                    <span className="sr-only"> {s.nome}</span>
                  </button>
                )}
              </div>
              <dl className="m-0 grid grid-cols-[minmax(110px,180px)_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-[15px] leading-[22px]">
                {rows.map((r, i) => (
                  <div key={i} className="contents">
                    <dt className="text-ink-2">{r.rot}</dt>
                    <dd className="m-0 [overflow-wrap:anywhere]">{r.v}</dd>
                  </div>
                ))}
              </dl>
              {sectionNotes.map((n, i) => (
                <NoteFrom key={i} as="p" quem={n.quem} texto={n.texto} />
              ))}
              {errs.map((x, i) => (
                <p key={i} className="m-0">
                  <FieldError>{x.txt}</FieldError>
                </p>
              ))}
            </section>
          )
        })}
        {ac && (
          <dl className="edge m-0 flex flex-col gap-2 rounded-md bg-soft px-5.5 py-5 text-[15px]">
            <div className="flex justify-between gap-3">
              <dt className="text-ink-2">Ajudas de custo · {days === 1 ? '1 dia' : days + ' dias'}</dt>
              <dd className="m-0 whitespace-nowrap tabular-nums">{eur(allow)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-2">Despesas com comprovativo</dt>
              <dd className="m-0 whitespace-nowrap tabular-nums">{eur(despSum)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 border-t border-line-strong pt-2.5">
              <dt className="font-semibold">Total estimado</dt>
              <dd className="m-0 text-[28px] leading-[34px] font-extrabold tracking-headline whitespace-nowrap tabular-nums">{eur(allow + despSum)}</dd>
            </div>
          </dl>
        )}
        <p className="m-0 flex items-start gap-2 text-[15px] leading-[23px] text-ink-2">
          <Icon name="send" size={16} className="mt-0.5 text-accent-ink" />
          <span>
            {correcting ? 'Depois de reenviar, o pedido volta para ' : 'Depois de submeter, o pedido segue para '}
            {nextTxt}.
          </span>
        </p>
      </div>
    )

  return (
    <WizardLayout
      title={correcting && ped ? 'Corrigir ' + ped.id : wf.nome}
      pct={correcting ? 100 : Math.round(((idx + 1) / steps.length) * 100)}
      exitTo={correcting ? paths.inbox : paths.newRequest}
      exitSr={correcting ? 'sem reenviar' : 'sem submeter'}
    >
      <form
        noValidate
        aria-labelledby="passo-titulo"
        onSubmit={(e) => {
          e.preventDefault()
          next()
        }}
        onKeyDown={(e) => enterMovesOn(e, next)}
        className="mt-2 flex w-full max-w-form flex-col gap-7"
      >
        <StepHeading kicker={correcting ? 'Correção do pedido' : `Passo ${idx + 1} de ${steps.length}`} name={PA.nome} optional={PA.opc} question={PA.q} help={PA.ajuda} />
        {stepError && <StepError>{stepError}</StepError>}
        {body}
        <WizardFooter
          previous={idx > 0 && !(correcting && last) ? () => go(fromReview ? 'rever' : keys[idx - 1]) : undefined}
          previousText={fromReview ? 'Voltar à revisão' : 'Anterior'}
          next={next}
          nextText={nextText}
          last={last}
        />
      </form>
    </WizardLayout>
  )
}
