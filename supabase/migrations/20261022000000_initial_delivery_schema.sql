create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) <= 120),
  phone text check (phone is null or char_length(phone) <= 32),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete restrict,
  assigned_runner_id uuid references public.profiles (id) on delete set null,
  category text not null,
  item_details text not null,
  pickup_address text not null,
  pickup_instructions text,
  dropoff_address text not null,
  dropoff_instructions text,
  handoff_note text,
  customer_estimate_minor bigint,
  customer_estimate_currency text,
  status text not null default 'open'
    check (status in ('open', 'accepted', 'in_progress', 'delivered', 'completed', 'cancelled', 'issue_reported', 'resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (customer_estimate_minor is null or customer_estimate_minor >= 0),
  check (
    (customer_estimate_minor is null and customer_estimate_currency is null)
    or (customer_estimate_minor is not null and customer_estimate_currency is not null
      and char_length(customer_estimate_currency) = 3)
  )
);

create table public.request_events (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests (id) on delete cascade,
  actor_id uuid references auth.users (id) on delete set null,
  event_type text not null,
  from_status text,
  to_status text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index requests_customer_created_idx on public.requests (customer_id, created_at desc);
create index requests_runner_created_idx on public.requests (assigned_runner_id, created_at desc)
  where assigned_runner_id is not null;
create index request_events_request_created_idx on public.request_events (request_id, created_at);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;
revoke all on function public.set_updated_at() from public, anon, authenticated;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger requests_set_updated_at
  before update on public.requests
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.requests enable row level security;
alter table public.request_events enable row level security;

revoke all on table public.profiles, public.requests, public.request_events from anon, authenticated;
grant select, insert, update on table public.profiles to authenticated;
grant select, insert on table public.requests to authenticated;
grant select on table public.request_events to authenticated;

create policy profiles_select_own
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

create policy profiles_insert_own
  on public.profiles for insert to authenticated
  with check (id = (select auth.uid()));

create policy profiles_update_own
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy requests_select_own
  on public.requests for select to authenticated
  using (customer_id = (select auth.uid()));

create policy requests_insert_own
  on public.requests for insert to authenticated
  with check (
    customer_id = (select auth.uid())
    and assigned_runner_id is null
    and status = 'open'
  );

create policy request_events_select_own
  on public.request_events for select to authenticated
  using (
    exists (
      select 1
      from public.requests r
      where r.id = request_id
        and r.customer_id = (select auth.uid())
    )
  );
