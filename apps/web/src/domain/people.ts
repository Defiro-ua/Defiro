import type { Persona, PersonaId } from './types'

/** The five accounts of the demo (Entrar and «Ver como») */
export const personas: Record<PersonaId, Persona> = {
  ana: {
    id: 'ana',
    nome: 'Ana Ferreira',
    primeiro: 'Ana',
    papel: 'Técnica Superior',
    funcao: 'Requerente',
    ini: 'AF',
    email: 'ana.ferreira@cm-aveiro.pt',
    unidade: 'Divisão de Obras Municipais',
    chefia: 'Rui Matos',
    desc: 'Pede reembolsos e corrige pedidos',
    nif: '234 567 418',
    iban: 'PT50 0035 0000 1234 5678 9015 4',
  },
  rui: {
    id: 'rui',
    nome: 'Rui Matos',
    primeiro: 'Rui',
    papel: 'Chefe de Divisão',
    funcao: 'Revisor · Chefia',
    ini: 'RM',
    email: 'rui.matos@cm-aveiro.pt',
    unidade: 'Divisão de Obras Municipais',
    chefia: 'Helena Costa',
    desc: 'Valida os pedidos da sua equipa',
    nif: '187 220 345',
    iban: 'PT50 0035 0000 8765 4321 0987 6',
  },
  carla: {
    id: 'carla',
    nome: 'Carla Dias',
    primeiro: 'Carla',
    papel: 'Técnica da Divisão Financeira',
    funcao: 'Revisor · Verificação financeira',
    ini: 'CD',
    email: 'carla.dias@cm-aveiro.pt',
    unidade: 'Divisão Financeira',
    chefia: 'Rui Matos',
    desc: 'Verifica os valores e as despesas',
    nif: '256 118 430',
    iban: 'PT50 0010 0000 5566 7788 9900 1',
  },
  joana: {
    id: 'joana',
    nome: 'Joana Pires',
    primeiro: 'Joana',
    papel: 'Técnica de Recursos Humanos',
    funcao: 'Revisor · Validação final (RH)',
    ini: 'JP',
    email: 'joana.pires@cm-aveiro.pt',
    unidade: 'Recursos Humanos',
    chefia: 'Rui Matos',
    desc: 'Confirma e fecha os procedimentos',
    nif: '229 874 105',
    iban: 'PT50 0033 0000 1122 3344 5566 7',
  },
  sofia: {
    id: 'sofia',
    nome: 'Sofia Almeida',
    primeiro: 'Sofia',
    papel: 'Gestora de workflows',
    funcao: 'Gestor de workflows',
    ini: 'SA',
    email: 'sofia.almeida@cm-aveiro.pt',
    unidade: 'Modernização Administrativa',
    chefia: 'Rui Matos',
    desc: 'Cria e gere os workflows',
    nif: '241 553 902',
    iban: 'PT50 0018 0000 9988 7766 5544 3',
  },
}

export const personaIds: PersonaId[] = ['ana', 'rui', 'carla', 'joana', 'sofia']

export const isPersonaId = (id: unknown): id is PersonaId => typeof id === 'string' && id in personas

/** The role of everyone the demo mentions; shown next to each name so two people with the same name can be told apart */
const roles: Record<string, string> = {
  'Ana Ferreira': 'Técnica Superior',
  'Rui Matos': 'Chefe de Divisão',
  'Carla Dias': 'Técnica da Divisão Financeira',
  'Joana Pires': 'Técnica de Recursos Humanos',
  'Sofia Almeida': 'Gestora de workflows',
  'Paulo Reis': 'Técnico Superior',
  'Pedro Sousa': 'Técnico Superior',
  'Marta Lopes': 'Técnica Superior',
  'Luísa Prata': 'Chefe de Divisão',
  'Nuno Barros': 'Chefe de Divisão',
  'Helena Costa': 'Diretora de Departamento',
}

export const roleOf = (nome: string) => roles[nome] || ''

/** «Rui Matos (Chefe de Divisão)» */
export function withRole(nome?: string) {
  if (!nome) return ''
  const c = roleOf(nome)
  return c ? `${nome} (${c})` : String(nome)
}

/** Adds the role after every known name in a sentence, once */
export function withRoles(t: string) {
  let s = String(t || '')
  for (const n of Object.keys(roles)) s = s.replace(new RegExp(n + '(?! \\()', 'g'), `${n} (${roles[n]})`)
  return s
}

/** Groups and units of the identity provider (IdP); `quem` is the persona who handles their tasks in the demo */
export const groups: Array<{ nome: string; nota: string; quem: PersonaId }> = [
  { nome: 'Todos os trabalhadores', nota: 'Grupo do IdP · 1 240 pessoas', quem: 'ana' },
  { nome: 'Chefias da unidade do requerente', nota: 'Calculado a partir da unidade de quem faz o pedido', quem: 'rui' },
  { nome: 'Chefias', nota: 'Grupo do IdP · 86 pessoas', quem: 'rui' },
  { nome: 'Divisão de Obras Municipais', nota: 'Unidade do IdP · 48 pessoas', quem: 'rui' },
  { nome: 'Divisão Financeira', nota: 'Unidade do IdP · 6 pessoas', quem: 'carla' },
  { nome: 'Recursos Humanos', nota: 'Unidade do IdP · 12 pessoas', quem: 'joana' },
  { nome: 'RH · Formação', nota: 'Grupo do IdP · 4 pessoas', quem: 'joana' },
]

/** Groups and units of the IdP each persona belongs to (decides which workflows they can start) */
const membership: Record<PersonaId, string[]> = {
  ana: ['Todos os trabalhadores', 'Divisão de Obras Municipais'],
  rui: ['Todos os trabalhadores', 'Chefias', 'Chefias da unidade do requerente', 'Divisão de Obras Municipais'],
  carla: ['Todos os trabalhadores', 'Divisão Financeira'],
  joana: ['Todos os trabalhadores', 'Recursos Humanos', 'RH · Formação'],
  sofia: ['Todos os trabalhadores'],
}

export const belongsTo = (pid: PersonaId, group: string) => membership[pid].includes(group)

/** Only workflow managers see and change the workflows */
export const isManager = (pid: PersonaId) => pid === 'sofia'
