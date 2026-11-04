import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { cx } from '../../lib/cx'
import { paths } from '../../routes'
import { Button } from '../Button'
import { Icon, type IconName } from '../Icon'

export type SidebarItem = 'inbox' | 'novo' | 'workflows'

type Props = {
  active: SidebarItem
  /** Tasks waiting for the person (badge of «Caixa de tarefas») */
  tasks: number
  /** Workflow managers also create workflows */
  manager: boolean
}

const itemBase = 'flex min-h-12 items-center gap-3 rounded-md px-3.5 text-[15px] leading-5 no-underline'
const itemOn = 'bg-accent-soft font-semibold text-ink shadow-[inset_4px_0_0_var(--color-orange)] hover:text-ink'
const itemOff = 'font-normal text-ink-2 hover:bg-soft-hover hover:text-ink'

function Item({ to, icon, label, on, children }: { to: string; icon: IconName; label: string; on: boolean; children?: ReactNode }) {
  return (
    <li>
      <Link to={to} aria-current={on ? 'page' : undefined} className={cx(itemBase, on ? itemOn : itemOff)}>
        <Icon name={icon} size={20} />
        <span className="flex-1">{label}</span>
        {children}
      </Link>
    </li>
  )
}

/** Side menu of every screen: new request, the inbox and, for managers, the workflows */
export function Sidebar({ active, tasks, manager }: Props) {
  return (
    <nav aria-label="Menu principal" className="relative box-border flex h-full w-full flex-col gap-1 bg-bg px-4 py-6 text-ink">
      <a className="skip-link" href="#conteudo">
        Saltar para o conteúdo principal
      </a>
      <a className="skip-link" href="#botao-acessibilidade">
        Ir para o menu de acessibilidade
      </a>
      {manager ? (
        <>
          <Button to={paths.designer} size="l" icon="plus" iconSize={20} className="mb-2.5 w-full">
            Criar workflow
          </Button>
          <Button
            to={paths.newRequest}
            variant="secondary"
            size="l"
            icon="send"
            aria-current={active === 'novo' ? 'page' : undefined}
            className="mb-4.5 w-full"
          >
            Novo pedido
          </Button>
        </>
      ) : (
        <Button to={paths.newRequest} size="l" icon="plus" iconSize={20} aria-current={active === 'novo' ? 'page' : undefined} className="mb-4.5 w-full">
          Novo pedido
        </Button>
      )}
      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        <Item to={paths.inbox} icon="inbox" label="Caixa de tarefas" on={active === 'inbox'}>
          {tasks > 0 && (
            <>
              <span
                aria-hidden="true"
                className={cx(
                  'box-border inline-grid h-6.5 min-w-6.5 place-items-center rounded-pill px-2 text-[13px] font-semibold',
                  active === 'inbox' ? 'bg-ink text-bg' : 'edge bg-soft text-ink',
                )}
              >
                {tasks}
              </span>
              <span className="sr-only">, {tasks === 1 ? '1 tarefa à espera' : `${tasks} tarefas à espera`}</span>
            </>
          )}
        </Item>
      </ul>
      {manager && (
        <>
          <p id="menu-gestao" className="mx-3.5 mt-5 mb-1.5 text-label-sm leading-[18px] font-semibold text-ink-3">
            Gestão
          </p>
          <ul aria-labelledby="menu-gestao" className="m-0 flex list-none flex-col gap-1 p-0">
            <Item to={paths.workflows} icon="workflow" label="Workflows" on={active === 'workflows'} />
          </ul>
        </>
      )}
      <span className="min-h-8 flex-1" />
    </nav>
  )
}
