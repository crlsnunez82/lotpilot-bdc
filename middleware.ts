import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth/session-token";

const PUBLIC_PATHS = [
  "/login",
  "/api/capture",
  "/api/health",
  "/api/twilio",
  "/api/email/inbound"
];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function isStaticPath(pathname: string) {
  return pathname.startsWith("/_next") || pathname === "/favicon.ico" || /\.[a-z0-9]+$/i.test(pathname);
}

function applySecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "connect-src 'self' https: ws: wss:",
      "object-src 'none'"
    ].join("; ")
  );
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isPublic = isPublicPath(pathname);
  const isStatic = isStaticPath(pathname);

  if (isPublic || isStatic) {
    return applySecurityHeaders(NextResponse.next());
  }

  const session = request.cookies.get("lotpilot_session")?.value;
  const payload = session ? await verifySessionToken(session) : null;

  if (!payload) {
    const loginUrl = new URL("/login", request.url);
    const nextPath = pathname === "/" ? "/dashboard" : `${pathname}${search}`;
    loginUrl.searchParams.set("next", nextPath);

    const response = NextResponse.redirect(loginUrl);
    if (session) {
      response.cookies.delete("lotpilot_session");
    }
    return applySecurityHeaders(response);
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
