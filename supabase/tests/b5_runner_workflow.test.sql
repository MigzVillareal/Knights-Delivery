begin;
select plan(13);

insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('10000000-0000-4000-8000-000000000011', 'authenticated', 'authenticated', 'b5-runner-one@example.test', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('10000000-0000-4000-8000-000000000012', 'authenticated', 'authenticated', 'b5-runner-two@example.test', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('10000000-0000-4000-8000-000000000013', 'authenticated', 'authenticated', 'b5-customer@example.test', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now());

insert into public.profiles (id) values
  ('10000000-0000-4000-8000-000000000011'),
  ('10000000-0000-4000-8000-000000000012'),
  ('10000000-0000-4000-8000-000000000013');
insert into public.runner_applications (user_id, status) values
  ('10000000-0000-4000-8000-000000000011', 'eligible'),
  ('10000000-0000-4000-8000-000000000012', 'eligible');
insert into public.requests (id, customer_id, category, item_details, pickup_address, pickup_instructions,
  dropoff_address, handoff_note, status)
values ('20000000-0000-4000-8000-000000000011', '10000000-0000-4000-8000-000000000013', 'food',
  'private food details', 'private pickup', 'private instructions', 'private drop-off', 'private note', 'open');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000011","role":"authenticated"}', true);

select is((select count(*)::int from public.list_runner_open_requests()), 1, 'eligible runner can see open queue');
select is((select item_summary from public.list_runner_open_requests()), 'Request in food', 'queue has generic non-sensitive summary');
select is((select to_jsonb(q) ? 'pickup_address' from public.list_runner_open_requests() q limit 1), false, 'queue does not return precise pickup address');
select is((select count(*)::int from public.accept_delivery_request('20000000-0000-4000-8000-000000000011')), 1, 'first eligible runner accepts open request');
select is((select status from public.requests where id = '20000000-0000-4000-8000-000000000011'), 'accepted', 'acceptance updates request state');
select throws_ok($$select * from public.accept_delivery_request('20000000-0000-4000-8000-000000000011')$$,
  'P0001', 'Request is not available', 'competing acceptance cannot claim the accepted request');
select is((select count(*)::int from public.request_events where request_id = '20000000-0000-4000-8000-000000000011'), 1, 'acceptance appends one history event');
select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000012","role":"authenticated"}', true);
select throws_ok($$select * from public.accept_delivery_request('20000000-0000-4000-8000-000000000011')$$,
  'P0001', 'Request is not available', 'a competing eligible runner cannot take an accepted request');
select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000011","role":"authenticated"}', true);
select is((select status from public.advance_delivery_request('20000000-0000-4000-8000-000000000011', 'start')), 'in_progress', 'assigned runner can start delivery');
select throws_ok($$select * from public.advance_delivery_request('20000000-0000-4000-8000-000000000011', 'start')$$,
  'P0001', 'Action is not allowed from the current state', 'invalid repeated transition is rejected');
select is((select count(*)::int from public.request_events where request_id = '20000000-0000-4000-8000-000000000011'), 2, 'lifecycle transition appends a history event');
select is((select status from public.report_delivery_issue('20000000-0000-4000-8000-000000000011', 'item concern', 'Package seal looked damaged.')), 'issue_reported', 'customer can report an issue on an active request');
select is((select count(*)::int from public.request_events where request_id = '20000000-0000-4000-8000-000000000011'), 3, 'issue report appends a history event');

select * from finish();
rollback;
