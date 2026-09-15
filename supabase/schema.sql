-- VS Motors: vehicles table schema and Row Level Security policies.
-- This was already run manually against the live Supabase project during setup.
-- It is committed here for documentation / reproducibility.

create table if not exists vehicles (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  model text not null,
  year integer not null,
  price numeric not null,
  km integer not null,
  transmission text not null check (transmission in ('manual', 'automatic')),
  fuel text not null,
  color text not null,
  images text[] not null default '{}',
  description text not null default '',
  created_at timestamptz not null default now()
);

alter table vehicles enable row level security;

create policy "public can read vehicles"
  on vehicles for select
  using (true);

create policy "authenticated users can insert vehicles"
  on vehicles for insert
  to authenticated
  with check (true);

create policy "authenticated users can update vehicles"
  on vehicles for update
  to authenticated
  using (true);

create policy "authenticated users can delete vehicles"
  on vehicles for delete
  to authenticated
  using (true);
