import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { isManager } from './domain/people'
import type { PersonaId } from './domain/types'
import { DesignerPage } from './pages/DesignerPage'
import { InboxPage } from './pages/InboxPage'
import { LoginPage } from './pages/LoginPage'
import { NewRequestPage } from './pages/NewRequestPage'
import { RequestFormPage } from './pages/RequestFormPage'
import { RequestPage } from './pages/RequestPage'
import { WorkflowDetailPage, WorkflowsPage } from './pages/WorkflowsPage'
import { paths } from './routes'
import { useDemo } from './state/demoContext'

/** The screens after signing in; without a person, back to Entrar */
function SignedIn({ children, manager }: { children: (persona: PersonaId) => ReactNode; manager?: boolean }) {
  const { persona } = useDemo()
  if (!persona) return <Navigate to={paths.login} replace />
  // the management screens are only for workflow managers, also when opened by their address
  if (manager && !isManager(persona)) return <Navigate to={paths.inbox} replace />
  return <>{children(persona)}</>
}

export function App() {
  return (
    <Routes>
      <Route path={paths.login} element={<LoginPage />} />
      <Route path={paths.inbox} element={<SignedIn>{(p) => <InboxPage persona={p} />}</SignedIn>} />
      <Route path={paths.newRequest} element={<SignedIn>{(p) => <NewRequestPage persona={p} />}</SignedIn>} />
      <Route path="/novo-pedido/:wf" element={<SignedIn>{(p) => <RequestFormPage persona={p} mode="novo" />}</SignedIn>} />
      <Route path="/pedidos/:id" element={<SignedIn>{(p) => <RequestPage persona={p} />}</SignedIn>} />
      <Route path="/pedidos/:id/corrigir" element={<SignedIn>{(p) => <RequestFormPage persona={p} mode="corrigir" />}</SignedIn>} />
      <Route path={paths.workflows} element={<SignedIn manager>{(p) => <WorkflowsPage persona={p} />}</SignedIn>} />
      <Route path={paths.designer} element={<SignedIn manager>{() => <DesignerPage />}</SignedIn>} />
      <Route path="/workflows/:id" element={<SignedIn manager>{(p) => <WorkflowDetailPage persona={p} />}</SignedIn>} />
      <Route path="*" element={<Navigate to={paths.login} replace />} />
    </Routes>
  )
}
