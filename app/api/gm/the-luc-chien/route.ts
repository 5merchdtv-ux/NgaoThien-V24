import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  gatewayBaseUrl,
  gatewayHeaders,
  normalizeGatewayPayload,
} from "@/lib/gateway";
import { getGmSession } from "@/lib/gm-session";
import { cleanText, isSameOrigin } from "@/lib/security";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

/**
 * Trang Thế Lực Chiến: điều khiển từng bước, xem thành viên/mạng/AFK, đặt lịch.
 *
 * Mở cho CẢ HAI kênh nhưng khác quyền, và chỗ chặn thật nằm ở gateway chứ không ở đây:
 * - Kênh 2 (>= 22.5.2.140): điều khiển trực tiếp được.
 * - Kênh 1 (đang 22.5.2.89): chỉ đọc. Gateway chặn ghi bằng TlcStore.ChoPhepGhiKenh1.
 *
 * Route này chỉ lọc hình dạng dữ liệu rồi chuyển tiếp — không tự quyết định quyền, để không có
 * hai nơi cùng giữ luật rồi lệch nhau.
 */
async function context() {
  if (!(await getAdminSession())) return null;
  const gm = await getGmSession();
  return gm?.role === 8 ? gm : null;
}

async function forward(path: string, token: string, init?: RequestInit) {
  const upstream = await fetch(`${gatewayBaseUrl()}/api/gm-support/${path}`, {
    ...init,
    cache: "no-store",
    headers: gatewayHeaders({
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "HKNT-GM-Control-Center/2.3",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    }),
    signal: AbortSignal.timeout(20_000),
  });
  const payload = normalizeGatewayPayload(
    await upstream.json().catch(() => ({
      success: false,
      message: "Dịch vụ Thế Lực Chiến không trả dữ liệu hợp lệ.",
    })),
  );
  return NextResponse.json(payload, {
    status: upstream.status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

/** Chỉ nhận kênh 1 hoặc 2. Mặc định 2 — kênh thử, an toàn hơn khi thiếu tham số. */
function kenhHopLe(value: string | null | undefined) {
  return value === "1" ? 1 : 2;
}

export async function GET(request: Request) {
  const gm = await context();
  if (!gm)
    return NextResponse.json({ message: "Chưa kết nối quyền GM mode 8." }, { status: 401 });

  const search = new URL(request.url).searchParams;
  const resource = cleanText(search.get("resource"), 20);
  const kenh = kenhHopLe(search.get("kenh"));
  const maTran = cleanText(search.get("maTran"), 20);
  const soNgay = Number(search.get("soNgay") ?? 7);
  const ngay = Number.isSafeInteger(soNgay) && soNgay >= 1 && soNgay <= 60 ? soNgay : 7;

  const paths: Record<string, string> = {
    trangThai: `tlc/trang-thai?kenh=${kenh}`,
    cauHinh: `tlc/cau-hinh?kenh=${kenh}`,
    bxhPk: `tlc/bxh-pk?kenh=${kenh}&soNgay=${ngay}&maTran=${encodeURIComponent(maTran)}`,
    afk: `tlc/afk?kenh=${kenh}&soNgay=${ngay}&maTran=${encodeURIComponent(maTran)}`,
    thuong: `tlc/thuong?kenh=${kenh}&soNgay=${ngay}&maTran=${encodeURIComponent(maTran)}`,
    eventTop: "tlc/event-top",
  };
  if (!paths[resource])
    return NextResponse.json({ message: "Nhóm dữ liệu không hợp lệ." }, { status: 400 });

  try {
    return await forward(paths[resource], gm.token);
  } catch {
    return NextResponse.json(
      { message: "Dịch vụ Thế Lực Chiến trên VPS chưa sẵn sàng." },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request))
    return NextResponse.json({ message: "Không được phép." }, { status: 403 });
  const gm = await context();
  if (!gm)
    return NextResponse.json({ message: "Chưa kết nối quyền GM mode 8." }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ message: "Dữ liệu thao tác không hợp lệ." }, { status: 400 });
  }

  const action = cleanText(body.action, 20);
  const kenh = body.kenh === 1 ? 1 : 2;
  let path = "";
  let payload: Record<string, unknown> = {};

  if (action === "buoc") {
    const buoc = body.buoc;
    if (!Number.isSafeInteger(buoc) || Number(buoc) < 1 || Number(buoc) > 6)
      return NextResponse.json({ message: "Bước phải trong khoảng 1..6." }, { status: 400 });
    path = "tlc/buoc";
    // Xác nhận do trang tự điền từ đúng kênh đang chọn: nút nằm trong khối của kênh đó nên
    // đã xác định rõ. Gateway vẫn kiểm lại, đây không phải chỗ duy nhất giữ luật.
    payload = { kenh, buoc, xacNhanKenh: `kenh${kenh}` };
  } else if (action === "luuLich") {
    const giaTri = body.giaTri;
    if (!giaTri || typeof giaTri !== "object" || Array.isArray(giaTri))
      return NextResponse.json({ message: "Thiếu giá trị lịch." }, { status: 400 });
    path = "tlc/luu-lich";
    payload = { kenh, giaTri };
  } else if (action === "xoaBang") {
    if (body.xacNhan !== "XOA BANG TLC")
      return NextResponse.json(
        { message: 'Phải gõ đúng "XOA BANG TLC" để xác nhận.' },
        { status: 400 },
      );
    path = "tlc/xoa-bang";
    payload = { kenh, xoaEventTop: body.xoaEventTop === true, xacNhan: "XOA BANG TLC" };
  } else {
    return NextResponse.json({ message: "Thao tác không được hỗ trợ." }, { status: 400 });
  }

  try {
    return await forward(path, gm.token, { method: "POST", body: JSON.stringify(payload) });
  } catch {
    return NextResponse.json(
      { message: "Dịch vụ Thế Lực Chiến trên VPS chưa sẵn sàng." },
      { status: 503 },
    );
  }
}
