import { create } from 'zustand'
import type {
  Cliente, Contrato, Funcionario, EscalaTurno, OrdemServico, Ocorrencia,
  LancamentoFinanceiro, ItemEstoque, MovEstoque, Usuario,
} from '@/data/mockData'
import {
  clientesMock, contratosMock, funcionariosMock, escalaMock, ordensMock,
  ocorrenciasMock, financeiroMock, estoqueMock, movEstoqueMock, usuariosMock,
  empresaInfo,
} from '@/data/mockData'
import {
  Despesa, ServicoAvulso, PagamentoAvulso, Prestador, Curriculo,
  PropostaConcorrente, ProLaboreConfig,
  despesasSeed, servicosAvulsosSeed, pagamentosAvulsosSeed, prestadoresSeed,
  curriculosSeed, concorrentesSeed, proLaboreDefault,
} from '@/data/mockExtras'
import { uid } from '@/lib/utils'

interface Toast { id: string; titulo: string; descricao?: string; tipo: 'success' | 'error' | 'info' }

export type PerfilSessao = 'socio_gestor' | 'socio' | 'gerente'

export interface Sessao {
  id: string
  nome: string
  login: string
  perfil: PerfilSessao
  perfilUsuario: Usuario['perfil']
  avatarIniciais: string
}

// Mapeia o perfil cadastral (Administrador/Financeiro/Operacional/RH/Cliente)
// para o perfil de sessão (socio_gestor / socio / gerente)
export function mapPerfil(p: Usuario['perfil']): PerfilSessao {
  if (p === 'Administrador') return 'socio_gestor'
  if (p === 'Cliente') return 'gerente' // cliente = perfil limitado (como gerente, sem área sócios)
  return 'gerente'
}

function sessaoDoUsuario(u: Usuario): Sessao {
  const iniciais = u.avatarIniciais || u.nome.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
  return {
    id: u.id,
    nome: u.nome,
    login: u.login,
    perfil: mapPerfil(u.perfil),
    perfilUsuario: u.perfil,
    avatarIniciais: iniciais,
  }
}

const AUTH_KEY = 'psfm:auth:login'

interface State {
  // sessão
  autenticado: boolean
  sessao: Sessao | null
  // núcleo
  clientes: Cliente[]
  contratos: Contrato[]
  funcionarios: Funcionario[]
  escalas: EscalaTurno[]
  ordens: OrdemServico[]
  ocorrencias: Ocorrencia[]
  financeiro: LancamentoFinanceiro[]
  estoque: ItemEstoque[]
  movEstoque: MovEstoque[]
  usuarios: Usuario[]
  empresa: typeof empresaInfo
  toasts: Toast[]

  // extensões
  despesas: Despesa[]
  servicosAvulsos: ServicoAvulso[]
  pagamentosAvulsos: PagamentoAvulso[]
  prestadores: Prestador[]
  curriculos: Curriculo[]
  concorrentes: PropostaConcorrente[]
  proLabore: ProLaboreConfig

  // clientes
  addCliente: (c: Omit<Cliente, 'id' | 'criadoEm'>) => void
  updateCliente: (id: string, patch: Partial<Cliente>) => void
  removeCliente: (id: string) => void

  // contratos
  addContrato: (c: Omit<Contrato, 'id' | 'criadoEm'>) => void
  updateContrato: (id: string, patch: Partial<Contrato>) => void
  removeContrato: (id: string) => void

  // funcionarios
  addFuncionario: (f: Omit<Funcionario, 'id'>) => void
  updateFuncionario: (id: string, patch: Partial<Funcionario>) => void
  removeFuncionario: (id: string) => void

  // escalas
  addEscala: (e: Omit<EscalaTurno, 'id'>) => void
  updateEscala: (id: string, patch: Partial<EscalaTurno>) => void

  // ordens
  toggleChecklistItem: (ordemId: string, index: number) => void
  atualizarStatusOrdem: (ordemId: string, status: OrdemServico['status']) => void
  addChecklistItem: (ordemId: string, item: string) => void
  updateChecklistItem: (ordemId: string, index: number, texto: string) => void
  removeChecklistItem: (ordemId: string, index: number) => void

  // ocorrencias
  addOcorrencia: (o: Omit<Ocorrencia, 'id' | 'criadaEm'>) => void
  updateOcorrencia: (id: string, patch: Partial<Ocorrencia>) => void

  // financeiro
  addLancamento: (l: Omit<LancamentoFinanceiro, 'id'>) => void
  marcarPago: (id: string, pagamento: string) => void

