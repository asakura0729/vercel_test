/**
 * microCMS Content API（ブログ用）
 * @see https://document.microcms.io/content-api/get-api-overview
 */

export type MicroCMSListResponse<T> = {
  contents: T[];
  totalCount: number;
  offset: number;
  limit: number;
};

/** microCMS の画像フィールド（イメージ API） */
export type MicroCMSImageField = {
  url: string;
  height?: number;
  width?: number;
};

/** API スキーマのカスタムフィールド（管理画面のフィールド ID に合わせて調整） */
export type MicroCMSBlog = {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  revisedAt?: string;
  title: string;
  /** 概要 */
  summary?: string;
  /** 一覧・OG 用の代表画像（フィールド ID は microCMS 側に合わせてどれか一つ） */
  eyecatch?: MicroCMSImageField | null;
  thumbnail?: MicroCMSImageField | null;
  image?: MicroCMSImageField | null;
  cover?: MicroCMSImageField | null;
  /** 本文（リッチテキストが HTML 文字列のケース） */
  content?: string | MicroCMSRichTextField | null;
  /** 本文フィールド ID が `body` の場合 */
  body?: string | MicroCMSRichTextField | null;
};

type MicroCMSRichTextField = {
  html?: string;
};

function serviceHost(raw: string): string {
  const d = raw.trim();
  if (d.includes(".microcms.io")) return d;
  return `${d}.microcms.io`;
}

export function isMicrocmsConfigured(): boolean {
  return Boolean(
    process.env.MICROCMS_SERVICE_DOMAIN?.trim() &&
      process.env.MICROCMS_API_KEY?.trim(),
  );
}

function apiBase(): string {
  const domain = process.env.MICROCMS_SERVICE_DOMAIN?.trim();
  const key = process.env.MICROCMS_API_KEY?.trim();
  if (!domain || !key) {
    throw new Error("MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY が未設定です。");
  }
  return `https://${serviceHost(domain)}`;
}

function blogEndpoint(): string {
  return (process.env.MICROCMS_API_ENDPOINT ?? "blog").trim() || "blog";
}

function headers(): HeadersInit {
  const key = process.env.MICROCMS_API_KEY!.trim();
  return { "X-MICROCMS-API-KEY": key };
}

/** 一覧・詳細ヘッダー用の代表画像 URL */
export function pickBlogThumbnailUrl(post: MicroCMSBlog): string | null {
  const img =
    post.eyecatch ?? post.thumbnail ?? post.image ?? post.cover ?? null;
  if (
    img &&
    typeof img === "object" &&
    "url" in img &&
    typeof img.url === "string" &&
    img.url.trim()
  ) {
    return img.url.trim();
  }
  return null;
}

/** リッチ／プレーンの本文から HTML 文字列を取り出す */
export function pickBlogHtml(post: MicroCMSBlog): string {
  const raw = post.content ?? post.body;
  if (raw == null) return "";
  if (typeof raw === "string") return raw;
  if (typeof raw === "object" && "html" in raw && typeof raw.html === "string") {
    return raw.html;
  }
  return "";
}

/** 一覧用の短い抜粋（HTML をざっくり除去） */
export function excerptFromHtml(html: string, maxLen = 140): string {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen)}…`;
}

export function formatBlogDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ja-JP", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export async function getBlogList(
  limit = 10,
): Promise<MicroCMSListResponse<MicroCMSBlog>> {
  const base = apiBase();
  const ep = blogEndpoint();
  const url = new URL(`${base}/api/v1/${ep}`);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("orders", "-updatedAt");

  const res = await fetch(url.toString(), {
    headers: headers(),
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `microCMS 一覧取得に失敗しました (${res.status}): ${body.slice(0, 200)}`,
    );
  }

  return res.json() as Promise<MicroCMSListResponse<MicroCMSBlog>>;
}

export async function getBlogDetail(
  contentId: string,
): Promise<MicroCMSBlog | null> {
  const base = apiBase();
  const ep = blogEndpoint();
  const url = `${base}/api/v1/${ep}/${encodeURIComponent(contentId)}`;

  const res = await fetch(url, {
    headers: headers(),
    next: { revalidate: 60 },
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `microCMS 詳細取得に失敗しました (${res.status}): ${body.slice(0, 200)}`,
    );
  }

  return res.json() as Promise<MicroCMSBlog>;
}
