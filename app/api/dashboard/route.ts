import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  gatewayBaseUrl,
  gatewayHeaders,
  normalizeGatewayPayload,
} from "@/lib/gateway";
import type {
  DashboardPayload,
  GameChannelStatus,
  ItemEvent,
  RankingEntry,
  RankingType,
  ServerStatus,
} from "@/lib/types";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

const rankingTypes = new Set<RankingType>(["level", "wx", "pvp", "online"]);

async function fetchJson<T>(path: string, revalidate: number): Promise<T> {
  const baseUrl = (
    process.env.API_BASE_URL ?? "https://hkngaothien.duckdns.org"
  ).replace(/\/+$/, "");

  const response = await fetch(`${baseUrl}${path}`, {
    next: { revalidate },
    headers: {
      Accept: "application/json",
      "User-Agent": "HKNT-Internal-Dashboard/1.0",
    },
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`Nguồn dữ liệu trả về mã ${response.status}`);
  }

  return (await response.json()) as T;
}

/**
 * Bảng xếp hạng lấy từ gateway (đọc thẳng database) thay vì API công khai của Launcher Gate.
 *
 * API công khai xếp hạng "Cấp độ" thuần theo cấp, mà Trùng Sinh đặt lại cấp về 100 — người đã
 * trùng sinh bị đẩy xuống dưới người chưa trùng sinh, nhìn vào là sai thứ hạng. Gateway xếp số
 * lần trùng sinh trước rồi mới tới cấp, và trả kèm trường `rebirth` cho cột hiển thị.
 */
async function fetchRankingsFromGateway(
  type: RankingType,
  limit: number,
): Promise<RankingEntry[]> {
  const response = await fetch(
    `${gatewayBaseUrl()}/api/gm-support/bxh?type=${type}&limit=${limit}`,
    {
      cache: "no-store",
      headers: gatewayHeaders({
        Accept: "application/json",
        "User-Agent": "HKNT-Internal-Dashboard/2.3",
      }),
      signal: AbortSignal.timeout(8_000),
    },
  );
  if (!response.ok) {
    throw new Error(`Gateway trả về mã ${response.status}`);
  }
  return normalizeGatewayPayload<RankingEntry[]>(await response.json());
}

