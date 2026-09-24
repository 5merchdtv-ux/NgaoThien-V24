"use client";

import {
  AlertTriangle,
  BadgeCheck,
  Ban,
  Coins,
  Gift,
  KeyRound,
  LoaderCircle,
  LogOut,
  PackagePlus,
  PawPrint,
  Pill,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Swords,
  Trash2,
  UserCog,
  UserRound,
  Users,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import type {
  GmItemSnapshot,
  GmMemberChannel,
  GmMemberSnapshot,
  GmSessionStatus,
  PillSummary,
} from "@/lib/types";
import { fixVietnameseName } from "@/lib/vni-fix";
import { decodeGemMagic0 } from "@/lib/gem-attribute";
import Modal from "./Modal";

type Props = {
  publicPlayerCount: number;
  publicOnlineNames: string[];
  jobName: (job: number) => string;
  factionName: (faction: number) => string;
};

type Notice = { tone: "success" | "error"; message: string } | null;
type ItemCatalogEntry = {
  itemId: number;
  name: string;
  level: number;
  jobLevel: number;
  questItem: boolean;
};

type DecodedItemAttribute = {
  key: string;
  label: string;
  value: string;
  description: string;
  raw: number;
};

type InventoryStorage =
  | "bag"
  | "wear"
  | "auxiliaryEquipment"
  | "spiritBag"
  | "questBag"
  | "personalWarehouse"
  | "publicWarehouse"
  | "heavenWarehouse";

type SelectedInventoryItem = {
  storage: InventoryStorage;
  item: GmItemSnapshot;
};

type ItemEditDraft = {
  amount: string;
  enhancement: string;
  magic1: string;
  magic2: string;
  magic3: string;
  magic4: string;
  locked: boolean;
};

function ItemIcon({ itemId, name }: { itemId: number | string; name?: string }) {
  const [hidden, setHidden] = useState(false);
  const normalizedId = String(itemId).trim();

  if (!normalizedId) return null;

  if (hidden) {
    return (
      <span className="gm-item-icon gm-item-icon-fallback" aria-hidden="true">
        <PackagePlus size={21} />
      </span>
    );
  }

  return (
    <img
      className="gm-item-icon"
      src={`/item-icons/${normalizedId}.jpg`}
      alt={name ? `${name} (PID ${normalizedId})` : `Vật phẩm PID ${normalizedId}`}
      width={46}
      height={46}
      loading="lazy"
      onError={() => setHidden(true)}
    />
  );
}

const VALUE_FIELDS = [
  { value: "level", label: "Cấp độ", icon: Zap },
  { value: "money", label: "Gold", icon: Coins },
  { value: "cash", label: "Cash", icon: WalletCards },
  { value: "cashx", label: "Cash X", icon: WalletCards },
  { value: "coin", label: "Coin", icon: Coins },
  { value: "donate", label: "Điểm Donate", icon: BadgeCheck },
  { value: "honor", label: "Võ huân", icon: Swords },
  { value: "attack", label: "Công lực cộng thêm", icon: Zap },
  { value: "defense", label: "Phòng thủ cộng thêm", icon: ShieldCheck },
  { value: "hp", label: "HP cộng thêm", icon: BadgeCheck },
  { value: "mp", label: "MP cộng thêm", icon: BadgeCheck },
];

const ITEM_TYPES = [
  { value: 0, label: "Vật phẩm thường", hint: "Tạo item không kèm thuộc tính." },
  { value: 1, label: "Vũ khí cường hóa", hint: "Vũ khí có cường hóa, nguyên tố và 4 dòng option." },
  { value: 2, label: "Trang bị cường hóa", hint: "Áo, giáp tay, giày có cường hóa và option." },
  { value: 3, label: "Theo thuộc tính trong database", hint: "Giữ nguyên toàn bộ thuộc tính gốc của item." },
  { value: 4, label: "Máu / sâm siêu thị" },
  { value: 5, label: "Ngọc KC / HNT", hint: "Chọn loại thuộc tính ngọc và giá trị." },
  { value: 6, label: "Võ công Nhiệt Huyết Thạch" },
  { value: 7, label: "Kỳ ngọc thạch" },
  { value: 8, label: "Cường hóa trang sức" },
  { value: 9, label: "Cường hóa PET Heaven" },
  { value: 10, label: "Cường hóa áo choàng" },
];

const OPTION_TYPES = [
  { value: 0, label: "Không có thuộc tính" },
  { value: 10000, label: "Công lực" },
  { value: 20000, label: "Lực phòng ngự" },
  { value: 110000, label: "Phòng ngự võ công" },
  { value: 70000, label: "Công lực võ công" },
  { value: 80000, label: "Khí công" },
  { value: 90000, label: "May mắn" },
  { value: 30000, label: "Sinh mệnh" },
  { value: 40000, label: "Nội công" },
  { value: 50000, label: "Chính xác" },
  { value: 60000, label: "Né tránh" },
  { value: 100000, label: "Thêm điểm đả kích" },
  { value: 120000, label: "Tiền" },
  { value: 130000, label: "Giảm tổn thất EXP" },
];

const ELEMENT_TYPES = [
  { value: 0, label: "Không có nguyên tố" },
  { value: 1, label: "Hỏa công" },
  { value: 2, label: "Thủy công" },
  { value: 3, label: "Phong công" },
  { value: 4, label: "Nội công" },
  { value: 5, label: "Ngoại công" },
  { value: 6, label: "Độc công" },
];

const JEWELRY_OPTIONS = [
  { value: 0, label: "Không có thuộc tính" },
  { value: 100000, label: "Công lực" },
  { value: 700000, label: "Công lực võ công" },
  { value: 200000, label: "Lực phòng ngự" },
  { value: 800000, label: "Khí công" },
  { value: 900000, label: "May mắn" },
  { value: 300000, label: "Sinh mệnh" },
  { value: 400000, label: "Nội công" },
  { value: 500000, label: "Chính xác" },
  { value: 600000, label: "Né tránh" },
  { value: 1100000, label: "Phòng ngự võ công" },
  { value: 1000000, label: "Thêm điểm đả kích" },
  { value: 1200000, label: "Tiền" },
  { value: 1300000, label: "Giảm tổn thất EXP" },
];

const SOUL_STONES = [
  { value: 800000046, label: "Hạ cấp kỳ ngọc thạch" },
  { value: 800000047, label: "Trung cấp kỳ ngọc thạch" },
  { value: 800000048, label: "Cao cấp kỳ ngọc thạch" },
  { value: 800000049, label: "Siêu cấp kỳ ngọc thạch" },
];

const SOUL_EFFECTS = [
  { value: 0, label: "Không có tác dụng" },
  { value: 27, label: "Phục cừu 5% · Vũ khí" },
  { value: 30, label: "Hấp hồn 3% · Vũ khí" },
  { value: 33, label: "Kỳ duyên 3% · Vũ khí" },
  { value: 36, label: "Phẫn nộ 3% · Vũ khí" },
  { value: 41, label: "Di tinh 5% · Áo giáp" },
  { value: 46, label: "Hộ thể 5% · Áo giáp" },
  { value: 51, label: "Hỗn nguyên 5% · Áo giáp" },
  { value: 5, label: "Tâm 5%" },
  { value: 10, label: "Khí 5%" },
  { value: 15, label: "Thể 5%" },
  { value: 21, label: "Hồn 1%" },
  { value: 22, label: "Tỉnh ngộ +1" },
  { value: 23, label: "Tỉnh ngộ +2" },
];

const JEWELRY_ENHANCE_TYPES = [
  { value: 0, label: "Không chọn" },
  { value: 100000, label: "Nhẫn" },
  { value: 200000, label: "Dây chuyền" },
  { value: 300000, label: "Khuyên tai" },
];

const HEAVEN_TYPES = [
  { value: 220000000, label: "PET Heaven · Cấp độ 1" },
  { value: 220000001, label: "PET Heaven · Cấp độ 2" },
  { value: 220000002, label: "PET Heaven · Cấp độ 3" },
  { value: 220000003, label: "PET Heaven · Cấp độ 4" },
];

const AWAKENING_LEVELS = Array.from({ length: 11 }, (_, value) => ({
  value,
  label: value === 0 ? "Không tỉnh ngộ" : `Tỉnh ngộ +${value}`,
}));

const QUALITY_LEVELS = [
  { value: 0, label: "Thường" },
  { value: 1, label: "Khá tốt" },
  { value: 2, label: "Cao cấp" },
];

const SPIRIT_LEVELS = [
  { value: 0, label: "Không" },
  { value: 1, label: "Huyền Vũ" },
  { value: 2, label: "Chu Tước" },
  { value: 3, label: "Bạch Hổ" },
  { value: 4, label: "Thanh Long" },
];

const INVENTORY_TABS: Array<{
  key: InventoryStorage;
  label: string;
}> = [
  { key: "bag", label: "Túi đồ" },
  { key: "wear", label: "Trang bị" },
  { key: "auxiliaryEquipment", label: "Trang bị phụ" },
  { key: "spiritBag", label: "Túi Thần" },
  { key: "questBag", label: "Túi nhiệm vụ" },
  { key: "personalWarehouse", label: "Kho riêng" },
  { key: "publicWarehouse", label: "Kho chung" },
  { key: "heavenWarehouse", label: "Kho Heaven" },
];

const WEAR_SLOT_LABELS = [
  "Y phục",
  "Hộ thủ trái",
  "Hộ thủ phải",
  "Vũ khí",
  "Ủng / Giày",
  "Nội giáp",
  "Dây chuyền",
  "Khuyên tai trái",
  "Khuyên tai phải",
  "Nhẫn trái",
  "Nhẫn phải",
  "Áo choàng",
  "Sách / Mũi tên",
  "Áo choàng bang",
  "Thú nuôi",
  "Thần thú",
  "Hạt ngọc",
];

const INVENTORY_MINIMUM_SLOTS: Record<string, number> = {
  wear: 17,
  bag: 36,
  auxiliaryEquipment: 14,
  spiritBag: 6,
  questBag: 36,
  personalWarehouse: 60,
  publicWarehouse: 60,
  heavenWarehouse: 60,
};

const ATTRIBUTE_NAMES: Record<number, { label: string; percent?: boolean }> = {
  1: { label: "Sức tấn công" },
  2: { label: "Sức phòng ngự" },
  3: { label: "Sinh mệnh (HP)" },
  4: { label: "Nội công (MP)" },
  5: { label: "Chính xác" },
  6: { label: "Né tránh" },
  7: { label: "Công lực võ công", percent: true },
  8: { label: "Khí công" },
  9: { label: "Tỷ lệ hợp thành / cường hóa", percent: true },
  10: { label: "Điểm đả kích" },
  11: { label: "Phòng ngự võ công" },
  12: { label: "Tiền nhận được", percent: true },
  13: { label: "Giảm tổn thất EXP", percent: true },
};

const SPECIAL_ATTRIBUTE_NAMES: Record<number, string> = {
  5: "Tâm +5%",
  10: "Khí +5%",
  15: "Thể +5%",
  21: "Hồn +1%",
  22: "Tỉnh ngộ +1",
  23: "Tỉnh ngộ +2",
  27: "Phục cừu +5%",
  30: "Hấp hồn +3%",
  33: "Kỳ duyên +3%",
  36: "Phẫn nộ +3%",
  41: "Di tinh +5%",
  46: "Hộ thể +5%",
  51: "Hỗn nguyên +5%",
};

const HEAVEN_ATTRIBUTE_NAMES: Record<number, string> = {
  220000000: "PET Heaven · Cấp độ 1",
  220000001: "PET Heaven · Cấp độ 2",
  220000002: "PET Heaven · Cấp độ 3",
  220000003: "PET Heaven · Cấp độ 4",
};

function decodeItemAttribute(rawValue: number, line: number): DecodedItemAttribute | null {
  const raw = Number(rawValue) || 0;
  if (raw <= 0) return null;

  if (HEAVEN_ATTRIBUTE_NAMES[raw]) {
    return {
      key: `line-${line}`,
      label: "Thuộc tính Heaven",
      value: HEAVEN_ATTRIBUTE_NAMES[raw],
      description: "Cấp thuộc tính dành cho vật phẩm PET Heaven.",
      raw,
    };
  }

  if (SPECIAL_ATTRIBUTE_NAMES[raw]) {
    return {
      key: `line-${line}`,
      label: "Thuộc tính đặc biệt",
      value: SPECIAL_ATTRIBUTE_NAMES[raw],
      description: "Hiệu ứng đặc biệt được gắn trên vật phẩm.",
      raw,
    };
  }

  // Trang bị thường dùng loại * 10.000.000 + giá trị. Trang sức dùng
  // loại * 100.000 + giá trị. Đây là đúng cách GameServer tách MAGIC1-4.
  const divider = raw >= 10_000_000 ? 10_000_000 : raw >= 100_000 ? 100_000 : 0;
  const type = divider ? Math.trunc(raw / divider) : 0;
  const amount = divider ? raw - type * divider : raw;
  const definition = ATTRIBUTE_NAMES[type];

  if (definition) {
    const suffix = definition.percent ? "%" : "";
    const readableAmount = type === 8 && amount > 99 ? amount % 100 : amount;
    return {
      key: `line-${line}`,
      label: `Dòng ${line} · ${definition.label}`,
      value: `+${readableAmount}${suffix}`,
      description:
        type === 8 && amount > 99
          ? "Khí công chuyên biệt được tăng cấp."
          : `${definition.label} tăng thêm ${readableAmount}${suffix}.`,
      raw,
    };
  }

  return {
    key: `line-${line}`,
    label: `Dòng ${line} · Thuộc tính đặc biệt`,
    value: "Đang có hiệu lực",
    description: "Mã thuộc tính riêng của vật phẩm; xem phần kỹ thuật khi cần đối chiếu.",
    raw,
  };
}

function inventoryPositionName(storage: InventoryStorage, slot: number) {
  if (storage === "wear") return WEAR_SLOT_LABELS[slot] ?? `Vị trí trang bị ${slot}`;
  return `Ô ${slot}`;
}

/**
 * Dòng mô tả thuộc tính cho ngọc, dùng trong tooltip.
 * Trả về null nếu không phải ngọc, khi đó nơi gọi hiển thị mức cường hóa như cũ.
 */
function gemLine(magic0: number | null | undefined): string | null {
  const gem = decodeGemMagic0(magic0);
  if (!gem) return null;
  const info = ATTRIBUTE_NAMES[gem.type];
  const label = info?.label ?? `Thuộc tính ${gem.type}`;
  return `${label}: +${gem.value}${info?.percent ? "%" : ""}`;
}

/** Dựng danh sách ô cho một kho bất kỳ, không phụ thuộc tab đang chọn. */
function buildInventorySlots(items: GmItemSnapshot[] | undefined, storage: InventoryStorage) {
  const list = items ?? [];
  const bySlot = new Map(list.map((item) => [item.slot, item]));
  const highest = list.reduce((max, item) => Math.max(max, item.slot), -1);
  const minimum = INVENTORY_MINIMUM_SLOTS[storage] ?? 36;
  const count =
    storage === "wear"
      ? Math.max(minimum, highest + 1)
      : Math.max(minimum, Math.ceil((highest + 1) / 12) * 12);
  return {
    used: list.length,
    count,
    slots: Array.from({ length: count }, (_, slot) => ({ slot, item: bySlot.get(slot) })),
  };
}

/** Một lưới ô vật phẩm. Dùng chung cho trang bị, túi đồ và các kho khác. */
function InventorySlotGrid({
  storage,
  slots,
  selected,
  onSelect,
  onOpenDetails,
}: {
  storage: InventoryStorage;
  slots: Array<{ slot: number; item: GmItemSnapshot | undefined }>;
  selected: SelectedInventoryItem | null;
  onSelect: (value: SelectedInventoryItem | null) => void;
  onOpenDetails: (value: SelectedInventoryItem) => void;
}) {
  return (
    <div
      className={`inventory-game-grid ${storage === "wear" ? "wear-grid" : "bag-grid"} storage-${storage}`}
    >
      {slots.map(({ slot, item }) => {
        const readableAttributes = item
          ? [item.magic1, item.magic2, item.magic3, item.magic4]
              .map((raw, index) => decodeItemAttribute(raw, index + 1))
              .filter((entry): entry is DecodedItemAttribute => entry !== null)
              .map((entry) => `${entry.label.replace(/^Dòng \d+ · /, "")}: ${entry.value}`)
              .join("\n")
          : "";
        const details = item
          ? `${fixVietnameseName(item.name) || `Vật phẩm ${item.itemId}`}\nVị trí: ${inventoryPositionName(storage, item.slot)}\nSố lượng: ${item.amount}\n${gemLine(item.magic0) ?? `Cường hóa: +${item.enhancement}`}${readableAttributes ? `\n${readableAttributes}` : "\nKhông có dòng thuộc tính"}${item.locked ? "\nĐã khóa" : ""}`
          : `Ô ${slot} trống`;
        const isSelected =
          selected?.storage === storage && selected.item.slot === slot;
        return (
          <button
            type="button"
            className={`inventory-slot ${item ? "occupied" : "empty"} ${
              storage === "wear" ? `wear-slot-${slot}` : ""
            } ${isSelected ? "selected" : ""}`}
            title={details}
            onClick={() => onSelect(item ? { storage, item } : null)}
            onDoubleClick={() => {
              if (item) onOpenDetails({ storage, item });
            }}
            key={`${storage}-${slot}`}
          >
            <span className="inventory-slot-number">{slot}</span>
            {storage === "wear" ? (
              <span className="inventory-slot-label">
                {WEAR_SLOT_LABELS[slot] ?? `Ô ${slot}`}
              </span>
            ) : null}
            {item ? (
              <>
                <ItemIcon itemId={item.itemId} name={fixVietnameseName(item.name)} />
                {item.enhancement > 0 ? (
                  <strong className="inventory-slot-enhance">+{item.enhancement}</strong>
                ) : null}
                {item.amount > 1 ? (
                  <strong className="inventory-slot-amount">{item.amount}</strong>
                ) : null}
                {item.locked ? <span className="inventory-slot-lock">KHÓA</span> : null}
                <span className="inventory-slot-name">{fixVietnameseName(item.name) || `PID ${item.itemId}`}</span>
                <small>PID {item.itemId}</small>
              </>
            ) : (
              <span className="inventory-slot-empty-mark" aria-hidden="true" />
            )}
          </button>
        );
      })}
    </div>
  );
}

const JOB_OPTIONS = [
  "Đao",
  "Kiếm",
  "Thương",
  "Cung",
  "Đại Phu",
  "Ninja",
  "Cầm Sư",
  "Hàn Bảo Quân",
  "Đàm Hoa Liên",
  "Quyền Sư",
  "Mai Liễu Chân",
  "Tử Hào",
  "Tử Nữ",
].map((label, index) => ({ value: index + 1, label }));

function formInteger(form: FormData, name: string): number {
  const value = Number(form.get(name) ?? 0);
  return Number.isSafeInteger(value) ? value : Number.NaN;
}

function vipExpiryText(value: string | null | undefined): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

/** VIP=1 trên DB không tự tắt khi hết hạn — phải tự so sánh vipExpiresAt với giờ hiện tại. */
function isVipActive(member: GmMemberSnapshot): boolean {
  if (!member.vip || !member.vipExpiresAt) return false;
  return new Date(member.vipExpiresAt).getTime() > Date.now();
}

function pillIconSrc(duocPhamID: number): string {
  return `/item-icons/${duocPhamID}.jpg`;
}

/** remainingSeconds là số giây GameServer tính tại thời điểm trả lời, không tự đếm ngược. */
function formatPillRemaining(remainingSeconds: number): string {
  if (remainingSeconds <= 0) return "Đã hết hạn";
  const totalMinutes = Math.floor(remainingSeconds / 60);
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `Còn ${days} ngày ${hours} giờ`;
  if (hours > 0) return `Còn ${hours} giờ ${minutes} phút`;
  return `Còn ${minutes} phút`;
}

function pillExpiryText(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

/**
 * Tên pill lấy từ TBL_XWWL_ITEM (FLD_NAME) — nhiều dòng trong DB gốc chưa được dịch, còn nguyên
 * tiếng Trung. Bảng này dịch các tên đã gặp qua tính năng pill; pill mới gặp mà chưa có trong
 * bảng thì giữ nguyên tên gốc (không tự bịa dịch sai).
 */
const PILL_NAME_OVERRIDES: Record<string, string> = {
  "生死符(5)": "Sinh Tử Phù (5)",
  "至尊热血符": "Chí Tôn Nhiệt Huyết Phù (30 ngày)",
  "至尊热血符(10天)": "Chí Tôn Nhiệt Huyết Phù (10 ngày)",
  "玄武赤炼符(30天)": "Huyền Vũ Xích Luyện Phù (30 ngày)",
  "vip会员(1天)": "Thẻ Hội Viên VIP (1 ngày)",
  "vip会员(10天)": "Thẻ Hội Viên VIP (10 ngày)",
  "vip会员(30天)": "Thẻ Hội Viên VIP (30 ngày)",
};

/** Tiền tố danh hiệu Top10 Võ Lâm/Thế Lực Chiến — PID 1008001240-1008001309, mẫu cố định. */
const HONOR_RANK_PREFIX: Record<string, string> = {
  "势力战至尊": "Thế Lực Chiến Chí Tôn",
  "武林血战杀手": "Võ Lâm Huyết Chiến Sát Thủ",
  "武林血战千人斩": "Võ Lâm Huyết Chiến Thiên Nhân Trảm",
  "武林血战万人敌": "Võ Lâm Huyết Chiến Vạn Nhân Địch",
  "武林血战宗师": "Võ Lâm Huyết Chiến Tông Sư",
  "武林血战至尊": "Võ Lâm Huyết Chiến Chí Tôn",
  "斗神": "Đấu Thần",
};

const CHINESE_RANK_NUMERAL: Record<string, string> = {
  "一": "1",
  "二": "2",
  "三": "3",
  "四": "4",
  "五": "5",
  "六": "6",
  "七": "7",
  "八": "8",
  "九": "9",
  "十": "10",
};

function translatePillName(rawName: string): string {
  const trimmed = rawName.trim();
  if (PILL_NAME_OVERRIDES[trimmed]) return PILL_NAME_OVERRIDES[trimmed];

  // Mẫu "<tiền tố Hán>(第<số Hán>名)" hoặc "<tiền tố Hán> 第<số Hán>名" (斗神 dùng dấu cách).
  const match = trimmed.match(/^(.+?)[\s(（]*第([一二三四五六七八九十])名[)）]?\s*$/);
  if (match) {
    const [, prefix, numeral] = match;
    const viPrefix = HONOR_RANK_PREFIX[prefix.trim()];
    const rank = CHINESE_RANK_NUMERAL[numeral];
    if (viPrefix && rank) return `${viPrefix} (Hạng ${rank})`;
  }
  return rawName;
}

function numericValue(member: GmMemberSnapshot, field: string): number {
  const map: Record<string, number> = {
    level: member.level,
    money: member.money,
    cash: member.cash,
    cashx: member.cashX,
    coin: member.coin,
    donate: member.donate,
    honor: member.honor,
    attack: member.attackBonus,
    defense: member.defenseBonus,
    hp: member.hpBonus,
    mp: member.mpBonus,
  };
  return map[field] ?? 0;
}

export default function GmConsole({
  publicPlayerCount,
  publicOnlineNames,
  jobName,
  factionName,
}: Props) {
  const [session, setSession] = useState<GmSessionStatus>({ connected: false });
  const [checking, setChecking] = useState(true);
  const [members, setMembers] = useState<string[]>([]);
  const [memberChannels, setMemberChannels] = useState<GmMemberChannel[]>([]);
  /** Tên nhân vật (đã hạ chữ thường) đang treo offline. Rỗng nghĩa là gateway chưa phân loại. */
  const [hangingNames, setHangingNames] = useState<Set<string>>(new Set());
  const [membersLoading, setMembersLoading] = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const [member, setMember] = useState<GmMemberSnapshot | null>(null);
  const [memberLoading, setMemberLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [openChannel, setOpenChannel] = useState<number | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [statDrafts, setStatDrafts] = useState<Record<string, string>>({});
  const [vipQuickDays, setVipQuickDays] = useState("30");
  const [vipQuickOpen, setVipQuickOpen] = useState(false);
  const [vipActionLoading, setVipActionLoading] = useState(false);
  const [pillDetail, setPillDetail] = useState<{ name: string; pills: PillSummary[] } | null>(null);
  const [toolTab, setToolTab] = useState<"stats" | "character" | "item">("stats");
  const [operationLoading, setOperationLoading] = useState(false);
  const [dangerConfirmation, setDangerConfirmation] = useState("");
  const [liveOperationsAvailable, setLiveOperationsAvailable] = useState(false);
  const [itemType, setItemType] = useState(1);
  const [sendScope, setSendScope] = useState<"character" | "all" | "chinh" | "ta">("character");
  const [sendAllConfirmation, setSendAllConfirmation] = useState("");
  const [convertJob, setConvertJob] = useState(1);
  const [convertFaction, setConvertFaction] = useState(1);
  const [convertSex, setConvertSex] = useState(1);
  const [convertConfirmation, setConvertConfirmation] = useState("");
  const [selectedInventoryItem, setSelectedInventoryItem] =
    useState<SelectedInventoryItem | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [itemEditConfirmation, setItemEditConfirmation] = useState("");
  const [itemEditDraft, setItemEditDraft] = useState<ItemEditDraft | null>(null);
  const [itemDetails, setItemDetails] = useState<SelectedInventoryItem | null>(null);
  const [itemDetailCatalog, setItemDetailCatalog] = useState<ItemCatalogEntry | null>(null);
  const [itemDetailCatalogLoading, setItemDetailCatalogLoading] = useState(false);
  const [petConfirmation, setPetConfirmation] = useState("");
  const [inventoryTab, setInventoryTab] =
    useState<InventoryStorage>("bag");
  const [itemQuery, setItemQuery] = useState("");
  const [itemId, setItemId] = useState("");
  const [itemResults, setItemResults] = useState<ItemCatalogEntry[]>([]);
  const [itemSearchLoading, setItemSearchLoading] = useState(false);

  useEffect(() => {
    if (openChannel === null) return;

    function closeOutside(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Element) || !target.closest(".channel-member-dropdown")) {
        setOpenChannel(null);
      }
    }

    function closeWithEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenChannel(null);
    }

    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeWithEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, [openChannel]);

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch("/api/gm/session", { cache: "no-store" });
      const payload = (await response.json()) as GmSessionStatus;
      setSession(payload);
    } catch {
      setSession({ connected: false });
    } finally {
      setChecking(false);
    }
  }, []);

  const loadMembers = useCallback(async () => {
    setMembersLoading(true);
    setNotice(null);
    try {
      const response = await fetch("/api/gm/members", { cache: "no-store" });
      const payload = (await response.json()) as {
        success?: boolean;
        message?: string;
        members?: string[];
        memberChannels?: GmMemberChannel[];
        hangingMembers?: string[];
        liveOperationsAvailable?: boolean;
        source?: string;
      };
      if (!response.ok || payload.success !== true) {
        throw new Error(payload.message ?? "Không tải được danh sách nhân vật.");
      }
      setMembers(payload.members ?? []);
      setMemberChannels(
        (payload.memberChannels ?? []).filter(
          (entry) =>
            (entry.channelId === 1 || entry.channelId === 2) &&
            entry.userName.trim().length > 0,
        ),
      );
      // Nhận cờ treo từ hai chỗ: danh sách phẳng `hangingMembers` và cờ trên từng dòng
      // `memberChannels`. Ai không có trong bảng phân kênh vẫn phải phân loại được.
      setHangingNames(
        new Set(
          [
            ...(payload.hangingMembers ?? []),
            ...(payload.memberChannels ?? [])
              .filter((entry) => entry.hangingOffline === true)
              .map((entry) => entry.userName),
          ]
            .map((name) => name.trim().toLocaleLowerCase("vi"))
            .filter(Boolean),
        ),
      );
      setLiveOperationsAvailable(
        payload.liveOperationsAvailable !== false &&
          payload.source !== "database-readonly",
      );
      // KHÔNG tự chọn nhân vật đầu danh sách. Trước đây tự chọn nên web gọi
      // snapshot ngay khi mở trang, nhân vật đó có thể đã offline và GameServer
      // ghi log đỏ "GM Support snapshot failed: Nhân vật phải đang online".
      // Để trống cho tới khi người dùng tự bấm chọn.
    } catch (error) {
      setNotice({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "Không tải được danh sách nhân vật.",
      });
    } finally {
      setMembersLoading(false);
    }
  }, [selectedName]);

  const loadMember = useCallback(async (name: string) => {
    if (!name) return;
    setMemberLoading(true);
    setNotice(null);
    try {
      const response = await fetch(
        `/api/gm/member?name=${encodeURIComponent(name)}`,
        { cache: "no-store" },
      );
      const payload = (await response.json()) as GmMemberSnapshot;
      if (!response.ok || payload.success !== true) {
        throw new Error(payload.message || "Không đọc được thông tin nhân vật.");
      }
      setMember(payload);
      setConvertJob(payload.job >= 1 && payload.job <= 13 ? payload.job : 1);
      setConvertFaction(payload.faction === 2 ? 2 : 1);
      setConvertSex(payload.sex === 2 ? 2 : 1);
      setConvertConfirmation("");
      setSelectedInventoryItem(null);
      setDeleteConfirmation("");
      setItemEditConfirmation("");
      setItemEditDraft(null);
      setItemDetails(null);
      setPetConfirmation("");
      const isLiveMember = members.some(
        (memberName) =>
          memberName.localeCompare(payload.userName, "vi", {
            sensitivity: "accent",
          }) === 0,
      );
      setLiveOperationsAvailable(
        isLiveMember &&
          payload.liveOperationsAvailable !== false &&
          payload.source !== "database-readonly",
      );
      setStatDrafts(
        Object.fromEntries(
          VALUE_FIELDS.map((entry) => [entry.value, String(numericValue(payload, entry.value))]),
        ),
      );
      setDangerConfirmation("");
    } catch (error) {
      setMember(null);
      setNotice({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "Không đọc được thông tin nhân vật.",
      });
    } finally {
      setMemberLoading(false);
    }
  }, [members]);

  /**
   * Gia hạn / thu hồi VIP ngay tại trang hồ sơ nhân vật — gọi thẳng /api/gm/admin-ops (ghi thẳng
   * TBL_ACCOUNT, KHÔNG qua liveOperationsAvailable) vì VIP là thuộc tính TÀI KHOẢN, phải dùng được
   * cả khi nhân vật đang offline, khác với "Cập nhật chỉ số" vốn cần nhân vật online.
   */
  async function vipQuickAction(action: "setVip" | "revokeVip") {
    if (!member) return;
    const days = Number(vipQuickDays);
    if (action === "setVip" && (!Number.isSafeInteger(days) || days < 1 || days > 3650)) {
      setNotice({ tone: "error", message: "Số ngày VIP phải từ 1 đến 3650." });
      return;
    }
    const confirmed = window.confirm(
      action === "setVip"
        ? `Cấp thêm ${days} ngày VIP cho ${member.userName}?`
        : `Thu hồi VIP của ${member.userName} ngay bây giờ?`,
    );
    if (!confirmed) return;
    setVipActionLoading(true);
    setNotice(null);
    try {
      const response = await fetch("/api/gm/admin-ops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          action === "setVip"
            ? { action, characterName: member.userName, days, confirmation: member.userName }
            : { action, characterName: member.userName, confirmation: member.userName },
        ),
      });
      const payload = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || payload.success !== true) {
        throw new Error(payload.message ?? "Thao tác VIP thất bại.");
      }
      setNotice({ tone: "success", message: payload.message ?? "Đã cập nhật VIP." });
      setVipQuickOpen(false);
      await loadMember(member.userName);
    } catch (error) {
      setNotice({
        tone: "error",
        message: error instanceof Error ? error.message : "Thao tác VIP thất bại.",
      });
    } finally {
      setVipActionLoading(false);
    }
  }

  useEffect(() => {
    void checkSession();
    const refresh = () => void checkSession();
    window.addEventListener("hknt:gm-session-changed", refresh);
    return () => window.removeEventListener("hknt:gm-session-changed", refresh);
  }, [checkSession]);

  useEffect(() => {
    if (!session.connected) return;
    // 30 giây thay vì 10. Mỗi nhịp là một vòng Vercel → VPS rồi mở pipe tới từng kênh
    // GameServer; 10 giây một lần vừa tốn vòng mạng vừa tranh lượt với thao tác GM đang làm.
    const timer = window.setInterval(() => {
      void checkSession();
    }, 30_000);
    return () => window.clearInterval(timer);
  }, [session.connected, checkSession]);

  const hasActiveChannel = (session.activeChannels?.length ?? 0) > 0;

  useEffect(() => {
    if (session.connected && hasActiveChannel) void loadMembers();
  }, [session.connected, hasActiveChannel, loadMembers]);

  useEffect(() => {
    if (session.connected && selectedName) void loadMember(selectedName);
  }, [session.connected, selectedName, loadMember]);

  useEffect(() => {
    if (!itemDetails) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setItemDetails(null);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [itemDetails]);

  useEffect(() => {
    if (!itemDetails || !session.connected) {
      setItemDetailCatalog(null);
      setItemDetailCatalogLoading(false);
      return;
    }

    const controller = new AbortController();
    const item = itemDetails.item;
    setItemDetailCatalog(null);
    setItemDetailCatalogLoading(true);
    void fetch(`/api/gm/items?query=${encodeURIComponent(String(item.itemId))}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = (await response.json()) as {
          success?: boolean;
          items?: ItemCatalogEntry[];
        };
        if (!response.ok || payload.success !== true) return null;
        return (payload.items ?? []).find((entry) => entry.itemId === item.itemId) ?? null;
      })
      .then((catalogItem) => {
        if (!controller.signal.aborted) setItemDetailCatalog(catalogItem);
      })
      .catch(() => {
        if (!controller.signal.aborted) setItemDetailCatalog(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setItemDetailCatalogLoading(false);
      });

    return () => controller.abort();
  }, [itemDetails, session.connected]);

  useEffect(() => {
    const query = itemQuery.trim();
    if (!session.connected || query.length < 2) {
      setItemResults([]);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setItemSearchLoading(true);
      try {
        const response = await fetch(
          `/api/gm/items?query=${encodeURIComponent(query)}`,
          { cache: "no-store", signal: controller.signal },
        );
        const payload = (await response.json()) as {
          success?: boolean;
          items?: ItemCatalogEntry[];
        };
        setItemResults(response.ok && payload.success ? payload.items ?? [] : []);
      } catch {
        if (!controller.signal.aborted) setItemResults([]);
      } finally {
        if (!controller.signal.aborted) setItemSearchLoading(false);
      }
    }, 280);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [itemQuery, session.connected]);

  async function operate(operation: Record<string, unknown>, success: string) {
    if (!liveOperationsAvailable) {
      setNotice({
        tone: "error",
        message:
          "GameServer đang ở chế độ chỉ đọc. Add đồ và chỉnh dữ liệu live chưa được phép.",
      });
      return;
    }
    setOperationLoading(true);
    setNotice(null);
    try {
      const response = await fetch("/api/gm/operation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(operation),
      });
      const payload = (await response.json()) as {
        success?: boolean;
        message?: string;
      };
      if (!response.ok || payload.success !== true) {
        throw new Error(payload.message ?? "GameServer từ chối thao tác.");
      }
      setNotice({ tone: "success", message: success });
      const action = String(operation.action ?? "");
      if (
        action === "convertCharacter" ||
        action === "deleteItem" ||
        action === "editItem"
      ) {
        setMember(null);
        window.setTimeout(() => void loadMembers(), 1800);
      } else if ((action === "petRecall" || action === "petSummon") && selectedName) {
        window.setTimeout(() => void loadMember(selectedName), 450);
      } else if (selectedName) {
        await loadMember(selectedName);
      }
    } catch (error) {
      setNotice({
        tone: "error",
        message:
          error instanceof Error ? error.message : "Không thể thực hiện thao tác.",
      });
    } finally {
      setOperationLoading(false);
    }
  }

  function convertCharacter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!member) return;
    if (convertConfirmation !== member.userName) {
      setNotice({ tone: "error", message: "Hãy nhập đúng tên nhân vật để xác nhận chuyển đổi." });
      return;
    }
    void operate(
      {
        action: "convertCharacter",
        character: member.userName,
        job: convertJob,
        faction: convertFaction,
        sex: convertSex,
        confirmation: convertConfirmation,
      },
      `Đã chuyển ${member.userName} sang ${JOB_OPTIONS[convertJob - 1]?.label ?? `Char ${convertJob}`}, ${
        convertFaction === 1 ? "Chính phái" : "Tà phái"
      }, ${convertSex === 1 ? "Nam" : "Nữ"}.`,
    );
  }

  function deleteSelectedItem() {
    if (!member || !selectedInventoryItem) return;
    if (deleteConfirmation !== member.userName) {
      setNotice({ tone: "error", message: "Hãy nhập đúng tên nhân vật để xác nhận xóa vật phẩm." });
      return;
    }
    const selected = selectedInventoryItem;
    void operate(
      {
        action: "deleteItem",
        character: member.userName,
        storage: selected.storage,
        slot: selected.item.slot,
        itemId: selected.item.itemId,
        confirmation: deleteConfirmation,
      },
      `Đã xóa ${fixVietnameseName(selected.item.name) || `PID ${selected.item.itemId}`} ở ô ${selected.item.slot}.`,
    );
  }

  function editSelectedItem() {
    if (!member || !selectedInventoryItem || !itemEditDraft) return;
    if (selectedChannel !== 1) {
      setNotice({ tone: "error", message: "Chức năng sửa thuộc tính hiện chỉ mở trên Kênh 1." });
      return;
    }
    if (itemEditConfirmation !== member.userName) {
      setNotice({ tone: "error", message: "Hãy nhập đúng tên nhân vật để xác nhận sửa vật phẩm." });
      return;
    }
    const values = {
      amount: Number(itemEditDraft.amount),
      enhancement: Number(itemEditDraft.enhancement),
      magic1: Number(itemEditDraft.magic1),
      magic2: Number(itemEditDraft.magic2),
      magic3: Number(itemEditDraft.magic3),
      magic4: Number(itemEditDraft.magic4),
    };
    if (Object.values(values).some((value) => !Number.isSafeInteger(value) || value < 0)) {
      setNotice({ tone: "error", message: "Các thuộc tính phải là số nguyên trong giới hạn cho phép." });
      return;
    }
    const selected = selectedInventoryItem;
    void operate(
      {
        action: "editItem",
        character: member.userName,
        storage: selected.storage,
        slot: selected.item.slot,
        itemId: selected.item.itemId,
        expectedMagic0: selected.item.magic0 ?? 0,
        ...values,
        locked: itemEditDraft.locked,
        confirmation: itemEditConfirmation,
      },
      `Đã cập nhật ${fixVietnameseName(selected.item.name) || `PID ${selected.item.itemId}`} ở ô ${selected.item.slot}.`,
    );
  }

  async function updateAllValues(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!member) return;
    const changes = VALUE_FIELDS.map((entry) => ({
      ...entry,
      valueNumber: Number(statDrafts[entry.value]),
    })).filter(
      (entry) =>
        Number.isSafeInteger(entry.valueNumber) &&
        entry.valueNumber !== numericValue(member, entry.value),
    );
    if (VALUE_FIELDS.some((entry) => !Number.isSafeInteger(Number(statDrafts[entry.value])))) {
      setNotice({ tone: "error", message: "Các chỉ số phải là số nguyên hợp lệ." });
      return;
    }
    if (changes.length === 0) {
      setNotice({ tone: "success", message: "Không có chỉ số nào thay đổi." });
      return;
    }
    setOperationLoading(true);
    setNotice(null);
    try {
      for (const entry of changes) {
        const response = await fetch("/api/gm/operation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "setValue",
            character: member.userName,
            field: entry.value,
            value: entry.valueNumber,
          }),
        });
        const payload = (await response.json()) as { success?: boolean; message?: string };
        if (!response.ok || payload.success !== true) {
          throw new Error(`${entry.label}: ${payload.message ?? "GameServer từ chối."}`);
        }
      }
      setNotice({
        tone: "success",
        message: `Đã cập nhật ${changes.length} chỉ số của ${member.userName}.`,
      });
      await loadMember(member.userName);
    } catch (error) {
      setNotice({
        tone: "error",
        message: error instanceof Error ? error.message : "Không thể cập nhật chỉ số.",
      });
    } finally {
      setOperationLoading(false);
    }
  }

  function sendItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!member) return;
    const form = new FormData(event.currentTarget);
    const itemId = formInteger(form, "itemId");
    const amount = formInteger(form, "amount");
    const enhancement = formInteger(form, "enhancement");
    const sendAll = sendScope !== "character";
    if (sendAll && sendAllConfirmation !== "GUI TOAN SERVER") {
      setNotice({
        tone: "error",
        message: "Nhập đúng GUI TOAN SERVER để xác nhận gửi toàn bộ người chơi.",
      });
      return;
    }
    void operate(
      {
        action: "addItem",
        character: member.userName,
        typeIndex: itemType,
        itemId,
        amount,
        enhancement,
        elementType: formInteger(form, "elementType"),
        elementLevel: formInteger(form, "elementLevel"),
        optionType1: formInteger(form, "optionType1"),
        optionType2: formInteger(form, "optionType2"),
        optionType3: formInteger(form, "optionType3"),
        optionType4: formInteger(form, "optionType4"),
        optionLevel1: formInteger(form, "optionLevel1"),
        optionLevel2: formInteger(form, "optionLevel2"),
        optionLevel3: formInteger(form, "optionLevel3"),
        optionLevel4: formInteger(form, "optionLevel4"),
        awakening: formInteger(form, "awakening"),
        quality: formInteger(form, "quality"),
        spirit: formInteger(form, "spirit"),
        soulStoneId: formInteger(form, "soulStoneId"),
        soulEffect: formInteger(form, "soulEffect"),
        healthValue: formInteger(form, "healthValue"),
        jewelryOption: formInteger(form, "jewelryOption"),
        jewelryValue: formInteger(form, "jewelryValue"),
        kungFuBase: formInteger(form, "kungFuBase"),
        kungFuLevel: formInteger(form, "kungFuLevel"),
        jewelryEnhanceType: formInteger(form, "jewelryEnhanceType"),
        jewelryEnhanceLevel: formInteger(form, "jewelryEnhanceLevel"),
        heavenType: formInteger(form, "heavenType"),
        heavenLevel: formInteger(form, "heavenLevel"),
        locked: form.get("locked") === "on",
        days: formInteger(form, "days"),
        sendAll,
        targetScope: sendScope,
        confirmation: sendAll ? sendAllConfirmation : member.userName,
      },
      sendAll
        ? `Đã gửi vật phẩm ${itemId} x${amount} theo phạm vi ${
            sendScope === "chinh" ? "Chính phái" : sendScope === "ta" ? "Tà phái" : "toàn bộ kênh đang hoạt động"
          }.`
        : `Đã gửi vật phẩm ${itemId} x${amount} cho ${member.userName}.`,
    );
  }

  const inventoryItems: GmItemSnapshot[] = member?.[inventoryTab] ?? [];
  const inventoryBySlot = new Map(inventoryItems.map((item) => [item.slot, item]));
  const highestInventorySlot = inventoryItems.reduce(
    (highest, item) => Math.max(highest, item.slot),
    -1,
  );
  const minimumInventorySlots = INVENTORY_MINIMUM_SLOTS[inventoryTab] ?? 36;
  const inventorySlotCount =
    inventoryTab === "wear"
      ? Math.max(minimumInventorySlots, highestInventorySlot + 1)
      : Math.max(
          minimumInventorySlots,
          Math.ceil((highestInventorySlot + 1) / 12) * 12,
        );
  const inventorySlots = Array.from({ length: inventorySlotCount }, (_, slot) => ({
    slot,
    item: inventoryBySlot.get(slot),
  }));
  const inventoryCanDelete = ![
    "auxiliaryEquipment",
    "spiritBag",
    "questBag",
  ].includes(inventoryTab);
  // Trang bị và túi đồ luôn hiện cùng lúc, không phụ thuộc tab đang chọn.
  const wearSlots = buildInventorySlots(member?.wear, "wear");
  const bagSlots = buildInventorySlots(member?.bag, "bag");
  // Túi đồ là MỘT kho 96 ô đánh số 0-95. Chia đôi để hiển thị cho gọn:
  // 36 ô đầu (6x6) là túi chính, 60 ô sau (6x10) là túi phụ. Số ô giữ nguyên
  // nên bấm chọn và sửa vẫn trỏ đúng ô thật trong game.
  const BAG_MAIN_SLOTS = 36;
  const bagMainSlots = bagSlots.slots.slice(0, BAG_MAIN_SLOTS);
  const bagAuxSlots = bagSlots.slots.slice(BAG_MAIN_SLOTS);
  const bagMainUsed = bagMainSlots.filter((entry) => entry.item).length;
  const bagAuxUsed = bagAuxSlots.filter((entry) => entry.item).length;
  const handleSelectInventory = (value: SelectedInventoryItem | null) => {
    setSelectedInventoryItem(value);
    setDeleteConfirmation("");
    setItemEditConfirmation("");
    setItemEditDraft(
      value
        ? {
            amount: String(value.item.amount),
            enhancement: String(value.item.enhancement),
            magic1: String(value.item.magic1),
            magic2: String(value.item.magic2),
            magic3: String(value.item.magic3),
            magic4: String(value.item.magic4),
            locked: value.item.locked,
          }
        : null,
    );
  };
  // Ngọc để thuộc tính trong MAGIC0 chứ không phải magic1-4, nên phải giải riêng.
  const itemDetailGem = itemDetails ? decodeGemMagic0(itemDetails.item.magic0) : null;

  const itemDetailAttributes = itemDetails
    ? [
        ...(itemDetailGem
          ? [
              {
                key: "gem-magic0",
                label: ATTRIBUTE_NAMES[itemDetailGem.type]?.label ?? `Thuộc tính ${itemDetailGem.type}`,
                value: ATTRIBUTE_NAMES[itemDetailGem.type]?.percent
                  ? `+${itemDetailGem.value}%`
                  : `+${itemDetailGem.value}`,
                description: `Thuộc tính của ngọc, mã MAGIC0 ${itemDetails.item.magic0}`,
              } as DecodedItemAttribute,
            ]
          : []),
        ...[
          itemDetails.item.magic1,
          itemDetails.item.magic2,
          itemDetails.item.magic3,
          itemDetails.item.magic4,
        ]
          .map((raw, index) => decodeItemAttribute(raw, index + 1))
          .filter((entry): entry is DecodedItemAttribute => entry !== null),
      ]
    : [];

  const hasExactChannelMembers = memberChannels.length > 0;
  /**
   * Ai có trong danh sách GM Support (`members`) mà bảng phân kênh
   * (`memberChannels`) không có thì vẫn phải hiện, nếu không sẽ bị mất người.
   * Đã gặp thật: GameServer trả về 6 người nhưng web chỉ hiện 5 vì bảng phân
   * kênh thiếu một nhân vật mới tạo.
   */
  const unmappedMembers = useMemo(() => {
    if (!hasExactChannelMembers) return [];
    const mapped = new Set(
      memberChannels.map((entry) => entry.userName.toLocaleLowerCase("vi")),
    );
    return members.filter((name) => !mapped.has(name.toLocaleLowerCase("vi")));
  }, [hasExactChannelMembers, memberChannels, members]);

  const channel2Members = useMemo(() => {
    const values = hasExactChannelMembers
      ? [
          ...memberChannels
            .filter((entry) => entry.channelId === 2)
            .map((entry) => entry.userName),
          ...unmappedMembers,
        ]
      : members;
    return [...new Set(values)].sort((left, right) => left.localeCompare(right, "vi"));
  }, [hasExactChannelMembers, memberChannels, members, unmappedMembers]);
  const channel1Members = useMemo(() => {
    if (hasExactChannelMembers) {
      return [
        ...new Set(
          memberChannels
            .filter((entry) => entry.channelId === 1)
            .map((entry) => entry.userName),
        ),
      ].sort((left, right) => left.localeCompare(right, "vi"));
    }
    const channel2Names = new Set(members.map((name) => name.toLocaleLowerCase("vi")));
    return [...new Set(publicOnlineNames)]
      .filter((name) => !channel2Names.has(name.toLocaleLowerCase("vi")))
      .sort((left, right) => left.localeCompare(right, "vi"));
  }, [hasExactChannelMembers, memberChannels, members, publicOnlineNames]);
  const channel1Count = hasExactChannelMembers
    ? channel1Members.length
    : Math.max(channel1Members.length, publicPlayerCount - channel2Members.length);

  /**
   * Tra pill theo "kênh-tên" (không chỉ theo tên) vì cùng một tên có thể xuất hiện độc lập trên
   * cả hai kênh với bộ pill khác nhau. Chỉ có dữ liệu khi lấy được trực tiếp từ pipe GameServer.
   */
  const pillsByChannelName = useMemo(() => {
    const map = new Map<string, PillSummary[]>();
    for (const entry of memberChannels) {
      if (entry.pills && entry.pills.length > 0) {
        map.set(`${entry.channelId}-${entry.userName.toLocaleLowerCase("vi")}`, entry.pills);
      }
    }
    return map;
  }, [memberChannels]);

  /**
   * Nhân vật treo offline vẫn nằm trong thế giới GameServer nên vẫn hiện ra và vẫn thao tác
   * được; chỉ là tài khoản đã rời socket. Gateway cũ chưa gửi cờ này thì `hangingNames` rỗng
   * và mọi người đều không có nhãn — chấp nhận được, hơn là gán nhãn sai.
   */
  const isHanging = useCallback(
    (name: string) => hangingNames.has(name.trim().toLocaleLowerCase("vi")),
    [hangingNames],
  );
  const hasHangingData = hangingNames.size > 0;
  const countHanging = useCallback(
    (values: string[]) => values.filter(isHanging).length,
    [isHanging],
  );
  const totalMemberCount = channel1Count + channel2Members.length;
  const totalHangingCount =
    countHanging(channel1Members) + countHanging(channel2Members);
  const totalPlayingCount = Math.max(0, totalMemberCount - totalHangingCount);
  const selectedChannel = hasExactChannelMembers
    ? memberChannels.find((entry) => entry.userName === selectedName)?.channelId ??
      // Không có trong bảng phân kênh: coi như Kênh 2 vì đó là nơi GM Support
      // lấy danh sách, tránh mặc định sai sang Kênh 1 rồi thao tác nhầm kênh.
      (channel2Members.includes(selectedName) ? 2 : 1)
    : channel2Members.includes(selectedName) ? 2 : 1;
  const filterChannelMembers = useCallback((values: string[]) => {
    const query = search.trim().toLocaleLowerCase("vi");
    if (!query) return values;
    return values.filter((name) =>
      name.toLocaleLowerCase("vi").includes(query),
    );
  }, [search]);

  if (checking) {
    return (
      <section className="glass-panel gm-loading-panel">
        <LoaderCircle className="spinning" size={26} />
        Đang kiểm tra phiên GM…
      </section>
    );
  }

  if (!session.connected) {
    return (
      <div className="gm-connect-layout">
        <section className="glass-panel gm-connect-panel">
          <div className="gm-connect-icon">
            <KeyRound size={28} />
          </div>
          <span className="section-kicker">PHIÊN GM DÙNG CHUNG</span>
          <h2>Chưa kết nối quyền GameServer</h2>
          <p>
            Toàn bộ công cụ dùng chung một phiên GM. Hãy kết nối tại thanh trên cùng,
            sau đó trang này và Bách Bảo Các sẽ tự tải lại.
          </p>
          <button
            className="gold-button"
            type="button"
            onClick={() => window.dispatchEvent(new Event("hknt:open-gm-login"))}
          >
            <ShieldCheck size={18} /> Kết nối ở thanh trên
          </button>
        </section>

        <section className="glass-panel gm-connect-info">
          <div>
            <Users size={24} />
            <span>
              <strong>{publicPlayerCount}</strong>
              <small>người chơi đang online</small>
            </span>
          </div>
          <h3>Quyền được kiểm tra tại GameServer</h3>
          <ul>
            <li>
              <BadgeCheck size={17} />
              Admin GM mode 8: xem nhân vật, gửi vật phẩm và chỉnh chỉ số hỗ trợ.
            </li>
            <li>
              <ShieldCheck size={17} />
              Bao gồm quyền kick và khóa tài khoản có xác nhận an toàn.
            </li>
            <li>
              <KeyRound size={17} />
              Thu hồi quyền GM sẽ ngắt phiên theo chính sách máy chủ.
            </li>
          </ul>
        </section>
      </div>
    );
  }

  return (
    <div className="gm-console">
      <section className="glass-panel online-player-dock">
        <div className="online-player-title">
          <span className="action-icon"><Users size={19} /></span>
          <span>
            <small>NHÂN VẬT TRONG GAME</small>
            {hasHangingData ? (
              <>
                <strong>{totalMemberCount} nhân vật</strong>
                <em className="online-player-breakdown">
                  {totalPlayingCount} đang chơi · {totalHangingCount} treo off
                </em>
              </>
            ) : (
              <strong>{publicPlayerCount} người chơi</strong>
            )}
          </span>
        </div>
        <label className="member-search compact">
          <Search size={16} />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm nhân vật…"
          />
        </label>
        {[
          { channel: 1, count: channel1Count, values: channel1Members },
          { channel: 2, count: channel2Members.length, values: channel2Members },
        ].map((group) => {
          const visibleMembers = filterChannelMembers(group.values);
          return (
            <details
              className="channel-member-dropdown"
              key={group.channel}
              open={openChannel === group.channel}
              onToggle={(event) => {
                const isOpen = event.currentTarget.open;
                setOpenChannel((current) =>
                  isOpen ? group.channel : current === group.channel ? null : current,
                );
              }}
            >
              <summary>
                <span><i className={session.activeChannels?.includes(group.channel) ? "online" : ""} /> Kênh {group.channel}</span>
                {hasHangingData ? (
                  <strong title={`${group.count - countHanging(group.values)} đang chơi · ${countHanging(group.values)} treo off`}>
                    {group.count - countHanging(group.values)}
                    <span className="channel-count-hanging">+{countHanging(group.values)}</span>
                  </strong>
                ) : (
                  <strong>{group.count}</strong>
                )}
              </summary>
              <div className="channel-member-menu">
                {visibleMembers.map((name) => {
                  const hanging = isHanging(name);
                  const pills =
                    pillsByChannelName.get(`${group.channel}-${name.toLocaleLowerCase("vi")}`) ?? [];
                  return (
                  <button
                    type="button"
                    className={selectedName === name ? "active" : ""}
                    onClick={() => {
                      setSelectedName(name);
                      setOpenChannel(null);
                    }}
                    key={`${group.channel}-${name}`}
                  >
                    <span className="member-initial">{name.slice(0, 1).toUpperCase()}</span>
                    <span>
                      <strong>{name}</strong>
                      <small>
                        Kênh {group.channel}
                        {hasHangingData ? (
                          <em className={hanging ? "member-state hanging" : "member-state playing"}>
                            {hanging ? "Treo off" : "Đang chơi"}
                          </em>
                        ) : null}
                      </small>
                    </span>
                    {pills.length > 0 ? (
                      <span
                        className="member-pill-badges"
                        role="button"
                        tabIndex={0}
                        aria-label={`Xem ${pills.length} pill của ${name}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          setPillDetail({ name, pills });
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.stopPropagation();
                            event.preventDefault();
                            setPillDetail({ name, pills });
                          }
                        }}
                      >
                        {pills.slice(0, 3).map((pill) => (
                          <img
                            key={pill.duocPhamID}
                            src={pillIconSrc(pill.duocPhamID)}
                            alt={translatePillName(pill.name)}
                            title={`${translatePillName(pill.name)} — ${formatPillRemaining(pill.remainingSeconds)}`}
                            width={20}
                            height={20}
                            onError={(event) => {
                              event.currentTarget.style.opacity = "0.2";
                            }}
                          />
                        ))}
                        {pills.length > 3 ? (
                          <em className="member-pill-more">+{pills.length - 3}</em>
                        ) : null}
                      </span>
                    ) : null}
                  </button>
                  );
                })}
                {!membersLoading && visibleMembers.length === 0 ? (
                  <div className="member-list-empty">Không có nhân vật.</div>
                ) : null}
              </div>
            </details>
          );
        })}
        <button
          className="online-refresh"
          type="button"
          onClick={() => void loadMembers()}
          disabled={membersLoading}
          aria-label="Tải lại danh sách"
          title="Tải lại danh sách online"
        >
          <RefreshCw size={17} className={membersLoading ? "spinning" : ""} />
        </button>
      </section>

      <section className="gm-main-column">
        <div className="gm-channel-banner">
          <span>
            <i className={(session.activeChannels?.length ?? 0) === 2 ? "online" : ""} />
            Môi trường thao tác: <strong>Kênh 1 + Kênh 2</strong>
          </span>
          <small>
            {(session.activeChannels?.length ?? 0) === 2
              ? "API cả hai kênh đang sẵn sàng"
              : `Đang kết nối ${session.activeChannels?.length ?? 0}/2 kênh`}
          </small>
        </div>
        {notice ? (
          <div className={`gm-notice ${notice.tone}`} role="alert">
            {notice.message}
          </div>
        ) : null}

        {memberLoading ? (
          <section className="glass-panel gm-loading-panel">
            <LoaderCircle className="spinning" size={26} />
            Đang tải thông tin nhân vật…
          </section>
        ) : member ? (
          <>
            <section className="glass-panel member-profile">
              <div className="profile-avatar">
                {member.userName.slice(0, 1).toUpperCase()}
                <i />
              </div>
              <div className="profile-title">
                <span className="section-kicker">HỒ SƠ NHÂN VẬT</span>
                <h2>{member.userName}</h2>
                <p>
                  {jobName(member.job)} · {factionName(member.faction)} · Chuyển
                  chức {member.jobLevel} · Kênh {selectedChannel}
                </p>
              </div>
              <div className="profile-level">
                <span>CẤP ĐỘ</span>
                <strong>{member.level}</strong>
              </div>
              <div className="profile-details">
                <span>
                  <small>Tài khoản</small>
                  <strong>{member.userId || "—"}</strong>
                </span>
                <span>
                  <small>Gold</small>
                  <strong>{member.money.toLocaleString("vi-VN")}</strong>
                </span>
                <span>
                  <small>Cash</small>
                  <strong>{member.cash.toLocaleString("vi-VN")}</strong>
                </span>
                <span>
                  <small>Võ huân</small>
                  <strong>{member.honor.toLocaleString("vi-VN")}</strong>
                </span>
                <span>
                  <small>Trạng thái</small>
                  <strong className={member.online ? "online-text" : ""}>
                    {member.online ? "Đang online" : "Offline"}
                  </strong>
                </span>
                <span>
                  <small>VIP</small>
                  <strong className={isVipActive(member) ? "online-text" : ""}>
                    {isVipActive(member) ? `Còn hạn đến ${vipExpiryText(member.vipExpiresAt)}` : "Không VIP"}
                  </strong>
                </span>
                <span>
                  <small>Pill đang có</small>
                  <strong>{member.pills?.length ? `${member.pills.length} pill` : "Không có"}</strong>
                </span>
              </div>

              {member.pills && member.pills.length > 0 ? (
                <div
                  className="member-pill-badges profile-pill-badges"
                  role="button"
                  tabIndex={0}
                  aria-label={`Xem ${member.pills.length} pill của ${member.userName}`}
                  onClick={() => setPillDetail({ name: member.userName, pills: member.pills ?? [] })}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setPillDetail({ name: member.userName, pills: member.pills ?? [] });
                    }
                  }}
                >
                  {member.pills.map((pill) => (
                    <img
                      key={pill.duocPhamID}
                      src={pillIconSrc(pill.duocPhamID)}
                      alt={translatePillName(pill.name)}
                      title={`${translatePillName(pill.name)} — ${formatPillRemaining(pill.remainingSeconds)}`}
                      width={26}
                      height={26}
                      onError={(event) => {
                        event.currentTarget.style.opacity = "0.2";
                      }}
                    />
                  ))}
                </div>
              ) : null}

              <div className="profile-vip-quick">
                <button
                  type="button"
                  className="profile-vip-toggle"
                  onClick={() => setVipQuickOpen((current) => !current)}
                >
                  <BadgeCheck size={15} /> {vipQuickOpen ? "Đóng" : "Gia hạn / Thu hồi VIP"}
                </button>
                {vipQuickOpen ? (
                  <div className="profile-vip-form">
                    <label>
                      <span>Số ngày cấp thêm</span>
                      <input
                        type="number"
                        min={1}
                        max={3650}
                        value={vipQuickDays}
                        onChange={(event) => setVipQuickDays(event.target.value)}
                      />
                    </label>
                    <div className="profile-vip-actions">
                      <button
                        type="button"
                        disabled={vipActionLoading}
                        onClick={() => void vipQuickAction("setVip")}
                      >
                        <BadgeCheck size={15} /> Gia hạn VIP
                      </button>
                      {isVipActive(member) ? (
                        <button
                          type="button"
                          className="danger"
                          disabled={vipActionLoading}
                          onClick={() => void vipQuickAction("revokeVip")}
                        >
                          Thu hồi VIP ngay
                        </button>
                      ) : null}
                    </div>
                    <small>
                      Cộng dồn thêm vào ngày hết hạn hiện tại (không ghi đè) — ghi thẳng tài khoản, dùng được cả khi nhân vật offline.
                    </small>
                  </div>
                ) : null}
              </div>
            </section>

            <nav className="gm-tool-ribbon" role="tablist" aria-label="Công cụ nhân vật">
              {[
                // Bỏ tab "Trang bị và kho đồ": card đó nay luôn hiện bên phải.
                // Bỏ tab "Thuộc tính nâng cao": đã gộp chung vào "Tạo và gửi vật phẩm".
                { value: "stats", label: "Cập nhật chỉ số", icon: Zap },
                { value: "character", label: "Chuyển nhân vật", icon: UserCog },
                { value: "item", label: "Tạo và gửi vật phẩm", icon: Gift },
              ].map((entry) => {
                const Icon = entry.icon;
                const disabled = !liveOperationsAvailable;
                return (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={toolTab === entry.value}
                    className={toolTab === entry.value ? "active" : ""}
                    disabled={disabled}
                    onClick={() => setToolTab(entry.value as typeof toolTab)}
                    key={entry.value}
                  >
                    <Icon size={18} />
                    <span>{entry.label}</span>
                  </button>
                );
              })}
            </nav>

            {!liveOperationsAvailable ? (
              <section className="glass-panel gm-readonly-panel">
                <AlertTriangle size={22} />
                <div>
                  <h3>Đang dùng chế độ chỉ đọc an toàn</h3>
                  <p>
                    Danh sách online và hồ sơ cơ bản được đọc từ database trạng thái.
                    Add đồ, chỉnh chỉ số, kick và khóa vẫn được khóa vì GameServer chưa
                    có API live được cấp phép.
                  </p>
                </div>
              </section>
            ) : (
              <>
              <div className="gm-workspace">
              <div className="gm-workspace-left">
              <div className="gm-action-grid">
              <section className="glass-panel gm-action-card gm-stats-card" hidden={toolTab !== "stats"}>
                <div className="action-card-head">
                  <span className="action-icon">
                    <Zap size={21} />
                  </span>
                  <div>
                    <h3>Cập nhật chỉ số</h3>
                    <p>Chỉ các trường nằm trong danh sách an toàn.</p>
                  </div>
                </div>
                <form onSubmit={updateAllValues}>
                  <div className="stats-editor-grid">
                    {VALUE_FIELDS.map((entry) => {
                      const Icon = entry.icon;
                      return (
                        <label key={entry.value}>
                          <span><Icon size={15} /> {entry.label}</span>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={statDrafts[entry.value] ?? "0"}
                            onChange={(event) =>
                              setStatDrafts((current) => ({
                                ...current,
                                [entry.value]: event.target.value,
                              }))
                            }
                            required
                          />
                        </label>
                      );
                    })}
                  </div>
                  <button
                    className="primary-action"
                    type="submit"
                    disabled={operationLoading}
                  >
                    <ShieldCheck size={17} />
                    LƯU TOÀN BỘ CHỈ SỐ THAY ĐỔI
                  </button>
                </form>
              </section>

              <section
                className="glass-panel gm-action-card gm-character-convert"
                hidden={toolTab !== "character"}
              >
                <div className="action-card-head">
                  <span className="action-icon"><UserCog size={21} /></span>
                  <div>
                    <h3>Chuyển đổi nhân vật</h3>
                    <p>Đổi Char, Chính/Tà và Nam/Nữ theo đúng cơ chế tool Triều Hoàng.</p>
                  </div>
                </div>
                <form onSubmit={convertCharacter}>
                  <div className="character-convert-grid">
                    <label>
                      <span>Char / hệ phái</span>
                      <select value={convertJob} onChange={(event) => setConvertJob(Number(event.target.value))}>
                        {JOB_OPTIONS.map((entry) => (
                          <option value={entry.value} key={entry.value}>{entry.label}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>Chính / Tà</span>
                      <select value={convertFaction} onChange={(event) => setConvertFaction(Number(event.target.value))}>
                        <option value={1}>Chính phái</option>
                        <option value={2}>Tà phái</option>
                      </select>
                    </label>
                    <label>
                      <span>Giới tính</span>
                      <select value={convertSex} onChange={(event) => setConvertSex(Number(event.target.value))}>
                        <option value={1}>Nam</option>
                        <option value={2}>Nữ</option>
                      </select>
                    </label>
                  </div>
                  <div className="convert-warning">
                    Khí công thường và thăng thiên sẽ được reset, hoàn lại điểm; nhân vật tự relog sau khi lưu.
                  </div>
                  <label>
                    <span>Nhập {member.userName} để xác nhận</span>
                    <input
                      value={convertConfirmation}
                      onChange={(event) => setConvertConfirmation(event.target.value)}
                      autoComplete="off"
                      placeholder={member.userName}
                    />
                  </label>
                  <button
                    className="primary-action"
                    type="submit"
                    disabled={operationLoading || convertConfirmation !== member.userName}
                  >
                    <UserCog size={17} />
                    CHUYỂN NHÂN VẬT VÀ RELOG
                  </button>
                </form>
              </section>

              <section
                className="glass-panel gm-action-card gm-item-builder"
                hidden={toolTab !== "item"}
              >
                <div className="action-card-head">
                  <span className="action-icon">
                    <PackagePlus size={21} />
                  </span>
                  <div>
                    <h3>Tạo và gửi vật phẩm</h3>
                    <p>Đầy đủ thuộc tính như công cụ GameServer, xử lý trực tiếp qua API đa kênh.</p>
                  </div>
                </div>
                <form className="item-builder-form" onSubmit={sendItem}>
                  <div className="item-core-fields">
                  <label>
                    <span>Loại vật phẩm</span>
                    <select
                      value={itemType}
                      onChange={(event) => setItemType(Number(event.target.value))}
                    >
                      {ITEM_TYPES.map((entry) => (
                        <option value={entry.value} key={entry.value}>
                          {entry.label}
                        </option>
                      ))}
                    </select>
                    <small className="field-help">
                      {ITEM_TYPES.find((entry) => entry.value === itemType)?.hint ??
                        "Thiết lập theo đúng loại vật phẩm của tool GameServer."}
                    </small>
                  </label>
                  <label>
                    <span>Tìm trong dữ liệu game</span>
                    <div className="item-catalog-search">
                      <Search size={16} />
                      <input
                        type="search"
                        value={itemQuery}
                        onChange={(event) => setItemQuery(event.target.value)}
                        placeholder="Nhập PID hoặc tên vật phẩm"
                        autoComplete="off"
                      />
                      {itemSearchLoading ? (
                        <LoaderCircle className="spinning" size={16} />
                      ) : null}
                      {itemResults.length ? (
                        <div className="item-search-results">
                          {itemResults.map((item) => (
                            <button
                              type="button"
                              key={item.itemId}
                              onClick={() => {
                                setItemId(String(item.itemId));
                                setItemQuery(`${item.itemId} · ${fixVietnameseName(item.name)}`);
                                setItemResults([]);
                              }}
                            >
                              <ItemIcon itemId={item.itemId} name={fixVietnameseName(item.name)} />
                              <span>
                                <strong>{fixVietnameseName(item.name)}</strong>
                                <small>
                                  PID {item.itemId} · Cấp {item.level}
                                  {item.questItem ? " · Vật phẩm nhiệm vụ" : ""}
                                </small>
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </label>
                  <label>
                    <span>PID vật phẩm</span>
                    <div className="gm-item-pid-field">
                      <ItemIcon key={itemId} itemId={itemId} />
                      <input
                        name="itemId"
                        type="number"
                        min="1"
                        step="1"
                        value={itemId}
                        onChange={(event) => setItemId(event.target.value)}
                        placeholder="Ví dụ: 400012"
                        required
                      />
                    </div>
                  </label>
                  <div className="split-fields">
                    <label>
                      <span>Số lượng</span>
                      <input
                        name="amount"
                        type="number"
                        min="1"
                        max={sendScope === "character" ? 50 : 10}
                        defaultValue="1"
                        required
                      />
                    </label>
                    <label>
                      <span>Cường hóa</span>
                      <input
                        name="enhancement"
                        type="number"
                        min="0"
                        max="15"
                        defaultValue="0"
                        required
                      />
                    </label>
                  </div>

                  {itemType === 4 ? (
                    <label>
                      <span>Giá trị hồi phục HP/MP</span>
                      <input name="healthValue" type="number" min="0" defaultValue="0" />
                    </label>
                  ) : (
                    <input name="healthValue" type="hidden" value="0" />
                  )}

                  {itemType === 5 ? (
                    <div className="split-fields">
                      <label>
                        <span>Thuộc tính ngọc</span>
                        <select name="jewelryOption" defaultValue="0">
                          {JEWELRY_OPTIONS.map((entry) => (
                            <option value={entry.value} key={entry.value}>{entry.label}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span>Giá trị thuộc tính</span>
                        <input name="jewelryValue" type="number" min="0" max="999999" defaultValue="0" />
                      </label>
                    </div>
                  ) : (
                    <>
                      <input name="jewelryOption" type="hidden" value="0" />
                      <input name="jewelryValue" type="hidden" value="0" />
                    </>
                  )}

                  {itemType === 6 ? (
                    <div className="split-fields">
                      <label>
                        <span>Mã võ công</span>
                        <input name="kungFuBase" type="number" min="0" defaultValue="0" />
                      </label>
                      <label>
                        <span>Cấp võ công</span>
                        <input name="kungFuLevel" type="number" min="0" max="999" defaultValue="0" />
                      </label>
                    </div>
                  ) : (
                    <>
                      <input name="kungFuBase" type="hidden" value="0" />
                      <input name="kungFuLevel" type="hidden" value="0" />
                    </>
                  )}

                  {itemType === 7 ? (
                    <div className="split-fields">
                      <label>
                        <span>Loại kỳ ngọc thạch</span>
                        <select name="soulStoneId" defaultValue="800000046">
                          {SOUL_STONES.map((entry) => (
                            <option value={entry.value} key={entry.value}>{entry.label}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span>Tác dụng kỳ ngọc</span>
                        <select name="soulEffect" defaultValue="0">
                          {SOUL_EFFECTS.map((entry) => (
                            <option value={entry.value} key={entry.value}>{entry.label}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                  ) : (
                    <input name="soulStoneId" type="hidden" value="0" />
                  )}

                  {itemType === 8 ? (
                    <div className="split-fields">
                      <label>
                        <span>Loại trang sức</span>
                        <select name="jewelryEnhanceType" defaultValue="0">
                          {JEWELRY_ENHANCE_TYPES.map((entry) => (
                            <option value={entry.value} key={entry.value}>{entry.label}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span>Cấp cường hóa</span>
                        <input name="jewelryEnhanceLevel" type="number" min="0" max="99" defaultValue="0" />
                      </label>
                    </div>
                  ) : (
                    <>
                      <input name="jewelryEnhanceType" type="hidden" value="0" />
                      <input name="jewelryEnhanceLevel" type="hidden" value="0" />
                    </>
                  )}

                  {itemType === 9 ? (
                    <div className="split-fields">
                      <label>
                        <span>Biến hóa Heaven</span>
                        <select name="heavenType" defaultValue="220000000">
                          {HEAVEN_TYPES.map((entry) => (
                            <option value={entry.value} key={entry.value}>{entry.label}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span>Cấp Heaven</span>
                        <input name="heavenLevel" type="number" min="0" max="99" defaultValue="0" />
                      </label>
                    </div>
                  ) : (
                    <>
                      <input name="heavenType" type="hidden" value="0" />
                      <input name="heavenLevel" type="hidden" value="0" />
                    </>
                  )}

                  </div>

                  <details className="advanced-item-fields" open>
                    <summary>Thuộc tính nâng cao · đúng mã tool</summary>
                    <div className="advanced-item-grid">
                      {[1, 2, 3, 4].map((line) => (
                        <div className="option-line" key={line}>
                          <label>
                            <span>Dòng {line} · thuộc tính</span>
                            <select
                              name={`optionType${line}`}
                              defaultValue="0"
                            >
                              {OPTION_TYPES.map((entry) => (
                                <option value={entry.value} key={entry.value}>{entry.label}</option>
                              ))}
                            </select>
                          </label>
                          <label>
                            <span>Giá trị</span>
                            <input
                              name={`optionLevel${line}`}
                              type="number"
                              min="0"
                              max="999"
                              defaultValue="0"
                            />
                          </label>
                        </div>
                      ))}
                      <div className="option-line">
                        <label>
                          <span>Thuộc tính nguyên tố</span>
                          <select name="elementType" defaultValue="0">
                            {ELEMENT_TYPES.map((entry) => (
                              <option value={entry.value} key={entry.value}>{entry.label}</option>
                            ))}
                          </select>
                        </label>
                        <label>
                          <span>Cấp</span>
                          <input name="elementLevel" type="number" min="0" max="99" defaultValue="0" />
                        </label>
                      </div>
                      <div className="option-line">
                        <label>
                          <span>Tỉnh ngộ</span>
                          <select name="awakening" defaultValue="0">
                            {AWAKENING_LEVELS.map((entry) => (
                              <option value={entry.value} key={entry.value}>{entry.label}</option>
                            ))}
                          </select>
                        </label>
                        <label>
                          <span>Phẩm chất</span>
                          <select name="quality" defaultValue="0">
                            {QUALITY_LEVELS.map((entry) => (
                              <option value={entry.value} key={entry.value}>{entry.label}</option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <div className="option-line">
                        <label>
                          <span>Tứ linh</span>
                          <select name="spirit" defaultValue="0">
                            {SPIRIT_LEVELS.map((entry) => (
                              <option value={entry.value} key={entry.value}>{entry.label}</option>
                            ))}
                          </select>
                        </label>
                        <label>
                          <span>Hạn dùng (ngày)</span>
                          <input name="days" type="number" min="0" max="3650" defaultValue="0" />
                        </label>
                      </div>
                      {itemType !== 7 ? (
                        <div className="option-line option-line-wide">
                          <label>
                            <span>Tác dụng Kỳ ngọc / Soul Trung</span>
                            <select name="soulEffect" defaultValue="0">
                              {SOUL_EFFECTS.map((entry) => (
                                <option value={entry.value} key={entry.value}>{entry.label}</option>
                              ))}
                            </select>
                          </label>
                          <span className="inline-field-note">
                            Dùng cho vũ khí, trang bị và áo choàng; loại không hỗ trợ sẽ tự bỏ qua.
                          </span>
                        </div>
                      ) : null}
                      <label className="item-check">
                        <input name="locked" type="checkbox" />
                        <span>Khóa vật phẩm khi tạo</span>
                      </label>
                    </div>
                  </details>

                  <div className="item-send-dock">
                    <div className="item-send-dock-copy">
                      <Gift size={22} />
                      <span>
                        <strong>Gửi vật phẩm vào túi đồ</strong>
                        <small>Item sẽ xuất hiện ngay trên nhân vật đang online.</small>
                      </span>
                    </div>
                    {session.role === 8 ? (
                      <div className="send-scope-box">
                        <span>Phạm vi nhận</span>
                        <div className="send-scope-options">
                          {[
                            { value: "character", label: member.userName },
                            { value: "all", label: "Tất cả" },
                            { value: "chinh", label: "Chính phái" },
                            { value: "ta", label: "Tà phái" },
                          ].map((entry) => (
                            <label key={entry.value}>
                              <input
                                type="radio"
                                name="sendScope"
                                value={entry.value}
                                checked={sendScope === entry.value}
                                onChange={() => {
                                  setSendScope(entry.value as typeof sendScope);
                                  setSendAllConfirmation("");
                                }}
                              />
                              <span>{entry.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {sendScope !== "character" ? (
                        <label>
                          <span>Nhập GUI TOAN SERVER để xác nhận</span>
                          <input
                            value={sendAllConfirmation}
                            onChange={(event) => setSendAllConfirmation(event.target.value)}
                            autoComplete="off"
                            placeholder="GUI TOAN SERVER"
                          />
                        </label>
                    ) : null}
                    <button
                      className="primary-action item-send-action"
                      type="submit"
                      disabled={
                        operationLoading ||
                        (sendScope !== "character" && sendAllConfirmation !== "GUI TOAN SERVER")
                      }
                    >
                      {operationLoading ? <LoaderCircle className="spinning" size={18} /> : <Gift size={18} />}
                      {sendScope === "character"
                        ? `GỬI ITEM CHO ${member.userName}`
                        : sendScope === "chinh"
                          ? "GỬI CHO CHÍNH PHÁI"
                          : sendScope === "ta"
                            ? "GỬI CHO TÀ PHÁI"
                            : "GỬI TOÀN BỘ HAI KÊNH"}
                    </button>
                  </div>
                </form>
              </section>
              </div>
              </div>

              <div className="gm-workspace-right">
              <section className="glass-panel inventory-panel inventory-compact">
                <div className="inventory-head">
                  <div>
                    <span className="section-kicker">DỮ LIỆU KÊNH 1 + KÊNH 2</span>
                    <h3>Trang bị và kho đồ</h3>
                  </div>
                  <span>{inventoryItems.length} ô đang dùng</span>
                </div>
                <div className="inventory-tabs" role="tablist" aria-label="Khu vực vật phẩm">
                  {INVENTORY_TABS.map((tab) => (
                    <button
                      type="button"
                      role="tab"
                      aria-selected={inventoryTab === tab.key}
                      className={inventoryTab === tab.key ? "active" : ""}
                      onClick={() => {
                        setInventoryTab(tab.key);
                        setSelectedInventoryItem(null);
                        setDeleteConfirmation("");
                        setItemEditConfirmation("");
                        setItemEditDraft(null);
                      }}
                      key={tab.key}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="inventory-game-shell wear-shell">
                  <div className="inventory-split">
                    <div className="inventory-split-main">
                      <div className="inventory-game-title">
                        <span>HÀNH TRANG · TRANG BỊ</span>
                        <small>{wearSlots.used}/{wearSlots.count} ô</small>
                      </div>
                      <InventorySlotGrid
                        storage="wear"
                        slots={wearSlots.slots}
                        selected={selectedInventoryItem}
                        onSelect={handleSelectInventory}
                        onOpenDetails={setItemDetails}
                      />
                      <div className="inventory-game-title">
                        <span>TÚI CHÍNH · Ô 0–{BAG_MAIN_SLOTS - 1}</span>
                        <small>{bagMainUsed}/{bagMainSlots.length} ô</small>
                      </div>
                      <InventorySlotGrid
                        storage="bag"
                        slots={bagMainSlots}
                        selected={selectedInventoryItem}
                        onSelect={handleSelectInventory}
                        onOpenDetails={setItemDetails}
                      />
                    </div>
                    <div className="inventory-split-aux">
                      <div className="inventory-game-title">
                        <span>TÚI PHỤ · Ô {BAG_MAIN_SLOTS}–{bagSlots.count - 1}</span>
                        <small>{bagAuxUsed}/{bagAuxSlots.length} ô</small>
                      </div>
                      <InventorySlotGrid
                        storage="bag"
                        slots={bagAuxSlots}
                        selected={selectedInventoryItem}
                        onSelect={handleSelectInventory}
                        onOpenDetails={setItemDetails}
                      />
                    </div>
                  </div>
                  {inventoryTab !== "wear" && inventoryTab !== "bag" ? (
                  <>
                  <div className="inventory-game-title">
                    <span>{INVENTORY_TABS.find((entry) => entry.key === inventoryTab)?.label.toUpperCase()}</span>
                    <small>{inventoryItems.length}/{inventorySlotCount} ô đang dùng</small>
                  </div>
                  <div className="inventory-game-grid bag-grid">
                    {inventorySlots.map(({ slot, item }) => {
                      const readableAttributes = item
                        ? [item.magic1, item.magic2, item.magic3, item.magic4]
                            .map((raw, index) => decodeItemAttribute(raw, index + 1))
                            .filter((entry): entry is DecodedItemAttribute => entry !== null)
                            .map((entry) => `${entry.label.replace(/^Dòng \d+ · /, "")}: ${entry.value}`)
                            .join("\n")
                        : "";
                      const details = item
                        ? `${fixVietnameseName(item.name) || `Vật phẩm ${item.itemId}`}\nVị trí: ${inventoryPositionName(inventoryTab, item.slot)}\nSố lượng: ${item.amount}\n${gemLine(item.magic0) ?? `Cường hóa: +${item.enhancement}`}${readableAttributes ? `\n${readableAttributes}` : "\nKhông có dòng thuộc tính"}${item.locked ? "\nĐã khóa" : ""}`
                        : `Ô ${slot} trống`;

                      return (
                        <button
                          type="button"
                          className={`inventory-slot ${item ? "occupied" : "empty"} ${
                            selectedInventoryItem?.storage === inventoryTab &&
                            selectedInventoryItem.item.slot === slot
                              ? "selected"
                              : ""
                          }`}
                          title={details}
                          onClick={() => {
                            setSelectedInventoryItem(
                              item ? { storage: inventoryTab, item } : null,
                            );
                            setDeleteConfirmation("");
                            setItemEditConfirmation("");
                            setItemEditDraft(item ? {
                              amount: String(item.amount),
                              enhancement: String(item.enhancement),
                              magic1: String(item.magic1),
                              magic2: String(item.magic2),
                              magic3: String(item.magic3),
                              magic4: String(item.magic4),
                              locked: item.locked,
                            } : null);
                          }}
                          onDoubleClick={() => {
                            if (item) setItemDetails({ storage: inventoryTab, item });
                          }}
                          key={`${inventoryTab}-${slot}`}
                        >
                          <span className="inventory-slot-number">{slot}</span>
                          {item ? (
                            <>
                              <ItemIcon itemId={item.itemId} name={fixVietnameseName(item.name)} />
                              {item.enhancement > 0 ? (
                                <strong className="inventory-slot-enhance">+{item.enhancement}</strong>
                              ) : null}
                              {item.amount > 1 ? (
                                <strong className="inventory-slot-amount">{item.amount}</strong>
                              ) : null}
                              {item.locked ? <span className="inventory-slot-lock">KHÓA</span> : null}
                              <span className="inventory-slot-name">
                                {fixVietnameseName(item.name) || `PID ${item.itemId}`}
                              </span>
                              <small>PID {item.itemId}</small>
                            </>
                          ) : (
                            <span className="inventory-slot-empty-mark" aria-hidden="true" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  </>
                  ) : null}
                  <p className="inventory-game-hint">
                    {inventoryCanDelete
                      ? "Bấm một lần để chọn; bấm đúp để mở bảng thông tin và chỉ số vật phẩm."
                      : "Túi mở rộng đang ở chế độ xem an toàn; thao tác xóa sẽ mở sau lần bảo trì GameServer."}
                  </p>
                  {session.role === 8 && selectedInventoryItem && inventoryCanDelete ? (
                    selectedChannel === 1 && itemEditDraft ? (
                      <div className="inventory-edit-panel">
                        <div className="inventory-edit-title">
                          <Save size={19} />
                          <div>
                            <strong>Sửa trực tiếp thuộc tính · Kênh 1</strong>
                            <small>PID {selectedInventoryItem.item.itemId} · ô {selectedInventoryItem.item.slot}</small>
                          </div>
                        </div>
                        <div className="inventory-edit-grid">
                          <label><span>Số lượng</span><input type="number" min={1} max={999999} value={itemEditDraft.amount} onChange={(event) => setItemEditDraft({ ...itemEditDraft, amount: event.target.value })} /></label>
                          <label><span>Cường hóa</span><input type="number" min={0} max={99} disabled={(selectedInventoryItem.item.magic0 ?? 0) <= 0} value={itemEditDraft.enhancement} onChange={(event) => setItemEditDraft({ ...itemEditDraft, enhancement: event.target.value })} /></label>
                          {(["magic1", "magic2", "magic3", "magic4"] as const).map((field, index) => {
                            const decoded = decodeItemAttribute(Number(itemEditDraft[field]), index + 1);
                            return (
                              <label className="inventory-edit-attribute" key={field}>
                                <span>Dòng thuộc tính {index + 1}</span>
                                <input type="number" min={0} max={2000000000} value={itemEditDraft[field]} onChange={(event) => setItemEditDraft({ ...itemEditDraft, [field]: event.target.value })} />
                                <small>{decoded ? `${decoded.label.replace(/^Dòng \d+ · /, "")} ${decoded.value}` : "Không có thuộc tính"}</small>
                              </label>
                            );
                          })}
                          <label className="inventory-edit-lock"><input type="checkbox" checked={itemEditDraft.locked} onChange={(event) => setItemEditDraft({ ...itemEditDraft, locked: event.target.checked })} /><span>Khóa vật phẩm</span></label>
                        </div>
                        <div className="inventory-edit-confirm">
                          <input
                            value={itemEditConfirmation}
                            onChange={(event) => setItemEditConfirmation(event.target.value)}
                            placeholder={`Nhập ${member.userName} để xác nhận sửa`}
                            autoComplete="off"
                          />
                          <button
                            type="button"
                            disabled={operationLoading || itemEditConfirmation !== member.userName}
                            onClick={editSelectedItem}
                          >
                            <Save size={17} /> Lưu thuộc tính
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="inventory-edit-unavailable">
                        Sửa trực tiếp thuộc tính đang mở riêng cho Kênh 1; Kênh 2 không bị reset.
                      </div>
                    )
                  ) : null}
                  {session.role === 8 && selectedInventoryItem && inventoryCanDelete ? (
                    <div className="inventory-delete-dock">
                      <ItemIcon
                        itemId={selectedInventoryItem.item.itemId}
                        name={fixVietnameseName(selectedInventoryItem.item.name)}
                      />
                      <div>
                        <strong>{fixVietnameseName(selectedInventoryItem.item.name)}</strong>
                        <small>
                          PID {selectedInventoryItem.item.itemId} · ô {selectedInventoryItem.item.slot} · {INVENTORY_TABS.find((entry) => entry.key === selectedInventoryItem.storage)?.label}
                        </small>
                      </div>
                      <input
                        value={deleteConfirmation}
                        onChange={(event) => setDeleteConfirmation(event.target.value)}
                        placeholder={`Nhập ${member.userName} để xóa`}
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        className="delete-item-button"
                        disabled={operationLoading || deleteConfirmation !== member.userName}
                        onClick={deleteSelectedItem}
                      >
                        <Trash2 size={17} /> Xóa vật phẩm
                      </button>
                    </div>
                  ) : null}
                </div>
              </section>

              </div>
              </div>

              <section className="glass-panel pet-control-panel">
                <div className="panel-title-row">
                  <div>
                    <span className="section-kicker">PET · KÊNH 1</span>
                    <h2>Kho linh thú và điều khiển PET</h2>
                    <p>Triệu hồi PET đang trang bị, gọi về và xem túi/trang bị thú nuôi.</p>
                  </div>
                  <PawPrint size={24} />
                </div>
                {selectedChannel !== 1 ? (
                  <div className="inventory-edit-unavailable">
                    Điều khiển PET chỉ mở trên Kênh 1; Kênh 2 không bị reset.
                  </div>
                ) : (
                  <>
                    <div className="pet-control-grid">
                      <article className="pet-active-card">
                        <span>LINH THÚ HIỆN TẠI</span>
                        {member.activePet ? (
                          <>
                            <h3>{member.activePet.name}</h3>
                            <small>ID {member.activePet.petId} · Cấp {member.activePet.level}</small>
                            <div className="pet-stat-grid">
                              <span><em>HP</em><strong>{member.activePet.hp}/{member.activePet.maxHp ?? "—"}</strong></span>
                              <span><em>MP</em><strong>{member.activePet.mp}/{member.activePet.maxMp ?? "—"}</strong></span>
                              <span><em>Công</em><strong>{member.activePet.attack ?? "—"}</strong></span>
                              <span><em>Thủ</em><strong>{member.activePet.defense ?? "—"}</strong></span>
                              <span><em>Chính xác</em><strong>{member.activePet.accuracy ?? "—"}</strong></span>
                              <span><em>Né tránh</em><strong>{member.activePet.dodge ?? "—"}</strong></span>
                            </div>
                          </>
                        ) : (
                          <p>Chưa có linh thú được triệu hồi.</p>
                        )}
                      </article>
                      <div className="pet-list-card">
                        <span>KHO LINH THÚ · {(member.pets ?? []).length}</span>
                        <div className="pet-list-scroll">
                          {(member.pets ?? []).length ? (member.pets ?? []).map((pet) => {
                            const equippedPetId = member.wear.find((item) => item.slot === 14)?.globalId;
                            const canSummon = !member.activePet && equippedPetId === pet.petId;
                            return (
                              <article key={pet.petId}>
                                <div>
                                  <strong>{pet.name || `PET ${pet.petId}`}</strong>
                                  <small>ID {pet.petId} · Cấp {pet.level} · Trung thành {pet.loyalty}</small>
                                </div>
                                <button
                                  type="button"
                                  disabled={!canSummon || operationLoading || petConfirmation !== member.userName}
                                  title={equippedPetId === pet.petId ? "Triệu hồi PET đang trang bị" : "PET này chưa được trang bị ở ô 14"}
                                  onClick={() => void operate(
                                    {
                                      action: "petSummon",
                                      character: member.userName,
                                      petId: pet.petId,
                                      confirmation: petConfirmation,
                                    },
                                    `Đã triệu hồi ${pet.name}.`,
                                  )}
                                >
                                  Triệu hồi
                                </button>
                              </article>
                            );
                          }) : <p>Nhân vật chưa có dữ liệu linh thú.</p>}
                        </div>
                      </div>
                    </div>
                    <div className="pet-control-actions">
                      <input
                        value={petConfirmation}
                        onChange={(event) => setPetConfirmation(event.target.value)}
                        placeholder={`Nhập ${member.userName} để điều khiển PET`}
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        disabled={!member.activePet || operationLoading || petConfirmation !== member.userName}
                        onClick={() => void operate(
                          {
                            action: "petRecall",
                            character: member.userName,
                            confirmation: petConfirmation,
                          },
                          "Đã gọi linh thú về.",
                        )}
                      >
                        <PawPrint size={17} /> Gọi PET về
                      </button>
                    </div>
                    <div className="pet-inventory-summary">
                      <span>Túi thú nuôi: <strong>{member.petBag?.length ?? 0}/16</strong></span>
                      <span>Trang bị PET: <strong>{member.petEquipment?.length ?? 0}/5</strong></span>
                      <span>Kho Heaven: <strong>{member.heavenWarehouse?.length ?? 0}/20</strong></span>
                    </div>
                  </>
                )}
              </section>

              {session.role === 8 ? (
              <section className="glass-panel danger-zone" hidden={toolTab !== "stats"}>
                <div className="danger-zone-copy">
                  <span>
                    <AlertTriangle size={21} />
                  </span>
                  <div>
                    <h3>Vùng thao tác Admin mode 8</h3>
                    <p>
                      Nhập chính xác tên <strong>{member.userName}</strong> để
                      xác nhận. Mọi thao tác được ghi log tại VPS.
                    </p>
                  </div>
                </div>
                <input
                  value={dangerConfirmation}
                  onChange={(event) => setDangerConfirmation(event.target.value)}
                  placeholder={`Nhập ${member.userName}`}
                />
                <div className="danger-actions">
                  <button
                    type="button"
                    disabled={
                      operationLoading || dangerConfirmation !== member.userName
                    }
                    onClick={() =>
                      void operate(
                        {
                          action: "kick",
                          character: member.userName,
                          confirmation: dangerConfirmation,
                        },
                        `Đã gửi lệnh kick ${member.userName}.`,
                      )
                    }
                  >
                    <LogOut size={17} />
                    Kick khỏi game
                  </button>
                  <button
                    className="lock-button"
                    type="button"
                    disabled={
                      operationLoading || dangerConfirmation !== member.userName
                    }
                    onClick={() =>
                      void operate(
                        {
                          action: "lock",
                          character: member.userName,
                          confirmation: dangerConfirmation,
                        },
                        `Đã khóa tài khoản của ${member.userName}.`,
                      )
                    }
                  >
                    <Ban size={17} />
                    Khóa tài khoản
                  </button>
                </div>
              </section>
              ) : null}
              </>
            )}
          </>
        ) : (
          <section className="glass-panel gm-select-empty">
            <UserRound size={30} />
            <h2>Chọn một nhân vật</h2>
            <p>Thông tin và công cụ hỗ trợ sẽ hiển thị tại đây.</p>
          </section>
        )}
      </section>
      {itemDetails ? (
        <div
          className="item-detail-backdrop"
          role="presentation"
          onMouseDown={() => setItemDetails(null)}
        >
          <section
            className="item-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Thông tin ${fixVietnameseName(itemDetails.item.name)}`}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="item-detail-close"
              onClick={() => setItemDetails(null)}
              aria-label="Đóng bảng thông tin vật phẩm"
            >
              <X size={20} />
            </button>
            <div className="item-detail-hero">
              <ItemIcon itemId={itemDetails.item.itemId} name={fixVietnameseName(itemDetails.item.name)} />
              <div>
                <span>THÔNG TIN VẬT PHẨM</span>
                <h2>{fixVietnameseName(itemDetails.item.name) || `PID ${itemDetails.item.itemId}`}</h2>
                <p>
                  {INVENTORY_TABS.find((entry) => entry.key === itemDetails.storage)?.label}
                  {" · "}{inventoryPositionName(itemDetails.storage, itemDetails.item.slot)}
                </p>
              </div>
            </div>
            <div className="item-detail-primary">
              {itemDetailGem ? (
                <span>
                  <em>Loại vật phẩm</em>
                  <strong>Ngọc</strong>
                </span>
              ) : (
                <span><em>Cường hóa</em><strong>+{itemDetails.item.enhancement}</strong></span>
              )}
              <span><em>Số lượng</em><strong>{itemDetails.item.amount}</strong></span>
              <span><em>Vị trí</em><strong>{inventoryPositionName(itemDetails.storage, itemDetails.item.slot)}</strong></span>
              <span><em>Trạng thái</em><strong>{itemDetails.item.locked ? "Đã khóa" : "Không khóa"}</strong></span>
              <span>
                <em>Cấp yêu cầu</em>
                <strong>{itemDetailCatalogLoading ? "Đang đọc…" : itemDetailCatalog?.level || "Không yêu cầu"}</strong>
              </span>
              <span>
                <em>Thăng chức</em>
                <strong>{itemDetailCatalogLoading ? "Đang đọc…" : itemDetailCatalog?.jobLevel || "Không yêu cầu"}</strong>
              </span>
            </div>
            <div className="item-detail-attributes">
              <div className="item-detail-section-title">
                <div>
                  <span>CHỈ SỐ ĐANG CÓ</span>
                  <h3>Thuộc tính vật phẩm</h3>
                </div>
                <small>{itemDetailAttributes.length} dòng</small>
              </div>
              {itemDetailAttributes.length ? (
                <div className="item-detail-attribute-list">
                  {itemDetailAttributes.map((attribute) => (
                    <article key={attribute.key}>
                      <span>{attribute.label}</span>
                      <strong>{attribute.value}</strong>
                      <small>{attribute.description}</small>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="item-detail-no-attributes">
                  Vật phẩm này không có dòng thuộc tính cộng thêm.
                </div>
              )}
            </div>
            <details className="item-detail-technical">
              <summary>Thông tin kỹ thuật dành cho quản trị</summary>
              <div>
                <span><em>PID</em><strong>{itemDetails.item.itemId}</strong></span>
                <span><em>Global ID</em><strong>{itemDetails.item.globalId ?? "—"}</strong></span>
                <span><em>Mã nền</em><strong>{itemDetails.item.magic0 ?? 0}</strong></span>
                <span><em>Mã dòng 1</em><strong>{itemDetails.item.magic1}</strong></span>
                <span><em>Mã dòng 2</em><strong>{itemDetails.item.magic2}</strong></span>
                <span><em>Mã dòng 3</em><strong>{itemDetails.item.magic3}</strong></span>
                <span><em>Mã dòng 4</em><strong>{itemDetails.item.magic4}</strong></span>
              </div>
            </details>
            <p className="item-detail-note">Bấm Esc hoặc vùng bên ngoài để đóng.</p>
          </section>
        </div>
      ) : null}
      <Modal
        open={pillDetail !== null}
        onClose={() => setPillDetail(null)}
        title={pillDetail ? `Pill của ${pillDetail.name}` : "Pill"}
        kicker="ĐANG CÓ HIỆU LỰC"
        size="normal"
      >
        <div className="pill-detail-list">
          {(pillDetail?.pills ?? []).map((pill) => (
            <div className="pill-detail-row" key={pill.duocPhamID}>
              <img
                src={pillIconSrc(pill.duocPhamID)}
                alt={translatePillName(pill.name)}
                width={40}
                height={40}
                onError={(event) => {
                  event.currentTarget.style.opacity = "0.2";
                }}
              />
              <div>
                <strong>{translatePillName(pill.name)}</strong>
                <small>
                  {
                    {
                      title: "Buff danh hiệu",
                      time: "Buff thời hạn",
                      status: "Buff trạng thái",
                      vip: "Huy hiệu VIP",
                      public: "Phù công cộng",
                    }[pill.kind]
                  }{" "}
                  · PID {pill.duocPhamID}
                </small>
                <span className="pill-detail-remaining">{formatPillRemaining(pill.remainingSeconds)}</span>
                <span className="pill-detail-expires">Hết hạn lúc {pillExpiryText(pill.expiresAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
