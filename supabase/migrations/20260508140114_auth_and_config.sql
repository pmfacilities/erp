-- Usuários
create table if not exists public.usuarios (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  login text unique not null,
  email text unique not null,
  senha text not null,
  perfil text not null,
  status text default 'ativo',
  avatar_iniciais text,
  ultimo_acesso timestamptz,
  criado_em timestamptz default now()
);

-- Configurações da Empresa
create table if not exists public.configuracoes (
  id text primary key default 'empresa_info',
  razao_social text,
  nome_fantasia text,
  cnpj text,
  endereco text,
  cidade text,
  uf text,
  telefone text,
  email_comercial text,
  site text,
  logo_url text,
  socios jsonb default '[]'::jsonb,
  pro_labore jsonb default '{"ativo": false, "valorMensal": 0, "socios": []}'::jsonb
);

-- Inserir config padrão se não existir
insert into public.configuracoes (id, razao_social, nome_fantasia)
values ('empresa_info', 'PS Facilities Manager', 'PSFM ERP')
on conflict do nothing;

-- RLS
alter table public.usuarios enable row level security;
alter table public.configuracoes enable row level security;
create policy "Acesso livre" on public.usuarios for all using (true) with check (true);
create policy "Acesso livre" on public.configuracoes for all using (true) with check (true);
