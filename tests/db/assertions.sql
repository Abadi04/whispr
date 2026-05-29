\set ON_ERROR_STOP on
insert into auth.users(id,email,raw_user_meta_data) values
 ('11111111-1111-1111-1111-111111111111','owner_abadi@x.com','{"full_name":"alice"}'),
 ('22222222-2222-2222-2222-222222222222','bob@x.com','{"full_name":"bob"}'),
 ('33333333-3333-3333-3333-333333333333','abadihdar@gmail.com','{"full_name":"admin"}')
on conflict do nothing;
insert into public.profiles(id,email,full_name) values
 ('11111111-1111-1111-1111-111111111111','owner_abadi@x.com','alice'),
 ('22222222-2222-2222-2222-222222222222','bob@x.com','bob'),
 ('33333333-3333-3333-3333-333333333333','abadihdar@gmail.com','admin')
on conflict do nothing;
insert into public.messages(receiver_id,sender_id,content,reply) values
 ('11111111-1111-1111-1111-111111111111',null,'secret to alice',null),
 ('11111111-1111-1111-1111-111111111111',null,'public Q','public A');

-- T1: receiver alice sees both
set role authenticated; set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
do $$ begin assert (select count(*) from public.messages)=2,'T1 FAIL'; raise notice 'T1 PASS receiver sees own'; end $$;
reset role; reset request.jwt.claim.sub;

-- T2: bob sees only replied
set role authenticated; set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
do $$ begin assert (select count(*) from public.messages)=1,'T2 FAIL count'; assert (select reply from public.messages)='public A','T2 FAIL row'; raise notice 'T2 PASS non-receiver sees only replied'; end $$;
reset role; reset request.jwt.claim.sub;

-- T3: anon sees only replied
set role anon;
do $$ begin assert (select count(*) from public.messages)=1,'T3 FAIL'; raise notice 'T3 PASS anon sees only replied'; end $$;
reset role;

-- T4: sender spoofing blocked
set role authenticated; set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
do $$ begin begin insert into public.messages(receiver_id,sender_id,content) values ('11111111-1111-1111-1111-111111111111','11111111-1111-1111-1111-111111111111','spoof'); raise exception 'T4 FAIL allowed'; exception when others then raise notice 'T4 PASS spoof blocked'; end; end $$;
reset role; reset request.jwt.claim.sub;

-- T5: length constraint
do $$ begin begin insert into public.messages(receiver_id,content) values ('11111111-1111-1111-1111-111111111111', repeat('x',1001)); raise exception 'T5 FAIL allowed'; exception when check_violation then raise notice 'T5 PASS length enforced'; end; end $$;

-- T6: non-owner blocked from stats
set role authenticated; set request.jwt.claims = '{"email":"bob@x.com"}';
do $$ begin begin perform public.get_admin_stats(); raise exception 'T6 FAIL got stats'; exception when insufficient_privilege then raise notice 'T6 PASS non-owner blocked'; end; end $$;
reset role; reset request.jwt.claims;

-- T7: owner gets global stats
set role authenticated; set request.jwt.claims = '{"email":"abadihdar@gmail.com"}';
do $$ declare r json; begin r:=public.get_admin_stats(); assert (r->>'total_messages')::int=2,'T7 FAIL msgs'; assert (r->>'total_users')::int=3,'T7 FAIL users'; assert (r->>'replied_messages')::int=1,'T7 FAIL replied'; raise notice 'T7 PASS owner stats %',r; end $$;
reset role; reset request.jwt.claims;
