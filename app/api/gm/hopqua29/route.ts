import { proxyGmOperations } from "@/lib/gm-operations-proxy";
import { cleanText } from "@/lib/security";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

function integer(value: unknown, minimum: number, maximum: number) {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= minimum && value <= maximum
    ? value
    : 0;
}

function macDinhItem(value: unknown) {
  const item = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    itemId: integer(item.itemId, 1, 2_000_000_000),
    quantity: integer(item.quantity, 1, 9999),
    magic1: integer(item.magic1, 0, 2_000_000_000),
  };
}

function tiLeItem(value: unknown) {
  const item = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const groupId = integer(item.groupId, 1, 2_000_000_000);
  return {
    itemId: integer(item.itemId, 1, 2_000_000_000),
    quantity: integer(item.quantity, 1, 9999),
    weight: integer(item.weight, 1, 100_000),
    groupId: groupId > 0 ? groupId : null,
    groupName: cleanText(item.groupName, 100) || null,
    magic1: integer(item.magic1, 0, 2_000_000_000),
  };
}

// GET: doc toan bo cau hinh (box mac dinh + cac nhom ti le + danh sach da go).
export async function GET(request: Request) {
  return proxyGmOperations(request, "/hopqua29", "GET");
}

// POST: them dong moi. body.kind = "macdinh" | "tile" phan biet 2 nhanh.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (body.kind === "tile") {
    return proxyGmOperations(request, "/hopqua29/tile", "POST", tiLeItem(body.item));
  }
  return proxyGmOperations(request, "/hopqua29/macdinh", "POST", macDinhItem(body.item));
}

// PUT: sua dong da co (mac dinh/ti le) hoac doi ten nhom, phan biet qua body.kind.
export async function PUT(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const id = integer(body.id, 1, 2_000_000_000);
  if (body.kind === "tile") {
    return proxyGmOperations(request, `/hopqua29/tile/${id}`, "PUT", tiLeItem(body.item));
  }
  if (body.kind === "nhom") {
    return proxyGmOperations(request, `/hopqua29/nhom/${id}`, "PUT", {
      groupName: cleanText(body.groupName, 100),
    });
  }
  return proxyGmOperations(request, `/hopqua29/macdinh/${id}`, "PUT", macDinhItem(body.item));
}

// DELETE: xoa 1 dong (mac dinh/ti le) hoac ca 1 nhom, phan biet qua body.kind.
export async function DELETE(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const id = integer(body.id, 1, 2_000_000_000);
  const confirmation = cleanText(body.confirmation, 32);
  if (body.kind === "tile") {
    return proxyGmOperations(request, `/hopqua29/tile/${id}`, "DELETE", { confirmation });
  }
  if (body.kind === "nhom") {
    return proxyGmOperations(request, `/hopqua29/nhom/${id}`, "DELETE", { confirmation });
  }
  return proxyGmOperations(request, `/hopqua29/macdinh/${id}`, "DELETE", { confirmation });
}

// PATCH: khoi phuc hang loat dong tu HK_HOPQUA29_ARCHIVE.
export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const archiveIds = Array.isArray(body.archiveIds)
    ? body.archiveIds
        .map((value) => integer(value, 1, Number.MAX_SAFE_INTEGER))
        .filter((value) => value > 0)
        .slice(0, 2000)
    : [];
  return proxyGmOperations(request, "/hopqua29/khoi-phuc", "POST", {
    archiveIds,
    xacNhan: cleanText(body.xacNhan, 60),
  });
}
