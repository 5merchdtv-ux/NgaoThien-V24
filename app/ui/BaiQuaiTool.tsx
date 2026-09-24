"use client";

import { MapPin, Plus, RefreshCw, Save, Trash2, TriangleAlert, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fixVietnameseName } from "@/lib/vni-fix";

type BanDoOption = {
  mapId: number;
  mapName: string;
  soDiemQuai: number;
  capThapNhat: number;
  capCaoNhat: number;
};

type BaiQuai = {
  id: number;
  tenBai: string;
  maTui: string;
  banDo: number;
  tenBanDo: string;
  toaDoX: number;
  toaDoY: number;
  banKinh: number;
  heSoDropThuong: number;
  heSoDropHiem: number;
  batTat: boolean;
  ghiChu: string;
  soDiemQuai: number;
  capThapNhat: number;
  capCaoNhat: number;
  tenTui: string[];
  gioBatDau?: number;
  gioKetThuc?: number;
  batDauLuc?: string | null;
  ketThucLuc?: string | null;
  kenh?: number;
  // Thông số đàn quái đã thả lần trước, gateway đọc từ bản ghi bãi. Null = chưa thả lần nào.
  quaiMa?: number | null;
  quaiCap?: number | null;
  quaiSoLuong?: number | null;
  quaiBanKinhRai?: number | null;
  quaiPhanTramAt?: number | null;
  quaiPhanTramDf?: number | null;
  quaiPhanTramHp?: number | null;
  quaiHoiSinhGiay?: number | null;
  quaiPhanTramExp?: number | null;
};

type HanMucRow = { ngay: string; nhom: string; daRoi: number };

type FormState = {
  tenBai: string;
  maTui: string;
  banDo: string;
  toaDoX: string;
  toaDoY: string;
  banKinh: string;
  heSoDropThuong: string;
  heSoDropHiem: string;
  batTat: boolean;
  ghiChu: string;
  gioBatDau: string;
  gioKetThuc: string;
  batDauLuc: string;
  ketThucLuc: string;
  kenh: string;
};

type QuaiCaoThu = {
  maQuai: number;
  tenQuai: string;
  capThapNhat: number;
  capCaoNhat: number;
  hp: number;
  congKich: number;
  phongNgu: number;
  kinhNghiem: number;
  laCaoThu?: boolean;
  laBoss?: boolean;
  vang: number;
  hoiSinhGiay: number;
  soDiemDangCo: number;
};

type ToaDoLuu = {
  slot: number;
  ten: string;
  banDo: number;
  tenBanDo: string;
  x: number;
  y: number;
  z: number;
  luuBoi: string;
};

type ThaState = {
  maQuai: string;
  cap: string;
  soLuong: string;
  toaDoX: string;
  toaDoY: string;
  banKinhRai: string;
  phanTramCongKich: string;
  phanTramPhongNgu: string;
  phanTramHp: string;
  phanTramExp: string;
  hoiSinhGiay: string;
};

const THA_TRONG: ThaState = {
  maQuai: "",
  cap: "130",
  soLuong: "30",
  toaDoX: "0",
  toaDoY: "0",
  banKinhRai: "300",
  phanTramCongKich: "20",
  phanTramPhongNgu: "20",
  phanTramHp: "0",
  phanTramExp: "0",
  hoiSinhGiay: "0",
};

const FORM_TRONG: FormState = {
  tenBai: "",
  maTui: "",
  banDo: "",
  toaDoX: "0",
  toaDoY: "0",
  // Mặc định 300, KHÔNG phải 0. Sự cố 07/08/2026: bãi HHC2 tạo ra với bán kính 0 vì Admin chọn
  // toạ độ từ dropdown rồi lưu luôn, mà 0 nghĩa là CẢ BẢN ĐỒ — hệ số ×5 áp cho 1.706 điểm quái
  // của map thay vì đàn quái vừa thả. Giá trị nguy hiểm nhất không được làm giá trị mặc định.
  banKinh: "300",
  heSoDropThuong: "5",
  // Admin chốt 06/08/2026: chỉ nhân đồ thường, đồ hiếm giữ nguyên tỉ lệ chung.
  heSoDropHiem: "1",
  batTat: true,
  ghiChu: "",
  gioBatDau: "0",
  gioKetThuc: "0",
  batDauLuc: "",
  ketThucLuc: "",
  kenh: "2",
};

function so(value: string, macDinh: number) {
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) ? n : macDinh;
}

