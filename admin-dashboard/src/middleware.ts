// /src/middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("authToken")?.value;
  const isLoginPage = request.nextUrl.pathname === "/login";

  // Redirect to login if trying to access protected routes without token
  if (
    !token &&
    !isLoginPage &&
    request.nextUrl.pathname.startsWith("/dashboard")
  ) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if already logged in and trying to access login page
  if (token && isLoginPage) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

// Configure which paths should trigger this middleware
export const config = {
  matcher: ["/login", "/dashboard/:path*"],
};
