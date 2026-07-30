import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/products",
  "/customers",
  "/sales",
  "/payments",
  "/reports",
  "/exports",
  "/onboarding",
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    "https://zzcpkxsyhexixfxzijnf.supabase.co",
    "sb_publishable_9VhXfq4Smf-bOq_enBRbvg_NBPeIByn",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/products/:path*",
    "/customers/:path*",
    "/sales/:path*",
    "/payments/:path*",
    "/reports/:path*",
    "/exports/:path*",
    "/onboarding/:path*",
  ],
};