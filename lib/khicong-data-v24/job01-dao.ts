import type { NgheData } from "../khicong-data/types";

// Đối chiếu Ver24 THẬT — đọc lại code SRCGameServerV24B hiện tại (không dùng lại audit cũ 02/09
// mà không kiểm chứng), biên soạn 15/09/2026. Toàn bộ 19 mục (12 "goc" + 7 "thang_thien") đã được
// tái xác minh độc lập bằng cách đọc trực tiếp code gán (PlayersBes.cs) + code tiêu thụ (các file
// Players hiện tại) + đối chiếu hệ số heSo1/heSo2 với DB SỐNG qua sqlcmd (không dùng lại số cache
// trong audit cũ). Hai phần (goc/thang_thien) được đọc chéo bởi 2 lượt tái xác minh trong cùng
// phiên làm việc rồi hợp nhất — các kết luận trùng khớp giữa 2 lượt được giữ nguyên độ tin cậy cao;
// một khác biệt duy nhất giữa 2 lượt (id181, xem ghi chú tại mục đó) được cân nhắc và quyết định
// dựa trên mức độ ảnh hưởng thực tế tới gameplay, không chỉ dựa theo số liệu.
//
// LƯU Ý QUAN TRỌNG VỀ CẤU TRÚC FILE: kể từ lần audit trước, code chiến đấu đã được TÁCH FILE —
// Players.cs (bản gốc ~72000 dòng) không còn chứa PhysicalAttack/MagicAttack nữa. Logic đòn tay
// (PvE lẫn PK) hiện nằm ở Players\A8_Players_02PhysicalAttack.cs, logic chiêu (PvE lẫn PK) nằm ở
// Players\A8_Players_03MagicAttack.cs, xác nhận sát thương PK dùng chung nằm ở
// Players\A8_Players_04AttackConfirmation.cs. Khí công Thăng Thiên 4 (313/314) và 2 hàm dùng chung
// 升天四气功触发 / 组队升天四气功触发 thì VẪN còn nguyên trong Players.cs, không bị tách. UpdateKhiCong()
// (gán điểm khí công gốc, switch theo Player_Job rồi switch theo index 0-11 của mảng KhiCong[12],
// KHÔNG phải switch theo KhiCongID) nằm trong PlayersBes\PlayersBes.cs quanh dòng 9463-9513 cho
// job 1; khối gán khí công Thăng Thiên (switch theo KhiCongID thật, đọc từ vòng lặp
// DanhSach_ThangThienKhiCong) nằm cùng file quanh dòng 10096-10470. Trích dẫn "Players.cs ~dòng"
// trong audit 02/09 vì vậy có thể đã lệch SANG FILE KHÁC, không chỉ lệch số dòng.
//
// Đã đối chiếu hệ số heSo1/heSo2 với DB sống (bảng TBL_XWWL_SKILL cho khí công gốc, bảng 升天气功
// cho khí công Thăng Thiên) qua sqlcmd — RẤT NHIỀU hệ số đã đổi so với file audit cũ (xem ghiChu
// từng dòng); heSo1/heSo2 dưới đây là giá trị DB THẬT tại thời điểm audit này.
//
// 2 PHÁT HIỆN LỖI MỚI (CON_LOI_CHUA_SUA) không có trong audit 02/09, đã tự tay xác minh trực tiếp
// bằng code trong phiên này — xem chi tiết + trích dẫn dòng tại từng mục:
// - id17 (Chân vũ tuyệt kích): buff đồng đội VoCong_ID 401303 — handler LÚC CAST (A8_Players_03
//   MagicAttack.cs case 401303) chỉ còn cộng +10.0 cho job4/Cung, KHÔNG còn nhánh job1; nhưng
//   handler LÚC HẾT HẠN/TÁI CAST (X_Them_Vao_Trang_Thai_Loai.cs case 401303) vẫn giữ đủ switch
//   job1..12 TRỪ -10.0. Mỗi lần buff này được cast lên một Đao rồi hết hạn (hoặc bị tái cast sớm),
//   ChanVu_TuyetKich của người đó bị trừ vĩnh viễn -10.0 (kẹp sàn 0) mà KHÔNG hề được cộng lại.
// - id310 (Độn xuất nghịch cảnh): grep field DAO_ThangThien_1_KhiCong_DonXuatNghichCanh trên TOÀN
//   repo chỉ ra ĐÚNG 1 điểm tiêu thụ còn lại (PvE chiêu, A8_Players_03MagicAttack.cs ~3251) — nhánh
//   PK chiêu mà audit 02/09 từng ghi nhận đã KHÔNG CÒN tồn tại ở bất kỳ đâu trong code hiện tại;
//   khí công này hiện vô dụng hoàn toàn trong PK (cả tay lẫn chiêu).
// Ngoài 2 mục trên, KHÔNG tìm thấy file "PhanSatThuong.cs" hay các cờ cấu hình PhanSatThuong_VaLoiQuai/
// PhanDao_DaoVanAn/PhanDao_GocDonTayChiaDoi/PhanDao_PhanSauNe/PhanDao_MotRollMoiDon hay lệnh GM
// "!phandao" mà audit 02/09 (mục id15/id311) mô tả là "đã bật 03/09" — grep toàn bộ SRCGameServerV24B
// không ra kết quả nào. Cơ chế phản sát thương đọc trực tiếp từ code hiện tại vẫn hoạt động đúng
// (xem id15/id311) nên không đánh giá đây là lỗi, nhưng không thể xác nhận lại lịch sử "đã sửa".
export const JOB_01_DAO_V24: NgheData = {
  job: 1,
  tenNghe: "Đao",
  khiCong: [
    {
      index: 0,
      id: 10,
      ten: "Lục phách hoàn sơn",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Không đổi về cơ chế so với audit cũ. Cộng thẳng vào Công Kích GỐC, không phải một đòn/chiêu proc riêng. Công thức (PlayersBes.cs, UpdateKhiCong): num9 = FLD_CongKichThapNhat × điểm × heSo1 / 100 / 2 (tối thiểu 1) rồi FLD_NhanVat_KhiCong_CongKich = (int)(num9 + 0.5). Giá trị này được cộng thẳng vào FLD_NhanVatCoBan_CongKich (getter tổng hợp công kích cơ bản, PlayersBes.cs) nên có tác dụng ĐỀU cho mọi đòn đánh — PvE tay, PvE chiêu, PK tay, PK chiêu — không phân biệt, không roll ngẫu nhiên. heSo2 hiện = 0.0 trong DB (khác 0.01 trong audit cũ) nhưng vẫn KHÔNG được nhánh Đao đọc tới (case index=0 chỉ dùng num3=heSo1), nên khác biệt này không đổi hành vi thực tế.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs ~9468-9477 (switch Player_Job==1, switch index==0). Tiêu thụ: PlayersBes.cs ~2162-2179 (getter FLD_NhanVatCoBan_CongKich). DB TBL_XWWL_SKILL FLD_PID=10: heSo1=1.0 (khớp audit cũ), heSo2=0.0 (audit cũ ghi 0.01 — sai khác không ảnh hưởng vì heSo2 không được đọc).",
    },
    {
      index: 1,
      id: 11,
      ten: "Nhiếp hồn nhất kích",
      loai: "goc",
      heSo1: 0.01,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Không đổi so với audit cũ. Cộng thẳng vào Chính Xác (Trúng Địch) GỐC. Công thức: FLD_NhanVat_KhiCong_TrungDich = (int)(FLD_TrungDich × (0.1 + điểm×0.01)) — thêm tối đa 90% giá trị Trúng Địch gốc khi đầu đủ 80 điểm. Cộng vào chỉ số nền (getter tổng hợp Trúng Địch) nên áp dụng cho mọi đòn đánh, không phải proc ngẫu nhiên.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs ~9479 (switch index==1). Tiêu thụ: PlayersBes.cs ~2183-2201 (getter tổng hợp Trúng Địch). DB FLD_PID=11: heSo1=0.01, heSo2=0.0 — khớp hoàn toàn audit cũ.",
    },
    {
      index: 2,
      id: 12,
      ten: "Liên hoàn phi vũ",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Tỉ lệ proc đòn tay: DAO_LienHoanPhiVu = 10 + điểm×1.0 (tối đa 90 ở 80 điểm). CHỈ áp dụng cho ĐÒN TAY (đã xác nhận DAO_LienHoanPhiVu KHÔNG xuất hiện một lần nào trong A8_Players_03MagicAttack.cs — tức hoàn toàn vô dụng khi đánh chiêu). Đã đọc lại cả 2 nhánh đòn tay: PvE tay (A8_Players_02PhysicalAttack.cs, hàm tấn công quái) roll RNG.Next(1,100) <= giá trị; PK tay (cùng file, hàm tấn công người chơi, trong khối switch(base.Player_Job) case 1): roll num66=RNG.Next(1,100), nếu CHÍNH NGƯỜI THỰC HIỆN ĐÒN (Đao tấn công) đang TỰ mang debuff 'Độc Xà Xuất Động' (id314, gọi 检查毒蛇出洞状态() KHÔNG có tiền tố 'value.' — xác nhận là self-check trên base/this, không phải kiểm tra đối phương) thì num66×1000 trước khi so sánh (tự khoá proc gần như tuyệt đối). CẢ HAI nhánh hiện đều dùng RNG.Next(1,100) giống nhau — lỗi cũ 'PvE tay roll RNG.Next(1,80) trong khi trần giá trị là 90' KHÔNG còn tồn tại, xác nhận vẫn đang ở trạng thái đã sửa. Khi trúng, đòn tay gây sát thương gấp đôi (một số biến thể hiếm gấp 2.5).",
      trangThai: "DA_SUA",
      ghiChu:
        "Gán: PlayersBes.cs ~9482. Tiêu thụ: A8_Players_02PhysicalAttack.cs ~475 (PvE tay), ~1477-1486 (PK tay, trong switch(base.Player_Job) case 1; tự khoá bởi debuff id314 của CHÍNH MÌNH, không phải đối phương — đã đọc trực tiếp dòng 1477-1486 ngày 15/09/2026 để xác nhận, sửa lại một chi tiết sai trong bản nháp trước đó nói nhầm là kiểm tra 'mục tiêu'). Không xuất hiện trong A8_Players_03MagicAttack.cs (đã grep toàn file, 0 kết quả) — xác nhận chỉ đòn tay. DB FLD_PID=12: heSo1=1.0, heSo2=0.0 — khớp audit cũ.",
    },
    {
      index: 3,
      id: 14,
      ten: "Cuồng phong vạn phá",
      loai: "goc",
      heSo1: 3000.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Không đổi so với audit cũ. Không phải proc sát thương mà kéo dài THỜI LƯỢNG buff 'Nộ Khí Xung Thiên' (id trạng thái 700014, tự kích hoạt khi thanh Nộ/SP đầy, NoKhi=true). Công thức: CuongPhong_VanPha = điểm × 3000.0 (mili-giây). Khi kích hoạt, thời lượng buff = 10000 + (int)CuongPhong_VanPha: 10 giây cơ bản, cộng thêm 3 giây/điểm, tối đa +240 giây (4 phút) ở 80 điểm. Đây là field DÙNG CHUNG với vài nghề khác (job 2, 3 cũng ghi vào cùng field qua nhánh riêng của họ) nhưng công thức thời lượng đọc field này là chung, không phân biệt tay/chiêu, PvE/PK.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs ~9485. Tiêu thụ (thời lượng buff 700014): Players.cs ~61865-61868. DB FLD_PID=14: heSo1=3000.0 (khớp audit cũ), heSo2=0.0 (audit cũ ghi 0.05 nhưng code case index=3 chỉ dùng num3=heSo1, không đọc heSo2 — không ảnh hưởng).",
    },
    {
      index: 4,
      id: 19,
      ten: "Kim cang bất quái",
      loai: "goc",
      heSo1: 0.003,
      heSo2: 2.0,
      batBuocThangThien: null,
      moTa:
        "Cơ chế không đổi so với audit cũ nhưng hệ số DB đã giảm 10 LẦN: hai hiệu ứng passive song song, không roll — (1) cộng thêm % Phòng Ngự gốc = FLD_PhongNgu × điểm × heSo1 (nay chỉ 0.003, TRƯỚC LÀ 0.03 — ở 80 điểm chỉ còn +24% thay vì +240% phòng ngự); (2) cộng thẳng HP tối đa = điểm × heSo2 (2.0, không đổi). Áp dụng đều cho mọi tình huống chiến đấu vì là chỉ số nền, không phải proc theo đòn.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs ~9488-9489. Tiêu thụ: PlayersBes.cs ~2213 (FLD_NhanVat_KhiCong_PhongNgu vào getter phòng ngự cơ bản), NhanVat_KhiCong_ThemVao_HP cộng vào tổng HP tối đa ở nhiều nơi. DB FLD_PID=19: heSo1=3.0E-3 (audit cũ ghi 0.03 — LỆCH 10 LẦN, đã cập nhật lại đúng giá trị DB sống), heSo2=2.0 (khớp audit cũ). Đây là thay đổi cân bằng (nerf) chứ không phải lỗi code.",
    },
    {
      index: 5,
      id: 16,
      ten: "Bá khí phá giáp",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 0.6,
      batBuocThangThien: null,
      moTa:
        "ĐỌC LẠI TOÀN BỘ 4 NHÁNH — kết luận khác audit cũ về CƠ CHẾ dù kết quả cuối cùng vẫn đúng. Tỉ lệ proc: PhaGiap_TiLe = 5 + điểm×1.0 (tối đa 85% ở 80 điểm, roll RNG.Next(1,110) — đúng ở cả 4 nhánh). Thực tế TẤT CẢ 4 nhánh (PvE tay, PK tay, PvE chiêu, PK chiêu) đều dùng CÙNG một dòng lệnh `biếnPhongNguDoiPhuong *= 得到气功加成值(1, 5, 2)` — tức nhân THẲNG hệ số heSo2 vào biến phòng ngự của MỤC TIÊU (quái hoặc người chơi đối phương), không có bất kỳ biến đổi (2.0-heSo) nào trong code ở cả 4 nơi. Audit cũ (02/09) cho rằng PvE nhân vào sát thương của chính mình (không có lỗi) còn PK nhân vào phòng ngự đối phương rồi ĐÃ SỬA bằng công thức (2.0-heSo)=0.8 — CẢ HAI ý đều KHÔNG khớp code hiện tại: PvE cũng nhân vào phòng ngự đối phương y hệt PK, và không có công thức (2.0-heSo) nào tồn tại. Sở dĩ kỹ năng vẫn hoạt động ĐÚNG (giảm giáp đối phương) là vì hệ số heSo2 trong DB hiện = 0.6 (< 1.0) — tức bản sửa lỗi thực chất nằm ở PHÍA DỮ LIỆU (hạ heSo2 từ 1.2 xuống 0.6) chứ không phải sửa code như audit cũ mô tả. Hệ quả: nếu heSo2 DB lỡ bị chỉnh về ≥1.0 trong tương lai, TẤT CẢ 4 nhánh (không riêng PK) sẽ lập tức quay lại lỗi 'tự tăng giáp đối phương' vì code không có safeguard nào.",
      trangThai: "DA_SUA",
      ghiChu:
        "Gán: PlayersBes.cs ~9492. Tiêu thụ (đọc lại cả 4): A8_Players_02PhysicalAttack.cs ~111-115 (PvE tay, nhân vào num2=phòng ngự quái), ~1059-1063 (PK tay, nhân vào num35=phòng ngự đối phương, trừ hao theo phản-khí-công của đối phương); A8_Players_03MagicAttack.cs ~3137-3140 (PvE chiêu, npcTemp), ~392-398 (PK chiêu, value2). Hàm dùng chung 得到气功加成值(job,index,type) (PlayersBes.cs ~9144) CHỈ trả nguyên giá trị DB, không có logic (2.0-x) nào. DB FLD_PID=16: heSo1=1.0 (audit cũ 0.88 — lệch), heSo2=0.6 (audit cũ 1.2 — lệch, và đây chính là chỗ 'đã sửa' thật sự nằm ở DB chứ không phải code).",
    },
    {
      index: 6,
      id: 181,
      ten: "Khí trầm đan điền (Đao)",
      loai: "goc",
      heSo1: 0.005,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Cơ chế code KHÔNG đổi so với audit cũ (logic vẫn đúng thiết kế) nhưng hệ số DB đã giảm 100 LẦN, khiến khí công gần như VÔ NGHĨA trên thực tế. Passive không roll: DonKhi_DanDien = điểm × heSo1 (nay chỉ 0.005, TRƯỚC LÀ 0.5 trong audit cũ). Ngay sau vòng lặp UpdateKhiCong, nếu DonKhi_DanDien>0: num10=(int)(FLD_PhongNgu × DonKhi_DanDien/100.0), cộng vào CẢ NhanVat_KhiCong_ThemVao_HP LẪN NhanVat_KhiCong_ThemVao_LucPhongNguVoCong (ULPT). Ở 80 điểm, DonKhi_DanDien chỉ = 0.4 (thay vì 40 như thiết kế cũ) → num10 ≈ FLD_PhongNgu × 0.004, tức chỉ vài đến vài chục điểm HP/ULPT dù đầu tối đa điểm trên nhân vật cấp cao — KHÁC BIỆT VỀ CHẤT so với các khí công khác cũng bị giảm hệ số DB (vd id19 giảm 10 lần vẫn còn +24% phòng ngự, id570 giảm 5 lần vẫn còn HP đáng kể): mức giảm 100 lần ở đây đưa hiệu quả về gần bằng KHÔNG, không còn là một mức 'nerf cân bằng' bình thường mà giống lỗi cấu hình dữ liệu (thiếu 2 số 0 hoặc nhầm dấu phẩy 0.5→0.005).",
      trangThai: "CON_LOI_CHUA_SUA",
      ghiChu:
        "Gán + tiêu thụ (cùng chỗ, code không đổi): PlayersBes.cs ~9495 (gán) và ~10073-10078 (áp dụng). DB FLD_PID=181: heSo1=5.0E-3 (audit cũ ghi 0.5 — LỆCH 100 LẦN), heSo2=0.0 (khớp, không được đọc). Xếp CON_LOI_CHUA_SUA vì mức lệch bất thường (đúng 100 lần, dạng lỗi dịch dấu phẩy thập phân điển hình) khiến khí công thực tế vô dụng dù code chạy đúng — khác với các mục DB-drift khác trong file này (id19/id110/id312/id570/id679) vẫn giữ BINH_THUONG vì hiệu quả còn lại vẫn có ý nghĩa. CẦN GM XÁC MINH VÀ CÂN NHẮC SỬA LẠI GIÁ TRỊ DB.",
    },
    {
      index: 7,
      id: 17,
      ten: "Chân vũ tuyệt kích",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 1.3,
      batBuocThangThien: null,
      moTa:
        "PHÁT HIỆN LỖI MỚI — đảo ngược kết luận 'không phải bug' của audit cũ (bản re-check 03/09). Tỉ lệ proc = ChanVu_TuyetKich = điểm × 1.0 (tối đa 80% ở 80 điểm). Xác nhận lại: CHỈ xuất hiện ở CHIÊU (nhiều biến thể PvE/PK trong A8_Players_03MagicAttack.cs), hoàn toàn KHÔNG xuất hiện trong A8_Players_02PhysicalAttack.cs (đòn tay) — đầu điểm vào khí công này vẫn vô dụng khi đánh tay. Khi trúng, sát thương chiêu nhân thêm hệ số heSo2=1.3 (+30%), trừ khi đối phương có 'Hàn Bạo Quân_Chân Khí Hoàn Nguyên' phản lại (×1.0, vô hiệu proc). VẤN ĐỀ: skill buff đồng đội VoCông_ID 401303 CHỈ CÒN cộng +10.0 cho DUY NHẤT job4 (Cung, field CUNG_TriMenhTuyetSat) tại thời điểm cast (A8_Players_03MagicAttack.cs, case 401303) — nhánh cộng +10.0 cho job1 (và các job 2,3,5,6,7,8,9,12 khác từng có) ĐÃ BIẾN MẤT khỏi handler lúc cast. Trong khi đó, handler lúc HẾT HẠN buff (X_Them_Vao_Trang_Thai_Loai.cs, case 401303) VẪN CÒN đầy đủ nhánh trừ -10.0 cho tất cả các job kể trên, kể cả job1 (Play.ChanVu_TuyetKich -= 10.0, có kẹp sàn 0). Đã grep toàn bộ codebase cho field 'ChanVu_TuyetKich': không tìm thấy bất kỳ chỗ nào khác cộng +10.0. Hệ quả thực tế: cast buff 401303 lên một Đao hiện KHÔNG cộng gì cả, nhưng mỗi lần buff đó hết hạn tự nhiên hoặc bị tái cast (kích hoạt expire-sớm) vẫn trừ -10.0 khỏi ChanVu_TuyetKich của người đó — một chiều, không đối xứng, làm giảm dần (rồi kẹp về 0) tỉ lệ proc thật của khí công này mỗi vòng buff.",
      trangThai: "CON_LOI_CHUA_SUA",
      ghiChu:
        "Gán: PlayersBes.cs ~9498. Tiêu thụ (chiêu, nhiều biến thể PvE/PK): A8_Players_03MagicAttack.cs ~576-587 (PK), ~3231+ (PvE) và các bản sao ~724,953,1069,3369,3581,3677 cho các dạng chiêu khác. LỖI: cast-handler case 401303 chỉ có 'if (player_Job==4) CUNG_TriMenhTuyetSat += 10.0' tại A8_Players_03MagicAttack.cs ~1726-1750 (không có nhánh job1); expire-handler case 401303 vẫn đủ switch(Play.Player_Job) job1..12 trừ -10.0 tại X_Them_Vao_Trang_Thai_Loai.cs ~202-276. DB FLD_PID=17: heSo1=1.0, heSo2=1.3 — khớp audit cũ, không phải nguyên nhân lỗi.",
    },
    {
      index: 8,
      id: 15,
      ten: "Tữ lưỡng thiên kim",
      loai: "goc",
      heSo1: 0.6,
      heSo2: 0.3,
      batBuocThangThien: null,
      moTa:
        "Không phải proc sát thương của Đao mà là tỉ lệ PHẢN SÁT THƯƠNG khi bị đánh trúng. QuaiVat_PhanSatThuong_TiLe = 10 + điểm×heSo1 (phản khi bị QUÁI đánh) và NguoiChoi_PhanSatThuong_Tile = 3 + điểm×heSo2 (phản khi bị NGƯỜI CHƠI đánh — đã xác nhận dùng chung MỘT hàm xác nhận sát thương cho cả tay lẫn chiêu, không phải 2 bản riêng như audit cũ trích dẫn). ĐÍNH CHÍNH audit cũ: điều kiện phản đòn quái trong code hiện tại là 'sát thương quái gây > 0', KHÔNG PHẢI '> 50' như audit cũ ghi. ĐÍNH CHÍNH khác: bộ '4 cờ cấu hình PhanSatThuong.cs' (PhanSatThuong_VaLoiQuai, PhanDao_DaoVanAn, PhanDao_GocDonTayChiaDoi, PhanDao_PhanSauNe) mà audit cũ nói đã bật trên K2 ngày 03/09 KHÔNG TỒN TẠI trong codebase hiện tại (đã grep toàn repo + tìm file PhanSatThuong*.cs — không có kết quả nào). Thay vào đó code hiện tại là logic THUẦN, không qua cờ bật/tắt: phản đúng 100% sát thương vừa nhận (không chia đôi, không giảm), tối thiểu 1 — tức về HÀNH VI THỰC TẾ vẫn khớp trạng thái 'đã sửa' mà audit cũ mô tả, chỉ khác là không còn (hoặc chưa từng thấy được) cơ chế cờ cấu hình, mà là code cứng.",
      trangThai: "DA_SUA",
      ghiChu:
        "Gán: PlayersBes.cs ~9501-9502. Tiêu thụ PvE (phản quái): X3_NpcClass\\NpcClass.cs ~1425 (điều kiện num10>0, không phải >50). Tiêu thụ PK (phản người, dùng chung tay+chiêu): Players\\A8_Players_04AttackConfirmation.cs ~265-297. Không tìm thấy PhanSatThuong_VaLoiQuai/PhanDao_DaoVanAn/PhanDao_GocDonTayChiaDoi/PhanDao_PhanSauNe/PhanDao_MotRollMoiDon ở bất kỳ đâu trong repo (Grep + Glob rỗng). DB FLD_PID=15: heSo1=0.6 (audit cũ 1.0 — lệch), heSo2=0.3 (khớp).",
    },
    {
      index: 9,
      id: 18,
      ten: "Ám ảnh sát kích",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 1.3,
      batBuocThangThien: null,
      moTa:
        "Không đổi cơ chế so với audit cũ. Tỉ lệ proc = 5 + điểm×1.0 (tối đa 85% ở 80 điểm). Xác nhận lại phạm vi: xuất hiện ở PvE tay (RNG.Next(1,100) < giá trị — chú ý dấu '<' chặt, không phải '<='), PvE chiêu, PK chiêu (nhiều biến thể). Đã grep toàn A8_Players_02PhysicalAttack.cs: field AmAnh_TuyetSat chỉ xuất hiện đúng 1 lần, ở nhánh PvE tay — xác nhận vẫn KHÔNG xuất hiện ở PK tay như audit cũ kết luận. Khi trúng, nhân sát thương thêm heSo2=1.3 (+30%, audit cũ ghi 1.2 — DB đã đổi nhẹ).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs ~9505. Tiêu thụ: A8_Players_02PhysicalAttack.cs ~207 (PvE tay, dấu <); A8_Players_03MagicAttack.cs ~589 (PK chiêu), ~966/~3236/~3586 (PvE chiêu, các biến thể). DB FLD_PID=18: heSo1=1.0 (khớp), heSo2=1.3 (audit cũ 1.2 — lệch nhẹ).",
    },
    {
      index: 10,
      id: 312,
      ten: "Mãnh long sát trận",
      loai: "goc",
      heSo1: 0.8,
      heSo2: 0.15,
      batBuocThangThien: null,
      moTa:
        "Không đổi cơ chế so với audit cũ. Tỉ lệ proc = DAO_ManhLongSatTran = điểm × heSo1. CHỈ xuất hiện ở CHIÊU (PvE + PK, trong A8_Players_03MagicAttack.cs), hoàn toàn không có trong file đòn tay. Ngưỡng roll thật sự là RNG.Next(1,120) <= DAO_ManhLongSatTran + ThangThien_5_HoaLongPhapChieu (khí công Thăng Thiên id679 'Long Hồn Phụ Thể' cộng dồn NGƯỠNG). Khi trúng, hệ số sát thương = heSo2, cộng dồn thêm nếu đã đầu tư khí công Thăng Thiên id13 'Hỏa Long Chi Hỏa' (num49 += num49 × DAO_ThangThien_3_KhiCong_HoaLong_ChiHoa), rồi sát thương ×(1.0+hệ số) — xác nhận đúng cơ chế 3 khí công cộng dồn (id312 ngưỡng gốc + id679 ngưỡng thêm + id13 khuếch đại sát thương) như audit cũ mô tả, chỉ khác hệ số DB.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs ~9508. Tiêu thụ: A8_Players_03MagicAttack.cs ~3241-3249 (PvE chiêu), ~594-602 (PK chiêu). DB FLD_PID=312: heSo1=0.8 (audit cũ 1.0 — lệch), heSo2=0.15 (audit cũ 0.3 — lệch, giảm một nửa).",
    },
    {
      index: 11,
      id: 110,
      ten: "Thiết huyết phùng linh",
      loai: "goc",
      heSo1: 0.001,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Không phải proc ngẫu nhiên — hệ số nhân cố định khi >0: LuuQuang_LoanVu = điểm × heSo1 (nay 0.001, audit cũ ghi 0.002 — giảm một nửa). Đã grep field LuuQuang_LoanVu trên TOÀN repo: hiện CHỈ CÒN đúng 1 điểm tiêu thụ (A8_Players_01SystemAttack.cs, CongKichLuc *= (1.0+LuuQuang_LoanVu)), so với 3 điểm audit cũ trích dẫn — có thể các nhánh 'tăng số mục tiêu diện rộng' cũ đã bị gộp/xoá trong lần tái cấu trúc code. Field này KHÔNG xuất hiện trong A8_Players_02PhysicalAttack.cs lẫn A8_Players_03MagicAttack.cs (2 file xử lý tấn công PvP), khớp kết luận audit cũ rằng khí công này KHÔNG có tác dụng trong bất kỳ nhánh PK nào — chỉ có tác dụng trong PvE qua hàm SystemAttack.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs ~9511. Tiêu thụ: A8_Players_01SystemAttack.cs ~630 (điểm duy nhất còn lại sau tái cấu trúc). DB FLD_PID=110: heSo1=0.001 (audit cũ 0.002 — lệch một nửa), heSo2=0.0 (audit cũ ghi 1.0 nhưng case index=11 chỉ dùng num3=heSo1, không đọc heSo2 — không ảnh hưởng).",
    },
    {
      index: null,
      id: 13,
      ten: "Thăng thiên 3 - Hỏa long chi hỏa",
      loai: "thang_thien",
      heSo1: 0.007,
      heSo2: null,
      batBuocThangThien: 8,
      moTa:
        "Không đổi so với audit cũ. Không tự roll, chỉ CỘNG DỒN vào sát thương khi khí công gốc Mãnh Long Sát Trận (idx10/id312) đã proc: num49 += num49 × DAO_ThangThien_3_KhiCong_HoaLong_ChiHoa trước khi nhân vào sát thương chiêu. KHÔNG có tác dụng ở đòn tay, và KHÔNG có tác dụng nếu Mãnh Long Sát Trận chưa proc (điều kiện lồng bên trong khối if của id312).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs ~10103 (switch value.KhiCongID trong khối ascension, case 13). Tiêu thụ: A8_Players_03MagicAttack.cs ~3244-3249 (PvE chiêu), ~598-602 (PK chiêu). DB bảng 升天气功, 气功ID=13: heSo1=0.007 — khớp hoàn toàn audit cũ.",
    },
    {
      index: null,
      id: 310,
      ten: "Thăng thiên 1 - Độn xuất nghịch cảnh",
      loai: "thang_thien",
      heSo1: 0.5,
      heSo2: null,
      batBuocThangThien: 6,
      moTa:
        "PHÁT HIỆN REGRESSION NGHIÊM TRỌNG — mất hoàn toàn nhánh PK. Đã grep field DAO_ThangThien_1_KhiCong_DonXuatNghichCanh trên TOÀN repo: chỉ còn ĐÚNG 1 điểm tiêu thụ trong toàn bộ code, nằm trong khối PvE-chiêu (A8_Players_03MagicAttack.cs, đoạn tấn công npcTemp) — KHÔNG CÒN xuất hiện ở PK chiêu (đã đọc kỹ khối PK-chiêu xử lý các khí công job1 khác như Bá Khí Phá Giáp/Chân Vũ Tuyệt Kích/Ám Ảnh Sát Kích/Mãnh Long Sát Trận cùng khu vực — không có nhánh id310 nào ở đó), và tất nhiên cũng không có ở đòn tay (PvE lẫn PK). Công thức tại nơi còn hoạt động (PvE chiêu): giá trị proc = 0.5 + điểm×heSo1 (audit cũ không nhắc phần '0.5 +' cố định này). Pha 1 — nếu chưa có buff riêng (id trạng thái 700310), roll RNG.Next(1,110) <= giá trị (audit cũ ghi 'RNG.Next(0,110) <' — đã xác nhận lại chính xác là Next(1,110) và dấu '<='); trúng thì cộng NGAY +10% tỉ lệ phòng ngự (AddFLD_ThemVaoTiLePhanTram_PhongNgu(0.1)) và +30% hệ số tấn công võ công (FLD_NhanVat_KhiCong_LucCongKichVoCongGiaTang_TiLePhanTram += 0.3) trong 10 giây — đây là cộng thẳng ngay khi proc, không phải chỉ dành riêng cho 'đòn kế tiếp' như audit cũ diễn giải. Pha 2 — trong lúc buff còn hiệu lực, không roll lại (cờ AppendStatusList.ContainsKey(700310) chặn roll mới), các chỉ số cộng thêm vẫn phát huy tác dụng liên tục cho tới khi hết 10 giây. TÓM LẠI: đầu tư khí công này hiện HOÀN TOÀN VÔ DỤNG trong PK (tay lẫn chiêu) — chỉ còn tác dụng khi đánh quái bằng chiêu.",
      trangThai: "CON_LOI_CHUA_SUA",
      ghiChu:
        "Gán: PlayersBes.cs ~10191 (0.5 + num11×num12). Tiêu thụ: A8_Players_03MagicAttack.cs ~3251-3264 — ĐÂY LÀ ĐIỂM TIÊU THỤ DUY NHẤT TÌM ĐƯỢC (grep field trên toàn repo). So với audit cũ trích dẫn 2 nơi (PvE chiêu + PK chiêu), hiện chỉ còn PvE chiêu. Cần Admin xác nhận đây là regression ngoài ý muốn hay chủ đích thiết kế lại. DB 气功ID=310: heSo1=0.5 — khớp audit cũ.",
    },
    {
      index: null,
      id: 311,
      ten: "Thăng thiên 2 - Cùng đồ mạt lộ",
      loai: "thang_thien",
      heSo1: 0.5,
      heSo2: null,
      batBuocThangThien: 7,
      moTa:
        "Không phải khí công tấn công độc lập — là NHÁNH THỨ HAI của hệ thống phản sát thương dùng chung với khí công gốc Tữ Lưỡng Thiên Kim (idx8/id15), nằm ngay trong cùng khối code phản đòn (A8_Players_04AttackConfirmation.cs). Sau khi nhánh NguoiChoi_PhanSatThuong_Tile (id15) đã proc thành công, roll thêm RNG.Next(1,100) <= DAO_ThangThien_2_KhiCong_CungDoMatLo (ĐÍNH CHÍNH audit cũ: mẫu số hiện là 100, không phải 110); nếu trúng, nhân đôi lượng sát thương phản (num2 *= 2) — đúng '200% sát thương' như audit cũ mô tả, chỉ lệch mẫu số roll.",
      trangThai: "DA_SUA",
      ghiChu:
        "Gán: PlayersBes.cs ~10194. Tiêu thụ: A8_Players_04AttackConfirmation.cs ~274 (lồng bên trong khối proc của id15, dùng chung logic 'không còn cờ cấu hình PhanSatThuong.cs' — xem chi tiết đầy đủ ở ghi chú idx8/id15). DB 气功ID=311: heSo1=0.5 — khớp audit cũ.",
    },
    {
      index: null,
      id: 313,
      ten: "Thăng thiên 4 - Hồng nguyệt cuồng phong",
      loai: "thang_thien",
      heSo1: 0.5,
      heSo2: null,
      batBuocThangThien: 9,
      moTa:
        "SỬA LẠI PHẠM VI so với audit cũ — hiện hoạt động ở CẢ 4 ĐƯỜNG, không loại trừ PK tay. Buff đồng đội diện rộng (yêu cầu Level>=140 và Thăng Thiên>=9), field dùng chung ThangThien_4_HongNguyetCuongPhong (nhiều nghề khác ghi vào cùng field qua mã Thăng Thiên riêng của họ). Cơ chế qua 2 hàm dùng chung: (a) 组队升天四气功触发(this) — gọi VÔ ĐIỀU KIỆN ở đầu MỌI đòn PvE (cả tay lẫn chiêu), roll Random().Next(1,101) <= field của CHÍNH NGƯỜI ĐÁNH, khi trúng buff +150 công/+150 thủ trong 3 giây cho đồng đội quanh phạm vi 1000 (hoặc chính mình nếu đi solo); (b) 升天四气功触发(mục tiêu) — gọi ở CẢ PK tay lẫn PK chiêu khi có mục tiêu thật, roll Random().Next(1,101) < field của người đánh (dấu '<', khác dấu '<=' ở bản dùng chung), khi trúng buff +150 công/+150 thủ trong 5 giây cho đồng minh trong phạm vi 60 quanh người đánh — KHÔNG buff cho đối phương (đối phương bị loại trừ rõ ràng khỏi vòng lặp). Audit cũ (02/09) cho rằng PK tay 'rẽ sang nhánh id314 và return sớm' nên bỏ qua id313 — ĐỌC LẠI KỸ hàm 升天四气功触发 xác nhận nó kiểm tra id313 (dòng ~40075) VÀ id314 (dòng ~40118) trong CÙNG một hàm, không có return sớm nào giữa 2 khối — tức id313 vẫn được roll ở PK tay như PK chiêu.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs ~10197. Tiêu thụ: Players.cs, hàm 组队升天四气功触发 (~40293-40453, gọi PvE tay tại A8_Players_02PhysicalAttack.cs~107 và PvE chiêu tại A8_Players_03MagicAttack.cs~3227) và hàm 升天四气功触发 (~39935-40092, gọi PK tay tại A8_Players_02PhysicalAttack.cs~1860 và PK chiêu tại A8_Players_03MagicAttack.cs~1411). DB 气功ID=313: heSo1=0.5 — khớp audit cũ.",
    },
    {
      index: null,
      id: 314,
      ten: "Thăng thiên 4 - Độc xà xuất động",
      loai: "thang_thien",
      heSo1: 0.5,
      heSo2: null,
      batBuocThangThien: 9,
      moTa:
        "Kết luận 'RÀ LẠI 03/09' của audit cũ (BINH_THUONG, roll×1000 là khoá proc chứ không phải tăng cường) được xác nhận ĐÚNG sau khi đọc lại độc lập hôm nay. Debuff câm-proc: CHỈ được xét trong hàm dùng chung 升天四气功触发(mục tiêu) — hàm này CHỈ được gọi kèm mục tiêu thật ở PK tay (A8_Players_02PhysicalAttack.cs~1860) và PK chiêu (A8_Players_03MagicAttack.cs~1411); hàm PvE dùng chung 组队升天四气功触发 KHÔNG hề kiểm tra field ThangThien_4_DocXaXuatDong nên PvE vô tác dụng hoàn toàn — khớp audit cũ. Roll: Random().Next(1,101) < field CỦA NGƯỜI ĐÁNH, và mục tiêu chưa mang debuff (!Playe.检查毒蛇出洞状态()); khi trúng, gắn trạng thái 'Độc Xà Xuất Động' (id 1008001170, 3 giây) lên ĐỐI PHƯƠNG đang bị Đao tấn công. Đã xác nhận lại cơ chế roll×1000: tại nhiều điểm proc đặc trưng của nghề khác (vd Đàm Hoa Liên Nộ Hải Cuồng Lan ~A8_Players_02PhysicalAttack.cs~1449-1457, và ngay cả Liên Hoàn Phi Vũ của chính Đao ~1481-1486), nếu người đang thực hiện đòn tấn công mang debuff này, roll của HỌ bị nhân ×1000 TRƯỚC khi so sánh '<=' với khí công tương ứng (trần chỉ ~100-130) — khiến điều kiện gần như LUÔN SAI, tức PROC BỊ KHOÁ. Vậy Đao gắn khí công này lên đối thủ = tạm khoá một loạt proc đặc trưng của đối thủ trong 3 giây — đúng bản chất một khí công tấn công/khống chế, không phải bug.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs ~10200. Tiêu thụ: Players.cs, hàm 升天四气功触发 (~40118-40138 áp trạng thái lên mục tiêu). Điểm khoá proc (roll×1000) rải rác trong A8_Players_02PhysicalAttack.cs và A8_Players_03MagicAttack.cs, ví dụ đã đọc lại ~1449-1457 và ~1481-1486. DB 气功ID=314: heSo1=0.5 — khớp audit cũ.",
    },
    {
      index: null,
      id: 570,
      ten: "Khí công bí cấp (Thăng Thiên 6 thức - Đao)",
      loai: "thang_thien",
      heSo1: 0.02,
      heSo2: null,
      batBuocThangThien: 11,
      moTa:
        "Cơ chế cốt lõi không đổi (passive thuần, không roll, riêng cho Đao) nhưng công thức đã ĐƯỢC MỞ RỘNG và hệ số DB giảm 5 lần. Field DAO_HoaLong_DiemTinh = điểm × heSo1 (nay 0.02, audit cũ ghi 0.1). Công thức cộng vào HP tối đa hiện là: NhanVat_KhiCong_ThemVao_HP += (int)((FLD_PhongNgu + FLD_TrangBi_ThemVao_PhongNgu) × DAO_HoaLong_DiemTinh) — audit cũ chỉ ghi nhân với FLD_PhongNgu, code hiện tại CỘNG THÊM FLD_TrangBi_ThemVao_PhongNgu (phòng ngự từ trang bị) vào phần nhân, tức nền tính HP rộng hơn audit cũ mô tả (bù lại phần nào việc hệ số giảm 5 lần). Toàn bộ nằm gọn trong PlayersBes.cs (gán và tiêu thụ cùng chỗ), áp dụng đều cho mọi tình huống.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán + tiêu thụ (cùng chỗ): PlayersBes.cs ~10441-10442. DB 气功ID=570: heSo1=0.02 (audit cũ ghi 0.1 — LỆCH 5 LẦN, cần xác nhận với Admin đây là nerf chủ đích hay nhầm dữ liệu).",
    },
    {
      index: null,
      id: 679,
      ten: "[Đao] Khí công bí cấp thư (Thăng Thiên 5 thức - Long Hồn Phụ Thể)",
      loai: "thang_thien",
      heSo1: 0.4,
      heSo2: null,
      batBuocThangThien: 10,
      moTa:
        "Cơ chế không đổi so với audit cũ, chỉ hệ số DB tăng gấp đôi. Không tự roll — chỉ CỘNG DỒN vào NGƯỠNG PROC (không phải sát thương) của khí công gốc Mãnh Long Sát Trận (idx10/id312) qua field ThangThien_5_HoaLongPhapChieu = điểm × heSo1 (nay 0.4, audit cũ ghi 0.2). Xuất hiện đúng ở 2 vị trí trùng với Mãnh Long Sát Trận (PvE chiêu + PK chiêu, cùng dòng RNG.Next(1,120) <= DAO_ManhLongSatTran + ThangThien_5_HoaLongPhapChieu), KHÔNG có ở đòn tay, và không có tác dụng độc lập nếu chưa đầu tư Mãnh Long Sát Trận.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs ~10299. Tiêu thụ: A8_Players_03MagicAttack.cs ~3241 (PvE chiêu), ~594 (PK chiêu) — cộng dồn ngưỡng proc với id312, còn id13 cộng dồn hệ số sát thương khi đã proc. DB 气功ID=679: heSo1=0.4 (audit cũ ghi 0.2 — LỆCH gấp đôi, đã cập nhật đúng DB sống).",
    },
  ],
};
