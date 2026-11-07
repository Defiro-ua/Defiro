import { useEffect, useMemo, useRef } from 'react'
import type { DocContent } from '../domain/types'
import { pdfBlob } from '../lib/pdf'
import { Button } from './Button'
import { Icon } from './Icon'

type Props = {
  doc: DocContent | null
  open: boolean
  onClose: () => void
}

/** A document (final or attached) with its preview and a real PDF to download */
export function DocumentDialog({ doc, open, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const returnTo = useRef<Element | null>(null)
  const url = useMemo(() => (doc ? URL.createObjectURL(pdfBlob(doc)) : ''), [doc])
  useEffect(() => () => (url ? URL.revokeObjectURL(url) : undefined), [url])

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) {
      returnTo.current = document.activeElement
      d.showModal()
    } else if (!open && d.open) d.close()
  }, [open])

  function closed() {
    if (open) onClose()
    const el = returnTo.current as HTMLElement | null
    returnTo.current = null
    if (el?.focus && document.contains(el)) window.setTimeout(() => el.focus(), 0)
  }

  const ficheiro = String(doc?.ficheiro || 'documento.pdf').replace(/\.(jpe?g|png)$/i, '.pdf')

  return (
    <dialog ref={ref} onClose={closed} aria-labelledby="doc-titulo" aria-describedby="doc-sub" className="w-[680px] font-sans">
      {doc && (
        <div className="box-border border border-edge flex max-h-[calc(100vh-48px)] flex-col gap-4.5 overflow-auto rounded-menu bg-bg px-7 pb-7 text-ink">
          <div className="sticky top-0 z-2 -mx-7 flex flex-wrap items-center gap-2.5 border-b border-line bg-bg px-7 pt-4 pb-3.5">
            <Button variant="secondary" icon="x" onClick={() => ref.current?.close()}>
              Fechar<span className="sr-only"> o documento</span>
            </Button>
            <span className="flex-1" />
            <Button href={url} download={ficheiro} icon="download">
              Transferir PDF<span className="sr-only"> {ficheiro}</span>
            </Button>
          </div>
          <div className="flex items-start gap-4">
            <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-md bg-soft text-accent-ink">
              <Icon name="fileText" size={24} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <h2 id="doc-titulo" className="m-0 text-[22px] leading-[30px] font-extrabold tracking-heading">
                {doc.titulo}
              </h2>
              <p id="doc-sub" className="m-0 text-body-sm text-ink-3 [overflow-wrap:anywhere]">
                {doc.sub}
              </p>
            </div>
          </div>
          <section
            aria-label="Pré-visualização do documento"
            className="flex flex-col gap-3.5 rounded-md border border-line-strong bg-panel px-8 py-7 shadow-paper"
          >
            <p className="m-0 text-caption leading-[18px] text-ink-3">defiro</p>
            <p className="m-0 text-[20px] leading-[26px] font-extrabold">{doc.titulo}</p>
            <dl className="m-0 flex flex-col">
              {doc.linhas.map(([label, value]) => (
                <div key={label} className="flex flex-wrap gap-x-4 gap-y-0.5 border-t border-line py-2.25">
                  <dt className="flex-[0_0_200px] text-label-sm leading-5 text-ink-3">{label}</dt>
                  <dd className="m-0 flex-[1_1_220px] text-[15px] leading-[22px] font-semibold tabular-nums [overflow-wrap:anywhere]">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="m-0 text-label-sm leading-5 text-ink-2">{doc.nota}</p>
          </section>
        </div>
      )}
    </dialog>
  )
}
