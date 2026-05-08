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
export const despesasSeed: Despesa[] = [
  // 20/04 — Jonathan
  { id: 'dsp-001', data: '2026-04-20', descricao: 'Escada e Thiner', categoria: 'Ferramenta', valor: 270, quemComprou: 'Jonathan da Silva', reembolsado: false },
  { id: 'dsp-002', data: '2026-04-20', descricao: 'Material de Limpeza', categoria: 'Material de Limpeza', valor: 22, quemComprou: 'Jonathan da Silva', reembolsado: false },
  { id: 'dsp-003', data: '2026-04-20', descricao: 'Estilete', categoria: 'Ferramenta', valor: 7, quemComprou: 'Jonathan da Silva', reembolsado: false },
  // 20/04 — David
  { id: 'dsp-004', data: '2026-04-20', descricao: 'Domínio da Marca (registro/hospedagem)', categoria: 'Marca/Marketing', valor: 60, quemComprou: 'David Souza', reembolsado: false },
  { id: 'dsp-005', data: '2026-04-20', descricao: 'Camisetas', categoria: 'Uniforme', valor: 60, quemComprou: 'David Souza', reembolsado: false },
  { id: 'dsp-006', data: '2026-04-20', descricao: 'Almoço', categoria: 'Alimentação', valor: 44, quemComprou: 'David Souza', reembolsado: false },
  // 20/04 — Márcio Kerol
  { id: 'dsp-007', data: '2026-04-20', descricao: 'Produtos de Limpeza', categoria: 'Material de Limpeza', valor: 127, quemComprou: 'Márcio Kerol', reembolsado: false },
  { id: 'dsp-008', data: '2026-04-20', descricao: 'Thiner', categoria: 'Material de Limpeza', valor: 35.8, quemComprou: 'Márcio Kerol', reembolsado: false },
  { id: 'dsp-009', data: '2026-04-20', descricao: 'Álcool 70', categoria: 'Material de Limpeza', valor: 15.87, quemComprou: 'Márcio Kerol', reembolsado: false },
  // 21/04 — David e Jonathan (compartilhada)
  { id: 'dsp-010', data: '2026-04-21', descricao: 'Material de Limpeza', categoria: 'Material de Limpeza', valor: 109.8, quemComprou: 'David Souza', reembolsado: false },
  { id: 'dsp-011', data: '2026-04-21', descricao: 'Material de Limpeza', categoria: 'Material de Limpeza', valor: 21.35, quemComprou: 'Jonathan da Silva', reembolsado: false },
  { id: 'dsp-012', data: '2026-04-21', descricao: 'Espátula', categoria: 'Ferramenta', valor: 7, quemComprou: 'Jonathan da Silva', reembolsado: false },
  // 21/04 — Juninho (Junior Alamar)
  { id: 'dsp-013', data: '2026-04-21', descricao: 'Material de Limpeza', categoria: 'Material de Limpeza', valor: 13.98, quemComprou: 'Junior Alamar', reembolsado: false },
  { id: 'dsp-014', data: '2026-04-21', descricao: 'Material de Limpeza', categoria: 'Material de Limpeza', valor: 24.99, quemComprou: 'Junior Alamar', reembolsado: false },
  { id: 'dsp-015', data: '2026-04-21', descricao: 'Almoço', categoria: 'Alimentação', valor: 69, quemComprou: 'Junior Alamar', reembolsado: false },
  { id: 'dsp-016', data: '2026-04-21', descricao: 'Almoço', categoria: 'Alimentação', valor: 6, quemComprou: 'Junior Alamar', reembolsado: false },
  // 22/04 — Kerol
  { id: 'dsp-017', data: '2026-04-22', descricao: 'Material de Limpeza', categoria: 'Material de Limpeza', valor: 36.4, quemComprou: 'Márcio Kerol', reembolsado: false },
  { id: 'dsp-018', data: '2026-04-22', descricao: 'Material de Limpeza', categoria: 'Material de Limpeza', valor: 59.93, quemComprou: 'Márcio Kerol', reembolsado: false },
  { id: 'dsp-019', data: '2026-04-22', descricao: 'Água / Alimentação (equipe)', categoria: 'Alimentação', valor: 8, quemComprou: 'Márcio Kerol', reembolsado: false },
  { id: 'dsp-020', data: '2026-04-22', descricao: 'Material de Limpeza', categoria: 'Material de Limpeza', valor: 26.6, quemComprou: 'Márcio Kerol', reembolsado: false },
  { id: 'dsp-021', data: '2026-04-22', descricao: 'Material de Limpeza', categoria: 'Material de Limpeza', valor: 118.69, quemComprou: 'Márcio Kerol', reembolsado: false },
  // 22/04 — David
  { id: 'dsp-022', data: '2026-04-22', descricao: 'Almoço', categoria: 'Alimentação', valor: 44, quemComprou: 'David Souza', reembolsado: false },
  { id: 'dsp-023', data: '2026-04-22', descricao: 'Material de Limpeza', categoria: 'Material de Limpeza', valor: 74, quemComprou: 'David Souza', reembolsado: false },
]

