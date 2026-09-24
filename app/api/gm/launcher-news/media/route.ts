import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { gatewayBaseUrl, gatewayHeaders, normalizeGatewayPayload } from "@/lib/gateway";
import { getGmSession } from "@/lib/gm-session";
import { isSameOrigin } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ message: "Không được phép." }, { status: 403 });
  }
  if (!isSameOrigin(request)) {
    return NextResponse.json({ message: "Yêu cầu không hợp lệ." }, { status: 403 });
  }
  const gm = await getGmSession();
  if (!gm) {
    return NextResponse.json({ message: "Hãy kết nối quyền GM trước." }, { status: 401 });
  }
  if (gm.role !== 8) {
    return NextResponse.json({ message: "Cần quyền Admin GM mode 8." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({})) as { dataUrl?: unknown; fileName?: unknown };
  const dataUrl = typeof body.dataUrl === "string" ? body.dataUrl : "";
  const fileName = typeof body.fileName === "string" ? body.fileName.slice(0, 120) : "anh-bai-viet";
  if (!/^data:image\/(?:avif|gif|jpeg|png|webp);base64,/i.test(dataUrl)) {
    return NextResponse.json({ message: "Dữ liệu ảnh không hợp lệ." }, { status: 400 });
  }
  if (dataUrl.length > 5_700_000) {
    return NextResponse.json({ message: "Ảnh vượt quá giới hạn 4 MB." }, { status: 413 });
  }

  try {
    const upstream = await fetch(`${gatewayBaseUrl()}/api/gm-support/launcher-news/media`, {
      method: "POST",
      cache: "no-store",
      headers: gatewayHeaders({
        Accept: "application/json",
        Authorization: `Bearer ${gm.token}`,
        "Content-Type": "application/json",
        "User-Agent": "HKNT-GM-Control-Center/2.1",
      }),
      body: JSON.stringify({ dataUrl, fileName }),
      signal: AbortSignal.timeout(30_000),
    });
    const payload = normalizeGatewayPayload(await upstream.json().catch(() => ({}))) as Record<string, unknown>;
    if (!upstream.ok) {
      return NextResponse.json(payload, { status: upstream.status });
    }
    const storedFile = String(payload.file ?? "");
    if (!/^[a-f0-9-]{36}\.(?:avif|gif|jpe?g|png|webp)$/i.test(storedFile)) {
      return NextResponse.json({ message: "Đường dẫn ảnh trả về không hợp lệ." }, { status: 502 });
    }
    return NextResponse.json({
      ...payload,
      url: `${new URL(request.url).origin}/api/launcher-media/${encodeURIComponent(storedFile)}`,
    });
  } catch {
    return NextResponse.json({ message: "Gateway chưa sẵn sàng để lưu ảnh." }, { status: 503 });
  }
}
