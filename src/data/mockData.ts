// ==============================================
// Mock data — PS Facilities Manager
// ==============================================

export type ID = string

// ---------- Tipos ----------
export interface Cliente {
  id: ID
  razaoSocial: string
  nomeFantasia: string
  cnpj: string
  email: string
  telefone: string
  cidade: string
  uf: string
  status: 'ativo' | 'inativo'
  contatoResponsavel: string
  criadoEm: string
}

export interface Contrato {
  id: ID
  numero: string
  clienteId: ID
  titulo: string
  servicos: string[] // limpeza, portaria, manutencao, seguranca, jardinagem
  vigenciaInicio: string
  vigenciaFim: string
  valorMensal: number
  custoMensal: number
  indiceReajuste: 'IPCA' | 'IGPM' | 'INPC' | 'CCT'
  proximoReajuste: string
  postos: { nome: string; endereco: string; funcao: string; efetivos: number }[]
  status: 'ativo' | 'suspenso' | 'encerrado' | 'rascunho'
  criadoEm: string
}

export type TurnoFuncionario = 'manha' | 'tarde' | 'noite' | '12x36' | 'diaria' | 'integral' | 'horista' | 'meio_expediente'
export type StatusFuncionario = 'ativo' | 'ferias' | 'afastado' | 'desligado' | 'avulso'

export const TURNOS_OPCOES: { value: TurnoFuncionario; label: string }[] = [
  { value: 'manha', label: 'Manhã' },
  { value: 'tarde', label: 'Tarde' },
  { value: 'noite', label: 'Noite' },
  { value: '12x36', label: '12×36' },
  { value: 'diaria', label: 'Diária' },
  { value: 'integral', label: 'Integral' },
  { value: 'horista', label: 'Horista' },
  { value: 'meio_expediente', label: 'Meio expediente' },
]

export const STATUS_OPCOES: { value: StatusFuncionario; label: string }[] = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'avulso', label: 'Avulso' },
  { value: 'ferias', label: 'Férias' },
  { value: 'afastado', label: 'Afastado' },
  { value: 'desligado', label: 'Desligado' },
]

export interface Funcionario {
  id: ID
  nome: string
  cpf: string
  cargo: string
  contratoId?: ID
  postoNome?: string
  turno: TurnoFuncionario
  salario: number
  admissao: string
  status: StatusFuncionario
  telefone: string
  asoValidade: string
}

export interface EscalaTurno {
  id: ID
  data: string // YYYY-MM-DD
  funcionarioId: ID
  postoNome: string
  contratoId: ID
  inicio: string // HH:mm
  fim: string // HH:mm
  status: 'agendado' | 'presente' | 'falta' | 'coberto'
}

export interface OrdemServico {
  id: ID
  contratoId: ID
  tipo: string
  descricao: string
  responsavel: string
  inicio: string
  fim?: string
  status: 'pendente' | 'em_execucao' | 'concluido' | 'atrasado'
  checklist: { item: string; feito: boolean }[]
  progresso: number
}

export interface Ocorrencia {
  id: ID
  contratoId: ID
  postoNome: string
  titulo: string
  descricao: string
  criticidade: 'baixa' | 'media' | 'alta' | 'critica'
  status: 'aberta' | 'em_andamento' | 'resolvida'
  reportadaPor: string
  criadaEm: string
  resolvidaEm?: string
  foto?: string
}

export interface LancamentoFinanceiro {
  id: ID
  tipo: 'receber' | 'pagar' | 'pagamento_colaborador'
  descricao: string
  contratoId?: ID
  fornecedorCliente: string
  valor: number
  vencimento: string
  pagamento?: string
  status: 'aberto' | 'pago' | 'atrasado'
  centroCusto: string
}

export interface ItemEstoque {
  id: ID
  sku: string
  nome: string
  categoria: string
  unidade: string
  quantidade: number
  estoqueMinimo: number
  custoUnitario: number
  local: string
  ultimaMovimentacao: string
}

