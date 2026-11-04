import type { ReactNode } from 'react'
import { isManager, personas } from '../../domain/people'
import { tasksOf } from '../../domain/requests'
import type { PersonaId } from '../../domain/types'
import { cx } from '../../lib/cx'
import { useDemo } from '../../state/demoContext'
import { Sidebar, type SidebarItem } from './Sidebar'
import { Topbar } from './Topbar'

type Props = {
  persona: PersonaId
  active: SidebarItem
  /** Width and spacing of the page content */
  mainClassName?: string
  children: ReactNode
}

/** Side menu, top bar and the page content */
export function AppShell({ persona, active, mainClassName, children }: Props) {
  const { pedidos, wfs } = useDemo()
  const me = personas[persona]
  return (
    <div className="flex min-h-screen flex-wrap items-stretch bg-bg text-ink">
      <div className="box-border max-w-full flex-[1_0_248px] border-r border-line bg-bg">
        <Sidebar active={active} tasks={tasksOf(pedidos, wfs, persona).length} manager={isManager(persona)} />
      </div>
      <div className="flex min-w-0 flex-[999_1_560px] flex-col">
        <Topbar me={me} />
        <main id="conteudo" tabIndex={-1} className={cx('box-border flex w-full flex-col px-4 pt-6 pb-16 outline-none sm:px-10', mainClassName)}>
          {children}
        </main>
      </div>
    </div>
  )
}
