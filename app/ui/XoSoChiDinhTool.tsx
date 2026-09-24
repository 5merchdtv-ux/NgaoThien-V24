"use client";

import { Plus, RefreshCw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type ChiDinh = {
  id: number;
  kenh: number;
  ten: string;
  lanQuay: number;
  oSo: number;
  trangThai: number;
  ghiChu: string | null;
  thoiGian: string;
};

type CharOption = { CharacterName: string; Level: number; Online: boolean };

// So do 24 o vong quay Xo So (theo cau hinh K2 hien tai). pid <=0: khong co icon
// (vo huan / hu) -> hien emoji. La so do de bam cho do nham; o thuc te do config game.
const O_VONG: { o: number; ten: string; pid: number; hu?: boolean }[] = [
  { o: 1, ten: "Mèo Tài Phú", pid: 1008000232 },
  { o: 2, ten: "Võ Huân 10k", pid: -2 },
  { o: 3, ten: "Kẹo PK", pid: 1008001112 },
  { o: 4, ten: "Võ Huân 10k", pid: -2 },
  { o: 5, ten: "EXP 30%", pid: 1008000096 },
  { o: 6, ten: "Đồ 13x Thường", pid: 1000001072 },
  { o: 7, ten: "Mèo Tài Phú", pid: 1008000232 },
  { o: 8, ten: "Kẹo Luyện Cấp", pid: 1008001111 },
  { o: 9, ten: "Mèo Tài Phú", pid: 1008000232 },
  { o: 10, ten: "Võ Huân 20k", pid: -2 },
  { o: 11, ten: "Kỹ Thuật Phù", pid: 1008000072 },
  { o: 12, ten: "HŨ Jackpot", pid: -1, hu: true },
  { o: 13, ten: "Mèo Tài Phú", pid: 1008000232 },
  { o: 14, ten: "Vải Phù Phép", pid: 1008001543 },
  { o: 15, ten: "Đồ 14x Thường", pid: 900000613 },
  { o: 16, ten: "Đồ 13x Thường", pid: 1000001072 },
  { o: 17, ten: "Kẹo Luyện Cấp", pid: 1008001111 },
  { o: 18, ten: "Võ Huân 10k", pid: -2 },
  { o: 19, ten: "Trang Sức 13x", pid: 1000001074 },
  { o: 20, ten: "Đồ 13x Chân", pid: 1000001073 },
  { o: 21, ten: "Võ Huân 20k", pid: -2 },
  { o: 22, ten: "Đồ 14x Chân", pid: 900000621 },
  { o: 23, ten: "Võ Huân 50k", pid: -2 },
  { o: 24, ten: "Trang Sức 14x", pid: 900000369 },
];
const O_TEN: Record<number, string> = Object.fromEntries(O_VONG.map((c) => [c.o, c.ten]));

function trangThaiText(t: number) {
  return t === 0 ? "Đang chờ" : t === 1 ? "Đã trúng" : "Đã huỷ (nổ hũ trước)";
}

function CellIcon({ pid, hu }: { pid: number; hu?: boolean }) {
  const [broken, setBroken] = useState(false);
  if (hu) return <span style={{ fontSize: 22 }}>🎰</span>;
  if (pid === -2) return <span style={{ fontSize: 20 }}>💰</span>;
  if (pid <= 0 || broken) return <span style={{ fontSize: 20 }}>🎁</span>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/item-icons/${pid}.jpg`}
      alt=""
      width={30}
      height={30}
      onError={() => setBroken(true)}
      style={{ objectFit: "contain", imageRendering: "pixelated" }}
    />
  );
}

export default function XoSoChiDinhTool() {
  const [kenh, setKenh] = useState(2);
  const [ten, setTen] = useState("");
  const [lanQuay, setLanQuay] = useState(1);
  const [oSo, setOSo] = useState(6);
  const [ghiChu, setGhiChu] = useState("");
  const [list, setList] = useState<ChiDinh[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [chars, setChars] = useState<CharOption[]>([]);

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/gm/xo-so-chi-dinh?kenh=${kenh}`);
      const d = await r.json();
      setList(Array.isArray(d) ? d : []);
    } catch {
      setList([]);
    }
  }, [kenh]);

  useEffect(() => {
    void load();
  }, [load]);

  // Autocomplete nguoi choi: tim theo ten dang go (debounce 300ms).
  useEffect(() => {
    const q = ten.trim();
    const timer = setTimeout(async () => {
      try {
        const r = await fetch(`/api/gm/characters?query=${encodeURIComponent(q)}`);
        const d = await r.json();
        setChars(Array.isArray(d?.Characters) ? d.Characters.slice(0, 30) : []);
      } catch {
        setChars([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [ten]);

  async function submit() {
    setBusy(true);
    setMessage("");
    try {
      const r = await fetch("/api/gm/xo-so-chi-dinh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kenh, ten: ten.trim(), lanQuay, oSo, ghiChu: ghiChu.trim() }),
      });
      const d = await r.json();
      setMessage(String(d.message ?? (d.success ? "Đã chỉ định." : "Lỗi.")));
      if (d.success) {
        setTen("");
        setGhiChu("");
        await load();
      }
    } catch {
      setMessage("Không kết nối được gateway.");
    }
    setBusy(false);
  }

  async function xoa(id: number) {
    if (!confirm("Xoá chỉ định này?")) return;
    try {
      const r = await fetch("/api/gm/xo-so-chi-dinh", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const d = await r.json();
      setMessage(String(d.message ?? "Đã xoá."));
      await load();
    } catch {
      setMessage("Không xoá được.");
    }
  }

  const selected = O_VONG.find((c) => c.o === oSo);

  return (
    <section className="glass-panel" id="xoso-chi-dinh">
      <div className="panel-title-row">
        <h2>🍉 Rig Xổ Số — chỉ định trúng</h2>
        <button type="button" onClick={() => void load()}>
          <RefreshCw size={14} /> Tải lại
        </button>
      </div>
      <p className="muted" style={{ marginTop: 4 }}>
        Đặt trước: nhân vật quay tới <b>lượt thứ N</b> (đếm từ lần nổ hũ gần nhất) sẽ <b>trúng ô đã chọn</b>,
        thông báo như quay thường. Nổ hũ trước lượt N thì tự huỷ. GameServer nhận trong ~8 giây, không cần restart.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, margin: "12px 0" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span>Kênh</span>
          <select value={kenh} onChange={(e) => setKenh(Number(e.target.value))}>
            <option value={1}>Kênh 1</option>
            <option value={2}>Kênh 2</option>
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span>Tên nhân vật (gõ để tìm)</span>
          <input
            list="xoso-char-list"
            value={ten}
            onChange={(e) => setTen(e.target.value)}
            placeholder="Gõ tên để chọn…"
            autoComplete="off"
          />
          <datalist id="xoso-char-list">
            {chars.map((c) => (
              <option key={c.CharacterName} value={c.CharacterName}>
                {`Lv${c.Level}${c.Online ? " · online" : ""}`}
              </option>
            ))}
          </datalist>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span>Lượt thứ N</span>
          <input type="number" min={1} value={lanQuay} onChange={(e) => setLanQuay(Number(e.target.value))} />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span>Ghi chú</span>
          <input value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} placeholder="tuỳ chọn" />
        </label>
      </div>

      <div style={{ margin: "4px 0 12px" }}>
        <span style={{ display: "block", marginBottom: 8 }}>
          Chọn ô trúng — bấm vào ô (đang chọn:{" "}
          <b>ô {oSo} · {selected?.ten ?? "?"}{selected && selected.pid > 0 ? ` · PID ${selected.pid}` : ""}</b>)
        </span>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(104px,1fr))", gap: 8 }}>
          {O_VONG.map((c) => {
            const chon = oSo === c.o;
            return (
              <button
                key={c.o}
                type="button"
                onClick={() => setOSo(c.o)}
                title={`Ô ${c.o}: ${c.ten}${c.pid > 0 ? ` (PID ${c.pid})` : ""}`}
                style={{
                  padding: "8px 6px",
                  borderRadius: 10,
                  border: chon ? "2px solid #f5a623" : "1px solid rgba(255,255,255,0.14)",
                  background: chon
                    ? "rgba(245,166,35,0.20)"
                    : c.hu
                      ? "rgba(220,60,60,0.16)"
                      : "rgba(255,255,255,0.035)",
                  color: "inherit",
                  cursor: "pointer",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  minHeight: 92,
                  position: "relative",
                }}
              >
                <span style={{ position: "absolute", top: 4, left: 6, fontSize: 11, opacity: 0.6, fontWeight: 700 }}>
                  {c.o}
                </span>
                <div style={{ height: 32, display: "flex", alignItems: "center", marginTop: 6 }}>
                  <CellIcon pid={c.pid} hu={c.hu} />
                </div>
                <small style={{ lineHeight: 1.12, fontSize: 11.5, fontWeight: 600 }}>{c.ten}</small>
                <small style={{ fontSize: 10, opacity: 0.55 }}>{c.pid > 0 ? c.pid : c.hu ? "JACKPOT" : "Vàng"}</small>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <button type="button" disabled={busy || !ten.trim()} onClick={() => void submit()}>
          <Plus size={14} /> Chỉ định
        </button>
        {message ? <span style={{ opacity: 0.85 }}>{message}</span> : null}
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Kênh", "Nhân vật", "Lượt", "Ô", "Trạng thái", "Ghi chú", "Lúc", ""].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "6px 8px", opacity: 0.7, fontSize: 13 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: 12, opacity: 0.6 }}>Chưa có chỉ định.</td>
              </tr>
            ) : (
              list.map((c) => (
                <tr key={c.id} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <td style={{ padding: "6px 8px" }}>K{c.kenh}</td>
                  <td style={{ padding: "6px 8px" }}>{c.ten}</td>
                  <td style={{ padding: "6px 8px" }}>{c.lanQuay}</td>
                  <td style={{ padding: "6px 8px" }}>{c.oSo}{O_TEN[c.oSo] ? ` · ${O_TEN[c.oSo]}` : ""}</td>
                  <td style={{ padding: "6px 8px" }}>{trangThaiText(c.trangThai)}</td>
                  <td style={{ padding: "6px 8px" }}>{c.ghiChu ?? ""}</td>
                  <td style={{ padding: "6px 8px", whiteSpace: "nowrap", opacity: 0.75 }}>{c.thoiGian}</td>
                  <td style={{ padding: "6px 8px" }}>
                    {c.trangThai === 0 ? (
                      <button type="button" onClick={() => void xoa(c.id)} title="Xoá">
                        <Trash2 size={14} />
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
