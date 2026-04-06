import Link from "next/link";

const posts = [
  {
    title: "最初のエントリー",
    excerpt: "ブログ一覧ページの見た目確認用に置いたダミー記事です。",
  },
  {
    title: "Next.js メモ",
    excerpt: "App Router と Tailwind を一緒に使う前提の仮コンテンツです。",
  },
  {
    title: "デプロイ準備",
    excerpt: "Vercel へ上げる前の確認項目を書く想定のダミーテキストです。",
  },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-16 text-zinc-50">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-400">
            Blog
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">ブログ一覧</h1>
          <p className="max-w-2xl text-base leading-7 text-zinc-400">
            ここでは記事一覧が並ぶ想定です。今はレイアウト確認用のダミーカードを表示しています。
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.title}
              className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Draft</p>
              <h2 className="mt-3 text-xl font-semibold text-white">{post.title}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{post.excerpt}</p>
            </article>
          ))}
        </div>

        <Link
          href="/"
          className="w-fit rounded-full border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-900"
        >
          トップへ戻る
        </Link>
      </div>
    </main>
  );
}
