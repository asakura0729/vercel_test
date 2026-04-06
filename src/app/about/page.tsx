import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-16 text-zinc-900">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 rounded-3xl border border-zinc-200 bg-white p-10 shadow-sm">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">
            About
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">このページについて</h1>
          <p className="text-base leading-7 text-zinc-600">
            これはサンプル用に追加した `/about` ページです。App Router
            のルーティング確認や、レイアウト共有の動作確認に使えます。
          </p>
        </div>

        <div className="rounded-2xl bg-zinc-100 p-6 text-sm leading-6 text-zinc-700">
          Next.js では `src/app/about/page.tsx` を置くと `/about`
          が公開されます。今回のページはその最小例です。
        </div>

        <Link
          href="/"
          className="w-fit rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-100"
        >
          トップへ戻る
        </Link>
      </div>
    </main>
  );
}
