-- public."user" 用 RLS（Supabase Dashboard → SQL Editor で実行）
--
-- 前提:
--   - "user-id" (uuid) = auth.users.id（auth.uid()）
--   - authenticated（Auth に登録済みの JWT）→ 全行を SELECT 可能
--   - authority が 'admin' の行を持つ認証ユーザー → INSERT / UPDATE / DELETE は従来どおり（全区画・削除は admin のみ）
--   - admin 以外の authenticated → 自分の行のみ INSERT / UPDATE（DELETE 不可）
--   - anon → アクセス不可
-- service_role は RLS をバイパスします。

-- 同一テーブルをポリシー内から読むと RLS 再帰になるため、admin 判定だけ DEFINER で行う
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public."user"
    where "user-id" = auth.uid()
      and authority = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public."user" enable row level security;

drop policy if exists "user_authenticated_select_own" on public."user";
drop policy if exists "user_authenticated_insert_own" on public."user";
drop policy if exists "user_authenticated_update_own" on public."user";
drop policy if exists "user_select_self_or_admin" on public."user";
drop policy if exists "user_select_authenticated_all" on public."user";
drop policy if exists "user_insert_self_or_admin" on public."user";
drop policy if exists "user_update_self_or_admin" on public."user";
drop policy if exists "user_delete_admin" on public."user";

-- 閲覧: Authentication にいるユーザー（authenticated ロール）なら全行読める
create policy "user_select_authenticated_all"
on public."user"
for select
to authenticated
using (true);

-- 作成: 自分の user-id の行のみ。admin は任意の行
create policy "user_insert_self_or_admin"
on public."user"
for insert
to authenticated
with check ("user-id" = auth.uid() or public.is_admin());

-- 更新: 自分の行のみ、または admin は全行（admin は WITH CHECK も通る）
create policy "user_update_self_or_admin"
on public."user"
for update
to authenticated
using ("user-id" = auth.uid() or public.is_admin())
with check ("user-id" = auth.uid() or public.is_admin());

-- 削除: admin のみ
create policy "user_delete_admin"
on public."user"
for delete
to authenticated
using (public.is_admin());

grant select, insert, update, delete on table public."user" to authenticated;