export default function BaiQuaiTool() {
  const [danhSach, setDanhSach] = useState<BaiQuai[]>([]);
  const [hanMuc, setHanMuc] = useState<HanMucRow[]>([]);
  const [banDoList, setBanDoList] = useState<BanDoOption[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState("");
  const [thongBao, setThongBao] = useState("");
  const [dangSua, setDangSua] = useState<number | null>(null);
  const [moForm, setMoForm] = useState(false);
  const [form, setForm] = useState<FormState>(FORM_TRONG);
  const [dangLuu, setDangLuu] = useState(false);
  const [baiThaQuai, setBaiThaQuai] = useState<BaiQuai | null>(null);
  const [quaiList, setQuaiList] = useState<QuaiCaoThu[]>([]);
  const [toaDoList, setToaDoList] = useState<ToaDoLuu[]>([]);
  const [tha, setTha] = useState<ThaState>(THA_TRONG);
  const [dangTha, setDangTha] = useState(false);
  // Tach hai o: cao thu rieng, quai thuong rieng. Admin bao danh sach gop chung qua dai, tim khong ra.
  const [loaiQuai, setLoaiQuai] = useState<"caothu" | "thuong" | "boss">("caothu");

  const taiDanhSach = useCallback(async () => {
    setDangTai(true);
    setLoi("");
    try {
      const [baiRes, mapRes, toaDoRes] = await Promise.all([
        fetch("/api/gm/bai-quai", { cache: "no-store" }),
        fetch("/api/gm/bai-quai?phan=ban-do", { cache: "no-store" }),
        // Nạp luôn ở đây chứ không đợi mở khung Thả quái: khung Tạo bãi cũng có Tâm X/Y nên
        // cũng cần danh sách điểm đã lưu.
        fetch("/api/gm/bai-quai?phan=toa-do", { cache: "no-store" }),
      ]);
      if (toaDoRes.ok) {
        const body = await toaDoRes.json();
        setToaDoList(Array.isArray(body) ? body : []);
      }
      if (!baiRes.ok) {
        const body = await baiRes.json().catch(() => ({}));
        throw new Error(body.message ?? "Không đọc được danh sách bãi.");
      }
      const baiBody = await baiRes.json();
      setDanhSach(Array.isArray(baiBody.baiQuai) ? baiBody.baiQuai : []);
      setHanMuc(Array.isArray(baiBody.hanMuc) ? baiBody.hanMuc : []);
      if (mapRes.ok) {
        const mapBody = await mapRes.json();
        setBanDoList(Array.isArray(mapBody) ? mapBody : []);
      }
    } catch (error) {
      setLoi(error instanceof Error ? error.message : "Không đọc được danh sách bãi.");
    } finally {
      setDangTai(false);
    }
  }, []);

  useEffect(() => {
    void taiDanhSach();
  }, [taiDanhSach]);

  const banDoDangChon = useMemo(
    () => banDoList.find((m) => String(m.mapId) === form.banDo),
    [banDoList, form.banDo],
  );

  /** Số món đã rơi hôm nay, gom theo tên túi (bỏ hậu tố chu kỳ và múi giờ). */
  const daRoiTheoTui = useMemo(() => {
    const homNay = hanMuc.filter((row) => row.ngay === new Date().toISOString().slice(0, 10));
    const gom = new Map<string, number>();
    for (const row of homNay) {
      const goc = row.nhom.split("@")[0];
      gom.set(goc, (gom.get(goc) ?? 0) + row.daRoi);
    }
    return gom;
  }, [hanMuc]);

  function moFormMoi() {
    setDangSua(null);
    setForm(FORM_TRONG);
    setMoForm(true);
    setThongBao("");
    setLoi("");
  }

  function moFormSua(bai: BaiQuai) {
    setDangSua(bai.id);
    setForm({
      tenBai: bai.tenBai,
      maTui: bai.maTui,
      banDo: String(bai.banDo),
      toaDoX: String(bai.toaDoX),
      toaDoY: String(bai.toaDoY),
      banKinh: String(bai.banKinh),
      heSoDropThuong: String(bai.heSoDropThuong),
      heSoDropHiem: String(bai.heSoDropHiem),
      batTat: bai.batTat,
      ghiChu: bai.ghiChu,
      gioBatDau: String(bai.gioBatDau ?? 0),
      gioKetThuc: String(bai.gioKetThuc ?? 0),
      batDauLuc: (bai.batDauLuc ?? "").slice(0, 16),
      ketThucLuc: (bai.ketThucLuc ?? "").slice(0, 16),
      kenh: String(bai.kenh ?? 2),
    });
    setMoForm(true);
    setThongBao("");
    setLoi("");
  }

  async function luu() {
    setDangLuu(true);
    setLoi("");
    setThongBao("");
    const bai = {
      tenBai: form.tenBai.trim(),
      maTui: form.maTui.trim().toUpperCase(),
      banDo: Math.trunc(so(form.banDo, 0)),
      toaDoX: so(form.toaDoX, 0),
      toaDoY: so(form.toaDoY, 0),
      banKinh: so(form.banKinh, 0),
      heSoDropThuong: so(form.heSoDropThuong, 1),
      heSoDropHiem: so(form.heSoDropHiem, 1),
      batTat: form.batTat,
      ghiChu: form.ghiChu.trim(),
      gioBatDau: Math.trunc(so(form.gioBatDau, 0)),
      gioKetThuc: Math.trunc(so(form.gioKetThuc, 0)),
      batDauLuc: form.batDauLuc.trim(),
      ketThucLuc: form.ketThucLuc.trim(),
      kenh: Math.trunc(so(form.kenh, 2)),
    };
    try {
      const response = await fetch("/api/gm/bai-quai", {
        method: dangSua === null ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dangSua === null ? { bai } : { id: dangSua, bai }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message ?? "Không lưu được.");
      setThongBao(body.message ?? "Đã lưu.");
      setMoForm(false);
      await taiDanhSach();
    } catch (error) {
      setLoi(error instanceof Error ? error.message : "Không lưu được.");
    } finally {
      setDangLuu(false);
    }
  }

  const quaiDangChon = useMemo(
    () => quaiList.find((q) => String(q.maQuai) === tha.maQuai),
    [quaiList, tha.maQuai],
  );

  /**
   * Chỉ những mã thuộc loại đang chọn. Admin báo: gộp cao thủ với quái thường vào một ô thì danh
   * sách quá dài, tìm không ra mã cao thủ. Cao thủ chỉ có 20 mã, quái thường thì hàng trăm.
   */
  const quaiTheoLoai = useMemo(
    () =>
      quaiList.filter((q) => {
        if (loaiQuai === "caothu") return q.laCaoThu === true && q.laBoss !== true;
        if (loaiQuai === "boss") return q.laBoss === true;
        return q.laCaoThu !== true && q.laBoss !== true;
      }),
    [quaiList, loaiQuai],
  );

  /**
   * Ô phần trăm nào đang nằm ngoài dải -90..1000.
   *
   * Bắt buộc phải chặn ở đây: tầng `/api/gm/bai-quai` dùng `phanTram()` trả về **0** khi số ngoài
   * dải chứ không báo lỗi. Nên nhập -93 là âm thầm thành 0 — Admin tưởng đã giảm 93% mà thực tế
   * không giảm gì. Sự cố thật 07/08/2026: ô Tăng kinh nghiệm nhập -93.
   */
  const loiPhanTram = useMemo(() => {
    const kiem: { ten: string; giaTri: string }[] = [
      { ten: "Tăng công kích", giaTri: tha.phanTramCongKich },
      { ten: "Tăng phòng ngự", giaTri: tha.phanTramPhongNgu },
      { ten: "Tăng HP", giaTri: tha.phanTramHp },
      { ten: "Tăng kinh nghiệm", giaTri: tha.phanTramExp },
    ];
    const loi: string[] = [];
    for (const o of kiem) {
      const raw = o.giaTri.trim();
      if (raw === "") continue; // để trống nghĩa là 0, không phải lỗi
      const n = Number(raw.replace(",", "."));
      if (!Number.isFinite(n)) {
        loi.push(`Ô "${o.ten}" không phải là số.`);
      } else if (n < -90 || n > 1000) {
        loi.push(`Ô "${o.ten}" đang là ${n}, ngoài dải cho phép -90 đến 1000.`);
      }
    }
    return loi;
  }, [tha.phanTramCongKich, tha.phanTramPhongNgu, tha.phanTramHp, tha.phanTramExp]);

  /**
   * Bộ chỉ số CHUẨN của cấp đang chọn, đo từ chính các điểm quái thường đang chạy.
   *
   * Dùng làm nền cho hai việc:
   *  - Kinh nghiệm: LUÔN theo chuẩn cấp, vì cấp là thứ quyết định người chơi cày ở đây có đúng
   *    tuyến không. Mã cao thủ có EXP cao hơn quái thường rất nhiều (15544 có 30.000 trong khi
   *    quái thường cấp 130 chỉ 7.000).
   *  - HP / công / phòng: chỉ khi nguồn là BOSS. Boss cấp 140 có HP 5.000.000 còn quái thường cấp
   *    140 chỉ 125.000 — lấy chỉ số boss rồi cộng phần trăm thì không ai đánh nổi.
   */
  const [chuanCap, setChuanCap] = useState<
    { hp: number; congKich: number; phongNgu: number; kinhNghiem: number; vang: number } | null
  >(null);
  useEffect(() => {
    const cap = Math.trunc(so(tha.cap, 0));
    if (!baiThaQuai || cap < 1 || cap > 200) {
      setChuanCap(null);
      return;
    }
    let boQua = false;
    (async () => {
      try {
        const res = await fetch(`/api/gm/bai-quai?phan=exp-chuan&cap=${cap}`, { cache: "no-store" });
        if (!res.ok) return;
        const body = await res.json();
        if (boQua) return;
        setChuanCap(
          typeof body?.expChuan === "number"
            ? {
                hp: Number(body.hpChuan ?? 0),
                congKich: Number(body.congKichChuan ?? 0),
                phongNgu: Number(body.phongNguChuan ?? 0),
                kinhNghiem: body.expChuan,
                vang: Number(body.vangChuan ?? 0),
              }
            : null,
        );
      } catch {
        // Không đọc được thì bảng xem trước bỏ mấy dòng đó, không chặn việc thả quái.
      }
    })();
    return () => {
      boQua = true;
    };
  }, [baiThaQuai, tha.cap]);

  /**
   * Chỉ số sau khi nhân phần trăm, để Admin thấy trước nền → sau.
   *
   * Nền phải khớp đúng cách gateway tính, nếu không thì bảng xem trước nói một đằng mà quái thả ra
   * một nẻo: boss thì nền là chuẩn cấp, còn lại là chỉ số của chính con quái.
   */
  const chiSoSau = useMemo(() => {
    if (!quaiDangChon) return null;
    const nhan = (goc: number, pt: string) =>
      Math.max(1, Math.round(goc * (1 + so(pt, 0) / 100)));
    const dungChuanCap = quaiDangChon.laBoss === true && chuanCap !== null && chuanCap.hp > 0;
    const nen = dungChuanCap
      ? { hp: chuanCap!.hp, congKich: chuanCap!.congKich, phongNgu: chuanCap!.phongNgu }
      : { hp: quaiDangChon.hp, congKich: quaiDangChon.congKich, phongNgu: quaiDangChon.phongNgu };
    return {
      dungChuanCap,
      nen,
      hp: nhan(nen.hp, tha.phanTramHp),
      congKich: nhan(nen.congKich, tha.phanTramCongKich),
      phongNgu: nhan(nen.phongNgu, tha.phanTramPhongNgu),
      kinhNghiem: chuanCap === null ? null : nhan(chuanCap.kinhNghiem, tha.phanTramExp),
    };
  }, [quaiDangChon, chuanCap, tha.phanTramHp, tha.phanTramCongKich, tha.phanTramPhongNgu, tha.phanTramExp]);

  async function moThaQuai(bai: BaiQuai) {
    setBaiThaQuai(bai);
    // Điền sẵn thông số của lần thả trước, gateway lưu vào bản ghi bãi từ bản 22.5.2.88.
    // Trước bản đó mọi ô đây chỉ là trạng thái form nên đóng khung là mất sạch — Admin bấm
    // "Thả quái" lần sau thì không biết lần trước đã đặt bao nhiêu con, bao nhiêu phần trăm.
    // Ô nào bãi chưa lưu (null) thì giữ giá trị mặc định của THA_TRONG.
    const cu = (giaTri: number | null | undefined, macDinh: string) =>
      giaTri === null || giaTri === undefined ? macDinh : String(giaTri);
    setTha({
      ...THA_TRONG,
      maQuai: cu(bai.quaiMa, THA_TRONG.maQuai),
      cap: cu(bai.quaiCap, THA_TRONG.cap),
      soLuong: cu(bai.quaiSoLuong, THA_TRONG.soLuong),
      banKinhRai: cu(bai.quaiBanKinhRai, THA_TRONG.banKinhRai),
      phanTramCongKich: cu(bai.quaiPhanTramAt, THA_TRONG.phanTramCongKich),
      phanTramPhongNgu: cu(bai.quaiPhanTramDf, THA_TRONG.phanTramPhongNgu),
      phanTramHp: cu(bai.quaiPhanTramHp, THA_TRONG.phanTramHp),
      phanTramExp: cu(bai.quaiPhanTramExp, THA_TRONG.phanTramExp),
      hoiSinhGiay: cu(bai.quaiHoiSinhGiay, THA_TRONG.hoiSinhGiay),
      toaDoX: String(bai.toaDoX),
      toaDoY: String(bai.toaDoY),
    });
    setLoi("");
    setThongBao("");
    try {
      const [quaiRes, toaDoRes] = await Promise.all([
        fetch("/api/gm/bai-quai?phan=quai-cao-thu&capMin=100&capMax=200", { cache: "no-store" }),
        fetch("/api/gm/bai-quai?phan=toa-do", { cache: "no-store" }),
      ]);
      if (quaiRes.ok) {
        const body = await quaiRes.json();
        setQuaiList(Array.isArray(body) ? body : []);
      }
      if (toaDoRes.ok) {
        const body = await toaDoRes.json();
        setToaDoList(Array.isArray(body) ? body : []);
      }
    } catch {
      setLoi("Không đọc được danh sách quái cao thủ.");
    }
  }

  /** Chọn một ô toạ độ đã lưu bằng lệnh !ltd thì điền luôn vào tâm thả. */
  function chonToaDo(slot: string) {
    const diem = toaDoList.find((t) => String(t.slot) === slot);
    if (!diem) return;
    setTha((truoc) => ({ ...truoc, toaDoX: String(Math.round(diem.x)), toaDoY: String(Math.round(diem.y)) }));
    if (baiThaQuai && diem.banDo !== baiThaQuai.banDo) {
      setLoi(
        `Điểm "${diem.ten}" nằm ở bản đồ ${diem.banDo} (${diem.tenBanDo}) nhưng bãi này ở bản đồ ` +
          `${baiThaQuai.banDo}. Quái sẽ thả vào bản đồ của bãi nên toạ độ này có thể lệch chỗ.`,
      );
    } else {
      setLoi("");
    }
  }

  async function thaQuai() {
    if (!baiThaQuai) return;
    // Chặn ngay ở đây, không để tầng API âm thầm đổi thành 0.
    if (loiPhanTram.length > 0) {
      setLoi(loiPhanTram.join(" "));
      return;
    }
    setDangTha(true);
    setLoi("");
    setThongBao("");
    try {
      const response = await fetch("/api/gm/bai-quai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quai: {
            baiId: baiThaQuai.id,
            maQuai: Math.trunc(so(tha.maQuai, 0)),
            cap: Math.trunc(so(tha.cap, 130)),
            soLuong: Math.trunc(so(tha.soLuong, 1)),
            toaDoX: so(tha.toaDoX, 0),
            toaDoY: so(tha.toaDoY, 0),
            banKinhRai: so(tha.banKinhRai, 0),
            phanTramCongKich: so(tha.phanTramCongKich, 0),
            phanTramPhongNgu: so(tha.phanTramPhongNgu, 0),
            phanTramHp: so(tha.phanTramHp, 0),
            phanTramExp: so(tha.phanTramExp, 0),
            hoiSinhGiay: Math.trunc(so(tha.hoiSinhGiay, 0)),
          },
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message ?? "Không thả được quái.");
      setThongBao(body.message ?? "Đã thả quái.");
      setBaiThaQuai(null);
      await taiDanhSach();
    } catch (error) {
      setLoi(error instanceof Error ? error.message : "Không thả được quái.");
    } finally {
      setDangTha(false);
    }
  }

  async function xoaQuaiCuaBai(bai: BaiQuai) {
    if (!window.confirm(`Xoá toàn bộ điểm quái do bãi "${bai.tenBai}" thả ra?`)) return;
    setLoi("");
    setThongBao("");
    try {
      const response = await fetch("/api/gm/bai-quai", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bai.id, chiXoaQuai: true }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message ?? "Không xoá được quái.");
      setThongBao(body.message ?? "Đã xoá quái.");
      await taiDanhSach();
    } catch (error) {
      setLoi(error instanceof Error ? error.message : "Không xoá được quái.");
    }
  }

  async function xoa(bai: BaiQuai) {
    if (!window.confirm(`Xoá bãi "${bai.tenBai}"? Vùng đó trở lại tỉ lệ rơi thường.`)) return;
    setLoi("");
    setThongBao("");
    try {
      const response = await fetch("/api/gm/bai-quai", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bai.id }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message ?? "Không xoá được.");
      setThongBao(body.message ?? "Đã xoá.");
      await taiDanhSach();
    } catch (error) {
      setLoi(error instanceof Error ? error.message : "Không xoá được.");
    }
  }

  return (
    <div className="bach-bao-page">
      <div className="bach-bao-toolbar">
        <div className="bach-bao-toolbar-actions">
          <button type="button" className="gold-button" onClick={moFormMoi}>
            <Plus size={16} /> Tạo bãi mới
          </button>
          <button type="button" className="ghost" onClick={() => void taiDanhSach()} disabled={dangTai}>
            <RefreshCw size={16} /> Tải lại
          </button>
        </div>
      </div>

      {loi ? (
        <div className="form-error">
          <TriangleAlert size={16} /> {loi}
        </div>
      ) : null}
      {thongBao ? <div className="inline-field-note">{thongBao}</div> : null}

      {moForm ? (
        <div className="glass-panel bach-bao-editor">
          <div className="bach-bao-editor-heading">
            <strong>{dangSua === null ? "Tạo bãi quái đặc biệt" : `Sửa bãi #${dangSua}`}</strong>
            <button type="button" className="icon-button" onClick={() => setMoForm(false)} aria-label="Đóng">
              <X size={16} />
            </button>
          </div>

          <div className="bach-bao-editor-grid">
            <label>
              Tên bãi
              <input
                value={form.tenBai}
                maxLength={60}
                onChange={(event) => setForm({ ...form, tenBai: event.target.value })}
                placeholder="Bãi sự kiện Hồ Hạp Cốc"
              />
            </label>

            <label>
              Mã túi hạn mức
              <input
                value={form.maTui}
                maxLength={6}
                onChange={(event) => setForm({ ...form, maTui: event.target.value.toUpperCase() })}
                placeholder="BAI1"
              />
              <span className="field-help">
                Tối đa 6 ký tự, chỉ chữ và số. Tên túi sẽ là {form.maTui.trim().toUpperCase() || "BAI1"}Thuong130,{" "}
                {form.maTui.trim().toUpperCase() || "BAI1"}Chan…
              </span>
            </label>

            <label>
              Bản đồ
              <select value={form.banDo} onChange={(event) => setForm({ ...form, banDo: event.target.value })}>
                <option value="">— chọn bản đồ —</option>
                {banDoList.map((m) => (
                  <option key={m.mapId} value={m.mapId}>
                    {m.mapId} · {m.mapName} · {m.soDiemQuai} điểm quái · cấp {m.capThapNhat}–{m.capCaoNhat}
                  </option>
                ))}
              </select>
              {banDoDangChon ? (
                <span className="field-help">
                  Bản đồ này có {banDoDangChon.soDiemQuai} điểm quái, cấp {banDoDangChon.capThapNhat}–
                  {banDoDangChon.capCaoNhat}.
                </span>
              ) : null}
            </label>

            <label>
              Bán kính
              <input
                value={form.banKinh}
                onChange={(event) => setForm({ ...form, banKinh: event.target.value })}
                placeholder="300"
              />
              {so(form.banKinh, 300) <= 0 ? (
                <span className="field-help" style={{ color: "#ff6b6b", fontWeight: 600 }}>
                  ⚠ Bán kính 0 = ÁP CHO CẢ BẢN ĐỒ, không phải quanh toạ độ đã chọn.
                  {banDoDangChon
                    ? ` Nghĩa là cả ${banDoDangChon.soDiemQuai} điểm quái của bản đồ này đều ăn hệ số.`
                    : ""}{" "}
                  Muốn gói quanh đàn quái vừa thả thì điền 300.
                </span>
              ) : (
                <span className="field-help">
                  Chỉ quái nằm trong bán kính này quanh tâm mới ăn hệ số. Để 0 là áp cho cả bản đồ.
                </span>
              )}
            </label>

            <label>
              Điểm đã lưu trong game
              <select
                defaultValue=""
                onChange={(event) => {
                  const diem = toaDoList.find((t) => String(t.slot) === event.target.value);
                  if (!diem) return;
                  // Điểm đã lưu biết cả bản đồ nên điền luôn, đỡ chọn nhầm map.
                  setForm((truoc) => ({
                    ...truoc,
                    banDo: String(diem.banDo),
                    toaDoX: String(Math.round(diem.x)),
                    toaDoY: String(Math.round(diem.y)),
                    // Chọn một điểm cụ thể thì ý là gói quanh điểm đó, nên bán kính 0 (cả bản đồ)
                    // chắc chắn không phải điều đang muốn. Điền 300 cho khớp. Sự cố 07/08/2026:
                    // bãi HHC2 chọn toạ độ xong lưu luôn, bán kính giữ mặc định 0 nên thành cả map.
                    banKinh: so(truoc.banKinh, 0) > 0 ? truoc.banKinh : "300",
                  }));
                }}
              >
                <option value="">— gõ tay toạ độ —</option>
                {toaDoList.map((t) => (
                  <option key={t.slot} value={t.slot}>
                    {t.slot}. {t.ten} · map {t.banDo} {t.tenBanDo} · {Math.round(t.x)}, {Math.round(t.y)}
                  </option>
                ))}
              </select>
              <span className="field-help">
                {toaDoList.length === 0
                  ? "Chưa lưu ô nào. Vào game gõ !ltd 1 để lưu chỗ đang đứng."
                  : "Chọn một ô là điền luôn bản đồ và tâm."}
              </span>
            </label>

            <label>
              Tâm X
              <input value={form.toaDoX} onChange={(event) => setForm({ ...form, toaDoX: event.target.value })} />
            </label>

            <label>
              Tâm Y
              <input value={form.toaDoY} onChange={(event) => setForm({ ...form, toaDoY: event.target.value })} />
            </label>

            <label>
              Hệ số rơi đồ thường
              <input
                value={form.heSoDropThuong}
                onChange={(event) => setForm({ ...form, heSoDropThuong: event.target.value })}
              />
              <span className="field-help">1 đến 100. Nhân tỉ lệ rơi đồ thường của quái trong bãi.</span>
            </label>

            <label>
              Hệ số rơi đồ hiếm
              <input
                value={form.heSoDropHiem}
                onChange={(event) => setForm({ ...form, heSoDropHiem: event.target.value })}
              />
              <span className="field-help">1 đến 100. Nhân tỉ lệ rơi đồ hiếm và ngọc CLVC / ULPT.</span>
            </label>

            <label>
              Ghi chú
              <input
                value={form.ghiChu}
                maxLength={200}
                onChange={(event) => setForm({ ...form, ghiChu: event.target.value })}
              />
            </label>

            <label>
              Mở bãi từ lúc
              <input
                type="datetime-local"
                value={form.batDauLuc}
                onChange={(event) => setForm({ ...form, batDauLuc: event.target.value })}
              />
              <span className="field-help">Để trống nghĩa là không giới hạn ngày bắt đầu.</span>
            </label>

            <label>
              Đóng bãi lúc
              <input
                type="datetime-local"
                value={form.ketThucLuc}
                onChange={(event) => setForm({ ...form, ketThucLuc: event.target.value })}
              />
              <span className="field-help">
                Ví dụ mở 08/08 02:00, đóng 10/08 19:00. Để trống là không giới hạn.
              </span>
            </label>

            <label>
              Giờ mở trong ngày
              <input
                value={form.gioBatDau}
                onChange={(event) => setForm({ ...form, gioBatDau: event.target.value })}
              />
            </label>

            <label>
              Giờ đóng trong ngày
              <input
                value={form.gioKetThuc}
                onChange={(event) => setForm({ ...form, gioKetThuc: event.target.value })}
              />
              <span className="field-help">
                Hai giờ bằng nhau nghĩa là không lọc theo giờ. Giờ đóng nhỏ hơn giờ mở thì vắt qua nửa
                đêm, ví dụ 20 → 2 là từ 20h tối tới 2h sáng.
              </span>
            </label>

            <label>
              Kênh áp dụng
              <select value={form.kenh} onChange={(event) => setForm({ ...form, kenh: event.target.value })}>
                <option value="2">Chỉ Kênh 2 (thử nghiệm)</option>
                <option value="1">Chỉ Kênh 1</option>
                <option value="0">Cả hai kênh</option>
              </select>
              <span className="field-help">
                {form.kenh === "2"
                  ? "Kênh 1 không thấy quái và không có hệ số. An toàn để thử nghiệm."
                  : form.kenh === "1"
                    ? "Chỉ Kênh 1. Kênh 2 không thấy quái."
                    : "CẢ HAI kênh đều có quái và hệ số. Người chơi Kênh 1 sẽ thấy ngay."}
              </span>
            </label>

            <label className="bach-bao-lock-field">
              <input
                type="checkbox"
                checked={form.batTat}
                onChange={(event) => setForm({ ...form, batTat: event.target.checked })}
              />
              Bật bãi này
            </label>
          </div>

          <div className="bach-bao-editor-actions">
            <button type="button" className="gold-button" onClick={() => void luu()} disabled={dangLuu}>
              <Save size={16} /> {dangLuu ? "Đang lưu…" : "Lưu"}
            </button>
            <button type="button" className="ghost" onClick={() => setMoForm(false)}>
              Huỷ
            </button>
          </div>

          <p className="field-help">
            GameServer đọc lại bảng bãi mỗi 15 giây nên không cần khởi động lại kênh. Trần của túi riêng phải khai
            trong Gsconfig, ví dụ <code>RareDrop_TranNgay_{form.maTui.trim().toUpperCase() || "BAI1"}Thuong130 = 9</code>{" "}
            và <code>RareDrop_SoMuiGio_{form.maTui.trim().toUpperCase() || "BAI1"}Thuong130 = 4</code> để chia đều 4
            múi giờ trong ngày. Khoá trần đọc nóng, không cần khởi động lại.
          </p>
        </div>
      ) : null}

      {baiThaQuai ? (
        <div className="glass-panel bach-bao-editor">
          <div className="bach-bao-editor-heading">
            <strong>
              Thả quái vào bãi #{baiThaQuai.id} — {baiThaQuai.tenBai} ({baiThaQuai.banDo} ·{" "}
              {baiThaQuai.tenBanDo})
            </strong>
            <button type="button" className="icon-button" onClick={() => setBaiThaQuai(null)} aria-label="Đóng">
              <X size={16} />
            </button>
          </div>

          <div className="bach-bao-editor-grid">
            <label>
              Loại quái
              <select
                value={loaiQuai}
                onChange={(event) => {
                  setLoaiQuai(event.target.value as "caothu" | "thuong" | "boss");
                  // Đổi loại thì bỏ mã đang chọn, nếu không thì mã cũ nằm ngoài danh sách mới mà ô
                  // vẫn giữ giá trị — bấm Thả quái là thả sai con.
                  setTha((truoc) => ({ ...truoc, maQuai: "" }));
                }}
              >
                <option value="caothu">Cao thủ — client vẽ tên đậm</option>
                <option value="thuong">Quái thường</option>
                <option value="boss">Boss — chỉ số lấy theo chuẩn cấp</option>
              </select>
              <span className="field-help">
                Tách ba nhóm cho dễ tìm: cao thủ chỉ có {quaiList.filter((q) => q.laCaoThu && !q.laBoss).length} mã,
                boss {quaiList.filter((q) => q.laBoss).length} mã, quái thường{" "}
                {quaiList.filter((q) => !q.laCaoThu && !q.laBoss).length} mã.
              </span>
            </label>

            <label>
              Mã quái
              <select
                value={tha.maQuai}
                onChange={(event) => {
                  const ma = event.target.value;
                  const chon = quaiList.find((q) => String(q.maQuai) === ma);
                  // Tự điền Cấp = cấp thật của con quái. Sự cố 07/08/2026: Admin thả Linh hồn yêu miêu
                  // (cấp thật 125) mà ô Cấp giữ mặc định 130, nên nền EXP thành chuẩn cấp 130 (7.000)
                  // thay vì cấp 125 (4.500) — người chơi thấy bãi VIP cho gấp mấy lần bãi thường.
                  setTha((truoc) => ({
                    ...truoc,
                    maQuai: ma,
                    cap: chon ? String(chon.capThapNhat) : truoc.cap,
                  }));
                }}
              >
                <option value="">— chọn quái ({quaiTheoLoai.length} mã) —</option>
                {quaiTheoLoai.map((q) => (
                  <option key={q.maQuai} value={q.maQuai}>
                    {q.maQuai} · {fixVietnameseName(q.tenQuai) || "(không tên)"} · cấp gốc {q.capThapNhat}
                    {q.capCaoNhat !== q.capThapNhat ? `–${q.capCaoNhat}` : ""} · HP{" "}
                    {q.hp.toLocaleString("vi-VN")} · công {q.congKich.toLocaleString("vi-VN")} · phòng{" "}
                    {q.phongNgu.toLocaleString("vi-VN")}
                  </option>
                ))}
              </select>
              <span className="field-help">
                Điểm quái thả ra luôn để <code>FLD_BOSS = 0</code> nên vẫn ăn hệ số rơi của bãi, thay vì đi
                đường rơi đồ của boss. Mã boss gốc trên bản đồ <strong>không bị đổi một dòng nào</strong>.
              </span>
              {quaiDangChon?.laBoss ? (
                <span className="field-help" style={{ color: "#7fd97f" }}>
                  ✓ Mã boss: HP / công / phòng sẽ lấy theo <strong>chuẩn của cấp {Math.trunc(so(tha.cap, 0))}</strong>,
                  không lấy chỉ số gốc của boss ({quaiDangChon.hp.toLocaleString("vi-VN")} HP). Xem bảng dưới.
                </span>
              ) : null}
              {quaiDangChon && !quaiDangChon.laCaoThu && !quaiDangChon.laBoss ? (
                <span className="field-help" style={{ color: "#e0b34a" }}>
                  Mã này <strong>không</strong> phải cao thủ nên tên sẽ vẽ bình thường. Tên và kiểu chữ do
                  client tự quyết theo mã quái — server không gửi chữ nào nên không đổi được. Muốn tên đậm
                  thì chọn nhóm Cao thủ rồi đặt Cấp quái theo ý mình: cấp và mã là hai thứ rời nhau.
                </span>
              ) : null}
              {baiThaQuai?.quaiMa ? (
                <span className="field-help" style={{ color: "#7fd97f" }}>
                  ✓ Các ô dưới đang là thông số của lần thả trước, đã lưu trong bản ghi bãi. Bấm Thả quái
                  là thả thêm một đàn nữa theo số này — muốn thay thế thì bấm Xoá quái trước.
                </span>
              ) : (
                <span className="field-help">Bãi này chưa thả lần nào, các ô dưới đang là giá trị mặc định.</span>
              )}
            </label>

            <label>
              Cấp quái đặt cho bãi
              <input value={tha.cap} onChange={(event) => setTha({ ...tha, cap: event.target.value })} />
              <span className="field-help">
                Chính cấp này quyết định bậc đồ rơi ra, kinh nghiệm, tiền, và với mã boss thì cả HP /
                công / phòng. Cấp và mã quái là hai thứ rời nhau.
              </span>
              {quaiDangChon && Math.trunc(so(tha.cap, 0)) !== quaiDangChon.capThapNhat ? (
                <span className="field-help" style={{ color: "#ff6b6b", fontWeight: 600 }}>
                  ⚠ Mã này cấp thật là <strong>{quaiDangChon.capThapNhat}</strong> mà đang đặt{" "}
                  {Math.trunc(so(tha.cap, 0))}. Kinh nghiệm và tiền sẽ theo cấp{" "}
                  {Math.trunc(so(tha.cap, 0))}, nên người chơi so con này với con cùng loại ngoài bãi sẽ
                  thấy lệch. Muốn giống hệt thì để {quaiDangChon.capThapNhat}.
                </span>
              ) : null}
            </label>

            <label>
              Số lượng
              <input value={tha.soLuong} onChange={(event) => setTha({ ...tha, soLuong: event.target.value })} />
              <span className="field-help">1–300 điểm quái.</span>
            </label>

            <label>
              Bán kính rải
              <input value={tha.banKinhRai} onChange={(event) => setTha({ ...tha, banKinhRai: event.target.value })} />
              <span className="field-help">Rải đều quanh tâm để không dồn một chỗ. 0 là chồng lên nhau.</span>
            </label>

            <label>
              Điểm đã lưu trong game
              <select defaultValue="" onChange={(event) => chonToaDo(event.target.value)}>
                <option value="">— gõ tay toạ độ bên dưới —</option>
                {toaDoList.map((t) => (
                  <option key={t.slot} value={t.slot}>
                    {t.slot}. {t.ten} · map {t.banDo} {t.tenBanDo} · {Math.round(t.x)}, {Math.round(t.y)}
                  </option>
                ))}
              </select>
              <span className="field-help">
                {toaDoList.length === 0
                  ? "Chưa lưu ô nào. Vào game đứng đúng chỗ rồi gõ !ltd 1 để lưu ô 1, !ltd 2 Bãi VIP để lưu kèm tên."
                  : "Chọn một ô là tự điền tâm thả. Lưu thêm bằng !ltd <số> [tên], xoá bằng !xtd <số>."}
              </span>
            </label>

            <label>
              Tâm thả X
              <input value={tha.toaDoX} onChange={(event) => setTha({ ...tha, toaDoX: event.target.value })} />
            </label>

            <label>
              Tâm thả Y
              <input value={tha.toaDoY} onChange={(event) => setTha({ ...tha, toaDoY: event.target.value })} />
            </label>

            <label>
              Tăng công kích (%)
              <input
                value={tha.phanTramCongKich}
                onChange={(event) => setTha({ ...tha, phanTramCongKich: event.target.value })}
              />
            </label>

            <label>
              Tăng phòng ngự (%)
              <input
                value={tha.phanTramPhongNgu}
                onChange={(event) => setTha({ ...tha, phanTramPhongNgu: event.target.value })}
              />
            </label>

            <label>
              Tăng HP (%)
              <input value={tha.phanTramHp} onChange={(event) => setTha({ ...tha, phanTramHp: event.target.value })} />
              <span className="field-help">
                Từ -90 đến 1000. Ba ô công kích / phòng ngự / HP tính trên{" "}
                {quaiDangChon?.laBoss ? (
                  <strong>chuẩn của cấp {Math.trunc(so(tha.cap, 0))}</strong>
                ) : (
                  "chỉ số gốc của chính con quái đã chọn"
                )}
                . Chọn nhóm Boss thì nền tự đổi sang chuẩn cấp, vì chỉ số boss lệch hẳn khỏi tuyến.
              </span>
            </label>

            <label>
              Tăng kinh nghiệm (%)
              <input value={tha.phanTramExp} onChange={(event) => setTha({ ...tha, phanTramExp: event.target.value })} />
              <span className="field-help">
                Từ -90 đến 1000. Ghi thẳng vào điểm quái nên không cần bảo trì kênh. Lưu ý: bãi quái
                <strong> không có</strong> hệ số EXP riêng — chỉ số này quyết định EXP của đàn quái.
              </span>
            </label>

            <label>
              Hồi sinh (giây)
              <input value={tha.hoiSinhGiay} onChange={(event) => setTha({ ...tha, hoiSinhGiay: event.target.value })} />
              <span className="field-help">0 nghĩa là giữ nguyên thời gian hồi sinh của quái gốc.</span>
            </label>
          </div>

          {quaiDangChon && chiSoSau ? (
            <div className="game-log-table-wrap">
              <table className="data-table">
                <caption style={{ captionSide: "top", textAlign: "left", padding: "0 0 0.4rem" }}>
                  <span className="field-help">
                    {chiSoSau.dungChuanCap
                      ? `Mã boss — nền là chuẩn của cấp ${Math.trunc(so(tha.cap, 0))}, không phải chỉ số của boss.`
                      : "Nền là chỉ số của chính con quái đã chọn."}
                  </span>
                </caption>
                <thead>
                  <tr>
                    <th>Chỉ số</th>
                    <th className="align-right">
                      Nền
                      <div className="field-help">
                        {chiSoSau.dungChuanCap
                          ? `chuẩn cấp ${Math.trunc(so(tha.cap, 0))}`
                          : "của chính con quái"}
                      </div>
                    </th>
                    <th className="align-right">Sau khi nhân</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      HP
                      {chiSoSau.dungChuanCap ? (
                        <div className="field-help">
                          Chỉ số gốc của boss là {quaiDangChon.hp.toLocaleString("vi-VN")} — không dùng.
                        </div>
                      ) : null}
                    </td>
                    <td className="align-right">{chiSoSau.nen.hp.toLocaleString("vi-VN")}</td>
                    <td className="align-right">
                      <strong>{chiSoSau.hp.toLocaleString("vi-VN")}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>Công kích</td>
                    <td className="align-right">{chiSoSau.nen.congKich.toLocaleString("vi-VN")}</td>
                    <td className="align-right">
                      <strong>{chiSoSau.congKich.toLocaleString("vi-VN")}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>Phòng ngự</td>
                    <td className="align-right">{chiSoSau.nen.phongNgu.toLocaleString("vi-VN")}</td>
                    <td className="align-right">
                      <strong>{chiSoSau.phongNgu.toLocaleString("vi-VN")}</strong>
                    </td>
                  </tr>
                  {chuanCap === null || chiSoSau.kinhNghiem === null ? null : (
                    <tr>
                      <td>
                        Kinh nghiệm
                        <div className="field-help">
                          Luôn theo chuẩn của cấp {Math.trunc(so(tha.cap, 0))}, không theo EXP của mã đã
                          chọn ({quaiDangChon.kinhNghiem.toLocaleString("vi-VN")}).
                        </div>
                      </td>
                      <td className="align-right">{chuanCap.kinhNghiem.toLocaleString("vi-VN")}</td>
                      <td className="align-right">
                        <strong>{chiSoSau.kinhNghiem.toLocaleString("vi-VN")}</strong>
                      </td>
                    </tr>
                  )}
                  {chuanCap === null ? null : (
                    <tr>
                      <td>
                        Tiền
                        <div className="field-help">
                          Theo chuẩn của cấp {Math.trunc(so(tha.cap, 0))}, không có ô phần trăm nên giữ
                          nguyên.
                        </div>
                      </td>
                      <td className="align-right">{chuanCap.vang.toLocaleString("vi-VN")}</td>
                      <td className="align-right">
                        <strong>{chuanCap.vang.toLocaleString("vi-VN")}</strong>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="field-help" style={{ margin: "0.75rem 0 0" }}>
              Chọn một mã quái ở ô trên để xem bảng chỉ số nền → sau khi nhân. Chưa chọn mã thì chưa có
              gì để tính nền.
            </p>
          )}

          {loiPhanTram.length > 0 ? (
            <p style={{ color: "#ff6b6b", fontWeight: 600, margin: "0.75rem 0 0" }}>
              ⚠ {loiPhanTram.join(" ")} Số ngoài dải sẽ bị đổi thành 0, tức không tăng không giảm gì —
              nên nút Thả quái bị chặn cho tới khi sửa. Muốn giảm mạnh nhất thì nhập -90.
            </p>
          ) : null}

          <div className="bach-bao-editor-actions">
            <button
              type="button"
              className="gold-button"
              onClick={() => void thaQuai()}
              disabled={dangTha || !tha.maQuai || loiPhanTram.length > 0}
            >
              <Plus size={16} /> {dangTha ? "Đang thả…" : "Thả quái"}
            </button>
            <button type="button" className="ghost" onClick={() => setBaiThaQuai(null)}>
              Huỷ
            </button>
          </div>

          <p className="field-help">
            Thả xong hệ thống tự gọi Reload NPC nên quái hiện ngay. Hết khung giờ thì bộ lịch hạ điểm quái xuống và
            GameServer cho quái hồi sinh với phòng ngự 999999 — người chơi đấm chỉ ra 1 máu, ai chạy ra rồi quay lại
            thì không còn quái.
          </p>
        </div>
      ) : null}

      {dangTai ? (
        <div className="gm-loading-panel">Đang đọc danh sách bãi…</div>
      ) : danhSach.length === 0 ? (
        <div className="empty-state">
          <MapPin size={20} className="empty-state-icon" />
          Chưa có bãi quái đặc biệt nào. Mọi bản đồ đang dùng tỉ lệ rơi chung.
        </div>
      ) : (
        <div className="game-log-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tên bãi</th>
                <th>Bản đồ</th>
                <th>Vùng</th>
                <th className="align-right">Điểm quái</th>
                <th className="align-right">Đồ thường</th>
                <th className="align-right">Đồ hiếm</th>
                <th>Kênh</th>
                <th>Mã túi</th>
                <th>Trạng thái</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {danhSach.map((bai) => (
                <tr key={bai.id}>
                  <td>{bai.id}</td>
                  <td>
                    <strong>{bai.tenBai}</strong>
                    {bai.ghiChu ? <div className="field-help">{bai.ghiChu}</div> : null}
                  </td>
                  <td>
                    {bai.banDo} · {bai.tenBanDo}
                  </td>
                  <td>
                    {bai.banKinh <= 0 ? (
                      <span style={{ color: "#ff6b6b", fontWeight: 600 }}>
                        ⚠ Cả bản đồ
                        <div className="field-help" style={{ color: "#ff6b6b" }}>
                          {bai.soDiemQuai} điểm quái đều ăn hệ số. Bấm Sửa rồi điền bán kính 300 để
                          gói lại quanh tâm ({bai.toaDoX}, {bai.toaDoY}).
                        </div>
                      </span>
                    ) : (
                      `Tâm (${bai.toaDoX}, ${bai.toaDoY}) · bán kính ${bai.banKinh}`
                    )}
                  </td>
                  <td className="align-right">
                    {bai.soDiemQuai}
                    {bai.soDiemQuai > 0 ? (
                      <div className="field-help">
                        cấp {bai.capThapNhat}–{bai.capCaoNhat}
                      </div>
                    ) : null}
                  </td>
                  <td className="align-right">×{bai.heSoDropThuong}</td>
                  <td className="align-right">×{bai.heSoDropHiem}</td>
                  <td>{bai.kenh === 0 ? "Cả hai" : bai.kenh === 1 ? "Kênh 1" : "Kênh 2"}</td>
                  <td>
                    <code>{bai.maTui}</code>
                    <div className="field-help">
                      {bai.tenTui
                        .map((tui) => {
                          const daRoi = daRoiTheoTui.get(tui);
                          return daRoi ? `${tui.slice(bai.maTui.length)}: ${daRoi}` : null;
                        })
                        .filter(Boolean)
                        .join(" · ") || "hôm nay chưa rơi món nào"}
                    </div>
                  </td>
                  <td>
                    <span className={`channel-badge ${bai.batTat ? "" : "danger"}`}>
                      {bai.batTat ? "Đang bật" : "Đã tắt"}
                    </span>
                  </td>
                  <td className="align-right">
                    <button type="button" className="ghost" onClick={() => moFormSua(bai)}>
                      Sửa
                    </button>
                    <button type="button" className="ghost" onClick={() => void moThaQuai(bai)}>
                      Thả quái
                    </button>
                    <button type="button" className="ghost" onClick={() => void xoaQuaiCuaBai(bai)}>
                      Xoá quái
                    </button>
                    <button type="button" className="delete-item-button" onClick={() => void xoa(bai)}>
                      <Trash2 size={15} /> Xoá
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
