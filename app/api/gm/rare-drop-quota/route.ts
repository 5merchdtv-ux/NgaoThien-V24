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

/**
 * Trần đồ hiếm theo ngày.
 *
 * Gateway ghép hai nguồn: số đã rơi lấy từ bảng HK_RareDropQuota trong database game,
 * còn mức trần đọc từ Gsconfig.ini. Nhóm Boss_* được tách riêng để hiện thành bảng
 * "Drop boss" độc lập với bảng của quái thường.
 */
export async function GET(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ message: "Chưa đăng nhập." }, { status: 401 });
  }
  const gm = await getGmSession();
  if (!gm) {
    return NextResponse.json({ message: "Chưa kết nối quyền GM." }, { status: 401 });
  }
  const params = new URL(request.url).searchParams;
  const raw = Number(params.get("soNgay"));
  const soNgay = Number.isSafeInteger(raw) && raw >= 1 && raw <= 60 ? raw : 14;

  // phan=nhat-ky trả nhật ký từng món; không có thì trả bộ đếm trần.
  const nhatKy = params.get("phan") === "nhat-ky";
  const locRaw = params.get("loc");
  const loc = locRaw === "boss" || locRaw === "thuong" ? locRaw : "";
  const duongDan = nhatKy
    ? `/rare-drop-quota/nhat-ky?soNgay=${soNgay}&gioiHan=200${loc ? `&loc=${loc}` : ""}`
    : `/rare-drop-quota?soNgay=${soNgay}`;

  try {
    const upstream = await fetch(
      `${gatewayBaseUrl()}/api/gm-support${duongDan}`,
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
      { message: "Chưa đọc được bộ đếm trần đồ hiếm trên VPS." },
      { status: 503 },
    );
  }
}
