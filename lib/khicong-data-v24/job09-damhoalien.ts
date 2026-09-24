import type { NgheData } from "../khicong-data/types";

// Đối chiếu Ver24 THẬT — đọc lại code SRCGameServerV24B hiện tại (không dùng lại audit cũ 02/09
// mà không kiểm chứng), biên soạn 15/09/2026.
//
// GHI CHÚ QUAN TRỌNG VỀ KIẾN TRÚC CODE (khác giả định ban đầu):
// - UpdateKhiCong() (PlayersBes.cs ~9423) KHÔNG switch theo KhiCongID. Khí công "gốc" (loai:"goc")
//   được switch theo (Player_Job, slot index i 0-11) — case <index>: nằm trong switch(i) lồng trong
//   switch(Player_Job){ case 9: ... }, quanh dòng ~9838-9878. "index" trong file này MỚI LÀ khoá định vị
//   code thật sự, "id" (KhiCongID = cột FLD_PID bảng TBL_XWWL_SKILL) chỉ là nhãn tham chiếu DB/hiển thị.
// - Khí công "thăng thiên" (loai:"thang_thien") DÙNG switch(KhiCongID) thật (case 321/322/578/687/700/701/702),
//   nằm ở một switch RIÊNG trong cùng UpdateKhiCong(), quanh dòng ~10190-10480 (không phải ~8600-8900 như
//   audit cũ trích — toàn bộ số dòng cũ đã lệch do session hôm nay refactor).
// - Code tiêu thụ (combat) đã bị tách khỏi Players.cs (71995 dòng, nay chỉ còn vài field dùng-chung như
//   CuongPhong_VanPha, ThangThien_4_TruongHongQuanThien/AiHongBienDa) sang 4 file mới:
//   Players/A8_Players_01SystemAttack.cs, A8_Players_02PhysicalAttack.cs, A8_Players_03MagicAttack.cs,
//   A8_Players_04AttackConfirmation.cs (partial class Players) — có bản .backup-before-autohop-port xác
//   nhận đây là refactor tách file thuần, KHÔNG đổi logic bên trong. Một số proc phòng thủ khi bị QUÁI vật
//   (không phải người chơi) tấn công nằm ở X3_NpcClass/NpcClass.cs. Cờ tạm dùng chung khi hết hạn buff nằm ở
//   X_Them_Vao_Trang_Thai_Loai.cs.
// - Đã spot-check DB thật (sqlcmd 24pub) bảng TBL_XWWL_SKILL (khí công gốc, cột FLD_JOB/FLD_INDEX/FLD_PID/
//   FLD_每点加成比率值1/2) và bảng 升天气功 (khí công thăng thiên, cột 气功ID/人物职业9/FLD_每点加成比率值).
//   -> heSo1/heSo2 bên dưới là giá trị THẬT hiện đang nằm trong DB 24pub cho job=9, ĐÃ CẬP NHẬT so với file
//   audit cũ (heSo1/heSo2 không nằm trong danh sách field "giữ nguyên" theo yêu cầu công việc). Gần như mọi
//   heSo1 của khối "goc" đều lệch so với audit cũ — đây rất có thể là DRIFT thật giữa Ver24 hiện tại và
//   baseline V22 mà audit cũ mô tả, đúng trọng tâm của công cụ so sánh Ver22↔Ver24.
export const JOB_09_DAM_HOA_LIEN_V24: NgheData = {
  job: 9,
  tenNghe: "Đàm Hoa Liên",
  khiCong: [
    {
      index: 0,
      id: 270,
      ten: "Trường hồng quán nhật",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Cộng thẳng (flat) vào FLD_NhanVatCoBan_CongKich — field FLD_NhanVat_KhiCong_CongKich được cộng " +
        "trực tiếp cùng vũ khí/trang bị TRƯỚC khi nhân hệ số %% tấn công (PlayersBes.cs getter dòng 2179). " +
        "Công thức tại slot job9 CHỈ là 'num2' (điểm đầu tư đã quy đổi), KHÔNG nhân thêm hệ số DB (num3) như " +
        "Kiếm/Cầm Sư (họ dùng 'num2*num3'). Hiện tại vô hại vì heSo1 DB = 1.0 (num3≈1.0 nên num2*1.0=num2), " +
        "nhưng là một bất nhất cấu trúc: nếu Admin chỉnh heSo1 job9/index0 trong DB khác 1.0, job9 sẽ KHÔNG " +
        "phản ứng gì (luôn dùng num2 trần), khác mọi nghề khác cùng mẫu công thức.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case Player_Job==9 trong UpdateKhiCong(), switch(i) case 0, dòng 9842 (thiếu '* num3' " +
        "so với job2 dòng 9519 / job7 dòng 9742 cùng mẫu). Tiêu thụ: PlayersBes.cs dòng 2179. DB xác nhận " +
        "TBL_XWWL_SKILL FLD_JOB=9 FLD_INDEX=0 FLD_PID=270: hệ số1=1.0, hệ số2=0.0 (khớp audit cũ).",
    },
    {
      index: 1,
      id: 271,
      ten: "Bách biến thần hành",
      loai: "goc",
      heSo1: 0.01,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "FLD_NhanVat_ThemVaoTiLePhanTram_NeTranh = 0.1 (nền cứng trong code) + num2*num3. Field né tránh dùng " +
        "chung toàn engine, không đổi về cơ chế so với audit cũ.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case9 idx1, dòng 9845. DB TBL_XWWL_SKILL FLD_INDEX=1 FLD_PID=271: hệ số1=0.01 " +
        "(audit cũ ghi 0.1 — SAI 10 lần, đã sửa theo DB thật). hệ số2=0.0 khớp.",
    },
    {
      index: 2,
      id: 272,
      ten: "Tân _ liên hoàn phi vũ",
      loai: "goc",
      heSo1: 0.005,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "PHÁT HIỆN LỚN — KHÔNG 'chết' như audit cũ khẳng định. Field mà audit cũ nêu ('DamHoaLien_LienHoanPhiVu') " +
        "KHÔNG TỒN TẠI trong code hiện tại — grep toàn repo chỉ thấy LienHoanPhiVu cho Đao/Kiếm/Thương/Ninja, " +
        "không có bản Đàm Hoa Liên. Slot index2 job9 THẬT SỰ gán: NhanVat_KhiCong_ThemVao_TiLePhanTram_MP = " +
        "0.05 + num2*num3 — một field dùng chung engine-wide (cũng được job13/Thần Nữ ghi ở slot khác). Field " +
        "này được CharacterMax_MP đọc HAI LẦN trong cùng công thức (PlayersBes.cs dòng 2313): vừa cộng thẳng " +
        "(flat) vào tổng trước nhân, vừa cộng lại vào chính hệ số nhân %% — một đặc điểm kỳ lạ nhưng có thật của " +
        "công thức MP tối đa dùng chung toàn engine (không riêng job9). Tên hiển thị 'Liên hoàn phi vũ' hoàn " +
        "toàn không khớp với hiệu ứng thật (tăng MP tối đa) — không đọc được FLD_NAME thật từ DB do lỗi mã hoá " +
        "console (GBK/UTF-8) khi query, nên không thể xác nhận tên client hiện tại có đúng là 'Tân liên hoàn " +
        "phi vũ' hay đã đổi.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case9 idx2, dòng 9848. Tiêu thụ: PlayersBes.cs dòng 2313 (CharacterMax_MP), field " +
        "cũng được job13 ghi ở case 4 dòng 10046. DB FLD_INDEX=2 FLD_PID=272: hệ số1=0.005 (audit cũ ghi 1.5 — " +
        "SAI ~300 lần). SỬA TRẠNG THÁI: CHET_HOAN_TOAN (audit cũ) -> BINH_THUONG (field sống, có tiêu thụ thật).",
    },
    {
      index: 3,
      id: 273,
      ten: "Chiêu thức tân pháp",
      loai: "goc",
      heSo1: 0.2,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Gán: base.DamHoaLien_ChieuThucTanPhap = num2*num3 — KHÔNG còn dấu vết bug '×1000' mà audit cũ mô tả " +
        "(bug đã được sửa từ trước, kể cả bản .backup-before-autohop-port hôm nay cũng đã sạch); phần DA_SUA " +
        "của audit cũ vẫn đứng vững cho khía cạnh GÁN GIÁ TRỊ. TUY NHIÊN toàn bộ câu chuyện TIÊU THỤ trong " +
        "audit cũ (điều khiển thời lượng đóng băng combo 'Hấp Hồn Đại Pháp' VoCong 2000401) KHÔNG khớp code " +
        "hiện tại: grep toàn repo cho thấy field DamHoaLien_ChieuThucTanPhap chỉ có ĐÚNG 1 nơi tiêu thụ — " +
        "A8_Players_01SystemAttack.cs dòng 1053, là một roll combo-chain PK: RNG.Next(1,120) so với ngưỡng = " +
        "DamHoaLien_ChieuThucTanPhap + DamHoaLien_TungHoanhVoSong (id277, xem mục đó), có cộng thêm giá trị " +
        "'PhanCong_DamHoaLien_...' đọc từ đối tượng bị tấn công (hệ thống 'Phản chế khí công' riêng, không nằm " +
        "trong 12 slot job9). Trúng roll thì roll phụ RNG(2,6) chọn 1 trong 2 hiệu ứng theo sau đòn tiếp theo: " +
        "'Lưu Chuyển Thiên Địa' (khi num4>2) hoặc 'Bước Thu Nhỏ Ảnh' (còn lại), áp dụng tại " +
        "A8_Players_03MagicAttack.cs dòng 997-1004. Về VoCong 2000401 (Hấp Hồn Đại Pháp) tìm được ĐÚNG 1 nơi " +
        "check '武功ID==2000401' (A8_Players_03MagicAttack.cs dòng 3606-3613, chỉ áp dụng khi đánh QUÁI, PvE): " +
        "gắn trạng thái khoá 8 (không di chuyển) với thời lượng HARD-CODE 4000.0ms — hoàn toàn KHÔNG phụ thuộc " +
        "DamHoaLien_ChieuThucTanPhap hay bất kỳ điểm đầu tư nào (không phải 3000ms như audit cũ xác nhận, và " +
        "không có bản PK song song).",
      trangThai: "DA_SUA",
      ghiChu:
        "Gán: PlayersBes.cs case9 idx3, dòng 9851 (sạch, không ×1000). Tiêu thụ thật: " +
        "A8_Players_01SystemAttack.cs:1053 (combo-chain, không phải freeze). Freeze VoCong 2000401: " +
        "A8_Players_03MagicAttack.cs:3606-3613 (hard-code 4000ms, PvE-only, độc lập điểm đầu tư). DB FLD_INDEX=3 " +
        "FLD_PID=273: hệ số1=0.2 (khớp audit cũ), hệ số2=0.0. GHI CHÚ MÂU THUẪN: mô tả DA_SUA của audit cũ nói " +
        "về đúng field/case này nhưng gán sai cơ chế tiêu thụ (freeze thay vì combo-chain) — có thể audit cũ " +
        "đang mô tả version code cũ hơn đã bị thay thế.",
    },
    {
      index: 4,
      id: 274,
      ten: "Cuồng phong vạn phá",
      loai: "goc",
      heSo1: 3000.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "base.CuongPhong_VanPha = num2*num3 (không dùng num4/heSo2 ở nhánh job9 — công thức chỉ có 1 số hạng). " +
        "Kéo dài thời gian buff Nộ Khí (ms), field dùng chung nhiều nghề, tiêu thụ tại Players.cs:61867 " +
        "('10000 + (int)CuongPhong_VanPha'). Không đổi cơ chế so với audit cũ, chỉ chỉnh lại heSo2.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case9 idx4, dòng 9854. Tiêu thụ: Players.cs dòng 61867 (vẫn còn trong Players.cs " +
        "gốc, KHÔNG bị tách ra A8_*). DB FLD_INDEX=4 FLD_PID=274: hệ số1=3000.0 (khớp), hệ số2=0.0 (audit cũ ghi " +
        "0.05 — SAI, case job9 không hề dùng num4 nên hệ số2 thực chất không được áp dụng).",
    },
    {
      index: 5,
      id: 275,
      ten: "Hộ thân cương khí",
      loai: "goc",
      heSo1: 0.5,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "CẢNH BÁO ĐỐI CHIẾU INDEX: theo code+DB hiện tại, slot switch(i) case 5 của job9 gán " +
        "base.DonKhi_DanDien (= 'Khí trầm đan điền', công thức HP/DEF phổ quát), KHÔNG PHẢI HoThan_CuongKhi. " +
        "DB TBL_XWWL_SKILL xác nhận FLD_PID=275 ('Hộ thân cương khí') nằm ở FLD_INDEX=6, còn FLD_PID=189 " +
        "('Khí trầm đan điền') nằm ở FLD_INDEX=5 — NGƯỢC với thứ tự index/id trong file audit cũ (file cũ để " +
        "id275 ở index5, id189 ở index6). Code hiện tại NỘI BỘ NHẤT QUÁN (tên field 189='Khí trầm đan điền' " +
        "khớp đúng công thức tại index5 nó nằm) — đây có vẻ là audit cũ ghi index sai, không phải bug Ver24. " +
        "Theo yêu cầu công việc, KHÔNG tự đổi index/id/ten trong file này — chỉ flag tại đây và trong báo cáo. " +
        "Mô tả công thức THẬT đang chạy ở index5 (dù entry này mang id275/ten 'Hộ thân cương khí'): " +
        "num10 = FLD_PhongNgu * DonKhi_DanDien / 100, cộng vào cả NhanVat_KhiCong_ThemVao_HP và " +
        "NhanVat_KhiCong_ThemVao_LucPhongNguVoCong — buff HP + phòng ngự võ công, tính ngay sau switch(Player_Job) " +
        "trong UpdateKhiCong (áp dụng chung mọi nghề, không riêng slot job9).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case9 idx5, dòng 9857 ('DonKhi_DanDien'). Tiêu thụ chung mọi nghề: PlayersBes.cs " +
        "dòng 10073-10078. DB FLD_INDEX=5 FLD_PID=189 (không phải 275!): hệ số1=0.005, hệ số2=0.0. Nếu áp cho " +
        "đúng field DonKhi_DanDien: audit cũ ghi 0.5 ở 'slot index6/id189' — SAI theo cả index lẫn giá trị so " +
        "với DB (đúng phải là 0.005 tại index5). heSo1/heSo2 trong entry NÀY (0.5/0.0) giữ nguyên số của audit " +
        "cũ cho ten='Hộ thân cương khí' — xem thêm entry index6 bên dưới để đối chiếu chéo.",
    },
    {
      index: 6,
      id: 189,
      ten: "Khí trầm đan điền",
      loai: "goc",
      heSo1: 0.005,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "CẢNH BÁO ĐỐI CHIẾU INDEX (xem chi tiết đầy đủ ở entry index5 phía trên — cùng một cặp hoán đổi). " +
        "Theo code+DB hiện tại, slot switch(i) case 6 của job9 thật ra gán base.DamHoaLien_HoThan_CuongKhi " +
        "(='Hộ thân cương khí'), KHÔNG PHẢI DonKhi_DanDien/'Khí trầm đan điền'. DB xác nhận FLD_PID=189 nằm ở " +
        "FLD_INDEX=5, không phải 6. Mô tả công thức THẬT đang chạy ở index6 (dù entry này mang id189/ten " +
        "'Khí trầm đan điền'): base.DamHoaLien_HoThan_CuongKhi = 10.0 + num2*num3; khi bị tấn công, roll RNG " +
        "(mẫu số 100) <= giá trị này thì SÁT THƯƠNG NHẬN VÀO bị nhân 0.5 (giảm 50%%) — có ở CẢ 3 nguồn sát " +
        "thương: PK đòn tay (A8_Players_02PhysicalAttack.cs:1773-1777), PK chiêu " +
        "(A8_Players_03MagicAttack.cs:1293-1297), và khi bị QUÁI vật tấn công (NpcClass.cs:1369).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case9 idx6, dòng 9860 ('DamHoaLien_HoThan_CuongKhi'). DB FLD_INDEX=6 FLD_PID=275 " +
        "(không phải 189!): hệ số1=0.5, hệ số2=0.0. Nếu áp cho đúng field HoThan_CuongKhi: audit cũ ghi 0.4 ở " +
        "'slot index5/id275' — SAI theo cả index lẫn giá trị so với DB (đúng phải là 0.5 tại index6). " +
        "heSo1/heSo2 trong entry NÀY (0.005/0.0) giữ nguyên số của audit cũ cho ten='Khí trầm đan điền'.",
    },
    {
      index: 7,
      id: 276,
      ten: "Di hoa tiếp mộc",
      loai: "goc",
      heSo1: 0.4,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "base.DamHoaLien_DiHoa_TiepMoc = num2*num3. Khi bị tấn công trúng roll (mẫu số 100), hồi máu bằng 50%% " +
        "lượng sát thương vừa nhận ('加血((int)(num*0.5))') — xác nhận ở cả 4 nguồn: PvE tay, PvE chiêu, PK tay, " +
        "PK chiêu. Không đổi cơ chế so với audit cũ, chỉ chỉnh lại heSo1.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case9 idx7, dòng 9863. Tiêu thụ: A8_Players_02PhysicalAttack.cs:767-771 (PvE), " +
        "1909-1913 (PK); A8_Players_03MagicAttack.cs:1451-1454 (PK chiêu biến thể), 3759-3763 (PK chiêu). DB " +
        "FLD_INDEX=7 FLD_PID=276: hệ số1=0.4 (audit cũ ghi 1.0 — SAI, đã sửa theo DB thật), hệ số2=0.0 (khớp).",
    },
    {
      index: 8,
      id: 277,
      ten: "Tung hoành vô song",
      loai: "goc",
      heSo1: 0.4,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "base.DamHoaLien_TungHoanhVoSong = 5.0 + num2*num3. Không tự có công thức roll riêng — giá trị của field " +
        "này CỘNG TRỰC TIẾP vào ngưỡng roll combo-chain của id273 (xem mô tả đầy đủ ở entry index3): ngưỡng " +
        "tổng = DamHoaLien_ChieuThucTanPhap + DamHoaLien_TungHoanhVoSong, so với RNG.Next(1,120). Mô tả cũ ('2 " +
        "nhánh roll độc lập') không hoàn toàn khớp: thực tế là 1 roll chính (ngưỡng gộp 2 field), phân nhánh " +
        "bằng 1 roll phụ RNG(2,6) để chọn hiệu ứng theo sau.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case9 idx8, dòng 9866. Tiêu thụ: A8_Players_01SystemAttack.cs:1030-1069 (roll chính, " +
        "dòng 1053); A8_Players_03MagicAttack.cs:990-1004 (áp trạng thái theo sau). DB FLD_INDEX=8 FLD_PID=277: " +
        "hệ số1=0.4 (audit cũ ghi 0.3 — SAI, đã sửa), hệ số2=0.0.",
    },
    {
      index: 9,
      id: 278,
      ten: "Hồi liễu thân pháp",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 0.006,
      batBuocThangThien: null,
      moTa:
        "SỬA MÔ TẢ — Slot 1 KHÔNG PHẢI 'proc hồi máu' như audit cũ ghi. base.DamHoaLien_HoiLieu_ThanPhap = " +
        "num2*num3; khi bị tấn công và roll (mẫu số 110) trúng, sát thương đòn đó bị NÉ/CHẶN HOÀN TOÀN (num48=0, " +
        "flag=true — y hệt cơ chế 'Hồi Liễu Thân Pháp' của Kiếm/job2 dùng chung code path, không phải hồi máu). " +
        "Nếu attacker là job2/job9 và đạt điều kiện hôn nhân+combo riêng, còn cộng dồn vào " +
        "NeTranh_SucManhTanCong_TichLuy (dùng hệ số của id321 — Thiên Địa Đồng Thọ — không phải hệ số của chính " +
        "field này). Slot 2 (FLD_NhanVat_KhiCong_LucCongKichVoCongGiaTang_TiLePhanTram = num2*num4) đúng như " +
        "audit cũ: cộng %% sát thương chiêu (CLVC) vào công thức tấn công chiêu chung toàn engine, xác nhận tại " +
        "A8_Players_03MagicAttack.cs dòng 3208.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case9 idx9, dòng 9869-9870 (2 field). Tiêu thụ slot1 (né/chặn dame): " +
        "A8_Players_03MagicAttack.cs:1298-1324. Tiêu thụ slot2 (%CLVC): A8_Players_03MagicAttack.cs:3208 (đọc), " +
        "3261 (+0.3 tạm thời từ hiệu ứng khác). DB FLD_INDEX=9 FLD_PID=278: hệ số1=1.0 (audit cũ ghi 0.6 — SAI, " +
        "đã sửa), hệ số2=0.006 (khớp audit cũ).",
    },
    {
      index: 10,
      id: 279,
      ten: "Nộ hải cuồng lan",
      loai: "goc",
      heSo1: 0.5,
      heSo2: 1.35,
      batBuocThangThien: null,
      moTa:
        "base.DamHoaLien_NoHai_CuongLan = 5.0 + num2*num3. Proc nhân sát thương đòn/chiêu lên " +
        "得到气功加成值(9,10,2) (hệ số2 mỗi điểm, tách biệt khỏi hệ số1 điều khiển tỉ lệ trúng) — xác nhận ở 4 " +
        "nguồn (PvE tay, PvE chiêu, PK tay, PK chiêu). PHÁT HIỆN THÊM (không có trong audit cũ): tại 1 trong 2 " +
        "vị trí PK đòn tay (A8_Players_02PhysicalAttack.cs:1449-1454), nếu người chơi đang ở trạng thái " +
        "'检查毒蛇出洞状态' (kiểm tra Độc Xà Xuất Động — trạng thái thăng thiên 4 của nghề khác), roll bị NHÂN " +
        "×1000 trước khi so sánh — khiến proc gần như KHÔNG THỂ trúng trong lúc trạng thái đó tồn tại (một dạng " +
        "vô hiệu hoá có điều kiện chưa từng được ghi nhận).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case9 idx10, dòng 9873. Tiêu thụ: A8_Players_02PhysicalAttack.cs:453-457 (PvE tay), " +
        "1449-1457 (PK tay, có nhân ×1000 khi Độc Xà Xuất Động); A8_Players_03MagicAttack.cs:990-996 (PvE " +
        "chiêu), 3604-3619 (PK chiêu). DB FLD_INDEX=10 FLD_PID=279: hệ số1=0.5 (audit cũ ghi 0.4 — SAI), hệ " +
        "số2=1.35 (audit cũ ghi 1.2 — SAI); cả hai đã sửa theo DB thật.",
    },
    {
      index: 11,
      id: 280,
      ten: "Trùng quan nhất nộ",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "base.DamHoaLien_TrungQuan_NhatNo = 5.0 + num2*num3. Khi bị tấn công, roll (mẫu số 110, có điều kiện " +
        "!NoKhi) trúng thì cộng Nộ Khí (SP) bằng SP hiện tại × giá trị field × 0.005 — xác nhận ở 4 nguồn (PvE " +
        "tay, PvE chiêu, PK tay, PK chiêu), luôn đi kèm proc DiHoa_TiepMoc (id276) trong cùng khối if. Không đổi " +
        "cơ chế so với audit cũ, nhưng heSo1 lệch RẤT LỚN so với DB thật (drift đáng chú ý nhất trong toàn bộ " +
        "khối 'goc' — gần gấp 3 lần giá trị audit cũ).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case9 idx11, dòng 9876. Tiêu thụ: A8_Players_02PhysicalAttack.cs:760-766 (PvE), " +
        "1902-1908 (PK); A8_Players_03MagicAttack.cs:1444-1450 (PvE chiêu biến thể), 3752-3758 (PK chiêu). DB " +
        "FLD_INDEX=11 FLD_PID=280: hệ số1=1.0 (audit cũ ghi 0.35 — SAI ~3 lần, đã sửa theo DB thật), hệ số2=0.0.",
    },
    {
      index: null,
      id: 321,
      ten: "Thăng thiên 2 - Thiên địa đồng thọ",
      loai: "thang_thien",
      heSo1: 0.005,
      heSo2: null,
      batBuocThangThien: 7,
      moTa:
        "SỬA MÔ TẢ CƠ CHẾ: audit cũ nói field mang tiền tố 'KIEM_' (di sản Kiếm) nhưng job9 vẫn hưởng đúng nhờ " +
        "điều kiện tiêu thụ (Player_Job==2||9). Đọc lại code hiện tại: KHÔNG ĐÚNG — case 321 có nhánh " +
        "if/else if TÁCH RIÊNG theo job ngay từ lúc GÁN: base.DamHoaLien_ThangThien_2_KhiCong_ThienDiaDongTho " +
        "(field ĐÚNG tên, không dùng field KIEM_) khi Player_Job==9. Không có hiện tượng field bị đặt tên nhầm " +
        "trong Ver24 hiện tại. Cơ chế tiêu thụ: cộng dồn vào NeTranh_SucManhTanCong_TichLuy (dùng chung với " +
        "field tương ứng của Kiếm) mỗi khi né 1 đòn nhất định, tối đa 3 lần trước khi reset — kết luận cuối " +
        "(job9 hưởng đúng) vẫn giống audit cũ, chỉ khác cơ chế kỹ thuật mô tả.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case 321, nhánh 'else if (Player_Job==9)', dòng 10213-10216 (switch(KhiCongID) " +
        "riêng cho thăng thiên, ~dòng 10190-10480, KHÔNG PHẢI ~8674 như audit cũ trích). Tiêu thụ: " +
        "A8_Players_03MagicAttack.cs:1196-1199, 1273-1276, 1308-1311. DB [升天气功] 气功ID=321: hệ số=0.005 " +
        "(khớp audit cũ).",
    },
    {
      index: null,
      id: 322,
      ten: "Thăng thiên 3 - Hỏa phượng lâm triêu",
      loai: "thang_thien",
      heSo1: 0.5,
      heSo2: null,
      batBuocThangThien: 8,
      moTa:
        "base.DamHoaLien_ThangThien_3_KhiCong_HoaPhuongLamTrieu = num11*num12, gán riêng nhánh job9 (case 322, " +
        "if/else theo job, cùng cấu trúc case 321). Khi HP<=0, roll (mẫu số 100) trúng thì hồi sinh tại chỗ với " +
        "10 HP — xác nhận ở cả bối cảnh PK (bị người chơi khác hạ) lẫn PvE (bị quái hạ). Không đổi cơ chế so với " +
        "audit cũ.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case 322, nhánh job9, dòng 10223-10226. Tiêu thụ: " +
        "A8_Players_04AttackConfirmation.cs:406-409 (PK); NpcClass.cs (nhánh tương tự khi quái gây sát thương " +
        "chí mạng). DB [升天气功] 气功ID=322: hệ số=0.5 (khớp audit cũ).",
    },
    {
      index: null,
      id: 578,
      ten: "Khí công bí cấp (Thăng Thiên 6 thức - Đàm Hoa Liên)",
      loai: "thang_thien",
      heSo1: 0.01,
      heSo2: null,
      batBuocThangThien: 11,
      moTa:
        "PHÁT HIỆN LỚN — KHÔNG chết như audit cũ khẳng định ('chỉ thấy field ở nơi reset và gán, không nơi tiêu " +
        "thụ'). Đọc lại A8_Players_03MagicAttack.cs (file mà audit cũ KHÔNG có, vì chưa tồn tại lúc audit cũ " +
        "được viết — do refactor tách file hôm nay) phát hiện field base.DamHoaLien_DienQuangTrieuLo được TRỪ " +
        "TRỰC TIẾP vào sát thương nhận vào tại ÍT NHẤT 9 vị trí khác nhau trong công thức tính damage phòng thủ " +
        "(dạng 'numXX -= (int)(numXX * value4.DamHoaLien_DienQuangTrieuLo)'), rải khắp các nhánh loại đòn tấn " +
        "công khác nhau. Đây là một khí công GIẢM %% SÁT THƯƠNG NHẬN VÀO hoạt động bình thường, không hề chết.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case 578, dòng 10466-10468 (không phải ~8895-8897 như audit cũ trích). Tiêu thụ: " +
        "A8_Players_03MagicAttack.cs dòng 2302, 2341, 2522, 2563, 2661, 2699, 2752, 2786, 2825 (9 vị trí, đều " +
        "dạng trừ %% sát thương). DB [升天气功] 气功ID=578: hệ số=0.01 (audit cũ ghi 0.1 — SAI 10 lần, đã sửa). " +
        "SỬA TRẠNG THÁI: CON_LOI_CHUA_SUA (audit cũ, coi là chết hoàn toàn) -> BINH_THUONG (sống, có tiêu thụ " +
        "thật, đây là finding quan trọng nhất của đợt audit này).",
    },
    {
      index: null,
      id: 687,
      ten: "[Đàm hoa linh] Khí công bí cấp thư (Kinh đào hãi lãng, Thăng Thiên 5 thức)",
      loai: "thang_thien",
      heSo1: 0.3,
      heSo2: null,
      batBuocThangThien: 10,
      moTa:
        "base.ThangThien_5_KinhDaoHaiLang = num11*num12 (tên field KHÔNG mang tiền tố DamHoaLien_, dùng tên " +
        "chung 'ThangThien_5_...' — không phải lỗi, chỉ là quy ước đặt tên, field vẫn riêng cho job9 vì case " +
        "687 độc lập). Xác nhận lại kết luận audit cũ: 687 chỉ CỘNG THẲNG vào ngưỡng roll của 700 (xem entry " +
        "700), không có công thức mức giảm dame riêng — nếu chỉ đầu 687 mà không đầu 700 (DiNhuKhacCuong=0) thì " +
        "nhánh if không chạy, 687 độc lập vô dụng. BỔ SUNG PHÁT HIỆN (không có trong audit cũ): khi roll gộp " +
        "(687+700) trúng ở nhánh 'giảm dame trực tiếp' (không phải nhánh phản đòn), còn có thêm 1 roll phụ " +
        "RNG(1,6) — nếu roll phụ đạt điều kiện và mục tiêu chưa có trạng thái 1008001198, gắn buff +10%% né tránh " +
        "trong 3000ms cho chính người phòng thủ. Hiệu ứng phụ này chưa từng được audit cũ ghi nhận.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case 687, dòng 10322-10324 (không phải ~8784-8786 như audit cũ). Tiêu thụ (đọc cùng " +
        "700, xác nhận trực tiếp ≥5 vị trí): A8_Players_02PhysicalAttack.cs:1778; A8_Players_03MagicAttack.cs:1326; " +
        "A8_Players_04AttackConfirmation.cs:279, 372 (2 nhánh phản đòn, giảm dame về 0 hoàn toàn — không phải " +
        "giảm theo %% như nhánh đánh trực tiếp); NpcClass.cs:1374. Audit cũ nêu 6 vị trí — chỉ xác nhận trực " +
        "tiếp được 5, không loại trừ còn 1 vị trí khác chưa dò hết. DB [升天气功] 气功ID=687: hệ số=0.3 (khớp " +
        "audit cũ).",
    },
    {
      index: null,
      id: 700,
      ten: "Thăng thiên 3 - Dĩ nhu khắc cương",
      loai: "thang_thien",
      heSo1: 0.5,
      heSo2: null,
      batBuocThangThien: 8,
      moTa:
        "base.DamHoaLien_ThangThien_1_KhiCong_DiNhuKhacCuong = num11*num12. Là khí công chủ, cặp với 687 (xem " +
        "687). HAI cơ chế khác nhau tuỳ vị trí: (1) Khi bị đánh trực tiếp (PK tay/chiêu): roll (mẫu số 100 hoặc " +
        "110 tuỳ vị trí) <= DiNhuKhacCuong+KinhDaoHaiLang(687) thì sát thương nhận vào bị NHÂN (1 - " +
        "DiNhuKhacCuong*0.01) — GIẢM THEO %%, không phải giảm cố định; kèm cơ hội +10%% né 3s (xem 687). (2) Khi " +
        "TÍNH SÁT THƯƠNG PHẢN ĐÒN từ đối thủ (job1 Đao/job7 Cầm Sư/job8 HanBaoQuan phản kích): roll trúng thì " +
        "sát thương phản đòn bị đưa về 0 HOÀN TOÀN (num2=0/num4=0), không phải 'giảm' như audit cũ mô tả chung " +
        "chung — đây là chặn tuyệt đối, không theo %%.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case 700, dòng 10334-10336 (không phải ~8796-8798 như audit cũ; tên biến nội bộ vẫn " +
        "'ThangThien_1' dù hiển thị 'thăng thiên 3' — chỉ lệch tên biến C#, không ảnh hưởng hành vi). Tiêu thụ: " +
        "cùng vị trí với 687 (xem trên). DB [升天气功] 气功ID=700: hệ số=0.5 (audit cũ ghi 0.4 — SAI, đã sửa).",
    },
    {
      index: null,
      id: 701,
      ten: "Thăng thiên 4 - Trường hồng quán thiên",
      loai: "thang_thien",
      heSo1: 0.5,
      heSo2: null,
      batBuocThangThien: 9,
      moTa:
        "Gán vô điều kiện (case 701 không cần if theo job — case number đã riêng cho job9) vào " +
        "base.ThangThien_4_TruongHongQuanThien = num11*num12, field dùng chung vật lý với HanBaoQuan (case 603). " +
        "Khi roll (so sánh 'num2 < ThangThien_4_TruongHongQuanThien') trúng, kích hoạt hiệu ứng AoE nhắm nhóm " +
        "đối thủ trong phạm vi 60 (không phải mọi lúc/1 mục tiêu). Không đổi cơ chế so với audit cũ.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case 701, dòng 10337-10339 (không phải ~8799-8801). Tiêu thụ: Players.cs:40214-40260 " +
        "(vẫn còn trong Players.cs gốc), 40490. DB [升天气功] 气功ID=701: hệ số=0.5 (khớp audit cũ).",
    },
    {
      index: null,
      id: 702,
      ten: "Thăng thiên 4 - Ai hồng biến dã",
      loai: "thang_thien",
      heSo1: 0.5,
      heSo2: null,
      batBuocThangThien: 9,
      moTa:
        "Gán vô điều kiện vào base.ThangThien_4_AiHongBienDa = num11*num12, field dùng chung vật lý với " +
        "HanBaoQuan (case 604). SỬA SỐ LIỆU: audit cũ ghi 'phạm vi 300' — code hiện tại dùng " +
        "查找范围玩家(60, value17), TỨC PHẠM VI 60, không phải 300. Mức giảm HP tối đa của mỗi mục tiêu trong " +
        "phạm vi là HẰNG SỐ CỐ ĐỊNH -0.15 (15%%), KHÔNG scale theo điểm đầu tư — điểm đầu tư (qua heSo1) chỉ " +
        "quyết định NGƯỠNG ROLL kích hoạt AoE, không quyết định độ mạnh. Có gate riêng cho map TLC/Môn Chiến " +
        "(loại trừ đồng minh cùng phe) như audit cũ ghi.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case 702, dòng 10340-10342 (không phải ~8802-8804). Tiêu thụ: Players.cs:40163-40212 " +
        "(phạm vi 60, không phải 300 như audit cũ). DB [升天气功] 气功ID=702: hệ số=0.5 (khớp audit cũ).",
    },
  ],
};
