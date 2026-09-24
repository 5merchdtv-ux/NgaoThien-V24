import type { KhiCongEntry } from "./types";

export interface KhiCongDungChung extends KhiCongEntry {
  /** Danh sách job áp dụng khí công này (đối chiếu cột NhanVatNgheNghiepN trong DB ThangThienKhiCong). */
  apDungJob: number[];
  /** Nếu mỗi job có 1 KhiCongID riêng cùng trỏ về field chung (VD nhóm Trí Tàn/TT6-1/TT6-2), map job -> id thật để lấy đúng icon. */
  idTheoJob?: Record<number, number>;
}

// Khí công Thăng Thiên DÙNG CHUNG cho nhiều/mọi nghề — mỗi mã KhiCongID trong DB
// (ThangThienKhiCong) là 1 dòng riêng theo nghề, nhưng code PlayersBes.cs (UpdateKhiCong)
// đổ chung vào 1 field vật lý duy nhất nên chỉ cần mô tả 1 lần áp dụng cho tất cả nghề liên quan.
export const KHICONG_DUNG_CHUNG: KhiCongDungChung[] = [
  {
    index: null,
    id: 380,
    ten: "Cửu Chuyển Hồi Phong",
    loai: "thang_thien",
    heSo1: 1.0,
    heSo2: null,
    batBuocThangThien: 6,
    apDungJob: [2, 3, 5, 6, 7, 9, 11, 12, 13],
    moTa:
      "Khí công 'lấp chỗ trống' — chỉ áp dụng cho nghề KHÔNG có sẵn khí công gốc tương đương " +
      "(loại trừ Đao/Cung/HanBaoQuan/Quyền Sư, 4 nghề đã có 'công kích thấp nhất' riêng). " +
      "Cộng thẳng công kích cơ bản, không roll, có hiệu lực mọi lúc.",
    trangThai: "BINH_THUONG",
    ghiChu: "PlayersBes.cs case 380 (~8588-8593).",
  },
  {
    index: null,
    id: 381,
    ten: "Nhất Kích Đoạn Nhạc",
    loai: "thang_thien",
    heSo1: 3.0,
    heSo2: null,
    batBuocThangThien: 6,
    apDungJob: [1, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13],
    moTa:
      "Cùng cơ chế 'lấp chỗ trống' như Cửu Chuyển Hồi Phong, loại trừ Kiếm/Đàm Hoa Liên (2 nghề đã có khí công gốc tương đương). Cộng thẳng công kích cơ bản.",
    trangThai: "BINH_THUONG",
    ghiChu: "PlayersBes.cs case 381 (~8594-8604).",
  },
  {
    index: null,
    id: 382,
    ten: "Kim Chung Cương Khí",
    loai: "thang_thien",
    heSo1: 1.0,
    heSo2: null,
    batBuocThangThien: 6,
    apDungJob: [1, 2, 4, 5, 6, 8, 9, 10, 11, 12, 13],
    moTa: "Cộng thẳng phòng ngự cơ bản, loại trừ Thương/Cầm Sư (2 nghề đã có khí công gốc tên trùng ở idx0).",
    trangThai: "BINH_THUONG",
    ghiChu: "PlayersBes.cs case 382 (~8605-8610).",
  },
  {
    index: null,
    id: 383,
    ten: "Vận Khí Hành Tâm",
    loai: "thang_thien",
    heSo1: 0.04,
    heSo2: null,
    batBuocThangThien: 6,
    apDungJob: [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13],
    moTa:
      "Tăng % lượng MP hồi từ đan dược, loại trừ Đại Phu (đã có khí công gốc tên trùng ở idx0). Ghi vào field ThangThien_1_KhiCong_VanKhiHanhTam, tiêu thụ tại MagicPlus().",
    trangThai: "BINH_THUONG",
    ghiChu: "PlayersBes.cs case 383 (~8611-8616); tiêu thụ PlayersBes.cs ~25389.",
  },
  {
    index: null,
    id: 384,
    ten: "Chính Bản Bồi Nguyên",
    loai: "thang_thien",
    heSo1: 8.0,
    heSo2: null,
    batBuocThangThien: 6,
    apDungJob: [1, 2, 3, 5, 6, 8, 9, 10, 11, 12, 13],
    moTa: "Cộng thẳng HP tối đa, loại trừ Cung/Cầm Sư (2 nghề đã có khí công gốc tên trùng ở idx4).",
    trangThai: "BINH_THUONG",
    ghiChu: "PlayersBes.cs case 384 (~8617-8622).",
  },
  {
    index: null,
    id: 385,
    ten: "Vận Khí Liệu Thương (Thăng Thiên)",
    loai: "thang_thien",
    heSo1: 1.0,
    heSo2: null,
    batBuocThangThien: 6,
    apDungJob: [1, 2, 4, 5, 6, 7, 8, 9, 11, 12, 13],
    moTa:
      "Đường hồi máu THAY THẾ dành cho mọi nghề khác Thương (job3): tăng % lượng máu hồi (AddBlood()), loại trừ Thương/Quyền Sư. " +
      "Đây chính là đường hồi máu 'song song' khiến việc mở gate cho Quyền Sư/Tử Hào đầu vào field THUONG_VanKhi_LieuThuong (khí công gốc idx1 của họ) trở thành double-dip nếu mở thêm.",
    trangThai: "BINH_THUONG",
    ghiChu: "PlayersBes.cs case 385 (~8623-8628); tiêu thụ PlayersBes.cs AddBlood() ~25389 (điều kiện Player_Job!=3 && Player_Job_level>=6).",
  },
  {
    index: null,
    id: 386,
    ten: "Bách Biến Thần Hành (Thăng Thiên)",
    loai: "thang_thien",
    heSo1: 0.01,
    heSo2: null,
    batBuocThangThien: 6,
    apDungJob: [1, 3, 4, 5, 7, 10, 11, 12, 13],
    moTa: "Cộng thẳng % né tránh, loại trừ Kiếm/Ninja/HanBaoQuan/Đàm Hoa Liên (4 nghề đã có khí công gốc tên trùng).",
    trangThai: "BINH_THUONG",
    ghiChu: "PlayersBes.cs case 386 (~8629-8634).",
  },
  {
    index: null,
    id: 387,
    ten: "Cuồng Phong Thiên Ý",
    loai: "thang_thien",
    heSo1: 1.0,
    heSo2: null,
    batBuocThangThien: 6,
    apDungJob: [5],
    moTa:
      "Khí công ĐỘC QUYỀN Đại Phu, không dùng chung với ai. Roll RNG.Next(1,150) — mẫu số 150 thay vì 100, nhiều khả năng thiết kế để tránh lỗi vượt trần dù trần điểm đầu tư cao. Khi trúng: bật cờ cấm 'khí' (NoKhi_Ha_Y), trạng thái 700387 cộng +20% tấn công và +20% phòng ngự lúc 'phẫn nộ'.",
    trangThai: "BINH_THUONG",
    ghiChu: "PlayersBes.cs case 387 (~8635-8639, gate if Player_Job==5). Players.cs ~41405 (PvE), ~45043 (PK), ~69385-69404 (trạng thái 700387).",
  },
  {
    index: null,
    id: 615,
    ten: "Trí Tàn (dùng chung)",
    loai: "thang_thien",
    heSo1: 0.8,
    heSo2: null,
    batBuocThangThien: 10,
    apDungJob: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    idTheoJob: {
      1: 667, 2: 668, 3: 669, 4: 670, 5: 671, 6: 672, 7: 673,
      8: 674, 9: 675, 10: 676, 11: 677, 12: 678, 13: 615,
    },
    moTa:
      "13 mã KhiCongID (615 của Thần Nữ, 667-678 lần lượt của Đao/Kiếm/Thương/Cung/Đại Phu/Ninja/Cầm Sư/HanBaoQuan/Đàm Hoa Liên/Quyền Sư/Mai Liễu Chân/Tử Hào) đều đổ chung vào field base.ThangThien_5_TriTan = 3.0 + điểm×hệSố (hệ số DB khác nhau nhẹ giữa các nghề). " +
      "Chỉ được kiểm tra ở DUY NHẤT một vị trí: PK-chiêu (Players.cs ~45609-45618), dùng RNG RIÊNG (new Random().Next(1,125), không phải RNG chung server). Nếu trúng và đối phương chưa có trạng thái này, gắn debuff 'Trí Tàn' (1008002012) lên đối phương 1.5 giây. " +
      "Trạng thái 1008002012 KHÔNG có hiệu ứng giảm chỉ số/khống chế nào (chỉ xoá khỏi danh sách khi hết hạn) — tác dụng thực tế duy nhất tìm được là cờ hiệu ứng hình ảnh/danh hiệu trên gói tin. Không xuất hiện ở PvE (tay/chiêu) hay PK đòn tay.",
    trangThai: "CHET_HOAN_TOAN",
    ghiChu: "PlayersBes.cs case 615/667-678 (~8835-8848). Tiêu thụ duy nhất: Players.cs ~45609-45618. Về bản chất là khí công chết dù có code gán/tiêu thụ đầy đủ.",
  },
  {
    index: null,
    id: 620,
    ten: "Tinh Kim Bách Luyện (Thăng Thiên 6 thức - 1)",
    loai: "thang_thien",
    heSo1: 1.0,
    heSo2: null,
    batBuocThangThien: 11,
    apDungJob: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    idTheoJob: {
      1: 620, 2: 621, 3: 622, 4: 623, 5: 624, 6: 625, 7: 626,
      8: 627, 9: 628, 10: 629, 11: 630, 12: 631, 13: 632,
    },
    moTa:
      "13 mã KhiCongID (620-632, mỗi mã 1 nghề, tên DB giống hệt nhau 'Bác sĩ - Vàng ròng' — nhiều khả năng là tên placeholder chưa cập nhật) đổ chung vào field base.TinhKimBachLuyen_TT6_1 = điểm × hệ số. " +
      "Là nửa 'tấn công' của 1 cặp so sánh PK: sát thương chiêu PK cộng thêm/trừ bớt theo CHÊNH LỆCH giữa TinhKimBachLuyen_TT6_1 của người tấn công và HuyetKhiCuongDuong_TT6_2 của người phòng thủ (và ngược lại) — ai đầu tư nhiều hơn thì có lợi.",
    trangThai: "BINH_THUONG",
    ghiChu:
      "PlayersBes.cs case 620-632 (~8910-8923). Tiêu thụ: Players.cs ~40729-40736 (PK-tay), ~46004-46011 (PK-chiêu) — so sánh với Huyết Khí Cường Dương của đối phương.",
  },
  {
    index: null,
    id: 633,
    ten: "Huyết Khí Cường Dương (Thăng Thiên 6 thức - 2)",
    loai: "thang_thien",
    heSo1: 1.0,
    heSo2: null,
    batBuocThangThien: 11,
    apDungJob: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    idTheoJob: {
      1: 633, 2: 634, 3: 635, 4: 636, 5: 637, 6: 638, 7: 639,
      8: 640, 9: 641, 10: 642, 11: 643, 12: 644, 13: 645,
    },
    moTa:
      "13 mã KhiCongID (633-645, mỗi mã 1 nghề, tên DB giống hệt nhau 'Nhóm khí huyết dao-nhang') đổ chung vào field base.HuyetKhiCuongDuong_TT6_2 = điểm × hệ số. " +
      "Là nửa 'phòng thủ' của cặp so sánh PK cùng nhóm với Tinh Kim Bách Luyện — xem mô tả đầy đủ ở mục đó. Ngoài ra field còn cộng thẳng vào chỉ số 'Cường Khí' hiển thị cho client (Players.cs ~69685).",
    trangThai: "BINH_THUONG",
    ghiChu:
      "PlayersBes.cs case 633-645 (~8925-8938). Tiêu thụ: Players.cs ~40729-40736, ~46004-46011, ~69685 (hiển thị Cường Khí).",
  },
];

export function khiCongDungChungTheoJob(job: number): KhiCongEntry[] {
  return KHICONG_DUNG_CHUNG.filter((entry) => entry.apDungJob.includes(job)).map((entry) => {
    const idThat = entry.idTheoJob?.[job] ?? entry.id;
    return { ...entry, id: idThat };
  });
}
