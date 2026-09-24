import { proxyGmOperations } from "@/lib/gm-operations-proxy";
import { cleanText } from "@/lib/security";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

function integer(value: unknown, minimum: number, maximum: number) {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= minimum && value <= maximum
    ? value
    : 0;
}

function chiDinh(value: unknown) {
  const c = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    kenh: c.kenh === 1 || c.kenh === 2 ? c.kenh : 2,
    ten: cleanText(c.ten, 64),
    lanQuay: integer(c.lanQuay, 1, 100000),
    oSo: integer(c.oSo, 1, 24),
    ghiChu: cleanText(c.ghiChu, 200),
  };
}

export async function GET(request: Request) {
  const kenh = new URL(request.url).searchParams.get("kenh") ?? "0";
  return proxyGmOperations(request, `/xoso/chi-dinh?kenh=${encodeURIComponent(kenh)}`, "GET");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return proxyGmOperations(request, "/xoso/chi-dinh", "POST", chiDinh(body));
}

export async function DELETE(request: Request) {
  const body = await request.json().catch(() => ({}));
  const id = integer((body as Record<string, unknown>).id, 1, Number.MAX_SAFE_INTEGER);
  return proxyGmOperations(request, `/xoso/chi-dinh/${id}`, "DELETE");
}
