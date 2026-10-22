begin;
select plan(8);

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

select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000002","role":"authenticated"}', true);
select is((select count(*)::int from public.profiles), 1, 'second user can read only their own profile');
select is((select display_name from public.profiles), 'Second test user', 'second profile is isolated');

select * from finish();
rollback;
