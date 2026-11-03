import type { DesignerStep } from '../../data/workflows'
import { cx } from '../../lib/cx'
import { Icon } from '../Icon'

type FlowCanvasProps = {
  steps: DesignerStep[]
  selected: string
  onSelect: (id: string) => void
}

/* Transition labels on the 800×640 canvas */
const transitionLabels = [
  { text: 'Submetido', x: 412, y: 143 },
  { text: 'Aprovado', x: 412, y: 271 },
  { text: 'Aprovado', x: 412, y: 399 },
  { text: 'Validado', x: 412, y: 527 },
]

function Arrowhead({ id, className }: { id: string; className: string }) {
  return (
    <marker id={id} orient="auto" markerWidth="5" markerHeight="5" refX="2" refY="2" overflow="visible">
      <path d="M0 0 L4 2 L0 4 Z" className={cx('stroke-none', className)} />
    </marker>
  )
}

/** The workflow drawn as steps and transitions. Steps are buttons that open their detail. */
export function FlowCanvas({ steps, selected, onSelect }: FlowCanvasProps) {
  return (
    <div className="relative mx-auto h-160 w-200">
      <svg
        aria-hidden="true"
        viewBox="0 0 800 640"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute inset-0 size-full overflow-visible fill-none stroke-2"
      >
        <defs>
          <Arrowhead id="arrow-ok" className="fill-orange" />
          <Arrowhead id="arrow-back" className="fill-changed" />
          <Arrowhead id="arrow-end" className="fill-error" />
        </defs>
        {/* Main path: each step to the next */}
        <g className="stroke-orange">
          {[112, 240, 368, 496].map((y) => (
            <path key={y} d={`M 400 ${y} L 400 ${y + 51}`} markerEnd="url(#arrow-ok)" />
          ))}
        </g>
        {/* Returned for correction: back to the request */}
        <g strokeDasharray="6 6" className="stroke-changed">
          <path d="M 200 204 L 280 204" />
          <path d="M 200 332 L 280 332" />
          <path d="M 200 76 L 200 332" />
          <path d="M 200 76 L 275 76" markerEnd="url(#arrow-back)" />
        </g>
        {/* Rejected: ends the procedure */}
        <g className="stroke-error">
          <path d="M 520 204 L 660 204" />
          <path d="M 520 332 L 660 332" />
          <path d="M 660 204 L 660 547" markerEnd="url(#arrow-end)" />
        </g>
        <g className="stroke-none font-sans text-label-sm">
          {transitionLabels.map((label) => (
            <text key={label.y} x={label.x} y={label.y} className="fill-ink-3">
              {label.text}
            </text>
          ))}
          <text x="188" y="208" textAnchor="end" className="fill-warning font-semibold">
            Devolvido · corrigível
          </text>
          <text x="672" y="381" className="fill-error font-semibold">
            Rejeitado · final
          </text>
        </g>
      </svg>

      {steps.map((step) => {
        const on = step.id === selected
        return (
          <button
            key={step.id}
            type="button"
            onClick={() => onSelect(step.id)}
            aria-pressed={on}
            // Position on the canvas comes from the workflow data
            style={{ left: step.x, top: step.y, width: step.width }}
            className={cx(
              'absolute flex h-18 items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-left text-label-sm',
              on
                ? 'border-2 border-orange bg-selected text-ink-2 shadow-island'
                : step.error
                  ? 'border-2 border-dashed border-error bg-bg text-error'
                  : 'border border-line-strong bg-panel text-ink-2 hover:border-orange',
            )}
          >
            <span
              aria-hidden="true"
              className={cx(
                'grid size-8 shrink-0 place-items-center rounded-full text-body-sm font-extrabold',
                step.error ? 'bg-error-soft text-error' : 'bg-brand text-on-brand',
              )}
            >
              {step.badge}
            </span>
            <span className="flex flex-col gap-0.5">
              <b className="text-body-sm leading-4.5 text-ink">{step.name}</b>
              <span className="text-caption leading-4">{step.line}</span>
            </span>
          </button>
        )
      })}

      <div className="absolute top-138 left-75 flex h-14 w-50 items-center justify-center gap-2 rounded-pill bg-success-soft text-label-md font-semibold text-success">
        <Icon name="check" size={18} strokeWidth={2} />
        Fim · aprovado
      </div>
      <div className="absolute top-138 left-140 flex h-14 w-50 items-center justify-center gap-2 rounded-pill bg-error-soft text-label-md font-semibold text-error">
        <Icon name="x" size={18} strokeWidth={2} />
        Fim · rejeitado
      </div>
    </div>
  )
}
