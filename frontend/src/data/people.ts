import { paths } from '../routes'
import type { AppNotification, Persona, PersonaId } from './types'

/** The five people of the demo ("Ver como" in the account menu). */
export const personas: Record<PersonaId, Persona> = {
  ana: {
    id: 'ana',
    name: 'Ana Ferreira',
    firstName: 'Ana',
    initials: 'AF',
    jobTitle: 'Técnica Superior',
    role: 'Requerente',
    roleDescription: 'Pede reembolsos e corrige pedidos',
    home: paths.myRequests,
  },
  rui: {
    id: 'rui',
    name: 'Rui Matos',
    firstName: 'Rui',
    initials: 'RM',
    jobTitle: 'Chefe de Divisão',
    role: 'Revisor · Chefia',
    roleDescription: 'Valida os pedidos da equipa',
    home: paths.inbox,
  },
  joana: {
    id: 'joana',
    name: 'Joana Pires',
    firstName: 'Joana',
    initials: 'JP',
    jobTitle: 'Técnica de Recursos Humanos',
    role: 'Revisor · Validação final (RH)',
    roleDescription: 'Confirma e fecha os procedimentos',
    home: paths.inboxHr,
  },
  sofia: {
    id: 'sofia',
    name: 'Sofia Almeida',
    firstName: 'Sofia',
    initials: 'SA',
    jobTitle: 'Gestora de workflows',
    role: 'Gestor de workflows',
    roleDescription: 'Desenha, altera e agenda workflows',
    home: paths.workflows,
  },
  helena: {
    id: 'helena',
    name: 'Helena Costa',
    firstName: 'Helena',
    initials: 'HC',
    jobTitle: 'Diretora de Departamento',
    role: 'Aprovador de workflows',
    roleDescription: 'Aprova alterações aos workflows',
    home: paths.approvals,
  },
}

export const personaOrder: PersonaId[] = ['ana', 'rui', 'joana', 'sofia', 'helena']

/** People who can register absences (revisores) */
export const canDelegate: PersonaId[] = ['rui', 'joana']

/** Notifications shown in the top bar, per person. */
export const notificationsByPersona: Record<PersonaId, AppNotification[]> = {
  rui: [
    { kind: 'task', title: 'Marta Lopes quer transferir-lhe a tarefa AC-2026-0158', when: 'Hoje, 09:40', unread: true, to: paths.inbox },
    { kind: 'info', title: 'Paulo Reis pede-lhe que o substitua de 20/10 a 23/10', when: 'Ontem, 17:15', unread: true, to: paths.inbox },
    { kind: 'task', title: 'Nova tarefa: Ajudas de custo · Ana Ferreira', when: 'Hoje, 08:02', unread: true, to: paths.review },
    { kind: 'task', title: 'Nova tarefa: Ajudas de custo · Paulo Reis', when: 'Hoje, 07:45', unread: true, to: paths.inbox },
    { kind: 'task', title: 'Nova tarefa: Formação externa · Ana Ferreira', when: 'Ontem, 11:20', unread: true, to: paths.inbox },
  ],
  ana: [
    { kind: 'deadline', title: 'O seu pedido AC-2026-0147 foi devolvido para correção', when: 'Hoje, 10:20', unread: true, to: paths.correct },
    { kind: 'ok', title: 'HE-2026-0079 passou para a Verificação financeira', when: '07/10, 15:02', unread: true, to: paths.myRequests },
  ],
  joana: [
    { kind: 'task', title: 'Nova tarefa: Validação final · Pedro Sousa', when: 'Hoje, 09:10', unread: true, to: paths.finalValidation },
    { kind: 'task', title: 'Nova tarefa: Validação final · Tiago Mendes', when: 'Ontem, 16:30', unread: true, to: paths.inboxHr },
  ],
  sofia: [
    { kind: 'ok', title: 'Helena Costa aprovou a v5 de Ajudas de custo: falta agendar', when: 'Hoje, 11:05', unread: true, to: paths.versions },
    { kind: 'info', title: 'A v3 de Horas extraordinárias foi agendada para 01/11', when: '02/10, 09:30', unread: false, to: paths.workflows },
  ],
  helena: [
    { kind: 'task', title: 'Nova alteração para aprovar: regra Pagamento de horas extraordinárias v3', when: '10/10, 16:40', unread: true, to: paths.approvals },
    { kind: 'task', title: 'Nova alteração para aprovar: Ajudas de custo v5', when: '09/10, 15:20', unread: true, to: paths.approvals },
  ],
}
