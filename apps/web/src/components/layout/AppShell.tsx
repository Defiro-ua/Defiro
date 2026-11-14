import { useState, type ReactNode } from 'react'
import { signOut, type MenuItem, type Profile } from '../../api/session'
import { cx } from '../../lib/cx'
import { leaveTo } from '../../lib/leaveTo'
import { Flash, type Notice } from '../Flash'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

type Props = {
  /** Who is signed in (GET /api/me) */
  profile: Profile
  /** The screen that is open, marked in the side menu */
  active?: MenuItem
  /** Width and spacing of the page content */
  mainClassName?: string
  children: ReactNode
}

const signOutFailed: Notice = { tom: 'bad', titulo: 'Não foi possível terminar a sessão', texto: 'Tente outra vez daqui a pouco.' }

/** Side menu, top bar and the page content */
export function AppShell({ profile, active, mainClassName, children }: Props) {
  const [notice, setNotice] = useState<Notice | null>(null)

  async function endSession() {
    try {
      leaveTo(await signOut())
    } catch {
      setNotice(signOutFailed)
    }
  }

  return (
    <div className="flex min-h-screen flex-wrap items-stretch bg-bg text-ink">
      <div className="box-border max-w-full flex-[1_0_248px] border-r border-line bg-bg">
        <Sidebar menu={profile.menu} active={active} />
      </div>
      <div className="flex min-w-0 flex-[999_1_560px] flex-col">
        <Topbar profile={profile} onSignOut={() => void endSession()} />
        <main id="conteudo" tabIndex={-1} className={cx('box-border flex w-full flex-col px-4 pt-6 pb-16 outline-none sm:px-10', mainClassName)}>
          <Flash notice={notice} onClose={() => setNotice(null)} />
          {children}
        </main>
      </div>
    </div>
  )
}
