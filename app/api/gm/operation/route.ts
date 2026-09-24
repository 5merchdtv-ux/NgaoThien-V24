import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  gatewayBaseUrl,
  gatewayHeaders,
  normalizeGatewayPayload,
} from "@/lib/gateway";
import { getGmSession } from "@/lib/gm-session";
import { cleanText, isSameOrigin } from "@/lib/security";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

const valueRules: Record<string, { min: number; max: number }> = {
  level: { min: 1, max: 200 },
  money: { min: 0, max: 9_000_000_000_000 },
  cash: { min: 0, max: 2_000_000_000 },
  cashx: { min: 0, max: 2_000_000_000 },
  coin: { min: 0, max: 2_000_000_000 },
  donate: { min: 0, max: 2_000_000_000 },
  attack: { min: 0, max: 2_000_000_000 },
  defense: { min: 0, max: 2_000_000_000 },
  hp: { min: 0, max: 2_000_000_000 },
  mp: { min: 0, max: 2_000_000_000 },
  honor: { min: 0, max: 9_000_000_000_000 },
};

function validInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value);
}

function integerInRange(
  value: unknown,
  minimum: number,
  maximum: number,
): value is number {
  return validInteger(value) && value >= minimum && value <= maximum;
}

function itemInteger(
  body: Record<string, unknown>,
  name: string,
  minimum: number,
  maximum: number,
): number | null {
  const value = body[name];
  return integerInRange(value, minimum, maximum) ? value : null;
}

