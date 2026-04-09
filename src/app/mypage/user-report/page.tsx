import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ReportRow = Record<string, unknown>;

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function columnKeys(rows: ReportRow[]): string[] {
  const set = new Set<string>();
  for (const row of rows) {
    for (const k of Object.keys(row)) set.add(k);
  }
  return Array.from(set).sort();
}

export default async function MyPageUserReportList() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/mypage/login");
  }

  const { data, error } = await supabase.from("user-report").select("*");

  const rows = (data ?? []) as ReportRow[];
  const keys = columnKeys(rows);

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 px-4 py-14 text-zinc-900 sm:px-6">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-rose-700">
              MyPage / user-report
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">レポート一覧</h1>
            <p className="text-sm text-zinc-600">
              Supabase のテーブル{" "}
              <code className="rounded bg-rose-100/80 px-1.5 py-0.5 text-rose-900">user-report</code>{" "}
              の行を表示しています（RLS により、自分に紐づく行のみ表示される場合があります）。
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link
              href="/mypage/user-report/edit"
              className="rounded-full border border-rose-200 bg-white px-4 py-2 font-medium text-rose-900 shadow-sm transition hover:bg-rose-50"
            >
              編集ページへ
            </Link>
            <Link
              href="/mypage/dashboard"
              className="rounded-full bg-zinc-900 px-4 py-2 font-medium text-white transition hover:bg-zinc-700"
            >
              ダッシュボード
            </Link>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50/90 p-4 text-sm text-red-800">
            <p className="font-medium">読み込みエラー</p>
            <p className="mt-1 font-mono text-xs">{error.message}</p>
          </div>
        ) : rows.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-rose-200 bg-white/80 p-8 text-center text-sm text-zinc-600">
            行がありません。
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-rose-100 bg-white/90 shadow-sm backdrop-blur">
            <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-rose-100 bg-rose-50/60">
                  {keys.map((key) => (
                    <th
                      key={key}
                      className="whitespace-nowrap px-4 py-3 font-semibold text-rose-950"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-rose-50/80 odd:bg-white even:bg-rose-50/20"
                  >
                    {keys.map((key) => (
                      <td key={key} className="max-w-[24rem] px-4 py-2.5 align-top text-zinc-800">
                        <span className="line-clamp-4 break-all font-mono text-xs sm:text-sm">
                          {formatCell(row[key])}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
