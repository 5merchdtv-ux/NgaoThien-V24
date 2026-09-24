import { proxyGmOperations } from "@/lib/gm-operations-proxy";
import { cleanText } from "@/lib/security";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mapIdStr = cleanText(url.searchParams.get("mapId"), 16);
  const action = cleanText(url.searchParams.get("action"), 32);

  if (mapIdStr && action === "monsters") {
    const mapId = parseInt(mapIdStr, 10);
    if (!isNaN(mapId) && mapId > 0) {
      return proxyGmOperations(request, `/maps/${mapId}/monsters`, "GET");
    }
  }

  return proxyGmOperations(request, "/maps", "GET");
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const action = cleanText(url.searchParams.get("action"), 32);
  const body = await request.json().catch(() => ({}));

  if (action === "toggle") {
    return proxyGmOperations(request, "/maps/toggle", "POST", body);
  }
  if (action === "toggle-monster") {
    return proxyGmOperations(request, "/maps/toggle-monster", "POST", body);
  }
  if (action === "toggle-category") {
    return proxyGmOperations(request, "/maps/toggle-category", "POST", body);
  }
  if (action === "toggle-all") {
    return proxyGmOperations(request, "/maps/toggle-all", "POST", body);
  }
  if (action === "reload") {
    return proxyGmOperations(request, "/maps/reload", "POST", body);
  }

  return proxyGmOperations(request, "/maps", "GET");
}
