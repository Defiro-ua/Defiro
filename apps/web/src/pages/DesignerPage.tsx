import { useState, type ReactNode } from 'react'
import { IconButton } from '../components/Button'
import { Chip } from '../components/Chip'
import { ArrowHint, FieldError, Optional, Req, StepError, WizardFooter } from '../components/form'
import { Icon } from '../components/Icon'
import { WizardLayout } from '../components/layout/WizardLayout'
import { fmtDate, isoDate } from '../domain/dates'
import { answerTypes, draftErrors, fieldProblem, newDraft, optionsOf, reduceDraft, type DraftAction } from '../domain/designer'
import { groups } from '../domain/people'
import type { Workflow, WorkflowDraft, WorkflowStep } from '../domain/types'
import { stepTypes } from '../domain/workflows'
import { cx } from '../lib/cx'
import { focusSoon } from '../lib/focus'
import { cardClass, describedBy, enterMovesOn, inputClass, radioClass, textareaClass } from '../lib/formStyles'
import { paths } from '../routes'
import { useDemo } from '../state/demoContext'
import { useFeedback } from '../state/feedbackContext'

const secondarySmall =
  'box-border inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-pill border-emph border-field bg-bg px-4 text-[14px] font-semibold text-ink hover:bg-soft'
const primarySmall =
  'box-border inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-pill border-0 bg-brand px-4 text-[14px] font-semibold text-on-brand hover:brightness-107'
const secondaryMedium =
  'box-border inline-flex min-h-12 items-center justify-center gap-2 rounded-pill border-emph border-field bg-bg px-5.5 text-[15px] font-semibold text-ink hover:bg-soft'

const stepName = (p: WorkflowStep) => p.nome || 'Passo sem nome'