  // estoque
  addItemEstoque: (i: Omit<ItemEstoque, 'id'>) => void
  movimentarEstoque: (mov: Omit<MovEstoque, 'id'>) => void

  // usuarios
  addUsuario: (u: Omit<Usuario, 'id' | 'ultimoAcesso'>) => void
  updateUsuario: (id: string, patch: Partial<Usuario>) => void
  removeUsuario: (id: string) => void
  updateEmpresa: (patch: Partial<typeof empresaInfo>) => void

  // sócios
  addSocio: (s: { nome: string; telefone: string }) => void
  updateSocio: (index: number, patch: { nome?: string; telefone?: string }) => void
  removeSocio: (index: number) => void

  // despesas
  addDespesa: (d: Omit<Despesa, 'id'>) => void
  updateDespesa: (id: string, patch: Partial<Despesa>) => void
  removeDespesa: (id: string) => void

  // servicos avulsos
  addServicoAvulso: (s: Omit<ServicoAvulso, 'id'>) => void
  updateServicoAvulso: (id: string, patch: Partial<ServicoAvulso>) => void
  removeServicoAvulso: (id: string) => void

  // pagamentos avulsos
  addPagamentoAvulso: (p: Omit<PagamentoAvulso, 'id'>) => void
  updatePagamentoAvulso: (id: string, patch: Partial<PagamentoAvulso>) => void
  removePagamentoAvulso: (id: string) => void

  // prestadores
  addPrestador: (p: Omit<Prestador, 'id'>) => void
  updatePrestador: (id: string, patch: Partial<Prestador>) => void
  removePrestador: (id: string) => void

  // curriculos
  addCurriculo: (c: Omit<Curriculo, 'id'>) => void
  updateCurriculo: (id: string, patch: Partial<Curriculo>) => void
  removeCurriculo: (id: string) => void

  // concorrentes
  addConcorrente: (c: Omit<PropostaConcorrente, 'id'>) => void
  updateConcorrente: (id: string, patch: Partial<PropostaConcorrente>) => void
  removeConcorrente: (id: string) => void

  // pro-labore
  updateProLabore: (patch: Partial<ProLaboreConfig>) => void

  // sessão / auth
  login: (identificador: string, senha: string) => { ok: boolean; erro?: string }
  logout: () => void

