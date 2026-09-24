import type { KhiCongEntry } from "../khicong-data/types";

export interface KhiCongDungChungV24 extends KhiCongEntry {
  /** Danh sách job THỰC SỰ nhận hiệu lực khí công này — giao của 2 điều kiện độc lập:
   *  (1) cổng học/sở hữu: bảng 升天气功.人物职业N (N=job) phải =1 thì KhiCongID mới được nạp vào
   *      DanhSach_ThangThienKhiCong riêng của nhân vật khi đọc dữ liệu (PlayersBes.cs ReadCharacterData
   *      ~7513-7606) — job có cờ=0 thì KHÔNG BAO GIỜ có điểm khác 0 ở slot này, bất kể switch dưới đây
   *      có loại trừ job đó hay không; (2) switch theo KhiCongID trong UpdateKhiCong() có thể loại trừ
   *      thêm job (thường trùng job đã có khí công GỐC tên giống hệt ở idx khác). apDungJob dưới đây là
   *      GIAO của cả 2, đối chiếu trực tiếp qua sqlcmd DB sống — không suy diễn từ code switch một mình. */
  apDungJob: number[];
  /** Nếu mỗi job có 1 KhiCongID riêng cùng trỏ về field chung (VD nhóm Trí Tàn/TT6-1/TT6-2), map job -> id thật để lấy đúng icon. */
  idTheoJob?: Record<number, number>;
}

