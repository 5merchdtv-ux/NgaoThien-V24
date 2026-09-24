import "server-only";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { gatewayBaseUrl, gatewayHeaders, normalizeGatewayPayload } from "@/lib/gateway";
import { getGmSession } from "@/lib/gm-session";
import { isSameOrigin } from "@/lib/security";

export async function proxyGmOperations(
  request: Request,
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body?: unknown,
) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ message: "Không được phép." }, { status: 403 });
  }
  if (method !== "GET" && !isSameOrigin(request)) {
    return NextResponse.json({ message: "Yêu cầu không hợp lệ." }, { status: 403 });
  }
  const gm = await getGmSession();
  if (!gm) {
    return NextResponse.json({ message: "Hãy kết nối quyền GM trước." }, { status: 401 });
  }
  if (method !== "GET" && gm.role !== 8) {
    return NextResponse.json({ message: "Cần quyền Admin GM mode 8." }, { status: 403 });
  }
  const serialized = body === undefined ? undefined : JSON.stringify(body);
  if (serialized && serialized.length > 80_000) {
    return NextResponse.json({ message: "Dữ liệu vượt quá giới hạn." }, { status: 413 });
  }
  try {
    const headers = gatewayHeaders({
      Accept: "application/json",
      Authorization: `Bearer ${gm.token}`,
      "User-Agent": "HKNT-GM-Control-Center/2.1",
    });
    if (serialized !== undefined) headers.set("Content-Type", "application/json");
    const upstream = await fetch(`${gatewayBaseUrl()}/api/gm-support${path}`, {
      method,
      cache: "no-store",
      headers,
      body: serialized,
      signal: AbortSignal.timeout(20_000),
    });
    const payload = normalizeGatewayPayload(await upstream.json().catch(() => ({})));
    return NextResponse.json(payload, {
      status: upstream.status,
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch {
    return NextResponse.json(
      { message: "Gateway vận hành trên VPS chưa sẵn sàng." },
      { status: 503 },
    );
  }
}
