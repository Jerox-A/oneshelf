import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/products",
  "/customers",
  "/sales",
];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const hasSupabaseSession =
    request.cookies.get("sb-access-token") ||
    request.cookies.get("sb-refresh-token") ||
    request.cookies
      .getAll()
      .some((cookie) => cookie.name.startsWith("sb-"));

  if (!hasSupabaseSession) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/products/:path*", "/customers/:path*", "/sales/:path*"],
};