import { Navigate, Route, Routes } from 'react-router'
import { AbsencesPage } from './pages/AbsencesPage'
import { ApprovalsPage } from './pages/ApprovalsPage'
import { CorrectRequestPage } from './pages/CorrectRequestPage'
import { DesignerPage } from './pages/DesignerPage'
import { FinalValidationPage } from './pages/FinalValidationPage'
import { HrInboxPage } from './pages/HrInboxPage'
import { InboxPage } from './pages/InboxPage'
import { LoginPage } from './pages/LoginPage'
import { MyRequestsPage } from './pages/MyRequestsPage'
import { NewRequestPage } from './pages/NewRequestPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { OverviewPage } from './pages/OverviewPage'
import { RequestFormPage } from './pages/RequestFormPage'
import { ReviewPage } from './pages/ReviewPage'
import { RulesPage } from './pages/RulesPage'
import { SearchPage } from './pages/SearchPage'
import { StepFormsPage } from './pages/StepFormsPage'
import { SubmitChangePage } from './pages/SubmitChangePage'
import { VersionsPage } from './pages/VersionsPage'
import { WorkflowsPage } from './pages/WorkflowsPage'
import { paths } from './routes'

export function App() {
  return (
    <Routes>
      <Route path={paths.login} element={<LoginPage />} />

      {/* 1 · Requester */}
      <Route path={paths.newRequest} element={<NewRequestPage />} />
      <Route path={paths.requestForm} element={<RequestFormPage />} />
      <Route path={paths.sign} element={<RequestFormPage />} />
      <Route path={paths.myRequests} element={<MyRequestsPage />} />
      <Route path={paths.correct} element={<CorrectRequestPage />} />

      {/* 2 · Reviewers */}
      <Route path={paths.inbox} element={<InboxPage />} />
      <Route path={paths.review} element={<ReviewPage />} />
      <Route path={paths.reject} element={<ReviewPage />} />
      <Route path={paths.inboxHr} element={<HrInboxPage />} />
      <Route path={paths.finalValidation} element={<FinalValidationPage />} />

      {/* 3 · Workflow management */}
      <Route path={paths.workflows} element={<WorkflowsPage />} />
      <Route path={paths.designer} element={<DesignerPage />} />
      <Route path={paths.stepForms} element={<StepFormsPage />} />
      <Route path={paths.submitChange} element={<SubmitChangePage />} />
      <Route path={paths.approvals} element={<ApprovalsPage />} />
      <Route path={paths.rules} element={<RulesPage />} />
      <Route path={paths.versions} element={<VersionsPage />} />

      {/* 4 · Search, notifications and follow-up */}
      <Route path={paths.search} element={<SearchPage />} />
      <Route path={paths.notifications} element={<NotificationsPage />} />
      <Route path={paths.overview} element={<OverviewPage />} />
      <Route path={paths.absences} element={<AbsencesPage />} />

      <Route path="*" element={<Navigate to={paths.login} replace />} />
    </Routes>
  )
}
