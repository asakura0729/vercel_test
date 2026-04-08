import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function parseBasicAuth(
  header: string | null,
): { user: string; password: string } | null {
  if (!header?.startsWith("Basic ")) return null;
  const encoded = header.slice(6);
  let decoded: string;
  try {
    decoded = atob(encoded);
  } catch {
    return null;
  }
  const i = decoded.indexOf(":");
  if (i < 0) return null;
  return {
    user: decoded.slice(0, i),
    password: decoded.slice(i + 1),
  };
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

/**
 * Next.js 16: `middleware.ts` の後継。Basic 認証のあと Supabase のセッションを更新する。
 */
export async function proxy(request: NextRequest) {
  const basicUser = process.env.BASIC_AUTH_USER ?? "";
  const basicPassword = process.env.BASIC_AUTH_PASSWORD ?? "";

  if (basicUser && basicPassword) {
    const parsed = parseBasicAuth(request.headers.get("authorization"));
    if (
      !parsed ||
      !timingSafeEqual(parsed.user, basicUser) ||
      !timingSafeEqual(parsed.password, basicPassword)
    ) {
      return new NextResponse("Authentication required", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="vercel-test"',
        },
      });
    }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
        if (headers) {
          for (const [key, value] of Object.entries(headers)) {
            if (typeof value === "string") {
              supabaseResponse.headers.set(key, value);
            }
          }
        }
      },
    },
  });

  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
