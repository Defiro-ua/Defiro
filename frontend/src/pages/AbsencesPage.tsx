import { useId, useState } from 'react'
import { Avatar } from '../components/Avatar'
import { Button } from '../components/Button'
import { ChoiceCard } from '../components/form/ChoiceCard'
import { Switch } from '../components/form/Switch'
import { Icon, type IconName } from '../components/Icon'
import { AppLayout } from '../components/layout/AppLayout'
import { PageTitle } from '../components/PageTitle'
import { Panel } from '../components/Panel'
import { SectionTitle } from '../components/SectionTitle'
import { StatusBanner } from '../components/StatusBanner'
import { absenceDefaults, substitutes } from '../data/absences'
import { cx } from '../lib/cx'
import { paths } from '../routes'

const weekdays = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']

/** "terça, 03/11/2026" when the date is valid (dd/mm/aaaa), otherwise the text as typed. */
function withWeekday(date: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(date.trim())
  if (!match) return date
  const day = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]))
  return Number.isNaN(day.getTime()) ? date : `${weekdays[day.getDay()]}, ${date}`
}

type IconInputProps = { label: string; ariaLabel: string; icon: IconName; value: string; onChange: (v: string) => void; className?: string }

/** Date or time field with a leading icon. */
function IconInput({ label, ariaLabel, icon, value, onChange, className }: IconInputProps) {
  const id = useId()
  return (
    <div className={cx('flex flex-col gap-2', className)}>
      <label htmlFor={id} className="text-body-sm font-semibold">
        {label}
      </label>
      <span className="flex h-13 items-center gap-2.5 rounded-md border border-field bg-panel px-4 focus-within:border-orange focus-within:shadow-focus-field">
        <Icon name={icon} size={18} className="text-accent-ink" />
        <input
          id={id}
          aria-label={ariaLabel}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-0 min-w-0 flex-1 bg-transparent text-body tabular-nums outline-none"
        />
      </span>
    </div>
  )
}

/** E21 · Ausências e delegação (UC02) */
export function AbsencesPage() {
  const [wholeDays, setWholeDays] = useState(false)
  const [substitute, setSubstitute] = useState(substitutes[0].name)
  const [scheduled, setScheduled] = useState(false)
  const [startDate, setStartDate] = useState(absenceDefaults.startDate)
  const [startTime, setStartTime] = useState(absenceDefaults.startTime)
  const [endDate, setEndDate] = useState(absenceDefaults.endDate)
  const [endTime, setEndTime] = useState(absenceDefaults.endTime)

  const pronoun = substitutes.find((s) => s.name === substitute)?.pronoun ?? 'ele'
  const period = wholeDays
    ? `De ${startDate} a ${endDate}, dias inteiros`
    : `Desde ${withWeekday(startDate)}, às ${startTime}, até ${withWeekday(endDate)}, às ${endTime}`
  const shortPeriod = wholeDays ? `${startDate} – ${endDate}` : `${startDate}, ${startTime} – ${endDate}, ${endTime}`

  return (
    <AppLayout user="rui" nav={{ inboxCount: 5 }} width="full">
      <div className="flex flex-wrap items-start gap-8">
      <div className="flex min-w-0 max-w-reading grow-999 basis-140 flex-col gap-6">
        <header className="flex flex-col gap-2">
          <PageTitle accent>Ausências e delegação</PageTitle>
          <p className="text-body text-ink-3">
            Indique quando vai estar ausente e quem recebe as suas tarefas. Não precisa de dizer o motivo.
          </p>
        </header>

        {scheduled ? (
          <StatusBanner tone="info" icon="clockSmall" size="lg" title={`Ausência agendada · a aguardar que ${substitute} aceite`}>
            {period}. Quando {substitute} aceitar, as tarefas que lhe chegarem nesse período passam para {pronoun}. Se recusar, é
            avisado para escolher outra pessoa.
          </StatusBanner>
        ) : (
          <Panel padding="xl" className="flex flex-col gap-7">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                <h2 className="grow basis-50 text-label-md font-semibold">Quando vai estar ausente</h2>
                <Switch checked={wholeDays} onChange={setWholeDays}>
                  Dias inteiros
                </Switch>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-4">
                <IconInput label="Início" ariaLabel="Data de início" icon="calendar" value={startDate} onChange={setStartDate} className="grow basis-60" />
                {!wholeDays && (
                  <IconInput label="Hora" ariaLabel="Hora de início" icon="clock" value={startTime} onChange={setStartTime} className="shrink basis-40" />
                )}
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-4">
                <IconInput label="Fim" ariaLabel="Data de fim" icon="calendar" value={endDate} onChange={setEndDate} className="grow basis-60" />
                {!wholeDays && (
                  <IconInput label="Hora" ariaLabel="Hora de fim" icon="clock" value={endTime} onChange={setEndTime} className="shrink basis-40" />
                )}
              </div>
              <p className="rounded-md bg-soft px-4 py-3 text-body-sm text-ink-2" aria-live="polite">
                {period}. As tarefas que lhe chegarem neste período vão para {substitute}, depois de {pronoun} aceitar.
              </p>
            </div>

            <fieldset className="flex flex-col gap-2.5">
              <legend className="mb-2.5 flex flex-col gap-1">
                <span className="text-body-sm font-semibold">Quem o substitui</span>
                <span className="text-label-sm leading-4.75 text-ink-3">
                  Só colegas do mesmo grupo. O substituto recebe um pedido e tem de aceitar.
                </span>
              </legend>
              {substitutes.map((person) => (
                <ChoiceCard
                  key={person.name}
                  name="substituto"
                  value={person.name}
                  checked={person.name === substitute}
                  onSelect={setSubstitute}
                  className="px-4 py-3"
                >
                  <Avatar initials={person.initials} size="lg" tone="soft" />
                  <span className="flex flex-1 flex-col gap-0.5">
                    <span className="text-label-md font-semibold">{person.name}</span>
                    <span className="text-label-sm text-ink-3">{person.description}</span>
                  </span>
                </ChoiceCard>
              ))}
            </fieldset>

            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line pt-2">
              <Button to={paths.inbox} variant="ghost">
                Cancelar
              </Button>
              <Button onClick={() => setScheduled(true)}>
                Agendar ausência
              </Button>
            </div>
          </Panel>
        )}
      </div>

      <aside aria-labelledby="agendadas" className="flex max-w-full grow basis-80 flex-col gap-4 rounded-md bg-soft p-6">
        <SectionTitle id="agendadas">Ausências agendadas</SectionTitle>
        {scheduled ? (
          <div className="flex flex-col gap-1 rounded-md bg-bg px-4 py-3.5">
            <span className="text-label-md font-semibold">Substituto: {substitute}</span>
            <span className="text-label-sm text-ink-2 tabular-nums">{shortPeriod}</span>
            <span className="text-label-sm font-semibold text-info">A aguardar aceitação</span>
          </div>
        ) : (
          <p className="text-body-sm text-ink-2">Não tem ausências agendadas.</p>
        )}
        <p className="text-label-sm text-ink-3">O que o substituto fizer fica no histórico de cada procedimento, em nome dele.</p>
        <p className="text-label-sm text-ink-3">
          Numa ausência imprevista, em que não consiga registar nada, a gestora de workflows pode passar as suas tarefas a um
          colega na Visão geral.
        </p>
      </aside>
      </div>
    </AppLayout>
  )
}
