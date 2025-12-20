-- Tabela de Configurações
create table if not exists redemptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  reward_id text not null,
  reward_title text not null,
  cost integer not null,
  redeemed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table redemptions enable row level security;

-- Política para Select (apenas o próprio usuário)
create policy "Usuários podem ver seus próprios resgates"
  on redemptions for select
  using (auth.uid() = user_id);

-- Política para Insert (apenas o próprio usuário)
create policy "Usuários podem registrar seus próprios resgates"
  on redemptions for insert
  with check (auth.uid() = user_id);
