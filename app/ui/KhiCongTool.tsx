"use client";

import {
  AlertTriangle,
  CheckCircle2,
  GitCompare,
  PackageOpen,
  Search,
  ShieldQuestion,
  Sparkles,
  UserRound,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  KHICONG_DATA,
  KHICONG_DUNG_CHUNG,
  TRANG_THAI_LABEL,
  khiCongDungChungTheoJob,
  tongSoKhiCong,
  type KhiCongEntry,
  type NgheData,
  type TrangThaiCongThuc,
} from "@/lib/khicong-data";
import {
  KHICONG_DATA_V24,
  KHICONG_DUNG_CHUNG_V24,
  khiCongDungChungTheoJobV24,
  tongSoKhiCongV24,
} from "@/lib/khicong-data-v24";

type CheDoXem = "ver22" | "ver24" | "so_sanh" | "can_chu_y";

function KhiCongIcon({
  id,
  ten,
  size = 40,
}: {
  id: number | null;
  ten: string;
  size?: number;
}) {
  const [hidden, setHidden] = useState(false);
  if (!id || hidden) {
    return (
      <span
        className="khicong-icon khicong-icon-fallback"
        style={{ width: size, height: size, flexBasis: size }}
        aria-hidden="true"
      >
        <PackageOpen size={Math.round(size * 0.45)} />
      </span>
    );
  }
  return (
    <img
      className="khicong-icon"
      style={{ width: size, height: size, flexBasis: size }}
      src={`/khicong-icons/${id}.jpg`}
      alt={ten}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setHidden(true)}
    />
  );
}

const STATUS_ICON: Record<TrangThaiCongThuc, typeof CheckCircle2> = {
  DA_SUA: Sparkles,
  BINH_THUONG: CheckCircle2,
  CON_LOI_CHUA_SUA: ShieldQuestion,
  CHET_HOAN_TOAN: XCircle,
};

function StatusDot({ trangThai }: { trangThai: TrangThaiCongThuc }) {
  return <i className={`khicong-dot ${trangThai}`} aria-hidden="true" />;
}

function formatHeSo(value: number | null): string {
  if (value === null) return "—";
  return value.toString();
}

function layKhoaKhiCong(entry: KhiCongEntry): string | number {
  return entry.id ?? `${entry.loai}-${entry.index}-${entry.ten}`;
}

// ===== Kết luận so sánh Ver22 ↔ Ver24 =====
// Suy ra HOÀN TOÀN từ trangThai + heSo đã có sẵn trong 2 bộ dữ liệu (không tự bịa nội dung mới) —
// mức độ "hỏng" tăng dần DA_SUA/BINH_THUONG (0) < CON_LOI_CHUA_SUA (1) < CHET_HOAN_TOAN (2).
type KetLuanNhan = "VER24_TOT_HON" | "VER22_TOT_HON" | "LECH_HE_SO" | "TUONG_DUONG" | "KHONG_DU_DU_LIEU";

const HANG_TRANG_THAI: Record<TrangThaiCongThuc, number> = {
  DA_SUA: 0,
  BINH_THUONG: 0,
  CON_LOI_CHUA_SUA: 1,
  CHET_HOAN_TOAN: 2,
};

const KET_LUAN_TIEU_DE: Record<KetLuanNhan, string> = {
  VER24_TOT_HON: "Ver24 (code hiện tại) tốt hơn — nên giữ nguyên Ver24",
  VER22_TOT_HON: "Ver22 (thiết kế gốc) đúng hơn — Ver24 đang kém hơn, nên sửa theo Ver22",
  LECH_HE_SO: "Cùng trạng thái, nhưng hệ số/công thức lệch nhau — nên theo bảng Ver24",
  TUONG_DUONG: "Tương đương nhau — theo bảng nào cũng như nhau",
  KHONG_DU_DU_LIEU: "Chưa có dữ liệu Ver24 đối chiếu",
};

