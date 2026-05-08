-- Escalas (Histórico de turnos)
create table if not exists public.escalas (
  id uuid default gen_random_uuid() primary key,
  data date not null,
  funcionario_id uuid references public.funcionarios(id),
  posto_nome text,
  contrato_id uuid references public.contratos(id),
  servico_avulso_id uuid references public.servicos_avulsos(id),
  inicio text,
  fim text,
  status text check (status in ('agendado', 'presente', 'falta', 'coberto')) default 'agendado',
  criado_em timestamptz default now()
);

alter table public.escalas enable row level security;
create policy "Acesso livre" on public.escalas for all using (true) with check (true);
