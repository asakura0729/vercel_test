import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function MyPageUserEdit() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/mypage/login");
  }

  return <main className="min-h-screen bg-zinc-50" />;
}
