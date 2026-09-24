import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import {
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth";
import { isSameOrigin } from "@/lib/security";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

function sha256(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

function safeEqual(left: Buffer, right: Buffer): boolean {
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { message: "Yêu cầu đăng nhập không hợp lệ." },
      { status: 403 },
    );
  }

  let body: { username?: unknown; password?: unknown };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { message: "Yêu cầu đăng nhập không hợp lệ." },
      { status: 400 },
    );
  }

  const username =
    typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const expectedUsername = process.env.ADMIN_USERNAME ?? "";
  const expectedPasswordHash = process.env.ADMIN_PASSWORD_HASH ?? "";

  let passwordHashBuffer: Buffer;
  try {
    passwordHashBuffer = Buffer.from(expectedPasswordHash, "hex");
  } catch {
    passwordHashBuffer = Buffer.alloc(0);
  }

  const valid =
    expectedUsername.length > 0 &&
    passwordHashBuffer.length === 32 &&
    safeEqual(sha256(username), sha256(expectedUsername)) &&
    safeEqual(sha256(password), passwordHashBuffer);

  if (!valid) {
    await new Promise((resolve) => setTimeout(resolve, 650));
    return NextResponse.json(
      { message: "Tài khoản hoặc mật khẩu không đúng." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    SESSION_COOKIE,
    createSessionToken(expectedUsername),
    sessionCookieOptions,
  );
  return response;
}
