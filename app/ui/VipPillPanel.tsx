"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

interface CatalogPill {
  pid: number;
  name: string;
  groupName: string;
  effectDescription: string;
  duration: string;
  itemKind: string;
}

interface VipMember {
  pid: number;
  name: string;
  enabled: boolean;
  note: string;
  addedAt: string;
}

interface VipConfig {
  bundlePid: number;
  durationHours: number;
  priceLuong: number;
  maxBuyOnce: number;
}

interface VipResponse {
  success: boolean;
  message?: string;
  config?: VipConfig;
  bundleName?: string;
  members?: VipMember[];
}

const card: React.CSSProperties = {
  background: "rgba(28, 23, 18, 0.96)",
  border: "1px solid rgba(230, 174, 78, 0.2)",
  borderRadius: "10px",
  padding: "16px 20px",
};

const input: React.CSSProperties = {
  background: "rgba(5, 4, 3, 0.7)",
  color: "#f7f3ea",
  border: "1px solid rgba(230, 174, 78, 0.26)",
  borderRadius: "6px",
  padding: "8px 10px",
  fontSize: "14px",
  outline: "none",
};

const goldBtn: React.CSSProperties = {
  background: "linear-gradient(180deg, #f3c968, #bd7528)",
  color: "#25180a",
  border: "1px solid #ffd57d",
  borderRadius: "6px",
  padding: "8px 14px",
  fontWeight: 800,
  fontSize: "13px",
  cursor: "pointer",
};

const softBtn: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.05)",
  color: "#ddd5ca",
  border: "1px solid rgba(230, 174, 78, 0.25)",
  borderRadius: "6px",
  padding: "6px 12px",
  fontSize: "13px",
  cursor: "pointer",
};

const dangerBtn: React.CSSProperties = {
  ...softBtn,
  color: "#ff9c9c",
  border: "1px solid rgba(255, 120, 120, 0.4)",
};

