import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { isPersonaId } from '../domain/people'
import { decide, initialRequests, noticeFor, resendRequest, submitRequest } from '../domain/requests'
import type { Notice, Request } from '../domain/types'
import { workflowAC, workflowById } from '../domain/workflows'
import { paths } from '../routes'
import { DemoContext, type DemoApi, type DemoData, type NavState } from './demoContext'

const STORAGE_KEY = 'defiro.demo'

const fresh = (): Omit<DemoData, 'persona'> => ({ pedidos: initialRequests(), wfs: [workflowAC()], rasc: null })

/** The demo lives in this tab (sessionStorage): a reload keeps it, a new tab starts again */
function load(): DemoData {
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || 'null') as DemoData | null
    if (saved && Array.isArray(saved.pedidos) && Array.isArray(saved.wfs))
      return { ...saved, persona: isPersonaId(saved.persona) ? saved.persona : null }
  } catch {
    // Blocked storage: start from the beginning
  }
  return { persona: null, ...fresh() }
}

type UndoSnapshot = { id: string; pedidos: Request[]; pedidoId: string; notas: Array<{ campo: string; texto: string }> }

/**
 * Shared data of the prototype: what one person does reaches the next one
 * (Ana submits, Rui reviews, Carla and Joana approve, Sofia creates workflows).
 */
export function DemoProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [data, setData] = useState<DemoData>(load)
  // Actions read the latest data here, so two in a row never work on stale data
  const dataRef = useRef(data)
  const undoRef = useRef<UndoSnapshot | null>(null)
  // Each notice gets its own number, so the same notice twice in a row still shows
  const noticeSeq = useRef(0)

  useEffect(() => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // Blocked storage: the demo still works until the tab is closed
    }
  }, [data])

  const api = useMemo<DemoApi>(() => {
    const go = (to: string, state: NavState = {}, replace = false) => {
      noticeSeq.current += 1
      navigate(to, { replace, state: state.flash ? { ...state, flash: { ...state.flash, n: Date.now() + noticeSeq.current } } : state })
    }
    const update = (patch: Partial<DemoData>) => {
      dataRef.current = { ...dataRef.current, ...patch }
      setData(dataRef.current)
    }
    const flash = (notice: Notice): NavState => ({ flash: notice })

    return {
      ...data,
      entrar: (pid) => {
        undoRef.current = null
        update({ persona: pid })
        go(paths.inbox)
      },
      sair: () => {
        undoRef.current = null
        update({ persona: null })
        go(paths.login, flash({ tom: 'ok', titulo: 'Sessão terminada' }))
      },
      repor: () => {
        undoRef.current = null
        const persona = dataRef.current.persona
        update({ ...fresh(), persona })
        go(persona ? paths.inbox : paths.login, flash({ tom: 'ok', titulo: 'Demonstração reposta', texto: 'Os pedidos e os workflows voltaram ao início.' }))
      },
      submeter: (wfId, submission) => {
        const st = dataRef.current
        if (!st.persona) return
        const wf = workflowById(st.wfs, wfId)
        const r = submitRequest(st.pedidos, wf, submission, st.persona)
        undoRef.current = null
        update({ pedidos: r.requests })
        go(paths.inbox, flash(noticeFor('submeter', r.request, wf)), true)
      },
      reenviar: (id, submission) => {
        const st = dataRef.current
        const r = resendRequest(st.pedidos, id, submission, st.wfs)
        if (!r.request) return
        undoRef.current = null
        update({ pedidos: r.requests })
        go(paths.inbox, flash(noticeFor('reenviar', r.request, workflowById(st.wfs, r.request.wf))), true)
      },
      decidir: (id, decision) => {
        const st = dataRef.current
        if (!st.persona) return
        const r = decide(st.pedidos, st.wfs, id, decision, st.persona)
        if (!r.request) return
        const undoId = 'u' + Date.now().toString(36)
        undoRef.current = { id: undoId, pedidos: st.pedidos, pedidoId: id, notas: (decision.notas || []).map((x) => ({ campo: x.campo, texto: x.texto })) }
        update({ pedidos: r.requests })
        go(paths.inbox, flash({ ...noticeFor(r.acao, r.request, r.wf), undo: undoId }), true)
      },
      desfazer: (undoId) => {
        const u = undoRef.current
        if (!u || u.id !== undoId) return
        undoRef.current = null
        update({ pedidos: u.pedidos })
        go(paths.request(u.pedidoId), { notas: u.notas, de: 'Caixa de tarefas' })
      },
      podeDesfazer: (undoId) => !!undoId && undoRef.current?.id === undoId,
      criarWf: (w, notice) => {
        undoRef.current = null
        update({ wfs: dataRef.current.wfs.concat([w]), rasc: null })
        go(paths.workflows, flash(notice), true)
      },
      setRasc: (w) => update({ rasc: w }),
    }
  }, [data, navigate])

  return <DemoContext.Provider value={api}>{children}</DemoContext.Provider>
}
