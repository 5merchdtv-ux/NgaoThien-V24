import type { NgheData } from "../khicong-data/types";

// Đối chiếu Ver24 THẬT — đọc lại code SRCGameServerV24B hiện tại (không dùng lại audit cũ 02/09
// mà không kiểm chứng), biên soạn 15/09/2026.
//
// GHI CHÚ QUAN TRỌNG VỀ VỊ TRÍ CODE: kể từ đợt refactor "autohop-port" trong session hôm nay,
// toàn bộ logic tính sát thương (PvE/PK, tay/chiêu) đã được TÁCH KHỎI Players.cs sang các file
// partial class mới:
//   - Players/A8_Players_01SystemAttack.cs   (kiểm tra khoảng cách tấn công, hiệu ứng gói tin)
//   - Players/A8_Players_02PhysicalAttack.cs (đòn TAY: PhysicalAttack_Npc = PvE, PhysicalAttack_Player = PK)
//   - Players/A8_Players_03MagicAttack.cs    (đòn CHIÊU: MagicAttack_Player = PK, MagicAttack_Npc/
//     ComputingAttack = PvE, MagicAttack_Buff = kỹ năng bổ trợ)
// Players.cs (71995 dòng) vẫn còn nhưng phần lớn số dòng cũ audit 02/09 trích dẫn (39xxx-45xxx)
// giờ trỏ vào nội dung KHÁC HẲN (hệ thống sư đồ, v.v.) — đã xác nhận bằng cách đọc lại trực tiếp.
// UpdateKhiCong() (PlayersBes.cs ~9423) gán khí công GỐC theo switch(Player_Job){case 4: switch(i)
// {case 0..11}} — "i" là SLOT (khớp field `index` bên dưới), không phải KhiCongID. Khí công THĂNG
// THIÊN (id>=316) được gán ở MỘT switch KHÁC theo đúng KhiCongID, nằm ngay TRƯỚC UpdateKhiCong,
// khoảng PlayersBes.cs ~10085-10500 (vòng foreach DanhSach_ThangThienKhiCong).
export const JOB_04_CUNG_V24: NgheData = {
  job: 4,
  tenNghe: "Cung",
  khiCong: [
    {
      index: 0,
      id: 40,
      ten: "Bách bộ xuyên dương",
      loai: "goc",
      heSo1: 0.02,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Gán: PlayersBes.cs UpdateKhiCong() case Player_Job=4 slot i=0 (dòng ~9603): FLD_ThemVaoTiLePhanTram_TrungDich = điểm×heSo1. Tiêu thụ: PlayersBes.cs property FLD_NhanVatCoBan_TrungDich (dòng ~2201) nhân hệ số này vào tổng độ chính xác — có hiệu lực mọi lúc, không roll.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Đã đọc lại code hiện tại, khớp mô tả audit cũ. Vị trí file đã đổi (không còn ở khoảng dòng cũ) nhưng hành vi không đổi.",
    },
    {
      index: 1,
      id: 41,
      ten: "Liệp ưng chi nhãn",
      loai: "goc",
      heSo1: 0.05,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Gán: PlayersBes.cs slot i=1 (dòng ~9606): base.CUNG_LiepUngChiNhan = điểm×heSo1. Tiêu thụ xác nhận được CHỈ 3/4 vị trí: PvE-tay (A8_Players_01SystemAttack.cs ~473, World.弓箭手打怪距离 + CUNG_LiepUngChiNhan), PK-tay (A8_Players_02PhysicalAttack.cs ~995, World.弓箭手PK距离 + ...), PK-chiêu (A8_Players_03MagicAttack.cs ~251, cùng công thức PK). ĐÃ TÌM KỸ nhưng KHÔNG thấy field này ở đâu trong toàn bộ MagicAttack_Npc/ComputingAttack (đường PvE-chiêu) — cung thủ đánh quái bằng chiêu KHÔNG được cộng thêm tầm bắn.",
      trangThai: "CON_LOI_CHUA_SUA",
      ghiChu:
        "Bất đối xứng thật, xác nhận bằng grep toàn file: 'CUNG_LiepUngChiNhan' chỉ xuất hiện 3 lần trong toàn bộ Players/A8_Players_0*.cs (473, 995, 251), không có lần thứ 4 ở PvE-chiêu. Khác hẳn ghi chú audit cũ 'áp dụng cả 4 đường'.",
    },
    {
      index: 2,
      id: 42,
      ten: "Ngưng thần tụ khí",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Gán: PlayersBes.cs slot i=2 (dòng ~9609-9616): num8 = FLD_CongKichThapNhat × điểm × heSo1 / 200 (sàn 1.0), FLD_NhanVat_KhiCong_CongKich = round(num8) — CHÍNH LÀ slot 'công kích thấp nhất' riêng của Cung (giống hệt công thức job1/job6 dùng cho field FLD_CongKichThapNhat, lý do id380 dùng-chung loại trừ Cung). Tiêu thụ: PlayersBes.cs property FLD_NhanVatCoBan_CongKich (dòng ~2179) cộng thẳng field này vào tổng công kích cơ bản — dùng cho mọi đòn đánh.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Công thức thực tế là % của FLD_CongKichThapNhat/200 chứ không phải 'điểm×1.0 cộng thẳng' đơn giản như audit cũ diễn đạt, nhưng hành vi cuối cùng (cộng vào công kích cơ bản, luôn có hiệu lực) đúng như audit cũ kết luận.",
    },
    {
      index: 3,
      id: 44,
      ten: "Cuồng phong vạn phá",
      loai: "goc",
      heSo1: 3000.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Gán: PlayersBes.cs slot i=3 (dòng ~9619): base.CuongPhong_VanPha = điểm×heSo1 (field dùng chung nhiều nghề, job1 slot3 cũng ghi vào field này). Tiêu thụ: Players.cs ~61867 — num2 = 10000 + (int)CuongPhong_VanPha, dùng làm thời lượng (ms) trạng thái 'Nộ Khí Xung Thiên' (700014) khi kích hoạt Nộ khí.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Khớp mô tả audit cũ. hệ số DB 3000/điểm vẫn rất lớn so với slot tương đương của nghề khác — vẫn là vấn đề cân bằng số liệu (Admin nên xem lại), không phải lỗi code.",
    },
    {
      index: 4,
      id: 45,
      ten: "Chính bản bồi nguyên",
      loai: "goc",
      heSo1: 8.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Gán: PlayersBes.cs slot i=4 (dòng ~9622): NhanVat_KhiCong_ThemVao_HP = (int)(điểm×heSo1). Field HP tổng hợp dùng chung nhiều nghề — cộng thẳng vào HP tối đa nhân vật.",
      trangThai: "BINH_THUONG",
      ghiChu: "Không có gì bất thường khi đọc lại; field và cách dùng khớp audit cũ.",
    },
    {
      index: 5,
      id: 48,
      ten: "Nhuệ lợi chi tiễn",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 0.01,
      batBuocThangThien: null,
      moTa:
        "Gán: PlayersBes.cs slot i=5 (dòng ~9625): base.CUNG_NhueLoiChiTien = điểm×heSo1 (KHÔNG có hằng số cộng thêm ở bước gán — khác với mô tả audit cũ 'CUNG_NhueLoiChiTien = 5.0 + điểm×1.0'). Tiêu thụ: cộng thẳng '+ CUNG_NhueLoiChiTien + 1.0' vào sát thương mỗi đòn, không roll — XÁC NHẬN GIỐNG HỆT NHAU ở cả 4 vị trí: PvE-tay (A8_Players_02PhysicalAttack.cs ~281), PK-tay (~1263), PvE-chiêu (A8_Players_03MagicAttack.cs ~3324), PK-chiêu (~674).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Về mặt CHỨC NĂNG: cả 4 vị trí hiện tại nhất quán 100% (đúng như audit cũ khẳng định 'đã sửa'). Về mặt SỐ LIỆU: hằng số cộng thêm ở tiêu thụ là +1.0, không phải +5.0 như audit cũ ghi — có thể audit cũ ghi nhầm hoặc số liệu đã đổi; heSo2=0.01 hiện không được dùng ở bất kỳ công thức nào tìm thấy (không roll nên không cần hệ số nhân khi proc).",
    },
    {
      index: 6,
      id: 184,
      ten: "Khí trầm đan điền",
      loai: "goc",
      heSo1: 0.5,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Gán: PlayersBes.cs slot i=6 (dòng ~9628): base.DonKhi_DanDien = điểm×heSo1 (dùng chung mọi nghề). Tiêu thụ: PlayersBes.cs ~10073-10078, num10 = FLD_PhongNgu × DonKhi_DanDien/100 → cộng vào cả NhanVat_KhiCong_ThemVao_HP và NhanVat_KhiCong_ThemVao_LucPhongNguVoCong — quy đổi % phòng ngự hiện có thành HP + phòng ngự võ công.",
      trangThai: "BINH_THUONG",
      ghiChu: "Khớp mô tả audit cũ.",
    },
    {
      index: 7,
      id: 46,
      ten: "Tâm thần ngưng tụ",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 2.0,
      batBuocThangThien: null,
      moTa:
        "Gán: PlayersBes.cs slot i=7 (dòng ~9631): base.CUNG_TamThanNgungTu = 10.0 + điểm×heSo1 (khớp audit cũ). Tiêu thụ 4 vị trí NHƯNG NGƯỠNG ROLL VÀ HIỆU ỨNG KHÁC NHAU rõ rệt giữa tay/chiêu: TAY (PvE ~227, PK ~1212) dùng RNG.Next(1,130), hiệu ứng nhân dame theo 得到气功加成值(4,7,2) (động, dựa heSo2); CHIÊU (PvE ~3348, PK ~698) dùng RNG.Next(1,110) — ngưỡng roll KHÁC hẳn tay — và hiệu ứng là hằng số CỨNG khác nhau giữa PvE (×1.65) và PK (×3.0, gần gấp đôi PvE cho cùng 1 khí công).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Phát hiện mới (audit cũ không đề cập): (1) mẫu số roll 130 (tay) vs 110 (chiêu) không đồng nhất; (2) hệ số nhân khi proc ở CHIÊU là hằng số viết cứng PvE=1.65 / PK=3.0, không dùng heSo2 DB — chênh lệch PK gần gấp đôi PvE có vẻ là chủ ý cân bằng (đánh nhóm PK rủi ro hơn PvE) nhưng đáng để Admin xác nhận có đúng chủ ý không. Không phát hiện lỗi crash/logic sai, chỉ là bất đối xứng số liệu.",
    },
    {
      index: 8,
      id: 47,
      ten: "Lưu tinh tam thỉ",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Gán: PlayersBes.cs slot i=8 (dòng ~9634-9635): base.CUNG_LuuTinhTamThi = 10.0 + điểm×heSo1 (KHÔNG phải '1.0 +' như audit cũ ghi); base.CUNG_LuuTinhTamThi_ThoiGian = điểm×heSo2. Tiêu thụ XÁC NHẬN CHỈ CÒN 2/4 VỊ TRÍ: PvE-tay (A8_Players_02PhysicalAttack.cs ~232, RNG.Next(1,130), else-if với TamThanNgungTu, gắn trạng thái buff 700047 thời lượng = CUNG_LuuTinhTamThi_ThoiGian) và PK-tay (~1218, RNG.Next(1,110) — ngưỡng khác PvE-tay, cùng cơ chế buff). ĐÃ GREP TOÀN BỘ A8_Players_03MagicAttack.cs (cả PvE-chiêu lẫn PK-chiêu): KHÔNG có bất kỳ tham chiếu 'CUNG_LuuTinhTamThi' nào.",
      trangThai: "CON_LOI_CHUA_SUA",
      ghiChu:
        "Trái ngược hoàn toàn với ghiChu audit cũ (claim '4 vị trí ... PvE-chiêu 41366, PK-chiêu 44982' và 'combo lồng với id340 ở PvE-tay đã sửa Math.Min'). Thực tế hiện tại: (1) khí công này KHÔNG có bất kỳ tác dụng nào khi đánh bằng chiêu (cả PvE và PK) — chỉ hoạt động ở đòn tay; (2) KHÔNG tìm thấy tham chiếu id340 (CUNG_ThangThien_1_KhiCong_TuyetAnhXaHon) ở gần khối code này tại bất kỳ vị trí nào — không có 'combo dùng chung ngưỡng roll' như audit cũ mô tả. Nếu heSo2 DB thực sự = 0.0 như dữ liệu hiện có, CUNG_LuuTinhTamThi_ThoiGian luôn = 0 → buff 700047 gắn với thời lượng 0ms, gần như vô nghĩa (chưa xác minh được qua DB — không tìm thấy tên bảng SQL chứa cấu hình khí công thăng thiên để spot-check).",
    },
    {
      index: 9,
      id: 43,
      ten: "Hồi lưu chân khí",
      loai: "goc",
      heSo1: 30000.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Gán: PlayersBes.cs slot i=9 (dòng ~9638): base.CUNG_HoiLuuChanKhi = điểm×heSo1 (30s/điểm). Tiêu thụ: MagicAttack_Buff (A8_Players_03MagicAttack.cs, nhiều vị trí ~1701-1740 trở lên) cộng thẳng field này (ms) vào thời lượng nhiều trạng thái buff chủ động của Cung khi kích hoạt/gia hạn.",
      trangThai: "BINH_THUONG",
      ghiChu: "Khớp mô tả audit cũ, chỉ khác vị trí file (đã chuyển sang A8_Players_03MagicAttack.cs).",
    },
    {
      index: 10,
      id: 49,
      ten: "Vô minh ám thỉ",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Gán: PlayersBes.cs slot i=10 (dòng ~9641): base.CUNG_VoMinhAmThi = điểm×heSo1. Tiêu thụ 4 vị trí, proc nhân dame ×(1.05+X×0.01): PvE-tay (A8_Players_02...cs ~282, RNG130), PK-tay (~1264, RNG130, TRỪ counter đối phương 'value.PhanCong_CUNG_VoMinhAmThi'), PvE-chiêu (A8_Players_03...cs ~3325, RNG100, if độc lập), PK-chiêu (~675, RNG100, if độc lập — KHÔNG trừ counter dù biến num12=value2.PhanCong_CUNG_VoMinhAmThi đã được khai báo sẵn ở đầu hàm MagicAttack_Player nhưng không dùng tại đây).",
      trangThai: "CON_LOI_CHUA_SUA",
      ghiChu:
        "Khác hẳn audit cũ: (1) CẢ PvE-chiêu lẫn PK-chiêu hiện đều dùng if ĐỘC LẬP (không phải else-if loại trừ) cho VoMinhAmThi/ThienNgoaiTamThi(342)/TuyetAnhXaHon(340)/ThienLyNhatKich(682) — nghĩa là các khí công này CÓ THỂ cộng dồn nhân chồng trên cùng 1 đòn ở cả PvE lẫn PK như nhau (đối xứng, không phải bug riêng PK như audit cũ mô tả 'PK-chiêu độc lập, PvE-chiêu else-if'); (2) phát hiện MỚI: PK-chiêu thiếu bước trừ counter đối phương (num12) mà PK-tay CÓ áp dụng cho cùng khí công — bất nhất giữa 2 đường PK, khả năng là thiếu sót thật.",
    },
    {
      index: 11,
      id: 140,
      ten: "Trí mệnh tuyệt sát",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 0.015,
      batBuocThangThien: null,
      moTa:
        "Gán: PlayersBes.cs slot i=11 (dòng ~9644): base.CUNG_TriMenhTuyetSat = 10.0 + điểm×heSo1 (KHÔNG phải '1.0 +' như audit cũ ghi). Tiêu thụ: XÁC NHẬN CÓ MẶT ở cả 4 vị trí — PvE-tay (~275, RNG130), PK-tay (~1257, RNG130, CÓ trừ counter đối phương '-num12'), PvE-chiêu (~3353, RNG120, trong khối 武功.FLD_TYPE==4), PK-chiêu (~703, RNG120, trong khối value.FLD_TYPE==4, KHÔNG trừ counter dù num13=value2.PhanCong_CUNG_TriMenhTuyetSat đã khai báo sẵn ở đầu hàm).",
      trangThai: "CON_LOI_CHUA_SUA",
      ghiChu:
        "Xác nhận claim CHÍNH của audit cũ vẫn đúng: PK-tay KHÔNG còn 'hoàn toàn vắng mặt' như mô tả trước sửa — hiện diện đầy đủ và có trừ counter đúng. Tuy nhiên phát hiện MỚI (audit cũ không nói tới): PK-chiêu cũng thiếu bước trừ counter đối phương giống hệt trường hợp id49 — cùng một kiểu 'biến khai báo sẵn nhưng không dùng' mà audit cũ từng chỉ ra ở PK-tay, nay lặp lại ở PK-chiêu. Ngoài ra có 1 tương tác phụ ngoài phạm vi roll thường: MagicAttack_Buff case 401303 (Players.cs ~1743-1745, kỹ năng hỗ trợ) cộng thêm +10 vào CUNG_TriMenhTuyetSat của mục tiêu job4 nếu > 0 — hiệu ứng phụ của 1 skill khác, không phải lỗi.",
    },
    {
      index: null,
      id: 340,
      ten: "Thăng thiên 1 — Tuyệt ảnh xạ hồn",
      loai: "thang_thien",
      heSo1: 1.5,
      heSo2: null,
      batBuocThangThien: 6,
      moTa:
        "Gán: PlayersBes.cs case 340 (dòng ~10256, trong vòng foreach khí công thăng thiên): base.CUNG_ThangThien_1_KhiCong_TuyetAnhXaHon = điểm×heSo1 (điểm đã bị chặn trần bởi World.限制气功点数, mặc định 60, phần vượt trần chỉ tính 30%). Tiêu thụ CHỈ Ở CHIÊU (không có ở tay, đã grep toàn bộ A8_Players_02PhysicalAttack.cs không thấy): PvE-chiêu (A8_Players_03MagicAttack.cs ~3339) và PK-chiêu (~710), cùng công thức RNG.Next(1,100) <= giá trị, gate bởi FLD_VoCongLoaiHinh==3, proc thì set cờ KichHoat_TuyetAnh_XaHon=true. Cờ này được A8_Players_01SystemAttack.cs ~616 dùng để ép số mục tiêu đòn nhóm NPC = 5 (num4=5).",
      trangThai: "CON_LOI_CHUA_SUA",
      ghiChu:
        "2 điểm khác biệt xác nhận được so với audit cũ: (1) KHÔNG tìm thấy combo dùng-chung-ngưỡng-roll với id47 (Lưu Tinh Tam Thỉ) ở PvE-tay — khí công 340 hoàn toàn không xuất hiện trong đường tay; (2) KHÔNG có Math.Min(...,99.0) chặn trần ở cả 2 vị trí roll hiện tại (3339 và 710) — nếu audit cũ từng thêm chặn này, hiện tại code KHÔNG còn nó. Rủi ro proc-luôn-100% về lý thuyết vẫn tồn tại khi điểm hiệu dụng × 1.5 vượt 99 (khó nhưng không phải không thể với đồ hỗ trợ khí công lớn), do đó đánh dấu còn lỗi chưa sửa dứt điểm.",
    },
    {
      index: null,
      id: 341,
      ten: "Thăng thiên 2 — Thiên quân áp đà",
      loai: "thang_thien",
      heSo1: 5.0,
      heSo2: null,
      batBuocThangThien: 7,
      moTa:
        "Gán: PlayersBes.cs case 341 (dòng ~10259-10260): FLD_NhanVat_KhiCong_TrongLuong += (int)(TheTotalWeightOfTheCharacter × điểm × 0.003); FLD_NhanVat_KhiCong_PhongNgu += (int)(điểm×heSo2 tương ứng, biến num12). Cả 2 field passive, luôn có hiệu lực, không proc — nới trọng lượng mang vác và cộng thẳng phòng ngự cơ bản.",
      trangThai: "BINH_THUONG",
      ghiChu: "Khớp 100% mô tả audit cũ, kể cả chi tiết hằng số 0.003 viết cứng (xác nhận là chủ ý).",
    },
    {
      index: null,
      id: 342,
      ten: "Thăng thiên 3 — Thiên ngoại tam thỉ",
      loai: "thang_thien",
      heSo1: 0.5,
      heSo2: null,
      batBuocThangThien: 8,
      moTa:
        "Gán: PlayersBes.cs case 342 (dòng ~10262-10263): base.CUNG_ThangThien_3_KhiCong_ThienNgoaiTamThi = điểm×heSo1. Tiêu thụ CHỈ Ở CHIÊU: PvE-chiêu (A8_Players_03MagicAttack.cs ~3331, if ĐỘC LẬP, KHÔNG bị gate bởi 武功.FLD_TYPE==4) và PK-chiêu (~690, if độc lập nhưng NẰM LỒNG BÊN TRONG khối value.FLD_TYPE==4 cùng với TamThanNgungTu/TriMenhTuyetSat) — cả 2 đều roll RNG.Next(1,100), khi trúng và (FLD_VoCongLoaiHinh==3 & KyNangKetHon_CapDo>=5) thì nhân thêm ×1.25 ('combo').",
      trangThai: "CON_LOI_CHUA_SUA",
      ghiChu:
        "Phát hiện mới: điều kiện gate KHÔNG đối xứng giữa PvE-chiêu (342 đứng độc lập, không cần FLD_TYPE==4) và PK-chiêu (342 bị nhốt trong khối FLD_TYPE==4) — nghĩa là ở PK, nếu value.FLD_TYPE!=4 thì khí công này hoàn toàn không được roll, còn ở PvE luôn được roll. Không khớp claim audit cũ 'đã dựng lại PK-chiêu khớp PvE-chiêu' — hiện 2 đường vẫn khác cấu trúc.",
    },
    {
      index: null,
      id: 343,
      ten: "Thăng thiên 4 — Mãn nguyệt cuồng phong",
      loai: "thang_thien",
      heSo1: 0.5,
      heSo2: null,
      batBuocThangThien: 9,
      moTa:
        "Gán: PlayersBes.cs case 343 (dòng ~10265-10266): base.ThangThien_4_ManNguyetCuongPhong = điểm×heSo1 (field dùng chung nhiều nghề, case 327/353/613 cùng ghi vào đây). Tiêu thụ: Players.cs hàm 组队升天四气功触发(Players Playe) dòng ~40139-40162 — CHỈ kích hoạt khi người chơi ĐANG TRONG TỔ ĐỘI (TeamID!=0): toàn bộ đồng đội trong phạm vi, chưa NoKhi, chưa có trạng thái 'Mãn Nguyệt Cuồng Phong', được cộng +25% ThemVaoTiLePhanTram_ManYue_CongKich VÀ +25% ...PhongNgu trong 5 giây.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "SỬA MÔ TẢ so với audit cũ: đây là buff CỘNG CÔNG KÍCH + PHÒNG NGỰ (+25%/+25%, 5s) cho đồng đội, KHÔNG PHẢI 'hồi máu' như audit cũ (job-specific job04-cung.ts) mô tả — đã đọc trực tiếp code, không thấy bất kỳ dòng cộng HP nào trong nhánh case này. Cơ chế hoạt động đúng, chỉ là audit cũ ghi sai loại hiệu ứng.",
    },
    {
      index: null,
      id: 344,
      ten: "Thăng thiên 4 — Liệt nhật viêm viêm",
      loai: "thang_thien",
      heSo1: 0.5,
      heSo2: null,
      batBuocThangThien: 9,
      moTa:
        "Gán: PlayersBes.cs case 344 (dòng ~10268-10269): base.ThangThien_4_LietNhatViemViem = điểm×heSo1 (field dùng chung, case 326/374 cùng ghi vào đây). Tiêu thụ: cùng hàm 组队升天四气功触发(Playe) với id343, dòng ~40053-40073 — nếu Playe chưa có trạng thái 'Liệt Nhật Viêm Viêm' thì gắn trạng thái 1008001169 (5 giây) LÊN CHÍNH Playe. Hàm này được gọi 组队升天四气功触发(this) ở CẢ HAI vị trí: PhysicalAttack_Npc (A8_Players_02...cs ~107, PvE-tay) và ComputingAttack (A8_Players_03...cs ~3227, PvE-chiêu) — tham số truyền vào luôn là 'this' (chính người chơi vừa tấn công), KHÔNG PHẢI null, KHÔNG PHẢI đối thủ.",
      trangThai: "CON_LOI_CHUA_SUA",
      ghiChu:
        "Đảo ngược hoàn toàn 2 claim của audit cũ: (1) audit cũ nói 'gọi Playe=null ở PvE-tay nên PvE no-op' — SAI, code hiện tại truyền this (không null) ở CẢ PvE-tay lẫn PvE-chiêu, hàm chạy thật ở PvE; (2) audit cũ nói 'có tác dụng thật khi PK-tay' — SAI, đã grep toàn bộ project chỉ tìm thấy 2 lời gọi hàm 组队升天四气功触发(...), cả 2 đều trong đường PvE, KHÔNG có lời gọi nào trong PhysicalAttack_Player hay MagicAttack_Player (PK) — khí công này hiện KHÔNG BAO GIỜ kích hoạt trong PK. Ngoài ra trạng thái 1008001169 được gắn lên CHÍNH người tấn công (Playe=this) chứ không phải 'đối phương' như audit cũ mô tả — cần xác minh thêm ý nghĩa thật của trạng thái 1008001169 (không tìm đủ bằng chứng đây là buff hay debuff trong phạm vi đã đọc).",
    },
    {
      index: null,
      id: 573,
      ten: "Khí công bí cấp (Thăng Thiên 6 thức - Cung, Ác Tàn Thi Cung)",
      loai: "thang_thien",
      heSo1: 0.007,
      heSo2: null,
      batBuocThangThien: 11,
      moTa:
        "Gán: PlayersBes.cs case 573 (dòng ~10450-10451): base.CUNG_AcTanThiCung = điểm×heSo1. Tiêu thụ CHỈ 2 vị trí (không phải 5 như audit cũ ghi), CẢ 2 ĐỀU Ở PK VÀ ĐỀU LÀ PHÒNG THỦ CHO CHÍNH NGƯỜI SỞ HỮU: PK-tay (A8_Players_02PhysicalAttack.cs ~1717-1722, 'else if (value.Player_Job==4)' — value là ĐỐI THỦ đang bị tấn công; nếu khoảng cách num4>100 thì dame nhận vào ×(1 - value.CUNG_AcTanThiCung)) và PK-chiêu (A8_Players_03MagicAttack.cs ~1215-1220, y hệt với value2). Không có bất kỳ tiêu thụ nào ở PvE.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "SỬA HẲN mô tả và kết luận của audit cũ: audit cũ mô tả đây là 'buff dame tấn công của chính Cung' và claim đã sửa lỗi đọc nhầm 'value3.AcTanThiCung' (mục tiêu) → 'base.AcTanThiCung' (bản thân) để nó thành buff tấn công. Đọc lại code THẬT hiện tại cho thấy ngược lại: cả 2 vị trí tiêu thụ đều dùng field của value/value2 — tức của NGƯỜI ĐANG BỊ TẤN CÔNG (nếu người đó là Cung), giảm sát thương HỌ phải nhận khi bị đánh xa >100 khoảng cách trong PK. Đây là cơ chế PHÒNG THỦ nhất quán, tự đọc đúng field của chủ sở hữu — không thấy lỗi đọc nhầm biến như audit cũ mô tả (có thể audit cũ đọc nhầm chiều 'value'/'base' trong ngữ cảnh hàm PK, hoặc đang mô tả 1 phiên bản code khác).",
    },
    {
      index: null,
      id: 682,
      ten: "[Cung] Khí công bí cấp thư (Thăng Thiên 5 thức - Thiên lý nhất kích)",
      loai: "thang_thien",
      heSo1: 1.0,
      heSo2: null,
      batBuocThangThien: 10,
      moTa:
        "Gán: PlayersBes.cs case 682 (dòng ~10307-10308): base.ThangThien_5_ThienLyNhatKich = điểm×heSo1, standalone. Tiêu thụ đầy đủ và NHẤT QUÁN ở cả 4 vị trí, cùng công thức RNG.Next(1,100) <= giá trị → nhân dame ×(1+giá trị×0.01), if độc lập: PvE-tay (A8_Players_02...cs ~288), PK-tay (~1270), PvE-chiêu (A8_Players_03...cs ~3360), PK-chiêu (~715).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Hoạt động đúng và đối xứng ở cả 4 vị trí. Claim audit cũ 'PK-chiêu đã dựng lại else-if khớp PvE-chiêu' không hoàn toàn chính xác về mặt kỹ thuật (PvE-chiêu VỐN DĨ cũng là if độc lập, không phải else-if) nhưng không ảnh hưởng tới kết quả — khí công vẫn hoạt động đúng như kỳ vọng, không phát hiện lỗi.",
    },
  ],
};
