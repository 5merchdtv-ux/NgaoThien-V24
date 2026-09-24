"use client";

import {
  AlarmClock,
  CircleStop,
  Eraser,
  Flag,
  LoaderCircle,
  Play,
  RefreshCw,
  Swords,
  Trash2,
  TriangleAlert,
  UserMinus,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Trang điều khiển Thế Lực Chiến.
 *
 * CẬP NHẬT 12/08/2026: cả HAI kênh điều khiển được năm bước. Kênh 1 đã lên 22.5.2.155 nên có lệnh
 * `tlcbuoc` trong GM pipe; trước đó nó chạy 22.5.2.89 và không có lệnh này nên trang khoá cứng.
 *
 * Khác biệt còn lại giữa hai kênh chỉ là ĐẶT LỊCH: đường ghi Gsconfig của Kênh 1 vẫn do gateway
 * quyết (TlcStore.ChoPhepGhiKenh1), trang đọc cờ đó qua /tlc/cau-hinh rồi mờ ô nhập cho khớp —
 * không tự đoán theo số kênh.
 *
 * Nút bước KHÔNG bị gateway chặn theo kênh: /tlc/buoc chỉ đòi quyền GM mode 8 và gõ đúng chữ xác
 * nhận "kenh<số>". Cửa xác nhận đó là thứ chặn bấm nhầm, không phải số kênh.
 */

const BAN_TOI_THIEU = "22.5.2.140";

/** Sáu nút điều khiển toàn bộ luồng Thế Lực Chiến Mới (TLC-New). */
const BUOC = [
  { so: 1, ten: "Bắt đầu (báo danh)", chinh: true, mota: "Xoá bảng điểm, mở báo danh và cho người chơi vào map chuẩn bị." },
  { so: 2, ten: "Vào Vòng 1", chinh: true, mota: "Mở cổng và bắt đầu đánh Vòng 1 (10 phút)." },
  { so: 3, ten: "Kết thúc V1 & Đảo phe", chinh: true, mota: "Chốt điểm Vòng 1, trao thưởng V1, đảo phe và nghỉ 2 phút." },
  { so: 4, ten: "Vào Vòng 2", chinh: true, mota: "Bắt đầu đánh Vòng 2 (10 phút)." },
  { so: 5, ten: "Kết thúc V2 & Boss Kỳ Lân", chinh: true, mota: "Chốt điểm Vòng 2, phát thưởng TOP/điểm danh và thả Boss Kỳ Lân." },
  { so: 6, ten: "Đá toàn bộ ra khỏi map", chinh: true, mota: "Đóng TLC, đưa toàn bộ người chơi về Huyền Bột Phái và dọn sạch map 801." },
] as const;

const TEN_TIEN_DO: Record<number, string> = {
  0: "Chưa mở trận",
  1: "Báo danh & Chuẩn bị (Map 801)",
  2: "Đang mở cổng",
  3: "ĐANG ĐÁNH VÒNG 1",
  4: "Nghỉ giữa hiệp & Đảo phe",
  5: "ĐANG ĐÁNH VÒNG 2",
  6: "Triệu hồi BOSS Kỳ Lân & Đóng trận",
};

type NguoiTrongTran = {
  ten: string;
  cap: number;
  nghe: number;
  pheGoc: number;
  pheTLC: string;
  ip: string;
  taiKhoan: string;
  mangDaPK: number;
  mangDaChet: number;
  laGM: boolean;
};

type TrangThai = {
  success?: boolean;
  message?: string;
  kenh?: number;
  tienDo?: number;
  tienDoDocLap?: number;
  vong?: number;
  daDaoPhe?: boolean;
  chinhPhai_SoNguoi?: number;
  taPhai_SoNguoi?: number;
  chinhPhai_DiemSo?: number;
  taPhai_DiemSo?: number;
  soNguoiTrongMap801?: number;
  danhSach?: NguoiTrongTran[];
};

type BxhRow = {
  tenNhanVat: string;
  ip: string;
  phe: string;
  soMangPK: number;
  soMangChet: number;
  maTranGanNhat: string;
  vongGanNhat: number;
  lanCuoi: string;
};

type AfkRow = {
  tenNhanVat: string;
  ip: string;
  phe: string;
  giayDungYen: number;
  maTran: string;
  vong: number;
  thoiGian: string;
};

type ThuongRow = {
  tenNhanVat: string;
  phe: string;
  loai: string;
  noiDung: string;
  soLuong: number;
  maTran: string;
  vong: number;
  thoiGian: string;
};

const TEN_LOAI_THUONG: Record<string, string> = {
  TOP: "TOP 3 hạng",
  THAMGIA: "Tham gia",
  HOP: "Rương Chiến Trường",
  DANHHIEU: "Danh hiệu TOP",
};

function gioPhut(value: string | null | undefined) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    }).format(new Date(value));
  } catch {
    return "—";
  }
}

