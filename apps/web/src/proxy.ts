import { NextResponse, type NextRequest } from "next/server";

const AUTH_COOKIE = "opspilot_session";
const PUBLIC_PATHS = new Set(["/login", "/signup"]);
const PROTECTED_PREFIXES = [
  "/approvals",
  "/audit",
  "/dashboard",
  "/follow-ups",
  "/inbox",
  "/knowledge",
  "/meetings",
  "/onboarding",
  "/settings",
  "/skills",
  "/tasks",
];

function usesApiData() {
  return process.env.NEXT_PUBLIC_DATA_SOURCE !== "mock";
}

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function proxy(request: NextRequest) {
  if (!usesApiData()) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(AUTH_COOKIE);

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = hasSession ? "/dashboard" : "/login";
    return NextResponse.redirect(url);
  }

  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  if (isProtectedPath(pathname) && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