/** E13 · Criar workflow, passo a passo (UC03, UC05, UC06) · E14 · Campos do formulário (UC04) */
export function DesignerPage() {
  const { rasc, setRasc, criarWf } = useDemo()
  const feedback = useFeedback()
  const [w, setW] = useState<WorkflowDraft>(() => rasc || newDraft())
  const [vista, setVista] = useState('ident')
  const [volta, setVolta] = useState('')
  const [fromReview, setFromReview] = useState(false)
  const [tried, setTried] = useState<Record<string, boolean>>({})
  const [triedAll, setTriedAll] = useState(false)
  const [triedField, setTriedField] = useState(false)


  const P = w.passos
  const P0 = P[0]
  const revs = P.slice(1)
  // one question at a time: name, who can ask, then each step of the path (who and name, deadline, reasons), the path, the form, review
  const order = ['ident', 'quem'].concat(...revs.map((p) => ['pn:' + p.id, 'pp:' + p.id, 'pm:' + p.id])).concat(['percurso', 'campos', 'rever'])
  let view = vista
  let [kind, vid = ''] = view.split(':')
  if (['pn', 'pp', 'pm'].includes(kind) && !revs.some((p) => p.id === vid)) view = 'percurso'
  if (kind === 'campo' && !(P0.campos || []).some((c) => c.id === vid && c.origem === 'req')) view = 'campos'
  ;[kind, vid = ''] = view.split(':')
  const pa0 = ['pn', 'pp', 'pm'].includes(kind) ? P.find((p) => p.id === vid) || null : null
  const k = pa0 ? P.indexOf(pa0) : -1

  const change = (a: DraftAction, focus?: string) => {
    const n = reduceDraft(w, a)
    setW(n)
    setRasc(n)
    if (focus) focusSoon(focus)
  }
  const go = (v: string, opts: { volta?: string; fromReview?: boolean; focus?: string } = {}) => {
    setVista(v)
    if (opts.volta !== undefined) setVolta(opts.volta)
    if (opts.fromReview !== undefined) setFromReview(opts.fromReview)
    setTriedField(false)
    focusSoon(opts.focus || 'passo-titulo')
  }

  const errors = draftErrors(w)
  // which screen each problem belongs to
  const screenOf = (id: string) => {
    if (id === 'wf-nome') return 'ident'
    if (id === 'wf-add') return 'percurso'
    const m = /^wf-([a-z0-9]+)-(nome|quem|prazo|addm|m\d+|campos)$/.exec(id)
    if (!m) return 'rever'
    if (m[2] === 'campos') return 'campos'
    if (m[1] === P0.id) return m[2] === 'quem' ? 'quem' : 'ident'
    if (m[2] === 'nome' || m[2] === 'quem') return 'pn:' + m[1]
    if (m[2] === 'prazo') return 'pp:' + m[1]
    return 'pm:' + m[1]
  }
  const ofPath = (t: string) => /^(pn|pp|pm|percurso)/.test(t)
  // impossible values (a deadline of 200 days) show at once; missing ones after trying to continue
  const visible = errors.filter((e) => e.vivo || triedAll || tried[screenOf(e.id)] || (tried.percurso && ofPath(screenOf(e.id))))
  const errorOf = (id: string) => {
    const e = visible.find((x) => x.id === id)
    return e ? e.curto || e.txt : ''
  }
  const fieldState = (id: string, help?: string) => {
    const er = errorOf(id)
    return { wrong: !!er, error: er, desc: describedBy(help, er && 'erro-' + id) }
  }
  const hasFinal = P.some((p) => p.tipo === 'validacao')
  const total = revs.reduce((t, x) => t + (Number(x.prazo) || 0), 0)
  const complete = (p: WorkflowStep) => !errors.some((e) => screenOf(e.id).split(':')[1] === p.id)

  function next() {
    if (kind === 'rever') {
      create()
      return
    }
    if (kind === 'campo') {
      const cs = (P0.campos || []).find((c) => c.id === vid)
      if (cs && fieldProblem(cs)) {
        setTriedField(true)
        focusSoon(!String(cs.rot || '').trim() ? 'cp-rot' : 'cp-opcoes')
        return
      }
      go('campos', { volta: '', focus: 'ed-' + vid })
      feedback('Campo guardado')
      return
    }
    const mine = kind === 'percurso' ? errors.filter((x) => ofPath(screenOf(x.id))) : errors.filter((x) => screenOf(x.id) === view)
    if (mine.length) {
      setTried((t) => ({ ...t, [kind === 'percurso' ? 'percurso' : view]: true }))
      focusSoon(kind === 'percurso' ? 'passo-erro' : kind === 'campos' ? `wf-${P0.id}-campos` : mine[0].id)
      return
    }
    if (kind === 'pm') feedback('Passo completo')
    if (volta === 'percurso' && (kind === 'pm' || kind === 'quem')) {
      go('percurso', { volta: '', focus: kind === 'quem' ? 'pc-' + P0.id : 'pc-' + vid })
      return
    }
    if (fromReview && ['ident', 'quem', 'percurso', 'campos'].includes(kind)) {
      go('rever', { fromReview: false })
      return
    }
    go(order[order.indexOf(view) + 1])
  }
  function previous() {
    if (fromReview && ['ident', 'quem', 'percurso', 'campos'].includes(kind)) return go('rever', { fromReview: false })
    if (kind === 'campo') return go('campos', { focus: 'ed-' + vid })
    if (volta === 'percurso') {
      if (kind === 'pn' || kind === 'quem') return go('percurso', { volta: '', focus: 'pc-' + (kind === 'quem' ? P0.id : vid) })
      if (kind === 'pp') return go('pn:' + vid)
      if (kind === 'pm') return go('pp:' + vid)
    }
    const i = order.indexOf(view)
    if (i > 0) go(order[i - 1])
  }
  function create() {
    if (errors.length) {
      setTriedAll(true)
      setVista('rever')
      focusSoon('passo-erro')
      return
    }
    const nw: Workflow = {
      id: 'w' + Date.now().toString(36),
      nome: w.nome.trim(),
      desc: w.desc || '',
      estado: 'Ativo',
      autor: 'Sofia Almeida',
      data: fmtDate(isoDate(new Date())),
      novo: true,
      precisa: (P0.campos || []).some((c) => c.tipo === 'Ficheiros' && c.origem === 'req') ? 'os ficheiros pedidos no formulário' : 'os dados pedidos no formulário',
      passos: (JSON.parse(JSON.stringify(w.passos)) as WorkflowStep[]).map((p) => ({ ...p, prazo: p.tipo === 'submissao' ? '' : Number(p.prazo) })),
    }
    criarWf(nw, { tom: 'ok', titulo: 'Workflow criado', texto: `«${nw.nome}» já aparece em «Novo pedido» para ${nw.passos[0].quem || 'os trabalhadores'}.` })
  }

  // ——— texts of each screen
  const nPa = pa0 ? k + 1 : 0
  const cs = kind === 'campo' ? (P0.campos || []).find((c) => c.id === vid) || null : null
  const D: Record<string, { q: string; ajuda: string }> = {
    ident: { q: 'Como se chama o workflow?', ajuda: 'É o nome que os trabalhadores veem em «Novo pedido». Pode juntar uma descrição curta.' },
    quem: { q: 'Quem pode fazer este pedido?', ajuda: 'Escolha o grupo ou a unidade. Só essas pessoas veem o pedido em «Novo pedido».' },
    pn: {
      q: pa0 ? `Como se chama o passo ${nPa} e quem o trata?` : '',
      ajuda:
        pa0?.tipo === 'validacao'
          ? 'É o último passo do percurso: quem o trata confirma, fecha o procedimento e gera o documento final.'
          : 'Neste passo, alguém aprova o pedido, devolve-o para correção ou rejeita-o.',
    },
    pp: {
      q: pa0 ? `Em quanto tempo tem de ser tratado «${stepName(pa0)}»?` : '',
      ajuda: 'Indique o prazo legal em dias úteis. A defiro avisa quem trata o passo quando o prazo está perto do fim.',
    },
    pm: {
      q: pa0 ? `Porque pode «${stepName(pa0)}» devolver ou rejeitar o pedido?` : '',
      ajuda: 'Quem trata este passo escolhe um ou mais destes motivos quando devolve ou rejeita. Precisa de pelo menos um.',
    },
    percurso: { q: 'O percurso está completo?', ajuda: 'O pedido passa por estes passos, por esta ordem. Pode alterar um passo, mudar a ordem ou acrescentar outro no fim.' },
    campos: { q: 'Que dados pede ao requerente?', ajuda: 'São as perguntas do formulário do pedido, por esta ordem. Acrescente um campo de cada vez.' },
    campo: {
      q: cs && String(cs.rot || '').trim() ? `Como é o campo «${cs.rot}»?` : 'Como é o novo campo?',
      ajuda: 'O rótulo é a pergunta que o requerente vê. Escolha o tipo de resposta que espera.',
    },
    rever: { q: 'Confira o workflow antes de o criar', ajuda: 'Pode alterar qualquer parte antes de criar.' },
  }
  const iScreen = Math.max(0, order.indexOf(kind === 'campo' ? 'campos' : view))
  const NAMES: Record<string, string> = {
    ident: 'Nome',
    quem: 'Quem pode pedir',
    pn: 'quem trata',
    pp: 'prazo',
    pm: 'motivos',
    percurso: 'Percurso',
    campos: 'Formulário',
    campo: 'Formulário',
    rever: 'Rever e criar',
  }
  const kickers = [`Passo ${iScreen + 1} de ${order.length}`, pa0 ? `«${stepName(pa0)}»: ${NAMES[kind]}` : NAMES[kind]]
  const pct = Math.round(((iScreen + 1) / order.length) * 100)
  const startSection = ['ident', 'quem', 'percurso', 'campos'].includes(kind)

  // the message at the top of the screen
  const screenErrors = visible.filter((x) => (kind === 'percurso' ? tried.percurso && ofPath(screenOf(x.id)) : screenOf(x.id) === view && tried[view]))
  const incomplete = kind === 'percurso' && tried.percurso ? revs.filter((p) => !complete(p)) : []
  let stepError = ''
  if (kind === 'rever' && triedAll && errors.length)
    stepError =
      errors.length === 1
        ? 'Ainda não pode criar o workflow: falta corrigir 1 coisa, assinalada abaixo.'
        : `Ainda não pode criar o workflow: faltam corrigir ${errors.length} coisas, assinaladas abaixo.`
  else if (kind === 'percurso' && screenErrors.length)
    stepError = incomplete.length ? 'Para continuar, complete ' + (incomplete.length === 1 ? 'este passo:' : 'estes passos:') : screenErrors[0].curto || screenErrors[0].txt
  else if (screenErrors.length) stepError = screenErrors.length === 1 ? 'Para continuar, corrija o que está assinalado.' : `Para continuar, corrija as ${screenErrors.length} coisas assinaladas.`

  const last = kind === 'rever'
  let nextText = 'Continuar'
  if (last) nextText = 'Criar workflow'
  else if (kind === 'campo') nextText = 'Guardar o campo'
  else if (kind === 'pm' && volta === 'percurso') nextText = 'Guardar o passo'
  else if (kind === 'quem' && volta === 'percurso') nextText = 'Guardar e voltar ao percurso'
  else if (fromReview && startSection) nextText = 'Guardar e voltar à revisão'
  else if (order[order.indexOf(view) + 1] === 'rever') nextText = 'Rever o workflow'

  const groupCard = (name: string, nota: string, on: boolean, radioName: string, pick: () => void) => (
    <label key={name} className={cardClass(on, 'min-h-16 flex-[1_1_300px]')}>
      <input type="radio" name={radioName} value={name} checked={on} onChange={pick} className={cx(radioClass, 'mt-0.5')} />
      <span className="flex flex-col gap-0.5">
        <span className="text-[16px] leading-[22px] font-semibold">{name}</span>
        <span className="text-label-sm leading-[18px] text-ink-3">{nota}</span>
      </span>
    </label>
  )

  // ——— the screens
  let body: ReactNode = null
  if (kind === 'ident') {
    const f = fieldState('wf-nome', 'ajuda-wf-nome')
    body = (
      <div className="flex max-w-form flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="wf-nome" className="text-[16px] font-semibold">
            Nome do workflow <Req />
          </label>
          <span id="ajuda-wf-nome" className="text-[14px] text-ink-3">
            Ex.: Pedido de material de escritório
          </span>
          <input
            id="wf-nome"
            type="text"
            autoComplete="off"
            required
            value={w.nome}
            onChange={(e) => change({ t: 'nome', v: e.target.value })}
            aria-invalid={f.wrong || undefined}
            aria-describedby={f.desc}
            className={inputClass(f.wrong, 'px-3.5')}
          />
          {f.error && <FieldError id="erro-wf-nome">{f.error}</FieldError>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="wf-desc" className="text-[16px] font-semibold">
            Descrição <Optional />
          </label>
          <span id="ajuda-wf-desc" className="text-[14px] text-ink-3">
            Uma ou duas frases sobre para que serve. Aparece no resumo do workflow.
          </span>
          <textarea id="wf-desc" rows={2} value={w.desc} onChange={(e) => change({ t: 'desc', v: e.target.value })} aria-describedby="ajuda-wf-desc" className={textareaClass(false, 'min-h-24')} />
        </div>
      </div>
    )
  } else if (kind === 'quem') {
    const id = `wf-${P0.id}-quem`
    const f = fieldState(id)
    body = (
      <fieldset id={id} tabIndex={-1} aria-describedby={f.desc} className="m-0 flex flex-col gap-2.5 border-0 p-0 outline-none">
        <legend className="sr-only">Quem pode fazer o pedido (obrigatório)</legend>
        <ArrowHint />
        {f.error && <FieldError id={'erro-' + id}>{f.error}</FieldError>}
        <div className="flex flex-wrap gap-2.5">
          {groups.map((g) => groupCard(g.nome, g.nota, P0.quem === g.nome, 'quem-pedido', () => change({ t: 'passo', passo: P0.id, k: 'quem', v: g.nome })))}
        </div>
      </fieldset>
    )
  } else if (pa0 && kind === 'pn') {
    const p = pa0
    const fn = fieldState(`wf-${p.id}-nome`, 'aj-nome-' + p.id)
    const fq = fieldState(`wf-${p.id}-quem`, 'aj-quem-' + p.id)
    body = (
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-2">
          <Chip tone={p.tipo === 'validacao' ? 'ok' : 'info'} className="min-h-7 px-3 text-[13px]" icon={p.tipo === 'validacao' ? 'shieldCheck' : 'eye'}>
            {stepTypes[p.tipo].nome}
          </Chip>
          <span className="text-[14px] leading-5 text-ink-2">{stepTypes[p.tipo].desc}</span>
        </div>
        <div className="flex max-w-[520px] flex-col gap-1.5">
          <label htmlFor={`wf-${p.id}-nome`} className="text-[16px] font-semibold">
            Nome do passo <Req />
          </label>
          <span id={'aj-nome-' + p.id} className="text-[14px] text-ink-3">
            É o que aparece no percurso do pedido. Ex.: Validação da chefia
          </span>
          <input
            id={`wf-${p.id}-nome`}
            type="text"
            autoComplete="off"
            required
            value={p.nome}
            onChange={(e) => change({ t: 'passo', passo: p.id, k: 'nome', v: e.target.value })}
            aria-invalid={fn.wrong || undefined}
            aria-describedby={fn.desc}
            className={inputClass(fn.wrong, 'px-3.5')}
          />
          {fn.error && <FieldError id={`erro-wf-${p.id}-nome`}>{fn.error}</FieldError>}
        </div>
        <fieldset id={`wf-${p.id}-quem`} tabIndex={-1} aria-describedby={fq.desc} className="m-0 flex flex-col gap-2.5 border-0 p-0 outline-none">
          <legend className="mb-1 p-0 text-[16px] leading-[22px] font-semibold">
            Quem trata este passo? <Req />
            <span className="sr-only"> (obrigatório)</span>
          </legend>
          <ArrowHint />
          <span id={'aj-quem-' + p.id} className="text-[14px] leading-5 text-ink-3">
            Os grupos e as unidades vêm do fornecedor de identidade (IdP) da organização.
          </span>
          {fq.error && <FieldError id={`erro-wf-${p.id}-quem`}>{fq.error}</FieldError>}
          <div className="flex flex-wrap gap-2.5">
            {groups
              .filter((g) => g.nome !== 'Todos os trabalhadores')
              .map((g) => groupCard(g.nome, g.nota, p.quem === g.nome, 'quem-' + p.id, () => change({ t: 'passo', passo: p.id, k: 'quem', v: g.nome })))}
          </div>
        </fieldset>
      </div>
    )
  } else if (pa0 && kind === 'pp') {
    const p = pa0
    const id = `wf-${p.id}-prazo`
    const f = fieldState(id, `aj-prazo-${p.id} un-${p.id}`)
    const others = revs.filter((x) => x.id !== p.id).reduce((t, x) => t + (Number(x.prazo) || 0), 0)
    const mine = Number(p.prazo) || 0
    body = (
      <div className="flex flex-col gap-2.5">
        <label htmlFor={id} className="text-[16px] font-semibold">
          Prazo legal <Req />
        </label>
        <span id={'aj-prazo-' + p.id} className="text-[14px] leading-5 text-ink-3">
          De 1 a 90 dias úteis. Conta a partir do momento em que o pedido chega a este passo.
        </span>
        <span className="flex items-center gap-3.5">
          <input
            id={id}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            required
            maxLength={2}
            value={String(p.prazo || '')}
            onChange={(e) => change({ t: 'passo', passo: p.id, k: 'prazo', v: e.target.value.replace(/[^0-9]/g, '').slice(0, 2) })}
            aria-invalid={f.wrong || undefined}
            aria-describedby={f.desc}
            className={cx(
              'box-border h-16 w-30 rounded-item bg-panel px-4 text-center text-[28px] font-extrabold text-ink tabular-nums',
              f.wrong ? 'border-2 border-error' : 'border border-field',
            )}
          />
          <span id={'un-' + p.id} className="text-[20px] leading-7 font-semibold text-ink-2">
            dias úteis
          </span>
        </span>
        {f.error && <FieldError id={'erro-' + id}>{f.error}</FieldError>}
        <p aria-live="polite" className="edge mt-2.5 mb-0 flex items-start gap-2 rounded-md bg-soft px-4 py-3.5 text-[15px] leading-[22px]">
          <Icon name="clock" size={18} className="mt-px text-accent-ink" />
          <span>{mine ? `Com este prazo, o percurso todo pode demorar até ${others + mine} dias úteis.` : `Os outros passos somam ${others} dias úteis.`}</span>
        </p>
      </div>
    )
  } else if (pa0 && kind === 'pm') {
    const p = pa0
    const fm = fieldState(`wf-${p.id}-addm`)
    const motivos = p.motivos || []
    body = (
      <div className="flex flex-col gap-5">
        {fm.error && <FieldError id={`erro-wf-${p.id}-addm`}>{fm.error}</FieldError>}
        {[true, false].map((fix) => {
          const list = motivos.map((m, j) => ({ m, j })).filter((x) => !!x.m.fix === fix)
          const addId = fix ? `wf-${p.id}-addm` : `wf-${p.id}-addr`
          const ajId = 'aj-mot-' + (fix ? 'dev' : 'rej')
          return (
            <fieldset
              key={String(fix)}
              aria-describedby={ajId}
              className={cx(
                'm-0 flex flex-col gap-3 rounded-item border border-line-strong bg-panel px-5 pt-4.5 pb-5',
                fix ? 'shadow-[inset_4px_0_0_var(--color-warning)]' : 'shadow-[inset_4px_0_0_var(--color-error)]',
              )}
            >
              <legend className="float-left m-0 flex w-full items-center gap-2 p-0 text-[17px] leading-6 font-semibold">
                <span aria-hidden="true" className={cx('grid size-7 place-items-center rounded-full', fix ? 'bg-warning-soft text-warning' : 'bg-error-soft text-error')}>
                  <Icon name={fix ? 'reset' : 'x'} size={16} />
                </span>
                {fix ? 'Para devolver ao requerente, para corrigir' : 'Para rejeitar e encerrar o pedido'}
              </legend>
              <span id={ajId} className="text-[14px] leading-5 text-ink-2">
                {fix
                  ? 'O pedido volta para quem o fez, com o motivo e as notas. Ex.: Falta documento comprovativo'
                  : 'O pedido fica encerrado e não pode ser corrigido. Ex.: Pedido não autorizado'}
              </span>
              {list.length === 0 && (
                <p className="m-0 text-[14px] leading-5 text-ink-3">
                  {fix ? 'Sem motivos para devolver: neste passo não se pode devolver o pedido.' : 'Sem motivos para rejeitar: neste passo não se pode rejeitar o pedido.'}
                </p>
              )}
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {list.map(({ m, j }, n) => {
                  const id = `wf-${p.id}-m${j}`
                  const f = fieldState(id)
                  return (
                    <li key={j} className="flex flex-wrap items-center gap-2">
                      <label htmlFor={id} className="sr-only">
                        {fix ? 'Motivo para devolver' : 'Motivo para rejeitar'} {n + 1}
                      </label>
                      <input
                        id={id}
                        type="text"
                        required
                        placeholder={fix ? 'Ex.: Falta documento comprovativo' : 'Ex.: Pedido não autorizado'}
                        value={m.nome}
                        onChange={(e) => change({ t: 'motivo', passo: p.id, m: j, v: e.target.value })}
                        aria-invalid={f.wrong || undefined}
                        aria-describedby={f.desc}
                        className={cx(
                          'box-border h-12 min-w-0 flex-[1_1_260px] rounded-md bg-panel px-3.5 text-[16px] text-ink',
                          f.wrong ? 'border-2 border-error' : 'border border-field',
                        )}
                      />
                      <IconButton
                        icon="trash"
                        danger
                        label={`Remover o motivo «${m.nome}»`}
                        onClick={() => {
                          change({ t: 'rmMotivo', passo: p.id, m: j }, addId)
                          feedback('Motivo removido')
                        }}
                      />
                      {f.error && (
                        <FieldError id={'erro-' + id} className="flex-[0_0_100%]">
                          {f.error}
                        </FieldError>
                      )}
                    </li>
                  )
                })}
              </ul>
              <button type="button" id={addId} className={cx(secondarySmall, 'self-start')} onClick={() => change({ t: 'addMotivo', passo: p.id, nome: '', fix }, `wf-${p.id}-m${motivos.length}`)}>
                <Icon name="plus" size={16} />
                {fix ? 'Acrescentar motivo para devolver' : 'Acrescentar motivo para rejeitar'}
              </button>
            </fieldset>
          )
        })}
      </div>
    )
  } else if (kind === 'percurso') {
    body = (
      <div className="flex flex-col gap-4.5">
        <ol aria-label="Passos do percurso" className="m-0 flex list-none flex-col gap-3.5 p-0">
          {P.map((p, i) => {
            const sub = p.tipo === 'submissao'
            const ok = sub ? !!p.quem : complete(p)
            const motivos = p.motivos || []
            const nDev = motivos.filter((m) => m.fix).length
            // the final validation stays last; review steps move among themselves
            const fixed = sub || p.tipo === 'validacao'
            const noUp = fixed || i <= 1
            const noDown = fixed || i >= P.length - 1 || P[i + 1]?.tipo === 'validacao'
            return (
              <li key={p.id}>
                <article
                  id={'pc-' + p.id}
                  tabIndex={-1}
                  aria-labelledby={'pch-' + p.id}
                  className={cx('box-border flex w-full flex-col gap-3 rounded-item bg-panel px-5 py-4.5 outline-none', ok ? 'border border-line-strong' : 'border-2 border-warning')}
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span
                      aria-hidden="true"
                      className={cx(
                        'box-border grid size-9 shrink-0 place-items-center rounded-full text-[15px] font-extrabold',
                        ok ? 'border-2 border-orange bg-bg' : 'border-2 border-dashed border-warning bg-warning-soft',
                      )}
                    >
                      {i + 1}
                    </span>
                    <h3 id={'pch-' + p.id} className="m-0 flex-[1_1_200px] text-title-sm font-semibold">
                      <span className="sr-only">Passo {i + 1}: </span>
                      {stepName(p)}
                    </h3>
                    <Chip tone={sub ? 'neutro' : p.tipo === 'validacao' ? 'ok' : 'info'} size="sm">
                      {stepTypes[p.tipo].nome}
                    </Chip>
                    {ok ? (
                      <Chip tone="ok" size="sm" icon="check">
                        Completo
                      </Chip>
                    ) : (
                      <Chip tone="warn" size="sm" icon="alertTriangle">
                        Por completar
                      </Chip>
                    )}
                  </div>
                  <dl className="m-0 grid grid-cols-[minmax(110px,150px)_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-[15px] leading-[22px]">
                    <dt className="text-ink-2">{sub ? 'Quem pode pedir' : 'Quem trata'}</dt>
                    <dd className={cx('m-0', !p.quem && 'font-semibold text-error')}>{p.quem || 'Falta escolher'}</dd>
                    {!sub && (
                      <>
                        <dt className="text-ink-2">Prazo legal</dt>
                        <dd className={cx('m-0', !p.prazo && 'font-semibold text-error')}>{p.prazo ? p.prazo + ' dias úteis' : 'Falta indicar'}</dd>
                        <dt className="text-ink-2">Motivos</dt>
                        <dd className="m-0">
                          {nDev} para devolver · {motivos.length - nDev} para rejeitar
                        </dd>
                      </>
                    )}
                  </dl>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      id={'pce-' + p.id}
                      className={ok ? secondarySmall : primarySmall}
                      onClick={() => go(sub ? 'quem' : 'pn:' + p.id, { volta: 'percurso' })}
                    >
                      <Icon name="pen" size={16} />
                      {ok ? 'Alterar' : 'Completar'}
                      <span className="sr-only"> o passo {stepName(p)}</span>
                    </button>
                    <span className="flex-1" />
                    {!sub && (
                      <>
                        <IconButton
                          id={`mv-${p.id}-up`}
                          icon="arrowUp"
                          label={`Mover «${stepName(p)}» para cima`}
                          disabled={noUp}
                          onClick={() => {
                            change({ t: 'movePasso', passo: p.id, d: -1 }, i - 1 <= 1 ? `mv-${p.id}-down` : `mv-${p.id}-up`)
                            feedback('Passo movido para a posição ' + i)
                          }}
                        />
                        <IconButton
                          id={`mv-${p.id}-down`}
                          icon="arrowDown"
                          label={`Mover «${stepName(p)}» para baixo`}
                          disabled={noDown}
                          onClick={() => {
                            change({ t: 'movePasso', passo: p.id, d: 1 }, i + 1 >= P.length - 1 ? `mv-${p.id}-up` : `mv-${p.id}-down`)
                            feedback('Passo movido para a posição ' + (i + 2))
                          }}
                        />
                        <IconButton
                          icon="trash"
                          danger
                          label={`Remover o passo «${stepName(p)}»`}
                          onClick={() => {
                            change({ t: 'rmPasso', passo: p.id }, 'wf-add')
                            feedback('Passo removido')
                          }}
                        />
                      </>
                    )}
                  </div>
                </article>
              </li>
            )
          })}
        </ol>
        <div className="box-border flex w-full flex-col gap-2.5 rounded-item border-2 border-dashed border-line-strong px-5 py-4.5">
          <p className="m-0 text-[15px] leading-[22px] font-semibold">{hasFinal ? 'Acrescentar uma revisão antes da validação final' : 'Acrescentar um passo no fim'}</p>
          <div className="flex flex-wrap gap-2.5">
            {(hasFinal ? (['revisao'] as const) : (['revisao', 'validacao'] as const)).map((t) => (
              <button
                key={t}
                type="button"
                id={t === 'revisao' ? 'wf-add' : undefined}
                className={secondaryMedium}
                onClick={() => {
                  const n = reduceDraft(w, { t: 'addPasso', tipo: t })
                  setW(n)
                  setRasc(n)
                  go('pn:' + n.ultimo, { volta: 'percurso' })
                  feedback('Passo acrescentado')
                }}
              >
                <Icon name="plus" size={18} />
                {t === 'revisao' ? 'Revisão' : 'Validação final'}
                <span className="sr-only">{t === 'revisao' ? ' (alguém aprova, devolve ou rejeita)' : ' (confirma, fecha e gera o documento)'}</span>
              </button>
            ))}
          </div>
          <p className="m-0 text-label-sm leading-[19px] text-ink-3">
            Revisão: alguém aprova, devolve ou rejeita. Validação final: confirma, fecha o procedimento e gera o documento final; só há uma e é sempre o último
            passo.
          </p>
        </div>
        <p className="m-0 flex items-center gap-2 text-[15px] leading-[22px] text-ink-2">
          <Icon name="clock" size={18} className="text-accent-ink" />
          Prazo total: {total} dias úteis. Disponível para: {P0.quem || '—'}.
        </p>
      </div>
    )
  } else if (kind === 'campos') {
    const list = P0.campos || []
    const errId = `wf-${P0.id}-campos`
    body = (
      <div className="flex flex-col gap-4">
        <div id={errId} tabIndex={-1} className="outline-none">
          {visible
            .filter((x) => x.id === errId)
            .map((x, i) => (
              <p key={i} className="m-0 mb-1.5">
                <FieldError>{x.curto || x.txt}</FieldError>
              </p>
            ))}
        </div>
        <ol aria-label="Campos do formulário" className="m-0 list-none overflow-hidden rounded-md border border-line bg-panel p-0">
          {list.map((c, i) => {
            const req = c.origem === 'req'
            const noUp = i === 0 || list[i - 1].origem !== 'req'
            const noDown = i >= list.length - 1
            const problem = req ? fieldProblem(c) : ''
            const rot = c.rot || 'Campo sem rótulo'
            return (
              <li key={c.id} className={cx('flex flex-wrap items-center gap-x-3.5 gap-y-2.5 px-4 py-3.5', i > 0 && 'border-t border-line')}>
                <span aria-hidden="true" className="w-7 shrink-0 text-center text-[14px] font-extrabold text-ink-3">
                  {i + 1}
                </span>
                <span className="flex min-w-0 flex-[1_1_220px] flex-col gap-1">
                  <span className="text-[15px] leading-[22px] font-semibold">
                    {rot}
                    {c.obrig && <span className="font-normal text-ink-3"> · obrigatório</span>}
                  </span>
                  <span className="flex flex-wrap items-center gap-1.5 text-label-sm text-ink-2">
                    {c.tipo}{' '}
                    <Chip tone={req ? 'info' : 'neutro'} size="xxs" icon={req ? 'pen' : 'lock'}>
                      {req ? 'Requerente' : 'Do perfil (IdP)'}
                    </Chip>
                  </span>
                  {problem && (
                    <span className="flex items-center gap-1.5 text-label-sm leading-[18px] font-semibold text-error">
                      <Icon name="alertCircle" size={14} />
                      {problem}
                    </span>
                  )}
                </span>
                {req && (
                  <span className="inline-flex gap-1">
                    <button type="button" id={'ed-' + c.id} className={secondarySmall} onClick={() => go('campo:' + c.id)}>
                      <Icon name="pen" size={16} />
                      Alterar<span className="sr-only"> {rot}</span>
                    </button>
                    <IconButton
                      id={'cu-' + c.id}
                      icon="arrowUp"
                      label={`Mover «${rot}» para cima`}
                      disabled={noUp}
                      onClick={() => {
                        change({ t: 'moveCampo', passo: P0.id, campo: c.id, d: -1 }, i - 1 === 0 || list[i - 2]?.origem !== 'req' ? 'cd-' + c.id : 'cu-' + c.id)
                        feedback('Campo movido para a posição ' + i)
                      }}
                    />
                    <IconButton
                      id={'cd-' + c.id}
                      icon="arrowDown"
                      label={`Mover «${rot}» para baixo`}
                      disabled={noDown}
                      onClick={() => {
                        change({ t: 'moveCampo', passo: P0.id, campo: c.id, d: 1 }, i + 1 >= list.length - 1 ? 'cu-' + c.id : 'cd-' + c.id)
                        feedback('Campo movido para a posição ' + (i + 2))
                      }}
                    />
                    <IconButton
                      icon="trash"
                      danger
                      label={`Remover o campo «${rot}»`}
                      onClick={() => {
                        change({ t: 'rmCampo', passo: P0.id, campo: c.id }, 'wf-add-campo')
                        feedback('Campo removido')
                      }}
                    />
                  </span>
                )}
              </li>
            )
          })}
        </ol>
        <button
          type="button"
          id="wf-add-campo"
          className={cx(secondaryMedium, 'self-start')}
          onClick={() => {
            const n = reduceDraft(w, { t: 'addCampo', passo: P0.id })
            setW(n)
            setRasc(n)
            go('campo:' + n.campoSel)
          }}
        >
          <Icon name="plus" size={18} />
          Acrescentar campo
        </button>
        <p className="m-0 flex items-start gap-2 text-[14px] leading-[21px] text-ink-2">
          <Icon name="lock" size={16} className="mt-px text-accent-ink" />
          <span>Nome, unidade orgânica e chefia vêm do fornecedor de identidade (IdP). Entram sozinhos no pedido e não se editam aqui.</span>
        </p>
      </div>
    )
  } else if (kind === 'campo' && cs) {
    const noLabel = !String(cs.rot || '').trim() && triedField
    const nOptions = optionsOf(cs.opcoes).length
    const badOptions = cs.tipo === 'Escolha única' && nOptions < 2 && triedField
    const set = (key: 'rot' | 'tipo' | 'opcoes' | 'obrig', v: string | boolean) => change({ t: 'campo', passo: P0.id, campo: cs.id, k: key, v })
    body = (
      <div className="flex flex-col gap-6">
        <div className="flex max-w-[560px] flex-col gap-1.5">
          <label htmlFor="cp-rot" className="text-[16px] font-semibold">
            Rótulo <Req />
          </label>
          <span id="ajuda-cp-rot" className="text-[14px] text-ink-3">
            A pergunta que o requerente vê. Ex.: Material pedido
          </span>
          <input
            id="cp-rot"
            type="text"
            autoComplete="off"
            required
            value={cs.rot}
            onChange={(e) => set('rot', e.target.value)}
            aria-invalid={noLabel || undefined}
            aria-describedby={describedBy('ajuda-cp-rot', noLabel && 'erro-cp-rot')}
            className={inputClass(noLabel, 'px-3.5')}
          />
          {noLabel && <FieldError id="erro-cp-rot">Dê um rótulo ao campo.</FieldError>}
        </div>
        <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
          <legend className="mb-1 p-0 text-[16px] leading-[22px] font-semibold">
            Tipo de resposta <Req />
            <span className="sr-only"> (obrigatório)</span>
          </legend>
          <ArrowHint />
          <div className="flex flex-wrap gap-2.5">
            {answerTypes.map((t) => (
              <label key={t.v} className={cardClass(cs.tipo === t.v, 'min-h-16 flex-[1_1_240px]')}>
                <input type="radio" name="cp-tipo" value={t.v} checked={cs.tipo === t.v} onChange={() => set('tipo', t.v)} className={cx(radioClass, 'mt-0.5')} />
                <span className="flex flex-col gap-0.5">
                  <span className="text-[15px] leading-[21px] font-semibold">{t.nome}</span>
                  <span className="text-label-sm leading-[18px] text-ink-3">{t.desc}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        {cs.tipo === 'Escolha única' && (
          <div className="flex max-w-[560px] flex-col gap-1.5">
            <label htmlFor="cp-opcoes" className="text-[16px] font-semibold">
              Opções de resposta <Req />
            </label>
            <span id="ajuda-cp-opcoes" className="text-[14px] text-ink-3">
              Pelo menos duas, uma por linha.
            </span>
            <textarea
              id="cp-opcoes"
              rows={4}
              required
              value={cs.opcoes || ''}
              onChange={(e) => set('opcoes', e.target.value)}
              aria-invalid={badOptions || undefined}
              aria-describedby={describedBy('ajuda-cp-opcoes', badOptions && 'erro-cp-opcoes')}
              className={textareaClass(badOptions, 'min-h-28')}
            />
            {badOptions && (
              <FieldError id="erro-cp-opcoes">{nOptions === 0 ? 'Escreva as opções de resposta, pelo menos duas.' : 'Falta pelo menos mais uma opção.'}</FieldError>
            )}
          </div>
        )}
        <label className={cardClass(!!cs.obrig, 'max-w-[560px] items-center self-start')}>
          <input type="checkbox" checked={!!cs.obrig} onChange={(e) => set('obrig', e.target.checked)} className={radioClass} />
          <span className="flex flex-col gap-0.5">
            <span className="text-[15px] leading-[21px] font-semibold">Resposta obrigatória</span>
            <span className="text-label-sm leading-[18px] text-ink-3">O requerente não pode avançar sem responder.</span>
          </span>
        </label>
      </div>
    )
  } else if (last) {
    const section = (key: string, nome: string, rows: Array<{ rot: string; v: string }>, owns: (t: string) => boolean) => {
      const errs = triedAll ? errors.filter((x) => owns(screenOf(x.id))) : []
      return (
        <section
          key={key}
          aria-labelledby={'rv-' + key}
          className={cx('flex flex-col gap-3 rounded-md bg-panel px-5 py-4.5', errs.length ? 'border-2 border-error' : 'border border-line')}
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h3 id={'rv-' + key} className="m-0 flex-[1_1_200px] text-[17px] leading-6 font-semibold">
              {nome}
            </h3>
            <button type="button" className={secondarySmall} onClick={() => go(key, { fromReview: true })}>
              <Icon name="pen" size={16} />
              {errs.length ? 'Corrigir' : 'Alterar'}
              <span className="sr-only"> {nome}</span>
            </button>
          </div>
          <dl className="m-0 grid grid-cols-[minmax(130px,220px)_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-[15px] leading-[22px]">
            {rows.map((r, i) => (
              <div key={i} className="contents">
                <dt className="text-ink-2">{r.rot}</dt>
                <dd className="m-0 [overflow-wrap:anywhere]">{r.v}</dd>
              </div>
            ))}
          </dl>
          {errs.map((x, i) => (
            <p key={i} className="m-0">
              <FieldError>{x.txt}</FieldError>
            </p>
          ))}
        </section>
      )
    }
    body = (
      <div className="flex max-w-reading flex-col gap-4">
        {section(
          'ident',
          'Nome',
          [
            { rot: 'Nome', v: w.nome || '—' },
            { rot: 'Descrição', v: w.desc || '—' },
          ],
          (t) => t === 'ident',
        )}
        {section('quem', 'Quem pode pedir', [{ rot: 'Grupo ou unidade', v: P0.quem || 'Falta escolher' }], (t) => t === 'quem')}
        {section(
          'percurso',
          'Percurso',
          revs.map((x, i) => {
            const ms = x.motivos || []
            return {
              rot: `${i + 2}. ${stepName(x)}`,
              v: `${x.quem || 'Falta escolher quem trata'} · ${x.prazo ? x.prazo + ' dias úteis' : 'sem prazo'} · ${ms.filter((m) => m.fix).length} para devolver, ${ms.filter((m) => !m.fix).length} para rejeitar`,
            }
          }),
          ofPath,
        )}
        {section(
          'campos',
          'Formulário do pedido',
          (P0.campos || []).map((c) => ({ rot: c.rot || 'Campo sem rótulo', v: `${c.tipo} · ${c.origem === 'idp' ? 'do perfil' : c.obrig ? 'obrigatório' : 'opcional'}` })),
          (t) => t === 'campos',
        )}
        <p className="m-0 flex items-start gap-2 text-[15px] leading-[23px] text-ink-2">
          <Icon name="send" size={16} className="mt-0.5 text-accent-ink" />
          <span>
            Prazo total: {total} dias úteis. Disponível para: {P0.quem || '—'}. Fica logo disponível em «Novo pedido».
          </span>
        </p>
      </div>
    )
  }

  return (
    <WizardLayout title={w.nome ? 'Novo workflow · ' + w.nome : 'Novo workflow'} pct={pct} exitTo={paths.workflows} exitSr="sem criar o workflow" onExit={() => setRasc(null)}>
      <div className={cx('flex w-full flex-wrap items-start gap-x-10 gap-y-8', pa0 ? 'max-w-[1180px]' : 'max-w-[900px]')}>
        <form
          noValidate
          aria-labelledby="passo-titulo"
          onSubmit={(e) => {
            e.preventDefault()
            next()
          }}
          onKeyDown={(e) => enterMovesOn(e, next, ['pm', 'percurso', 'campos'].includes(kind))}
          className="flex min-w-0 flex-[999_1_560px] flex-col gap-7"
        >
          <div className="flex max-w-reading flex-col gap-3">
            <p aria-hidden="true" className="m-0 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[14px] leading-5 font-semibold text-accent-ink">
              <span>{kickers[0]}</span>
              <span>·</span>
              <span>{kickers[1]}</span>
            </p>
            <h2 id="passo-titulo" tabIndex={-1} className="m-0 text-[32px] leading-10 font-extrabold tracking-question outline-none">
              <span className="sr-only">{kickers.join(', ')}: </span>
              {D[kind]?.q}
            </h2>
            <p className="m-0 text-[17px] leading-[27px] text-ink-2">{D[kind]?.ajuda}</p>
          </div>
          {stepError && (
            <StepError
              extra={
                incomplete.length > 0 && (
                  <ul className="m-0 flex list-none flex-col gap-2 p-0 pl-7.5">
                    {incomplete.map((p) => (
                      <li key={p.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[15px] leading-[22px] text-ink">
                        <span className="flex-[1_1_260px]">O passo «{stepName(p)}» está por completar.</span>
                        <button type="button" className={secondarySmall} onClick={() => go('pn:' + p.id, { volta: 'percurso' })}>
                          <Icon name="pen" size={16} />
                          Completar<span className="sr-only"> {stepName(p)}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )
              }
            >
              {stepError}
            </StepError>
          )}
          {body}
          <WizardFooter
            previous={view !== 'ident' || fromReview ? previous : undefined}
            previousText={fromReview && startSection ? 'Voltar à revisão' : 'Anterior'}
            next={next}
            nextText={nextText}
            last={last}
            lastIcon="check"
            enterHint={!['pm', 'percurso', 'campos'].includes(kind)}
          />
        </form>

        {pa0 && (
          <aside aria-labelledby="titulo-percurso-mini" className="sticky top-6 flex max-w-full flex-[1_1_280px] flex-col gap-3 rounded-lg border border-line-strong bg-tint px-5 pt-5 pb-4">
            <h2 id="titulo-percurso-mini" className="m-0 text-[16px] leading-[22px] font-semibold">
              O percurso até agora
            </h2>
            <ol className="m-0 flex list-none flex-col p-0">
              {P.map((p, i) => {
                const on = p.id === pa0.id
                const ok = p.tipo === 'submissao' ? !!p.quem : complete(p)
                return (
                  <li key={p.id} aria-current={on ? 'step' : undefined} className="flex gap-3">
                    <div aria-hidden="true" className="flex w-7 shrink-0 flex-col items-center">
                      <span
                        className={cx(
                          'grid size-7 place-items-center rounded-full text-label-sm font-extrabold',
                          on ? 'bg-brand text-on-brand' : ok ? 'bg-bg shadow-[inset_0_0_0_2px_var(--color-orange)]' : 'bg-bg shadow-[inset_0_0_0_2px_var(--color-line-strong)]',
                        )}
                      >
                        {i + 1}
                      </span>
                      {i < P.length - 1 && <span className="min-h-2.5 w-0.5 flex-1 bg-line-strong" />}
                    </div>
                    <div className={cx('mb-2.5 flex min-w-0 flex-1 flex-col rounded-tile px-2.5 py-1.5', on && 'bg-accent-soft shadow-[inset_0_0_0_1.5px_var(--color-orange)]')}>
                      <span className="text-[14px] leading-5 font-semibold">
                        <span className="sr-only">{on ? 'A editar agora: ' : ok ? 'Completo: ' : 'Por completar: '}</span>
                        {stepName(p)}
                      </span>
                      <span className={cx('text-label-sm leading-[18px]', p.quem ? 'text-ink-2' : 'text-warning')}>{p.quem || 'Falta escolher quem trata'}</span>
                    </div>
                  </li>
                )
              })}
            </ol>
            <p className="m-0 text-label-sm leading-[19px] text-ink-3">Depois de completar os passos, pode mudar a ordem ou acrescentar outros.</p>
          </aside>
        )}
      </div>
    </WizardLayout>
  )
}
