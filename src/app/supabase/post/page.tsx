import { insertTestRow } from "@/app/supabase/post/actions";
import { TestRowForm } from "@/app/supabase/post/test-row-form";
import Link from "next/link";

export default function SupabasePostNewPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-amber-50 via-white to-emerald-50 px-6 py-16 text-zinc-900">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 85% 55% at 10% 0%, rgba(16,185,129,0.12), transparent 52%), radial-gradient(ellipse 70% 45% at 95% 95%, rgba(251,191,36,0.14), transparent 48%)",
        }}
      />
      <div className="relative mx-auto w-full max-w-lg">
        <div className="mb-10 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">
            Create
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            test に新規追加
          </h1>
          <p className="text-sm leading-relaxed text-zinc-600">
            タイトルと本文は空のままでも送信できます（DB の NOT NULL 制約に従います）。
          </p>
        </div>

        <div className="rounded-[1.75rem] border border-amber-100/90 bg-white/95 p-8 shadow-md shadow-emerald-900/5 backdrop-blur-sm">
          <TestRowForm
            formAction={insertTestRow}
            mode="create"
            backHref="/supabase"
          />
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/"
            className="text-sm font-medium text-emerald-800 underline-offset-4 hover:text-emerald-950 hover:underline"
          >
            トップへ
          </Link>
        </div>
      </div>
    </main>
  );
}
