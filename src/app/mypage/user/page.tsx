import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";

type UserRow = Record<string, unknown>;

const USER_ID_KEY = "user-id";

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function columnKeys(rows: UserRow[]): string[] {
  const set = new Set<string>();
  for (const row of rows) {
    for (const k of Object.keys(row)) set.add(k);
  }
  return Array.from(set).sort();
}

function headerLabel(key: string): string {
  if (key === USER_ID_KEY) return "Email";
  return key;
}

/** Auth のユーザー id → email（Service Role で listUsers。キーが無い場合は空） */
async function fetchAuthEmailsByUserId(): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) return out;

  try {
    const admin = createServiceRoleClient();
    let page = 1;
    const perPage = 200;
    for (;;) {
      const { data, error } = await admin.auth.admin.listUsers({
        page,
        perPage,
      });
      if (error) break;
      const batch = data?.users ?? [];
      for (const u of batch) {
        if (u.email) out.set(u.id, u.email);
      }
      if (batch.length < perPage) break;
      page += 1;
    }
  } catch {
    /* 列挙失敗時はフォールバックのみ */
  }
  return out;
}

function normalizeId(raw: unknown): string {
  if (typeof raw === "string") return raw;
  if (raw != null) return String(raw);
  return "";
}

function cellDisplay(params: {
  columnKey: string;
  row: UserRow;
  authEmails: Map<string, string>;
  sessionUserId: string | undefined;
  sessionEmail: string | undefined;
}): string {
  const { columnKey, row, authEmails, sessionUserId, sessionEmail } = params;
  if (columnKey !== USER_ID_KEY) {
    return formatCell(row[columnKey]);
  }
  const id = normalizeId(row[USER_ID_KEY]);
  if (!id) return "—";
  const fromAdmin = authEmails.get(id);
  if (fromAdmin) return fromAdmin;
  if (sessionUserId === id && sessionEmail) return sessionEmail;
  return "—";
}

export default async function MyPageUserList() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/mypage/login");
  }

  const [authEmails, { data, error }] = await Promise.all([
    fetchAuthEmailsByUserId(),
    supabase.from("user").select("*"),
  ]);

  const rows = (data ?? []) as UserRow[];
  const keys = columnKeys(rows);

  return (
    <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-indigo-50 px-4 py-14 text-zinc-900 sm:px-6">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-700">
              MyPage / user
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">ユーザー一覧</h1>
            <p className="text-sm text-zinc-600">
              Supabase のテーブル{" "}
              <code className="rounded bg-cyan-100/80 px-1.5 py-0.5 text-cyan-900">user</code>{" "}
              の行を表示しています。
              <span className="mt-1 block text-xs text-zinc-500">
                <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[0.7rem]">
                  user-id
                </code>{" "}
                列は Authentication のメールとして表示します（全件表示にはサーバー側の{" "}
                <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[0.7rem]">
                  SUPABASE_SERVICE_ROLE_KEY
                </code>{" "}
                が必要です。ない場合はログイン中のアカウント分のみ解決されます）。
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link
              href="/mypage/user/edit"
              className="rounded-full border border-cyan-200 bg-white px-4 py-2 font-medium text-cyan-900 shadow-sm transition hover:bg-cyan-50"
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
          <p className="rounded-2xl border border-dashed border-cyan-200 bg-white/80 p-8 text-center text-sm text-zinc-600">
            行がありません。
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-cyan-100 bg-white/90 shadow-sm backdrop-blur">
            <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-cyan-100 bg-cyan-50/60">
                  {keys.map((key) => (
                    <th
                      key={key}
                      className="whitespace-nowrap px-4 py-3 font-semibold text-cyan-950"
                    >
                      {headerLabel(key)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-cyan-50/80 odd:bg-white even:bg-cyan-50/20"
                  >
                    {keys.map((key) => (
                      <td key={key} className="max-w-[20rem] px-4 py-2.5 align-top text-zinc-800">
                        <span
                          className={
                            key === USER_ID_KEY
                              ? "line-clamp-3 break-all text-xs sm:text-sm"
                              : "line-clamp-3 break-all font-mono text-xs sm:text-sm"
                          }
                        >
                          {cellDisplay({
                            columnKey: key,
                            row,
                            authEmails,
                            sessionUserId: user.id,
                            sessionEmail: user.email ?? undefined,
                          })}
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
