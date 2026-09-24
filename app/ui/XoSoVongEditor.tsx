"use client";

import { RefreshCw, Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type Cell = {
  viTri: number;
  ten: string;
  trongSo: number;
  pid: number;
  soLuong: number;
  nhanCuoc: number;
};

function PidIcon({ pid }: { pid: number }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [pid]);
  if (pid === -1) return <span title="Hũ" style={{ fontSize: 20 }}>🎰</span>;
  if (pid === -2) return <span title="Vàng/Võ huân" style={{ fontSize: 18 }}>💰</span>;
  if (pid <= 0 || broken) return <span style={{ fontSize: 18 }}>🎁</span>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/item-icons/${pid}.jpg`}
      alt=""
      width={28}
      height={28}
      onError={() => setBroken(true)}
      style={{ objectFit: "contain", imageRendering: "pixelated" }}
    />
  );
}

const cellInput: React.CSSProperties = {
  width: "100%",
  padding: "6px 9px",
  fontSize: 13,
  background: "rgba(255,255,255,0.05)",
  color: "inherit",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 7,
  outline: "none",
};

export default function XoSoVongEditor() {
  const [cells, setCells] = useState<Cell[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  // Buffer khi dang go % (tranh o nhap "danh nhau" voi gia tri tinh lai). Xoa khi blur.
  const [pctDraft, setPctDraft] = useState<Record<number, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const r = await fetch("/api/gm/xo-so-vong?kenh=2", { cache: "no-store" });
      const d = await r.json();
      setCells(Array.isArray(d?.cells) ? d.cells : []);
    } catch {
      setCells([]);
      setMessage("Không đọc được vòng quay.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function edit(viTri: number, field: keyof Cell, value: string) {
    setCells((prev) =>
      prev.map((c) =>
        c.viTri === viTri ? { ...c, [field]: field === "ten" ? value : Number(value || 0) } : c,
      ),
    );
  }

  // Go % truc tiep -> quy ra trong so, GIU NGUYEN trong so cac o khac.
  // w = p*S_khac/(1-p) voi S_khac = tong trong so cac o thuong con lai. Clamp p <= 95%.
  function editPercent(viTri: number, pctStr: string) {
    setPctDraft((d) => ({ ...d, [viTri]: pctStr }));
    const p = Math.min(0.95, Math.max(0, (Number(pctStr) || 0) / 100));
    setCells((prev) => {
      const sKhac = prev.reduce(
        (s, c) => s + (c.viTri === viTri || c.pid === -1 ? 0 : Math.max(0, c.trongSo)),
        0,
      );
      const w = p <= 0 ? 0 : Math.max(1, Math.round((p * sKhac) / (1 - p)));
      return prev.map((c) => (c.viTri === viTri ? { ...c, trongSo: w } : c));
    });
  }

  function clearPctDraft(viTri: number) {
    setPctDraft((d) => {
      const n = { ...d };
      delete n[viTri];
      return n;
    });
  }

  async function save() {
    if (!confirm("Lưu vòng quay Kênh 2 và tải lại GameServer?")) return;
    setBusy(true);
    setMessage("");
    try {
      const r = await fetch("/api/gm/xo-so-vong", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kenh: 2, cells }),
      });
      const d = await r.json();
      setMessage(String(d.message ?? (d.success ? "Đã lưu." : "Lỗi.")));
      if (d.success) await load();
    } catch {
      setMessage("Không kết nối được gateway.");
    }
    setBusy(false);
  }

  const tongTrongSo = cells.reduce((s, c) => s + (c.pid === -1 ? 0 : Math.max(0, c.trongSo)), 0);

  return (
    <section className="glass-panel" id="xoso-vong-editor">
      <div className="panel-title-row">
        <h2>🎡 Sửa vòng quay Xổ Số — Kênh 2</h2>
        <button type="button" onClick={() => void load()} disabled={loading}>
          <RefreshCw size={14} /> Tải lại
        </button>
      </div>
      <p className="muted" style={{ marginTop: 4 }}>
        Sửa trực tiếp từng ô rồi <b>Lưu + tải lại GameServer</b> (không cần restart). Gõ thẳng
        <b> % trúng</b> mong muốn cho ô — hệ tự quy ra trọng số (giữ nguyên các ô khác), hoặc chỉnh
        <b> Trọng số</b> tuỳ ý. PID món tra ở tab <b>Vật phẩm shop</b>; đổi PID chỉ đổi <i>ra món gì</i>,
        không đổi tỉ lệ. <b>PID đặc biệt:</b> <code>-1</code> = Hũ Jackpot, <code>-2</code> = Vàng/Võ huân
        (khi đó <b>Số lượng</b> = số vàng). <b>Chỉ Kênh 2</b> — Kênh 1 đang khoá.
      </p>

      {loading ? (
        <p style={{ opacity: 0.6, padding: 12 }}>Đang tải…</p>
      ) : (
        <div style={{ overflowX: "auto", marginTop: 8 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                {["Ô", "Icon", "Tên hiển thị", "PID", "Trọng số", "% trúng (sửa)", "Số lượng", "Nhân cược"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "8px 9px",
                      opacity: 0.65,
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      borderBottom: "1px solid rgba(255,255,255,0.12)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cells.map((c, idx) => {
                const pctNum = tongTrongSo > 0 ? (Math.max(0, c.trongSo) / tongTrongSo) * 100 : 0;
                return (
                  <tr
                    key={c.viTri}
                    style={{
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                      background:
                        c.pid === -1
                          ? "rgba(220,60,60,0.10)"
                          : idx % 2 === 1
                            ? "rgba(255,255,255,0.02)"
                            : "transparent",
                    }}
                  >
                    <td style={{ padding: "4px 8px", fontWeight: 700, opacity: 0.8 }}>{c.viTri}</td>
                    <td style={{ padding: "4px 8px" }}><PidIcon pid={c.pid} /></td>
                    <td style={{ padding: "4px 8px", minWidth: 150 }}>
                      <input style={cellInput} value={c.ten} onChange={(e) => edit(c.viTri, "ten", e.target.value)} />
                    </td>
                    <td style={{ padding: "4px 8px", width: 120 }}>
                      <input type="number" style={cellInput} value={c.pid} onChange={(e) => edit(c.viTri, "pid", e.target.value)} />
                    </td>
                    <td style={{ padding: "4px 8px", width: 90 }}>
                      <input type="number" min={0} style={cellInput} value={c.trongSo} onChange={(e) => edit(c.viTri, "trongSo", e.target.value)} />
                    </td>
                    <td style={{ padding: "4px 8px", width: 96 }}>
                      {c.pid === -1 ? (
                        <span style={{ opacity: 0.55 }}>—</span>
                      ) : (
                        <input
                          type="number"
                          min={0}
                          max={95}
                          step={0.1}
                          style={{ ...cellInput, background: "rgba(245,166,35,0.16)", border: "1.5px solid #f5a623", fontWeight: 700 }}
                          value={pctDraft[c.viTri] ?? pctNum.toFixed(1)}
                          onChange={(e) => editPercent(c.viTri, e.target.value)}
                          onBlur={() => clearPctDraft(c.viTri)}
                          title="Gõ % trúng mong muốn cho ô này"
                        />
                      )}
                    </td>
                    <td style={{ padding: "4px 8px", width: 90 }}>
                      <input type="number" min={1} style={cellInput} value={c.soLuong} onChange={(e) => edit(c.viTri, "soLuong", e.target.value)} />
                    </td>
                    <td style={{ padding: "4px 8px", width: 80 }}>
                      <input type="number" min={0} style={cellInput} value={c.nhanCuoc} onChange={(e) => edit(c.viTri, "nhanCuoc", e.target.value)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
        <button
          type="button"
          disabled={busy || loading || cells.length === 0}
          onClick={() => void save()}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            borderRadius: 9,
            border: "none",
            background: busy || loading ? "rgba(245,166,35,0.4)" : "#f5a623",
            color: "#1a1205",
            fontWeight: 700,
            fontSize: 14,
            cursor: busy || loading ? "default" : "pointer",
          }}
        >
          <Save size={15} /> {busy ? "Đang lưu…" : "Lưu + tải lại GameServer"}
        </button>
        {message ? <span style={{ opacity: 0.85 }}>{message}</span> : null}
      </div>
    </section>
  );
}
