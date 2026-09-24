"use client";

import { useCallback, useEffect, useState } from "react";

type HopQua29Item = {
  id: number; itemId: number; itemName: string; quantity: number; weight: number;
  groupId: number; groupName: string; magic1: number;
};
type HopQua29Group = { groupId: number; groupName: string; items: HopQua29Item[] };
type HopQua29Archive = {
  archiveId: number; originalId: number; bd: number; itemId: number; itemName: string;
  quantity: number; weight: number; groupId: number; groupName: string;
  removedAt: string; removedBy: string;
};
type HopQua29Schedule = {
  kenh: number; enable: number; ngayBatDau: string; ngayKetThuc: string; soLuongCanDoi: number; tyLeRoi: number;
};

async function readJson(response: Response) {
  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) throw new Error(String(payload.message ?? "Thao tác chưa thành công."));
  return payload;
}

function tongTrongSo(items: HopQua29Item[]) {
  return items.reduce((tong, item) => tong + item.weight, 0);
}

function phanTramHieuLuc(item: HopQua29Item, group: HopQua29Group) {
  const tong = tongTrongSo(group.items);
  if (tong <= 0) return "0%";
  return `${((item.weight / tong) * 100).toFixed(1)}%`;
}

// Tra cứu PID ngay khi gõ, để xem tên/icon TRƯỚC khi bấm thêm — không phải đợi thêm xong mới thấy.
function useItemPreview(itemId: number) {
  const [info, setInfo] = useState<{ name: string; level: number } | null>(null);
  const [trangThai, setTrangThai] = useState<"idle" | "loading" | "found" | "notfound" | "error">("idle");
  const [loi, setLoi] = useState("");

  useEffect(() => {
    if (itemId <= 0) { setInfo(null); setTrangThai("idle"); return; }
    const controller = new AbortController();
    setTrangThai("loading");
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/gm/items?query=${itemId}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const payload = (await response.json().catch(() => ({}))) as {
          success?: boolean;
          message?: string;
          items?: { itemId: number; name: string; level: number }[];
        };
        if (controller.signal.aborted) return;
        if (!response.ok || payload.success !== true) {
          setInfo(null);
          setTrangThai("error");
          setLoi(payload.message || `Lỗi tra cứu (HTTP ${response.status})`);
          return;
        }
        const found = (payload.items ?? []).find((entry) => entry.itemId === itemId);
        if (found) { setInfo({ name: found.name, level: found.level }); setTrangThai("found"); }
        else { setInfo(null); setTrangThai("notfound"); }
      } catch (error) {
        if (!controller.signal.aborted) {
          setInfo(null);
          setTrangThai("error");
          setLoi(error instanceof Error ? error.message : "Không kết nối được để tra cứu.");
        }
      }
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [itemId]);

  return { info, trangThai, loi };
}

function ItemPidPreview({ itemId }: { itemId: number }) {
  const { info, trangThai, loi } = useItemPreview(itemId);
  if (itemId <= 0) return null;
  return (
    <div className="selected-item-preview">
      <img src={`/item-icons/${itemId}.jpg`} alt={info?.name ?? ""}
        onError={(e) => { e.currentTarget.src = "/item-icons/0.jpg"; }} />
      <div>
        <strong>{trangThai === "loading" ? "Đang tra…" : info?.name || `PID ${itemId}`}</strong>
        <span>
          {trangThai === "found" ? `PID ${itemId} · Cấp ${info?.level ?? "?"}`
            : trangThai === "notfound" ? `PID ${itemId} · không có trong danh mục`
            : trangThai === "error" ? `PID ${itemId} · ${loi}`
            : `PID ${itemId}`}
        </span>
      </div>
    </div>
  );
}

const emptyMacDinh = { itemId: 0, quantity: 1, magic1: 0 };
const emptyTiLe = { itemId: 0, quantity: 1, weight: 10, groupId: 0, groupName: "", magic1: 0 };
const emptySchedule: HopQua29Schedule = {
  kenh: 1, enable: 0, ngayBatDau: "", ngayKetThuc: "", soLuongCanDoi: 100, tyLeRoi: 100,
};