async function fetchGameChannels(): Promise<GameChannelStatus> {
  const response = await fetch(`${gatewayBaseUrl()}/api/gm-support/status`, {
    cache: "no-store",
    headers: gatewayHeaders({
      Accept: "application/json",
      "User-Agent": "HKNT-Internal-Dashboard/2.3",
    }),
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) {
    throw new Error(`Gateway trả về mã ${response.status}`);
  }
  return normalizeGatewayPayload<GameChannelStatus>(await response.json());
}

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { message: "Phiên đăng nhập đã hết hạn." },
      { status: 401 },
    );
  }

  const requestedType = request.nextUrl.searchParams.get("ranking") ?? "level";
  const rankingType = rankingTypes.has(requestedType as RankingType)
    ? (requestedType as RankingType)
    : "level";

  try {
    // Gateway hỏng thì vẫn còn bảng cũ để nhìn, chỉ là thiếu trùng sinh và xếp thuần theo cấp.
    // Ver24: cả 2 nguồn (gateway /bxh VÀ fallback Launcher Gate) có thể cùng thiếu ở môi trường
    // local, nên thêm .catch() cuối cùng trả mảng rỗng để không kéo sập toàn bộ Promise.all.
    const rankingPromise = fetchRankingsFromGateway(rankingType, 100)
      .catch(() =>
        fetchJson<RankingEntry[]>(
          `/api/launcher/public/rankings?type=${rankingType}&limit=100`,
          30,
        ),
      )
      .catch((): RankingEntry[] => []);
    const allCharactersPromise =
      rankingType === "level"
        ? rankingPromise
        : fetchRankingsFromGateway("level", 500)
            .catch(() =>
              fetchJson<RankingEntry[]>(
                "/api/launcher/public/rankings?type=level&limit=500",
                30,
              ),
            )
            .catch((): RankingEntry[] => []);
    // Ver24: 3 nguồn dưới đây thuộc "Launcher Gate" — một dịch vụ public RIÊNG (không phải
    // Gateway GM) mà môi trường local Ver24 chưa dựng. Trước đây thiếu .catch() nên chỉ cần
    // 1 trong 3 API này lỗi là cả trang "Người chơi"/Dashboard sập theo (502). Thêm fallback an
    // toàn để trang vẫn hiển thị được phần dữ liệu GM chính (rankings, gameChannels) khi thiếu.
    const eventsPromise = fetchJson<ItemEvent[]>(
      "/api/launcher/public/item-events?limit=100",
      10,
    ).catch((): ItemEvent[] => []);
    const serverStatusPromise = fetchJson<ServerStatus>("/api/status", 10).catch(
      (): ServerStatus => ({
        online: false,
        loginOnline: false,
        gameOnline: false,
        playersOnline: 0,
      }),
    );
    const gameChannelsPromise = fetchGameChannels().catch(
      (): GameChannelStatus => ({
        targetChannels: [1, 2],
        activeChannels: [],
      }),
    );
    const launcherStatusPromise = fetchJson<{ online: boolean }>(
      "/api/launcher/gate-status",
      10,
    ).catch((): { online: boolean } => ({ online: false }));

    const [
      rankings,
      allCharacters,
      events,
      serverStatus,
      gameChannels,
      launcherStatus,
    ] = await Promise.all([
        rankingPromise,
        allCharactersPromise,
        eventsPromise,
        serverStatusPromise,
        gameChannelsPromise,
        launcherStatusPromise,
      ]);

    const hasLiveChannelData = (gameChannels.channels?.length ?? 0) > 0;
    // Gateway nay tra ve ca nguoi dang treo offline trong `members`. Bang xep hang va so
    // "nguoi choi online" cong khai chi nen tinh nguoi that su dang cam may, nen tru phan
    // `hangingMembers` ra. Gateway cu khong co truong nay thi tap tru rong, ket qua giu nguyen.
    const hangingNames = new Set(
      (gameChannels.channels ?? [])
        .filter((channel) => channel.apiOnline)
        .flatMap((channel) => channel.hangingMembers ?? [])
        .map((name) => name.trim().toLocaleLowerCase("vi-VN"))
        .filter(Boolean),
    );
    const liveNames = new Set(
      (gameChannels.channels ?? [])
        .filter((channel) => channel.apiOnline)
        .flatMap((channel) => channel.members ?? [])
        .map((name) => name.trim().toLocaleLowerCase("vi-VN"))
        .filter((name) => name.length > 0 && !hangingNames.has(name)),
    );
    const applyLiveState = (entries: RankingEntry[]): RankingEntry[] =>
      hasLiveChannelData
        ? entries.map((entry) => ({
            ...entry,
            online: liveNames.has(
              entry.characterName.trim().toLocaleLowerCase("vi-VN"),
            ),
          }))
        : entries;
    const liveRankings = applyLiveState(rankings);
    const liveAllCharacters = applyLiveState(allCharacters);
    const liveServerStatus = hasLiveChannelData
      ? { ...serverStatus, playersOnline: liveNames.size }
      : serverStatus;

    const payload: DashboardPayload = {
      rankingType,
      rankings: liveRankings,
      allCharacters: liveAllCharacters,
      onlineCharacters: liveAllCharacters.filter((entry) => entry.online),
      events,
      serverStatus: liveServerStatus,
      gameChannels,
      launcherGateOnline: launcherStatus.online,
      fetchedAt: new Date().toISOString(),
    };

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không thể đọc nguồn dữ liệu.";
    return NextResponse.json({ message }, { status: 502 });
  }
}
