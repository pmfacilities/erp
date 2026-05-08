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
  tipo: 'receber' | 'pagar'
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
  { id: 'cli-01', razaoSocial: 'Shopping Nova Friburgo S.A.', nomeFantasia: 'Shopping Friburgo', cnpj: '12.345.678/0001-01', email: 'ops@shoppingfriburgo.com.br', telefone: '(22) 2522-0100', cidade: 'Nova Friburgo', uf: 'RJ', status: 'ativo', contatoResponsavel: 'Marta Albuquerque', criadoEm: '2024-03-10' },
  { id: 'cli-02', razaoSocial: 'Hospital Santa Teresa Ltda.', nomeFantasia: 'Hospital Santa Teresa', cnpj: '23.456.789/0001-02', email: 'admin@hst.com.br', telefone: '(22) 2533-4400', cidade: 'Petrópolis', uf: 'RJ', status: 'ativo', contatoResponsavel: 'Dr. Ricardo Menezes', criadoEm: '2024-06-22' },
  { id: 'cli-03', razaoSocial: 'Indústria Têxtil Friburguense S.A.', nomeFantasia: 'Têxtil Friburgo', cnpj: '34.567.890/0001-03', email: 'compras@textilfbg.com.br', telefone: '(22) 2544-1818', cidade: 'Nova Friburgo', uf: 'RJ', status: 'ativo', contatoResponsavel: 'Engº Paulo Freitas', criadoEm: '2023-11-05' },
  { id: 'cli-04', razaoSocial: 'Condomínio Edifício Central', nomeFantasia: 'Ed. Central', cnpj: '45.678.901/0001-04', email: 'sindico@edcentral.com.br', telefone: '(22) 2555-2200', cidade: 'Nova Friburgo', uf: 'RJ', status: 'ativo', contatoResponsavel: 'Síndico Antonio Lima', criadoEm: '2025-01-15' },
  { id: 'cli-05', razaoSocial: 'Prefeitura de Cachoeiras de Macacu', nomeFantasia: 'PM Cachoeiras', cnpj: '56.789.012/0001-05', email: 'licitacao@cachoeiras.rj.gov.br', telefone: '(22) 2649-3000', cidade: 'Cachoeiras de Macacu', uf: 'RJ', status: 'ativo', contatoResponsavel: 'Sec. Administração', criadoEm: '2025-02-20' },
  { id: 'cli-06', razaoSocial: 'Universidade Serra dos Órgãos', nomeFantasia: 'UNIFESO', cnpj: '67.890.123/0001-06', email: 'infra@unifeso.edu.br', telefone: '(21) 2746-3636', cidade: 'Teresópolis', uf: 'RJ', status: 'ativo', contatoResponsavel: 'Coord. Infraestrutura', criadoEm: '2024-09-01' },
  { id: 'cli-07', razaoSocial: 'Banco Regional RJ S.A.', nomeFantasia: 'Banco Regional', cnpj: '78.901.234/0001-07', email: 'facilities@banregional.com.br', telefone: '(21) 3030-4040', cidade: 'Rio de Janeiro', uf: 'RJ', status: 'inativo', contatoResponsavel: 'Gerente Predial', criadoEm: '2023-04-18' },
  { id: 'cli-08', razaoSocial: 'Rede de Farmácias Vida Ltda.', nomeFantasia: 'Farmácia Vida', cnpj: '89.012.345/0001-08', email: 'ops@farmaciavida.com.br', telefone: '(22) 2512-7788', cidade: 'Nova Friburgo', uf: 'RJ', status: 'ativo', contatoResponsavel: 'Op. Regional', criadoEm: '2025-03-02' },
]