/** Đếm mm:ss từ mốc bắt đầu, chạy phía trang nên không cần server gửi từng giây. */
function dongHo(giay: number) {
  if (giay < 0) giay = 0;
  const p = Math.floor(giay / 60);
  const g = giay % 60;
  return `${String(p).padStart(2, "0")}:${String(g).padStart(2, "0")}`;
}

export default function TheLucChienTool() {
  const [kenh, setKenh] = useState<1 | 2>(2);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [trangThai, setTrangThai] = useState<TrangThai | null>(null);
  const [trangThaiLoi, setTrangThaiLoi] = useState<string | null>(null);
  const [bxh, setBxh] = useState<BxhRow[]>([]);
  const [afk, setAfk] = useState<AfkRow[]>([]);
  const [afkCoBang, setAfkCoBang] = useState(true);
  const [thuong, setThuong] = useState<ThuongRow[]>([]);
  const [thuongCoBang, setThuongCoBang] = useState(true);
  const [lich, setLich] = useState<Record<string, string>>({});
  const [phanThuong, setPhanThuong] = useState<Record<string, string>>({});
  const [choPhepGhi, setChoPhepGhi] = useState(false);
  const [tuLamMoi, setTuLamMoi] = useState(true);
  const [giayTran, setGiayTran] = useState(0);
  const mocTienDo = useRef<{ tienDo: number; luc: number }>({ tienDo: -1, luc: Date.now() });

  // 12/08/2026 - MO dieu khien cho CA HAI kenh.
  //
  // Truoc day chan cung `kenh === 2` vi Kenh 1 con chay 22.5.2.89, khong co lenh `tlcbuoc` trong
  // GM pipe. Toi 12/08 Kenh 1 da len 22.5.2.155 nen lenh do co san, va gateway /tlc/buoc VON KHONG
  // he chan Kenh 1 - no chi doi quyen GM mode 8 va go dung chu xac nhan "kenh1". Nghia la dong nay
  // la thu DUY NHAT con chan.
  //
  // Van giu canh bao do o duoi: bam nut tren Kenh 1 la doi that vao tran cua nguoi choi that.
  const dieuKhienDuoc = true;

  /** Đọc trạng thái trận. Chỉ kênh có bản mới trả được — kênh cũ thì hiện lý do rõ ràng. */
  const docTrangThai = useCallback(async (k: 1 | 2) => {
    try {
      const r = await fetch(`/api/gm/the-luc-chien?resource=trangThai&kenh=${k}`, { cache: "no-store" });
      const p = await r.json();
      if (!r.ok || p.success !== true) {
        setTrangThai(null);
        setTrangThaiLoi(p.message ?? "Không đọc được trạng thái trận.");
        return;
      }
      setTrangThai(p);
      setTrangThaiLoi(null);
    } catch {
      setTrangThai(null);
      setTrangThaiLoi("Không gọi được dịch vụ.");
    }
  }, []);

  const docDuLieu = useCallback(
    async (k: 1 | 2) => {
      setLoading(true);
      try {
        const [rb, ra, rc, rt] = await Promise.all([
          fetch(`/api/gm/the-luc-chien?resource=bxhPk&kenh=${k}&soNgay=7`, { cache: "no-store" }),
          fetch(`/api/gm/the-luc-chien?resource=afk&kenh=${k}&soNgay=7`, { cache: "no-store" }),
          fetch(`/api/gm/the-luc-chien?resource=cauHinh&kenh=${k}`, { cache: "no-store" }),
          fetch(`/api/gm/the-luc-chien?resource=thuong&kenh=${k}&soNgay=7`, { cache: "no-store" }),
        ]);
        const [pb, pa, pc, pt] = await Promise.all([rb.json(), ra.json(), rc.json(), rt.json()]);
        setBxh(pb?.entries ?? []);
        setAfk(pa?.entries ?? []);
        setAfkCoBang(pa?.coBang !== false);
        setLich(pc?.cauHinh?.lich ?? {});
        setPhanThuong(pc?.cauHinh?.phanThuong ?? {});
        setChoPhepGhi(pc?.choPhepGhi === true);
        setThuong(pt?.entries ?? []);
        setThuongCoBang(pt?.coBang !== false);
      } catch {
        setNotice({ ok: false, text: "Không tải được dữ liệu Thế Lực Chiến." });
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void docTrangThai(kenh);
    void docDuLieu(kenh);
  }, [kenh, docTrangThai, docDuLieu]);

  // Tự làm mới khi trận đang chạy (tiến độ 1..4).
  //
  // Ba chỗ tiết kiệm, vì Vercel tính TỪNG lượt gọi và tài khoản đang ở 901K/1M mỗi 30 ngày:
  //
  // 1. DỪNG HẲN khi tab bị ẩn. Bản đầu tôi quên chỗ này nên trang cứ gọi dịch vụ dù Admin đã
  //    chuyển sang tab khác hoặc thu nhỏ cửa sổ — mở quên cả ngày là hàng nghìn lượt vô ích.
  //    Dashboard chính đã làm đúng từ trước (refreshIfVisible), tôi làm theo.
  // 2. Chỉ TRẠNG THÁI đọc nhanh 3 giây. Bảng xếp hạng / sổ AFK / sổ thưởng / cấu hình đọc thưa
  //    hơn nhiều — chúng gần như không đổi trong lúc đánh, mà lại tốn 4 lượt mỗi lần.
  // 3. Ngoài trận thì 60 giây, không phải 15.
  const dangTrongTran = (trangThai?.tienDo ?? 0) >= 1 && (trangThai?.tienDo ?? 0) <= 4;
  useEffect(() => {
    if (!tuLamMoi || !dieuKhienDuoc) return;

    const hienDangXem = () =>
      typeof document === "undefined" || document.visibilityState === "visible";

    const nhipTrangThai = dangTrongTran ? 3000 : 60000;
    const idTrangThai = setInterval(() => {
      if (hienDangXem()) void docTrangThai(kenh);
    }, nhipTrangThai);

    // Bốn bảng nặng: 20 giây trong trận, 5 phút ngoài trận.
    const nhipBang = dangTrongTran ? 20000 : 300000;
    const idBang = setInterval(() => {
      if (hienDangXem()) void docDuLieu(kenh);
    }, nhipBang);

    // Quay lại tab thì đọc ngay một lần, khỏi phải ngồi chờ hết nhịp.
    const khiHienLai = () => {
      if (hienDangXem()) void docTrangThai(kenh);
    };
    document.addEventListener("visibilitychange", khiHienLai);

    return () => {
      clearInterval(idTrangThai);
      clearInterval(idBang);
      document.removeEventListener("visibilitychange", khiHienLai);
    };
  }, [tuLamMoi, dieuKhienDuoc, dangTrongTran, kenh, docTrangThai, docDuLieu]);

  // Đồng hồ đếm từ lúc tiến độ đổi. Server không gửi thời gian còn lại nên trang tự đếm từ
  // mốc nhìn thấy tiến độ mới — đây là thời gian ĐÃ TRÔI của bước hiện tại, không phải đếm ngược.
  useEffect(() => {
    const td = trangThai?.tienDo ?? -1;
    if (mocTienDo.current.tienDo !== td) {
      mocTienDo.current = { tienDo: td, luc: Date.now() };
      setGiayTran(0);
    }
  }, [trangThai?.tienDo]);
  useEffect(() => {
    const id = setInterval(() => {
      setGiayTran(Math.floor((Date.now() - mocTienDo.current.luc) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  async function goi(body: Record<string, unknown>) {
    setLoading(true);
    setNotice(null);
    try {
      const r = await fetch("/api/gm/the-luc-chien", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, kenh }),
      });
      const p = await r.json();
      if (!r.ok || p.success !== true) throw new Error(p.message ?? "Thao tác thất bại.");
      setNotice({ ok: true, text: p.message ?? "Xong." });
      await docTrangThai(kenh);
      await docDuLieu(kenh);
      return true;
    } catch (e) {
      setNotice({ ok: false, text: e instanceof Error ? e.message : "Thao tác thất bại." });
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function bamBuoc(so: number, ten: string) {
    if (!window.confirm(`Chạy "${ten}" trên KÊNH ${kenh}?`)) return;
    await goi({ action: "buoc", buoc: so });
  }

  async function xoaBang(kemEventTop: boolean) {
    const loi = kemEventTop
      ? "Xoá cả EventTop — bảng này KHÔNG có cột kênh nên xoá sạch cho CẢ HAI kênh."
      : `Xoá sổ PK và sổ AFK của Kênh ${kenh}.`;
    if (!window.confirm(loi + "\n\nTiếp tục?")) return;
    const x = window.prompt('Gõ đúng "XOA BANG TLC" để xác nhận:') ?? "";
    if (x !== "XOA BANG TLC") return;
    await goi({ action: "xoaBang", xoaEventTop: kemEventTop, xacNhan: "XOA BANG TLC" });
  }

  async function luuLich(giaTri: Record<string, string>) {
    await goi({ action: "luuLich", giaTri });
  }

  const tienDo = trangThai?.tienDo ?? 0;
  const danhSach = trangThai?.danhSach ?? [];

  // Đếm số nhân vật theo IP để tô đỏ IP dùng nhiều tài khoản — đúng việc Admin cần soi.
  const demIp = new Map<string, number>();
  danhSach.forEach((n) => {
    if (n.ip) demIp.set(n.ip, (demIp.get(n.ip) ?? 0) + 1);
  });

  return (
    <div className="tlc-tool">
      {/* ---------- chọn kênh ---------- */}
      <div className="tlc-kenh-row">
        <span className="tlc-flabel">Kênh</span>
        {[2, 1].map((k) => (
          <button
            type="button"
            key={k}
            className={`chip ${kenh === k ? "active" : ""}`}
            aria-pressed={kenh === k}
            onClick={() => setKenh(k as 1 | 2)}
          >
            Kênh {k}
            {k === 2 ? " · thử nghiệm" : " · đang có người chơi"}
          </button>
        ))}
        <label className="tlc-auto">
          <input type="checkbox" checked={tuLamMoi} onChange={(e) => setTuLamMoi(e.target.checked)} />
          Tự làm mới {dangTrongTran ? "3 giây" : "60 giây"}
        </label>
        <button type="button" className="btn" onClick={() => { void docTrangThai(kenh); void docDuLieu(kenh); }}>
          <RefreshCw size={15} /> Làm mới
        </button>
        {loading ? <LoaderCircle size={18} className="spinning" /> : null}
      </div>

      {notice ? <div className={`ops-notice ${notice.ok ? "success" : "error"}`}>{notice.text}</div> : null}

      {kenh === 1 ? (
        <div className="tlc-canh-bao">
          <TriangleAlert size={17} />
          <div>
            <strong>Kênh 1 ĐANG CÓ NGƯỜI CHƠI THẬT — bấm là ăn ngay vào trận của họ.</strong>
            <p>
              Từ 12/08/2026 Kênh 1 chạy 22.5.2.155 nên năm nút đã dùng được. Nhưng đây không phải
              kênh thử: mở cổng, đảo phe hay kết thúc sớm đều đổi kết quả, phần thưởng và điểm của
              người thật, và <strong>không có đường hoàn tác</strong>. Muốn thử thì chọn Kênh 2.
            </p>
          </div>
        </div>
      ) : null}

      {/* ---------- trạng thái trận ---------- */}
      <section className="tlc-block">
        <h3><Swords size={17} /> Trạng thái trận · Kênh {kenh}</h3>
        {trangThaiLoi ? (
          <p className="tlc-empty">{trangThaiLoi}</p>
        ) : (
          <>
            <div className="tlc-state">
              <div className={`tlc-state-main ${tienDo === 3 ? "dang-danh" : ""}`}>
                <em>{TEN_TIEN_DO[tienDo] ?? `Tiến độ ${tienDo}`}</em>
                <strong>{dongHo(giayTran)}</strong>
                <small>đã trôi ở bước này</small>
              </div>
              <div className="tlc-state-grid">
                <span><em>Vòng</em><strong>{trangThai?.vong ?? "—"}</strong></span>
                <span><em>Đã đảo phe</em><strong>{trangThai?.daDaoPhe ? "Có" : "Chưa"}</strong></span>
                <span><em>Chính · người</em><strong>{trangThai?.chinhPhai_SoNguoi ?? 0}</strong></span>
                <span><em>Tà · người</em><strong>{trangThai?.taPhai_SoNguoi ?? 0}</strong></span>
                <span><em>Chính · điểm</em><strong>{trangThai?.chinhPhai_DiemSo ?? 0}</strong></span>
                <span><em>Tà · điểm</em><strong>{trangThai?.taPhai_DiemSo ?? 0}</strong></span>
                <span><em>Trong map 801</em><strong>{trangThai?.soNguoiTrongMap801 ?? 0}</strong></span>
                <span>
                  <em>Chặn lan liên kênh</em>
                  <strong className={trangThai?.tienDoDocLap === 1 ? "ok" : "canh-bao"}>
                    {trangThai?.tienDoDocLap === 1 ? "Đang bật" : "TẮT"}
                  </strong>
                </span>
              </div>
            </div>
            {kenh === 2 && trangThai?.tienDoDocLap !== 1 ? (
              <div className="tlc-canh-bao">
                <TriangleAlert size={17} />
                <div>
                  <strong>Khoá chặn lan đang TẮT ở Kênh 2.</strong>
                  <p>
                    Chạy TLC lúc này là người chơi Kênh 1 cấp từ 120 chỉ nhận 1 EXP mỗi con quái.
                    Đặt <code>TheLucChien_TienDo_DocLap=1</code> trong Gsconfig Kênh 2 rồi nạp lại
                    cấu hình trước khi bấm bắt đầu.
                  </p>
                </div>
              </div>
            ) : null}
          </>
        )}
      </section>

      {/* ---------- năm nút ---------- */}
      <section className="tlc-block">
        <h3><Flag size={17} /> Điều khiển từng bước</h3>
        <p className="tlc-hint">
          Ba bước thường dùng: <strong>Bắt đầu</strong> → <strong>Mở cổng cho đánh</strong> →
          <strong> Kết thúc + phát thưởng</strong>. Bấm là chạy ngay, không phải chờ hết 10 phút.
        </p>
        <div className="tlc-buoc-row">
          {BUOC.map((b) => (
            <button
              type="button"
              key={b.so}
              className={`tlc-buoc ${b.chinh ? "chinh" : ""} ${tienDo === b.so ? "hien-tai" : ""}`}
              disabled={!dieuKhienDuoc || loading}
              title={b.mota}
              onClick={() => void bamBuoc(b.so, b.ten)}
            >
              <span className="tlc-buoc-so">{b.so}</span>
              <span className="tlc-buoc-ten">{b.ten}</span>
              {b.so === 1 ? <Play size={14} /> : b.so === 4 ? <CircleStop size={14} /> : null}
            </button>
          ))}
        </div>
      </section>

      {/* ---------- thành viên trong trận ---------- */}
      <section className="tlc-block">
        <h3>Thành viên trong trận · {danhSach.length}</h3>
        {danhSach.length === 0 ? (
          <p className="tlc-empty">Chưa có ai trong bản đồ 801.</p>
        ) : (
          <div className="table-scroll">
            <table className="grid">
              <thead>
                <tr>
                  <th>Nhân vật</th><th>Cấp</th><th>Phe TLC</th><th>Phe gốc</th>
                  <th>IP</th><th>Tài khoản</th><th className="num">Mạng PK</th><th className="num">Đã chết</th>
                </tr>
              </thead>
              <tbody>
                {danhSach.map((n) => {
                  const trungIp = (demIp.get(n.ip) ?? 0) > 1;
                  return (
                    <tr key={n.ten} className={trungIp ? "tlc-trung-ip" : ""}>
                      <td>{n.ten}{n.laGM ? <span className="tag t-ca"> GM</span> : null}</td>
                      <td>{n.cap}</td>
                      <td>
                        <span className={`tag ${n.pheTLC === "Chinh" ? "t-chinh" : n.pheTLC === "Ta" ? "t-ta" : "t-ca"}`}>
                          {n.pheTLC || "—"}
                        </span>
                      </td>
                      <td>{n.pheGoc === 1 ? "Chính" : n.pheGoc === 2 ? "Tà" : "—"}</td>
                      <td className="mono">
                        {n.ip || "—"}
                        {trungIp ? <span className="tag t-ta"> {demIp.get(n.ip)} nv</span> : null}
                      </td>
                      <td className="mono">{n.taiKhoan}</td>
                      <td className="num">{n.mangDaPK}</td>
                      <td className="num">{n.mangDaChet}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="tlc-hint">
          Dòng tô đỏ là <strong>nhiều nhân vật cùng một IP</strong> — chỗ cần soi trước khi thưởng.
        </p>
      </section>

      {/* ---------- xếp hạng PK ---------- */}
      <section className="tlc-block">
        <h3>Xếp hạng PK · Kênh {kenh} · 7 ngày</h3>
        {bxh.length === 0 ? (
          <p className="tlc-empty">Chưa có dòng PK nào.</p>
        ) : (
          <div className="table-scroll">
            <table className="grid">
              <thead>
                <tr>
                  <th>#</th><th>Nhân vật</th><th>Phe</th><th>IP</th>
                  <th className="num">Mạng PK</th><th className="num">Đã chết</th>
                  <th>Trận gần nhất</th><th>Lần cuối</th>
                </tr>
              </thead>
              <tbody>
                {bxh.map((r, i) => (
                  <tr key={r.tenNhanVat}>
                    <td>{i + 1}</td>
                    <td>{r.tenNhanVat}</td>
                    <td><span className={`tag ${r.phe === "Chinh" ? "t-chinh" : r.phe === "Ta" ? "t-ta" : "t-ca"}`}>{r.phe || "—"}</span></td>
                    <td className="mono">{r.ip || "—"}</td>
                    <td className="num">{r.soMangPK}</td>
                    <td className="num">{r.soMangChet}</td>
                    <td className="mono">{r.maTranGanNhat || "—"}</td>
                    <td>{gioPhut(r.lanCuoi)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ---------- AFK bị đá ---------- */}
      <section className="tlc-block">
        <h3><UserMinus size={17} /> Bị đá vì AFK · {afk.length}</h3>
        {!afkCoBang ? (
          <p className="tlc-empty">
            Kênh này chưa có bảng <code>HK_Log_AFK_TLC</code> — bảng do bản {BAN_TOI_THIEU} tạo.
            Chưa có bảng khác với chưa ai bị đá.
          </p>
        ) : afk.length === 0 ? (
          <p className="tlc-empty">Chưa ai bị đá.</p>
        ) : (
          <div className="table-scroll">
            <table className="grid">
              <thead>
                <tr><th>Nhân vật</th><th>Phe</th><th>IP</th><th className="num">Đứng yên</th><th>Trận</th><th>Vòng</th><th>Lúc</th></tr>
              </thead>
              <tbody>
                {afk.map((r, i) => (
                  <tr key={`${r.tenNhanVat}-${r.thoiGian}-${i}`}>
                    <td>{r.tenNhanVat}</td>
                    <td><span className={`tag ${r.phe === "Chinh" ? "t-chinh" : r.phe === "Ta" ? "t-ta" : "t-ca"}`}>{r.phe || "—"}</span></td>
                    <td className="mono">{r.ip || "—"}</td>
                    <td className="num">{r.giayDungYen}s</td>
                    <td className="mono">{r.maTran || "—"}</td>
                    <td>{r.vong}</td>
                    <td>{gioPhut(r.thoiGian)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ---------- sổ nhận thưởng ---------- */}
      <section className="tlc-block">
        <h3>Sổ nhận thưởng · {thuong.length}</h3>
        {!thuongCoBang ? (
          <p className="tlc-empty">
            Kênh này chưa có bảng <code>HK_Log_Thuong_TLC</code> — bảng do bản 22.5.2.141 tạo.
            Chưa có bảng khác với chưa phát thưởng lần nào.
          </p>
        ) : thuong.length === 0 ? (
          <p className="tlc-empty">Chưa có lượt phát thưởng nào.</p>
        ) : (
          <div className="table-scroll">
            <table className="grid">
              <thead>
                <tr>
                  <th>Nhân vật</th><th>Phe</th><th>Loại</th><th>Nội dung</th>
                  <th className="num">Số lượng</th><th>Trận</th><th>Vòng</th><th>Lúc</th>
                </tr>
              </thead>
              <tbody>
                {thuong.map((r, i) => (
                  <tr key={`${r.tenNhanVat}-${r.thoiGian}-${i}`}>
                    <td>{r.tenNhanVat}</td>
                    <td><span className={`tag ${r.phe === "Chinh" ? "t-chinh" : r.phe === "Ta" ? "t-ta" : "t-ca"}`}>{r.phe || "—"}</span></td>
                    <td>{TEN_LOAI_THUONG[r.loai] ?? r.loai}</td>
                    <td>{r.noiDung}</td>
                    <td className="num">{r.soLuong.toLocaleString("vi-VN")}</td>
                    <td className="mono">{r.maTran || "—"}</td>
                    <td>{r.vong}</td>
                    <td>{gioPhut(r.thoiGian)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="tlc-hint">
          Dòng loại <strong>Rương Chiến Trường</strong> ghi cả số nhận thật so với số đáng nhận
          (ví dụ <code>nhan 2/3</code>) — túi đầy thì nhận thiếu, và đó chính là lúc người chơi khiếu nại.
        </p>
      </section>

      {/* ---------- lịch tự mở ---------- */}
      <section className="tlc-block">
        <h3><AlarmClock size={17} /> Lịch tự mở · Kênh {kenh}</h3>
        <LichForm
          lich={lich}
          choPhepGhi={choPhepGhi}
          kenh={kenh}
          loading={loading}
          onLuu={luuLich}
        />
      </section>

      {/* ---------- phần thưởng ---------- */}
      <section className="tlc-block">
        <h3>Phần thưởng đang khai · {Object.keys(phanThuong).length} khoá</h3>
        {Object.keys(phanThuong).length === 0 ? (
          <p className="tlc-empty">Kênh này chưa khai khoá TLC_ nào trong Gsconfig.</p>
        ) : (
          <div className="table-scroll">
            <table className="grid">
              <thead><tr><th>Khoá</th><th>Giá trị</th></tr></thead>
              <tbody>
                {Object.entries(phanThuong).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => (
                  <tr key={k}><td className="mono">{k}</td><td className="mono">{v || "(trống)"}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ---------- xoá bảng ---------- */}
      <section className="tlc-block tlc-nguy-hiem">
        <h3><Eraser size={17} /> Xoá dữ liệu sau khi test</h3>
        <p className="tlc-hint">
          Sổ PK và sổ AFK có cột kênh nên xoá đúng Kênh {kenh}.
          <strong> EventTop không có cột kênh</strong> — xoá là xoá sạch cho cả hai kênh, nên tách
          thành nút riêng.
        </p>
        <div className="tlc-buoc-row">
          <button type="button" className="btn danger" disabled={loading} onClick={() => void xoaBang(false)}>
            <Trash2 size={15} /> Xoá sổ PK + AFK của Kênh {kenh}
          </button>
          <button type="button" className="btn danger" disabled={loading} onClick={() => void xoaBang(true)}>
            <TriangleAlert size={15} /> Xoá kèm EventTop (cả hai kênh)
          </button>
        </div>
      </section>
    </div>
  );
}

/** Khung đặt lịch. Tách riêng để phần nhập không làm cả trang vẽ lại mỗi giây theo đồng hồ. */
function LichForm({
  lich,
  choPhepGhi,
  kenh,
  loading,
  onLuu,
}: {
  lich: Record<string, string>;
  choPhepGhi: boolean;
  kenh: number;
  loading: boolean;
  onLuu: (giaTri: Record<string, string>) => Promise<void>;
}) {
  const [gio, setGio] = useState("");
  const [phut, setPhut] = useState("");
  const [moRa, setMoRa] = useState("0");
  const [tongThoiGian, setTongThoiGian] = useState("");

  useEffect(() => {
    setGio(lich.TheLucChien_MoRa_Gio ?? "");
    setPhut(lich.TheLucChien_MoRa_Phut ?? "");
    setMoRa(lich.TheLucChien_MoRa ?? "0");
    setTongThoiGian(lich.TheLucChien_TongThoiGian ?? "");
  }, [lich]);

  const gioSo = Number(gio);
  // Kênh 1 chạy TLC 20:20-20:45. EventTop dùng chung và bị DELETE không lọc kênh, nên Kênh 2
  // chạy trùng khoảng đó là xoá mất bảng điểm đang chạy của Kênh 1.
  const trungGioKenh1 = kenh === 2 && Number.isFinite(gioSo) && gioSo === 20;

  return (
    <>
      <div className="tlc-lich-grid">
        <label><span>Giờ</span>
          <input type="number" min={0} max={23} value={gio} onChange={(e) => setGio(e.target.value)} disabled={!choPhepGhi} />
        </label>
        <label><span>Phút</span>
          <input type="number" min={0} max={59} value={phut} onChange={(e) => setPhut(e.target.value)} disabled={!choPhepGhi} />
        </label>
        <label><span>Độ dài trận (phút)</span>
          <input type="number" min={1} max={120} value={tongThoiGian} onChange={(e) => setTongThoiGian(e.target.value)} disabled={!choPhepGhi} />
        </label>
        <label><span>Tự mở</span>
          <select value={moRa} onChange={(e) => setMoRa(e.target.value)} disabled={!choPhepGhi}>
            <option value="1">Mỗi ngày</option>
            <option value="0">Tắt — chỉ mở tay</option>
          </select>
        </label>
      </div>
      {trungGioKenh1 ? (
        <div className="tlc-canh-bao">
          <TriangleAlert size={17} />
          <div>
            <strong>Giờ 20 trùng trận của Kênh 1 (20:20–20:45).</strong>
            <p>
              Bảng <code>EventTop</code> dùng chung và bị xoá không lọc kênh, nên Kênh 2 chạy trùng
              khoảng đó sẽ xoá mất bảng điểm đang chạy của Kênh 1. Chọn giờ khác.
            </p>
          </div>
        </div>
      ) : null}
      {!choPhepGhi ? (
        <p className="tlc-empty">
          Chưa mở đường ghi cấu hình cho Kênh {kenh}. Trang chỉ đọc được lịch, chưa đặt được.
        </p>
      ) : (
        <button
          type="button"
          className="btn"
          disabled={loading || trungGioKenh1}
          onClick={() =>
            void onLuu({
              TheLucChien_MoRa: moRa,
              TheLucChien_MoRa_Gio: gio,
              TheLucChien_MoRa_Phut: phut,
              TheLucChien_TongThoiGian: tongThoiGian,
            })
          }
        >
          Lưu lịch cho Kênh {kenh}
        </button>
      )}
      <p className="tlc-hint">
        Lưu là ghi vào Gsconfig. Phải bấm <strong>Reload configuration file (GSConfig.ini)</strong> trên
        cửa sổ GameServer của kênh đó để áp dụng, hoặc chờ lần khởi động lại kế tiếp.
      </p>
    </>
  );
}