// ---- Serviços avulsos (jobs pontuais Fase 1) ----
export const servicosAvulsosSeed: ServicoAvulso[] = [
  {
    id: 'sa-001', numero: 'SA-2026-001', data: '2026-04-16',
    cliente: 'Cliente Ricardo (indicação)', tipo: 'Limpeza pós-obra',
    descricao: 'Limpeza pós-reforma apto 80m²', endereco: 'Nova Friburgo/RJ',
    valorBruto: 600, custoMaoDeObra: 100, custoMaterial: 60,
    status: 'concluido', responsavel: 'Jonathan da Silva',
  },
  {
    id: 'sa-002', numero: 'SA-2026-002', data: '2026-04-20',
    cliente: 'Empresa Silva (comercial)', tipo: 'Diária corporativa',
    descricao: 'Limpeza escritório + copa', endereco: 'Centro, Nova Friburgo',
    valorBruto: 800, custoMaoDeObra: 240, custoMaterial: 80,
    status: 'concluido', responsavel: 'Márcio Kerol',
  },
  {
    id: 'sa-003', numero: 'SA-2026-003', data: '2026-04-21',
    cliente: 'Família Oliveira', tipo: 'Diária residencial',
    descricao: 'Limpeza premium residência 2 andares', endereco: 'Olaria',
    valorBruto: 1200, custoMaoDeObra: 340, custoMaterial: 140,
    status: 'concluido', responsavel: 'David Souza',
  },
  {
    id: 'sa-004', numero: 'SA-2026-004', data: '2026-04-23',
    cliente: 'Condomínio Sol Nascente', tipo: 'Mutirão',
    descricao: 'Mutirão de conservação áreas comuns', endereco: 'Conselheiro Paulino',
    valorBruto: 2400, custoMaoDeObra: 360, custoMaterial: 180,
    status: 'em_execucao', responsavel: 'Jonathan da Silva',
    observacao: '4 profissionais @ R$90/dia — pagamento pelo Jonathan',
  },
  {
    id: 'sa-005', numero: 'SA-2026-005', data: '2026-04-26',
    cliente: 'Aniversário de 15 anos (Maria)', tipo: 'Limpeza pós-evento',
    descricao: 'Salão de festas — pós-evento noturno', endereco: 'Cordoeira',
    valorBruto: 800, custoMaoDeObra: 300, custoMaterial: 60,
    status: 'agendado', responsavel: 'Junior Alamar',
  },
]

