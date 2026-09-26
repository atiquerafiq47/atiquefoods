import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const response = await updateSession(request);
  const path = request.nextUrl.pathname;
  const isLogin = path === "/login";
  const session = request.cookies.get(SESSION_COOKIE)?.value;

  if (!session && !isLogin) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && isLogin) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