export interface MovEstoque {
  id: ID
  itemId: ID
  tipo: 'entrada' | 'saida'
  quantidade: number
  contratoId?: ID
  responsavel: string
  data: string
  observacao?: string
}

export interface Usuario {
  id: ID
  nome: string
  email: string
  login: string
  senha: string
  perfil: 'Administrador' | 'Financeiro' | 'Operacional' | 'RH' | 'Cliente'
  status: 'ativo' | 'inativo'
  ultimoAcesso: string
  avatarIniciais?: string
}

// ---------- Seeds ----------
export const empresaInfo = {
  razaoSocial: 'PS Facilities Ltda.',
  nomeFantasia: 'PS Facilities',
  cnpj: '42.118.903/0001-55',
  inscricaoEstadual: 'Isento',
  endereco: 'Av. Alberto Braune, 1423 — Centro, Nova Friburgo/RJ',
  email: 'contato@psfacilities.com.br',
  telefone: '+55 22 98813-5768',
  socios: [
    { nome: 'Jonathan da Silva', telefone: '+55 22 98813-5768' },
    { nome: 'David Souza', telefone: '+55 22 99237-1169' },
    { nome: 'Marcio Kerol', telefone: '+55 22 99823-9661' },
    { nome: 'Junior Alamar', telefone: '+55 22 98168-3856' },
  ],
}

export const clientesMock: Cliente[] = [
  { 
    id: 'cli-hera', 
    razaoSocial: 'CONSTRUTORA HERA LTDA', 
    nomeFantasia: 'Construtora Hera', 
    cnpj: '20.959.916/0003-42', 
    email: '-', 
    telefone: '-', 
    cidade: 'São Paulo', 
    uf: 'SP', 
    status: 'ativo', 
    contatoResponsavel: 'Nathan', 
    criadoEm: '2026-04-24' 
  },
]

export const contratosMock: Contrato[] = []

export const funcionariosMock: Funcionario[] = [
  { id: 'fun-nat', nome: 'Natasha Neto de Souza', cpf: '000.000.000-00', cargo: 'Auxiliar de Limpeza', status: 'avulso', turno: 'diaria', salario: 0, admissao: '2026-04-23', telefone: '', asoValidade: '2027-04-23' },
  { id: 'fun-ger', nome: 'Gerson Net', cpf: '000.000.000-00', cargo: 'Ajudante Geral', status: 'avulso', turno: 'diaria', salario: 0, admissao: '2026-04-23', telefone: '', asoValidade: '2027-04-23' },
  { id: 'fun-luc', nome: 'Lucas', cpf: '000.000.000-00', cargo: 'Ajudante Geral', status: 'avulso', turno: 'diaria', salario: 0, admissao: '2026-04-20', telefone: '', asoValidade: '2027-04-20' },
  { id: 'fun-ale', nome: 'Alessandra', cpf: '000.000.000-00', cargo: 'Auxiliar de Limpeza', status: 'avulso', turno: 'diaria', salario: 0, admissao: '2026-04-20', telefone: '', asoValidade: '2027-04-20' },
]

// ---------- Escala semanal (seed para próximos 7 dias a partir da data base) ----------
const hoje = new Date('2026-04-20') // segunda
function dPlus(n: number) {
  const d = new Date(hoje); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10)
}

