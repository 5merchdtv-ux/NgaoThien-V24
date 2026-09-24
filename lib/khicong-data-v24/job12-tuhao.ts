import type { NgheData } from "../khicong-data/types";

// Đối chiếu Ver24 THẬT — đọc lại code SRCGameServerV24B hiện tại (không dùng lại audit cũ 02/09
// mà không kiểm chứng), biên soạn 15/09/2026.
//
// GHI CHÚ CHUNG QUAN TRỌNG:
// 1) Codebase đã được tách file kể từ audit 02/09: Players.cs (gốc) đã được chia nhỏ thành các
//    partial class trong thư mục Players\ — A8_Players_02PhysicalAttack.cs (đòn tay: case 3/case 12
//    dùng CHUNG 1 block cho THUONG_LienHoanPhiVu), A8_Players_03MagicAttack.cs (MagicAttack_Player =
//    chiêu PK, ComputingAttack = chiêu PvE — được gọi từ MagicAttack_Npc), A8_Players_04AttackConfirmation.cs
//    (xác nhận đòn đánh, nơi trừ % phản sát thương qua PhanDanVoHieu), X3_NpcClass\NpcClass.cs (NPC tấn
//    công người chơi = nhánh phòng thủ PvE cho KhongGiPhaNoi/TuHao_ChuyenCongViThu). PlayersBes.cs vẫn giữ
//    UpdateKhiCong() (gán điểm, case 12 trong switch(Player_Job) ~9971-10028; case 662/663/664/665/666/690/581
//    trong switch(KhiCongID) thăng thiên ~10283-10333 và ~10475-10477) và 加血()/AddBlood (~22471-22493).
//    Toàn bộ trích dẫn dòng dưới đây đọc lại từ các file MỚI này, số dòng có thể trôi — chỉ tin tên field/case.
// 2) Đã spot-check DB sống (bảng TBL_XWWL_SKILL cho khí công GỐC theo cặp job=12+index, bảng 升天气功 cho
//    khí công THĂNG THIÊN theo KhiCongID). NHIỀU heSo1/heSo2 trong audit cũ (02/09) KHÔNG còn khớp DB hiện
//    tại — rất có thể hệ số đã bị chỉnh lại (cân bằng) trong phiên làm việc gần đây. heSo1/heSo2 dưới đây lấy
//    trực tiếp từ DB sống (24pub), mọi thay đổi so với file cũ đều nêu rõ trong moTa/ghiChu từng dòng.
// 3) PHÁT HIỆN QUAN TRỌNG NHẤT: audit cũ đã gán NGƯỢC index 5↔6 — DB xác nhận FLD_INDEX=5 ứng với
//    id192 (Khí trầm đan điền) chứ không phải id287, và FLD_INDEX=6 ứng với id287 (Chân vũ tuyệt kích) chứ
//    không phải id192. Việc này được xác nhận ĐỘC LẬP hai lần: (a) trực tiếp qua DB TBL_XWWL_SKILL, và
//    (b) qua chính code tiêu thụ — lệnh gọi 得到气功加成值(12, 6, 2) tại A8_Players_03MagicAttack.cs áp
//    dụng hệ số nhân sát thương cho PROC Chân Vũ Tuyệt Kích, và index truyền vào là 6 chứ không phải 5.
//    File này đã SỬA lại thứ tự index cho đúng thực tế; xem chi tiết ở 2 dòng index 5 và 6 bên dưới.
export const JOB_12_TU_HAO_V24: NgheData = {
  job: 12,
  tenNghe: "Tử Hào",
  khiCong: [
    {
      index: 0,
      id: 281,
      ten: "Kim chung cương khí",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Xác nhận đúng như audit cũ. UpdateKhiCong() case 12→case 0: FLD_NhanVat_KhiCong_PhongNgu = (int)(điểm × heSo1) — cộng THẲNG (không nhân theo % FLD_PhongNgu như job1 làm ở idx0 tương ứng), không roll, có hiệu lực mọi lúc. Field FLD_NhanVat_KhiCong_PhongNgu là field vật lý dùng chung nhiều nghề (mỗi nghề tự gán qua case riêng của mình), cộng thẳng vào tổng phòng ngự hiển thị (UserIdList.cs gửi field này cho client).",
      trangThai: "BINH_THUONG",
      ghiChu: "DB xác nhận job=12,index=0: heSo1=1.0, heSo2=0.0 (khớp audit cũ). Gán: PlayersBes.cs UpdateKhiCong() case 12→case 0.",
    },
    {
      index: 1,
      id: 282,
      ten: "Vận khí liệu thương",
      loai: "goc",
      heSo1: 0.01,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "ĐẢO NGƯỢC hoàn toàn kết luận audit cũ (CHET_HOAN_TOAN → sống bình thường). Đọc lại 加血()/AddBlood() trong PlayersBes.cs hiện tại: gate là `if (Player_Job == 3 || Player_Job == 12)` — job 12 đã có mặt TRỰC TIẾP trong điều kiện, không còn bị loại trừ như audit cũ mô tả (lúc đó chỉ có Player_Job==3). Công thức: sl = sl × (1.0 + THUONG_VanKhi_LieuThuong). Ngoài ra, đúng như audit cũ cảnh báo về khả năng double-dip: NGAY SAU đó code còn cộng thêm `if (Player_Job != 3 && Player_Job_Level >= 6) sl += ThangThien_1_KhiCong_VanKhi_LieuThuong` (khí công Thăng Thiên dùng chung id385) — Tử Hào cấp ≥6 nhận CẢ HAI: hệ số nhân riêng (idx1 này) VÀ cộng phẳng từ id385. Đây là thiết kế song song có chủ đích giống mọi nghề khác (không phải lỗi), không phải double-dip lỗi.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "DB xác nhận job=12,index=1: heSo1=0.01, heSo2=0.0 (khớp audit cũ). Gán: PlayersBes.cs UpdateKhiCong() case 12→case 1. Tiêu thụ: PlayersBes.cs 加血()/AddBlood (~22482-22484), cùng hàm còn có nhánh id385 dùng chung (~22490-22492).",
    },
    {
      index: 2,
      id: 283,
      ten: "Liên hoàn phi vũ",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "ĐẢO NGƯỢC kết luận audit cũ (CON_LOI_CHUA_SUA → sống bình thường). Đọc lại A8_Players_02PhysicalAttack.cs (đòn tay): switch(Player_Job) có `case 3: case 12:` DÙNG CHUNG một block duy nhất — `if (RNG.Next(1,100) <= THUONG_LienHoanPhiVu) { sát thương đòn tay ×2.0 + đổi hoạt ảnh ngẫu nhiên }`. Không có cơ chế đòn tay 'riêng' nào khác của Tử Hào ghi đè hay xung đột — Tử Hào dùng ĐÚNG cùng công thức với Thương (job3), không có hiện tượng 'thay thế hoàn toàn'. Audit cũ suy đoán sai về một 'cơ chế đòn tay riêng job 8/9/10' cho Tử Hào — không tìm thấy bằng chứng nào trong code hiện tại; case 12 trỏ thẳng vào case 3.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "DB xác nhận job=12,index=2: heSo1=1.0, heSo2=0.0 (khớp audit cũ). Gán: PlayersBes.cs UpdateKhiCong() case 12→case 2 (base.THUONG_LienHoanPhiVu = 10.0 + điểm×heSo1). Tiêu thụ: A8_Players_02PhysicalAttack.cs, switch(Player_Job) case 3/case 12 dùng chung (~544-548, và lặp lại ~1551 cho nhánh khác trong cùng file).",
    },
    {
      index: 3,
      id: 284,
      ten: "Hoành luyện thái bảo",
      loai: "goc",
      heSo1: 8.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa: "Xác nhận đúng như audit cũ: NhanVat_KhiCong_ThemVao_HP = (int)(điểm × heSo1) — cộng thẳng HP tối đa, thụ động, field vật lý dùng chung nhiều nghề (mỗi nghề gán qua case riêng), tổng hợp vào HP tối đa hiển thị.",
      trangThai: "BINH_THUONG",
      ghiChu: "DB xác nhận job=12,index=3: heSo1=8.0, heSo2=0.0 (khớp audit cũ). Gán: PlayersBes.cs UpdateKhiCong() case 12→case 3.",
    },
    {
      index: 4,
      id: 285,
      ten: "Cuồng phong vạn phá",
      loai: "goc",
      heSo1: 3000.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Xác nhận đúng như audit cũ, đã dò lại nơi tiêu thụ thật (Players.cs ~61867, không phải file MagicAttack đã tách): `int num2 = 10000 + (int)base.CuongPhong_VanPha;` — dùng làm thời lượng (ms) buff Nộ Khí Xung Thiên. heSo1=3000 khớp DB, tại điểm đầu tư 60 (ngưỡng mềm World.限制气功点数 hiện = 60, không phải 80 như audit cũ giả định — điểm vượt 60 vẫn cộng thêm nhưng chỉ theo World.限制气功百分比 = 30% hiệu quả, không bị chặn cứng) cho +180s; vượt 60 điểm vẫn tăng thêm nhưng giảm tốc theo tỉ lệ 30%.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "DB xác nhận job=12,index=4: heSo1=3000.0, heSo2=0.0 (khớp audit cũ). Gán: PlayersBes.cs UpdateKhiCong() case 12→case 4. Tiêu thụ: Players.cs ~61867. Sửa lại claim 'ngưỡng 80 điểm' của audit cũ thành ngưỡng mềm 60 điểm (World.限制气功点数, có thể bị ghi đè qua config.ini).",
    },
    {
      index: 5,
      id: 192,
      ten: "Khí trầm đan điền",
      loai: "goc",
      heSo1: 0.005,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "SỬA VỊ TRÍ (đổi chỗ với Chân vũ tuyệt kích, xem ghi chú đầu file) + SỬA heSo1 (audit cũ ghi 0.5 tại 'idx6', DB hiện tại là 0.005 — chênh lệch 100 lần). Field dùng chung nhiều nghề (base.DonKhi_DanDien). Tiêu thụ tại 1 khối CHUNG ngay sau switch(Player_Job) trong UpdateKhiCong(), áp dụng cho MỌI nghề có DonKhi_DanDien>0: `int num10 = (int)(FLD_PhongNgu × DonKhi_DanDien / 100.0); NhanVat_KhiCong_ThemVao_HP += num10; NhanVat_KhiCong_ThemVao_LucPhongNguVoCong += num10;` — quy đổi % phòng ngự hiện tại thành HP tối đa VÀ lực phòng ngự võ công, cộng thêm (không phải thay thế). Với heSo1=0.005, ở 60 điểm chỉ ~30% FLD_PhongNgu được quy đổi (audit cũ, dùng nhầm heSo=0.5 và nhầm sang idx6, ước tính sai quy mô).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "DB xác nhận job=12,index=5: heSo1=0.005, heSo2=0.0 (audit cũ gán field này cho 'idx6' với heSo1=0.5 — SAI cả vị trí lẫn giá trị). Gán: PlayersBes.cs UpdateKhiCong() case 12→case 5 (base.DonKhi_DanDien = điểm×heSo1). Tiêu thụ chung: PlayersBes.cs ~10073-10078 (if (DonKhi_DanDien > 0.0) ngay sau switch job).",
    },
    {
      index: 6,
      id: 287,
      ten: "Chân vũ tuyệt kích",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 1.5,
      batBuocThangThien: null,
      moTa:
        "SỬA VỊ TRÍ (đổi chỗ với Khí trầm đan điền, xem ghi chú đầu file) + SỬA heSo2 (audit cũ ghi 1.3, DB hiện tại là 1.5). 2 hệ số đều sống, cơ chế xác nhận đúng như audit cũ mô tả: hệ số1 = %proc (base.ChanVu_TuyetKich = điểm×heSo1, roll RNG 1-100), hệ số2 = số nhân sát thương CỐ ĐỊNH khi trúng, đọc trực tiếp bằng 得到气功加成值(12, 6, 2) = 1.5 — KHÔNG nhân thêm theo điểm đã đầu tư (chỉ cổng proc mới phụ thuộc điểm, độ mạnh đòn thì cố định). Nếu đối thủ đồng thời trúng khí công phản chế 'Hàn Bảo Quán chân khí hoàn nguyên' (id577) thì bonus bị vô hiệu (×1.0). Có mặt Ở CẢ HAI chiêu PK (MagicAttack_Player) và chiêu PvE (ComputingAttack), cùng công thức. Field base.ChanVu_TuyetKich dùng chung với nhiều nghề khác (Đại Phu/HanBaoQuan/Thần Nữ...), mỗi nghề tự có index/heSo2 riêng qua 得到气功加成值(job, index, 2).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "DB xác nhận job=12,index=6: heSo1=1.0, heSo2=1.5 (audit cũ gán field này cho 'idx5' với heSo2=1.3 — SAI cả vị trí lẫn giá trị). Gán: PlayersBes.cs UpdateKhiCong() case 12→case 6. Tiêu thụ: A8_Players_03MagicAttack.cs MagicAttack_Player (~1069-1080, PK-chiêu) và ComputingAttack (~3677-3681, PvE-chiêu, gọi 得到气功加成值(12,6,2) y hệt).",
    },
    {
      index: 7,
      id: 286,
      ten: "Lưu tinh mạn thiên",
      loai: "goc",
      heSo1: 0.8,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "🟠 SỬA heSo1 (audit cũ ghi 2.0, DB hiện tại là 0.8 — giảm 2.5 lần, rất có thể là một phần của biện pháp cân bằng lại). Bug thứ tự if/else level (>=6 chặn trước 7/8/9) mà audit cũ mô tả 'ĐÃ SỬA' — xác nhận ĐÚNG, code hiện tại đã sắp lại đúng thứ tự (Player_Job_Level==3/4/5/>=6 tăng dần +5/+10/+15/+20, không có mốc 7/8/9 trong code thật — có thể audit cũ nhầm chi tiết này, cấp Tử Hào tối đa hiện tại chỉ có 4 mốc 3/4/5/6+). 🔴 KHÔNG TÌM THẤY Math.Min clamp nào audit cũ khẳng định 'ĐÃ SỬA' — đọc cả 2 nơi tiêu thụ (PK-chiêu và PvE-chiêu) đều là phép cộng thẳng `LuuTinhManThien + ThangThien_5_PhaKhongTruyTinh (- num28 ở PK)` so với RNG(1,100), không có Math.Min/clamp nào bọc quanh. Rủi ro vượt trần 100% được GIẢM (không phải loại bỏ) nhờ 2 việc: (1) heSo1 giảm 2.5 lần + heSo1 id690 giảm 10 lần (xem idx 690), (2) hệ thống giảm hiệu quả điểm đầu tư >60 chung toàn server (World.限制气功点数=60, World.限制气功百分比=30%) — đây là cơ chế CHUNG cho mọi khí công, không phải fix riêng cho bug này. Ở PK còn bị trừ thêm 'phản khí công lưu tinh mãn thiên' (num28 = đối thủ.反气功_流星漫天_卢风郎, một khí công phản chế riêng). PvE (ComputingAttack) KHÔNG có trừ này (NPC không có phản chế). KHÁC BIỆT MỚI PHÁT HIỆN so với audit cũ: nhánh PvE (ComputingAttack, dùng bởi MagicAttack_Npc) THIẾU HẲN nhánh Nhược Điểm Kích/Công Phá (idx10) + Sát Tinh Quang Phù/'Phá Huyết Cuồng Phong' (id663) — PvE chỉ còn lại nhánh Kỹ Quán Quần Hùng (id664, ×2.0) khi proc; audit cũ mô tả 2 nhánh đối xứng PvE/PK là KHÔNG còn đúng.",
      trangThai: "CON_LOI_CHUA_SUA",
      ghiChu:
        "DB xác nhận job=12,index=7: heSo1=0.8, heSo2=0.0 (audit cũ ghi heSo1=2.0 — SAI, đã lệch so với DB hiện tại). Gán: PlayersBes.cs UpdateKhiCong() case 12→case 7. Tiêu thụ PK: A8_Players_03MagicAttack.cs MagicAttack_Player (~1082-1106). Tiêu thụ PvE: A8_Players_03MagicAttack.cs ComputingAttack (~3664-3682, thiếu nhánh idx10/663). num28 (PK): A8_Players_03MagicAttack.cs (~351, value2.反气功_流星漫天_卢风郎). Hạ verdict từ DA_SUA (audit cũ) xuống CON_LOI_CHUA_SUA vì clamp cụ thể mà audit cũ mô tả không tồn tại trong code hiện tại — dù rủi ro thực tế đã giảm nhiều nhờ tinh chỉnh hệ số.",
    },
    {
      index: 8,
      id: 288,
      ten: "Càn khôn na di",
      loai: "goc",
      heSo1: 0.015,
      heSo2: 0.005,
      batBuocThangThien: null,
      moTa:
        "heSo1 khớp audit cũ (0.015), SỬA heSo2 (audit cũ ghi 0.04, DB hiện tại là 0.005). Hệ số1: FLD_NhanVat_KhiCong_LucCongKichVoCongGiaTang_TiLePhanTram = điểm×heSo1, sống bình thường, cộng vào công thức sát thương chiêu chung (A8_Players_03MagicAttack.cs, cùng nhóm với FLD_TrangBi_LucCongKichVoCongGiaTang_TiLePhanTram và các field %sát thương khác), áp dụng mọi nghề không riêng gì Tử Hào. Hệ số2: `THUONG_LienHoanPhiVu *= 1.0 + điểm×heSo2` — ĐẢO NGƯỢC kết luận audit cũ: vì idx2 (THUONG_LienHoanPhiVu) đã được xác nhận SỐNG với Tử Hào (xem idx2), hệ số2 này KHÔNG còn là 'phép tính thừa vô hại' — nó thật sự khuếch đại % proc Liên Hoàn Phi Vũ trong đòn tay, NHƯNG chỉ có tác dụng nếu người chơi cũng đầu tư điểm vào idx2 (nếu idx2 = 0 thì nhân với 0 vẫn ra 0).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "DB xác nhận job=12,index=8: heSo1=0.015 (khớp), heSo2=0.005 (audit cũ ghi 0.04 — SAI). Gán: PlayersBes.cs UpdateKhiCong() case 12→case 8. Tiêu thụ heSo1: A8_Players_03MagicAttack.cs (~3208/3261, công thức sát thương chiêu chung). Hệ quả heSo2: phụ thuộc idx2 (case 3/case 12 dùng chung tại A8_Players_02PhysicalAttack.cs).",
    },
    {
      index: 9,
      id: 289,
      ten: "Chuyển công vi thủ",
      loai: "goc",
      heSo1: 0.5,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "🔴 SỬA heSo1 rất lớn — audit cũ ghi 0.004 (mô tả 'rất nhỏ, max ~5.3%'), DB hiện tại là 0.5 — chênh lệch 125 lần. Ở 60 điểm (ngưỡng mềm), giá trị proc đã tới 30% (trước khi tính thêm điểm vượt ngưỡng); mô tả 'rất nhỏ' của audit cũ KHÔNG còn đúng với dữ liệu hiện tại. Đồng thời SỬA phạm vi: audit cũ khẳng định field này 'Chỉ có ở PK-chiêu' — đọc code hiện tại thấy field TuHao_ChuyenCongViThu được dùng ở CẢ HAI: (1) X3_NpcClass\\NpcClass.cs (~1265, quái tấn công người chơi — PvE, không trừ gì thêm) và (2) A8_Players_03MagicAttack.cs MagicAttack_Player (~418, PK-chiêu, có trừ thêm 'num29' — một đại lượng kháng của đối thủ, cùng dạng cơ chế phản chế khí công như idx7). Khi trúng: cộng thêm FLD_CongKich/2.0 vào phòng ngự tính sát thương (num5) của Tử Hào đang bị tấn công — quy đổi công lực thành phòng thủ, đúng ý tưởng nhưng khác quy mô.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "DB xác nhận job=12,index=9: heSo1=0.5, heSo2=0.0 (audit cũ ghi heSo1=0.004 — SAI, lệch 125 lần). Gán: PlayersBes.cs UpdateKhiCong() case 12→case 9. Tiêu thụ PvE: X3_NpcClass\\NpcClass.cs (~1265). Tiêu thụ PK: A8_Players_03MagicAttack.cs MagicAttack_Player (~418, trừ num29).",
    },
    {
      index: 10,
      id: 290,
      ten: "Nhược điểm kích phá",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 1.85,
      batBuocThangThien: null,
      moTa:
        "heSo1 khớp audit cũ, nhưng audit cũ HOÀN TOÀN BỎ SÓT heSo2 (ghi 0.0, DB thật là 1.85) — đây không phải phần thừa: heSo2 chính là số nhân sát thương khi proc trúng. Đọc lại nơi tiêu thụ (chỉ có ở PK-chiêu, MagicAttack_Player — PvE/ComputingAttack HOÀN TOÀN KHÔNG có nhánh này, xem ghi chú ở idx7): base.CongPhaNhuocDiem = 10.0 + điểm×heSo1 là %proc (lồng bên trong nhánh Lưu Tinh Mãn Thiên đã proc), khi trúng nhân sát thương ×得到气功加成值(12,10,2) = ×1.85 (không phải ×1.2 như audit cũ đoán) — nếu ĐỒNG THỜI 'Phá Huyết Cuồng Phong' (id663, tên DB thật khác 'Sát tinh quang phù' audit cũ ghi — xem idx663) cũng trúng (roll riêng độc lập) thì nhân ×(1.85+1.0)=×2.85 thay vì ×1.2/×1.8 audit cũ mô tả. Nếu KHÔNG trúng nhánh này, rơi xuống else-if kiểm tra Kỹ Quán Quần Hùng (id664, ×2.0 cố định).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "DB xác nhận job=12,index=10: heSo1=1.0 (khớp), heSo2=1.85 (audit cũ ghi 0.0 — BỎ SÓT hoàn toàn). Gán: PlayersBes.cs UpdateKhiCong() case 12→case 10 (chỉ dùng heSo1; heSo2 được đọc lại trực tiếp lúc tiêu thụ qua 得到气功加成值(12,10,2), không lưu vào field điểm-nhân). Tiêu thụ: A8_Players_03MagicAttack.cs MagicAttack_Player (~1087-1099) — CHỈ ở PK-chiêu.",
    },
    {
      index: 11,
      id: 291,
      ten: "Lao bất khả phá",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "SỬA phạm vi so với audit cũ ('Chỉ ở chiêu PK, khớp khuôn idx9' — không còn đúng): field base.KhongGiPhaNoi được dùng ở CẢ HAI: X3_NpcClass\\NpcClass.cs (~1220-1228, quái tấn công người chơi — PvE) và A8_Players_03MagicAttack.cs MagicAttack_Player (~370-378, PK-chiêu) — 2 khối gần như giống hệt nhau. Khi proc trúng (roll theo base.KhongGiPhaNoi = điểm×heSo1), tăng phòng ngự hiệu dụng theo số giai đoạn cường hóa trang bị KHIÊN/ÁO (Item_Wear[0]) × 0.005 × 2.0. Có 1 chi tiết audit cũ chưa nêu: proc này bị KHÓA nếu người chơi đang có trạng thái 'Độc Xà Xuất Động' (kiểm tra qua 检查毒蛇出洞状态(), field id665) — tương tác chéo giữa 2 khí công Tử Hào.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "DB xác nhận job=12,index=11: heSo1=1.0, heSo2=0.0 (khớp audit cũ). Gán: PlayersBes.cs UpdateKhiCong() case 12→case 11. Tiêu thụ PvE: X3_NpcClass\\NpcClass.cs (~1220-1228). Tiêu thụ PK: A8_Players_03MagicAttack.cs MagicAttack_Player (~370-378).",
    },
    {
      index: null,
      id: 662,
      ten: "Thăng Thiên 1 — Lăng kình thối lệ",
      loai: "thang_thien",
      heSo1: 1.0,
      heSo2: null,
      batBuocThangThien: 6,
      moTa:
        "SỬA heSo1 (audit cũ ghi 0.5, DB hiện tại là 1.0). Cơ chế xác nhận đúng audit cũ và ĐỐI XỨNG ở cả PK và PvE (không giống idx7/663/690): base.LangKinhToiLuyen = điểm×heSo1, roll RNG(1,100) độc lập tại A8_Players_03MagicAttack.cs MagicAttack_Player (~380-388, PK) VÀ ComputingAttack (~3107-3115, PvE), công thức giống hệt nhau. Khi proc trúng: khuếch đại 'thuộc tính vũ khí' (NangCao_ThuocTinhVuKhi=2) theo công thức num += num × (số giai đoạn cường hóa vũ khí × 0.005 × 2.0) — tăng sát thương dựa theo cấp cường hóa vũ khí đang đeo.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "DB xác nhận KhiCongID=662, job12 hợp lệ (人物职业12=1): heSo=1.0 (audit cũ ghi 0.5 — SAI). Gán: PlayersBes.cs, switch(KhiCongID thăng thiên) case 662 (~10283-10285). Tiêu thụ: A8_Players_03MagicAttack.cs (~380 PK, ~3107 PvE).",
    },
    {
      index: null,
      id: 663,
      ten: "Thăng Thiên 2 — Sát tinh quang phù",
      loai: "thang_thien",
      heSo1: 0.5,
      heSo2: null,
      batBuocThangThien: 7,
      moTa:
        "heSo1 khớp audit cũ (0.5, không đổi). LƯU Ý TÊN: field/biến thật trong code hiện tại là base.TuHao_PhaHuyenCuongPhong (comment gốc '卢_破血狂风' = 'Phá Huyết Cuồng Phong'), KHÔNG phải 'Sát tinh quang phù' như tên hiển thị audit cũ dùng — có thể tên kỹ năng đã đổi trong DB nhưng biến C# chưa đổi theo, hoặc audit cũ tra nhầm; giữ nguyên `ten` cũ vì không đủ bằng chứng tên hiển thị thật trên DB (không đọc được do lỗi mã hoá console). Về cơ chế: xác nhận đúng audit cũ — KHÔNG phải proc độc lập, mà là 1 roll RIÊNG (num70, tính trước khi biết Lưu Tinh Mãn Thiên có proc hay không) chỉ được kiểm tra BÊN TRONG nhánh Nhược Điểm Kích/Công Phá (idx10) đã trúng: nếu TuHao_PhaHuyenCuongPhong >= num70 thì nhân ×(1.85+1.0)=×2.85 thay vì ×1.85 mặc định. QUAN TRỌNG: nhánh này CHỈ tồn tại ở PK-chiêu (MagicAttack_Player) — PvE-chiêu (ComputingAttack) không có đoạn code này nên id663 KHÔNG có tác dụng gì trong PvE dù người chơi có đầu tư điểm.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "DB xác nhận KhiCongID=663, job12 hợp lệ: heSo=0.5 (khớp audit cũ). Gán: PlayersBes.cs case 663 (~10286-10288, base.TuHao_PhaHuyenCuongPhong = 10.0 + điểm×heSo — audit cũ không nêu hằng số +10.0 nền). Tiêu thụ: A8_Players_03MagicAttack.cs MagicAttack_Player (~1090-1094) — chỉ PK.",
    },
    {
      index: null,
      id: 664,
      ten: "Thăng Thiên 3 — Vân Sơn Công",
      loai: "thang_thien",
      heSo1: 0.5,
      heSo2: null,
      batBuocThangThien: 8,
      moTa:
        "SỬA heSo1 (audit cũ ghi 1.0, DB hiện tại là 0.5). Công thức đủ: base.KyQuan_QuanHung = 10.0 + điểm×heSo1 (nền 10% ngay cả khi 0 điểm — chi tiết audit cũ không nêu). Cơ chế nhánh THAY THẾ (else if) khi Nhược Điểm Kích/Công Phá KHÔNG trúng — xác nhận đúng audit cũ, nhân ×2.0 cố định khi proc riêng trúng. KHÁC BIỆT MỚI: ở PvE-chiêu (ComputingAttack), vì nhánh idx10/663 hoàn toàn vắng mặt, id664 trở thành NHÁNH DUY NHẤT còn hoạt động mỗi khi Lưu Tinh Mãn Thiên proc trong PvE — vai trò của nó ở PvE quan trọng hơn audit cũ mô tả (không chỉ là 'lựa chọn thứ 2' mà là lựa chọn KHẢ THI DUY NHẤT trong PvE).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "DB xác nhận KhiCongID=664, job12 hợp lệ: heSo=0.5 (audit cũ ghi 1.0 — SAI). Gán: PlayersBes.cs case 664 (~10289-10291). Tiêu thụ PK: A8_Players_03MagicAttack.cs MagicAttack_Player (~1101-1105). Tiêu thụ PvE: ComputingAttack (~3671-3675, nhánh duy nhất còn sống trong PvE).",
    },
    {
      index: null,
      id: 665,
      ten: "Thăng Thiên 4 — Độc xà xuất động",
      loai: "thang_thien",
      heSo1: 0.5,
      heSo2: null,
      batBuocThangThien: 9,
      moTa:
        "heSo1 khớp audit cũ. Field dùng chung 'chọn 1 trong nhiều Thăng Thiên tứ thức' của nhiều nghề (313/323/333/343/353/564/613/666 dùng field HongNguyetCuongPhong khác, còn 314/324/334/565/665 đổ chung vào ThangThien_4_DocXaXuatDong như id665 này) — xác nhận đúng audit cũ. SỬA 1 chi tiết: audit cũ mô tả 'gắn DoT độc 3 giây lên MỤC TIÊU' — đọc code thật (Players.cs ~40118-40136, hàm dùng chung không phân biệt PvE/PK) thấy trạng thái 1008001170 được gắn lên CHÍNH NGƯỜI DÙNG khí công (Playe, self-buff 3 giây), không phải lên đối thủ — nhiều khả năng đây là cờ trạng thái 'miễn nhiễm tạm thời' (khớp với việc idx9/idx11 kiểm tra 检查毒蛇出洞状态() để tự khoá proc phòng thủ khi đang có trạng thái này) chứ không phải DoT sát thương lên kẻ địch.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "DB xác nhận KhiCongID=665, job12 hợp lệ: heSo=0.5 (khớp audit cũ). Gán: PlayersBes.cs case 665 (~10292-10294). Tiêu thụ dùng chung: Players.cs (~40118-40136, hàm trigger Thăng Thiên Tứ Thức, self-buff không phải debuff).",
    },
    {
      index: null,
      id: 666,
      ten: "Thăng Thiên 4 — Hồng nguyệt cuồng phong",
      loai: "thang_thien",
      heSo1: 0.5,
      heSo2: null,
      batBuocThangThien: 9,
      moTa:
        "heSo1 khớp audit cũ. Bổ sung chi tiết hiệu ứng mà audit cũ chưa nêu: khi proc trúng (Players.cs ~40075-40117, hàm dùng chung), đây KHÔNG phải self-buff mà là buff LAN TỎA cho toàn bộ đồng minh trong phạm vi 60 tầm nhìn cùng chiến tuyến (cùng môn phái nếu đang môn chiến, cùng phe nếu đang chiến trường Tiên Ma, cùng Player_Zx nếu là PK thường) — mỗi đồng minh nhận trạng thái 1008001172 (+150 tấn công, +150 phòng ngự, 5 giây). Roll độc lập, không cộng dồn với field khác.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "DB xác nhận KhiCongID=666, job12 hợp lệ: heSo=0.5 (khớp audit cũ). Gán: PlayersBes.cs case 666 (~10295-10297). Tiêu thụ dùng chung: Players.cs (~40075-40117, buff lan toả đồng minh trong phạm vi 60).",
    },
    {
      index: null,
      id: 690,
      ten: "[Lư Phong Lang] Khí công bí cấp thư (Phá Không Trụy Tinh, Thăng Thiên 5 thức)",
      loai: "thang_thien",
      heSo1: 0.1,
      heSo2: null,
      batBuocThangThien: 10,
      moTa:
        "🟠 SỬA heSo1 mạnh (audit cũ ghi 1.0, DB hiện tại là 0.1 — giảm 10 lần, cùng đợt cân bằng với idx7/id286). Vẫn là nửa còn lại của công thức proc dùng chung với Lưu Tinh Mãn Thiên (base.LuuTinhManThien + base.ThangThien_5_PhaKhongTruyTinh, xem đầy đủ ở idx7): CỘNG THẲNG, không có Math.Min/clamp nào trong code hiện tại (khác với khẳng định 'ĐÃ SỬA bằng Math.Min(tổng,99.0)' của audit cũ — không tìm thấy đoạn code đó). Rủi ro vượt trần đã giảm nhiều nhờ heSo1 giảm 10 lần (id690) + giảm 2.5 lần (id286) cộng lại, nhưng về mặt code vẫn là phép cộng không giới hạn cứng.",
      trangThai: "CON_LOI_CHUA_SUA",
      ghiChu:
        "DB xác nhận KhiCongID=690, job12 hợp lệ: heSo=0.1 (audit cũ ghi 1.0 — SAI, lệch 10 lần). Gán: PlayersBes.cs case 690 (~10331-10333, không có 'else if Player_Job==...' riêng, không +10.0 nền, khác id663/664). Tiêu thụ: cùng 2 vị trí với idx7 (A8_Players_03MagicAttack.cs ~1083 PK, ~3667 PvE). Hạ verdict từ DA_SUA (audit cũ) xuống CON_LOI_CHUA_SUA — đồng bộ với idx7 vì đây là 1 bug/1 công thức duy nhất bị tách thành 2 dòng dữ liệu.",
    },
    {
      index: null,
      id: 581,
      ten: "Khí công bí cấp (Thăng Thiên 6 thức - Tử Hào)",
      loai: "thang_thien",
      heSo1: 0.01,
      heSo2: null,
      batBuocThangThien: 11,
      moTa:
        "SỬA heSo1 (audit cũ ghi 0.1, DB hiện tại là 0.01 — giảm 10 lần). Field base.PhanDanVoHieu (comment gốc '卢风郎反弹无效' = Lư Phong Lang phản đạn vô hiệu) — xác nhận đúng audit cũ về mặt cơ chế: giảm % sát thương phản đòn mà Tử Hào phải nhận lại khi tấn công đối thủ có kỹ năng phản sát thương. Tiêu thụ tại A8_Players_04AttackConfirmation.cs, CẢ 3 VỊ TRÍ tính sát thương phản (num2/num3/num4 -= lượng × PhanDanVoHieu). Không có điều kiện `if (Player_Job==12)` tường minh tại nơi tiêu thụ — đúng thiết kế vì field mặc định = 0 cho mọi nghề khác (chỉ case 581 trong switch KhiCongID mới gán khác 0, và chỉ Tử Hào mới có thể sở hữu KhiCongID 581 theo cột 人物职业12 trong DB), không phải thiếu sót.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "DB xác nhận KhiCongID=581, job12 hợp lệ (人物职业12=1, các cột nghề khác đều =0): heSo=0.01 (audit cũ ghi 0.1 — SAI, lệch 10 lần). Gán: PlayersBes.cs case 581 (~10475-10477). Tiêu thụ: A8_Players_04AttackConfirmation.cs (~286, ~341, ~379).",
    },
  ],
};
