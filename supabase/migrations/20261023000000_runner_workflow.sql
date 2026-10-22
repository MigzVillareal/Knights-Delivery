-- Runner eligibility is controlled by trusted project operators, never by the user.
create table public.runner_applications (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'eligible', 'ineligible')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index requests_open_created_idx on public.requests (created_at desc, id desc) where status = 'open';
create trigger runner_applications_set_updated_at
  before update on public.runner_applications
  for each row execute function public.set_updated_at();
alter table public.runner_applications enable row level security;
revoke all on table public.runner_applications from anon, authenticated;
grant select, insert on table public.runner_applications to authenticated;
create policy requests_select_assigned_runner
  on public.requests for select to authenticated
  using (
    assigned_runner_id = (select auth.uid())
    and exists (
      select 1 from public.runner_applications a
      where a.user_id = (select auth.uid()) and a.status = 'eligible'
    )
  );

create policy request_events_select_assigned_runner
  on public.request_events for select to authenticated
  using (
    exists (
      select 1 from public.requests r
      where r.id = request_id and r.assigned_runner_id = (select auth.uid())
    )
  );

create policy runner_applications_select_own
  on public.runner_applications for select to authenticated
  using (user_id = (select auth.uid()));

create policy runner_applications_insert_own
  on public.runner_applications for insert to authenticated
  with check (user_id = (select auth.uid()) and status = 'pending');

create function public.accept_delivery_request(p_request_id uuid)
returns setof public.requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  accepted_request public.requests;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.runner_applications a
    where a.user_id = (select auth.uid()) and a.status = 'eligible'
  ) then
    raise exception 'Runner is not eligible' using errcode = '42501';
  end if;

  update public.requests
  set assigned_runner_id = (select auth.uid()), status = 'accepted'
  where id = p_request_id and status = 'open'
  returning * into accepted_request;

  if not found then
    raise exception 'Request is not available' using errcode = 'P0001';
  end if;

  insert into public.request_events (request_id, actor_id, event_type, from_status, to_status)
  values (accepted_request.id, (select auth.uid()), 'request_accepted', 'open', 'accepted');
  return next accepted_request;
end;
$$;
revoke all on function public.accept_delivery_request(uuid) from public, anon;
grant execute on function public.accept_delivery_request(uuid) to authenticated;

create function public.list_runner_open_requests(
  p_limit integer default 20,
  p_before_created_at timestamptz default null,
  p_before_id uuid default null
)
returns table (
  id uuid, category text, item_summary text, pickup_area text, dropoff_area text,
  status text, quote jsonb, created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_limit is null or p_limit < 1 or p_limit > 100
    or ((p_before_created_at is null) <> (p_before_id is null)) then
    raise exception 'Invalid runner queue pagination' using errcode = '22023';
  end if;
  if auth.uid() is null or not exists (
    select 1 from public.runner_applications a
    where a.user_id = (select auth.uid()) and a.status = 'eligible'
  ) then
    raise exception 'Runner is not eligible' using errcode = '42501';
  end if;
  return query
    select r.id, r.category, ('Request in ' || r.category)::text,
      null::text, null::text, r.status, null::jsonb, r.created_at
    from public.requests r
    where r.status = 'open'
      and (p_before_created_at is null or (r.created_at, r.id) < (p_before_created_at, p_before_id))
    order by r.created_at desc, r.id desc
    limit p_limit + 1;
end;
$$;
revoke all on function public.list_runner_open_requests(integer, timestamptz, uuid) from public, anon;
grant execute on function public.list_runner_open_requests(integer, timestamptz, uuid) to authenticated;

create function public.list_runner_assigned_requests(
  p_limit integer default 20,
  p_before_created_at timestamptz default null,
  p_before_id uuid default null
)
returns setof public.requests
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_limit is null or p_limit < 1 or p_limit > 100
    or ((p_before_created_at is null) <> (p_before_id is null)) then
    raise exception 'Invalid assigned request pagination' using errcode = '22023';
  end if;
  if auth.uid() is null or not exists (
    select 1 from public.runner_applications a
    where a.user_id = (select auth.uid()) and a.status = 'eligible'
  ) then
    raise exception 'Runner is not eligible' using errcode = '42501';
  end if;
  return query select r.* from public.requests r
    where r.assigned_runner_id = (select auth.uid())
      and (p_before_created_at is null or (r.created_at, r.id) < (p_before_created_at, p_before_id))
    order by r.created_at desc, r.id desc
    limit p_limit + 1;
end;
$$;
revoke all on function public.list_runner_assigned_requests(integer, timestamptz, uuid) from public, anon;
grant execute on function public.list_runner_assigned_requests(integer, timestamptz, uuid) to authenticated;

create function public.submit_runner_application()
returns setof public.runner_applications
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  insert into public.profiles (id) values ((select auth.uid())) on conflict (id) do nothing;
  insert into public.runner_applications (user_id, status)
    values ((select auth.uid()), 'pending') on conflict (user_id) do nothing;
  return query select a.* from public.runner_applications a where a.user_id = (select auth.uid());
end;
$$;
revoke all on function public.submit_runner_application() from public, anon;
grant execute on function public.submit_runner_application() to authenticated;

create function public.advance_delivery_request(p_request_id uuid, p_action text)
returns setof public.requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_request public.requests;
  previous_status text;
  next_status text;
  event_name text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select * into current_request from public.requests where id = p_request_id for update;
  if not found or current_request.assigned_runner_id is distinct from (select auth.uid()) then
    raise exception 'Request is not assigned to this runner' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.runner_applications a
    where a.user_id = (select auth.uid()) and a.status = 'eligible'
  ) then
    raise exception 'Runner is not eligible' using errcode = '42501';
  end if;
  previous_status := current_request.status;

  if p_action = 'start' and current_request.status = 'accepted' then
    next_status := 'in_progress'; event_name := 'delivery_started';
  elsif p_action = 'mark_delivered' and current_request.status = 'in_progress' then
    next_status := 'delivered'; event_name := 'delivery_marked_delivered';
  else
    raise exception 'Action is not allowed from the current state' using errcode = 'P0001';
  end if;

  update public.requests set status = next_status where id = p_request_id returning * into current_request;
  insert into public.request_events (request_id, actor_id, event_type, from_status, to_status)
  values (p_request_id, (select auth.uid()), event_name, previous_status, next_status);
  return next current_request;
