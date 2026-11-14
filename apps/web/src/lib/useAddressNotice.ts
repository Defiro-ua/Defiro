import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import type { Notice } from '../components/Flash'

/** The notices the server can ask for with `?aviso=…` when it sends the browser back here */
const known = new Map<string, Notice>([['sessao-terminada', { tom: 'ok', titulo: 'Sessão terminada' }]])

/**
 * The notice named in the address (`?aviso=sessao-terminada` after signing out). It is
 * taken out of the address at once, so reloading the page does not show it again.
 */
export function useAddressNotice() {
  const location = useLocation()
  const navigate = useNavigate()
  const [notice, setNotice] = useState<Notice | null>(() => known.get(new URLSearchParams(location.search).get('aviso') ?? '') ?? null)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (!params.has('aviso')) return
    params.delete('aviso')
    const search = params.toString()
    navigate({ pathname: location.pathname, search: search ? `?${search}` : '' }, { replace: true, state: location.state })
  }, [location, navigate])

  return [notice, () => setNotice(null)] as const
}
