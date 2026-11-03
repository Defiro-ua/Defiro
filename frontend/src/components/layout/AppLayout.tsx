import { useEffect, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router'
import type { PersonaId } from '../../data/types'
import { cx } from '../../lib/cx'
import { useNativeDialog } from '../../lib/useNativeDialog'
import { Icon } from '../Icon'
import { Sidebar, type SidebarProps } from './Sidebar'
import { Topbar } from './Topbar'

type MainWidth = 'narrow' | 'content' | 'detail' | 'full'

const widths: Record<MainWidth, string> = {
  narrow: 'max-w-narrow',
  content: 'max-w-content',
  detail: 'max-w-detail',
  full: '',
}

type AppLayoutProps = {
  user: PersonaId
  nav: SidebarProps
  /** Forms are shown without the sidebar on desktop (as in the mockup) */
  withSidebar?: boolean
  width?: MainWidth
  /** Tighter top padding for pages that start with a breadcrumb */
  compactTop?: boolean
  searchValue?: string
  /** Space between the main blocks of the page */
  gap?: 'gap-6' | 'gap-7' | 'gap-8' | 'gap-10'
  children: ReactNode
}

/** Sidebar + floating top bar + main content. Below `lg` the sidebar becomes a drawer. */
export function AppLayout({
  user,
  nav,
  withSidebar = true,
  width = 'content',
  compactTop,
  searchValue,
  gap = 'gap-7',
  children,
}: AppLayoutProps) {
  const { pathname } = useLocation()
  // The drawer belongs to the screen it was opened on, so navigating closes it
  const [drawerFor, setDrawerFor] = useState<string | null>(null)
  const drawerOpen = drawerFor === pathname

  // Start at the top whenever the screen changes
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="min-h-screen bg-bg text-ink lg:flex">
      <a
        href="#conteudo"
        className="absolute -top-100 left-3 z-50 rounded-pill bg-ink px-5 py-3 font-semibold text-bg focus:top-3 hover:text-bg"
      >
        Saltar para o conteúdo principal
      </a>
      <a
        href="#botao-acessibilidade"
        className="absolute -top-100 left-3 z-50 rounded-pill bg-ink px-5 py-3 font-semibold text-bg focus:top-3 hover:text-bg"
      >
        Ir para o menu de acessibilidade
      </a>

      {withSidebar && (
        <aside className="hidden w-62 shrink-0 border-r border-line lg:block">
          <div className="min-h-screen">
            <Sidebar {...nav} />
          </div>
        </aside>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={user} searchValue={searchValue} onOpenMenu={() => setDrawerFor(pathname)} />
        <main
          id="conteudo"
          tabIndex={-1}
          className={cx(
            'flex w-full flex-col px-4 pb-16 outline-none md:px-10',
            gap,
            compactTop ? 'pt-6' : 'pt-8',
            widths[width],
          )}
        >
          {children}
        </main>
      </div>

      <NavDrawer open={drawerOpen} onClose={() => setDrawerFor(null)}>
        <Sidebar {...nav} />
      </NavDrawer>
    </div>
  )
}

/** Navigation sheet for phones and tablets, on the native <dialog>. */
function NavDrawer({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  const dialog = useNativeDialog(open, onClose)

  return (
    <dialog
      {...dialog}
      aria-label="Menu principal"
      className="m-0 h-full max-h-none w-72 max-w-screen-gutter overflow-y-auto rounded-r-sheet bg-bg p-0 shadow-menu lg:hidden"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar o menu"
        className="absolute top-4 right-3 z-10 grid size-11 place-items-center rounded-full text-ink hover:bg-soft"
      >
        <Icon name="x" size={20} />
      </button>
      {children}
    </dialog>
  )
}
