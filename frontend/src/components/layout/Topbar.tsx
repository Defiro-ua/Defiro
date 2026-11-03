import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router'
import { canDelegate, notificationsByPersona, personaOrder, personas } from '../../data/people'
import type { PersonaId } from '../../data/types'
import { cx } from '../../lib/cx'
import { useDismiss } from '../../lib/useDismiss'
import { paths } from '../../routes'
import { Avatar } from '../Avatar'
import { Icon } from '../Icon'
import { NotificationMark } from './NotificationMark'

type TopbarProps = {
  user: PersonaId
  /** Text already typed in the search (results page) */
  searchValue?: string
  onOpenMenu: () => void
}

type Menu = '' | 'notifications' | 'account'

const popover =
  'absolute top-full right-0 z-40 mt-3.5 max-w-screen-gutter rounded-menu border border-line-strong bg-bg shadow-menu sm:-right-2'

/** The floating "island" bar: search, notifications and the account menu. */
export function Topbar({ user, searchValue, onOpenMenu }: TopbarProps) {
  const [menu, setMenu] = useState<Menu>('')
  const close = useCallback(() => setMenu(''), [])
  const notificationsRef = useRef<HTMLDivElement>(null)
  const accountRef = useRef<HTMLDivElement>(null)
  useDismiss(notificationsRef, menu === 'notifications', close)
  useDismiss(accountRef, menu === 'account', close)

  const person = personas[user]
  const notifications = notificationsByPersona[user]
  const unread = notifications.filter((n) => n.unread).length
  const toggle = (next: Menu) => setMenu((current) => (current === next ? '' : next))

  return (
    <div className="relative z-30 bg-bg px-4 py-2.5 md:px-10">
      <header className="flex min-h-14 items-center gap-2 rounded-pill border-brand py-1.5 pr-2 pl-1.5 shadow-island sm:gap-3 sm:pl-2.5">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Abrir o menu"
          className="grid size-11 shrink-0 place-items-center rounded-full text-ink hover:bg-soft lg:hidden"
        >
          <Icon name="menu" size={20} />
        </button>

        <Link
          to={paths.search}
          aria-label="Pesquisar pedidos e documentos"
          className="flex h-10 min-w-0 max-w-115 grow basis-0 items-center gap-2.5 rounded-pill bg-soft px-4 text-body-sm text-ink-3 hover:text-ink sm:basis-65"
        >
          <Icon name="search" size={18} />
          <span className={cx('truncate', searchValue && 'text-ink')}>{searchValue || 'Pesquisar pedidos e documentos…'}</span>
        </Link>
        <span className="hidden flex-1 sm:block" />

        <div ref={notificationsRef} className="relative">
          <button
            type="button"
            onClick={() => toggle('notifications')}
            aria-expanded={menu === 'notifications'}
            aria-controls="topbar-notifications"
            aria-label={`Notificações, ${unread} por ler`}
            className={cx(
              'relative grid size-11 place-items-center rounded-full text-ink hover:bg-soft',
              menu === 'notifications' && 'bg-soft',
            )}
          >
            <Icon name="bell" size={20} />
            {unread > 0 && (
              <span
                aria-hidden="true"
                className="absolute top-1.25 right-0.75 h-4.5 min-w-4.5 rounded-pill bg-brand px-1.25 text-center text-micro leading-4.5 font-semibold text-on-brand"
              >
                {unread}
              </span>
            )}
          </button>
          {menu === 'notifications' && (
            <div
              id="topbar-notifications"
              role="region"
              aria-label="Notificações"
              className={cx(popover, 'flex w-100 flex-col gap-1.5 px-3 pt-4 pb-3')}
            >
              <h2 className="px-2 pb-1.5 text-title-md font-semibold">Notificações</h2>
              {notifications.length === 0 && <p className="px-2 py-3 text-body-sm text-ink-3">Não tem notificações.</p>}
              <ul className="flex flex-col gap-1.5">
                {notifications.map((n) => (
                  <li key={n.title}>
                    <Link
                      to={n.to}
                      onClick={close}
                      className={cx(
                        'flex items-start gap-3 rounded-item p-3 text-ink hover:bg-soft hover:text-ink',
                        n.unread && 'bg-soft-hover',
                      )}
                    >
                      <NotificationMark kind={n.kind} />
                      <span className="flex flex-1 flex-col gap-0.5 text-body-sm leading-5">
                        <span>{n.title}</span>
                        <span className="text-caption text-ink-3">{n.when}</span>
                      </span>
                      {n.unread && (
                        <>
                          <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-full bg-orange" />
                          <span className="sr-only">Por ler</span>
                        </>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                to={paths.notifications}
                onClick={close}
                className="mt-1 flex min-h-11 items-center justify-center border-t border-line text-body-sm font-semibold text-accent-ink"
              >
                Ver todas as notificações
              </Link>
            </div>
          )}
        </div>

        <span aria-hidden="true" className="mx-1 hidden h-7 w-px bg-line sm:block" />

        <div ref={accountRef} className="relative">
          <button
            type="button"
            onClick={() => toggle('account')}
            aria-expanded={menu === 'account'}
            aria-controls="topbar-account"
            aria-label={`Menu da conta de ${person.name}`}
            className={cx(
              'flex min-h-11 items-center gap-2.5 rounded-pill pr-2 pl-1 text-left text-ink hover:bg-soft sm:pr-3.5',
              menu === 'account' && 'bg-soft',
            )}
          >
            <Avatar initials={person.initials} size="md" />
            <span className="hidden flex-col leading-tight sm:flex">
              <span className="text-body-sm font-semibold">{person.name}</span>
              <span className="text-caption text-ink-3">{person.jobTitle}</span>
            </span>
            <Icon name="chevronDown" size={16} />
          </button>
          {menu === 'account' && (
            <div id="topbar-account" className={cx(popover, 'flex w-85 flex-col gap-0.5 p-2.5')}>
              <div className="flex items-center justify-between px-3 py-2">
                <h2 id="account-view-as" className="text-label-sm font-semibold text-ink-3">
                  Ver como
                </h2>
                <span className="rounded-sm border border-dashed border-ph-line bg-ph-bg px-2 py-px text-caption font-semibold text-ph-ink">
                  Demonstração
                </span>
              </div>
              <ul aria-labelledby="account-view-as" className="flex flex-col gap-0.5">
                {personaOrder.map((id) => {
                  const p = personas[id]
                  const current = id === user
                  return (
                    <li key={id}>
                      <Link
                        to={p.home}
                        onClick={close}
                        aria-current={current ? 'true' : undefined}
                        className={cx(
                          'flex min-h-12 items-center gap-3 rounded-item px-3 py-1.5 hover:bg-soft',
                          current && 'bg-soft',
                        )}
                      >
                        <span className="flex flex-1 flex-col leading-snug">
                          <span className="text-label-md font-semibold text-ink">{p.role}</span>
                          <span className="text-label-sm text-ink-3">{p.roleDescription}</span>
                        </span>
                        {current && <Icon name="check" size={18} strokeWidth={2.2} className="text-accent-ink" />}
                      </Link>
                    </li>
                  )
                })}
              </ul>
              <span aria-hidden="true" className="mx-3 my-1.5 h-px bg-line" />
              {canDelegate.includes(user) && (
                <Link
                  to={paths.absences}
                  onClick={close}
                  className="flex min-h-11 items-center gap-2.5 rounded-item px-3 text-label-md text-ink hover:bg-soft hover:text-ink"
                >
                  <Icon name="calendar" size={18} />
                  Ausências e delegação
                </Link>
              )}
              <Link
                to={paths.login}
                className="flex min-h-11 items-center gap-2.5 rounded-item px-3 text-label-md text-ink-2 hover:bg-soft hover:text-ink"
              >
                <Icon name="logOut" size={18} />
                Terminar sessão
              </Link>
            </div>
          )}
        </div>
      </header>
    </div>
  )
}
