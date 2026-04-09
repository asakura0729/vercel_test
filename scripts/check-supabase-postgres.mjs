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
      "  .env.local に SUPABASE_DATABASE_URL=... を追加してください（Dashboard → Database → Connection string → URI）。"
  );
  process.exit(1);
}

const sql = postgres(url, { max: 1, connect_timeout: 20 });
try {
  await sql`select 1 as ok`;
  const tables = await sql`
    select tablename
    from pg_catalog.pg_tables
    where schemaname = 'public'
    order by tablename
  `;
  console.log("接続 OK。public スキーマのテーブル:");
  for (const row of tables) console.log(" ", row.tablename);
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
} finally {
  await sql.end({ timeout: 10 });
}
