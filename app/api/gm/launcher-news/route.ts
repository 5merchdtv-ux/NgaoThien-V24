import { proxyGmOperations } from "@/lib/gm-operations-proxy";
import { cleanMultilineText, cleanText } from "@/lib/security";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

function normalize(value: unknown) {
  const item = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return {
    id: cleanText(item.id, 80),
    badge: cleanText(item.badge, 24),
    title: cleanText(item.title, 120),
    description: cleanMultilineText(item.description, 20_000),
    date: cleanText(item.date, 20),
    imageUrl: cleanText(item.imageUrl, 500),
    author: cleanText(item.author, 50),
    status: cleanText(item.status, 20),
    pinned: item.pinned === true,
    publishAtUtc: typeof item.publishAtUtc === "string" ? item.publishAtUtc : null,
  };
}

export async function GET(request: Request) {
  return proxyGmOperations(request, "/launcher-news", "GET");
}

export async function POST(request: Request) {
  return proxyGmOperations(request, "/launcher-news", "POST", normalize(await request.json().catch(() => ({}))));
}

export async function PUT(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  return proxyGmOperations(request, "/launcher-news", "PUT", {
    id: cleanText(body.id, 80),
    status: cleanText(body.status, 20),
    publishAtUtc: typeof body.publishAtUtc === "string" ? body.publishAtUtc : null,
  });
}

export async function DELETE(request: Request) {
  const id = cleanText(new URL(request.url).searchParams.get("id"), 80);
  return proxyGmOperations(request, `/launcher-news/${encodeURIComponent(id)}`, "DELETE");
}
