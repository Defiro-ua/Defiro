import { paths } from '../routes'
import type { AppNotification } from './types'

/** E19 · every notification of Rui Matos, grouped by day */
export const notificationGroups: Array<{ name: string; items: AppNotification[] }> = [
  {
    name: 'Hoje',
    items: [
      { kind: 'task', title: 'Pedido de transferência: AC-2026-0158', detail: 'Marta Lopes quer transferir-lhe esta tarefa. Aceite ou recuse na caixa de tarefas.', when: '09:40', action: 'Responder', to: paths.inbox, unread: true },
      { kind: 'task', title: 'Nova tarefa: Ajudas de custo · Ana Ferreira', detail: 'AC-2026-0147 voltou corrigido e espera a sua validação.', when: '08:02', action: 'Rever', to: paths.review, unread: true },
      { kind: 'task', title: 'Nova tarefa: Ajudas de custo · Paulo Reis', detail: 'AC-2026-0151 espera a sua validação.', when: '07:45', action: 'Abrir', to: paths.inbox, unread: true },
    ],
  },
  {
    name: 'Ontem',
    items: [
      { kind: 'task', title: 'Pedido de substituição: 20/10 a 23/10', detail: 'Paulo Reis pede-lhe que o substitua durante uma ausência.', when: '17:15', action: 'Responder', to: paths.inbox, unread: true },
      { kind: 'task', title: 'Nova tarefa: Formação externa · Ana Ferreira', detail: 'FE-2026-0021 espera a sua validação.', when: '11:20', action: 'Abrir', to: paths.inbox, unread: true },
    ],
  },
  {
    name: 'Esta semana',
    items: [
      { kind: 'deadline', title: 'Falta 1 dia: Horas extraordinárias · João Neves', detail: 'O prazo legal de HE-2026-0088 termina amanhã.', when: '07/10, 09:00', action: 'Abrir', to: paths.inbox, unread: false },
      { kind: 'ok', title: 'AC-2026-0139 passou para a Verificação financeira', detail: 'Depois da sua validação, seguiu para a Divisão Financeira.', when: '06/10, 16:12', action: 'Ver', to: paths.search, unread: false },
    ],
  },
]
