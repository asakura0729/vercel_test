import Link from "next/link";

const items = [
  "デザインの方向性を決める",
  "API 接続の動作を見る",
  "Vercel へデプロイする",
  "監視とログの導線を整える",
];

export default function ListPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50 px-6 py-16 text-zinc-900">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 rounded-[2rem] border border-amber-100 bg-white/90 p-10 shadow-sm backdrop-blur">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-600">
            List
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">やることリスト</h1>
          <p className="text-base leading-7 text-zinc-600">
            `/list` 用のダミーコンテンツです。配列を map
            して並べるだけのシンプルなページにしています。
          </p>
        </div>

        <ol className="space-y-3">
          {items.map((item, index) => (
            <li
              key={item}
              className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-sm font-semibold text-white">
                {index + 1}
              </span>
              <span className="text-sm font-medium text-zinc-700">{item}</span>
            </li>
          ))}
        </ol>

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
