import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 py-16 font-sans dark:bg-zinc-950">
      <main className="flex w-full max-w-lg flex-col gap-8 rounded-2xl border border-zinc-200 bg-white p-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div>
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            Vercel 検証用ページ
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            React + Next.js
          </h1>
        </div>
        <ul className="flex flex-col gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <li>
            <Link
              className="font-medium text-emerald-700 underline underline-offset-4 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300"
              href="/api/health"
            >
              GET /api/health
            </Link>
            <span className="text-zinc-500"> — サーバー応答の確認</span>
          </li>
          <li>
            <Link
              className="font-medium text-emerald-700 underline underline-offset-4 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300"
              href="/api/supabase-status"
            >
              GET /api/supabase-status
            </Link>
            <span className="text-zinc-500">
              {" "}
              — 環境変数と Supabase 接続の確認
            </span>
          </li>
        </ul>
        <div className="rounded-2xl border border-dashed border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
            追加したサンプルページ
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <Link
              className="rounded-full bg-zinc-100 px-3 py-1.5 font-medium text-zinc-700 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              href="/about"
            >
              /about
            </Link>
            <Link
              className="rounded-full bg-zinc-100 px-3 py-1.5 font-medium text-zinc-700 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              href="/blog"
            >
              /blog
            </Link>
            <Link
              className="rounded-full bg-zinc-100 px-3 py-1.5 font-medium text-zinc-700 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              href="/supabase"
            >
              /supabase
            </Link>
            <Link
              className="rounded-full bg-zinc-100 px-3 py-1.5 font-medium text-zinc-700 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              href="/neon"
            >
              /neon
            </Link>
          </div>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-500">
          ローカル: <code className="rounded bg-zinc-100 px-1 py-0.5 dark:bg-zinc-800">cp .env.example .env.local</code>{" "}
          を編集。本番は Vercel プロジェクトに Supabase を接続すると同名の変数が入ります。
        </p>
      </main>
    </div>
  );
}
