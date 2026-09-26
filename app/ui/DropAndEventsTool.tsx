"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Flame,
  CalendarClock,
  Settings,
  Sparkles,
  Shield,
  Coins,
  Users,
  Search,
  Plus,
  Trash2,
  RefreshCw,
  Check,
  AlertCircle,
  Clock,
  MapPin,
  Gift,
  Trophy,
  Swords,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type MasterRates = {
  worldDropRate: number;
  goldRate: number;
  expRate: number;
  skillExpRate: number;
  vipDropRate: number;
  partyDropRate2: number;
  partyDropRate3: number;
  partyDropRate4: number;
  partyDropRate5: number;
  partyDropRate6: number;
  partyDropRate7: number;
  partyDropRate8: number;
  partyJobBonus3: number;
  partyJobBonus5: number;
  partyJobBonus7: number;
  partyJobBonus8: number;
  doctorGroupDropRate: number;
  playerOverLevelDropDiff: number;
  monsterOverLevelDropDiff: number;
  bossKillLevelDiff: number;
};

type MonsterDropItem = {
  id: number;
  levelMin: number;
  levelMax: number;
  itemPid: number;
  itemName: string;
  probabilityPoint: number;
  magic0: number;
  magic1: number;
  magic2: number;
  magic3: number;
  magic4: number;
  quantityControl: number;
  maxQuantity: number;
  currentQuantity: number;
  isEnabled: boolean;
};

type ItemReward = {
  pid: number;
  name: string;
  amount: number;
};

type EventRewardSummary = {
  voHuan: number;
  knb: number;
  diamond: number;
  congHien: number;
  voHoangTe: number;
  items: ItemReward[];
};

type GameEvent = {
  id: string;
  name: string;
  category: string;
  description: string;
  mechanism: string;
  mapLocation: string;
  enabled: boolean;
  hours: string;
  minutes: number;
  daysOfWeek: string;
  durationMinutes: number;
  countdownMinutes: number;
  rewards: EventRewardSummary;
  secondaryRewards?: EventRewardSummary | null;
};

const TIER_BOXES_CONFIG: Record<string, { pid: number; name: string; type: string; typeBadge: string; badgeColor: string; level: number }[]> = {
  "11x": [
    { pid: 1008005001, name: "Hộp Vũ Khí Cấp 110", type: "Vũ Khí", typeBadge: "🗡️ Vũ Khí", badgeColor: "#f87171", level: 110 },
    { pid: 1008005002, name: "Hộp Y Phục Cấp 110", type: "Y Phục", typeBadge: "🥋 Y Phục", badgeColor: "#60a5fa", level: 110 },
    { pid: 1008005003, name: "Hộp Hộ Thủ Cấp 110", type: "Hộ Thủ", typeBadge: "🥊 Hộ Thủ", badgeColor: "#c084fc", level: 110 },
    { pid: 1008005004, name: "Hộp Chiến Ủng Cấp 110", type: "Chiến Ủng", typeBadge: "👢 Chiến Ủng", badgeColor: "#38bdf8", level: 110 },
    { pid: 1008005005, name: "Hộp Nội Giáp Cấp 110", type: "Nội Giáp", typeBadge: "🛡️ Nội Giáp", badgeColor: "#fbbf24", level: 110 },
    { pid: 1008005006, name: "Hộp Bí Tịch Thăng Thiên 1", type: "Bí Tịch", typeBadge: "📜 Bí Tịch", badgeColor: "#4ade80", level: 110 },
  ],
  "12x": [
    { pid: 1008005011, name: "Hộp Vũ Khí Cấp 120", type: "Vũ Khí", typeBadge: "🗡️ Vũ Khí", badgeColor: "#f87171", level: 120 },
    { pid: 1008005012, name: "Hộp Y Phục Cấp 120", type: "Y Phục", typeBadge: "🥋 Y Phục", badgeColor: "#60a5fa", level: 120 },
    { pid: 1008005013, name: "Hộp Hộ Thủ Cấp 120", type: "Hộ Thủ", typeBadge: "🥊 Hộ Thủ", badgeColor: "#c084fc", level: 120 },
    { pid: 1008005014, name: "Hộp Chiến Ủng Cấp 120", type: "Chiến Ủng", typeBadge: "👢 Chiến Ủng", badgeColor: "#38bdf8", level: 120 },
    { pid: 1008005015, name: "Hộp Nội Giáp Cấp 120", type: "Nội Giáp", typeBadge: "🛡️ Nội Giáp", badgeColor: "#fbbf24", level: 120 },
    { pid: 1008005016, name: "Hộp Bí Tịch Thăng Thiên 2", type: "Bí Tịch", typeBadge: "📜 Bí Tịch", badgeColor: "#4ade80", level: 120 },
  ],
  "13x": [
    { pid: 1008005021, name: "Hộp Vũ Khí Cấp 130", type: "Vũ Khí", typeBadge: "🗡️ Vũ Khí", badgeColor: "#f87171", level: 130 },
    { pid: 1008005022, name: "Hộp Y Phục Cấp 130", type: "Y Phục", typeBadge: "🥋 Y Phục", badgeColor: "#60a5fa", level: 130 },
    { pid: 1008005023, name: "Hộp Hộ Thủ Cấp 130", type: "Hộ Thủ", typeBadge: "🥊 Hộ Thủ", badgeColor: "#c084fc", level: 130 },
    { pid: 1008005024, name: "Hộp Chiến Ủng Cấp 130", type: "Chiến Ủng", typeBadge: "👢 Chiến Ủng", badgeColor: "#38bdf8", level: 130 },
    { pid: 1008005025, name: "Hộp Nội Giáp Cấp 130", type: "Nội Giáp", typeBadge: "🛡️ Nội Giáp", badgeColor: "#fbbf24", level: 130 },
    { pid: 1008005026, name: "Hộp Bí Tịch Thăng Thiên 3", type: "Bí Tịch", typeBadge: "📜 Bí Tịch", badgeColor: "#4ade80", level: 130 },
  ],
  "14x": [
    { pid: 1008005031, name: "Hộp Vũ Khí Cấp 140", type: "Vũ Khí", typeBadge: "🗡️ Vũ Khí", badgeColor: "#f87171", level: 140 },
    { pid: 1008005032, name: "Hộp Y Phục Cấp 140", type: "Y Phục", typeBadge: "🥋 Y Phục", badgeColor: "#60a5fa", level: 140 },
    { pid: 1008005033, name: "Hộp Hộ Thủ Cấp 140", type: "Hộ Thủ", typeBadge: "🥊 Hộ Thủ", badgeColor: "#c084fc", level: 140 },
    { pid: 1008005034, name: "Hộp Chiến Ủng Cấp 140", type: "Chiến Ủng", typeBadge: "👢 Chiến Ủng", badgeColor: "#38bdf8", level: 140 },
    { pid: 1008005035, name: "Hộp Nội Giáp Cấp 140", type: "Nội Giáp", typeBadge: "🛡️ Nội Giáp", badgeColor: "#fbbf24", level: 140 },
    { pid: 1008005036, name: "Hộp Bí Tịch Thăng Thiên 4", type: "Bí Tịch", typeBadge: "📜 Bí Tịch", badgeColor: "#4ade80", level: 140 },
  ],
  "15x": [
    { pid: 1008005041, name: "Hộp Vũ Khí Cấp 150", type: "Vũ Khí", typeBadge: "🗡️ Vũ Khí", badgeColor: "#f87171", level: 150 },
    { pid: 1008005042, name: "Hộp Y Phục Cấp 150", type: "Y Phục", typeBadge: "🥋 Y Phục", badgeColor: "#60a5fa", level: 150 },
    { pid: 1008005043, name: "Hộp Hộ Thủ Cấp 150", type: "Hộ Thủ", typeBadge: "🥊 Hộ Thủ", badgeColor: "#c084fc", level: 150 },
    { pid: 1008005044, name: "Hộp Chiến Ủng Cấp 150", type: "Chiến Ủng", typeBadge: "👢 Chiến Ủng", badgeColor: "#38bdf8", level: 150 },
    { pid: 1008005045, name: "Hộp Nội Giáp Cấp 150", type: "Nội Giáp", typeBadge: "🛡️ Nội Giáp", badgeColor: "#fbbf24", level: 150 },
    { pid: 1008005046, name: "Hộp Bí Tịch Thăng Thiên 5", type: "Bí Tịch", typeBadge: "📜 Bí Tịch", badgeColor: "#4ade80", level: 150 },
  ],
  "16x": [
    { pid: 1008005051, name: "Hộp Vũ Khí Cấp 160", type: "Vũ Khí", typeBadge: "🗡️ Vũ Khí", badgeColor: "#f87171", level: 160 },
    { pid: 1008005052, name: "Hộp Y Phục Cấp 160", type: "Y Phục", typeBadge: "🥋 Y Phục", badgeColor: "#60a5fa", level: 160 },
    { pid: 1008005053, name: "Hộp Hộ Thủ Cấp 160", type: "Hộ Thủ", typeBadge: "🥊 Hộ Thủ", badgeColor: "#c084fc", level: 160 },
    { pid: 1008005054, name: "Hộp Chiến Ủng Cấp 160", type: "Chiến Ủng", typeBadge: "👢 Chiến Ủng", badgeColor: "#38bdf8", level: 160 },
    { pid: 1008005055, name: "Hộp Nội Giáp Cấp 160", type: "Nội Giáp", typeBadge: "🛡️ Nội Giáp", badgeColor: "#fbbf24", level: 160 },
    { pid: 1008005056, name: "Hộp Bí Tịch Thăng Thiên 6", type: "Bí Tịch", typeBadge: "📜 Bí Tịch", badgeColor: "#4ade80", level: 160 },
  ],
  "17x": [
    { pid: 1008005061, name: "Hộp Vũ Khí Cấp 170", type: "Vũ Khí", typeBadge: "🗡️ Vũ Khí", badgeColor: "#f87171", level: 170 },
    { pid: 1008005062, name: "Hộp Y Phục Cấp 170", type: "Y Phục", typeBadge: "🥋 Y Phục", badgeColor: "#60a5fa", level: 170 },
    { pid: 1008005063, name: "Hộp Hộ Thủ Cấp 170", type: "Hộ Thủ", typeBadge: "🥊 Hộ Thủ", badgeColor: "#c084fc", level: 170 },
    { pid: 1008005064, name: "Hộp Chiến Ủng Cấp 170", type: "Chiến Ủng", typeBadge: "👢 Chiến Ủng", badgeColor: "#38bdf8", level: 170 },
    { pid: 1008005065, name: "Hộp Nội Giáp Cấp 170", type: "Nội Giáp", typeBadge: "🛡️ Nội Giáp", badgeColor: "#fbbf24", level: 170 },
    { pid: 1008005066, name: "Hộp Bí Tịch Thăng Thiên 7", type: "Bí Tịch", typeBadge: "📜 Bí Tịch", badgeColor: "#4ade80", level: 170 },
  ],
  "others": [
    { pid: 1008000216, name: "Chìa Khóa Vàng", type: "Khóa", typeBadge: "🔑 Khóa", badgeColor: "#ffd47c", level: 1 },
    { pid: 1000000899, name: "Thiết Chùy", type: "Công Cụ", typeBadge: "🔨 Búa", badgeColor: "#a3a3a3", level: 1 },
    { pid: 1000000426, name: "Phong Ấn Bảo Rương", type: "Rương", typeBadge: "📦 Rương", badgeColor: "#fb923c", level: 1 },
    { pid: 1000000071, name: "Thượng Cổ Bảo Rương", type: "Rương", typeBadge: "📦 Rương", badgeColor: "#a855f7", level: 1 },
    { pid: 1000000006, name: "Càn Khôn Hộp (Yisabu)", type: "Hộp", typeBadge: "🎁 Hộp", badgeColor: "#ec4899", level: 1 },
    { pid: 1000000251, name: "Hộp Băng Linh (Áo Choàng)", type: "Áo Choàng", typeBadge: "❄️ Áo Choàng", badgeColor: "#38bdf8", level: 1 },
    { pid: 1000000461, name: "Hộp May Mắn (Nhỏ)", type: "Sự Kiện", typeBadge: "🎁 Sự Kiện", badgeColor: "#f43f5e", level: 1 },
    { pid: 1000000462, name: "Hộp May Mắn (Lớn)", type: "Sự Kiện", typeBadge: "🎁 Sự Kiện", badgeColor: "#e11d48", level: 1 },
    { pid: 1000000027, name: "Hộp Thanh Ngọc", type: "Báu Vật", typeBadge: "💎 Ngọc", badgeColor: "#2dd4bf", level: 1 },
    { pid: 1000000009, name: "Túi Quà Tân Thủ", type: "Tân Thủ", typeBadge: "🎒 Tân Thủ", badgeColor: "#22c55e", level: 1 },
  ],
};

