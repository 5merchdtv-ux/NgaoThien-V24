"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  Copy,
  Crown,
  Flame,
  Gamepad2,
  Lock,
  Power,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  Sparkles,
  Swords,
  Unlock,
  Wrench,
  Zap,
} from "lucide-react";

export type GameCommandItem = {
  id: string;
  prefix: string;
  command: string;
  aliases: string[];
  category: string;
  categoryName: string;
  name: string;
  description: string;
  syntax: string;
  roleRequired: string;
  isEnabled: boolean;
  note: string;
};

export type GameCommandCategoryGroup = {
  key: string;
  name: string;
  icon: string;
  total: number;
  enabled: number;
  disabled: number;
};

export type GameCommandStats = {
  total: number;
  enabled: number;
  disabled: number;
  gmCount: number;
  playerCount: number;
};

export type GameCommandApiResponse = {
  success: boolean;
  message?: string;
  stats: GameCommandStats;
  categories: GameCommandCategoryGroup[];
  commands: GameCommandItem[];
};

export default function GameCommandsTool() {
  const [data, setData] = useState<GameCommandApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3500);
  }, []);

  const loadCommands = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const res = await fetch("/api/gm/game-commands", { cache: "no-store" });
      if (!res.ok) throw new Error("Không thể tải danh sách lệnh.");
      const json: GameCommandApiResponse = await res.json();
      if (json.success) {
        setData(json);
      } else {
        throw new Error(json.message || "Lỗi đọc dữ liệu lệnh.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi kết nối.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadCommands(false);
  }, [loadCommands]);

  const handleToggleSingle = async (cmd: GameCommandItem) => {
    const nextState = !cmd.isEnabled;
    setUpdatingId(cmd.id);

    // Optimistic UI update
    setData((prev) => {
      if (!prev) return prev;
      const updatedCmds = prev.commands.map((c) =>
        c.id === cmd.id ? { ...c, isEnabled: nextState } : c
      );
      const enabled = updatedCmds.filter((c) => c.isEnabled).length;
      const disabled = updatedCmds.length - enabled;
      return {
        ...prev,
        stats: { ...prev.stats, enabled, disabled },
        commands: updatedCmds,
      };
    });

    try {
      const res = await fetch("/api/gm/game-commands?action=toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cmd.id, isEnabled: nextState }),
      });
      const json: GameCommandApiResponse = await res.json();
      if (json.success) {
        setData(json);
        showToast(
          nextState
            ? `Đã MỞ lệnh [${cmd.command}] thành công.`
            : `Đã KHÓA lệnh [${cmd.command}]. Người chơi gõ chat sẽ bị chặn.`
        );
      } else {
        throw new Error(json.message || "Không thể đổi trạng thái.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi cập nhật.";
      showToast(msg, "error");
      void loadCommands(true); // Revert on failure
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleCategory = async (catKey: string, enable: boolean) => {
    if (!confirm(`Bạn có chắc muốn ${enable ? "BẬT TOÀN BỘ" : "TẮT TOÀN BỘ"} lệnh thuộc nhóm này?`)) return;
    setBatchLoading(true);
    try {
      const res = await fetch("/api/gm/game-commands?action=toggle-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: catKey, isEnabled: enable }),
      });
      const json: GameCommandApiResponse = await res.json();
      if (json.success) {
        setData(json);
        showToast(`Đã ${enable ? "MỞ" : "KHÓA"} toàn bộ lệnh trong danh mục thành công.`);
      } else {
        throw new Error(json.message || "Lỗi cập nhật nhóm.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi cập nhật.";
      showToast(msg, "error");
    } finally {
      setBatchLoading(false);
    }
  };

  const handleToggleAll = async (enable: boolean) => {
    if (!confirm(`CẢNH BÁO: Bạn có chắc muốn ${enable ? "MỞ TẤT CẢ" : "KHÓA TẤT CẢ"} toàn bộ hơn 50 lệnh trong game?`)) return;
    setBatchLoading(true);
    try {
      const res = await fetch("/api/gm/game-commands?action=toggle-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: enable }),
      });
      const json: GameCommandApiResponse = await res.json();
      if (json.success) {
        setData(json);
        showToast(`Đã ${enable ? "MỞ TOÀN BỘ" : "KHÓA TOÀN BỘ"} tất cả các lệnh trong game!`);
      } else {
        throw new Error(json.message || "Lỗi cập nhật toàn bộ.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi cập nhật.";
      showToast(msg, "error");
    } finally {
      setBatchLoading(false);
    }
  };

  const handleSyncGameServer = async () => {
    setBatchLoading(true);
    try {
      const res = await fetch("/api/gm/game-commands?action=sync", {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        showToast("Đã gửi lệnh đồng bộ danh sách khóa tức thì vào GameServer!");
      } else {
        throw new Error(json.message || "Lỗi đồng bộ.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi đồng bộ.";
      showToast(msg, "error");
    } finally {
      setBatchLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredCommands = useMemo(() => {
    if (!data?.commands) return [];
    const q = search.trim().toLowerCase();
    return data.commands.filter((cmd) => {
      // Category filter
      if (selectedCategory !== "all" && cmd.category !== selectedCategory) return false;
      // Role filter
      if (selectedRole === "gm" && cmd.category !== "gm") return false;
      if (selectedRole === "player" && cmd.category === "gm") return false;
      // Status filter
      if (selectedStatus === "enabled" && !cmd.isEnabled) return false;
      if (selectedStatus === "disabled" && cmd.isEnabled) return false;
      // Text query
      if (q) {
        const inCmd = cmd.command.toLowerCase().includes(q);
        const inName = cmd.name.toLowerCase().includes(q);
        const inDesc = cmd.description.toLowerCase().includes(q);
        const inSyntax = cmd.syntax.toLowerCase().includes(q);
        const inAliases = cmd.aliases.some((a) => a.toLowerCase().includes(q));
        return inCmd || inName || inDesc || inSyntax || inAliases;
      }
      return true;
    });
  }, [data, search, selectedCategory, selectedRole, selectedStatus]);

  return (
    <div style={{ padding: "0 4px 40px 4px", display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 99999,
            padding: "12px 20px",
            borderRadius: "8px",
            background: toast.type === "error" ? "rgba(145, 36, 31, 0.95)" : "rgba(31, 132, 77, 0.95)",
            color: "#fff",
            border: `1px solid ${toast.type === "error" ? "#e57373" : "#81c784"}`,
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            fontSize: "14px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            animation: "fadeIn 0.2s ease-in-out",
          }}
        >
          {toast.type === "error" ? <ShieldAlert size={18} /> : <Check size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(180deg, rgba(28, 23, 18, 0.96), rgba(18, 14, 10, 0.98))",
          border: "1px solid rgba(230, 174, 78, 0.3)",
          borderRadius: "12px",
          padding: "24px 28px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color: "#e6ae4e",
                background: "rgba(230, 174, 78, 0.12)",
                padding: "3px 10px",
                borderRadius: "4px",
                border: "1px solid rgba(230, 174, 78, 0.25)",
              }}
            >
              HỆ THỐNG ĐIỀU KHIỂN LỆNH CHAT
            </span>
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#ffd47c", margin: "0 0 6px 0", letterSpacing: "0.3px" }}>
            Quản Lý Toàn Bộ Lệnh Chat Trong Game (! & @)
          </h1>
          <p style={{ margin: 0, fontSize: "13px", color: "#c8c0b4", maxWidth: "780px", lineHeight: "1.5" }}>
            Bật/Tắt tức thì từng lệnh chat của người chơi và GM. Khi tắt một lệnh, GameServer sẽ chặn người chơi sử dụng lệnh đó và thông báo lệnh đang tạm khóa.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <button
            type="button"
            onClick={() => void loadCommands(false)}
            disabled={refreshing || loading}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 15px",
              borderRadius: "8px",
              background: "rgba(255, 255, 255, 0.05)",
              color: "#ddd5ca",
              border: "1px solid rgba(230, 174, 78, 0.25)",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <RefreshCw size={15} className={refreshing ? "spin-animation" : ""} />
            <span>Làm Mới</span>
          </button>

          <button
            type="button"
            onClick={() => void handleSyncGameServer()}
            disabled={batchLoading}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 16px",
              borderRadius: "8px",
              background: "linear-gradient(180deg, #f3c968, #bd7528)",
              color: "#25180a",
              border: "1px solid #ffd57d",
              fontSize: "13px",
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 2px 10px rgba(189, 117, 40, 0.3)",
            }}
          >
            <Zap size={15} />
            <span>Đồng Bộ Sang GameServer</span>
          </button>
        </div>
      </div>

      {/* Stats Quick Overview */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "14px",
        }}
      >
        <div
          style={{
            background: "rgba(28, 23, 18, 0.9)",
            border: "1px solid rgba(230, 174, 78, 0.2)",
            borderRadius: "10px",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              background: "rgba(230, 174, 78, 0.15)",
              color: "#ffd47c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Gamepad2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "#91887d", fontWeight: 700, textTransform: "uppercase" }}>
              TỔNG SỐ LỆNH
            </div>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "#f7f3ea" }}>
              {data?.stats.total ?? 0}
            </div>
          </div>
        </div>

        <div
          style={{
            background: "rgba(28, 23, 18, 0.9)",
            border: "1px solid rgba(46, 125, 50, 0.35)",
            borderRadius: "10px",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              background: "rgba(46, 125, 50, 0.2)",
              color: "#81c784",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Unlock size={22} />
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "#81c784", fontWeight: 700, textTransform: "uppercase" }}>
              ĐANG MỞ (HOẠT ĐỘNG)
            </div>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "#a5d6a7" }}>
              {data?.stats.enabled ?? 0}
            </div>
          </div>
        </div>

        <div
          style={{
            background: "rgba(28, 23, 18, 0.9)",
            border: "1px solid rgba(211, 47, 47, 0.35)",
            borderRadius: "10px",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              background: "rgba(211, 47, 47, 0.2)",
              color: "#ef9a9a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Lock size={22} />
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "#ef9a9a", fontWeight: 700, textTransform: "uppercase" }}>
              ĐANG TẠM KHÓA
            </div>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "#ff8a80" }}>
              {data?.stats.disabled ?? 0}
            </div>
          </div>
        </div>

        <div
          style={{
            background: "rgba(28, 23, 18, 0.9)",
            border: "1px solid rgba(230, 174, 78, 0.2)",
            borderRadius: "10px",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              background: "rgba(255, 193, 7, 0.15)",
              color: "#ffd54f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Crown size={22} />
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "#ffd54f", fontWeight: 700, textTransform: "uppercase" }}>
              LỆNH GM (@)
            </div>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "#ffe082" }}>
              {data?.stats.gmCount ?? 0}
            </div>
          </div>
        </div>
      </div>

      {/* Control Filters & Category Tabs */}
      <div
        style={{
          background: "rgba(18, 14, 10, 0.92)",
          border: "1px solid rgba(230, 174, 78, 0.2)",
          borderRadius: "12px",
          padding: "18px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* Top Filter Row: Search & Role / Status filters */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          {/* Search Box */}
          <div
            style={{
              flex: "1 1 300px",
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "14px",
                color: "#91887d",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo lệnh (!move, @tlc), tên, cú pháp hoặc mô tả..."
              style={{
                width: "100%",
                padding: "10px 14px 10px 42px",
                background: "rgba(5, 4, 3, 0.75)",
                border: "1px solid rgba(230, 174, 78, 0.3)",
                borderRadius: "8px",
                color: "#f7f3ea",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            style={{
              padding: "10px 14px",
              background: "rgba(5, 4, 3, 0.75)",
              border: "1px solid rgba(230, 174, 78, 0.3)",
              borderRadius: "8px",
              color: "#f7f3ea",
              fontSize: "13px",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="all">Tất cả Quyền hạn</option>
            <option value="player">Chỉ Lệnh Người Chơi (!)</option>
            <option value="gm">Chỉ Lệnh GM (@)</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              padding: "10px 14px",
              background: "rgba(5, 4, 3, 0.75)",
              border: "1px solid rgba(230, 174, 78, 0.3)",
              borderRadius: "8px",
              color: "#f7f3ea",
              fontSize: "13px",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="all">Tất cả Trạng thái</option>
            <option value="enabled">Chỉ Lệnh Đang Mở (Bật)</option>
            <option value="disabled">Chỉ Lệnh Đang Khóa (Tắt)</option>
          </select>

          {/* Batch Toggle Buttons */}
          <div style={{ display: "flex", gap: "8px", marginLeft: "auto" }}>
            <button
              type="button"
              onClick={() => void handleToggleAll(true)}
              disabled={batchLoading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "9px 14px",
                borderRadius: "6px",
                background: "rgba(46, 125, 50, 0.2)",
                color: "#a5d6a7",
                border: "1px solid rgba(46, 125, 50, 0.4)",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <Unlock size={14} />
              <span>Mở Hết</span>
            </button>
            <button
              type="button"
              onClick={() => void handleToggleAll(false)}
              disabled={batchLoading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "9px 14px",
                borderRadius: "6px",
                background: "rgba(211, 47, 47, 0.2)",
                color: "#ff8a80",
                border: "1px solid rgba(211, 47, 47, 0.4)",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <Lock size={14} />
              <span>Khóa Hết</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", paddingTop: "6px" }}>
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            style={{
              padding: "7px 14px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              border: "1px solid",
              transition: "all 0.15s ease",
              background:
                selectedCategory === "all"
                  ? "linear-gradient(180deg, #f0c35e, #b86e24)"
                  : "rgba(255, 255, 255, 0.04)",
              color: selectedCategory === "all" ? "#180f05" : "#c8c0b4",
              borderColor: selectedCategory === "all" ? "#ffd47c" : "rgba(230, 174, 78, 0.2)",
            }}
          >
            🔥 Tất Cả ({data?.stats.total ?? 0})
          </button>

          {data?.categories.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                style={{
                  padding: "7px 14px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: "1px solid",
                  transition: "all 0.15s ease",
                  background: isSelected
                    ? "linear-gradient(180deg, #f0c35e, #b86e24)"
                    : "rgba(255, 255, 255, 0.04)",
                  color: isSelected ? "#180f05" : "#c8c0b4",
                  borderColor: isSelected ? "#ffd47c" : "rgba(230, 174, 78, 0.2)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                <span
                  style={{
                    fontSize: "10px",
                    padding: "1px 6px",
                    borderRadius: "10px",
                    background: isSelected ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.08)",
                    color: isSelected ? "#180f05" : "#ffd47c",
                  }}
                >
                  {cat.total}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Quick Batch Action Banner (When a specific category is selected) */}
      {selectedCategory !== "all" && (
        <div
          style={{
            background: "rgba(230, 174, 78, 0.06)",
            border: "1px dashed rgba(230, 174, 78, 0.35)",
            borderRadius: "8px",
            padding: "12px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ fontSize: "13px", color: "#f7f3ea" }}>
            Đang lọc danh mục: <strong style={{ color: "#ffd47c" }}>{data?.categories.find((c) => c.key === selectedCategory)?.name}</strong>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={() => void handleToggleCategory(selectedCategory, true)}
              disabled={batchLoading}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                background: "rgba(46, 125, 50, 0.25)",
                color: "#a5d6a7",
                border: "1px solid rgba(46, 125, 50, 0.5)",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Mở Toàn Bộ Nhóm Này
            </button>
            <button
              type="button"
              onClick={() => void handleToggleCategory(selectedCategory, false)}
              disabled={batchLoading}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                background: "rgba(211, 47, 47, 0.25)",
                color: "#ff8a80",
                border: "1px solid rgba(211, 47, 47, 0.5)",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Khóa Toàn Bộ Nhóm Này
            </button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div style={{ padding: "60px", textAlign: "center", color: "#ffd47c" }}>
          <RefreshCw size={28} className="spin-animation" style={{ margin: "0 auto 12px auto" }} />
          <div>Đang tải danh sách lệnh game...</div>
        </div>
      ) : filteredCommands.length === 0 ? (
        <div
          style={{
            padding: "50px 20px",
            textAlign: "center",
            background: "rgba(18, 14, 10, 0.7)",
            borderRadius: "10px",
            border: "1px solid rgba(230, 174, 78, 0.15)",
            color: "#91887d",
          }}
        >
          <Search size={32} style={{ margin: "0 auto 10px auto", opacity: 0.5 }} />
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#f7f3ea" }}>Không tìm thấy lệnh nào phù hợp</div>
          <p style={{ fontSize: "13px", marginTop: "4px" }}>Hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn các bộ lọc.</p>
        </div>
      ) : (
        /* Commands Grid */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
            gap: "14px",
          }}
        >
          {filteredCommands.map((cmd) => {
            const isUpdating = updatingId === cmd.id;
            const isGM = cmd.category === "gm";

            return (
              <div
                key={cmd.id}
                style={{
                  background: cmd.isEnabled
                    ? "rgba(28, 23, 18, 0.95)"
                    : "rgba(20, 16, 14, 0.7)",
                  border: `1px solid ${
                    cmd.isEnabled
                      ? isGM
                        ? "rgba(230, 174, 78, 0.4)"
                        : "rgba(230, 174, 78, 0.22)"
                      : "rgba(211, 47, 47, 0.3)"
                  }`,
                  borderRadius: "10px",
                  padding: "16px 18px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "12px",
                  position: "relative",
                  boxShadow: cmd.isEnabled ? "0 4px 16px rgba(0,0,0,0.3)" : "none",
                  opacity: cmd.isEnabled ? 1 : 0.75,
                  transition: "all 0.2s ease",
                }}
              >
                {/* Card Top: Command Tag & Toggle Switch */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    {/* Command Badge */}
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: "15px",
                        fontWeight: 900,
                        color: isGM ? "#ffd54f" : "#80d8ff",
                        background: isGM ? "rgba(255, 193, 7, 0.15)" : "rgba(2, 136, 209, 0.18)",
                        padding: "3px 9px",
                        borderRadius: "6px",
                        border: `1px solid ${isGM ? "rgba(255, 193, 7, 0.35)" : "rgba(2, 136, 209, 0.35)"}`,
                      }}
                    >
                      {cmd.command}
                    </span>

                    {/* Role Tag */}
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "2px 7px",
                        borderRadius: "4px",
                        background: isGM ? "rgba(230, 174, 78, 0.2)" : "rgba(255, 255, 255, 0.06)",
                        color: isGM ? "#ffd47c" : "#91887d",
                        border: `1px solid ${isGM ? "rgba(230, 174, 78, 0.3)" : "rgba(255, 255, 255, 0.1)"}`,
                      }}
                    >
                      {cmd.roleRequired}
                    </span>

                    {/* Category Tag */}
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#c8c0b4",
                        background: "rgba(255, 255, 255, 0.04)",
                        padding: "2px 7px",
                        borderRadius: "4px",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      {cmd.categoryName}
                    </span>
                  </div>

                  {/* Toggle Switch */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => void handleToggleSingle(cmd)}
                      disabled={isUpdating}
                      title={cmd.isEnabled ? "Bấm để KHÓA lệnh này" : "Bấm để MỞ lệnh này"}
                      style={{
                        position: "relative",
                        width: "56px",
                        height: "28px",
                        borderRadius: "14px",
                        background: cmd.isEnabled
                          ? "linear-gradient(180deg, #2e7d32, #1b5e20)"
                          : "rgba(255, 255, 255, 0.1)",
                        border: `1px solid ${cmd.isEnabled ? "#81c784" : "rgba(211, 47, 47, 0.4)"}`,
                        cursor: "pointer",
                        outline: "none",
                        transition: "all 0.2s ease",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          background: cmd.isEnabled ? "#fff" : "#9e9e9e",
                          boxShadow: "0 2px 5px rgba(0,0,0,0.4)",
                          position: "absolute",
                          left: cmd.isEnabled ? "30px" : "3px",
                          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {isUpdating ? (
                          <RefreshCw size={12} className="spin-animation" style={{ color: "#333" }} />
                        ) : cmd.isEnabled ? (
                          <Check size={13} style={{ color: "#1b5e20", strokeWidth: 3 }} />
                        ) : (
                          <Power size={11} style={{ color: "#424242", strokeWidth: 3 }} />
                        )}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Card Middle: Title & Description */}
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#f7f3ea", marginBottom: "4px" }}>
                    {cmd.name}
                  </div>
                  <div style={{ fontSize: "12.5px", color: "#c8c0b4", lineHeight: "1.45" }}>
                    {cmd.description}
                  </div>
                </div>

                {/* Aliases (if any) */}
                {cmd.aliases.length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", fontSize: "11px" }}>
                    <span style={{ color: "#91887d" }}>Bí danh khác:</span>
                    {cmd.aliases.map((a) => (
                      <span
                        key={a}
                        style={{
                          fontFamily: "monospace",
                          color: "#ffd47c",
                          background: "rgba(230, 174, 78, 0.08)",
                          padding: "1px 5px",
                          borderRadius: "3px",
                          border: "1px solid rgba(230, 174, 78, 0.15)",
                        }}
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                )}

                {/* Card Bottom: Syntax with Copy Button */}
                <div
                  style={{
                    background: "rgba(5, 4, 3, 0.8)",
                    border: "1px solid rgba(230, 174, 78, 0.18)",
                    borderRadius: "6px",
                    padding: "7px 10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                  }}
                >
                  <code
                    style={{
                      fontFamily: "monospace",
                      fontSize: "12px",
                      color: cmd.isEnabled ? "#ffd47c" : "#91887d",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {cmd.syntax}
                  </code>

                  <button
                    type="button"
                    onClick={() => handleCopy(cmd.command, cmd.id)}
                    title="Sao chép lệnh"
                    style={{
                      background: "transparent",
                      border: "none",
                      color: copiedId === cmd.id ? "#81c784" : "#c8c0b4",
                      cursor: "pointer",
                      padding: "2px 4px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {copiedId === cmd.id ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
