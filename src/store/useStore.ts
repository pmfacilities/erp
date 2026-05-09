import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
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

export function mapPerfil(p: Usuario['perfil']): PerfilSessao {
  if (p === 'Administrador') return 'socio_gestor'
  if (p === 'Cliente') return 'gerente'
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
  loading: boolean
  
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

  // Ações
  fetchData: () => Promise<void>
  seedDatabase: () => Promise<void>

  // clientes
  addCliente: (c: Omit<Cliente, 'id' | 'criadoEm'>) => Promise<void>
  updateCliente: (id: string, patch: Partial<Cliente>) => Promise<void>
  removeCliente: (id: string) => Promise<void>

  // contratos
  addContrato: (c: Omit<Contrato, 'id' | 'criadoEm'>) => Promise<void>
  updateContrato: (id: string, patch: Partial<Contrato>) => Promise<void>
  removeContrato: (id: string) => Promise<void>

  // funcionarios
  addFuncionario: (f: Omit<Funcionario, 'id'>) => Promise<void>
  updateFuncionario: (id: string, patch: Partial<Funcionario>) => Promise<void>
  removeFuncionario: (id: string) => Promise<void>

  // escalas
  addEscala: (e: Omit<EscalaTurno, 'id'>) => Promise<void>
  updateEscala: (id: string, patch: Partial<EscalaTurno>) => Promise<void>
  removeEscala: (id: string) => Promise<void>

  // ocorrencias
  addOcorrencia: (o: Omit<Ocorrencia, 'id' | 'criadaEm'>) => Promise<void>
  updateOcorrencia: (id: string, patch: Partial<Ocorrencia>) => Promise<void>

  // financeiro
  addLancamento: (l: Omit<LancamentoFinanceiro, 'id'>) => Promise<void>
  marcarPago: (id: string, pagamento: string) => Promise<void>

  // estoque
  addItemEstoque: (i: Omit<ItemEstoque, 'id'>) => Promise<void>
  movimentarEstoque: (mov: Omit<MovEstoque, 'id'>) => Promise<void>

  // servicos avulsos
  addServicoAvulso: (s: Omit<ServicoAvulso, 'id'>) => Promise<void>
  updateServicoAvulso: (id: string, patch: Partial<ServicoAvulso>) => Promise<void>
  removeServicoAvulso: (id: string) => Promise<void>

  // pagamentos avulsos
  addPagamentoAvulso: (p: Omit<PagamentoAvulso, 'id'>) => Promise<void>
  updatePagamentoAvulso: (id: string, patch: Partial<PagamentoAvulso>) => Promise<void>
  removePagamentoAvulso: (id: string) => Promise<void>

  // despesas
  addDespesa: (d: Omit<Despesa, 'id'>) => Promise<void>
  updateDespesa: (id: string, patch: Partial<Despesa>) => Promise<void>
  removeDespesa: (id: string) => Promise<void>

  // UI
  sidebarAberta: boolean
  toggleSidebar: (aberto?: boolean) => void

  // sessão / auth
  login: (identificador: string, senha: string) => Promise<{ ok: boolean; erro?: string }>
  logout: () => void

  // toasts
  pushToast: (t: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

export const useStore = create<State>((set, get) => ({
  autenticado: false,
  sessao: null,
  loading: true,
  
  clientes: [],
  contratos: [],
  funcionarios: [],
  escalas: [],
  ordens: [],
  ocorrencias: [],
  financeiro: [],
  estoque: [],
  movEstoque: [],
  usuarios: [],
  empresa: empresaInfo,
  toasts: [],

  despesas: [],
  servicosAvulsos: [],
  pagamentosAvulsos: [],
  prestadores: [],
  curriculos: [],
  concorrentes: [],
  proLabore: proLaboreDefault,
  sidebarAberta: false,

  fetchData: async () => {
    set({ loading: true })
    try {
      const [
        { data: cli }, { data: ctr }, { data: fun }, 
        { data: oco }, { data: fin }, { data: est },
        { data: usr }, { data: cfg }, { data: srv },
        { data: dsp }, { data: esc }
      ] = await Promise.all([
        supabase.from('clientes').select('*').order('criado_em', { ascending: false }),
        supabase.from('contratos').select('*, postos(*)'),
        supabase.from('funcionarios').select('*').order('nome', { ascending: true }),
        supabase.from('ocorrencias').select('*').order('criada_em', { ascending: false }),
        supabase.from('financeiro').select('*').order('vencimento', { ascending: true }),
        supabase.from('estoque').select('*').order('nome', { ascending: true }),
        supabase.from('usuarios').select('*'),
        supabase.from('configuracoes').select('*').single(),
        supabase.from('servicos_avulsos').select('*').order('data', { ascending: false }),
        supabase.from('despesas').select('*').order('data', { ascending: false }),
        supabase.from('escalas').select('*').order('data', { ascending: false }),
      ])

      set({
        clientes: (cli || []).map(c => ({
          id: c.id,
          razaoSocial: c.razao_social,
          nomeFantasia: c.nome_fantasia,
          cnpj: c.cnpj,
          email: c.email,
          telefone: c.telefone,
          cidade: c.cidade,
          uf: c.uf,
          status: c.status,
          contatoResponsavel: c.contato_responsavel,
          criadoEm: c.criado_em,
        })),
        contratos: (ctr || []).map(c => ({
          id: c.id,
          numero: c.numero,
          clienteId: c.cliente_id,
          titulo: c.titulo,
          servicos: c.servicos,
          vigenciaInicio: c.vigencia_inicio,
          vigenciaFim: c.vigencia_fim,
          valorMensal: Number(c.valor_mensal),
          custoMensal: Number(c.custo_mensal),
          indiceReajuste: c.indice_reajuste,
          proximoReajuste: c.proximo_reajuste,
          status: c.status,
          criadoEm: c.criado_em,
          postos: c.postos || [],
        })),
        funcionarios: (fun || []).map(f => ({
          id: f.id,
          nome: f.nome,
          cpf: f.cpf,
          cargo: f.cargo,
          contratoId: f.contrato_id,
          postoNome: f.posto_nome,
          turno: f.turno,
          salario: Number(f.salario),
          admissao: f.admissao,
          status: f.status,
          telefone: f.telefone,
          asoValidade: f.aso_validade,
          pix: f.pix,
        })),
        escalas: (esc || []).map(e => ({
          id: e.id,
          data: e.data,
          funcionarioId: e.funcionario_id,
          postoNome: e.posto_nome,
          contratoId: e.contrato_id,
          servicoAvulsoId: e.servico_avulso_id,
          inicio: e.inicio,
          fim: e.fim,
          status: e.status,
        })),
        ocorrencias: (oco || []).map(o => ({
          id: o.id,
          contratoId: o.contrato_id,
          postoNome: o.posto_nome,
          titulo: o.titulo,
          descricao: o.descricao,
          criticidade: o.criticidade,
          status: o.status,
          reportadaPor: o.reportada_por,
          foto: o.foto,
          criadaEm: o.criada_em,
          resolvidaEm: o.resolvida_em,
        })),
        financeiro: (fin || []).map(f => ({
          id: f.id,
          tipo: f.tipo,
          descricao: f.descricao,
          contratoId: f.contrato_id,
          fornecedorCliente: f.fornecedor_cliente,
          valor: Number(f.valor),
          vencimento: f.vencimento,
          pagamento: f.pagamento,
          status: f.status,
          centroCusto: f.centro_custo,
        })),
        estoque: (est || []).map(i => ({
          id: i.id,
          sku: i.sku,
          nome: i.nome,
          categoria: i.categoria,
          unidade: i.unidade,
          quantidade: Number(i.quantidade),
          estoqueMinimo: Number(i.estoque_minimo),
          custoUnitario: Number(i.custo_unitario),
          local: i.local,
          ultimaMovimentacao: i.ultima_movimentacao,
        })),
        usuarios: (usr || []).map(u => ({
          id: u.id,
          nome: u.nome,
          login: u.login,
          email: u.email,
          senha: u.senha,
          perfil: u.perfil,
          status: u.status,
          avatarIniciais: u.avatar_iniciais,
          ultimoAcesso: u.ultimo_acesso,
        })),
        empresa: cfg ? {
          razaoSocial: cfg.razao_social,
          nomeFantasia: cfg.nome_fantasia,
          cnpj: cfg.cnpj,
          endereco: cfg.endereco,
          cidade: cfg.cidade,
          uf: cfg.uf,
          telefone: cfg.telefone,
          emailComercial: cfg.email_comercial,
          site: cfg.site,
          socios: cfg.socios || [],
        } : empresaInfo,
        proLabore: cfg?.pro_labore || proLaboreDefault,
        servicosAvulsos: (srv || []).map(s => ({
          id: s.id,
          numero: s.numero,
          data: s.data,
          cliente: s.cliente,
          tipo: s.tipo,
          descricao: s.descricao,
          endereco: s.endereco,
          valorBruto: Number(s.valor_bruto),
          custoMaoDeObra: Number(s.custo_mao_de_obra),
          custoMaterial: Number(s.custo_material),
          status: s.status,
          responsavel: s.responsavel,
          observacao: s.observacao,
        })),
        despesas: (dsp || []).map(d => ({
          id: d.id,
          data: d.data,
          descricao: d.descricao,
          categoria: d.categoria,
          valor: Number(d.valor),
          quemComprou: d.quem_comprou,
          reembolsado: d.reembolsado,
        }))
      })

      // Se não houver usuários, semeia o banco
      if (!usr || usr.length === 0) {
        await get().seedDatabase()
      } else {
        // Restaura sessão se o login salvo for válido
        const saved = typeof window !== 'undefined' ? window.localStorage.getItem(AUTH_KEY) : null
        if (saved) {
          const loginStr = JSON.parse(saved)
          const u = (usr || []).find(x => x.login === loginStr && x.status === 'ativo')
          if (u) {
            set({ autenticado: true, sessao: sessaoDoUsuario({
              id: u.id, nome: u.nome, login: u.login, email: u.email, senha: u.senha, perfil: u.perfil, status: u.status
            })})
          }
        }
      }

      // Garante que o cliente Hera existe se houver serviços dele
      const { clientes } = get()
      if (clientes.length > 0 && !clientes.some(c => c.nomeFantasia.includes('Hera'))) {
        await get().addCliente({
          razaoSocial: 'CONSTRUTORA HERA LTDA',
          nomeFantasia: 'Construtora Hera',
          cnpj: '20.959.916/0003-42',
          email: 'contato@hera.com.br',
          telefone: '-',
          cidade: 'São Paulo',
          uf: 'SP',
          status: 'ativo',
          contatoResponsavel: 'Nathan'
        })
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      set({ loading: false })
    }
  },

  seedDatabase: async () => {
    console.log('Seeding database...')
    // Usuários
    await supabase.from('usuarios').insert(usuariosMock.map(u => ({
      nome: u.nome,
      login: u.login,
      email: u.email,
      senha: u.senha,
      perfil: u.perfil,
      status: u.status,
      avatar_iniciais: u.avatarIniciais
    })))

    // Clientes
    if (clientesMock.length > 0) {
      const { data: newCli } = await supabase.from('clientes').insert(clientesMock.map(c => ({
        razao_social: c.razaoSocial,
        nome_fantasia: c.nomeFantasia,
        cnpj: c.cnpj,
        email: c.email,
        telefone: c.telefone,
        cidade: c.cidade,
        uf: c.uf,
        status: c.status,
        contato_responsavel: c.contatoResponsavel
      }))).select()
      
      // Se houver contratos mock...
      // (Neste caso, limpamos os contratos antes, então clientesMock só tem a Hera)
    }

    // Serviços Avulsos
    if (servicosAvulsosSeed.length > 0) {
      await supabase.from('servicos_avulsos').insert(servicosAvulsosSeed.map(s => ({
        numero: s.numero,
        data: s.data,
        cliente: s.cliente,
        tipo: s.tipo,
        descricao: s.descricao,
        endereco: s.endereco,
        valor_bruto: s.valorBruto,
        custo_mao_de_obra: s.custoMaoDeObra,
        custo_material: s.custoMaterial,
        status: s.status,
        responsavel: s.responsavel
      })))
    }

    // Financeiro
    if (financeiroMock.length > 0) {
      await supabase.from('financeiro').insert(financeiroMock.map(f => ({
        tipo: f.tipo,
        descricao: f.descricao,
        fornecedor_cliente: f.fornecedorCliente,
        valor: f.valor,
        vencimento: f.vencimento,
        pagamento: f.pagamento,
        status: f.status,
        centro_custo: f.centroCusto
      })))
    }

    // Recarrega
    await get().fetchData()
  },

  toggleSidebar: (aberto) => set((s) => ({ sidebarAberta: aberto !== undefined ? aberto : !s.sidebarAberta })),

  addCliente: async (c) => {
    const { error } = await supabase.from('clientes').insert({
      razao_social: c.razaoSocial,
      nome_fantasia: c.nomeFantasia,
      cnpj: c.cnpj,
      email: c.email,
      telefone: c.telefone,
      cidade: c.cidade,
      uf: c.uf,
      status: c.status,
      contato_responsavel: c.contatoResponsavel
    })
    if (!error) await get().fetchData()
  },
  updateCliente: async (id, patch) => {
    const p: any = {}
    if (patch.razaoSocial !== undefined) p.razao_social = patch.razaoSocial
    if (patch.nomeFantasia !== undefined) p.nome_fantasia = patch.nomeFantasia
    if (patch.cnpj !== undefined) p.cnpj = patch.cnpj
    if (patch.email !== undefined) p.email = patch.email
    if (patch.telefone !== undefined) p.telefone = patch.telefone
    if (patch.cidade !== undefined) p.cidade = patch.cidade
    if (patch.uf !== undefined) p.uf = patch.uf
    if (patch.status !== undefined) p.status = patch.status
    if (patch.contatoResponsavel !== undefined) p.contato_responsavel = patch.contatoResponsavel
    const { error } = await supabase.from('clientes').update(p).eq('id', id)
    if (!error) await get().fetchData()
  },
  removeCliente: async (id) => {
    const { error } = await supabase.from('clientes').delete().eq('id', id)
    if (!error) await get().fetchData()
  },

  addContrato: async (c) => {
    const { data: newCtr, error } = await supabase.from('contratos').insert({
      numero: c.numero,
      cliente_id: c.clienteId,
      titulo: c.titulo,
      servicos: c.servicos,
      vigencia_inicio: c.vigenciaInicio,
      vigencia_fim: c.vigenciaFim,
      valor_mensal: c.valorMensal,
      custo_mensal: c.custoMensal,
      status: c.status
    }).select().single()
    
    if (!error && newCtr && c.postos) {
      await supabase.from('postos').insert(c.postos.map(p => ({ ...p, contrato_id: newCtr.id })))
    }
    await get().fetchData()
  },
  updateContrato: async (id, patch) => {
    const { error } = await supabase.from('contratos').update({ status: patch.status }).eq('id', id)
    if (!error) await get().fetchData()
  },
  removeContrato: async (id) => {
    await supabase.from('contratos').delete().eq('id', id)
    await get().fetchData()
  },

  addFuncionario: async (f) => {
    const { error } = await supabase.from('funcionarios').insert({
      nome: f.nome,
      cpf: f.cpf,
      cargo: f.cargo,
      contrato_id: f.contratoId,
      posto_nome: f.postoNome,
      turno: f.turno,
      salario: f.salario,
      admissao: f.admissao,
      status: f.status,
      telefone: f.telefone,
      aso_validade: f.asoValidade,
      pix: f.pix,
    })
    if (!error) get().fetchData()
  },
  updateFuncionario: async (id, patch) => {
    const { error } = await supabase.from('funcionarios').update({
      nome: patch.nome,
      cpf: patch.cpf,
      cargo: patch.cargo,
      contrato_id: patch.contratoId,
      posto_nome: patch.postoNome,
      turno: patch.turno,
      salario: patch.salario,
      admissao: patch.admissao,
      status: patch.status,
      telefone: patch.telefone,
      aso_validade: patch.asoValidade,
      pix: patch.pix,
    }).eq('id', id)
    if (!error) get().fetchData()
  },
  removeFuncionario: async (id) => {
    const { error } = await supabase.from('funcionarios').delete().eq('id', id)
    if (!error) get().fetchData()
  },

  addEscala: async (e) => {
    const { error } = await supabase.from('escalas').insert({
      data: e.data,
      funcionario_id: e.funcionarioId,
      posto_nome: e.postoNome,
      contrato_id: e.contratoId,
      servico_avulso_id: e.servicoAvulsoId,
      inicio: e.inicio,
      fim: e.fim,
      status: e.status,
    })
    if (!error) get().fetchData()
  },
  updateEscala: async (id, patch) => {
    const { error } = await supabase.from('escalas').update({
      status: patch.status,
      inicio: patch.inicio,
      fim: patch.fim,
      posto_nome: patch.postoNome,
    }).eq('id', id)
    if (!error) get().fetchData()
  },
  removeEscala: async (id) => {
    const { error } = await supabase.from('escalas').delete().eq('id', id)
    if (!error) get().fetchData()
  },

  addOcorrencia: async (o) => {
    await supabase.from('ocorrencias').insert({
      contrato_id: o.contratoId,
      posto_nome: o.postoNome,
      titulo: o.titulo,
      descricao: o.descricao,
      criticidade: o.criticidade,
      status: o.status,
      reportada_por: o.reportadaPor,
      foto: o.foto
    })
    await get().fetchData()
  },
  updateOcorrencia: async (id, patch) => {
    await supabase.from('ocorrencias').update({ status: patch.status, resolvida_em: patch.resolvidaEm }).eq('id', id)
    await get().fetchData()
  },

  addLancamento: async (l) => {
    await supabase.from('financeiro').insert({
      tipo: l.tipo,
      descricao: l.descricao,
      contrato_id: l.contratoId,
      fornecedor_cliente: l.fornecedorCliente,
      valor: l.valor,
      vencimento: l.vencimento,
      status: l.status,
      centro_custo: l.centroCusto
    })
    await get().fetchData()
  },
  marcarPago: async (id, pagamento) => {
    await supabase.from('financeiro').update({ status: 'pago', pagamento }).eq('id', id)
    await get().fetchData()
  },

  addItemEstoque: async (i) => {
    await supabase.from('estoque').insert({
      sku: i.sku,
      nome: i.nome,
      categoria: i.categoria,
      unidade: i.unidade,
      quantidade: i.quantidade,
      estoque_minimo: i.estoqueMinimo,
      custo_unitario: i.custoUnitario,
      local: i.local
    })
    await get().fetchData()
  },
  movimentarEstoque: async (mov) => {
    const { data: item } = await supabase.from('estoque').select('quantidade').eq('id', mov.itemId).single()
    if (!item) return
    const novaQtd = mov.tipo === 'entrada' ? item.quantidade + mov.quantidade : item.quantidade - mov.quantidade
    await supabase.from('estoque').update({ quantidade: Math.max(0, novaQtd), ultima_movimentacao: mov.data }).eq('id', mov.itemId)
    await supabase.from('movimentacoes_estoque').insert({
      item_id: mov.itemId,
      tipo: mov.tipo,
      quantidade: mov.quantidade,
      contrato_id: mov.contratoId,
      responsavel: mov.responsavel,
      data: mov.data,
      observacao: mov.observacao
    })
    await get().fetchData()
  },

  addServicoAvulso: async (sv) => {
    await supabase.from('servicos_avulsos').insert({
      numero: sv.numero,
      data: sv.data,
      cliente: sv.cliente,
      tipo: sv.tipo,
      descricao: sv.descricao,
      endereco: sv.endereco,
      valor_bruto: sv.valorBruto,
      custo_mao_de_obra: sv.custoMaoDeObra,
      custo_material: sv.custoMaterial,
      status: sv.status,
      responsavel: sv.responsavel,
      observacao: sv.observacao
    })
    await get().fetchData()
  },
  updateServicoAvulso: async (id, patch) => {
    const update: any = {}
    if (patch.numero !== undefined) update.numero = patch.numero
    if (patch.data !== undefined) update.data = patch.data
    if (patch.cliente !== undefined) update.cliente = patch.cliente
    if (patch.tipo !== undefined) update.tipo = patch.tipo
    if (patch.descricao !== undefined) update.descricao = patch.descricao
    if (patch.endereco !== undefined) update.endereco = patch.endereco
    if (patch.valorBruto !== undefined) update.valor_bruto = patch.valorBruto
    if (patch.custoMaoDeObra !== undefined) update.custo_mao_de_obra = patch.custoMaoDeObra
    if (patch.custoMaterial !== undefined) update.custo_material = patch.custoMaterial
    if (patch.status !== undefined) update.status = patch.status
    if (patch.responsavel !== undefined) update.responsavel = patch.responsavel
    if (patch.observacao !== undefined) update.observacao = patch.observacao
    await supabase.from('servicos_avulsos').update(update).eq('id', id)
    await get().fetchData()
  },
  removeServicoAvulso: async (id) => {
    // Deletar escalas vinculadas primeiro (FK constraint)
    await supabase.from('escalas').delete().eq('servico_avulso_id', id)
    const { error } = await supabase.from('servicos_avulsos').delete().eq('id', id)
    if (error) {
      console.error('Erro ao remover serviço:', error)
      get().pushToast({ titulo: 'Erro ao remover', descricao: error.message, tipo: 'error' })
    }
    await get().fetchData()
  },

  // Pagamentos avulsos (in-memory, persisted via Supabase pagamentos_avulsos table if available)
  addPagamentoAvulso: async (p) => {
    const id = uid()
    set((s) => ({ pagamentosAvulsos: [...s.pagamentosAvulsos, { ...p, id } as PagamentoAvulso] }))
  },
  updatePagamentoAvulso: async (id, patch) => {
    set((s) => ({
      pagamentosAvulsos: s.pagamentosAvulsos.map((p) =>
        p.id === id ? { ...p, ...patch } : p
      ),
    }))
  },
  removePagamentoAvulso: async (id) => {
    set((s) => ({
      pagamentosAvulsos: s.pagamentosAvulsos.filter((p) => p.id !== id),
    }))
  },

  addDespesa: async (d) => {
    await supabase.from('despesas').insert({
      data: d.data,
      descricao: d.descricao,
      categoria: d.categoria,
      valor: d.valor,
      quem_comprou: d.quemComprou,
      reembolsado: d.reembolsado
    })
    await get().fetchData()
  },
  updateDespesa: async (id, patch) => {
    const update: any = {}
    if (patch.data !== undefined) update.data = patch.data
    if (patch.descricao !== undefined) update.descricao = patch.descricao
    if (patch.categoria !== undefined) update.categoria = patch.categoria
    if (patch.valor !== undefined) update.valor = patch.valor
    if (patch.quemComprou !== undefined) update.quem_comprou = patch.quemComprou
    if (patch.reembolsado !== undefined) update.reembolsado = patch.reembolsado
    await supabase.from('despesas').update(update).eq('id', id)
    await get().fetchData()
  },
  removeDespesa: async (id) => {
    await supabase.from('despesas').delete().eq('id', id)
    await get().fetchData()
  },

  login: async (identificador, senha) => {
    const id = identificador.trim().toLowerCase()
    const { data: users } = await supabase.from('usuarios').select('*')
    const u = (users || []).find(
      (x) => (x.login.toLowerCase() === id || x.email.toLowerCase() === id) && x.senha === senha,
    )
    if (!u) return { ok: false, erro: 'Usuário ou senha inválidos' }
    if (u.status !== 'ativo') return { ok: false, erro: 'Usuário inativo — contate um administrador' }
    
    const sessao = sessaoDoUsuario({
      id: u.id, nome: u.nome, login: u.login, email: u.email, senha: u.senha, perfil: u.perfil, status: u.status
    })
    set({ autenticado: true, sessao })
    
    await supabase.from('usuarios').update({ ultimo_acesso: new Date().toISOString() }).eq('id', u.id)
    try { window.localStorage.setItem(AUTH_KEY, JSON.stringify(u.login)) } catch {}
    return { ok: true }
  },

  logout: () => {
    try { window.localStorage.removeItem(AUTH_KEY) } catch {}
    set({ autenticado: false, sessao: null })
  },

  pushToast: (t) => {
    const id = Math.random().toString(36).slice(2, 9)
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }))
    setTimeout(() => get().removeToast(id), 3500)
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
