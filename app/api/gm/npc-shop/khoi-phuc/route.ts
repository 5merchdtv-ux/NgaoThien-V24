import { proxyGmOperations } from "@/lib/gm-operations-proxy";
import { cleanText } from "@/lib/security";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

/**
 * Trả các dòng shop đã gỡ về lại NPC.
 *
 * Danh sách đã gỡ nằm trong `HK_NPC_SHOP_ARCHIVE` (gateway ghi mỗi lần gỡ) và về cùng chuyến với
 * GET /npc-shop, nên trang hiện được hai bên cạnh nhau: đang bán / đã gỡ.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const archiveIds = Array.isArray(body.archiveIds)
    ? body.archiveIds
        .map((value) =>
          typeof value === "number" && Number.isSafeInteger(value) && value > 0 ? value : 0,
        )
        .filter((value) => value > 0)
        .slice(0, 2000)
    : [];
  const nid =
    typeof body.nid === "number" && Number.isSafeInteger(body.nid) && body.nid > 0 && body.nid <= 999999
      ? body.nid
      : 0;
  return proxyGmOperations(request, "/npc-shop/khoi-phuc", "POST", {
    nid,
    archiveIds,
    xacNhan: cleanText(body.xacNhan, 60),
  });
}