// ---- Pagamentos a colaboradores (serviços avulsos) ----
export const pagamentosAvulsosSeed: PagamentoAvulso[] = [
  // Lucas — total R$390 (100 + 120 + 170) rateado entre sócios
  { id: 'pa-001', diaTrabalhado: '2026-04-16', colaborador: 'Lucas', servicoAvulsoId: 'sa-001', valor: 100, quemPagou: 'Rateado 4 sócios', status: 'pago' },
  { id: 'pa-002', diaTrabalhado: '2026-04-20', colaborador: 'Lucas', servicoAvulsoId: 'sa-002', valor: 120, quemPagou: 'Rateado 4 sócios', status: 'pago' },
  { id: 'pa-003', diaTrabalhado: '2026-04-21', colaborador: 'Lucas', servicoAvulsoId: 'sa-003', valor: 120, quemPagou: 'Rateado 4 sócios', status: 'pago' },
  { id: 'pa-004', diaTrabalhado: '2026-04-21', colaborador: 'Lucas', servicoAvulsoId: 'sa-003', valor: 50, descricao: 'Adicional (extra hora)', quemPagou: 'Rateado 4 sócios', status: 'pago' },
  // Alessandra — total R$290 (120 + 170) rateado entre sócios
  { id: 'pa-005', diaTrabalhado: '2026-04-20', colaborador: 'Alessandra', servicoAvulsoId: 'sa-002', valor: 120, quemPagou: 'Rateado 4 sócios', status: 'pago' },
  { id: 'pa-006', diaTrabalhado: '2026-04-21', colaborador: 'Alessandra', servicoAvulsoId: 'sa-003', valor: 120, quemPagou: 'Rateado 4 sócios', status: 'pago' },
  { id: 'pa-007', diaTrabalhado: '2026-04-21', colaborador: 'Alessandra', servicoAvulsoId: 'sa-003', valor: 50, descricao: 'Adicional (extra hora)', quemPagou: 'Rateado 4 sócios', status: 'pago' },
  // 23/04 — 4 profissionais R$90 cada, pagos por Jonathan
  { id: 'pa-008', diaTrabalhado: '2026-04-23', colaborador: 'Profissional 1 (equipe mutirão)', servicoAvulsoId: 'sa-004', valor: 90, quemPagou: 'Jonathan', status: 'pago' },
  { id: 'pa-009', diaTrabalhado: '2026-04-23', colaborador: 'Profissional 2 (equipe mutirão)', servicoAvulsoId: 'sa-004', valor: 90, quemPagou: 'Jonathan', status: 'pago' },
  { id: 'pa-010', diaTrabalhado: '2026-04-23', colaborador: 'Profissional 3 (equipe mutirão)', servicoAvulsoId: 'sa-004', valor: 90, quemPagou: 'Jonathan', status: 'pago' },
  { id: 'pa-011', diaTrabalhado: '2026-04-23', colaborador: 'Profissional 4 (equipe mutirão)', servicoAvulsoId: 'sa-004', valor: 90, quemPagou: 'Jonathan', status: 'pago' },
]

// ---- Prestadores de serviço (parcerias potenciais) ----
export const prestadoresSeed: Prestador[] = [
  {
    id: 'prs-001', razaoSocial: 'Limpa Tudo Serviços Ltda.', nomeFantasia: 'LimpaTudo',
    cnpj: '11.222.333/0001-44', segmentos: ['Limpeza', 'Copa'],
    cidade: 'Nova Friburgo', uf: 'RJ',
    contatoNome: 'Sr. Antônio', telefone: '(22) 98800-0001', email: 'comercial@limpatudo.com.br',
    valorMinutaProposta: 48000, relacionamento: 'parceiro',
    observacao: 'Concorreu com a PSF no contrato Shopping Friburgo — perfil alinhado',
    ultimoContato: '2026-04-10',
  },
  {
    id: 'prs-002', razaoSocial: 'Vigor Portaria e Segurança EIRELI', nomeFantasia: 'Vigor',
    cnpj: '22.333.444/0001-55', segmentos: ['Portaria', 'Segurança'],
    cidade: 'Teresópolis', uf: 'RJ',
    contatoNome: 'Dra. Cláudia (sócia)', telefone: '(21) 98700-0002', email: 'contato@vigor.com.br',
    valorMinutaProposta: 56000, relacionamento: 'qualificado',
    observacao: 'Boa estrutura de vigilantes CLT; exploraremos em contratos que exijam porte',
  },
  {
    id: 'prs-003', razaoSocial: 'Jardim Verde Paisagismo', nomeFantasia: 'Jardim Verde',
    cnpj: '33.444.555/0001-66', segmentos: ['Jardinagem'],
    cidade: 'Nova Friburgo', uf: 'RJ',
    contatoNome: 'Pedro (proprietário)', telefone: '(22) 98700-0003', email: 'pedro@jardimverde.com.br',
    valorMinutaProposta: 8500, relacionamento: 'em_contato',
  },
  {
    id: 'prs-004', razaoSocial: 'Manutec Serviços Prediais Ltda.', nomeFantasia: 'Manutec',
    cnpj: '44.555.666/0001-77', segmentos: ['Manutenção'],
    cidade: 'Petrópolis', uf: 'RJ',
    contatoNome: 'Eng. Roberto', telefone: '(22) 98700-0004', email: 'roberto@manutec.com.br',
    valorMinutaProposta: 18500, relacionamento: 'qualificado',
    observacao: 'Possui equipe multidisciplinar (elétrica, hidráulica, civil)',
  },
]

