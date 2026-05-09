// ==============================================
// Entidades extras — Despesas, Serviços Avulsos,
// Prestadores, Currículos, Propostas Concorrentes
// e parâmetros de Pró-Labore (modelo financeiro PS Facilities)
// ==============================================

export type ID = string

// ---------- Despesas avulsas (operacional + administrativo) ----------
export interface Despesa {
  id: ID
  data: string // YYYY-MM-DD
  descricao: string
  categoria: 'Material de Limpeza' | 'Ferramenta' | 'Alimentação' | 'Uniforme' | 'Marca/Marketing' | 'Transporte' | 'Outros'
  valor: number
  quemComprou: string // Jonathan, David, Kerol, Juninho...
  contratoId?: string // vínculo opcional com contrato
  servicoAvulsoId?: string // vínculo opcional com serviço avulso
  reembolsado: boolean
}

// ---------- Serviços avulsos (Fase 1 — bootstrap) ----------
export interface ServicoAvulso {
  id: ID
  numero: string
  data: string
  cliente: string // nome simples; pode ser novo cliente ainda não cadastrado
  tipo: 'Limpeza pós-obra' | 'Diária residencial' | 'Diária corporativa' | 'Mutirão' | 'Limpeza pós-evento' | 'Copeira evento' | 'Outro'
  descricao: string
  endereco: string
  valorBruto: number
  custoMaoDeObra: number
  custoMaterial: number
  status: 'orcamento' | 'agendado' | 'em_execucao' | 'concluido' | 'faturado' | 'cancelado'
  responsavel: string
  observacao?: string
}

// ---------- Pagamento a colaborador em serviço avulso ----------
export interface PagamentoAvulso {
  id: ID
  diaTrabalhado: string // YYYY-MM-DD
  colaborador: string // Lucas, Alessandra, equipe de 4, etc
  servicoAvulsoId?: string
  valor: number
  descricao?: string
  quemPagou: 'Jonathan' | 'David' | 'Kerol' | 'Junior' | 'Rateado 4 sócios' | 'Outro'
  status: 'pago' | 'pendente'
}

// ---------- Prestadores de serviços terceirizados ----------
export interface Prestador {
  id: ID
  razaoSocial: string
  nomeFantasia: string
  cnpj: string
  segmentos: ('Limpeza' | 'Portaria' | 'Manutenção' | 'Segurança' | 'Jardinagem' | 'Copa' | 'Outros')[]
  cidade: string
  uf: string
  contatoNome: string
  telefone: string
  email: string
  valorMinutaProposta?: number // valor quando concorreu
  relacionamento: 'qualificado' | 'em_contato' | 'parceiro' | 'descartado'
  observacao?: string
  ultimoContato?: string
}

// ---------- Currículos recebidos do site ----------
export interface Curriculo {
  id: ID
  nome: string
  telefone: string
  email: string
  cargoInteresse: string
  cidade: string
  uf: string
  escolaridade: string
  experienciaAnos: number
  dataEnvio: string
  origem: 'Site' | 'Indicação' | 'Mural' | 'WhatsApp' | 'Outro'
  status: 'novo' | 'em_analise' | 'entrevistado' | 'contratado' | 'descartado'
  observacao?: string
  temCarteira: boolean
}

// ---------- Propostas comerciais de concorrentes ----------
export interface PropostaConcorrente {
  id: ID
  empresa: string
  cnpj?: string
  contratoDisputado: string // nome do contrato/licitação
  cliente: string
  dataProposta: string
  valorMensal: number
  escopo: string
  vencedora: 'ps_facilities' | 'concorrente' | 'em_andamento' | 'cancelada'
  observacao?: string
  anexo?: string
}

// ---------- Parâmetros do modelo Pró-Labore (da planilha) ----------
export interface ProLaboreConfig {
  reservaDAS: number        // 0.20 (20%)
  reservaOperacional: number // 0.10 (10%)
  gatilhoMinimo: number     // 12000 (R$ caixa líquido)
  pctCapitalizacao: number  // 0.40 (40% retenção)
  pctDistribuicao: number   // 0.60 (60% sócios)
  numSocios: number         // 4
}

