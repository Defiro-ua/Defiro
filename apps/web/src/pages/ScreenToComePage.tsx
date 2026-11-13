import { useRef } from 'react'
import { Navigate } from 'react-router'
import type { MenuItem } from '../api/session'
import { AppShell } from '../components/layout/AppShell'
import { useFocusOnArrival } from '../lib/useFocusOnArrival'
import { useProfile } from '../lib/useProfile'
import { paths } from '../routes'

const titles: Record<MenuItem, string> = {
  'create-workflow': 'Criar workflow',
  'new-request': 'Novo pedido',
  inbox: 'Caixa de tarefas',
  workflows: 'Workflows',
}

/**
 * A screen of the menu that arrives with a later use case (the task inbox with UC27). Only for
 * whom the menu shows it: the management screens stay for the Workflow Manager, also when
 * opened by their address.
 */
export function ScreenToComePage({ item }: { item: MenuItem }) {
  const profile = useProfile()
  const headingRef = useRef<HTMLHeadingElement>(null)
  useFocusOnArrival(headingRef)

  if (!profile.menu.includes(item)) return <Navigate to={paths.inbox} replace />

  return (
    <AppShell profile={profile} active={item}>
      <h1 ref={headingRef} tabIndex={-1} className="m-0 text-[32px] leading-10 font-extrabold tracking-headline outline-none">
        {titles[item]}
      </h1>
      <p className="mt-3 mb-0 max-w-prose-md text-[17px] leading-[1.6] text-ink-2">Este ecrã ainda está a ser construído.</p>
    </AppShell>
  )
}