// Khí công Thăng Thiên DÙNG CHUNG cho nhiều/mọi nghề — mỗi mã KhiCongID trong DB (bảng 升天气功)
// là 1 dòng riêng theo nghề, nhưng code PlayersBes.cs (UpdateKhiCong) đổ chung vào 1 field vật lý
// duy nhất nên chỉ cần mô tả 1 lần áp dụng cho tất cả nghề liên quan.
//
// Đối chiếu Ver24 THẬT — đọc lại code SRCGameServerV24B hiện tại (không copy nguyên audit cũ
// 02/09 mà không kiểm chứng), biên soạn 15/09/2026. Toàn bộ 11 mục đã tái xác minh độc lập: code
// gán (PlayersBes.cs UpdateKhiCong(), switch theo KhiCongID thật ~10096-10474 — KHÔNG phải switch
// theo index 0-11 của khí công GỐC), cổng học thật (PlayersBes.cs ReadCharacterData() ~7513-7606,
// switch theo Player_Job kiểm tra 升天气功.人物职业N==1 trước khi nạp KhiCongID vào
// DanhSach_ThangThienKhiCong của nhân vật), và code tiêu thụ trong các file chiến đấu đã TÁCH
// (Players\A8_Players_01SystemAttack.cs, A8_Players_02PhysicalAttack.cs [đòn tay PvE/PK],
// A8_Players_03MagicAttack.cs [đòn chiêu PvE/PK], A8_Players_04AttackConfirmation.cs,
// X3_NpcClass\NpcClass.cs [PvE phía quái]). Hệ số heSo1 đối chiếu DB SỐNG qua sqlcmd (bảng
// 升天气功, cột FLD_每点加成比率值) — không dùng lại số cache trong audit cũ.
//
// PHÁT HIỆN QUAN TRỌNG NHẤT: cổng "học được" (升天气功.人物职业N) đôi khi HẸP HƠN nhiều so với
// điều kiện loại trừ trong switch gán — job có cờ=0 thì không bao giờ sở hữu KhiCongID đó nên
// switch có cho phép hay không cũng vô nghĩa. id385 và id386 bị ảnh hưởng nặng nhất (xem ghiChu).
// Ngoài ra nhóm 620/633 ("Thăng Thiên 6 thức") có cơ chế hoàn toàn khác audit cũ mô tả — không
// phải so sánh PK với đối phương mà là đánh đổi công/thủ CỦA CHÍNH NGƯỜI CHƠI, áp dụng mọi lúc
// (PvE lẫn PK, tay lẫn chiêu) — xem chi tiết ở 2 mục đó.
export const KHICONG_DUNG_CHUNG_V24: KhiCongDungChungV24[] = [
  {
    index: null,
    id: 380,
    ten: "Cửu Chuyển Hồi Phong",
    loai: "thang_thien",
    heSo1: 1.0,
    heSo2: null,
    batBuocThangThien: 6,
    apDungJob: [2, 3, 5, 6, 7, 9, 11, 12, 13],
    idTheoJob: undefined,
    moTa:
      "Khí công 'lấp chỗ trống' — chỉ áp dụng cho nghề KHÔNG có sẵn khí công gốc tương đương " +
      "(loại trừ Đao/Cung/HanBaoQuan/Quyền Sư — job 1,4,8,10). Công thức (UpdateKhiCong, case 380): " +
      "FLD_NhanVat_KhiCong_CongKich += (int)(FLD_CongKichThapNhat × điểm × heSo1 × 0.01 / 2). Cộng " +
      "thẳng vào getter FLD_NhanVatCoBan_CongKich (công kích cơ bản dùng cho MỌI đòn đánh — PvE tay, " +
      "PvE chiêu, PK tay, PK chiêu — không phân biệt, không roll). Đối chiếu cờ 升天气功.人物职业N qua " +
      "sqlcmd: khớp chính xác 100% với danh sách loại trừ trong switch — không có job nào bị chặn ở " +
      "cổng học mà switch lại cho phép (hoặc ngược lại).",
    trangThai: "BINH_THUONG",
    ghiChu:
      "Gán: PlayersBes.cs UpdateKhiCong() case 380 dòng 10126-10131. Cổng học: ReadCharacterData() " +
      "dòng 7513-7606 (switch theo Player_Job, kiểm tra NhanVatNgheNghiepN==1). Tiêu thụ: getter " +
      "FLD_NhanVatCoBan_CongKich, PlayersBes.cs dòng 2162-2180 (dòng 2179 cộng trực tiếp " +
      "FLD_NhanVat_KhiCong_CongKich); getter này được đọc rộng khắp ở A8_Players_02PhysicalAttack.cs " +
      "(vd dòng 86, 1043) và các file chiến đấu khác. DB 升天气功 (气功ID=380): heSo1=1.0, cờ nghề " +
      "0,1,1,0,1,1,1,0,1,0,1,1,1 (job1..13) — khớp audit cũ.",
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
    idTheoJob: undefined,
    moTa:
      "Cùng cơ chế 'lấp chỗ trống' như Cửu Chuyển Hồi Phong, loại trừ Kiếm/Đàm Hoa Liên (job 2,9) — " +
      "2 nghề đã có khí công gốc tương đương. Công thức (case 381): FLD_NhanVat_KhiCong_CongKich += " +
      "điểm × heSo1 (cộng thẳng, KHÔNG nhân với FLD_CongKichThapNhat như id380). Tiêu thụ tại cùng " +
      "getter FLD_NhanVatCoBan_CongKich với id380, áp dụng đều mọi loại đòn đánh. Cờ DB khớp chính " +
      "xác danh sách loại trừ của switch.",
    trangThai: "BINH_THUONG",
    ghiChu:
      "Gán: PlayersBes.cs UpdateKhiCong() case 381 dòng 10132-10137. Cổng học: ReadCharacterData() " +
      "dòng 7513-7606. Tiêu thụ: getter FLD_NhanVatCoBan_CongKich, PlayersBes.cs dòng 2162-2180. DB " +
      "升天气功 (气功ID=381): heSo1=3.0 (khớp audit cũ), cờ nghề 1,0,1,1,1,1,1,1,0,1,1,1,1.",
  },
  {
    index: null,
    id: 382,
    ten: "Kim Chung Cương Khí",
    loai: "thang_thien",
    heSo1: 1.0,
    heSo2: null,
    batBuocThangThien: 6,
    apDungJob: [1, 2, 4, 5, 6, 8, 9, 10, 11, 13],
    idTheoJob: undefined,
    moTa:
      "Cộng thẳng phòng ngự cơ bản. Công thức (case 382): FLD_NhanVat_KhiCong_PhongNgu += (int)(điểm " +
      "× heSo1), tiêu thụ tại getter FLD_NhanVatCoBan_PhongNgu (áp dụng mọi đòn, mọi chế độ). Switch " +
      "chỉ loại trừ job 3 (Thương) và 7 (Cầm Sư) — 2 nghề có khí công gốc tên trùng ở idx0 — nhưng cờ " +
      "DB 升天气功.人物职业12 CŨNG =0: job 12 (Tử Hào) có khí công GỐC riêng cùng tên 'Kim chung cương " +
      "khí' (id281, idx0, xem job12-tuhao.ts) mà audit cũ đã bỏ sót. Do đó apDungJob THẬT loại trừ " +
      "CẢ BA nghề 3/7/12, không phải chỉ 2 như audit cũ.",
    trangThai: "BINH_THUONG",
    ghiChu:
      "KHÁC audit cũ: apDungJob loại bỏ job 12 (Tử Hào) — xác nhận qua cờ 升天气功.人物职业12=0 VÀ " +
      "qua job12-tuhao.ts đã có sẵn khí công gốc id281 'Kim chung cương khí' ở idx0. Gán: " +
      "PlayersBes.cs UpdateKhiCong() case 382 dòng 10138-10143. Cổng học: ReadCharacterData() dòng " +
      "7513-7606. Tiêu thụ: getter FLD_NhanVatCoBan_PhongNgu, PlayersBes.cs dòng 2205-2215 (dòng " +
      "2213). DB 升天气功 (气功ID=382): heSo1=1.0, cờ nghề 1,1,0,1,1,1,0,1,1,1,1,0,1.",
  },
  {
    index: null,
    id: 383,
    ten: "Vận Khí Hành Tâm",
    loai: "thang_thien",
    heSo1: 0.02,
    heSo2: null,
    batBuocThangThien: 6,
    apDungJob: [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13],
    idTheoJob: undefined,
    moTa:
      "Tăng % lượng MP hồi từ đan dược/kỹ năng hồi phục, loại trừ Đại Phu (job5, đã có khí công gốc " +
      "tên trùng ở idx0) — cả switch gán lẫn cổng học DB đều khớp đúng 1 loại trừ duy nhất. Công thức " +
      "(case 383): base.ThangThien_1_KhiCong_VanKhiHanhTam = điểm × heSo1 (chỉ khi job != 5). Tiêu " +
      "thụ tại hàm 加魔(int sl) [Tăng mana]: sl *= (1.0 + ThangThien_1_KhiCong_VanKhiHanhTam) — nhân " +
      "hệ số THẬT LÀ PHẦN TRĂM tăng MP hồi được mỗi lần gọi 加魔 (uống thuốc, kỹ năng hồi MP).",
    trangThai: "BINH_THUONG",
    ghiChu:
      "KHÁC audit cũ: heSo1 0.04→0.02 (DB thật, đối chiếu sqlcmd bảng 升天气功 气功ID=383). Gán: " +
      "PlayersBes.cs UpdateKhiCong() case 383 dòng 10144-10149. Cổng học: ReadCharacterData() dòng " +
      "7513-7606. Tiêu thụ: PlayersBes.cs hàm 加魔(int sl) dòng 22504-22521 (dòng 22520). DB 升天气功 " +
      "(气功ID=383): heSo1=0.02, cờ nghề 1,1,1,1,0,1,1,1,1,1,1,1,1 (chỉ job5=0).",
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
    idTheoJob: undefined,
    moTa:
      "Cộng thẳng HP tối đa, loại trừ Cung/Cầm Sư (job4,7 — đã có khí công gốc tên trùng ở idx4). " +
      "Công thức (case 384): NhanVat_KhiCong_ThemVao_HP += (int)(điểm × heSo1). Field này được cộng " +
      "trực tiếp (flat, không nhân %) vào getter CharacterMax_HP (HP tối đa hiển thị/dùng thật trong " +
      "combat). Cờ DB khớp chính xác danh sách loại trừ của switch.",
    trangThai: "BINH_THUONG",
    ghiChu:
      "Gán: PlayersBes.cs UpdateKhiCong() case 384 dòng 10150-10155. Cổng học: ReadCharacterData() " +
      "dòng 7513-7606. Tiêu thụ: getter CharacterMax_HP, PlayersBes.cs dòng 2293-2303 (cộng thẳng " +
      "NhanVat_KhiCong_ThemVao_HP). DB 升天气功 (气功ID=384): heSo1=8.0 (khớp audit cũ), cờ nghề " +
      "1,1,1,0,1,1,0,1,1,1,1,1,1.",
  },
  {
    index: null,
    id: 385,
    ten: "Vận Khí Liệu Thương (Thăng Thiên)",
    loai: "thang_thien",
    heSo1: 1.0,
    heSo2: null,
    batBuocThangThien: 6,
    apDungJob: [2, 4, 7, 8, 9],
    idTheoJob: undefined,
    moTa:
      "SAI KHÁC LỚN so với audit cũ. Switch gán (case 385) chỉ loại trừ job 3 (Thương) và 10 (Quyền " +
      "Sư), nhưng cổng học DB (升天气功.人物职业N) chỉ bật cờ=1 cho đúng 5 job: 2,4,7,8,9 (Kiếm, Cung, " +
      "Cầm Sư, HanBaoQuan, Đàm Hoa Liên) — các job còn lại (1,5,6,11,12,13) tuy switch không cấm " +
      "nhưng KHÔNG BAO GIỜ có KhiCongID 385 trong DanhSach_ThangThienKhiCong của họ nên field luôn = " +
      "0, vô hiệu trên thực tế. apDungJob THẬT = giao 2 điều kiện = {2,4,7,8,9}. Công thức khi có " +
      "hiệu lực: base.ThangThien_1_KhiCong_VanKhi_LieuThuong = 10.0 + điểm × heSo1. CƠ CHẾ TIÊU THỤ " +
      "CŨNG SAI so với audit cũ: hàm 加血(int sl) [Tăng máu] làm 'sl += (int)ThangThien_1_KhiCong_" +
      "VanKhi_LieuThuong' — CỘNG THẲNG (flat) vào lượng HP hồi mỗi lần gọi 加血, KHÔNG PHẢI nhân % " +
      "như audit cũ mô tả ('tăng % lượng máu hồi').",
    trangThai: "BINH_THUONG",
    ghiChu:
      "KHÁC audit cũ (2 điểm): (1) apDungJob thu hẹp còn [2,4,7,8,9] thay vì 11 job — do cổng học DB " +
      "(升天气功.人物职业N) hẹp hơn nhiều so với loại trừ trong switch; đây cũng là lời giải cho câu " +
      "hỏi job11 — job11 có cờ=0 nên KHÔNG nhận 385 dù switch không cấm. (2) Cơ chế là CỘNG THẲNG " +
      "(flat +10+điểm×heSo1 HP mỗi lần hồi máu), không phải %. Gán: PlayersBes.cs UpdateKhiCong() " +
      "case 385 dòng 10156-10161. Cổng học: ReadCharacterData() dòng 7513-7606. Tiêu thụ: PlayersBes.cs " +
      "hàm 加血(int sl) dòng 22471-22493 (dòng 22492, điều kiện Player_Job!=3 && Player_Job_Level>=6). " +
      "DB 升天气功 (气功ID=385): heSo1=1.0 (khớp audit cũ), cờ nghề 0,1,0,1,0,0,1,1,1,0,0,0,0.",
  },
  {
    index: null,
    id: 386,
    ten: "Bách Biến Thần Hành (Thăng Thiên)",
    loai: "thang_thien",
    heSo1: 0.01,
    heSo2: null,
    batBuocThangThien: 6,
    apDungJob: [1, 3, 4, 7, 10],
    idTheoJob: undefined,
    moTa:
      "SAI KHÁC LỚN so với audit cũ, cùng kiểu với id385. Switch gán (case 386) chỉ loại trừ job " +
      "2,6,8,9 (Kiếm/Ninja/HanBaoQuan/Đàm Hoa Liên), nhưng cổng học DB chỉ bật cờ=1 cho đúng 5 job: " +
      "1,3,4,7,10 (Đao, Thương, Cung, Cầm Sư, Quyền Sư) — các job 5,11,12,13 tuy switch không cấm " +
      "nhưng không bao giờ sở hữu KhiCongID 386 nên vô hiệu trên thực tế. apDungJob THẬT = giao 2 " +
      "điều kiện = {1,3,4,7,10}. Công thức: FLD_NhanVat_ThemVaoTiLePhanTram_NeTranh += 0.1 + điểm × " +
      "heSo1 (tức +10% cố định + 1%/điểm). Tiêu thụ tại getter FLD_NhanVatCoBan_NeTranh — cộng vào " +
      "hệ số nhân (1.0 + FLD_NhanVat_ThemVaoTiLePhanTram_NeTranh + ...) áp dụng cho mọi tính né tránh.",
    trangThai: "BINH_THUONG",
    ghiChu:
      "KHÁC audit cũ: apDungJob thu hẹp còn [1,3,4,7,10] thay vì 9 job — do cổng học DB hẹp hơn " +
      "switch (job5,11,12,13 có cờ=0, không sở hữu được id386 dù switch cho phép). Gán: PlayersBes.cs " +
      "UpdateKhiCong() case 386 dòng 10162-10167. Cổng học: ReadCharacterData() dòng 7513-7606. Tiêu " +
      "thụ: getter FLD_NhanVatCoBan_NeTranh, PlayersBes.cs dòng 2232-2254 (dòng 2252). DB 升天气功 " +
      "(气功ID=386): heSo1=0.01 (khớp audit cũ), cờ nghề 1,0,1,1,0,0,1,0,0,1,0,0,0.",
  },
  {
    index: null,
    id: 387,
    ten: "Cuồng Phong Thiên Ý",
    loai: "thang_thien",
    heSo1: 0.2,
    heSo2: null,
    batBuocThangThien: 6,
    apDungJob: [5],
    idTheoJob: undefined,
    moTa:
      "Khí công ĐỘC QUYỀN Đại Phu (job5), cờ DB 升天气功.人物职业5 xác nhận đúng chỉ 1 job=1. CƠ CHẾ ĐÃ " +
      "THAY ĐỔI HOÀN TOÀN so với audit cũ — kế thừa phát hiện độc lập từ job05-daiphu.ts (đã re-audit " +
      "riêng mục này ngày 15/09/2026): KHÔNG còn roll RNG.Next(1,150) và KHÔNG còn trạng thái 700387 " +
      "(+20% ATT/+20% DEF) — grep '700387' toàn bộ repo không ra kết quả. Cơ chế thật hiện nay gồm 2 " +
      "phần: (1) khi bị tấn công (PvE lẫn PK), roll RNG.Next(1,100) <= ThangThien_1_KhiCong_" +
      "CuongPhongThienY (= điểm × 0.2) và chưa ở trạng thái NoKhi → SP bị đặt thẳng lên Max_SP+5 (làm " +
      "đầy/tràn nhẹ thanh SP), kích hoạt sớm chế độ 'phẫn nộ' status 700014 dùng chung mọi job; (2) " +
      "khi phẫn nộ (700014) kích hoạt cho job5, hệ số CHỈ còn ảnh hưởng THỜI LƯỢNG trạng thái (10000 " +
      "+ điểm×0.2×3000 + 3000 ms) — mức cộng % tấn công/phòng ngự của 700014 cho job5 là CỐ ĐỊNH " +
      "+15%/+20%, KHÔNG scale theo điểm đầu tư.",
    trangThai: "BINH_THUONG",
    ghiChu:
      "Kế thừa nguyên trạng thái từ job05-daiphu.ts (mục id387, đã re-audit đầy đủ, không đổi thêm " +
      "trong lần này). KHÁC audit cũ: heSo1 1.0→0.2 (DB thật); mẫu roll 150→100; toàn bộ cơ chế thực " +
      "thi viết lại (SP tràn kích hoạt phẫn nộ sớm hơn, thay vì tự cộng % qua state 700387 không còn " +
      "tồn tại). Gán: PlayersBes.cs UpdateKhiCong() case 387 dòng 10168-10173 (if Player_Job==5). " +
      "Cổng học: ReadCharacterData() dòng 7513-7606. Tiêu thụ proc SP: NpcClass.cs dòng 1342; " +
      "A8_Players_02PhysicalAttack.cs dòng 1726; A8_Players_03MagicAttack.cs dòng 1224. Tiêu thụ thời " +
      "lượng phẫn nộ: Players.cs dòng 61877-61882. DB 升天气功 (气功ID=387): heSo1=0.2, cờ nghề chỉ " +
      "job5=1.",
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
      "13 mã KhiCongID (615 của Thần Nữ, 667-678 lần lượt của Đao/Kiếm/Thương/Cung/Đại Phu/Ninja/Cầm " +
      "Sư/HanBaoQuan/Đàm Hoa Liên/Quyền Sư/Mai Liễu Chân/Tử Hào) đều đổ chung vào field " +
      "base.ThangThien_5_TriTan = 3.0 + điểm × heSo1(=0.8, ĐỒNG NHẤT qua sqlcmd cho cả 13 dòng DB, " +
      "không lệch theo job). ĐÍNH CHÍNH audit cũ: hiệu lực được kiểm tra ở HAI vị trí, không phải " +
      "'duy nhất 1 vị trí PK-chiêu' — A8_Players_02PhysicalAttack.cs (PK đòn tay, ~dòng 1868) VÀ " +
      "A8_Players_03MagicAttack.cs (PK đòn chiêu, ~dòng 1155); cả 2 đều chỉ trong ngữ cảnh PK (đối " +
      "tượng là Players khác, không xuất hiện trong PvE tay/chiêu). Cả 2 nơi đều dùng RNG.Next(1,125) " +
      "— ĐÍNH CHÍNH audit cũ: đây là lớp RNG.cs tĩnh dùng CHUNG server (RNGCryptoServiceProvider), " +
      "KHÔNG PHẢI 'new Random() riêng' như audit cũ khẳng định. Nếu ThangThien_5_TriTan + bonus > roll " +
      "và đối phương chưa có debuff → gắn trạng thái 1008002012 lên đối phương 1.5 giây. Trạng thái " +
      "1008002012 XÁC NHẬN LẠI không có hiệu ứng giảm chỉ số/khống chế nào — cả lúc gắn (không case " +
      "riêng nào xử lý stat) lẫn lúc hết hạn (X_Them_Vao_Trang_Thai_Loai.cs case 1008002012 chỉ xoá " +
      "khỏi danh sách + broadcast, không rollback gì) — tác dụng thực tế duy nhất là cờ hiệu ứng " +
      "hình ảnh/danh hiệu phía client, không thể xác minh thêm từ code server.",
    trangThai: "CHET_HOAN_TOAN",
    ghiChu:
      "KHÁC audit cũ: xác nhận CÓ 2 điểm tiêu thụ (PK-tay VÀ PK-chiêu), không phải 1; và RNG dùng là " +
      "lớp tĩnh RNG.cs chung server, không phải 'new Random()' riêng. Gán: PlayersBes.cs " +
      "UpdateKhiCong() case 615/667-678 dòng 10373-10387. Cổng học: ReadCharacterData() dòng " +
      "7513-7606. Tiêu thụ: A8_Players_02PhysicalAttack.cs dòng ~1868 (PK tay); A8_Players_03" +
      "MagicAttack.cs dòng ~1155 (PK chiêu); hết hạn debuff: X_Them_Vao_Trang_Thai_Loai.cs case " +
      "1008002012 dòng 1716-1721. DB 升天气功 (气功ID=615,667-678): heSo1=0.8 đồng nhất mọi dòng; mỗi " +
      "KhiCongID chỉ có đúng 1 cờ nghề=1 tương ứng job của nó (khớp idTheoJob). Về bản chất vẫn là " +
      "khí công chết dù có code gán/tiêu thụ đầy đủ ở cả 2 nơi.",
  },
  {
    index: null,
    id: 620,
    ten: "Tinh Kim Bách Luyện (Thăng Thiên 6 thức - 1)",
    loai: "thang_thien",
    heSo1: 5.0,
    heSo2: null,
    batBuocThangThien: 11,
    apDungJob: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    idTheoJob: {
      1: 620, 2: 621, 3: 622, 4: 623, 5: 624, 6: 625, 7: 626,
      8: 627, 9: 628, 10: 629, 11: 630, 12: 631, 13: 632,
    },
    moTa:
      "CƠ CHẾ MÔ TẢ LẠI HOÀN TOÀN so với audit cũ — KHÔNG PHẢI so sánh PK với đối phương. 13 mã " +
      "KhiCongID (620-632, mỗi mã 1 nghề) đổ chung vào base.TinhKimBachLuyen_TT6_1 = điểm × heSo1 " +
      "(=5.0, ĐỒNG NHẤT cả 13 dòng DB qua sqlcmd — không lệch theo job như nghi vấn trước đó). CÙNG " +
      "case gán này CÒN set base.GiamCuongKhi = điểm × (heSo1+1) = điểm × 6.0 (PlayersBes.cs dòng " +
      "10419-10420). Tiêu thụ DUY NHẤT tại getter FLD_NhanVatCoBan_CongKich (PlayersBes.cs dòng " +
      "2174+2179): num = max(0, TinhKimBachLuyen_TT6_1 − GiamTanCong), cộng vào công kích cơ bản của " +
      "CHÍNH NGƯỜI CHƠI — mà GiamTanCong lại do id633 (Huyết Khí Cường Dương) CỦA CHÍNH NGƯỜI CHƠI ĐÓ " +
      "set (không phải đối phương!). Kết quả: bonus công kích thật = 5.0 × max(0, điểm620 − điểm633) " +
      "— một cơ chế ĐÁNH ĐỔI công/thủ trong CÙNG 1 nhân vật, áp dụng ĐỀU cho mọi trận đấu (PvE tay, " +
      "PvE chiêu, PK tay, PK chiêu) vì getter này được đọc rộng khắp trong code combat, không giới " +
      "hạn PK. Đã grep toàn bộ A8_Players_01..04 và NpcClass.cs: KHÔNG có bất kỳ chỗ nào đọc trực " +
      "tiếp TinhKimBachLuyen_TT6_1/HuyetKhiCuongDuong_TT6_2 để so sánh với đối phương như audit cũ mô " +
      "tả (trích dẫn ~Players.cs 40729-46011 của audit cũ không còn tồn tại/không đúng ở dạng đó).",
    trangThai: "BINH_THUONG",
    ghiChu:
      "KHÁC audit cũ (2 điểm): (1) heSo1 1.0→5.0 (DB thật, đồng nhất mọi job, KHÔNG phải 'biến thiên " +
      "theo job' như nghi vấn ban đầu); (2) cơ chế là đánh đổi công/thủ CỦA CHÍNH NGƯỜI CHƠI qua cặp " +
      "GiamTanCong/GiamCuongKhi, không phải so sánh PK với đối phương. Gán: PlayersBes.cs " +
      "UpdateKhiCong() case 620-632 dòng 10406-10421. Cổng học: ReadCharacterData() dòng 7513-7606. " +
      "Tiêu thụ: getter FLD_NhanVatCoBan_CongKich, PlayersBes.cs dòng 2162-2181 (dòng 2174, 2179). DB " +
      "升天气功 (气功ID=620-632): heSo1=5.0 đồng nhất mọi dòng; mỗi KhiCongID chỉ có đúng 1 cờ nghề=1 " +
      "tương ứng job của nó (khớp idTheoJob).",
  },
  {
    index: null,
    id: 633,
    ten: "Huyết Khí Cường Dương (Thăng Thiên 6 thức - 2)",
    loai: "thang_thien",
    heSo1: 6.0,
    heSo2: null,
    batBuocThangThien: 11,
    apDungJob: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    idTheoJob: {
      1: 633, 2: 634, 3: 635, 4: 636, 5: 637, 6: 638, 7: 639,
      8: 640, 9: 641, 10: 642, 11: 643, 12: 644, 13: 645,
    },
    moTa:
      "Nửa còn lại của cặp đánh đổi công/thủ với Tinh Kim Bách Luyện — xem cơ chế đầy đủ ở mục đó, " +
      "KHÔNG PHẢI so sánh PK với đối phương như audit cũ mô tả. 13 mã KhiCongID (633-645) đổ chung " +
      "vào base.HuyetKhiCuongDuong_TT6_2 = điểm × heSo1 (=6.0, ĐỒNG NHẤT cả 13 dòng DB). Cùng case " +
      "gán CÒN set base.GiamTanCong = điểm × (heSo1−1) = điểm × 5.0 (PlayersBes.cs dòng 10435-10436) " +
      "— chính field này trừ vào công kích ở id620. Tiêu thụ tại getter Tong_CuongKhi (PlayersBes.cs " +
      "dòng 2260+2265): num = max(0, HuyetKhiCuongDuong_TT6_2 − GiamCuongKhi) — GiamCuongKhi do id620 " +
      "CỦA CHÍNH NGƯỜI CHƠI set. Tong_CuongKhi này được cộng trực tiếp vào getter " +
      "FLD_NhanVatCoBan_PhongNgu (phòng ngự cơ bản thật dùng trong combat, PlayersBes.cs dòng 2213) " +
      "— nên bonus phòng ngự thật = 6.0 × max(0, điểm633 − điểm620), áp dụng đều PvE/PK, tay/chiêu. " +
      "Tong_CuongKhi cũng là chỉ số 'Cường Khí' gửi cho client — KHÔNG chỉ là hiển thị suông như audit " +
      "cũ mô tả, nó đồng thời là phần phòng ngự thật đang dùng trong tính sát thương.",
    trangThai: "BINH_THUONG",
    ghiChu:
      "KHÁC audit cũ (3 điểm): (1) heSo1 1.0→6.0 (DB thật, đồng nhất mọi job); (2) cơ chế là đánh đổi " +
      "công/thủ CỦA CHÍNH NGƯỜI CHƠI, không phải so sánh PK; (3) Tong_CuongKhi/'Cường Khí' không chỉ " +
      "hiển thị mà còn cộng thật vào phòng ngự cơ bản. Gán: PlayersBes.cs UpdateKhiCong() case " +
      "633-645 dòng 10422-10437. Cổng học: ReadCharacterData() dòng 7513-7606. Tiêu thụ: getter " +
      "Tong_CuongKhi, PlayersBes.cs dòng 2256-2267; getter FLD_NhanVatCoBan_PhongNgu dòng 2205-2215 " +
      "(dòng 2213 cộng Tong_CuongKhi). DB 升天气功 (气功ID=633-645): heSo1=6.0 đồng nhất mọi dòng; mỗi " +
      "KhiCongID chỉ có đúng 1 cờ nghề=1 tương ứng job của nó (khớp idTheoJob).",
  },
];

export function khiCongDungChungTheoJobV24(job: number): KhiCongEntry[] {
  return KHICONG_DUNG_CHUNG_V24.filter((entry) => entry.apDungJob.includes(job)).map((entry) => {
    const idThat = entry.idTheoJob?.[job] ?? entry.id;
    return { ...entry, id: idThat };
  });
}