end;
$$;
revoke all on function public.advance_delivery_request(uuid, text) from public, anon;
grant execute on function public.advance_delivery_request(uuid, text) to authenticated;

create function public.report_delivery_issue(p_request_id uuid, p_reason text, p_description text)
returns setof public.requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_request public.requests;
  previous_status text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  select * into current_request from public.requests
  where id = p_request_id and (customer_id = (select auth.uid()) or assigned_runner_id = (select auth.uid()))
  for update;
  if not found then
    raise exception 'Issue cannot be reported for this request' using errcode = 'P0001';
  end if;
  if p_reason is null or char_length(pg_catalog.btrim(p_reason)) not between 1 and 100
    or (p_description is not null and char_length(p_description) > 1000) then
    raise exception 'Invalid issue details' using errcode = '22023';
  end if;
  if current_request.assigned_runner_id = (select auth.uid()) and not exists (
    select 1 from public.runner_applications a
    where a.user_id = (select auth.uid()) and a.status = 'eligible'
  ) then
    raise exception 'Runner is not eligible' using errcode = '42501';
  end if;
  if current_request.status not in ('accepted', 'in_progress', 'delivered') then
    raise exception 'Issue cannot be reported for this request' using errcode = 'P0001';
  end if;
  previous_status := current_request.status;

  update public.requests set status = 'issue_reported' where id = p_request_id returning * into current_request;
  insert into public.request_events (request_id, actor_id, event_type, from_status, to_status, details)
  values (p_request_id, (select auth.uid()), 'issue_reported', previous_status, 'issue_reported',
    pg_catalog.jsonb_build_object('reason', p_reason, 'description', p_description));
  return next current_request;
end;
$$;
revoke all on function public.report_delivery_issue(uuid, text, text) from public, anon;
grant execute on function public.report_delivery_issue(uuid, text, text) to authenticated;

create function public.list_delivery_request_events(p_request_id uuid)
returns setof public.request_events
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not exists (
    select 1 from public.requests r
    where r.id = p_request_id
      and (r.customer_id = (select auth.uid()) or r.assigned_runner_id = (select auth.uid()))
  ) then
    raise exception 'Request history is not available' using errcode = '42501';
  end if;
  if exists (
    select 1 from public.requests r where r.id = p_request_id and r.assigned_runner_id = (select auth.uid())
  ) and not exists (
    select 1 from public.runner_applications a
    where a.user_id = (select auth.uid()) and a.status = 'eligible'
  ) then
    raise exception 'Runner is not eligible' using errcode = '42501';
  end if;
  return query select e.* from public.request_events e
    where e.request_id = p_request_id order by e.created_at asc, e.id asc;
end;
$$;
revoke all on function public.list_delivery_request_events(uuid) from public, anon;
grant execute on function public.list_delivery_request_events(uuid) to authenticated;

