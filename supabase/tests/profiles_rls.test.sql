begin;
select plan(14);

insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('10000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'b3-user-one@example.test', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('10000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'b3-user-two@example.test', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now());

insert into public.profiles (id, display_name)
values
  ('10000000-0000-4000-8000-000000000001', 'First test user'),
  ('10000000-0000-4000-8000-000000000002', 'Second test user');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}', true);

select is((select count(*)::int from public.profiles), 1, 'user can read one own profile');
select is((select display_name from public.profiles), 'First test user', 'user cannot read another profile');
select lives_ok($$update public.profiles set display_name = 'Updated name' where id = auth.uid()$$,
  'user can update own profile');
select is((select display_name from public.profiles), 'Updated name', 'own profile update is visible');
select throws_ok($$insert into public.profiles (id) values ('10000000-0000-4000-8000-000000000002')$$,
  '42501', null, 'user cannot insert a profile for another user');
select throws_ok($$update public.profiles set id = '10000000-0000-4000-8000-000000000002' where id = auth.uid()$$,
  '42501', null, 'user cannot change profile ownership');
select lives_ok($$select * from public.create_customer_request(
  'food', 'Test item details', 'Test pickup', null, 'Test drop-off', null, null, null, null
)$$, 'authenticated customer can create a policy-pending request');
select is((select count(*)::int from public.requests), 1, 'customer can read the new own request');
select is((select status from public.requests limit 1), 'awaiting_policy', 'unpriced request is not posted to the runner queue');
select is((select count(*)::int from public.request_events), 1, 'request creation history is written atomically');

select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000002","role":"authenticated"}', true);
select is((select count(*)::int from public.profiles), 1, 'second user can read only their own profile');
select is((select display_name from public.profiles), 'Second test user', 'second profile is isolated');
select is((select count(*)::int from public.requests), 0, 'second user cannot read the first user request');
select is((select count(*)::int from public.request_events), 0, 'second user cannot read the first user request history');

select * from finish();
rollback;
