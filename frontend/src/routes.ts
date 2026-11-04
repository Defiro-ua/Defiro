/** Screens of the prototype (Opção 1 · Protótipo único), by route */
export const paths = {
  login: '/',
  inbox: '/caixa-de-tarefas',
  newRequest: '/novo-pedido',
  requestForm: (wf: string) => `/novo-pedido/${wf}`,
  request: (id: string) => `/pedidos/${id}`,
  correct: (id: string) => `/pedidos/${id}/corrigir`,
  workflows: '/workflows',
  workflow: (id: string) => `/workflows/${id}`,
  designer: '/workflows/criar',
} as const
