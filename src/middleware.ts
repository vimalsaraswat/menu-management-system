import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  if (request.cookies.get("auth")?.value) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  } else {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
}

export const config = {
  matcher: "/",
};
