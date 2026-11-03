import { Button } from '../components/Button'
import { IconTile } from '../components/IconTile'
import { AppLayout } from '../components/layout/AppLayout'
import { Accent, PageTitle } from '../components/PageTitle'
import { SectionTitle } from '../components/SectionTitle'
import { procedures, savedDraft } from '../data/requests'
import { paths } from '../routes'

/** E03 · Novo pedido (UC13, UC14) */
export function NewRequestPage() {
  return (
    <AppLayout user="ana" nav={{ active: 'novo', inboxCount: 0 }} gap="gap-10">
      <header className="flex flex-col gap-3">
        <PageTitle>
          Novo <Accent>pedido</Accent>
        </PageTitle>
        <p className="max-w-prose-lg text-body-lg text-ink-2">
          Escolha o procedimento. Os dados do seu perfil municipal são preenchidos automaticamente.
        </p>
      </header>

      <section aria-labelledby="rascunhos" className="flex flex-col gap-4">
        <SectionTitle id="rascunhos">Rascunhos guardados</SectionTitle>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4 rounded-md bg-soft px-6 py-5">
          <IconTile icon="fileText" tone="bg" />
          <div className="flex grow basis-60 flex-col gap-0.5">
            <h3 className="text-title-md font-semibold">{savedDraft.title}</h3>
            <p className="text-body-sm text-ink-3">{savedDraft.meta}</p>
          </div>
          <Button to={paths.requestForm} size="sm">
            Continuar
          </Button>
        </div>
      </section>

      <section aria-labelledby="procedimentos" className="flex flex-col gap-5">
        <SectionTitle id="procedimentos">Procedimentos disponíveis</SectionTitle>
        <ul className="flex flex-wrap gap-6">
          {procedures.map((procedure) => (
            <li key={procedure.id} className="flex grow basis-75 flex-col gap-3.5 rounded-md border border-line bg-panel p-7">
              <IconTile icon={procedure.icon} />
              <h3 className="text-title-lg font-semibold">{procedure.title}</h3>
              <p className="text-body leading-6 text-ink-2">{procedure.description}</p>
              <p className="text-label-sm leading-5 text-ink-3">{procedure.needs}</p>
              <span className="flex-1" />
              {procedure.to ? (
                <Button to={procedure.to} glow className="self-start" aria-label={`Iniciar pedido de ${procedure.title}`}>
                  Iniciar pedido
                </Button>
              ) : (
                <Button variant="secondary" className="self-start" aria-label={`Iniciar pedido de ${procedure.title}`}>
                  Iniciar pedido
                </Button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <p className="text-body-sm text-ink-3">
        Não encontra o procedimento? Só aparecem os que a sua unidade pode iniciar. Fale com os Recursos Humanos.
      </p>
    </AppLayout>
  )
}
