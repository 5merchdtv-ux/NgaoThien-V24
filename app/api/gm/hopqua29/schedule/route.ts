import { proxyGmOperations } from "@/lib/gm-operations-proxy";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

function integer(value: unknown, minimum: number, maximum: number) {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= minimum && value <= maximum
    ? value
    : 0;
}

function dateString(value: unknown) {
  const text = typeof value === "string" ? value.trim() : "";
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : "";
}

function kenhHopLe(value: unknown) {
  return value === 2 || value === "2" ? 2 : 1;
}

// GET: doc lich chay su kien (bat/tat, ngay bat dau/ket thuc, so luong can doi, ti le roi).
// Mac dinh Kenh 1 (kenh chinh) neu khong truyen ?kenh=.
export async function GET(request: Request) {
  const kenh = kenhHopLe(new URL(request.url).searchParams.get("kenh") ?? "1");
  return proxyGmOperations(request, `/hopqua29/schedule?kenh=${kenh}`, "GET");
}

// POST: luu lich chay theo kenh nguoi dung chon, gateway tu tai lai GSConfig cua kenh do sau khi ghi.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  return proxyGmOperations(request, "/hopqua29/schedule", "POST", {
    kenh: kenhHopLe(body.kenh),
    enable: body.enable ? 1 : 0,
    ngayBatDau: dateString(body.ngayBatDau),
    ngayKetThuc: dateString(body.ngayKetThuc),
    soLuongCanDoi: integer(body.soLuongCanDoi, 1, 100_000),
    tyLeRoi: integer(body.tyLeRoi, 1, 100),
  });
}
