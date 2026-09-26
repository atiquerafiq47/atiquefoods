create table public.returns (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales (id) on delete restrict,
  customer_id uuid not null references public.customers (id) on delete restrict,
  total integer not null default 0 check (total >= 0),
  created_at timestamptz not null default now()
);

create table public.return_lines (
  id uuid primary key default gen_random_uuid(),
  return_id uuid not null references public.returns (id) on delete cascade,
  item_id uuid not null references public.items (id) on delete restrict,
  grams integer not null check (grams > 0),
  amount integer not null check (amount >= 0)
);

alter table public.sale_lines
  add column if not exists returned_grams integer not null default 0 check (returned_grams >= 0);

alter table public.stock_entries
  drop constraint if exists stock_entries_type_check;

alter table public.stock_entries
  add constraint stock_entries_type_check check (type in ('in', 'out', 'return'));

create index returns_sale_id_idx on public.returns (sale_id);
create index returns_created_at_idx on public.returns (created_at desc);
create index return_lines_return_id_idx on public.return_lines (return_id);

alter table public.returns enable row level security;
alter table public.return_lines enable row level security;

create policy "returns_all" on public.returns for all using (true) with check (true);
create policy "return_lines_all" on public.return_lines for all using (true) with check (true);
