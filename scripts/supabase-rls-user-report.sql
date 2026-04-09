-- public."user-report" 用 RLS（Supabase Dashboard → SQL Editor で実行）
--
-- 前提:
--   - 列 "user-id" が auth.users.id と同じ uuid である（= auth.uid() と比較できる）
--   - authenticated: 自分の "user-id" の行のみ SELECT / INSERT / UPDATE
--   - DELETE: ポリシーなしのため authenticated からは不可（必要なら別途追加）
--   - anon: アクセス不可
-- service_role は RLS をバイパスします。
--
-- 旧スキーマで "user-id" が integer などの場合、このままでは型が合いません。
-- Auth と紐づけるなら "user-id" を uuid（auth.users の id）に揃えてください。

alter table public."user-report" enable row level security;

drop policy if exists "user_report_select_own" on public."user-report";
drop policy if exists "user_report_insert_own" on public."user-report";
drop policy if exists "user_report_update_own" on public."user-report";

create policy "user_report_select_own"
on public."user-report"
for select
to authenticated
using ("user-id" = auth.uid());

create policy "user_report_insert_own"
on public."user-report"
for insert
to authenticated
with check ("user-id" = auth.uid());

create policy "user_report_update_own"
on public."user-report"
for update
to authenticated
using ("user-id" = auth.uid())
with check ("user-id" = auth.uid());

grant select, insert, update on table public."user-report" to authenticated;
