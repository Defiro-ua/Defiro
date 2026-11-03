import { paths } from '../routes'

export type SearchStatus = 'Em análise' | 'Devolvido' | 'Concluído' | 'Rejeitado'

export type SearchResult = {
  id: string
  /** Part of the subject that matches the search */
  match: string
  rest: string
  version: string
  requester: string
  step: string
  status: SearchStatus
  changed: string
  documents: string[]
  to?: string
}

export const searchQuery = 'ajudas de custo'

export const searchResults: SearchResult[] = [
  { id: 'AC-2026-0147', match: 'Ajudas de custo', rest: ' · Formação em Contratação Pública', version: '4', requester: 'Ana Ferreira', step: 'Validação da chefia', status: 'Em análise', changed: '10/10/2026', documents: ['Pedido assinado.pdf'], to: paths.review },
  { id: 'AC-2026-0151', match: 'Ajudas de custo', rest: ' · Seminário em Lisboa', version: '4', requester: 'Paulo Reis', step: 'Validação da chefia', status: 'Em análise', changed: '10/10/2026', documents: ['Pedido assinado.pdf'] },
  { id: 'AC-2026-0122', match: 'Ajudas de custo', rest: ' · Segurança em obra', version: '4', requester: 'Pedro Sousa', step: 'Validação final', status: 'Em análise', changed: '07/10/2026', documents: ['Pedido assinado.pdf', 'Certificado de presença.pdf'] },
  { id: 'AC-2026-0139', match: 'Ajudas de custo', rest: ' · Workshop em Braga', version: '4', requester: 'Tiago Mendes', step: 'Verificação financeira', status: 'Em análise', changed: '06/10/2026', documents: ['Pedido assinado.pdf'] },
  { id: 'AC-2026-0102', match: 'Ajudas de custo', rest: ' · Visita técnica ao Porto', version: '4', requester: 'Ana Ferreira', step: 'Arquivado', status: 'Concluído', changed: '30/09/2026', documents: ['Pedido assinado.pdf', 'Ordem de reembolso.pdf'] },
  { id: 'AC-2026-0095', match: 'Ajudas de custo', rest: ' · Visita a obra em Ílhavo', version: '3', requester: 'Ana Ferreira', step: 'Arquivado', status: 'Rejeitado', changed: '22/09/2026', documents: ['Pedido assinado.pdf'] },
]

export const activeFilters = ['Workflow: Ajudas de custo', '01/09/2026 – 10/10/2026']
export const otherFilters = ['Estado', 'Requerente']
export const totalResults = 24
