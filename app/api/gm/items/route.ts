import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  gatewayBaseUrl,
  gatewayHeaders,
  normalizeGatewayPayload,
} from "@/lib/gateway";
import { getGmSession } from "@/lib/gm-session";
import { cleanText } from "@/lib/security";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

export async function GET(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ message: "Chưa đăng nhập." }, { status: 401 });
  }
  const gm = await getGmSession();
  if (!gm) {
    return NextResponse.json({ message: "Chưa kết nối quyền GM." }, { status: 401 });
  }
  const query = cleanText(new URL(request.url).searchParams.get("query"), 80);
  try {
    const upstream = await fetch(
      `${gatewayBaseUrl()}/api/gm-support/items?query=${encodeURIComponent(query)}`,
      {
        cache: "no-store",
        headers: gatewayHeaders({
          Accept: "application/json",
          Authorization: `Bearer ${gm.token}`,
          "User-Agent": "HKNT-GM-Control-Center/2.1",
        }),
        signal: AbortSignal.timeout(8_000),
      },
    );
    const payload = normalizeGatewayPayload(await upstream.json());
    return NextResponse.json(payload, {
      status: upstream.status,
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch {
    return NextResponse.json(
      { message: "Danh mục vật phẩm trên VPS chưa sẵn sàng." },
      { status: 503 },
    );
  }
}