function Icon({ pid }: { pid: number }) {
  const [broken, setBroken] = useState(false);
  if (broken) {
    return <div style={{ width: 32, height: 32, background: "rgba(255,255,255,0.06)", borderRadius: 4 }} />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/item-icons/${pid}.jpg`} alt="" width={32} height={32} style={{ borderRadius: 4 }} onError={() => setBroken(true)} />;
}

export default function VipPillPanel({ allPills }: { allPills: CatalogPill[] }) {
  const [data, setData] = useState<VipResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [search, setSearch] = useState("");
  const [pidInput, setPidInput] = useState("");
  const [hours, setHours] = useState("24");
  const [price, setPrice] = useState("0");
  const [maxBuy, setMaxBuy] = useState("100");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gm/vip-pill", { cache: "no-store" });
      const json: VipResponse = await res.json();
      if (!res.ok || json.success === false) {
        throw new Error(json.message || `Lỗi ${res.status}`);
      }
      setData(json);
      if (json.config) {
        setHours(String(json.config.durationHours));
        setPrice(String(json.config.priceLuong));
        setMaxBuy(String(json.config.maxBuyOnce));
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Không đọc được Gói Pill VIP." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const catalogByPid = useMemo(() => {
    const map = new Map<number, CatalogPill>();
    allPills.forEach((p) => map.set(p.pid, p));
    return map;
  }, [allPills]);

  const memberPids = useMemo(() => new Set((data?.members || []).map((m) => m.pid)), [data]);

  const candidates = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = allPills.filter((p) => p.itemKind === "statPill" && !memberPids.has(p.pid));
    const filtered = q
      ? list.filter((p) => p.name.toLowerCase().includes(q) || String(p.pid).includes(q) || p.groupName.toLowerCase().includes(q) || p.effectDescription.toLowerCase().includes(q))
      : list;
    return filtered.slice(0, 60);
  }, [allPills, memberPids, search]);

  async function post(action: string, body: object) {
    setBusy(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/gm/vip-pill?action=${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) {
        throw new Error(json.message || `Lỗi ${res.status}`);
      }
      setFeedback({ type: "success", text: json.message || "Đã lưu." });
      await load();
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Thao tác thất bại." });
    } finally {
      setBusy(false);
    }
  }

  const members = data?.members || [];
  const config = data?.config;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {feedback && (
        <div
          style={{
            ...card,
            color: feedback.type === "success" ? "#9be39b" : "#ff9c9c",
            borderColor: feedback.type === "success" ? "rgba(120, 220, 120, 0.4)" : "rgba(255, 120, 120, 0.4)",
          }}
        >
          {feedback.text}
        </div>
      )}

      <div style={card}>
        <div style={{ color: "#ffd47c", fontWeight: 800, fontSize: "16px", marginBottom: 6 }}>
          Gói Pill VIP — viên "Con Nhộng" (PID {config?.bundlePid ?? 1008006002})
        </div>
        <div style={{ color: "#c8c0b4", fontSize: "13px", lineHeight: 1.6 }}>
          Thành viên VIP còn hạn cắn 1 viên sẽ nhận cùng lúc tất cả pill bên dưới (mỗi pill {config?.durationHours ?? 24} giờ). Hết hạn VIP thì không cắn được. VIP do admin cấp ở mục thành viên. Chỉ áp dụng cho Kênh 2; mua bằng lệnh <b>!muavippill &lt;số lượng&gt;</b>.
          Chọn pill có thời hạn <b>24 Giờ</b> để khớp; pill thời hạn khác sẽ bị ép về số giờ của gói (nếu pill đó dùng cơ chế buff chuẩn).
        </div>
      </div>

      <div style={card}>
        <div style={{ color: "#ffd47c", fontWeight: 700, marginBottom: 10 }}>Cấu hình gói</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", alignItems: "flex-end" }}>
          <label style={{ color: "#c8c0b4", fontSize: 13, display: "flex", flexDirection: "column", gap: 4 }}>
            Thời gian mỗi pill (giờ)
            <input style={{ ...input, width: 140 }} value={hours} onChange={(e) => setHours(e.target.value)} />
          </label>
          <label style={{ color: "#c8c0b4", fontSize: 13, display: "flex", flexDirection: "column", gap: 4 }}>
            Giá 1 viên (Lượng, 0 = chưa bán)
            <input style={{ ...input, width: 200 }} value={price} onChange={(e) => setPrice(e.target.value)} />
          </label>
          <label style={{ color: "#c8c0b4", fontSize: 13, display: "flex", flexDirection: "column", gap: 4 }}>
            Mua tối đa mỗi lần
            <input style={{ ...input, width: 140 }} value={maxBuy} onChange={(e) => setMaxBuy(e.target.value)} />
          </label>
          <button
            type="button"
            style={goldBtn}
            disabled={busy}
            onClick={() =>
              post("config", {
                durationHours: Number(hours) || 24,
                priceLuong: Number(price) || 0,
                maxBuyOnce: Number(maxBuy) || 100,
              })
            }
          >
            Lưu cấu hình
          </button>
        </div>
      </div>

      <div style={card}>
        <div style={{ color: "#ffd47c", fontWeight: 700, marginBottom: 10 }}>Pill trong gói ({members.length})</div>
        {loading ? (
          <div style={{ color: "#c8c0b4" }}>Đang tải…</div>
        ) : members.length === 0 ? (
          <div style={{ color: "#91887d" }}>Chưa có pill nào. Thêm pill ở khung bên dưới.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {members.map((m) => {
              const cat = catalogByPid.get(m.pid);
              const lech = cat && cat.duration && !/24/.test(cat.duration);
              return (
                <div
                  key={m.pid}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    padding: "8px 10px",
                    border: "1px solid rgba(230, 174, 78, 0.15)",
                    borderRadius: 8,
                    opacity: m.enabled ? 1 : 0.55,
                  }}
                >
                  <Icon pid={m.pid} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "#f7f3ea", fontWeight: 700 }}>
                      {m.name || cat?.name || "?"} <span style={{ color: "#91887d", fontWeight: 400 }}>PID {m.pid}</span>
                    </div>
                    <div style={{ color: "#c8c0b4", fontSize: 12 }}>
                      {cat ? `${cat.groupName} · ${cat.effectDescription}` : "Không có trong danh mục pill"}
                    </div>
                    {lech && (
                      <div style={{ color: "#ffb86b", fontSize: 12 }}>
                        Thời hạn gốc: {cat?.duration} → trong gói sẽ ép về {config?.durationHours ?? 24} giờ
                      </div>
                    )}
                  </div>
                  <button type="button" style={softBtn} disabled={busy} onClick={() => post("toggle", { pid: m.pid, enabled: !m.enabled })}>
                    {m.enabled ? "Đang bật" : "Đang tắt"}
                  </button>
                  <button type="button" style={dangerBtn} disabled={busy} onClick={() => post("remove", { pid: m.pid })}>
                    Bỏ khỏi gói
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={card}>
        <div style={{ color: "#ffd47c", fontWeight: 700, marginBottom: 10 }}>Thêm pill vào gói</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
          <input style={{ ...input, minWidth: 280, flex: 1 }} placeholder="Tìm theo tên / PID / nhóm / hiệu ứng…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <input style={{ ...input, width: 180 }} placeholder="Hoặc nhập PID" value={pidInput} onChange={(e) => setPidInput(e.target.value)} />
          <button
            type="button"
            style={goldBtn}
            disabled={busy || !Number(pidInput)}
            onClick={() => {
              post("add", { pid: Number(pidInput) });
              setPidInput("");
            }}
          >
            Thêm theo PID
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 420, overflowY: "auto" }}>
          {candidates.map((p) => (
            <div key={p.pid} style={{ display: "flex", gap: 12, alignItems: "center", padding: "6px 10px", border: "1px solid rgba(230, 174, 78, 0.12)", borderRadius: 8 }}>
              <Icon pid={p.pid} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: "#f7f3ea", fontWeight: 600 }}>
                  {p.name} <span style={{ color: "#91887d", fontWeight: 400 }}>PID {p.pid} · {p.duration}</span>
                </div>
                <div style={{ color: "#c8c0b4", fontSize: 12 }}>{p.groupName} · {p.effectDescription}</div>
              </div>
              <button type="button" style={goldBtn} disabled={busy} onClick={() => post("add", { pid: p.pid })}>
                + Thêm
              </button>
            </div>
          ))}
          {candidates.length === 0 && <div style={{ color: "#91887d" }}>Không có pill phù hợp.</div>}
        </div>
      </div>
    </div>
  );
}
