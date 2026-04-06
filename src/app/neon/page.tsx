import Link from "next/link";
import { neon } from "@neondatabase/serverless";

/**
 * Neon Console の public スキーマ（画像のテーブル定義に合わせる）
 * id: integer, user: varchar, text: text
 */
const DATA_TABLE = "test-table";

function parseKeyword(searchParams: Record<string, string | string[] | undefined>) {
  const q = searchParams.q;
  if (typeof q === "string") return q.trim();
  if (Array.isArray(q) && typeof q[0] === "string") return q[0].trim();
  return "";
}

/** PostgreSQL ILIKE ... ESCAPE '\\' 用に % _ \ をエスケープ */
function escapeIlikePattern(raw: string): string {
  return raw
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");
}

export default async function NeonListPage(props: PageProps<"/neon">) {
  const searchParams = await props.searchParams;
  const keyword = parseKeyword(searchParams);

  const databaseUrl = process.env.DATABASE_URL?.trim();

  let rows: Record<string, unknown>[] | null = null;
  let message: string | null = null;

  if (!databaseUrl) {
    message =
      "Neon の接続情報が未設定です。プロジェクト直下の .env.local に DATABASE_URL（接続文字列）を記入してください。Vercel で Neon を Storage から接続すると同名の変数が入ります。保存したら開発サーバーを再起動してください。";
  } else {
    try {
      const sql = neon(databaseUrl);
      if (!keyword) {
        rows = (await sql`
          SELECT * FROM public."test-table"
          ORDER BY id ASC
          LIMIT 50
        `) as Record<string, unknown>[];
      } else {
        const pattern = `%${escapeIlikePattern(keyword)}%`;
        rows = (await sql`
          SELECT * FROM public."test-table"
          WHERE
            "user" ILIKE ${pattern} ESCAPE '\'
            OR "text" ILIKE ${pattern} ESCAPE '\'
          ORDER BY id ASC
          LIMIT 50
        `) as Record<string, unknown>[];
      }
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      message = `${err}（テーブル「${DATA_TABLE}」・スキーマ public・DATABASE_URL を確認してください）`;
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-sky-50 px-6 py-16 text-zinc-900">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 rounded-[2rem] border border-cyan-100 bg-white/90 p-10 shadow-sm backdrop-blur">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-600">
            List
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Neon からデータを取り込むテスト
          </h1>
        </div>

        <form
          method="get"
          action="/neon"
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <label htmlFor="neon-search-q" className="text-xs font-medium text-zinc-500">
              キーワード（user / text を部分一致・大文字小文字無視）
            </label>
            <input
              id="neon-search-q"
              name="q"
              type="search"
              defaultValue={keyword}
              placeholder="例: マネージャー"
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none ring-cyan-200 placeholder:text-zinc-400 focus:border-cyan-300 focus:ring-2"
              autoComplete="off"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700"
            >
              検索
            </button>
            {keyword ? (
              <Link
                href="/neon"
                className="rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
              >
                クリア
              </Link>
            ) : null}
          </div>
        </form>

        <div id="data-list" className="space-y-4">
          {message ? (
            <p className="rounded-xl border border-cyan-200 bg-cyan-50/80 px-4 py-3 text-sm text-cyan-950">
              {message}
            </p>
          ) : rows?.length === 0 ? (
            keyword ? (
              <p className="text-sm text-zinc-600">
                「{keyword}」に一致する行はありません（user / text のいずれかに部分一致する行のみ表示します）。
              </p>
            ) : (
              <p className="text-sm text-zinc-600">
                テーブル「{DATA_TABLE}」の行が 0 件です。Neon Console の main ブランチにデータがあるか確認してください。
              </p>
            )
          ) : (
            rows?.map((row, i) => (
              <div
                key={String(row.id ?? `row-${i}`)}
                className="border-b border-zinc-200 pb-4 last:border-b-0"
              >
                <dl className="grid gap-1 text-sm">
                  {Object.entries(row).map(([key, val]) => (
                    <div key={key} className="grid gap-0.5 sm:grid-cols-[minmax(0,8rem)_1fr]">
                      <dt className="font-medium text-zinc-500">{key}</dt>
                      <dd className="break-all text-zinc-900">
                        {val === null
                          ? "null"
                          : typeof val === "object"
                            ? JSON.stringify(val)
                            : String(val)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))
          )}
        </div>
        <Link
          href="/"
          className="w-fit rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
        >
          トップへ戻る
        </Link>
      </div>
    </main>
  );
}
