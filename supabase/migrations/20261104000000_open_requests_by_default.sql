-- Temporary launch bypass: new customer requests enter the courier queue immediately.
-- This does not configure customer charges, courier payouts, or settlement.

alter table public.requests alter column status set default 'open';

with released as (
  update public.requests
  set status = 'open'
  where status = 'awaiting_policy'
  returning id
)
insert into public.request_events (request_id, actor_id, event_type, from_status, to_status, details)
select id, null, 'temporary_policy_bypass', 'awaiting_policy', 'open',
  pg_catalog.jsonb_build_object('reason', 'Temporary request visibility bypass')
from released;

create or replace function public.create_customer_request(
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
    p_customer_estimate_minor, p_customer_estimate_currency, 'open'
  ) returning * into created_request;

  insert into public.request_events (request_id, actor_id, event_type, to_status)
  values (created_request.id, (select auth.uid()), 'request_created', 'open');

  return next created_request;
end;
$$;
revoke all on function public.create_customer_request(text, text, text, text, text, text, text, bigint, text)
  from public, anon;
grant execute on function public.create_customer_request(text, text, text, text, text, text, text, bigint, text)
  to authenticated;
