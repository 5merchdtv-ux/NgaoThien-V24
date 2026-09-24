import { proxyGmOperations } from "@/lib/gm-operations-proxy";
import { cleanText } from "@/lib/security";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

function integer(value: unknown, minimum: number, maximum: number) {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= minimum && value <= maximum
    ? value
    : 0;
}

export async function GET(request: Request) {
  const batchId = cleanText(new URL(request.url).searchParams.get("batchId"), 40);
  return proxyGmOperations(request, batchId ? `/vouchers?batchId=${encodeURIComponent(batchId)}` : "/vouchers", "GET");
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const action = cleanText(body.action, 20);
  if (action === "reward") {
    return proxyGmOperations(request, "/vouchers/reward", "POST", {
      type: integer(body.type, 0, 999999),
      rewards: cleanText(body.rewards, 20_000),
      note: cleanText(body.note, 255),
    });
  }
  if (action === "batch") {
    return proxyGmOperations(request, "/vouchers/batch", "POST", {
      name: cleanText(body.name, 100),
      rewardType: integer(body.rewardType, 0, 999999),
      count: integer(body.count, 1, 200),
    });
  }
  return Response.json({ message: "Thao tác Voucher không hợp lệ." }, { status: 400 });
}

export async function PUT(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  return proxyGmOperations(request, "/vouchers/batch", "PUT", {
    batchId: cleanText(body.batchId, 40),
    status: cleanText(body.status, 20),
  });
}
