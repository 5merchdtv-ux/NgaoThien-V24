import { proxyGmOperations } from "@/lib/gm-operations-proxy";
import { cleanText } from "@/lib/security";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

export async function GET(request: Request) {
  return proxyGmOperations(request, "/pills", "GET");
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const action = cleanText(url.searchParams.get("action"), 32);
  const body = await request.json().catch(() => ({}));

  if (action === "toggle") {
    return proxyGmOperations(request, "/pills/toggle", "POST", body);
  }
  if (action === "toggle-group") {
    return proxyGmOperations(request, "/pills/toggle-group", "POST", body);
  }
  if (action === "reload") {
    return proxyGmOperations(request, "/pills/reload", "POST", body);
  }

  return proxyGmOperations(request, "/pills/toggle", "POST", body);
}
