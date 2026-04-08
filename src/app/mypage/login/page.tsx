import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";

export default async function MyPageLogin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect("/mypage/dashboard");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-sky-50 px-6 py-16 text-zinc-900">
      <div className="mx-auto w-full max-w-md rounded-[2rem] border border-violet-100 bg-white/90 p-10 shadow-sm backdrop-blur">
        <div className="mb-8 space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-600">
            My page
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">ログイン</h1>
          <p className="text-sm text-zinc-600">
            Supabase Authentication（メールアドレス・パスワード）でサインインします。<br />
          </p>
          <div className="border p-2 mt-[1rem]">
            <p className="text-sm text-zinc-600">
              メールアドレス：y-asakura@lab-unlimited.com<br />パスワード：testtest
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <LoginForm />
          <p className="text-xs text-zinc-500">
            アカウントは Supabase ダッシュボードの Authentication
            で作成するか、Sign up を有効にしている場合はアプリから登録してください。
          </p>
          <Link
            href="/"
            className="w-fit text-sm font-medium text-violet-700 underline-offset-4 hover:underline"
          >
            トップへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
