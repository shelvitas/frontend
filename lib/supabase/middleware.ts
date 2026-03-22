import { NextResponse, type NextRequest } from "next/server";

export const updateSession = async (request: NextRequest) => {
  // Auth protection is handled client-side by the (protected) layout.
  // Middleware only redirects authenticated users away from auth pages
  // by checking for the Supabase localStorage flag cookie.
  // Since we use localStorage-based sessions, we skip server-side
  // auth checks and let the client handle route protection.

  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/sign-in") ||
    request.nextUrl.pathname.startsWith("/sign-up");

  // Check for Supabase auth cookie (set when using cookie storage)
  const hasAuthCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token"));

  if (isAuthRoute && hasAuthCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/profile";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
};
