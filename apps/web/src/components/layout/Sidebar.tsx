import { Link } from 'react-router'
import type { MenuItem } from '../../api/session'
import { cx } from '../../lib/cx'
import { paths } from '../../routes'
import { Button } from '../Button'
import { Icon, type IconName } from '../Icon'

type Props = {
  /** The items the server allows this person to see (GET /api/me) */
  menu: readonly MenuItem[]
  /** The screen that is open */
  active?: MenuItem
}

const itemBase = 'flex min-h-12 items-center gap-3 rounded-md px-3.5 text-[15px] leading-5 no-underline'
const itemOn = 'bg-accent-soft font-semibold text-ink shadow-[inset_4px_0_0_var(--color-orange)] hover:text-ink'
const itemOff = 'font-normal text-ink-2 hover:bg-soft-hover hover:text-ink'

function Item({ to, icon, label, on }: { to: string; icon: IconName; label: string; on: boolean }) {
  return (
    <li>
      <Link to={to} aria-current={on ? 'page' : undefined} className={cx(itemBase, on ? itemOn : itemOff)}>
        <Icon name={icon} size={20} />
        <span className="flex-1">{label}</span>
      </Link>
    </li>
  )
}

/** Side menu of every screen, with only the items the person's role allows */
export function Sidebar({ menu, active }: Props) {
  const has = (item: MenuItem) => menu.includes(item)
  const current = (item: MenuItem) => (active === item ? 'page' : undefined)
  // the first button is the main action of the person: «Criar workflow» when they may create workflows
  const createsWorkflows = has('create-workflow')

  return (
    <nav aria-label="Menu principal" className="relative box-border flex h-full w-full flex-col gap-1 bg-bg px-4 py-6 text-ink">
      <a className="skip-link" href="#conteudo">
        Saltar para o conteúdo principal
      </a>
      {createsWorkflows && (
        <Button to={paths.designer} size="l" icon="plus" iconSize={20} aria-current={current('create-workflow')} className="mb-2.5 w-full">
          Criar workflow
        </Button>
      )}
      {has('new-request') && (
        <Button
          to={paths.newRequest}
          variant={createsWorkflows ? 'secondary' : 'primary'}
          size="l"
          icon={createsWorkflows ? 'send' : 'plus'}
          iconSize={20}
          aria-current={current('new-request')}
          className="mb-4.5 w-full"
        >
          Novo pedido
        </Button>
      )}
      {has('inbox') && (
        <ul className="m-0 flex list-none flex-col gap-1 p-0">
          <Item to={paths.inbox} icon="inbox" label="Caixa de tarefas" on={active === 'inbox'} />
        </ul>
      )}
      {has('workflows') && (
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
