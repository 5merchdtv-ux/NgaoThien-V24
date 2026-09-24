import { proxyGmOperations } from "@/lib/gm-operations-proxy";
import { cleanText } from "@/lib/security";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

function integer(value: unknown, minimum: number, maximum: number) {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= minimum && value <= maximum
    ? value
    : 0;
}

function shopItem(value: unknown) {
  const item = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return {
    npcName: cleanText(item.npcName, 100),
    nid: integer(item.nid, 1, 999999),
    slot: integer(item.slot, 0, 9999),
    itemId: integer(item.itemId, 1, 2_000_000_000),
    money: integer(item.money, 0, 999_999_999_999),
    magic0: integer(item.magic0, 0, 2_000_000_000),
    magic1: integer(item.magic1, 0, 2_000_000_000),
    magic2: integer(item.magic2, 0, 2_000_000_000),
    magic3: integer(item.magic3, 0, 2_000_000_000),
    magic4: integer(item.magic4, 0, 2_000_000_000),
    honor: integer(item.honor, 0, 2_000_000_000),
    coin: integer(item.coin, 0, 2_000_000_000),
  };
}

export async function GET(request: Request) {
  const source = new URL(request.url).searchParams;
  const query = cleanText(source.get("query"), 100);
  const nid = cleanText(source.get("nid"), 12);
  const mapId = cleanText(source.get("mapId"), 12);
  const parameters = new URLSearchParams();
  if (query) parameters.set("query", query);
  if (nid) parameters.set("nid", nid);
  if (mapId) parameters.set("mapId", mapId);
  return proxyGmOperations(request, `/npc-shop?${parameters.toString()}`, "GET");
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  return proxyGmOperations(request, "/npc-shop", "POST", shopItem(body.item));
}

export async function PUT(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const id = integer(body.id, 1, 2_000_000_000);
  return proxyGmOperations(request, `/npc-shop/${id}`, "PUT", {
    expectedItemId: integer(body.expectedItemId, 1, 2_000_000_000),
    item: shopItem(body.item),
  });
}

/**
 * Gỡ NHIỀU món của cùng một NPC trong một lần.
 *
 * NPC võ huân có tới 156 dòng; gỡ lẻ thì phải gõ chuỗi xác nhận 156 lần, và mỗi lần lại nạp lại
 * shop cho các kênh đang chạy. Gateway gom vào một giao dịch nên hỏng giữa chừng là trả nguyên
 * trạng, không để NPC còn nửa nạc nửa mỡ.
 */
export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const ids = Array.isArray(body.ids)
    ? body.ids
        .map((value) => integer(value, 1, 2_000_000_000))
        .filter((value) => value > 0)
        .slice(0, 2000)
    : [];
  return proxyGmOperations(request, "/npc-shop/xoa-nhieu", "POST", {
    nid: integer(body.nid, 1, 999999),
    ids,
    xacNhan: cleanText(body.xacNhan, 60),
  });
}

export async function DELETE(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const id = integer(body.id, 1, 2_000_000_000);
  return proxyGmOperations(request, `/npc-shop/${id}`, "DELETE", {
    itemId: integer(body.itemId, 1, 2_000_000_000),
    confirmation: cleanText(body.confirmation, 32),
  });
}
