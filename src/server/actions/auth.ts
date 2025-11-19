"use server";

import { cookies } from "next/headers";
import { JwtExpiryDays } from "~/lib/jwt";

export async function setAuthCookie(token: string) {
  (await cookies()).set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * JwtExpiryDays,
    path: "/",
  });
}

export async function removeAuthCookie() {
  (await cookies()).set("auth-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}
