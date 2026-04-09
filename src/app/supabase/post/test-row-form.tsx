"use client";

import type { TestRowFormState } from "@/app/supabase/post/actions";
import Link from "next/link";
import { useActionState } from "react";

const initial: TestRowFormState = { error: null };

type ServerAction = (
  prev: TestRowFormState,
  formData: FormData,
) => Promise<TestRowFormState>;

type Props = {
  formAction: ServerAction;
  mode: "create" | "edit";
  defaultTitle?: string | null;
  defaultText?: string | null;
  /** 編集時: URL のセグメント（hidden で update に渡す） */
  urlReportId?: string;
  backHref: string;
};

export function TestRowForm({
  formAction,
  mode,
  defaultTitle,
  defaultText,
  urlReportId,
  backHref,
}: Props) {
  const [state, action, pending] = useActionState(formAction, initial);

  const titleDefault = defaultTitle ?? "";
  const textDefault = defaultText ?? "";

  return (
    <form action={action} className="flex flex-col gap-5">
      {mode === "edit" && urlReportId != null ? (
        <input type="hidden" name="url-report-id" value={urlReportId} />
      ) : null}

      {state.error ? (
        <p
          className="rounded-xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm text-rose-900"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="title"
          className="text-xs font-medium tracking-wide text-zinc-500"
        >
          タイトル
        </label>
        <input
          id="title"
          name="title"
          type="text"
          maxLength={255}
          placeholder="省略可"
          defaultValue={titleDefault}
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none ring-emerald-200/70 placeholder:text-zinc-400 focus:border-emerald-400 focus:ring-2"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="text"
          className="text-xs font-medium tracking-wide text-zinc-500"
        >
          本文
        </label>
        <textarea
          id="text"
          name="text"
          rows={6}
          placeholder="内容（省略可）"
          defaultValue={textDefault}
          className="w-full resize-y rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm leading-relaxed text-zinc-900 outline-none ring-emerald-200/70 placeholder:text-zinc-400 focus:border-emerald-400 focus:ring-2"
        />
      </div>

      <div className="flex flex-wrap gap-3 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending
            ? "送信中…"
            : mode === "edit"
              ? "上書き保存"
              : "新規追加"}
        </button>
        <Link
          href={backHref}
          className="rounded-full border border-zinc-300 bg-white px-6 py-2.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
        >
          一覧へ戻る
        </Link>
      </div>
    </form>
  );
}
