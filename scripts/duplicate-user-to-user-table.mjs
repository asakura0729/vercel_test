import postgres from "postgres";

function pickSupabasePostgresUrl() {
  const direct = process.env.SUPABASE_DATABASE_URL?.trim();
  if (direct) return direct;

  const pooler = process.env.POSTGRES_URL?.trim();
  if (pooler && /supabase\.(co|com)/i.test(pooler)) return pooler;

  return "";
}

const url = pickSupabasePostgresUrl();
if (!url) {
  console.error(
    "Supabase の Postgres URI が未設定です。\n" +
      "  .env.local に SUPABASE_DATABASE_URL=... を追加するか、\n" +
      "  Vercel の Development の POSTGRES_URL（Supabase ホスト）を使ってください。"
  );
  process.exit(1);
}

const sql = postgres(url, { max: 1, connect_timeout: 30 });

try {
  const exists = await sql`
    select 1 as ok
    from pg_catalog.pg_tables
    where schemaname = 'public' and tablename = 'user-table'
    limit 1
  `;
  if (exists.length) {
    console.error('public."user-table" は既に存在します。削除してから再実行してください。');
    process.exit(1);
  }

  await sql.begin(async (txn) => {
    await txn.unsafe(
      `create table public."user-table" (like public."user" including all)`
    );
    await txn.unsafe(
      `insert into public."user-table" select * from public."user"`
    );
  });

  const [{ n }] = await sql`select count(*)::int as n from public."user-table"`;
  console.log(`OK: public."user-table" を作成し、${n} 行をコピーしました。`);
} catch (e) {
  const msg = e instanceof Error ? e.message : String(e);
  console.error(msg);
  process.exit(1);
} finally {
  await sql.end({ timeout: 10 });
}