export const contratosMock: Contrato[] = [
  {
    id: 'ctr-001', numero: 'CT-2025-001', clienteId: 'cli-01', titulo: 'Limpeza e Portaria — Shopping Friburgo',
    servicos: ['limpeza', 'portaria'],
    vigenciaInicio: '2025-01-01', vigenciaFim: '2026-12-31',
    valorMensal: 185000, custoMensal: 152800,
    indiceReajuste: 'IPCA', proximoReajuste: '2026-01-01',
    postos: [
      { nome: 'Piso L1', endereco: 'Shopping Friburgo — Piso L1', funcao: 'Aux. Limpeza', efetivos: 8 },
      { nome: 'Piso L2', endereco: 'Shopping Friburgo — Piso L2', funcao: 'Aux. Limpeza', efetivos: 6 },
      { nome: 'Portaria Principal', endereco: 'Shopping Friburgo — Entrada', funcao: 'Porteiro', efetivos: 4 },
    ],
    status: 'ativo', criadoEm: '2024-12-15',
  },
  {
    id: 'ctr-002', numero: 'CT-2025-002', clienteId: 'cli-02', titulo: 'Higienização Hospitalar — HST',
    servicos: ['limpeza'],
    vigenciaInicio: '2025-03-01', vigenciaFim: '2027-02-28',
    valorMensal: 142000, custoMensal: 128900,
    indiceReajuste: 'CCT', proximoReajuste: '2026-05-01',
    postos: [
      { nome: 'UTI', endereco: 'HST — 3º andar', funcao: 'Aux. Limpeza Hospitalar', efetivos: 6 },
      { nome: 'Enfermarias', endereco: 'HST — 2º andar', funcao: 'Aux. Limpeza Hospitalar', efetivos: 10 },
    ],
    status: 'ativo', criadoEm: '2025-02-10',
  },
  {
    id: 'ctr-003', numero: 'CT-2024-017', clienteId: 'cli-03', titulo: 'Portaria 24h + Manutenção — Têxtil Friburgo',
    servicos: ['portaria', 'manutencao'],
    vigenciaInicio: '2024-07-01', vigenciaFim: '2026-06-30',
    valorMensal: 98500, custoMensal: 84300,
    indiceReajuste: 'IPCA', proximoReajuste: '2025-07-01',
    postos: [
      { nome: 'Portaria 1', endereco: 'Fábrica — Portão Principal', funcao: 'Porteiro', efetivos: 4 },
      { nome: 'Manutenção', endereco: 'Fábrica — Oficina', funcao: 'Mantenedor', efetivos: 2 },
    ],
    status: 'ativo', criadoEm: '2024-06-01',
  },
  {
    id: 'ctr-004', numero: 'CT-2025-009', clienteId: 'cli-04', titulo: 'Zeladoria — Ed. Central',
    servicos: ['limpeza', 'portaria', 'jardinagem'],
    vigenciaInicio: '2025-02-01', vigenciaFim: '2027-01-31',
    valorMensal: 38200, custoMensal: 34100,
    indiceReajuste: 'IGPM', proximoReajuste: '2026-02-01',
    postos: [
      { nome: 'Zelador', endereco: 'Ed. Central — Térreo', funcao: 'Zelador', efetivos: 2 },
      { nome: 'Portaria', endereco: 'Ed. Central — Entrada', funcao: 'Porteiro', efetivos: 4 },
    ],
    status: 'ativo', criadoEm: '2025-01-25',
  },
  {
    id: 'ctr-005', numero: 'CT-2025-011', clienteId: 'cli-05', titulo: 'Conservação de Prédios Públicos',
    servicos: ['limpeza', 'jardinagem'],
    vigenciaInicio: '2025-03-15', vigenciaFim: '2026-03-14',
    valorMensal: 76400, custoMensal: 70200,
    indiceReajuste: 'CCT', proximoReajuste: '2026-05-01',
    postos: [
      { nome: 'Prefeitura', endereco: 'Prédio Sede', funcao: 'Aux. Limpeza', efetivos: 8 },
      { nome: 'Secretarias', endereco: 'Praça Central', funcao: 'Aux. Limpeza', efetivos: 4 },
    ],
    status: 'ativo', criadoEm: '2025-02-28',
  },
  {
    id: 'ctr-006', numero: 'CT-2024-022', clienteId: 'cli-06', titulo: 'Limpeza Acadêmica — UNIFESO',
    servicos: ['limpeza'],
    vigenciaInicio: '2024-08-01', vigenciaFim: '2026-07-31',
    valorMensal: 112000, custoMensal: 108500,
    indiceReajuste: 'IPCA', proximoReajuste: '2025-08-01',
    postos: [{ nome: 'Campus Sede', endereco: 'UNIFESO — Teresópolis', funcao: 'Aux. Limpeza', efetivos: 12 }],
    status: 'ativo', criadoEm: '2024-07-12',
  },
  {
    id: 'ctr-007', numero: 'CT-2025-014', clienteId: 'cli-08', titulo: 'Limpeza de Lojas — Farmácia Vida',
    servicos: ['limpeza'],
    vigenciaInicio: '2025-04-01', vigenciaFim: '2026-03-31',
    valorMensal: 22800, custoMensal: 19500,
    indiceReajuste: 'CCT', proximoReajuste: '2026-05-01',
    postos: [{ nome: 'Rede 8 lojas', endereco: 'Diversos — Nova Friburgo', funcao: 'Aux. Limpeza', efetivos: 8 }],
    status: 'ativo', criadoEm: '2025-03-20',
  },
  {
    id: 'ctr-008', numero: 'CT-2023-041', clienteId: 'cli-07', titulo: 'Segurança Agência Central — Banco Regional',
    servicos: ['seguranca'],
    vigenciaInicio: '2023-05-01', vigenciaFim: '2025-04-30',
    valorMensal: 55000, custoMensal: 49000,
    indiceReajuste: 'CCT', proximoReajuste: '2025-05-01',
    postos: [{ nome: 'Agência Centro', endereco: 'Rio de Janeiro — Centro', funcao: 'Vigilante', efetivos: 4 }],
    status: 'encerrado', criadoEm: '2023-04-18',
  },
]

