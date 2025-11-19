import { SignJWT, jwtVerify } from "jose";
import { env } from "~/env";

const secret = env.JWT_SECRET;
export const JwtExpiryDays = 7;

export async function signJWT(payload: { userId: string; email: string }) {
  const encoder = new TextEncoder();

  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${JwtExpiryDays}d`)
    .sign(encoder.encode(secret));

  return jwt;
}

export async function verifyJWT(token: string) {
  try {
    const encoder = new TextEncoder();
    const { payload } = await jwtVerify(token, encoder.encode(secret));
    return payload as {
      userId: string;
      email: string;
      iat: number;
      exp: number;
    };
  } catch {
    return null;
  }
}

export async function getSessionFromHeaders(headers: Headers) {
  const token =
    headers.get("cookie")?.match(/auth-token=([^;]+)/)?.[1] ??
    headers.get("x-trpc-auth") ??
    "";

  let session = null;
  if (token) {
    const payload = await verifyJWT(token);
    if (payload) {
      session = { user: { id: payload.userId, email: payload.email } };
    }
  }

  return session;
}
