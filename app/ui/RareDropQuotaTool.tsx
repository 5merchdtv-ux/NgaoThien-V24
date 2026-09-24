"use client";

import { Crown, PackageSearch, RefreshCw, TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type QuotaRow = {
  ngay: string;
  tenTui: string;
  nhom: string;
  soNgayChuKy: number;
  daRoi: number;
  /** null nghĩa là Gsconfig KHÔNG khai khoá trần cho nhóm này. */
  tran: number | null;
  dayTran: boolean;
};

type QuotaReply = {
  ngayHomNay: string;
  dropBoss: QuotaRow[];
  quaiThuong: QuotaRow[];
  thieuKhoaTran: string[];
};

type NhatKyRow = {
  thoiGian: string;
  loai: string;
  /** "boss" = rơi không có chủ; "thuong" = quái thường hoặc lượt nhặt / mở hộp. */
  nguon: string;
  nguoi: string;
  pid: number;
  tenMon: string;
  cap: number;
  nhomDo: string;
  banDo: number;
};

const LUA_CHON_NGAY = [7, 14, 30];

const LUA_CHON_NGUON: { id: string; nhan: string }[] = [
  { id: "", nhan: "Tất cả" },
  { id: "boss", nhan: "Chỉ boss" },
  { id: "thuong", nhan: "Ngoài boss" },
];

/** Bỏ tiền tố Boss_ cho gọn cột, vì cả bảng đã là của boss. */
function tenNhomGon(nhom: string) {
  return nhom.startsWith("Boss_") ? nhom.slice(5) : nhom;
}

function moTaChuKy(soNgay: number) {
  if (soNgay <= 0) return "bản ghi cũ";
  return soNgay === 1 ? "mỗi ngày" : `${soNgay} ngày`;
}

function BangQuota({
  tieuDe,
  moTa,
  bieuTuong,
  rows,
  bogonTen,
}: {
  tieuDe: string;
  moTa: string;
  bieuTuong: React.ReactNode;
  rows: QuotaRow[];
  bogonTen: boolean;
}) {
  // Gom theo ngày, ngày mới nhất lên trên.
  const theoNgay = useMemo(() => {
    const map = new Map<string, QuotaRow[]>();
    for (const row of rows) {
      const list = map.get(row.ngay) ?? [];
      list.push(row);
      map.set(row.ngay, list);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [rows]);

  return (
    <section className="glass-panel" style={{ marginBottom: 18 }}>
      <div className="bach-bao-editor-heading">
        <h3 style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
          {bieuTuong}
          {tieuDe}
        </h3>
      </div>
      <p className="field-help" style={{ marginTop: 0 }}>
        {moTa}
      </p>
      {rows.length === 0 ? (
        <div className="empty-state">
          <PackageSearch size={20} className="empty-state-icon" />
          <span>Chưa có bản ghi nào trong khoảng thời gian đang xem.</span>
        </div>
      ) : (
        <div className="game-log-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ngày bắt đầu chu kỳ</th>
                <th>Nhóm</th>
                <th>Chu kỳ</th>
                <th className="align-right">Đã rơi</th>
                <th className="align-right">Trần</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {theoNgay.map(([ngay, danhSach]) =>
                danhSach.map((row, i) => (
                  <tr key={`${ngay}-${row.tenTui}`}>
                    <td>{i === 0 ? ngay : ""}</td>
                    <td title={row.tenTui}>{bogonTen ? tenNhomGon(row.nhom) : row.nhom}</td>
                    <td>{moTaChuKy(row.soNgayChuKy)}</td>
                    <td className="align-right">{row.daRoi}</td>
                    <td className="align-right">
                      {row.tran === null ? "—" : row.tran}
                    </td>
                    <td>
                      {row.tran === null ? (
                        <span style={{ color: "#e3b341" }}>không khai khoá → KHÔNG GIỚI HẠN</span>
                      ) : row.tran === 0 ? (
                        <span style={{ opacity: 0.75 }}>cấm rơi</span>
                      ) : row.dayTran ? (
                        <span style={{ color: "#e5534b" }}>đã đầy trần</span>
                      ) : (
                        <span style={{ color: "#3fb950" }}>còn {row.tran - row.daRoi} suất</span>
                      )}
                    </td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/**
 * Trần đồ hiếm theo ngày.
 *
 * Số đã rơi đọc từ bảng HK_RareDropQuota, mức trần đọc từ Gsconfig.ini — hai nguồn khác nhau
 * nên khi sửa trần trong Gsconfig phải khởi động lại kênh thì số ở cột Trần mới đổi theo.
 *
 * Hai kênh dùng chung một database nên bộ đếm này là của TOÀN SERVER, không tách theo kênh.
 */
export default function RareDropQuotaTool() {
  const [duLieu, setDuLieu] = useState<QuotaReply | null>(null);
  const [nhatKy, setNhatKy] = useState<NhatKyRow[]>([]);
  const [nguon, setNguon] = useState("");
  const [soNgay, setSoNgay] = useState(14);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState("");

  const tai = useCallback(async () => {
    setDangTai(true);
    setLoi("");
    try {
      const [quotaRes, logRes] = await Promise.all([
        fetch(`/api/gm/rare-drop-quota?soNgay=${soNgay}`, { cache: "no-store" }),
        fetch(
          `/api/gm/rare-drop-quota?phan=nhat-ky&soNgay=${soNgay}${nguon ? `&loc=${nguon}` : ""}`,
          { cache: "no-store" },
        ),
      ]);
      if (!quotaRes.ok) {
        const body = await quotaRes.json().catch(() => ({}));
        throw new Error(body.message ?? "Không đọc được bộ đếm trần.");
      }
      const body = (await quotaRes.json()) as QuotaReply;
      setDuLieu({
        ngayHomNay: body.ngayHomNay ?? "",
        dropBoss: Array.isArray(body.dropBoss) ? body.dropBoss : [],
        quaiThuong: Array.isArray(body.quaiThuong) ? body.quaiThuong : [],
        thieuKhoaTran: Array.isArray(body.thieuKhoaTran) ? body.thieuKhoaTran : [],
      });
      // Nhật ký hỏng thì vẫn giữ được hai bảng trần, chỉ để trống phần dưới.
      setNhatKy(logRes.ok ? ((await logRes.json()) as NhatKyRow[]) ?? [] : []);
    } catch (error) {
      setLoi(error instanceof Error ? error.message : "Không đọc được bộ đếm trần.");
    } finally {
      setDangTai(false);
    }
  }, [soNgay, nguon]);

  useEffect(() => {
    void tai();
  }, [tai]);

  const thieu = duLieu?.thieuKhoaTran ?? [];

  return (
    <div className="bach-bao-page">
      <div className="bach-bao-toolbar">
        <div className="bach-bao-toolbar-actions">
          {LUA_CHON_NGAY.map((n) => (
            <button
              key={n}
              type="button"
              className={n === soNgay ? "gold-button" : "ghost"}
              onClick={() => setSoNgay(n)}
            >
              {n} ngày
            </button>
          ))}
          <button type="button" className="ghost" onClick={() => void tai()} disabled={dangTai}>
            <RefreshCw size={16} /> Tải lại
          </button>
        </div>
      </div>

      {loi ? <div className="form-error">{loi}</div> : null}

      {thieu.length > 0 ? (
        <div className="form-error" style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <TriangleAlert size={18} />
          <span>
            Chưa khai khoá trần cho: <strong>{thieu.join(", ")}</strong>. Thiếu khoá
            {" "}<code>RareDrop_TranNgay_&lt;nhóm&gt;</code> nghĩa là nhóm đó rơi{" "}
            <strong>không giới hạn</strong>, không phải bị cấm.
          </span>
        </div>
      ) : null}

      {dangTai && !duLieu ? (
        <div className="gm-loading-panel">Đang đọc bộ đếm trần…</div>
      ) : (
        <>
          <BangQuota
            tieuDe="Drop boss"
            moTa="Túi hạn mức riêng của boss, thêm từ bản 22.5.2.72. Trước bản đó boss dùng chung túi với quái thường nên quái thường luôn tiêu hết trần trước và boss gần như không bao giờ tới lượt. Áp cho mọi boss, gồm cả boss triệu hồi từ chuông vàng, bạc, đồng."
            bieuTuong={<Crown size={18} />}
            rows={duLieu?.dropBoss ?? []}
            bogonTen
          />
          <BangQuota
            tieuDe="Quái thường và các nhóm khác"
            moTa="Bao gồm quái thường, quái GS, thẻ Võ Huân và ngọc CLVC / ULPT — những nhóm vẫn dùng túi chung."
            bieuTuong={<PackageSearch size={18} />}
            rows={duLieu?.quaiThuong ?? []}
            bogonTen={false}
          />
          <section className="glass-panel" style={{ marginBottom: 18 }}>
            <div className="bach-bao-editor-heading">
              <h3 style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
                <PackageSearch size={18} />
                Nhật ký từng món đồ hiếm 13x–16x
              </h3>
            </div>
            <div className="bach-bao-toolbar-actions" style={{ marginBottom: 10 }}>
              {LUA_CHON_NGUON.map((l) => (
                <button
                  key={l.id || "all"}
                  type="button"
                  className={l.id === nguon ? "gold-button" : "ghost"}
                  onClick={() => setNguon(l.id)}
                >
                  {l.nhan}
                </button>
              ))}
            </div>
            {nhatKy.length === 0 ? (
              <div className="empty-state">
                <PackageSearch size={20} className="empty-state-icon" />
                <span>Chưa có món hiếm nào trong khoảng thời gian và bộ lọc đang chọn.</span>
              </div>
            ) : (
              <div className="game-log-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Thời gian</th>
                      <th>Nguồn</th>
                      <th>Việc</th>
                      <th>Người</th>
                      <th>Món</th>
                      <th className="align-right">Cấp</th>
                      <th>Loại</th>
                      <th className="align-right">Bản đồ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nhatKy.map((row, i) => (
                      <tr key={`${row.thoiGian}-${row.pid}-${i}`}>
                        <td>{row.thoiGian}</td>
                        <td>
                          {row.nguon === "boss" ? (
                            <span style={{ color: "#e3b341" }}>boss</span>
                          ) : (
                            <span style={{ opacity: 0.8 }}>ngoài boss</span>
                          )}
                        </td>
                        <td>{row.loai}</td>
                        <td>{row.nguoi || "—"}</td>
                        <td title={`PID ${row.pid}`}>{row.tenMon}</td>
                        <td className="align-right">{row.cap}</td>
                        <td>{row.nhomDo}</td>
                        <td className="align-right">{row.banDo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="field-help">
              Phân loại theo chủ sở hữu lúc rơi: đồ boss luôn rơi <strong>không có chủ</strong> để ai
              cũng nhặt được, còn quái thường luôn ghi tên người được ghi công. Hai trường hợp khác
              cũng rơi không chủ là bản đồ 801 (Thế Lực Chiến) và khi pet giết mà chênh cấp quá mức,
              nên nhãn “boss” là gần đúng chứ không tuyệt đối. Ghép dòng “rơi ra đất” với dòng “nhặt
              được” là truy được trọn vòng đời một món.
            </p>
          </section>

          <p className="field-help">
            Số đã rơi đọc từ bảng <code>HK_RareDropQuota</code>, mức trần đọc từ{" "}
            <code>Gsconfig.ini</code>. Sửa trần trong Gsconfig thì phải khởi động lại kênh, cột Trần
            mới đổi theo. Hai kênh dùng chung một database nên đây là số của toàn server, không tách
            theo kênh. Cột Ngày là ngày <strong>bắt đầu chu kỳ</strong>, không phải ngày rơi — nhóm
            có chu kỳ 3 hoặc 7 ngày thì một dòng phủ cả chu kỳ đó.
          </p>
        </>
      )}
    </div>
  );
}
