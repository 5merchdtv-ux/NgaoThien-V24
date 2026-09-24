export type TrangThaiCongThuc =
  | "DA_SUA"
  | "BINH_THUONG"
  | "CON_LOI_CHUA_SUA"
  | "CHET_HOAN_TOAN";

export interface KhiCongEntry {
  index: number | null;
  id: number | null;
  ten: string;
  loai: "goc" | "thang_thien";
  heSo1: number | null;
  heSo2: number | null;
  batBuocThangThien: number | null;
  moTa: string;
  trangThai: TrangThaiCongThuc;
  ghiChu: string | null;
}

export interface NgheData {
  job: number;
  tenNghe: string;
  khiCong: KhiCongEntry[];
}

export const TRANG_THAI_LABEL: Record<TrangThaiCongThuc, string> = {
  DA_SUA: "Đã sửa (audit 02/09)",
  BINH_THUONG: "Hoạt động bình thường",
  CON_LOI_CHUA_SUA: "Còn lỗi, chưa sửa",
  CHET_HOAN_TOAN: "Chết hoàn toàn",
};

export const TRANG_THAI_MAU: Record<TrangThaiCongThuc, string> = {
  DA_SUA: "var(--gold)",
  BINH_THUONG: "var(--green)",
  CON_LOI_CHUA_SUA: "var(--red)",
  CHET_HOAN_TOAN: "var(--muted)",
};
