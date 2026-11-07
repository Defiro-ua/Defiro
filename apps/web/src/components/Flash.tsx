import { useEffect, useState } from 'react'
import type { Notice } from '../domain/types'
import { cx } from '../lib/cx'
import { useDemo } from '../state/demoContext'
import { Button, IconButton } from './Button'
import { Icon, type IconName } from './Icon'

const toneColor = { ok: 'bg-success', warn: 'bg-warning', bad: 'bg-error', info: 'bg-info', neutro: 'bg-ink-2' } as const
const toneGlyph: Record<string, IconName> = { ok: 'check', warn: 'reset', bad: 'x' }

type FlashProps = {
  notice: (Notice & { n?: number }) | null
  onClose: () => void
  /** Opens the final document the notice is about */
  onDoc?: () => void
}

/**
 * The small card at the top of the screen after an action. A short title; the
 * details are read out to screen readers. Without buttons it fades away by
 * itself after a few seconds.
 */
export function Flash({ notice, onClose, onDoc }: FlashProps) {
  const { desfazer, podeDesfazer } = useDemo()
  // The live region exists before the text arrives, so screen readers announce it
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 150)
    return () => window.clearTimeout(t)
  }, [])

  const canUndo = !!notice && podeDesfazer(notice.undo)
  const withDoc = !!notice?.doc && !!onDoc
  const withActions = canUndo || withDoc
  const tom = notice?.tom || 'ok'

  return (
    <div role="status" aria-live="polite">
      {notice && ready && (
        <div
          key={notice.n}
          className={cx(
            'fixed inset-x-0 top-4 z-[120] mx-auto box-border flex w-max max-w-screen-gutter flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-line-strong bg-panel py-2 pr-2 pl-3 text-ink shadow-toast',
            withActions ? 'animate-toast' : 'animate-notice',
          )}
        >
          <span aria-hidden="true" className={cx('grid size-7 shrink-0 place-items-center rounded-full text-bg', toneColor[tom])}>
            <Icon name={toneGlyph[tom] || 'check'} size={16} />
          </span>
          <p className="m-0 text-[15px] leading-[22px] font-semibold">
            {notice.titulo}
            {notice.texto && <span className="sr-only">. {notice.texto}</span>}
          </p>
          {canUndo && (
            <Button variant="secondary" size="s" icon="reset" className="min-h-9 px-3" onClick={() => notice.undo && desfazer(notice.undo)}>
              Desfazer
            </Button>
          )}
          {withDoc && (
            <Button size="s" icon="fileText" className="min-h-9 px-3" onClick={onDoc}>
              Ver documento
            </Button>
          )}
          <IconButton icon="x" iconSize={16} label="Fechar o aviso" onClick={onClose} className="size-9 border-transparent" />
        </div>
      )}
    </div>
  )
}
