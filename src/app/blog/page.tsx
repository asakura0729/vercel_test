import {
  excerptFromHtml,
  formatBlogDate,
  getBlogList,
  isMicrocmsConfigured,
  pickBlogHtml,
} from "@/lib/microcms";
import Link from "next/link";

export const revalidate = 60;

const pageBg =
  "min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/70 px-6 py-16 text-zinc-900";

export default async function BlogPage() {
  if (!isMicrocmsConfigured()) {
    return (
      <main className={pageBg}>
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-600">
              Blog
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
              ブログ一覧
            </h1>
            <div className="max-w-2xl space-y-3 rounded-[1.75rem] border border-amber-200 bg-amber-50/90 p-6 text-amber-950 shadow-sm">
              <p className="font-medium">microCMS を接続する手順</p>
              <ol className="list-decimal space-y-2 pl-5 text-sm leading-7 text-amber-900/85">
                <li>
                  microCMS の「API設定」でエンドポイント名を確認（例:{" "}
                  <code className="rounded-md bg-white/80 px-1.5 py-0.5 text-amber-950 ring-1 ring-amber-200/80">
                    blog
                  </code>
                  ）。
                </li>
                <li>
                  「サービス設定」などから API キー（読み取り用）を発行する。
                </li>
                <li>
                  プロジェクト直下の{" "}
                  <code className="rounded-md bg-white/80 px-1.5 py-0.5 text-amber-950 ring-1 ring-amber-200/80">
                    .env.local
                  </code>{" "}
                  に以下を追加する。
                  <pre className="mt-2 overflow-x-auto rounded-2xl border border-amber-100 bg-white/90 p-4 text-xs text-zinc-800 shadow-inner">
{`MICROCMS_SERVICE_DOMAIN=あなたのサービスID
MICROCMS_API_KEY=あなたのAPIキー
# 省略可（デフォルト blog）
# MICROCMS_API_ENDPOINT=blog`}
                  </pre>
                </li>
                <li>
                  カスタムフィールドの API フィールド ID は{" "}
                  <code className="rounded-md bg-white/80 px-1 py-0.5 ring-1 ring-amber-200/80">
                    title
                  </code>
                  、
                  <code className="rounded-md bg-white/80 px-1 py-0.5 ring-1 ring-amber-200/80">
                    summary
                  </code>
                  、本文が{" "}
                  <code className="rounded-md bg-white/80 px-1 py-0.5 ring-1 ring-amber-200/80">
                    content
                  </code>{" "}
                  または{" "}
                  <code className="rounded-md bg-white/80 px-1 py-0.5 ring-1 ring-amber-200/80">
                    body
                  </code>{" "}
                  である想定。異なる場合はコードを合わせて変更してください。
                </li>
              </ol>
            </div>
          </div>
          <Link
            href="/"
            className="w-fit rounded-full border border-violet-200 bg-white px-4 py-2 text-sm font-medium text-violet-800 shadow-sm transition hover:border-violet-300 hover:bg-violet-50"
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
      <main className={pageBg}>
        <div className="mx-auto max-w-4xl space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            ブログ一覧
          </h1>
          <p className="rounded-[1.75rem] border border-red-200 bg-red-50 p-6 text-sm leading-7 text-red-900 shadow-sm">
            {e instanceof Error ? e.message : "記事の取得に失敗しました。"}
          </p>
          <Link
            href="/"
            className="inline-block rounded-full border border-violet-200 bg-white px-4 py-2 text-sm font-medium text-violet-800 shadow-sm transition hover:bg-violet-50"
          >
            トップへ戻る
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={pageBg}>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-600">
            Blog
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            ブログ一覧
          </h1>
          <p className="max-w-2xl text-base leading-7 text-zinc-600">
            microCMS から取得した最新 10 件です。
          </p>
        </div>

        <ul className="flex flex-col gap-4">
          {list.contents.length === 0 ? (
            <li className="rounded-[1.75rem] border border-violet-100 bg-white/80 p-8 text-center text-zinc-500 shadow-sm backdrop-blur">
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
                  <article className="rounded-[1.75rem] border border-violet-100/80 bg-white/90 p-6 shadow-sm backdrop-blur transition hover:border-violet-200 hover:shadow-md">
                    <dl className="space-y-3 text-sm">
                      {updated ? (
                        <div>
                          <dt className="text-xs font-medium uppercase tracking-wider text-violet-600/90">
                            更新日時
                          </dt>
                          <dd className="mt-1 text-zinc-800">
                            <time dateTime={updated}>
                              {formatBlogDate(updated)}
                            </time>
                          </dd>
                        </div>
                      ) : null}
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wider text-violet-600/90">
                          タイトル
                        </dt>
                        <dd className="mt-1 text-lg font-semibold text-zinc-900">
                          {post.title}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wider text-violet-600/90">
                          記事
                        </dt>
                        <dd className="mt-1 leading-6 text-zinc-600">
                          {articleExcerpt}
                        </dd>
                      </div>
                    </dl>
                    <div className="mt-5 border-t border-violet-100 pt-4">
                      <Link
                        href={`/blog/post/${post.id}`}
                        className="inline-flex text-sm font-medium text-violet-700 underline-offset-4 hover:text-violet-900 hover:underline"
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
          className="w-fit rounded-full border border-violet-200 bg-white px-4 py-2 text-sm font-medium text-violet-800 shadow-sm transition hover:border-violet-300 hover:bg-violet-50"
        >
          トップへ戻る
        </Link>
      </div>
    </main>
  );
}
