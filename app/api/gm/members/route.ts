import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  gatewayBaseUrl,
  gatewayHeaders,
  normalizeGatewayPayload,
} from "@/lib/gateway";
import { getGmSession } from "@/lib/gm-session";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ message: "Phiên quản trị đã hết hạn." }, { status: 401 });
  }
  const gm = await getGmSession();
  if (!gm) {
    return NextResponse.json({ message: "Chưa kết nối quyền GM." }, { status: 401 });
  }

  try {
    const upstream = await fetch(`${gatewayBaseUrl()}/api/gm-support/members`, {
      cache: "no-store",
      headers: gatewayHeaders({
        Accept: "application/json",
        Authorization: `Bearer ${gm.token}`,
        "User-Agent": "HKNT-GM-Control-Center/2.0",
      }),
      signal: AbortSignal.timeout(12_000),
    });
    const payload = normalizeGatewayPayload(await upstream.json().catch(() => ({
      success: false,
      message: "GameServer không trả dữ liệu hợp lệ.",
    })));
    return NextResponse.json(payload, {
      status: upstream.status,
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch {
    return NextResponse.json(
      { message: "Dịch vụ GM trên GameServer chưa sẵn sàng." },
      { status: 503 },
    );
  }
}
