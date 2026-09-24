"use client";

import {
  BadgeCheck,
  BookOpenCheck,
  ChevronDown,
  Clock3,
  History,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Percent,
  Search,
  ShieldCheck,
  TriangleAlert,
  UnlockKeyhole,
  UserRoundPlus,
  UserRoundSearch,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import type { GmItemSnapshot, GmMemberSnapshot } from "@/lib/types";

type Tab = "vip" | "vipConfig" | "quyenKenh" | "pills" | "offline" | "audit";

/** 1 dòng cấu hình VIP có thể sửa — khớp field name bên `app/api/gm/vip-config/route.ts`. */
type VipConfigField = {
  key:
    | "vipExpPercent"
    | "vipMoneyPercent"
    | "vipTrainingPercent"
    | "vipCritRateBonus"
    | "vipSynthesisPercent"
    | "checkinCashReward"
    | "checkinHonorReward";
  label: string;
  hint: string;
  danger: boolean;
  min: number;
  max: number;
  step: number;
};

/**
 * Toàn bộ ưu đãi VIP có code thật trong GameServer (đọc từ SRCGameServerV24B, không đoán).
 * 4 dòng đầu là HỆ SỐ NHÂN THẲNG (num *= giá_trị) — để đúng 0 sẽ xóa sạch phần thưởng của VIP
 * thay vì tăng thêm, nên min chặn ở 0.01 và luôn cảnh báo rõ ngay trên form.
 */
const VIP_CONFIG_FIELDS: VipConfigField[] = [
  {
    key: "vipExpPercent",
    label: "Hệ số EXP khi giết quái",
    hint: "Nhân THẲNG vào EXP giết quái. 1.0 = không đổi, 1.2 = +20%.",
    danger: true,
    min: 0.01,
    max: 5,
    step: 0.01,
  },
  {
    key: "vipMoneyPercent",
    label: "Hệ số tiền rơi khi giết quái",
    hint: "Nhân THẲNG vào tiền rơi. 1.0 = không đổi, 1.2 = +20%.",
    danger: true,
    min: 0.01,
    max: 5,
    step: 0.01,
  },
  {
    key: "vipTrainingPercent",
    label: "Hệ số điểm lịch luyện (rèn luyện)",
    hint: "Nhân THẲNG vào điểm lịch luyện nhận được khi giết quái.",
    danger: true,
    min: 0.01,
    max: 5,
    step: 0.01,
  },
  {
    key: "vipCritRateBonus",
    label: "Hệ số bạo kích hồi máu nhóm (Đại Phu)",
    hint: "Chỉ ảnh hưởng công thức hồi máu nhóm của Đại Phu, nhân THẲNG.",
    danger: true,
    min: 1,
    max: 1000,
    step: 1,
  },
  {
    key: "vipSynthesisPercent",
    label: "Cộng thêm % tỷ lệ hợp thành thành công",
    hint: "CỘNG THẲNG vào % (không nhân) — an toàn để 0, không xóa mất tỷ lệ gốc.",
    danger: false,
    min: 0,
    max: 50,
    step: 0.5,
  },
  {
    key: "checkinCashReward",
    label: "Cash thưởng điểm danh hàng ngày",
    hint: "Chỉ VIP mới nhận được thưởng điểm danh — người không VIP bấm điểm danh không nhận gì.",
    danger: false,
    min: 0,
    max: 100_000_000,
    step: 1,
  },
  {
    key: "checkinHonorReward",
    label: "Võ Huân thưởng điểm danh hàng ngày",
    hint: "Đi kèm Cash điểm danh ở trên — cũng chỉ dành cho VIP.",
    danger: false,
    min: 0,
    max: 100_000_000,
    step: 1,
  },
];
/**
 * Một dòng trong danh sách được phép vào Kênh 2.
 *
 * characterMissing = nhân vật không còn trong TBL_XWWL_Char (đã xóa hoặc đổi tên). Dòng vẫn nằm
 * trong bảng nhưng vô tác dụng vì GameServer so theo tên — phải hiện rõ, im lặng thì Admin tưởng
 * đã cấp mà người kia vẫn bị chặn cửa.
 */
type QuyenEntry = {
  characterName: string;
  accountId: string;
  level: number;
  grantedBy: string;
  note: string | null;
  grantedAt: string;
  online: boolean;
  characterMissing: boolean;
};
type VipEntry = { characterName: string; accountId: string; vip: number; expiresAt: string | null; online: boolean };
type PillEntry = {
  itemId: number;
  name: string;
  type: number;
  description: string;
  magic1: number;
  magic2: number;
  magic3: number;
  magic4: number;
  magic5: number;
  usageCount: number;
  lastUsed: string | null;
};
type CharacterEntry = {
  characterName: string;
  accountId: string;
  level: number;
  job: number;
  faction: number;
  online: boolean;
  locked: boolean;
};
type OfflineSnapshot = GmMemberSnapshot & { locked?: boolean };
type AuditEntry = { time: string; action: string; accountId: string; ip: string; detail: string };

const TABS: Array<{ id: Tab; label: string; icon: typeof BadgeCheck }> = [
  { id: "vip", label: "VIP Name", icon: BadgeCheck },
  { id: "vipConfig", label: "Cấu hình VIP", icon: Percent },
  { id: "quyenKenh", label: "Quyền vào Kênh 2", icon: KeyRound },
  { id: "pills", label: "Pill ID", icon: BookOpenCheck },
  { id: "offline", label: "Nhân vật offline", icon: UserRoundSearch },
  { id: "audit", label: "Lịch sử thao tác", icon: History },
];

type VipConfigSnapshot = {
  kenh: number;
  vipExpPercent: number;
  vipMoneyPercent: number;
  vipTrainingPercent: number;
  vipCritRateBonus: number;
  vipSynthesisPercent: number;
  vipMaps: string;
  vipLineMode: number;
  checkinCashReward: number;
  checkinHonorReward: number;
};

function dateTime(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function ItemThumb({ item }: { item: GmItemSnapshot }) {
  return (
    <span className="ops-item-thumb">
      <img src={`/item-icons/${item.itemId}.jpg`} alt="" onError={(event) => { event.currentTarget.hidden = true; }} />
      <strong>{item.name || `PID ${item.itemId}`}</strong>
      <small>PID {item.itemId} · ô {item.slot}{item.enhancement ? ` · +${item.enhancement}` : ""}</small>
    </span>
  );
}

export default function AdvancedOperations({ onClose }: { onClose?: () => void }) {
  const [tab, setTab] = useState<Tab>("vip");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [query, setQuery] = useState("");
  const [vipEntries, setVipEntries] = useState<VipEntry[]>([]);
  const [pills, setPills] = useState<PillEntry[]>([]);
  const [selectedPill, setSelectedPill] = useState<PillEntry | null>(null);
  const [characters, setCharacters] = useState<CharacterEntry[]>([]);
  const [offlineCharacter, setOfflineCharacter] = useState<OfflineSnapshot | null>(null);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [vipName, setVipName] = useState("");
  const [vipDays, setVipDays] = useState("30");
  const [vipConfirmation, setVipConfirmation] = useState("");
  const [quyenEntries, setQuyenEntries] = useState<QuyenEntry[]>([]);
  const [quyenQuery, setQuyenQuery] = useState("");
  const [quyenNote, setQuyenNote] = useState("");
  const [vipConfig, setVipConfig] = useState<VipConfigSnapshot | null>(null);
  const [vipConfigDrafts, setVipConfigDrafts] = useState<Record<string, string>>({});
  const [vipMapsDraft, setVipMapsDraft] = useState("");
  const [vipLineDraft, setVipLineDraft] = useState(false);

  const load = useCallback(async (resource: Tab, search = "") => {
    // Tab "vipConfig" đi qua route riêng (/api/gm/vip-config, nối GmSupportPipeServer chứ không
    // qua admin-ops/AdminOperationsStore) — có handler loadVipConfig() riêng, bỏ qua ở đây.
    if (resource === "vipConfig") return;
    setLoading(true);
    setNotice(null);
    try {
      const mapped = resource === "offline" ? "characters" : resource;
      const response = await fetch(
        `/api/gm/admin-ops?resource=${mapped}&query=${encodeURIComponent(search)}`,
        { cache: "no-store" },
      );
      const payload = await response.json();
      if (!response.ok || payload.success !== true) throw new Error(payload.message ?? "Không tải được dữ liệu.");
      if (resource === "vip") setVipEntries(payload.entries ?? []);
      if (resource === "pills") {
        setPills(payload.pills ?? []);
        setSelectedPill((payload.pills ?? [])[0] ?? null);
      }
      if (resource === "offline") setCharacters(payload.characters ?? []);
      if (resource === "audit") setAuditEntries(payload.entries ?? []);
      if (resource === "quyenKenh") setQuyenEntries(payload.entries ?? []);
    } catch (error) {
      setNotice({ ok: false, text: error instanceof Error ? error.message : "Không tải được dữ liệu." });
    } finally {
      setLoading(false);
    }
  }, []);

  const loadVipConfig = useCallback(async () => {
    setLoading(true);
    setNotice(null);
    try {
      const response = await fetch("/api/gm/vip-config", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok || payload.success !== true) throw new Error(payload.message ?? "Không tải được cấu hình VIP.");
      const snapshot: VipConfigSnapshot = {
        kenh: payload.kenh ?? 1,
        vipExpPercent: payload.vipExpPercent ?? 0,
        vipMoneyPercent: payload.vipMoneyPercent ?? 0,
        vipTrainingPercent: payload.vipTrainingPercent ?? 0,
        vipCritRateBonus: payload.vipCritRateBonus ?? 0,
        vipSynthesisPercent: payload.vipSynthesisPercent ?? 0,
        vipMaps: payload.vipMaps ?? "",
        vipLineMode: payload.vipLineMode ?? 0,
        checkinCashReward: payload.checkinCashReward ?? 0,
        checkinHonorReward: payload.checkinHonorReward ?? 0,
      };
      setVipConfig(snapshot);
      setVipConfigDrafts({
        vipExpPercent: String(snapshot.vipExpPercent),
        vipMoneyPercent: String(snapshot.vipMoneyPercent),
        vipTrainingPercent: String(snapshot.vipTrainingPercent),
        vipCritRateBonus: String(snapshot.vipCritRateBonus),
        vipSynthesisPercent: String(snapshot.vipSynthesisPercent),
        checkinCashReward: String(snapshot.checkinCashReward),
        checkinHonorReward: String(snapshot.checkinHonorReward),
      });
      setVipMapsDraft(snapshot.vipMaps);
      setVipLineDraft(snapshot.vipLineMode === 1);
    } catch (error) {
      setNotice({ ok: false, text: error instanceof Error ? error.message : "Không tải được cấu hình VIP." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "vipConfig") {
      void loadVipConfig();
      return;
    }
    void load(tab, "");
  }, [tab, load, loadVipConfig]);

  async function saveVipConfig(event: FormEvent) {
    event.preventDefault();
    if (!vipConfig) return;
    const body: Record<string, unknown> = {};
    for (const field of VIP_CONFIG_FIELDS) {
      const raw = vipConfigDrafts[field.key];
      const value = Number(raw);
      if (!Number.isFinite(value) || value === vipConfig[field.key]) continue;
      body[field.key] = value;
    }
    if (vipMapsDraft !== vipConfig.vipMaps) body.vipMaps = vipMapsDraft;
    const nextLineMode = vipLineDraft ? 1 : 0;
    if (nextLineMode !== vipConfig.vipLineMode) body.vipLineMode = nextLineMode;
    if (Object.keys(body).length === 0) {
      setNotice({ ok: true, text: "Không có thay đổi nào để lưu." });
      return;
    }
    setLoading(true);
    setNotice(null);
    try {
      const response = await fetch("/api/gm/vip-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json();
      if (!response.ok || payload.success !== true) throw new Error(payload.message ?? "Lưu cấu hình VIP thất bại.");
      setNotice({ ok: true, text: (payload.message ?? "Đã lưu cấu hình VIP.") + " (áp dụng cả Kênh 1 và Kênh 2)" });
      await loadVipConfig();
    } catch (error) {
      setNotice({ ok: false, text: error instanceof Error ? error.message : "Lưu cấu hình VIP thất bại." });
    } finally {
      setLoading(false);
    }
  }

  async function mutate(body: Record<string, unknown>) {
    setLoading(true);
    setNotice(null);
    try {
      const response = await fetch("/api/gm/admin-ops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json();
      if (!response.ok || payload.success !== true) throw new Error(payload.message ?? "Thao tác thất bại.");
      setNotice({ ok: true, text: payload.message ?? "Thao tác thành công." });
      await load(tab, query);
      return true;
    } catch (error) {
      setNotice({ ok: false, text: error instanceof Error ? error.message : "Thao tác thất bại." });
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function setVip(event: FormEvent) {
    event.preventDefault();
    const days = Number(vipDays);
    const ok = await mutate({
      action: "setVip",
      characterName: vipName,
      days,
      confirmation: vipConfirmation,
    });
    if (ok) {
      setVipName("");
      setVipConfirmation("");
    }
  }

  async function revokeVip(entry: VipEntry) {
    const confirmation = window.prompt(`Nhập chính xác ${entry.characterName} để xóa VIP Name:`) ?? "";
    if (confirmation !== entry.characterName) return;
    await mutate({ action: "revokeVip", characterName: entry.characterName, confirmation });
  }

  /**
   * Tìm nhân vật để cấp quyền vào Kênh 2.
   *
   * Dùng chung nguồn "offline/characters" với tab Nhân vật offline vì đó đúng là danh sách mọi
   * nhân vật có trong database — Admin yêu cầu "chọn nhân vật đã có trên hệ thống". Có ô tìm riêng
   * chứ không dùng ô tìm chung ở trên: ở tab này ô tìm phải lọc DANH SÁCH ỨNG VIÊN, còn ô chung
   * đang lọc dữ liệu chính của tab, hai việc khác nhau.
   */
  async function searchQuyenCandidates(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setNotice(null);
    try {
      const response = await fetch(
        `/api/gm/admin-ops?resource=characters&query=${encodeURIComponent(quyenQuery)}`,
        { cache: "no-store" },
      );
      const payload = await response.json();
      if (!response.ok || payload.success !== true) throw new Error(payload.message ?? "Không tìm được nhân vật.");
      setCharacters(payload.characters ?? []);
    } catch (error) {
      setNotice({ ok: false, text: error instanceof Error ? error.message : "Không tìm được nhân vật." });
    } finally {
      setLoading(false);
    }
  }

  async function grantKenh2(name: string) {
    const ok = await mutate({
      action: "grantKenh2",
      characterName: name,
      note: quyenNote,
      confirmation: name,
    });
    if (ok) setQuyenNote("");
  }

  async function revokeKenh2(name: string) {
    await mutate({ action: "revokeKenh2", characterName: name, confirmation: name });
  }

  async function openCharacter(name: string) {
    setLoading(true);
    setNotice(null);
    try {
      const response = await fetch(
        `/api/gm/admin-ops?resource=character&name=${encodeURIComponent(name)}`,
        { cache: "no-store" },
      );
      const payload = await response.json();
      if (!response.ok || payload.success !== true) throw new Error(payload.message ?? "Không mở được nhân vật.");
      setOfflineCharacter(payload);
    } catch (error) {
      setNotice({ ok: false, text: error instanceof Error ? error.message : "Không mở được nhân vật." });
    } finally {
      setLoading(false);
    }
  }

  async function setAccountLock(accountId: string, locked: boolean) {
    const confirmation = window.prompt(`Nhập chính xác ID tài khoản ${accountId} để xác nhận:`) ?? "";
    if (confirmation !== accountId) return;
    const ok = await mutate({ action: "setAccountLock", accountId, locked, confirmation });
    if (ok && offlineCharacter?.userId === accountId) {
      setOfflineCharacter({ ...offlineCharacter, locked });
    }
  }

  /** Tên đã có trong danh sách, để nút bên cột ứng viên đổi thành "Đã có". */
  const daCapQuyen = useMemo(
    () => new Set(quyenEntries.map((entry) => entry.characterName.toLowerCase())),
    [quyenEntries],
  );

  const offlineItems = useMemo(() => {
    if (!offlineCharacter) return [];
    return [
      ...(offlineCharacter.wear ?? []),
      ...(offlineCharacter.bag ?? []),
      ...(offlineCharacter.auxiliaryEquipment ?? []),
      ...(offlineCharacter.spiritBag ?? []),
      ...(offlineCharacter.personalWarehouse ?? []),
      ...(offlineCharacter.publicWarehouse ?? []),
    ].slice(0, 80);
  }, [offlineCharacter]);

  return (
    <section className="advanced-operations glass-panel expanded" id="advanced-operations">
      <div className="panel-title-row">
        <div>
          <span className="section-kicker">CÔNG CỤ 12–16</span>
          <h2>Vận hành nâng cao</h2>
          <p>Cấp quyền vào Kênh 2, VIP Name, cấu hình ưu đãi VIP, danh sách Pill, hồ sơ offline, khóa/mở khóa và nhật ký quản trị.</p>
        </div>
        <div className="advanced-ops-heading-actions">
          {loading ? <LoaderCircle className="spinning" size={22} /> : <ShieldCheck size={22} />}
          {onClose ? <button type="button" className="advanced-ops-toggle" onClick={onClose}>
            Thu gọn <ChevronDown size={18} />
          </button> : null}
        </div>
      </div>

      <div className="advanced-ops-content">
      <div className="ops-tabs" role="tablist">
        {TABS.map((entry) => {
          const Icon = entry.icon;
          return (
            <button type="button" role="tab" aria-selected={tab === entry.id} className={tab === entry.id ? "active" : ""} onClick={() => { setTab(entry.id); setQuery(""); setNotice(null); }} key={entry.id}>
              <Icon size={17} /> {entry.label}
            </button>
          );
        })}
      </div>

      {notice ? <div className={`ops-notice ${notice.ok ? "success" : "error"}`}>{notice.text}</div> : null}

      {tab !== "audit" && tab !== "quyenKenh" ? (
        <form className="ops-search" onSubmit={(event) => { event.preventDefault(); void load(tab, query); }}>
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={tab === "pills" ? "Tìm PID hoặc tên Pill…" : "Tìm tên nhân vật hoặc tài khoản…"} />
          <button type="submit" disabled={loading}>Tìm</button>
        </form>
      ) : null}

      {tab === "vip" ? (
        <div className="ops-split">
          <form className="ops-form-card" onSubmit={setVip}>
            <h3>Thiết lập VIP Name</h3>
            <label><span>Tên nhân vật</span><input value={vipName} onChange={(event) => setVipName(event.target.value)} required /></label>
            <label><span>Số ngày</span><input type="number" min={1} max={3650} value={vipDays} onChange={(event) => setVipDays(event.target.value)} required /></label>
            <label><span>Xác nhận đúng tên</span><input value={vipConfirmation} onChange={(event) => setVipConfirmation(event.target.value)} placeholder={vipName || "Nhập lại tên nhân vật"} required /></label>
            <button type="submit" disabled={loading || !vipName || vipConfirmation !== vipName}><BadgeCheck size={17} /> Thiết lập VIP</button>
          </form>
          <div className="ops-table-card">
            <div className="ops-table-title"><strong>Danh sách VIP Name</strong><span>{vipEntries.length}</span></div>
            <div className="ops-rows">
              {vipEntries.length ? vipEntries.map((entry) => (
                <article key={`${entry.accountId}-${entry.characterName}`}>
                  <div><strong>{entry.characterName}</strong><small>{entry.accountId} · hết hạn {dateTime(entry.expiresAt)}</small></div>
                  <span className={entry.online ? "online" : "offline"}>{entry.online ? "Online" : "Offline"}</span>
                  <button type="button" onClick={() => void revokeVip(entry)}>Xóa VIP</button>
                </article>
              )) : <p>Chưa có VIP Name.</p>}
            </div>
          </div>
        </div>
      ) : null}

      {tab === "vipConfig" ? (
        <div className="ops-vip-config">
          <p className="ops-vip-config-intro">
            Toàn bộ ưu đãi VIP đọc trực tiếp từ code GameServer — bấm lưu sẽ ghi vào{" "}
            <code>Gsconfig.ini</code> và áp dụng ngay cho <strong>cả Kênh 1 và Kênh 2</strong>, không
            cần khởi động lại server.
            {vipConfig ? <span className="ops-vip-config-source"> Đang hiển thị số liệu đọc từ Kênh {vipConfig.kenh}.</span> : null}
          </p>

          <form className="ops-vip-config-form" onSubmit={saveVipConfig}>
            <div className="ops-vip-config-grid">
              {VIP_CONFIG_FIELDS.map((field) => (
                <label key={field.key} className={field.danger ? "danger" : undefined}>
                  <span>
                    {field.label}
                    {field.danger ? <TriangleAlert size={13} /> : null}
                  </span>
                  <input
                    type="number"
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    value={vipConfigDrafts[field.key] ?? ""}
                    onChange={(event) =>
                      setVipConfigDrafts((current) => ({ ...current, [field.key]: event.target.value }))
                    }
                  />
                  <small>{field.hint}</small>
                </label>
              ))}

              <label>
                <span>Danh sách bản đồ chỉ VIP mới vào được</span>
                <input
                  value={vipMapsDraft}
                  onChange={(event) => setVipMapsDraft(event.target.value)}
                  placeholder="VD: 101;201;301 — để trống = không giới hạn"
                />
                <small>Ghi ID bản đồ, cách nhau bằng dấu ";". Để trống nghĩa là không map nào bị khoá riêng cho VIP.</small>
              </label>

              <label className="ops-vip-config-toggle danger">
                <span>
                  Bật kênh chỉ dành riêng cho VIP
                  <TriangleAlert size={13} />
                </span>
                <button
                  type="button"
                  className={vipLineDraft ? "toggle-on" : "toggle-off"}
                  onClick={() => setVipLineDraft((current) => !current)}
                >
                  {vipLineDraft ? "ĐANG BẬT — chỉ VIP vào được kênh này" : "Đang tắt — ai cũng vào được"}
                </button>
                <small>Bật lên thì người KHÔNG phải VIP (hoặc VIP đã hết hạn) sẽ bị chặn đăng nhập ở kênh này — cân nhắc kỹ trước khi bật.</small>
              </label>
            </div>

            <button className="primary-action" type="submit" disabled={loading || !vipConfig}>
              <ShieldCheck size={17} /> Lưu cấu hình VIP (áp dụng 2 kênh)
            </button>
          </form>

          <div className="ops-vip-config-fixed">
            <h3>Ưu đãi VIP khác — cố định trong code, KHÔNG chỉnh được ở đây</h3>
            <ul>
              <li>Vào được các bản đồ trong danh sách "Danh sách bản đồ chỉ VIP" phía trên (chỉnh được).</li>
              <li>Một số vật phẩm rơi (drop) được đánh dấu "chỉ hội viên" — những vật phẩm này chỉ rơi cho người có VIP, danh sách nằm trong bảng cấu hình rơi đồ riêng, không sửa ở trang này.</li>
              <li>1 công thức chế tạo cụ thể (vật phẩm PID 800000001) có thêm thưởng riêng cho VIP — số cộng thêm cố định trong code.</li>
              <li>Không phải VIP thì bấm điểm danh hàng ngày sẽ không nhận được gì (điểm danh 100% dành cho VIP) — 2 ô thưởng điểm danh phía trên chỉnh được số lượng, không chỉnh được việc mở cho non-VIP.</li>
            </ul>
          </div>
        </div>
      ) : null}

      {tab === "quyenKenh" ? (
        <div className="ops-split">
          <div className="ops-table-card">
            <div className="ops-table-title"><strong>Tìm nhân vật để cấp quyền</strong><span>{characters.length}</span></div>
            <form className="ops-search" onSubmit={searchQuyenCandidates}>
              <Search size={18} />
              <input value={quyenQuery} onChange={(event) => setQuyenQuery(event.target.value)} placeholder="Tìm tên nhân vật hoặc tài khoản…" />
              <button type="submit" disabled={loading}>Tìm</button>
            </form>
            <label className="ops-note-field">
              <span>Ghi chú (không bắt buộc)</span>
              <input value={quyenNote} onChange={(event) => setQuyenNote(event.target.value)} placeholder="Ví dụ: test hộp TLC 3 ngày" maxLength={200} />
            </label>
            <div className="ops-rows">
              {characters.length ? characters.map((entry) => {
                const daCo = daCapQuyen.has(entry.characterName.toLowerCase());
                return (
                  <article key={entry.characterName}>
                    <div><strong>{entry.characterName}</strong><small>{entry.accountId} · cấp {entry.level}</small></div>
                    <span className={entry.online ? "online" : "offline"}>{entry.online ? "Online" : "Offline"}</span>
                    <button type="button" className="grant" disabled={loading || daCo} onClick={() => void grantKenh2(entry.characterName)}>
                      <UserRoundPlus size={16} /> {daCo ? "Đã có" : "Thêm vào danh sách"}
                    </button>
                  </article>
                );
              }) : <p>Nhập tên rồi bấm Tìm để chọn nhân vật.</p>}
            </div>
          </div>
          <div className="ops-table-card">
            <div className="ops-table-title"><strong>Được vào Kênh 2</strong><span>{quyenEntries.length}</span></div>
            <p className="ops-hint">
              Cấp theo từng nhân vật, không theo tài khoản. Bấm thêm là có hiệu lực trong 15 giây,
              không cần khởi động lại kênh. Thu hồi chỉ chặn từ lần đăng nhập kế tiếp, người đang ở
              trong Kênh 2 không bị đá ra ngay.
            </p>
            <div className="ops-rows">
              {quyenEntries.length ? quyenEntries.map((entry) => (
                <article key={entry.characterName}>
                  <div>
                    <strong>{entry.characterName}</strong>
                    <small>
                      {entry.accountId} · cấp {entry.level} · {entry.grantedBy} cấp {dateTime(entry.grantedAt)}
                      {entry.note ? ` · ${entry.note}` : ""}
                    </small>
                  </div>
                  {entry.characterMissing
                    ? <span className="offline" title="Nhân vật không còn trong database — dòng này vô tác dụng"><TriangleAlert size={14} /> Không còn</span>
                    : <span className={entry.online ? "online" : "offline"}>{entry.online ? "Online" : "Offline"}</span>}
                  <button type="button" disabled={loading} onClick={() => void revokeKenh2(entry.characterName)}>Thu hồi</button>
                </article>
              )) : <p>Chưa cấp quyền cho nhân vật nào. Hiện chỉ tài khoản admin và gmmode vào được Kênh 2.</p>}
            </div>
          </div>
        </div>
      ) : null}

      {tab === "pills" ? (
        <div className="ops-split pill-layout">
          <div className="ops-table-card">
            <div className="ops-table-title"><strong>Danh sách Pill ID thực tế</strong><span>{pills.length}</span></div>
            <div className="ops-rows pill-rows">
              {pills.map((pill) => (
                <button type="button" className={selectedPill?.itemId === pill.itemId ? "selected" : ""} onClick={() => setSelectedPill(pill)} key={pill.itemId}>
                  <strong>{pill.name || `PID ${pill.itemId}`}</strong>
                  <small>PID {pill.itemId} · đã dùng {pill.usageCount.toLocaleString("vi-VN")} lần</small>
                </button>
              ))}
            </div>
          </div>
          <article className="pill-inspector">
            {selectedPill ? (
              <>
                <span>KIỂM TRA PILL</span>
                <h3>{selectedPill.name || `PID ${selectedPill.itemId}`}</h3>
                <div className="pill-id-badge">PID {selectedPill.itemId}</div>
                <p>{selectedPill.description || "Chưa có mô tả trong danh mục vật phẩm."}</p>
                <div className="pill-magic-grid">
                  {[selectedPill.magic1, selectedPill.magic2, selectedPill.magic3, selectedPill.magic4, selectedPill.magic5].map((value, index) => <span key={index}><em>MAGIC {index + 1}</em><strong>{value}</strong></span>)}
                </div>
                <small>Dùng gần nhất: {dateTime(selectedPill.lastUsed)}</small>
              </>
            ) : <p>Chọn một Pill để xem chỉ số.</p>}
          </article>
        </div>
      ) : null}

      {tab === "offline" ? (
        <div className="offline-ops-layout">
          <div className="ops-table-card offline-character-list">
            <div className="ops-table-title"><strong>Nhân vật tìm thấy</strong><span>{characters.length}</span></div>
            <div className="ops-rows">
              {characters.map((entry) => (
                <button type="button" onClick={() => void openCharacter(entry.characterName)} key={entry.characterName}>
                  <div><strong>{entry.characterName}</strong><small>{entry.accountId} · cấp {entry.level}</small></div>
                  <span className={entry.online ? "online" : "offline"}>{entry.online ? "Online" : entry.locked ? "Đã khóa" : "Offline"}</span>
                </button>
              ))}
            </div>
          </div>
          <article className="offline-profile">
            {offlineCharacter ? (
              <>
                <div className="offline-profile-head">
                  <div><span>HỒ SƠ DATABASE</span><h3>{offlineCharacter.userName}</h3><small>{offlineCharacter.userId} · cấp {offlineCharacter.level} · chuyển chức {offlineCharacter.jobLevel}</small></div>
                  <span className={offlineCharacter.online ? "online" : "offline"}>{offlineCharacter.online ? "Online" : "Offline"}</span>
                </div>
                <div className="offline-profile-stats">
                  <span><em>Gold</em><strong>{offlineCharacter.money.toLocaleString("vi-VN")}</strong></span>
                  <span><em>Cash</em><strong>{offlineCharacter.cash.toLocaleString("vi-VN")}</strong></span>
                  <span><em>Cash X</em><strong>{offlineCharacter.cashX.toLocaleString("vi-VN")}</strong></span>
                  <span><em>Coin</em><strong>{offlineCharacter.coin.toLocaleString("vi-VN")}</strong></span>
                  <span><em>Võ huân</em><strong>{offlineCharacter.honor.toLocaleString("vi-VN")}</strong></span>
                  <span><em>Trạng thái</em><strong>{offlineCharacter.locked ? "Đã khóa" : "Bình thường"}</strong></span>
                </div>
                <div className="offline-account-actions">
                  {offlineCharacter.locked ? (
                    <button type="button" onClick={() => void setAccountLock(offlineCharacter.userId, false)}><UnlockKeyhole size={17} /> Mở khóa tài khoản</button>
                  ) : (
                    <button type="button" className="danger" disabled={offlineCharacter.online} onClick={() => void setAccountLock(offlineCharacter.userId, true)}><LockKeyhole size={17} /> Khóa tài khoản</button>
                  )}
                </div>
                <div className="offline-items"><strong>Vật phẩm đã đọc · {offlineItems.length}</strong><div>{offlineItems.map((item, index) => <ItemThumb item={item} key={`${item.itemId}-${item.slot}-${index}`} />)}</div></div>
              </>
            ) : <div className="ops-empty"><UserRoundSearch size={28} /><strong>Chọn một nhân vật để mở hồ sơ offline</strong></div>}
          </article>
        </div>
      ) : null}

      {tab === "audit" ? (
        <div className="audit-timeline">
          {auditEntries.length ? auditEntries.map((entry, index) => (
            <article key={`${entry.time}-${index}`}>
              <Clock3 size={16} />
              <div><strong>{entry.action.replaceAll("_", " ")}</strong><span>{entry.accountId} · {entry.detail}</span></div>
              <time>{dateTime(entry.time)}</time>
            </article>
          )) : <p>Chưa có lịch sử thao tác.</p>}
        </div>
      ) : null}
      </div>
    </section>
  );
}
