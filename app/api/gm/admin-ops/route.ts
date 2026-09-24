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
      "User-Agent": "HKNT-GM-Control-Center/2.2",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    }),
    signal: AbortSignal.timeout(15_000),
  });
  const payload = normalizeGatewayPayload(await upstream.json().catch(() => ({
    success: false,
    message: "Dịch vụ vận hành không trả dữ liệu hợp lệ.",
  })));
  return NextResponse.json(payload, {
    status: upstream.status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

export async function GET(request: Request) {
  const gm = await context();
  if (!gm) return NextResponse.json({ message: "Chưa kết nối quyền GM mode 8." }, { status: 401 });
  const search = new URL(request.url).searchParams;
  const resource = cleanText(search.get("resource"), 20);
  const query = cleanText(search.get("query"), 80);
  const name = cleanText(search.get("name"), 50);
  const paths: Record<string, string> = {
    vip: `vip?query=${encodeURIComponent(query)}`,
    pills: `pills?query=${encodeURIComponent(query)}`,
    characters: `offline/characters?query=${encodeURIComponent(query)}`,
    character: `offline/character?name=${encodeURIComponent(name)}`,
    audit: "audit?take=150",
    // Danh sách cấp quyền vào Kênh 2. Không truyền kenh vì gateway đã mặc định Kênh 2 —
    // trang này chỉ quản lý kênh thử nghiệm, không mở đường sửa danh sách của Kênh 1.
    quyenKenh: `quyen-kenh?query=${encodeURIComponent(query)}`,
  };
  if (!paths[resource]) return NextResponse.json({ message: "Nhóm dữ liệu không hợp lệ." }, { status: 400 });
  try {
    return await forward(paths[resource], gm.token);
  } catch {
    return NextResponse.json({ message: "Dịch vụ vận hành trên VPS chưa sẵn sàng." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ message: "Không được phép." }, { status: 403 });
  const gm = await context();
  if (!gm) return NextResponse.json({ message: "Chưa kết nối quyền GM mode 8." }, { status: 401 });
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ message: "Dữ liệu thao tác không hợp lệ." }, { status: 400 });
  }

  const action = cleanText(body.action, 30);
  let path = "";
  let payload: Record<string, unknown> = {};
  if (action === "setVip") {
    const characterName = cleanText(body.characterName, 50);
    const days = body.days;
    const confirmation = cleanText(body.confirmation, 50);
    if (!characterName || !Number.isSafeInteger(days) || Number(days) < 1 || Number(days) > 3650 || confirmation !== characterName)
      return NextResponse.json({ message: "Tên nhân vật, số ngày hoặc xác nhận không hợp lệ." }, { status: 400 });
    path = "vip";
    payload = { characterName, days, confirmation };
  } else if (action === "revokeVip") {
    const characterName = cleanText(body.characterName, 50);
    const confirmation = cleanText(body.confirmation, 50);
    if (!characterName || confirmation !== characterName)
      return NextResponse.json({ message: "Tên xác nhận không khớp nhân vật." }, { status: 400 });
    path = "vip/revoke";
    payload = { characterName, confirmation };
  } else if (action === "grantKenh2" || action === "revokeKenh2") {
    // Cấp / thu hồi quyền vào Kênh 2 theo TÊN NHÂN VẬT.
    //
    // Admin bấm một nút trên một dòng nhân vật cụ thể, nên phần xác nhận do trang tự điền bằng
    // đúng tên của dòng đó — không bắt gõ lại tên như VIP hay khóa tài khoản. Hai thao tác kia
    // đổi trạng thái tài khoản và khó lùi; còn cấp quyền vào một kênh thử nghiệm thì bấm lại là
    // xong, bắt gõ tay chỉ làm mất đúng cái tiện lợi mà Admin yêu cầu.
    const characterName = cleanText(body.characterName, 50);
    if (!characterName || body.confirmation !== characterName)
      return NextResponse.json({ message: "Thiếu tên nhân vật." }, { status: 400 });
    path = action === "grantKenh2" ? "quyen-kenh" : "quyen-kenh/revoke";
    payload =
      action === "grantKenh2"
        ? { characterName, note: cleanText(body.note, 200), confirmation: characterName }
        : { characterName, confirmation: characterName };
  } else if (action === "setAccountLock") {
    const accountId = cleanText(body.accountId, 50);
    const confirmation = cleanText(body.confirmation, 50);
    if (!accountId || confirmation !== accountId || typeof body.locked !== "boolean")
      return NextResponse.json({ message: "ID xác nhận hoặc trạng thái tài khoản không hợp lệ." }, { status: 400 });
    path = "accounts/lock";
    payload = { accountId, locked: body.locked, confirmation };
  } else {
    return NextResponse.json({ message: "Thao tác không được hỗ trợ." }, { status: 400 });
  }

  try {
    return await forward(path, gm.token, { method: "POST", body: JSON.stringify(payload) });
  } catch {
    return NextResponse.json({ message: "Dịch vụ vận hành trên VPS chưa sẵn sàng." }, { status: 503 });
  }
}
