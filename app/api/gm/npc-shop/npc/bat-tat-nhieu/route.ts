import { proxyGmOperations } from "@/lib/gm-operations-proxy";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

function intArray(value: unknown, max: number): number[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => (typeof entry === "number" && Number.isSafeInteger(entry) && entry > 0 ? entry : 0))
    .filter((entry) => entry > 0)
    .slice(0, max);
}

/**
 * Bật/tắt NHIỀU NPC cụ thể cùng lúc (chọn nhiều trong 1 map trên web).
 *
 * Chỉ áp dụng nạp lại cho Kênh 2 (kênh test/fix) — xem chú thích ở gateway Program.cs.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  return proxyGmOperations(request, "/npc-shop/npc/bat-tat-nhieu", "POST", {
    rowIndexes: intArray(body.rowIndexes, 5000),
    on: body.on === true,
  });
}
