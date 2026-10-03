import { proxyGmOperations } from "@/lib/gm-operations-proxy";
import { cleanText } from "@/lib/security";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

export async function GET(request: Request) {
  return proxyGmOperations(request, "/vip-pill", "GET");
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const action = cleanText(url.searchParams.get("action"), 32);
  const body = await request.json().catch(() => ({}));

  if (action === "add") {
    return proxyGmOperations(request, "/vip-pill/add", "POST", body);
  }
  if (action === "remove") {
    return proxyGmOperations(request, "/vip-pill/remove", "POST", body);
  }
  if (action === "toggle") {
    return proxyGmOperations(request, "/vip-pill/toggle", "POST", body);
  }
  if (action === "config") {
    return proxyGmOperations(request, "/vip-pill/config", "POST", body);
  }

  return Response.json({ success: false, message: "Hành động không hợp lệ." }, { status: 400 });
}
