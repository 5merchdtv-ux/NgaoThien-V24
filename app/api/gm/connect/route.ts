import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  encryptGmSession,
  GM_SESSION_COOKIE,
  gmSessionCookieOptions,
} from "@/lib/gm-session";
import { gatewayBaseUrl, gatewayHeaders } from "@/lib/gateway";
import { cleanText, isSameOrigin } from "@/lib/security";

type LoginReply = {
  success?: boolean;
  message?: string;
  token?: string;
  role?: number;
  displayName?: string;
  expiresAtUtc?: string;
};

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

export async function POST(request: Request) {
  if (!isSameOrigin(request) || !(await getAdminSession())) {
    return NextResponse.json({ message: "Không được phép." }, { status: 403 });
  }

  let body: { username?: unknown; password?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { message: "Dữ liệu đăng nhập GM không hợp lệ." },
      { status: 400 },
    );
  }

  const username = cleanText(body.username, 32);
  const password = typeof body.password === "string" ? body.password : "";
  if (!username || password.length < 6 || password.length > 128) {
    return NextResponse.json(
      { message: "Tài khoản hoặc mật khẩu GM không hợp lệ." },
      { status: 400 },
    );
  }

  try {
    const upstream = await fetch(`${gatewayBaseUrl()}/api/gm-support/login`, {
      method: "POST",
      cache: "no-store",
      headers: gatewayHeaders({
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "HKNT-GM-Control-Center/2.0",
      }),
      body: JSON.stringify({ userName: username, password }),
      signal: AbortSignal.timeout(12_000),
    });
    const result = (await upstream.json().catch(() => null)) as LoginReply | null;

    if (
      !upstream.ok ||
      result?.success !== true ||
      !result.token ||
      !result.role ||
      result.role < 6
    ) {
      await new Promise((resolve) => setTimeout(resolve, 650));
      return NextResponse.json(
        { message: result?.message ?? "Không thể xác thực quyền GM." },
        { status: upstream.status === 401 ? 401 : 502 },
      );
    }

    const parsedExpiry = result.expiresAtUtc
      ? Math.floor(new Date(result.expiresAtUtc).getTime() / 1000)
      : Number.NaN;
    const upstreamExpiry = Number.isFinite(parsedExpiry)
      ? parsedExpiry
      : Math.floor(Date.now() / 1000) + 60 * 60;
    const expiry = Math.min(
      upstreamExpiry,
      Math.floor(Date.now() / 1000) + 60 * 60,
    );

    const response = NextResponse.json({
      connected: true,
      accountId: username,
      displayName: result.displayName ?? username,
      role: result.role,
    });
    response.cookies.set(
      GM_SESSION_COOKIE,
      encryptGmSession({
        accountId: username,
        displayName: result.displayName ?? username,
        token: result.token,
        role: result.role,
        exp: expiry,
      }),
      {
        ...gmSessionCookieOptions,
        maxAge: Math.max(60, expiry - Math.floor(Date.now() / 1000)),
      },
    );
    return response;
  } catch {
    return NextResponse.json(
      { message: "Dịch vụ GM trên GameServer chưa sẵn sàng." },
      { status: 503 },
    );
  }
}

export async function DELETE(request: Request) {
  if (!isSameOrigin(request) || !(await getAdminSession())) {
    return NextResponse.json({ message: "Không được phép." }, { status: 403 });
  }

  const response = NextResponse.json({ connected: false });
  response.cookies.set(GM_SESSION_COOKIE, "", {
    ...gmSessionCookieOptions,
    expires: new Date(0),
  });
  return response;
}
