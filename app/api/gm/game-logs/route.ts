import { proxyGmOperations } from "@/lib/gm-operations-proxy";
import { cleanText } from "@/lib/security";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

function bounded(value: string | null, minimum: number, maximum: number, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isSafeInteger(parsed) && parsed >= minimum && parsed <= maximum ? parsed : fallback;
}

export async function GET(request: Request) {
  const source = new URL(request.url).searchParams;

  // Danh mục phân loại nhật ký — gọi riêng để dựng tab trên giao diện.
  if (source.get("kinds") === "1") {
    return proxyGmOperations(request, "/game-logs/kinds", "GET");
  }

  const parameters = new URLSearchParams();
  const kind = cleanText(source.get("kind"), 30);
  const character = cleanText(source.get("character"), 50);
  if (kind) parameters.set("kind", kind);
  if (character) parameters.set("character", character);
  parameters.set("days", String(bounded(source.get("days"), 1, 365, 7)));
  parameters.set("page", String(bounded(source.get("page"), 1, 100000, 1)));
  parameters.set("pageSize", String(bounded(source.get("pageSize"), 10, 200, 50)));

  return proxyGmOperations(request, `/game-logs?${parameters.toString()}`, "GET");
}
