import { useId, useState, type ReactNode } from 'react'
import { cx } from '../lib/cx'
import { inputClass } from '../lib/formStyles'
import { Icon } from './Icon'

/** The asterisk of a required field (the label says «obrigatório» to screen readers where needed) */
export const Req = () => (
  <span aria-hidden="true" className="text-accent-ink">
    *
  </span>
)

export const Optional = () => <span className="font-normal text-ink-3">(opcional)</span>

export function FieldError({ id, children, className }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <span id={id} className={cx('error-line flex items-center gap-1.5 text-[14px] leading-5 font-semibold text-error', className)}>
      <Icon name="alertCircle" size={16} />
      {children}
    </span>
  )
}

/** A reviewer's note shown next to the field it is about */
export function NoteFrom({ quem, texto, as = 'span' }: { quem: string; texto: string; as?: 'span' | 'p' }) {
  const Tag = as
  return (
    <Tag className="edge m-0 flex items-start gap-2 rounded-md bg-warning-soft px-3 py-2.5 text-[14px] leading-[21px] text-ink">
      <Icon name="message" size={16} className="mt-0.5" />
      <span>
        <strong className="font-semibold">Nota de {quem}:</strong> {texto}
      </span>
    </Tag>
  )
}

/** Kicker, question and help of a form step; the question gets the focus on each step */
export function StepHeading({ kicker, name, optional, question, help }: { kicker: string; name: string; optional?: boolean; question: string; help: string }) {
  return (
    <div className="flex max-w-reading flex-col gap-3">
      <p aria-hidden="true" className="m-0 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[14px] leading-5 font-semibold text-accent-ink">
        <span>{kicker}</span>
        <span>·</span>
        <span>{name}</span>
        {optional && <span className="font-normal text-ink-3">(opcional)</span>}
      </p>
      <h2 id="passo-titulo" tabIndex={-1} className="m-0 text-[32px] leading-10 font-extrabold tracking-question outline-none">
        <span className="sr-only">{kicker}: </span>
        {question}
      </h2>
      <p className="m-0 text-[17px] leading-[27px] text-ink-2">{help}</p>
    </div>
  )
}

/** What stops the person from moving on, at the top of the step */
export function StepError({ children, extra }: { children: ReactNode; extra?: ReactNode }) {
  return (
    <div id="passo-erro" tabIndex={-1} role="alert" className="flex flex-col gap-2.5 rounded-md border-2 border-error bg-error-soft px-4 py-3.5 text-error outline-none">
      <p className="error-line m-0 flex gap-2.5 text-[15px] leading-[22px] font-semibold">
        <Icon name="alertCircle" size={20} />
        <span>{children}</span>
      </p>
      {extra}
    </div>
  )
}

/** Shown while a radio button has the keyboard focus */
export const ArrowHint = () => (
  <p className="arrow-hint m-0 items-center gap-1.5 text-label-sm leading-[18px] font-semibold text-accent-ink" aria-hidden="true">
    Use as setas ↑ ↓ para escolher outra opção
  </p>
)

type DateInputProps = {
  id: string
  /** What the calendar button says: «Escolher a data de partida no calendário» */
  calendarLabel: string
  text: string
  iso: string
  min?: string
  max?: string
  wrong?: boolean
  describedBy?: string
  onText: (text: string) => void
  onPick: (iso: string) => void
}

/** A date typed as dd/mm/aaaa, with a calendar button next to it */
export function DateInput({ id, calendarLabel, text, iso, min, max, wrong, describedBy: desc, onText, onPick }: DateInputProps) {
  return (
    <span className="flex gap-2">
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="dd/mm/aaaa"
        maxLength={10}
        value={text}
        onChange={(e) => onText(e.target.value)}
        aria-invalid={wrong || undefined}
        aria-describedby={desc}
        className={inputClass(wrong)}
      />
      <span
        className="calendar relative box-border grid size-12 shrink-0 place-items-center rounded-md border border-field bg-panel text-accent-ink"
        title={calendarLabel}
      >
        <Icon name="calendar" size={20} />
        <button
          type="button"
          aria-label={calendarLabel}
          onClick={(e) => {
            const picker = e.currentTarget.parentElement?.querySelector<HTMLInputElement>('input[type=date]')
            try {
              picker?.showPicker()
            } catch {
              document.getElementById(id)?.focus()
            }
          }}
        />
        <input type="date" tabIndex={-1} aria-hidden="true" min={min} max={max} value={iso} onChange={(e) => e.target.value && onPick(e.target.value)} />
      </span>
    </span>
  )
}

