import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router'
import { fetchProfile, type Profile } from '../api/session'
import { paths } from '../routes'

type State = { is: 'loading' } | { is: 'signed-in'; profile: Profile } | { is: 'signed-out' } | { is: 'failed' }

/**
 * The screens after signing in. It asks the server who is signed in (GET /api/me) and gives the
 * profile to the screen (useProfile); without a session, back to the home page and its «Entrar».
 */
export function SignedIn() {
  const [state, setState] = useState<State>({ is: 'loading' })

  useEffect(() => {
    let current = true
    fetchProfile().then(
      (profile) => current && setState(profile ? { is: 'signed-in', profile } : { is: 'signed-out' }),
      () => current && setState({ is: 'failed' }),
    )
    return () => {
      current = false
    }
  }, [])

  switch (state.is) {
    case 'loading':
      return (
        <p role="status" className="m-0 p-10 text-ink-2">
          A carregar…
        </p>
      )
    case 'signed-out':
      return <Navigate to={paths.login} replace />
    case 'failed':
      return (
        <div role="alert" className="flex flex-col gap-2 p-10 text-ink">
          <p className="m-0 text-[18px] font-semibold">Não foi possível abrir a defiro</p>
          <p className="m-0 text-ink-2">Recarregue a página daqui a pouco.</p>
        </div>
      )
    case 'signed-in':
      return <Outlet context={state.profile} />
  }
}