export const escalaMock: EscalaTurno[] = [
  // Data: 20/04 - Alessandra e Lucas (08h às 17h00)
  { id: 'esc-hera-20-1', data: '2026-04-20', funcionarioId: 'fun-ale', postoNome: 'Obra Hera', contratoId: '', servicoAvulsoId: 'sa-hera-01', inicio: '08:00', fim: '17:00', status: 'presente' },
  { id: 'esc-hera-20-2', data: '2026-04-20', funcionarioId: 'fun-luc', postoNome: 'Obra Hera', contratoId: '', servicoAvulsoId: 'sa-hera-01', inicio: '08:00', fim: '17:00', status: 'presente' },
  
  // Data: 21/04 - Alessandra e Lucas (08h às 19h)
  { id: 'esc-hera-21-1', data: '2026-04-21', funcionarioId: 'fun-ale', postoNome: 'Obra Hera', contratoId: '', servicoAvulsoId: 'sa-hera-01', inicio: '08:00', fim: '19:00', status: 'presente' },
  { id: 'esc-hera-21-2', data: '2026-04-21', funcionarioId: 'fun-luc', postoNome: 'Obra Hera', contratoId: '', servicoAvulsoId: 'sa-hera-01', inicio: '08:00', fim: '19:00', status: 'presente' },

  // Data: 22/04 - Lucas e Alessandra (08h às 19h00)
  { id: 'esc-hera-22-1', data: '2026-04-22', funcionarioId: 'fun-luc', postoNome: 'Obra Hera', contratoId: '', servicoAvulsoId: 'sa-hera-01', inicio: '08:00', fim: '19:00', status: 'presente' },
  { id: 'esc-hera-22-2', data: '2026-04-22', funcionarioId: 'fun-ale', postoNome: 'Obra Hera', contratoId: '', servicoAvulsoId: 'sa-hera-01', inicio: '08:00', fim: '19:00', status: 'presente' },

  // Data: 23/04 - Natasha, Gerson, Lucas e Alessandra (08h às 11h)
  { id: 'esc-hera-23-1', data: '2026-04-23', funcionarioId: 'fun-nat', postoNome: 'Obra Hera', contratoId: '', servicoAvulsoId: 'sa-hera-01', inicio: '08:00', fim: '11:00', status: 'presente' },
  { id: 'esc-hera-23-2', data: '2026-04-23', funcionarioId: 'fun-ger', postoNome: 'Obra Hera', contratoId: '', servicoAvulsoId: 'sa-hera-01', inicio: '08:00', fim: '11:00', status: 'presente' },
  { id: 'esc-hera-23-3', data: '2026-04-23', funcionarioId: 'fun-luc', postoNome: 'Obra Hera', contratoId: '', servicoAvulsoId: 'sa-hera-01', inicio: '08:00', fim: '11:00', status: 'presente' },
  { id: 'esc-hera-23-4', data: '2026-04-23', funcionarioId: 'fun-ale', postoNome: 'Obra Hera', contratoId: '', servicoAvulsoId: 'sa-hera-01', inicio: '08:00', fim: '11:00', status: 'presente' },
]

export const ordensMock: OrdemServico[] = [
  {
    id: 'os-01', contratoId: 'ctr-001', tipo: 'Limpeza geral', descricao: 'Higienização completa do Piso L1',
    responsavel: 'Maria das Graças Silva', inicio: '2026-04-23T06:00:00', status: 'em_execucao', progresso: 65,
    checklist: [
      { item: 'Varrição geral', feito: true },
      { item: 'Lavagem de banheiros', feito: true },
      { item: 'Limpeza de vitrines', feito: true },
      { item: 'Coleta de lixo', feito: false },
      { item: 'Relatório fotográfico', feito: false },
    ],
  },
  {
    id: 'os-02', contratoId: 'ctr-002', tipo: 'Higienização UTI', descricao: 'Sanitização completa — UTI 3º andar',
    responsavel: 'Ana Paula Rodrigues', inicio: '2026-04-23T06:00:00', status: 'em_execucao', progresso: 40,
    checklist: [
      { item: 'EPIs verificados', feito: true },
      { item: 'Desinfecção de leitos', feito: true },
      { item: 'Limpeza de piso hospitalar', feito: false },
      { item: 'Coleta de resíduos infectantes', feito: false },
    ],
  },
  {
    id: 'os-03', contratoId: 'ctr-003', tipo: 'Ronda', descricao: 'Ronda perimetral 07h-19h',
    responsavel: 'Pedro Henrique Souza', inicio: '2026-04-23T07:00:00', status: 'pendente', progresso: 0,
    checklist: [
      { item: 'Check-in portaria', feito: false },
      { item: 'Ronda setor A', feito: false },
      { item: 'Ronda setor B', feito: false },
      { item: 'Check-out portaria', feito: false },
    ],
  },
  {
    id: 'os-04', contratoId: 'ctr-004', tipo: 'Zeladoria', descricao: 'Conservação áreas comuns Ed. Central',
    responsavel: 'Rafael Campos Pereira', inicio: '2026-04-23T07:00:00', status: 'concluido', progresso: 100,
    checklist: [
      { item: 'Limpeza hall', feito: true },
      { item: 'Poda de jardim', feito: true },
      { item: 'Verificação lâmpadas', feito: true },
    ],
  },
  {
    id: 'os-05', contratoId: 'ctr-006', tipo: 'Limpeza Campus', descricao: 'Bloco A — salas 101 a 115',
    responsavel: 'Sandra Ribeiro Pinto', inicio: '2026-04-23T06:00:00', status: 'atrasado', progresso: 20,
    checklist: [
      { item: 'Salas 101-105', feito: true },
      { item: 'Salas 106-110', feito: false },
      { item: 'Salas 111-115', feito: false },
      { item: 'Corredores', feito: false },
    ],
  },
]

