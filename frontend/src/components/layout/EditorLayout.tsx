import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { cx } from '../../lib/cx'
import { Icon } from '../Icon'
import { Logo } from '../Logo'

export type EditorTab = { label: string; to: string; active: boolean }

type EditorLayoutProps = {
  backTo: string
  backLabel: string
  title: string
  status: ReactNode
  tabs?: EditorTab[]
  actions?: ReactNode
  children: ReactNode
}

/** Full-width workspace for the workflow editor (no sidebar), with its own header. */
export function EditorLayout({ backTo, backLabel, title, status, tabs, actions, children }: EditorLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink">
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
      <header className="flex min-h-18 flex-wrap items-center gap-x-4 gap-y-3 border-b border-line bg-bg px-4 py-3 sm:px-6">
        <Link
          to={backTo}
          aria-label={backLabel}
          className="grid size-11 place-items-center rounded-full text-ink hover:bg-soft hover:text-ink"
        >
          <Icon name="arrowLeft" size={20} />
        </Link>
        <Logo className="h-6" />
        <span aria-hidden="true" className="h-7 w-px bg-line" />
        <h1 className="text-title-lg font-extrabold tracking-heading">{title}</h1>
        {status}
        {tabs && (
          <>
            <span className="hidden flex-1 md:block" />
            <nav aria-label="Partes do workflow" className="flex gap-1 rounded-pill bg-soft p-1">
              {tabs.map((tab) => (
                <Link
                  key={tab.label}
                  to={tab.to}
                  aria-current={tab.active ? 'page' : undefined}
                  className={cx(
                    'inline-flex min-h-10 items-center rounded-pill px-4 text-body-sm',
                    tab.active ? 'bg-brand font-semibold text-on-brand hover:text-on-brand' : 'text-ink-2 hover:bg-bg hover:text-ink',
                  )}
                >
                  {tab.label}
                </Link>
              ))}
            </nav>
          </>
        )}
        {actions && (
          <>
            <span className="hidden flex-1 md:block" />
            <div className="flex flex-wrap items-center gap-3">{actions}</div>
          </>
        )}
      </header>
      <div id="conteudo" tabIndex={-1} className="flex flex-1 flex-col outline-none">
        {children}
      </div>
    </div>
  )
}
