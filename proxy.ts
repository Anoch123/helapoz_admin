import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/api/auth/login", "/auth/callback", "/auth/auth-code-error", "/set-password"];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.includes(pathname);
}

function isApiRoute(pathname: string) {
  return pathname.startsWith("/api/");
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Check authentication
  const {
    data,
    error,
  } = await supabase.auth.getClaims();

  const isAuthenticated = !error && !!data?.claims;

  const pathname = request.nextUrl.pathname;

  // If authenticated user tries to access login, redirect to dashboard.
  if ((pathname === "/" || pathname === "/login") && isAuthenticated) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Allow public routes.
  if (isPublicRoute(pathname)) {
    return response;
  }

  // Protect API routes.
  if (!isAuthenticated) {
    if (isApiRoute(pathname)) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        { status: 401 }
      );
    }

    // Redirect unauthenticated users to login.
    const loginUrl = new URL("/", request.url);

    loginUrl.searchParams.set(
      "next",
      pathname + request.nextUrl.search
    );

    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};