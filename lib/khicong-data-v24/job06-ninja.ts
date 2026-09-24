import type { NgheData } from "../khicong-data/types";

// Đối chiếu Ver24 THẬT — đọc lại code SRCGameServerV24B hiện tại (không dùng lại audit cũ 02/09
// mà không kiểm chứng), biên soạn 15/09/2026.
//
// PHƯƠNG PHÁP: tất cả 18 mục (12 "goc" + 6 "thang_thien") đã được tái xác minh ĐỘC LẬP trong phiên
// này bằng cách đọc trực tiếp UpdateKhiCong() (PlayersBes.cs ~9423-9737, switch(Player_Job==6){
// switch(i)}), rồi grep/đọc từng field NINJA_* ở TOÀN BỘ các file hiện đang chứa logic combat
// (Players.cs đã bị TÁCH thành nhiều file partial class hôm nay: A8_Players_02PhysicalAttack.cs =
// đòn tay PvE+PK, A8_Players_03MagicAttack.cs = chiêu PvE+PK, A8_Players_04AttackConfirmation.cs,
// X3_NpcClass/NpcClass.cs = quái đánh người chơi — trích dẫn "Players.cs ~dòng" trong audit cũ hầu
// hết đã LỆCH FILE, không chỉ lệch số dòng). heSo1/heSo2 (num3/num4 trong UpdateKhiCong, cũng chính
// là giá trị trả về của 得到气功加成值(job,index,type)) được DB spot-check trực tiếp qua
// sqlcmd -S "TH\SQLEXPRESS" -U sa -P "***" -d 24pub -Q
// "SELECT FLD_PID,FLD_INDEX,FLD_JOB,FLD_每点加成比率值1,FLD_每点加成比率值2 FROM TBL_XWWL_SKILL WHERE FLD_JOB=6"
// (bảng TBL_XWWL_SKILL được nạp vào World.KhiCongTangThem lúc server start — đây là nguồn DUY NHẤT
// mà 得到气功加成值() đọc, xác nhận qua World.cs SetQG() và config.ini [PublicDb] DataName=24pub).
//
// PHÁT HIỆN LỚN (khác biệt mạnh so với audit cũ, xem ghiChu từng mục để biết chi tiết):
// 1) heSo1/heSo2 của audit cũ SAI với DB thật cho HẦU HẾT các khí công "goc" (chỉ id 72/77/78/79
//    khớp đúng) — ví dụ id70 (2.0/0.1 → thật 1.0/0.01), id73 (0.5/0.01 → thật 0.1/1.5, heSo2 KHÔNG
//    hề "chết" như audit cũ tưởng, mà là hệ số nhân sát thương +50% có thật).
// 2) id372 "Dĩ nộ hoàn nộ" và id186 "Khí trầm đan điền" bị audit cũ gán NGƯỢC index (5↔6) — DB thật:
//    id186→index5, id372→index6. Code case5→DonKhi_DanDien (khớp tên id186), case6→NINJA_DiNoHoanNo
//    (khớp tên id372) — tức code HIỆN TẠI ĐÚNG theo DB, KHÔNG có bug hoán đổi field như audit cũ mô
//    tả; bản thân mô tả cơ chế "Dĩ nộ hoàn nộ = % hồi Nộ Khí" của audit cũ cũng sai hoàn toàn — thực
//    tế đây là combo đòn tay MẠNH NHẤT của Ninja (nhân sát thương chung cuộc ×3.0, cao hơn cả Tâm
//    Thần Ngưng Tụ ×2.0).
// 3) id74 "Tâm thần ngưng tụ": heSo2 (thật 3.0, audit cũ ghi 4.1) ĐƯỢC DÙNG làm hệ số nhân sát
//    thương chính (得到气功加成值(6,3,2)) — audit cũ khẳng định nhầm là "chết, không nơi nào gọi
//    tới". Biến cấu hình World.PK_Ninja_TamThan_TranTiLe mà audit cũ mô tả là đã thêm/bật (03/09)
//    KHÔNG tồn tại ở bất kỳ đâu trong code hiện tại (đã grep toàn repo) — không có cơ sở xác nhận
//    "bản sửa" đó còn hiệu lực hay từng thực sự tồn tại đúng như mô tả.
// 4) id72 "Liên hoàn phi vũ": nhánh PK (PhysicalAttack_Player) có bug MỚI/thật — khi proc, code gán
//    THẲNG "num39 = 1.4" (thay vì nhân num39 *= 1.4 như bản PvE) — GHI ĐÈ toàn bộ công thức sát
//    thương cơ bản đã tính trước đó, khiến đòn combo này ở PK gần như KHÔNG gây sát thương thật (chỉ
//    còn nhiễu RNG ±15 và vài số hạng cộng thêm nhỏ). PvE không bị ảnh hưởng.
// 5) id684 "[Thứ khách] Khí công bí cấp thư": audit cũ kết luận CHET_HOAN_TOAN (không nơi nào đọc
//    lại field ThangThien_5_NhatChieuSatThan) — SAI. Field này được đọc tại 魔法使用() (Players.cs
//    ~40719-40724, case Player_Job==6): giảm % MP tiêu hao mỗi lần thi triển chiêu, y hệt cơ chế
//    DAIPHU_ThaiCucTamPhap (job5) / ThanNu_ThaiCucTamPhap (job13). Đổi verdict → BINH_THUONG.
export const JOB_06_NINJA_V24: NgheData = {
  job: 6,
  tenNghe: "Ninja",
  khiCong: [
    {
      index: 0,
      id: 70,
      ten: "Kinh kha chi nộ",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 0.01,
      batBuocThangThien: null,
      moTa:
        "Công thức ATK GỐC (num7 = FLD_CongKichThapNhat×num2×num3/100.0/2.0, tối thiểu 1.0 → FLD_NhanVat_KhiCong_CongKich=(int)(num7+0.5)) HOÀN TOÀN GIỐNG HỆT job1/4/8/10 (Đao/Cung/HanBaoQuan/Quyền Sư), kể cả phép chia /2.0 — xác nhận bằng 5 vị trí code giống hệt nhau trong UpdateKhiCong(). Ninja KHÔNG được ưu ái gấp đôi ATK như audit cũ khẳng định. heSo2 (0.01, không phải 0.1) chỉ dùng cho field RIÊNG base.NINJA_KinhKhaChiNo=num2×num4 — khi >0, thay thế hoàn toàn công thức hồi SP mặc định bằng SP += (int)(3.0 + Player_Level×0.5×0.01×NINJA_KinhKhaChiNo), áp dụng cả khi Ninja RA đòn tay PvE lẫn khi Ninja BỊ đánh (PvE lẫn PK).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Tái xác minh 15/09/2026, KHÔNG khớp audit cũ (heSo sai + mô tả 'không chia /2' sai). Gán: PlayersBes.cs:9692-9700 (case Player_Job=6→i=0), so khớp job1 case i=0 tại PlayersBes.cs:9468-9476 (công thức y hệt, có /100.0/2.0). Tiêu thụ SP: A8_Players_02PhysicalAttack.cs:343-345 (PvE tay, tự đánh), NpcClass.cs:1501-1506 (bị quái đánh), A8_Players_04AttackConfirmation.cs:210-212 (một luồng xác nhận đòn khác — CHƯA xác định chắc chắn đây là PK bị đánh hay luồng nào khác, cần người nắm rõ). KHÔNG tìm thấy nhánh SP-gain tương tự trong đoạn PK tự đánh (PhysicalAttack_Player, base.Player_Job==6, dòng ~1093-1105) như bản PvE có — có thể Ninja dùng chung luồng SP mặc định khi PK tự đánh, hoặc bị thiếu; CHƯA xác minh chắc chắn, cần thêm điều tra.",
    },
    {
      index: 1,
      id: 71,
      ten: "Tam hoa tụ đỉnh",
      loai: "goc",
      heSo1: 0.5,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "NINJA_TamHoaTuDinh = 10 + điểm×0.5 (heSo1 thật 0.5, không phải 0.2 như audit cũ — tối đa 45 ở 70 điểm, không phải 24). Là % NÉ TRÁNH TOÀN PHẦN khi Ninja BỊ đánh bằng đòn tay (roll RNG.Next(1,110) <= giá trị, giống hệt cả quái lẫn PK). Khi né: dame về 0, lưu incomingDame(trước khi né) × NINJA_LienTieuDaiDa(idx9) vào SatThu_DamLienTiep_SoLan để cộng vào đòn tay KẾ TIẾP của Ninja.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Tái xác minh 15/09/2026. heSo1 SAI trong audit cũ (0.2 → thật 0.5, DB TBL_XWWL_SKILL FLD_JOB=6 FLD_INDEX=1). Cơ chế đúng như audit cũ mô tả. PvE: NpcClass.cs:1347-1353. PK (Ninja là người bị đánh): A8_Players_02PhysicalAttack.cs:1752-1759 (trong PhysicalAttack_Player, nhánh value.Player_Job==6). Cả 2 cùng roll RNG.Next(1,110).",
    },
    {
      index: 2,
      id: 72,
      ten: "Liên hoàn phi vũ",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "NINJA_LienHoanPhiVu = 10 + điểm×1.0 (heSo khớp audit cũ). PvE (PhysicalAttack_Npc): roll RNG.Next(1,130) — KHÔNG phải roll(0,100) như audit cũ ghi; khi trúng chọn ngẫu nhiên 1 trong 5 kiểu hoạt ảnh combo, num9×=1.3, sau đó CÒN bị nhân thêm hệ số combo chung cuộc ×1.8 (xem khối switch(num12) cuối hàm) → tổng thực tế ≈×2.34, không phải ×2.0-2.5 trực tiếp như audit cũ suy luận (đúng ballpark nhưng sai cơ chế 2 tầng). PK (PhysicalAttack_Player): roll RNG.Next(1,120) — khớp đúng audit cũ — NHƯNG khi trúng, code KHÔNG nhân num39×=1.4 mà GÁN THẲNG 'num39 = 1.4' (dòng A8_Players_02PhysicalAttack.cs:1342), xoá sạch toàn bộ công thức sát thương cơ bản (num33-num32×0.8)×World.刺客攻击倍数+... đã tính trước đó ở dòng 1282. Kết quả: đòn combo Liên Hoàn Phi Vũ ở PK gần như KHÔNG gây sát thương thật (chỉ còn nhiễu RNG±15 + vài cộng thêm nhỏ từ idx-thang-thien-3/skill MP nếu có), dù vẫn được nhân thêm ×1.8 ở bước combo cuối (1.8× của một số gần 0 vẫn gần 0).",
      trangThai: "CON_LOI_CHUA_SUA",
      ghiChu:
        "Tái xác minh 15/09/2026 — PHÁT HIỆN BUG MỚI (không có trong audit cũ, audit cũ đánh giá BINH_THUONG cho cả 2 nhánh). Gán: PlayersBes.cs:9706-9708. PvE: A8_Players_02PhysicalAttack.cs:294,321-341 (hiệu ứng),783-806 (hệ số combo cuối). PK: A8_Players_02PhysicalAttack.cs:1276-1344 (đặc biệt dòng 1342 'num39 = 1.4'),1961-1985 (hệ số combo cuối áp lên num75 dẫn xuất từ num39). Đã dò biến num39 xuyên suốt cả hàm PhysicalAttack_Player (khai báo dòng 1119, dùng tới tận num73=RNG.Next(num39-15,num39+15) dòng 1861) để xác nhận đây thực sự là biến sát thương cuối cùng, không phải biến tạm bị ghi đè lại sau đó.",
    },
    {
      index: 3,
      id: 74,
      ten: "Tâm thần ngưng tụ",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 3.0,
      batBuocThangThien: null,
      moTa:
        "NINJA_TamThanNgungTu = 10 + điểm×1.0 (khớp heSo1 audit cũ). Là % proc đòn tay MẠNH THỨ NHÌ của Ninja (num12/num42=136, hệ số combo chung cuộc ×2.0 — thấp hơn nhánh 'Dĩ nộ hoàn nộ' id372 ×3.0). Roll RNG.Next(1,130) <= giá trị (+20 flat nếu đang có CurrentlyActiveSkill_ID khác 0/830401/840401 — CỘNG THÊM NÀY KHÔNG LIÊN QUAN idx7 'Tiên phát chế nhân' như audit cũ khẳng định, mà là một bonus trạng thái riêng, độc lập với mọi điểm đầu tư khí công). Khi trúng: num9 ×= 得到气功加成值(6,3,2) = heSo2 DB (3.0, KHÔNG phải 4.1 và KHÔNG hề 'chết' — đây chính là hệ số nhân sát thương chính của combo này). Nếu đã đầu idx4 (Trí thủ tuyệt mệnh) thì nhân thêm (1+idx4). Nhánh này KHÔNG kiểm tra idx11 (Nhất chiêu tàn sát) — idx11 chỉ được roll trong nhánh idx6 'Dĩ nộ hoàn nộ', không phải nhánh này như audit cũ mô tả (không có combo ×4.0 gắn với Tâm Thần Ngưng Tụ).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Tái xác minh 15/09/2026 — nhiều điểm KHÔNG khớp audit cũ (xem PHÁT HIỆN LỚN #3 ở đầu file). Gán: PlayersBes.cs:9709-9711. PvE: A8_Players_02PhysicalAttack.cs:296-309. PK: A8_Players_02PhysicalAttack.cs:1290-1303. Đã grep toàn bộ SRCGameServerV24B cho 'PK_Ninja_TamThan_TranTiLe' và 'TamThan'/'TranTiLe' trong World.cs — KHÔNG tìm thấy, nên không thể xác nhận claim 'ĐÃ SỬA 03/09, bật khoá lên 70' của audit cũ còn đúng hay từng đúng.",
    },
    {
      index: 4,
      id: 75,
      ten: "Trí thủ tuyệt mệnh",
      loai: "goc",
      heSo1: 0.012,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "KHÔNG phải % proc riêng — hệ số nhân THÊM khi idx3 đã proc: dame += dame×NINJA_TriThuTuyetMenh, tức dame×(1.0+giá trị). heSo1 thật 0.012 (không phải 0.02 — ở 70 điểm chỉ +84%, không phải +140% như audit cũ tính, và ngay cả với 0.02 thì 70×0.02=140% ăn khớp 80 điểm chứ không phải 70 — audit cũ có nhầm lẫn số điểm tối đa). Chỉ có tác dụng khi idx3 (Tâm thần ngưng tụ) đã proc trong cùng đòn.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Tái xác minh 15/09/2026. heSo1 SAI trong audit cũ (0.02 → thật 0.012). Cơ chế đúng. Gán: PlayersBes.cs:9712-9714. Tiêu thụ: A8_Players_02PhysicalAttack.cs:305-308 (PvE, trong nhánh idx3), 1299-1301 (PK, trong nhánh idx3).",
    },
    {
      index: 5,
      id: 186,
      ten: "Khí trầm đan điền",
      loai: "goc",
      heSo1: 0.005,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "SỬA LẠI so với audit cũ (audit cũ gán nhầm entry này vào index6 với heSo1=0.5) — DB spot-check (TBL_XWWL_SKILL, FLD_JOB=6) xác nhận id186 có FLD_INDEX=5 thật, heSo1=0.005. Field dùng chung nhiều nghề: base.DonKhi_DanDien = điểm×0.005. Tiêu thụ NGAY trong PlayersBes.cs (không qua Players.cs): nếu >0, HP += (int)(FLD_PhongNgu × DonKhi_DanDien / 100.0), và CÙNG lượng đó cộng luôn vào NhanVat_KhiCong_ThemVao_LucPhongNguVoCong (phòng ngự võ công). Ở 70 điểm: DonKhi_DanDien=0.35 → HP/phòng-ngự-võ-công bonus = 0.35% giá trị FLD_PhongNgu hiện tại.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Tái xác minh 15/09/2026 — ĐÃ SỬA LẠI index/id/heSo so với audit cũ dựa trên bằng chứng DB cụ thể (xem PHÁT HIỆN LỚN #2 đầu file). Gán: PlayersBes.cs:9715-9717 (case5 → base.DonKhi_DanDien, tên field khớp '气沉丹田'/Khí trầm đan điền = tên id186). Tiêu thụ: PlayersBes.cs:10073-10078. Field này được ~13 nghề khác dùng chung (mỗi nghề tự gán ở index riêng của mình), không phải field độc quyền Ninja.",
    },
    {
      index: 6,
      id: 372,
      ten: "Dĩ nộ hoàn nộ",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 1.5,
      batBuocThangThien: null,
      moTa:
        "SỬA LẠI so với audit cũ (audit cũ gán nhầm entry này vào index5, VÀ mô tả sai hoàn toàn cơ chế là '% hồi Nộ Khí') — DB spot-check xác nhận id372 có FLD_INDEX=6 thật, heSo2=1.5 (không phải 0.08). Thực tế đây là combo đòn tay MẠNH NHẤT của Ninja: field base.NINJA_DiNoHoanNo = điểm×1.0 là ngưỡng roll (RNG.Next(1,130), chỉ xét SAU KHI đã trượt roll idx3 Tâm thần ngưng tụ). Khi trúng: hiển thị ShowBigPrint icon 372 (đúng icon của chính khí công này — xác nhận đây thật sự là hiệu ứng của id372), num9 ×= 得到气功加成值(6,6,2) = heSo2 (1.5), sau đó nếu roll thêm trúng idx11 (Nhất chiêu tàn sát, RNG.Next(1,100) <= NINJA_NhatChieuTanSat) thì nhân thêm ×heSo2(idx11)=1.5 nữa. Cuối cùng nhánh combo này (num12/num42=134) được nhân hệ số combo chung cuộc ×3.0 — CAO NHẤT trong mọi loại đòn tay của Ninja (cao hơn cả Tâm Thần Ngưng Tụ ×2.0).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Tái xác minh 15/09/2026 — ĐÃ SỬA LẠI index/id/heSo VÀ viết lại toàn bộ moTa so với audit cũ (xem PHÁT HIỆN LỚN #2 đầu file). Gán: PlayersBes.cs:9718-9720 (case6 → base.NINJA_DiNoHoanNo, tên field khớp '以怒还怒'/Dĩ nộ hoàn nộ = tên id372) — code HIỆN TẠI tự nhất quán (tên field khớp DB, và công thức combo cũng hard-code index 6 trong 得到气功加成值(6,6,2)), KHÔNG có bug hoán đổi field case5/case6 như audit cũ khẳng định đã sửa. PvE: A8_Players_02PhysicalAttack.cs:310-320,799-804. PK: A8_Players_02PhysicalAttack.cs:1304-1314,1975-1980(khoảng).",
    },
    {
      index: 7,
      id: 76,
      ten: "Tiên phát chế nhân",
      loai: "goc",
      heSo1: 0.005,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "CHỈ 1 tác dụng thật (audit cũ mô tả 2, tác dụng thứ 2 SAI — xem ghiChu): khi mang buff tự thân 801201 (kích hoạt bởi idx10 'Kiếm nhận loạn vũ'), nhân FLD_NhanVatCoBan_TrungDich (Chính Xác) ×(1.0+NINJA_TienPhatCheNhan) — CÙNG MỘT công thức, không /100 và không /200, áp dụng GIỐNG HỆT cho cả PvE và PK (audit cũ khẳng định PK chỉ bằng nửa PvE — SAI, không tìm thấy bất kỳ phép chia khác biệt nào). heSo1 thật rất nhỏ (0.005, không phải 0.5) — chính hệ số nhỏ này khiến công thức KHÔNG cần chia /100 (ví dụ 70 điểm → hệ số 0.35 → Chính Xác ×1.35, hợp lý; nếu heSo1 thật là 0.5 như audit cũ tưởng thì 70 điểm sẽ ra ×36 — vô lý, chứng tỏ số audit cũ chắc chắn sai).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Tái xác minh 15/09/2026. heSo1 SAI trong audit cũ (0.5 → thật 0.005) — sai số ~100 lần. 'Tác dụng (2)' của audit cũ ('cộng thẳng buff vào tỉ lệ proc idx3') là NHẦM LẪN: bonus +20 vào ngưỡng roll idx3 (xem entry index3) đến từ điều kiện CurrentlyActiveSkill_ID != 0/830401/840401, HOÀN TOÀN không đọc field NINJA_TienPhatCheNhan — 2 đoạn code chỉ nằm gần nhau trong cùng khối if/else của Player_Job==6 nên audit cũ có thể đã đọc nhầm. Gán: PlayersBes.cs:9721-9723. Tiêu thụ: A8_Players_02PhysicalAttack.cs:150-153 (PvE),1101-1104 (PK).",
    },
    {
      index: 8,
      id: 77,
      ten: "Thiên chu vạn thủ",
      loai: "goc",
      heSo1: 1000.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "NINJA_ThienChuVanThu = điểm×1000.0 (khớp audit cũ). Cộng thêm mili-giây vào THỜI LƯỢNG các debuff (10000+giá trị ms mỗi debuff) mà HỆ THỐNG COMBO 'NỘ KHÍ' của Ninja (chuỗi kỹ năng dùng tài nguyên NoKhi_SoLuong, không phải đòn tay thường) áp lên đối thủ: giảm phòng ngự 7% (trạng thái #9), 1 trạng thái phụ #11, và 1 debuff chảy máu (#10) gây sát thương = dame×hệ_số (hệ số 0.5%-2% tuỳ vị trí skill-slot trong chuỗi combo, KHÔNG phải 30% cố định như audit cũ mô tả).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Tái xác minh 15/09/2026 — vị trí tiêu thụ ĐÃ CHUYỂN FILE so với audit cũ (cũ trích Players.cs ~39150 'đòn tay PvE', hiện tại KHÔNG tìm thấy field này trong file đòn tay A8_Players_02PhysicalAttack.cs; field chỉ xuất hiện trong A8_Players_03MagicAttack.cs, gắn với hệ thống combo Nộ Khí theo skill-slot, dòng ~774-849 và ~3443-3500). KHÔNG thể xác minh lại claim cụ thể của audit cũ về bug 'num4 -= (1-x) thay vì num4 *= (1-x)' tại vị trí đã trích, vì không còn tìm thấy pattern tương ứng gần field này ở vị trí mới — CẦN người nắm rõ lịch sử để đối chiếu thêm, không đủ cơ sở khẳng định bug đó còn/hết. Gán: PlayersBes.cs:9724-9726.",
    },
    {
      index: 9,
      id: 78,
      ten: "Liên tiêu đái đả",
      loai: "goc",
      heSo1: 0.01,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "NINJA_LienTieuDaiDa = điểm×0.01 (khớp audit cũ). Tỉ lệ QUY ĐỔI dame né được từ idx1 (Tam hoa tụ đỉnh) thành 'trữ lực' SatThu_DamLienTiep_SoLan = dameNéĐược × NINJA_LienTieuDaiDa (lưu ngay lúc né, PvE ở NpcClass.cs, PK ở A8_Players_02PhysicalAttack.cs). Khi Ninja RA đòn tay kế tiếp (PvE hoặc PK), cộng THÊM vào ATK cơ bản: ATK += SatThu_DamLienTiep_SoLan × 0.5 (chi tiết hệ số ×0.5 này audit cũ KHÔNG đề cập), rồi reset về 0. Vô dụng nếu không có idx1.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Tái xác minh 15/09/2026 — cơ chế cốt lõi khớp audit cũ, bổ sung chi tiết hệ số ×0.5 lúc tiêu thụ. Gán: PlayersBes.cs:9727-9729. Lưu trữ (lúc né): NpcClass.cs:1349-1353 (PvE), A8_Players_02PhysicalAttack.cs:1754-1759 (PK). Tiêu thụ (lúc đánh): A8_Players_02PhysicalAttack.cs:145-149 (PvE), 1096-1100 (PK). LƯU Ý: có 1 field HOÀN TOÀN RIÊNG BIỆT tên PhanCong_NINJA_LienTieuDaiDa (gán PlayersBes.cs:10529 = num13×num14, khác nguồn với NINJA_LienTieuDaiDa) dùng trong hệ thống 'phản công chiêu thức' (A8_Players_03MagicAttack.cs:340, num17) khi đối thủ tấn công Ninja bằng chiêu — CHƯA truy hết luồng tiêu thụ num17 phía sau do giới hạn thời gian, chỉ xác nhận nó tồn tại và được gán/đọc, không đủ cơ sở đánh giá đúng/sai.",
    },
    {
      index: 10,
      id: 79,
      ten: "Kiếm nhận loạn vũ",
      loai: "goc",
      heSo1: 3000.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "NINJA_KhoaiDaoLoanVu = điểm×3000.0 (khớp audit cũ). Cộng thẳng vào THỜI LƯỢNG buff tự thân 801201: mặc định 100000ms (100s) + NINJA_KhoaiDaoLoanVu (ms) nếu >0 (tối đa gần +210s ở 70 điểm). Lúc kích hoạt, buff đặt FLD_CongKichTocDo=150 (không phải '+200' như audit cũ diễn giải — đây là giá trị TUYỆT ĐỐI được set, không phải mức cộng thêm); lúc hết hạn, FLD_CongKichTocDo reset về 100.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Tái xác minh 15/09/2026. Gán: PlayersBes.cs:9730-9732. Tiêu thụ (kích hoạt buff): Players.cs:41626-41644. Reset lúc hết hạn: X_Them_Vao_Trang_Thai_Loai.cs:484-488. Buff 801201 là điều kiện để idx7 (Tiên phát chế nhân) cộng bonus Chính Xác.",
    },
    {
      index: 11,
      id: 73,
      ten: "Nhất chiêu tàn sát",
      loai: "goc",
      heSo1: 0.1,
      heSo2: 1.5,
      batBuocThangThien: null,
      moTa:
        "NINJA_NhatChieuTanSat = điểm×0.1 (heSo1 thật 0.1, không phải 0.5) là ngưỡng roll RIÊNG, CHỈ được kiểm tra khi idx6 'Dĩ nộ hoàn nộ' (KHÔNG phải idx3 'Tâm thần ngưng tụ' như audit cũ khẳng định) đã proc trước: roll RNG.Next(1,100) <= NINJA_NhatChieuTanSat, trúng thì num9 ×= 得到气功加成值(6,11,2) = heSo2 DB = 1.5 (KHÔNG phải 0.01 'chết/biên độ nhỏ' như audit cũ kết luận) — tức +50% sát thương THẬT, có ý nghĩa, chồng lên combo 'Dĩ nộ hoàn nộ' vốn đã nhân ×3.0 ở bước cuối.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Tái xác minh 15/09/2026 — heSo1 VÀ heSo2 đều SAI trong audit cũ, và audit cũ gắn nhầm sang nhánh idx3 thay vì idx6 (xem entry index3/index6). Gán: PlayersBes.cs:9733-9735. Tiêu thụ: A8_Players_02PhysicalAttack.cs:315-319 (PvE, trong nhánh idx6), 1309-1313 (PK, trong nhánh idx6).",
    },
    {
      index: null,
      id: 370,
      ten: "Thăng thiên 1 - Dạ ma triền thân",
      loai: "thang_thien",
      heSo1: 1.0,
      heSo2: null,
      batBuocThangThien: 6,
      moTa: "Kỹ năng phòng thủ: khi Ninja BỊ đánh bằng đòn tay (PvE quái hoặc PK), roll RNG.Next(1,110) <= NINJA_ThangThien_1_KhiCong_DaMaTrienThan, trúng thì dame ×0.7 (giảm 30%).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Tái xác minh 15/09/2026, khớp audit cũ. Gán: PlayersBes.cs:10115-10116 (khoảng, trong vòng lặp DanhSach_ThangThienKhiCong). PvE: NpcClass.cs:1354-1358. PK (Ninja bị đánh): A8_Players_02PhysicalAttack.cs:1760-1764.",
    },
    {
      index: null,
      id: 371,
      ten: "Thăng thiên 2 - Thuận thủy thôi chu",
      loai: "thang_thien",
      heSo1: 0.5,
      heSo2: null,
      batBuocThangThien: 7,
      moTa: "Khi Ninja bị đánh bằng đòn tay, roll RNG.Next(1,100) <= NINJA_ThangThien_2_ThuanThuyThoiChu, trúng thì hồi máu = 20% dame vừa nhận (tính SAU khi id370 đã giảm nếu id370 cũng trúng cùng lúc — 2 khí công độc lập, có thể cộng dồn, đúng ý đồ phòng thủ 2 lớp).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Tái xác minh 15/09/2026, khớp audit cũ. Gán: PlayersBes.cs:10118 (khoảng). PvE: NpcClass.cs:1359-1363. PK: A8_Players_02PhysicalAttack.cs:1765-1769.",
    },
    {
      index: null,
      id: 373,
      ten: "Thăng thiên 4 - Mãn nguyệt cuồng phong",
      loai: "thang_thien",
      heSo1: 0.5,
      heSo2: null,
      batBuocThangThien: 9,
      moTa:
        "Đã tái xác minh độc lập 15/09/2026 (không copy audit cũ). DB xác nhận job6 hợp lệ duy nhất (人物职业6=1), heSo1=0.5. Field base.ThangThien_4_ManNguyetCuongPhong CŨNG được nhiều nghề khác ghi vào qua KhiCongID riêng của họ (vd id353 của Đại Phu) — cùng 1 field vật lý dùng chung, giống mô hình Trí Tàn/Tinh Kim Bách Luyện nhưng KHÔNG có mặt trong shared.ts. " +
        "Kích hoạt ở CẢ 4 nhánh (PvE tay/chiêu qua 组队升天四气功触发(this), PK tay/chiêu qua 升天四气功触发(đối phương)) — điều kiện: Player_Level>=140, Player_Job_Level>=9, roll new Random().Next(1,101) < field. Khi trúng VÀ đang ở trong tổ đội (TeamID!=0): toàn đội trong bán kính (World.群体辅助组队范围 ở nhánh PK, literal 300 ở nhánh PvE/team) được cấp trạng thái 700014 (Nộ Khí) + cờ NoKhi=true, cộng ThemVaoTiLePhanTram_ManYue_CongKich=0.25 và ...PhongNgu=0.25 (tức +25%/+25% công-thủ, 5 giây) — trạng thái 700014 đã được xác nhận có tác dụng thật ở nghiên cứu id387 (Đại Phu) cùng phiên này. Nếu KHÔNG ở trong tổ đội, cả 4 nhánh đều không làm gì (không tự buff bản thân) — người chơi solo đầu tư điểm vào khí công này hoàn toàn vô dụng.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case 373 (~10120-10122). Tiêu thụ: Players.cs::升天四气功触发() dòng ~40139 (PK, gọi từ A8_Players_02PhysicalAttack.cs:1860 tay / A8_Players_03MagicAttack.cs:1411 chiêu) và Players.cs::组队升天四气功触发() dòng ~40454 (PvE, gọi từ A8_Players_02PhysicalAttack.cs:107 tay / A8_Players_03MagicAttack.cs:3227 chiêu). BINH_THUONG đúng cho người chơi có tổ đội; vô dụng khi solo (không phải bug, chỉ là thiết kế 'buff đội').",
    },
    {
      index: null,
      id: 374,
      ten: "Thăng thiên 4 - Liệt nhật viêm viêm",
      loai: "thang_thien",
      heSo1: 0.5,
      heSo2: null,
      batBuocThangThien: 9,
      moTa:
        "Đã tái xác minh độc lập 15/09/2026 (không copy audit cũ). DB xác nhận job6 hợp lệ duy nhất (人物职业6=1), heSo1=0.5. Field base.ThangThien_4_LietNhatViemViem CHỈ được kiểm tra ở Players.cs::升天四气功触发() (PK-only — hàm này chỉ được gọi từ 2 vị trí PK: A8_Players_02PhysicalAttack.cs:1860 tay, A8_Players_03MagicAttack.cs:1411 chiêu; KHÔNG tồn tại trong 组队升天四气功触发() nên PvE không kích hoạt được). Khi roll trúng (cùng roll dùng chung new Random().Next(1,101) với id373, không roll riêng), phải vượt qua 2 lớp kháng của ĐỐI PHƯƠNG trước (RNG≤THANNU_ChongLaiThanPhap rồi RNG≤KIEM_BachDocBatXam) mới thật sự gắn trạng thái 1008001169 lên đối phương (3-5s). " +
        "PHÁT HIỆN MỚI: trạng thái 1008001169 KHÔNG có bất kỳ hiệu ứng giảm chỉ số/khống chế nào trong toàn bộ codebase — đã grep toàn repo, chỉ có 3 loại chỗ dùng: (1) TryAdd lúc gán, (2) hàm 检查烈日炎炎状态()=GetAddState(1008001169) dùng làm cờ chặn tự trúng lại lần 2 trong lúc đang có hiệu lực, (3) case 1008001169 trong X_Them_Vao_Trang_Thai_Loai.cs lúc hết hạn CHỈ xoá khỏi danh sách + cập nhật broadcast, không trừ bất kỳ chỉ số nào. Không có công thức phòng ngự/né tránh/sát thương nào ở bất kỳ đâu đọc trạng thái này để áp dụng giảm trừ — GIỐNG HỆT mô hình 'khí công chết' của Trí Tàn (id615/shared.ts): có đủ code gán + tiêu thụ + gắn trạng thái, nhưng trạng thái đó là cờ rỗng, không có tác dụng gameplay thật. Audit cũ mô tả 'debuff giảm phòng ngự đối thủ' — SAI, không tìm thấy cơ chế giảm phòng ngự nào gắn với trạng thái này.",
      trangThai: "CHET_HOAN_TOAN",
      ghiChu:
        "Gán: PlayersBes.cs case 374 (~10123-10125). Tiêu thụ (chỉ gắn cờ, không có hiệu ứng thật): Players.cs::升天四气功触发() dòng ~40053-40074. Trạng thái 1008001169 hết hạn: X_Them_Vao_Trang_Thai_Loai.cs case 1008001169 (chỉ TryRemove, không trừ chỉ số). Đảo verdict từ BINH_THUONG (audit 02/09 cũ) → CHET_HOAN_TOAN sau khi tái xác minh độc lập 15/09/2026 — đã grep toàn bộ repo cho '1008001169', không tìm thấy nơi nào đọc trạng thái này để tính sát thương/phòng ngự.",
    },
    {
      index: null,
      id: 575,
      ten: "Khí công bí cấp (Thăng Thiên 6 thức - Ninja)",
      loai: "thang_thien",
      heSo1: 0.1,
      heSo2: null,
      batBuocThangThien: 11,
      moTa:
        "Passive, không roll. base.NINJA_NoiCuong_NgoaiCuong = điểm×0.1, ngay sau đó cộng thẳng vào HP: NhanVat_KhiCong_ThemVao_HP += (int)((FLD_PhongNgu+FLD_TrangBi_ThemVao_PhongNgu) × NINJA_NoiCuong_NgoaiCuong) — cả gán lẫn tiêu thụ nằm gọn trong cùng 1 chỗ ở PlayersBes.cs, không cần đọc field ở Players.cs.",
      trangThai: "BINH_THUONG",
      ghiChu: "Tái xác minh 15/09/2026, khớp audit cũ. PlayersBes.cs:10456-10459 (case575, cả gán và tiêu thụ).",
    },
    {
      index: null,
      id: 684,
      ten: "[Thứ khách] Khí công bí cấp thư (Nhất chiêu sát thần, Thăng Thiên 5 thức)",
      loai: "thang_thien",
      heSo1: 0.01,
      heSo2: null,
      batBuocThangThien: 10,
      moTa:
        "Field base.ThangThien_5_NhatChieuSatThan = điểm×0.01, ultimate bậc 10 riêng của Ninja. Được ĐỌC LẠI tại hàm 魔法使用(double mp) (dùng để trừ MP mỗi lần thi triển chiêu/skill), case Player_Job==6: mp -= mp × (ThangThien_5_NhatChieuSatThan × 0.01) — tức GIẢM % MP TIÊU HAO mỗi lần dùng chiêu, cùng khuôn mẫu với DAIPHU_ThaiCucTamPhap (job5, case5 cùng hàm) và ThanNu_ThaiCucTamPhap (job13, case13). Khí công này HOẠT ĐỘNG, không hề chết.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Tái xác minh 15/09/2026 — ĐẢO NGƯỢC verdict so với audit cũ (audit cũ ghi CHET_HOAN_TOAN, khẳng định 'không có bất kỳ dòng nào trong Players.cs/NpcClass.cs đọc lại field này' — SAI, xem PHÁT HIỆN LỚN #5 đầu file). Gán: PlayersBes.cs:10313-10315 (case684). Reset: PlayersBes.cs:6940. Tiêu thụ: Players.cs:40706-40725 (hàm 魔法使用, case 6, dòng 40719-40724).",
    },
  ],
};