export default function HopQua29Editor() {
  const [macDinh, setMacDinh] = useState<HopQua29Item[]>([]);
  const [nhomTiLe, setNhomTiLe] = useState<HopQua29Group[]>([]);
  const [daGo, setDaGo] = useState<HopQua29Archive[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const [schedule, setSchedule] = useState<HopQua29Schedule>(emptySchedule);
  const [scheduleBusy, setScheduleBusy] = useState(false);
  const [scheduleMessage, setScheduleMessage] = useState("");

  const [macDinhForm, setMacDinhForm] = useState(emptyMacDinh);
  const [tiLeForm, setTiLeForm] = useState(emptyTiLe);
  const [nhomMoi, setNhomMoi] = useState(true);

  const [chonTra, setChonTra] = useState<Set<number>>(new Set());
  const [xacNhanTra, setXacNhanTra] = useState("");

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const payload = await readJson(await fetch("/api/gm/hopqua29", { cache: "no-store" }));
      setMacDinh((payload.macDinh as HopQua29Item[]) ?? []);
      setNhomTiLe((payload.nhomTiLe as HopQua29Group[]) ?? []);
      setDaGo((payload.daGo as HopQua29Archive[]) ?? []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không tải được cấu hình Hộp Quà 2/9.");
    } finally {
      setBusy(false);
    }
  }, []);

  const loadSchedule = useCallback(async (kenh: number) => {
    setScheduleBusy(true);
    try {
      const payload = await readJson(await fetch(`/api/gm/hopqua29/schedule?kenh=${kenh}`, { cache: "no-store" }));
      setSchedule({ ...((payload.schedule as HopQua29Schedule) ?? emptySchedule), kenh });
    } catch (error) {
      setScheduleMessage(error instanceof Error ? error.message : "Không tải được lịch sự kiện.");
    } finally {
      setScheduleBusy(false);
    }
  }, []);

  useEffect(() => { void load(); void loadSchedule(1); }, [load, loadSchedule]);

  function doiKenhLichSuKien(kenh: number) {
    setScheduleMessage("");
    setSchedule((truoc) => ({ ...truoc, kenh }));
    void loadSchedule(kenh);
  }

  async function luuLichSuKien() {
    if (schedule.kenh === 1 &&
      !confirm("Lưu lịch sự kiện 2/9 cho KÊNH 1 (đang có người chơi thật) và tải lại GameServer ngay?")) {
      return;
    }
    setScheduleBusy(true);
    try {
      const payload = await readJson(await fetch("/api/gm/hopqua29/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schedule),
      }));
      setScheduleMessage(String(payload.message ?? "Đã lưu lịch sự kiện."));
      await loadSchedule(schedule.kenh);
    } catch (error) {
      setScheduleMessage(error instanceof Error ? error.message : "Không lưu được lịch sự kiện.");
    } finally {
      setScheduleBusy(false);
    }
  }

  async function themMacDinh() {
    if (macDinhForm.itemId <= 0) return;
    setBusy(true);
    try {
      const payload = await readJson(await fetch("/api/gm/hopqua29", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "macdinh", item: macDinhForm }),
      }));
      setMessage(String(payload.message ?? "Đã thêm."));
      setMacDinhForm(emptyMacDinh);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thêm được dòng mặc định.");
    } finally {
      setBusy(false);
    }
  }

  async function xoaMacDinh(item: HopQua29Item) {
    setBusy(true);
    try {
      const payload = await readJson(await fetch("/api/gm/hopqua29", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "macdinh", id: item.id, confirmation: `XOA ${item.id}` }),
      }));
      setMessage(String(payload.message ?? "Đã gỡ."));
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không gỡ được dòng.");
    } finally {
      setBusy(false);
    }
  }

  async function themTiLe() {
    if (tiLeForm.itemId <= 0) return;
    if (nhomMoi && !tiLeForm.groupName.trim()) { setMessage("Nhóm tỉ lệ mới cần có tên."); return; }
    setBusy(true);
    try {
      const payload = await readJson(await fetch("/api/gm/hopqua29", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "tile",
          item: {
            itemId: tiLeForm.itemId,
            quantity: tiLeForm.quantity,
            weight: tiLeForm.weight,
            groupId: nhomMoi ? null : tiLeForm.groupId,
            groupName: nhomMoi ? tiLeForm.groupName : null,
            magic1: tiLeForm.magic1,
          },
        }),
      }));
      setMessage(String(payload.message ?? "Đã thêm."));
      setTiLeForm({ ...emptyTiLe, groupId: tiLeForm.groupId });
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thêm được dòng tỉ lệ.");
    } finally {
      setBusy(false);
    }
  }

  async function xoaTiLe(item: HopQua29Item) {
    setBusy(true);
    try {
      const payload = await readJson(await fetch("/api/gm/hopqua29", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "tile", id: item.id, confirmation: `XOA ${item.id}` }),
      }));
      setMessage(String(payload.message ?? "Đã gỡ."));
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không gỡ được dòng.");
    } finally {
      setBusy(false);
    }
  }

  async function xoaNhom(group: HopQua29Group) {
    setBusy(true);
    try {
      const payload = await readJson(await fetch("/api/gm/hopqua29", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "nhom", id: group.groupId, confirmation: `XOA NHOM ${group.groupId}` }),
      }));
      setMessage(String(payload.message ?? "Đã xoá nhóm."));
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không xoá được nhóm.");
    } finally {
      setBusy(false);
    }
  }

  function doiChonTra(archiveId: number) {
    setChonTra((truoc) => {
      const sau = new Set(truoc);
      if (sau.has(archiveId)) sau.delete(archiveId); else sau.add(archiveId);
      return sau;
    });
  }

  const chuoiXacNhanTra = `KHOI PHUC ${chonTra.size} DONG`;

  async function khoiPhuc() {
    if (chonTra.size === 0) return;
    setBusy(true);
    try {
      const payload = await readJson(await fetch("/api/gm/hopqua29", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archiveIds: Array.from(chonTra), xacNhan: xacNhanTra }),
      }));
      setMessage(String(payload.message ?? "Đã khôi phục."));
      setChonTra(new Set());
      setXacNhanTra("");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không khôi phục được.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="operations-body hopqua29-editor">
      {message ? <div className="operations-message">{message}</div> : null}

      <div className="subsection-title">
        <div>
          <h3>Lịch sự kiện</h3>
          <small>Bật/tắt sự kiện 2/9 và đặt ngày bắt đầu/kết thúc — chọn kênh áp dụng bên dưới (ưu tiên Kênh 1, Kênh 2 chỉ để test). Lưu xong tự tải lại GameServer của kênh đã chọn.</small>
        </div>
      </div>
      {scheduleMessage ? <div className="operations-message">{scheduleMessage}</div> : null}
      <div className="operations-form compact-form-grid">
        <label><span>Kênh áp dụng</span>
          <select value={schedule.kenh} onChange={(e) => doiKenhLichSuKien(Number(e.target.value))}>
            <option value={1}>Kênh 1 (chính)</option>
            <option value={2}>Kênh 2 (test)</option>
          </select>
        </label>
        <label><span>Trạng thái</span>
          <select value={schedule.enable} onChange={(e) => setSchedule({ ...schedule, enable: Number(e.target.value) })}>
            <option value={1}>Đang bật</option>
            <option value={0}>Đang tắt</option>
          </select>
        </label>
        <label><span>Ngày bắt đầu</span>
          <input type="date" value={schedule.ngayBatDau}
            onChange={(e) => setSchedule({ ...schedule, ngayBatDau: e.target.value })} />
        </label>
        <label><span>Ngày kết thúc</span>
          <input type="date" value={schedule.ngayKetThuc}
            onChange={(e) => setSchedule({ ...schedule, ngayKetThuc: e.target.value })} />
        </label>
        <label><span>Số lượng Lá Cờ cần đổi</span>
          <input type="number" min={1} value={schedule.soLuongCanDoi}
            onChange={(e) => setSchedule({ ...schedule, soLuongCanDoi: Number(e.target.value) })} />
        </label>
        <label><span>Tỉ lệ rơi Lá Cờ (%)</span>
          <input type="number" min={1} max={100} value={schedule.tyLeRoi}
            onChange={(e) => setSchedule({ ...schedule, tyLeRoi: Number(e.target.value) })} />
        </label>
        <div className="operations-actions">
          <button className="primary" disabled={scheduleBusy || !schedule.ngayBatDau || !schedule.ngayKetThuc}
            onClick={() => void luuLichSuKien()}>
            Lưu lịch sự kiện
          </button>
        </div>
      </div>

      <div className="subsection-title">
        <div>
          <h3>Box mặc định</h3>
          <small>Mọi PID trong đây LUÔN được trao đủ mỗi lần mở Hộp Quà 2/9 — không roll.</small>
        </div>
      </div>
      <div className="npc-item-card-grid">
        {macDinh.map((item) => (
          <div className="npc-item-card-wrap" key={item.id}>
            <div className="npc-item-card">
              <span className="npc-item-thumb">
                <img src={`/item-icons/${item.itemId}.jpg`} alt={item.itemName} loading="lazy"
                  onError={(e) => { e.currentTarget.src = "/item-icons/0.jpg"; }} />
              </span>
              <strong>{item.itemName || `PID ${item.itemId}`}</strong>
              <code>PID {item.itemId}</code>
              <span>Số lượng: {item.quantity}</span>
              {item.magic1 > 0 ? <span>Magic1: {item.magic1}</span> : null}
              <button className="danger" disabled={busy} onClick={() => void xoaMacDinh(item)}>Gỡ</button>
            </div>
          </div>
        ))}
        {macDinh.length === 0 ? <div className="empty-state"><strong>Chưa có dòng mặc định</strong></div> : null}
      </div>
      <ItemPidPreview itemId={macDinhForm.itemId} />
      <div className="operations-form compact-form-grid">
        <label><span>PID vật phẩm</span>
          <input type="number" value={macDinhForm.itemId || ""}
            onChange={(e) => setMacDinhForm({ ...macDinhForm, itemId: Number(e.target.value) })} />
        </label>
        <label><span>Số lượng</span>
          <input type="number" min={1} value={macDinhForm.quantity}
            onChange={(e) => setMacDinhForm({ ...macDinhForm, quantity: Number(e.target.value) })} />
        </label>
        <label><span>Mã Magic1 (ngọc, để trống nếu không phải ngọc)</span>
          <input type="number" min={0} value={macDinhForm.magic1 || ""} placeholder="VD 700039 = CLVC 39%"
            onChange={(e) => setMacDinhForm({ ...macDinhForm, magic1: Number(e.target.value) })} />
        </label>
        <div className="operations-actions">
          <button className="primary" disabled={busy || macDinhForm.itemId <= 0} onClick={() => void themMacDinh()}>
            + Thêm vào box mặc định
          </button>
        </div>
      </div>

      <div className="subsection-title">
        <div>
          <h3>Các box tỉ lệ</h3>
          <small>Mỗi nhóm tự đặt tên, quay số 1 lần/nhóm, luôn ra đúng 1 món (theo trọng số tương đối trong nhóm). Tạo bao nhiêu nhóm cũng được.</small>
        </div>
      </div>
      {nhomTiLe.map((group) => (
        <div className="npc-shop-context" key={group.groupId} style={{ flexDirection: "column", alignItems: "stretch", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong>{group.groupName || `Nhóm ${group.groupId}`} <small>(tổng trọng số {tongTrongSo(group.items)})</small></strong>
            <button className="danger" disabled={busy} onClick={() => void xoaNhom(group)}>Xoá cả nhóm</button>
          </div>
          <div className="npc-item-card-grid">
            {group.items.map((item) => (
              <div className="npc-item-card-wrap" key={item.id}>
                <div className="npc-item-card">
                  <span className="npc-item-thumb">
                    <img src={`/item-icons/${item.itemId}.jpg`} alt={item.itemName} loading="lazy"
                      onError={(e) => { e.currentTarget.src = "/item-icons/0.jpg"; }} />
                  </span>
                  <strong>{item.itemName || `PID ${item.itemId}`}</strong>
                  <code>PID {item.itemId}</code>
                  <span>Số lượng: {item.quantity} · Trọng số: {item.weight}</span>
                  <span>Tỉ lệ thắng trong nhóm: {phanTramHieuLuc(item, group)}</span>
                  {item.magic1 > 0 ? <span>Magic1: {item.magic1}</span> : null}
                  <button className="danger" disabled={busy} onClick={() => void xoaTiLe(item)}>Gỡ</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {nhomTiLe.length === 0 ? <div className="empty-state"><strong>Chưa có box tỉ lệ nào</strong></div> : null}

      <ItemPidPreview itemId={tiLeForm.itemId} />
      <div className="operations-form compact-form-grid">
        <label><span>Thêm vào</span>
          <select value={nhomMoi ? "moi" : String(tiLeForm.groupId)}
            onChange={(e) => {
              if (e.target.value === "moi") { setNhomMoi(true); setTiLeForm({ ...tiLeForm, groupId: 0 }); }
              else { setNhomMoi(false); setTiLeForm({ ...tiLeForm, groupId: Number(e.target.value) }); }
            }}>
            <option value="moi">+ Tạo box tỉ lệ mới</option>
            {nhomTiLe.map((group) => (
              <option key={group.groupId} value={group.groupId}>{group.groupName || `Nhóm ${group.groupId}`}</option>
            ))}
          </select>
        </label>
        {nhomMoi ? (
          <label><span>Tên box tỉ lệ mới</span>
            <input value={tiLeForm.groupName}
              onChange={(e) => setTiLeForm({ ...tiLeForm, groupName: e.target.value })} />
          </label>
        ) : null}
        <label><span>PID vật phẩm</span>
          <input type="number" value={tiLeForm.itemId || ""}
            onChange={(e) => setTiLeForm({ ...tiLeForm, itemId: Number(e.target.value) })} />
        </label>
        <label><span>Số lượng</span>
          <input type="number" min={1} value={tiLeForm.quantity}
            onChange={(e) => setTiLeForm({ ...tiLeForm, quantity: Number(e.target.value) })} />
        </label>
        <label><span>Trọng số / %</span>
          <input type="number" min={1} value={tiLeForm.weight}
            onChange={(e) => setTiLeForm({ ...tiLeForm, weight: Number(e.target.value) })} />
        </label>
        <label><span>Mã Magic1 (ngọc, để trống nếu không phải ngọc)</span>
          <input type="number" min={0} value={tiLeForm.magic1 || ""} placeholder="VD 700039 = CLVC 39%"
            onChange={(e) => setTiLeForm({ ...tiLeForm, magic1: Number(e.target.value) })} />
        </label>
        <div className="operations-actions">
          <button className="primary" disabled={busy || tiLeForm.itemId <= 0} onClick={() => void themTiLe()}>
            + Thêm vào box tỉ lệ
          </button>
        </div>
      </div>

      <div className="subsection-title">
        <div><h3>Đã gỡ</h3><small>{daGo.length} dòng trong bảng lưu trữ · chọn để khôi phục</small></div>
      </div>
      {daGo.length === 0 ? <p className="muted">Chưa gỡ dòng nào.</p> : (
        <div className="npc-archive-list">
          {daGo.map((row) => (
            <label key={row.archiveId} className={`npc-archive-row ${chonTra.has(row.archiveId) ? "picked" : ""}`}>
              <input type="checkbox" checked={chonTra.has(row.archiveId)} onChange={() => doiChonTra(row.archiveId)} />
              <img src={`/item-icons/${row.itemId}.jpg`} alt="" loading="lazy"
                onError={(e) => { e.currentTarget.src = "/item-icons/0.jpg"; }} />
              <span className="npc-archive-name">
                <strong>{row.itemName || `PID ${row.itemId}`}</strong>
                <small>{row.bd === 3 ? "Box mặc định" : `Box tỉ lệ: ${row.groupName || row.groupId}`} · SL {row.quantity}{row.bd === 4 ? ` · Trọng số ${row.weight}` : ""}</small>
              </span>
              <span className="npc-archive-meta">
                <small>{new Date(row.removedAt).toLocaleString("vi-VN")}</small>
                <small>bởi {row.removedBy || "—"}</small>
              </span>
            </label>
          ))}
        </div>
      )}
      {chonTra.size > 0 ? (
        <div className="delete-zone npc-restore-zone">
          <strong>Khôi phục {chonTra.size} dòng</strong>
          <p>Gõ <code>{chuoiXacNhanTra}</code> để xác nhận.</p>
          <input value={xacNhanTra} onChange={(e) => setXacNhanTra(e.target.value)} placeholder={chuoiXacNhanTra} />
          <button className="primary" disabled={busy || xacNhanTra !== chuoiXacNhanTra} onClick={() => void khoiPhuc()}>
            Khôi phục {chonTra.size} dòng
          </button>
        </div>
      ) : null}
    </div>
  );
}
