import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  gatewayBaseUrl,
  gatewayHeaders,
  normalizeGatewayPayload,
} from "@/lib/gateway";
import { cleanText, isSameOrigin } from "@/lib/security";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

async function readUpstream(response: Response) {
  const payload = normalizeGatewayPayload<Record<string, unknown>>(
    (await response.json().catch(() => ({}))) as Record<string, unknown>,
  );
  return NextResponse.json(payload, {
    status: response.status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: "Không được phép." }, { status: 401 });
  try {
    const upstream = await fetch(
      `${gatewayBaseUrl()}/api/gm-support/admin/gm-accounts?administratorId=${encodeURIComponent(session.sub)}`,
      {
        cache: "no-store",
        headers: gatewayHeaders({ Accept: "application/json" }),
        signal: AbortSignal.timeout(10_000),
      },
    );
    return readUpstream(upstream);
  } catch {
    return NextResponse.json({ message: "Chưa kết nối được máy chủ quản lý GM." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session || !isSameOrigin(request))
    return NextResponse.json({ message: "Không được phép." }, { status: 403 });

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const accountId = cleanText(body.accountId, 32);
  const displayName = cleanText(body.displayName, 50);
  const password = typeof body.password === "string" ? body.password : "";
  if (!accountId || !displayName || password.length < 8 || password.length > 50) {
    return NextResponse.json({ message: "Thông tin tài khoản GM không hợp lệ." }, { status: 400 });
  }
  try {
    const upstream = await fetch(`${gatewayBaseUrl()}/api/gm-support/admin/gm-accounts`, {
      method: "POST",
      cache: "no-store",
      headers: gatewayHeaders({ "Content-Type": "application/json", Accept: "application/json" }),
      body: JSON.stringify({ accountId, displayName, password }),
      signal: AbortSignal.timeout(12_000),
    });
    return readUpstream(upstream);
  } catch {
    return NextResponse.json({ message: "Không thể tạo tài khoản GM lúc này." }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  const session = await getAdminSession();
  if (!session || !isSameOrigin(request))
    return NextResponse.json({ message: "Không được phép." }, { status: 403 });

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const displayName = cleanText(body.displayName, 50);
  const accountId = cleanText(body.accountId, 32);
  const kind = body.kind === "administrator" ? "administrator" : "gm";
  if (!displayName) return NextResponse.json({ message: "Tên hiển thị không hợp lệ." }, { status: 400 });

  const path = kind === "administrator"
    ? "/api/gm-support/admin/profile"
    : `/api/gm-support/admin/gm-accounts/${encodeURIComponent(accountId)}/display-name`;
  if (kind === "gm" && !accountId)
    return NextResponse.json({ message: "Thiếu ID tài khoản GM." }, { status: 400 });
  try {
    const upstream = await fetch(`${gatewayBaseUrl()}${path}`, {
      method: "PUT",
      cache: "no-store",
      headers: gatewayHeaders({ "Content-Type": "application/json", Accept: "application/json" }),
      body: JSON.stringify(
        kind === "administrator"
          ? { administratorId: session.sub, displayName }
          : { displayName },
      ),
      signal: AbortSignal.timeout(10_000),
    });
    return readUpstream(upstream);
  } catch {
    return NextResponse.json({ message: "Không thể lưu tên hiển thị." }, { status: 503 });
  }
}
