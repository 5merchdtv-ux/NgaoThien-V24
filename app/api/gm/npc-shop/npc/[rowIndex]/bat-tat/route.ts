import { proxyGmOperations } from "@/lib/gm-operations-proxy";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

/**
 * Bật/tắt MỘT NPC cụ thể (theo FLD_INDEX của TBL_XWWL_NPC, không phải theo PID) khỏi map đang chạy.
 *
 * Chỉ áp dụng nạp lại cho Kênh 2 (kênh test/fix) — xem chú thích ở gateway Program.cs.
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ rowIndex: string }> },
) {
  const { rowIndex } = await context.params;
  const id = Number.parseInt(rowIndex, 10);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return new Response(JSON.stringify({ success: false, message: "Dòng NPC không hợp lệ." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  return proxyGmOperations(request, `/npc-shop/npc/${id}/bat-tat`, "POST", {
    on: body.on === true,
  });
}