// ---- Currículos recebidos pelo site ----
export const curriculosSeed: Curriculo[] = [
  { id: 'cv-001', nome: 'Juliana Soares Pereira', telefone: '(22) 99300-0001', email: 'juliana.soares@email.com', cargoInteresse: 'Aux. Limpeza', cidade: 'Nova Friburgo', uf: 'RJ', escolaridade: 'Ensino Médio Completo', experienciaAnos: 3, dataEnvio: '2026-04-22', origem: 'Site', status: 'novo', temCarteira: true },
  { id: 'cv-002', nome: 'Marcos Antônio da Costa', telefone: '(22) 99300-0002', email: 'marcos.costa@email.com', cargoInteresse: 'Porteiro', cidade: 'Nova Friburgo', uf: 'RJ', escolaridade: 'Ensino Médio Completo', experienciaAnos: 7, dataEnvio: '2026-04-22', origem: 'Site', status: 'em_analise', temCarteira: true, observacao: 'Bom perfil, experiência em condomínio' },
  { id: 'cv-003', nome: 'Cláudia Regina Martins', telefone: '(22) 99300-0003', email: 'claudia.martins@email.com', cargoInteresse: 'Aux. Limpeza Hospitalar', cidade: 'Teresópolis', uf: 'RJ', escolaridade: 'Curso Técnico em Enfermagem', experienciaAnos: 5, dataEnvio: '2026-04-21', origem: 'Site', status: 'entrevistado', temCarteira: true, observacao: 'Entrevista em 24/04 com Paula/RH — muito bem avaliada' },
  { id: 'cv-004', nome: 'Rafael Nunes Barbosa', telefone: '(22) 99300-0004', email: 'rafael.nb@email.com', cargoInteresse: 'Mantenedor', cidade: 'Nova Friburgo', uf: 'RJ', escolaridade: 'Técnico Eletrotécnica', experienciaAnos: 4, dataEnvio: '2026-04-20', origem: 'Indicação', status: 'em_analise', temCarteira: true },
  { id: 'cv-005', nome: 'Sandra Lopes Freitas', telefone: '(22) 99300-0005', email: 'sandra.lf@email.com', cargoInteresse: 'Aux. Limpeza', cidade: 'Nova Friburgo', uf: 'RJ', escolaridade: 'Ensino Fundamental Completo', experienciaAnos: 10, dataEnvio: '2026-04-19', origem: 'Site', status: 'contratado', temCarteira: true, observacao: 'Contratada em 22/04 — alocada em Ed. Central' },
  { id: 'cv-006', nome: 'Daniel Rodrigues', telefone: '(22) 99300-0006', email: 'daniel.r@email.com', cargoInteresse: 'Porteiro', cidade: 'Bom Jardim', uf: 'RJ', escolaridade: 'Ensino Médio Completo', experienciaAnos: 1, dataEnvio: '2026-04-18', origem: 'Site', status: 'descartado', temCarteira: false, observacao: 'Sem carteira assinada previamente, pouca experiência' },
  { id: 'cv-007', nome: 'Fabiana Lima Cardoso', telefone: '(22) 99300-0007', email: 'fabiana.lc@email.com', cargoInteresse: 'Zeladora', cidade: 'Nova Friburgo', uf: 'RJ', escolaridade: 'Ensino Médio Completo', experienciaAnos: 6, dataEnvio: '2026-04-17', origem: 'WhatsApp', status: 'em_analise', temCarteira: true },
  { id: 'cv-008', nome: 'Edson Farias da Silva', telefone: '(22) 99300-0008', email: 'edson.fs@email.com', cargoInteresse: 'Vigilante', cidade: 'Rio de Janeiro', uf: 'RJ', escolaridade: 'Ensino Médio Completo', experienciaAnos: 12, dataEnvio: '2026-04-16', origem: 'Site', status: 'novo', temCarteira: true, observacao: 'Possui curso de formação de vigilantes atualizado' },
]

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
