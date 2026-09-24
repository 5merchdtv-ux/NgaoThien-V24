"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import {
  MapPin,
  RefreshCw,
  Search,
  Shield,
  Swords,
  Layers,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Flame,
  Crown,
  Compass,
  Sparkles,
  Zap,
  Server,
  ToggleLeft,
  ToggleRight,
  Eye,
  X,
  Sliders,
  ChevronRight,
  Activity,
  Heart,
  ShieldAlert,
} from "lucide-react";

interface GameMapItem {
  mapId: number;
  name: string;
  fileName: string;
  category: string;
  categoryName: string;
  totalMonsters: number;
  enabledMonsters: number;
  disabledMonsters: number;
  totalNpcs: number;
  enabledNpcs: number;
  minLevel: number;
  maxLevel: number;
  monsterSpecies: number;
  status: "enabled" | "disabled" | "partial" | "empty";
  isEnabled: boolean;
}

interface MapMonsterDetail {
  mapId: number;
  monsterPid: number;
  monsterName: string;
  level: number;
  hp: number;
  atk: number;
  def: number;
  spawnCount: number;
  enabledSpawns: number;
  disabledSpawns: number;
  isEnabled: boolean;
}

interface GameMapOverviewStats {
  totalMaps: number;
  enabledMaps: number;
  disabledMaps: number;
  partialMaps: number;
  totalActiveMonsters: number;
  totalInactiveMonsters: number;
}

interface GameMapCategorySummary {
  key: string;
  name: string;
  totalMaps: number;
  enabledMaps: number;
  totalMonsters: number;
}

interface GameMapOverviewResponse {
  success: boolean;
  stats: GameMapOverviewStats;
  categories: GameMapCategorySummary[];
  maps: GameMapItem[];
}

const CATEGORY_TABS = [
  { key: "all", label: "Tất Cả Bản Đồ", icon: Compass },
  { key: "chinh", label: "Bản Đồ Chính", icon: MapPin },
  { key: "thang-thien", label: "Thăng Thiên & Cấp Cao", icon: Flame },
  { key: "pho-ban", label: "Phó Bản & Động Boss", icon: Swords },
  { key: "tu-luyen", label: "Khu Tu Luyện & VIP", icon: Crown },
  { key: "cuu-tuyen", label: "Cửu Tuyền Chi Lộ", icon: Layers },
];