export const proLaboreDefault: ProLaboreConfig = {
  reservaDAS: 0.20,
  reservaOperacional: 0.10,
  gatilhoMinimo: 12000,
  pctCapitalizacao: 0.40,
  pctDistribuicao: 0.60,
  numSocios: 4,
}

// =====================================================
// SEED — dados reais fornecidos pelo cliente (PS Facilities)
// =====================================================

// ---- Despesas reais (20/04, 21/04, 22/04/2026) ----
export const despesasSeed: Despesa[] = []

// ---- Serviços avulsos (jobs pontuais Fase 1) ----
export const servicosAvulsosSeed: ServicoAvulso[] = [
  {
    id: 'sa-hera-01',
    numero: 'NFS-e 4',
    data: '2026-04-24',
    cliente: 'CONSTRUTORA HERA LTDA',
    tipo: 'Limpeza pós-obra',
    descricao: 'Limpeza final de obra + Diária de Ajudante Pátio',
    endereco: 'RUA GOMES DE CARVALHO, 911, VILA OLIMPIA, SÃO PAULO - SP',
    valorBruto: 2630,
    custoMaoDeObra: 680,
    custoMaterial: 0,
    status: 'faturado',
    responsavel: 'Nathan',
  },
]

// ---- Pagamentos a colaboradores (serviços avulsos) ----
export const pagamentosAvulsosSeed: PagamentoAvulso[] = [
  { id: 'pa-ale-01', diaTrabalhado: '2026-04-20', colaborador: 'Alessandra Scheles Lima', valor: 120, quemPagou: 'Rateado 4 sócios', status: 'pago' },
  { id: 'pa-ale-02', diaTrabalhado: '2026-04-21', colaborador: 'Alessandra Scheles Lima', valor: 170, quemPagou: 'Rateado 4 sócios', status: 'pago' },
  { id: 'pa-ale-03', diaTrabalhado: '2026-04-22', colaborador: 'Alessandra Scheles Lima', valor: 120, quemPagou: 'Rateado 4 sócios', status: 'pago' },
  { id: 'pa-ale-04', diaTrabalhado: '2026-04-23', colaborador: 'Alessandra Scheles Lima', valor: 90, quemPagou: 'Jonathan', status: 'pago' },
  
  { id: 'pa-luc-01', diaTrabalhado: '2026-04-16', colaborador: 'Lucas Costa do Nascimento', valor: 100, quemPagou: 'Rateado 4 sócios', status: 'pago' },
  { id: 'pa-luc-02', diaTrabalhado: '2026-04-20', colaborador: 'Lucas Costa do Nascimento', valor: 120, quemPagou: 'Rateado 4 sócios', status: 'pago' },
  { id: 'pa-luc-03', diaTrabalhado: '2026-04-21', colaborador: 'Lucas Costa do Nascimento', valor: 170, quemPagou: 'Rateado 4 sócios', status: 'pago' },
  { id: 'pa-luc-04', diaTrabalhado: '2026-04-22', colaborador: 'Lucas Costa do Nascimento', valor: 120, quemPagou: 'Rateado 4 sócios', status: 'pago' },
  { id: 'pa-luc-05', diaTrabalhado: '2026-04-23', colaborador: 'Lucas Costa do Nascimento', valor: 90, quemPagou: 'Jonathan', status: 'pago' },
  
  { id: 'pa-nat-01', diaTrabalhado: '2026-04-23', colaborador: 'Natasha Neto de Souza', valor: 90, quemPagou: 'Jonathan', status: 'pago' },
  { id: 'pa-ger-01', diaTrabalhado: '2026-04-23', colaborador: 'Gerson Neto de Souza', valor: 90, quemPagou: 'Jonathan', status: 'pago' },
]

// ---- Prestadores de serviço (parcerias potenciais) ----
export const prestadoresSeed: Prestador[] = []

