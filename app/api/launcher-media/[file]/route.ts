import { gatewayBaseUrl, gatewayHeaders } from "@/lib/gateway";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ file: string }> },
) {
  const { file } = await context.params;
  if (!/^[a-f0-9-]{36}\.(?:avif|gif|jpe?g|png|webp)$/i.test(file)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const upstream = await fetch(
      `${gatewayBaseUrl()}/api/gm-support/launcher-news/media/${encodeURIComponent(file)}`,
      {
        cache: "force-cache",
        headers: gatewayHeaders({ "User-Agent": "HKNT-Launcher-Media/1.0" }),
        signal: AbortSignal.timeout(15_000),
      },
    );
    if (!upstream.ok || !upstream.body) {
      return new Response("Not found", { status: upstream.status === 404 ? 404 : 502 });
    }
    return new Response(upstream.body, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Media unavailable", { status: 503 });
  }
}
