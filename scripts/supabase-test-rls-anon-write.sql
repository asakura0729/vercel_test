-- public.test に対し、anon ロールの INSERT / UPDATE を許可する RLS ポリシー。
-- Supabase Dashboard → SQL Editor で実行してください。
--
-- 前提: RLS が有効で、SELECT 用に anon_select_test が既にある想定。
-- 本番では with check / using の true を、必要な条件（認証ユーザー限定など）に差し替えてください。

drop policy if exists "anon_insert_test" on public.test;
create policy "anon_insert_test"
on public.test
for insert
to anon
with check (true);

drop policy if exists "anon_update_test" on public.test;
create policy "anon_update_test"
on public.test
for update
to anon
using (true)
with check (true);