export const funcionariosMock: Funcionario[] = [
  { id: 'fun-001', nome: 'Maria das Graças Silva', cpf: '111.222.333-44', cargo: 'Aux. Limpeza', contratoId: 'ctr-001', postoNome: 'Piso L1', turno: 'manha', salario: 1570, admissao: '2024-02-10', status: 'ativo', telefone: '(22) 99200-0011', asoValidade: '2026-02-10' },
  { id: 'fun-002', nome: 'João Batista Oliveira', cpf: '222.333.444-55', cargo: 'Porteiro', contratoId: 'ctr-001', postoNome: 'Portaria Principal', turno: '12x36', salario: 1820, admissao: '2023-08-01', status: 'ativo', telefone: '(22) 99200-0012', asoValidade: '2026-05-18' },
  { id: 'fun-003', nome: 'Ana Paula Rodrigues', cpf: '333.444.555-66', cargo: 'Aux. Limpeza Hospitalar', contratoId: 'ctr-002', postoNome: 'UTI', turno: 'manha', salario: 1950, admissao: '2025-03-01', status: 'ativo', telefone: '(22) 99200-0013', asoValidade: '2026-03-01' },
  { id: 'fun-004', nome: 'Carlos Eduardo Nascimento', cpf: '444.555.666-77', cargo: 'Mantenedor', contratoId: 'ctr-003', postoNome: 'Manutenção', turno: 'manha', salario: 2850, admissao: '2022-11-14', status: 'ativo', telefone: '(22) 99200-0014', asoValidade: '2025-11-14' },
  { id: 'fun-005', nome: 'Regina Lima Costa', cpf: '555.666.777-88', cargo: 'Aux. Limpeza', contratoId: 'ctr-001', postoNome: 'Piso L2', turno: 'tarde', salario: 1570, admissao: '2024-04-02', status: 'ferias', telefone: '(22) 99200-0015', asoValidade: '2026-04-02' },
  { id: 'fun-006', nome: 'Pedro Henrique Souza', cpf: '666.777.888-99', cargo: 'Porteiro', contratoId: 'ctr-003', postoNome: 'Portaria 1', turno: 'noite', salario: 1820, admissao: '2024-01-20', status: 'ativo', telefone: '(22) 99200-0016', asoValidade: '2026-01-20' },
  { id: 'fun-007', nome: 'Fernanda Mendes Araújo', cpf: '777.888.999-00', cargo: 'Aux. Limpeza Hospitalar', contratoId: 'ctr-002', postoNome: 'Enfermarias', turno: 'tarde', salario: 1950, admissao: '2025-03-15', status: 'ativo', telefone: '(22) 99200-0017', asoValidade: '2026-03-15' },
  { id: 'fun-008', nome: 'Rafael Campos Pereira', cpf: '888.999.000-11', cargo: 'Zelador', contratoId: 'ctr-004', postoNome: 'Zelador', turno: 'manha', salario: 2100, admissao: '2025-02-01', status: 'ativo', telefone: '(22) 99200-0018', asoValidade: '2026-02-01' },
  { id: 'fun-009', nome: 'Luciana Ferreira Dias', cpf: '999.000.111-22', cargo: 'Aux. Limpeza', contratoId: 'ctr-005', postoNome: 'Prefeitura', turno: 'manha', salario: 1570, admissao: '2025-03-15', status: 'ativo', telefone: '(22) 99200-0019', asoValidade: '2026-03-15' },
  { id: 'fun-010', nome: 'Marcos Vinícius Teixeira', cpf: '000.111.222-33', cargo: 'Vigilante', contratoId: undefined, turno: 'noite', salario: 2400, admissao: '2023-03-01', status: 'desligado', telefone: '(22) 99200-0020', asoValidade: '2025-03-01' },
  { id: 'fun-011', nome: 'Sandra Ribeiro Pinto', cpf: '101.202.303-44', cargo: 'Aux. Limpeza', contratoId: 'ctr-006', postoNome: 'Campus Sede', turno: 'manha', salario: 1570, admissao: '2024-08-05', status: 'ativo', telefone: '(22) 99200-0021', asoValidade: '2026-08-05' },
  { id: 'fun-012', nome: 'Gabriel Almeida Prado', cpf: '202.303.404-55', cargo: 'Jardineiro', contratoId: 'ctr-004', postoNome: 'Zelador', turno: 'manha', salario: 1800, admissao: '2025-02-10', status: 'afastado', telefone: '(22) 99200-0022', asoValidade: '2026-02-10' },
  { id: 'fun-013', nome: 'Beatriz Carvalho Nunes', cpf: '303.404.505-66', cargo: 'Aux. Limpeza', contratoId: 'ctr-007', postoNome: 'Rede 8 lojas', turno: 'tarde', salario: 1570, admissao: '2025-04-01', status: 'ativo', telefone: '(22) 99200-0023', asoValidade: '2026-04-01' },
  { id: 'fun-014', nome: 'Thiago Martins Correa', cpf: '404.505.606-77', cargo: 'Porteiro', contratoId: 'ctr-004', postoNome: 'Portaria', turno: '12x36', salario: 1820, admissao: '2025-02-15', status: 'ativo', telefone: '(22) 99200-0024', asoValidade: '2026-02-15' },
  { id: 'fun-015', nome: 'Juliana Barros Tavares', cpf: '505.606.707-88', cargo: 'Aux. Limpeza', contratoId: 'ctr-005', postoNome: 'Secretarias', turno: 'tarde', salario: 1570, admissao: '2025-03-20', status: 'ativo', telefone: '(22) 99200-0025', asoValidade: '2026-03-20' },
]

