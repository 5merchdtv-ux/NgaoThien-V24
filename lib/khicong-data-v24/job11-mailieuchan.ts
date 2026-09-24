import type { NgheData } from "../khicong-data/types";

// Đối chiếu Ver24 THẬT — đọc lại code SRCGameServerV24B hiện tại (không dùng lại audit cũ 02/09
// mà không kiểm chứng), biên soạn 15/09/2026.
//
// GHI CHÚ QUAN TRỌNG VỀ VỊ TRÍ CODE: kể từ audit cũ, logic tấn công/tiêu thụ khí công đã được
// tách ra khỏi Players.cs (file gốc, 71995 dòng) sang các file partial-class mới:
//   - Players\A8_Players_01SystemAttack.cs  (đòn tay PvE / hệ thống)
//   - Players\A8_Players_02PhysicalAttack.cs (đòn tay PK)
//   - Players\A8_Players_03MagicAttack.cs    (đòn chiêu, cả PK lẫn PvE tuỳ hàm)
//   - X3_NpcClass\NpcClass.cs                (quái tấn công người)
// Players.cs hiện chỉ còn giữ phần cập nhật buff/trạng thái/tick định kỳ (hồi AP, Phẫn Nộ, v.v.),
// không còn chứa phần lớn công thức sát thương. Mọi trích dẫn dòng trong file này đều lấy từ vị
// trí THẬT hiện tại, không copy lại số dòng cũ.
//
// heSo1/heSo2 của các khí công "goc" lấy trực tiếp từ bảng TBL_XWWL_SKILL (DB 24pub, cột
// FLD_每点加成比率值1/2, lọc FLD_JOB=11) — đã sqlcmd lại độc lập, KHÔNG suy đoán từ code.
// heSo1 của các khí công "thang_thien" lấy từ bảng 升天气功 (cột FLD_每点加成比率值, lọc theo
// 气功ID). Nhiều giá trị heSo lệch đáng kể so với audit cũ — xem ghiChu từng dòng.
export const JOB_11_MAI_LIEU_CHAN_V24: NgheData = {
  job: 11,
  tenNghe: "Mai Liễu Chân",
  khiCong: [
    {
      index: 0,
      id: 650,
      ten: "Chưởng lực kích hoạt",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Khiên nội lực: khi bị tấn công, % sát thương tới được hấp thụ bằng AP (Chưởng Lực). PK (đòn tay, 2 vị trí): AP tiêu = sát thương gốc × (field×1%). PvE (quái đánh người): AP tiêu = sát thương gốc × (field×2%) — hệ số nhân đôi so với PK, có vẻ là chủ ý (quái thường đánh nặng hơn). CẢ HAI công thức đều KHÔNG có trần % nào — chỉ bị chặn bởi AP hiện có (nếu AP tiêu > AP còn lại thì chỉ tiêu hết AP). Với field = 5 + điểm×1.0 (DB hiện tại), điểm đầu tư cao (ví dụ ~165) cho field ≈170 → tỉ lệ hấp thụ PK ≈170%, PvE ≈340%, tức về lý thuyết CÓ THỂ hấp thụ NHIỀU HƠN sát thương của đòn đánh nếu còn đủ AP (không thấy Math.Max(0,...) chặn ở sau).",
      trangThai: "CON_LOI_CHUA_SUA",
      ghiChu:
        "KHÔNG TÌM THẤY 'MaiLieuChanBarrierPolicy' hay 'MaximumPveAbsorptionRate' ở BẤT KỲ đâu trong toàn bộ SRCGameServerV24B hiện tại (grep toàn repo = 0 kết quả) — bản vá 'Math.Min(...90%...) ở cả 6 vị trí' mà audit cũ (02/09 + 03/09) khẳng định đã áp dụng KHÔNG CÒN TỒN TẠI trong code hiện tại, nhiều khả năng bị mất khi Players.cs được tách thành các file A8_Players_0X hôm nay. Hiện chỉ còn 4 vị trí tiêu thụ (không phải 6): gán PlayersBes.cs:9933 (case Player_Job 11 → case i=0). Tiêu thụ: NpcClass.cs:1397-1404 (PvE, hệ số ×2.0×0.01, KHÔNG trần), A8_Players_03MagicAttack.cs:1463-1474 (PK chiêu, ×0.01, KHÔNG trần), A8_Players_02PhysicalAttack.cs:1158-1169 và 1926-1937 (2 vị trí PK tay, ×0.01, KHÔNG trần). Phần nhân hệ số DB (num2*num3, tức bug 'thiếu nhân hệ số DB' mà audit cũ ghi ĐÃ SỬA) vẫn đúng — chỉ riêng phần TRẦN 90% là đã biến mất khỏi code hiện tại.",
    },
    {
      index: 1,
      id: 651,
      ten: "Chưởng lực vận dụng",
      loai: "goc",
      heSo1: 2.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Tốc độ hồi Chưởng Lực (AP) theo thời gian (hàm 障力恢复, tick định kỳ). Đồng thời khi kích hoạt trạng thái Phẫn Nộ (700014): field được CỘNG THÊM field×1.2 (tăng vĩnh viễn 120% một lần cho tới khi buff hết/refresh), và giá trị field (sau khi cộng) làm tham số cường độ (num5) của buff 700014.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs:9936 (case i=1). Tiêu thụ: Players.cs:42114-42139 (hàm 障力恢复 — hồi AP mỗi tick, vẫn nằm trong Players.cs chứ không bị tách sang A8_*), Players.cs:61892-61899 và 61978-61982 (tham số/hiển thị buff Phẫn Nộ). Hành vi khớp audit cũ, chỉ đổi vị trí dòng.",
    },
    {
      index: 2,
      id: 653,
      ten: "Bách biến thần hành",
      loai: "goc",
      heSo1: 0.01,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Né tránh %, ghi vào field dùng chung toàn hệ thống né tránh (FLD_NhanVat_ThemVaoTiLePhanTram_NeTranh), nhân vào tổng né tránh dạng (1 + field + ...).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs:9939 (case i=2). Tiêu thụ chung: PlayersBes.cs:2252 (thuộc tính tổng FLD_NeTranh = (FLD_NeTranh gốc + ...) × (1 + field + ...) + buff). Không đổi so với audit cũ về bản chất.",
    },
    {
      index: 3,
      id: 654,
      ten: "Huyền vũ thần công",
      loai: "goc",
      heSo1: 3000.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "THỜI LƯỢNG trạng thái 'Phẫn Nộ' (700014) = field + 10000 (mili giây). Khi ở Phẫn Nộ: cố định +20% Tấn Công (AddFLD_ThemVaoTiLePhanTram_Attack(0.2)) và +20% giới hạn Chưởng Lực tối đa (CharacterIsBasicallyTheLargest_Barrier ×1.2).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs:9942 (case i=3, chỉ dùng num2*num3 = heSo1, KHÔNG dùng heSo2/num4). Tiêu thụ heSo1: Players.cs:61892-61898. SỬA LẠI SO VỚI AUDIT CŨ: DB hiện tại heSo2 = 0.0 (không phải 0.2 như audit cũ ghi) — vậy 'heSo2 không tìm thấy nơi tiêu thụ' của audit cũ không còn là vấn đề đáng lo, vì giá trị DB hiện tại của heSo2 vốn đã là 0, không có tác dụng thiết kế nào bị bỏ lỡ. Hạ mức nghiêm trọng từ CON_LOI_CHUA_SUA xuống BINH_THUONG vì lý do trên.",
    },
    {
      index: 4,
      id: 656,
      ten: "Huyền vũ đích chỉ điểm",
      loai: "goc",
      heSo1: 0.5,
      heSo2: 0.01,
      batBuocThangThien: null,
      moTa:
        "3 công dụng xác nhận được: (1) mở rộng tầm đánh tối đa PK/PvE = World.梅柳真PK距离 (hoặc World.梅柳真打怪距离 cho PvE, hằng số cấu hình server riêng cho nghề này) + field; (2) mở rộng bán kính dò người chơi xung quanh khi kích hoạt AoE Phẫn Nộ = 60 + field; (3) cộng thẳng vào Tấn Công cơ bản qua field dùng chung FLD_NhanVat_KhiCong_CongKich = FLD_LonNhatCongKich × điểm × heSo2 / 2 (heSo2 hiện = 0.01).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs:9945-9946 (case i=4). Tiêu thụ tầm đánh: A8_Players_03MagicAttack.cs:239 và :481, A8_Players_02PhysicalAttack.cs:983, A8_Players_01SystemAttack.cs:494. Tiêu thụ cộng Tấn Công: PlayersBes.cs:2179 (thuộc tính tổng Tấn Công cơ bản, cộng FLD_NhanVat_KhiCong_CongKich vào trước khi nhân % — field này DÙNG CHUNG cho nhiều nghề/nhiều khí công khác nhau ghi vào cùng field). SỬA SO VỚI AUDIT CŨ: bỏ con số cụ thể '+48 tối đa' vì công thức thực tế dùng hằng số World.梅柳真PK距离/打怪距离 (đọc từ cấu hình server, không phải hardcode trong code) cộng field, không xác định được trần chính xác 48 từ code.",
    },
    {
      index: 5,
      id: 191,
      ten: "Khí trầm đan điền",
      loai: "goc",
      heSo1: 0.005,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa: "Cơ chế dùng chung nhiều nghề — cộng HP tối đa và phòng ngự võ công, bằng FLD_PhongNgu × field / 100.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "SỬA VỊ TRÍ SO VỚI AUDIT CŨ: audit cũ ghi khí công này ở index 6 (kèm id657 ở index 5) — ĐÃ KIỂM CHỨNG LẠI ĐỘC LẬP bằng 2 nguồn: (1) sqlcmd trực tiếp bảng TBL_XWWL_SKILL WHERE FLD_JOB=11 ORDER BY FLD_INDEX → id191 nằm ở FLD_INDEX=5; (2) bảng tra cứu cứng 取气功位置() trong X_Khi_Cong_Tang_Them_Thuoc_Tinh.cs (case 181-193, nhóm nghề {6,8,9,10,11,12,13} → trả về index 5). Code gán PlayersBes.cs case Player_Job==11 → case i=5 cũng gán đúng DonKhi_DanDien (dòng ~9948), khớp DB. Vậy index đúng của id191 là 5, KHÔNG phải 6 như audit cũ. Tiêu thụ: PlayersBes.cs:10073-10078 (if base.DonKhi_DanDien > 0).",
    },
    {
      index: 6,
      id: 657,
      ten: "Huyền vũ cường kích",
      loai: "goc",
      heSo1: 0.2,
      heSo2: 0.01,
      batBuocThangThien: null,
      moTa:
        "'Chí mạng' của Mai Liễu Chân trên đòn CHIÊU: lưu điểm thô (không nhân hệ số lúc gán — base.MaiLieuChan_HuyenVuCuongKich = num2), nhân hệ số ở nơi tiêu thụ. Thiết kế: tỉ lệ proc = field × heSo(index của chính nó,1); sát thương khi trúng ×(1 + field × heSo(index của chính nó,2)).",
      trangThai: "CON_LOI_CHUA_SUA",
      ghiChu:
        "SỬA VỊ TRÍ index (xem giải thích ở mục id191 — bằng chứng DB + bảng 取气功位置() xác nhận id657 thực sự ở index 6, không phải 5). BUG MỚI PHÁT HIỆN (độc lập, không có trong audit cũ): 2 nơi tiêu thụ dùng SAI index khi gọi 得到气功加成值(Player_Job, index, n) để lấy hệ số DB — A8_Players_03MagicAttack.cs:3649-3651 (PvE, đòn chiêu vào quái) dùng ĐÚNG index 6 (hệ số của chính id657: 0.2/0.01); nhưng A8_Players_03MagicAttack.cs:1047-1049 (PK, đòn chiêu vào người chơi khác) lại hardcode index 5 — tức lấy NHẦM hệ số của id191 (Khí Trầm Đan Điền, 0.005/0.0) thay vì hệ số của chính nó. Hậu quả thực tế trong PK: tỉ lệ proc bị yếu đi ~40 lần (field×0.005 thay vì field×0.2) và phần sát thương cộng thêm khi trúng LUÔN BẰNG 0 (vì heSo2 của index 5 = 0.0) — về cơ bản đòn 'chí mạng chiêu' này gần như KHÔNG có tác dụng trong PK dù NpcClass/PvE vẫn đúng. Đây là bug SỐNG trong code hiện tại, rất có thể là tàn dư của lần đánh số lại index 5↔6 hôm nay mà một trong hai vị trí tiêu thụ chưa được cập nhật theo.",
    },
    {
      index: 7,
      id: 658,
      ten: "Huyền vũ nguy hóa",
      loai: "goc",
      heSo1: 0.025,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Tăng % sát thương chiêu nội tại (chỉ cần field>0, không cần proc): sát thương ×(1 + field). Áp dụng ở CẢ 2 nhánh chiêu — PvE (A8_Players_03MagicAttack.cs:450-457) và PK (A8_Players_03MagicAttack.cs:3191-3196) — dùng CÙNG một công thức.",
      trangThai: "DA_SUA",
      ghiChu:
        "Kiểm chứng lại độc lập: bản vá 25/08 (PvP trước đây gọi thẳng hệ số 1 điểm thay vì field) VẪN CÒN HIỆU LỰC trong code hiện tại — cả 2 vị trí đọc trực tiếp base.MaiLieuChan_HuyenVuNguyHoa (field đã nhân sẵn), không có sai lệch PvE/PvP nào. Gán: PlayersBes.cs:9955 (case i=7).",
    },
    {
      index: 8,
      id: 659,
      ten: "Chưởng lực khôi phục",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Proc HỒI ĐẦY Chưởng Lực (AP = max) khi bị tấn công lúc AP dưới nửa max, tỉ lệ = field%. Đối xứng 3 vị trí (PvE quái đánh người, PK chiêu, PK tay), cùng công thức.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs:9958 (case i=8). Tiêu thụ: NpcClass.cs:1614-1618, A8_Players_03MagicAttack.cs:1366-1370, A8_Players_02PhysicalAttack.cs:1812-1816. Khớp hoàn toàn audit cũ, chỉ đổi vị trí dòng/file.",
    },
    {
      index: 9,
      id: 660,
      ten: "Tật đố đích hóa thân",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 0.1,
      batBuocThangThien: null,
      moTa:
        "Khắc chế 2 chiều với 2 nghề cụ thể. Chiều tấn công (Mai đánh Kiếm/job2 hoặc Đàm Hoa Liên/job9): tỉ lệ proc = field%, khi trúng sát thương ×(1 + heSo2_index9) = ×1.10 (+10% cố định, KHÔNG scale theo điểm vì công thức chỉ đọc thẳng heSo2 chứ không nhân field). Chiều phòng thủ (bị Đao/job1 hoặc HanBaoQuan/job8 đánh): tỉ lệ proc = field%, giảm sát thương nhận = sát thương × heSo2_index9/2 = 5% cố định. Chỉ hoạt động trong PK, không có PvE. Xác nhận đúng ở cả đòn chiêu VÀ đòn tay (4 vị trí, công thức giống hệt nhau).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs:9961 (case i=9). Tiêu thụ: A8_Players_03MagicAttack.cs:1051-1055 (tấn công) và :1358-1365 (phòng thủ); A8_Players_02PhysicalAttack.cs:1461-1465 (tấn công) và :1804-1811 (phòng thủ). heSo1/heSo2 DB khớp y hệt audit cũ (1.0/0.1) — không có sai lệch.",
    },
    {
      index: 10,
      id: 661,
      ten: "Phẫn nộ bạo phát",
      loai: "goc",
      heSo1: 0.03,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Cơ chế 2 giai đoạn vẫn còn nguyên vẹn: (1) TÍCH ĐIỂM Nộ Khí — tỉ lệ cố định 40% khi bị đánh (không phụ thuộc field, chỉ cần field>0), bị TRỪ BỚT nếu đối phương có đầu tư khí công phản chế 'PhanCong_MaiLieuChan_KhiCong_PhanNoBaoPhat' (chỉ ở 2/4 vị trí PK, không áp dụng khi bị quái đánh); (2) BÙNG NỔ — chỉ trên đòn CHIÊU của chính mình, khi đủ 3 điểm Nộ Khí thì tiêu hết điểm và nhân sát thương ×(1 + field). Với heSo1 DB hiện tại = 0.03 (gấp 3 lần giá trị 0.01 mà audit cũ ghi), mức bùng nổ tối đa mạnh hơn đáng kể so với audit cũ ước tính.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs:9964 (case i=10). Tích điểm: NpcClass.cs:1619-1622 (PvE, 40% thẳng), A8_Players_03MagicAttack.cs:1371-1377 (PK chiêu, 40%-đối_thủ.PhanCong_...), A8_Players_02PhysicalAttack.cs:1817-1821 (PK tay — LƯU Ý cách trừ counter khác: trừ vào field trước khi so 40%, không trừ vào ngưỡng 40 như bản chiêu — 2 cách hiện thực khác nhau cho cùng ý tưởng, không hẳn là bug nhưng không nhất quán). Bùng nổ: A8_Players_03MagicAttack.cs:461-465 (PvE) và :3200-3204 (PK).",
    },
    {
      index: 11,
      id: 318,
      ten: "Hấp huyết tiến kích",
      loai: "goc",
      heSo1: 0.5,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Hồi máu khi bị đánh lúc HP dưới 50%: tỉ lệ proc = field%, lượng hồi = min(sát thương vừa nhận / 2, 2000) — CÓ TRẦN CỨNG 2000 máu mỗi lần proc (chi tiết audit cũ không ghi). Chỉ tìm thấy 2 vị trí, cả hai đều PK (chiêu + tay) — không có đường PvE, khớp nhận định cũ là chủ ý (kỹ năng phòng thủ PK).",
      trangThai: "BINH_THUONG",
      ghiChu: "Gán: PlayersBes.cs:9967 (case i=11). Tiêu thụ: A8_Players_03MagicAttack.cs:1378-1387, A8_Players_02PhysicalAttack.cs:1822-1829 (dòng đọc cap 2000 nằm ngay sau điều kiện proc).",
    },
    {
      index: null,
      id: 315,
      ten: "Thăng thiên 3 sát nhân quỷ",
      loai: "thang_thien",
      heSo1: 0.004,
      heSo2: null,
      batBuocThangThien: 8,
      moTa:
        "Sát thương chiêu PK tăng theo SỐ ĐỊCH gần đó (đếm tối đa 5, cách đếm khác nhau theo bản đồ/phe/bang qua switch 3 nhánh — map đặc biệt (bản đồ TLC?), Phái Đại Chiến Tiền Ma, và bang phái thường): sát thương ×(1 + field × số_địch). heSo1 DB hiện tại (0.004) khớp audit cũ, không đổi.",
      trangThai: "BINH_THUONG",
      ghiChu: "Gán: PlayersBes.cs:10203 (case KhiCongID 315). Tiêu thụ: A8_Players_03MagicAttack.cs:~479-524 (đếm địch theo bản đồ) và :524 (áp công thức).",
    },
    {
      index: null,
      id: 316,
      ten: "Thăng thiên 1 huyền vũ lôi điện",
      loai: "thang_thien",
      heSo1: 0.01,
      heSo2: null,
      batBuocThangThien: 6,
      moTa:
        "Proc +40% sát thương cố định (×1.4, KHÔNG scale theo điểm) trên cả đòn tay và chiêu (PK lẫn PvE, 4 vị trí đối xứng). Tỉ lệ proc = field% (2 vị trí PK bị trừ thêm bởi khí công phản chế của đối phương 'PhanCong_MaiLieuChan_KhiCong_HuyenVuLoiDien', 2 vị trí PvE thì không).",
      trangThai: "CON_LOI_CHUA_SUA",
      ghiChu:
        "2 VẤN ĐỀ MỚI so với audit cũ: (1) heSo1 DB hiện tại = 0.01, audit cũ ghi 2.0 — lệch ~200 LẦN. Với trần điểm khí công thăng thiên (World.限制气功点数, mặc định 60, có thể chỉnh qua config server) thì field tối đa ≈ 60×0.01 = 0.6 → tỉ lệ proc tối đa chỉ ≈0.6%, gần như KHÔNG BAO GIỜ proc trong thực tế — kỹ năng thăng thiên bậc 6 (khá dễ đạt) trở thành gần như vô dụng nếu DB đúng là 0.01. (2) KHÔNG mutually-exclusive với id325 như audit cũ khẳng định — đọc lại code A8_Players_03MagicAttack.cs:1056-1065 và :3653-3661, 2 điều kiện là 2 câu `if` ĐỘC LẬP liên tiếp (không phải if/else-if), nên cả 2 hiệu ứng (id316 và id325) CÓ THỂ cùng proc trên một đòn. Gán: PlayersBes.cs:10206 (case 316). Tiêu thụ: A8_Players_03MagicAttack.cs:1056(PK),:3653(PvE); A8_Players_02PhysicalAttack.cs:461(PvE?),:1466(PK).",
    },
    {
      index: null,
      id: 325,
      ten: "Thăng thiên 2 huyền vũ trớ chú",
      loai: "thang_thien",
      heSo1: 0.01,
      heSo2: null,
      batBuocThangThien: 7,
      moTa:
        "Proc cộng thẳng sát thương bằng CỐ ĐỊNH 20% HP tối đa của người tấn công (KHÔNG scale theo điểm — hiệu ứng luôn là +0.2×CharacterMax_HP bất kể field lớn nhỏ). Tỉ lệ proc = field%. Loại trừ bản đồ 7301. KHÔNG loại trừ lẫn nhau với id316 trong code hiện tại (xem ghiChu id316).",
      trangThai: "CON_LOI_CHUA_SUA",
      ghiChu:
        "heSo1 DB hiện tại = 0.01, audit cũ ghi 0.5 — lệch 50 lần. Cùng vấn đề tỉ lệ proc gần-như-không-thể-đạt như id316 (trần điểm ~60 × 0.01 = field tối đa 0.6 → proc tối đa ~0.6%). Gán: PlayersBes.cs:10235 (case 325). Tiêu thụ: A8_Players_03MagicAttack.cs:1061,:3658; A8_Players_02PhysicalAttack.cs:466,:1471.",
    },
    {
      index: null,
      id: 326,
      ten: "Thăng thiên 4 liệt nhật viêm viêm",
      loai: "thang_thien",
      heSo1: 0.5,
      heSo2: null,
      batBuocThangThien: 9,
      moTa:
        "MÔ TẢ LẠI HOÀN TOÀN so với audit cũ sau khi truy lại chuỗi tiêu thụ thật: khi roll < field, GẮN TRẠNG THÁI 1008001170 lên mục tiêu trong 3 giây (có thể bị vài kháng/miễn của mục tiêu chặn: THANNU_ChongLaiThanPhap, KIEM_BachDocBatXam, hoặc nếu mục tiêu đã có trạng thái này thì không áp lại). Trạng thái 1008001170 (tên hàm kiểm tra là '检查毒蛇出洞状态' — dùng CHUNG với các khí công Thăng Thiên 4 khác của NHIỀU nghề, không riêng Mai Liễu Chân) được dùng làm ĐIỀU KIỆN CHẶN ở HÀNG CHỤC vị trí khắp toàn bộ code tấn công của mọi nghề — về bản chất đây là một debuff 'câm phần lớn proc khí công chủ động' diện rộng cho mục tiêu trong 3 giây, KHÔNG PHẢI giảm thẳng % phòng ngự như audit cũ suy đoán. CHƯA XÁC NHẬN được liệu trạng thái này có tự nó trừ thêm % phòng ngự nào không (không tìm thấy đoạn code gán trực tiếp phòng ngự -X% khi áp trạng thái) — cần xem thêm phần khởi tạo (không phải phần hết hạn) của X_Them_Vao_Trang_Thai_Loai cho case 1008001170 nếu cần chắc chắn tuyệt đối.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs:10238 (case 326, field chung base.ThangThien_4_LietNhatViemViem với case 344/374 — các biến thể của nghề khác). Tiêu thụ: Players.cs:40053-40137 (áp trạng thái). Hàm kiểm tra trạng thái: PlayersBes.cs:21432-21435 (检查毒蛇出洞状态). heSo1 DB (0.5) khớp audit cũ.",
    },
    {
      index: null,
      id: 327,
      ten: "Thăng thiên 4 mãn nguyệt cuồng phong",
      loai: "thang_thien",
      heSo1: 0.5,
      heSo2: null,
      batBuocThangThien: 9,
      moTa:
        "Buff tổ đội khi bật Phẫn Nộ (roll < field): +25% Tấn Công, +25% Phòng Ngự (ThemVaoTiLePhanTram_ManYue_CongKich/PhongNgu = 0.25) cho toàn đội trong phạm vi World.群体辅助组队范围 (hằng số cấu hình server, không phải số cố định), kéo dài 5 giây, yêu cầu TeamID != 0.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "SỬA SỐ LIỆU SO VỚI AUDIT CŨ: audit cũ ghi '+20%/+20%, phạm vi 300, 3 giây' — đọc lại code hiện tại (Players.cs:40139-40161) thấy rõ 0.25/0.25 (không phải 0.2), thời lượng status mới 5000ms (không phải 3000ms), và bán kính dùng hằng số World.群体辅助组队范围 chứ không phải số 300 cố định. Gán: PlayersBes.cs:10241 (case 327, field chung base.ThangThien_4_ManNguyetCuongPhong với case 343/353/373/393/613 của các nghề khác).",
    },
    {
      index: null,
      id: 580,
      ten: "Khí công bí cấp (Thăng Thiên 6 thức - Diệu Yến)",
      loai: "thang_thien",
      heSo1: 0.5,
      heSo2: null,
      batBuocThangThien: 11,
      moTa:
        "ĐẢO NGƯỢC HOÀN TOÀN kết luận của audit cũ: khí công này KHÔNG chết — tìm thấy 1 nơi tiêu thụ thật trong hàm 触发人物阎王爆() (kích hoạt vụ nổ 'Yama' của khí công Thần Nữ/Tử Hào 'Thi Độc Bạo Phát', job13). Khi một nhân vật job11 có field>0 SẮP bị vụ nổ này gây sát thương, roll < field thì HUỶ HOÀN TOÀN sát thương của vụ nổ đó (num=0). Đây là khí công phòng thủ RẤT hẹp — chỉ counter đúng 1 cơ chế cụ thể của job13, không có tác dụng với bất kỳ nguồn sát thương nào khác.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "SỬA TRẠNG THÁI: audit cũ (09/2026) kết luận CHET_HOAN_TOAN sau khi grep 'BienNguyThanhAn' chỉ ra 3 kết quả (khai báo/reset/gán, không có nơi đọc). Grep lại HÔM NAY tìm thấy nơi đọc DUY NHẤT tại Players.cs:66395 (trong hàm 触发人物阎王爆, dòng 66385-66414) — rất có thể dòng này được thêm vào trong đợt chỉnh sửa hôm nay (phù hợp với việc audit cũ không thấy). heSo1 DB hiện tại = 0.5 (audit cũ ghi 0.1, lệch 5 lần — không ảnh hưởng kết luận 'còn sống'). Gán: PlayersBes.cs:10473 (case 580).",
    },
    {
      index: null,
      id: 689,
      ten: "[Mai liễu chân] Khí công bí cấp thư (Ma hồn chi lực, Thăng Thiên 5 thức)",
      loai: "thang_thien",
      heSo1: 0.02,
      heSo2: null,
      batBuocThangThien: 10,
      moTa:
        "Ultimate riêng, KHÔNG dùng chung field với nghề khác. Khí công PHÒNG THỦ CHỐNG QUÁI (PvE thuần): nhân hệ số (1 + field) vào TOÀN BỘ thuộc tính 'phòng ngự chống quái' (Tong_NhanVat_PhongThuQuai — thuộc tính tổng hợp, không phải cộng thẳng như audit cũ mô tả mà là NHÂN theo tỉ lệ), KHÔNG có hiệu lực trong PK.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "heSo1 DB hiện tại = 0.02, audit cũ ghi 2.0 — lệch 100 lần, nhưng vì đây là hệ số nhân tuyến tính (không phải % roll như id316/325) nên khí công vẫn hoạt động được, chỉ là scale yếu hơn nhiều so với audit cũ tưởng — ở mức đầu tư cao vẫn có thể đạt hệ số nhân đáng kể (field lớn dần theo điểm × 0.02). Gán: PlayersBes.cs:10329 (case 689). Tiêu thụ: PlayersBes.cs:3805 (thuộc tính Tong_NhanVat_PhongThuQuai).",
    },
  ],
};
