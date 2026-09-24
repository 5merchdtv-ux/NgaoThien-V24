import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  getGmSession,
  GM_SESSION_COOKIE,
  gmSessionCookieOptions,
} from "@/lib/gm-session";
import {
  gatewayBaseUrl,
  gatewayHeaders,
  normalizeGatewayPayload,
} from "@/lib/gateway";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

function disconnectedResponse(expired = false) {
  const response = NextResponse.json(
    { connected: false, expired },
    { headers: { "Cache-Control": "private, no-store" } },
  );
  if (expired) {
    response.cookies.set(GM_SESSION_COOKIE, "", {
      ...gmSessionCookieOptions,
      expires: new Date(0),
    });
  }
  return response;
}

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ connected: false }, { status: 401 });
  }

  const session = await getGmSession();
  if (!session) return disconnectedResponse();

  let targetChannels: number[] | undefined;
  let activeChannels: number[] | undefined;
  try {
    const upstream = await fetch(`${gatewayBaseUrl()}/api/gm-support/capabilities`, {
      cache: "no-store",
      headers: gatewayHeaders({
        Accept: "application/json",
        Authorization: `Bearer ${session.token}`,
        "User-Agent": "HKNT-GM-Control-Center/2.1",
      }),
      signal: AbortSignal.timeout(8_000),
    });
    if (upstream.status === 401 || upstream.status === 403) {
      return disconnectedResponse(true);
    }
    if (upstream.ok) {
      const capabilities = normalizeGatewayPayload<{
        targetChannels?: number[];
        activeChannels?: number[];
      }>(await upstream.json());
      targetChannels = capabilities.targetChannels;
      activeChannels = capabilities.activeChannels;
    }
  } catch {
    // Giữ phiên đã mã hóa trong thời gian Gateway tạm mất kết nối.
  }
  return NextResponse.json(
    {
      connected: true,
      accountId: session.accountId,
      displayName: session.displayName ?? session.accountId,
      role: session.role,
      targetChannels,
      activeChannels,
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
