import { useRef, useState, type ReactNode } from 'react'
import { Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router'
import { Button } from '../components/Button'
import { Chip } from '../components/Chip'
import { DocumentDialog } from '../components/DocumentDialog'
import { FieldError, NoteFrom, Optional, Req } from '../components/form'
import { Icon } from '../components/Icon'
import { AppShell } from '../components/layout/AppShell'
import { ProcedureProgress } from '../components/ProcedureProgress'
import { deadline, fmtDate, fmtDateTime } from '../domain/dates'
import { roleOf, withRole, withRoles } from '../domain/people'
import { attachmentDoc, finalDoc, requestFields, statusOf, type Decision } from '../domain/requests'
import { allowance, dateConflict, eur, tripDays, tripTotal } from '../domain/trip'
import type { DocContent, FileRef, PersonaId, Request, Workflow } from '../domain/types'
import { handlerName, handlerOf, reasonsAC, workflowById } from '../domain/workflows'
import { cx } from '../lib/cx'
import { focusSoon } from '../lib/focus'
import { toneIcon } from '../lib/tones'
import { describedBy, textareaClass } from '../lib/formStyles'
import { useFocusOnArrival } from '../lib/useFocusOnArrival'
import { paths } from '../routes'
import { useDemo, type NavState } from '../state/demoContext'
import { useFeedback } from '../state/feedbackContext'

type MenuKey = 'devolver' | 'rejeitar'

const secondarySmall =
  'box-border inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-pill border-emph border-field bg-bg px-4 text-[14px] font-semibold text-ink hover:bg-soft'
const card = 'rounded-md border border-line bg-panel'

/** E08 · Rever pedido (UC17, UC18, UC19, UC25) · E10 · Validação final (UC22, UC23) · E06 · Ver o pedido */
export function RequestPage({ persona }: { persona: PersonaId }) {
  const { id } = useParams()
  const { pedidos, wfs } = useDemo()
  const p = pedidos.find((x) => x.id === id)
  if (!p) return <Navigate to={paths.inbox} replace />
  return <RequestView key={p.id + persona} persona={persona} p={p} wf={workflowById(wfs, p.wf)} />
}

function RequestView({ persona, p, wf }: { persona: PersonaId; p: Request; wf: Workflow }) {
  const { decidir } = useDemo()
  const feedback = useFeedback()
  const location = useLocation()
  const navigate = useNavigate()
  const [search] = useSearchParams()
  const nav = (location.state as NavState | null) || {}
  const headingRef = useRef<HTMLHeadingElement>(null)
  useFocusOnArrival(headingRef)

  const viewOnly = search.get('ver') === '1'
  const handler = handlerOf(wf, p.passo)
  const canAct = !viewOnly && p.estado === 'em curso' && handler === persona
  const passo = wf.passos[p.passo]
  // only the last step closes the procedure
  const validation = canAct && passo?.tipo === 'validacao' && p.passo === wf.passos.length - 1
  const ac = p.wf === 'ac'

  // the reviewer's notes, by field; after «Desfazer» they come back
  const [mine, setMine] = useState<Record<string, string>>(() => Object.fromEntries((nav.notas || []).map((n) => [n.campo, n.texto])))
  const [edit, setEdit] = useState('')
  const [draft, setDraft] = useState('')
  const [noteError, setNoteError] = useState(false)
  const [menu, setMenu] = useState<'' | MenuKey>('')
  const [chosen, setChosen] = useState<Record<MenuKey, string[]>>({ devolver: [], rejeitar: [] })
  const [message, setMessage] = useState<Record<MenuKey, string>>({ devolver: '', rejeitar: '' })
  const [reasonError, setReasonError] = useState<'' | MenuKey>('')
  const [messageError, setMessageError] = useState<'' | MenuKey>('')
  const [confirmed, setConfirmed] = useState(false)
  const [confirmError, setConfirmError] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [doc, setDoc] = useState<DocContent | null>(null)
  const [docOpen, setDocOpen] = useState(false)


  const showDoc = (d: DocContent) => {
    setDoc(d)
    setDocOpen(true)
  }
  const conflictTxt = ac ? dateConflict(p.d) || '' : ''
  const nMine = Object.keys(mine).length
  const first = String(p.req.nome).split(' ')[0]
  const reqNC = withRole(p.req.nome)

  // notes left by others: while reviewing, those of the previous step; otherwise the open ones
  const othersOf = (k: string) =>
    (canAct ? p.notasInfo || [] : p.notas.filter((n) => !n.resolvida)).filter((n) => n.campo === k).map((n) => ({ quem: withRole(n.quem), texto: n.texto }))

  const fields = requestFields(p, wf)
  const labelOf = (k: string) => fields.find((x) => x.k === k)?.rot || (k === 'despesas' ? 'Despesas' : k === 'anexos' ? 'Documentos' : k)

  // a plain function, not a component: the note editor keeps its focus while typing
  function noteBlock(k: string, rot: string) {
    return (
      <>
        {othersOf(k).map((o, i) => (
          <NoteFrom key={i} quem={o.quem} texto={o.texto} />
        ))}
        {mine[k] && edit !== k && (
          <div className="edge flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md bg-accent-soft py-1.5 pr-1.5 pl-3 text-[14px] leading-[21px] text-ink">
            <Icon name="message" size={16} className="text-accent-ink" />
            <span className="flex-[1_1_200px]">
              <strong className="font-semibold">A sua nota:</strong> {mine[k]}
            </span>
            <button
              type="button"
              className={secondarySmall}
              onClick={() => {
                const next = { ...mine }
                delete next[k]
                setMine(next)
                focusSoon('nb-' + k)
                feedback('Nota apagada')
              }}
            >
              Apagar<span className="sr-only"> a nota sobre {rot}</span>
            </button>
          </div>
        )}
        {edit === k && (
          <div className="flex flex-col gap-2 rounded-md border border-line-strong bg-tint p-3.5">
            <label htmlFor="nota-editor" className="text-[14px] leading-5 font-semibold">
              Nota sobre «{rot}» <Req />
              <span className="sr-only"> (obrigatório)</span>
            </label>
            <span id="nota-ajuda" className="text-label-sm leading-[19px] text-ink-3">
              Diga o que está mal e como corrigir. Quem fez o pedido vê a nota junto deste campo.
            </span>
            <textarea
              id="nota-editor"
              rows={4}
              required
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value)
                setNoteError(false)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation()
                  cancelNote()
                }
              }}
              aria-invalid={noteError || undefined}
              aria-describedby={describedBy('nota-ajuda', noteError && 'nota-erro')}
              className={textareaClass(noteError, 'min-h-26 text-[15px] leading-[22px]')}
            />
            {noteError && (
              <span role="alert">
                <FieldError id="nota-erro">Escreva a nota antes de guardar. Se já não precisa dela, carregue em «Cancelar».</FieldError>
              </span>
            )}
            <div className="flex flex-wrap gap-2">
              <button type="button" className={secondarySmall} onClick={cancelNote}>
                Cancelar
              </button>
              <Button size="s" icon="check" onClick={saveNote}>
                Guardar nota
              </Button>
            </div>
          </div>
        )}
      </>
    )
  }
  const noteButton = (k: string, rot: string) =>
    canAct &&
    edit !== k && (
      <button
        type="button"
        id={'nb-' + k}
        className={secondarySmall}
        onClick={() => {
          setEdit(k)
          setDraft(mine[k] || '')
          setNoteError(false)
          focusSoon('nota-editor')
        }}
      >
        <Icon name="message" size={16} />
        {mine[k] ? 'Editar nota' : 'Nota'}
        <span className="sr-only"> sobre {rot}</span>
      </button>
    )
  function cancelNote() {
    const k = edit
    setEdit('')
    setDraft('')
    setNoteError(false)
    focusSoon('nb-' + k)
  }
  function saveNote() {
    // an empty note is not saved: deleting has its own button
    const t = draft.trim()
    if (!t) {
      setNoteError(true)
      focusSoon('nota-editor')
      return
    }
    const k = edit
    const isNew = !mine[k]
    setMine({ ...mine, [k]: t })
    setEdit('')
    setDraft('')
    setNoteError(false)
    focusSoon('nb-' + k)
    feedback(isNew ? 'Nota guardada' : 'Nota alterada')
  }

  const act = (o: Omit<Decision, 'notas'>) => decidir(p.id, { ...o, notas: Object.keys(mine).map((k) => ({ campo: k, rot: labelOf(k), texto: mine[k] })) })

  // returning and rejecting are separate actions; each opens its own list of reasons, and more than one can be chosen
  const reasons = ac ? reasonsAC(p.passo) : passo?.motivos || []
  const datesMessage = conflictTxt ? conflictTxt + ' Junte o certificado correto ou corrija as datas da deslocação.' : ''
  const menus = (['devolver', 'rejeitar'] as MenuKey[])
    .map((k) => ({ k, fix: k === 'devolver', list: reasons.filter((m) => !!m.fix === (k === 'devolver')) }))
    .filter((m) => m.list.length > 0)

  function confirmMenu(k: MenuKey, list: Array<{ nome: string }>) {
    const picked = chosen[k].filter((n) => list.some((m) => m.nome === n))
    if (!picked.length) {
      setReasonError(k)
      focusSoon(k + '-motivos')
      return
    }
    const text = message[k].trim()
    if (k === 'devolver' && nMine === 0 && !text) {
      setMessageError(k)
      focusSoon(k + '-msg')
      return
    }
    act({ acao: k, motivos: list.filter((m) => picked.includes(m.nome)).map((m) => m.nome), mensagem: text })
  }

  const est = statusOf(p, wf)
  const pr = deadline(p.prazo)
  const prox = wf.passos[p.passo + 1]
  const final = finalDoc(p, wf)
  const steps = wf.passos.map((x, i) => {
    const q = handlerName(wf, i, p)
    return { label: x.nome, meta: q, meta2: roleOf(q) }
  })
  let longState = ''
  if (p.estado === 'em curso')
    longState =
      `Está no passo ${p.passo + 1} de ${wf.passos.length}: ${String(passo?.nome || '').toLowerCase()}, com ${withRole(handlerName(wf, p.passo, p))}. ` +
      (pr.txt ? pr.txt + ' para a resposta.' : '')
  else if (p.estado === 'fechado') longState = `Concluído a ${fmtDate(p.fechadoEm)} por ${withRole(p.fechadoPor || '')}. O documento final está pronto.`
  else if (p.estado === 'devolvido') longState = `Devolvido para correção por ${withRole(p.devolvidoPor || 'revisor')}. Corrija até ${fmtDate(p.prazo)}.`
  else if (p.estado === 'rejeitado') longState = `Rejeitado por ${withRole(p.rejeitadoPor || 'revisor')}: ${p.motivo || ''}.`

  const changes =
    (p.versao || 1) > 1
      ? p.notas
          .filter((n) => n.resolvida)
          .map((n) => `${n.rot}: ${withRole(n.quem)} pediu «${n.texto}»`)
          .concat(p.anexos.filter((a) => (a.v || 1) === p.versao).map((a) => 'Ficheiro novo: ' + a.nome))
      : []
  const receipts = new Set(p.desp.map((x) => x.comp?.nome).filter(Boolean))
  const files = p.anexos.filter((a) => !(ac && receipts.has(a.nome)))
  const days = tripDays(p.d)
  const totalTxt = ac ? eur(tripTotal(p.d, p.desp)) : '—'
  const totalLabel = ac ? 'Total a reembolsar' : 'Valor'
  const reasonsShown = p.motivos?.length ? p.motivos : [p.motivo || '—']
  const openNotes = p.notas.filter((n) => !n.resolvida).length
  const notesSummary =
    (nMine === 0 ? 'Ainda não deixou notas.' : nMine === 1 ? 'Deixou 1 nota.' : `Deixou ${nMine} notas.`) +
    (nMine ? ` Se devolver, as notas vão para ${first} junto dos campos.` : ' Use «Nota» junto de um campo para assinalar um problema.')
  const checks = [
    ac
      ? conflictTxt
        ? { ok: false, txt: 'As datas do certificado não coincidem com a deslocação.' }
        : { ok: true, txt: 'As datas do certificado coincidem com a deslocação.' }
      : null,
    p.anexos.length
      ? { ok: true, txt: p.anexos.length === 1 ? '1 comprovativo junto.' : `${p.anexos.length} comprovativos juntos.` }
      : { ok: false, txt: 'Não há comprovativos.' },
    { ok: true, txt: 'Aprovado em todos os passos anteriores.' },
  ].filter((x): x is { ok: boolean; txt: string } => !!x)

  const goBack = () => (nav.de ? navigate(-1) : navigate(paths.inbox))
  const section = (id: string, title: ReactNode, k: string | null, rot: string, children: ReactNode, extra?: string) => (
    <section aria-labelledby={id} className={cx(card, 'flex flex-col gap-3.5 px-6.5 py-5.5', extra)}>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <h2 id={id} className="m-0 text-title-sm font-semibold">
          {title}
        </h2>
        {k && noteButton(k, rot)}
      </div>
      {children}
      {k && noteBlock(k, rot)}
    </section>
  )

  return (
    <AppShell persona={persona} active="inbox" mainClassName="max-w-detail gap-6">
      <header className="flex flex-col gap-3.5">
        <Button variant="secondary" size="l" icon="arrowLeft" className="self-start" onClick={goBack}>
          Anterior<span className="sr-only">: {nav.de || 'Caixa de tarefas'}</span>
        </Button>
        <h1 id="titulo-pedido" ref={headingRef} tabIndex={-1} className="m-0 text-headline-lg outline-none">
          {wf.nome} · <span className="text-orange">{p.req.nome}</span>
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <Chip tone={est.tom} icon={toneIcon[est.tom]}>
            {est.txt}
          </Chip>
          {(p.estado === 'em curso' || p.estado === 'devolvido') && (
            <Chip tone={pr.p === 'atraso' ? 'bad' : pr.p === 'perto' ? 'warn' : 'neutro'} icon={pr.p === 'atraso' ? 'alertTriangle' : 'clock'}>
              {pr.txt}
            </Chip>
          )}
          {(p.versao || 1) > 1 && (
            <Chip tone="info" icon="pen">
              Versão {p.versao}
            </Chip>
          )}
          <span className="text-[14px] text-ink-3 tabular-nums">
            {(p.req.cargo || roleOf(p.req.nome)) + (p.req.unidade ? ', ' + p.req.unidade : '')} · {p.id} · recebido a {fmtDateTime(p.recebido)}
          </span>
        </div>
      </header>

      <section aria-label="Passos do procedimento" className={cx(card, 'px-6 pt-5 pb-4')}>
        <ProcedureProgress steps={steps} current={p.estado === 'devolvido' ? 0 : p.passo} estado={p.estado === 'em curso' ? '' : p.estado} />
      </section>

      {canAct && changes.length > 0 && (
        <section aria-labelledby="titulo-mudou" className="edge flex flex-col gap-2.5 rounded-md bg-info-soft px-5.5 py-4.5">
          <h2 id="titulo-mudou" className="m-0 flex items-center gap-2 text-[17px] leading-6 font-semibold text-info">
            <Icon name="pen" size={18} />O que mudou na versão {p.versao}
          </h2>
          <ul className="m-0 flex flex-col gap-1 pl-5.5 text-[15px] leading-[22px]">
            {changes.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </section>
      )}

      {!canAct && (p.estado === 'devolvido' || p.estado === 'rejeitado') && (
        <section
          aria-labelledby="titulo-motivo"
          className={cx('edge flex flex-col gap-2.5 rounded-md px-5.5 py-4.5', p.estado === 'rejeitado' ? 'bg-error-soft' : 'bg-warning-soft')}
        >
          <h2 id="titulo-motivo" className="m-0 text-[17px] leading-6 font-semibold">
            {p.estado === 'rejeitado' ? 'Rejeitado por ' + withRole(p.rejeitadoPor || 'revisor') : 'Devolvido para correção por ' + withRole(p.devolvidoPor || 'revisor')}
            {reasonsShown.length === 1 ? ' · motivo:' : ' · motivos:'}
          </h2>
          <ul className="m-0 flex flex-col gap-0.5 pl-5.5 text-[15px] leading-[23px] font-semibold">
            {reasonsShown.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
          {(p.notaGeral || openNotes > 0) && (
            <p className="m-0 text-[15px] leading-[23px]">
              {p.notaGeral ? `«${p.notaGeral}» ` : ''}
              {openNotes ? 'As notas aparecem junto dos campos.' : ''}
            </p>
          )}
          {p.estado === 'devolvido' && p.requerente === persona && (
            <Button to={paths.correct(p.id)} icon="pen" className="self-start">
              Corrigir o pedido
            </Button>
          )}
        </section>
      )}

      <div className="flex flex-wrap items-start gap-7">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-6">
          {canAct && (
            <p className="m-0 flex items-start gap-2 text-[15px] leading-[23px] text-ink-2">
              <Icon name="info" size={18} className="mt-0.5 text-accent-ink" />
              <span>
                Reveja os dados. Se alguma coisa estiver mal, use <strong>Nota</strong> junto do campo: {p.req.nome} vê a nota ao lado desse campo quando corrigir.
              </span>
            </p>
          )}
          <section aria-labelledby="titulo-requerente" className={cx(card, 'flex flex-col gap-2.5 px-6.5 py-5.5')}>
            <h2 id="titulo-requerente" className="m-0 text-title-sm font-semibold">
              Requerente
            </h2>
            <dl className="m-0 flex flex-wrap gap-x-6 gap-y-2.5">
              {[
                { rot: 'Nome', v: p.req.nome },
                { rot: 'Cargo', v: p.req.cargo || roleOf(p.req.nome) || '—' },
                { rot: 'Unidade orgânica', v: p.req.unidade || '—' },
                { rot: 'Chefia direta', v: p.req.chefia ? withRole(p.req.chefia) : '—' },
              ].map((r) => (
                <div key={r.rot} className="flex flex-[1_1_200px] flex-col gap-0.5">
                  <dt className="text-label-sm leading-[18px] font-semibold text-ink-3">{r.rot}</dt>
                  <dd className="m-0 text-[15px] leading-[22px]">{r.v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="titulo-dados" className={cx(card, 'flex flex-col gap-1.5 px-6.5 pt-5.5 pb-3')}>
            <h2 id="titulo-dados" className="m-0 text-title-sm font-semibold">
              Dados do pedido
            </h2>
            <dl className="m-0 flex flex-col">
              {fields.map((c) => (
                <div key={c.k} className="flex flex-wrap gap-x-5 gap-y-1 border-t border-line py-3">
                  <dt className="flex-[0_0_190px] pt-2 text-[14px] leading-5 font-semibold text-ink-2">{c.rot}</dt>
                  <dd className="m-0 flex min-w-0 flex-[1_1_320px] flex-col gap-2">
                    <div className="flex min-h-10 flex-wrap items-center gap-x-3 gap-y-2">
                      <span className="flex-[1_1_200px] text-[16px] leading-6 tabular-nums [overflow-wrap:anywhere]">{c.v || '—'}</span>
                      {c.k === 'cert' && !!conflictTxt && (
                        <span className="box-border inline-flex min-h-7.5 items-center gap-1.5 rounded-pill bg-error py-0.5 pr-3 pl-2.5 text-[14px] leading-5 font-bold whitespace-nowrap text-on-status shadow-[0_0_0_3px_var(--color-error-soft)]">
                          <Icon name="alertTriangle" size={14} />
                          Não coincide com a deslocação
                        </span>
                      )}
                      {noteButton(c.k, c.rot)}
                    </div>
                    {noteBlock(c.k, c.rot)}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {section(
            'titulo-despesas',
            ac ? 'Despesas e valores' : 'Ficheiros e valores',
            'despesas',
            'Despesas',
            ac && (
              <div className="overflow-x-auto rounded-md border border-line">
                <table className="w-full min-w-[600px] border-collapse text-[15px] leading-[22px]">
                  <caption className="sr-only">Despesas e valores do pedido</caption>
                  <thead>
                    <tr className="bg-soft text-left">
                      {['Despesa', 'Data', 'Comprovativo'].map((h) => (
                        <th key={h} scope="col" className="px-4 py-2.5 text-label-sm font-semibold text-ink-2">
                          {h}
                        </th>
                      ))}
                      <th scope="col" className="px-4 py-2.5 text-right text-label-sm font-semibold text-ink-2">
                        Valor
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.desp.map((x, i) => (
                      <tr key={i} className="border-t border-line">
                        <th scope="row" className="px-4 py-2.5 text-left font-normal">
                          {x.tipo + (x.desc ? ' · ' + x.desc : '')}
                        </th>
                        <td className="px-4 py-2.5 tabular-nums">{fmtDate(x.data)}</td>
                        <td className="px-3 py-1.5">
                          {x.comp ? (
                            <button
                              type="button"
                              className={secondarySmall}
                              onClick={() => {
                                const a: FileRef = p.anexos.find((y) => y.nome === x.comp?.nome) || { quando: p.recebido, ...x.comp! }
                                showDoc(attachmentDoc(p, a))
                              }}
                            >
                              <Icon name="eye" size={16} />
                              <span className="[overflow-wrap:anywhere]">{x.comp.nome}</span>
                              <span className="sr-only"> (ver o comprovativo)</span>
                            </button>
                          ) : (
                            <span className="text-label-sm text-ink-3">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums">{eur(x.valor)}</td>
                      </tr>
                    ))}
                    <tr className="border-t border-line">
                      <th scope="row" className="px-4 py-2.5 text-left font-normal">
                        Ajudas de custo · {days === 1 ? '1 dia' : days + ' dias'}
                      </th>
                      <td className="px-4 py-2.5">Calculado</td>
                      <td className="px-4 py-2.5 text-label-sm text-ink-3">Não precisa</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{eur(allowance(p.d))}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-line-strong bg-tint">
                      <th scope="row" colSpan={3} className="px-4 py-3 text-left font-semibold">
                        Total
                      </th>
                      <td className="px-4 py-3 text-right text-[18px] font-extrabold tabular-nums">{totalTxt}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ),
          )}

          {section(
            'titulo-anexos',
            `${ac ? 'Certificado e outros documentos' : 'Ficheiros'} · ${files.length}`,
            'anexos',
            'Documentos',
            <>
              {files.length === 0 && (
                <p className="m-0 text-[15px] leading-[23px] text-ink-2">Não há outros documentos. Os comprovativos das despesas abrem-se na tabela acima.</p>
              )}
              <ul className="m-0 flex list-none flex-col p-0">
                {files.map((a, i) => {
                  const v = a.v || 1
                  return (
                    <li key={a.nome + i} className={cx('flex flex-wrap items-center gap-x-3.5 gap-y-2.5 py-3', i > 0 && 'border-t border-line')}>
                      <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-tile bg-soft text-accent-ink">
                        <Icon name="fileText" size={20} />
                      </span>
                      <span className="flex min-w-0 flex-[1_1_200px] flex-col">
                        <span className="text-[15px] font-semibold [overflow-wrap:anywhere]">{a.nome}</span>
                        <span className="text-label-sm text-ink-3">
                          {a.kb} KB · junto a {fmtDate(a.quando)}
                        </span>
                      </span>
                      {v > 1 && v === (p.versao || 1) && (
                        <Chip tone="info" size="xs" icon="plus">
                          Novo na versão {v}
                        </Chip>
                      )}
                      <button type="button" className={secondarySmall} onClick={() => showDoc(attachmentDoc(p, a))}>
                        <Icon name="eye" size={16} />
                        Ver<span className="sr-only"> {a.nome}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </>,
          )}

          <section aria-labelledby="titulo-historico" className={cx(card, 'flex flex-col py-4 pr-5 pl-6.5')}>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <h2 id="titulo-historico" className="m-0 flex flex-[1_1_220px] items-center gap-2 text-[16px] leading-6 font-semibold">
                <Icon name="history" size={18} className="text-accent-ink" />
                Histórico do pedido · {p.hist.length} registos
              </h2>
              <button type="button" className={secondarySmall} aria-expanded={historyOpen} aria-controls="lista-historico" onClick={() => setHistoryOpen((v) => !v)}>
                <Icon name={historyOpen ? 'chevronUp' : 'eye'} size={16} />
                {historyOpen ? 'Esconder histórico' : 'Ver histórico'}
              </button>
            </div>
            {historyOpen && (
              <ol id="lista-historico" className="m-0 mt-3.5 flex animate-surge list-none flex-col p-0">
                {p.hist
                  .slice()
                  .reverse()
                  .map((h, i) => (
                    <li key={i} className="flex flex-wrap gap-x-4 gap-y-0.5 border-t border-line py-2.5 text-[14px] leading-[21px]">
                      <span className="flex-[0_0_140px] text-ink-3 tabular-nums">{fmtDateTime(h.q)}</span>
                      <span className="flex-[1_1_260px]">{withRoles(h.o)}</span>
                    </li>
                  ))}
              </ol>
            )}
          </section>
        </div>

        <div className={cx('flex max-w-full flex-[1_1_340px] flex-col gap-5', !menu && 'sticky top-4')}>
          {canAct ? (
            <section aria-labelledby="titulo-decisao" className="edge flex flex-col gap-4 rounded-md bg-soft p-6">
              <h2 id="titulo-decisao" className="m-0 text-title-lg font-semibold">
                A sua decisão
              </h2>
              {validation && (
                <div className="flex flex-col gap-2.5">
                  <h3 className="m-0 text-[15px] leading-[22px] font-semibold">Verificações automáticas</h3>
                  <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[14px] leading-[21px]">
                    {checks.map((k) => (
                      <li key={k.txt} className="flex items-start gap-2">
                        <Icon name={k.ok ? 'check' : 'alertTriangle'} size={18} className={k.ok ? 'text-success' : 'text-error'} />
                        <span className={k.ok ? '' : 'font-bold text-error'}>
                          <span className="sr-only">{k.ok ? 'Confirmado: ' : 'Atenção: '}</span>
                          {k.txt}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {!!conflictTxt && (
                    <div className="flex flex-col gap-2.5 rounded-md border-2 border-error bg-error-soft p-3.5">
                      <p className="error-line m-0 flex gap-2 text-[14px] leading-[21px] text-ink">
                        <Icon name="alertTriangle" size={18} className="text-error" />
                        <span>
                          <strong className="text-error">Datas que não coincidem.</strong> {conflictTxt}
                        </span>
                      </p>
                      <label className="flex cursor-pointer items-start gap-2.5 text-[14px] leading-[21px] font-semibold">
                        <input
                          id="conf-datas"
                          type="checkbox"
                          required
                          checked={confirmed}
                          onChange={(e) => {
                            setConfirmed(e.target.checked)
                            setConfirmError(false)
                          }}
                          aria-invalid={confirmError || undefined}
                          aria-describedby={describedBy('conf-ajuda', confirmError && 'conf-erro')}
                          className="m-0 size-5.5 shrink-0 accent-orange"
                        />
                        <span>
                          Verifiquei o certificado e aceito as datas como estão <Req />
                        </span>
                      </label>
                      <span id="conf-ajuda" className="-mt-1 pl-8 text-label-sm leading-[19px] text-ink-3">
                        Obrigatório para validar e fechar. Se não aceita as datas, use «Devolver para correção», em baixo.
                      </span>
                      {confirmError && <FieldError id="conf-erro">Para fechar, confirme as datas ou devolva o pedido.</FieldError>}
                    </div>
                  )}
                </div>
              )}
              <dl className="m-0 flex items-baseline justify-between gap-3 border-y border-line-strong py-3">
                <dt className="text-[15px] font-semibold">{totalLabel}</dt>
                <dd className="m-0 text-[26px] leading-8 font-extrabold tracking-heading tabular-nums">{totalTxt}</dd>
              </dl>
              <p className="m-0 flex items-start gap-2 text-[14px] leading-[21px] text-ink-2">
                <Icon name="message" size={16} className="mt-px text-accent-ink" />
                <span>{notesSummary}</span>
              </p>
              {menus.map(({ k, fix, list }) => {
                const open = menu === k
                const messageRequired = fix && nMine === 0
                const rError = open && reasonError === k
                const mError = open && messageRequired && messageError === k
                return (
                  <div key={k} className="flex flex-col gap-2.5">
                    <button
                      type="button"
                      id={'btn-' + k}
                      aria-expanded={open}
                      aria-controls={'menu-' + k}
                      onClick={() => {
                        setMenu(open ? '' : k)
                        setReasonError('')
                        setMessageError('')
                      }}
                      className={cx(
                        'box-border inline-flex min-h-13 w-full items-center justify-start gap-2 rounded-pill border-emph px-4.5 text-[15px] font-semibold text-ink',
                        open ? 'border-orange bg-accent-soft' : 'border-field bg-bg hover:bg-soft',
                      )}
                    >
                      <Icon name={fix ? 'reset' : 'x'} size={18} />
                      <span className="flex-1 text-left">{fix ? 'Devolver para correção' : 'Rejeitar o pedido'}</span>
                      <Icon name={open ? 'chevronUp' : 'chevronDown'} size={18} />
                    </button>
                    {open && (
                      <div
                        id={'menu-' + k}
                        role="region"
                        aria-labelledby={'btn-' + k}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            e.stopPropagation()
                            setMenu('')
                            focusSoon('btn-' + k)
                          }
                        }}
                        className={cx('flex animate-surge flex-col gap-4 rounded-lg border-2 bg-bg p-4.5', fix ? 'border-orange' : 'border-error')}
                      >
                        <fieldset
                          id={k + '-motivos'}
                          tabIndex={-1}
                          aria-describedby={describedBy(k + '-ajuda', rError && k + '-erro')}
                          className="m-0 flex flex-col gap-2 border-0 p-0 outline-none"
                        >
                          <legend className="mb-1 p-0 text-[15px] leading-[22px] font-semibold">
                            {fix ? 'Porque devolve o pedido?' : 'Porque rejeita o pedido?'} <Req />
                            <span className="sr-only"> (obrigatório)</span>
                          </legend>
                          <span id={k + '-ajuda'} className="-mt-0.5 text-label-sm leading-[19px] text-ink-3">
                            {fix ? `O pedido volta para ${first} corrigir.` : 'O pedido é encerrado e não pode ser corrigido.'} Escolha um ou mais motivos.
                          </span>
                          {rError && <FieldError id={k + '-erro'}>Escolha pelo menos um motivo.</FieldError>}
                          {list.map((m) => {
                            const on = chosen[k].includes(m.nome)
                            return (
                              <label
                                key={m.nome}
                                className={cx(
                                  'choice-card box-border flex min-h-13 cursor-pointer items-center gap-3 rounded-item px-3.5 py-2.5',
                                  on ? 'border-2 border-orange bg-accent-soft' : 'border border-line-strong bg-panel',
                                )}
                              >
                                <input
                                  type="checkbox"
                                  value={m.nome}
                                  checked={on}
                                  onChange={(e) => {
                                    const mark = e.target.checked
                                    setChosen((c) => ({ ...c, [k]: c[k].filter((x) => x !== m.nome).concat(mark ? [m.nome] : []) }))
                                    if (mark && fix && /datas/i.test(m.nome) && datesMessage && !message[k].trim())
                                      setMessage((x) => ({ ...x, [k]: datesMessage }))
                                    setReasonError('')
                                    setMessageError('')
                                  }}
                                  className="m-0 size-5.5 shrink-0 accent-orange"
                                />
                                <span className="flex-1 text-[15px] leading-[21px] font-semibold">{m.nome}</span>
                              </label>
                            )
                          })}
                        </fieldset>
                        <div className="flex flex-col gap-1.5">
                          <label htmlFor={k + '-msg'} className="text-[15px] leading-[22px] font-semibold">
                            Mensagem para {reqNC}{' '}
                            {messageRequired ? (
                              <>
                                <Req />
                                <span className="sr-only"> (obrigatório)</span>
                              </>
                            ) : (
                              <Optional />
                            )}
                          </label>
                          <span id={k + '-msg-ajuda'} className="text-label-sm leading-[19px] text-ink-3">
                            {fix
                              ? nMine
                                ? 'As notas que deixou nos campos já explicam o que corrigir. Pode acrescentar uma mensagem.'
                                : 'Obrigatória: não deixou notas nos campos, por isso diga aqui o que tem de ser corrigido.'
                              : 'Explique, se quiser, a razão da rejeição.'}
                          </span>
                          <textarea
                            id={k + '-msg'}
                            rows={3}
                            required={messageRequired}
                            value={message[k]}
                            onChange={(e) => {
                              const v = e.target.value
                              setMessage((x) => ({ ...x, [k]: v }))
                              setMessageError('')
                            }}
                            aria-invalid={mError || undefined}
                            aria-describedby={describedBy(k + '-msg-ajuda', mError && k + '-msg-erro')}
                            className={textareaClass(mError, 'min-h-24 text-[15px] leading-[22px]')}
                          />
                          {mError && (
                            <span role="alert">
                              <FieldError id={k + '-msg-erro'}>Diga a {first} o que tem de corrigir: escreva a mensagem ou deixe uma nota no campo.</FieldError>
                            </span>
                          )}
                        </div>
                        {fix && (
                          <p className="m-0 flex items-start gap-2 text-[14px] leading-[21px] text-ink-2">
                            <Icon name="message" size={16} className="mt-px text-accent-ink" />
                            <span>
                              {nMine
                                ? nMine === 1
                                  ? 'Vai também a nota que deixou num campo.'
                                  : `Vão também as ${nMine} notas que deixou nos campos.`
                                : 'Não deixou notas nos campos. Pode acrescentá-las com «Nota», junto de cada campo.'}
                            </span>
                          </p>
                        )}
                        <div className="flex flex-col gap-2.5">
                          <Button
                            variant="secondary"
                            className="w-full"
                            onClick={() => {
                              setMenu('')
                              setReasonError('')
                              setMessageError('')
                              focusSoon('btn-' + k)
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button id={k + '-confirmar'} variant={fix ? 'primary' : 'danger'} className="w-full" onClick={() => confirmMenu(k, list)}>
                            {fix ? 'Devolver para correção' : 'Rejeitar o pedido'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
              <Button
                id="btn-aprovar"
                size="l"
                icon="check"
                iconSize={20}
                onClick={() => {
                  if (validation && conflictTxt && !confirmed) {
                    setConfirmError(true)
                    focusSoon('conf-datas')
                    return
                  }
                  act({ acao: validation ? 'fechar' : 'aprovar' })
                }}
              >
                {validation ? 'Validar e fechar' : 'Aprovar'}
              </Button>
              <p className="-mt-1.5 mb-0 text-center text-label-sm leading-[19px] text-ink-2">
                {validation
                  ? `Fecha o procedimento e gera a ${final.titulo.toLowerCase()}.`
                  : prox
                    ? `Segue para o passo «${prox.nome}», com ${withRole(handlerName(wf, p.passo + 1, p))}.`
                    : 'Fecha o procedimento.'}
              </p>
            </section>
          ) : (
            <section aria-labelledby="titulo-estado" className="edge flex flex-col gap-3 rounded-md bg-soft p-6">
              <h2 id="titulo-estado" className="m-0 text-title-lg font-semibold">
                Estado
              </h2>
              <p className="m-0 text-[15px] leading-[23px]">{longState}</p>
              <dl className="m-0 flex items-baseline justify-between gap-3 border-t border-line-strong pt-3">
                <dt className="text-[15px] font-semibold">{totalLabel}</dt>
                <dd className="m-0 text-[24px] font-extrabold tabular-nums">{totalTxt}</dd>
              </dl>
              {p.estado === 'fechado' && (
                <Button icon="download" onClick={() => showDoc(final)}>
                  {final.titulo} (PDF)
                </Button>
              )}
            </section>
          )}
        </div>
      </div>
      <DocumentDialog doc={doc} open={docOpen} onClose={() => setDocOpen(false)} />
    </AppShell>
  )
}
