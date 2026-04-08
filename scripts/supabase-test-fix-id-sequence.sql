-- test への INSERT で
--   duplicate key value violates unique constraint "test_pkey"
-- が出るときの対処（Supabase Dashboard → SQL Editor で実行）。
--
-- 原因の例:
-- - Table Editor や SQL で id を明示指定して行を入れた
-- - データのインポートでシーケンスが進められなかった
-- → 次の自動採番が既存の id とぶつかる。

DO $$
DECLARE
  m bigint;
  seq text;
BEGIN
  seq := pg_get_serial_sequence('public.test', 'id');
  IF seq IS NULL THEN
    RAISE EXCEPTION 'public.test.id にシーケンス / IDENTITY が見つかりません。Dashboard で列定義を確認してください。';
  END IF;
  SELECT COALESCE(MAX(id), 0) INTO m FROM public.test;
  IF m = 0 THEN
    PERFORM setval(seq::regclass, 1, false);
  ELSE
    PERFORM setval(seq::regclass, m, true);
  END IF;
END $$;
