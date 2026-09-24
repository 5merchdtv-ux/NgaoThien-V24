import { proxyGmOperations } from "@/lib/gm-operations-proxy";
import { cleanText } from "@/lib/security";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

export async function GET(request: Request) {
  return proxyGmOperations(request, "/game-commands", "GET");
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const action = cleanText(url.searchParams.get("action"), 32);
  const body = await request.json().catch(() => ({}));

  if (action === "toggle") {
    return proxyGmOperations(request, "/game-commands/toggle", "POST", body);
  }
  if (action === "toggle-category") {
    return proxyGmOperations(request, "/game-commands/toggle-category", "POST", body);
  }
  if (action === "toggle-all") {
    return proxyGmOperations(request, "/game-commands/toggle-all", "POST", body);
  }
  if (action === "sync") {
    return proxyGmOperations(request, "/game-commands/sync", "POST", body);
  }

  return proxyGmOperations(request, "/game-commands", "GET");
}
