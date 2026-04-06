import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json({
      configured: false,
      hint: "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (.env.local or Vercel env)",
    });
  }

  try {
    const supabase = await createClient();
    await supabase.auth.getSession();
    return NextResponse.json({ configured: true });
  } catch {
    return NextResponse.json(
      { configured: false, error: "Supabase client failed to initialize" },
      { status: 500 },
    );
  }
}
