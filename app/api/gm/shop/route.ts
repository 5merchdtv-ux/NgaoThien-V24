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

type ShopWrite = {
  itemId: number;
  name: string;
  price: number;
  description: string;
  type: number;
  return: number;
  amount: number;
  magic1: number;
  magic2: number;
  magic3: number;
  magic4: number;
  magic5: number;
  primarySoul: number;
  intermediateSoul: number;
  evolution: number;
  locked: number;
  days: number;
};

async function authorizedGatewayHeaders() {
  const gm = await getGmSession();
  if (!gm) return null;
  return {
    gm,
    headers: gatewayHeaders({
      Accept: "application/json",
      Authorization: `Bearer ${gm.token}`,
      "User-Agent": "HKNT-GM-Control-Center/2.0",
    }),
  };
}

function integer(value: unknown, minimum: number, maximum: number) {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= minimum && value <= maximum
    ? value
    : null;
}

function normalizeItem(value: unknown): ShopWrite | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const result = {
    itemId: integer(item.itemId, 1, 2_000_000_000),
    name: cleanText(item.name, 255),
    price: integer(item.price, 0, 2_000_000_000),
    description: cleanText(item.description, 1000),
    type: integer(item.type, 0, 100),
    return: integer(item.return, 0, 2_000_000_000),
    amount: integer(item.amount, 1, 9999),
    magic1: integer(item.magic1, 0, 2_000_000_000),
    magic2: integer(item.magic2, 0, 2_000_000_000),
    magic3: integer(item.magic3, 0, 2_000_000_000),
    magic4: integer(item.magic4, 0, 2_000_000_000),
    magic5: integer(item.magic5, 0, 2_000_000_000),
    primarySoul: integer(item.primarySoul, 0, 2_000_000_000),
    intermediateSoul: integer(item.intermediateSoul, 0, 2_000_000_000),
    evolution: integer(item.evolution, 0, 2_000_000_000),
    locked: integer(item.locked, 0, 1),
    days: integer(item.days, 0, 3650),
  };
  if (!result.name || Object.values(result).some((entry) => entry === null)) return null;
  return result as ShopWrite;
}

async function shopMutation(
  path: string,
  method: "POST" | "PUT" | "DELETE",
  body: unknown,
  headers: Headers,
) {
  try {
    const mutationHeaders = new Headers(headers);
    mutationHeaders.set("Content-Type", "application/json");
    const upstream = await fetch(`${gatewayBaseUrl()}/api/gm-support${path}`, {
      method,
      cache: "no-store",
      headers: mutationHeaders,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
    });
    const payload = normalizeGatewayPayload(await upstream.json().catch(() => ({})));
    return NextResponse.json(payload, {
      status: upstream.status,
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch {
    return NextResponse.json(
      { message: "Dịch vụ Bách Bảo Các trên VPS chưa sẵn sàng." },
      { status: 503 },
    );
  }
}

export async function GET(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ message: "Không được phép." }, { status: 403 });
  }
  const access = await authorizedGatewayHeaders();
  if (!access) {
    return NextResponse.json({ message: "Hãy kết nối quyền GM trước." }, { status: 401 });
  }
  const searchParams = new URL(request.url).searchParams;
  const query = cleanText(searchParams.get("query"), 100);
  const path = searchParams.get("view") === "history"
    ? "/api/gm-support/shop/history"
    : `/api/gm-support/shop?query=${encodeURIComponent(query)}`;
  try {
    const upstream = await fetch(`${gatewayBaseUrl()}${path}`, {
      cache: "no-store",
      headers: access.headers,
      signal: AbortSignal.timeout(12_000),
    });
    const payload = normalizeGatewayPayload(await upstream.json().catch(() => ({})));
    return NextResponse.json(payload, {
      status: upstream.status,
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch {
    return NextResponse.json(
      { message: "Dịch vụ Bách Bảo Các trên VPS chưa sẵn sàng." },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request) || !(await getAdminSession())) {
    return NextResponse.json({ message: "Không được phép." }, { status: 403 });
  }
  const access = await authorizedGatewayHeaders();
  if (!access) {
    return NextResponse.json({ message: "Hãy kết nối quyền GM trước." }, { status: 401 });
  }
  if (access.gm.role !== 8) {
    return NextResponse.json({ message: "Cần quyền Admin GM mode 8." }, { status: 403 });
  }
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (body.action === "reload") {
    return shopMutation("/shop/reload", "POST", {}, access.headers);
  }
  if (body.action !== "create") {
    return NextResponse.json({ message: "Thao tác Bách Bảo Các không hợp lệ." }, { status: 400 });
  }
  const item = normalizeItem(body.item);
  if (!item) {
    return NextResponse.json({ message: "Thông tin mặt hàng không hợp lệ." }, { status: 400 });
  }
  return shopMutation("/shop", "POST", item, access.headers);
}

export async function PUT(request: Request) {
  if (!isSameOrigin(request) || !(await getAdminSession())) {
    return NextResponse.json({ message: "Không được phép." }, { status: 403 });
  }
  const access = await authorizedGatewayHeaders();
  if (!access) {
    return NextResponse.json({ message: "Hãy kết nối quyền GM trước." }, { status: 401 });
  }
  if (access.gm.role !== 8) {
    return NextResponse.json({ message: "Cần quyền Admin GM mode 8." }, { status: 403 });
  }
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const id = integer(body.id, 1, 2_000_000_000);
  const expectedItemId = integer(body.expectedItemId, 1, 2_000_000_000);
  const item = normalizeItem(body.item);
  if (id === null || expectedItemId === null || !item) {
    return NextResponse.json({ message: "Thông tin cập nhật không hợp lệ." }, { status: 400 });
  }
  return shopMutation(`/shop/${id}`, "PUT", { expectedItemId, item }, access.headers);
}

export async function DELETE(request: Request) {
  if (!isSameOrigin(request) || !(await getAdminSession())) {
    return NextResponse.json({ message: "Không được phép." }, { status: 403 });
  }
  const access = await authorizedGatewayHeaders();
  if (!access) {
    return NextResponse.json({ message: "Hãy kết nối quyền GM trước." }, { status: 401 });
  }
  if (access.gm.role !== 8) {
    return NextResponse.json({ message: "Cần quyền Admin GM mode 8." }, { status: 403 });
  }
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const id = integer(body.id, 1, 2_000_000_000);
  const itemId = integer(body.itemId, 1, 2_000_000_000);
  const confirmation = cleanText(body.confirmation, 32);
  if (id === null || itemId === null || confirmation !== `XOA ${itemId}`) {
    return NextResponse.json({ message: "Xác nhận xóa không chính xác." }, { status: 400 });
  }
  return shopMutation(`/shop/${id}`, "DELETE", { itemId, confirmation }, access.headers);
}
