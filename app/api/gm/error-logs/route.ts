import { proxyGmOperations } from "@/lib/gm-operations-proxy";
import { cleanText } from "@/lib/security";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

export async function GET(request: Request) {
  const source = new URL(request.url).searchParams;
  const channel = source.get("channel") === "2" ? "2" : "1";

  // Danh sách ngày có file log — dùng dựng ô chọn ngày.
  if (source.get("days") === "1") {
    return proxyGmOperations(request, `/error-logs/days?channel=${channel}`, "GET");
  }

  const parameters = new URLSearchParams({ channel });
  const date = cleanText(source.get("date"), 12);
  const group = cleanText(source.get("group"), 200);
  const take = Number.parseInt(source.get("take") ?? "", 10);
  if (date) parameters.set("date", date);
  if (group) parameters.set("group", group);
  parameters.set("take", String(Number.isSafeInteger(take) && take >= 10 && take <= 500 ? take : 100));

  return proxyGmOperations(request, `/error-logs?${parameters.toString()}`, "GET");
}