export function MapsManagementTool() {
  const [data, setData] = useState<GameMapOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedChannel, setSelectedChannel] = useState<number>(0); // 0 = Ca 2 Server, 1 = Kenh 1, 2 = Kenh 2
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Modal State for viewing Monsters inside a map
  const [activeModalMap, setActiveModalMap] = useState<GameMapItem | null>(null);
  const [modalMonsters, setModalMonsters] = useState<MapMonsterDetail[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalSearch, setModalSearch] = useState("");

  const showNotification = (text: string, type: "success" | "error" | "info" = "success") => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 4000);
  };

  const fetchMaps = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/gm/maps", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Lỗi tải danh sách bản đồ (${res.status})`);
      }

      const json: GameMapOverviewResponse = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Không thể kết nối dịch vụ quản lý bản đồ GameServer.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaps();
  }, []);

  // Fetch monsters when modal is opened
  const openMonsterModal = async (mapItem: GameMapItem) => {
    setActiveModalMap(mapItem);
    setModalLoading(true);
    setModalSearch("");
    try {
      const res = await fetch(`/api/gm/maps?mapId=${mapItem.mapId}&action=monsters`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Không thể tải danh sách quái trong bản đồ");
      }
      const json = await res.json();
      setModalMonsters(json.monsters || json.Monsters || []);
    } catch (err: any) {
      showNotification(err.message || "Lỗi tải chi tiết quái.", "error");
    } finally {
      setModalLoading(false);
    }
  };

  const closeMonsterModal = () => {
    setActiveModalMap(null);
    setModalMonsters([]);
  };

  // Toggle single map
  const handleToggleMap = (mapId: number, currentEnabled: boolean) => {
    const nextState = !currentEnabled;
    startTransition(async () => {
      try {
        // Optimistic UI Update
        if (data) {
          setData({
            ...data,
            maps: data.maps.map((m) => {
              if (m.mapId === mapId) {
                return {
                  ...m,
                  enabledMonsters: nextState ? m.totalMonsters : 0,
                  disabledMonsters: nextState ? 0 : m.totalMonsters,
                  status: nextState ? "enabled" : "disabled",
                  isEnabled: nextState,
                };
              }
              return m;
            }),
          });
        }

        const res = await fetch("/api/gm/maps?action=toggle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mapId, isEnabled: nextState }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Không thể đổi trạng thái bản đồ");
        }

        const resJson = await res.json();
        showNotification(resJson.message || `Đã ${nextState ? "BẬT" : "TẮT"} quái map ${mapId} thành công! Nhớ bấm 'Tải Lại Bãi Quái' để áp dụng.`);
        fetchMaps(); // sync accurate counts
      } catch (err: any) {
        showNotification(err.message || "Lỗi cập nhật trạng thái bản đồ.", "error");
        fetchMaps();
      }
    });
  };

  // Toggle monster inside map modal
  const handleToggleMonster = (mapId: number, monsterPid: number, currentEnabled: boolean) => {
    const nextState = !currentEnabled;
    startTransition(async () => {
      try {
        // Optimistic modal update
        setModalMonsters((prev) =>
          prev.map((mon) => {
            if (mon.monsterPid === monsterPid) {
              return {
                ...mon,
                enabledSpawns: nextState ? mon.spawnCount : 0,
                disabledSpawns: nextState ? 0 : mon.spawnCount,
                isEnabled: nextState,
              };
            }
            return mon;
          })
        );

        const res = await fetch("/api/gm/maps?action=toggle-monster", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mapId, monsterPid, isEnabled: nextState }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Không thể cập nhật quái");
        }

        const resJson = await res.json();
        showNotification(resJson.message || `Đã ${nextState ? "BẬT" : "TẮT"} quái PID ${monsterPid}. Bấm 'Tải Lại Bãi Quái' để có hiệu lực.`);
        fetchMaps();
      } catch (err: any) {
        showNotification(err.message || "Lỗi cập nhật quái.", "error");
      }
    });
  };

  // Toggle category
  const handleToggleCategory = (categoryKey: string, isEnabled: boolean) => {
    const catTab = CATEGORY_TABS.find((c) => c.key === categoryKey);
    const catName = catTab ? catTab.label : categoryKey;
    if (!confirm(`Bạn có chắc chắn muốn ${isEnabled ? "BẬT TOÀN BỘ" : "TẮT TOÀN BỘ"} quái trong nhóm [${catName}] không?`)) {
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/gm/maps?action=toggle-category", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: categoryKey, isEnabled }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Không thể cập nhật nhóm bản đồ");
        }

        const resJson = await res.json();
        showNotification(resJson.message || `Đã ${isEnabled ? "BẬT" : "TẮT"} nhóm bản đồ [${catName}] thành công!`);
        fetchMaps();
      } catch (err: any) {
        showNotification(err.message || "Lỗi cập nhật nhóm bản đồ.", "error");
      }
    });
  };

  // Toggle all maps
  const handleToggleAll = (isEnabled: boolean) => {
    if (
      !confirm(
        `CẢNH BÁO GM: Bạn có chắc chắn muốn ${
          isEnabled ? "BẬT TOÀN BỘ (tất cả quái 40+ Map)" : "TẮT TOÀN BỘ (xóa sạch quái trên toàn server)"
        } không?`
      )
    ) {
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/gm/maps?action=toggle-all", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isEnabled }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Không thể cập nhật toàn bộ bản đồ");
        }

        const resJson = await res.json();
        showNotification(resJson.message || `Đã ${isEnabled ? "BẬT" : "TẮT"} toàn bộ quái tất cả bản đồ thành công!`);
        fetchMaps();
      } catch (err: any) {
        showNotification(err.message || "Lỗi cập nhật toàn bộ bản đồ.", "error");
      }
    });
  };

  // Reload NPC into GameServer memory via named pipe
  const handleReloadNpc = () => {
    const targetText = selectedChannel === 0 ? "Cả 2 Server (Kênh 1 & Kênh 2)" : selectedChannel === 1 ? "Kênh 1" : "Kênh 2";

    startTransition(async () => {
      try {
        showNotification(`Đang gửi lệnh tải lại bãi quái (Reload NPC) cho ${targetText}...`, "info");
        const res = await fetch("/api/gm/maps?action=reload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channel: selectedChannel }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Không thể yêu cầu GameServer tải lại bãi quái");
        }

        const resJson = await res.json();
        showNotification(resJson.message || `Đã nạp lại bãi quái cho ${targetText} thành công! Quái mới đã xuất hiện ngay lập tức.`);
      } catch (err: any) {
        showNotification(err.message || "Lỗi gửi lệnh nạp lại bãi quái.", "error");
      }
    });
  };

  // Filtered map list
  const filteredMaps = useMemo(() => {
    if (!data?.maps) return [];
    return data.maps.filter((map) => {
      // Category filter
      if (selectedCategory !== "all" && map.category !== selectedCategory) {
        return false;
      }
      // Status filter
      if (statusFilter === "enabled" && map.status !== "enabled") return false;
      if (statusFilter === "disabled" && map.status !== "disabled") return false;
      if (statusFilter === "partial" && map.status !== "partial") return false;
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = map.name.toLowerCase().includes(q);
        const matchId = map.mapId.toString().includes(q);
        const matchFile = map.fileName.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchFile) return false;
      }
      return true;
    });
  }, [data, selectedCategory, statusFilter, searchQuery]);

  // Filtered monsters in modal
  const filteredModalMonsters = useMemo(() => {
    if (!modalMonsters) return [];
    if (!modalSearch.trim()) return modalMonsters;
    const q = modalSearch.toLowerCase().trim();
    return modalMonsters.filter(
      (m) => m.monsterName.toLowerCase().includes(q) || m.monsterPid.toString().includes(q) || m.level.toString().includes(q)
    );
  }, [modalMonsters, modalSearch]);

  const stats = data?.stats;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", color: "#f7f3ea" }}>
      {/* Toast Notification */}
      {actionMessage && (
        <div
          style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            zIndex: 9999,
            padding: "14px 20px",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
            background:
              actionMessage.type === "success"
                ? "linear-gradient(135deg, rgba(16,185,129,0.95), rgba(5,150,105,0.95))"
                : actionMessage.type === "error"
                ? "linear-gradient(135deg, rgba(239,68,68,0.95), rgba(185,28,28,0.95))"
                : "linear-gradient(135deg, rgba(59,130,246,0.95), rgba(29,78,216,0.95))",
            color: "#ffffff",
            border: "1px solid rgba(255,255,255,0.25)",
            animation: "slideInRight 0.3s ease-out",
          }}
        >
          {actionMessage.type === "success" && <CheckCircle2 size={18} />}
          {actionMessage.type === "error" && <AlertTriangle size={18} />}
          {actionMessage.type === "info" && <Zap size={18} />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(180deg, rgba(32, 25, 18, 0.95) 0%, rgba(18, 14, 10, 0.98) 100%)",
          border: "1px solid rgba(230, 174, 78, 0.3)",
          borderRadius: "14px",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.45)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <div
                style={{
                  background: "linear-gradient(135deg, #f3c968, #bd7528)",
                  padding: "8px",
                  borderRadius: "8px",
                  color: "#25180a",
                  display: "flex",
                }}
              >
                <Compass size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#ffd47c", margin: 0, letterSpacing: "0.5px" }}>
                  QUẢN LÝ BÃI QUÁI & BẢN ĐỒ TOÀN SERVER
                </h1>
                <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#c8c0b4" }}>
                  Bật / Tắt quái từng Bản Đồ, xem chi tiết từng loài quái (PID, Level, HP, Atk, Def) và Tải Lại Bãi Quái (Reload NPC) trực tiếp vào GameServer.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions / Channel Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {/* Server Selector */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "rgba(0, 0, 0, 0.6)",
                border: "1px solid rgba(230, 174, 78, 0.35)",
                borderRadius: "8px",
                padding: "4px 10px",
                gap: "8px",
              }}
            >
              <Server size={16} color="#ffd47c" />
              <span style={{ fontSize: "12px", color: "#c8c0b4", fontWeight: 600 }}>Máy chủ:</span>
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(Number(e.target.value))}
                style={{
                  background: "transparent",
                  color: "#ffd47c",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                <option value={0} style={{ background: "#1a1510", color: "#ffd47c" }}>
                  Cả 2 Server (K1 & K2)
                </option>
                <option value={2} style={{ background: "#1a1510", color: "#ffd47c" }}>
                  Kênh 2 (Test & Dev)
                </option>
                <option value={1} style={{ background: "#1a1510", color: "#ffd47c" }}>
                  Kênh 1 (Chính thức)
                </option>
              </select>
            </div>

            {/* Reload NPC Button */}
            <button
              type="button"
              onClick={handleReloadNpc}
              disabled={isPending}
              style={{
                background: "linear-gradient(180deg, #f3c968, #bd7528)",
                color: "#25180a",
                border: "1px solid #ffd57d",
                padding: "8px 16px",
                borderRadius: "8px",
                fontWeight: 800,
                fontSize: "13px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 2px 10px rgba(243, 201, 104, 0.3)",
              }}
            >
              <Zap size={16} />
              <span>Nạp Lại Bãi Quái (Reload NPC)</span>
            </button>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={fetchMaps}
              disabled={loading || isPending}
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                color: "#ddd5ca",
                border: "1px solid rgba(230, 174, 78, 0.25)",
                padding: "8px 14px",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <RefreshCw size={15} className={loading ? "spin-icon" : ""} />
              <span>Làm mới</span>
            </button>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
          {/* Stat 1: Total Maps */}
          <div
            style={{
              background: "rgba(18, 14, 10, 0.8)",
              border: "1px solid rgba(230, 174, 78, 0.2)",
              borderRadius: "10px",
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div style={{ background: "rgba(230, 174, 78, 0.15)", padding: "10px", borderRadius: "8px", color: "#ffd47c" }}>
              <Compass size={22} />
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#91887d", fontWeight: 600, textTransform: "uppercase" }}>Tổng Bản Đồ Có Quái</div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#ffd47c" }}>{stats?.totalMaps ?? "..."} <span style={{ fontSize: "13px", fontWeight: 500, color: "#c8c0b4" }}>Map</span></div>
            </div>
          </div>

          {/* Stat 2: Enabled Maps */}
          <div
            style={{
              background: "rgba(18, 14, 10, 0.8)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              borderRadius: "10px",
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div style={{ background: "rgba(16, 185, 129, 0.15)", padding: "10px", borderRadius: "8px", color: "#10b981" }}>
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#91887d", fontWeight: 600, textTransform: "uppercase" }}>Bản Đồ Đang Bật</div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#10b981" }}>{stats?.enabledMaps ?? "..."} <span style={{ fontSize: "13px", fontWeight: 500, color: "#c8c0b4" }}>Map</span></div>
            </div>
          </div>

          {/* Stat 3: Disabled Maps */}
          <div
            style={{
              background: "rgba(18, 14, 10, 0.8)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "10px",
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div style={{ background: "rgba(239, 68, 68, 0.15)", padding: "10px", borderRadius: "8px", color: "#ef4444" }}>
              <XCircle size={22} />
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#91887d", fontWeight: 600, textTransform: "uppercase" }}>Bản Đồ Đang Tắt</div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#ef4444" }}>{stats?.disabledMaps ?? "..."} <span style={{ fontSize: "13px", fontWeight: 500, color: "#c8c0b4" }}>Map</span></div>
            </div>
          </div>

          {/* Stat 4: Active Monsters */}
          <div
            style={{
              background: "rgba(18, 14, 10, 0.8)",
              border: "1px solid rgba(243, 201, 104, 0.3)",
              borderRadius: "10px",
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div style={{ background: "rgba(243, 201, 104, 0.15)", padding: "10px", borderRadius: "8px", color: "#ffd47c" }}>
              <Swords size={22} />
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#91887d", fontWeight: 600, textTransform: "uppercase" }}>Quái Vật Hoạt Động</div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#ffd47c" }}>
                {stats?.totalActiveMonsters?.toLocaleString("vi-VN") ?? "..."}
                <span style={{ fontSize: "12px", fontWeight: 500, color: "#91887d", marginLeft: "4px" }}>
                  / {((stats?.totalActiveMonsters ?? 0) + (stats?.totalInactiveMonsters ?? 0)).toLocaleString("vi-VN")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div
        style={{
          background: "rgba(28, 23, 18, 0.96)",
          border: "1px solid rgba(230, 174, 78, 0.2)",
          borderRadius: "14px",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
        {/* Category Tabs Bar */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            borderBottom: "1px solid rgba(230, 174, 78, 0.2)",
            paddingBottom: "12px",
            overflowX: "auto",
          }}
        >
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedCategory === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedCategory(tab.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  border: isSelected ? "1px solid #ffd57d" : "1px solid rgba(230, 174, 78, 0.15)",
                  background: isSelected
                    ? "linear-gradient(180deg, #f0c35e, #b86e24)"
                    : "rgba(255, 255, 255, 0.03)",
                  color: isSelected ? "#180f05" : "#c8c0b4",
                  fontWeight: isSelected ? 800 : 600,
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap",
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {tab.key !== "all" && data?.categories && (
                  <span
                    style={{
                      background: isSelected ? "rgba(0,0,0,0.25)" : "rgba(230, 174, 78, 0.15)",
                      color: isSelected ? "#ffffff" : "#ffd47c",
                      padding: "2px 7px",
                      borderRadius: "10px",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    {data.categories.find((c) => c.key === tab.key)?.totalMaps ?? 0}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Filters & Batch Actions Controls Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "14px",
            background: "rgba(10, 8, 6, 0.6)",
            padding: "14px 18px",
            borderRadius: "10px",
            border: "1px solid rgba(230, 174, 78, 0.15)",
          }}
        >
          {/* Search Box */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "260px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(5, 4, 3, 0.7)",
                border: "1px solid rgba(230, 174, 78, 0.26)",
                borderRadius: "8px",
                padding: "8px 14px",
                width: "100%",
                maxWidth: "360px",
              }}
            >
              <Search size={16} color="#ffd47c" />
              <input
                type="text"
                placeholder="Tìm tên map, ID map (vd: 101, Tam Tà, HB)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#f7f3ea",
                  outline: "none",
                  fontSize: "13px",
                  width: "100%",
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  style={{ background: "none", border: "none", color: "#91887d", cursor: "pointer" }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                background: "rgba(5, 4, 3, 0.7)",
                color: "#f7f3ea",
                border: "1px solid rgba(230, 174, 78, 0.26)",
                borderRadius: "8px",
                padding: "8px 12px",
                fontSize: "13px",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="enabled">Chỉ map Đang Bật</option>
              <option value="disabled">Chỉ map Đang Tắt</option>
              <option value="partial">Bật một phần</option>
            </select>
          </div>

          {/* Batch Actions for Current View / All */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {selectedCategory !== "all" && (
              <>
                <button
                  type="button"
                  onClick={() => handleToggleCategory(selectedCategory, true)}
                  disabled={isPending}
                  style={{
                    background: "rgba(16, 185, 129, 0.15)",
                    color: "#10b981",
                    border: "1px solid rgba(16, 185, 129, 0.35)",
                    padding: "7px 12px",
                    borderRadius: "7px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <CheckCircle2 size={14} />
                  <span>Bật nhóm này</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleCategory(selectedCategory, false)}
                  disabled={isPending}
                  style={{
                    background: "rgba(239, 68, 68, 0.15)",
                    color: "#ef4444",
                    border: "1px solid rgba(239, 68, 68, 0.35)",
                    padding: "7px 12px",
                    borderRadius: "7px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <XCircle size={14} />
                  <span>Tắt nhóm này</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => handleToggleAll(true)}
              disabled={isPending}
              style={{
                background: "rgba(230, 174, 78, 0.15)",
                color: "#ffd47c",
                border: "1px solid rgba(230, 174, 78, 0.35)",
                padding: "7px 12px",
                borderRadius: "7px",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Sparkles size={14} />
              <span>Bật Toàn Bộ Map</span>
            </button>

            <button
              type="button"
              onClick={() => handleToggleAll(false)}
              disabled={isPending}
              style={{
                background: "rgba(239, 68, 68, 0.15)",
                color: "#ef4444",
                border: "1px solid rgba(239, 68, 68, 0.35)",
                padding: "7px 12px",
                borderRadius: "7px",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <ShieldAlert size={14} />
              <span>Tắt Toàn Bộ Map</span>
            </button>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div style={{ textAlign: "center", padding: "40px", color: "#c8c0b4" }}>
            <RefreshCw size={32} className="spin-icon" style={{ margin: "0 auto 12px auto", color: "#ffd47c" }} />
            <div>Đang tải dữ liệu bản đồ & bãi quái toàn server...</div>
          </div>
        )}

        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "8px",
              padding: "16px",
              color: "#ef4444",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <AlertTriangle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredMaps.length === 0 && (
          <div style={{ textAlign: "center", padding: "50px 20px", color: "#91887d" }}>
            <Compass size={48} style={{ margin: "0 auto 12px auto", opacity: 0.5 }} />
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#c8c0b4" }}>Không tìm thấy bản đồ nào</div>
            <div style={{ fontSize: "13px", marginTop: "6px" }}>Vui lòng kiểm tra lại bộ lọc hoặc từ khóa tìm kiếm.</div>
          </div>
        )}

        {/* Maps Grid */}
        {!loading && !error && filteredMaps.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
              gap: "18px",
            }}
          >
            {filteredMaps.map((map) => {
              const percent = map.totalMonsters > 0 ? Math.round((map.enabledMonsters / map.totalMonsters) * 100) : 0;
              const isFullyOn = map.status === "enabled";
              const isFullyOff = map.status === "disabled";
              const isPartial = map.status === "partial";

              return (
                <div
                  key={map.mapId}
                  style={{
                    background: isFullyOn
                      ? "linear-gradient(180deg, rgba(22, 38, 28, 0.85) 0%, rgba(14, 24, 18, 0.95) 100%)"
                      : isPartial
                      ? "linear-gradient(180deg, rgba(38, 32, 18, 0.85) 0%, rgba(24, 20, 12, 0.95) 100%)"
                      : "linear-gradient(180deg, rgba(28, 23, 18, 0.85) 0%, rgba(18, 14, 10, 0.95) 100%)",
                    border: isFullyOn
                      ? "1px solid rgba(16, 185, 129, 0.4)"
                      : isPartial
                      ? "1px solid rgba(245, 158, 11, 0.4)"
                      : "1px solid rgba(230, 174, 78, 0.2)",
                    borderRadius: "12px",
                    padding: "18px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                    position: "relative",
                    boxShadow: isFullyOn
                      ? "0 4px 20px rgba(16, 185, 129, 0.1)"
                      : "0 4px 15px rgba(0, 0, 0, 0.3)",
                    transition: "all 0.2s ease",
                  }}
                >
                  {/* Card Top: Name, ID, Category Badge, Switch */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                        <span
                          style={{
                            background: "rgba(230, 174, 78, 0.2)",
                            color: "#ffd47c",
                            padding: "2px 6px",
                            borderRadius: "5px",
                            fontSize: "11px",
                            fontWeight: 800,
                          }}
                        >
                          MID: {map.mapId}
                        </span>
                        <span
                          style={{
                            background: "rgba(255, 255, 255, 0.06)",
                            color: "#91887d",
                            padding: "2px 6px",
                            borderRadius: "5px",
                            fontSize: "11px",
                          }}
                        >
                          {map.fileName}
                        </span>
                      </div>

                      <h3 style={{ margin: "4px 0", fontSize: "16px", fontWeight: 800, color: isFullyOn ? "#a7f3d0" : "#ffd47c" }}>
                        {map.name}
                      </h3>
                      <div style={{ fontSize: "12px", color: "#c8c0b4" }}>{map.categoryName}</div>
                    </div>

                    {/* Master Switch for This Map */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                      <button
                        type="button"
                        onClick={() => handleToggleMap(map.mapId, map.isEnabled)}
                        disabled={isPending}
                        title={`Bấm để ${map.isEnabled ? "TẮT" : "BẬT"} toàn bộ quái bản đồ ${map.name}`}
                        style={{
                          background: isFullyOn
                            ? "linear-gradient(180deg, #10b981, #059669)"
                            : isPartial
                            ? "linear-gradient(180deg, #f59e0b, #d97706)"
                            : "rgba(255, 255, 255, 0.1)",
                          color: isFullyOn || isPartial ? "#ffffff" : "#91887d",
                          border: isFullyOn
                            ? "1px solid #34d399"
                            : isPartial
                            ? "1px solid #fbbf24"
                            : "1px solid rgba(255, 255, 255, 0.2)",
                          padding: "6px 14px",
                          borderRadius: "20px",
                          fontWeight: 800,
                          fontSize: "12px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          boxShadow: isFullyOn ? "0 2px 10px rgba(16, 185, 129, 0.3)" : "none",
                        }}
                      >
                        {isFullyOn ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        <span>{isFullyOn ? "BẬT" : isPartial ? "MỘT PHẦN" : "TẮT"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Monster Count Progress Bar */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                      <span style={{ color: "#c8c0b4" }}>Số quái hoạt động:</span>
                      <span style={{ fontWeight: 700, color: isFullyOn ? "#10b981" : isPartial ? "#f59e0b" : "#ef4444" }}>
                        {map.enabledMonsters.toLocaleString("vi-VN")} / {map.totalMonsters.toLocaleString("vi-VN")} quái ({percent}%)
                      </span>
                    </div>

                    <div
                      style={{
                        height: "8px",
                        background: "rgba(0, 0, 0, 0.5)",
                        borderRadius: "4px",
                        overflow: "hidden",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${percent}%`,
                          background: isFullyOn
                            ? "linear-gradient(90deg, #10b981, #34d399)"
                            : isPartial
                            ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                            : "#ef4444",
                          borderRadius: "4px",
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                  </div>

                  {/* Level Range & Species Badges */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "8px",
                      background: "rgba(0, 0, 0, 0.35)",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid rgba(230, 174, 78, 0.1)",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "11px", color: "#91887d" }}>Dải Cấp Độ Quái</div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#ffd47c" }}>
                        {map.minLevel > 0 ? `Lv ${map.minLevel} - ${map.maxLevel}` : "Không có quái"}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "#91887d" }}>Số Loài Quái</div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#f7f3ea" }}>
                        {map.monsterSpecies} loài
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action: View Details Modal */}
                  <button
                    type="button"
                    onClick={() => openMonsterModal(map)}
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      color: "#ffd47c",
                      border: "1px solid rgba(230, 174, 78, 0.25)",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Sliders size={14} />
                    <span>Xem & Chỉnh Từng Loài Quái ({map.monsterSpecies})</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: Detailed Monster Inspector & Individual Switches */}
      {activeModalMap && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(6px)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "linear-gradient(180deg, rgba(28, 23, 18, 0.98) 0%, rgba(18, 14, 10, 1) 100%)",
              border: "1px solid rgba(230, 174, 78, 0.4)",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "880px",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.8)",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid rgba(230, 174, 78, 0.2)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(0, 0, 0, 0.4)",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span
                    style={{
                      background: "rgba(230, 174, 78, 0.25)",
                      color: "#ffd47c",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 800,
                    }}
                  >
                    MID: {activeModalMap.mapId}
                  </span>
                  <span style={{ fontSize: "12px", color: "#91887d" }}>{activeModalMap.fileName}</span>
                </div>
                <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#ffd47c" }}>
                  {activeModalMap.name} — Danh Sách Quái Vật
                </h2>
              </div>

              <button
                type="button"
                onClick={closeMonsterModal}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "none",
                  borderRadius: "8px",
                  color: "#c8c0b4",
                  padding: "8px",
                  cursor: "pointer",
                  display: "flex",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Controls Bar */}
            <div
              style={{
                padding: "14px 24px",
                background: "rgba(0, 0, 0, 0.2)",
                borderBottom: "1px solid rgba(230, 174, 78, 0.15)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              {/* Search Inside Modal */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(5, 4, 3, 0.7)",
                  border: "1px solid rgba(230, 174, 78, 0.26)",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  width: "280px",
                }}
              >
                <Search size={14} color="#ffd47c" />
                <input
                  type="text"
                  placeholder="Lọc quái theo tên, PID, level..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#f7f3ea",
                    outline: "none",
                    fontSize: "12px",
                    width: "100%",
                  }}
                />
              </div>

              {/* Action: Reload NPC inside modal */}
              <button
                type="button"
                onClick={handleReloadNpc}
                disabled={isPending}
                style={{
                  background: "linear-gradient(180deg, #f3c968, #bd7528)",
                  color: "#25180a",
                  border: "1px solid #ffd57d",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontWeight: 800,
                  fontSize: "12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Zap size={14} />
                <span>Nạp Lại NPC Ngay</span>
              </button>
            </div>

            {/* Modal Body: List / Table of Monsters */}
            <div style={{ padding: "16px 24px", overflowY: "auto", flex: 1 }}>
              {modalLoading && (
                <div style={{ textAlign: "center", padding: "40px", color: "#c8c0b4" }}>
                  <RefreshCw size={28} className="spin-icon" style={{ margin: "0 auto 10px auto", color: "#ffd47c" }} />
                  <div>Đang tải chi tiết quái...</div>
                </div>
              )}

              {!modalLoading && filteredModalMonsters.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px", color: "#91887d" }}>
                  Không tìm thấy quái phù hợp.
                </div>
              )}

              {!modalLoading && filteredModalMonsters.length > 0 && (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(230, 174, 78, 0.2)", color: "#ffd47c", textAlign: "left" }}>
                      <th style={{ padding: "10px" }}>PID</th>
                      <th style={{ padding: "10px" }}>Tên Quái</th>
                      <th style={{ padding: "10px" }}>Cấp Độ</th>
                      <th style={{ padding: "10px" }}>Máu (HP)</th>
                      <th style={{ padding: "10px" }}>Tấn Công / Thủ</th>
                      <th style={{ padding: "10px" }}>Điểm Xuất Hiện</th>
                      <th style={{ padding: "10px", textAlign: "right" }}>Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredModalMonsters.map((mon) => {
                      const isOn = mon.isEnabled;
                      return (
                        <tr
                          key={mon.monsterPid}
                          style={{
                            borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                            background: isOn ? "rgba(16, 185, 129, 0.04)" : "transparent",
                          }}
                        >
                          <td style={{ padding: "10px", fontWeight: 700, color: "#ffd47c" }}>{mon.monsterPid}</td>
                          <td style={{ padding: "10px", fontWeight: 700, color: "#f7f3ea" }}>
                            {mon.monsterName || `Quái vật ${mon.monsterPid}`}
                          </td>
                          <td style={{ padding: "10px" }}>
                            <span
                              style={{
                                background: "rgba(230, 174, 78, 0.15)",
                                color: "#ffd47c",
                                padding: "2px 8px",
                                borderRadius: "4px",
                                fontWeight: 700,
                              }}
                            >
                              Lv {mon.level}
                            </span>
                          </td>
                          <td style={{ padding: "10px", color: "#f87171", fontWeight: 600 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              <Heart size={13} />
                              <span>{mon.hp.toLocaleString("vi-VN")}</span>
                            </div>
                          </td>
                          <td style={{ padding: "10px", color: "#c8c0b4" }}>
                            <span style={{ color: "#fb923c" }}>{mon.atk}</span> /{" "}
                            <span style={{ color: "#60a5fa" }}>{mon.def}</span>
                          </td>
                          <td style={{ padding: "10px" }}>
                            <span style={{ fontWeight: 700, color: isOn ? "#10b981" : "#ef4444" }}>
                              {mon.enabledSpawns}
                            </span>{" "}
                            / {mon.spawnCount} điểm
                          </td>
                          <td style={{ padding: "10px", textAlign: "right" }}>
                            <button
                              type="button"
                              onClick={() => handleToggleMonster(mon.mapId, mon.monsterPid, mon.isEnabled)}
                              disabled={isPending}
                              style={{
                                background: isOn ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
                                color: isOn ? "#10b981" : "#ef4444",
                                border: isOn ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid rgba(239, 68, 68, 0.4)",
                                padding: "4px 12px",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: 700,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              {isOn ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                              <span>{isOn ? "BẬT" : "TẮT"}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "14px 24px",
                borderTop: "1px solid rgba(230, 174, 78, 0.2)",
                background: "rgba(0, 0, 0, 0.4)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: "12px", color: "#91887d" }}>
                Ghi chú: Sau khi Bật/Tắt quái, hãy bấm <strong>Nạp Lại NPC Ngay</strong> để máy chủ áp dụng tức thì.
              </div>
              <button
                type="button"
                onClick={closeMonsterModal}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  color: "#ddd5ca",
                  border: "1px solid rgba(230, 174, 78, 0.25)",
                  padding: "6px 16px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
