"use client";

import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

/**
 * Bảng "ai đã quay bao nhiêu lượt trong chu kỳ hũ hiện tại".
 *
 * Vì sao có: Rig Xổ Số khớp ĐÚNG số lượt quay trong chu kỳ, mà con số đó chỉ nằm trong bộ nhớ
 * GameServer — không ai nhìn thấy nên đặt kiểu đoán mò. Tối 16/08 đặt "lượt 1" cho một nhân vật
 * nhưng lượt 1 đã trôi qua từ lúc máy chủ khởi động, chỉ định không bao giờ nổ rồi bị huỷ khi hũ nổ.
 *
 * Cột "Lượt kế tiếp" là thứ cần nhìn: điền đúng số đó vào ô "Lượt thứ N" bên Rig là trúng ngay
 * lần quay sau.
 */

type Nguoi = {
  Ten: string;
  SoLuot: number;
  DaGop: number;
  DuGop: boolean;
  LuotKeTiep: number;
};

type ChuKy = {
  Kenh: number;
  HuHienTai: number;
  MocNoAn: number;
  NguoiVuaNo: string;
  TyLeDongGop: number;
  NguongGopCanDat: number;
  ChanceThieuDongGop: number;
  SoNguoiDaQuay: number;
  DanhSach: Nguoi[];
};

const so = (n: number) => n.toLocaleString("vi-VN");

// Kho CSS cua trang khong co san class o thong ke -> dat thang o day, khoi them class toan cuc
// roi lo va nham vao trang khac.
const oTinh: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.04)",
};

export default function XoSoLuotQuayTool() {
  const [kenh, setKenh] = useState(1);
  const [data, setData] = useState<ChuKy | null>(null);
  const [loi, setLoi] = useState("");
  const [dangTai, setDangTai] = useState(false);
  const [tuLamMoi, setTuLamMoi] = useState(false);

  const load = useCallback(async () => {
    setDangTai(true);
    setLoi("");
    try {
      const r = await fetch(`/api/gm/xo-so-luot-quay?kenh=${kenh}`);
      const j = await r.json();
      if (!r.ok || j?.Success === false) {
        setLoi(j?.message ?? j?.Message ?? "Kênh không trả lời. Cần GameServer từ 22.5.2.222 trở lên.");
        setData(null);
      } else {
        setData(j?.ChuKy ?? null);
      }
    } catch {
      setLoi("Không gọi được máy chủ.");
      setData(null);
    } finally {
      setDangTai(false);
    }
  }, [kenh]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!tuLamMoi) return;
    const id = setInterval(() => void load(), 5000);
    return () => clearInterval(id);
  }, [tuLamMoi, load]);

  const ds = data?.DanhSach ?? [];
  const dsSapXep = [...ds].sort((a, b) => b.SoLuot - a.SoLuot);

  return (
    <section className="glass-panel" id="xoso-luot-quay">
      <div className="panel-title-row">
        <h2>🎰 Lượt quay trong chu kỳ hũ</h2>
        <button type="button" onClick={() => void load()} disabled={dangTai}>
          <RefreshCw size={14} /> {dangTai ? "Đang tải…" : "Tải lại"}
        </button>
      </div>

      <p className="muted" style={{ marginTop: 4 }}>
        Nhìn cột <b>Lượt kế tiếp</b> rồi điền đúng số đó vào ô <b>Lượt thứ N</b> bên Rig Xổ Số là
        trúng ngay lần quay sau. Hai con số này <b>chỉ sống trong bộ nhớ</b> — khởi động lại kênh
        hoặc nổ hũ là về 0 hết.
      </p>

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", margin: "12px 0" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span>Kênh</span>
          <select value={kenh} onChange={(e) => setKenh(Number(e.target.value))}>
            <option value={1}>Kênh 1</option>
            <option value={2}>Kênh 2</option>
          </select>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 18 }}>
          <input type="checkbox" checked={tuLamMoi} onChange={(e) => setTuLamMoi(e.target.checked)} />
          <span>Tự làm mới 5 giây</span>
        </label>
      </div>

      {loi ? <p style={{ color: "#ff8080" }}>{loi}</p> : null}

      {data ? (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
              gap: 12,
              margin: "12px 0",
            }}
          >
            <div style={oTinh}>
              <span className="muted">HŨ HIỆN TẠI</span>
              <b style={{ fontSize: 20 }}>{so(data.HuHienTai)}</b>
            </div>
            <div style={oTinh}>
              <span className="muted">MỐC NỔ (ẩn với người chơi)</span>
              <b style={{ fontSize: 20 }}>{data.MocNoAn > 0 ? so(data.MocNoAn) : "chưa bốc"}</b>
            </div>
            <div style={oTinh}>
              <span className="muted">GÓP ĐỦ CẦN ĐẠT ({data.TyLeDongGop}%)</span>
              <b style={{ fontSize: 20 }}>{so(data.NguongGopCanDat)}</b>
            </div>
            <div style={oTinh}>
              <span className="muted">THIẾU GÓP CÒN</span>
              <b style={{ fontSize: 20 }}>{data.ChanceThieuDongGop}%</b>
            </div>
            <div style={oTinh}>
              <span className="muted">NGƯỜI VỪA NỔ</span>
              <b style={{ fontSize: 16 }}>{data.NguoiVuaNo || "—"}</b>
            </div>
          </div>

          {dsSapXep.length === 0 ? (
            <p className="muted">
              Chưa ai quay trong chu kỳ này. Bộ đếm về 0 sau mỗi lần nổ hũ hoặc khởi động lại kênh.
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "6px 8px" }}>Nhân vật</th>
                    <th style={{ textAlign: "right", padding: "6px 8px" }}>Đã quay</th>
                    <th style={{ textAlign: "right", padding: "6px 8px" }}>Lượt kế tiếp</th>
                    <th style={{ textAlign: "right", padding: "6px 8px" }}>Đã góp hũ</th>
                    <th style={{ textAlign: "center", padding: "6px 8px" }}>Đủ góp?</th>
                  </tr>
                </thead>
                <tbody>
                  {dsSapXep.map((n) => (
                    <tr key={n.Ten} style={{ borderTop: "1px solid rgba(255,255,255,.08)" }}>
                      <td style={{ padding: "6px 8px" }}>{n.Ten}</td>
                      <td style={{ padding: "6px 8px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                        {so(n.SoLuot)}
                      </td>
                      <td
                        style={{
                          padding: "6px 8px",
                          textAlign: "right",
                          fontVariantNumeric: "tabular-nums",
                          fontWeight: 700,
                          color: "#ffd479",
                        }}
                      >
                        {so(n.LuotKeTiep)}
                      </td>
                      <td style={{ padding: "6px 8px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                        {so(n.DaGop)}
                      </td>
                      <td style={{ padding: "6px 8px", textAlign: "center" }}>
                        {n.DuGop ? "✅" : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}
