import type { NextRequest } from "next/server";

import { jwtDecode } from "jwt-decode";
import { NextResponse } from "next/server";

const publicRoutes = [
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/terms",
  "/privacy",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("access_token")?.value;

  const isPublic = publicRoutes.some(route => pathname.startsWith(route));

  if (!isPublic && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (token) {
    try {
      const user = jwtDecode(token) as JwtResponsePayload;

      const isAccountDeleted = user?.status === "deleted";

      if (isAccountDeleted && pathname !== "/account-deleted") {
        return NextResponse.redirect(new URL("/account-deleted", req.url));
      }

      if (!isAccountDeleted && pathname === "/login") {
        if (user.role === "admin") {
          return NextResponse.redirect(new URL("/admin/dashboard", req.url));
        }
        else if (user.role === "super-admin") {
          return NextResponse.redirect(new URL("/super-admin/dashboard", req.url));
        }
        else if (user.role === "user") {
          return NextResponse.redirect(new URL("/", req.url));
        }
      }

      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-user-id", user.id?.toString());
      requestHeaders.set("x-user-role", user.role);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
    catch (err) {
      console.error("Failed to decode token:", err);
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|favicon.ico|images|api/public).*)",
  ],
};
