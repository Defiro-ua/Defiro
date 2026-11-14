import { Navigate, Route, Routes } from 'react-router'
import { SignedIn } from './components/SignedIn'
import { LoginPage } from './pages/LoginPage'
import { ScreenToComePage } from './pages/ScreenToComePage'
import { paths } from './routes'

/** The screens arrive one use case at a time; the prototype they come from is on prototype/frontend (apps/web/README.md). */
export function App() {
  return (
    <Routes>
      <Route path={paths.login} element={<LoginPage />} />
      <Route element={<SignedIn />}>
        <Route path={paths.inbox} element={<ScreenToComePage item="inbox" />} />
        <Route path={paths.newRequest} element={<ScreenToComePage item="new-request" />} />
        <Route path={paths.workflows} element={<ScreenToComePage item="workflows" />} />
        <Route path={paths.designer} element={<ScreenToComePage item="create-workflow" />} />
      </Route>
      <Route path="*" element={<Navigate to={paths.login} replace />} />
    </Routes>
  )
}
