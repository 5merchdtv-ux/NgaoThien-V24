import type { NgheData } from "../khicong-data/types";

// Đối chiếu Ver24 THẬT — đọc lại code SRCGameServerV24B hiện tại (PlayersBes.cs UpdateKhiCong(),
// Players.cs, A8_Players_01SystemAttack.cs, A8_Players_02PhysicalAttack.cs, A8_Players_03MagicAttack.cs,
// A8_Players_04AttackConfirmation.cs, NpcClass.cs, X_Them_Vao_Trang_Thai_Loai.cs, X5_KhiCongLoai/X_Khi_Cong_Thuoc_Tinh.cs)
// KHÔNG dùng lại audit cũ (job07-camsu.ts, 02-03/09) mà không kiểm chứng. Toàn bộ heSo1/heSo2 dưới đây
// lấy trực tiếp từ DB sống (sqlcmd 24pub, bảng TBL_XWWL_SKILL cho khí công gốc job=7 và bảng 升天气功
// cho khí công thăng thiên) ngày 15/09 — rất nhiều giá trị hệ số khác đáng kể so với audit cũ, và một số
// mô tả hành vi (field tiêu thụ thật) cũng khác. Biên soạn 15/09/2026.
export const JOB_07_CAM_SU_V24: NgheData = {
  job: 7,
  tenNghe: "Cầm Sư",
  khiCong: [
    {
      index: 0,
      id: 80,
      ten: "Chiến mã bôn đằng",
      loai: "goc",
      heSo1: 0.5,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "FLD_NhanVat_KhiCong_CongKich = điểm(đã soft-cap 60đ, phần vượt chỉ tính 30%) × 0.5. Cộng thẳng công kích cơ bản, tuyến tính, không roll RNG.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs UpdateKhiCong() case Player_Job==7 → case i==0, dòng ~9741-9743. heSo1 xác nhận lại qua DB (TBL_XWWL_SKILL FLD_JOB=7 FLD_INDEX=0 = 0.5) khớp audit cũ. Không phát hiện thay đổi hành vi.",
    },
    {
      index: 1,
      id: 81,
      ten: "Thu giang dạ bạc",
      loai: "goc",
      heSo1: 16.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa: "NhanVat_KhiCong_ThemVao_HP = (int)(điểm × 16.0). Cộng thẳng HP tối đa, flat, không proc.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case i==1, dòng ~9744-9746. heSo1=16.0 khớp DB và khớp audit cũ. Field NhanVat_KhiCong_ThemVao_HP là int property đơn thuần (PlayersBes.cs ~2319), không có logic % nào bọc quanh.",
    },
    {
      index: 2,
      id: 82,
      ten: "Thanh tâm phổ thiện",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "NhanVat_KhiCong_ThemVao_MP = (int)(điểm × 1.0). Cộng THẲNG (flat) MP tối đa, CÙNG kiểu code với idx1 (HP) — KHÔNG phải theo % như audit cũ mô tả. Field phần trăm MP riêng biệt (NhanVat_KhiCong_ThemVao_TiLePhanTram_MP) tồn tại trong codebase (dùng cho nghề khác, VD job9 idx2) nhưng job7 idx2 KHÔNG dùng field đó.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case i==2, dòng ~9747-9749 (NhanVat_KhiCong_ThemVao_MP, int property PlayersBes.cs ~2415, không có % nào). DB xác nhận heSo1=1.0 (audit cũ ghi 1.2 — SAI, lệch 20%). Disagreement: audit cũ mô tả \"Cộng thêm MP tối đa theo %\" — sai về bản chất công thức (là cộng thẳng, không phải %); không phải bug, chỉ là mô tả sai.",
    },
    {
      index: 3,
      id: 83,
      ten: "Dương quan tam điệp",
      loai: "goc",
      heSo1: 5.0,
      heSo2: 5.0,
      batBuocThangThien: null,
      moTa:
        "FLD_NhanVat_KhiCong_PhongNgu = (int)(điểm × 5.0) [phòng ngự cơ bản] và NhanVat_KhiCong_ThemVao_LucPhongNguVoCong = (int)(điểm × 5.0) [lực phòng ngự võ công, cộng vào getter LucPhongNguVoCong ở PlayersBes.cs ~2228]. Cả hai đều cộng thẳng theo điểm, không roll.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case i==3, dòng ~9750-9753. DB xác nhận heSo1=5.0, heSo2=5.0, khớp hoàn toàn audit cũ. Không phát hiện thay đổi.",
    },
    {
      index: 4,
      id: 84,
      ten: "Hán cung thu nguyệt",
      loai: "goc",
      heSo1: 0.005,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Ghi vào field DÙNG CHUNG toàn server FLD_NhanVat_KhiCong_LucCongKichVoCongGiaTang_TiLePhanTram = điểm × 0.005 (không phải field riêng \"CAMSU_TruongCongKichLuc\" — tên đó KHÔNG tồn tại trong code hiện tại, chỉ là bí danh mô tả của audit cũ). Field này được cộng vào hệ số nhân sát thương chiêu thức Ở CẢ HAI công thức PvE (A8_Players_03MagicAttack.cs dòng ~3208, num10 đánh NPC) VÀ PK (cùng file dòng ~560, num48 đánh người chơi) — xác nhận hiện tại đối xử ĐỒNG NHẤT, không lệch pha PvE/PK.",
      trangThai: "DA_SUA",
      ghiChu:
        "Gán: PlayersBes.cs case i==4, dòng ~9754-9756. DB heSo1=0.005 khớp audit cũ (heSo2 DB thực=0.0, không phải 0.002 như audit cũ ghi, nhưng vô nghĩa vì code chỉ dùng num3/heSo1). Kiểm chứng độc lập xác nhận PvE và PK cùng dùng một field/công thức — không tìm thấy hằng số DB thô tách biệt ở nhánh PK như audit cũ mô tả (có thể do code đã được tái cấu trúc, tách sang A8_Players_03MagicAttack.cs). Giữ trạng thái DA_SUA vì hiện trạng đúng như audit cũ kỳ vọng sau khi sửa.",
    },
    {
      index: 5,
      id: 85,
      ten: "Cao sơn lưu thủy",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "base.CAMSU_CaoSonLuuThuy = điểm(đã soft-cap) × 1.0. Tiêu thụ DUY NHẤT tại Players.cs hàm 魔法使用(double mp) dòng ~40727: `mp -= (int)(mp × (CAMSU_CaoSonLuuThuy × 0.015)); NhanVat_MP -= (int)mp;`. 🔴 KHÔNG có Math.Min/khóa trần nào bọc quanh tỉ lệ giảm phí — đã rà lại toàn bộ property setter (X_Khi_Cong_Thuoc_Tinh.cs ~1385-1395, chỉ get/set trơn) và cả 2 file backup cùng ngày đều có y hệt dòng code này. Với soft-cap 60 điểm (World.限制气功点数=60, hệ số phần vượt 0.3), điểm hiệu dụng > 66.67 → tỉ lệ giảm phí > 100% → biến mp cục bộ ÂM → NhanVat_MP -= (âm) = CỘNG MP thay vì trừ. Ngưỡng cụ thể: tổng điểm đầu tư + mọi nguồn cộng dồn khác (trang bị/buff/đan dược, đều gộp trước khi soft-cap) phải vượt ~82.2 để chạm ngưỡng 66.67 sau soft-cap — hoàn toàn khả thi với nhân vật đầu tư mạnh + trang bị +khí công.",
      trangThai: "CON_LOI_CHUA_SUA",
      ghiChu:
        "Gán: PlayersBes.cs case i==5, dòng ~9757-9759. DB xác nhận heSo1=1.0 (audit cũ ghi 1.2 — sai). DISAGREE MẠNH với audit cũ: audit cũ ghi trangThai=DA_SUA, khẳng định \"ĐÃ SỬA: chặn trần tiLeGiamPhiMp ở 0.8\" tại Players.cs case7 ~46642-46657 — nhưng đọc lại code THẬT hôm nay (Players.cs dòng 40727, hàm 魔法使用) cho thấy KHÔNG có bất kỳ Math.Min/chặn trần nào, công thức y hệt mô tả bug gốc. Exploit MP vô hạn (spam chiêu hoàn MP nhiều hơn phí) hiện vẫn SỐNG trong code hiện tại — đây là phát hiện quan trọng nhất của lần rà soát này, ngược hẳn kết luận DA_SUA của audit cũ.",
    },
    {
      index: 6,
      id: 187,
      ten: "Khí trầm đan điền",
      loai: "goc",
      heSo1: 0.005,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "base.DonKhi_DanDien = điểm × 0.005. Tiêu thụ tại PlayersBes.cs dòng ~10073-10076 (shared cho nhiều nghề): `num10 = FLD_PhongNgu × DonKhi_DanDien / 100.0` rồi cộng vào NhanVat_KhiCong_ThemVao_HP và _LucPhongNguVoCong. Đây là % của phòng ngự cơ bản, KHÔNG phải hệ số flat.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case i==6, dòng ~9760-9762. 🔶 DB xác nhận heSo1=0.005 — audit cũ ghi 0.5, LỆCH GẤP 100 LẦN. Với hệ số thật này, ở mức đầu tư soft-cap tối đa (~66 điểm hiệu dụng): DonKhi_DanDien ≈ 0.33 → chỉ cộng thêm ~0.33% phòng ngự cơ bản — gần như VÔ DỤNG so với kỳ vọng ~33% mà audit cũ ngầm giả định. Không phải lỗi tràn/exploit (không có bug kỹ thuật), nhưng nếu hệ số DB 0.005 là đúng chủ đích thì khí công này hiện gần như phế; nếu là lỗi nhập liệu DB (thiếu nhân 100) thì đây là một vấn đề cân bằng cần GM xem lại — không thể kết luận chỉ từ code.",
    },
    {
      index: 7,
      id: 86,
      ten: "Nhạc dương tam túy",
      loai: "goc",
      heSo1: 0.5,
      heSo2: 0.0025,
      batBuocThangThien: null,
      moTa:
        "Gán 4 field: CamSu_3HopAm_TrangThaiHieuQua = 5.0 + điểm×0.5 (ngưỡng cộng vào các roll debuff idx10/11); CamSu_7HopAm_TrangThaiHieuQua = (5.0+điểm×0.5)×0.01 (hệ số nhân dame combo khi trạng thái 900402/900403); CamSu_9HopAm_TrangThaiHieuQua = 0.025+điểm×0.0025; CamSu_9HopAm_QuanCong_SoLuong = điểm×0.1 (số mục tiêu AoE bổ sung). Xác nhận cả 4 field được dùng ĐỒNG NHẤT ở PvE (A8_Players_03MagicAttack.cs ~919-925, A8_Players_01SystemAttack.cs ~632-650) và PK (cùng file ~3547-3553), cùng công thức.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case i==7, dòng ~9763-9768. DB xác nhận heSo1=0.5, heSo2=0.0025 — audit cũ ghi 1.0/0.006, lệch 2x và 2.4x. Không phát hiện lỗi cấu trúc (không tràn ngưỡng roll, không lệch PvE/PK); chỉ hệ số danh nghĩa khác audit cũ.",
    },
    {
      index: 8,
      id: 87,
      ten: "Mai hoa tam lộng",
      loai: "goc",
      heSo1: 0.2,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "base.CAMSU_MaiHoaTamLong = điểm × 0.2. Tiêu thụ tại 4 vị trí, TẤT CẢ đều so sánh TRỰC TIẾP không nhân ×100: A8_Players_02PhysicalAttack.cs dòng 405 (`RNG.Next(1,110) < CAMSU_MaiHoaTamLong`) và dòng 1397 (`RNG.Next(1,100) < ...`); A8_Players_03MagicAttack.cs dòng 856 và 3519 (cùng dạng `RNG.Next(1,100) < ...`). KHÔNG tìm thấy phép nhân ×100.0 hay Math.Min nào ở bất kỳ vị trí nào trong code hiện tại.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case i==8, dòng ~9769-9771. 🔶 DB xác nhận heSo1=0.2 — audit cũ ghi 0.02, lệch 10 lần. DISAGREE MẠNH với audit cũ: audit cũ mô tả cơ chế \"nhân ×100.0 để so RNG, giá trị lên tới 160, proc luôn nổ, ĐÃ SỬA bọc Math.Min(99.0) ở 4 vị trí\" — nhưng code hiện tại ở CẢ 4 vị trí tiêu thụ đều là so sánh trực tiếp `RNG.Next(1,100) < giá trị` không hề có ×100 lẫn Math.Min. Với heSo1=0.2 thật, ở mức đầu tư soft-cap tối đa (~66 điểm): CAMSU_MaiHoaTamLong ≈ 13.2 → tỉ lệ proc ~13%, hoàn toàn an toàn, không có nguy cơ tràn ngưỡng trong điều kiện chơi thực tế. Không tìm thấy dấu vết cơ chế ×100 hay bug được audit cũ mô tả trong code hiện tại — có thể audit cũ đã đọc nhầm/đọc một phiên bản code khác đã bị tái cấu trúc.",
    },
    {
      index: 9,
      id: 88,
      ten: "Loan phượng hòa minh",
      loai: "goc",
      heSo1: 0.2,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "base.CAMSU_LoanPhuongHoaMinh = điểm × 0.2. Cộng cùng ngưỡng roll với khí công Thăng Thiên 1 \"Phi Hoa Điểm Thúy\" (id390): `RNG.Next(1,100) < CAMSU_LoanPhuongHoaMinh + CAMSU_ThangThien_1_KhiCong_PhiHoaDiemThuy`, dùng đồng nhất ở 3 vị trí: A8_Players_03MagicAttack.cs dòng 920 (PvE) và 3548 (PK), A8_Players_01SystemAttack.cs dòng 637 (đòn AoE hệ thống). Khi trúng: nhân đôi hệ số combo (CamSu_7HopAm×2×(1+PhiHoaDiemThuy)) và tăng số mục tiêu AoE.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case i==9, dòng ~9772-9774. DB xác nhận heSo1=0.2 KHỚP audit cũ (heSo2 DB thực=0.0, không dùng trong code — audit cũ ghi 0.006 nhưng vô nghĩa vì công thức chỉ dùng num3). Ở mức đầu tư tối đa cả 2 khí công cộng lại vẫn dưới ngưỡng 100 rõ rệt — kiến trúc 'cộng 2 khí công vào 1 roll' an toàn, khớp kết luận rà lại 03/09 của audit cũ.",
    },
    {
      index: 10,
      id: 89,
      ten: "Dương minh xuân hiểu",
      loai: "goc",
      heSo1: 0.5,
      heSo2: 0.005,
      batBuocThangThien: null,
      moTa:
        "Gán 4 field: CAMSU_DuongMinhXuanHieu_XacSuat = điểm×0.5 (xác suất chính); _ThoiGian = điểm×2000 (ms); _LucCongKich = điểm×0.005+0.05 (gán vào FLD_JSAT của mục tiêu khi trúng); _TuyetVong = điểm×0.5×0.2 = điểm×0.1 (xác suất phụ, gắn thêm debuff kéo dài 20000ms nếu trúng lần 2). Roll chính: `RNG.Next(1,100) <= CamSu_3HopAm_TrangThaiHieuQua + CAMSU_DuongMinhXuanHieu_XacSuat` (Players.cs ~40799 PvE dạng tay, A8_Players_02PhysicalAttack.cs ~417 PK tay, A8_Players_03MagicAttack.cs ~884 PvE/PK chiêu).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case i==10, dòng ~9775-9780. 🔶 DB xác nhận heSo1=0.5, heSo2=0.005 — audit cũ ghi 0.1/0.0, lệch 5x. Với hệ số thật + cộng dồn CamSu_3HopAm_TrangThaiHieuQua (idx7), xác suất trúng thực tế ở mức đầu tư cao có thể đạt ~33%+38%≈71% — CAO HƠN NHIỀU so với claim \"tối đa ~4-8%, an toàn\" của audit cũ. Không phải lỗi kỹ thuật (RNG.Next(1,100) luôn an toàn dù tổng ngưỡng vượt 100, chỉ đảm bảo proc), nhưng con số thực tế khác biệt lớn so với audit cũ — cần lưu ý khi cân bằng game.",
    },
    {
      index: 11,
      id: 180,
      ten: "Tiêu tương vũ dạ",
      loai: "goc",
      heSo1: 0.5,
      heSo2: 0.005,
      batBuocThangThien: null,
      moTa:
        "Tương tự cấu trúc idx10 nhưng cho debuff giảm phòng ngự mục tiêu: CAMSU_TieuTuongVuDa_XacSuat = điểm×0.5; _ThoiGian = điểm×2000ms; _LucPhongNgu = điểm×0.005+0.05 (gán FLD_JSDF mục tiêu); _BatAn = điểm×0.1 (debuff phụ 20000ms). Roll: `RNG.Next(1,100) < CamSu_3HopAm_TrangThaiHieuQua + CAMSU_TieuTuongVuDa_XacSuat` (Players.cs ~40823, A8_Players_02PhysicalAttack.cs ~433, A8_Players_03MagicAttack.cs ~900).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case i==11, dòng ~9781-9786. 🔶 DB xác nhận heSo1=0.5 (audit cũ ghi 0.1, lệch 5x), heSo2=0.005 (audit cũ ghi 0.006, gần đúng). Cùng nhận định như idx10: xác suất trúng thực tế cao hơn nhiều so với claim cũ \"tối đa 4-8%\", nhưng không phải lỗi kỹ thuật — chỉ là con số cân bằng khác biệt so với audit cũ.",
    },
    {
      index: null,
      id: 390,
      ten: "Thăng thiên 1: Phi hoa điểm thúy",
      loai: "thang_thien",
      heSo1: 0.2,
      heSo2: null,
      batBuocThangThien: 6,
      moTa:
        "Gán 2 field: CAMSU_ThangThien_1_KhiCong_PhiHoaDiemThuy = điểm×0.2 (cộng vào ngưỡng roll chung với Loan Phượng Hòa Minh idx9, xem chi tiết ở đó — khi trúng nhân đôi hệ số combo và tăng số mục tiêu AoE); và CAMSU_ThangThien_1_KhiCong_PhiHoaDiemThuy_GiaThanh = điểm×0.0002+0.02 — field thứ hai này KHÔNG được đọc/tiêu thụ ở BẤT KỲ đâu trong toàn bộ codebase đã rà soát (chỉ có gán và reset về 0), tức là NỬA hiệu ứng của khí công này chết hoàn toàn (dead code). Công thức số mục tiêu AoE (A8_Players_01SystemAttack.cs ~632-650) dùng phép ép kiểu (int) làm tròn XUỐNG bình thường, KHÔNG phải cơ chế 'randomize hoá xác suất' — nhưng vẫn tăng tuyến tính theo điểm đầu tư (không bị kẹt cứng ở giá trị 2).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs foreach thăng thiên case 390, dòng ~10174-10177. DB (bảng 升天气功, 气功ID=390, 人物职业7=1) xác nhận heSo=0.2 — audit cũ ghi 1.0, lệch 5x. DISAGREE với audit cũ: audit cũ khẳng định 'trước 31/08 luôn làm tròn xuống 2, ĐÃ SỬA bằng random hoá xác suất' — code hiện tại KHÔNG có dấu vết cơ chế random hoá nào, chỉ có (int) truncation đơn giản ở A8_Players_01SystemAttack.cs — nhưng vì num6 (số mục tiêu bổ sung) tăng tuyến tính theo điểm, hành vi hiện tại vẫn hợp lý/không phải bug 'luôn = 2'. Phát hiện mới: field _GiaThanh chưa từng được tiêu thụ — nửa hiệu ứng của khí công chết.",
    },
    {
      index: null,
      id: 391,
      ten: "Thăng thiên 2: Tam đàm ánh nguyệt",
      loai: "thang_thien",
      heSo1: 0.5,
      heSo2: null,
      batBuocThangThien: 7,
      moTa:
        "CAMSU_ThangThien_2_KhiCong_TamDamAnhNguyet = 10.0 + điểm×0.5 (audit cũ BỎ SÓT phần nền +10.0 cố định). Khi bị tấn công: PvE (NpcClass.cs ~1425, NPC đánh job7) roll `RNG.Next(1,100) <= giá trị` trực tiếp; PK (A8_Players_04AttackConfirmation.cs ~327) roll `RNG.Next(1,100) <= giá trị - 5.0`. Khi trúng ở nhánh PK, sát thương được PHẢN NGƯỢC vào chính ĐỐI PHƯƠNG tấn công (`base.NhanVat_HP -= num3` với base = kẻ tấn công) — tức đây là hiệu ứng PHÒNG THỦ/PHẢN ĐÒN bảo vệ Cầm Sư, KHÔNG PHẢI 'tự gây thêm sát thương lên chính nhân vật hiện tại' như audit cũ mô tả. Buff nền +10.0 bị trừ lại khi một trạng thái liên quan hết hạn (X_Them_Vao_Trang_Thai_Loai.cs ~248-251).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case 391, dòng ~10178-10180. DB xác nhận heSo=0.5 (audit cũ ghi 0.2, lệch 2.5x) VÀ audit cũ hoàn toàn bỏ sót phần nền +10.0. Với hệ số + nền thật, ở mức đầu tư cao xác suất trúng ~43% (PvE) / ~38% (PK) — cao hơn nhiều so với claim cũ 'tối đa 14%, an toàn'. DISAGREE về BẢN CHẤT hiệu ứng: đây là khí công PHẢN ĐÒN (gây sát thương ngược lên đối phương tấn công), không phải khí công tự hại như audit cũ diễn giải — cần sửa lại mô tả gameplay, không phải một bug kỹ thuật.",
    },
    {
      index: null,
      id: 392,
      ten: "Thăng thiên 3: Tử dạ thu ca",
      loai: "thang_thien",
      heSo1: 0.02,
      heSo2: null,
      batBuocThangThien: 8,
      moTa:
        "CAMSU_ThangThien_3_KhiCong_TuDaThuCa = 1.0 + điểm×0.02 (hệ số nhân thẳng, không roll). Nhân vào hệ số combo dame của Nhạc Dương Tam Túy: `dame *= 1.0 + CamSu_7HopAm_TrangThaiHieuQua × CAMSU_ThangThien_3_KhiCong_TuDaThuCa`, xác nhận đồng nhất PvE (A8_Players_03MagicAttack.cs ~3553) và PK (~925). Ở mức đầu tư soft-cap tối đa (~66-70 điểm): hệ số nhân đạt khoảng x2.3, không phải x3.26 như audit cũ ước tính (do hệ số DB thật thấp hơn nhiều). Không dùng RNG nên không có nguy cơ tràn ngưỡng.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case 392, dòng ~10181-10183. DB xác nhận heSo=0.02 — audit cũ ghi 1.0, LỆCH 50 LẦN. Không phải lỗi kỹ thuật, chỉ số nền/hệ số nhân dame thực tế thấp hơn nhiều so với audit cũ tưởng — cần cập nhật lại con số khi so sánh cân bằng.",
    },
    {
      index: null,
      id: 393,
      ten: "Thăng thiên 4: Mãn nguyệt cuồng phong",
      loai: "thang_thien",
      heSo1: 0.5,
      heSo2: null,
      batBuocThangThien: 9,
      moTa:
        "Field dùng chung nhiều nghề: ThangThien_4_ManNguyetCuongPhong = điểm×0.5. Tiêu thụ trong hàm 升天四气功触发() (Players.cs ~39935 trở đi), yêu cầu Player_Level>=140 và Player_Job_Level>=9, VÀ CHỈ PROC KHI ĐANG TRONG ĐỘI (`TeamID != 0` — không hoạt động khi chơi solo, khác id394 hoạt động cả solo lẫn team). Roll dùng CHUNG một số ngẫu nhiên `Random.Next(1,101)` với nhiều kiểm tra thăng thiên-4 của CÁC NGHỀ KHÁC trong cùng lần gọi hàm (không ảnh hưởng job7 vì field của nghề khác luôn =0 với nhân vật job7). Khi trúng: +1000 HP tối đa cho cả đội, tự làm mới (refresh trạng thái 1008001174/1008001169) khi proc lại.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs case 393, dòng ~10184-10186 (và case 373 tương tự tại ~10120-10122 cho một field khác id371-dạng, không liên quan job7). DB xác nhận heSo=0.5, KHỚP audit cũ hoàn toàn. Bổ sung phát hiện mới so với audit cũ: hiệu ứng CHỈ proc khi trong đội (TeamID!=0), và dùng chung 1 roll RNG với các khí công thăng-thiên-4 của nghề khác trong cùng lệnh gọi hàm — không phải bug, chỉ là chi tiết cơ chế audit cũ chưa ghi.",
    },
    {
      index: null,
      id: 394,
      ten: "Thăng thiên 4: Huyền ti chẩn mạch (quát cốt liệu độc)",
      loai: "thang_thien",
      heSo1: 3.5,
      heSo2: null,
      batBuocThangThien: 9,
      moTa:
        "Field riêng cho Cầm Sư: ThangThien_4_HuyenTiChanMach = điểm×3.5. Tiêu thụ ở 2 vị trí trong Players.cs (hàm 升天四气功触发, dòng ~39945 VÀ một hàm tương tự thứ hai dòng ~40304), CẢ HAI đều roll `int num = Random.Next(1,101); if (num < HuyenTiChanMach ...)` — KHÔNG có Math.Min hay bất kỳ khóa trần nào bọc quanh giá trị này ở cả 2 vị trí. Với heSo=3.5, chỉ cần điểm hiệu dụng ≈29 (dưới ngưỡng soft-cap 60, không cần trang bị cộng thêm) là giá trị đã ≥100 → PROC LUÔN NỔ 100%, mất hoàn toàn tính random. Khi trúng: +10% phòng ngự cho bản thân/toàn đội trong 5000ms (không phải 3 giây như audit cũ ghi), tự làm mới liên tục.",
      trangThai: "CON_LOI_CHUA_SUA",
      ghiChu:
        "Gán: PlayersBes.cs case 394, dòng ~10187-10189. DB xác nhận heSo=3.5, KHỚP audit cũ. DISAGREE MẠNH với audit cũ: audit cũ ghi trangThai=DA_SUA, khẳng định 'đã thêm Math.Min(...,99.0) tại Players.cs ~46194' — nhưng đọc lại CẢ HAI vị trí tiêu thụ thật trong code hiện tại (Players.cs dòng 39945 và 40304, đều thuộc các bản khác nhau của hàm 升天四气功触发) đều KHÔNG có Math.Min hay chặn trần nào. Bug 'chỉ cần ~29/70 điểm là proc luôn nổ 100%' mà audit cũ mô tả là hiện trạng TRƯỚC sửa vẫn đang SỐNG trong code hiện tại — cùng loại phát hiện như Cao Sơn Lưu Thủy (idx5).",
    },
    {
      index: null,
      id: 576,
      ten: "Khí công bí cấp (Thăng Thiên 6 thức - Cầm Sư)",
      loai: "thang_thien",
      heSo1: 3.0,
      heSo2: null,
      batBuocThangThien: 11,
      moTa:
        "base.CANSU_HuyetMach_ThuongThang = điểm×3.0. 🔴 TIÊU THỤ THẬT (PlayersBes.cs dòng ~2265, getter `Tong_CuongKhi`): field này cộng thẳng vào chỉ số TỔNG CƯỜNG KHÍ hiển thị (`Tong_CuongKhi = FLD_TrangBi_ThemVao_CuongKhi + FLD_Pet_ThemVao_CuongKhi + CANSU_HuyetMach_ThuongThang + max(0, HuyetKhiCuongDuong_TT6_2 - GiamCuongKhi)`) — chỉ số Cường Khí này chính là 'nửa phòng thủ' dùng trong hệ thống so sánh PK Tinh Kim Bách Luyện/Huyết Khí Cường Dương (xem khicong-data/shared.ts id620/633) — KHÔNG PHẢI cộng thẳng vào phòng ngự cơ bản (FLD_NhanVat_KhiCong_PhongNgu, field của idx3) như audit cũ mô tả hoàn toàn.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs foreach thăng thiên case 576, dòng ~10460-10462 (`base.CANSU_HuyetMach_ThuongThang = num11*num12`, KHÔNG PHẢI field liên quan idx3). 🔴 DB xác nhận heSo=3.0 — audit cũ ghi 0.1, LỆCH 30 LẦN. DISAGREE MẠNH VỀ BẢN CHẤT với audit cũ: audit cũ mô tả 'Cộng thẳng vào phòng ngự cơ bản (+=), không ghi đè lên khí công gốc idx3 vì field được reset về 0 trước khi gán tuần tự' — đây là mô tả SAI HOÀN TOÀN field đích. Field thật (CANSU_HuyetMach_ThuongThang) không liên quan gì tới FLD_NhanVat_KhiCong_PhongNgu/idx3, mà nuôi thẳng chỉ số Cường Khí dùng trong so sánh PK. Đây là phát hiện quan trọng cần audit lại toàn bộ nhánh liên quan.",
    },
    {
      index: null,
      id: 685,
      ten: "[Cầm sư] Khí công bí cấp thư (Long trảo tiêm chỉ thủ, Thăng Thiên 5 thức)",
      loai: "thang_thien",
      heSo1: 0.5,
      heSo2: null,
      batBuocThangThien: 10,
      moTa:
        "ThangThien_5_LongTraoTiemChiThu = điểm×0.5. Khi trúng roll `RNG.Next(1,100) <= giá trị`, nhân dame combo ×1.2 — xác nhận đồng nhất PvE (A8_Players_03MagicAttack.cs ~927-931) và PK (~3555-3559). Ở mức đầu tư soft-cap tối đa (~66 điểm): xác suất ~33%.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs foreach thăng thiên case 685, dòng ~10316-10318. DB xác nhận heSo=0.5, KHỚP audit cũ. Không phát hiện thay đổi hành vi.",
    },
  ],
};
