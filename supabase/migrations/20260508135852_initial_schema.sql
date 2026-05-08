-- Extensão para UUIDs
create extension if not exists "pgcrypto";

-- Clientes
create table if not exists public.clientes (
  id uuid default gen_random_uuid() primary key,
  razao_social text not null,
  nome_fantasia text,
  cnpj text unique,
  email text,
  telefone text,
  cidade text,
  uf text,
  status text check (status in ('ativo', 'inativo')) default 'ativo',
  contato_responsavel text,
  criado_em timestamptz default now()
);

-- Contratos
create table if not exists public.contratos (
  id uuid default gen_random_uuid() primary key,
  numero text unique not null,
  cliente_id uuid references public.clientes(id),
  titulo text not null,
  servicos text[],
  vigencia_inicio date,
  vigencia_fim date,
  valor_mensal numeric(15, 2),
  custo_mensal numeric(15, 2),
  indice_reajuste text,
  proximo_reajuste date,
  status text check (status in ('ativo', 'suspenso', 'encerrado', 'rascunho')) default 'ativo',
  criado_em timestamptz default now()
);

-- Postos de Trabalho
create table if not exists public.postos (
  id uuid default gen_random_uuid() primary key,
  contrato_id uuid references public.contratos(id) on delete cascade,
  nome text not null,
  endereco text,
  funcao text,
  efetivos integer default 1
);

-- Funcionários
create table if not exists public.funcionarios (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  cpf text unique not null,
  cargo text,
  contrato_id uuid references public.contratos(id),
  posto_nome text,
  turno text,
  salario numeric(15, 2),
  admissao date,
  status text check (status in ('ativo', 'ferias', 'afastado', 'desligado', 'avulso')) default 'ativo',
  telefone text,
  aso_validade date,
  criado_em timestamptz default now()
);

-- Financeiro
create table if not exists public.financeiro (
  id uuid default gen_random_uuid() primary key,
  tipo text check (tipo in ('receber', 'pagar')) not null,
  descricao text not null,
  contrato_id uuid references public.contratos(id),
  fornecedor_cliente text,
  valor numeric(15, 2) not null,
  vencimento date not null,
  pagamento date,
  status text check (status in ('aberto', 'pago', 'atrasado')) default 'aberto',
  centro_custo text,
  criado_em timestamptz default now()
);

-- Ocorrências
create table if not exists public.ocorrencias (
  id uuid default gen_random_uuid() primary key,
  contrato_id uuid references public.contratos(id),
  posto_nome text,
  titulo text not null,
  descricao text,
  criticidade text check (criticidade in ('baixa', 'media', 'alta', 'critica')),
  status text check (status in ('aberta', 'em_andamento', 'resolvida')) default 'aberta',
  reportada_por text,
  foto text,
  criada_em timestamptz default now(),
  resolvida_em timestamptz
);

-- Estoque
create table if not exists public.estoque (
  id uuid default gen_random_uuid() primary key,
  sku text unique,
  nome text not null,
  categoria text,
  unidade text,
  quantidade numeric(12, 3) default 0,
  estoque_minimo numeric(12, 3) default 0,
  custo_unitario numeric(15, 2) default 0,
  local text,
  ultima_movimentacao timestamptz default now()
);

-- Movimentações de Estoque
create table if not exists public.movimentacoes_estoque (
  id uuid default gen_random_uuid() primary key,
  item_id uuid references public.estoque(id),
  tipo text check (tipo in ('entrada', 'saida')),
  quantidade numeric(12, 3) not null,
  contrato_id uuid references public.contratos(id),
  responsavel text,
  data timestamptz default now(),
  observacao text
);

-- Serviços Avulsos
create table if not exists public.servicos_avulsos (
  id uuid default gen_random_uuid() primary key,
  numero text,
  data date not null,
  cliente text not null,
  tipo text,
  descricao text,
  endereco text,
  valor_bruto numeric(15, 2),
  custo_mao_de_obra numeric(15, 2),
  custo_material numeric(15, 2),
  status text check (status in ('orcamento', 'agendado', 'em_execucao', 'concluido', 'faturado', 'cancelado')),
  responsavel text,
  observacao text,
  criado_em timestamptz default now()
);

-- Despesas
create table if not exists public.despesas (
  id uuid default gen_random_uuid() primary key,
  data date not null,
  descricao text not null,
  categoria text,
  valor numeric(15, 2) not null,
  quem_comprou text,
  reembolsado boolean default false,
  contrato_id uuid references public.contratos(id),
  servico_avulso_id uuid references public.servicos_avulsos(id),
  criado_em timestamptz default now()
);

-- Habilitar RLS (Policies abertas por enquanto)
alter table public.clientes enable row level security;
alter table public.contratos enable row level security;
alter table public.postos enable row level security;
alter table public.funcionarios enable row level security;
alter table public.financeiro enable row level security;
alter table public.ocorrencias enable row level security;
alter table public.estoque enable row level security;
alter table public.movimentacoes_estoque enable row level security;
alter table public.servicos_avulsos enable row level security;
alter table public.despesas enable row level security;

create policy "Acesso livre" on public.clientes for all using (true) with check (true);
create policy "Acesso livre" on public.contratos for all using (true) with check (true);
create policy "Acesso livre" on public.postos for all using (true) with check (true);
create policy "Acesso livre" on public.funcionarios for all using (true) with check (true);
create policy "Acesso livre" on public.financeiro for all using (true) with check (true);
create policy "Acesso livre" on public.ocorrencias for all using (true) with check (true);
create policy "Acesso livre" on public.estoque for all using (true) with check (true);
create policy "Acesso livre" on public.movimentacoes_estoque for all using (true) with check (true);
create policy "Acesso livre" on public.servicos_avulsos for all using (true) with check (true);
create policy "Acesso livre" on public.despesas for all using (true) with check (true);
