import type { ReactNode } from 'react'
import type { ProcedureStep } from '../data/types'
import { Panel } from './Panel'
import { ProgressSteps } from './ProgressSteps'

type ProcedureProgressProps = {
  steps: ProcedureStep[]
  current: number
  /** Extra content in the panel (e.g. a "returned from step 2" chip) */
  children?: ReactNode
}

/** Panel with the procedure's step line, shown under the page title. */
export function ProcedureProgress({ steps, current, children }: ProcedureProgressProps) {
  return (
    <Panel aria-label="Passos do procedimento" padding="none" className="relative flex flex-col gap-3 px-4 pt-5 pb-4 sm:px-6">
      {children}
      <ProgressSteps steps={steps} current={current} />
    </Panel>
  )
}