// ---------- Escala semanal (seed para próximos 7 dias a partir da data base) ----------
const hoje = new Date('2026-04-20') // segunda
function dPlus(n: number) {
  const d = new Date(hoje); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10)
}

export const escalaMock: EscalaTurno[] = [
  // Seg
  { id: 'esc-01', data: dPlus(0), funcionarioId: 'fun-001', postoNome: 'Piso L1', contratoId: 'ctr-001', inicio: '06:00', fim: '14:00', status: 'agendado' },
  { id: 'esc-02', data: dPlus(0), funcionarioId: 'fun-002', postoNome: 'Portaria Principal', contratoId: 'ctr-001', inicio: '07:00', fim: '19:00', status: 'presente' },
  { id: 'esc-03', data: dPlus(0), funcionarioId: 'fun-003', postoNome: 'UTI', contratoId: 'ctr-002', inicio: '06:00', fim: '14:00', status: 'presente' },
  { id: 'esc-04', data: dPlus(0), funcionarioId: 'fun-006', postoNome: 'Portaria 1', contratoId: 'ctr-003', inicio: '19:00', fim: '07:00', status: 'agendado' },
  // Ter
  { id: 'esc-05', data: dPlus(1), funcionarioId: 'fun-001', postoNome: 'Piso L1', contratoId: 'ctr-001', inicio: '06:00', fim: '14:00', status: 'agendado' },
  { id: 'esc-06', data: dPlus(1), funcionarioId: 'fun-007', postoNome: 'Enfermarias', contratoId: 'ctr-002', inicio: '14:00', fim: '22:00', status: 'agendado' },
  { id: 'esc-07', data: dPlus(1), funcionarioId: 'fun-014', postoNome: 'Portaria', contratoId: 'ctr-004', inicio: '07:00', fim: '19:00', status: 'agendado' },
  // Qua
  { id: 'esc-08', data: dPlus(2), funcionarioId: 'fun-002', postoNome: 'Portaria Principal', contratoId: 'ctr-001', inicio: '07:00', fim: '19:00', status: 'agendado' },
  { id: 'esc-09', data: dPlus(2), funcionarioId: 'fun-011', postoNome: 'Campus Sede', contratoId: 'ctr-006', inicio: '06:00', fim: '14:00', status: 'falta' },
  { id: 'esc-10', data: dPlus(2), funcionarioId: 'fun-004', postoNome: 'Manutenção', contratoId: 'ctr-003', inicio: '08:00', fim: '17:00', status: 'agendado' },
  // Qui
  { id: 'esc-11', data: dPlus(3), funcionarioId: 'fun-009', postoNome: 'Prefeitura', contratoId: 'ctr-005', inicio: '06:00', fim: '14:00', status: 'agendado' },
  { id: 'esc-12', data: dPlus(3), funcionarioId: 'fun-013', postoNome: 'Rede 8 lojas', contratoId: 'ctr-007', inicio: '13:00', fim: '21:00', status: 'agendado' },
  // Sex
  { id: 'esc-13', data: dPlus(4), funcionarioId: 'fun-003', postoNome: 'UTI', contratoId: 'ctr-002', inicio: '06:00', fim: '14:00', status: 'agendado' },
  { id: 'esc-14', data: dPlus(4), funcionarioId: 'fun-008', postoNome: 'Zelador', contratoId: 'ctr-004', inicio: '07:00', fim: '16:00', status: 'agendado' },
  // Sab
  { id: 'esc-15', data: dPlus(5), funcionarioId: 'fun-015', postoNome: 'Secretarias', contratoId: 'ctr-005', inicio: '06:00', fim: '14:00', status: 'agendado' },
  { id: 'esc-16', data: dPlus(5), funcionarioId: 'fun-006', postoNome: 'Portaria 1', contratoId: 'ctr-003', inicio: '19:00', fim: '07:00', status: 'agendado' },
  // Dom
  { id: 'esc-17', data: dPlus(6), funcionarioId: 'fun-002', postoNome: 'Portaria Principal', contratoId: 'ctr-001', inicio: '07:00', fim: '19:00', status: 'agendado' },
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
  { id: 'fin-01', tipo: 'receber', descricao: 'Mensalidade CT-2025-001 / 04-2026', contratoId: 'ctr-001', fornecedorCliente: 'Shopping Nova Friburgo S.A.', valor: 185000, vencimento: '2026-05-05', status: 'aberto', centroCusto: 'Comercial' },
  { id: 'fin-02', tipo: 'receber', descricao: 'Mensalidade CT-2025-002 / 04-2026', contratoId: 'ctr-002', fornecedorCliente: 'Hospital Santa Teresa Ltda.', valor: 142000, vencimento: '2026-05-10', status: 'aberto', centroCusto: 'Comercial' },
  { id: 'fin-03', tipo: 'receber', descricao: 'Mensalidade CT-2024-017 / 04-2026', contratoId: 'ctr-003', fornecedorCliente: 'Indústria Têxtil Friburguense', valor: 98500, vencimento: '2026-04-28', pagamento: '2026-04-22', status: 'pago', centroCusto: 'Comercial' },
  { id: 'fin-04', tipo: 'receber', descricao: 'Mensalidade CT-2025-009 / 04-2026', contratoId: 'ctr-004', fornecedorCliente: 'Condomínio Ed. Central', valor: 38200, vencimento: '2026-04-15', status: 'atrasado', centroCusto: 'Comercial' },
  { id: 'fin-05', tipo: 'receber', descricao: 'Mensalidade CT-2025-011 / 04-2026', contratoId: 'ctr-005', fornecedorCliente: 'Prefeitura de Cachoeiras', valor: 76400, vencimento: '2026-05-20', status: 'aberto', centroCusto: 'Comercial' },
  { id: 'fin-06', tipo: 'receber', descricao: 'Mensalidade CT-2024-022 / 04-2026', contratoId: 'ctr-006', fornecedorCliente: 'UNIFESO', valor: 112000, vencimento: '2026-05-08', status: 'aberto', centroCusto: 'Comercial' },
  { id: 'fin-07', tipo: 'pagar', descricao: 'Folha de Pagamento 04-2026', fornecedorCliente: 'Folha Interna', valor: 318400, vencimento: '2026-05-05', status: 'aberto', centroCusto: 'RH' },
  { id: 'fin-08', tipo: 'pagar', descricao: 'INSS competência 03-2026', fornecedorCliente: 'Receita Federal', valor: 72800, vencimento: '2026-04-20', pagamento: '2026-04-19', status: 'pago', centroCusto: 'Tributos' },
  { id: 'fin-09', tipo: 'pagar', descricao: 'FGTS 03-2026', fornecedorCliente: 'Caixa Econômica Federal', valor: 28500, vencimento: '2026-04-20', pagamento: '2026-04-19', status: 'pago', centroCusto: 'Tributos' },
  { id: 'fin-10', tipo: 'pagar', descricao: 'NF Produtos de Limpeza — Distrib. Sanitária', fornecedorCliente: 'Distribuidora Sanitária Ltda.', valor: 18420, vencimento: '2026-04-30', status: 'aberto', centroCusto: 'Suprimentos' },
  { id: 'fin-11', tipo: 'pagar', descricao: 'NF EPIs — Segur EPI', fornecedorCliente: 'Segur EPI Comércio', valor: 9850, vencimento: '2026-05-03', status: 'aberto', centroCusto: 'Suprimentos' },
  { id: 'fin-12', tipo: 'pagar', descricao: 'Aluguel escritório', fornecedorCliente: 'Imobiliária Friburgo', valor: 8200, vencimento: '2026-05-05', status: 'aberto', centroCusto: 'Administrativo' },
  { id: 'fin-13', tipo: 'pagar', descricao: 'Energia elétrica', fornecedorCliente: 'Enel RJ', valor: 2850, vencimento: '2026-04-25', status: 'aberto', centroCusto: 'Administrativo' },
  { id: 'fin-14', tipo: 'receber', descricao: 'Mensalidade CT-2025-014 / 04-2026', contratoId: 'ctr-007', fornecedorCliente: 'Farmácia Vida', valor: 22800, vencimento: '2026-05-10', status: 'aberto', centroCusto: 'Comercial' },
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
