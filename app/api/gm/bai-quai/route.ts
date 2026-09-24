import { proxyGmOperations } from "@/lib/gm-operations-proxy";
import { cleanText } from "@/lib/security";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

function integer(value: unknown, minimum: number, maximum: number) {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= minimum && value <= maximum
    ? value
    : 0;
}

/** Toạ độ và bán kính là số thực, có thể âm với toạ độ. */
function decimal(value: unknown, minimum: number, maximum: number, macDinh: number) {
  return typeof value === "number" && Number.isFinite(value) && value >= minimum && value <= maximum
    ? value
    : macDinh;
}

function baiQuai(value: unknown) {
  const bai = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    tenBai: cleanText(bai.tenBai, 60),
    maTui: cleanText(bai.maTui, 6).toUpperCase(),
    banDo: integer(bai.banDo, 1, 999999),
    toaDoX: decimal(bai.toaDoX, -1_000_000, 1_000_000, 0),
    toaDoY: decimal(bai.toaDoY, -1_000_000, 1_000_000, 0),
    banKinh: decimal(bai.banKinh, 0, 1_000_000, 0),
    heSoDropThuong: decimal(bai.heSoDropThuong, 1, 100, 1),
    heSoDropHiem: decimal(bai.heSoDropHiem, 1, 100, 1),
    batTat: bai.batTat !== false,
    ghiChu: cleanText(bai.ghiChu, 200),
    // Giờ trong ngày: hai giờ bằng nhau nghĩa là không lọc theo giờ.
    gioBatDau: integer(bai.gioBatDau, 0, 23),
    gioKetThuc: integer(bai.gioKetThuc, 0, 23),
    // Mốc ngày giờ cho sự kiện chạy một lần, dạng ô input datetime-local: 2026-08-08T02:00
    batDauLuc: cleanText(bai.batDauLuc, 20),
    ketThucLuc: cleanText(bai.ketThucLuc, 20),
    // Kênh áp dụng: 0 = cả hai, 1 = chỉ Kênh 1, 2 = chỉ Kênh 2.
    // Giá trị lạ thì về 2, KHÔNG về 0 — sự kiện phải mặc định nằm ngoài Kênh 1.
    kenh: bai.kenh === 0 || bai.kenh === 1 || bai.kenh === 2 ? bai.kenh : 2,
  };
}

/** Phần trăm tăng/giảm chỉ số quái, tính trên chỉ số gốc của chính con quái được chọn. */
function phanTram(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= -90 && value <= 1000
    ? value
    : 0;
}

function thaQuai(value: unknown) {
  const q = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    baiId: integer(q.baiId, 1, 2_000_000_000),
    maQuai: integer(q.maQuai, 1, 2_000_000_000),
    cap: integer(q.cap, 1, 200),
    soLuong: integer(q.soLuong, 1, 300),
    toaDoX: decimal(q.toaDoX, -1_000_000, 1_000_000, 0),
    toaDoY: decimal(q.toaDoY, -1_000_000, 1_000_000, 0),
    banKinhRai: decimal(q.banKinhRai, 0, 5000, 0),
    phanTramCongKich: phanTram(q.phanTramCongKich),
    phanTramPhongNgu: phanTram(q.phanTramPhongNgu),
    phanTramHp: phanTram(q.phanTramHp),
    // Tăng kinh nghiệm, tính trên EXP gốc của mã quái đã chọn. Bãi quái không có hệ số EXP riêng.
    phanTramExp: phanTram(q.phanTramExp),
    hoiSinhGiay: integer(q.hoiSinhGiay, 0, 86400),
  };
}

export async function GET(request: Request) {
  const source = new URL(request.url).searchParams;
  const phan = cleanText(source.get("phan"), 16);
  if (phan === "ban-do") return proxyGmOperations(request, "/bai-quai/ban-do", "GET");
  if (phan === "toa-do") return proxyGmOperations(request, "/bai-quai/toa-do", "GET");
  if (phan === "exp-chuan") {
    const cap = cleanText(source.get("cap"), 4);
    return proxyGmOperations(request, `/bai-quai/exp-chuan?cap=${encodeURIComponent(cap)}`, "GET");
  }
  if (phan === "quai-cao-thu") {
    const p = new URLSearchParams();
    const capMin = cleanText(source.get("capMin"), 4);
    const capMax = cleanText(source.get("capMax"), 4);
    if (capMin) p.set("capMin", capMin);
    if (capMax) p.set("capMax", capMax);
    return proxyGmOperations(request, `/bai-quai/quai-cao-thu?${p.toString()}`, "GET");
  }
  return proxyGmOperations(request, "/bai-quai", "GET");
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  // body.quai -> thả quái vào bãi; body.bai -> tạo bãi mới.
  if (body.quai) {
    return proxyGmOperations(request, "/bai-quai/tha-quai", "POST", thaQuai(body.quai));
  }
  return proxyGmOperations(request, "/bai-quai", "POST", baiQuai(body.bai));
}

export async function PUT(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const id = integer(body.id, 1, 2_000_000_000);
  return proxyGmOperations(request, `/bai-quai/${id}`, "PUT", baiQuai(body.bai));
}

export async function DELETE(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const id = integer(body.id, 1, 2_000_000_000);
  // chiXoaQuai = true: chỉ xoá các điểm quái của bãi, giữ lại bãi.
  if (body.chiXoaQuai === true) {
    return proxyGmOperations(request, `/bai-quai/${id}/quai`, "DELETE");
  }
  return proxyGmOperations(request, `/bai-quai/${id}`, "DELETE");
}