export const ocorrenciasMock: Ocorrencia[] = [
  { id: 'oco-01', contratoId: 'ctr-001', postoNome: 'Piso L2', titulo: 'Vazamento no banheiro feminino', descricao: 'Encanamento rompido, água acumulando. Acionada manutenção.', criticidade: 'alta', status: 'em_andamento', reportadaPor: 'Regina Lima Costa', criadaEm: '2026-04-22T14:22:00' },
  { id: 'oco-02', contratoId: 'ctr-002', postoNome: 'UTI', titulo: 'Falta de material de limpeza', descricao: 'Estoque de álcool gel 70% acabou.', criticidade: 'critica', status: 'aberta', reportadaPor: 'Ana Paula Rodrigues', criadaEm: '2026-04-23T07:12:00' },
  { id: 'oco-03', contratoId: 'ctr-003', postoNome: 'Portaria 1', titulo: 'Tentativa de invasão', descricao: 'Indivíduo não identificado tentou entrar. PM acionada.', criticidade: 'critica', status: 'resolvida', reportadaPor: 'Pedro Henrique Souza', criadaEm: '2026-04-20T02:15:00', resolvidaEm: '2026-04-20T03:30:00' },
  { id: 'oco-04', contratoId: 'ctr-004', postoNome: 'Zelador', titulo: 'Lâmpada queimada no hall', descricao: 'Lâmpada do hall principal precisa ser trocada.', criticidade: 'baixa', status: 'aberta', reportadaPor: 'Rafael Campos Pereira', criadaEm: '2026-04-22T09:45:00' },
  { id: 'oco-05', contratoId: 'ctr-006', postoNome: 'Campus Sede', titulo: 'Reclamação de professor', descricao: 'Sala 205 não foi limpa conforme cronograma.', criticidade: 'media', status: 'em_andamento', reportadaPor: 'Sandra Ribeiro Pinto', criadaEm: '2026-04-22T16:00:00' },
  { id: 'oco-06', contratoId: 'ctr-001', postoNome: 'Portaria Principal', titulo: 'Câmera com defeito', descricao: 'Câmera 07 da entrada leste apresenta distorção.', criticidade: 'media', status: 'aberta', reportadaPor: 'João Batista Oliveira', criadaEm: '2026-04-21T11:30:00' },
  { id: 'oco-07', contratoId: 'ctr-005', postoNome: 'Prefeitura', titulo: 'Falta de EPI', descricao: 'Luvas e botas necessitam reposição urgente.', criticidade: 'alta', status: 'em_andamento', reportadaPor: 'Luciana Ferreira Dias', criadaEm: '2026-04-22T10:10:00' },
]

export const financeiroMock: LancamentoFinanceiro[] = [
  { 
    id: 'fin-hera-01', 
    tipo: 'receber', 
    descricao: 'NFS-e 4 — Limpeza final de obra + Diária de Ajudante', 
    fornecedorCliente: 'CONSTRUTORA HERA LTDA', 
    valor: 2630.00, 
    vencimento: '2026-04-27', 
    pagamento: '2026-04-27', 
    status: 'pago', 
    centroCusto: 'Comercial' 
  },
]

