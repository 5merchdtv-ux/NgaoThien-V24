import type { NgheData } from "../khicong-data/types";

// Đối chiếu Ver24 THẬT — đọc lại code SRCGameServerV24B hiện tại (PlayersBes.cs UpdateKhiCong(),
// Players.cs, A8_Players_01..04*.cs, NpcClass.cs, World.cs) + đối chiếu số liệu hệ số qua sqlcmd
// (DB 24pub, bảng TBL_XWWL_SKILL cho khí công gốc, bảng 升天气功 cho khí công thăng thiên).
// KHÔNG dùng lại audit cũ (khicong-data/job10-quyensu.ts, đề ngày 02/09) mà không kiểm chứng —
// audit cũ được dùng làm baseline tham chiếu (giả định phản ánh thiết kế Ver22), mọi mô tả/trạng
// thái dưới đây được viết lại từ việc đọc code hiện tại, biên soạn 15/09/2026.
//
// PHÁT HIỆN LỚN cần lưu ý khi so sánh Ver22 vs Ver24:
// 1) index của 2 khí công "Khí trầm đan điền" (id190) và "Ma xử thành châm" (id559) bị ĐẢO NGƯỢC
//    so với audit cũ. Xác nhận qua 2 nguồn độc lập: (a) đọc trực tiếp switch(i) trong PlayersBes.cs
//    UpdateKhiCong() case Player_Job==10 — i==5 gán DonKhi_DanDien (id190), i==6 gán
//    QuyenSu_MaXuThanhCham (id559); (b) hàm World.取气功位置() (World.cs) hard-code case 181-193
//    (nhóm id190) trả về index=5 cho job 10. Audit cũ ghi ngược (index5=id559, index6=id190).
// 2) heSo1/heSo2 đọc lại từ DB (sqlcmd) LỆCH khá nhiều so với số trong audit cũ ở phần lớn khí
//    công gốc (vd id550 0.001 vs 0.01 cũ, id558 0.03 vs 0.003 cũ, id557 0.6/0.3 vs 1.0/2.0 cũ...).
//    Đã cập nhật heSo1/heSo2 theo số DB hiện tại; xem ghiChu từng dòng để biết số cũ.
// 3) 2 khí công Thăng Thiên id562 và id688 — audit cũ đánh dấu DA_SUA (đã bổ sung nhánh cho đòn
//    tay PK ngày 03/09) — KHÔNG tìm thấy phần bổ sung đó trong code hiện tại (đã kiểm cả file
//    A8_Players_02PhysicalAttack.cs lẫn bản backup-before-autohop-port của nó). Hạ về
//    CON_LOI_CHUA_SUA, xem ghiChu chi tiết.
// 4) id551 (Vận khí liệu thương) — bug audit cũ nêu (gate AddBlood chỉ mở cho Player_Job==3) ĐÃ
//    được sửa: nay có field + gate riêng cho job10. Nâng lên DA_SUA.
// 5) id579 (VoChuongVoNgai) — audit cũ ghi "chết hoàn toàn" (không tìm thấy nơi tiêu thụ). Tìm
//    lại thấy 1 điểm tiêu thụ thật (rất hẹp, chỉ liên quan đòn "nổ Yama" của Thần Nữ). Nâng lên
//    BINH_THUONG (không còn chết hẳn, dù tác dụng thực tế rất hiếm gặp).
//
// LƯU Ý: các số dòng (PlayersBes.cs / Players.cs / A8_Players_*.cs) trong ghiChu là số dòng đọc
// được tại thời điểm biên soạn file này — codebase đang được chỉnh sửa liên tục nên số dòng có
// thể lệch, luôn định vị lại bằng tên field/case thay vì tin tuyệt đối vào số dòng.
export const JOB_10_QUYEN_SU_V24: NgheData = {
  job: 10,
  tenNghe: "Quyền Sư",
  khiCong: [
    {
      index: 0,
      id: 550,
      ten: "Cuồng thần hàng thế",
      loai: "goc",
      heSo1: 0.001,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Hồi thêm SP mỗi tick khi KHÔNG ở trạng thái Nộ Khí Xung Thiên (điều kiện !NoKhi): " +
        "NhanVat_SP += 3 + Player_Level*2*QuyenSu_CuongThanHangThe.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs UpdateKhiCong() case Player_Job==10, i==0 (~dòng 9884): " +
        "base.QuyenSu_CuongThanHangThe = num3*num2. Tiêu thụ: A8_Players_04AttackConfirmation.cs " +
        "~201-207 (tick nhân vật) và NpcClass.cs ~1582-1587 (nhánh liên quan quái). heSo1 DB thực " +
        "(sqlcmd TBL_XWWL_SKILL, FLD_JOB=10, FLD_INDEX=0) = 0.001 — audit cũ ghi 0.01 (lệch 10 lần).",
    },
    {
      index: 1,
      id: 551,
      ten: "Vận khí liệu thương",
      loai: "goc",
      heSo1: 0.01,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Tăng % lượng HP hồi khi gọi 加血()/AddBlood cho CHÍNH Quyền Sư, qua field RIÊNG " +
        "base.QuyenSu_VanKhiLieuThuong (= điểm*heSo1 + 0.1) — không còn ghi vào field " +
        "THUONG_VanKhi_LieuThuong (Thương/Tử Hào) như audit cũ mô tả.",
      trangThai: "DA_SUA",
      ghiChu:
        "Gán: PlayersBes.cs case i==1 (~dòng 9887): base.QuyenSu_VanKhiLieuThuong = num3*num2+0.1. " +
        "Tiêu thụ: PlayersBes.cs 加血(int sl) ~dòng 22471-22502 — nay CÓ nhánh riêng " +
        "`if (Player_Job==10) sl *= 1+QuyenSu_VanKhiLieuThuong` (dòng ~22486-22489), tách biệt khỏi " +
        "nhánh `if (Player_Job==3||12)` dùng THUONG_VanKhi_LieuThuong (dòng ~22482-22484). KHÁC " +
        "AUDIT CŨ: audit 02/09 mô tả bug 'gate chỉ mở cho Player_Job==3, job10 vô hiệu' (trangThai " +
        "CON_LOI_CHUA_SUA) — bug này đã được sửa (không rõ đúng thời điểm nào): field + gate riêng " +
        "cho job10 hiện diện và hoạt động, song song với flat-bonus Thăng Thiên 1 " +
        "(ThangThien_1_KhiCong_VanKhi_LieuThuong, dòng ~22490-22492, áp cho mọi job trừ job3 nếu " +
        "level>=6). Đây là mẫu hình giống Thương/Tử Hào (cũng nhận cả 2 nguồn cộng dồn), không phải " +
        "lỗi double-dip như audit cũ lo ngại nếu mở gate.",
    },
    {
      index: 2,
      id: 552,
      ten: "Lực phách hoa sơn",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Cộng thêm công kích phẳng (FLD_NhanVat_KhiCong_CongKich), công thức chung nhiều nghề dựa " +
        "trên FLD_CongKichThapNhat/100/2, tối thiểu 1.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case i==2 (~dòng 9890-9897). heSo2 DB thực = 0.0 (audit cũ ghi 0.01) — " +
        "không ảnh hưởng vì công thức chỉ dùng num3 (hệ số 1).",
    },
    {
      index: 3,
      id: 553,
      ten: "Cuồng phong vạn phá",
      loai: "goc",
      heSo1: 3000.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Field CuongPhong_VanPha dùng chung nhiều nghề — cộng thêm số mili-giây thời lượng buff " +
        "Nộ Khí Xung Thiên (700014): thời lượng = 10000 + CuongPhong_VanPha.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case i==3 (~dòng 9900). Tiêu thụ: Players.cs ~61865-61890 (kích hoạt Nộ " +
        "Khí Xung Thiên, nhánh chung trừ job3/5/13 có công thức thời lượng riêng). heSo2 DB=0.0 " +
        "(audit cũ ghi 0.15, không dùng).",
    },
    {
      index: 4,
      id: 558,
      ten: "Linh giáp hộ thân",
      loai: "goc",
      heSo1: 0.03,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Cộng thêm % tăng lực phòng ngự võ công (FLD_NhanVat_KhiCong_VoCong_LucPhongNgu_GiaTangTiLePhanTram) " +
        "= điểm đã đầu tư × heSo1 (0.03/điểm).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case i==4 (~dòng 9903): FLD_NhanVat_KhiCong_VoCong_LucPhongNgu_GiaTangTiLePhanTram " +
        "= num2*num3. Tiêu thụ: thuộc tính LucPhongNguVoCong trong PlayersBes.cs (~dòng 2228), nhân " +
        "vào công thức phòng ngự võ công tổng. ĐÍNH CHÍNH AUDIT CŨ: audit 02/09 khẳng định field này " +
        "'dùng trực tiếp hệ số 2 (3.0), không dùng hệ số 1' — SAI theo code hiện tại: công thức chỉ " +
        "dùng num3 (hệ số 1 DB = 0.03/điểm), hệ số 2 DB = 0.0 không xuất hiện ở đâu trong công thức " +
        "này. heSo1 DB thực = 0.03 (audit cũ ghi 0.003, lệch 10 lần); heSo2 DB thực = 0.0 (audit cũ " +
        "ghi 3.0).",
    },
    {
      index: 5,
      id: 559,
      ten: "Ma xử thành châm",
      loai: "goc",
      heSo1: 0.005,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Nhân thêm % sát thương (num *= 1+QuyenSu_MaXuThanhCham), áp dụng ở CUỐI khối xử lý " +
        "Player_Job==10 mỗi khi Quyền Sư ra chiêu (cả PK-chiêu lẫn PvE-chiêu) — không thấy điều " +
        "kiện giới hạn theo trạng thái combo cụ thể trong đoạn code trực tiếp nhân hệ số này.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "SỬA INDEX so với audit cũ: audit cũ ghi index=5 cho id559 và index=6 cho id190 — kiểm lại " +
        "bằng cả 2 nguồn (switch(i) trong PlayersBes.cs UpdateKhiCong() VÀ hàm World.取气功位置() " +
        "case 181-193 hard-code index=5 cho job10 ↔ nhóm id190) xác nhận id559 thực ra ở index 6, " +
        "id190 ở index 5 — đã đảo lại 2 mục này so với thứ tự audit cũ (giữ nguyên thứ tự phần tử " +
        "trong mảng, chỉ sửa giá trị index). Gán: PlayersBes.cs case i==6 (~dòng 9909): " +
        "base.QuyenSu_MaXuThanhCham = 0.1+num2*num3. Tiêu thụ: A8_Players_03MagicAttack.cs ~dòng " +
        "1043 (hàm MagicAttack_Player, PK-chiêu) và ~3645 (hàm ComputingAttack, PvE-chiêu) — nhân vô " +
        "điều kiện. LƯU Ý KHÁC AUDIT CŨ: audit trước mô tả 'chỉ khi combo trạng thái 2-5, trừ 2 chiêu " +
        "3000101/3000105' — có tồn tại hàm riêng 判断拳师连击()/'Xác định combo quyền sư' " +
        "(Players.cs ~62689) xử lý chuỗi combo bắt đầu từ đúng 2 skill ID đó, nhưng CHƯA xác nhận " +
        "được hàm này có gate trực tiếp việc nhân QuyenSu_MaXuThanhCham hay không — cần đối chiếu " +
        "sâu hơn nếu cần độ chính xác tuyệt đối cho chi tiết này.",
    },
    {
      index: 6,
      id: 190,
      ten: "Khí trầm đan điền",
      loai: "goc",
      heSo1: 0.005,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Field dùng chung mọi nghề — cộng thêm HP và ULPT (Lực Phòng Ngự Võ Công) = " +
        "FLD_PhongNgu × DonKhi_DanDien / 100.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "SỬA INDEX so với audit cũ — xem giải thích đầy đủ ở ghiChu của id559 (mục ngay trên). Gán: " +
        "PlayersBes.cs case i==5 (~dòng 9906). Tiêu thụ: PlayersBes.cs ~dòng 10073-10078. heSo1 DB " +
        "thực = 0.005 (audit cũ ghi 0.5, lệch 100 lần).",
    },
    {
      index: 7,
      id: 556,
      ten: "Thủy hỏa nhất thể",
      loai: "goc",
      heSo1: 0.06,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Nhân thêm % sát thương (num *= 1+QuyenSu_ThuyHoaNhatThe) khi ra chiêu — XÁC NHẬN áp dụng " +
        "CẢ PK-chiêu lẫn PvE-chiêu (không áp dụng đòn tay).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case i==7 (~dòng 9912). Tiêu thụ: A8_Players_03MagicAttack.cs ~dòng 435 " +
        "(MagicAttack_Player, PK-chiêu) VÀ ~dòng 3180 (ComputingAttack, PvE-chiêu). KHÁC AUDIT CŨ: " +
        "audit 02/09 chỉ xác nhận được nhánh PvE và ghi 'chưa thấy ở PK, cần đối chiếu thêm' — nay " +
        "đã xác nhận CÓ ở PK-chiêu, giải quyết nghi vấn còn treo. heSo1 DB thực = 0.06 (audit cũ ghi " +
        "0.6, lệch 10 lần); heSo2 DB thực = 0.0 (audit cũ ghi 0.5, không dùng).",
    },
    {
      index: 8,
      id: 554,
      ten: "Kim cương bất phôi",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Khi bị trúng đòn > nửa HP hiện tại, có cơ hội (roll 1-110) giảm sát thương đòn đó theo %. " +
        "Hoạt động ở đòn tay PK, chiêu PK, và khi bị quái tấn công (PvE).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case i==8 (~dòng 9915): base.QuyenSu_KimCuongBatHoai = 10.0+num3*num2. " +
        "Tiêu thụ: NpcClass.cs ~1277 (PvE-nhận đòn), A8_Players_03MagicAttack.cs ~1346-1349 " +
        "(PK-chiêu), A8_Players_02PhysicalAttack.cs ~1798-1801 (PK-đòn tay). Khớp audit cũ.",
    },
    {
      index: 9,
      id: 555,
      ten: "Chuyển công vi thủ",
      loai: "goc",
      heSo1: 0.5,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Khi bị tấn công, có cơ hội phản đòn gây thêm sát thương = FLD_CongKich × " +
        "QuyenSu_ChuyenCongViThu × 0.005. Hoạt động ở đòn tay PK, chiêu PK, và khi bị quái tấn công (PvE).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case i==9 (~dòng 9918). Tiêu thụ: NpcClass.cs ~1272, " +
        "A8_Players_03MagicAttack.cs ~413 (PK-chiêu), A8_Players_02PhysicalAttack.cs ~1113-1116 " +
        "(PK-đòn tay). Khớp audit cũ.",
    },
    {
      index: 10,
      id: 557,
      ten: "Hội tâm nhất kích",
      loai: "goc",
      heSo1: 0.6,
      heSo2: 0.3,
      batBuocThangThien: null,
      moTa:
        "Chỉ khi RA CHIÊU (PK hoặc PvE, không áp đòn tay): roll cơ hội (trừ 'phản chế' đối phương " +
        "nếu PK) để nhân thêm sát thương ×(1+UyLuc) nếu đang trong chuỗi combo (临时武功 != 0), hoặc " +
        "×(1+UyLuc/2) nếu không combo. UyLuc = base.QuyenSu_HoiTamNhatKich_UyLuc được gán TRỰC TIẾP " +
        "bằng hệ số 2 của DB (không nhân theo điểm đầu tư), sau đó được Thăng Thiên 3 (id563) cộng " +
        "dồn thêm mỗi khi kích hoạt Nộ Khí Xung Thiên.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case i==10 (~dòng 9921-9922): QuyenSu_HoiTamNhatKich = 5+num2*num3 (xác " +
        "suất, có nhân điểm); QuyenSu_HoiTamNhatKich_UyLuc = 得到气功加成值(Player_Job,10,2) (uy " +
        "lực, KHÔNG nhân điểm — luôn cố định theo DB). Tiêu thụ: A8_Players_03MagicAttack.cs " +
        "~1027-1041 (PK) và ~3629-3644 (PvE). ĐÍNH CHÍNH AUDIT CŨ: audit 02/09 khẳng định 'Hệ số 2 " +
        "(2.0) không thấy được gọi ở đâu — dữ liệu DB dư' — SAI: hệ số 2 (DB thực = 0.3, audit cũ " +
        "ghi 2.0) được gọi trực tiếp làm UyLuc và dùng làm số nhân sát thương thật, không hề dư " +
        "thừa. heSo1 DB thực = 0.6 (audit cũ ghi 1.0).",
    },
    {
      index: 11,
      id: 560,
      ten: "Mạt nhật cuồng vũ",
      loai: "goc",
      heSo1: 0.005,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Khi kích hoạt Nộ Khí Xung Thiên, cộng thêm % tăng công kích VÀ phòng ngự cùng lúc = " +
        "0.25 + QuyenSu_MatNhatCuongVu.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case i==11 (~dòng 9925). Tiêu thụ: Players.cs ~61884-61889 (nhánh " +
        "Player_Job==10 trong hàm kích hoạt Nộ Khí Xung Thiên). Khớp audit cũ; heSo1 DB=0.005 khớp.",
    },
    {
      index: null,
      id: 561,
      ten: "Thăng thiên 2 đoạt mệnh liên hoàn",
      loai: "thang_thien",
      heSo1: 0.5,
      heSo2: null,
      batBuocThangThien: 7,
      moTa:
        "Chỉ khi ra chiêu VÀ đang trong chuỗi combo (cùng nhánh điều kiện 临时武功 != 0 với Hội Tâm " +
        "Nhất Kích): thêm 1 roll độc lập, nếu trúng thì nhân thêm ×1.45 sát thương (cộng dồn với cú " +
        "nhân của Hội Tâm Nhất Kích nếu cả 2 cùng trúng). Áp dụng cả PK-chiêu và PvE-chiêu.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case 561 trong khối Thăng Thiên (~dòng 10392): " +
        "base.Quyen_ThangThien_1_KhiCong_DoatMenhLienHoan = num11*num12 (LƯU Ý: tên field nội bộ có " +
        "'...ThangThien_1...' dù khí công này hiển thị là 'Thăng Thiên 2' batBuoc=7 — lệch số thứ " +
        "tự trong TÊN BIẾN, không phải lỗi chức năng). Tiêu thụ: A8_Players_03MagicAttack.cs " +
        "~1032-1036 (PK) và ~3634-3638 (PvE). heSo1 DB thực = 0.5 (audit cũ ghi 0.3).",
    },
    {
      index: null,
      id: 562,
      ten: "Thăng thiên 1 điện quang thạch hỏa",
      loai: "thang_thien",
      heSo1: 0.3,
      heSo2: null,
      batBuocThangThien: 6,
      moTa:
        "Khi đối thủ (Kiếm/Ninja/Đàm Hoa Liên) né CHIÊU của Quyền Sư thành công nhờ khí công " +
        "né/hồi-máu riêng của họ (KIEM_HoiLieu_ThanPhap, NINJA_TamHoaTuDinh, " +
        "DamHoaLien_HoiLieu_ThanPhap), Quyền Sư có cơ hội (trừ 'phản chế' đối phương) gây choáng " +
        "(trạng thái bất thường 4) lên đối thủ trong 3000ms. XÁC NHẬN chỉ áp dụng ở CHIÊU PK, KHÔNG " +
        "áp dụng ở đòn tay PK trong code hiện tại.",
      trangThai: "CON_LOI_CHUA_SUA",
      ghiChu:
        "Gán: PlayersBes.cs case 562 (~dòng 10395): base.Quyen_ThangThien_2_KhiCong_DienQuangThachHoa " +
        "= 10+num11*num12. Tiêu thụ (xác nhận có): A8_Players_03MagicAttack.cs ~1201-1209 (nhánh né " +
        "job2/Kiếm), ~1278-1286 (job6/Ninja), ~1313-1321 (job9/ĐHL) — cả 3 đều trong hàm " +
        "MagicAttack_Player (PK-chiêu). KHÔNG TÌM THẤY field " +
        "'Quyen_ThangThien_2_KhiCong_DienQuangThachHoa' ở đâu trong A8_Players_02PhysicalAttack.cs " +
        "(PK-đòn tay) — kể cả nhánh Ninja TamHoaTuDinh ở đòn tay (dòng ~1754), vốn có cấu trúc " +
        "tương tự bản chiêu, cũng không có khối kèm theo. MÂU THUẪN VỚI AUDIT CŨ: audit 02/09 ghi " +
        "trangThai=DA_SUA, khẳng định '03/09 đã bổ sung 3 khối tương tự vào đòn tay PK' — qua kiểm " +
        "lại code hiện tại (và cả bản A8_Players_02PhysicalAttack.cs.backup-before-autohop-port) " +
        "KHÔNG tìm thấy phần bổ sung này. Có thể đã bị mất khi tách Players.cs → " +
        "A8_Players_02PhysicalAttack.cs trong đợt refactor gần đây, hoặc claim cũ chưa từng chính " +
        "xác — cần Admin xác nhận lại và quyết định có bổ sung lại cho đòn tay hay không. heSo1 DB " +
        "thực = 0.3 (audit cũ ghi 0.5).",
    },
    {
      index: null,
      id: 563,
      ten: "Thăng thiên 3 tinh ích cầu tinh",
      loai: "thang_thien",
      heSo1: 0.005,
      heSo2: null,
      batBuocThangThien: 8,
      moTa:
        "Không có hiệu ứng độc lập riêng — MỖI LẦN kích hoạt Nộ Khí Xung Thiên (không phải liên tục " +
        "mỗi tick), cộng dồn (+=) giá trị khí công này TRỰC TIẾP vào base.QuyenSu_HoiTamNhatKich_UyLuc " +
        "(uy lực nhân sát thương của khí công gốc idx10 'Hội tâm nhất kích').",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case 563 (~dòng 10398): base.Quyen_ThangThien_3_KhiCong_TinhIchCauTinh " +
        "= num11*num12. Tiêu thụ: Players.cs ~61890 (base.QuyenSu_HoiTamNhatKich_UyLuc += " +
        "base.Quyen_ThangThien_3_KhiCong_TinhIchCauTinh, trong nhánh Player_Job==10 của hàm kích " +
        "hoạt Nộ Khí Xung Thiên). ĐÍNH CHÍNH AUDIT CŨ: audit 02/09 mô tả 'cộng dồn thêm vào 2 mốc " +
        "UyLuc (0.3 và 0.15)' — không chính xác: chỉ có 1 field UyLuc duy nhất, được cộng dồn ĐÚNG 1 " +
        "LẦN mỗi khi kích hoạt Nộ Khí Xung Thiên; việc 'ra 2 mốc khác nhau' là do CÁCH TIÊU THỤ ở " +
        "idx10 dùng UyLuc đầy đủ khi combo và UyLuc/2 khi không combo, không phải do khí công này ghi " +
        "vào 2 vị trí riêng biệt. heSo1 DB=0.005 khớp audit cũ.",
    },
    {
      index: null,
      id: 564,
      ten: "Thăng thiên 4 hồng nguyệt cuồng phong",
      loai: "thang_thien",
      heSo1: 0.5,
      heSo2: null,
      batBuocThangThien: 9,
      moTa: "Field dùng chung 'Thăng Thiên 4' của nhiều nghề — khi trúng đòn (mọi loại) có cơ hội gây debuff lên mục tiêu qua hàm dùng chung.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case 564 (~dòng 10401). Tiêu thụ: Players.cs nhiều điểm gọi (~40075, " +
        "40260, 40404, 40559...), cơ chế dùng chung nhiều nghề — chưa vẽ lại toàn bộ chi tiết (ngoài " +
        "phạm vi trọng tâm job10). heSo1 DB=0.5 khớp audit cũ.",
    },
    {
      index: null,
      id: 565,
      ten: "Thăng thiên 4 độc xà xuất động",
      loai: "thang_thien",
      heSo1: 0.5,
      heSo2: null,
      batBuocThangThien: 9,
      moTa: "Cùng nhóm 'Thăng Thiên 4' dùng chung như id564 — khi trúng đòn có cơ hội gây debuff khác qua cùng hàm dùng chung.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case 565 (~dòng 10404). Tiêu thụ: Players.cs ~40118 và các điểm liên " +
        "quan (dùng chung). heSo1 DB=0.5 khớp audit cũ.",
    },
    {
      index: null,
      id: 579,
      ten: "Khí công bí cấp (Thăng Thiên 6 thức - QS)",
      loai: "thang_thien",
      heSo1: 0.005,
      heSo2: null,
      batBuocThangThien: 11,
      moTa:
        "Field base.VoChuongVoNgai — KHÔNG CÒN 'chết hoàn toàn': có 1 điểm tiêu thụ thật, giảm sát " +
        "thương nhận từ đòn 'Yama bạo phát' đặc thù (liên quan ThanNu_ThiDocBaoPhat của Thần Nữ) " +
        "theo tỷ lệ % = VoChuongVoNgai. Đây là hiệu ứng RẤT HẸP (chỉ có tác dụng khi bị đúng cơ chế " +
        "'Yama nổ' liên quan Thần Nữ kích hoạt lên mình).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case 579 (~dòng 10470): base.VoChuongVoNgai = num11*num12. Tiêu thụ: " +
        "Players.cs ~66402, hàm 触发人物阎王爆()/'Kích hoạt nổ Yama của nhân vật': " +
        "num -= (int)(num*VoChuongVoNgai). ĐÍNH CHÍNH AUDIT CŨ: audit 02/09 ghi trangThai=" +
        "CHET_HOAN_TOAN, khẳng định 'grep toàn repo cho VoChuongVoNgai KHÔNG tìm thấy nơi đọc nào' " +
        "— SAI theo kiểm chứng lại: tồn tại đúng 1 nơi tiêu thụ thật (dù rất hẹp/niche, không phải " +
        "hoàn toàn vô dụng về gameplay). heSo1 DB thực = 0.005 (audit cũ ghi 0.1, lệch 20 lần).",
    },
    {
      index: null,
      id: 688,
      ten: "[Cách đấu gia] Khí công bí cấp thư (Bất tử chi khu, Thăng Thiên 6 thức)",
      loai: "thang_thien",
      heSo1: 0.7,
      heSo2: null,
      batBuocThangThien: 10,
      moTa:
        "'Bất tử chi khu' — khi bị trúng đòn, có cơ hội né HOÀN TOÀN sát thương đó (đưa về 0). XÁC " +
        "NHẬN áp dụng ở chiêu PK và khi bị quái tấn công (PvE); KHÔNG áp dụng ở đòn tay PK trong " +
        "code hiện tại.",
      trangThai: "CON_LOI_CHUA_SUA",
      ghiChu:
        "Gán: PlayersBes.cs case 688 (~dòng 10326): base.ThangThien_5_BatTu_ChiKhu = num11*num12. " +
        "Tiêu thụ (xác nhận có): A8_Players_03MagicAttack.cs ~1351-1356 (hàm MagicAttack_Player, " +
        "PK-chiêu, ngay sau khối Kim Cương Bất Hoại — đặt sát thương = 0), NpcClass.cs ~1286 (quái " +
        "tấn công người, PvE). KHÔNG TÌM THẤY field 'ThangThien_5_BatTu_ChiKhu' ở đâu trong " +
        "A8_Players_02PhysicalAttack.cs (PK-đòn tay) — nhánh Player_Job==10 ở đó (~dòng 1796-1803) " +
        "CHỈ có Kim Cương Bất Hoại, không có khối negate-toàn-phần theo sau. MÂU THUẪN VỚI AUDIT CŨ: " +
        "audit 02/09 ghi trangThai=DA_SUA, khẳng định '03/09 đã bổ sung khối negate-toàn-phần ngay " +
        "sau Kim Cương Bất Hoại' vào đòn tay PK — không tìm thấy trong code hiện tại (đã kiểm cả bản " +
        "backup-before-autohop-port, cũng không có). Có thể mất khi tách file hoặc claim cũ chưa " +
        "từng đúng — cần Admin xác nhận lại. heSo1 DB=0.7 khớp audit cũ.",
    },
  ],
};
