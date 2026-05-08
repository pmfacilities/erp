-- Adicionar PIX aos funcionários
alter table public.funcionarios add column if not exists pix text;
