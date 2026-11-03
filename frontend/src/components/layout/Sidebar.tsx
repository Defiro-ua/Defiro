import { Link } from 'react-router'
import { paths } from '../../routes'
import { cx } from '../../lib/cx'
import { Icon, type IconName } from '../Icon'
import { Logo } from '../Logo'

export type NavKey = 'inbox' | 'meus' | 'novo' | 'workflows' | 'regras' | 'visao' | 'alteracoes'

export type SidebarProps = {
  active?: NavKey
  /** Tasks waiting in the inbox */
  inboxCount?: number
  /** Where "Caixa de tarefas" leads (RH has its own inbox) */
  inboxTo?: string
  /** Shows the "Aprovações" group with this many pending changes */
  approvalsCount?: number
}

type Item = { key: NavKey; label: string; icon: IconName; to: string; count?: number; countLabel?: string }

function NavItem({ item, active }: { item: Item; active: boolean }) {
  return (
    <li>
      <Link
        to={item.to}
        aria-current={active ? 'page' : undefined}
        className={cx(
          'flex min-h-11 items-center gap-3 rounded-pill px-3.5 text-label-md transition',
          active ? 'bg-brand font-semibold text-on-brand hover:text-on-brand' : 'text-ink-2 hover:bg-soft hover:text-ink',
        )}
      >
        <Icon name={item.icon} size={20} />
        <span className="flex-1">{item.label}</span>
        {item.count !== undefined && (
          <>
            <span
              aria-hidden="true"
              className={cx(
                'grid h-6 min-w-6 place-items-center rounded-pill px-2 text-caption font-semibold text-ink',
                active ? 'bg-bg/60' : 'bg-soft',
              )}
            >
              {item.count}
            </span>
            <span className="sr-only">, {item.countLabel}</span>
          </>
        )}
      </Link>
    </li>
  )
}

function GroupLabel({ id, children }: { id: string; children: string }) {
  return (
    <p id={id} className="mx-3.5 mt-5 mb-1.5 text-label-sm font-semibold text-ink-3">
      {children}
    </p>
  )
}

/** Main navigation: personal items, "Gestão" and, for approvers, "Aprovações". */
export function Sidebar({ active, inboxCount = 0, inboxTo = paths.inbox, approvalsCount }: SidebarProps) {
  const personal: Item[] = [
    {
      key: 'inbox',
      label: 'Caixa de tarefas',
      icon: 'inbox',
      to: inboxTo,
      count: inboxCount,
      countLabel: inboxCount === 1 ? '1 tarefa à espera' : `${inboxCount} tarefas à espera`,
    },
    { key: 'meus', label: 'Os meus pedidos', icon: 'folder', to: paths.myRequests },
    { key: 'novo', label: 'Novo pedido', icon: 'plus', to: paths.newRequest },
  ]
  const management: Item[] = [
    { key: 'workflows', label: 'Workflows', icon: 'workflow', to: paths.workflows },
    { key: 'regras', label: 'Regras de negócio', icon: 'sliders', to: paths.rules },
    { key: 'visao', label: 'Visão geral', icon: 'chart', to: paths.overview },
  ]

  return (
    <nav aria-label="Principal" className="flex min-h-screen flex-col gap-1 bg-bg px-4 py-6">
      <Link to={inboxTo} className="block px-3 pb-7">
        <Logo alt="defiro · início" className="h-7.5" />
      </Link>
      <ul className="flex flex-col gap-1">
        {personal.map((item) => (
          <NavItem key={item.key} item={item} active={item.key === active} />
        ))}
      </ul>
      <GroupLabel id="nav-gestao">Gestão</GroupLabel>
      <ul aria-labelledby="nav-gestao" className="flex flex-col gap-1">
        {management.map((item) => (
          <NavItem key={item.key} item={item} active={item.key === active} />
        ))}
      </ul>
      {approvalsCount !== undefined && (
        <>
          <GroupLabel id="nav-aprovacoes">Aprovações</GroupLabel>
          <ul aria-labelledby="nav-aprovacoes" className="flex flex-col gap-1">
            <NavItem
              item={{
                key: 'alteracoes',
                label: 'Alterações por aprovar',
                icon: 'gitPullRequest',
                to: paths.approvals,
                count: approvalsCount,
                countLabel: `${approvalsCount} por aprovar`,
              }}
              active={active === 'alteracoes'}
            />
          </ul>
        </>
      )}
      <span className="min-h-8 flex-1" />
      <p className="mt-3 border-t border-line px-3.5 pt-3.5 text-label-sm text-ink-3">Câmara Municipal de Aveiro</p>
    </nav>
  )
}
