import { useCallback, useState } from 'react'
import { Button } from '../components/Button'
import { IconTile } from '../components/IconTile'
import { AppLayout } from '../components/layout/AppLayout'
import { Modal } from '../components/Modal'
import { Accent, PageTitle } from '../components/PageTitle'
import { RequestRow } from '../components/request/RequestRow'
import { myRequests } from '../data/requests'
import { paths } from '../routes'

const WITHDRAWABLE_ID = 'HE-2026-0079'

/** E06 · Os meus pedidos (UC16, UC23, UC29) */
export function MyRequestsPage() {
  const [openMenu, setOpenMenu] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [withdrawn, setWithdrawn] = useState(false)
  const closeMenu = useCallback(() => setOpenMenu(''), [])

  const requests = myRequests.map((request) =>
    request.id === WITHDRAWABLE_ID && withdrawn ? { ...request, status: 'withdrawn' as const } : request,
  )

  return (
    <AppLayout user="ana" nav={{ active: 'meus', inboxCount: 0 }}>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-3">
          <PageTitle>
            Os meus <Accent>pedidos</Accent>
          </PageTitle>
          <p className="text-body-lg text-ink-2">Onde está cada pedido e quem o tem agora.</p>
        </div>
        <Button to={paths.newRequest} icon="plus" glow>
          Novo pedido
        </Button>
      </header>

      <ul className="flex flex-col gap-4">
        {requests.map((request) => (
          <RequestRow
            key={request.id}
            request={request}
            menuOpen={openMenu === request.id}
            onToggleMenu={() => setOpenMenu((current) => (current === request.id ? '' : request.id))}
            onCloseMenu={closeMenu}
            onWithdraw={() => {
              setOpenMenu('')
              setConfirming(true)
            }}
          />
        ))}
      </ul>

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        role="alertdialog"
        labelledBy="retirar-titulo"
        describedBy="retirar-texto"
        size="xs"
      >
        <div className="flex flex-col gap-4">
          <IconTile icon="trash" tone="error" round size="lg" />
          <h2 id="retirar-titulo" className="text-heading">
            Retirar este pedido?
          </h2>
          <p id="retirar-texto" className="text-body leading-6 text-ink-2">
            O pedido <strong className="font-semibold text-ink">HE-2026-0079 · Horas extraordinárias de setembro</strong> sai
            da Divisão Financeira e fica arquivado como retirado. Não é possível retomá-lo: terá de fazer um pedido novo.
          </p>
          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setConfirming(false)}>
              Manter pedido
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setConfirming(false)
                setWithdrawn(true)
              }}
            >
              Retirar pedido
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  )
}
