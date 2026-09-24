import type { NgheData } from "../khicong-data/types";

// Đối chiếu Ver24 THẬT — đọc lại code SRCGameServerV24B hiện tại (không dùng lại audit cũ 02/09
// mà không kiểm chứng), biên soạn 15/09/2026.
//
// Ghi chú chung về phương pháp: UpdateKhiCong() (PlayersBes.cs) hiện bắt đầu ở dòng ~9423 (KHÔNG
// còn ở ~7962 như audit cũ — file đã bị soạn lại nhiều lần trong các phiên làm việc). Khí công
// "goc" (index 0-11) được gán trong khối switch(Player_Job){case 3: switch(i){...}}} ở dòng
// ~9557-9598; num2 = điểm đầu tư (đã cộng thêm trang bị/buff, giới hạn bởi World.限制气功点数),
// num3 = hệ số 1 (heSo1) tra theo (Job, index), num4 = hệ số 2 (heSo2). Khí công "thang_thien"
// (index null, dùng thẳng KhiCongID) được gán ở khối switch(KhiCongID) riêng, dòng ~10096-10460;
// num11 = điểm đầu tư thăng thiên, num12 = hệ số (chỉ 1 hệ số, khớp heSo1 trong file audit gốc).
// Mọi trích dẫn dòng dưới đây là dòng THỰC TẾ đọc được hôm nay, có thể lệch nếu code bị sửa tiếp.
export const JOB_03_THUONG_V24: NgheData = {
  job: 3,
  tenNghe: "Thương",
  khiCong: [
    {
      index: 0,
      id: 30,
      ten: "Kim chung cương khí",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Tăng thẳng phòng ngự cơ bản, không qua %, không roll. FLD_NhanVat_KhiCong_PhongNgu = điểm × heSo1. Tối đa +80 phòng ngự ở 80 điểm đầu tư. Khớp hoàn toàn với thiết kế cũ.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case Player_Job==3/i=0 trong UpdateKhiCong (dòng ~9561): FLD_NhanVat_KhiCong_PhongNgu=(int)(num2*num3). Không tìm thấy thay đổi so với audit cũ (chỉ số dòng lệch do code bị sửa nhiều trong ngày).",
    },
    {
      index: 1,
      id: 31,
      ten: "Vận khí liệu thương",
      loai: "goc",
      heSo1: 0.01,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Tăng % lượng máu hồi ở MỌI nguồn hồi máu đi qua hàm 加血() (thuốc, kỹ năng hồi, tự hồi...): sl *= 1.0 + field, field = điểm×heSo1 + 0.1. Tối đa +90% ở 80 điểm. LƯU Ý: field THUONG_VanKhi_LieuThuong dùng CHUNG với Job 12 (Tử Hào) — cả hai nghề cùng đi qua đúng 1 dòng nhân trong 加血().",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case Player_Job==3/i=1 (dòng ~9564): base.THUONG_VanKhi_LieuThuong=num2*num3+0.1. Tiêu thụ: PlayersBes.cs hàm 加血(int sl) dòng ~22471-22484, điều kiện gộp 'if (Player_Job==3 || Player_Job==12)'. Khớp audit cũ.",
    },
    {
      index: 2,
      id: 32,
      ten: "Liên hoàn phi vũ",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Đòn tay có cơ hội gây liên hoàn 2 nhát, nhân sát thương đòn đó lên x2 (có nhánh x2.5 hiếm khi random phụ =8). Field gốc = 10 + điểm×heSo1 (tối đa 90 ở 80 điểm), SAU ĐÓ bị nhân thêm bởi khí công idx8 (Càn Khôn Na Di) nếu có đầu tư — xem idx8 để biết công thức nhân hiện tại (đã đổi khác audit cũ, không còn cap 90).",
      trangThai: "DA_SUA",
      ghiChu:
        "Gán: PlayersBes.cs case Player_Job==3/i=2 (dòng ~9567): base.THUONG_LienHoanPhiVu=10.0+num2*num3. Tiêu thụ đòn tay PvE: A8_Players_02PhysicalAttack.cs dòng 546 (hàm PhysicalAttack_Npc, 'case 3: case 12:' dùng chung); PK: dòng 1551 (hàm PhysicalAttack_Player). CẢ HAI đều RNG.Next(1,100) — xác nhận fix cũ (PvE từng lệch dùng RNG.Next(1,80)) vẫn còn nguyên, KHÔNG bị revert. Field cũng được Job 12 (Tử Hào) ghi tại case Player_Job==12/i=2, dòng ~9981.",
    },
    {
      index: 3,
      id: 34,
      ten: "Cuồng phong vạn phá",
      loai: "goc",
      heSo1: 3000.0,
      heSo2: 0.02,
      batBuocThangThien: null,
      moTa:
        "Kéo dài thời gian trạng thái Nộ Khí Xung Thiên: thời gian(ms) = 10000 + điểm×heSo1. Tối đa +240 giây ở 80 điểm (80×3000=240000ms). Field CuongPhong_VanPha dùng chung cho nhiều nghề, không riêng Thương.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case Player_Job==3/i=3 (dòng ~9570). Tiêu thụ: Players.cs dòng 61867 (num2=10000+(int)base.CuongPhong_VanPha), trong nhánh kích hoạt Nộ Khí Xung Thiên riêng Player_Job==3 (dòng 61870-61875). Khớp audit cũ.",
    },
    {
      index: 4,
      id: 35,
      ten: "Hoành luyện thái bảo",
      loai: "goc",
      heSo1: 8.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa: "Tăng thẳng HP tối đa: NhanVat_KhiCong_ThemVao_HP = điểm×heSo1. Tối đa +640 HP ở 80 điểm. Không roll, không điều kiện PvE/PK.",
      trangThai: "BINH_THUONG",
      ghiChu: "Gán: PlayersBes.cs case Player_Job==3/i=4 (dòng ~9573). Cộng thẳng như mọi nghề khác dùng field NhanVat_KhiCong_ThemVao_HP. Khớp audit cũ.",
    },
    {
      index: 5,
      id: 39,
      ten: "Chuyển công vi thủ",
      loai: "goc",
      heSo1: 0.45,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Khí công phòng thủ dạng proc: roll RNG.Next(1,100) <= field, field = 5.0 + điểm×heSo1 (tối đa 41 ở 80 điểm). KHÁC AUDIT CŨ (ghi 'chỉ PK'): thực tế áp dụng ở CẢ BA bối cảnh, mỗi nơi một biên độ khác nhau — (1) PK-tay: +FLD_CongKich×field×0.005 (đúng ~+20.5% ở field=41, scale theo field, khớp audit cũ); (2) PK-chiêu: +FLD_CongKich×0.2 CỐ ĐỊNH (+20%, không scale theo field một khi đã proc); (3) PvE — quái vật tự động tấn công người chơi (自动攻击事件): +FLD_CongKich/2.0 CỐ ĐỊNH (+50%, không scale, lớn hơn cả 2 trường hợp PK).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case Player_Job==3/i=5 (dòng ~9576). PK-tay: A8_Players_02PhysicalAttack.cs dòng 1108-1111. PK-chiêu: A8_Players_03MagicAttack.cs dòng 408-411 (hàm MagicAttack_Player). PvE (quái đánh người chơi): X3_NpcClass/NpcClass.cs dòng 1260-1264, hàm 自动攻击事件 — PHÁT HIỆN MỚI so với audit 02/09 (audit cũ ghi 'Chỉ PK', không đề cập site NpcClass.cs này).",
    },
    {
      index: 6,
      id: 183,
      ten: "Khí trầm đan điền",
      loai: "goc",
      heSo1: 0.5,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Buff nền tảng chung: field = điểm×heSo1 (tối đa 40 ở 80 điểm). Khi field>0: cộng thêm HP = FLD_PhongNgu×field/100, và cộng CÙNG LƯỢNG đó vào Lực Phòng Ngự Võ Công (kháng chiêu). Áp dụng mọi lúc, không cần roll, không phân biệt PvE/PK.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case Player_Job==3/i=6 (dòng ~9579, field DonKhi_DanDien dùng chung ~13 nghề). Tiêu thụ: PlayersBes.cs dòng 10073-10078 (áp dụng chung sau toàn bộ switch Player_Job, cho mọi nghề có field>0). Khớp audit cũ.",
    },
    {
      index: 7,
      id: 38,
      ten: "Cuồng thần hàng thế",
      loai: "goc",
      heSo1: 0.01,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Khi KHÔNG ở trạng thái Nộ Khí: mỗi tick hồi SP = 3 + Player_Level×2×field, field = điểm×heSo1 (tối đa 0.8 ở 80 điểm). Nếu field==0 (chưa đầu tư) thì rơi về công thức hồi SP mặc định.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case Player_Job==3/i=7 (dòng ~9582). Tiêu thụ: X3_NpcClass/NpcClass.cs dòng 1480-1488 VÀ A8_Players_04AttackConfirmation.cs dòng 194-200 (2 vị trí, cùng công thức, có vẻ là 2 vòng tick khác nhau, không phải trùng lặp lỗi). Khớp audit cũ.",
    },
    {
      index: 8,
      id: 36,
      ten: "Càn khôn na di",
      loai: "goc",
      heSo1: 0.015,
      heSo2: 0.15,
      batBuocThangThien: null,
      moTa:
        "🔴 KHÁC AUDIT CŨ (nghi đã regress): nửa đầu đúng — tăng % sát thương chiêu = điểm×heSo1 (tối đa +120% ở 80 điểm). NHƯNG dòng thứ hai hiện tại là 'base.THUONG_LienHoanPhiVu *= num2×heSo2' — KHÔNG còn '1.0 +' như audit cũ mô tả, và KHÔNG có bất kỳ chặn trần 90 nào trong code. Hệ quả thực tế: đầu tư 1 điểm (heSo2=0.15) khiến field Liên Hoàn Phi Vũ (idx2) bị NHÂN với 0.15 → SẬP xuống còn 15% giá trị gốc (gần như vô hiệu hoá đòn liên hoàn ở mức đầu tư thấp). Từ ~7 điểm trở lên (0.15×7=1.05) mới hoà vốn; sau đó tăng tuyến tính không trần, tới 12× ở 80 điểm (vẫn vượt xa 'trần thiết kế' 90 mà audit cũ tin là đã được chặn).",
      trangThai: "CON_LOI_CHUA_SUA",
      ghiChu:
        "PlayersBes.cs case Player_Job==3/i=8 (dòng ~9585-9586): base.THUONG_LienHoanPhiVu *= num2*num4; — đã grep toàn bộ 'THUONG_LienHoanPhiVu' trong RxjhServer: chỉ có 4 vị trí GÁN (PlayersBes.cs dòng 6812 khởi tạo 0, 9567, 9586, 9981, 10016), KHÔNG có vị trí clamp/cap nào. KHÁC audit 02/09 (ghi DA_SUA, mô tả công thức '*=1.0+num2*heSo2' kèm cap 'if(...>90.0)=90.0' — công thức và cap đó KHÔNG tồn tại trong code hiện tại). So sánh: Job 12 (Tử Hào) dùng CHUNG field này nhưng nhánh case Player_Job==12/i=8 (dòng ~10016) VẪN giữ '1.0 +' (base.THUONG_LienHoanPhiVu *= 1.0 + num2*num4) — chỉ riêng nhánh Job 3 bị thiếu '1.0 +', khả năng cao là lỗi sửa không đồng bộ giữa 2 nhánh dùng chung field.",
    },
    {
      index: 9,
      id: 130,
      ten: "Mạt nhật cuồng vũ",
      loai: "goc",
      heSo1: 0.01,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Khi bước vào Nộ Khí Xung Thiên: hệ số tăng công+thủ song song = 0.25 + field, field = điểm×heSo1 (tối đa +80% ở 80 điểm, tổng tối đa +105%). Cộng vào cả FLD_ThemVaoTiLePhanTram_Attack và FLD_ThemVaoTiLePhanTram_PhongNgu, suốt thời gian rage.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case Player_Job==3/i=9 (dòng ~9589). Tiêu thụ: Players.cs dòng 61870-61875 (nhánh kích hoạt Nộ Khí Xung Thiên riêng Player_Job==3, num3=0.25+base.THUONG_MatNhatCuongVu). Khớp audit cũ.",
    },
    {
      index: 10,
      id: 332,
      ten: "Nộ ý chi hống",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 0.2,
      batBuocThangThien: null,
      moTa:
        "Chỉ áp dụng cho CHIÊU: roll RNG.Next(1,100) <= field, field = điểm×heSo1 (tối đa 80% ở 80 điểm). Khi trúng: nhân sát thương chiêu ×1.2 (PvE, hoặc PK khi không Nộ Khí), hoặc ×(1.2 + field id33) khi đang Nộ Khí. Ở PK, ngưỡng roll bị trừ bớt bởi field PhanCong_THUONG_NoYChiHong của ĐỐI THỦ — một hệ 'phản chế khí công' riêng (gán qua case KhacCheKhiCongID==2006), KHÔNG phải field/tên 'Giam_Tac_dung_Cua_Khi_Cong' mà audit cũ nhắc tới (tên đó không còn tồn tại trong code hiện tại).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case Player_Job==3/i=10 (dòng ~9592). PvE: A8_Players_03MagicAttack.cs dòng 3301-3310 (MagicAttack_Npc). PK: dòng 643-652 (MagicAttack_Player, trừ num11=value2.PhanCong_THUONG_NoYChiHong, gán tại PlayersBes.cs case KhacCheKhiCongID==2006 dòng ~10511). RỦI RO ĐÃ BIẾT NHƯNG NAY MANG BẢN CHẤT KHÁC audit cũ: skill hỗ trợ đồng đội VoCong_ID 401303 — phần CỘNG (+10.0) trong code hiện tại CHỈ áp dụng cho Job 4 (value4.CUNG_TriMenhTuyetSat+=10.0, A8_Players_03MagicAttack.cs dòng 1745), KHÔNG còn nhánh cộng cho Job 3. Nhưng phần TRỪ khi buff hết hạn (X_Them_Vao_Trang_Thai_Loai.cs dòng 220-224: case 401303 → Play.THUONG_NoYChiHong-=10.0, floor 0) VẪN áp dụng cho Job 3. Hệ quả: đồng đội cast 401303 lên một Thương không được lợi gì, nhưng 185 giây sau khi buff hết hạn, field THẬT của họ (đầu tư bằng điểm khí công) bị trừ NHẦM -10 cho tới lần UpdateKhiCong() kế tiếp mới tính lại đúng — lỗi 1 CHIỀU (trừ oan), khác hẳn mô tả cũ ('cộng thẳng, không trần, không tự giảm').",
    },
    {
      index: 11,
      id: 37,
      ten: "Linh giáp hộ thân",
      loai: "goc",
      heSo1: 0.008,
      heSo2: 3.0,
      batBuocThangThien: null,
      moTa:
        "🔴 KHÁC AUDIT CŨ HOÀN TOÀN: đây KHÔNG phải chỉ số phòng ngự cộng thẳng, mà là khí công dạng PROC. field (base.LinhGiapBocPhat) = điểm×heSo1 — dùng heSo1 (0.008), KHÔNG PHẢI heSo2 (3.0) như audit cũ khẳng định. Tiêu thụ: roll RNG.Next(1,100) <= field, CHỈ Ở CHIÊU PvE → bật cờ KichHoat_LinhGiap_BaoPhat, giúp giảm một nửa mức phạt sát thương tự thân ở đòn kế tiếp (mất 1/6 thay vì 1/3 CongKichLuc). Với heSo1=0.008, ở mức đầu tư tối đa 80 điểm field chỉ đạt 0.64 — RNG.Next(1,100) luôn trả số nguyên ≥1 nên field 0.64 KHÔNG BAO GIỜ ≥ roll → khí công gần như KHÔNG THỂ proc ở điều kiện chơi bình thường, vô hiệu hoá trên thực tế.",
      trangThai: "CON_LOI_CHUA_SUA",
      ghiChu:
        "Gán: PlayersBes.cs case Player_Job==3/i=11 (dòng ~9595): base.LinhGiapBocPhat=num2*num3 (num3=heSo1, xác nhận qua hàm 得到气功加成值(job,index,type) — type1=heSo1, type2=heSo2). Tiêu thụ: A8_Players_03MagicAttack.cs dòng 3316-3320 (chỉ PvE-chiêu, hàm MagicAttack_Npc — grep toàn bộ không thấy điểm gọi PK nào). Hiệu ứng dùng: A8_Players_01SystemAttack.cs dòng 667. KHÁC audit 02/09 (ghi BINH_THUONG, mô tả 'tăng thẳng lực phòng ngự võ công... tối đa 240 điểm ULPT' dùng heSo2) — mô tả đó không khớp với bất kỳ đoạn code nào tìm được cho field LinhGiapBocPhat hiện tại.",
    },
    {
      index: null,
      id: 33,
      ten: "Thăng thiên 3 - Nộ ý chi hỏa",
      loai: "thang_thien",
      heSo1: 0.005,
      heSo2: null,
      batBuocThangThien: 8,
      moTa:
        "Không đứng độc lập — chỉ cộng thêm vào Nộ Ý Chi Hống (idx10) khi đang Nộ Khí: ngưỡng roll += field; hệ số nhân sát thương += field×0.01 (cộng vào nền 1.2). field = điểm×heSo1, tối đa +0.4 ở 80 điểm. Khớp hoàn toàn audit cũ.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case 33 trong khối Thăng Thiên của UpdateKhiCong (dòng ~10111-10112): base.THUONG_ThangThien_3_KhiCong_NoYChiHoa=num11*num12. Tiêu thụ: A8_Players_03MagicAttack.cs dòng 3307 (PvE) và dòng 649 (PK) — cùng khối xử lý Nộ Ý Chi Hống.",
    },
    {
      index: null,
      id: 330,
      ten: "Thăng thiên 1 - Phá giáp thứ hồn",
      loai: "thang_thien",
      heSo1: 1.0,
      heSo2: null,
      batBuocThangThien: 6,
      moTa:
        "Chỉ áp dụng cho chiêu loại hình 3, cấp kết hôn kỹ năng ≥5: roll RNG.Next(1,100) <= field, field = điểm×heSo1 (tối đa 80% ở 80 điểm). Khi trúng: cộng thêm sát thương = FLD_TrangBi_ThemVao_PhongNgu × hệ số nền 0.4 (có thể tăng thêm nếu đang Nộ Khí nhờ id331). Khớp hoàn toàn audit cũ.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case 330 (dòng ~10243-10244). Tiêu thụ: A8_Players_03MagicAttack.cs dòng 3283-3299 (PvE, MagicAttack_Npc) và dòng 628-641 (PK, MagicAttack_Player) — công thức giống hệt nhau ở 2 nơi.",
    },
    {
      index: null,
      id: 331,
      ten: "Thăng thiên 2 - Dĩ thối vi tiến",
      loai: "thang_thien",
      heSo1: 1.0,
      heSo2: null,
      batBuocThangThien: 7,
      moTa:
        "Chỉ kích hoạt khi đang Nộ Khí: cộng thêm cả ngưỡng roll lẫn hệ số nhân sát thương của Phá Giáp Thứ Hồn (id330). field = điểm×heSo1, tối đa +80 ngưỡng và +0.8 hệ số ở 80 điểm. Khớp hoàn toàn audit cũ.",
      trangThai: "BINH_THUONG",
      ghiChu: "Gán: PlayersBes.cs case 331 (dòng ~10246-10247). Cùng vị trí tiêu thụ với id330 (A8_Players_03MagicAttack.cs dòng 3290-3294 PvE, 631-635 PK).",
    },
    {
      index: null,
      id: 333,
      ten: "Thăng thiên 4 - Hồng nguyệt cuồng phong",
      loai: "thang_thien",
      heSo1: 0.5,
      heSo2: null,
      batBuocThangThien: 9,
      moTa:
        "🔴 CHẾT HOÀN TOÀN cho riêng Job 3 (khác hẳn audit cũ ghi BINH_THUONG): code gán case 333 hiện tại ghi vào field base.ThangThien_4_TucNguyetCuongPhong (即月狂风), NHƯNG hàm kích hoạt thực tế của khí công thăng thiên 4 dành cho Job 3 (升天四气功触发, Players.cs) lại đọc field KHÁC là base.ThangThien_4_HongNguyetCuongPhong (红月狂风) — field mà các job/ID khác (case 313/323/666/564) mới ghi vào. Field TucNguyetCuongPhong chỉ được GHI (PlayersBes.cs khởi tạo 0 + gán case 333), không có bất kỳ điểm ĐỌC nào trong toàn bộ codebase (đã grep xác nhận). Vì vậy với nhân vật Job 3, base.ThangThien_4_HongNguyetCuongPhong luôn giữ nguyên 0.0 → điều kiện kích hoạt không bao giờ đúng → khí công chết hoàn toàn dù đầu tư đủ điểm/thăng thiên.",
      trangThai: "CHET_HOAN_TOAN",
      ghiChu:
        "Gán SAI: PlayersBes.cs case 333 (dòng ~10249-10250): base.ThangThien_4_TucNguyetCuongPhong=num11*num12. Điểm đọc thực tế cho Job 3: Players.cs dòng 40260 (và một bản sao khác của cùng hàm kích hoạt, dòng ~40559): 'if (!(num2 < base.ThangThien_4_HongNguyetCuongPhong) || Player_Job != 3) return;' — điều kiện Player_Job!=3 return chứng minh hàm này được thiết kế RIÊNG cho Job 3 nhưng lại đọc nhầm field. Field HongNguyetCuongPhong chỉ được ghi bởi case 313/323/666/564 (ID của job/khí công khác), Job 3 không có case nào ghi vào field đó. KHÁC HẲN audit 02/09 (BINH_THUONG, cite AscensionFourQigongTrigger Players.cs~46333 — dòng số đã lệch do sửa code nhiều lần, nhưng bug field-mismatch xác nhận là có thật ở thời điểm đọc code hôm nay; không xác định được đây là lỗi tồn tại từ trước audit cũ hay mới phát sinh).",
    },
    {
      index: null,
      id: 334,
      ten: "Thăng thiên 4 - Độc xà xuất động",
      loai: "thang_thien",
      heSo1: 0.5,
      heSo2: null,
      batBuocThangThien: 9,
      moTa:
        "🟡 SỬA MÔ TẢ so với audit cũ (chiều tác dụng ngược lại): field = điểm×heSo1. Khi trúng roll, gắn trạng thái 'Độc xà xuất động' 3 giây lên mục tiêu. Hàm kiểm tra trạng thái này (检查毒蛇出洞状态()), khi TRUE, sẽ NHÂN roll kế tiếp của chính nạn nhân với ×1000 trước khi so sánh ngưỡng proc — nghĩa là MỌI khí công proc khác nhắm vào nạn nhân trong 3 giây đó gần như KHÔNG THỂ trúng. Đây là hiệu ứng PHÒNG THỦ/kháng-roll cho nạn nhân, KHÔNG PHẢI 'ép roll ngẫu nhiên khác dễ thành công' như audit cũ mô tả — thực tế ngược lại: nạn nhân được bảo vệ khỏi proc khác trong 3 giây.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case 334 (dòng ~10252-10253): base.ThangThien_4_DocXaXuatDong=num11*num12 (field dùng chung nhiều job/ID: case 314/324/334/565/665...). Tiêu thụ: Players.cs dòng 40118 (điều kiện gắn trạng thái). Hiệu ứng nhân ×1000 của 检查毒蛇出洞状态() xác nhận tại A8_Players_02PhysicalAttack.cs dòng 1514-1516 và 1547-1549.",
    },
    {
      index: null,
      id: 572,
      ten: "Khí công bí cấp (Thăng Thiên 6 thức - Thương)",
      loai: "thang_thien",
      heSo1: 0.1,
      heSo2: null,
      batBuocThangThien: 11,
      moTa:
        "🟡 SỬA MÔ TẢ ĐÁNG KỂ so với audit cũ: field = điểm×heSo1 (tối đa 8% ở 80 điểm). Chỉ có DUY NHẤT MỘT điểm tiêu thụ trong toàn bộ codebase — ở PK-chiêu (MagicAttack_Player); KHÔNG tìm thấy điểm gọi nào ở PvE (khác audit cũ ghi có cả PvE lẫn PK). Điều kiện: roll RNG.Next(1,100) <= field VÀ cách lần kích hoạt trước ≥10 giây (cooldown per-cast). Khi trúng: tìm tối đa 5 nhân vật gần đó qua 群攻查找范围RW2() — hàm này KHÔNG lọc phe/đồng minh, chỉ loại trừ chính người cast — rồi gắn trạng thái bất thường ID 54 lên từng người (khoá nhân vật, NhanVatBiKhoa=true, 5 giây). Đây là hiệu ứng KHỐNG CHẾ diện rộng quanh người cast (tên hàm 群攻=tấn công nhóm, 冰冻判断=phán đoán đóng băng, hiệu ứng=khoá nhân vật), KHÔNG PHẢI 'buff hỗ trợ không sát thương cho tối đa 6 đồng đội' như audit cũ mô tả.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case 572 (dòng ~10447-10448): base.THUONG_HanBangLinhVuc=num11*num12. Tiêu thụ DUY NHẤT: A8_Players_03MagicAttack.cs dòng 658-669 (trong MagicAttack_Player). Hiệu ứng: PlayersBes.cs hàm 冰冻判断(int, Players) dòng 21531-21544 (case KhiCongID==572 → TrangThai_BatThuong[54], 5000ms). KHÔNG tìm thấy field/tên 'Giam_Tac_dung_Cua_Khi_Cong' ở bất kỳ đâu trong codebase hiện tại (grep toàn bộ = 0 kết quả) nên KHÔNG THỂ xác nhận hay bác bỏ chi tiết fix cụ thể mà audit 02/09 mô tả (trừ đúng debuff Thần Nữ) — nhiều khả năng field đó đã đổi tên hoặc bị loại bỏ ở các lần sửa sau. Do không có bằng chứng khí công đang lỗi ở hiện tại (cơ chế chạy nhất quán nội bộ), hạ mức tin cậy từ DA_SUA (audit cũ) xuống BINH_THUONG thay vì khẳng định lại câu chuyện 'đã sửa' cụ thể không kiểm chứng được.",
    },
    {
      index: null,
      id: 681,
      ten: "[Thương] Khí công bí cấp thư (Thăng Thiên 5 thức - Diệt Thế Cuồng Vũ)",
      loai: "thang_thien",
      heSo1: 0.3,
      heSo2: null,
      batBuocThangThien: 10,
      moTa:
        "Ultimate riêng của Thương, field = điểm×heSo1 (tối đa 24% ở 80 điểm). Chỉ proc khi KHÔNG đang Nộ Khí (!NoKhi): roll RNG.Next(1,100) <= field → nhân sát thương chiêu ×1.2. Áp dụng giống hệt ở cả PvE lẫn PK, KHÔNG có điều kiện trừ ngưỡng theo đối thủ ở PK (khác id332 — id681 không có field 'PhanCong' tương ứng nào trong hệ khắc chế khí công). Khớp audit cũ về hành vi cốt lõi.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case 681 (dòng ~10304-10305): base.ThangThien_5_DietTheCuongVu=num11*num12. Tiêu thụ: A8_Players_03MagicAttack.cs dòng 3311-3314 (PvE, MagicAttack_Npc) và dòng 653-656 (PK, MagicAttack_Player) — công thức giống hệt nhau, không trừ đối thủ ở PK. Không xác nhận được chi tiết 'trừ Giam_Tac_dung_Cua_Khi_Cong' của audit cũ (field đó không tồn tại trong code hiện tại) nhưng không có dấu hiệu lỗi ở cơ chế hiện tại.",
    },
  ],
};
