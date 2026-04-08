import { insertTestRow } from "@/app/supabase/post/actions";
import { TestRowForm } from "@/app/supabase/post/test-row-form";
import Link from "next/link";

export default function SupabasePostNewPage() {
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
            Create
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            test に新規追加
          </h1>
          <p className="text-sm leading-relaxed text-zinc-400">
            タイトルと本文は空のままでも送信できます（DB の NOT NULL 制約に従います）。
          </p>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-zinc-900/70 p-8 shadow-2xl shadow-teal-950/50 backdrop-blur-md">
          <TestRowForm
            formAction={insertTestRow}
            mode="create"
            backHref="/supabase"
          />
        </div>

        <div className="mt-10 text-center">
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
