import type { ReactNode } from 'react'
import { cx } from '../lib/cx'
import { IconTile } from './IconTile'

export type FileItem = { name: string; meta: string }

type FileListProps = {
  files: FileItem[]
  /** Right-hand content for each file (remove button, open link, badge) */
  renderAction?: (file: FileItem) => ReactNode
  label?: string
}

/** Attachments on a soft background, one per row. */
export function FileList({ files, renderAction, label }: FileListProps) {
  return (
    <ul aria-label={label} className="rounded-md bg-soft px-5 py-1">
      {files.map((file, i) => (
        <li key={file.name} className={cx('flex items-center gap-3.5 py-3', i > 0 && 'border-t border-line-strong')}>
          <IconTile icon="fileText" size="md" tone="bg" />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-label-md font-semibold">{file.name}</span>
            <span className="text-label-sm text-ink-3">{file.meta}</span>
          </span>
          {renderAction?.(file)}
        </li>
      ))}
    </ul>
  )
}
