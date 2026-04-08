import { updateTestRow } from "@/app/supabase/post/actions";
import { TestRowForm } from "@/app/supabase/post/test-row-form";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ reportId: string }>;
};

type ContextRow = {
  id?: number | null;
  title: string | null;
  text: string | null;
};

async function fetchTestContextRow(
  supabase: Awaited<ReturnType<typeof createClient>>,
  rowId: number,
): Promise<{ data: ContextRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("test")
    .select("id, title, text")
    .eq("id", rowId)
    .maybeSingle();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }
  return { data: (data as ContextRow) ?? null, error: null };
}

export default async function SupabasePostEditPage({ params }: PageProps) {
  const { reportId: reportIdParam } = await params;
  const rowId = Number.parseInt(reportIdParam, 10);
  if (!Number.isFinite(rowId) || rowId < 1) {
    notFound();
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  let context: ContextRow | null = null;
  let contextError: string | null = null;

  if (url && anon) {
    try {
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
      const supabase = serviceKey
        ? createServiceRoleClient()
        : await createClient();
      const { data, error } = await fetchTestContextRow(supabase, rowId);

      if (error) {
        contextError = error.message;
      } else {
        context = data;
      }
    } catch (e) {
      contextError =
        e instanceof Error ? e.message : "コンテキストの取得に失敗しました。";
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-teal-950 to-zinc-900 px-6 py-16 text-zinc-100">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 20% -10%, rgba(45,212,191,0.35), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(99,102,241,0.25), transparent 50%)",
        }}
      />
      <div className="relative mx-auto w-full max-w-lg">
        <div className="mb-10 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-300/90">
            Edit
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            test を編集
          </h1>
          <p className="text-sm leading-relaxed text-zinc-400">
            URL の識別子{" "}
            <span className="font-mono text-teal-200">#{reportIdParam}</span>{" "}
            に一致する行の{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-teal-200">
              title
            </code>{" "}
            /{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-teal-200">
              text
            </code>{" "}
            を上書きします（
            <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-[0.7rem]">
              id
            </code>{" "}
            で照合）。
          </p>
        </div>

        {contextError ? (
          <p className="mb-6 rounded-xl border border-amber-500/40 bg-amber-950/50 px-4 py-3 text-sm text-amber-100">
            参照行の取得エラー: {contextError}
          </p>
        ) : !url || !anon ? (
          <p className="mb-6 rounded-xl border border-zinc-600 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-300">
            Supabase 未設定のためデータを読み込めません。接続後に再度開いてください。
          </p>
        ) : context ? (
          <div className="mb-6 rounded-2xl border border-teal-500/30 bg-teal-950/40 px-4 py-3 text-sm text-teal-100/90 backdrop-blur-sm">
            <p className="font-medium text-teal-200">読み込んだ行（test）</p>
            <p className="mt-1 line-clamp-2 text-zinc-300">
              {context.title?.trim()
                ? context.title
                : `（タイトルなし · #${context.id ?? rowId}）`}
            </p>
          </div>
        ) : (
          <p className="mb-6 rounded-xl border border-zinc-700 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-400">
            id = {rowId}{" "}
            の行が見つかりませんでした。フォームは空です。保存すると同じ id で
            UPDATE を試みます。
          </p>
        )}

        <div className="rounded-[1.75rem] border border-white/10 bg-zinc-900/70 p-8 shadow-2xl shadow-teal-950/50 backdrop-blur-md">
          <TestRowForm
            key={`edit-${reportIdParam}`}
            formAction={updateTestRow}
            mode="edit"
            urlReportId={reportIdParam}
            defaultTitle={context?.title ?? ""}
            defaultText={context?.text ?? ""}
            backHref="/supabase"
          />
        </div>

        <p className="mt-6 text-center text-xs text-zinc-500">
          <Link
            href="/supabase/post"
            className="font-medium text-teal-300/90 underline-offset-2 hover:text-teal-200 hover:underline"
          >
            新規作成（別ページ）
          </Link>
        </p>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm font-medium text-teal-300/90 underline-offset-4 hover:text-teal-200 hover:underline"
          >
            トップへ
          </Link>
        </div>
      </div>
    </main>
  );
}
