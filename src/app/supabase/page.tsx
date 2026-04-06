import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

/** Supabase Table Editor のテーブル名（public スキーマ）に合わせる */
const DATA_TABLE = "test";

function parseKeyword(searchParams: Record<string, string | string[] | undefined>) {
  const q = searchParams.q;
  if (typeof q === "string") return q.trim();
  if (Array.isArray(q) && typeof q[0] === "string") return q[0].trim();
  return "";
}

/** PostgREST の .or() 用に % _ \ とカンマを弱める（カンマは区切りと解釈されないよう除去） */
function escapeIlikeForOrFilter(raw: string): string {
  return raw
    .replace(/,/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");
}

export default async function ListPage(props: PageProps<"/supabase">) {
  const searchParams = await props.searchParams;
  const keyword = parseKeyword(searchParams);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  let rows: Record<string, unknown>[] | null = null;
  let message: string | null = null;

  if (!url || !anon) {
    message =
      "Supabase の接続情報が未設定です。プロジェクト直下の .env.local に NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を記入してください（Supabase Dashboard → Project Settings → API）。保存したら開発サーバーを再起動してください。本番では Vercel の Storage で Supabase を Connect すると同名の変数が入ります。";
  } else {
    const supabase = await createClient();

    let query = supabase.from(DATA_TABLE).select("*");
    if (keyword) {
      const pattern = `%${escapeIlikeForOrFilter(keyword)}%`;
      query = query.or(`title.ilike.${pattern},text.ilike.${pattern}`);
    }
    const { data, error } = await query.limit(50);

    if (error) {
      message = `${error.message}（テーブル「${DATA_TABLE}」の参照を確認してください。RLS で anon が拒否されていないかも確認）`;
    } else {
      rows = (data ?? []) as Record<string, unknown>[];
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50 px-6 py-16 text-zinc-900">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 rounded-[2rem] border border-amber-100 bg-white/90 p-10 shadow-sm backdrop-blur">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-600">
            List
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">SUPABASEからデータを取り込むテスト</h1>
        </div>

        <form
          method="get"
          action="/supabase"
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <label htmlFor="search-q" className="text-xs font-medium text-zinc-500">
              キーワード（title / text を部分一致・大文字小文字無視）
            </label>
            <input
              id="search-q"
              name="q"
              type="search"
              defaultValue={keyword}
              placeholder="例: テスト"
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none ring-amber-200 placeholder:text-zinc-400 focus:border-amber-300 focus:ring-2"
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
                href="/supabase"
                className="rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
              >
                クリア
              </Link>
            ) : null}
          </div>
        </form>

        <div id="data-list" className="space-y-4">
          {message ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-900">
              {message}
            </p>
          ) : rows?.length === 0 ? (
            keyword ? (
              <p className="text-sm text-zinc-600">
                「{keyword}」に一致する行はありません（title / text のいずれかに部分一致する行のみ表示します）。
              </p>
            ) : (
              <div className="space-y-3 text-sm text-zinc-600">
                <p>
                  テーブル「{DATA_TABLE}」に対する API の結果が 0 件です。Table Editor では行が見えるのにこうなる場合、
                  <strong className="font-medium text-zinc-800"> Row Level Security（RLS）で anon が読めない</strong>
                  ことが多いです（Table Editor は別ロールで見えます）。
                </p>
                <p>Supabase の SQL Editor で次を実行し、anon の SELECT を許可してからページを再読み込みしてください。</p>
                <pre className="overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-800">
{`alter table public.${DATA_TABLE} enable row level security;

create policy "anon_select_${DATA_TABLE}"
on public.${DATA_TABLE}
for select
to anon
using (true);`}
                </pre>
                <p className="text-xs text-zinc-500">
                  本番では `using (true)` の代わりに、必要な条件だけ見えるポリシーに差し替えてください。
                </p>
              </div>
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
