import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import type { Notice } from '../domain/types'
import type { NavState } from '../state/demoContext'

/**
 * The notice an action left for this screen (navigation state). It is taken
 * out of the browser history at once, so going back and forth does not show
 * it again.
 */
export function useFlash() {
  const location = useLocation()
  const navigate = useNavigate()
  const incoming = (location.state as NavState | null)?.flash ?? null
  const [flash, setFlash] = useState<(Notice & { n?: number }) | null>(incoming)
  // A new notice for the screen already open (e.g. «Recomeçar a demonstração» from the inbox)
  const [seen, setSeen] = useState(incoming?.n)
  if (incoming && incoming.n !== seen) {
    setSeen(incoming.n)
    setFlash(incoming)
  }

  useEffect(() => {
    const st = location.state as NavState | null
    if (!st?.flash) return
    const rest = { ...st }
    delete rest.flash
    navigate(location.pathname + location.search, { replace: true, state: Object.keys(rest).length ? rest : null })
  }, [location, navigate])

  return [flash, () => setFlash(null)] as const
}
