import { useRef } from 'react'
import type { MyRequest } from '../../data/requests'
import { statusChip } from '../../data/types'
import { cx } from '../../lib/cx'
import { useDismiss } from '../../lib/useDismiss'
import { Button } from '../Button'
import { Chip } from '../Chip'
import { Icon } from '../Icon'
import { MiniProgress } from '../MiniProgress'

type RequestRowProps = {
  request: MyRequest
  menuOpen: boolean
  onToggleMenu: () => void
  onCloseMenu: () => void
  onWithdraw: () => void
}

const menuItem = 'flex min-h-11 w-full items-center gap-2.5 rounded-item px-3.5 text-left text-label-md hover:bg-soft'

/** One of the person's requests: status, where it is, progress and actions. */
export function RequestRow({ request, menuOpen, onToggleMenu, onCloseMenu, onWithdraw }: RequestRowProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  useDismiss(menuRef, menuOpen, onCloseMenu)
  const chip = statusChip[request.status]
  const { detail, action } = request
  // Only the request under review has actions defined behind "Mais ações" in the mockup
  const hasMenu = request.withdrawable !== undefined

  return (
    <li
      className={cx(
        'relative flex flex-wrap items-center gap-x-7 gap-y-4 rounded-md px-5 py-6 sm:px-7',
        request.draft ? 'bg-soft' : 'border border-line bg-panel',
      )}
    >
      <div className="flex min-w-0 grow basis-85 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h2 className="text-title-md font-semibold">{request.title}</h2>
          <Chip tone={chip.tone} dot>
            {chip.label}
          </Chip>
        </div>
        <p className="text-body-sm text-ink-3 tabular-nums">{request.meta}</p>
        {detail &&
          (typeof detail === 'string' ? (
            <p className="text-body-sm text-ink-2">{detail}</p>
          ) : request.status === 'withdrawn' ? (
            <p className="text-body-sm text-ink-2">
              Retirou o pedido hoje. A {detail.holder} foi avisada e o procedimento foi arquivado.
            </p>
          ) : (
            <p className="text-body-sm text-ink-2">
              Com: <strong className="font-semibold">{detail.holder}</strong> desde {detail.since} · prazo {detail.deadline}
            </p>
          ))}
      </div>

      {request.progress && <MiniProgress steps={request.progress.steps} label={request.progress.label} />}

      <div className="flex items-center gap-2">
        {request.deadline && request.status !== 'withdrawn' && (
          <Chip icon="clock">{request.deadline}</Chip>
        )}
        {action?.kind === 'link' && (
          <Button variant="ghost" size="sm" pad="tight" className="underline underline-offset-4">
            {action.label}
          </Button>
        )}
        {action && action.kind !== 'link' && (
          <Button
            to={action.to}
            variant={action.kind}
            size="sm"
            icon={action.icon}
            aria-label={`${action.label}: ${request.title}`}
          >
            {action.label}
          </Button>
        )}
        {request.moreActions && (
          <div ref={menuRef}>
            <button
              type="button"
              aria-label={`Mais ações: ${request.title}`}
              aria-expanded={hasMenu ? menuOpen : undefined}
              onClick={hasMenu ? onToggleMenu : undefined}
              className={cx('grid size-11 place-items-center rounded-full text-ink hover:bg-soft', menuOpen && 'bg-soft')}
            >
              <Icon name="more" size={20} />
            </button>
            {menuOpen && (
              <div className="absolute top-21 right-5 z-10 flex min-w-58 flex-col rounded-menu border border-line-strong bg-bg p-2 shadow-menu sm:right-7">
                <button type="button" className={menuItem}>
                  Ver pedido
                </button>
                <button type="button" className={menuItem}>
                  Transferir PDF
                </button>
                {request.status !== 'withdrawn' && (
                  <button type="button" onClick={onWithdraw} className={cx(menuItem, 'font-semibold text-error')}>
                    Retirar pedido
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </li>
  )
}
