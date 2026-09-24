import { proxyGmOperations } from "@/lib/gm-operations-proxy";
import { cleanText } from "@/lib/security";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

function int(value: unknown, min: number, max: number, fallback: number) {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= min && value <= max ? value : fallback;
}

export async function GET(request: Request) {
  const kenh = new URL(request.url).searchParams.get("kenh") ?? "2";
  return proxyGmOperations(request, `/xoso/vong?kenh=${encodeURIComponent(kenh)}`, "GET");
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const rawCells = Array.isArray(body.cells) ? body.cells : [];
  const cells = rawCells.slice(0, 40).map((c) => {
    const o = (c && typeof c === "object" ? c : {}) as Record<string, unknown>;
    return {
      viTri: int(o.viTri, 1, 40, 1),
      ten: cleanText(o.ten, 40),
      trongSo: int(o.trongSo, 0, 1000000, 0),
      pid: int(o.pid, -9, 2000000000, 0),
      soLuong: int(o.soLuong, 1, 9999999, 1),
      nhanCuoc: int(o.nhanCuoc, 0, 9999999, 0),
    };
  });
  // Chi cho phep Kenh 2 (Kenh 1 khoa) — gateway cung chan lai.
  return proxyGmOperations(request, "/xoso/vong", "POST", { kenh: 2, cells });
}
