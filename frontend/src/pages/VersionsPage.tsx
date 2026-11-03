import { useState } from 'react'
import { Avatar } from '../components/Avatar'
import { Breadcrumb } from '../components/Breadcrumb'
import { Button } from '../components/Button'
import { Chip } from '../components/Chip'
import { TextField } from '../components/form/TextField'
import { AppLayout } from '../components/layout/AppLayout'
import { Accent, PageTitle } from '../components/PageTitle'
import { Panel } from '../components/Panel'
import { SectionTitle } from '../components/SectionTitle'
import { TextLink } from '../components/TextLink'
import { StartDateChoice } from '../components/workflow/StartDateChoice'
import { olderVersions, startDates, versionHistory, versionTone } from '../data/workflows'
import { cx } from '../lib/cx'
import { paths } from '../routes'

/** E18 · Versões e agendamento (UC07, UC11, UC12, UC26) */
export function VersionsPage() {
  const [scheduled, setScheduled] = useState(false)
  const [date, setDate] = useState(startDates[0].date)

  const versions = [
    {
      v: '5',
      state: scheduled ? ('scheduled' as const) : ('toSchedule' as const),
      label: scheduled ? `Agendada · ${date}` : 'Aprovada · por agendar',
      period: 'Criada por Sofia Almeida a 08/10/2026',
      summary: 'Parecer jurídico para o estrangeiro, chefia em 3 dias, campo País de destino.',
      current: true,
    },
    ...olderVersions,
  ]
  const history = scheduled
    ? [{ who: 'Sofia Almeida', initials: 'SA', action: `agendou a v5 para ${date}`, note: '', when: 'Agora' }, ...versionHistory]
    : versionHistory

  return (
    <AppLayout user="sofia" nav={{ active: 'workflows', inboxCount: 0 }} width="detail" compactTop gap="gap-8">
      <header className="flex flex-col gap-3.5">
        <Breadcrumb trail={[{ label: 'Workflows', to: paths.workflows }]} current="Ajudas de custo" />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <PageTitle className="grow basis-80">
            Ajudas de custo · <Accent>versões</Accent>
          </PageTitle>
          <Button to={paths.designer} variant="secondary" size="sm">
            Abrir no designer
          </Button>
        </div>
      </header>

      <Panel padding="lg" elevated aria-labelledby="v5" className="flex flex-col gap-5.5">
        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2.5">
          <h2 id="v5" className="text-heading">
            v5
          </h2>
          <Chip tone={scheduled ? 'info' : 'success'} dot>
            {scheduled ? 'Agendada' : 'Aprovada · por agendar'}
          </Chip>
          <span className="hidden flex-1 sm:block" />
          <span className="text-body-sm text-ink-2">
            Aprovada por <strong className="font-semibold text-ink">Helena Costa</strong> a 10/10/2026, 11:05
          </span>
        </div>

        {scheduled ? (
          <div role="status" className="flex flex-col gap-0.5 rounded-md bg-info-soft px-5 py-4.5">
            <span className="text-title-md font-semibold text-info">Entra em vigor a {date}, às 00:00</span>
            <span className="text-body-sm text-ink-2">Os pedidos começados a partir desta data usam a v5.</span>
          </div>
        ) : (
          <div className="flex flex-wrap items-end gap-5">
            <div className="flex grow-999 basis-105 flex-col gap-2.5">
              <StartDateChoice name="data-v5" legend="Quando entra em vigor" showLegend value={date} onChange={setDate} />
              <p className="text-label-sm leading-4.75 text-ink-3">
                Às 00:00. Os pedidos começados a partir dessa hora usam a v5. Os 12 em curso terminam na v4.
              </p>
              <TextField
                label="Data de fim"
                optional
                placeholder="Sem data de fim"
                hint="A partir desta data deixa de ser usada em pedidos novos."
                labelClassName="text-label-md font-semibold"
                fieldClassName="max-w-90 pt-1.5"
              />
            </div>
            <Button size="lg" glow className="grow basis-50" onClick={() => setScheduled(true)}>
              Agendar para {date}
            </Button>
          </div>
        )}

        <div className="flex flex-col gap-2.5 rounded-md bg-soft px-5 py-4.5">
          <h3 className="text-label-md font-semibold">Regras de negócio que a v5 usa</h3>
          <p className="text-body-sm text-ink-2">
            A {date} aplicam-se estas versões. Cada pedido fica com as versões em vigor no dia em que começa.
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md bg-bg px-3.5 py-2.5">
            <TextLink to={paths.rules} size="md">
              Valor diário das ajudas de custo
            </TextLink>
            <span className="text-body-sm text-ink-2">v3, em vigor desde 01/03/2026 · passo Verificação financeira</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md bg-bg px-3.5 py-2.5">
            <TextLink to={paths.rules} size="md">
              Valor por quilómetro
            </TextLink>
            <span className="text-body-sm text-ink-2">v1, em vigor desde 02/09/2024 · passo Pedido</span>
            <Chip tone="success" size="xs">
              v2 aprovada · ainda sem data
            </Chip>
          </div>
          <p className="text-label-sm leading-4.75 text-ink-3">
            Quando a v2 do valor por quilómetro for agendada, aplica-se aos pedidos que começarem a partir dessa data, sem mudar
            esta versão do workflow.
          </p>
        </div>
      </Panel>

      <div className="flex flex-wrap items-start gap-8">
        <section aria-labelledby="todas" className="flex min-w-0 grow basis-105 flex-col gap-4">
          <SectionTitle id="todas">Todas as versões</SectionTitle>
          <ol className="flex flex-col">
            {versions.map((version, i) => (
              <li key={version.v} className="flex gap-4">
                <span className="flex w-9 shrink-0 flex-col items-center">
                  <span
                    aria-hidden="true"
                    className={cx(
                      'grid size-9 shrink-0 place-items-center rounded-full text-body-sm font-extrabold',
                      'current' in version
                        ? 'bg-brand text-on-brand'
                        : version.state === 'live'
                          ? 'bg-warning-soft text-warning'
                          : 'bg-line text-ink-2',
                    )}
                  >
                    {version.v}
                  </span>
                  {i < versions.length - 1 && <span aria-hidden="true" className="min-h-4 w-0.5 flex-1 bg-line-strong" />}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5 pb-6">
                  <span className="flex flex-wrap items-center gap-2">
                    <h3 className="text-title-md font-semibold">v{version.v}</h3>
                    <Chip tone={versionTone[version.state]} size="sm">
                      {version.label}
                    </Chip>
                  </span>
                  <p className="text-body-sm text-ink-2">{version.period}</p>
                  <p className="text-label-sm leading-4.75 text-ink-3">{version.summary}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="historico" className="flex min-w-0 grow basis-105 flex-col gap-4">
          <SectionTitle id="historico">Histórico de alterações</SectionTitle>
          <ul className="divide-y divide-line overflow-hidden rounded-md border border-line bg-panel">
            {history.map((entry) => (
              <li
                key={`${entry.when}-${entry.action}`}
                className={cx('flex items-start gap-3 px-4.5 py-4', entry.when === 'Agora' && 'bg-soft-hover')}
              >
                <Avatar initials={entry.initials} size="sm" tone={entry.who === 'Sistema' ? 'neutral' : 'brand'} />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="text-body-sm">
                    <strong className="font-semibold">{entry.who}</strong> {entry.action}
                  </p>
                  {entry.note && <p className="text-label-sm leading-4.75 text-ink-3">{entry.note}</p>}
                </div>
                <span className="shrink-0 text-label-sm whitespace-nowrap text-ink-3 tabular-nums">{entry.when}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppLayout>
  )
}