export default function DropAndEventsTool() {
  const [tab, setTab] = useState<"rates" | "drops" | "events" | "boxes">("rates");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reloading, setReloading] = useState(false);
  const [targetChannel, setTargetChannel] = useState<number>(0);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Data states
  const [rates, setRates] = useState<MasterRates | null>(null);
  const [monsterDrops, setMonsterDrops] = useState<MonsterDropItem[]>([]);
  const [events, setEvents] = useState<GameEvent[]>([]);

  // Filters
  const [dropLevelTier, setDropLevelTier] = useState<string>("all");
  const [dropSearch, setDropSearch] = useState<string>("");
  const [eventCategory, setEventCategory] = useState<string>("all");
  const [expandedEvent, setExpandedEvent] = useState<string | null>("field-boss");

  // Add Item Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLvlMin, setAddLvlMin] = useState(1);
  const [addLvlMax, setAddLvlMax] = useState(79);
  const [addPid, setAddPid] = useState(800000001);
  const [addPP, setAddPP] = useState(2000);
  const [addMaxQ, setAddMaxQ] = useState(0);

  // Bulk select & per-row edit
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [editingPP, setEditingPP] = useState<Record<number, string>>({});
  const [editingMaxQ, setEditingMaxQ] = useState<Record<number, string>>({});
  // Bulk action bar values
  const [bulkMaxQ, setBulkMaxQ] = useState<string>("");
  const [bulkPP, setBulkPP] = useState<string>("");

  // ===== BOXES & KEYS STATE (TBL_XWWL_OPEN) =====
  type BoxHeader = {
    boxPid: number;
    boxName: string;
    totalItems: number;
    totalPP: number;
    category: string;
  };

  type BoxRewardItem = {
    index: number;
    boxPid: number;
    boxName: string;
    itemPidx: number;
    itemName: string;
    quantity: number;
    magic1: number;
    magic2: number;
    magic3: number;
    magic4: number;
    magic5: number;
    pp: number;
    percentage: number;
    isLocked: number;
    days: number;
    broadcast: number;
    reside2: number;
    level: number;
    category: string;
    isChan: boolean;
    isVoHuan: boolean;
    isTestItem?: boolean;
    fightExp: number;
    reside1: number;
    jobName: string;
    sex: number;
    genderName: string;
    zx: number;
    alignmentName: string;
    isEnabled: boolean;
  };

  const [boxesList, setBoxesList] = useState<BoxHeader[]>([]);
  const [boxTierTab, setBoxTierTab] = useState<string>("11x");
  const [selectedBoxPid, setSelectedBoxPid] = useState<number>(1008005001);
  const [selectedBoxHeader, setSelectedBoxHeader] = useState<BoxHeader | null>(null);
  const [boxRewards, setBoxRewards] = useState<BoxRewardItem[]>([]);
  const [boxLoading, setBoxLoading] = useState(false);
  const [boxSearch, setBoxSearch] = useState("");
  const [boxCategoryFilter, setBoxCategoryFilter] = useState("all");
  const [boxJobFilter, setBoxJobFilter] = useState("all");
  const [boxGenderFilter, setBoxGenderFilter] = useState("all");
  const [boxAlignmentFilter, setBoxAlignmentFilter] = useState("all");
  const [boxTypeFilter, setBoxTypeFilter] = useState("all");
  const [boxStatusFilter, setBoxStatusFilter] = useState("all");
  const [selectedBoxIndexes, setSelectedBoxIndexes] = useState<Set<number>>(new Set());
  const [editingBoxPP, setEditingBoxPP] = useState<Record<number, string>>({});
  const [bulkBoxPP, setBulkBoxPP] = useState("");

  // Add Box Item Modal
  const [showAddBoxModal, setShowAddBoxModal] = useState(false);
  const [addBoxPidx, setAddBoxPidx] = useState<number>(100200300);
  const [addBoxItemName, setAddBoxItemName] = useState("");
  const [addBoxQty, setAddBoxQty] = useState<number>(1);
  const [addBoxPP, setAddBoxPP] = useState<number>(100);
  const [addBoxM1, setAddBoxM1] = useState<number>(0);
  const [addBoxM2, setAddBoxM2] = useState<number>(0);
  const [addBoxM3, setAddBoxM3] = useState<number>(0);
  const [addBoxM4, setAddBoxM4] = useState<number>(0);
  const [addBoxM5, setAddBoxM5] = useState<number>(0);
  const [addBoxLocked, setAddBoxLocked] = useState<number>(0);
  const [addBoxDays, setAddBoxDays] = useState<number>(0);
  const [addBoxBroadcast, setAddBoxBroadcast] = useState<number>(0);


  const fetchOverview = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gm/drop-events", { cache: "no-store" });
      const json = await res.json();
      if (json.success && json.data) {
        setRates(json.data.rates);
        setMonsterDrops(json.data.monsterDrops || []);
        setEvents(json.data.events || []);
      } else {
        setNotice({ type: "error", text: json.message || "Không tải được dữ liệu Drop & Sự kiện." });
      }
    } catch (e: any) {
      setNotice({ type: "error", text: "Lỗi kết nối máy chủ: " + e.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const showToast = (type: "success" | "error", text: string) => {
    setNotice({ type, text });
    setTimeout(() => {
      setNotice(null);
    }, 4000);
  };

  // 1. Save Master Rates
  const saveRates = async () => {
    if (!rates) return;
    setSaving(true);
    try {
      const res = await fetch("/api/gm/drop-events?action=rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rates),
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", "Đã lưu hệ số rơi đồ toàn server thành công!");
      } else {
        showToast("error", json.message || "Lỗi khi lưu hệ số rơi đồ.");
      }
    } catch (e: any) {
      showToast("error", "Lỗi: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  // 2. Save Event Config
  const saveEvent = async (ev: GameEvent) => {
    setSaving(true);
    try {
      const res = await fetch("/api/gm/drop-events?action=event-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: ev.id,
          enabled: ev.enabled,
          hours: ev.hours,
          minutes: ev.minutes,
          daysOfWeek: ev.daysOfWeek,
          durationMinutes: ev.durationMinutes,
          rewards: ev.rewards,
          secondaryRewards: ev.secondaryRewards,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", `Đã cập nhật sự kiện "${ev.name}" thành công!`);
      } else {
        showToast("error", json.message || "Lỗi cập nhật sự kiện.");
      }
    } catch (e: any) {
      showToast("error", "Lỗi: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  // 3. Update Monster Drop Item
  const updateMonsterDrop = async (id: number, newPP: number, maxQ?: number, toggle?: boolean) => {
    try {
      const res = await fetch("/api/gm/drop-events?action=monster-drop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          probabilityPoint: newPP,
          maxQuantity: maxQ,
          toggle,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMonsterDrops((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  probabilityPoint: toggle !== undefined ? (toggle ? Math.max(100, newPP) : 0) : newPP,
                  isEnabled: toggle !== undefined ? toggle : newPP > 0,
                  maxQuantity: maxQ !== undefined ? maxQ : item.maxQuantity,
                  quantityControl: maxQ !== undefined ? (maxQ > 0 ? 1 : 0) : item.quantityControl,
                }
              : item
          )
        );
        showToast("success", "Đã cập nhật vật phẩm rơi.");
      } else {
        showToast("error", json.message || "Lỗi cập nhật vật phẩm rơi.");
      }
    } catch (e: any) {
      showToast("error", "Lỗi: " + e.message);
    }
  };

  // 3b. Bulk Update Monster Drops
  const bulkUpdateDrops = async (opts: { pp?: number; maxQ?: number; toggle?: boolean }) => {
    if (selectedIds.size === 0) {
      showToast("error", "Chưa chọn vật phẩm nào. Hãy tick checkbox trước.");
      return;
    }
    const ids = Array.from(selectedIds);
    try {
      const res = await fetch("/api/gm/drop-events?action=monster-drop-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids,
          probabilityPoint: opts.pp ?? null,
          maxQuantity: opts.maxQ ?? null,
          toggle: opts.toggle ?? null,
        }),
      });
      const json = await res.json();
      if (json.success) {
        // Cập nhật local state
        setMonsterDrops((prev) =>
          prev.map((item) => {
            if (!selectedIds.has(item.id)) return item;
            const currentPp = item.probabilityPoint;
            const newPp = opts.toggle !== undefined
              ? (opts.toggle ? Math.max(100, currentPp) : 0)
              : (opts.pp ?? currentPp);
            const newMaxQ = opts.maxQ !== undefined ? opts.maxQ : item.maxQuantity;
            return {
              ...item,
              probabilityPoint: newPp,
              isEnabled: opts.toggle !== undefined ? opts.toggle! : newPp > 0,
              maxQuantity: newMaxQ,
              quantityControl: opts.maxQ !== undefined ? (opts.maxQ > 0 ? 1 : 0) : item.quantityControl,
            };
          })
        );
        showToast("success", json.message || `Đã cập nhật ${ids.length} vật phẩm.`);
      } else {
        showToast("error", json.message || "Lỗi cập nhật bulk.");
      }
    } catch (e: any) {
      showToast("error", "Lỗi: " + e.message);
    }
  };

  // 4. Add Monster Drop Item
  const handleAddDrop = async () => {
    try {
      const res = await fetch("/api/gm/drop-events?action=monster-drop-add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          levelMin: addLvlMin,
          levelMax: addLvlMax,
          itemPid: addPid,
          probabilityPoint: addPP,
          maxQuantity: addMaxQ,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", "Đã thêm vật phẩm rơi vào bãi train!");
        setShowAddModal(false);
        fetchOverview();
      } else {
        showToast("error", json.message || "Lỗi thêm vật phẩm.");
      }
    } catch (e: any) {
      showToast("error", "Lỗi: " + e.message);
    }
  };

  // 5. Delete Monster Drop Item
  const deleteMonsterDrop = async (id: number, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa vĩnh viễn món "${name}" khỏi danh sách rơi đồ?`)) return;
    try {
      const res = await fetch(`/api/gm/drop-events?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setMonsterDrops((prev) => prev.filter((item) => item.id !== id));
        showToast("success", `Đã xóa món "${name}" khỏi bảng rơi.`);
      } else {
        showToast("error", json.message || "Lỗi xóa vật phẩm.");
      }
    } catch (e: any) {
      showToast("error", "Lỗi: " + e.message);
    }
  };

    // 6. Reload GameServer
  const handleReload = async (ch: number = targetChannel) => {
    setReloading(true);
    try {
      const res = await fetch("/api/gm/drop-events?action=reload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: ch })
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", json.message || "Đã tải lại cấu hình GameServer thành công!");
      } else {
        showToast("error", json.message || "Không thể reload GameServer.");
      }
    } catch (e: any) {
      showToast("error", "Lỗi reload: " + e.message);
    } finally {
      setReloading(false);
    }
  };

  // Preset rates
  const applyRatePreset = (worldRate: number, gold: number, vip: number) => {
    if (!rates) return;
    setRates({
      ...rates,
      worldDropRate: worldRate,
      goldRate: gold,
      vipDropRate: vip,
    });
    showToast("success", `Đã chọn Preset (Tỉ lệ gốc: ${worldRate}, Vàng: x${gold}, VIP: x${vip}). Bấm 'Lưu Hệ Số Rơi' để áp dụng!`);
  };

  // Filtered drops
  const filteredDrops = useMemo(() => {
    return monsterDrops.filter((item) => {
      // Tier
      if (dropLevelTier === "1-79" && (item.levelMin > 79 || item.levelMax < 1)) return false;
      if (dropLevelTier === "80-129" && (item.levelMin > 129 || item.levelMax < 80)) return false;
      if (dropLevelTier === "110-500" && item.levelMin < 110) return false;
      if (dropLevelTier === "130+" && item.levelMin < 130) return false;

      // Search
      if (dropSearch.trim()) {
        const q = dropSearch.toLowerCase().trim();
        const matchName = item.itemName.toLowerCase().includes(q);
        const matchPid = item.itemPid.toString().includes(q);
        if (!matchName && !matchPid) return false;
      }
      return true;
    });
  }, [monsterDrops, dropLevelTier, dropSearch]);

  // Filtered events
  
  // Fetch Box List
  const fetchBoxesList = useCallback(async () => {
    try {
      const res = await fetch("/api/gm/drop-events?action=boxes", { cache: "no-store" });
      const json = await res.json();
      if (json.success && json.data) {
        setBoxesList(json.data);
      }
    } catch (e: any) {
      console.error("Lỗi tải danh sách Hộp Báu:", e);
    }
  }, []);

  // Fetch Box Detail Rewards
  const fetchBoxDetail = useCallback(async (boxPid: number) => {
    setBoxLoading(true);
    try {
      const res = await fetch(`/api/gm/drop-events?action=box-detail&boxPid=${boxPid}`, { cache: "no-store" });
      const json = await res.json();
      if (json.success && json.data) {
        setSelectedBoxHeader(json.data.box);
        setBoxRewards(json.data.items || []);
        setSelectedBoxIndexes(new Set());
        setEditingBoxPP({});
      } else {
        showToast("error", json.message || "Không tải được danh sách vật phẩm trong Hộp.");
      }
    } catch (e: any) {
      showToast("error", "Lỗi tải Hộp Báu: " + e.message);
    } finally {
      setBoxLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "boxes") {
      fetchBoxesList();
      fetchBoxDetail(selectedBoxPid);
    }
  }, [tab, selectedBoxPid, fetchBoxesList, fetchBoxDetail]);

  // Update Box Reward Inline
  const handleUpdateBoxReward = async (index: number, updates: Partial<BoxRewardItem>) => {
    try {
      const res = await fetch("/api/gm/drop-events?action=box-reward-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          index,
          pp: updates.pp,
          quantity: updates.quantity,
          magic1: updates.magic1,
          magic2: updates.magic2,
          magic3: updates.magic3,
          magic4: updates.magic4,
          magic5: updates.magic5,
          isLocked: updates.isLocked,
          days: updates.days,
          broadcast: updates.broadcast,
          isEnabled: updates.isEnabled,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", "Cập nhật vật phẩm trong Hộp thành công!");
        fetchBoxDetail(selectedBoxPid);
      } else {
        showToast("error", json.message || "Lỗi cập nhật.");
      }
    } catch (e: any) {
      showToast("error", "Lỗi: " + e.message);
    }
  };

  // Toggle Enable / Disable Box Reward
  const handleToggleBoxReward = async (item: BoxRewardItem) => {
    const nextState = !item.isEnabled;
    const nextPP = nextState ? (item.pp > 0 ? item.pp : 100) : 0;
    try {
      const res = await fetch("/api/gm/drop-events?action=box-reward-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          index: item.index,
          pp: nextPP,
          isEnabled: nextState,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", nextState ? `Đã BẬT rơi [${item.itemName}] (PP=${nextPP})` : `Đã TẮT rơi [${item.itemName}] (PP=0)`);
        fetchBoxDetail(selectedBoxPid);
      } else {
        showToast("error", json.message || "Lỗi cập nhật.");
      }
    } catch (e: any) {
      showToast("error", "Lỗi: " + e.message);
    }
  };

  // Delete Box Reward
  const handleDeleteBoxReward = async (index: number, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn XÓA [${name}] khỏi Hộp Báu này?`)) return;
    try {
      const res = await fetch(`/api/gm/drop-events?action=box-reward&index=${index}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showToast("success", `Đã xóa [${name}] khỏi Hộp Báu.`);
        fetchBoxDetail(selectedBoxPid);
      } else {
        showToast("error", json.message || "Lỗi xóa vật phẩm.");
      }
    } catch (e: any) {
      showToast("error", "Lỗi: " + e.message);
    }
  };

  // Bulk Update Box Rewards
  const handleBulkUpdateBoxRewards = async (opt: { setPP?: number; setEnabled?: boolean; setLocked?: number; setDays?: number }) => {
    if (selectedBoxIndexes.size === 0) {
      showToast("error", "Vui lòng chọn ít nhất 1 vật phẩm.");
      return;
    }
    try {
      const res = await fetch("/api/gm/drop-events?action=box-reward-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          indexes: Array.from(selectedBoxIndexes),
          setPP: opt.setPP,
          setEnabled: opt.setEnabled,
          setLocked: opt.setLocked,
          setDays: opt.setDays,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", `Đã cập nhật ${selectedBoxIndexes.size} vật phẩm trong Hộp!`);
        fetchBoxDetail(selectedBoxPid);
      } else {
        showToast("error", json.message || "Lỗi cập nhật hàng loạt.");
      }
    } catch (e: any) {
      showToast("error", "Lỗi: " + e.message);
    }
  };

  // Add Item to Box
  const handleAddBoxReward = async () => {
    if (!addBoxPidx || addBoxPidx <= 0) {
      showToast("error", "Vui lòng nhập PID vật phẩm hợp lệ.");
      return;
    }
    try {
      const res = await fetch("/api/gm/drop-events?action=box-reward-add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boxPid: selectedBoxPid,
          boxName: selectedBoxHeader?.boxName || "",
          itemPidx: addBoxPidx,
          itemName: addBoxItemName,
          quantity: addBoxQty,
          pp: addBoxPP,
          magic1: addBoxM1,
          magic2: addBoxM2,
          magic3: addBoxM3,
          magic4: addBoxM4,
          magic5: addBoxM5,
          isLocked: addBoxLocked,
          days: addBoxDays,
          broadcast: addBoxBroadcast,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", "Đã thêm vật phẩm vào Hộp Báu thành công!");
        setShowAddBoxModal(false);
        fetchBoxDetail(selectedBoxPid);
      } else {
        showToast("error", json.message || "Lỗi thêm vật phẩm vào Hộp.");
      }
    } catch (e: any) {
      showToast("error", "Lỗi: " + e.message);
    }
  };

  // Filtered Box Rewards
  const filteredBoxRewards = useMemo(() => {
    return boxRewards.filter((item) => {
      if (boxSearch.trim()) {
        const q = boxSearch.toLowerCase().trim();
        const matchName = item.itemName.toLowerCase().includes(q);
        const matchPid = item.itemPidx.toString().includes(q);
        const matchJob = item.jobName.toLowerCase().includes(q);
        if (!matchName && !matchPid && !matchJob) return false;
      }
      if (boxTypeFilter !== "all") {
        if (boxTypeFilter === "test" && !item.isTestItem) return false;
        if (boxTypeFilter === "vohuan" && (!item.isVoHuan || item.isTestItem)) return false;
        if (boxTypeFilter === "chan" && (!item.isChan || item.isVoHuan || item.isTestItem)) return false;
        if (boxTypeFilter === "thuong" && (item.isVoHuan || item.isChan || item.isTestItem || item.reside2 === 0)) return false;
      }
      if (boxJobFilter !== "all") {
        if (boxJobFilter === "Chung" && item.jobName !== "Chung") return false;
        if (boxJobFilter !== "Chung" && !item.jobName.includes(boxJobFilter)) return false;
      }
      if (boxGenderFilter !== "all") {
        if (boxGenderFilter === "Chung" && item.genderName !== "Chung") return false;
        if (boxGenderFilter !== "Chung" && item.genderName !== boxGenderFilter) return false;
      }
      if (boxAlignmentFilter !== "all") {
        if (boxAlignmentFilter === "Chung" && item.alignmentName !== "Chung") return false;
        if (boxAlignmentFilter !== "Chung" && item.alignmentName !== boxAlignmentFilter) return false;
      }
      if (boxCategoryFilter !== "all") {
        if (boxCategoryFilter === "chan" && !item.isChan) return false;
        if (boxCategoryFilter === "thuong" && (item.isChan || item.isVoHuan)) return false;
        if (boxCategoryFilter === "vohuan" && !item.isVoHuan) return false;
        if (boxCategoryFilter === "vukhi" && item.reside2 !== 4) return false;
        if (boxCategoryFilter === "ao" && item.reside2 !== 1) return false;
        if (boxCategoryFilter === "hothu" && item.reside2 !== 2) return false;
        if (boxCategoryFilter === "chienung" && item.reside2 !== 5) return false;
        if (boxCategoryFilter === "noigiap" && item.reside2 !== 6) return false;
        if (boxCategoryFilter === "trangsuc" && ![7, 8, 10].includes(item.reside2)) return false;
        if (boxCategoryFilter === "pet" && item.reside2 !== 15) return false;
        if (boxCategoryFilter === "phu" && item.reside2 !== 18) return false;
        if (boxCategoryFilter === "tien" && (item.itemPidx < 909000000 || item.itemPidx > 909000099) && item.itemPidx !== 1000001504) return false;
      }
      if (boxStatusFilter === "enabled" && !item.isEnabled) return false;
      if (boxStatusFilter === "disabled" && item.isEnabled) return false;
      return true;
    });
  }, [boxRewards, boxSearch, boxCategoryFilter, boxJobFilter, boxGenderFilter, boxAlignmentFilter, boxTypeFilter, boxStatusFilter]);

  const filteredEvents = useMemo(() => {
    if (eventCategory === "all") return events;
    return events.filter((e) => e.category.toLowerCase().includes(eventCategory.toLowerCase()));
  }, [events, eventCategory]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", color: "#ffd47c" }}>
        <RefreshCw className="spinning" size={32} style={{ marginBottom: 12, color: "#e6ae4e" }} />
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Đang tải cấu hình Tỉ lệ Drop & Sự kiện từ GameServer...</p>
      </div>
    );
  }

  return (
    <div className="drop-events-shell">
      {/* Toast Notification */}
      {notice && (
        <div
          style={{
            position: "fixed",
            top: 24,
            right: 24,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 20px",
            borderRadius: 10,
            border: notice.type === "success" ? "1px solid rgba(73, 213, 139, 0.4)" : "1px solid rgba(239, 99, 99, 0.4)",
            background: notice.type === "success" ? "rgba(18, 55, 32, 0.95)" : "rgba(65, 18, 16, 0.95)",
            color: notice.type === "success" ? "#a4efc6" : "#ffb3b3",
            boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
            fontSize: 13.5,
            fontWeight: 700,
          }}
        >
          {notice.type === "success" ? <Check size={18} color="#49d58b" /> : <AlertCircle size={18} color="#ef6363" />}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Header & Controls Bar */}
      <div className="drop-events-banner">
        <div>
          <h1>
            <Flame size={24} color="#e6ae4e" /> Quản Lý Tỉ Lệ Drop & Sự Kiện / Boss
          </h1>
          <p>
            Điều chỉnh tăng/giảm tỉ lệ rơi đồ train quái, phân tầng ngọc/rương, bật/tắt & đổi giờ thả Boss và quản lý phần thưởng 14 sự kiện tự động.
          </p>
        </div>

                <div className="drop-events-actions" style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(10, 8, 6, 0.7)", border: "1px solid rgba(230, 174, 78, 0.25)", borderRadius: "6px", padding: "4px 8px" }}>
            <span style={{ fontSize: "0.8rem", color: "#c8c0b4" }}>Máy chủ:</span>
            <select
              value={targetChannel}
              onChange={(e) => setTargetChannel(Number(e.target.value))}
              style={{
                background: "transparent",
                color: "#ffd47c",
                border: "none",
                fontWeight: "bold",
                fontSize: "0.85rem",
                cursor: "pointer",
                outline: "none"
              }}
            >
              <option value={0} style={{ background: "#1a1612", color: "#ffd47c" }}>Cả 2 Server (Kênh 1 & 2)</option>
              <option value={1} style={{ background: "#1a1612", color: "#ffd47c" }}>Server Kênh 1</option>
              <option value={2} style={{ background: "#1a1612", color: "#ffd47c" }}>Server Kênh 2</option>
            </select>
          </div>

          <button
            onClick={() => handleReload(targetChannel)}
            disabled={reloading}
            className="drop-events-btn-dark"
            title="Nạp lại toàn bộ file cấu hình config.ini và TBL_XWWL_DROP trên GameServer được chọn"
          >
            <RefreshCw size={14} className={reloading ? "spinning" : ""} color="#ffd47c" />
            {reloading ? "Đang Reload..." : targetChannel === 0 ? "Tải Lại Cả 2 Server" : `Tải Lại Server Kênh ${targetChannel}`}
          </button>

          {tab === "rates" && rates && (
            <button
              onClick={saveRates}
              disabled={saving}
              className="drop-events-btn-gold"
            >
              <Check size={15} /> {saving ? "Đang Lưu..." : "Lưu Hệ Số Rơi"}
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="drop-events-tabs">
        <button
          onClick={() => setTab("rates")}
          className={`drop-events-tab-btn ${tab === "rates" ? "active" : ""}`}
        >
          <Settings size={15} /> 1. Tỉ Lệ Rơi Toàn Server
        </button>

        <button
          onClick={() => setTab("drops")}
          className={`drop-events-tab-btn ${tab === "drops" ? "active" : ""}`}
        >
          <Layers size={15} /> 2. Danh Sách Rơi Đồ Quái Train ({monsterDrops.length} Món)
        </button>

        <button
          onClick={() => setTab("events")}
          className={`drop-events-tab-btn ${tab === "events" ? "active" : ""}`}
        >
          <CalendarClock size={15} /> 3. Khung Giờ Boss & Sự Kiện ({events.length} Sự Kiện)
        </button>
        <button
          onClick={() => setTab("boxes")}
          className={`drop-events-tab-btn ${tab === "boxes" ? "active" : ""}`}
        >
          <Gift size={15} /> 4. Rương Báu & Chìa Khóa (Mở Hộp TBL_XWWL_OPEN)
        </button>

      </div>

      {/* TAB 1: MASTER DROP RATES */}
      {tab === "rates" && rates && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Presets Bar */}
          <div
            style={{
              padding: "16px 20px",
              borderRadius: 12,
              border: "1px solid rgba(230, 174, 78, 0.2)",
              background: "rgba(18, 14, 10, 0.8)",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#ffd47c" }}>
              <Sparkles size={16} color="#ffd47c" /> Chọn nhanh cấu hình mẫu (Preset):
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <button
                onClick={() => applyRatePreset(20, 5, 1)}
                className="drop-events-btn-dark"
                style={{ color: "#8bc3ff", borderColor: "rgba(107, 170, 243, 0.4)" }}
              >
                Cày Cuốc Hardcore (Drop 20, Vàng x5)
              </button>
              <button
                onClick={() => applyRatePreset(50, 10, 2)}
                className="drop-events-btn-dark"
                style={{ color: "#54dc96", borderColor: "rgba(73, 213, 139, 0.4)" }}
              >
                Chuẩn Cân Bằng V22 (Drop 50, Vàng x10, VIP x2)
              </button>
              <button
                onClick={() => applyRatePreset(200, 10, 2)}
                className="drop-events-btn-dark"
                style={{ color: "#ffd47c", borderColor: "rgba(230, 174, 78, 0.5)" }}
              >
                Mặc Định Server V24 (Drop 200, Vàng x10, VIP x2)
              </button>
              <button
                onClick={() => applyRatePreset(500, 50, 3)}
                className="drop-events-btn-dark"
                style={{ color: "#ff9994", borderColor: "rgba(239, 99, 99, 0.4)" }}
              >
                Test Server Rơi Nhiều (Drop 500, Vàng x50)
              </button>
            </div>
          </div>

          {/* Grid of Rate Controls */}
          <div className="drop-events-grid">
            {/* 1. Base Drop Rate (暴率) */}
            <div className="drop-events-card">
              <div className="drop-events-card-head">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ padding: 8, borderRadius: 8, background: "rgba(230, 174, 78, 0.15)", color: "#ffd47c" }}>
                    <Flame size={20} />
                  </div>
                  <div>
                    <h3 className="drop-events-card-title">Tỉ Lệ Rơi Đồ Gốc (暴率)</h3>
                    <p className="drop-events-card-desc">Hệ số cơ bản mỗi lần quái chết</p>
                  </div>
                </div>
                <span style={{ fontSize: 20, fontWeight: 900, fontFamily: "monospace", color: "#ffd47c" }}>
                  {rates.worldDropRate}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={() => setRates({ ...rates, worldDropRate: Math.max(1, rates.worldDropRate - 50) })}
                  className="drop-events-btn-step"
                  title="Giảm 50 điểm"
                >
                  -50
                </button>
                <button
                  onClick={() => setRates({ ...rates, worldDropRate: Math.max(1, rates.worldDropRate - 10) })}
                  className="drop-events-btn-step"
                  title="Giảm 10 điểm"
                >
                  -10
                </button>
                <input
                  type="number"
                  value={rates.worldDropRate}
                  onChange={(e) => setRates({ ...rates, worldDropRate: parseInt(e.target.value) || 0 })}
                  className="drop-events-input"
                  style={{ flex: 1, textAlign: "center", fontSize: 16, color: "#ffd47c" }}
                />
                <button
                  onClick={() => setRates({ ...rates, worldDropRate: rates.worldDropRate + 10 })}
                  className="drop-events-btn-step"
                  title="Tăng 10 điểm"
                >
                  +10
                </button>
                <button
                  onClick={() => setRates({ ...rates, worldDropRate: rates.worldDropRate + 50 })}
                  className="drop-events-btn-step"
                  title="Tăng 50 điểm"
                >
                  +50
                </button>
              </div>

              <div
                style={{
                  padding: 12,
                  borderRadius: 8,
                  background: "rgba(0, 0, 0, 0.5)",
                  border: "1px solid rgba(230, 174, 78, 0.15)",
                  fontSize: 12,
                  color: "#a89f91",
                  fontFamily: "monospace",
                  lineHeight: 1.6,
                }}
              >
                <div>Công thức: RNG(1..8000) &le; ({rates.worldDropRate} + Buffs)</div>
                <div style={{ color: "#ffd47c", fontWeight: 700, fontFamily: "sans-serif" }}>
                  &rarr; Xác suất cơ bản: {((rates.worldDropRate / 8000) * 100).toFixed(2)}% mỗi con quái
                </div>
              </div>
            </div>

            {/* 2. Gold Rate (钱倍数) */}
            <div className="drop-events-card">
              <div className="drop-events-card-head">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ padding: 8, borderRadius: 8, background: "rgba(230, 174, 78, 0.15)", color: "#ffd47c" }}>
                    <Coins size={20} />
                  </div>
                  <div>
                    <h3 className="drop-events-card-title">Hệ Số Rơi Tiền Vàng (钱倍数)</h3>
                    <p className="drop-events-card-desc">Nhân số lượng lượng/vàng rơi</p>
                  </div>
                </div>
                <span style={{ fontSize: 20, fontWeight: 900, fontFamily: "monospace", color: "#ffd47c" }}>
                  x{rates.goldRate}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={() => setRates({ ...rates, goldRate: Math.max(1, rates.goldRate - 5) })}
                  className="drop-events-btn-step"
                >
                  -5
                </button>
                <button
                  onClick={() => setRates({ ...rates, goldRate: Math.max(1, rates.goldRate - 1) })}
                  className="drop-events-btn-step"
                >
                  -1
                </button>
                <input
                  type="number"
                  value={rates.goldRate}
                  onChange={(e) => setRates({ ...rates, goldRate: parseInt(e.target.value) || 1 })}
                  className="drop-events-input"
                  style={{ flex: 1, textAlign: "center", fontSize: 16, color: "#ffd47c" }}
                />
                <button
                  onClick={() => setRates({ ...rates, goldRate: rates.goldRate + 1 })}
                  className="drop-events-btn-step"
                >
                  +1
                </button>
                <button
                  onClick={() => setRates({ ...rates, goldRate: rates.goldRate + 5 })}
                  className="drop-events-btn-step"
                >
                  +5
                </button>
              </div>

              <p style={{ margin: 0, fontSize: 12, color: "#8c8277" }}>
                Gợi ý: Đặt từ <strong style={{ color: "#ffd47c" }}>1</strong> đến <strong style={{ color: "#ffd47c" }}>10</strong> để giữ giá trị tiền vạn trong game.
              </p>
            </div>

            {/* 3. VIP Multiplier (VIP爆率增加) */}
            <div className="drop-events-card">
              <div className="drop-events-card-head">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ padding: 8, borderRadius: 8, background: "rgba(107, 170, 243, 0.15)", color: "#8bc3ff" }}>
                    <Shield size={20} />
                  </div>
                  <div>
                    <h3 className="drop-events-card-title">Bội Số Rơi Đồ VIP (VIP爆率)</h3>
                    <p className="drop-events-card-desc">Hệ số nhân bạo kích cho VIP</p>
                  </div>
                </div>
                <span style={{ fontSize: 20, fontWeight: 900, fontFamily: "monospace", color: "#8bc3ff" }}>
                  x{rates.vipDropRate}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {[1, 2, 3, 4].map((v) => (
                  <button
                    key={v}
                    onClick={() => setRates({ ...rates, vipDropRate: v })}
                    className="drop-events-btn-dark"
                    style={{
                      flex: 1,
                      padding: "8px 0",
                      background: rates.vipDropRate === v ? "linear-gradient(180deg, #f3c968, #bd7528)" : undefined,
                      color: rates.vipDropRate === v ? "#1b1005" : undefined,
                      borderColor: rates.vipDropRate === v ? "#ffd47c" : undefined,
                      fontWeight: 800,
                    }}
                  >
                    x{v}
                  </button>
                ))}
              </div>

              <p style={{ margin: 0, fontSize: 12, color: "#8c8277" }}>
                Khi kích hoạt bùa VIP, toàn bộ tỉ lệ rơi đồ sẽ được nhân với hệ số này.
              </p>
            </div>

            {/* 4. EXP & Skill EXP */}
            <div className="drop-events-card">
              <div className="drop-events-card-head">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ padding: 8, borderRadius: 8, background: "rgba(73, 213, 139, 0.15)", color: "#54dc96" }}>
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="drop-events-card-title">Hệ Số Kinh Nghiệm (EXP)</h3>
                    <p className="drop-events-card-desc">Kinh nghiệm & Tu luyện kỹ năng</p>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <span style={{ display: "block", fontSize: 12, color: "#91887d", marginBottom: 4 }}>EXP Nhân Vật (x)</span>
                  <input
                    type="number"
                    step="0.1"
                    value={rates.expRate}
                    onChange={(e) => setRates({ ...rates, expRate: parseFloat(e.target.value) || 1.0 })}
                    className="drop-events-input"
                    style={{ width: "100%", textAlign: "center", color: "#54dc96" }}
                  />
                </div>
                <div>
                  <span style={{ display: "block", fontSize: 12, color: "#91887d", marginBottom: 4 }}>Điểm Tu Luyện (历练)</span>
                  <input
                    type="number"
                    value={rates.skillExpRate}
                    onChange={(e) => setRates({ ...rates, skillExpRate: parseInt(e.target.value) || 1 })}
                    className="drop-events-input"
                    style={{ width: "100%", textAlign: "center", color: "#54dc96" }}
                  />
                </div>
              </div>
            </div>

            {/* 5. Doctor Group Buff (群医加爆率) */}
            <div className="drop-events-card">
              <div className="drop-events-card-head">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ padding: 8, borderRadius: 8, background: "rgba(107, 170, 243, 0.15)", color: "#8bc3ff" }}>
                    <Users size={20} />
                  </div>
                  <div>
                    <h3 className="drop-events-card-title">Đại Phu Buff Nhóm (+%)</h3>
                    <p className="drop-events-card-desc">Cộng thêm khi có buff Đại Phu</p>
                  </div>
                </div>
                <span style={{ fontSize: 20, fontWeight: 900, fontFamily: "monospace", color: "#8bc3ff" }}>
                  +{rates.doctorGroupDropRate}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={rates.doctorGroupDropRate}
                  onChange={(e) => setRates({ ...rates, doctorGroupDropRate: parseInt(e.target.value) || 0 })}
                  style={{ width: "100%", accentColor: "#e6ae4e" }}
                />
              </div>

              <p style={{ margin: 0, fontSize: 12, color: "#8c8277" }}>
                Giá trị hiện tại: <strong style={{ color: "#8bc3ff" }}>+{rates.doctorGroupDropRate} điểm bạo kích</strong> khi Đại phu buff máu nhóm.
              </p>
            </div>

            {/* 6. Party Bonus Rates */}
            <div className="drop-events-card">
              <div className="drop-events-card-head">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ padding: 8, borderRadius: 8, background: "rgba(230, 174, 78, 0.15)", color: "#ffd47c" }}>
                    <Users size={20} />
                  </div>
                  <div>
                    <h3 className="drop-events-card-title">Thưởng Tổ Đội (Party)</h3>
                    <p className="drop-events-card-desc">Tỉ lệ cộng dồn 2 đến 8 thành viên</p>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, textAlign: "center" }}>
                <div style={{ padding: "8px 4px", borderRadius: 8, background: "rgba(0, 0, 0, 0.5)", border: "1px solid rgba(230, 174, 78, 0.15)" }}>
                  <div style={{ fontSize: 11, color: "#8c8277" }}>2 Người</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#ffd47c", fontFamily: "monospace" }}>+{(rates.partyDropRate2 * 100).toFixed(0)}%</div>
                </div>
                <div style={{ padding: "8px 4px", borderRadius: 8, background: "rgba(0, 0, 0, 0.5)", border: "1px solid rgba(230, 174, 78, 0.15)" }}>
                  <div style={{ fontSize: 11, color: "#8c8277" }}>4 Người</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#ffd47c", fontFamily: "monospace" }}>+{(rates.partyDropRate4 * 100).toFixed(0)}%</div>
                </div>
                <div style={{ padding: "8px 4px", borderRadius: 8, background: "rgba(0, 0, 0, 0.5)", border: "1px solid rgba(230, 174, 78, 0.15)" }}>
                  <div style={{ fontSize: 11, color: "#8c8277" }}>6 Người</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#ffd47c", fontFamily: "monospace" }}>+{(rates.partyDropRate6 * 100).toFixed(0)}%</div>
                </div>
                <div style={{ padding: "8px 4px", borderRadius: 8, background: "rgba(0, 0, 0, 0.5)", border: "1px solid rgba(230, 174, 78, 0.15)" }}>
                  <div style={{ fontSize: 11, color: "#8c8277" }}>8 Người</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#ffd47c", fontFamily: "monospace" }}>+{(rates.partyDropRate8 * 100).toFixed(0)}%</div>
                </div>
              </div>
            </div>

            {/* 7. Distinct Job Classes Party EXP Bonus */}
            <div className="drop-events-card" style={{ gridColumn: "1 / -1", border: "1px solid rgba(230, 174, 78, 0.4)", background: "rgba(22, 17, 13, 0.95)" }}>
              <div className="drop-events-card-head" style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ padding: 10, borderRadius: 10, background: "linear-gradient(135deg, rgba(243, 201, 104, 0.2), rgba(189, 117, 40, 0.2))", color: "#ffd47c", border: "1px solid rgba(255, 212, 124, 0.3)" }}>
                    <Swords size={24} />
                  </div>
                  <div>
                    <h3 className="drop-events-card-title" style={{ fontSize: 17, color: "#ffd47c" }}>Thưởng EXP Tổ Đội Theo Ngành Nghề (Đa Dạng Class)</h3>
                    <p className="drop-events-card-desc" style={{ fontSize: 13, color: "#c8c0b4" }}>
                      Tự động tính theo số loại nhân vật / ngành nghề khác nhau (Player_Job: Đao, Kiếm, Thương, Cung, Đại Phu, Thích Khách, Nhạc Công, HBQ, DHL, Quyền, MLC, Noho, Đông Lãnh...) đứng trong phạm vi nhận điểm (&le; 700)
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                {/* Mốc 3 nghề */}
                <div style={{ padding: 14, borderRadius: 10, background: "rgba(0, 0, 0, 0.55)", border: "1px solid rgba(230, 174, 78, 0.2)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#f7f3ea" }}>Mốc &ge; 3 Nghề Khác Nhau</span>
                    <span style={{ fontSize: 16, fontWeight: 900, color: "#54dc96", fontFamily: "monospace" }}>+{((rates.partyJobBonus3 || 0) * 100).toFixed(0)}%</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button
                      onClick={() => setRates({ ...rates, partyJobBonus3: Math.max(0, parseFloat(((rates.partyJobBonus3 || 0) - 0.05).toFixed(2))) })}
                      className="drop-events-btn-step"
                      title="Giảm 5%"
                    >
                      -5%
                    </button>
                    <input
                      type="number"
                      step="0.01"
                      value={rates.partyJobBonus3 ?? 0.10}
                      onChange={(e) => setRates({ ...rates, partyJobBonus3: Math.max(0, parseFloat(e.target.value) || 0) })}
                      className="drop-events-input"
                      style={{ flex: 1, textAlign: "center", color: "#ffd47c", fontWeight: 700 }}
                    />
                    <button
                      onClick={() => setRates({ ...rates, partyJobBonus3: parseFloat(((rates.partyJobBonus3 || 0) + 0.05).toFixed(2)) })}
                      className="drop-events-btn-step"
                      title="Tăng 5%"
                    >
                      +5%
                    </button>
                  </div>
                  <p style={{ margin: "6px 0 0", fontSize: 11.5, color: "#8c8277" }}>Ví dụ: Đao + Kiếm + Thương</p>
                </div>

                {/* Mốc 5 nghề */}
                <div style={{ padding: 14, borderRadius: 10, background: "rgba(0, 0, 0, 0.55)", border: "1px solid rgba(230, 174, 78, 0.2)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#f7f3ea" }}>Mốc &ge; 5 Nghề Khác Nhau</span>
                    <span style={{ fontSize: 16, fontWeight: 900, color: "#54dc96", fontFamily: "monospace" }}>+{((rates.partyJobBonus5 || 0) * 100).toFixed(0)}%</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button
                      onClick={() => setRates({ ...rates, partyJobBonus5: Math.max(0, parseFloat(((rates.partyJobBonus5 || 0) - 0.05).toFixed(2))) })}
                      className="drop-events-btn-step"
                      title="Giảm 5%"
                    >
                      -5%
                    </button>
                    <input
                      type="number"
                      step="0.01"
                      value={rates.partyJobBonus5 ?? 0.20}
                      onChange={(e) => setRates({ ...rates, partyJobBonus5: Math.max(0, parseFloat(e.target.value) || 0) })}
                      className="drop-events-input"
                      style={{ flex: 1, textAlign: "center", color: "#ffd47c", fontWeight: 700 }}
                    />
                    <button
                      onClick={() => setRates({ ...rates, partyJobBonus5: parseFloat(((rates.partyJobBonus5 || 0) + 0.05).toFixed(2)) })}
                      className="drop-events-btn-step"
                      title="Tăng 5%"
                    >
                      +5%
                    </button>
                  </div>
                  <p style={{ margin: "6px 0 0", fontSize: 11.5, color: "#8c8277" }}>Ví dụ: Đao + Kiếm + Thương + Cung + DP</p>
                </div>

                {/* Mốc 7 nghề */}
                <div style={{ padding: 14, borderRadius: 10, background: "rgba(0, 0, 0, 0.55)", border: "1px solid rgba(230, 174, 78, 0.2)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#f7f3ea" }}>Mốc &ge; 7 Nghề Khác Nhau</span>
                    <span style={{ fontSize: 16, fontWeight: 900, color: "#54dc96", fontFamily: "monospace" }}>+{((rates.partyJobBonus7 || 0) * 100).toFixed(0)}%</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button
                      onClick={() => setRates({ ...rates, partyJobBonus7: Math.max(0, parseFloat(((rates.partyJobBonus7 || 0) - 0.05).toFixed(2))) })}
                      className="drop-events-btn-step"
                      title="Giảm 5%"
                    >
                      -5%
                    </button>
                    <input
                      type="number"
                      step="0.01"
                      value={rates.partyJobBonus7 ?? 0.35}
                      onChange={(e) => setRates({ ...rates, partyJobBonus7: Math.max(0, parseFloat(e.target.value) || 0) })}
                      className="drop-events-input"
                      style={{ flex: 1, textAlign: "center", color: "#ffd47c", fontWeight: 700 }}
                    />
                    <button
                      onClick={() => setRates({ ...rates, partyJobBonus7: parseFloat(((rates.partyJobBonus7 || 0) + 0.05).toFixed(2)) })}
                      className="drop-events-btn-step"
                      title="Tăng 5%"
                    >
                      +5%
                    </button>
                  </div>
                  <p style={{ margin: "6px 0 0", fontSize: 11.5, color: "#8c8277" }}>Tổ đội đa dạng 7 hệ phái</p>
                </div>

                {/* Mốc 8 nghề */}
                <div style={{ padding: 14, borderRadius: 10, background: "rgba(0, 0, 0, 0.55)", border: "1px solid rgba(230, 174, 78, 0.2)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#f7f3ea" }}>Mốc &ge; 8 Nghề Khác Nhau</span>
                    <span style={{ fontSize: 16, fontWeight: 900, color: "#54dc96", fontFamily: "monospace" }}>+{((rates.partyJobBonus8 || 0) * 100).toFixed(0)}%</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button
                      onClick={() => setRates({ ...rates, partyJobBonus8: Math.max(0, parseFloat(((rates.partyJobBonus8 || 0) - 0.05).toFixed(2))) })}
                      className="drop-events-btn-step"
                      title="Giảm 5%"
                    >
                      -5%
                    </button>
                    <input
                      type="number"
                      step="0.01"
                      value={rates.partyJobBonus8 ?? 0.50}
                      onChange={(e) => setRates({ ...rates, partyJobBonus8: Math.max(0, parseFloat(e.target.value) || 0) })}
                      className="drop-events-input"
                      style={{ flex: 1, textAlign: "center", color: "#ffd47c", fontWeight: 700 }}
                    />
                    <button
                      onClick={() => setRates({ ...rates, partyJobBonus8: parseFloat(((rates.partyJobBonus8 || 0) + 0.05).toFixed(2)) })}
                      className="drop-events-btn-step"
                      title="Tăng 5%"
                    >
                      +5%
                    </button>
                  </div>
                  <p style={{ margin: "6px 0 0", fontSize: 11.5, color: "#8c8277" }}>Tổ đội tối đa 8 phái độc nhất</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MONSTER DROP TABLE */}
      {tab === "drops" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* BẢNG CHI TIẾT: BẢO THẠCH DANH HIỆU TỐI CAO & CƠ CHẾ SỰ KIỆN */}
          <div
            style={{
              padding: "16px 20px",
              borderRadius: 14,
              border: "1px solid rgba(230, 174, 78, 0.4)",
              background: "linear-gradient(135deg, rgba(28, 20, 12, 0.96), rgba(15, 11, 8, 0.98))",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ padding: 10, borderRadius: 10, background: "linear-gradient(135deg, rgba(243, 201, 104, 0.25), rgba(189, 117, 40, 0.25))", color: "#ffd47c", border: "1px solid rgba(255, 212, 124, 0.35)" }}>
                  <Trophy size={22} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 850, color: "#ffd47c" }}>
                      💎 BẢO THẠCH DANH HIỆU TỐI CAO (PID: 900000401)
                    </h3>
                    <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 6, background: "rgba(84, 220, 150, 0.15)", color: "#54dc96", border: "1px solid rgba(84, 220, 150, 0.3)" }}>
                      ✔ ĐÃ KHÓA TOÀN BỘ DROP — CHỈ PHÁT KHI CÓ SỰ KIỆN
                    </span>
                  </div>
                  <p style={{ margin: "3px 0 0", fontSize: 12.5, color: "#c8c0b4" }}>
                    Vật phẩm đặc biệt dùng tăng điểm tích lũy danh hiệu. Khi cắn đủ mốc, tự động kích hoạt <strong>Danh Hiệu PK</strong> và cộng vĩnh viễn chỉ số thuộc tính cực mạnh.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <button
                  onClick={() => {
                    setAddPid(900000401);
                    setAddLvlMin(35);
                    setAddLvlMax(500);
                    setAddPP(50);
                    setAddMaxQ(0);
                    setShowAddModal(true);
                  }}
                  className="drop-events-btn-gold"
                  style={{ fontSize: 12, padding: "7px 14px" }}
                >
                  <Plus size={14} /> Mở Drop Bãi Train Sự Kiện
                </button>
              </div>
            </div>

            {/* Bảng 5 Mốc Thưởng Thuộc Tính */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "rgba(0, 0, 0, 0.6)", borderBottom: "1px solid rgba(230, 174, 78, 0.25)", color: "#ffd47c" }}>
                    <th style={{ padding: "8px 12px", fontWeight: 800 }}>Giai Đoạn</th>
                    <th style={{ padding: "8px 12px", fontWeight: 800, textAlign: "center" }}>Mốc Tích Lũy</th>
                    <th style={{ padding: "8px 12px", fontWeight: 800 }}>Danh Hiệu Nhận Được</th>
                    <th style={{ padding: "8px 12px", fontWeight: 800, textAlign: "center" }}>⚔️ Công Kích</th>
                    <th style={{ padding: "8px 12px", fontWeight: 800, textAlign: "center" }}>🛡️ Phòng Ngự</th>
                    <th style={{ padding: "8px 12px", fontWeight: 800, textAlign: "center" }}>❤️ Sinh Mệnh HP</th>
                    <th style={{ padding: "8px 12px", fontWeight: 800, textAlign: "center" }}>🔥 Sát Thương PK</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { stage: "Giai đoạn 1", req: "100 viên", title: "Danh Hiệu PK (5) — Anh Hùng Hào Kiệt", atk: "+30", def: "+30", hp: "+300", pvp: "+3%" },
                    { stage: "Giai đoạn 2", req: "200 viên", title: "Danh Hiệu PK (4) — Cô Đảm Anh Hùng", atk: "+50", def: "+50", hp: "+500", pvp: "+5%" },
                    { stage: "Giai đoạn 3", req: "300 viên", title: "Danh Hiệu PK (3) — Hùng Bá Thiên Hạ", atk: "+100", def: "+100", hp: "+1.000", pvp: "+10%" },
                    { stage: "Giai đoạn 4", req: "500 viên", title: "Danh Hiệu PK (2) — Cử Thế Vô Song", atk: "+200", def: "+200", hp: "+2.000", pvp: "+15%" },
                    { stage: "Giai đoạn 5 (Max)", req: "800 viên", title: "Danh Hiệu PK (1) — Chí Cao Vô Thượng", atk: "+300", def: "+300", hp: "+3.000", pvp: "+30%", isMax: true },
                  ].map((row, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                        background: row.isMax ? "rgba(230, 174, 78, 0.08)" : idx % 2 === 1 ? "rgba(255, 255, 255, 0.02)" : "transparent",
                      }}
                    >
                      <td style={{ padding: "7px 12px", fontWeight: row.isMax ? 800 : 600, color: row.isMax ? "#ffd47c" : "#f7f3ea" }}>
                        {row.stage}
                      </td>
                      <td style={{ padding: "7px 12px", textAlign: "center", fontFamily: "monospace", fontWeight: 800, color: "#ffd47c" }}>
                        {row.req}
                      </td>
                      <td style={{ padding: "7px 12px", fontWeight: 700, color: row.isMax ? "#ffd47c" : "#f7f3ea" }}>
                        {row.title}
                      </td>
                      <td style={{ padding: "7px 12px", textAlign: "center", color: "#ff8c73", fontWeight: 800, fontFamily: "monospace" }}>
                        {row.atk}
                      </td>
                      <td style={{ padding: "7px 12px", textAlign: "center", color: "#73baff", fontWeight: 800, fontFamily: "monospace" }}>
                        {row.def}
                      </td>
                      <td style={{ padding: "7px 12px", textAlign: "center", color: "#54dc96", fontWeight: 800, fontFamily: "monospace" }}>
                        {row.hp}
                      </td>
                      <td style={{ padding: "7px 12px", textAlign: "center", color: "#ffaa44", fontWeight: 800, fontFamily: "monospace" }}>
                        {row.pvp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bảng Trạng Thái Nguồn Nhận (Audit Log) */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, paddingTop: 4 }}>
              <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(0, 0, 0, 0.45)", border: "1px solid rgba(84, 220, 150, 0.2)", fontSize: 12 }}>
                <span style={{ color: "#54dc96", fontWeight: 750 }}>✔ Nhiệm vụ Thăng chức 2:</span>
                <span style={{ color: "#c8c0b4", display: "block" }}>Đã xóa code tặng 20 viên khi thăng chức</span>
              </div>
              <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(0, 0, 0, 0.45)", border: "1px solid rgba(84, 220, 150, 0.2)", fontSize: 12 }}>
                <span style={{ color: "#54dc96", fontWeight: 750 }}>✔ Quái Cao Thủ (GS):</span>
                <span style={{ color: "#c8c0b4", display: "block" }}>Đã xóa sạch khỏi TBL_XWWL_DROP_GS</span>
              </div>
              <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(0, 0, 0, 0.45)", border: "1px solid rgba(84, 220, 150, 0.2)", fontSize: 12 }}>
                <span style={{ color: "#54dc96", fontWeight: 750 }}>✔ Mở Rương & Hộp Báu:</span>
                <span style={{ color: "#c8c0b4", display: "block" }}>Đã xóa khỏi toàn bộ rương TBL_XWWL_OPEN</span>
              </div>
              <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(0, 0, 0, 0.45)", border: "1px solid rgba(84, 220, 150, 0.2)", fontSize: 12 }}>
                <span style={{ color: "#ffd47c", fontWeight: 750 }}>🎁 Quà Mãn Bảo Thạch (800):</span>
                <span style={{ color: "#c8c0b4", display: "block" }}>PID 1008000531 (Dành cho trao giải Sự Kiện/Top)</span>
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div
            style={{
              padding: "14px 18px",
              borderRadius: 12,
              border: "1px solid rgba(230, 174, 78, 0.2)",
              background: "rgba(18, 14, 10, 0.8)",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            {/* Level Tier Filter */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
              {[
                { id: "all", label: "Tất Cả" },
                { id: "1-79", label: "Cấp 1 - 79 (Tân Thủ)" },
                { id: "80-129", label: "Cấp 80 - 129 (Trung Cấp)" },
                { id: "110-500", label: "Cấp 110 - 500 (Thăng Thiên & Rương)" },
                { id: "130+", label: "Cấp 130+ (Đá Thần & Võ Hoàng Tệ)" },
              ].map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setDropLevelTier(tier.id)}
                  className="drop-events-btn-dark"
                  style={{
                    background: dropLevelTier === tier.id ? "linear-gradient(180deg, #f3c968, #bd7528)" : undefined,
                    color: dropLevelTier === tier.id ? "#1b1005" : undefined,
                    borderColor: dropLevelTier === tier.id ? "#ffd47c" : undefined,
                    fontWeight: 800,
                  }}
                >
                  {tier.label}
                </button>
              ))}
            </div>

            {/* Search and Add */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ position: "relative", width: 240 }}>
                <Search size={14} style={{ position: "absolute", left: 10, top: 11, color: "#8c8277" }} />
                <input
                  type="text"
                  placeholder="Tìm tên hoặc PID vật phẩm..."
                  value={dropSearch}
                  onChange={(e) => setDropSearch(e.target.value)}
                  className="drop-events-input"
                  style={{ width: "100%", paddingLeft: 32 }}
                />
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="drop-events-btn-gold"
              >
                <Plus size={15} /> Thêm Món Rơi
              </button>
            </div>
          </div>

          {/* Bulk Action Bar — hiện khi có item được chọn */}
          {selectedIds.size > 0 && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: 10,
                border: "1px solid rgba(230, 174, 78, 0.5)",
                background: "rgba(35, 25, 10, 0.95)",
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                alignItems: "center",
              }}
            >
              <span style={{ color: "#ffd47c", fontWeight: 800, marginRight: 4 }}>
                ✔ {selectedIds.size} vật phẩm đã chọn
              </span>

              {/* Bulk MaxQ presets */}
              <button
                onClick={() => bulkUpdateDrops({ maxQ: 0 })}
                className="drop-events-btn-step"
                title="Bỏ giới hạn số lần rơi"
              >
                ∞ Bỏ Trần
              </button>
              <button
                onClick={() => bulkUpdateDrops({ maxQ: 1 })}
                className="drop-events-btn-step"
                title="Giới hạn 1 lần/ngày"
              >
                1 Ngày
              </button>
              <button
                onClick={() => bulkUpdateDrops({ maxQ: 2 })}
                className="drop-events-btn-step"
                title="Giới hạn 2 lần/ngày"
              >
                2 Ngày
              </button>
              <button
                onClick={() => bulkUpdateDrops({ maxQ: 3 })}
                className="drop-events-btn-step"
                title="Giới hạn 3 lần/ngày"
              >
                3 Ngày
              </button>

              <span style={{ color: "#91887d", margin: "0 4px" }}>|</span>

              {/* Bulk PP input */}
              <input
                type="number"
                placeholder="PP mới..."
                value={bulkPP}
                onChange={(e) => setBulkPP(e.target.value)}
                className="drop-events-input"
                style={{ width: 90 }}
              />
              <button
                onClick={() => {
                  const v = parseInt(bulkPP) || 0;
                  bulkUpdateDrops({ pp: v });
                }}
                className="drop-events-btn-gold"
              >
                Áp Dụng PP
              </button>

              <span style={{ color: "#91887d", margin: "0 4px" }}>|</span>

              {/* Bulk toggle */}
              <button
                onClick={() => bulkUpdateDrops({ toggle: true })}
                className="drop-events-badge green"
                style={{ cursor: "pointer", fontWeight: 800 }}
              >
                BẬT Tất Cả
              </button>
              <button
                onClick={() => bulkUpdateDrops({ toggle: false })}
                className="drop-events-badge red"
                style={{ cursor: "pointer", fontWeight: 800 }}
              >
                TẮT Tất Cả
              </button>

              <span style={{ color: "#91887d", margin: "0 4px" }}>|</span>

              <button
                onClick={() => setSelectedIds(new Set())}
                className="drop-events-btn-dark"
              >
                Bỏ Chọn
              </button>
            </div>
          )}

          {/* Drops Table */}
          <div className="drop-events-table-wrap">
            <table className="drop-events-table">
              <thead>
                <tr>
                  <th style={{ width: 36, textAlign: "center" }}>
                    <input
                      type="checkbox"
                      title="Chọn tất cả trong trang"
                      checked={
                        filteredDrops.length > 0 &&
                        filteredDrops.every((i) => selectedIds.has(i.id))
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(
                            new Set([...selectedIds, ...filteredDrops.map((i) => i.id)])
                          );
                        } else {
                          const rm = new Set(filteredDrops.map((i) => i.id));
                          setSelectedIds(new Set([...selectedIds].filter((id) => !rm.has(id))));
                        }
                      }}
                    />
                  </th>
                  <th>Cấp Quái</th>
                  <th>PID</th>
                  <th>Tên Vật Phẩm</th>
                  <th style={{ textAlign: "center" }}>Trọng Số (PP)</th>
                  <th style={{ textAlign: "center" }}>Tần Suất Ước Tính</th>
                  <th style={{ textAlign: "center", minWidth: 210 }}>Trần / Ngày</th>
                  <th style={{ textAlign: "center" }}>Bật / Tắt</th>
                  <th style={{ textAlign: "right" }}>Xóa</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrops.map((item) => {
                  const isHigh = item.probabilityPoint >= 3000;
                  const isRare = item.probabilityPoint <= 100 && item.probabilityPoint > 0;
                  const isSelected = selectedIds.has(item.id);
                  return (
                    <tr
                      key={item.id}
                      style={{
                        background: isSelected ? "rgba(230, 174, 78, 0.07)" : undefined,
                        outline: isSelected ? "1px solid rgba(230,174,78,0.2)" : undefined,
                      }}
                    >
                      {/* Checkbox */}
                      <td style={{ textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const s = new Set(selectedIds);
                            e.target.checked ? s.add(item.id) : s.delete(item.id);
                            setSelectedIds(s);
                          }}
                        />
                      </td>

                      {/* Cấp Quái */}
                      <td className="mono" style={{ fontWeight: 800, color: "#ffd47c" }}>
                        {item.levelMin} - {item.levelMax}
                      </td>

                      {/* PID */}
                      <td className="mono" style={{ color: "#a89f91" }}>{item.itemPid}</td>

                      {/* Tên */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <img
                            src={`/item-icons/${item.itemPid}.jpg`}
                            alt=""
                            width={26}
                            height={26}
                            style={{ borderRadius: 4, background: "rgba(0,0,0,0.5)", border: "1px solid rgba(230, 174, 78, 0.25)", objectFit: "contain", flexShrink: 0 }}
                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                          />
                          <strong style={{ color: "#f7f3ea" }}>{item.itemName}</strong>
                          {item.itemPid === 909000035 && (
                            <span className="drop-events-badge gold">
                              Quái &ge; 130 &amp; chênh &ge; 10
                            </span>
                          )}
                        </div>
                      </td>

                      {/* PP — input + -/+ buttons, save on blur */}
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <button
                            onClick={() =>
                              updateMonsterDrop(item.id, Math.max(0, item.probabilityPoint - 500))
                            }
                            className="drop-events-btn-step"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={editingPP[item.id] ?? item.probabilityPoint}
                            onChange={(e) =>
                              setEditingPP((p) => ({ ...p, [item.id]: e.target.value }))
                            }
                            onBlur={() => {
                              const v = parseInt(editingPP[item.id] as string) || 0;
                              updateMonsterDrop(item.id, v);
                              setEditingPP((p) => {
                                const n = { ...p };
                                delete n[item.id];
                                return n;
                              });
                            }}
                            className="drop-events-input"
                            style={{ width: 68, textAlign: "center" }}
                          />
                          <button
                            onClick={() =>
                              updateMonsterDrop(item.id, item.probabilityPoint + 500)
                            }
                            className="drop-events-btn-step"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Tần suất ước tính */}
                      <td style={{ textAlign: "center" }}>
                        {item.probabilityPoint === 0 ? (
                          <span style={{ color: "#776e65" }}>Đã Tắt (0%)</span>
                        ) : isRare ? (
                          <span className="drop-events-badge red">
                            Cực Hiếm ({item.probabilityPoint})
                          </span>
                        ) : isHigh ? (
                          <span className="drop-events-badge green">
                            Rất Cao ({item.probabilityPoint})
                          </span>
                        ) : (
                          <span className="drop-events-badge gold">
                            Trung Bình ({item.probabilityPoint})
                          </span>
                        )}
                      </td>

                      {/* Trần / Ngày — input MaxQ + preset buttons + counter */}
                      <td style={{ textAlign: "center" }}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                            alignItems: "center",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <input
                              type="number"
                              min={0}
                              placeholder="0=∞"
                              value={editingMaxQ[item.id] ?? item.maxQuantity}
                              onChange={(e) =>
                                setEditingMaxQ((p) => ({ ...p, [item.id]: e.target.value }))
                              }
                              onBlur={() => {
                                const v = parseInt(editingMaxQ[item.id] as string);
                                const val = isNaN(v) ? 0 : v;
                                updateMonsterDrop(item.id, item.probabilityPoint, val);
                                setEditingMaxQ((p) => {
                                  const n = { ...p };
                                  delete n[item.id];
                                  return n;
                                });
                              }}
                              className="drop-events-input"
                              style={{ width: 56, textAlign: "center" }}
                              title="0 = không giới hạn"
                            />
                            <button
                              onClick={() =>
                                updateMonsterDrop(item.id, item.probabilityPoint, 1)
                              }
                              className="drop-events-btn-step"
                              title="Trần 1 lần/ngày"
                            >
                              1N
                            </button>
                            <button
                              onClick={() =>
                                updateMonsterDrop(item.id, item.probabilityPoint, 2)
                              }
                              className="drop-events-btn-step"
                              title="Trần 2 lần/ngày"
                            >
                              2N
                            </button>
                            <button
                              onClick={() =>
                                updateMonsterDrop(item.id, item.probabilityPoint, 3)
                              }
                              className="drop-events-btn-step"
                              title="Trần 3 lần/ngày"
                            >
                              3N
                            </button>
                            <button
                              onClick={() =>
                                updateMonsterDrop(item.id, item.probabilityPoint, 0)
                              }
                              className="drop-events-btn-step"
                              title="Bỏ giới hạn"
                            >
                              ∞
                            </button>
                          </div>
                          {item.maxQuantity > 0 ? (
                            <span
                              className="mono"
                              style={{ fontSize: 11, color: "#8bc3ff" }}
                            >
                              {item.currentQuantity} / {item.maxQuantity} hôm nay
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, color: "#776e65" }}>
                              Không giới hạn
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Bật / Tắt */}
                      <td style={{ textAlign: "center" }}>
                        <button
                          onClick={() =>
                            updateMonsterDrop(
                              item.id,
                              item.probabilityPoint,
                              undefined,
                              !item.isEnabled
                            )
                          }
                          className={item.isEnabled ? "drop-events-badge green" : "drop-events-badge red"}
                          style={{ cursor: "pointer", fontWeight: 800 }}
                        >
                          {item.isEnabled ? "BẬT" : "TẮT"}
                        </button>
                      </td>

                      {/* Xóa */}
                      <td style={{ textAlign: "right" }}>
                        <button
                          onClick={() => deleteMonsterDrop(item.id, item.itemName)}
                          className="drop-events-btn-danger"
                          title="Xóa vật phẩm này khỏi bảng drop"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: 14 SERVER EVENTS & BOSSES */}
      {tab === "events" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Category Filter */}
          <div
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              border: "1px solid rgba(230, 174, 78, 0.2)",
              background: "rgba(18, 14, 10, 0.8)",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 8,
            }}
          >
            {[
              { id: "all", label: "Tất Cả (14 Sự Kiện)" },
              { id: "Boss", label: "Boss Săn Đồ (4)" },
              { id: "Đại Chiến", label: "Thế Lực Chiến & PK (3)" },
              { id: "Phúc Lợi", label: "Phúc Lợi & Cuối Tuần (5)" },
              { id: "Minigame", label: "Minigame & Giải Trí (2)" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setEventCategory(cat.id)}
                className="drop-events-btn-dark"
                style={{
                  background: eventCategory === cat.id ? "linear-gradient(180deg, #f3c968, #bd7528)" : undefined,
                  color: eventCategory === cat.id ? "#1b1005" : undefined,
                  borderColor: eventCategory === cat.id ? "#ffd47c" : undefined,
                  fontWeight: 800,
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grid of Event Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 16 }}>
            {filteredEvents.map((ev) => {
              const isExpanded = expandedEvent === ev.id;
              return (
                <div
                  key={ev.id}
                  className={`drop-events-card ${ev.enabled ? "" : "off"}`}
                >
                  {/* Card Header */}
                  <div className="drop-events-card-head">
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <div
                        style={{
                          padding: 8,
                          borderRadius: 8,
                          background: ev.enabled ? "rgba(230, 174, 78, 0.15)" : "rgba(255, 255, 255, 0.05)",
                          color: ev.enabled ? "#ffd47c" : "#8c8277",
                        }}
                      >
                        {ev.category.includes("Boss") ? (
                          <Flame size={20} />
                        ) : ev.category.includes("Chiến") || ev.category.includes("PK") ? (
                          <Swords size={20} />
                        ) : (
                          <Gift size={20} />
                        )}
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <h3 className="drop-events-card-title">{ev.name}</h3>
                          <span className="drop-events-badge gold">{ev.category}</span>
                        </div>
                        <p className="drop-events-card-desc">{ev.description}</p>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button
                        onClick={() => {
                          const updated = { ...ev, enabled: !ev.enabled };
                          setEvents((prev) => prev.map((e) => (e.id === ev.id ? updated : e)));
                          saveEvent(updated);
                        }}
                        className={ev.enabled ? "drop-events-badge green" : "drop-events-badge red"}
                        style={{ cursor: "pointer", padding: "6px 12px", fontSize: 12 }}
                      >
                        {ev.enabled ? "ĐANG BẬT" : "ĐÃ TẮT"}
                      </button>

                      <button
                        onClick={() => setExpandedEvent(isExpanded ? null : ev.id)}
                        className="drop-events-btn-step"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {/* Time & Map info */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12 }}>
                      <div style={{ padding: 10, borderRadius: 8, background: "rgba(0, 0, 0, 0.4)", border: "1px solid rgba(230, 174, 78, 0.15)", display: "flex", gap: 8 }}>
                        <Clock size={16} color="#ffd47c" style={{ flexShrink: 0, marginTop: 2 }} />
                        <div>
                          <div style={{ color: "#8c8277" }}>Khung Giờ Mở:</div>
                          <div style={{ fontWeight: 800, color: "#ffd47c", fontFamily: "monospace", marginTop: 2 }}>
                            {ev.hours.includes("/") || ev.hours.includes("-") || ev.hours.includes(";")
                              ? ev.hours
                              : `${ev.hours.padStart(2, "0")}:${ev.minutes.toString().padStart(2, "0")}`}
                          </div>
                        </div>
                      </div>

                      <div style={{ padding: 10, borderRadius: 8, background: "rgba(0, 0, 0, 0.4)", border: "1px solid rgba(230, 174, 78, 0.15)", display: "flex", gap: 8 }}>
                        <MapPin size={16} color="#8bc3ff" style={{ flexShrink: 0, marginTop: 2 }} />
                        <div>
                          <div style={{ color: "#8c8277" }}>Địa Điểm / Map:</div>
                          <div style={{ fontWeight: 800, color: "#8bc3ff", marginTop: 2 }}>{ev.mapLocation}</div>
                        </div>
                      </div>
                    </div>

                    {/* How it works description */}
                    <div
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        background: "rgba(0, 0, 0, 0.4)",
                        border: "1px solid rgba(230, 174, 78, 0.15)",
                        fontSize: 12.5,
                        color: "#ddd5ca",
                        lineHeight: 1.6,
                      }}
                    >
                      <strong style={{ color: "#ffd47c" }}>Cơ chế hoạt động: </strong>
                      {ev.mechanism}
                    </div>

                    {/* Expandable Schedule & Reward Editor */}
                    {isExpanded && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 12, borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
                        {/* 1. Schedule Editor */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: "#ffd47c", display: "flex", alignItems: "center", gap: 6 }}>
                            <Clock size={14} color="#ffd47c" /> Chỉnh Sửa Khung Giờ & Lịch Mở:
                          </span>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 8 }}>
                            <div>
                              <span style={{ display: "block", fontSize: 11, color: "#8c8277", marginBottom: 3 }}>Mốc Giờ (hoặc Dải)</span>
                              <input
                                type="text"
                                value={ev.hours}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEvents((prev) => prev.map((item) => (item.id === ev.id ? { ...item, hours: val } : item)));
                                }}
                                className="drop-events-input"
                                style={{ width: "100%", textAlign: "center" }}
                              />
                            </div>
                            <div>
                              <span style={{ display: "block", fontSize: 11, color: "#8c8277", marginBottom: 3 }}>Phút Mở</span>
                              <input
                                type="number"
                                value={ev.minutes}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  setEvents((prev) => prev.map((item) => (item.id === ev.id ? { ...item, minutes: val } : item)));
                                }}
                                className="drop-events-input"
                                style={{ width: "100%", textAlign: "center" }}
                              />
                            </div>
                            <div>
                              <span style={{ display: "block", fontSize: 11, color: "#8c8277", marginBottom: 3 }}>Thời Lượng (Phút)</span>
                              <input
                                type="number"
                                value={ev.durationMinutes}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  setEvents((prev) => prev.map((item) => (item.id === ev.id ? { ...item, durationMinutes: val } : item)));
                                }}
                                className="drop-events-input"
                                style={{ width: "100%", textAlign: "center" }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* 2. Rewards Editor */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: "#ffd47c", display: "flex", alignItems: "center", gap: 6 }}>
                            <Trophy size={14} color="#ffd47c" /> Quản Lý Phần Thưởng Sự Kiện:
                          </span>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 8 }}>
                            {/* Võ Huân */}
                            <div style={{ padding: 8, borderRadius: 8, background: "rgba(0, 0, 0, 0.4)", border: "1px solid rgba(230, 174, 78, 0.15)" }}>
                              <span style={{ display: "block", fontSize: 11, color: "#8c8277", marginBottom: 3 }}>Võ Huân</span>
                              <input
                                type="number"
                                value={ev.rewards.voHuan}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  setEvents((prev) =>
                                    prev.map((item) =>
                                      item.id === ev.id
                                        ? { ...item, rewards: { ...item.rewards, voHuan: val } }
                                        : item
                                    )
                                  );
                                }}
                                className="drop-events-input"
                                style={{ width: "100%", textAlign: "center", color: "#ffd47c" }}
                              />
                            </div>

                            {/* KNB */}
                            <div style={{ padding: 8, borderRadius: 8, background: "rgba(0, 0, 0, 0.4)", border: "1px solid rgba(230, 174, 78, 0.15)" }}>
                              <span style={{ display: "block", fontSize: 11, color: "#8c8277", marginBottom: 3 }}>Nguyên Bảo (KNB)</span>
                              <input
                                type="number"
                                value={ev.rewards.knb}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  setEvents((prev) =>
                                    prev.map((item) =>
                                      item.id === ev.id
                                        ? { ...item, rewards: { ...item.rewards, knb: val } }
                                        : item
                                    )
                                  );
                                }}
                                className="drop-events-input"
                                style={{ width: "100%", textAlign: "center", color: "#ffd47c" }}
                              />
                            </div>

                            {/* Kim Cương */}
                            <div style={{ padding: 8, borderRadius: 8, background: "rgba(0, 0, 0, 0.4)", border: "1px solid rgba(230, 174, 78, 0.15)" }}>
                              <span style={{ display: "block", fontSize: 11, color: "#8c8277", marginBottom: 3 }}>Kim Cương</span>
                              <input
                                type="number"
                                value={ev.rewards.diamond}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  setEvents((prev) =>
                                    prev.map((item) =>
                                      item.id === ev.id
                                        ? { ...item, rewards: { ...item.rewards, diamond: val } }
                                        : item
                                    )
                                  );
                                }}
                                className="drop-events-input"
                                style={{ width: "100%", textAlign: "center", color: "#8bc3ff" }}
                              />
                            </div>

                            {/* Võ Hoàng Tệ */}
                            <div style={{ padding: 8, borderRadius: 8, background: "rgba(0, 0, 0, 0.4)", border: "1px solid rgba(230, 174, 78, 0.15)" }}>
                              <span style={{ display: "block", fontSize: 11, color: "#8c8277", marginBottom: 3 }}>Võ Hoàng Tệ</span>
                              <input
                                type="number"
                                value={ev.rewards.voHoangTe}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  setEvents((prev) =>
                                    prev.map((item) =>
                                      item.id === ev.id
                                        ? { ...item, rewards: { ...item.rewards, voHoangTe: val } }
                                        : item
                                    )
                                  );
                                }}
                                className="drop-events-input"
                                style={{ width: "100%", textAlign: "center", color: "#d9a23a" }}
                              />
                            </div>
                          </div>

                          {/* Secondary Rewards (Thua / Tham gia) if present */}
                          {ev.secondaryRewards && (
                            <div style={{ padding: 10, borderRadius: 8, background: "rgba(0, 0, 0, 0.5)", border: "1px solid rgba(230, 174, 78, 0.15)", marginTop: 4 }}>
                              <span style={{ fontSize: 12, fontWeight: 750, color: "#ffd47c", display: "block", marginBottom: 6 }}>
                                Phần thưởng Thua / Tham gia:
                              </span>
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 8 }}>
                                <div>
                                  <span style={{ display: "block", fontSize: 10, color: "#8c8277", marginBottom: 2 }}>Võ Huân</span>
                                  <input
                                    type="number"
                                    value={ev.secondaryRewards.voHuan}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value) || 0;
                                      setEvents((prev) =>
                                        prev.map((item) =>
                                          item.id === ev.id && item.secondaryRewards
                                            ? { ...item, secondaryRewards: { ...item.secondaryRewards, voHuan: val } }
                                            : item
                                        )
                                      );
                                    }}
                                    className="drop-events-input"
                                    style={{ width: "100%", textAlign: "center" }}
                                  />
                                </div>
                                <div>
                                  <span style={{ display: "block", fontSize: 10, color: "#8c8277", marginBottom: 2 }}>KNB</span>
                                  <input
                                    type="number"
                                    value={ev.secondaryRewards.knb}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value) || 0;
                                      setEvents((prev) =>
                                        prev.map((item) =>
                                          item.id === ev.id && item.secondaryRewards
                                            ? { ...item, secondaryRewards: { ...item.secondaryRewards, knb: val } }
                                            : item
                                        )
                                      );
                                    }}
                                    className="drop-events-input"
                                    style={{ width: "100%", textAlign: "center" }}
                                  />
                                </div>
                                <div>
                                  <span style={{ display: "block", fontSize: 10, color: "#8c8277", marginBottom: 2 }}>Võ Hoàng Tệ</span>
                                  <input
                                    type="number"
                                    value={ev.secondaryRewards.voHoangTe}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value) || 0;
                                      setEvents((prev) =>
                                        prev.map((item) =>
                                          item.id === ev.id && item.secondaryRewards
                                            ? { ...item, secondaryRewards: { ...item.secondaryRewards, voHoangTe: val } }
                                            : item
                                        )
                                      );
                                    }}
                                    className="drop-events-input"
                                    style={{ width: "100%", textAlign: "center" }}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Save Button for this Event */}
                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
                          <button
                            onClick={() => saveEvent(ev)}
                            disabled={saving}
                            className="drop-events-btn-gold"
                          >
                            <Check size={14} /> Lưu Cấu Hình Sự Kiện Này
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* TAB 4: RƯƠNG BÁU, CHÌA KHÓA & HỘP MỞ THƯỞNG (TBL_XWWL_OPEN) */}
      {tab === "boxes" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Quick Select Preset Boxes */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              padding: 16,
              borderRadius: 12,
              background: "rgba(18, 14, 10, 0.95)",
              border: "1px solid rgba(230, 174, 78, 0.25)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Gift size={18} color="#ffd47c" />
                <span style={{ fontSize: 14, fontWeight: 800, color: "#ffd47c" }}>
                  Chọn Hộp Báu / Chìa Khóa Cần Quản Lý:
                </span>
              </div>

              {/* All Boxes Dropdown */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#91887d" }}>Tất cả ({boxesList.length} Hộp):</span>
                <select
                  value={selectedBoxPid}
                  onChange={(e) => setSelectedBoxPid(Number(e.target.value))}
                  className="drop-events-select"
                  style={{ minWidth: 260, fontWeight: 700 }}
                >
                  {boxesList.map((b) => (
                    <option key={b.boxPid} value={b.boxPid} style={{ background: "#1a1612", color: "#f7f3ea" }}>
                      [{b.boxPid}] {b.boxName} ({b.totalItems} món - PP: {b.totalPP.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Level Tier Selection Tabs */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, borderBottom: "1px solid rgba(230, 174, 78, 0.2)", paddingBottom: 10 }}>
              {[
                { id: "11x", label: "🌟 Cấp 11x (110)", count: "6 Hộp" },
                { id: "12x", label: "🌟 Cấp 12x (120)", count: "6 Hộp" },
                { id: "13x", label: "🌟 Cấp 13x (130)", count: "6 Hộp" },
                { id: "14x", label: "🌟 Cấp 14x (140)", count: "6 Hộp" },
                { id: "15x", label: "🌟 Cấp 15x (150)", count: "6 Hộp" },
                { id: "16x", label: "🌟 Cấp 16x (160)", count: "6 Hộp" },
                { id: "17x", label: "🌟 Cấp 17x (170)", count: "6 Hộp" },
                { id: "all42", label: "📦 Tất Cả 42 Hộp Phân Cấp", count: "42 Hộp" },
                { id: "others", label: "🔑 Rương & Khóa Khác", count: "10 Loại" },
              ].map((t) => {
                const isTabActive = boxTierTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setBoxTierTab(t.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 14px",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: isTabActive ? 800 : 600,
                      background: isTabActive
                        ? "linear-gradient(180deg, #f0c35e, #b86e24)"
                        : "rgba(255, 255, 255, 0.04)",
                      color: isTabActive ? "#180f05" : "#ddd5ca",
                      border: isTabActive ? "1px solid #ffd57d" : "1px solid rgba(230, 174, 78, 0.2)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span>{t.label}</span>
                    <span
                      style={{
                        fontSize: 10.5,
                        padding: "1px 6px",
                        borderRadius: 10,
                        background: isTabActive ? "rgba(0,0,0,0.25)" : "rgba(230, 174, 78, 0.15)",
                        color: isTabActive ? "#180f05" : "#ffd47c",
                        fontWeight: 700,
                      }}
                    >
                      {t.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Visual Box Cards Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 10,
              }}
            >
              {(boxTierTab === "all42"
                ? Object.entries(TIER_BOXES_CONFIG)
                    .filter(([k]) => k !== "others")
                    .flatMap(([, v]) => v)
                : TIER_BOXES_CONFIG[boxTierTab] || []
              ).map((box) => {
                const isSelected = selectedBoxPid === box.pid;
                const dbInfo = boxesList.find((b) => b.boxPid === box.pid);
                const itemCount = dbInfo ? dbInfo.totalItems : (box.type === "Bí Tịch" ? 22 : 12);
                const totalPP = dbInfo ? dbInfo.totalPP : 10000;

                return (
                  <div
                    key={box.pid}
                    onClick={() => setSelectedBoxPid(box.pid)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 14px",
                      borderRadius: 10,
                      background: isSelected
                        ? "linear-gradient(135deg, rgba(240, 195, 94, 0.22), rgba(184, 110, 36, 0.12))"
                        : "rgba(28, 23, 18, 0.8)",
                      border: isSelected ? "2px solid #ffd57d" : "1px solid rgba(230, 174, 78, 0.22)",
                      boxShadow: isSelected ? "0 0 14px rgba(255, 212, 124, 0.3)" : "none",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <img
                        src={`/item-icons/${box.pid}.jpg`}
                        alt=""
                        width={50}
                        height={50}
                        style={{
                          borderRadius: 8,
                          objectFit: "contain",
                          background: "rgba(0,0,0,0.6)",
                          border: isSelected ? "2px solid #ffd57d" : "1px solid rgba(230, 174, 78, 0.35)",
                          display: "block",
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/item-icons/1000001051.jpg";
                        }}
                      />
                      {isSelected && (
                        <div
                          style={{
                            position: "absolute",
                            bottom: -4,
                            right: -4,
                            background: "#54dc96",
                            color: "#052010",
                            borderRadius: "50%",
                            width: 16,
                            height: 16,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 10,
                            fontWeight: 900,
                            border: "1px solid #ffffff",
                          }}
                        >
                          ✓
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
                        <span
                          style={{
                            fontSize: 10,
                            padding: "1px 6px",
                            borderRadius: 4,
                            background: `${box.badgeColor}22`,
                            color: box.badgeColor,
                            fontWeight: 800,
                            border: `1px solid ${box.badgeColor}55`,
                          }}
                        >
                          {box.typeBadge}
                        </span>
                        <span style={{ fontSize: 10.5, color: "#91887d", fontFamily: "monospace" }}>
                          #{box.pid}
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: isSelected ? "#ffd47c" : "#f7f3ea",
                          marginTop: 3,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={box.name}
                      >
                        {box.name}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#c8c0b4", marginTop: 2 }}>
                        <span>🎁 <strong>{itemCount}</strong> món</span>
                        <span>•</span>
                        <span>PP: <strong>{totalPP.toLocaleString()}</strong></span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Box Header Info & Ratio Summary */}
          {selectedBoxHeader && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
                padding: 16,
                borderRadius: 12,
                background: "rgba(28, 23, 18, 0.96)",
                border: "1px solid rgba(230, 174, 78, 0.25)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img
                  src={`/item-icons/${selectedBoxHeader.boxPid}.jpg`}
                  alt=""
                  width={44}
                  height={44}
                  style={{ borderRadius: 8, background: "rgba(0,0,0,0.6)", border: "1px solid rgba(230, 174, 78, 0.4)", objectFit: "contain", flexShrink: 0 }}
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
                <div>
                  <span style={{ fontSize: 11, color: "#91887d", textTransform: "uppercase", fontWeight: 700 }}>Đang Chọn Hộp:</span>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#ffd47c", marginTop: 2 }}>
                    {selectedBoxHeader.boxName}
                  </div>
                  <div style={{ fontSize: 12, color: "#c8c0b4", marginTop: 2 }}>
                    PID: <strong style={{ color: "#ffd47c", fontFamily: "monospace" }}>{selectedBoxHeader.boxPid}</strong> | Nhóm: {selectedBoxHeader.category}
                  </div>
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, color: "#91887d", textTransform: "uppercase", fontWeight: 700 }}>Tổng Số Vật Phẩm:</span>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#f7f3ea", marginTop: 2 }}>
                  {boxRewards.length} Món Thưởng
                </div>
                <div style={{ fontSize: 12, color: "#54dc96", marginTop: 2 }}>
                  Đang Bật: {boxRewards.filter((r) => r.isEnabled).length} | Tắt: {boxRewards.filter((r) => !r.isEnabled).length}
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, color: "#91887d", textTransform: "uppercase", fontWeight: 700 }}>Tổng Trọng Số (Total PP):</span>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#ffd47c", marginTop: 2 }}>
                  {selectedBoxHeader.totalPP.toLocaleString()} PP
                </div>
                <div style={{ fontSize: 12, color: "#91887d", marginTop: 2 }}>
                  (100.00% tỉ lệ phân bổ)
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, color: "#91887d", textTransform: "uppercase", fontWeight: 700 }}>Tỉ Lệ Đồ Chân vs Thường:</span>
                <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                  <span style={{ padding: "3px 8px", borderRadius: 6, fontSize: 11.5, fontWeight: 800, background: "rgba(239, 99, 99, 0.2)", color: "#ff8c8c", border: "1px solid rgba(239, 99, 99, 0.4)" }}>
                    🌟 Chân: {(() => {
                      const chanPP = boxRewards.filter((r) => r.isChan).reduce((acc, r) => acc + r.pp, 0);
                      return selectedBoxHeader.totalPP > 0 ? ((chanPP / selectedBoxHeader.totalPP) * 100).toFixed(2) : "0.00";
                    })()}%
                  </span>
                  <span style={{ padding: "3px 8px", borderRadius: 6, fontSize: 11.5, fontWeight: 800, background: "rgba(230, 174, 78, 0.15)", color: "#ffd47c", border: "1px solid rgba(230, 174, 78, 0.3)" }}>
                    ⚔️ Thường: {(() => {
                      const thuongPP = boxRewards.filter((r) => !r.isChan && r.reside2 > 0).reduce((acc, r) => acc + r.pp, 0);
                      return selectedBoxHeader.totalPP > 0 ? ((thuongPP / selectedBoxHeader.totalPP) * 100).toFixed(2) : "0.00";
                    })()}%
                  </span>
                  <span style={{ padding: "3px 8px", borderRadius: 6, fontSize: 11.5, fontWeight: 800, background: "rgba(100, 180, 255, 0.15)", color: "#a5d5ff", border: "1px solid rgba(100, 180, 255, 0.3)" }}>
                    📦 Khác: {(() => {
                      const matPP = boxRewards.filter((r) => r.reside2 === 0 || r.reside2 === 17 || (r.itemPidx >= 909000000 && r.itemPidx <= 909000099)).reduce((acc, r) => acc + r.pp, 0);
                      return selectedBoxHeader.totalPP > 0 ? ((matPP / selectedBoxHeader.totalPP) * 100).toFixed(2) : "0.00";
                    })()}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Search, Filter & Action Toolbar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 10,
              padding: 12,
              borderRadius: 10,
              background: "rgba(18, 14, 10, 0.88)",
              border: "1px solid rgba(230, 174, 78, 0.2)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {/* Search */}
              <div style={{ position: "relative", minWidth: 190 }}>
                <Search size={14} color="#91887d" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  placeholder="Tìm tên, phái hoặc PID..."
                  value={boxSearch}
                  onChange={(e) => setBoxSearch(e.target.value)}
                  className="drop-events-input"
                  style={{ paddingLeft: 30, width: "100%", fontSize: 12 }}
                />
              </div>

              {/* Quality / Type Filter */}
              <select
                value={boxTypeFilter}
                onChange={(e) => setBoxTypeFilter(e.target.value)}
                className="drop-events-select"
                style={{ fontSize: 12 }}
              >
                <option value="all">Tất Cả Phẩm Chất</option>
                <option value="thuong">⚔️ Chỉ Đồ Thường (15.00%)</option>
                <option value="chan">🌟 Chỉ Đồ Chân (1.00%)</option>
                <option value="vohuan">👑 Đồ Võ Huân (Đã Tắt - 0%)</option>
                <option value="test">⚠️ Đồ Mô Phỏng / Test (Đã Tắt - 0%)</option>
              </select>

              {/* Job Filter */}
              <select
                value={boxJobFilter}
                onChange={(e) => setBoxJobFilter(e.target.value)}
                className="drop-events-select"
                style={{ fontSize: 12 }}
              >
                <option value="all">Tất Cả Nghề / Phái</option>
                <option value="Đao">🗡️ Đao Khách</option>
                <option value="Kiếm">⚔️ Kiếm Khách</option>
                <option value="Thương">🔱 Thương Khách</option>
                <option value="Cung">🏹 Cung Thủ</option>
                <option value="Đại Phu">💊 Đại Phu</option>
                <option value="Thích Khách">🥷 Thích Khách</option>
                <option value="Cầm Sư">🪕 Cầm Sư / Nhạc Công</option>
                <option value="Hàn Bảo Quân">🔥 Hàn Bảo Quân</option>
                <option value="Đàm Hoa Liên">🌸 Đàm Hoa Liên</option>
                <option value="Quyền Sư">🥊 Quyền Sư / Đấu Sĩ</option>
                <option value="Mai Liễu Chân">🏹 Mai Liễu Chân</option>
                <option value="Tử Hào">🔱 Tử Hào</option>
                <option value="Thần Nữ">🪭 Đông Lăng Thần Nữ</option>
                <option value="Lư Phong Lang">🔱 Lư Phong Lang</option>
                <option value="Chung">🌐 Dùng Chung (Tất Cả)</option>
              </select>

              {/* Gender Filter */}
              <select
                value={boxGenderFilter}
                onChange={(e) => setBoxGenderFilter(e.target.value)}
                className="drop-events-select"
                style={{ fontSize: 12 }}
              >
                <option value="all">Tất Cả Giới Tính</option>
                <option value="Nam">♂️ Nam</option>
                <option value="Nữ">♀️ Nữ</option>
                <option value="Chung">⚧️ Nam / Nữ Chung</option>
              </select>

              {/* Alignment Filter */}
              <select
                value={boxAlignmentFilter}
                onChange={(e) => setBoxAlignmentFilter(e.target.value)}
                className="drop-events-select"
                style={{ fontSize: 12 }}
              >
                <option value="all">Tất Cả Thế Lực</option>
                <option value="Chính">⚪ Chính Phái</option>
                <option value="Tà">⚫ Tà Phái</option>
                <option value="Chung">🌐 Chính / Tà Chung</option>
              </select>

              {/* Category Filter */}
              <select
                value={boxCategoryFilter}
                onChange={(e) => setBoxCategoryFilter(e.target.value)}
                className="drop-events-select"
                style={{ fontSize: 12 }}
              >
                <option value="all">Tất Cả Loại Món</option>
                <option value="vukhi">🗡️ Vũ Khí</option>
                <option value="ao">🥋 Y Phục (Áo)</option>
                <option value="hothu">🥊 Hộ Thủ</option>
                <option value="chienung">👢 Chiến Ủng (Hài)</option>
                <option value="noigiap">🛡️ Nội Giáp</option>
                <option value="trangsuc">💍 Trang Sức</option>
                <option value="pet">🐾 Linh Thú & Pet</option>
                <option value="phu">📜 Phù / Bùa</option>
                <option value="tien">🪙 Tiền Tệ / Võ Hoàng / Exp / Coin</option>
              </select>

              {/* Status Filter */}
              <select
                value={boxStatusFilter}
                onChange={(e) => setBoxStatusFilter(e.target.value)}
                className="drop-events-select"
                style={{ fontSize: 12 }}
              >
                <option value="all">Tất Cả Trạng Thái</option>
                <option value="enabled">🟢 Đang Bật (PP &gt; 0)</option>
                <option value="disabled">🔴 Đang Tắt (PP = 0)</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                type="button"
                onClick={() => fetchBoxDetail(selectedBoxPid)}
                disabled={boxLoading}
                className="drop-events-btn-dark"
                title="Tải lại dữ liệu hộp từ database"
              >
                <RefreshCw size={13} className={boxLoading ? "spinning" : ""} /> Tải Lại
              </button>

              <button
                type="button"
                onClick={() => {
                  setAddBoxPidx(100200300);
                  setAddBoxItemName("");
                  setAddBoxQty(1);
                  setAddBoxPP(100);
                  setAddBoxM1(0);
                  setAddBoxM2(0);
                  setAddBoxM3(0);
                  setAddBoxM4(0);
                  setAddBoxM5(0);
                  setAddBoxLocked(0);
                  setAddBoxDays(0);
                  setAddBoxBroadcast(0);
                  setShowAddBoxModal(true);
                }}
                className="drop-events-btn-gold"
              >
                <Plus size={14} /> Thêm Món Vào Hộp
              </button>
            </div>
          </div>

          {/* Bulk Action Bar (When selected) */}
          {selectedBoxIndexes.size > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 10,
                padding: "10px 16px",
                borderRadius: 8,
                background: "rgba(230, 174, 78, 0.12)",
                border: "1px solid rgba(230, 174, 78, 0.4)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#ffd47c" }}>
                <span>Đã chọn: <strong>{selectedBoxIndexes.size}</strong> vật phẩm</span>
                <button
                  type="button"
                  onClick={() => setSelectedBoxIndexes(new Set())}
                  style={{ background: "none", border: "none", color: "#c8c0b4", textDecoration: "underline", cursor: "pointer", fontSize: 11.5 }}
                >
                  Bỏ chọn tất cả
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                {/* Bulk PP Set */}
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <input
                    type="number"
                    placeholder="Nhập PP..."
                    value={bulkBoxPP}
                    onChange={(e) => setBulkBoxPP(e.target.value)}
                    className="drop-events-input"
                    style={{ width: 90, fontSize: 12, padding: "4px 8px" }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const v = parseInt(bulkBoxPP);
                      if (!isNaN(v) && v >= 0) {
                        handleBulkUpdateBoxRewards({ setPP: v });
                        setBulkBoxPP("");
                      }
                    }}
                    className="drop-events-btn-step"
                    style={{ fontSize: 11.5, padding: "4px 8px" }}
                  >
                    Gán PP
                  </button>
                </div>

                {/* Bulk Enable / Disable */}
                <button
                  type="button"
                  onClick={() => handleBulkUpdateBoxRewards({ setEnabled: true })}
                  className="drop-events-btn-step"
                  style={{ fontSize: 11.5, padding: "4px 8px", color: "#54dc96", borderColor: "rgba(84, 220, 150, 0.3)" }}
                >
                  🟢 Bật Tất Cả
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkUpdateBoxRewards({ setEnabled: false })}
                  className="drop-events-btn-step"
                  style={{ fontSize: 11.5, padding: "4px 8px", color: "#ff8c8c", borderColor: "rgba(255, 140, 140, 0.3)" }}
                >
                  🔴 Tắt Tất Cả (PP=0)
                </button>

                {/* Bulk Lock */}
                <button
                  type="button"
                  onClick={() => handleBulkUpdateBoxRewards({ setLocked: 1 })}
                  className="drop-events-btn-step"
                  style={{ fontSize: 11.5, padding: "4px 8px" }}
                >
                  🔒 Khóa Đồ
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkUpdateBoxRewards({ setLocked: 0 })}
                  className="drop-events-btn-step"
                  style={{ fontSize: 11.5, padding: "4px 8px" }}
                >
                  🔓 Mở Khóa
                </button>
              </div>
            </div>
          )}

          {/* Reward Items Table */}
          <div
            style={{
              overflowX: "auto",
              borderRadius: 12,
              border: "1px solid rgba(230, 174, 78, 0.2)",
              background: "rgba(18, 14, 10, 0.95)",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "rgba(255, 255, 255, 0.04)", borderBottom: "1px solid rgba(230, 174, 78, 0.2)", color: "#ffd47c", fontWeight: 750 }}>
                  <th style={{ padding: "10px 10px", width: 35, textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={filteredBoxRewards.length > 0 && filteredBoxRewards.every((r) => selectedBoxIndexes.has(r.index))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedBoxIndexes(new Set(filteredBoxRewards.map((r) => r.index)));
                        } else {
                          setSelectedBoxIndexes(new Set());
                        }
                      }}
                      style={{ cursor: "pointer" }}
                    />
                  </th>
                  <th style={{ padding: "10px 10px", width: 85 }}>PID</th>
                  <th style={{ padding: "10px 10px", minWidth: 200 }}>Tên Vật Phẩm</th>
                  <th style={{ padding: "10px 10px", width: 100 }}>Phái / Nghề</th>
                  <th style={{ padding: "10px 10px", width: 75 }}>Giới Tính</th>
                  <th style={{ padding: "10px 10px", width: 85 }}>Thế Lực</th>
                  <th style={{ padding: "10px 10px", width: 120 }}>Phân Loại & Note</th>
                  <th style={{ padding: "10px 10px", width: 165 }}>Trọng Số (PP)</th>
                  <th style={{ padding: "10px 10px", width: 85 }}>Tỉ Lệ (%)</th>
                  <th style={{ padding: "10px 10px", width: 95 }}>Thuộc Tính</th>
                  <th style={{ padding: "10px 10px", width: 95 }}>Khóa / Hạn</th>
                  <th style={{ padding: "10px 10px", width: 75, textAlign: "center" }}>Bật/Tắt</th>
                  <th style={{ padding: "10px 10px", width: 45, textAlign: "center" }}>Xóa</th>
                </tr>
              </thead>
              <tbody>
                {boxLoading ? (
                  <tr>
                    <td colSpan={13} style={{ padding: 40, textAlign: "center", color: "#ffd47c" }}>
                      <RefreshCw size={24} className="spinning" style={{ marginBottom: 8 }} />
                      <div>Đang tải dữ liệu vật phẩm trong Hộp...</div>
                    </td>
                  </tr>
                ) : filteredBoxRewards.length === 0 ? (
                  <tr>
                    <td colSpan={13} style={{ padding: 30, textAlign: "center", color: "#91887d" }}>
                      Không có vật phẩm nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredBoxRewards.map((item) => {
                    const isSelected = selectedBoxIndexes.has(item.index);
                    const currentEditingPP = editingBoxPP[item.index] ?? String(item.pp);
                    const isPPChanged = parseInt(currentEditingPP) !== item.pp;

                    return (
                      <tr
                        key={item.index}
                        style={{
                          borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                          background: !item.isEnabled
                            ? "rgba(40, 15, 15, 0.3)"
                            : isSelected
                            ? "rgba(230, 174, 78, 0.08)"
                            : "transparent",
                          opacity: item.isEnabled ? 1 : 0.65,
                          transition: "background 0.15s ease",
                        }}
                      >
                        {/* Checkbox */}
                        <td style={{ padding: "8px 10px", textAlign: "center" }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const s = new Set(selectedBoxIndexes);
                              if (e.target.checked) s.add(item.index);
                              else s.delete(item.index);
                              setSelectedBoxIndexes(s);
                            }}
                            style={{ cursor: "pointer" }}
                          />
                        </td>

                        {/* PID */}
                        <td style={{ padding: "8px 10px", fontFamily: "monospace", color: "#ffd47c", fontWeight: 700 }}>
                          {item.itemPidx}
                        </td>

                        {/* Item Name */}
                        <td style={{ padding: "8px 10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <img
                              src={`/item-icons/${item.itemPidx}.jpg`}
                              alt=""
                              width={28}
                              height={28}
                              style={{ borderRadius: 5, background: "rgba(0,0,0,0.5)", border: "1px solid rgba(230, 174, 78, 0.3)", objectFit: "contain", flexShrink: 0 }}
                              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                            />
                            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                              <span style={{ fontWeight: 700, color: item.isVoHuan ? "#e6ae4e" : item.isChan ? "#ff8c8c" : "#f7f3ea" }}>
                                {item.itemName}
                              </span>
                              {item.quantity > 1 && (
                                <span style={{ padding: "1px 5px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: "rgba(255,255,255,0.1)", color: "#ffd47c" }}>
                                  x{item.quantity}
                                </span>
                              )}
                              {item.level > 0 && (
                                <span style={{ padding: "1px 5px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: "rgba(100, 180, 255, 0.15)", color: "#a5d5ff" }}>
                                  Lv.{item.level}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Job / Phái */}
                        <td style={{ padding: "8px 10px" }}>
                          <span
                            style={{
                              padding: "2px 6px",
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 700,
                              background: item.jobName === "Chung" ? "rgba(255, 255, 255, 0.05)" : "rgba(230, 174, 78, 0.15)",
                              color: item.jobName === "Chung" ? "#91887d" : "#ffd47c",
                              border: item.jobName === "Chung" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(230, 174, 78, 0.3)",
                            }}
                          >
                            {item.jobName}
                          </span>
                        </td>

                        {/* Gender */}
                        <td style={{ padding: "8px 10px" }}>
                          <span
                            style={{
                              padding: "2px 6px",
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 700,
                              background: item.genderName === "Nam" ? "rgba(70, 150, 255, 0.15)" : item.genderName === "Nữ" ? "rgba(255, 120, 180, 0.15)" : "rgba(255, 255, 255, 0.05)",
                              color: item.genderName === "Nam" ? "#8ac4ff" : item.genderName === "Nữ" ? "#ffb0d0" : "#91887d",
                            }}
                          >
                            {item.genderName}
                          </span>
                        </td>

                        {/* Alignment */}
                        <td style={{ padding: "8px 10px" }}>
                          <span
                            style={{
                              padding: "2px 6px",
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 700,
                              background: item.alignmentName === "Chính" ? "rgba(84, 220, 150, 0.15)" : item.alignmentName === "Tà" ? "rgba(239, 99, 99, 0.15)" : "rgba(255, 255, 255, 0.05)",
                              color: item.alignmentName === "Chính" ? "#54dc96" : item.alignmentName === "Tà" ? "#ff8c8c" : "#91887d",
                            }}
                          >
                            {item.alignmentName}
                          </span>
                        </td>

                        {/* Category & Võ Huân / Chân Note */}
                        <td style={{ padding: "8px 10px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            {item.isTestItem ? (
                              <span
                                style={{
                                  padding: "2px 6px",
                                  borderRadius: 4,
                                  fontSize: 10,
                                  fontWeight: 800,
                                  background: "rgba(160, 100, 255, 0.2)",
                                  color: "#d0b0ff",
                                  border: "1px solid rgba(160, 100, 255, 0.4)",
                                  display: "inline-block",
                                  width: "fit-content",
                                }}
                              >
                                ⚠️ MÔ PHỎNG / TEST
                              </span>
                            ) : item.isVoHuan ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                <span
                                  style={{
                                    padding: "2px 6px",
                                    borderRadius: 4,
                                    fontSize: 10,
                                    fontWeight: 800,
                                    background: "rgba(255, 180, 50, 0.15)",
                                    color: "#ffd47c",
                                    border: "1px solid rgba(255, 180, 50, 0.4)",
                                    display: "inline-block",
                                    width: "fit-content",
                                  }}
                                >
                                  👑 VÕ HUÂN
                                </span>
                                {item.fightExp > 0 && (
                                  <span style={{ fontSize: 9.5, color: "#e6ae4e" }}>
                                    {item.fightExp.toLocaleString()} VH
                                  </span>
                                )}
                              </div>
                            ) : item.isChan ? (
                              <span
                                style={{
                                  padding: "2px 6px",
                                  borderRadius: 4,
                                  fontSize: 10,
                                  fontWeight: 800,
                                  background: "rgba(239, 99, 99, 0.2)",
                                  color: "#ff8c8c",
                                  border: "1px solid rgba(239, 99, 99, 0.4)",
                                  display: "inline-block",
                                  width: "fit-content",
                                }}
                              >
                                🌟 ĐỒ CHÂN
                              </span>
                            ) : (
                              <span
                                style={{
                                  padding: "2px 6px",
                                  borderRadius: 4,
                                  fontSize: 10,
                                  fontWeight: 700,
                                  background: "rgba(255, 255, 255, 0.05)",
                                  color: "#c8c0b4",
                                  display: "inline-block",
                                  width: "fit-content",
                                }}
                              >
                                ⚔️ ĐỒ THƯỜNG
                              </span>
                            )}
                            <span style={{ fontSize: 10, color: "#8c8277" }}>
                              {item.category.replace(" [Võ Huân]", "").replace(" [Chân]", "").replace(" [Mô Phỏng]", "")}
                            </span>
                          </div>
                        </td>

                        {/* PP Editor */}
                        <td style={{ padding: "8px 10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                            <input
                              type="number"
                              value={currentEditingPP}
                              onChange={(e) => setEditingBoxPP({ ...editingBoxPP, [item.index]: e.target.value })}
                              className="drop-events-input"
                              style={{
                                width: 65,
                                textAlign: "center",
                                fontWeight: 750,
                                fontSize: 11.5,
                                padding: "2px 4px",
                                color: item.isEnabled ? "#ffd47c" : "#8c8277",
                              }}
                            />
                            {/* Step Buttons */}
                            <button
                              type="button"
                              onClick={() => {
                                const cur = parseInt(currentEditingPP) || 0;
                                setEditingBoxPP({ ...editingBoxPP, [item.index]: String(Math.max(0, cur - 10)) });
                              }}
                              className="drop-events-btn-step"
                              style={{ padding: "2px 4px", fontSize: 9.5 }}
                            >
                              -10
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const cur = parseInt(currentEditingPP) || 0;
                                setEditingBoxPP({ ...editingBoxPP, [item.index]: String(cur + 10) });
                              }}
                              className="drop-events-btn-step"
                              style={{ padding: "2px 4px", fontSize: 9.5 }}
                            >
                              +10
                            </button>
                            {isPPChanged && (
                              <button
                                type="button"
                                onClick={() => handleUpdateBoxReward(item.index, { pp: parseInt(currentEditingPP) || 0 })}
                                className="drop-events-btn-gold"
                                style={{ padding: "2px 5px", fontSize: 10.5 }}
                                title="Lưu trọng số này"
                              >
                                Lưu
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Percentage */}
                        <td style={{ padding: "8px 10px" }}>
                          <span
                            style={{
                              padding: "2px 6px",
                              borderRadius: 4,
                              fontWeight: 800,
                              fontSize: 11.5,
                              background: item.percentage >= 5 ? "rgba(84, 220, 150, 0.15)" : item.percentage >= 1 ? "rgba(230, 174, 78, 0.15)" : "rgba(255, 255, 255, 0.05)",
                              color: item.percentage >= 5 ? "#54dc96" : item.percentage >= 1 ? "#ffd47c" : "#c8c0b4",
                              border: item.percentage >= 5 ? "1px solid rgba(84, 220, 150, 0.3)" : item.percentage >= 1 ? "1px solid rgba(230, 174, 78, 0.3)" : "1px solid rgba(255, 255, 255, 0.08)",
                            }}
                          >
                            {item.percentage.toFixed(2)}%
                          </span>
                        </td>

                        {/* Properties (Enchant/Fusion) */}
                        <td style={{ padding: "8px 10px", color: "#c8c0b4", fontSize: 11 }}>
                          {item.magic1 > 0 ? (
                            <span style={{ color: "#ffd47c", fontWeight: 700 }}>CH+{item.magic1}</span>
                          ) : (
                            <span style={{ color: "#8c8277" }}>Mặc định</span>
                          )}
                        </td>

                        {/* Lock / Expiration */}
                        <td style={{ padding: "8px 10px", fontSize: 11 }}>
                          <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                            {item.isLocked === 1 ? (
                              <span style={{ padding: "1px 4px", borderRadius: 3, background: "rgba(255, 100, 100, 0.15)", color: "#ff8c8c", fontSize: 10, fontWeight: 700 }}>
                                🔒 Khóa
                              </span>
                            ) : (
                              <span style={{ color: "#8c8277" }}>Mở</span>
                            )}
                            {item.days > 0 ? (
                              <span style={{ padding: "1px 4px", borderRadius: 3, background: "rgba(230, 174, 78, 0.15)", color: "#ffd47c", fontSize: 10, fontWeight: 700 }}>
                                {item.days}d
                              </span>
                            ) : null}
                          </div>
                        </td>

                        {/* Enable/Disable Toggle */}
                        <td style={{ padding: "8px 10px", textAlign: "center" }}>
                          <button
                            type="button"
                            onClick={() => handleToggleBoxReward(item)}
                            style={{
                              padding: "3px 8px",
                              borderRadius: 5,
                              fontSize: 11,
                              fontWeight: 800,
                              cursor: "pointer",
                              border: item.isEnabled ? "1px solid rgba(84, 220, 150, 0.4)" : "1px solid rgba(239, 99, 99, 0.4)",
                              background: item.isEnabled ? "rgba(84, 220, 150, 0.15)" : "rgba(239, 99, 99, 0.15)",
                              color: item.isEnabled ? "#54dc96" : "#ff8c8c",
                              transition: "all 0.15s ease",
                            }}
                            title={item.isEnabled ? "Bấm để TẮT món này (PP=0)" : "Bấm để BẬT món này"}
                          >
                            {item.isEnabled ? "BẬT" : "TẮT"}
                          </button>
                        </td>

                        {/* Delete Button */}
                        <td style={{ padding: "8px 10px", textAlign: "center" }}>
                          <button
                            type="button"
                            onClick={() => handleDeleteBoxReward(item.index, item.itemName)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#8c8277",
                              cursor: "pointer",
                              padding: 3,
                            }}
                            title="Xóa món này khỏi Hộp"
                          >
                            <Trash2 size={14} color="#ef6363" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: THÊM MÓN RƠI MỚI VÀO TBL_XWWL_DROP */}
      {showAddModal && (
        <div className="drop-events-modal-backdrop">
          <div className="drop-events-modal-box">
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#ffd47c", display: "flex", alignItems: "center", gap: 8 }}>
              <Plus size={18} color="#54dc96" /> Thêm Vật Phẩm Rơi Vào Bãi Train
            </h3>
            <p style={{ margin: 0, fontSize: 12.5, color: "#8c8277" }}>
              Thêm trực tiếp vào cơ sở dữ liệu <strong style={{ color: "#ffd47c", fontFamily: "monospace" }}>24pub.dbo.TBL_XWWL_DROP</strong>.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <span style={{ display: "block", color: "#ddd5ca", fontWeight: 700, marginBottom: 4 }}>Cấp Quái Tối Thiểu</span>
                  <input
                    type="number"
                    value={addLvlMin}
                    onChange={(e) => setAddLvlMin(parseInt(e.target.value) || 1)}
                    className="drop-events-input"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <span style={{ display: "block", color: "#ddd5ca", fontWeight: 700, marginBottom: 4 }}>Cấp Quái Tối Đa</span>
                  <input
                    type="number"
                    value={addLvlMax}
                    onChange={(e) => setAddLvlMax(parseInt(e.target.value) || 79)}
                    className="drop-events-input"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div>
                <span style={{ display: "block", color: "#ddd5ca", fontWeight: 700, marginBottom: 4 }}>Mã Vật Phẩm (Item PID)</span>
                <input
                  type="number"
                  value={addPid}
                  onChange={(e) => setAddPid(parseInt(e.target.value) || 0)}
                  placeholder="Ví dụ: 900000401 (Bảo Thạch Danh Hiệu), 800000001 (KCT)..."
                  className="drop-events-input"
                  style={{ width: "100%" }}
                />
                {/* Quick Presets for Event Items */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                  {[
                    { label: "💎 Bảo Thạch Danh Hiệu (900000401)", pid: 900000401, min: 35, max: 500, pp: 50 },
                    { label: "🎁 Túi 800 Bảo Thạch (1008000531)", pid: 1008000531, min: 100, max: 500, pp: 5 },
                    { label: "🪙 Túi VHT 500 (909000034)", pid: 909000034, min: 60, max: 500, pp: 100 },
                    { label: "🪙 Túi VHT 1.000 (909000035)", pid: 909000035, min: 80, max: 500, pp: 80 },
                    { label: "🪙 Túi VHT 3.000 (909000037)", pid: 909000037, min: 100, max: 500, pp: 50 },
                    { label: "🪙 Túi VHT 5.000 (909000038)", pid: 909000038, min: 120, max: 500, pp: 30 },
                    { label: "👑 Bát Bảo VHT 10K (909000036)", pid: 909000036, min: 130, max: 500, pp: 10 },
                    { label: "📜 Thẻ Võ Huân 10K (909000031)", pid: 909000031, min: 80, max: 500, pp: 50 },
                    { label: "📜 Thẻ Võ Huân 50K (909000033)", pid: 909000033, min: 120, max: 500, pp: 10 },
                  ].map((preset) => (
                    <button
                      key={preset.pid}
                      type="button"
                      onClick={() => {
                        setAddPid(preset.pid);
                        setAddLvlMin(preset.min);
                        setAddLvlMax(preset.max);
                        setAddPP(preset.pp);
                      }}
                      className="drop-events-btn-step"
                      style={{
                        fontSize: 11,
                        padding: "3px 8px",
                        background: addPid === preset.pid ? "rgba(230, 174, 78, 0.3)" : "rgba(255, 255, 255, 0.04)",
                        borderColor: addPid === preset.pid ? "#ffd47c" : "rgba(230, 174, 78, 0.2)",
                        color: addPid === preset.pid ? "#ffd47c" : "#c8c0b4",
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <span style={{ display: "block", color: "#ddd5ca", fontWeight: 700, marginBottom: 4 }}>Trọng Số Rơi (FLD_PP)</span>
                  <input
                    type="number"
                    value={addPP}
                    onChange={(e) => setAddPP(parseInt(e.target.value) || 100)}
                    placeholder="100 - 4000..."
                    className="drop-events-input"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <span style={{ display: "block", color: "#ddd5ca", fontWeight: 700, marginBottom: 4 }}>Giới Hạn Ngày (0: Vô hạn)</span>
                  <input
                    type="number"
                    value={addMaxQ}
                    onChange={(e) => setAddMaxQ(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="drop-events-input"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, paddingTop: 10, borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <button
                onClick={() => setShowAddModal(false)}
                className="drop-events-btn-dark"
              >
                Hủy
              </button>
              <button
                onClick={handleAddDrop}
                className="drop-events-btn-gold"
              >
                Xác Nhận Thêm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: THÊM MÓN MỚI VÀO HỘP BÁU (TBL_XWWL_OPEN) */}
      {showAddBoxModal && (
        <div className="drop-events-modal-backdrop">
          <div className="drop-events-modal-box" style={{ maxWidth: 540 }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#ffd47c", display: "flex", alignItems: "center", gap: 8 }}>
              <Plus size={18} color="#54dc96" /> Thêm Món Vào Hộp: {selectedBoxHeader?.boxName || selectedBoxPid}
            </h3>
            <p style={{ margin: 0, fontSize: 12.5, color: "#8c8277" }}>
              Thêm trực tiếp vào cơ sở dữ liệu <strong style={{ color: "#ffd47c", fontFamily: "monospace" }}>24pub.dbo.TBL_XWWL_OPEN</strong> (Hộp PID: {selectedBoxPid}).
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
              {/* PID & Name */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <span style={{ display: "block", color: "#ddd5ca", fontWeight: 700, marginBottom: 4 }}>PID Vật Phẩm</span>
                  <input
                    type="number"
                    value={addBoxPidx}
                    onChange={(e) => setAddBoxPidx(parseInt(e.target.value) || 0)}
                    className="drop-events-input"
                    style={{ width: "100%", fontFamily: "monospace", color: "#ffd47c" }}
                  />
                </div>
                <div>
                  <span style={{ display: "block", color: "#ddd5ca", fontWeight: 700, marginBottom: 4 }}>Tên Hiển Thị (Tùy chọn)</span>
                  <input
                    type="text"
                    placeholder="Để trống lấy theo DB..."
                    value={addBoxItemName}
                    onChange={(e) => setAddBoxItemName(e.target.value)}
                    className="drop-events-input"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              {/* Presets */}
              <div>
                <span style={{ display: "block", color: "#8c8277", fontSize: 11, marginBottom: 4 }}>Chọn nhanh trang bị / vật phẩm mẫu:</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {[
                    { label: "🗡️ Đao 160 (100200325)", pid: 100200325, pp: 100 },
                    { label: "🥋 Áo 160 (500303037)", pid: 500303037, pp: 100 },
                    { label: "🥊 Hộ Thủ 160 (100503037)", pid: 100503037, pp: 100 },
                    { label: "👢 Giày 160 (100803037)", pid: 100803037, pp: 100 },
                    { label: "🛡️ Giáp 160 (100403038)", pid: 100403038, pp: 100 },
                    { label: "💍 Dây Chuyền 160 (100032)", pid: 100032, pp: 50 },
                    { label: "💍 Nhẫn 160 (700034)", pid: 700034, pp: 50 },
                    { label: "💍 Bông Tai 160 (29)", pid: 29, pp: 50 },
                    { label: "🪙 Túi VHT 10K (909000036)", pid: 909000036, pp: 200 },
                    { label: "🐾 Gấu Trúc (1000002004)", pid: 1000002004, pp: 100 },
                    { label: "🐾 Huyết Long (1000001383)", pid: 1000001383, pp: 50 },
                  ].map((preset) => (
                    <button
                      key={preset.pid}
                      type="button"
                      onClick={() => {
                        setAddBoxPidx(preset.pid);
                        setAddBoxPP(preset.pp);
                      }}
                      className="drop-events-btn-step"
                      style={{
                        fontSize: 11,
                        padding: "3px 8px",
                        background: addBoxPidx === preset.pid ? "rgba(230, 174, 78, 0.3)" : "rgba(255, 255, 255, 0.04)",
                        borderColor: addBoxPidx === preset.pid ? "#ffd47c" : "rgba(230, 174, 78, 0.2)",
                        color: addBoxPidx === preset.pid ? "#ffd47c" : "#c8c0b4",
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity & PP */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <span style={{ display: "block", color: "#ddd5ca", fontWeight: 700, marginBottom: 4 }}>Số Lượng (FLD_NUMBER)</span>
                  <input
                    type="number"
                    value={addBoxQty}
                    onChange={(e) => setAddBoxQty(parseInt(e.target.value) || 1)}
                    className="drop-events-input"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <span style={{ display: "block", color: "#ddd5ca", fontWeight: 700, marginBottom: 4 }}>Trọng Số (FLD_PP)</span>
                  <input
                    type="number"
                    value={addBoxPP}
                    onChange={(e) => setAddBoxPP(parseInt(e.target.value) || 100)}
                    placeholder="10 - 2000..."
                    className="drop-events-input"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              {/* Lock & Expiration */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <span style={{ display: "block", color: "#ddd5ca", fontWeight: 700, marginBottom: 4 }}>Khóa Vật Phẩm (FLD_BD)</span>
                  <select
                    value={addBoxLocked}
                    onChange={(e) => setAddBoxLocked(parseInt(e.target.value) || 0)}
                    className="drop-events-select"
                    style={{ width: "100%" }}
                  >
                    <option value={0}>0: Không Khóa (Giao dịch được)</option>
                    <option value={1}>1: Khóa (Không giao dịch / Không vứt)</option>
                  </select>
                </div>
                <div>
                  <span style={{ display: "block", color: "#ddd5ca", fontWeight: 700, marginBottom: 4 }}>Hạn Dùng (FLD_DAYS)</span>
                  <select
                    value={addBoxDays}
                    onChange={(e) => setAddBoxDays(parseInt(e.target.value) || 0)}
                    className="drop-events-select"
                    style={{ width: "100%" }}
                  >
                    <option value={0}>0: Vĩnh Viễn</option>
                    <option value={1}>1 Ngày</option>
                    <option value={7}>7 Ngày</option>
                    <option value={30}>30 Ngày</option>
                  </select>
                </div>
              </div>

              {/* Cường Hóa & Broadcast */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <span style={{ display: "block", color: "#ddd5ca", fontWeight: 700, marginBottom: 4 }}>Cường Hóa (+0..+15)</span>
                  <input
                    type="number"
                    value={addBoxM1}
                    onChange={(e) => setAddBoxM1(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="drop-events-input"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <span style={{ display: "block", color: "#ddd5ca", fontWeight: 700, marginBottom: 4 }}>Loa Toàn Server Khi Mở Trúng</span>
                  <select
                    value={addBoxBroadcast}
                    onChange={(e) => setAddBoxBroadcast(parseInt(e.target.value) || 0)}
                    className="drop-events-select"
                    style={{ width: "100%" }}
                  >
                    <option value={0}>0: Tắt Loa Thông Báo</option>
                    <option value={1}>1: Bật Loa Thông Báo Toàn Server</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, paddingTop: 10, borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <button
                onClick={() => setShowAddBoxModal(false)}
                className="drop-events-btn-dark"
              >
                Hủy
              </button>
              <button
                onClick={handleAddBoxReward}
                className="drop-events-btn-gold"
              >
                Xác Nhận Thêm Vào Hộp
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
