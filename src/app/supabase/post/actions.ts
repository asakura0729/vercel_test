"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { redirect } from "next/navigation";

export type TestRowFormState = { error: string | null };

async function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anon) {
    return {
      error:
        "Supabase の接続情報が未設定です。.env.local に NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してください。",
      supabase: null,
    };
  }
  try {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    const supabase = serviceKey
      ? createServiceRoleClient()
      : await createClient();
    return { error: null, supabase };
  } catch (e) {
    return {
      error:
        e instanceof Error
          ? e.message
          : "Supabase クライアントの作成に失敗しました。",
      supabase: null,
    };
  }
}

function parseTitleText(formData: FormData): {
  title: string | null;
  text: string | null;
} {
  const titleRaw = formData.get("title");
  const textRaw = formData.get("text");
  const title =
    typeof titleRaw === "string" && titleRaw.trim() ? titleRaw.trim() : null;
  const text =
    typeof textRaw === "string" && textRaw.trim() ? textRaw.trim() : null;
  return { title, text };
}

export async function insertTestRow(
  _prev: TestRowFormState,
  formData: FormData,
): Promise<TestRowFormState> {
  const { title, text } = parseTitleText(formData);
  const { error: envErr, supabase } = await getSupabase();
  if (envErr || !supabase) {
    return { error: envErr ?? "Supabase に接続できません。" };
  }

  const { error } = await supabase.from("test").insert({
    title,
    text,
  });

  if (error) {
    const hint =
      error.message.includes("duplicate key") &&
      error.message.includes("test_pkey")
        ? " id のシーケンスがずれている可能性があります。Supabase の SQL Editor で scripts/supabase-test-fix-id-sequence.sql を実行してください。"
        : " RLS・NOT NULL 制約を確認してください。";
    return {
      error: `${error.message}（${hint}）`,
    };
  }

  redirect("/supabase");
}

export async function updateTestRow(
  _prev: TestRowFormState,
  formData: FormData,
): Promise<TestRowFormState> {
  const paramRaw = formData.get("url-report-id");
  const rowId =
    typeof paramRaw === "string" ? Number.parseInt(paramRaw, 10) : Number.NaN;
  if (!Number.isFinite(rowId) || rowId < 1) {
    return { error: "URL の id が不正です。" };
  }

  const { title, text } = parseTitleText(formData);
  const { error: envErr, supabase } = await getSupabase();
  if (envErr || !supabase) {
    return { error: envErr ?? "Supabase に接続できません。" };
  }

  const patch = { title, text };

  const byId = await supabase
    .from("test")
    .update(patch)
    .eq("id", rowId)
    .select("id");

  if (byId.error) {
    return {
      error: `${byId.error.message}（UPDATE が RLS で拒否されていないか確認してください）`,
    };
  }
  if (byId.data && byId.data.length > 0) {
    redirect("/supabase");
  }

  return {
    error: `id = ${rowId} の行を更新できませんでした。test に該当 id があるか、RLS で UPDATE（および .select() による返却）が許可されているか確認してください。`,
  };
}
