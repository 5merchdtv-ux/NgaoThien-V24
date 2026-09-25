"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  RefreshCw,
  Zap,
  Sparkles,
  Layers,
  ShoppingBag,
  Info,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Flame,
  Clock,
  Heart,
  Swords,
  Award,
  Package,
  Check,
  X,
  ArrowRightLeft,
  ChevronDown,
  Store,
  MapPin,
  HelpCircle,
  Coins,
  Compass,
  FileText,
  Calendar,
  ExternalLink,
} from "lucide-react";

interface PillLocation {
  type: string;
  targetName: string;
  mapName: string;
  costOrRate: string;
  details: string;
}

interface PillSourceDetail {
  mainSource: string;
  locations: PillLocation[];
  eventInfo: string;
  howToGet: string;
  stackingTips: string;
}

interface PillItem {
  pid: number;
  name: string;
  originalName: string;
  groupId: string;
  groupName: string;
  source: string;
  isCashShop: boolean;
  effectDescription: string;
  duration: string;
  stackRule: string;
  isLocked: boolean;
  price: number;
  sourceDetail?: PillSourceDetail;
}

interface PillGroup {
  id: string;
  name: string;
  description: string;
  icon: string;
  mechanic: string;
  stackBehavior: string;
  pills: PillItem[];
}

interface ApiResponse {
  success: boolean;
  message?: string;
  totalPills?: number;
  activeCount?: number;
  lockedCount?: number;
  groups?: PillGroup[];
}