function lechDangKe(a: number | null, b: number | null): boolean {
  if (a === null || b === null) return a !== b;
  if (a === 0 && b === 0) return false;
  const mau = Math.max(Math.abs(a), Math.abs(b), 1e-9);
  return Math.abs(a - b) / mau > 0.15;
}

function soSanhKhiCong(
  v22: KhiCongEntry,
  v24: KhiCongEntry | null
): { nhan: KetLuanNhan; noiDung: string } {
  if (!v24) {
    return {
      nhan: "KHONG_DU_DU_LIEU",
      noiDung:
        "Không tìm thấy khí công cùng id trong dữ liệu Ver24 đã audit đợt này — có thể khí công chỉ tồn tại ở Ver22, hoặc chưa kịp xử lý.",
    };
  }
  const hang22 = HANG_TRANG_THAI[v22.trangThai];
  const hang24 = HANG_TRANG_THAI[v24.trangThai];
  if (hang24 > hang22) {
    return {
      nhan: "VER22_TOT_HON",
      noiDung: `Ver22 từng đánh giá "${TRANG_THAI_LABEL[v22.trangThai]}" nhưng code Ver24 hiện tại lại ở mức "${TRANG_THAI_LABEL[v24.trangThai]}" — đã REGRESS so với thiết kế/kỳ vọng ban đầu. Nên sửa Ver24 theo đúng công thức ở cột Ver22, hoặc theo lý do cụ thể trong ghi chú cột Ver24 bên phải.`,
    };
  }
  if (hang24 < hang22) {
    return {
      nhan: "VER24_TOT_HON",
      noiDung: `Ver22 từng đánh giá "${TRANG_THAI_LABEL[v22.trangThai]}" nhưng đọc lại code Ver24 hôm nay xác nhận đã ở mức "${TRANG_THAI_LABEL[v24.trangThai]}" — đang hoạt động tốt hơn audit cũ ghi nhận. Nên GIỮ NGUYÊN Ver24, không cần sửa theo Ver22 — xem lý do cụ thể trong ghi chú cột Ver24.`,
    };
  }
  if (lechDangKe(v22.heSo1, v24.heSo1) || lechDangKe(v22.heSo2, v24.heSo2)) {
    return {
      nhan: "LECH_HE_SO",
      noiDung: `Cả 2 bên cùng đánh giá "${TRANG_THAI_LABEL[v22.trangThai]}", nhưng hệ số Ver22 (${formatHeSo(v22.heSo1)} / ${formatHeSo(v22.heSo2)}) lệch đáng kể so với hệ số Ver24 đọc trực tiếp từ DB sống hôm nay (${formatHeSo(v24.heSo1)} / ${formatHeSo(v24.heSo2)}). Nên theo BẢNG VER24 nếu muốn khớp đúng con số đang chạy thật trong game; bảng Ver22 chỉ còn giá trị tham khảo lịch sử.`,
    };
  }
  return {
    nhan: "TUONG_DUONG",
    noiDung: "Cả trạng thái lẫn hệ số giữa Ver22 và Ver24 đều khớp nhau. Theo bảng nào cũng như nhau, không có khác biệt cần xử lý.",
  };
}

// ===== Danh sách "Cần chú ý" — gom TOÀN BỘ 13 nghề + khí công dùng chung vào 1 danh sách phẳng,
// chỉ giữ lại những khí công có vấn đề thật (Ver24 đang lỗi/chết, hoặc lệch hệ số so với Ver22) =====
interface MucCanChuY {
  khoa: string;
  job: number;
  tenNghe: string;
  dungChung: boolean;
  apDungJob?: number[];
  entry22: KhiCongEntry;
  entry24: KhiCongEntry | null;
  ketLuan: { nhan: KetLuanNhan; noiDung: string };
}

function canChuY(ketLuan: { nhan: KetLuanNhan }, entry24: KhiCongEntry | null): boolean {
  if (!entry24) return true;
  if (entry24.trangThai === "CON_LOI_CHUA_SUA" || entry24.trangThai === "CHET_HOAN_TOAN") return true;
  return ketLuan.nhan === "LECH_HE_SO";
}

