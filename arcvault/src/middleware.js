export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = ["/", "/login"];

function getDefaultRouteForRole(role) {
  if (role === "REGULATOR") return "/regulator";
  if (role === "DEPARTMENT") return "/department";
  return "/";
}

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname, searchParams } = req.nextUrl;

  const isLoggedIn = !!token;
  const role = token?.role;
  const isPublic = PUBLIC_PATHS.includes(pathname);

  if (!isLoggedIn && (pathname.startsWith("/regulator") || pathname.startsWith("/department") || pathname.startsWith("/dashboard") || pathname.startsWith("/submit"))) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${req.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && pathname === "/login") {
    const callbackUrl = searchParams.get("callbackUrl");
    if (callbackUrl && callbackUrl.startsWith("/")) {
      return NextResponse.redirect(new URL(callbackUrl, req.url));
    }
    return NextResponse.redirect(new URL(getDefaultRouteForRole(role), req.url));
  }

  if (isLoggedIn && pathname.startsWith("/regulator") && role !== "REGULATOR") {
    return NextResponse.redirect(new URL(getDefaultRouteForRole(role), req.url));
  }

  if (isLoggedIn && (pathname.startsWith("/dashboard") || pathname.startsWith("/department")) && role !== "DEPARTMENT") {
    return NextResponse.redirect(new URL(getDefaultRouteForRole(role), req.url));
  }

  if (isLoggedIn && pathname.startsWith("/submit") && role !== "CUSTOMER") {
    return NextResponse.redirect(new URL(getDefaultRouteForRole(role), req.url));
  }

  if (!isLoggedIn && !isPublic && !pathname.startsWith("/submit")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