export const estoqueMock: ItemEstoque[] = [
  { id: 'est-01', sku: 'LIM-001', nome: 'Detergente neutro 5L', categoria: 'Química', unidade: 'Galão', quantidade: 48, estoqueMinimo: 30, custoUnitario: 32.5, local: 'Almox. Central', ultimaMovimentacao: '2026-04-18' },
  { id: 'est-02', sku: 'LIM-002', nome: 'Desinfetante hospitalar 5L', categoria: 'Química', unidade: 'Galão', quantidade: 12, estoqueMinimo: 20, custoUnitario: 78.0, local: 'Almox. Central', ultimaMovimentacao: '2026-04-20' },
  { id: 'est-03', sku: 'LIM-003', nome: 'Álcool 70% 5L', categoria: 'Química', unidade: 'Galão', quantidade: 8, estoqueMinimo: 25, custoUnitario: 45.0, local: 'Almox. Central', ultimaMovimentacao: '2026-04-22' },
  { id: 'est-04', sku: 'PAP-001', nome: 'Papel toalha interfolha', categoria: 'Papelaria', unidade: 'Pacote', quantidade: 120, estoqueMinimo: 60, custoUnitario: 18.9, local: 'Almox. Central', ultimaMovimentacao: '2026-04-15' },
  { id: 'est-05', sku: 'PAP-002', nome: 'Papel higiênico rolão 300m', categoria: 'Papelaria', unidade: 'Fardo', quantidade: 84, estoqueMinimo: 40, custoUnitario: 72.0, local: 'Almox. Central', ultimaMovimentacao: '2026-04-10' },
  { id: 'est-06', sku: 'EPI-001', nome: 'Luva nitrílica (par)', categoria: 'EPI', unidade: 'Par', quantidade: 220, estoqueMinimo: 100, custoUnitario: 4.2, local: 'Almox. Central', ultimaMovimentacao: '2026-04-18' },
  { id: 'est-07', sku: 'EPI-002', nome: 'Bota PVC cano longo', categoria: 'EPI', unidade: 'Par', quantidade: 18, estoqueMinimo: 30, custoUnitario: 54.0, local: 'Almox. Central', ultimaMovimentacao: '2026-04-05' },
  { id: 'est-08', sku: 'EPI-003', nome: 'Máscara PFF2', categoria: 'EPI', unidade: 'Unidade', quantidade: 400, estoqueMinimo: 200, custoUnitario: 2.8, local: 'Almox. Central', ultimaMovimentacao: '2026-04-12' },
  { id: 'est-09', sku: 'UNI-001', nome: 'Uniforme calça tam. M', categoria: 'Uniforme', unidade: 'Unidade', quantidade: 35, estoqueMinimo: 40, custoUnitario: 68.0, local: 'Almox. Central', ultimaMovimentacao: '2026-03-30' },
  { id: 'est-10', sku: 'UNI-002', nome: 'Camisa polo azul tam. M', categoria: 'Uniforme', unidade: 'Unidade', quantidade: 62, estoqueMinimo: 40, custoUnitario: 42.0, local: 'Almox. Central', ultimaMovimentacao: '2026-04-02' },
  { id: 'est-11', sku: 'FER-001', nome: 'Vassoura nylon 30cm', categoria: 'Ferramenta', unidade: 'Unidade', quantidade: 45, estoqueMinimo: 20, custoUnitario: 12.5, local: 'Almox. Central', ultimaMovimentacao: '2026-04-08' },
  { id: 'est-12', sku: 'FER-002', nome: 'Mop úmido profissional', categoria: 'Ferramenta', unidade: 'Unidade', quantidade: 24, estoqueMinimo: 15, custoUnitario: 38.0, local: 'Almox. Central', ultimaMovimentacao: '2026-04-17' },
]

