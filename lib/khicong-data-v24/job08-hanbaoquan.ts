import type { NgheData } from "../khicong-data/types";

// Đối chiếu Ver24 THẬT — đọc lại code SRCGameServerV24B hiện tại (không dùng lại audit cũ 02/09
// mà không kiểm chứng), biên soạn 15/09. Lưu ý: PlayersBes.cs vẫn còn nguyên (UpdateKhiCong() ở
// dòng 9423), nhưng Players.cs đã bị tách thành nhiều file partial trong phiên làm việc gần đây:
// A8_Players_01SystemAttack.cs, A8_Players_02PhysicalAttack.cs (đòn tay), A8_Players_03MagicAttack.cs
// (chiêu — gồm MagicAttack_Player = PK, ComputingAttack/MagicAttack_Npc = PvE), A8_Players_04Attack
// Confirmation.cs. Số dòng cũ trong audit 02/09 (định dạng "Players.cs ~xxxxx") đều đã lệch — mọi
// trích dẫn dưới đây lấy lại từ vị trí thật trong các file đã tách. Đã đối chiếu chéo với DB sống
// (sqlcmd TH\SQLEXPRESS, database 24pub, bảng TBL_XWWL_SKILL cho khí công gốc và bảng 升天气功 cho
// khí công Thăng Thiên) — nhiều giá trị heSo1/heSo2 trong audit cũ KHÔNG khớp DB hiện tại, đã cập
// nhật lại theo số đọc trực tiếp từ DB hôm nay.
export const JOB_08_HAN_BAO_QUAN_V24: NgheData = {
  job: 8,
  tenNghe: "Hàn Bảo Quân",
  khiCong: [
    {
      index: 0,
      id: 250,
      ten: "Lực phách hoa sơn",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Cộng thẳng vào lực công kích cơ bản: FLD_NhanVat_KhiCong_CongKich = max(1, FLD_CongKichThapNhat*điểm_hiệu_dụng*heSo1/100/2). " +
        "Công thức chỉ dùng heSo1 (rate1), không đọc heSo2. Dùng chung mọi nghề, có hiệu lực cả PK lẫn PvE.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "PlayersBes.cs UpdateKhiCong() switch(Player_Job) case 8 → switch(i) case 0, dòng hiện tại 9792-9801 (số dòng cũ '8181-8190' trong audit 02/09 đã lệch). " +
        "DB TBL_XWWL_SKILL job8 idx0 (FLD_ID=810, FLD_PID=250): rate1=1.0 (khớp audit cũ), rate2=0.0 — audit cũ ghi heSo2=0.01 nhưng DB thật là 0.0; không ảnh hưởng vì công thức không dùng rate2.",
    },
    {
      index: 1,
      id: 251,
      ten: "Lhiếp hồn nhất kích",
      loai: "goc",
      heSo1: 0.01,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Cộng vào chính xác (trúng địch) cơ bản: FLD_NhanVat_KhiCong_TrungDich = (int)(FLD_TrungDich * (0.1 + điểm_hiệu_dụng*heSo1)). Dùng chung công thức mọi nghề.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "PlayersBes.cs case 1 job8, dòng hiện tại 9802-9804. DB idx1 (FLD_PID=251): rate1=0.01, rate2=0.0 — khớp đúng audit cũ.",
    },
    {
      index: 2,
      id: 252,
      ten: "Thiên ma cuồng huyết",
      loai: "goc",
      heSo1: 0.5,
      heSo2: 0.15,
      batBuocThangThien: null,
      moTa:
        "MỘT lượt đầu điểm nhưng sinh ra HAI xác suất proc độc lập, đọc trong 2 field khác tên hoàn toàn (không phải 'field X2' như audit cũ gọi): " +
        "base.HanBaoQuan_ThienMaCuongHuyet_XacSuat = 10.0 + điểm*heSo1 ('Cuồng Huyết'), và base.HanBaoQuan_ThienMaCucHuyet_XacSuat = điểm*heSo2 ('Cực Huyết', field riêng, tên khác 'Cuồng Huyết'). " +
        "Chỉ phát huy ở CHIÊU (PK+PvE). Cuồng Huyết proc (roll ưu tiên thấp hơn, sau id600): dame×1.4, LƯU lại bonus dame cho đòn KẾ TIẾP = dame_hiện_tại*(0.4*hesoIndex29-31 + HanBaoQuan_ThangThien_5_ThienMaChiLuc(686)), bật cờ KichHoat_ThienMaCucHuyet. " +
        "Cực Huyết proc (roll ưu tiên cao hơn, chạy trước): dame×1.8, đồng thời gán biến tạm = HanBaoQuan_ThangThien_3_KhiCong_ThienMaHoThe(601) để cộng thêm vào ngưỡng roll của id600 (PK+PvE) và idx11 Ám Ảnh Tuyệt Sát (CHỈ PvE) ở dưới; nếu cờ KichHoat_ThienMaCucHuyet đang bật (do Cuồng Huyết proc ở đòn trước) thì cộng luôn dame lưu trữ vào rồi tắt cờ. Ở PK, ngưỡng roll Cực Huyết còn bị trừ thêm '- value2.PhanCong_HanBaoQuan_KhiCong_ThienMaCuongHuyet' (khí công phản chế của đối phương, ngoài phạm vi job8).",
      trangThai: "DA_SUA",
      ghiChu:
        "Xác nhận qua DB TBL_XWWL_SKILL job8 idx2 (FLD_ID=813, FLD_PID=252): rate1=0.5, rate2=0.14999999999999999(~0.15) — KHÁC audit cũ (audit cũ ghi heSo1=0.01, heSo2=0.0, và tuyên bố đã UPDATE rate2=0.01). Rate2 hiện tại KHÔNG PHẢI 0.0 (nên không còn bug 'luôn = 0') nhưng cũng KHÔNG PHẢI 0.01 như audit cũ khẳng định đã sửa — giá trị thật đang là 0.15. Kết luận tổng thể của audit cũ (rate2 khác 0, field 'kích hoạt kép' sống) vẫn đúng, chỉ sai con số cụ thể. " +
        "Field 2 đúng tên: HanBaoQuan_ThienMaCuongHuyet_XacSuat (rate1) và HanBaoQuan_ThienMaCucHuyet_XacSuat (rate2) — khai báo X5_KhiCongLoai/X_Khi_Cong_Thuoc_Tinh.cs dòng 689,701; gán ở PlayersBes.cs dòng 9806-9807. " +
        "Tiêu thụ: PK-chiêu tại Players/A8_Players_03MagicAttack.cs (MagicAttack_Player) dòng 935-982; PvE-chiêu tại cùng file (ComputingAttack) dòng 3563-3602. Trường 'PhanCong_HanBaoQuan_KhiCong_ThienMaCuongHuyet' (num20, chỉ PK) không thuộc khí công job8.",
    },
    {
      index: 3,
      id: 253,
      ten: "Bách biến thần hành",
      loai: "goc",
      heSo1: 0.01,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Cộng vào % né tránh cơ bản: FLD_NhanVat_ThemVaoTiLePhanTram_NeTranh = 0.1 + điểm_hiệu_dụng*heSo1. Dùng chung công thức mọi nghề.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "PlayersBes.cs case 3 job8, dòng hiện tại 9809-9811. DB idx3 (FLD_PID=253): rate1=0.01, rate2=0.0 — KHÁC audit cũ (audit cũ ghi heSo1=1.0, heSo2=0.001); đã cập nhật theo DB thật. heSo2 không dùng trong công thức.",
    },
    {
      index: 4,
      id: 254,
      ten: "Cuồng phong vạn phá",
      loai: "goc",
      heSo1: 3000.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Kéo dài thời lượng trạng thái Nộ Khí Xung Thiên (state 700014): thời lượng = 10000ms + base.CuongPhong_VanPha. Field dùng chung nhiều nghề (mỗi nghề tự map field này vào 1 index riêng trong UpdateKhiCong).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "PlayersBes.cs case 4 job8, dòng hiện tại 9812-9814. Tiêu thụ: Players/Players.cs dòng 61865-61867 (số dòng cũ '69569-69573' đã lệch do tách file). DB idx4 (FLD_PID=254): rate1=3000.0 khớp audit cũ; rate2=0.0 (audit cũ ghi 0.05) nhưng không dùng trong công thức case4.",
    },
    {
      index: 5,
      id: 188,
      ten: "Khí trầm đan điền",
      loai: "goc",
      heSo1: 0.005,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Buff HP + phòng ngự chung: base.DonKhi_DanDien = điểm_hiệu_dụng*heSo1. Sau khi chạy hết toàn bộ switch(Player_Job), nếu DonKhi_DanDien>0 thì num10 = FLD_PhongNgu*DonKhi_DanDien/100, cộng thêm vào cả NhanVat_KhiCong_ThemVao_HP và NhanVat_KhiCong_ThemVao_LucPhongNguVoCong. Field DonKhi_DanDien dùng chung nhiều nghề (job1 idx6, job2 idx6, job5 idx6, job8 idx5, job9 idx5, job10 idx5, job11 idx5, job12 idx5... mỗi nghề map field này vào 1 index riêng).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "SỬA LẠI SO VỚI AUDIT CŨ (id/ten của index5 và index6 bị đảo ngược trong audit 02/09) — xem giải trình đầy đủ ở ghiChu của index6. " +
        "Kiểm chứng DB job8 idx5 hôm nay: FLD_ID=873, FLD_PID=188, tên hex 0xc6f8b3c1b5a4ccef = 气沉丹田 = 'Khí trầm đan điền' — KHÔNG PHẢI 255/'Truy cốt hấp nguyên' như audit cũ ghi. rate1=5.0000000000000001E-3 (~0.005) — cũng khác audit cũ (ghi 0.5, tức lớn hơn 100 lần). " +
        "Gán: PlayersBes.cs case 5 job8, dòng hiện tại 9815-9817 (base.DonKhi_DanDien = num2*num3). Tiêu thụ (dùng chung mọi nghề): PlayersBes.cs dòng 10073-10078, chạy NGAY SAU switch(Player_Job) trong cùng hàm UpdateKhiCong().",
    },
    {
      index: 6,
      id: 255,
      ten: "Truy cốt hấp nguyên",
      loai: "goc",
      heSo1: 0.5,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Giảm % sát thương nhận vào: base.HanBaoQuan_TruyCotHapNguyen = điểm_hiệu_dụng*heSo1. Khi bị tấn công (cả bị NPC lẫn bị người chơi đánh), roll RNG <= field thì trừ bớt (sát_thương*field*0.01) khỏi sát thương sắp nhận.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "SỬA LẠI SO VỚI AUDIT CŨ: audit 02/09 ghi index5=id255('Truy cốt hấp nguyên') và index6=id188('Khí trầm đan điền'), đồng thời khẳng định đã 'hoán đổi lại' code case5/case6 cho khớp. Kiểm tra DB SỐNG hôm nay (sqlcmd TH\\SQLEXPRESS, bảng TBL_XWWL_SKILL) cho kết quả NGƯỢC LẠI hoàn toàn: FLD_INDEX=5 → FLD_PID=188 ('气沉丹田'/Khí trầm đan điền), FLD_INDEX=6 → FLD_PID=255 ('追骨吸元'/Truy cốt hấp nguyên, hex 0xd7b7b9c7cefcd4aa). " +
        "Đối chiếu với CODE hiện tại: case i=5 → base.DonKhi_DanDien (= 'Khí trầm đan điền' theo comment gốc 气沉丹田); case i=6 → base.HanBaoQuan_TruyCotHapNguyen (= 'Truy cốt hấp nguyên' theo comment gốc 追骨吸元). CODE và DB HIỆN TẠI KHỚP NHAU HOÀN TOÀN theo chiều index5=188/'Khí trầm đan điền', index6=255/'Truy cốt hấp nguyên' — tức là KHÔNG còn hoán đổi/bug ở trạng thái hiện tại, nhưng theo chiều NGƯỢC với audit cũ đã mô tả. " +
        "Không rõ DB đã bị đổi lại sau audit 02/09, hay audit 02/09 đọc nhầm DB từ đầu — nhưng dữ liệu sống hôm nay là nguồn xác thực cho tài liệu này. rate1 DB idx6 = 0.5 (khớp giá trị 0.5 mà audit cũ gán cho id255). " +
        "Gán: PlayersBes.cs case 6 job8, dòng hiện tại 9818-9820. Tiêu thụ: X3_NpcClass/NpcClass.cs dòng 1531-1533 (quái đánh người chơi) và Players/A8_Players_04AttackConfirmation.cs dòng 365-367 (người chơi đánh người chơi).",
    },
    {
      index: 7,
      id: 256,
      ten: "Bá khí phá giáp",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 0.7,
      batBuocThangThien: null,
      moTa:
        "Đòn/chiêu (cả PK lẫn PvE): roll RNG(1,110) <= base.PhaGiap_TiLe (5.0 + điểm*heSo1, dùng CHUNG field với Đao job1 idx5 — mỗi job tự roll bằng nhánh switch(Player_Job) riêng) thì nhân HỆ SỐ RATE2 (được tra riêng theo job/index qua 得到气功加成值(8,7,2), không đọc thẳng field PhaGiap_TiLe) vào một biến PHÒNG NGỰ HIỆU DỤNG CỤC BỘ của đòn đó (không ghi đè vĩnh viễn field phòng ngự của đối phương): PvE dùng value.FLD_DF*(hằng số toàn cục - value.FLD_JSDF) hoặc value.FLD_NhanVatCoBan_PhongNgu tuỳ ngữ cảnh, PK dùng value.FLD_NhanVatCoBan_PhongNgu. Vì heSo2≈0.7 (<1) nên hiệu ứng là GIẢM phòng ngự hiệu dụng ~30% cho đúng 1 đòn đang tính — đúng ý đồ 'phá giáp'.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "KHÔNG TÌM THẤY bằng chứng của bug 'tăng giáp đối phương 20%' mà audit cũ mô tả, ở BẤT KỲ 1 trong 4 vị trí hiện tại (PvE-tay A8_Players_02PhysicalAttack.cs dòng 109-116/136-140; PK-tay cùng file dòng 1057-1072; PvE-chiêu A8_Players_03MagicAttack.cs dòng 3135-3166; PK-chiêu cùng file dòng 392-404) — cả 4 chỗ đều nhân hệ số rate2 vào một BIẾN TẠM cục bộ đại diện phòng ngự hiệu dụng của đòn hiện tại, không phải ghi đè field phòng ngự thật của đối phương. DB idx7 (FLD_PID=256): rate1=1.0 (khớp), rate2=0.69999999999999996(~0.7) — khác audit cũ (heSo2=1.2, tương ứng công thức ×0.8 đã 'sửa'); giá trị rate2 thật hiện nay là 0.7 (giảm giáp ~30%, không phải 20%). " +
        "PK-tay/PK-chiêu có thêm ngưỡng trừ theo counter-stat của đối phương (num8/num20/num21 = value.PhanCong_HanBaoQuan_KhiCong_BaKhi_PhaGiap), không thuộc phạm vi khí công job8. Kết luận: đối với NGUỒN HIỆN TẠI, đây là công thức hoạt động đúng ý đồ, không phải trạng thái 'đã sửa từ 1 bug tăng giáp' như audit cũ mô tả.",
    },
    {
      index: 8,
      id: 257,
      ten: "Chân vũ tuyệt kích",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 1.45,
      batBuocThangThien: null,
      moTa:
        "Chỉ phát huy ở CHIÊU: roll RNG<=base.ChanVu_TuyetKich (=điểm*heSo1, field dùng CHUNG với job1 idx7, job5 idx7, job12 idx6 — không chỉ 'Tử Hào' như audit cũ nêu, mỗi job có nhánh switch(Player_Job) riêng). Ở PvE: proc thì nhân thẳng dame×heSo2(rate2≈1.45) không điều kiện gì thêm. Ở PK: proc thì roll THÊM 1 lần dựa trên field của ĐỐI PHƯƠNG (value2.HanBaoQuan_ChanKhiHoanNguyen, chính là khí công Thăng Thiên id577 — xem mục đó) — nếu đối phương roll trúng thì dame×1.0 (bonus bị VÔ HIỆU HOÀN TOÀN, chỉ hiện hiệu ứng 577 trên đối phương), nếu đối phương roll trượt (hoặc đối phương không đầu id577) thì mới nhân dame×heSo2 như PvE.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "DB idx8 (FLD_PID=257): rate1=1.0, rate2=1.45 — khớp audit cũ (1.0/1.3 → thực ra audit cũ ghi 1.3, DB thật là 1.45; đã cập nhật). " +
        "PvE: Players/A8_Players_03MagicAttack.cs (ComputingAttack) dòng 3581-3585 — không có gate id577. PK: cùng file (MagicAttack_Player) dòng 953-965 — CÓ gate id577. Đây là chỗ audit cũ mô tả NGƯỢC: audit cũ nói combo id577 'chỉ có ở PvE, PK thiếu' và tuyên bố đã bổ sung cho PK; thực tế code hiện tại cho thấy CHIỀU NGƯỢC LẠI — gate id577 CHỈ tồn tại ở PK, PvE hoàn toàn không có (và về logic thì đúng: NpcClass không có field HanBaoQuan_ChanKhiHoanNguyen vì đó là field riêng của Players, nên PvE không thể check được — không phải thiếu sót). Xem giải trình đầy đủ ở mục id577.",
    },
    {
      index: 9,
      id: 259,
      ten: "Hỏa long vấn đỉnh",
      loai: "goc",
      heSo1: 3000.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Kích hoạt qua dùng kỹ năng (case 1001301/1001302/1001303), 3 cấp buff công +5%/+10%/+15% vào FLD_NhanVat_LucCongKichVoCongGiaTang_TiLePhanTram, thời lượng = 10000ms + base.HanBaoQuan_HoaLongVanDinh (=điểm*heSo1). 3 cấp tự loại trừ nhau qua GetAddState().",
      trangThai: "CON_LOI_CHUA_SUA",
      ghiChu:
        "KIỂM TRA LẠI HÔM NAY: cấp 1 (case 1001301, Players/Players.cs dòng 41906-41932) và cấp 2 (case 1001302, dòng 41933-41959) ĐỀU có gate 'if (base.NhanVat_CheDoPK != 0 || ...) return;' — chỉ kích hoạt được khi KHÔNG bật chế độ PK. Cấp 3 (case 1001303, dòng 41960-41980, mạnh nhất +15%) VẪN THIẾU điều kiện 'base.NhanVat_CheDoPK != 0' — có thể bật bất kỳ lúc nào kể cả đang bật PK Mode, chỉ bị chặn bởi GetAddState(1001301)/GetAddState(1001302) (không tự chồng buff với 2 cấp kia). " +
        "Đây là ĐIỂM BẤT ĐỒNG với audit cũ: audit cũ (02/09) khẳng định đã 'bổ sung khớp cấp 1/2' cho cấp 3, nhưng code SRCGameServerV24B hiện tại (sau các chỉnh sửa trong phiên hôm nay) KHÔNG có gate đó ở case 1001303 — bug (nếu coi thiếu gate PK là bug) vẫn còn tồn tại trong nguồn hiện hành, dù audit cũ ghi 'đã sửa'. DB idx9 (FLD_PID=259): rate1=3000.0 khớp audit cũ.",
    },
    {
      index: 10,
      id: 260,
      ten: "Lưu quang loạn vũ",
      loai: "goc",
      heSo1: 0.001,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Trong các kỹ năng đánh nhiều đòn (multi-hit, xác định qua các cờ KichHoat_LuuTinh_ManThien/SatTinh.../TuyetAnh_XaHon/ThanNu_LayNhiem hoặc FLD_CongKichSoLuong>1): nhân thêm (1.0 + base.LuuQuang_LoanVu) vào LỰC CÔNG KÍCH của mỗi đòn trong chuỗi (CongKichLuc *= 1+field), KHÔNG phải tăng số lần trúng đòn/số hit như mô tả cũ — số lượng đòn (num4/FLD_CongKichSoLuong) được set độc lập bởi các cờ combo khác. Dùng chung field với Đao (job1), tách qua kiểm tra Play.Player_Job==1||==8.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Tiêu thụ: Players/A8_Players_01SystemAttack.cs dòng 624-631 (số dòng cũ 'AttackCalculationCompleted ~46809-46812' đã lệch do tách file). DB idx10 (FLD_PID=260): rate1=0.001, rate2=0.0 — khớp audit cũ. Đã chỉnh lại phần moTa cho khớp đúng biến bị nhân (lực công kích của đòn, không phải số lần trúng).",
    },
    {
      index: 11,
      id: 258,
      ten: "Ám ảnh tuyệt sát",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 1.2,
      batBuocThangThien: null,
      moTa:
        "Chỉ phát huy ở CHIÊU (như idx8): roll RNG<=base.AmAnh_TuyetSat (=5.0+điểm*heSo1) thì nhân dame×heSo2(rate2≈1.2). Ở PvE, ngưỡng roll còn được CỘNG THÊM bonus từ Thăng Thiên 601 (num29, xem mục idx2/id601); ở PK KHÔNG có cộng thêm này — bất đối xứng thật giữa PvE/PK (audit cũ không nêu rõ điểm này).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "DB idx11 (FLD_PID=258): rate1=1.0, rate2=1.2 — khớp đúng audit cũ. PvE: A8_Players_03MagicAttack.cs (ComputingAttack) dòng 3586-3590 (`base.AmAnh_TuyetSat + num29`). PK: cùng file (MagicAttack_Player) dòng 966-970 (`base.AmAnh_TuyetSat`, KHÔNG cộng num68/601). Combo lồng với Thăng Thiên 601 vẫn hoạt động ở nhánh PvE do rate2 idx2 hiện >0 — xem chi tiết ở mục id601.",
    },
    {
      index: null,
      id: 577,
      ten: "Khí công bí cấp (Thăng Thiên 6 thức - HBQ, Chân khí hoàn nguyên)",
      loai: "thang_thien",
      heSo1: 1.0,
      heSo2: null,
      batBuocThangThien: 11,
      moTa:
        "ĐỌC LẠI TOÀN BỘ TỪ ĐẦU — bản chất khác hẳn mô tả cũ. base.HanBaoQuan_ChanKhiHoanNguyen = điểm_thăng_thiên*heSo1. Đây KHÔNG PHẢI 'combo cộng thêm vào proc của CHÍNH MÌNH' — đây là khí công PHÒNG THỦ, chỉ kiểm tra trên field của NGƯỜI BỊ TẤN CÔNG (value2, tức đối tượng phòng thủ), và CHỈ xuất hiện trong ngữ cảnh PK (MagicAttack_Player). " +
        "Cơ chế thật: khi MỘT người chơi bất kỳ (đã xác nhận job1 Đao và job8 Hàn Bảo Quân đều dùng chung khối code này, do field ChanVu_TuyetKich dùng chung) proc trúng 'Chân Vũ Tuyệt Kích' (idx8) nhằm vào một Hàn Bảo Quân có đầu điểm 577, thì Hàn Bảo Quân đó được roll RNG<=HanBaoQuan_ChanKhiHoanNguyen — nếu TRÚNG thì bonus dame của đòn Chân Vũ Tuyệt Kích đang tới bị VÔ HIỆU HOÀN TOÀN (nhân ×1.0 thay vì ×rate2), tức 577 hoạt động như một khả năng 'kháng/hoá giải' đòn chí mạng của đối phương, KHÔNG phải buff tự nhân đôi sát thương của chính mình. " +
        "Ở PvE, field này KHÔNG được đọc ở đâu cả (không phải do thiếu code — về logic hợp lý vì NpcClass không có field Player-only này, quái vật không thể 'phòng thủ' bằng khí công người chơi).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "BẤT ĐỒNG LỚN với audit cũ (02/09): audit cũ mô tả 577 là 'combo cộng thêm lồng trong proc của idx8: nếu idx8 đã proc, roll thêm thì nhân dame ×1.3 THÊM một lần nữa', trangThai=DA_SUA với lý do 'đã bổ sung nhánh combo id577 vào PK-chiêu cho khớp PvE-chiêu'. Đọc lại code hiện tại (Players/A8_Players_03MagicAttack.cs dòng 956-964, trong MagicAttack_Player = ngữ cảnh PK) cho thấy: (1) field kiểm tra là value2 (đối phương/mục tiêu), KHÔNG phải base (bản thân) — tức đây là cơ chế phòng thủ chứ không phải combo tấn công; (2) khi proc, code là `num48 *= 1.0` (vô hiệu hoá bonus, không phải nhân thêm ×1.3); (3) field này HOÀN TOÀN VẮNG MẶT ở nhánh PvE (ComputingAttack dòng 3581-3585 chỉ có `num10 *= 得到气功加成值(8,8,2)` không điều kiện) — tức đúng NGƯỢC LẠI với claim 'PvE có, PK thiếu, đã bổ sung cho PK khớp PvE' của audit cũ. " +
        "DB bảng 升天气功 (không phải TBL_XWWL_SKILL) job8 KhiCongID=577: rate=1.0 (audit cũ ghi heSo1=0.1, khác 10 lần — đã cập nhật theo DB thật), tên đầy đủ '气功秘笈([升天6式]韩飞官-真气还原)' = Khí công bí cấp ([Thăng Thiên 6 thức] Hàn Phi Quân - Chân khí hoàn nguyên). Gán: PlayersBes.cs dòng 10463-10465.",
    },
    {
      index: null,
      id: 600,
      ten: "Thăng thiên 1 hành phong lộng vũ",
      loai: "thang_thien",
      heSo1: 0.7,
      heSo2: null,
      batBuocThangThien: 6,
      moTa:
        "Proc riêng ở chiêu: roll RNG(1,110) <= base.HanBaoQuan_ThangThien_1_KhiCong_HanhPhongLongVu (=điểm*heSo1) CỘNG THÊM bonus từ id601 (num68/num29, xem mục 601) thì nhân dame cố định ×1.25 (hard-code, không đọc DB rate2 vì bảng 升天气功 chỉ có 1 cột rate). Có đủ ở cả PvE (A8_Players_03MagicAttack.cs dòng 3591-3595) và PK (cùng file dòng 971-975), cả 2 đều cộng bonus 601 giống nhau.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "DB bảng 升天气功, KhiCongID=600: rate=0.7 — khớp đúng audit cũ. Tên DB '升天一式 行风弄舞' = Thăng Thiên NHẤT thức - khớp đúng batBuocThangThien=6 (thức 1→lvl6, xem quy luật giải thích ở mục id602).",
    },
    {
      index: null,
      id: 601,
      ten: "Thăng thiên 2 thiên ma hộ thể",
      loai: "thang_thien",
      heSo1: 0.5,
      heSo2: null,
      batBuocThangThien: 7,
      moTa:
        "base.HanBaoQuan_ThangThien_3_KhiCong_ThienMaHoThe = điểm_thăng_thiên*heSo1 (tên field trong code ghi 'ThangThien_3' dù DB gọi đây là Thăng Thiên NHỊ thức — lệch tên biến nội bộ, không ảnh hưởng logic). Bản thân field KHÔNG tự gây dame — nó chỉ được gán vào biến tạm (num68 ở PK, num29 ở PvE) MỖI KHI 'Cực Huyết' (idx2 rate2, id252) proc trúng, sau đó biến tạm này được CỘNG vào ngưỡng roll của: (a) id600 Hành Phong Lộng Vũ — cả PK lẫn PvE; (b) idx11 Ám Ảnh Tuyệt Sát — CHỈ ở PvE, KHÔNG có ở PK. Nói cách khác: 601 chỉ phát huy tác dụng khi Cực Huyết (idx2) đã proc trong cùng đòn đó.",
      trangThai: "DA_SUA",
      ghiChu:
        "SỬA TÊN (ten) so với audit cũ: audit cũ đặt tên id601='Thăng thiên 3 thiên ma hộ thể' và id602='Thăng thiên 2 nội tức hành tâm' — tức số thứ tự 'thức' của 2 khí công này bị ĐẢO NGƯỢC. DB bảng 升天气功 xác nhận: KhiCongID=601 tên '升天二式 天魔护体' = Thăng Thiên NHỊ (2) thức - Thiên Ma Hộ Thể; KhiCongID=602 tên '升天三式 内息行心' = Thăng Thiên TAM (3) thức - Nội Tức Hành Tâm. batBuocThangThien cũ (601=7, 602=8) đã ĐÚNG theo đúng thứ tự thật (2nd→lvl7, 3rd→lvl8) nên GIỮ NGUYÊN, chỉ sửa nhãn 'ten'. " +
        "DB rate KhiCongID=601: 0.5 — khác audit cũ (heSo1=0.3, đã cập nhật). Cơ chế 'kích hoạt kép' phụ thuộc rate2 idx2 (id252) hiện >0 (=0.15, xem mục idx2) nên 601 CÓ hoạt động ở trạng thái nguồn hiện tại — đồng ý với kết luận tổng thể của audit cũ dù chi tiết số liệu khác. Gán: PlayersBes.cs dòng 10346-10348. Tiêu thụ: A8_Players_03MagicAttack.cs dòng 941-951 (PK) và 3569-3579 (PvE, chỗ set num68/num29), cộng vào id600 ở dòng 971/3591 và vào idx11 CHỈ ở dòng 3586 (PvE).",
    },
    {
      index: null,
      id: 602,
      ten: "Thăng thiên 3 nội tức hành tâm",
      loai: "thang_thien",
      heSo1: 0.02,
      heSo2: null,
      batBuocThangThien: 8,
      moTa: "Giảm nhịp hồi chiêu (haste): nếu num3(nhịp hiện tại)>1000 thì num3 = num3*(1.0 - base.HanBaoQuan_ThangThien_2_KhiCong_NoiTucHanhTam) (tên field trong code ghi 'ThangThien_2' dù DB gọi đây là Thăng Thiên TAM thức — cùng kiểu lệch tên như id601, không ảnh hưởng logic). field = điểm_thăng_thiên*heSo1.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "SỬA TÊN (ten) so với audit cũ — xem giải trình đầy đủ ở mục id601 (2 khí công 601/602 bị đảo nhãn 'thức' trong audit cũ, đã sửa lại theo DB '升天三式 内息行心'). batBuocThangThien=8 giữ nguyên (đã đúng). " +
        "DB rate KhiCongID=602: 0.02 — khớp đúng audit cũ. Tiêu thụ: Players/Players.cs dòng 64725-64727 (`if (Player_Job==8 && num3>1000 && field!=0.0) num3 = (int)(num3*(1.0-field));`).",
    },
    {
      index: null,
      id: 603,
      ten: "Thăng thiên 4 trường hồng quán thiên",
      loai: "thang_thien",
      heSo1: 0.5,
      heSo2: null,
      batBuocThangThien: 9,
      moTa:
        "Proc AoE buff đồng minh cùng phe trong TẦM 60 (không phải 300 như mô tả cũ): +100 công (TruongHongQuanThien_ThemVao_TanCong), +100 thủ (...ThemVao_PhongNgu), +1000 HP tối đa, +1000 MP tối đa, trạng thái 5 GIÂY (5000ms, không phải 3 giây như mô tả cũ), state 1008001173.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "SỬA SỐ LIỆU so với audit cũ: audit cũ ghi tầm 300 và 3 giây; đọc lại Players/Players.cs dòng 40214-40258 (hàm chứa cả id603/604, cùng khối với case701/702 của nghề khác — đúng như audit cũ nêu 'dùng chung khung Thăng Thiên 4') cho thấy phạm vi thật là 查找范围玩家(60, value18) = tầm 60, và thời lượng thật X_Them_Vao_Trang_Thai_Loai(value18, 5000, 1008001173, 0) = 5000ms = 5 giây. DB bảng 升天气功 KhiCongID=603: rate=0.5, tên '升天四式 长虹贯天' = Thăng Thiên TỨ (4) thức, khớp batBuocThangThien=9 và tên cũ.",
    },
    {
      index: null,
      id: 604,
      ten: "Thăng thiên 4 ai hồng biến dã",
      loai: "thang_thien",
      heSo1: 0.5,
      heSo2: null,
      batBuocThangThien: 9,
      moTa:
        "Proc AoE debuff địch trong TẦM 60 (không phải 300 như mô tả cũ): giảm 0.15 trần HP tối đa của mục tiêu (FLD_KhiCong_AiHongPhienDa_ThemVaoTiLePhanTram_SinhMenhCaoNhat -= 0.15), trạng thái 10 giây (1008001176) — khớp đúng audit cũ về thời lượng.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "SỬA TẦM ẢNH HƯỞNG so với audit cũ (300 → 60 thật, xem giải trình chi tiết ở mục id603 — cùng khối code Players/Players.cs dòng 40163-40212). Thời lượng 10 giây khớp đúng audit cũ. DB bảng 升天气功 KhiCongID=604: rate=0.5, tên '升天四式 哀鸿遍野' khớp batBuocThangThien=9.",
    },
    {
      index: null,
      id: 686,
      ten: "[Hàn phi quan] Khí công bí cấp thư (Thiên ma chi lực, Thăng Thiên 5 thức)",
      loai: "thang_thien",
      heSo1: 0.005,
      heSo2: null,
      batBuocThangThien: 10,
      moTa:
        "base.ThangThien_5_ThienMaChiLuc = điểm_thăng_thiên*heSo1. Hệ số cộng thêm vào công thức 'dame lưu trữ' của combo idx2 (Thiên Ma Cuồng Huyết): khi 'Cuồng Huyết' proc trúng, dame lưu = dame_hiện_tại*(0.4*hesoIndex29-31 + ThangThien_5_ThienMaChiLuc), được cộng vào đòn KẾ TIẾP nếu đòn đó proc 'Cực Huyết' thành công (cả PK và PvE).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "DB bảng 升天气功 KhiCongID=686: rate=5.0000000000000001E-3 (~0.005) — khác audit cũ (heSo1=0.01, gấp đôi); đã cập nhật theo DB thật. Tên DB '[韩飞官] 气功秘笈书([升天5式]-天魔之力' khớp đúng tên cũ và batBuocThangThien=10. " +
        "Gán: PlayersBes.cs dòng 10319-10321. Tiêu thụ: A8_Players_03MagicAttack.cs dòng 948/980 (PK) và 3576/3600 (PvE) — vẫn phụ thuộc rate2 idx2 (id252) >0 để cờ KichHoat_ThienMaCucHuyet có cơ hội bật, giống lý do audit cũ nêu cho 'sống lại theo idx2', nhưng số liệu rate2 thật là 0.15 chứ không phải 0.01 (xem mục idx2).",
    },
  ],
};