function doUuTienCanChuY(muc: MucCanChuY): number {
  if (!muc.entry24) return 0;
  if (muc.entry24.trangThai === "CHET_HOAN_TOAN") return 1;
  if (muc.entry24.trangThai === "CON_LOI_CHUA_SUA") return 2;
  if (muc.ketLuan.nhan === "LECH_HE_SO") return 3;
  return 4;
}

function xayDanhSachCanChuY(): MucCanChuY[] {
  const ketQua: MucCanChuY[] = [];

  for (const nghe22 of KHICONG_DATA) {
    const nghe24 = KHICONG_DATA_V24.find((n) => n.job === nghe22.job) ?? null;
    for (const e22 of nghe22.khiCong) {
      const e24 = nghe24?.khiCong.find((e) => e.id === e22.id) ?? null;
      const ketLuan = soSanhKhiCong(e22, e24);
      if (canChuY(ketLuan, e24)) {
        ketQua.push({
          khoa: `job-${nghe22.job}-${layKhoaKhiCong(e22)}`,
          job: nghe22.job,
          tenNghe: nghe22.tenNghe,
          dungChung: false,
          entry22: e22,
          entry24: e24,
          ketLuan,
        });
      }
    }
  }

  for (const dc22 of KHICONG_DUNG_CHUNG) {
    const jobDauTien = dc22.apDungJob[0];
    const ngheDauTien = KHICONG_DATA.find((n) => n.job === jobDauTien);
    const e22: KhiCongEntry = { ...dc22, id: dc22.idTheoJob?.[jobDauTien] ?? dc22.id };
    const dc24 = KHICONG_DUNG_CHUNG_V24.find((e) => e.id === dc22.id) ?? null;
    const e24: KhiCongEntry | null = dc24
      ? { ...dc24, id: dc24.idTheoJob?.[jobDauTien] ?? dc24.id }
      : null;
    const ketLuan = soSanhKhiCong(e22, e24);
    if (canChuY(ketLuan, e24)) {
      ketQua.push({
        khoa: `chung-${dc22.id}`,
        job: jobDauTien,
        tenNghe: ngheDauTien?.tenNghe ?? `Nghề #${jobDauTien}`,
        dungChung: true,
        apDungJob: dc22.apDungJob,
        entry22: e22,
        entry24: e24,
        ketLuan,
      });
    }
  }

  return ketQua.sort((a, b) => doUuTienCanChuY(a) - doUuTienCanChuY(b));
}

// Khối chi tiết 1 khí công (icon, mô tả, hệ số, kết luận đúng/sai) — dùng lại nguyên vẹn cho
// cả 3 chế độ. Luôn nhận vào 1 entry TỪ 1 NGUỒN DUY NHẤT (Ver22 hoặc Ver24), không bao giờ
// nhận dữ liệu đã gộp — ở chế độ so sánh, component cha gọi khối này 2 lần với 2 entry riêng.
function KhoiChiTietKhiCong({ entry, thuNho = false }: { entry: KhiCongEntry; thuNho?: boolean }) {
  return (
    <>
      <header className="khicong-detail-head">
        <KhiCongIcon id={entry.id} ten={entry.ten} size={thuNho ? 40 : 56} />
        <div>
          <span className="fixlog-label">
            {entry.loai === "goc" ? "Khí công gốc" : "Khí công Thăng Thiên"}
            {entry.id ? ` · PID ${entry.id}` : ""}
            {entry.batBuocThangThien ? ` · bậc ${entry.batBuocThangThien}` : ""}
          </span>
          <h2 style={thuNho ? { fontSize: 15 } : undefined}>{entry.ten}</h2>
        </div>
      </header>

      <section className="fixlog-block khicong-ingame-block">
        <h4>
          <Sparkles size={16} /> Nội dung khí công
        </h4>
        <p>{entry.moTa}</p>
        <div className="khicong-heso-row">
          <div>
            <span className="fixlog-label">Hệ số 1</span>
            <strong>{formatHeSo(entry.heSo1)}</strong>
          </div>
          <div>
            <span className="fixlog-label">Hệ số 2</span>
            <strong>{formatHeSo(entry.heSo2)}</strong>
          </div>
        </div>
      </section>

      <section className={`fixlog-block khicong-verdict-block ${entry.trangThai}`}>
        <h4>
          {(() => {
            const Icon = STATUS_ICON[entry.trangThai];
            return <Icon size={16} />;
          })()}
          Công thức đang chạy có đúng nội dung này không?
        </h4>
        <p className="khicong-verdict-label">{TRANG_THAI_LABEL[entry.trangThai]}</p>
        {entry.ghiChu ? (
          <p className="khicong-verdict-detail">{entry.ghiChu}</p>
        ) : (
          <p className="khicong-verdict-detail muted">Chưa có ghi chú chi tiết thêm.</p>
        )}
      </section>
    </>
  );
}

