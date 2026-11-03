import { startDates } from '../../data/workflows'
import { ChoiceCard } from '../form/ChoiceCard'

type StartDateChoiceProps = {
  name: string
  legend: string
  value: string
  onChange: (date: string) => void
  /** Show the legend (otherwise it is for screen readers only) */
  showLegend?: boolean
}

/** Pick the date on which a new version comes into force. */
export function StartDateChoice({ name, legend, value, onChange, showLegend }: StartDateChoiceProps) {
  return (
    <fieldset className="flex flex-col gap-2.5">
      <legend className={showLegend ? 'mb-2.5 text-label-md font-semibold' : 'sr-only'}>{legend}</legend>
      <div className="flex flex-wrap gap-2.5">
        {startDates.map((option) => (
          <ChoiceCard
            key={option.date}
            name={name}
            value={option.date}
            checked={option.date === value}
            onSelect={onChange}
            indicator="none"
            layout="stack"
            gap="gap-0.5"
            className="min-w-42 px-4 py-2.5"
          >
            <span className="text-label-md font-semibold tabular-nums">{option.date}</span>
            <span className="text-caption text-ink-3">{option.note}</span>
          </ChoiceCard>
        ))}
      </div>
    </fieldset>
  )
}