function PillIconThumbnail({ pid, name, size = 44 }: { pid: number; name: string; size?: number }) {
  const [broken, setBroken] = useState(false);

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        borderRadius: "8px",
        background: "radial-gradient(circle, rgba(45, 33, 20, 0.95) 0%, rgba(12, 10, 7, 0.98) 100%)",
        border: "1.5px solid rgba(230, 174, 78, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        boxShadow: "0 3px 8px rgba(0,0,0,0.6)",
        overflow: "hidden",
      }}
      title={`PID: ${pid} - ${name}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={broken ? "/item-icons/0.jpg" : `/item-icons/${pid}.jpg`}
        alt={name}
        width={size - 8}
        height={size - 8}
        loading="lazy"
        onError={() => setBroken(true)}
        style={{
          objectFit: "contain",
          imageRendering: "crisp-edges",
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.8))",
        }}
      />
    </div>
  );
}

function getGroupBadgeColor(groupId: string): { bg: string; border: string; text: string } {
  switch (groupId) {
    case "Group_ChiTonPhu":
      return { bg: "rgba(241, 196, 15, 0.15)", border: "rgba(241, 196, 15, 0.4)", text: "#f1c40f" };
    case "Group_ChiTonHoan":
      return { bg: "rgba(230, 126, 34, 0.15)", border: "rgba(230, 126, 34, 0.4)", text: "#e67e22" };
    case "Group_CoDiepPhu":
      return { bg: "rgba(155, 89, 182, 0.15)", border: "rgba(155, 89, 182, 0.4)", text: "#9b59b6" };
    case "Group_YeuHoaThanhThao":
      return { bg: "rgba(46, 204, 113, 0.15)", border: "rgba(46, 204, 113, 0.4)", text: "#2ecc71" };
    case "Group_ChiTheu":
      return { bg: "rgba(26, 188, 156, 0.15)", border: "rgba(26, 188, 156, 0.4)", text: "#1abc9c" };
    case "Group_MaVoHaiSan":
      return { bg: "rgba(52, 152, 219, 0.15)", border: "rgba(52, 152, 219, 0.4)", text: "#3498db" };
    case "Group_ThanThu":
      return { bg: "rgba(255, 215, 0, 0.2)", border: "rgba(255, 215, 0, 0.5)", text: "#ffd700" };
    case "Group_ThanDan":
      return { bg: "rgba(231, 76, 60, 0.15)", border: "rgba(231, 76, 60, 0.4)", text: "#e74c3c" };
    case "Group_BinhMauSamAuto":
      return { bg: "rgba(231, 76, 60, 0.2)", border: "rgba(231, 76, 60, 0.5)", text: "#ff6b6b" };
    case "Group_KeoHoLo":
      return { bg: "rgba(243, 156, 18, 0.15)", border: "rgba(243, 156, 18, 0.4)", text: "#f39c12" };
    case "Group_ThuocLacPK":
      return { bg: "rgba(192, 57, 43, 0.15)", border: "rgba(192, 57, 43, 0.4)", text: "#e74c3c" };
    case "Group_TuiVoHoangTe":
      return { bg: "rgba(218, 165, 32, 0.2)", border: "rgba(218, 165, 32, 0.5)", text: "#ffd47c" };
    case "Group_TlcBonus":
      return { bg: "rgba(230, 126, 34, 0.2)", border: "rgba(230, 126, 34, 0.5)", text: "#e67e22" };
    case "Group_ExpHoTam":
      return { bg: "rgba(241, 196, 15, 0.2)", border: "rgba(241, 196, 15, 0.5)", text: "#f1c40f" };
    case "Group_HoaDuongDan":
      return { bg: "rgba(231, 76, 60, 0.2)", border: "rgba(231, 76, 60, 0.5)", text: "#ff7675" };
    case "Group_HealerBuff":
      return { bg: "rgba(46, 204, 113, 0.2)", border: "rgba(46, 204, 113, 0.5)", text: "#2ecc71" };
    case "Group_ArcherArrows":
      return { bg: "rgba(52, 152, 219, 0.2)", border: "rgba(52, 152, 219, 0.5)", text: "#74b9ff" };
    default:
      return { bg: "rgba(230, 174, 78, 0.12)", border: "rgba(230, 174, 78, 0.3)", text: "#ffd47c" };
  }
}

export default function PillsManagementTool() {
  const [activeTab, setActiveTab] = useState<"catalog" | "matrix" | "mechanics">("catalog");
  const [groups, setGroups] = useState<PillGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // Filters
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [selectedLockStatus, setSelectedLockStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal State
  const [modalPill, setModalPill] = useState<PillItem | null>(null);

  // Target Channel for Reload
  const [targetChannel, setTargetChannel] = useState<number>(2);

  const fetchPills = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gm/pills", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Lỗi tải dữ liệu: ${res.status}`);
      }
      const data: ApiResponse = await res.json();
      if (data.success && data.groups) {
        setGroups(data.groups);
      } else {
        setFeedback({ type: "error", text: data.message || "Không thể đọc danh sách Pill." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Lỗi kết nối Gateway." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPills();
  }, [fetchPills]);

  // Flatten all pills
  const allPills = useMemo(() => {
    return groups.flatMap((g) => g.pills);
  }, [groups]);

  // Metrics
  const metrics = useMemo(() => {
    const totalPills = allPills.length;
    const activePills = allPills.filter((p) => !p.isLocked).length;
    const lockedPills = allPills.filter((p) => p.isLocked).length;
    const cash = allPills.filter((p) => p.isCashShop).length;
    const inGame = totalPills - cash;
    return { totalPills, activePills, lockedPills, cash, inGame };
  }, [allPills]);

  // Filtered pills
  const filteredPills = useMemo(() => {
    return allPills.filter((p) => {
      if (selectedGroup !== "all" && p.groupId !== selectedGroup) return false;
      if (selectedSource === "cash" && !p.isCashShop) return false;
      if (selectedSource === "ingame" && p.isCashShop) return false;
      if (selectedLockStatus === "active" && p.isLocked) return false;
      if (selectedLockStatus === "locked" && !p.isLocked) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(q);
        const matchPid = p.pid.toString().includes(q);
        const matchEffect = p.effectDescription.toLowerCase().includes(q);
        const matchOrig = p.originalName.toLowerCase().includes(q);
        if (!matchName && !matchPid && !matchEffect && !matchOrig) return false;
      }
      return true;
    });
  }, [allPills, selectedGroup, selectedSource, selectedLockStatus, searchQuery]);

  // Toggle single pill
  const handleTogglePill = async (pill: PillItem) => {
    const nextLocked = !pill.isLocked;
    const actionText = nextLocked ? "Khóa (Cấm dùng)" : "Mở (Cho phép dùng)";

    setSaving(true);
    try {
      const res = await fetch("/api/gm/pills?action=toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pid: pill.pid,
          enabled: !nextLocked,
          kenh: targetChannel,
        }),
      });
      const data = await res.json();
      if (data.success || data.Success) {
        setFeedback({
          type: "success",
          text: `Đã ${actionText} vật phẩm ${pill.name} (PID: ${pill.pid}) thành công trên Kênh ${targetChannel}.`,
        });
        // Update local state
        setGroups((prev) =>
          prev.map((g) => ({
            ...g,
            pills: g.pills.map((p) => (p.pid === pill.pid ? { ...p, isLocked: nextLocked } : p)),
          }))
        );
      } else {
        setFeedback({ type: "error", text: data.message || data.Message || "Lỗi cập nhật." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Lỗi kết nối server." });
    } finally {
      setSaving(false);
    }
  };

  // Toggle whole group
  const handleToggleGroup = async (groupId: string, lockStatus: number) => {
    const actionText = lockStatus === 1 ? "Khóa toàn bộ nhóm" : "Mở toàn bộ nhóm";
    const group = groups.find((g) => g.id === groupId);
    const gName = group ? group.name : groupId;

    if (!confirm(`Bạn có chắc chắn muốn ${actionText} "${gName}" không?`)) {
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/gm/pills?action=toggle-group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: groupId,
          enabled: lockStatus === 0,
          kenh: targetChannel,
        }),
      });
      const data = await res.json();
      if (data.success || data.Success) {
        setFeedback({
          type: "success",
          text: `Đã ${actionText} "${gName}" thành công trên Kênh ${targetChannel}.`,
        });
        fetchPills();
      } else {
        setFeedback({ type: "error", text: data.message || data.Message || "Lỗi cập nhật nhóm." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Lỗi kết nối server." });
    } finally {
      setSaving(false);
    }
  };

  // Reload GameServer
  const handleReloadGameServer = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/gm/pills?action=reload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kenh: targetChannel }),
      });
      const data = await res.json();
      if (data.success || data.Success) {
        setFeedback({
          type: "success",
          text: `Đã nạp lại danh sách vật phẩm (reloaditems) thành công trên Kênh ${targetChannel}!`,
        });
      } else {
        setFeedback({ type: "error", text: data.message || data.Message || "Lỗi nạp lại GameServer." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Lỗi kết nối server." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", color: "#f7f3ea" }}>
      {/* Top Header & Channel Controls */}
      <div
        style={{
          background: "rgba(18, 14, 10, 0.92)",
          border: "1px solid rgba(230, 174, 78, 0.25)",
          borderRadius: "12px",
          padding: "20px 24px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#ffd47c",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              HỆ THỐNG QUẢN TRỊ PILL & BUFF VẬT PHẨM
            </span>
            <span
              style={{
                fontSize: "11px",
                background: "rgba(230, 174, 78, 0.15)",
                color: "#ffd47c",
                padding: "2px 8px",
                borderRadius: "4px",
                border: "1px solid rgba(230, 174, 78, 0.3)",
              }}
            >
              13 Nhóm Buff Chuẩn
            </span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, margin: 0, color: "#fff" }}>
            Danh Mục Pill, Công Tắc Bật/Tắt & Sơ Đồ Cắn Trùng
          </h1>
          <p style={{ margin: "4px 0 0", color: "#c8c0b4", fontSize: "14px" }}>
            Quản lý toàn bộ dược phẩm Cash Shop & In-game, khóa/mở sử dụng tức thì, tra cứu cơ chế cộng dồn và ma trận xung đột.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "13px", color: "#c8c0b4" }}>Kênh áp dụng:</span>
            <select
              value={targetChannel}
              onChange={(e) => setTargetChannel(Number(e.target.value))}
              style={{
                background: "rgba(5, 4, 3, 0.8)",
                color: "#ffd47c",
                border: "1px solid rgba(230, 174, 78, 0.4)",
                borderRadius: "6px",
                padding: "8px 12px",
                fontSize: "13px",
                fontWeight: 600,
                outline: "none",
              }}
            >
              <option value={2}>Kênh 2 (Thử nghiệm / Test)</option>
              <option value={1}>Kênh 1 (Live Production)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleReloadGameServer}
            disabled={saving}
            style={{
              background: "linear-gradient(180deg, #f3c968, #bd7528)",
              color: "#25180a",
              border: "1px solid #ffd57d",
              borderRadius: "6px",
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: 800,
              cursor: saving ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            }}
          >
            <RefreshCw size={15} className={saving ? "animate-spin" : ""} />
            Nạp Lại GameServer
          </button>

          <button
            type="button"
            onClick={fetchPills}
            disabled={loading}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              color: "#ddd5ca",
              border: "1px solid rgba(230, 174, 78, 0.25)",
              borderRadius: "6px",
              padding: "8px 14px",
              fontSize: "13px",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Làm Mới
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        <div
          style={{
            background: "rgba(28, 23, 18, 0.96)",
            border: "1px solid rgba(230, 174, 78, 0.2)",
            borderRadius: "10px",
            padding: "16px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              background: "rgba(230, 174, 78, 0.15)",
              color: "#ffd47c",
              padding: "12px",
              borderRadius: "8px",
              display: "flex",
            }}
          >
            <Package size={24} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#c8c0b4" }}>Tổng Số Pill / Buff</div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#fff" }}>
              {loading ? "..." : metrics.totalPills}
            </div>
            <div style={{ fontSize: "11px", color: "#91887d" }}>13 phân nhóm chuẩn</div>
          </div>
        </div>

        <div
          style={{
            background: "rgba(28, 23, 18, 0.96)",
            border: "1px solid rgba(46, 204, 113, 0.3)",
            borderRadius: "10px",
            padding: "16px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              background: "rgba(46, 204, 113, 0.15)",
              color: "#2ecc71",
              padding: "12px",
              borderRadius: "8px",
              display: "flex",
            }}
          >
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#c8c0b4" }}>Đang Cho Phép Dùng</div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#2ecc71" }}>
              {loading ? "..." : metrics.activePills}
            </div>
            <div style={{ fontSize: "11px", color: "#91887d" }}>Bình thường trong game</div>
          </div>
        </div>

        <div
          style={{
            background: "rgba(28, 23, 18, 0.96)",
            border: "1px solid rgba(231, 76, 60, 0.3)",
            borderRadius: "10px",
            padding: "16px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              background: "rgba(231, 76, 60, 0.15)",
              color: "#e74c3c",
              padding: "12px",
              borderRadius: "8px",
              display: "flex",
            }}
          >
            <XCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#c8c0b4" }}>Đang Khóa Cấm Dùng</div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#e74c3c" }}>
              {loading ? "..." : metrics.lockedPills}
            </div>
            <div style={{ fontSize: "11px", color: "#91887d" }}>FLD_LOCK = 1</div>
          </div>
        </div>

        <div
          style={{
            background: "rgba(28, 23, 18, 0.96)",
            border: "1px solid rgba(241, 196, 15, 0.3)",
            borderRadius: "10px",
            padding: "16px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              background: "rgba(241, 196, 15, 0.15)",
              color: "#f1c40f",
              padding: "12px",
              borderRadius: "8px",
              display: "flex",
            }}
          >
            <ShoppingBag size={24} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#c8c0b4" }}>Bách Bảo Các (Cash)</div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#f1c40f" }}>
              {loading ? "..." : metrics.cash}
            </div>
            <div style={{ fontSize: "11px", color: "#91887d" }}>Vật phẩm shop Cash</div>
          </div>
        </div>

        <div
          style={{
            background: "rgba(28, 23, 18, 0.96)",
            border: "1px solid rgba(52, 152, 219, 0.3)",
            borderRadius: "10px",
            padding: "16px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              background: "rgba(52, 152, 219, 0.15)",
              color: "#3498db",
              padding: "12px",
              borderRadius: "8px",
              display: "flex",
            }}
          >
            <Swords size={24} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#c8c0b4" }}>In-game / Rơi Quái</div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#3498db" }}>
              {loading ? "..." : metrics.inGame}
            </div>
            <div style={{ fontSize: "11px", color: "#91887d" }}>Shop NPC & Drop quái</div>
          </div>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          style={{
            padding: "12px 18px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "13px",
            fontWeight: 600,
            background:
              feedback.type === "success"
                ? "rgba(46, 204, 113, 0.15)"
                : feedback.type === "error"
                ? "rgba(231, 76, 60, 0.15)"
                : "rgba(52, 152, 219, 0.15)",
            border:
              feedback.type === "success"
                ? "1px solid rgba(46, 204, 113, 0.4)"
                : feedback.type === "error"
                ? "1px solid rgba(231, 76, 60, 0.4)"
                : "1px solid rgba(52, 152, 219, 0.4)",
            color:
              feedback.type === "success"
                ? "#2ecc71"
                : feedback.type === "error"
                ? "#e74c3c"
                : "#3498db",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {feedback.type === "success" ? (
              <CheckCircle2 size={16} />
            ) : feedback.type === "error" ? (
              <XCircle size={16} />
            ) : (
              <Info size={16} />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            style={{
              background: "transparent",
              border: "none",
              color: "inherit",
              cursor: "pointer",
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          borderBottom: "1px solid rgba(230, 174, 78, 0.2)",
          paddingBottom: "4px",
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("catalog")}
          style={{
            background:
              activeTab === "catalog"
                ? "linear-gradient(180deg, #f0c35e, #b86e24)"
                : "rgba(255, 255, 255, 0.05)",
            color: activeTab === "catalog" ? "#180f05" : "#c8c0b4",
            fontWeight: activeTab === "catalog" ? 800 : 500,
            border: "1px solid rgba(230, 174, 78, 0.3)",
            borderRadius: "6px",
            padding: "10px 20px",
            fontSize: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Layers size={16} />
          Danh Sách & Bật/Tắt Pill ({allPills.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("matrix")}
          style={{
            background:
              activeTab === "matrix"
                ? "linear-gradient(180deg, #f0c35e, #b86e24)"
                : "rgba(255, 255, 255, 0.05)",
            color: activeTab === "matrix" ? "#180f05" : "#c8c0b4",
            fontWeight: activeTab === "matrix" ? 800 : 500,
            border: "1px solid rgba(230, 174, 78, 0.3)",
            borderRadius: "6px",
            padding: "10px 20px",
            fontSize: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <ArrowRightLeft size={16} />
          Sơ Đồ Ma Trận Cắn Trùng & Xung Đột (13x13)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("mechanics")}
          style={{
            background:
              activeTab === "mechanics"
                ? "linear-gradient(180deg, #f0c35e, #b86e24)"
                : "rgba(255, 255, 255, 0.05)",
            color: activeTab === "mechanics" ? "#180f05" : "#c8c0b4",
            fontWeight: activeTab === "mechanics" ? 800 : 500,
            border: "1px solid rgba(230, 174, 78, 0.3)",
            borderRadius: "6px",
            padding: "10px 20px",
            fontSize: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Info size={16} />
          Cơ Chế GameServer & Chi Tiết 13 Nhóm
        </button>
      </div>

      {/* TAB 1: CATALOG & TOGGLE */}
      {activeTab === "catalog" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Filters Bar */}
          <div
            style={{
              background: "rgba(28, 23, 18, 0.96)",
              border: "1px solid rgba(230, 174, 78, 0.2)",
              borderRadius: "10px",
              padding: "16px 20px",
              display: "flex",
              flexWrap: "wrap",
              gap: "14px",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Search */}
            <div style={{ position: "relative", minWidth: "260px", flex: "1 1 260px" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#91887d",
                }}
              />
              <input
                type="text"
                placeholder="Tìm theo tên pill, PID hoặc tác dụng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 36px",
                  background: "rgba(5, 4, 3, 0.7)",
                  border: "1px solid rgba(230, 174, 78, 0.26)",
                  borderRadius: "6px",
                  color: "#f7f3ea",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>

            {/* Group Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "13px", color: "#c8c0b4" }}>Nhóm:</span>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                style={{
                  background: "rgba(5, 4, 3, 0.7)",
                  color: "#f7f3ea",
                  border: "1px solid rgba(230, 174, 78, 0.26)",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  fontSize: "13px",
                  outline: "none",
                }}
              >
                <option value="all">Tất cả các nhóm ({allPills.length})</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.pills.length})
                  </option>
                ))}
              </select>
            </div>

            {/* Source Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "13px", color: "#c8c0b4" }}>Nguồn:</span>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                style={{
                  background: "rgba(5, 4, 3, 0.7)",
                  color: "#f7f3ea",
                  border: "1px solid rgba(230, 174, 78, 0.26)",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  fontSize: "13px",
                  outline: "none",
                }}
              >
                <option value="all">Tất cả nguồn</option>
                <option value="cash">Bách Bảo Các (Cash Shop)</option>
                <option value="ingame">Shop NPC & Quái Rơi</option>
              </select>
            </div>

            {/* Lock Status Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "13px", color: "#c8c0b4" }}>Trạng thái:</span>
              <select
                value={selectedLockStatus}
                onChange={(e) => setSelectedLockStatus(e.target.value)}
                style={{
                  background: "rgba(5, 4, 3, 0.7)",
                  color: "#f7f3ea",
                  border: "1px solid rgba(230, 174, 78, 0.26)",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  fontSize: "13px",
                  outline: "none",
                }}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang cho phép dùng</option>
                <option value="locked">Đang bị khóa cấm dùng</option>
              </select>
            </div>
          </div>

          {/* Group Bulk Action Bar (When a specific group is selected) */}
          {selectedGroup !== "all" && (
            <div
              style={{
                background: "rgba(230, 174, 78, 0.08)",
                border: "1px solid rgba(230, 174, 78, 0.25)",
                borderRadius: "8px",
                padding: "12px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <span style={{ fontWeight: 700, color: "#ffd47c", fontSize: "14px" }}>
                  Thao tác nhanh cho nhóm:{" "}
                  {groups.find((g) => g.id === selectedGroup)?.name}
                </span>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#c8c0b4" }}>
                  {groups.find((g) => g.id === selectedGroup)?.description}
                </p>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => handleToggleGroup(selectedGroup, 0)}
                  disabled={saving}
                  style={{
                    background: "rgba(46, 204, 113, 0.2)",
                    color: "#2ecc71",
                    border: "1px solid rgba(46, 204, 113, 0.4)",
                    borderRadius: "6px",
                    padding: "6px 14px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Check size={14} />
                  Mở Cho Phép Cả Nhóm
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleGroup(selectedGroup, 1)}
                  disabled={saving}
                  style={{
                    background: "rgba(231, 76, 60, 0.2)",
                    color: "#e74c3c",
                    border: "1px solid rgba(231, 76, 60, 0.4)",
                    borderRadius: "6px",
                    padding: "6px 14px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <X size={14} />
                  Khóa Cấm Dùng Cả Nhóm
                </button>
              </div>
            </div>
          )}

          {/* Pills Table */}
          <div
            style={{
              background: "rgba(28, 23, 18, 0.96)",
              border: "1px solid rgba(230, 174, 78, 0.2)",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr
                  style={{
                    background: "rgba(18, 14, 10, 0.9)",
                    borderBottom: "1px solid rgba(230, 174, 78, 0.2)",
                    color: "#ffd47c",
                    fontSize: "12px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  <th style={{ padding: "14px 16px", minWidth: "300px" }}>Vật Phẩm Pill</th>
                  <th style={{ padding: "14px 16px", width: "110px" }}>PID</th>
                  <th style={{ padding: "14px 16px" }}>Nhóm Buff</th>
                  <th style={{ padding: "14px 16px" }}>Nguồn Gốc (Bấm xem chi tiết)</th>
                  <th style={{ padding: "14px 16px", minWidth: "220px" }}>Tác Dụng & Chỉ Số</th>
                  <th style={{ padding: "14px 16px", width: "120px" }}>Thời Hạn</th>
                  <th style={{ padding: "14px 16px", minWidth: "220px" }}>Cơ Chế Cắn Trùng</th>
                  <th style={{ padding: "14px 16px", textAlign: "center", width: "110px" }}>Trạng Thái</th>
                  <th style={{ padding: "14px 16px", textAlign: "center", width: "110px" }}>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} style={{ padding: "50px", textAlign: "center", color: "#c8c0b4" }}>
                      <RefreshCw size={26} className="animate-spin" style={{ margin: "0 auto 12px" }} />
                      Đang tải danh sách pill và dữ liệu database...
                    </td>
                  </tr>
                ) : filteredPills.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: "50px", textAlign: "center", color: "#91887d" }}>
                      Không tìm thấy pill nào phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                ) : (
                  filteredPills.map((pill) => {
                    const groupColor = getGroupBadgeColor(pill.groupId);

                    return (
                      <tr
                        key={pill.pid}
                        style={{
                          borderBottom: "1px solid rgba(230, 174, 78, 0.08)",
                          background: pill.isLocked ? "rgba(231, 76, 60, 0.04)" : "transparent",
                          transition: "background 0.15s ease",
                        }}
                      >
                        {/* Name + Icon */}
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <PillIconThumbnail pid={pill.pid} name={pill.name} />
                            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                              <strong style={{ color: pill.isLocked ? "#e74c3c" : "#fff", fontSize: "14px", fontWeight: 700 }}>
                                {pill.name}
                              </strong>
                              {pill.originalName && pill.originalName !== pill.name && (
                                <div style={{ fontSize: "11px", color: "#91887d", lineHeight: "1.3" }}>
                                  {pill.originalName}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* PID */}
                        <td style={{ padding: "12px 16px" }}>
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontSize: "12px",
                              fontWeight: 700,
                              color: "#ffd47c",
                              background: "rgba(230, 174, 78, 0.1)",
                              border: "1px solid rgba(230, 174, 78, 0.25)",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              display: "inline-block",
                            }}
                          >
                            {pill.pid}
                          </span>
                        </td>

                        {/* Group */}
                        <td style={{ padding: "12px 16px" }}>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              background: groupColor.bg,
                              color: groupColor.text,
                              padding: "4px 8px",
                              borderRadius: "4px",
                              border: `1px solid ${groupColor.border}`,
                              whiteSpace: "nowrap",
                              display: "inline-block",
                            }}
                          >
                            {pill.groupName}
                          </span>
                        </td>

                        {/* Source (Clickable to open detailed Modal) */}
                        <td style={{ padding: "12px 16px" }}>
                          <button
                            type="button"
                            onClick={() => setModalPill(pill)}
                            style={{
                              background: "transparent",
                              border: "none",
                              padding: 0,
                              cursor: "pointer",
                              textAlign: "left",
                            }}
                            title="Bấm để xem phân tích chi tiết nơi mua, bãi drop & sự kiện"
                          >
                            {pill.isCashShop ? (
                              <span
                                style={{
                                  fontSize: "11px",
                                  background: "rgba(241, 196, 15, 0.15)",
                                  color: "#f1c40f",
                                  padding: "4px 10px",
                                  borderRadius: "6px",
                                  border: "1px solid rgba(241, 196, 15, 0.4)",
                                  fontWeight: 700,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  whiteSpace: "nowrap",
                                  transition: "transform 0.15s ease",
                                }}
                              >
                                <ShoppingBag size={12} />
                                Bách Bảo Các
                                <ExternalLink size={10} style={{ opacity: 0.7 }} />
                              </span>
                            ) : pill.source.includes("NPC") ? (
                              <span
                                style={{
                                  fontSize: "11px",
                                  background: "rgba(26, 188, 156, 0.15)",
                                  color: "#1abc9c",
                                  padding: "4px 10px",
                                  borderRadius: "6px",
                                  border: "1px solid rgba(26, 188, 156, 0.4)",
                                  fontWeight: 600,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <Store size={12} />
                                Shop NPC
                                <ExternalLink size={10} style={{ opacity: 0.7 }} />
                              </span>
                            ) : pill.source.includes("Boss") ? (
                              <span
                                style={{
                                  fontSize: "11px",
                                  background: "rgba(231, 76, 60, 0.15)",
                                  color: "#ff6b6b",
                                  padding: "4px 10px",
                                  borderRadius: "6px",
                                  border: "1px solid rgba(231, 76, 60, 0.4)",
                                  fontWeight: 600,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <Flame size={12} />
                                Boss Drop / Event
                                <ExternalLink size={10} style={{ opacity: 0.7 }} />
                              </span>
                            ) : pill.source.includes("Hộp") ? (
                              <span
                                style={{
                                  fontSize: "11px",
                                  background: "rgba(155, 89, 182, 0.15)",
                                  color: "#9b59b6",
                                  padding: "4px 10px",
                                  borderRadius: "6px",
                                  border: "1px solid rgba(155, 89, 182, 0.4)",
                                  fontWeight: 600,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <Package size={12} />
                                Mở Từ Hộp Báu
                                <ExternalLink size={10} style={{ opacity: 0.7 }} />
                              </span>
                            ) : (
                              <span
                                style={{
                                  fontSize: "11px",
                                  background: "rgba(52, 152, 219, 0.15)",
                                  color: "#3498db",
                                  padding: "4px 10px",
                                  borderRadius: "6px",
                                  border: "1px solid rgba(52, 152, 219, 0.4)",
                                  fontWeight: 600,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <Swords size={12} />
                                {pill.source}
                                <ExternalLink size={10} style={{ opacity: 0.7 }} />
                              </span>
                            )}
                          </button>
                        </td>

                        {/* Effect */}
                        <td style={{ padding: "12px 16px", fontSize: "12px", color: "#ddd5ca", lineHeight: "1.4" }}>
                          {pill.effectDescription}
                        </td>

                        {/* Duration */}
                        <td style={{ padding: "12px 16px", fontSize: "12px", color: "#c8c0b4", whiteSpace: "nowrap" }}>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "rgba(0,0,0,0.3)", padding: "3px 7px", borderRadius: "4px" }}>
                            <Clock size={12} style={{ color: "#ffd47c" }} />
                            <span>{pill.duration}</span>
                          </div>
                        </td>

                        {/* Stacking Rule */}
                        <td style={{ padding: "12px 16px", fontSize: "11px", color: "#a8a094", lineHeight: "1.4" }}>
                          {pill.stackRule}
                        </td>

                        {/* Lock Status */}
                        <td style={{ padding: "12px 16px", textAlign: "center" }}>
                          {pill.isLocked ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                fontSize: "11px",
                                fontWeight: 800,
                                background: "rgba(231, 76, 60, 0.15)",
                                color: "#e74c3c",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                border: "1px solid rgba(231, 76, 60, 0.35)",
                                whiteSpace: "nowrap",
                              }}
                            >
                              <XCircle size={12} /> Cấm Dùng
                            </span>
                          ) : (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                fontSize: "11px",
                                fontWeight: 800,
                                background: "rgba(46, 204, 113, 0.15)",
                                color: "#2ecc71",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                border: "1px solid rgba(46, 204, 113, 0.35)",
                                whiteSpace: "nowrap",
                              }}
                            >
                              <CheckCircle2 size={12} /> Cho Phép
                            </span>
                          )}
                        </td>

                        {/* Action Button */}
                        <td style={{ padding: "12px 16px", textAlign: "center" }}>
                          <button
                            type="button"
                            onClick={() => handleTogglePill(pill)}
                            disabled={saving}
                            style={{
                              background: pill.isLocked
                                ? "linear-gradient(180deg, #2ecc71, #27ae60)"
                                : "rgba(231, 76, 60, 0.2)",
                              color: pill.isLocked ? "#fff" : "#e74c3c",
                              border: `1px solid ${pill.isLocked ? "#2ecc71" : "rgba(231, 76, 60, 0.45)"}`,
                              borderRadius: "6px",
                              padding: "6px 12px",
                              fontSize: "11px",
                              fontWeight: 800,
                              cursor: saving ? "not-allowed" : "pointer",
                              whiteSpace: "nowrap",
                              boxShadow: pill.isLocked ? "0 2px 4px rgba(46,204,113,0.3)" : "none",
                            }}
                          >
                            {pill.isLocked ? "Mở Khóa" : "Khóa Dùng"}
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

      {/* TAB 2: INTERACTIVE STACKING MATRIX */}
      {activeTab === "matrix" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Legend Banner */}
          <div
            style={{
              background: "rgba(18, 14, 10, 0.9)",
              border: "1px solid rgba(230, 174, 78, 0.25)",
              borderRadius: "10px",
              padding: "16px 20px",
            }}
          >
            <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#ffd47c", margin: "0 0 10px" }}>
              Chú Thích Quy Tắc Ma Trận Tương Tác & Cộng Dồn Buff (13 Nhóm)
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px",
                  borderRadius: "6px",
                  background: "rgba(46, 204, 113, 0.1)",
                  border: "1px solid rgba(46, 204, 113, 0.3)",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: "14px",
                    height: "14px",
                    borderRadius: "3px",
                    background: "#2ecc71",
                  }}
                />
                <div>
                  <strong style={{ color: "#2ecc71", fontSize: "13px" }}>🟢 Cộng Dồn (Stacking)</strong>
                  <div style={{ fontSize: "11px", color: "#c8c0b4" }}>
                    Cắn cùng lúc, hưởng trọn 100% cả 2 hiệu ứng
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px",
                  borderRadius: "6px",
                  background: "rgba(241, 196, 15, 0.1)",
                  border: "1px solid rgba(241, 196, 15, 0.3)",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: "14px",
                    height: "14px",
                    borderRadius: "3px",
                    background: "#f1c40f",
                  }}
                />
                <div>
                  <strong style={{ color: "#f1c40f", fontSize: "13px" }}>🟡 Gia Hạn / Reset Giờ</strong>
                  <div style={{ fontSize: "11px", color: "#c8c0b4" }}>
                    Cùng loại cắn tiếp sẽ làm mới lại thời gian
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px",
                  borderRadius: "6px",
                  background: "rgba(231, 76, 60, 0.1)",
                  border: "1px solid rgba(231, 76, 60, 0.3)",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: "14px",
                    height: "14px",
                    borderRadius: "3px",
                    background: "#e74c3c",
                  }}
                />
                <div>
                  <strong style={{ color: "#e74c3c", fontSize: "13px" }}>🔴 Ghi Đè / Thay Thế</strong>
                  <div style={{ fontSize: "11px", color: "#c8c0b4" }}>
                    Món mới xóa bỏ dung lượng hoặc hiệu ứng món cũ
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px",
                  borderRadius: "6px",
                  background: "rgba(149, 165, 166, 0.1)",
                  border: "1px solid rgba(149, 165, 166, 0.3)",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: "14px",
                    height: "14px",
                    borderRadius: "3px",
                    background: "#95a5a6",
                  }}
                />
                <div>
                  <strong style={{ color: "#bdc3c7", fontSize: "13px" }}>⚪ Độc Lập / Mở Tức Thì</strong>
                  <div style={{ fontSize: "11px", color: "#c8c0b4" }}>
                    Cộng điểm trực tiếp hoặc không bị ảnh hưởng
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 13x13 Visual Cross-Matrix */}
          <div
            style={{
              background: "rgba(28, 23, 18, 0.96)",
              border: "1px solid rgba(230, 174, 78, 0.2)",
              borderRadius: "10px",
              padding: "16px",
              overflowX: "auto",
            }}
          >
            <h4 style={{ color: "#ffd47c", margin: "0 0 12px", fontSize: "14px", fontWeight: 700 }}>
              Bảng Đối Chiếu Xung Đột Từng Cặp Nhóm Buff (18 x 18)
            </h4>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", textAlign: "center" }}>
              <thead>
                <tr style={{ background: "rgba(18, 14, 10, 0.9)" }}>
                  <th style={{ padding: "10px", textAlign: "left", color: "#ffd47c", minWidth: "160px" }}>
                    Nhóm Buff
                  </th>
                  <th title="1. Chí Tôn Phù (VIP)" style={{ padding: "8px 4px", color: "#ffd47c" }}>1. Phù VIP</th>
                  <th title="2. Chí Tôn Hoàn" style={{ padding: "8px 4px", color: "#ffd47c" }}>2. C.Tôn Hoàn</th>
                  <th title="3. Cô Điệp Phù" style={{ padding: "8px 4px", color: "#ffd47c" }}>3. Cô Điệp</th>
                  <th title="4. Yêu Hoa Thanh Thảo" style={{ padding: "8px 4px", color: "#ffd47c" }}>4. Yêu Hoa</th>
                  <th title="5. Chỉ Thêu Long Hổ" style={{ padding: "8px 4px", color: "#ffd47c" }}>5. Chỉ Thêu</th>
                  <th title="6. Ma Võ Hải Sản" style={{ padding: "8px 4px", color: "#ffd47c" }}>6. Ma Võ</th>
                  <th title="7. Thần Thụ Tâm Pháp" style={{ padding: "8px 4px", color: "#ffd47c" }}>7. Thần Thụ</th>
                  <th title="8. Thần Đan Bách Bảo" style={{ padding: "8px 4px", color: "#ffd47c" }}>8. Thần Đan</th>
                  <th title="9. EXP & Võ Huân Đan" style={{ padding: "8px 4px", color: "#ffd47c" }}>9. EXP/VH</th>
                  <th title="10. Bình HP/MP Auto" style={{ padding: "8px 4px", color: "#ffd47c" }}>10. HP/MP</th>
                  <th title="11. Kẹo Hồ Lô & Bánh" style={{ padding: "8px 4px", color: "#ffd47c" }}>11. Kẹo/Bánh</th>
                  <th title="12. Thuốc Lắc PK" style={{ padding: "8px 4px", color: "#ffd47c" }}>12. Thuốc Lắc</th>
                  <th title="13. Túi Võ Hoàng Tệ" style={{ padding: "8px 4px", color: "#ffd47c" }}>13. VHT Tệ</th>
                  <th title="14. Bùa Thế Lực & Bông TLC" style={{ padding: "8px 4px", color: "#ffd47c" }}>14. Bùa TLC</th>
                  <th title="15. Hộ Tâm & Hoàng Long (150%-300%)" style={{ padding: "8px 4px", color: "#ffd47c" }}>15. Hộ Tâm</th>
                  <th title="16. Chí Tôn Hỏa Dương Đơn" style={{ padding: "8px 4px", color: "#ffd47c" }}>16. Hỏa Dương</th>
                  <th title="17. Dược Thảo & Tiên Dược Đại Phu" style={{ padding: "8px 4px", color: "#ffd47c" }}>17. Đại Phu</th>
                  <th title="18. Mũi Tên & Cung Tiễn Buff Cung Thủ" style={{ padding: "8px 4px", color: "#ffd47c" }}>18. Cung Tiễn</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: "1", name: "1. Chí Tôn Phù (VIP)", matrix: ["🟡", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "⚪", "🟢", "🟢", "🟢", "🟢", "🟢"] },
                  { id: "2", name: "2. Chí Tôn Hoàn", matrix: ["🟢", "🟡", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "⚪", "🟢", "🟢", "🟢", "🟢", "🟢"] },
                  { id: "3", name: "3. Cô Điệp Phù", matrix: ["🟢", "🟢", "🟡", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "⚪", "🟢", "🟢", "🟢", "🟢", "🟢"] },
                  { id: "4", name: "4. Yêu Hoa Thanh Thảo", matrix: ["🟢", "🟢", "🟢", "🟡", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "⚪", "🟢", "🟢", "🟢", "🟢", "🟢"] },
                  { id: "5", name: "5. Chỉ Thêu Long Hổ", matrix: ["🟢", "🟢", "🟢", "🟢", "🟡", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "⚪", "🟢", "🟢", "🟢", "🟢", "🟢"] },
                  { id: "6", name: "6. Ma Võ Hải Sản", matrix: ["🟢", "🟢", "🟢", "🟢", "🟢", "🟡", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "⚪", "🟢", "🟢", "🟢", "🟢", "🟢"] },
                  { id: "7", name: "7. Thần Thụ Tâm Pháp", matrix: ["🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟡", "🟢", "🟢", "🟢", "🟢", "🟢", "⚪", "🟢", "🟢", "🟢", "🟢", "🟢"] },
                  { id: "8", name: "8. Thần Đan Bách Bảo", matrix: ["🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟡", "🟢", "🟢", "🟢", "🟢", "⚪", "🟢", "🟢", "🟢", "🟢", "🟢"] },
                  { id: "9", name: "9. EXP & Võ Huân Đan", matrix: ["🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🔴", "🟢", "🟢", "🟢", "⚪", "🟢", "🔴", "🟢", "🟢", "🟢"] },
                  { id: "10", name: "10. Bình HP/MP Auto", matrix: ["🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🔴", "🟢", "🟢", "⚪", "🟢", "🟢", "🟢", "🟢", "🟢"] },
                  { id: "11", name: "11. Kẹo Hồ Lô & Bánh", matrix: ["🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🔴", "🟢", "⚪", "🟢", "🟢", "🟢", "🟢", "🟢"] },
                  { id: "12", name: "12. Thuốc Lắc PK", matrix: ["🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🔴", "⚪", "🟢", "🟢", "🟢", "🟢", "🟢"] },
                  { id: "13", name: "13. Túi Võ Hoàng Tệ", matrix: ["⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪", "⚪"] },
                  { id: "14", name: "14. Bùa Thế Lực & Bông TLC", matrix: ["🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "⚪", "🟡", "🟢", "🟢", "🟢", "🟢"] },
                  { id: "15", name: "15. Hộ Tâm & Hoàng Long (150%-300%)", matrix: ["🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🔴", "🟢", "🟢", "🟢", "⚪", "🟢", "🟡", "🟢", "🟢", "🟢"] },
                  { id: "16", name: "16. Chí Tôn Hỏa Dương Đơn", matrix: ["🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "⚪", "🟢", "🟢", "🟡", "🟢", "🟢"] },
                  { id: "17", name: "17. Dược Thảo & Tiên Dược Đại Phu", matrix: ["🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "⚪", "🟢", "🟢", "🟢", "🟡", "🟢"] },
                  { id: "18", name: "18. Mũi Tên & Cung Tiễn Buff Cung Thủ", matrix: ["🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "🟢", "⚪", "🟢", "🟢", "🟢", "🟢", "⚪"] },
                ].map((row, rIdx) => (
                  <tr
                    key={row.id}
                    style={{
                      borderBottom: "1px solid rgba(230, 174, 78, 0.08)",
                      background: rIdx % 2 === 0 ? "rgba(0,0,0,0.2)" : "transparent",
                    }}
                  >
                    <td style={{ padding: "8px 10px", textAlign: "left", fontWeight: 700, color: "#f7f3ea" }}>
                      {row.name}
                    </td>
                    {row.matrix.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        style={{
                          padding: "6px",
                          fontSize: "14px",
                          background:
                            cell === "🟢"
                              ? "rgba(46, 204, 113, 0.06)"
                              : cell === "🟡"
                              ? "rgba(241, 196, 15, 0.08)"
                              : cell === "🔴"
                              ? "rgba(231, 76, 60, 0.08)"
                              : "transparent",
                        }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ENGINE MECHANICS & 13 GROUPS BREAKDOWN */}
      {activeTab === "mechanics" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Architecture overview */}
          <div
            style={{
              background: "rgba(18, 14, 10, 0.92)",
              border: "1px solid rgba(230, 174, 78, 0.25)",
              borderRadius: "10px",
              padding: "20px",
            }}
          >
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#ffd47c", margin: "0 0 10px" }}>
              Cấu Trúc Quản Lý Buff Trong GameServer (RxjhServer)
            </h3>
            <p style={{ fontSize: "13px", color: "#c8c0b4", lineHeight: "1.6", margin: "0 0 14px" }}>
              Hệ thống xử lý dược phẩm chia làm 5 luồng kỹ thuật độc lập trong mã nguồn <code>Players.cs</code>:
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
              <div
                style={{
                  background: "rgba(28, 23, 18, 0.96)",
                  border: "1px solid rgba(230, 174, 78, 0.2)",
                  borderRadius: "8px",
                  padding: "14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ffd47c", fontWeight: 700 }}>
                  <Award size={16} /> 1. Luồng TimeMedicine (VIP Phù)
                </div>
                <p style={{ fontSize: "12px", color: "#c8c0b4", margin: "6px 0 0", lineHeight: "1.5" }}>
                  Lưu trữ dạng chuỗi định dạng thời gian <code>yyMMddHHmm</code> trong cột database <code>FLD_VIP</code>. Độc lập hoàn toàn với toàn bộ danh sách trạng thái còn lại.
                </p>
              </div>

              <div
                style={{
                  background: "rgba(28, 23, 18, 0.96)",
                  border: "1px solid rgba(230, 174, 78, 0.2)",
                  borderRadius: "8px",
                  padding: "14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ffd47c", fontWeight: 700 }}>
                  <Layers size={16} /> 2. Luồng AppendStatusNewList (Phù Cao Cấp)
                </div>
                <p style={{ fontSize: "12px", color: "#c8c0b4", margin: "6px 0 0", lineHeight: "1.5" }}>
                  Mỗi loại phù (Chí Tôn Hoàn, Cô Điệp, Yêu Hoa, Chỉ Thêu, Ma Võ, Thần Thụ) được phân 1 slot key riêng biệt. Do đó <strong>TẤT CẢ CÁC LOẠI PHÙ NÀY ĐỀU CỘNG DỒN SONG SONG ĐƯỢC VỚI NHAU</strong>.
                </p>
              </div>

              <div
                style={{
                  background: "rgba(28, 23, 18, 0.96)",
                  border: "1px solid rgba(230, 174, 78, 0.2)",
                  borderRadius: "8px",
                  padding: "14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ffd47c", fontWeight: 700 }}>
                  <Heart size={16} /> 3. Luồng Tự Động Bơm HP/MP (Auto Potions)
                </div>
                <p style={{ fontSize: "12px", color: "#c8c0b4", margin: "6px 0 0", lineHeight: "1.5" }}>
                  Lưu trữ trực tiếp số điểm HP/MP tích lũy vào biến nhân vật (<code>Player_CZY_HP</code>, <code>Player_SMY_HP</code>, <code>Player_TCS_MP</code>). Tự động hồi phục khi máu &lt; 50% hoặc sâm &lt; 30%. Cắn bình mới sẽ <strong>GHI ĐÈ</strong> dung lượng.
                </p>
              </div>

              <div
                style={{
                  background: "rgba(28, 23, 18, 0.96)",
                  border: "1px solid rgba(230, 174, 78, 0.2)",
                  borderRadius: "8px",
                  padding: "14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ffd47c", fontWeight: 700 }}>
                  <Swords size={16} /> 4. Luồng PublicDrugs / AppendStatusList (Thuốc Lắc)
                </div>
                <p style={{ fontSize: "12px", color: "#c8c0b4", margin: "6px 0 0", lineHeight: "1.5" }}>
                  Quản lý các loại thuốc lắc tăng công kích, phòng thủ, né tránh, HP tối đa. Các loại khác dòng chỉ số được cộng dồn; cùng dòng chỉ số cắn tiếp sẽ <strong>LÀM MỚI LẠI THỜI GIAN</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Group details list */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "16px" }}>
            {groups.map((group) => (
              <div
                key={group.id}
                style={{
                  background: "rgba(28, 23, 18, 0.96)",
                  border: "1px solid rgba(230, 174, 78, 0.2)",
                  borderRadius: "10px",
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#ffd47c", margin: 0 }}>
                      {group.name}
                    </h4>
                    <span style={{ fontSize: "11px", color: "#91887d" }}>
                      Số lượng: {group.pills.length} vật phẩm
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      background: "rgba(230, 174, 78, 0.15)",
                      color: "#ffd47c",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      border: "1px solid rgba(230, 174, 78, 0.3)",
                      fontWeight: 600,
                    }}
                  >
                    {group.id}
                  </span>
                </div>

                <p style={{ fontSize: "12px", color: "#c8c0b4", margin: 0, lineHeight: "1.5" }}>
                  {group.description}
                </p>

                <div
                  style={{
                    background: "rgba(5, 4, 3, 0.6)",
                    border: "1px solid rgba(230, 174, 78, 0.15)",
                    borderRadius: "6px",
                    padding: "10px",
                    fontSize: "12px",
                  }}
                >
                  <div style={{ color: "#2ecc71", fontWeight: 700, marginBottom: "4px" }}>
                    Quy tắc cắn trùng / cộng dồn:
                  </div>
                  <div style={{ color: "#ddd5ca", lineHeight: "1.4" }}>
                    {group.stackBehavior}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* POPUP MODAL: CHI TIẾT NGUỒN GỐC & HƯỚNG DẪN SỞ HỮU */}
      {modalPill && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0, 0, 0, 0.78)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setModalPill(null)}
        >
          <div
            style={{
              background: "rgba(22, 17, 13, 0.98)",
              border: "1px solid rgba(230, 174, 78, 0.4)",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "760px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
              display: "flex",
              flexDirection: "column",
              color: "#f7f3ea",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid rgba(230, 174, 78, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(12, 9, 6, 0.9)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <PillIconThumbnail pid={modalPill.pid} name={modalPill.name} size={54} />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#ffd47c",
                        background: "rgba(230, 174, 78, 0.15)",
                        border: "1px solid rgba(230, 174, 78, 0.3)",
                        padding: "2px 6px",
                        borderRadius: "4px",
                      }}
                    >
                      PID: {modalPill.pid}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        ...getGroupBadgeColor(modalPill.groupId),
                        padding: "2px 8px",
                        borderRadius: "4px",
                        border: `1px solid ${getGroupBadgeColor(modalPill.groupId).border}`,
                      }}
                    >
                      {modalPill.groupName}
                    </span>
                  </div>
                  <h2 style={{ fontSize: "20px", fontWeight: 800, margin: 0, color: "#fff" }}>
                    {modalPill.name}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalPill(null)}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(230, 174, 78, 0.2)",
                  color: "#ddd5ca",
                  borderRadius: "8px",
                  padding: "8px",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Effect & Duration Overview */}
              <div
                style={{
                  background: "rgba(10, 8, 6, 0.7)",
                  border: "1px solid rgba(230, 174, 78, 0.2)",
                  borderRadius: "10px",
                  padding: "16px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "14px",
                }}
              >
                <div>
                  <div style={{ fontSize: "12px", color: "#ffd47c", fontWeight: 700, marginBottom: "4px", display: "flex", alignItems: "center", gap: "5px" }}>
                    <Sparkles size={14} /> Tác dụng & Chỉ số:
                  </div>
                  <div style={{ fontSize: "13px", color: "#f7f3ea", lineHeight: "1.5" }}>
                    {modalPill.effectDescription}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "12px", color: "#ffd47c", fontWeight: 700, marginBottom: "4px", display: "flex", alignItems: "center", gap: "5px" }}>
                    <Clock size={14} /> Thời hạn hiệu lực:
                  </div>
                  <div style={{ fontSize: "13px", color: "#f7f3ea" }}>
                    {modalPill.duration}
                  </div>
                </div>
              </div>

              {/* SECTION 1: NƠI BÁN / NƠI XUẤT HIỆN / BÃI DROP */}
              <div>
                <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#ffd47c", margin: "0 0 10px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <MapPin size={17} /> Chi Tiết Nơi Bán & Điểm Drop Trong Game
                </h4>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {modalPill.sourceDetail?.locations && modalPill.sourceDetail.locations.length > 0 ? (
                    modalPill.sourceDetail.locations.map((loc, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: "rgba(28, 23, 18, 0.96)",
                          border: "1px solid rgba(230, 174, 78, 0.2)",
                          borderRadius: "8px",
                          padding: "14px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: 700,
                              background: "rgba(52, 152, 219, 0.15)",
                              color: "#3498db",
                              border: "1px solid rgba(52, 152, 219, 0.35)",
                              padding: "2px 8px",
                              borderRadius: "4px",
                            }}
                          >
                            {loc.type}
                          </span>
                          <strong style={{ color: "#ffd47c", fontSize: "13px" }}>
                            {loc.costOrRate}
                          </strong>
                        </div>

                        <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>
                          {loc.targetName}
                        </div>

                        <div style={{ fontSize: "12px", color: "#c8c0b4", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Compass size={13} style={{ color: "#2ecc71" }} />
                          Vị trí / Bản đồ: <span style={{ color: "#2ecc71", fontWeight: 600 }}>{loc.mapName}</span>
                        </div>

                        <div style={{ fontSize: "12px", color: "#a8a094", marginTop: "2px", lineHeight: "1.4" }}>
                          {loc.details}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: "14px", background: "rgba(0,0,0,0.3)", borderRadius: "8px", fontSize: "13px", color: "#c8c0b4" }}>
                      Vật phẩm rơi từ quái train dã ngoại hoặc nhận qua các sự kiện in-game.
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 2: THÔNG TIN SỰ KIỆN NẾU CÓ */}
              {modalPill.sourceDetail?.eventInfo && (
                <div
                  style={{
                    background: "rgba(241, 196, 15, 0.08)",
                    border: "1px solid rgba(241, 196, 15, 0.25)",
                    borderRadius: "8px",
                    padding: "14px 16px",
                  }}
                >
                  <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#f1c40f", margin: "0 0 6px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Calendar size={15} /> Sự Kiện Liên Quan & Khung Giờ
                  </h4>
                  <p style={{ margin: 0, fontSize: "13px", color: "#e8dfd1", lineHeight: "1.5" }}>
                    {modalPill.sourceDetail.eventInfo}
                  </p>
                </div>
              )}

              {/* SECTION 3: HƯỚNG DẪN SỞ HỮU CHI TIẾT */}
              {modalPill.sourceDetail?.howToGet && (
                <div>
                  <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#ffd47c", margin: "0 0 8px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <FileText size={16} /> Hướng Dẫn Sở Hữu & Mua Trong Game
                  </h4>
                  <div
                    style={{
                      background: "rgba(28, 23, 18, 0.96)",
                      border: "1px solid rgba(230, 174, 78, 0.2)",
                      borderRadius: "8px",
                      padding: "14px 16px",
                      fontSize: "13px",
                      color: "#ddd5ca",
                      lineHeight: "1.6",
                    }}
                  >
                    {modalPill.sourceDetail.howToGet}
                  </div>
                </div>
              )}

              {/* SECTION 4: LỜI KHUYÊN PHỐI HỢP BUFF */}
              {modalPill.sourceDetail?.stackingTips && (
                <div
                  style={{
                    background: "rgba(46, 204, 113, 0.08)",
                    border: "1px solid rgba(46, 204, 113, 0.25)",
                    borderRadius: "8px",
                    padding: "14px 16px",
                  }}
                >
                  <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#2ecc71", margin: "0 0 6px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <ShieldCheck size={15} /> Lời Khuyên Phối Hợp & Cộng Dồn Buff
                  </h4>
                  <p style={{ margin: 0, fontSize: "13px", color: "#d5ecd9", lineHeight: "1.5" }}>
                    {modalPill.sourceDetail.stackingTips}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid rgba(230, 174, 78, 0.2)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(12, 9, 6, 0.9)",
              }}
            >
              <div style={{ fontSize: "12px", color: "#91887d" }}>
                Trạng thái hiện tại:{" "}
                <span style={{ color: modalPill.isLocked ? "#e74c3c" : "#2ecc71", fontWeight: 700 }}>
                  {modalPill.isLocked ? "Đang bị khóa cấm dùng" : "Đang cho phép sử dụng bình thường"}
                </span>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => {
                    handleTogglePill(modalPill);
                    setModalPill((prev) => prev ? { ...prev, isLocked: !prev.isLocked } : null);
                  }}
                  disabled={saving}
                  style={{
                    background: modalPill.isLocked
                      ? "linear-gradient(180deg, #2ecc71, #27ae60)"
                      : "rgba(231, 76, 60, 0.2)",
                    color: modalPill.isLocked ? "#fff" : "#e74c3c",
                    border: `1px solid ${modalPill.isLocked ? "#2ecc71" : "rgba(231, 76, 60, 0.45)"}`,
                    borderRadius: "6px",
                    padding: "8px 16px",
                    fontSize: "12px",
                    fontWeight: 800,
                    cursor: saving ? "not-allowed" : "pointer",
                  }}
                >
                  {modalPill.isLocked ? "Mở Cho Phép Dùng" : "Khóa Cấm Dùng"}
                </button>

                <button
                  type="button"
                  onClick={() => setModalPill(null)}
                  style={{
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(230, 174, 78, 0.25)",
                    color: "#ddd5ca",
                    borderRadius: "6px",
                    padding: "8px 16px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
