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

-- Storage: the "vehicle-photos" bucket must be created manually (Storage ->
-- New bucket -> name "vehicle-photos" -> Public bucket). Marking a bucket
-- "public" only makes its files readable — uploads still need explicit RLS
-- policies on storage.objects, scoped to this bucket.

create policy "public can view vehicle photos"
  on storage.objects for select
  to public
  using (bucket_id = 'vehicle-photos');

create policy "authenticated users can upload vehicle photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'vehicle-photos');

create policy "authenticated users can update vehicle photos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'vehicle-photos');

create policy "authenticated users can delete vehicle photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'vehicle-photos');

-- Brands: CRUD entity for vehicle brands (name + logo), linked from vehicles.

create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  logo_url text,
  created_at timestamptz not null default now()
);

alter table brands enable row level security;

create policy "public can read brands"
  on brands for select
  using (true);

create policy "authenticated users can insert brands"
  on brands for insert
  to authenticated
  with check (true);

create policy "authenticated users can update brands"
  on brands for update
  to authenticated
  using (true);

create policy "authenticated users can delete brands"
  on brands for delete
  to authenticated
  using (true);

alter table vehicles
  drop column if exists brand,
  add column if not exists brand_id uuid references brands(id);

-- Storage: the "brand-logos" bucket must be created manually (Storage ->
-- New bucket -> name "brand-logos" -> Public bucket), same as vehicle-photos.

create policy "public can view brand logos"
  on storage.objects for select
  to public
  using (bucket_id = 'brand-logos');

create policy "authenticated users can upload brand logos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'brand-logos');

create policy "authenticated users can update brand logos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'brand-logos');

create policy "authenticated users can delete brand logos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'brand-logos');