export default function KhiCongTool() {
  const [cheDoXem, setCheDoXem] = useState<CheDoXem>("so_sanh");
  const [selectedJob, setSelectedJob] = useState<number>(KHICONG_DATA[0]?.job ?? 1);
  const [selectedKey, setSelectedKey] = useState<string | number | null>(null);
  const [keyword, setKeyword] = useState("");

  const nghe22: NgheData = useMemo(
    () => KHICONG_DATA.find((n) => n.job === selectedJob) ?? KHICONG_DATA[0],
    [selectedJob]
  );
  const nghe24: NgheData = useMemo(
    () => KHICONG_DATA_V24.find((n) => n.job === selectedJob) ?? KHICONG_DATA_V24[0],
    [selectedJob]
  );
  const nghe = cheDoXem === "ver24" ? nghe24 : nghe22;

  const dungChung22 = useMemo(() => khiCongDungChungTheoJob(selectedJob), [selectedJob]);
  const dungChung24 = useMemo(() => khiCongDungChungTheoJobV24(selectedJob), [selectedJob]);

  // Ghép giống đúng bảng khí công thật trong game: khí công gốc riêng của nghề (Thường) và
  // toàn bộ khí công Thăng Thiên áp dụng cho nghề đó (riêng của nghề + dùng chung nhiều nghề).
  // Ver22 và Ver24 luôn được tính TÁCH RIÊNG thành 2 cặp mảng độc lập — không gộp.
  const khiCongThuong22 = useMemo(() => nghe22.khiCong.filter((e) => e.loai === "goc"), [nghe22]);
  const khiCongThangThien22 = useMemo(
    () => [...nghe22.khiCong.filter((e) => e.loai === "thang_thien"), ...dungChung22],
    [nghe22, dungChung22]
  );
  const khiCongThuong24 = useMemo(() => nghe24.khiCong.filter((e) => e.loai === "goc"), [nghe24]);
  const khiCongThangThien24 = useMemo(
    () => [...nghe24.khiCong.filter((e) => e.loai === "thang_thien"), ...dungChung24],
    [nghe24, dungChung24]
  );

  // Danh sách thẻ hiển thị phụ thuộc chế độ xem. Ở "so_sanh", khung sườn (thứ tự/số lượng thẻ)
  // lấy từ Ver22 làm chuẩn hiển thị — chọn 1 thẻ sẽ đối chiếu đúng khí công cùng id bên Ver24.
  const khiCongThuong = cheDoXem === "ver24" ? khiCongThuong24 : khiCongThuong22;
  const khiCongThangThien = cheDoXem === "ver24" ? khiCongThangThien24 : khiCongThangThien22;

  const flatEntries: KhiCongEntry[] = useMemo(
    () => [...khiCongThuong, ...khiCongThangThien],
    [khiCongThuong, khiCongThangThien]
  );

  const kw = keyword.trim().toLowerCase();
  const matchKeyword = (entry: KhiCongEntry) =>
    !kw || `${entry.ten} ${entry.moTa}`.toLowerCase().includes(kw);

  // selectedKey chỉ hợp lệ khi vẫn thuộc danh sách đang hiển thị (đổi nghề/chế độ là đổi hẳn danh sách).
  const active =
    flatEntries.find((entry) => layKhoaKhiCong(entry) === selectedKey) ?? flatEntries[0] ?? null;

  // Khí công Ver24 tương ứng với "active" — chỉ dùng ở chế độ so_sanh, tra theo id, KHÔNG gộp
  // vào active, chỉ đọc riêng để hiển thị cột bên cạnh.
  const activeDoiChieu24: KhiCongEntry | null = useMemo(() => {
    if (!active || active.id === null) return null;
    const nguon = [...khiCongThuong24, ...khiCongThangThien24];
    return nguon.find((e) => e.id === active.id) ?? null;
  }, [active, khiCongThuong24, khiCongThangThien24]);

  const ketLuanSoSanh = useMemo(
    () => (active ? soSanhKhiCong(active, activeDoiChieu24) : null),
    [active, activeDoiChieu24]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const danhSachCanChuY = useMemo(() => xayDanhSachCanChuY(), []);
  const danhSachCanChuYLoc = useMemo(
    () =>
      danhSachCanChuY.filter(
        (muc) => !kw || `${muc.entry22.ten} ${muc.entry22.moTa}`.toLowerCase().includes(kw)
      ),
    [danhSachCanChuY, kw]
  );

  const chonKhiCong = (entry: KhiCongEntry) => {
    setSelectedKey(layKhoaKhiCong(entry));
  };

  const chonNghe = (job: number) => {
    setSelectedJob(job);
    setSelectedKey(null);
    setKeyword("");
  };

  const nhayToiSoSanh = (muc: MucCanChuY) => {
    setCheDoXem("so_sanh");
    setSelectedJob(muc.job);
    setSelectedKey(layKhoaKhiCong(muc.entry22));
    setKeyword("");
  };

  const dataPicker = cheDoXem === "ver24" ? KHICONG_DATA_V24 : KHICONG_DATA;
  const dungChungFnPicker = cheDoXem === "ver24" ? khiCongDungChungTheoJobV24 : khiCongDungChungTheoJob;
  const total = cheDoXem === "ver24" ? tongSoKhiCongV24() : tongSoKhiCong();

  const ghiChuTongQuan =
    cheDoXem === "ver24"
      ? `Tổng ${total} khí công (gốc + Thăng Thiên) trên 13 nghề — dữ liệu VER24, đọc lại trực tiếp code SRCGameServerV24B hiện tại (biên soạn 15/09/2026).`
      : cheDoXem === "so_sanh"
        ? `So sánh Ver22 ↔ Ver24: khung sườn ${total} khí công lấy từ Ver22. Bấm chọn 1 khí công bên trái để xem đối chiếu 2 bên — dữ liệu 2 nguồn KHÔNG được gộp, mỗi cột đọc từ đúng nguồn của mình.`
        : cheDoXem === "can_chu_y"
          ? `${danhSachCanChuY.length} / ${total} khí công đang CẦN CHÚ Ý (Ver24 còn lỗi/chết, hoặc hệ số lệch đáng kể so với Ver22) — gom từ toàn bộ 13 nghề + khí công dùng chung. Bấm 1 dòng để xem đối chiếu chi tiết 2 bên.`
          : `Tổng ${total} khí công (gốc + Thăng Thiên) trên 13 nghề — dữ liệu VER22, biên soạn từ đợt audit 02/09/2026 (hồ sơ KT-20260902-01) và đọc code bổ sung.`;

  return (
    <div className="operations-body khicong-tool">
      <div className="khicong-mode-toggle" role="tablist" aria-label="Chọn chế độ xem dữ liệu">
        <button
          type="button"
          role="tab"
          aria-selected={cheDoXem === "ver22"}
          className={`khicong-mode-btn ${cheDoXem === "ver22" ? "active" : ""}`}
          onClick={() => setCheDoXem("ver22")}
        >
          Ver22
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={cheDoXem === "ver24"}
          className={`khicong-mode-btn ${cheDoXem === "ver24" ? "active" : ""}`}
          onClick={() => setCheDoXem("ver24")}
        >
          Ver24
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={cheDoXem === "so_sanh"}
          className={`khicong-mode-btn khicong-mode-btn-compare ${cheDoXem === "so_sanh" ? "active" : ""}`}
          onClick={() => setCheDoXem("so_sanh")}
        >
          <GitCompare size={13} /> So sánh
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={cheDoXem === "can_chu_y"}
          className={`khicong-mode-btn khicong-mode-btn-warn ${cheDoXem === "can_chu_y" ? "active" : ""}`}
          onClick={() => setCheDoXem("can_chu_y")}
        >
          <AlertTriangle size={13} /> Cần chú ý ({danhSachCanChuY.length})
        </button>
      </div>

      {cheDoXem !== "can_chu_y" ? (
      <div className="khicong-job-picker" role="tablist" aria-label="Chọn nghề">
        {dataPicker.map((n) => (
          <button
            key={n.job}
            type="button"
            role="tab"
            aria-selected={n.job === selectedJob}
            className={`khicong-job-card ${n.job === selectedJob ? "active" : ""}`}
            onClick={() => chonNghe(n.job)}
          >
            <span className="khicong-job-num">{n.job}</span>
            <span className="khicong-job-name">{n.tenNghe}</span>
            <span className="khicong-job-count">{n.khiCong.length + dungChungFnPicker(n.job).length} khí công</span>
          </button>
        ))}
      </div>
      ) : null}

      <p className="khicong-total-note">{ghiChuTongQuan}</p>

      {cheDoXem === "can_chu_y" ? (
        <div className="khicong-canchuy-panel">
          <div className="khicong-search">
            <Search size={15} />
            <input
              type="text"
              value={keyword}
              placeholder="Tìm theo tên hoặc mô tả khí công"
              onChange={(event) => setKeyword(event.target.value)}
            />
          </div>

          {danhSachCanChuYLoc.length === 0 ? (
            <p className="fixlog-no-result">Không có khí công nào khớp từ khoá tìm kiếm.</p>
          ) : (
            <div className="khicong-canchuy-list">
              {danhSachCanChuYLoc.map((muc) => (
                <button
                  type="button"
                  key={muc.khoa}
                  className="khicong-canchuy-row"
                  onClick={() => nhayToiSoSanh(muc)}
                >
                  <span className="khicong-canchuy-nghe">
                    {muc.dungChung
                      ? `Dùng chung (${muc.apDungJob?.length ?? 0} nghề)`
                      : `${muc.job}. ${muc.tenNghe}`}
                  </span>
                  <span className="khicong-canchuy-ten">
                    <KhiCongIcon id={muc.entry22.id} ten={muc.entry22.ten} size={28} />
                    {muc.entry22.ten}
                  </span>
                  <span className="khicong-canchuy-trangthai">
                    <StatusDot trangThai={muc.entry22.trangThai} />
                    Ver22: {TRANG_THAI_LABEL[muc.entry22.trangThai]}
                  </span>
                  <span className="khicong-canchuy-trangthai">
                    {muc.entry24 ? (
                      <>
                        <StatusDot trangThai={muc.entry24.trangThai} />
                        Ver24: {TRANG_THAI_LABEL[muc.entry24.trangThai]}
                      </>
                    ) : (
                      "Ver24: chưa có dữ liệu"
                    )}
                  </span>
                  <span className={`khicong-canchuy-nhan ${muc.ketLuan.nhan}`}>
                    {KET_LUAN_TIEU_DE[muc.ketLuan.nhan]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
      <div className={`khicong-workspace ${cheDoXem === "so_sanh" ? "khicong-workspace-compare" : ""}`}>
        <aside className="khicong-char-panel">
          <div className="khicong-char-visual">
            <UserRound size={72} strokeWidth={1.2} />
          </div>
          <strong>{nghe.tenNghe}</strong>
          <span className="khicong-char-job">Nghề #{nghe.job}</span>
          <p className="khicong-char-placeholder">
            Hình nhân vật thật (giống màn hình tạo nhân vật) sẽ thay vào đây khi có tài nguyên
            client — hiện đang chờ Admin cung cấp.
          </p>
        </aside>

        <section className="khicong-lists">
          <div className="khicong-search">
            <Search size={15} />
            <input
              type="text"
              value={keyword}
              placeholder="Tìm theo tên hoặc mô tả khí công"
              onChange={(event) => setKeyword(event.target.value)}
            />
          </div>

          <div className="khicong-section">
            <div className="khicong-section-title">
              <span>KHÍ CÔNG THƯỜNG</span>
              <em>{khiCongThuong.length}</em>
            </div>
            <div className="khicong-card-grid">
              {khiCongThuong.filter(matchKeyword).map((entry) => {
                const isActive = active === entry;
                return (
                  <button
                    type="button"
                    key={`goc-${entry.id}-${entry.index}`}
                    className={`khicong-card ${isActive ? "active" : ""}`}
                    onClick={() => chonKhiCong(entry)}
                  >
                    <KhiCongIcon id={entry.id} ten={entry.ten} />
                    <span className="khicong-card-name">{entry.ten}</span>
                    <StatusDot trangThai={entry.trangThai} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="khicong-section">
            <div className="khicong-section-title">
              <span>KHÍ CÔNG THĂNG THIÊN</span>
              <em>{khiCongThangThien.length}</em>
            </div>
            <div className="khicong-card-grid">
              {khiCongThangThien.filter(matchKeyword).map((entry, i) => {
                const isActive = active === entry;
                return (
                  <button
                    type="button"
                    key={`tt-${entry.id}-${i}`}
                    className={`khicong-card ${isActive ? "active" : ""}`}
                    onClick={() => chonKhiCong(entry)}
                  >
                    <KhiCongIcon id={entry.id} ten={entry.ten} />
                    <span className="khicong-card-name">{entry.ten}</span>
                    <StatusDot trangThai={entry.trangThai} />
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <main className={`khicong-detail ${cheDoXem === "so_sanh" ? "khicong-detail-compare" : ""}`}>
          {active ? (
            cheDoXem === "so_sanh" ? (
              <>
                {ketLuanSoSanh ? (
                  <section className={`fixlog-block khicong-compare-conclusion ${ketLuanSoSanh.nhan}`}>
                    <h4>
                      <GitCompare size={16} /> Kết luận so sánh
                    </h4>
                    <p className="khicong-compare-conclusion-label">{KET_LUAN_TIEU_DE[ketLuanSoSanh.nhan]}</p>
                    <p className="khicong-verdict-detail">{ketLuanSoSanh.noiDung}</p>
                  </section>
                ) : null}
                <div className="khicong-compare-columns">
                  <div className="khicong-compare-col">
                    <span className="khicong-compare-col-label khicong-compare-col-label-22">VER22 · GỐC</span>
                    <KhoiChiTietKhiCong entry={active} thuNho />
                  </div>
                  <div className="khicong-compare-col khicong-compare-col-v24">
                    <span className="khicong-compare-col-label khicong-compare-col-label-24">VER24 · HIỆN TẠI</span>
                    {activeDoiChieu24 ? (
                      <KhoiChiTietKhiCong entry={activeDoiChieu24} thuNho />
                    ) : (
                      <p className="khicong-verdict-detail muted">
                        Chưa có dữ liệu Ver24 đối chiếu cho khí công này (id {active.id ?? "—"}).
                      </p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <KhoiChiTietKhiCong entry={active} />
            )
          ) : (
            <p className="fixlog-no-result">Không có khí công nào khớp từ khoá tìm kiếm.</p>
          )}
        </main>
      </div>
      )}
    </div>
  );
}
