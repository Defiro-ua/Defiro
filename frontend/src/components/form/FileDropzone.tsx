import { useId, type DragEvent } from 'react'
import { IconTile } from '../IconTile'

type FileDropzoneProps = {
  onFiles: (files: File[]) => void
  hint?: string
}

/** Drop area with a hidden file input; the whole area is the input's label. */
export function FileDropzone({ onFiles, hint = 'PDF, JPG ou PNG até 10 MB' }: FileDropzoneProps) {
  const hintId = useId()

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    onFiles(Array.from(event.dataTransfer.files))
  }

  return (
    <label
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
      className="relative flex flex-col items-center gap-2 rounded-md border-2 border-dashed border-line-strong bg-bg px-6 py-8 text-center hover:border-orange has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-orange"
    >
      <IconTile icon="upload" />
      <span className="text-label-md font-semibold">
        Arraste ficheiros ou <span className="text-accent-ink underline underline-offset-4">escolha do computador</span>
      </span>
      <span id={hintId} className="text-label-sm text-ink-3">
        {hint}
      </span>
      <input
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png"
        aria-describedby={hintId}
        onChange={(event) => {
          onFiles(Array.from(event.target.files ?? []))
          event.target.value = ''
        }}
        className="sr-only"
      />
    </label>
  )
}
