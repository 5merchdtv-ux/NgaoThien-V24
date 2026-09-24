import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  gatewayBaseUrl,
  gatewayHeaders,
  normalizeGatewayPayload,
} from "@/lib/gateway";
import { getGmSession } from "@/lib/gm-session";
import { isSameOrigin } from "@/lib/security";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

// Tham số ưu đãi VIP (Gsconfig.ini, mục [GameServer]) — đọc/ghi qua GmSupportPipeServer trên
// GameServer thật (action "getvipconfig"/"setvipconfig"), KHÔNG đụng DB — khác hẳn "VIP Name"
// (AdvancedOperations.tsx) vốn ghi thẳng TBL_ACCOUNT.FLD_VIPTIM cho từng tài khoản.
const fieldRules: Record<string, { min: number; max: number }> = {
  vipExpPercent: { min: 0.01, max: 5 },
  vipMoneyPercent: { min: 0.01, max: 5 },
  vipTrainingPercent: { min: 0.01, max: 5 },
  vipCritRateBonus: { min: 1, max: 1000 },
  vipSynthesisPercent: { min: 0, max: 50 },
  vipLineMode: { min: 0, max: 1 },
  checkinCashReward: { min: 0, max: 100_000_000 },
  checkinHonorReward: { min: 0, max: 100_000_000 },
};

async function callGateway(gmToken: string, operation: Record<string, unknown>) {
  const upstream = await fetch(`${gatewayBaseUrl()}/api/gm-support/operation`, {
    method: "POST",
    cache: "no-store",
    headers: gatewayHeaders({
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${gmToken}`,
      "User-Agent": "HKNT-GM-Control-Center/2.0",
    }),
    body: JSON.stringify(operation),
    signal: AbortSignal.timeout(15_000),
  });
  const payload = normalizeGatewayPayload(
    await upstream.json().catch(() => ({
      success: false,
      message: "GameServer không trả kết quả hợp lệ.",
    })),
  );
  return { upstream, payload };
}

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ message: "Không được phép." }, { status: 403 });
  }
  const gm = await getGmSession();
  if (!gm) {
    return NextResponse.json({ message: "Chưa kết nối quyền GM." }, { status: 401 });
  }
  try {
    // sendAll=false: chỉ hỏi 1 kênh đang sống để lấy đủ dữ liệu chi tiết (gửi cả 2 kênh sẽ chỉ
    // trả về 1 thông báo gộp chung, mất hết số liệu — xem GamePipeClient.SendOperationAsync).
    const { upstream, payload } = await callGateway(gm.token, {
      action: "getvipconfig",
    });
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

export async function POST(request: Request) {
  if (!isSameOrigin(request) || !(await getAdminSession())) {
    return NextResponse.json({ message: "Không được phép." }, { status: 403 });
  }
  const gm = await getGmSession();
  if (!gm) {
    return NextResponse.json({ message: "Chưa kết nối quyền GM." }, { status: 401 });
  }
  if (gm.role !== 8) {
    return NextResponse.json(
      { message: "Chỉ Admin mode 8 được sửa cấu hình VIP." },
      { status: 403 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ message: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const operation: Record<string, unknown> = { action: "setvipconfig", sendAll: true };
  let hasField = false;
  for (const [field, rule] of Object.entries(fieldRules)) {
    if (!(field in body)) continue;
    const value = body[field];
    if (typeof value !== "number" || !Number.isFinite(value) || value < rule.min || value > rule.max) {
      return NextResponse.json(
        { message: `Trường ${field} phải từ ${rule.min} đến ${rule.max}.` },
        { status: 400 },
      );
    }
    operation[field] = value;
    hasField = true;
  }
  if ("vipMaps" in body) {
    const value = body.vipMaps;
    if (typeof value !== "string" || value.length > 500 || !/^[0-9;]*$/.test(value)) {
      return NextResponse.json(
        { message: "Danh sách bản đồ VIP chỉ được chứa số và dấu ';'." },
        { status: 400 },
      );
    }
    operation.vipMaps = value;
    hasField = true;
  }
  if (!hasField) {
    return NextResponse.json({ message: "Không có trường nào để lưu." }, { status: 400 });
  }

  try {
    // sendAll=true: áp dụng cho CẢ 2 kênh cùng lúc để tránh 2 file config.ini lệch nhau —
    // phản hồi chi tiết bị gộp thành 1 thông báo chung, trang sẽ tự GET lại sau khi lưu xong.
    const { upstream, payload } = await callGateway(gm.token, operation);
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
