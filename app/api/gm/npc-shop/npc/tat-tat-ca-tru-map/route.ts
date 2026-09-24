import { proxyGmOperations } from "@/lib/gm-operations-proxy";
import { cleanText } from "@/lib/security";

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
 * Tắt TOÀN BỘ NPC mọi map, trừ các map được chọn giữ mở (map đó tự bật lên).
 *
 * ⚠️ RỦI RO CAO — ~50.000 dòng NPC trên toàn bộ map. Chỉ gọi khi Kênh 2 vắng người hoặc đã báo
 * trước. Xem cảnh báo sự cố thật 07/08/2026 ở gateway Program.cs (ReloadNpcAsync).
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  return proxyGmOperations(request, "/npc-shop/npc/tat-tat-ca-tru-map", "POST", {
    keepOnMapIds: intArray(body.keepOnMapIds, 2000),
    xacNhan: cleanText(body.xacNhan, 60),
  });
}
