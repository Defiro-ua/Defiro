import type { EditorTab } from '../layout/EditorLayout'
import { paths } from '../../routes'

export type WorkflowPart = 'flow' | 'forms' | 'rules'

/** The three parts of the workflow editor, shown in its header. */
export function workflowTabs(active: WorkflowPart): EditorTab[] {
  return [
    { label: 'Fluxo', to: paths.designer, active: active === 'flow' },
    { label: 'Formulários', to: paths.stepForms, active: active === 'forms' },
    { label: 'Regras · 2', to: `${paths.designer}?vista=regras`, active: active === 'rules' },
  ]
}
