-- 実験用テーブル（Supabase Dashboard → SQL Editor でも実行可）

create table if not exists public.sampletable (
  id bigint generated always as identity primary key,
  label text,
  note text,
  created_at timestamptz not null default now()
);

insert into public.sampletable (label, note)
select *
from (
  values
    ('demo-a', '実験用の初期行（任意）'),
    ('demo-b', '消しても問題ありません')
) as v(label, note)
where not exists (select 1 from public.sampletable);
