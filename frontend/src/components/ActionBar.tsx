import type { ReactNode } from 'react'

/** Rounded bar with the form's main actions, at the end of long forms. */
export function ActionBar({ message, children }: { message: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-sheet border border-line bg-bg/92 px-5 py-4 shadow-island sm:rounded-pill">
      <div className="flex grow basis-55 items-center gap-2 pl-2 text-body-sm">{message}</div>
      {children}
    </div>
  )
}
