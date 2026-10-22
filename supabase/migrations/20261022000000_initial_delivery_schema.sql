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
  status text not null default 'awaiting_policy'
    check (status in ('awaiting_policy', 'open', 'accepted', 'in_progress', 'delivered', 'completed', 'cancelled', 'issue_reported', 'resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (customer_estimate_minor is null or customer_estimate_minor >= 0),
  check (category = btrim(category) and category ~ '^[a-z][a-z0-9_-]*$'),
  check (item_details = btrim(item_details)),
  check (pickup_address = btrim(pickup_address)),
  check (dropoff_address = btrim(dropoff_address)),
  check (char_length(btrim(category)) between 1 and 40),
  check (char_length(btrim(item_details)) between 1 and 2000),
  check (char_length(btrim(pickup_address)) between 1 and 500),
  check (char_length(btrim(dropoff_address)) between 1 and 500),
  check (pickup_instructions is null or char_length(pickup_instructions) <= 1000),
  check (dropoff_instructions is null or char_length(dropoff_instructions) <= 1000),
  check (handoff_note is null or char_length(handoff_note) <= 1000),
  check (
    (customer_estimate_minor is null and customer_estimate_currency is null)
    or (customer_estimate_minor is not null and customer_estimate_currency is not null
      and customer_estimate_currency ~ '^[A-Z]{3}$')
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
grant select on table public.requests to authenticated;
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

create function public.create_customer_request(
  p_category text,
  p_item_details text,
  p_pickup_address text,
  p_pickup_instructions text,
  p_dropoff_address text,
  p_dropoff_instructions text,
  p_handoff_note text,
  p_customer_estimate_minor bigint,
  p_customer_estimate_currency text
)
returns setof public.requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  created_request public.requests;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  insert into public.profiles (id)
  values ((select auth.uid()))
  on conflict (id) do nothing;

  insert into public.requests (
    customer_id, category, item_details, pickup_address, pickup_instructions,
    dropoff_address, dropoff_instructions, handoff_note,
    customer_estimate_minor, customer_estimate_currency, status
  ) values (
    (select auth.uid()), p_category, p_item_details, p_pickup_address, p_pickup_instructions,
    p_dropoff_address, p_dropoff_instructions, p_handoff_note,
    p_customer_estimate_minor, p_customer_estimate_currency, 'awaiting_policy'
  ) returning * into created_request;

  insert into public.request_events (request_id, actor_id, event_type, to_status)
  values (created_request.id, (select auth.uid()), 'request_created', 'awaiting_policy');

  return next created_request;
end;
$$;
revoke all on function public.create_customer_request(text, text, text, text, text, text, text, bigint, text)
  from public, anon;
grant execute on function public.create_customer_request(text, text, text, text, text, text, text, bigint, text)
  to authenticated;
