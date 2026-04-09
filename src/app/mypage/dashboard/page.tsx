import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "./logout-button";

export default async function MyPageDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/mypage/login");
  }

  const label =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email ??
    "ユーザー";

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-sky-50 px-6 py-16 text-zinc-900">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6 rounded-[2rem] border border-violet-100 bg-white/90 p-10 shadow-sm backdrop-blur">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-600">
            Dashboard
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">マイページ</h1>
          <p className="text-sm text-zinc-600">
            ログイン中:{" "}
            <span className="font-medium text-zinc-800">{label}</span>
          </p>
          {user.email ? (
            <p className="text-xs text-zinc-500">{user.email}</p>
          ) : null}
        </div>

        <div className="space-y-3 rounded-2xl border border-violet-100 bg-violet-50/40 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-violet-600">
            データ一覧
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/mypage/user"
              className="flex flex-1 items-center justify-between gap-2 rounded-xl border border-cyan-200/80 bg-white px-4 py-3 text-sm font-medium text-cyan-950 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50/80"
            >
              <span>ユーザー（user）</span>
              <span aria-hidden className="text-cyan-600">
                →
              </span>
            </Link>
            <Link
              href="/mypage/user-report"
              className="flex flex-1 items-center justify-between gap-2 rounded-xl border border-rose-200/80 bg-white px-4 py-3 text-sm font-medium text-rose-950 shadow-sm transition hover:border-rose-300 hover:bg-rose-50/80"
            >
              <span>レポート（user-report）</span>
              <span aria-hidden className="text-rose-600">
                →
              </span>
            </Link>
          </div>
        </div>

        <LogoutButton />
        <Link
          href="/"
          className="w-fit text-sm font-medium text-violet-700 underline-offset-4 hover:underline"
        >
          トップへ戻る
        </Link>
      </div>
    </main>
  );
}
