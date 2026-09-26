create extension if not exists pgcrypto;

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null default '',
  created_at timestamptz not null default now()
);

create table public.items (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  stock_grams integer not null default 0 check (stock_grams >= 0),
  sale_price_per_kg integer not null check (sale_price_per_kg > 0),
  created_at timestamptz not null default now()
);

create table public.sales (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete restrict,
  total integer not null default 0 check (total >= 0),
  created_at timestamptz not null default now()
);

create table public.sale_lines (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales (id) on delete cascade,
  item_id uuid not null references public.items (id) on delete restrict,
  grams integer not null check (grams > 0),
  amount integer not null check (amount >= 0)
);

create table public.stock_entries (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items (id) on delete restrict,
  grams integer not null check (grams > 0),
  type text not null check (type in ('in', 'out')),
  created_at timestamptz not null default now()
);

create index customers_name_idx on public.customers (name);
create index sales_customer_id_idx on public.sales (customer_id);
create index sales_created_at_idx on public.sales (created_at desc);
create index sale_lines_sale_id_idx on public.sale_lines (sale_id);
create index stock_entries_item_id_idx on public.stock_entries (item_id);

alter table public.customers enable row level security;
alter table public.items enable row level security;
alter table public.sales enable row level security;
alter table public.sale_lines enable row level security;
alter table public.stock_entries enable row level security;

create policy "customers_all" on public.customers for all using (true) with check (true);
create policy "items_all" on public.items for all using (true) with check (true);
create policy "sales_all" on public.sales for all using (true) with check (true);
create policy "sale_lines_all" on public.sale_lines for all using (true) with check (true);
create policy "stock_entries_all" on public.stock_entries for all using (true) with check (true);

insert into public.customers (id, name, phone) values
  ('11111111-1111-1111-1111-111111111111', 'Ali General Store', '0300-1111111'),
  ('22222222-2222-2222-2222-222222222222', 'City Mart', '0300-2222222'),
  ('33333333-3333-3333-3333-333333333333', 'Fresh Hub', '0300-3333333');

insert into public.items (id, name, stock_grams, sale_price_per_kg) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Basmati Rice', 52000, 280),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Wheat Flour', 80000, 140),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'White Sugar', 24500, 180),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Red Lentils', 18750, 260);

insert into public.stock_entries (item_id, grams, type) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 52000, 'in'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 80000, 'in'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 27000, 'in'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 5000, 'out'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 2500, 'out');
