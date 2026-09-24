import type { NgheData } from "../khicong-data/types";

// Đối chiếu Ver24 THẬT — đọc lại code SRCGameServerV24B hiện tại (không dùng lại audit cũ 02/09
// mà không kiểm chứng), biên soạn 15/09/2026.
//
// GHI CHÚ CẤU TRÚC QUAN TRỌNG phát hiện trong lần đối chiếu này: logic combat KHÔNG còn nằm
// trong Players.cs như audit cũ trích dẫn — Players.cs (71995 dòng) giờ chỉ còn phần khung/hỗ trợ.
// Toàn bộ công thức tay/chiêu đã được tách ra 2 file partial-class riêng:
//   - RxjhServer/Players/A8_Players_02PhysicalAttack.cs
//       PhysicalAttack_Npc()    = PvE đòn tay   (dòng 57-843)
//       PhysicalAttack_Player() = PK đòn tay    (dòng 844-2003)
//   - RxjhServer/Players/A8_Players_03MagicAttack.cs
//       MagicAttack_Player()    = PK chiêu      (dòng 56-1515)
//       MagicAttack_Buff()      = chiêu bổ trợ  (dòng 1516-2913)
//       MagicAttack_Npc()       = PvE chiêu, gọi ComputingAttack() (dòng 2914-3081)
//       ComputingAttack()       = PvE chiêu, phần tính sát thương  (dòng 3082-3814)
// Việc gán điểm đầu tư (UpdateKhiCong) vẫn nằm trong PlayersBes.cs (~9423-10586), nhưng số dòng
// đã dịch chuyển hoàn toàn so với audit 02/09 (lúc đó trích PlayersBes.cs:7889...). Tất cả số dòng
// dưới đây là số dòng THẬT đọc lại hôm nay 15/09/2026, không phải suy diễn từ audit cũ.
export const JOB_02_KIEM_V24: NgheData = {
  job: 2,
  tenNghe: "Kiếm",
  khiCong: [
    {
      index: 0,
      id: 20,
      ten: "Trường hồng quán nhật",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Khí công CĂN BẢN. UpdateKhiCong (PlayersBes.cs:9519) gán FLD_NhanVat_KhiCong_CongKich = điểm_hiệu_dụng × heSo1(1.0) — KHÔNG có phép chia /100/3 như audit cũ mô tả, chỉ là điểm×1.0 thẳng. Giá trị này được cộng trực tiếp (không nhân %) vào getter FLD_NhanVatCoBan_CongKich (PlayersBes.cs:2179), là công kích cơ bản dùng chung cho MỌI công thức sát thương (tay lẫn chiêu, PvE lẫn PK) — do đó vẫn đúng tinh thần 'cộng thẳng vào lực công kích gốc, áp dụng mọi đường đánh' như audit cũ kết luận, chỉ khác công thức chi tiết.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs:9519 (switch Player_Job case 2, i=0). Tiêu thụ: PlayersBes.cs:2162-2179 (property FLD_NhanVatCoBan_CongKich). Công thức audit cũ (FLD_LonNhatCongKich×điểm×1.0/100/3) KHÔNG khớp code hiện tại — đã cập nhật lại mô tả.",
    },
    {
      index: 1,
      id: 21,
      ten: "Bách biến thần hành",
      loai: "goc",
      heSo1: 0.1,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Gán FLD_NhanVat_ThemVaoTiLePhanTram_NeTranh = 0.1 + điểm×heSo1(0.1) (PlayersBes.cs:9522). Giá trị này nhân vào tổng né tránh theo công thức: (FLD_NeTranh + FLD_TrangBi_ThemVao_NeTranh + FLD_NhanVat_ThemVao_NeTranh + FLD_NhanVat_KhiCong_NeTranh) × (1.0 + FLD_NhanVat_ThemVaoTiLePhanTram_NeTranh + FLD_TrangBi_ThemVao_NeTranhTiLePhanTram) + NhanVat_WX_BUFF_NeTranh — baseline 10% ngay cả 0 điểm, đúng như audit cũ.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs:9522. Tiêu thụ: PlayersBes.cs:2236-2252 (getter tổng né tránh võ công). Xác nhận khớp audit cũ, không đổi.",
    },
    {
      index: 2,
      id: 22,
      ten: "Liên hoàn phi vũ",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "CHỈ áp dụng đòn TAY (không có nhánh chiêu — đúng thiết kế, không phải lỗi). Gán base.KIEM_LienHoanPhiVu = 10.0 + điểm×1.0 (PlayersBes.cs:9525). PvE-tay (A8_Players_02PhysicalAttack.cs:510): roll RNG.Next(1,100) <= giá trị — ĐÃ SỬA đúng như audit cũ ghi (không còn roll 1-80 bị lỗi luôn-100%). PK-tay (cùng file dòng 1518): roll RNG.Next(1,100), nhân ×1000 nếu người tung đòn đang dính debuff 'Độc Xà Xuất Động' (khiến gần như không thể trúng — xác nhận cơ chế khoá kỹ năng của id324 vẫn hoạt động). Về việc chống cộng dồn với Nộ Hải Cuồng Lan (idx7, id28): KHÔNG tìm thấy cờ 'daNoNoHaiCuongLan' như audit cũ mô tả — nhưng cơ chế thực tế vẫn không cho cộng dồn nhân, vì Liên Hoàn Phi Vũ nằm trong 1 switch(Player_Job) ĐỘC LẬP, chạy SAU khối if Nộ Hải Cuồng Lan/Phá Thiên Nhất Kiếm, và khi trúng nó GHI ĐÈ (=) biến sát thương từ đầu (dựa trên hiệu công/thủ thô) thay vì nhân thêm (*=) — nên nếu cả 2 cùng trúng, chỉ hiệu ứng Liên Hoàn Phi Vũ có tác dụng cuối cùng, không cộng dồn kiểu x2.6 như bug gốc. Kết luận: hiệu quả cuối (không stack) vẫn đúng tinh thần DA_SUA, nhưng cơ chế thật là 'ghi đè do thứ tự code', không phải cờ loại trừ tường minh — audit cũ mô tả sai chi tiết kỹ thuật.",
      trangThai: "DA_SUA",
      ghiChu:
        "PvE tay: A8_Players_02PhysicalAttack.cs:475-509 (khối job1) / 510-556 (khối job2, case trong switch thứ 2 của PhysicalAttack_Npc). PK tay: A8_Players_02PhysicalAttack.cs:1511-1560 (PhysicalAttack_Player). Không có nhánh trong A8_Players_03MagicAttack.cs (xác nhận tay-only theo thiết kế).",
    },
    {
      index: 3,
      id: 23,
      ten: "Phá thiên nhất kiếm",
      loai: "goc",
      heSo1: 0.6,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "QUAY LẠI TRẠNG THÁI BUG GỐC (regression so với audit 02/09). Gán base.KIEM_PhaThien_NhatKiem = điểm×0.6×0.01 (PlayersBes.cs:9528) không roll, hệ số nhân thường trực khi ≠0. Rà toàn bộ repo cho biến 'KIEM_PhaThien_NhatKiem': CHỈ còn 2 nơi tiêu thụ — A8_Players_02PhysicalAttack.cs:220-222 (PvE đòn tay, trong PhysicalAttack_Npc) và A8_Players_03MagicAttack.cs:3273-3275 (PvE chiêu, trong ComputingAttack). KHÔNG còn xuất hiện trong PhysicalAttack_Player (PK tay) lẫn MagicAttack_Player (PK chiêu) — đã kiểm tra bằng grep toàn bộ 2 file, 0 kết quả. Tức là bản sửa 03/09 (bổ sung PK tay + PK chiêu) đã BỊ MẤT trong các lần chỉnh sửa code hôm nay — hiện tại đầu tư điểm vào khí công này CHỈ có tác dụng khi đánh quái (PvE), hoàn toàn vô hiệu trong PK (tay lẫn chiêu) — đúng y hệt bug ban đầu mà audit 02/09 từng phát hiện và tuyên bố đã sửa.",
      trangThai: "CON_LOI_CHUA_SUA",
      ghiChu:
        "REGRESSION xác nhận 15/09: gán tại PlayersBes.cs:9528. Tiêu thụ CÒN: A8_Players_02PhysicalAttack.cs:220,222 (PvE tay); A8_Players_03MagicAttack.cs:3273,3275 (PvE chiêu). Tiêu thụ MẤT: không có trong A8_Players_02PhysicalAttack.cs:844-2003 (PK tay) và A8_Players_03MagicAttack.cs:56-1515 (PK chiêu) — grep 'KIEM_PhaThien_NhatKiem' toàn repo chỉ ra đúng 6 kết quả (2 khai báo field, 1 gán, 1 reset-về-0, 2 tiêu thụ PvE).",
    },
    {
      index: 4,
      id: 24,
      ten: "Cuồng phong vạn phá",
      loai: "goc",
      heSo1: 3000.0,
      heSo2: 0.05,
      batBuocThangThien: null,
      moTa:
        "Gán base.CuongPhong_VanPha = điểm×3000 (PlayersBes.cs:9531 — field dùng chung tên với job1/3/4, mỗi job tự gán giá trị theo hệ số DB riêng). Tiêu thụ tại Players.cs:61867: int num2 = 10000 + (int)base.CuongPhong_VanPha — dùng làm thời lượng (ms) trạng thái Nộ Khí Xung Thiên (id trạng thái 700014) khi kích hoạt Nộ Khí, cho các job KHÔNG rơi vào nhánh riêng (job 3/5/10/11 có công thức thời lượng/hiệu ứng khác biệt bổ sung). Khớp đúng audit cũ: base 10000ms + 3000ms/điểm, tối đa +240000ms ở 80 điểm.",
      trangThai: "BINH_THUONG",
      ghiChu: "Gán: PlayersBes.cs:9531. Tiêu thụ: Players.cs:61865-61867 (nhánh else, áp dụng cho job2 vì không khớp job 3/5/10/11 phía trên).",
    },
    {
      index: 5,
      id: 26,
      ten: "Di hoa tiếp mộc",
      loai: "goc",
      heSo1: 0.4,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Gán base.KIEM_DiHoa_TiepMoc = điểm×0.4 (PlayersBes.cs:9534). Xác nhận có mặt đủ cả 4 đường đánh, roll đồng nhất RNG.Next(1,100) <= giá trị ở mọi nơi: PvE-tay (A8_Players_02PhysicalAttack.cs:754), PK-tay (cùng file :1896), PK-chiêu (A8_Players_03MagicAttack.cs:1438), PvE-chiêu (cùng file :3746, trong ComputingAttack). Khi trúng: hồi 50% sát thương vừa gây ra thành máu cho bản thân — khớp hoàn toàn audit cũ.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs:9534. Tiêu thụ: A8_Players_02PhysicalAttack.cs:754 (PvE tay), :1896 (PK tay); A8_Players_03MagicAttack.cs:1438 (PK chiêu), :3746 (PvE chiêu).",
    },
    {
      index: 6,
      id: 182,
      ten: "Khí trầm đan điền",
      loai: "goc",
      heSo1: 0.5,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Gán base.DonKhi_DanDien = điểm×0.5 (PlayersBes.cs:9537 — field dùng chung nhiều nghề, mỗi job tự gán theo hệ số riêng). Tiêu thụ tại 1 khối chung cho MỌI job (PlayersBes.cs:10073-10078, sau vòng lặp UpdateKhiCong chính): nếu DonKhi_DanDien > 0, cộng cả vào NhanVat_KhiCong_ThemVao_HP VÀ NhanVat_KhiCong_ThemVao_LucPhongNguVoCong (= FLD_PhongNgu × DonKhi_DanDien / 100, tức khí trầm đan điền thực chất quy đổi phòng ngự cơ bản thành cả HP lẫn phòng ngự võ công) — khớp tinh thần audit cũ 'cộng cả HP lẫn giảm sát thương' dù công thức chi tiết là qua phòng ngự võ công chứ không phải % giảm dame trực tiếp.",
      trangThai: "BINH_THUONG",
      ghiChu: "Gán: PlayersBes.cs:9537. Tiêu thụ dùng chung mọi job: PlayersBes.cs:10073-10078.",
    },
    {
      index: 7,
      id: 28,
      ten: "Nộ hải cuồng lan",
      loai: "goc",
      heSo1: 0.75,
      heSo2: 1.3,
      batBuocThangThien: null,
      moTa:
        "Gán base.KIEM_NoHai_CuongLan = 5.0 + điểm×0.75 (PlayersBes.cs:9540). Xác nhận roll RNG.Next(1,110) ĐỒNG NHẤT ở CẢ 4 đường đánh (PvE-tay :215, PK-tay :1189 trong A8_Players_02PhysicalAttack.cs; PK-chiêu :607, PvE-chiêu :3268 trong A8_Players_03MagicAttack.cs) — SỬA LẠI audit cũ: audit cũ ghi chiêu roll 1-100, thực tế đọc lại là 1-110 y hệt tay (tối đa ~59.1% ở 80 điểm khi dùng mẫu 110, không phải 65% nếu dùng mẫu 100). Khi trúng: nhân sát thương ×1.3 (heSo2 idx7). VẤN ĐỀ MỚI PHÁT HIỆN (regression so với audit 02/09): ở CẢ 2 đường CHIÊU (PvE lẫn PK), Nộ Hải Cuồng Lan / Phá Thiên Nhất Kiếm (chỉ PvE) / Kinh Thiên Động Địa (id680) vẫn là 3 khối 'if' ĐỘC LẬP liên tiếp (không phải else-if loại trừ) — có thể cộng dồn nhân cùng lúc trên 1 đòn chiêu (vd PvE: NoHaiCuongLan×1.3 × PhaThienNhatKiem×(1+điểm×0.006) × KinhThienDongDia×1.4). Audit cũ khẳng định đã đổi thành else-if loại trừ nhưng code hiện tại KHÔNG có else-if — bản sửa đó đã bị mất/chưa từng được áp dụng vào các file combat đã tách (A8_Players_03MagicAttack.cs).",
      trangThai: "CON_LOI_CHUA_SUA",
      ghiChu:
        "Gán: PlayersBes.cs:9540. Tiêu thụ: A8_Players_02PhysicalAttack.cs:215 (PvE tay), :1189 (PK tay, ×1000 nếu đang dính Độc Xà Xuất Động); A8_Players_03MagicAttack.cs:607 (PK chiêu), :3268 (PvE chiêu). REGRESSION: 3 khối if độc lập tại A8_Players_03MagicAttack.cs:605-624 (PK chiêu) và :3266-3282 (PvE chiêu, ComputingAttack) — không có else-if loại trừ như audit cũ mô tả.",
    },
    {
      index: 8,
      id: 27,
      ten: "Hồi liễu thân pháp",
      loai: "goc",
      heSo1: 0.6,
      heSo2: 0.06,
      batBuocThangThien: null,
      moTa:
        "2 tác dụng, gán tại PlayersBes.cs:9543-9544: base.KIEM_HoiLieu_ThanPhap = điểm×0.6 (heSo1) và FLD_NhanVat_KhiCong_LucCongKichVoCongGiaTang_TiLePhanTram = điểm×0.06 (heSo2). (b) CÔNG: field FLD_NhanVat_KhiCong_LucCongKichVoCongGiaTang_TiLePhanTram được cộng thẳng vào ngoặc % tăng sát thương của CẢ 2 đường CHIÊU (PK: A8_Players_03MagicAttack.cs:560; PvE: cùng file :3208) — KHÔNG xuất hiện ở đòn tay (đã xác nhận field này không tồn tại trong A8_Players_02PhysicalAttack.cs), đúng thiết kế 'chỉ tăng sát thương chiêu'. (a) THỦ: REGRESSION so với audit 02/09 — rà toàn bộ repo cho biến KIEM_HoiLieu_ThanPhap, tiêu thụ phòng thủ (roll RNG.Next(1,110) <= giá trị, khi trúng đặt sát thương nhận về 0 — né toàn phần) CHỈ CÒN 1 nơi DUY NHẤT: A8_Players_03MagicAttack.cs:1186-1213, tức PK-CHIÊU. KHÔNG còn tồn tại ở PK-tay (0 kết quả trong A8_Players_02PhysicalAttack.cs) — trong khi audit cũ trích dẫn rõ có ở cả 'PK tay: Players.cs:40383'. Tức là nhánh phòng thủ khi bị đánh TAY trong PK đã mất tác dụng, chỉ còn hoạt động khi bị đánh bằng CHIÊU. Cơ chế cộng dồn stack 'Thiên Kiếm Phi Toái' (cho id321) vẫn còn hoạt động, nhưng cũng CHỈ trong nhánh PK-chiêu này (dòng 1190-1200), gated bởi KyNangKetHon_CapDo>=5.",
      trangThai: "CON_LOI_CHUA_SUA",
      ghiChu:
        "Gán: PlayersBes.cs:9543-9544. Tiêu thụ (b) công: A8_Players_03MagicAttack.cs:560 (PK chiêu), :3208 (PvE chiêu, qua FLD_NhanVat_KhiCong_LucCongKichVoCongGiaTang_TiLePhanTram). Tiêu thụ (a) thủ: A8_Players_03MagicAttack.cs:1186-1213 (PK chiêu, DUY NHẤT). REGRESSION: không tìm thấy KIEM_HoiLieu_ThanPhap trong A8_Players_02PhysicalAttack.cs (PK tay) — grep 0 kết quả.",
    },
    {
      index: 9,
      id: 120,
      ten: "Vô kiên bất tồi",
      loai: "goc",
      heSo1: 0.2,
      heSo2: 1.5,
      batBuocThangThien: null,
      moTa:
        "SAI LỆCH LỚN so với mô tả audit cũ — đây KHÔNG phải 'nhân sát thương x(1.5+...)' mà là cơ chế GIẢM PHÒNG NGỰ ĐỐI PHƯƠNG (phá phòng), xác nhận bằng cách đọc biến num38/num45/num3/num35 ngược dòng: các biến này đều là phòng ngự hiệu dụng CỦA ĐỐI PHƯƠNG (vd A8_Players_03MagicAttack.cs:369 'num38 = num35×(1-giảm phòng...)' với num35 = value2.FLD_NhanVatCoBan_PhongNgu), bị TRỪ (không phải nhân thêm) vào công thức sát thương cuối (vd dòng 560: '... - num45×World.武功防增加百分比 ...'). Cơ chế: ngưỡng roll chung = KIEM_VoKien_BatToi + KIEM_ThuaThang_TruyKich (roll 1-100). Nếu roll < VoKien_BatToi: phòng ngự đối phương ×0.5 (giảm nửa). Nếu roll rơi vào khoảng Thừa Thắng Truy Kích: phòng ngự đối phương × (hệ_số − min(ThuaThang_TruyKich,0.5)×0.01). BUG NGHIÊM TRỌNG xác nhận ở 3/4 đường đánh (PvE-tay, PK-tay, PvE-chiêu): hệ_số dùng SAI = 得到气功加成值(2,9,2) = heSo2 CỦA CHÍNH VÔ KIÊN BẤT TỒI = 1.5 (một hằng số DB, KHÔNG liên quan đến Thừa Thắng Truy Kích) thay vì hằng số cố định 0.5 như ở PK-chiêu — khiến phòng ngự đối phương bị NHÂN LÊN ~1.5 lần (TĂNG, không giảm) khi rơi vào tier 2 này, tức gây ÍT sát thương hơn bình thường, ngược hoàn toàn với ý đồ 'phá phòng'. CHỈ CÓ PK-chiêu (A8_Players_03MagicAttack.cs:538-547) dùng đúng hằng số cố định 0.5 (không phải heSo2). Trường Thừa Thắng Truy Kích còn bị chặn cứng '(if KIEM_ThuaThang_TruyKich > 0.5) KIEM_ThuaThang_TruyKich = 0.5' TRƯỚC khi dùng trong công thức — khiến khoảng biến thiên thực tế của số hạng trừ chỉ ~0.005, gần như không đổi theo điểm đầu tư.",
      trangThai: "CON_LOI_CHUA_SUA",
      ghiChu:
        "Gán: PlayersBes.cs:9547. BUG xác nhận tại: A8_Players_02PhysicalAttack.cs:133 (PvE tay, num2 *= 得到气功加成值(2,9,2) - ...), :1089 (PK tay, num35 *= 得到气功加成值(2,9,2) - ...); A8_Players_03MagicAttack.cs:3159 (PvE chiêu/ComputingAttack, num3 *= 得到气功加成值(2,9,2) - ...). ĐÚNG (không bug) duy nhất tại: A8_Players_03MagicAttack.cs:545-546 (PK chiêu, dùng hằng 0.5 cố định). Audit cũ mô tả hoàn toàn sai bản chất cơ chế (tưởng là dame multiplier, thực ra là defense-pierce).",
    },
    {
      index: 10,
      id: 320,
      ten: "Thừa thắng truy kích",
      loai: "goc",
      heSo1: 0.5,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Xem mô tả đầy đủ ở Vô Kiên Bất Tồi (idx9) — dùng chung 1 ngưỡng roll và chung cơ chế giảm-phòng-ngự-đối-phương, KHÔNG phải nhân sát thương như audit cũ mô tả. Đóng góp riêng của Thừa Thắng Truy Kích: (1) cộng thêm vào ngưỡng roll chung (điểm×0.5, tối đa +40 ở 80 điểm — ngưỡng tổng gộp với Vô Kiên Bất Tồi tối đa 56/100, chưa vượt trần); (2) là số hạng bị TRỪ trong hệ số nhân phòng-ngự-đối-phương ở tier 2, nhưng bị chặn cứng tại 0.5 trước khi dùng (dòng '(if >0.5) =0.5') nên đóng góp thực tế của điểm đầu tư vào ĐỘ MẠNH của proc gần như KHÔNG ĐÁNG KỂ (chỉ ảnh hưởng ngưỡng TRÚNG hay không, không ảnh hưởng nhiều đến mức giảm phòng ngự khi đã trúng) — đây là điểm khác biệt quan trọng so với heSo1 tưởng chừng cho +40% ở 80 điểm như audit cũ suy diễn. Ngoài ra kế thừa bug tier-2 (phòng ngự đối phương bị TĂNG thay vì giảm) ở PvE-tay/PK-tay/PvE-chiêu giống hệt idx9.",
      trangThai: "CON_LOI_CHUA_SUA",
      ghiChu:
        "Cùng vị trí code với idx9 (id120): PlayersBes.cs:9550 (gán); A8_Players_02PhysicalAttack.cs:119-134 (PvE tay), :1075-1090 (PK tay); A8_Players_03MagicAttack.cs:3143-3161 (PvE chiêu), :527-548 (PK chiêu, đúng). Xem ghiChu đầy đủ ở idx9.",
    },
    {
      index: 11,
      id: 29,
      ten: "Trùng quan nhất nộ",
      loai: "goc",
      heSo1: 0.3,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Gán base.KIEM_TrungQuan_NhatNo = 5.0 + điểm×0.3 (PlayersBes.cs:9553). Xác nhận đồng nhất cả 4 đường đánh: roll RNG.Next(1,110) <= giá trị && !NoKhi (chỉ kích hoạt khi CHƯA ở trạng thái Nộ Khí), khi trúng NhanVat_SP += NhanVat_SP × giá trị × 0.005 (cộng thêm 0.5%×giá trị vào SP hiện tại — khớp đúng audit cũ). Xuất hiện tại A8_Players_02PhysicalAttack.cs:749-753 (PK tay) và :1891-1895 (PvE tay khác đường); A8_Players_03MagicAttack.cs (PK/PvE chiêu, cùng pattern theo grep FLD_NhanVat_ThemVaoTiLePhanTram_NeTranh lân cận — công thức không đổi).",
      trangThai: "BINH_THUONG",
      ghiChu: "Gán: PlayersBes.cs:9553. Tiêu thụ: A8_Players_02PhysicalAttack.cs:749-753, :1891-1895 (2 nhánh tay); A8_Players_03MagicAttack.cs tương tự cho 2 nhánh chiêu.",
    },
    {
      index: null,
      id: 25,
      ten: "Thăng thiên 1 - Hộ thân cương khí",
      loai: "thang_thien",
      heSo1: 0.4,
      heSo2: null,
      batBuocThangThien: 6,
      moTa:
        "Gán base.KIEM_ThangThien_1_KhiCong_HoThan_CuongKhi = 10.0 + điểm×0.4 (PlayersBes.cs:10100). Tiêu thụ PK-tay (A8_Players_02PhysicalAttack.cs:1711) và PK-chiêu (A8_Players_03MagicAttack.cs:1181): khi BỊ đánh trúng, roll RNG.Next(1,110) <= (giá trị − num6/num7), giảm nửa sát thương nhận. CHI TIẾT MỚI so với audit cũ: ngưỡng còn bị TRỪ đi 1 khí công 'phản chế' của đối phương (num6 = value.PhanCong_KIEM_HoThan_CangKhi tại A8_02Physical, num7 = value2.PhanCong_KIEM_HoThan_CangKhi tại A8_03Magic — đến từ nhóm khí công 'khắc chế khí công' 2001-2015 gán tại PlayersBes.cs:10495-10539), tức có đối kháng PK theo cặp khí công phản chế mà audit cũ không đề cập.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs:10100 (case 25 trong foreach ThangThien). PK tay: A8_Players_02PhysicalAttack.cs:1708-1714. PK chiêu: A8_Players_03MagicAttack.cs:1179-1185. Trừ đi phản chế PhanCong_KIEM_HoThan_CangKhi của đối phương (PlayersBes.cs case 2002, dòng ~10499).",
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
        "Gán base.KIEM_ThangThien_2_KhiCong_ThienDiaDongTho = điểm×0.005, chỉ khi Player_Job==2 (PlayersBes.cs:10208-10212). Cơ chế cộng dồn: xác nhận CÒN NHIỀU điểm cộng stack (SoLanNeTranh_HoiLieuThanPhap++) trong A8_Players_03MagicAttack.cs tại ít nhất 6 vị trí (dòng 1192, 1198, 1269, 1275, 1304, 1310), đều gated bởi 'FLD_VoCongLoaiHinh==3 && KyNangKetHon_CapDo>=5 && stack<3' — nhưng LƯU Ý: field 'KyNangKetHon_CapDo' trong code gốc có tên/chú thích tiếng Trung là '夫妻武功攻击等级' (cấp độ tấn công võ công VỢ CHỒNG), không phải 'cấp độ chiêu thức' như cách audit cũ diễn giải 'chiêu cấp≥5' — cần xác nhận thêm đây có đúng là điều kiện 'combo kết hôn' hay chỉ là tên field bị dùng lại cho mục đích khác. Tất cả các điểm cộng stack đều nằm trong PK-CHIÊU (MagicAttack_Player); KHÔNG tìm thấy điểm cộng stack nào trong 2 file đòn tay. Khi tung chiêu tiếp theo trúng: num48 += NeTranh_SucManhTanCong_TichLuy (A8_Players_03MagicAttack.cs:612-618, cộng thẳng chứ không nhân theo công thức audit cũ mô tả x(1+0.005×điểm×stack) — cần rà kỹ hơn công thức tích luỹ tại các dòng 1193/1270/1305 để xác nhận hệ số chính xác, nhưng cơ chế tổng thể (stack khi né, trả thưởng khi trúng chiêu tiếp theo) còn hoạt động).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs:10208-10212. Cộng stack: A8_Players_03MagicAttack.cs:1192,1198,1269,1275,1304,1310 (chỉ PK chiêu). Trả thưởng: A8_Players_03MagicAttack.cs:612-618 (và tương đương ~1005-1010). Điều kiện KyNangKetHon_CapDo>=5 cần xác minh lại ý nghĩa thực (tên field gốc = cấp vũ khí kết hôn, không hẳn 'chiêu cấp').",
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
        "Gán base.KIEM_ThangThien_3_KhiCong_HoaPhuongLamTrieu = điểm×0.5, chỉ khi Player_Job==2 (PlayersBes.cs:10218-10222). Tiêu thụ tại 2 nơi đồng nhất: X3_NpcClass/NpcClass.cs:1463 và Players/A8_Players_04AttackConfirmation.cs:319 — cùng công thức: roll RNG.Next(1,100) <= giá trị && HP<=0 → đặt lại HP=10 thay vì chết (miễn 1 lần tử vong). Khớp hoàn toàn audit cũ.",
      trangThai: "BINH_THUONG",
      ghiChu: "Gán: PlayersBes.cs:10218-10222. Tiêu thụ: X3_NpcClass/NpcClass.cs:1463-1467; Players/A8_Players_04AttackConfirmation.cs:319.",
    },
    {
      index: null,
      id: 323,
      ten: "Thăng thiên 4 - Hồng nguyệt cuồng phong",
      loai: "thang_thien",
      heSo1: 0.5,
      heSo2: null,
      batBuocThangThien: 9,
      moTa:
        "Field dùng chung base.ThangThien_4_HongNguyetCuongPhong (job2 gán qua id323, các job khác qua id313/564/666 — PlayersBes.cs:10229). Tiêu thụ trong hàm 升天四气功触发() (Players.cs:39935-40292), có cổng điều kiện rõ ràng ở đầu hàm: 'if (Player_Level<140 || Player_Job_Level<9) return;' — khớp đúng audit cũ (Level>=140, Thăng Thiên>=9). Roll dùng new Random().Next(1,101) (RIÊNG một Random mới mỗi lần gọi, không phải RNG chung server — chi tiết audit cũ không đề cập). Khi trúng (Players.cs:40075-40116): buff +150 công, +150 phòng cho đồng minh cùng phe trong bán kính 60 (không phải 300 như audit cũ ghi — đã SỬA LẠI con số này, tham số thực là World.查找范围玩家(60,...)). THỜI LƯỢNG THỰC TẾ = 5000ms (5 giây), KHÔNG PHẢI 3 giây như audit cũ mô tả — đã xác nhận qua cả StatusEffect(...,5000) lẫn thời hạn X_Them_Vao_Trang_Thai_Loai(...,5000,...).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs:10229 (case 323 → field dùng chung). Tiêu thụ: Players.cs:39935-39943 (cổng Level/ThăngThiên), :40075-40116 (buff, bán kính 60, 5000ms). SỬA 2 chi tiết so với audit cũ: bán kính 60 (không phải 300), thời lượng 5s (không phải 3s).",
    },
    {
      index: null,
      id: 324,
      ten: "Thăng thiên 4 - Độc xà xuất động",
      loai: "thang_thien",
      heSo1: 0.5,
      heSo2: null,
      batBuocThangThien: 9,
      moTa:
        "Field dùng chung base.ThangThien_4_DocXaXuatDong (job2 gán qua id324 — PlayersBes.cs:10232), cùng hàm/cổng điều kiện Level>=140 && ThăngThiên>=9 như id323. Tiêu thụ tại Players.cs:40118-40138: roll cùng num2 = new Random().Next(1,101) dùng chung với id323 (cùng 1 lần roll cho cả chuỗi if trong hàm — nghĩa là các hiệu ứng thăng-thiên-4 của các job dùng CHUNG một giá trị roll ngẫu nhiên mỗi lần gọi hàm, không roll riêng từng khí công). Khi trúng: gắn debuff 1008001170 lên ĐỐI PHƯƠNG (biến 'Playe') 3000ms (3 giây — khớp audit cũ), NHƯNG trước khi gắn có kiểm tra đối phương có KIEM_BachDocBatXam (id571) hoặc THANNU_ChongLaiThanPhap hay không — nếu đối phương roll kháng thành công (RNG.Next(1,100) <= giá trị kháng của đối phương) thì debuff KHÔNG được gắn (chỉ hiện hiệu ứng hình 'kháng'). Cơ chế 'khoá proc' xác nhận vẫn hoạt động: PK-tay Liên Hoàn Phi Vũ (id22) nhân roll ×1000 khi mục tiêu đang dính debuff 1008001170 (kiểm tra qua 检查毒蛇出洞状态()).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs:10232. Tiêu thụ: Players.cs:40118-40138 (roll dùng chung biến num2 với id323, xem 升天四气功触发()). Có thể bị kháng bởi KIEM_BachDocBatXam (id571) hoặc THANNU_ChongLaiThanPhap của đối phương. Kích hoạt debuff cho hiệu ứng chặn roll: A8_Players_02PhysicalAttack.cs:1513-1516 (Liên Hoàn Phi Vũ ×1000 khi dính debuff này).",
    },
    {
      index: null,
      id: 571,
      ten: "Khí công bí cấp (Thăng Thiên 6 thức - Kiếm)",
      loai: "thang_thien",
      heSo1: 0.1,
      heSo2: null,
      batBuocThangThien: 11,
      moTa:
        "ĐÃ CÓ TÁC DỤNG THẬT — khác hẳn kết luận 'chết hoàn toàn' của audit cũ (09/2026). Gán base.KIEM_BachDocBatXam = điểm×0.1 (PlayersBes.cs:10445). Rà toàn bộ repo cho biến 'KIEM_BachDocBatXam': hiện diện ở ÍT NHẤT 13 vị trí tiêu thụ (không phải 1 như audit cũ), gồm: Players.cs:40060,40125,40170 (3 nhánh trong 升天四气功触发, chặn debuff thăng-thiên-4 của job khác lên bản thân), A8_Players_02PhysicalAttack.cs:1875 (PK tay, trong chuỗi kháng Trí Tàn id615/668), A8_Players_03MagicAttack.cs:1162 (PK chiêu, cùng chuỗi kháng Trí Tàn), và 8 vị trí trong MagicAttack_Buff (dòng 2291,2329,2514,2555,2647,2689,2727,2780,2819 — mỗi vị trí là 1 kỹ năng debuff khác nhau, ví dụ case 6002101/6002102 của Thần Nữ). Cơ chế thống nhất: roll RNG.Next(1,100) <= KIEM_BachDocBatXam của MỤC TIÊU → nếu trúng, hiện hiệu ứng hình 'kháng' (ShowBigPrint 571) và LỆNH 'break'/bỏ qua việc gắn debuff — tức đây là % KHÁNG (miễn nhiễm) TRẠNG THÁI BẤT LỢI tổng quát, đúng với ý nghĩa tên gọi 'Bách Độc Bất Xâm', áp dụng cho nhiều loại debuff khác nhau chứ không phải giảm sát thương/hồi máu.",
      trangThai: "DA_SUA",
      ghiChu:
        "Gán: PlayersBes.cs:10445. Tiêu thụ (≥13 vị trí, đã xác nhận qua grep toàn repo): Players.cs:40060,40125,40170; A8_Players_02PhysicalAttack.cs:1875; A8_Players_03MagicAttack.cs:1162,2291,2329,2514,2555,2647,2689,2727,2780,2819. LẬT NGƯỢC kết luận audit cũ 'CON_LOI_CHUA_SUA/chết hoàn toàn' — khí công này đã được nối vào cơ chế kháng debuff thật kể từ sau 02/09.",
    },
    {
      index: null,
      id: 680,
      ten: "[Kiếm] Khí công bí cấp thư (Thăng Thiên 5 thức - Kinh Thiên Động Địa)",
      loai: "thang_thien",
      heSo1: 0.6,
      heSo2: null,
      batBuocThangThien: 10,
      moTa:
        "Gán base.ThangThien_5_KinhThienDongDia = điểm×0.6 (PlayersBes.cs:10302, field không có tiền tố KIEM_ nhưng chỉ job2 gán qua case 680 — thực chất độc quyền Kiếm). Tiêu thụ tại PK-chiêu (A8_Players_03MagicAttack.cs:619-623) và PvE-chiêu (cùng file, ComputingAttack :3277-3281): roll RNG.Next(1,100) <= giá trị, khi trúng nhân sát thương ×1.4 CỐ ĐỊNH — SỬA LẠI audit cũ: hệ số thực là ×1.4, không phải ×1.35 như audit cũ ghi. REGRESSION nghiêm trọng so với tuyên bố 'DA_SUA' của audit 02/09: cả 2 đường chiêu hiện có Kinh Thiên Động Địa nằm trong 1 khối 'if' ĐỘC LẬP, đứng SAU 2 khối if độc lập khác (Nộ Hải Cuồng Lan id28, và — chỉ PvE — Phá Thiên Nhất Kiếm id23) trong CÙNG 1 else-if(Player_Job==2) — KHÔNG có else-if loại trừ giữa 3 khối này. Nghĩa là trên 1 đòn chiêu, cả 3 hiệu ứng CÓ THỂ cùng trúng và nhân dồn (ví dụ PvE tối đa ~1.598×1.48×1.4 ≈ x3.3, còn cao hơn cả mức x2.63 mà audit cũ từng báo là bug cần sửa). Không tìm thấy bất kỳ cờ hay else-if nào trong A8_Players_03MagicAttack.cs — bản sửa 'đổi thành else-if' của audit cũ đã KHÔNG được mang sang khi tách code ra file combat riêng (hoặc đã bị ghi đè trong các lần sửa khác hôm nay).",
      trangThai: "CON_LOI_CHUA_SUA",
      ghiChu:
        "Gán: PlayersBes.cs:10302. Tiêu thụ: A8_Players_03MagicAttack.cs:619-623 (PK chiêu), :3277-3281 (PvE chiêu/ComputingAttack). REGRESSION xác nhận: khối job2 tại dòng 605-624 (PK) và 3266-3282 (PvE) đều là 3 'if' độc lập liên tiếp (NoHaiCuongLan, [PhaThienNhatKiem chỉ PvE], KinhThienDongDia) — không phải else-if. Hệ số nhân xác nhận là ×1.4, không phải ×1.35.",
    },
  ],
};