// ---- Currículos recebidos pelo site ----
export const curriculosSeed: Curriculo[] = []

// ---- Propostas de concorrentes (benchmark em processos licitatórios/comerciais) ----
export const concorrentesSeed: PropostaConcorrente[] = [
  {
    id: 'pc-001', empresa: 'Limpa Tudo Serviços Ltda.', cnpj: '11.222.333/0001-44',
    contratoDisputado: 'Limpeza e Portaria Shopping Friburgo',
    cliente: 'Shopping Nova Friburgo S.A.',
    dataProposta: '2024-11-20',
    valorMensal: 192000,
    escopo: 'Limpeza + portaria 24h, 18 postos. Propôs equipe de 20 pessoas.',
    vencedora: 'ps_facilities',
    observacao: 'Perdeu por 3,6% acima da nossa proposta. Qualificada como parceiro futuro.',
  },
  {
    id: 'pc-002', empresa: 'Clean Service RJ Ltda.', cnpj: '55.666.777/0001-88',
    contratoDisputado: 'Higienização Hospitalar HST',
    cliente: 'Hospital Santa Teresa Ltda.',
    dataProposta: '2025-01-15',
    valorMensal: 138500,
    escopo: 'Higienização hospitalar UTI + enfermarias, treinamento NR-32.',
    vencedora: 'ps_facilities',
    observacao: 'Proposta técnica equivalente; ganhamos por relacionamento prévio.',
  },
  {
    id: 'pc-003', empresa: 'Vigor Portaria e Segurança', cnpj: '22.333.444/0001-55',
    contratoDisputado: 'Portaria Indústria Têxtil',
    cliente: 'Têxtil Friburgo',
    dataProposta: '2024-05-28',
    valorMensal: 102800,
    escopo: 'Portaria 24h + ronda interna.',
    vencedora: 'concorrente',
    observacao: 'Perdemos. Cliente preferiu pela tradição do concorrente. Contrato renovável em 2026.',
  },
  {
    id: 'pc-004', empresa: 'Nova Gestão Facilities', cnpj: '66.777.888/0001-99',
    contratoDisputado: 'Zeladoria Ed. Central',
    cliente: 'Condomínio Ed. Central',
    dataProposta: '2024-12-10',
    valorMensal: 40500,
    escopo: 'Zeladoria + portaria + jardinagem.',
    vencedora: 'ps_facilities',
    observacao: 'Síndico elogiou nossa apresentação e escopo detalhado.',
  },
  {
    id: 'pc-005', empresa: 'ServPrime Limpeza Ltda.', cnpj: '77.888.999/0001-00',
    contratoDisputado: 'Limpeza Prédios Públicos Cachoeiras',
    cliente: 'Prefeitura de Cachoeiras de Macacu',
    dataProposta: '2025-02-08',
    valorMensal: 78200,
    escopo: 'Limpeza de 4 prédios públicos + jardinagem.',
    vencedora: 'ps_facilities',
    observacao: 'Dispensa de licitação — melhor proposta técnica e comercial.',
  },
  {
    id: 'pc-006', empresa: 'Alpha Servicos EIRELI', cnpj: '88.999.000/0001-11',
    contratoDisputado: 'Limpeza Campus UNIFESO',
    cliente: 'UNIFESO',
    dataProposta: '2024-06-30',
    valorMensal: 115500,
    escopo: 'Limpeza completa campus (6 blocos).',
    vencedora: 'ps_facilities',
    observacao: 'Ganhamos por 3,2% menor valor e equipe residente.',
  },
  {
    id: 'pc-007', empresa: 'Clean Pro Servicos', cnpj: '99.000.111/0001-22',
    contratoDisputado: 'Portaria Farmácia Vida (rede)',
    cliente: 'Farmácia Vida',
    dataProposta: '2025-03-05',
    valorMensal: 24500,
    escopo: 'Limpeza de 8 lojas da rede.',
    vencedora: 'em_andamento',
    observacao: 'Proposta em avaliação pelo cliente.',
  },
]
