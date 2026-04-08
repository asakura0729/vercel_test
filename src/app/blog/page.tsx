import {
  excerptFromHtml,
  formatBlogDate,
  getBlogList,
  isMicrocmsConfigured,
  pickBlogHtml,
} from "@/lib/microcms";
import Link from "next/link";

export const revalidate = 60;

export default async function BlogPage() {
  if (!isMicrocmsConfigured()) {
    return (
      <main className="min-h-screen bg-zinc-950 px-6 py-16 text-zinc-50">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-400">
              Blog
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">ブログ一覧</h1>
            <div className="max-w-2xl space-y-3 rounded-3xl border border-amber-900/50 bg-amber-950/40 p-6 text-amber-100">
              <p className="font-medium">microCMS を接続する手順</p>
              <ol className="list-decimal space-y-2 pl-5 text-sm leading-7 text-amber-200/90">
                <li>
                  microCMS の「API設定」でエンドポイント名を確認（例:{" "}
                  <code className="rounded bg-black/30 px-1">blog</code>）。
                </li>
                <li>
                  「サービス設定」などから API キー（読み取り用）を発行する。
                </li>
                <li>
                  プロジェクト直下の{" "}
                  <code className="rounded bg-black/30 px-1">.env.local</code>{" "}
                  に以下を追加する。
                  <pre className="mt-2 overflow-x-auto rounded-2xl bg-black/40 p-4 text-xs text-zinc-200">
{`MICROCMS_SERVICE_DOMAIN=あなたのサービスID
MICROCMS_API_KEY=あなたのAPIキー
# 省略可（デフォルト blog）
# MICROCMS_API_ENDPOINT=blog`}
                  </pre>
                </li>
                <li>
                  カスタムフィールドの API フィールド ID は{" "}
                  <code className="rounded bg-black/30 px-1">title</code>、
                  <code className="rounded bg-black/30 px-1">summary</code>、
                  本文が{" "}
                  <code className="rounded bg-black/30 px-1">content</code> または{" "}
                  <code className="rounded bg-black/30 px-1">body</code>{" "}
                  である想定。異なる場合はコードを合わせて変更してください。
                </li>
              </ol>
            </div>
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

  let list;
  try {
    list = await getBlogList(10);
  } catch (e) {
    return (
      <main className="min-h-screen bg-zinc-950 px-6 py-16 text-zinc-50">
        <div className="mx-auto max-w-4xl space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight">ブログ一覧</h1>
          <p className="rounded-3xl border border-red-900/50 bg-red-950/40 p-6 text-red-200">
            {e instanceof Error ? e.message : "記事の取得に失敗しました。"}
          </p>
          <Link
            href="/"
            className="inline-block rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-200"
          >
            トップへ戻る
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-16 text-zinc-50">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-400">
            Blog
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">ブログ一覧</h1>
          <p className="max-w-2xl text-base leading-7 text-zinc-400">
            microCMS から取得した最新 10 件です。
          </p>
        </div>

        <ul className="flex flex-col gap-4">
          {list.contents.length === 0 ? (
            <li className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 text-zinc-500">
              記事がありません。
            </li>
          ) : (
            list.contents.map((post) => {
              const updated =
                post.updatedAt ?? post.revisedAt ?? post.publishedAt ?? "";
              const bodyHtml = pickBlogHtml(post);
              const summaryText = post.summary?.trim() || "—";
              const articleExcerpt = bodyHtml
                ? excerptFromHtml(bodyHtml, 160)
                : "—";

              return (
                <li key={post.id}>
                  <article className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 transition hover:border-zinc-600">
                    <dl className="space-y-3 text-sm">
                      {updated ? (
                        <div>
                          <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                            更新日時
                          </dt>
                          <dd className="mt-1 text-zinc-300">
                            <time dateTime={updated}>
                              {formatBlogDate(updated)}
                            </time>
                          </dd>
                        </div>
                      ) : null}
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                          タイトル
                        </dt>
                        <dd className="mt-1 text-lg font-semibold text-white">
                          {post.title}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                          概要
                        </dt>
                        <dd className="mt-1 leading-6 text-zinc-400">
                          {summaryText}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                          記事
                        </dt>
                        <dd className="mt-1 leading-6 text-zinc-400">
                          {articleExcerpt}
                        </dd>
                      </div>
                    </dl>
                    <div className="mt-5 border-t border-zinc-800 pt-4">
                      <Link
                        href={`/blog/post/${post.id}`}
                        className="inline-flex text-sm font-medium text-emerald-400 underline-offset-4 hover:underline"
                      >
                        記事の詳細を見る
                      </Link>
                    </div>
                  </article>
                </li>
              );
            })
          )}
        </ul>

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
