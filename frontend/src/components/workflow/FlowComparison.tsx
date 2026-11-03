import type { FlowNode } from '../../data/workflows'
import { cx } from '../../lib/cx'
import { Chip } from '../Chip'

type FlowColumnProps = {
  title: string
  nodes: FlowNode[]
  /** The proposed version: brand badges, orange connectors and change marks */
  proposed?: boolean
}

/** One version of a workflow as a vertical list of steps. */
export function FlowColumn({ title, nodes, proposed }: FlowColumnProps) {
  return (
    <div className={cx('flex grow basis-65 flex-col rounded-md bg-tint p-5', proposed && 'border border-line')}>
      <h3 className={cx('mb-4 text-label-sm font-semibold', proposed ? 'text-accent-ink' : 'text-ink-3')}>{title}</h3>
      <ol className="flex flex-col">
        {nodes.map((node, i) => (
            <li
              key={node.n}
              className={cx(
                'relative flex min-h-13 flex-wrap items-center gap-x-2.5 gap-y-1.5 rounded-lg px-3.5 py-2 text-body-sm',
                i > 0 && 'mt-4',
                node.change === 'changed' && 'border-2 border-changed bg-changed-soft',
                node.change === 'new' && 'border-2 border-success bg-success-tint',
                !node.change && 'border border-line-strong bg-panel',
              )}
            >
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className={cx('absolute -top-4 left-1/2 h-4 w-0.5', proposed ? 'bg-orange' : 'bg-line-strong')}
                />
              )}
              <span
                aria-hidden="true"
                className={cx(
                  'grid size-6.5 shrink-0 place-items-center rounded-full text-caption font-extrabold',
                  proposed ? 'bg-brand text-on-brand' : 'bg-line text-ink-2',
                )}
              >
                {node.n}
              </span>
              <span className="flex-1">
                {node.name}
                {node.note && (
                  <>
                    <br />
                    <span className="text-caption text-ink-3">{node.note}</span>
                  </>
                )}
              </span>
              {node.days && <span className="text-label-sm text-ink-3">{node.days}</span>}
              {node.changeLabel && (
                <Chip tone={node.change === 'new' ? 'success' : 'warning'} size="xs">
                  {node.changeLabel}
                </Chip>
              )}
            </li>
        ))}
      </ol>
    </div>
  )
}

/** Key for the change marks used in comparisons */
export function ChangeLegend() {
  const items = [
    { label: 'Novo', box: 'border-2 border-success' },
    { label: 'Alterado', box: 'border-2 border-changed' },
    { label: 'Removido', box: 'border-2 border-dashed border-error' },
  ]
  return (
    <ul aria-label="Legenda" className="flex flex-wrap gap-x-5 gap-y-2 text-label-sm text-ink-2">
      {items.map((item) => (
        <li key={item.label} className="inline-flex items-center gap-2">
          <span aria-hidden="true" className={cx('size-3.5 rounded-xs', item.box)} />
          {item.label}
        </li>
      ))}
    </ul>
  )
}
