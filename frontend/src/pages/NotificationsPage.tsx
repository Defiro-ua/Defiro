import { Link } from 'react-router'
import { AppLayout } from '../components/layout/AppLayout'
import { NotificationMark } from '../components/layout/NotificationMark'
import { PageTitle } from '../components/PageTitle'
import { notificationGroups } from '../data/notifications'
import { cx } from '../lib/cx'

/** E19 · Notificações (UC30, UC31) */
export function NotificationsPage() {
  return (
    <AppLayout user="rui" nav={{ inboxCount: 5 }} width="narrow">
      <header className="flex flex-col gap-2">
        <PageTitle accent>Notificações</PageTitle>
        <p className="text-body text-ink-3">
          Avisos de tarefas novas, de mudanças de estado e de prazos a terminar. Também chegam por e-mail.
        </p>
      </header>

      {notificationGroups.map((group) => (
        <section key={group.name} aria-labelledby={`grupo-${group.name}`} className="flex flex-col gap-2.5">
          <h2 id={`grupo-${group.name}`} className="text-label-sm font-semibold text-ink-3">
            {group.name}
          </h2>
          <ul className="divide-y divide-line overflow-hidden rounded-md border border-line bg-panel">
            {group.items.map((n) => (
              <li
                key={n.title}
                className={cx('flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4.5', n.unread && 'bg-soft-hover')}
              >
                <NotificationMark kind={n.kind} shape="tile" />
                <div className="flex min-w-0 grow basis-70 flex-col gap-1">
                  <h3 className={cx('text-label-md leading-5.5', n.unread ? 'font-semibold' : 'font-normal')}>
                    {n.unread && <span className="sr-only">Por ler: </span>}
                    {n.title}
                  </h3>
                  <p className="text-body-sm text-ink-2">{n.detail}</p>
                  <p className="text-label-sm text-ink-3 tabular-nums">{n.when}</p>
                </div>
                <Link
                  to={n.to}
                  aria-label={`${n.action}: ${n.title}`}
                  className="inline-flex min-h-10 items-center rounded-pill px-3.5 text-body-sm font-semibold hover:bg-soft"
                >
                  {n.action}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </AppLayout>
  )
}
