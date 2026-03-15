import { NextResponse } from "next/server";

import { auth } from "../auth";

export const runtime = "nodejs";

const PUBLIC_PATHS = new Set(["/", "/login"]);

function getDefaultRouteForRole(role) {
  if (role === "REGULATOR") return "/regulator";
  if (role === "DEPARTMENT") return "/department";
  return "/";
}

function isProtectedPath(pathname) {
  return pathname.startsWith("/regulator") || pathname.startsWith("/department") || pathname.startsWith("/dashboard") || pathname.startsWith("/submit");
}

export default auth((req) => {
  const { nextUrl } = req;
  const { pathname, search } = nextUrl;

  const isLoggedIn = Boolean(req.auth);
  const role = req.auth?.user?.role;
  const isPublic = PUBLIC_PATHS.has(pathname);

  if (!isLoggedIn && isProtectedPath(pathname)) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && pathname === "/login") {
    const callbackUrl = nextUrl.searchParams.get("callbackUrl");
    if (callbackUrl?.startsWith("/")) {
      return NextResponse.redirect(new URL(callbackUrl, req.url));
    }

    const destination = getDefaultRouteForRole(role);
    if (destination !== pathname) {
      return NextResponse.redirect(new URL(destination, req.url));
    }
  }

  if (isLoggedIn && pathname.startsWith("/regulator") && role !== "REGULATOR") {
    const destination = getDefaultRouteForRole(role);
    if (destination !== pathname) {
      return NextResponse.redirect(new URL(destination, req.url));
    }
  }

  if (isLoggedIn && (pathname.startsWith("/department") || pathname.startsWith("/dashboard")) && role !== "DEPARTMENT") {
    const destination = getDefaultRouteForRole(role);
    if (destination !== pathname) {
      return NextResponse.redirect(new URL(destination, req.url));
    }
  }

  if (isLoggedIn && pathname.startsWith("/submit") && role !== "CUSTOMER") {
    const destination = getDefaultRouteForRole(role);
    if (destination !== pathname) {
      return NextResponse.redirect(new URL(destination, req.url));
    }
  }

  if (!isLoggedIn && !isPublic && !pathname.startsWith("/submit")) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
