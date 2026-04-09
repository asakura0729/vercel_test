import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import postgres from "postgres";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
    "Supabase の Postgres URI が必要です。.env.local に SUPABASE_DATABASE_URL= または\n" +
      "Supabase ホストの POSTGRES_URL を設定してください。"
  );
  process.exit(1);
}

const ddlPath = path.join(__dirname, "supabase-rls-user.sql");
const ddl = fs.readFileSync(ddlPath, "utf8");
const sql = postgres(url, { max: 1, connect_timeout: 30 });

try {
  await sql.unsafe(ddl);
  console.log("OK:", ddlPath);
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
} finally {
  await sql.end({ timeout: 10 });
}
