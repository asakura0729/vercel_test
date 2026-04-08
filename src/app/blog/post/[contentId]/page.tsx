import {
  formatBlogDate,
  getBlogDetail,
  isMicrocmsConfigured,
  pickBlogHtml,
} from "@/lib/microcms";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ contentId: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { contentId } = await params;
  if (!isMicrocmsConfigured()) {
    return { title: "記事" };
  }
  try {
    const post = await getBlogDetail(contentId);
    if (!post) return { title: "記事が見つかりません" };
    return { title: post.title };
  } catch {
    return { title: "記事" };
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { contentId } = await params;

  if (!isMicrocmsConfigured()) {
    return (
      <main className="min-h-screen bg-zinc-950 px-6 py-16 text-zinc-50">
        <div className="mx-auto max-w-2xl space-y-4">
          <h1 className="text-2xl font-semibold">設定が必要です</h1>
          <p className="text-zinc-400 leading-7">
            環境変数{" "}
            <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-emerald-300">
              MICROCMS_SERVICE_DOMAIN
            </code>{" "}
            と{" "}
            <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-emerald-300">
              MICROCMS_API_KEY
            </code>{" "}
            を設定してください（.env.example を参照）。
          </p>
          <Link
            href="/blog"
            className="inline-block text-sm font-medium text-emerald-400 underline-offset-4 hover:underline"
          >
            一覧へ戻る
          </Link>
        </div>
      </main>
    );
  }

  const post = await getBlogDetail(contentId);
  if (!post) notFound();

  const bodyHtml = pickBlogHtml(post);
  const updated = post.updatedAt ?? post.revisedAt ?? post.publishedAt ?? "";

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-16 text-zinc-50">
      <article className="mx-auto max-w-2xl space-y-8">
        <header className="space-y-3 border-b border-zinc-800 pb-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-400">
            Blog
          </p>
          <h1 className="text-3xl font-semibold tracking-tight leading-tight">
            {post.title}
          </h1>
          {updated ? (
            <p className="text-sm text-zinc-500">
              更新:{" "}
              <time dateTime={updated}>{formatBlogDate(updated)}</time>
            </p>
          ) : null}
          {post.summary ? (
            <p className="text-base leading-7 text-zinc-400">{post.summary}</p>
          ) : null}
        </header>

        {bodyHtml ? (
          <div
            className="blog-body space-y-4 text-zinc-300 leading-8 [&_a]:text-emerald-400 [&_a]:underline [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white [&_h3]:mt-8 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:ml-6 [&_li]:list-disc [&_p]:my-4 [&_ul]:my-4"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        ) : (
          <p className="text-zinc-500">本文がありません。</p>
        )}

        <div className="pt-8">
          <Link
            href="/blog"
            className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-900"
          >
            一覧へ戻る
          </Link>
        </div>
      </article>
    </main>
  );
}