  // toasts
  pushToast: (t: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

// Restaura sessão do localStorage (se houver)
function restaurarSessao(): { autenticado: boolean; sessao: Sessao | null } {
  try {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem(AUTH_KEY) : null
    if (!saved) return { autenticado: false, sessao: null }
    const login = JSON.parse(saved) as string
    const u = usuariosMock.find((x) => x.login === login && x.status === 'ativo')
    if (!u) return { autenticado: false, sessao: null }
    return { autenticado: true, sessao: sessaoDoUsuario(u) }
  } catch {
    return { autenticado: false, sessao: null }
  }
}

const inicial = restaurarSessao()
// Garantia de consistência — só considera autenticado se há sessão válida
const autenticadoInicial = inicial.autenticado && !!inicial.sessao

export const useStore = create<State>((set, get) => ({
  autenticado: autenticadoInicial,
  sessao: inicial.sessao,
  clientes: clientesMock,
  contratos: contratosMock,
  funcionarios: funcionariosMock,
  escalas: escalaMock,
  ordens: ordensMock,
  ocorrencias: ocorrenciasMock,
  financeiro: financeiroMock,
  estoque: estoqueMock,
  movEstoque: movEstoqueMock,
  usuarios: usuariosMock,
  empresa: empresaInfo,
  toasts: [],

  despesas: despesasSeed,
  servicosAvulsos: servicosAvulsosSeed,
  pagamentosAvulsos: pagamentosAvulsosSeed,
  prestadores: prestadoresSeed,
  curriculos: curriculosSeed,
  concorrentes: concorrentesSeed,
  proLabore: proLaboreDefault,

  addCliente: (c) => set((s) => ({ clientes: [{ ...c, id: 'cli-' + uid(), criadoEm: new Date().toISOString().slice(0, 10) }, ...s.clientes] })),
  updateCliente: (id, patch) => set((s) => ({ clientes: s.clientes.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
  removeCliente: (id) => set((s) => ({ clientes: s.clientes.filter((x) => x.id !== id) })),

  addContrato: (c) => set((s) => ({ contratos: [{ ...c, id: 'ctr-' + uid(), criadoEm: new Date().toISOString().slice(0, 10) }, ...s.contratos] })),
  updateContrato: (id, patch) => set((s) => ({ contratos: s.contratos.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
  removeContrato: (id) => set((s) => ({ contratos: s.contratos.filter((x) => x.id !== id) })),

  addFuncionario: (f) => set((s) => ({ funcionarios: [{ ...f, id: 'fun-' + uid() }, ...s.funcionarios] })),
  updateFuncionario: (id, patch) => set((s) => ({ funcionarios: s.funcionarios.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
  removeFuncionario: (id) => set((s) => ({ funcionarios: s.funcionarios.filter((x) => x.id !== id) })),

  addEscala: (e) => set((s) => ({ escalas: [{ ...e, id: 'esc-' + uid() }, ...s.escalas] })),
  updateEscala: (id, patch) => set((s) => ({ escalas: s.escalas.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),

  toggleChecklistItem: (ordemId, index) =>
    set((s) => ({
      ordens: s.ordens.map((o) => {
        if (o.id !== ordemId) return o
        const checklist = o.checklist.map((it, i) => (i === index ? { ...it, feito: !it.feito } : it))
        const total = checklist.length
        const feitos = checklist.filter((i) => i.feito).length
        const progresso = Math.round((feitos / total) * 100)
        const status: OrdemServico['status'] = progresso === 100 ? 'concluido' : progresso === 0 ? 'pendente' : 'em_execucao'
        return { ...o, checklist, progresso, status }
      }),
    })),
  atualizarStatusOrdem: (ordemId, status) => set((s) => ({ ordens: s.ordens.map((o) => (o.id === ordemId ? { ...o, status } : o)) })),

  addChecklistItem: (ordemId, item) =>
    set((s) => ({
      ordens: s.ordens.map((o) => {
        if (o.id !== ordemId) return o
        const checklist = [...o.checklist, { item, feito: false }]
        const total = checklist.length
        const feitos = checklist.filter((i) => i.feito).length
        const progresso = Math.round((feitos / total) * 100)
        return { ...o, checklist, progresso }
      }),
    })),
  updateChecklistItem: (ordemId, index, texto) =>
    set((s) => ({
      ordens: s.ordens.map((o) => {
        if (o.id !== ordemId) return o
        const checklist = o.checklist.map((it, i) => (i === index ? { ...it, item: texto } : it))
        return { ...o, checklist }
      }),
    })),
  removeChecklistItem: (ordemId, index) =>
    set((s) => ({
      ordens: s.ordens.map((o) => {
        if (o.id !== ordemId) return o
        const checklist = o.checklist.filter((_, i) => i !== index)
        const total = checklist.length
        const feitos = checklist.filter((i) => i.feito).length
        const progresso = total === 0 ? 0 : Math.round((feitos / total) * 100)
        const status: OrdemServico['status'] = progresso === 100 ? 'concluido' : progresso === 0 ? 'pendente' : 'em_execucao'
        return { ...o, checklist, progresso, status }
      }),
    })),

  addOcorrencia: (o) => set((s) => ({ ocorrencias: [{ ...o, id: 'oco-' + uid(), criadaEm: new Date().toISOString() }, ...s.ocorrencias] })),
  updateOcorrencia: (id, patch) => set((s) => ({ ocorrencias: s.ocorrencias.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),

  addLancamento: (l) => set((s) => ({ financeiro: [{ ...l, id: 'fin-' + uid() }, ...s.financeiro] })),
  marcarPago: (id, pagamento) => set((s) => ({ financeiro: s.financeiro.map((x) => (x.id === id ? { ...x, status: 'pago', pagamento } : x)) })),

  addItemEstoque: (i) => set((s) => ({ estoque: [{ ...i, id: 'est-' + uid() }, ...s.estoque] })),
  movimentarEstoque: (mov) =>
    set((s) => {
      const item = s.estoque.find((i) => i.id === mov.itemId)
      if (!item) return s
      const novaQtd = mov.tipo === 'entrada' ? item.quantidade + mov.quantidade : item.quantidade - mov.quantidade
      return {
        estoque: s.estoque.map((i) => (i.id === mov.itemId ? { ...i, quantidade: Math.max(0, novaQtd), ultimaMovimentacao: mov.data } : i)),
        movEstoque: [{ ...mov, id: 'mv-' + uid() }, ...s.movEstoque],
      }
    }),

  addUsuario: (u) => set((s) => {
    const iniciais = u.nome.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    return { usuarios: [{ ...u, id: 'usr-' + uid(), ultimoAcesso: new Date().toISOString(), avatarIniciais: iniciais }, ...s.usuarios] }
  }),
  updateUsuario: (id, patch) => set((s) => ({ usuarios: s.usuarios.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
  removeUsuario: (id) => set((s) => ({ usuarios: s.usuarios.filter((x) => x.id !== id) })),
  updateEmpresa: (patch) => set((s) => ({ empresa: { ...s.empresa, ...patch } })),

  addSocio: (novo) => set((s) => ({ empresa: { ...s.empresa, socios: [...s.empresa.socios, novo] } })),
  updateSocio: (index, patch) => set((s) => ({
    empresa: {
      ...s.empresa,
      socios: s.empresa.socios.map((so, i) => (i === index ? { ...so, ...patch } : so)),
    },
  })),
  removeSocio: (index) => set((s) => ({
    empresa: { ...s.empresa, socios: s.empresa.socios.filter((_, i) => i !== index) },
  })),

  // Despesas
  addDespesa: (d) => set((s) => ({ despesas: [{ ...d, id: 'dsp-' + uid() }, ...s.despesas] })),
  updateDespesa: (id, patch) => set((s) => ({ despesas: s.despesas.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
  removeDespesa: (id) => set((s) => ({ despesas: s.despesas.filter((x) => x.id !== id) })),

  // Serviços avulsos
  addServicoAvulso: (sv) => set((s) => ({ servicosAvulsos: [{ ...sv, id: 'sa-' + uid() }, ...s.servicosAvulsos] })),
  updateServicoAvulso: (id, patch) => set((s) => ({ servicosAvulsos: s.servicosAvulsos.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
  removeServicoAvulso: (id) => set((s) => ({
    servicosAvulsos: s.servicosAvulsos.filter((x) => x.id !== id),
    pagamentosAvulsos: s.pagamentosAvulsos.filter((p) => p.servicoAvulsoId !== id),
  })),

  // Pagamentos avulsos
  addPagamentoAvulso: (p) => set((s) => ({ pagamentosAvulsos: [{ ...p, id: 'pa-' + uid() }, ...s.pagamentosAvulsos] })),
  updatePagamentoAvulso: (id, patch) => set((s) => ({ pagamentosAvulsos: s.pagamentosAvulsos.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
  removePagamentoAvulso: (id) => set((s) => ({ pagamentosAvulsos: s.pagamentosAvulsos.filter((x) => x.id !== id) })),

  // Prestadores
  addPrestador: (p) => set((s) => ({ prestadores: [{ ...p, id: 'prs-' + uid() }, ...s.prestadores] })),
  updatePrestador: (id, patch) => set((s) => ({ prestadores: s.prestadores.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
  removePrestador: (id) => set((s) => ({ prestadores: s.prestadores.filter((x) => x.id !== id) })),

  // Currículos
  addCurriculo: (c) => set((s) => ({ curriculos: [{ ...c, id: 'cv-' + uid() }, ...s.curriculos] })),
  updateCurriculo: (id, patch) => set((s) => ({ curriculos: s.curriculos.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
  removeCurriculo: (id) => set((s) => ({ curriculos: s.curriculos.filter((x) => x.id !== id) })),

  // Concorrentes
  addConcorrente: (c) => set((s) => ({ concorrentes: [{ ...c, id: 'pc-' + uid() }, ...s.concorrentes] })),
  updateConcorrente: (id, patch) => set((s) => ({ concorrentes: s.concorrentes.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
  removeConcorrente: (id) => set((s) => ({ concorrentes: s.concorrentes.filter((x) => x.id !== id) })),

  updateProLabore: (patch) => set((s) => ({ proLabore: { ...s.proLabore, ...patch } })),

  login: (identificador, senha) => {
    const id = identificador.trim().toLowerCase()
    const u = get().usuarios.find(
      (x) => (x.login.toLowerCase() === id || x.email.toLowerCase() === id) && x.senha === senha,
    )
    if (!u) return { ok: false, erro: 'Usuário ou senha inválidos' }
    if (u.status !== 'ativo') return { ok: false, erro: 'Usuário inativo — contate um administrador' }
    const sessao = sessaoDoUsuario(u)
    set({ autenticado: true, sessao })
    // marca último acesso
    set((s) => ({ usuarios: s.usuarios.map((x) => (x.id === u.id ? { ...x, ultimoAcesso: new Date().toISOString() } : x)) }))
    try { window.localStorage.setItem(AUTH_KEY, JSON.stringify(u.login)) } catch {}
    return { ok: true }
  },

  logout: () => {
    try { window.localStorage.removeItem(AUTH_KEY) } catch {}
    set({ autenticado: false, sessao: null })
  },

  pushToast: (t) => {
    const id = uid()
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }))
    setTimeout(() => get().removeToast(id), 3500)
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