export async function POST(request: Request) {
  if (!isSameOrigin(request) || !(await getAdminSession())) {
    return NextResponse.json({ message: "Không được phép." }, { status: 403 });
  }
  const gm = await getGmSession();
  if (!gm) {
    return NextResponse.json({ message: "Chưa kết nối quyền GM." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ message: "Lệnh không hợp lệ." }, { status: 400 });
  }

  const action = cleanText(body.action, 20);
  const character = cleanText(body.character, 32);
  if (!character) {
    return NextResponse.json({ message: "Thiếu tên nhân vật." }, { status: 400 });
  }

  let operation: Record<string, unknown>;

  if (action === "petRecall" || action === "petSummon") {
    const confirmation = cleanText(body.confirmation, 32);
    const petId = cleanText(body.petId, 24);
    if (
      gm.role !== 8 ||
      confirmation !== character ||
      (action === "petSummon" && !/^\d{1,19}$/.test(petId))
    ) {
      return NextResponse.json(
        { message: "Thông tin PET hoặc tên xác nhận không hợp lệ." },
        { status: 400 },
      );
    }
    operation = {
      action,
      character,
      confirmation,
      ...(action === "petSummon" ? { petId } : {}),
    };
  } else if (action === "setValue") {
    const field = cleanText(body.field, 20).toLowerCase();
    const rule = valueRules[field];
    if (
      !rule ||
      !validInteger(body.value) ||
      body.value < rule.min ||
      body.value > rule.max
    ) {
      return NextResponse.json(
        { message: "Giá trị cập nhật nằm ngoài giới hạn an toàn." },
        { status: 400 },
      );
    }
    operation = { action, character, field, value: body.value };
  } else if (action === "kick" || action === "lock") {
    if (gm.role !== 8) {
      return NextResponse.json(
        { message: "Chỉ Admin mode 8 được dùng thao tác này." },
        { status: 403 },
      );
    }
    if (body.confirmation !== character) {
      return NextResponse.json(
        { message: "Tên xác nhận không khớp nhân vật." },
        { status: 400 },
      );
    }
    operation = { action, character, confirmation: character };
  } else if (action === "convertCharacter") {
    const job = itemInteger(body, "job", 1, 13);
    const faction = itemInteger(body, "faction", 1, 2);
    const sex = itemInteger(body, "sex", 1, 2);
    if (gm.role !== 8 || job === null || faction === null || sex === null) {
      return NextResponse.json(
        { message: "Chuyển nhân vật cần Admin mode 8 và lựa chọn hợp lệ." },
        { status: 403 },
      );
    }
    if (body.confirmation !== character) {
      return NextResponse.json(
        { message: "Tên xác nhận không khớp nhân vật." },
        { status: 400 },
      );
    }
    operation = { action, character, job, faction, sex, confirmation: character };
  } else if (action === "deleteItem") {
    const allowedStorage = [
      "bag",
      "wear",
      "personalWarehouse",
      "publicWarehouse",
      "heavenWarehouse",
    ];
    const storage = cleanText(body.storage, 24);
    const slot = itemInteger(body, "slot", 0, 200);
    const itemId = itemInteger(body, "itemId", 1, 2_000_000_000);
    if (
      gm.role !== 8 ||
      !allowedStorage.includes(storage) ||
      slot === null ||
      itemId === null
    ) {
      return NextResponse.json(
        { message: "Thông tin xóa vật phẩm không hợp lệ." },
        { status: 400 },
      );
    }
    if (body.confirmation !== character) {
      return NextResponse.json(
        { message: "Tên xác nhận không khớp nhân vật." },
        { status: 400 },
      );
    }
    operation = { action, character, storage, slot, itemId, confirmation: character };
  } else if (action === "editItem") {
    const allowedStorage = [
      "bag",
      "wear",
      "personalWarehouse",
      "publicWarehouse",
      "heavenWarehouse",
    ];
    const storage = cleanText(body.storage, 24);
    const slot = itemInteger(body, "slot", 0, 200);
    const itemId = itemInteger(body, "itemId", 1, 2_000_000_000);
    const expectedMagic0 = itemInteger(body, "expectedMagic0", 0, 2_000_000_000);
    const amount = itemInteger(body, "amount", 1, 999_999);
    const enhancement = itemInteger(body, "enhancement", 0, 99);
    const magic1 = itemInteger(body, "magic1", 0, 2_000_000_000);
    const magic2 = itemInteger(body, "magic2", 0, 2_000_000_000);
    const magic3 = itemInteger(body, "magic3", 0, 2_000_000_000);
    const magic4 = itemInteger(body, "magic4", 0, 2_000_000_000);
    if (
      gm.role !== 8 ||
      !allowedStorage.includes(storage) ||
      slot === null ||
      itemId === null ||
      expectedMagic0 === null ||
      amount === null ||
      enhancement === null ||
      magic1 === null ||
      magic2 === null ||
      magic3 === null ||
      magic4 === null
    ) {
      return NextResponse.json(
        { message: "Thuộc tính vật phẩm nằm ngoài giới hạn an toàn." },
        { status: 400 },
      );
    }
    if (body.confirmation !== character) {
      return NextResponse.json(
        { message: "Tên xác nhận không khớp nhân vật." },
        { status: 400 },
      );
    }
    operation = {
      action,
      character,
      storage,
      slot,
      itemId,
      expectedMagic0,
      amount,
      enhancement,
      magic1,
      magic2,
      magic3,
      magic4,
      locked: body.locked === true,
      confirmation: character,
    };
  } else if (action === "addItem") {
    const typeIndex = itemInteger(body, "typeIndex", 0, 10);
    const itemId = itemInteger(body, "itemId", 1, 2_000_000_000);
    const amount = itemInteger(body, "amount", 1, 50);
    const enhancement = itemInteger(body, "enhancement", 0, 99);
    if (typeIndex === null || itemId === null || amount === null || enhancement === null) {
      return NextResponse.json(
        { message: "Thông tin vật phẩm nằm ngoài giới hạn an toàn." },
        { status: 400 },
      );
    }
    const sendAll = body.sendAll === true;
    const targetScope =
      body.targetScope === "all" || body.targetScope === "chinh" || body.targetScope === "ta"
        ? body.targetScope
        : "character";
    if (sendAll && (gm.role !== 8 || body.confirmation !== "GUI TOAN SERVER")) {
      return NextResponse.json(
        { message: "Gửi toàn server cần Admin mode 8 và xác nhận đặc biệt." },
        { status: 403 },
      );
    }

    const optionalRules: Record<string, [number, number]> = {
      elementType: [0, 9],
      elementLevel: [0, 99],
      optionType1: [0, 999_999],
      optionType2: [0, 999_999],
      optionType3: [0, 999_999],
      optionType4: [0, 999_999],
      optionLevel1: [0, 999],
      optionLevel2: [0, 999],
      optionLevel3: [0, 999],
      optionLevel4: [0, 999],
      awakening: [0, 99],
      quality: [0, 99],
      spirit: [0, 99],
      soulStoneId: [0, 2_000_000_000],
      soulEffect: [0, 2_000_000_000],
      healthValue: [0, 999_999_999],
      jewelryOption: [0, 2_000_000_000],
      jewelryValue: [0, 999_999],
      kungFuBase: [0, 2_000_000_000],
      kungFuLevel: [0, 999],
      jewelryEnhanceType: [0, 2_000_000_000],
      jewelryEnhanceLevel: [0, 99],
      heavenType: [0, 2_000_000_000],
      heavenLevel: [0, 99],
      days: [0, 3650],
    };
    const advanced: Record<string, number> = {};
    for (const [name, [minimum, maximum]] of Object.entries(optionalRules)) {
      const value = itemInteger(body, name, minimum, maximum);
      if (value === null) {
        return NextResponse.json(
          { message: `Trường ${name} nằm ngoài giới hạn an toàn.` },
          { status: 400 },
        );
      }
      advanced[name] = value;
    }
    if (typeIndex === 7 && advanced.soulStoneId <= 0) {
      return NextResponse.json(
        { message: "Kỳ ngọc thạch cần PID vật phẩm hợp lệ." },
        { status: 400 },
      );
    }

    operation = {
      action,
      character,
      sendAll,
      targetScope,
      confirmation: sendAll ? "GUI TOAN SERVER" : character,
      typeIndex,
      itemId,
      amount,
      enhancement,
      ...advanced,
      locked: body.locked === true,
    };
  } else {
    return NextResponse.json(
      { message: "Lệnh này không nằm trong danh sách cho phép." },
      { status: 400 },
    );
  }

  try {
    const upstream = await fetch(`${gatewayBaseUrl()}/api/gm-support/operation`, {
      method: "POST",
      cache: "no-store",
      headers: gatewayHeaders({
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${gm.token}`,
        "User-Agent": "HKNT-GM-Control-Center/2.0",
      }),
      body: JSON.stringify(operation),
      signal: AbortSignal.timeout(15_000),
    });
    const payload = normalizeGatewayPayload(await upstream.json().catch(() => ({
      success: false,
      message: "GameServer không trả kết quả hợp lệ.",
    })));
    return NextResponse.json(payload, {
      status: upstream.status,
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch {
    return NextResponse.json(
      { message: "Dịch vụ GM trên GameServer chưa sẵn sàng." },
      { status: 503 },
    );
  }
}
