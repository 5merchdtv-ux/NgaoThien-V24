import { proxyGmOperations } from "@/lib/gm-operations-proxy";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

/**
 * Số lượt quay + đóng góp hũ của từng người trong CHU KỲ jackpot hiện tại.
 *
 * Vì sao cần: chỉ định người trúng (`FLD_LANQUAY`) khớp ĐÚNG số lượt quay trong chu kỳ, mà con số
 * đó chỉ nằm trong bộ nhớ GameServer — không ai nhìn thấy. Tối 16/08 Admin đặt "lần quay 1" cho
 * một nhân vật nhưng lượt 1 đã trôi qua từ lúc máy chủ khởi động, nên chỉ định không bao giờ nổ
 * rồi bị huỷ khi hũ nổ.
 *
 * Chỉ đọc, không sửa gì. Cần GameServer từ 22.5.2.222 trở lên.
 */
export async function GET(request: Request) {
  const kenh = new URL(request.url).searchParams.get("kenh") ?? "0";
  return proxyGmOperations(request, `/xoso/luot-quay?kenh=${encodeURIComponent(kenh)}`, "GET");
}
