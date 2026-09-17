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

-- Before running this block, snapshot old values for manual reference:
--   select id, brand from vehicles;
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'vehicles' and column_name = 'brand'
  ) and not exists (
    select 1 from information_schema.columns
    where table_name = 'vehicles' and column_name = 'legacy_brand'
  ) then
    alter table vehicles rename column brand to legacy_brand;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_name = 'vehicles' and column_name = 'legacy_brand'
  ) then
    alter table vehicles alter column legacy_brand drop not null;
  end if;
end $$;

alter table vehicles
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

-- Company contact: singleton row (whatsapp, email, address) shown on
-- /contato, the footer and the vehicle WhatsApp button. The `check (id)`
-- constraint on a boolean primary key enforces at most one row.

create table if not exists company_contact (
  id boolean primary key default true,
  whatsapp text not null default '',
  email text not null default '',
  address text not null default '',
  updated_at timestamptz not null default now(),
  constraint company_contact_singleton check (id)
);

alter table company_contact drop column if exists phone;

insert into company_contact (id) values (true) on conflict (id) do nothing;

alter table company_contact
  add column if not exists instagram_url text not null default '',
  add column if not exists facebook_url text not null default '';

update company_contact
  set instagram_url = 'https://www.instagram.com/vsmotorsjundiai/'
  where instagram_url = '';

update company_contact
  set facebook_url = 'https://www.facebook.com/profile.php?id=61593187356900'
  where facebook_url = '';

alter table company_contact enable row level security;

create policy "public can read company contact"
  on company_contact for select
  using (true);

create policy "authenticated users can update company contact"
  on company_contact for update
  to authenticated
  using (true);

-- Accessories: CRUD entity for vehicle accessories (name only), linked to
-- vehicles through a join table so a vehicle can have many accessories and
-- an accessory can belong to many vehicles.

create table if not exists accessories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

alter table accessories enable row level security;

create policy "public can read accessories"
  on accessories for select
  using (true);

create policy "authenticated users can insert accessories"
  on accessories for insert
  to authenticated
  with check (true);

create policy "authenticated users can update accessories"
  on accessories for update
  to authenticated
  using (true);

create policy "authenticated users can delete accessories"
  on accessories for delete
  to authenticated
  using (true);

create table if not exists vehicle_accessories (
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  accessory_id uuid not null references accessories(id) on delete cascade,
  primary key (vehicle_id, accessory_id)
);

alter table vehicle_accessories enable row level security;

create policy "public can read vehicle accessories"
  on vehicle_accessories for select
  using (true);

create policy "authenticated users can insert vehicle accessories"
  on vehicle_accessories for insert
  to authenticated
  with check (true);

create policy "authenticated users can delete vehicle accessories"
  on vehicle_accessories for delete
  to authenticated
  using (true);

-- Body types: CRUD entity for vehicle body styles (name only), linked from
-- vehicles the same way brands are (a single optional foreign key).

create table if not exists body_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

alter table body_types enable row level security;

create policy "public can read body types"
  on body_types for select
  using (true);

create policy "authenticated users can insert body types"
  on body_types for insert
  to authenticated
  with check (true);

create policy "authenticated users can update body types"
  on body_types for update
  to authenticated
  using (true);

create policy "authenticated users can delete body types"
  on body_types for delete
  to authenticated
  using (true);

insert into body_types (name)
values ('Sedã'), ('Hatch'), ('SUV'), ('Picape'), ('Perua'), ('Coupé'), ('Conversível'), ('Minivan')
on conflict (name) do nothing;

alter table vehicles
  add column if not exists body_type_id uuid references body_types(id);
