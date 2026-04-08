import {
  formatBlogDate,
  getBlogDetail,
  isMicrocmsConfigured,
  pickBlogHtml,
  pickBlogThumbnailUrl,
} from "@/lib/microcms";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 60;

const pageBg =
  "min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/70 px-6 py-16 text-zinc-900";

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
      <main className={pageBg}>
        <div className="mx-auto max-w-2xl space-y-4 rounded-[1.75rem] border border-violet-100 bg-white/90 p-8 shadow-sm backdrop-blur">
          <h1 className="text-2xl font-semibold text-zinc-900">設定が必要です</h1>
          <p className="text-zinc-600 leading-7">
            環境変数{" "}
            <code className="rounded-md bg-violet-50 px-1.5 py-0.5 text-sm text-violet-800 ring-1 ring-violet-100">
              MICROCMS_SERVICE_DOMAIN
            </code>{" "}
            と{" "}
            <code className="rounded-md bg-violet-50 px-1.5 py-0.5 text-sm text-violet-800 ring-1 ring-violet-100">
              MICROCMS_API_KEY
            </code>{" "}
            を設定してください（.env.example を参照）。
          </p>
          <Link
            href="/blog"
            className="inline-block text-sm font-medium text-violet-700 underline-offset-4 hover:text-violet-900 hover:underline"
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
  const heroUrl = pickBlogThumbnailUrl(post);

  return (
    <main className={pageBg}>
      <article className="mx-auto max-w-2xl space-y-8 rounded-[1.75rem] border border-violet-100 bg-white/90 p-8 shadow-sm backdrop-blur sm:p-10">
        <header className="space-y-3 border-b border-violet-100 pb-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-600">
            Blog
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 leading-tight">
            {post.title}
          </h1>
          {updated ? (
            <p className="text-sm text-zinc-500">
              更新:{" "}
              <time dateTime={updated}>{formatBlogDate(updated)}</time>
            </p>
          ) : null}
          {post.summary ? (
            <p className="text-base leading-7 text-zinc-600">{post.summary}</p>
          ) : null}
        </header>

        {heroUrl ? (
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-violet-100/80 bg-gradient-to-br from-violet-50/80 to-slate-100/60 shadow-sm">
            <Image
              src={heroUrl}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 672px) 100vw, 672px"
              priority
            />
          </div>
        ) : null}

        {bodyHtml ? (
          <div
            className="blog-body space-y-4 text-zinc-700 leading-8 [&_a]:font-medium [&_a]:text-violet-700 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-violet-200 [&_blockquote]:pl-4 [&_blockquote]:text-zinc-600 [&_code]:rounded [&_code]:bg-violet-50 [&_code]:px-1 [&_code]:text-sm [&_code]:text-violet-900 [&_figure]:my-8 [&_figure]:mx-auto [&_figure]:max-w-full [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-zinc-900 [&_h3]:mt-8 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-zinc-900 [&_img]:my-6 [&_img]:h-auto [&_img]:max-h-none [&_img]:max-w-full [&_img]:rounded-xl [&_li]:ml-6 [&_li]:list-disc [&_li]:marker:text-violet-400 [&_p]:my-4 [&_picture]:mx-auto [&_picture]:my-6 [&_picture]:block [&_picture]:max-w-full [&_strong]:text-zinc-900 [&_ul]:my-4"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        ) : (
          <p className="text-zinc-500">本文がありません。</p>
        )}

        <div className="border-t border-violet-100 pt-8">
          <Link
            href="/blog"
            className="inline-flex rounded-full border border-violet-200 bg-white px-4 py-2 text-sm font-medium text-violet-800 shadow-sm transition hover:border-violet-300 hover:bg-violet-50"
          >
            一覧へ戻る
          </Link>
        </div>
      </article>
    </main>
  );
}
