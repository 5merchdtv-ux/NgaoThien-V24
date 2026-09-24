import { proxyGmOperations } from "@/lib/gm-operations-proxy";
import { cleanText } from "@/lib/security";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const action = cleanText(url.searchParams.get("action"), 32);
  const boxPid = cleanText(url.searchParams.get("boxPid"), 16);

  if (action === "boxes") {
    return proxyGmOperations(request, "/drop-events/boxes", "GET");
  }
  if (action === "box-detail" && boxPid) {
    return proxyGmOperations(request, `/drop-events/boxes/${boxPid}`, "GET");
  }

  return proxyGmOperations(request, "/drop-events", "GET");
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const action = cleanText(url.searchParams.get("action"), 32);
  const body = await request.json().catch(() => ({}));

  if (action === "rates") {
    return proxyGmOperations(request, "/drop-events/rates", "POST", body);
  }
  if (action === "event-config") {
    return proxyGmOperations(request, "/drop-events/event-config", "POST", body);
  }
  if (action === "monster-drop") {
    return proxyGmOperations(request, "/drop-events/monster-drop", "POST", body);
  }
  if (action === "monster-drop-bulk") {
    return proxyGmOperations(request, "/drop-events/monster-drop/bulk", "POST", body);
  }
  if (action === "monster-drop-add") {
    return proxyGmOperations(request, "/drop-events/monster-drop/add", "POST", body);
  }
  if (action === "box-reward-update") {
    return proxyGmOperations(request, "/drop-events/boxes/update-reward", "POST", body);
  }
  if (action === "box-reward-bulk") {
    return proxyGmOperations(request, "/drop-events/boxes/bulk", "POST", body);
  }
  if (action === "box-reward-add") {
    return proxyGmOperations(request, "/drop-events/boxes/add-reward", "POST", body);
  }
  if (action === "reload") {
    return proxyGmOperations(request, "/drop-events/reload", "POST", body);
  }

  return proxyGmOperations(request, "/drop-events/rates", "POST", body);
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const action = cleanText(url.searchParams.get("action"), 32);
  const id = cleanText(url.searchParams.get("id"), 16);
  const index = cleanText(url.searchParams.get("index"), 16);

  if (action === "box-reward" && index) {
    return proxyGmOperations(request, `/drop-events/boxes/reward/${index}`, "DELETE");
  }

  if (!id) {
    return new Response(JSON.stringify({ success: false, message: "Thiếu ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  return proxyGmOperations(request, `/drop-events/monster-drop/${id}`, "DELETE");
}
