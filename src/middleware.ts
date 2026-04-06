import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

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

export function middleware(request: NextRequest) {
  const user = process.env.BASIC_AUTH_USER ?? "";
  const password = process.env.BASIC_AUTH_PASSWORD ?? "";

  if (!user || !password) {
    return NextResponse.next();
  }

  const parsed = parseBasicAuth(request.headers.get("authorization"));
  if (
    parsed &&
    timingSafeEqual(parsed.user, user) &&
    timingSafeEqual(parsed.password, password)
  ) {
    return NextResponse.next();
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="vercel-test"',
    },
  });
}

/** HTML / API を保護。`/_next/static` 等は除外（無認証でバンドル取得は理論上可能なため、より厳密には Vercel の Password Protection も検討） */
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
