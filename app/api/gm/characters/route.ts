import { proxyGmOperations } from "@/lib/gm-operations-proxy";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

// Tim nhan vat theo ten/ID (dung cho dropdown chon nguoi choi o Rig Xo So).
export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("query") ?? "";
  return proxyGmOperations(request, `/offline/characters?query=${encodeURIComponent(query)}`, "GET");
}