export const movEstoqueMock: MovEstoque[] = [
  { id: 'mv-01', itemId: 'est-01', tipo: 'saida', quantidade: 6, contratoId: 'ctr-001', responsavel: 'Almoxarife Central', data: '2026-04-22', observacao: 'Requisição encarregado' },
  { id: 'mv-02', itemId: 'est-03', tipo: 'saida', quantidade: 4, contratoId: 'ctr-002', responsavel: 'Almoxarife Central', data: '2026-04-22', observacao: 'UTI - Sanitização' },
  { id: 'mv-03', itemId: 'est-04', tipo: 'entrada', quantidade: 50, responsavel: 'Almoxarife Central', data: '2026-04-15', observacao: 'NF 123.456' },
  { id: 'mv-04', itemId: 'est-06', tipo: 'saida', quantidade: 40, contratoId: 'ctr-002', responsavel: 'Almoxarife Central', data: '2026-04-18', observacao: 'Entrega nominal EPI' },
]

export const usuariosMock: Usuario[] = [
  // 4 sócios administradores
  { id: 'usr-01', nome: 'Jonathan da Silva', email: 'jonathan@psfacilities.com.br', login: 'silva',   senha: 'silva123',   perfil: 'Administrador', status: 'ativo', ultimoAcesso: '2026-04-23T08:12:00', avatarIniciais: 'JS' },
  { id: 'usr-02', nome: 'David Souza',       email: 'david@psfacilities.com.br',    login: 'david',   senha: 'david123',   perfil: 'Administrador', status: 'ativo', ultimoAcesso: '2026-04-23T07:45:00', avatarIniciais: 'DS' },
  { id: 'usr-03', nome: 'Márcio Kerol',      email: 'kerol@psfacilities.com.br',    login: 'kerol',   senha: 'kerol123',   perfil: 'Administrador', status: 'ativo', ultimoAcesso: '2026-04-22T19:00:00', avatarIniciais: 'MK' },
  { id: 'usr-04', nome: 'Junior Alamar',     email: 'junior@psfacilities.com.br',   login: 'junior',  senha: 'junior123',  perfil: 'Administrador', status: 'ativo', ultimoAcesso: '2026-04-23T09:02:00', avatarIniciais: 'JA' },
  // Usuários administrativos (criados pelos sócios)
  { id: 'usr-05', nome: 'Paula Mendes',      email: 'paula@psfacilities.com.br',    login: 'paula',   senha: 'paula123',   perfil: 'RH',            status: 'ativo', ultimoAcesso: '2026-04-22T17:30:00', avatarIniciais: 'PM' },
  { id: 'usr-06', nome: 'Shopping Friburgo', email: 'admin@shoppingfriburgo.com.br', login: 'shopping', senha: 'cliente123', perfil: 'Cliente',      status: 'ativo', ultimoAcesso: '2026-04-22T11:10:00', avatarIniciais: 'SF' },
]

// Série histórica para dashboards
export const serieFaturamento = [
  { mes: 'Nov/25', receita: 598000, custo: 492000 },
  { mes: 'Dez/25', receita: 612000, custo: 501000 },
  { mes: 'Jan/26', receita: 655000, custo: 528000 },
  { mes: 'Fev/26', receita: 668000, custo: 542000 },
  { mes: 'Mar/26', receita: 682000, custo: 556000 },
  { mes: 'Abr/26', receita: 694900, custo: 563100 },
]

export const serieAbsenteismo = [
  { mes: 'Nov/25', taxa: 4.2 },
  { mes: 'Dez/25', taxa: 5.1 },
  { mes: 'Jan/26', taxa: 3.8 },
  { mes: 'Fev/26', taxa: 4.4 },
  { mes: 'Mar/26', taxa: 3.9 },
  { mes: 'Abr/26', taxa: 4.1 },
]

export const serieHorasExtras = [
  { semana: 'S1', horas: 84 },
  { semana: 'S2', horas: 112 },
  { semana: 'S3', horas: 98 },
  { semana: 'S4', horas: 140 },
]

export const distribuicaoServicos = [
  { servico: 'Limpeza', valor: 62 },
  { servico: 'Portaria', valor: 22 },
  { servico: 'Manutenção', valor: 8 },
  { servico: 'Jardinagem', valor: 5 },
  { servico: 'Segurança', valor: 3 },
]