type FileDropProps = {
  inputId?: string
  label?: string
  labelledBy?: string
  describedBy?: string
  required?: boolean
  wrong?: boolean
  multiple?: boolean
  onFiles: (files: File[]) => void
  className?: string
  children: ReactNode
}

const MAX_FILE_BYTES = 10 * 1024 * 1024
const ACCEPTED = /\.(pdf|jpe?g|png)$/i

/** Keeps only PDF, JPG and PNG files up to 10 MB; says which ones were left out and why */
function checkFiles(files: File[]) {
  const ok: File[] = []
  const problems: string[] = []
  for (const f of files) {
    if (!ACCEPTED.test(f.name)) problems.push(`«${f.name}» não é PDF, JPG nem PNG`)
    else if (f.size > MAX_FILE_BYTES) problems.push(`«${f.name}» tem mais de 10 MB`)
    else ok.push(f)
  }
  return { ok, message: problems.length ? `Não foi possível juntar: ${problems.join('; ')}.` : '' }
}

/** Drop files here or choose them from the computer; only PDF, JPG or PNG up to 10 MB */
export function FileDrop({ inputId, label, labelledBy, describedBy: desc, required, wrong, multiple, onFiles, className, children }: FileDropProps) {
  const [rejected, setRejected] = useState('')
  const errorId = useId()
  const take = (list: File[]) => {
    const { ok, message } = checkFiles(multiple ? list : list.slice(0, 1))
    setRejected(message)
    if (ok.length) onFiles(ok)
  }
  return (
    <>
      <label
        className={cx('dropzone relative box-border cursor-pointer rounded-md border-2 border-dashed', wrong || rejected ? 'border-error' : 'border-line-strong', className)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          const files = Array.from(e.dataTransfer?.files || [])
          if (files.length) take(files)
        }}
      >
        {children}
        <input
          id={inputId}
          className="sr-only"
          type="file"
          multiple={multiple}
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          aria-label={label}
          aria-labelledby={labelledBy}
          aria-describedby={[desc, rejected && errorId].filter(Boolean).join(' ') || undefined}
          aria-required={required || undefined}
          aria-invalid={wrong || !!rejected || undefined}
          onChange={(e) => {
            const files = Array.from(e.target.files || [])
            if (files.length) take(files)
            e.target.value = ''
          }}
        />
      </label>
      {rejected && (
        <span role="alert">
          <FieldError id={errorId}>{rejected}</FieldError>
        </span>
      )}
    </>
  )
}

/** «Anterior», the Enter hint and «Continuar» at the bottom of a form step */
export function WizardFooter({
  previous,
  previousText = 'Anterior',
  next,
  nextText,
  last,
  lastIcon = 'send',
  enterHint = true,
}: {
  previous?: () => void
  previousText?: string
  next: () => void
  nextText: string
  last?: boolean
  lastIcon?: 'send' | 'check'
  enterHint?: boolean
}) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-line pt-6">
      {previous && (
        <button
          type="button"
          id="btn-anterior"
          onClick={previous}
          className="box-border inline-flex min-h-13 items-center justify-center gap-2 rounded-pill border-emph border-field bg-bg px-6.5 text-[16px] font-semibold text-ink hover:bg-soft"
        >
          <Icon name="arrowLeft" size={18} />
          {previousText}
        </button>
      )}
      <span className="flex-1" />
      {enterHint && (
        <span aria-hidden="true" className="text-[14px] text-ink-3">
          ou carregue em{' '}
          <kbd className="rounded-doc border border-line-strong bg-panel px-2 py-0.5 font-sans text-label-sm font-semibold">Enter ↵</kbd>
        </span>
      )}
      <button
        type="button"
        id="btn-continuar"
        onClick={next}
        className="box-border inline-flex min-h-13 items-center justify-center gap-2 rounded-pill border-0 bg-brand px-6.5 text-[16px] font-semibold text-on-brand hover:brightness-107"
      >
        {nextText}
        <Icon name={last ? lastIcon : 'arrowRight'} size={18} />
      </button>
    </div>
  )
}
