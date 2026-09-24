import type { NgheData } from "../khicong-data/types";

// Đối chiếu Ver24 THẬT — đọc lại code SRCGameServerV24B hiện tại (không dùng lại audit cũ 02/09
// mà không kiểm chứng), biên soạn 15/09/2026.
//
// GHI CHÚ CHUNG QUAN TRỌNG (áp dụng cho TOÀN BỘ entry bên dưới, không lặp lại ở từng dòng):
// 1) World.限制气功点数 (trần điểm đầu tư khí công, dùng CHUNG cho cả khí công "gốc" lẫn "Thăng Thiên")
//    mặc định = 60 (World.cs:2385), KHÔNG PHẢI 80 như audit cũ ngầm giả định xuyên suốt — không thấy
//    override trong các file config.ini đã kiểm (PROFILES/test.1, SRCGameServerV24B/bin/*). Mọi con số
//    "% tối đa ở N điểm" trong audit cũ cần đọc lại theo mốc 60, trừ khi Admin xác nhận server thật chạy
//    ini khác. Vượt quá 60 điểm (qua trang bị/buff) vẫn được nhưng bị giảm hiệu lực theo World.限制气功百分比.
// 2) heSo1/heSo2 đã được đối chiếu TRỰC TIẾP với DB "24pub" (bảng TBL_XWWL_SKILL cho khí công gốc theo
//    FLD_JOB/FLD_INDEX, bảng 升天气功 cho khí công Thăng Thiên theo 气功ID) — nhiều giá trị heSo1 trong
//    file audit cũ (job13-thannu.ts) SAI KHÁC ĐÁNG KỂ so với DB hiện hành (xem ghiChu từng entry). Vì vậy
//    heSo1/heSo2 trong file này đã được CẬP NHẬT theo DB thật, không giữ nguyên số cũ.
// 3) Players.cs (71995 dòng) đã bị TÁCH một phần logic combat sang các file partial-class riêng trong
//    thư mục Players\ (A8_Players_01SystemAttack.cs, A8_Players_02PhysicalAttack.cs,
//    A8_Players_03MagicAttack.cs, A8_Players_04AttackConfirmation.cs...) trong phiên chỉnh sửa gần đây —
//    nhiều field khí công Thần Nữ được tiêu thụ ở các file này chứ KHÔNG còn ở Players.cs gốc.
export const JOB_13_THAN_NU_V24: NgheData = {
  job: 13,
  tenNghe: "Thần Nữ",
  khiCong: [
    {
      index: 0,
      id: 450,
      ten: "Vận khí hành tâm",
      loai: "goc",
      heSo1: 0.04,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Xác nhận đúng như audit cũ. Tăng % lượng MP hồi được khi uống thuốc/đan dược hồi MP (hàm 加魔, KHÔNG phải hồi MP tự nhiên theo thời gian). Công thức: sl = sl × (1 + field). Ở trần điểm thật của server (60, không phải 80): field = 60×0.04 = 2.4 → tối đa +240% lượng MP nhận mỗi lần dùng thuốc (không phải +320% như audit cũ tính theo trần 80).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Field ThanNu_VanKhiHanhTam (khai báo X_Khi_Cong_Thuoc_Tinh.cs:2657/347). Gán PlayersBes.cs:10033 (trong UpdateKhiCong(), bắt đầu dòng 9423 — switch(Player_Job) case 13 → switch(i) case 0). Reset PlayersBes.cs:6987. Tiêu thụ DUY NHẤT tại PlayersBes.cs:22516, hàm 加魔() (PlayersBes.cs:22504) — đúng như audit cũ cảnh báo, không nằm trong Players.cs. DB (TBL_XWWL_SKILL, FLD_JOB=13, FLD_INDEX=0) xác nhận heSo1=0.04, khớp audit cũ.",
    },
    {
      index: 1,
      id: 451,
      ten: "Thái cực tâm pháp",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Xác nhận đúng cơ chế audit cũ. Giảm % phí MP khi dùng chiêu: num = field×0.01; mp -= mp×num. Với heSo1=1.0 và trần thật 60 điểm, field tối đa 60 → giảm tối đa 60% phí MP (không phải 80%, do trần thật là 60 không phải 80). Hệ số 1.0 tự nhiên chặn công thức dưới 100% trong phạm vi điểm hợp lý, không cần vá riêng.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Field ThanNu_ThaiCucTamPhap. Gán PlayersBes.cs:10036. Reset PlayersBes.cs:6988. Tiêu thụ Players.cs:40730-40736 (case 13 trong switch(Player_Job) tính phí MP khi thi triển võ công). DB xác nhận heSo1=1.0, khớp audit cũ.",
    },
    {
      index: 2,
      id: 452,
      ten: "Thần lực kích phát",
      loai: "goc",
      heSo1: 0.005,
      heSo2: 5.0,
      batBuocThangThien: null,
      moTa:
        "Viết lại cơ chế cho chính xác: 2 field cùng gán 1 case nhưng KHÔNG mở proc riêng của chính khí công này — không phải 'lỗi', chỉ là audit cũ gán nhầm vai trò từng field. (1) PT_QUAI (heSo2): 50+điểm×5, cộng thẳng vào Tong_NhanVat_PhongThuQuai — chỉ có tác dụng phòng ngự khi bị QUÁI đánh (PvE), không ảnh hưởng PK; tối đa 50+60×5=350 ở trần 60 điểm (không phải 450). (2) Field heSo1 KHÔNG có cổng proc riêng — nó chỉ là hệ số nhân dame phụ (1+field) áp cho CongKichLuc trong nhánh tính sát thương đa mục tiêu, kích hoạt bất cứ khi nào đòn đánh trở thành multi-target (kể cả do 2 proc 10% cố định thuộc idx3 bên dưới gây ra); tối đa +30% dame nhánh đó ở trần 60 điểm (không phải +40%). 'Cổng 10% cố định' mà audit cũ gán cho khí công này thực chất dùng 2 field HẰNG SỐ riêng (ThanNu_SatTinhNghiaHo, ThanNu_SatTinhNghiaSat = 10.0 hard-code, không đổi theo điểm đầu tư BẤT KỲ khí công nào của Thần Nữ), và khi trúng lại đọc field của idx3 (ThanNu_SatTinhNghiaKhi) làm hệ số dame — không phải field của idx2. Kết luận 'proc cố định 10%, không tăng theo điểm' của audit cũ vẫn ĐÚNG về bản chất, chỉ sai cách gán field nào làm gì. Không tìm thấy bất kỳ hành vi lỗi/tràn/không nhất quán nào trong cơ chế đang chạy — mọi phần đều hoạt động như 1 passive bình thường, nên ĐỔI VERDICT từ CON_LOI_CHUA_SUA (audit cũ) sang BINH_THUONG.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "2 field: ThanNu_ThanLucKichPhat + ThanNu_ThanLucKichPhat_PT_QUAI. Gán PlayersBes.cs:10039-10040. Reset PlayersBes.cs:6989-6990. Tiêu thụ: PT_QUAI tại PlayersBes.cs:3805 (property Tong_NhanVat_PhongThuQuai); field chính tại A8_Players_01SystemAttack.cs:601-654 (khối multi-target, dòng 653 áp field). 2 proc 10% cố định thật: PlayersBes.cs:6985-6986 (hằng số 10.0); cổng roll tại A8_Players_03MagicAttack.cs:1112/1117 (PK, trong hàm MagicAttack_Player), 3687/3693 (PvE, trong hàm ComputingAttack — nhận tham số NpcClass npcTemp). SỬA LẠI nhãn PvE/PK so với 1 bản nháp trước của file này (đã bị đảo ngược) sau khi xác minh trực tiếp ranh giới 2 hàm: MagicAttack_Player dòng 56-1516 = PK, ComputingAttack từ dòng 3082 = PvE. DB xác nhận heSo1=0.005, heSo2=5.0, khớp audit cũ.",
    },
    {
      index: 3,
      id: 453,
      ten: "Sát tinh nghĩa khí",
      loai: "goc",
      heSo1: 0.002,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Field là hệ số DAME cho 2 proc cố định 10% (gate = ThanNu_SatTinhNghiaHo/ThanNu_SatTinhNghiaSat, hằng 10.0, PlayersBes.cs:6985-6986). Proc 'Sát Tinh Nghĩa Hổ' (AoE, cố định 5 mục tiêu — A8_Players_01SystemAttack.cs:608-610): dame×(1.15+field), giống nhau cả PvE lẫn PK. Proc 'Sát Tinh Nghĩa Sát/Trung Nghĩa Sát' (đơn mục tiêu): dame×(1.35+field) ở PK (MagicAttack_Player, dòng 1120) nhưng CHỈ ×(1.25+field) ở PvE (ComputingAttack, dòng 3697) — bất đối xứng PvE/PK mà audit cũ không ghi nhận (đã xác minh trực tiếp ranh giới hàm: MagicAttack_Player dòng 56-1516 = PK, ComputingAttack từ dòng 3082 = PvE, nhận tham số NpcClass npcTemp). Ở trần 60 điểm: field=0.12 → Hổ×1.27 (cả 2 phía), Sát PK×1.47, Sát PvE×1.37 (không phải ×1.51 như audit cũ). Số mục tiêu AoE của proc Hổ xác nhận VẪN cố định = 5 (A8_Players_01SystemAttack.cs:608-610), không còn công thức nhân theo field×100 — fix cũ (03/09) vẫn còn hiệu lực trong code hiện tại.",
      trangThai: "DA_SUA",
      ghiChu:
        "Field ThanNu_SatTinhNghiaKhi. Gán PlayersBes.cs:10043. Reset PlayersBes.cs:6991. Tiêu thụ: A8_Players_03MagicAttack.cs:1112-1121 (PK, hàm MagicAttack_Player), 3687-3697 (PvE, hàm ComputingAttack); số mục tiêu AoE tại A8_Players_01SystemAttack.cs:601-623. DB xác nhận heSo1=0.002, khớp audit cũ. KHÔNG xác minh lại độc lập claim 'nới bán kính tìm mục tiêu PvE +điểm×0.002×100' của audit cũ trong lần rà soát này — không tìm thấy công thức tương ứng ở các vị trí đã đọc, cần rà thêm NpcClass.cs nếu cần chắc chắn.",
    },
    {
      index: 4,
      id: 454,
      ten: "Tẩy tủy dịch cân",
      loai: "goc",
      heSo1: 0.01,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Xác nhận đúng cơ chế audit cũ. Field riêng ThanNu_TayTuyDichCan vẫn là mồ côi (chỉ reset về 0, không bao giờ được gán). Hiệu ứng thật chạy qua field DÙNG CHUNG NhanVat_KhiCong_ThemVao_TiLePhanTram_MP (cũng dùng bởi job9 Đàm Hoa Liên ở index khác). CharacterMax_MP cộng field này 2 lần trong cùng công thức (1 lần dạng số cộng thẳng không đáng kể, 1 lần dạng hệ số nhân %) — đây là thiết kế DÙNG CHUNG cho mọi nghề có loại khí công này, không phải lỗi riêng Thần Nữ. Ở trần 60 điểm: field=0.6 → +60% MP tối đa (không phải +80%).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "DB (TBL_XWWL_SKILL, FLD_JOB=13, FLD_INDEX=4) xác nhận heSo1=0.01 — SAI KHÁC 100 lần so với heSo1=1.0 mà audit cũ ghi trong file ts; tuy vậy con số '+80%' trong moTa cũ khớp nếu tính đúng 0.01×80, cho thấy audit cũ tính % cuối đúng nhưng lưu sai heSo1 gốc. Gán PlayersBes.cs:10046. Tiêu thụ PlayersBes.cs:2313 (getter CharacterMax_MP).",
    },
    {
      index: 5,
      id: 193,
      ten: "Khí trầm đan điền",
      loai: "goc",
      heSo1: 0.005,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Xác nhận đúng cơ chế audit cũ (field dùng chung DonKhi_DanDien, chuyển 1 phần Phòng Ngự thành cả HP lẫn ULPT). Công thức: num10=(int)(FLD_PhongNgu×field/100); CÙNG num10 được cộng vào cả NhanVat_KhiCong_ThemVao_HP và NhanVat_KhiCong_ThemVao_LucPhongNguVoCong. Ở trần 60 điểm: field=0.3 → 30% Phòng Ngự cơ bản chuyển thành HP và ULPT cộng thêm (không phải 40%). PHÁT HIỆN MỚI: phần đóng góp ULPT của field này có thể bị GHI ĐÈ MẤT nếu người chơi cũng đầu tư Thăng Thiên khí công id612 (Thần Lực Bảo Hộ) — case 612 dùng phép gán '=' (không phải '+=') lên CÙNG field NhanVat_KhiCong_ThemVao_LucPhongNguVoCong, chạy SAU trong cùng lượt UpdateKhiCong(); xem chi tiết ở entry Thăng Thiên id612.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "DB xác nhận heSo1=0.005 cho id193/index5/job13 — SAI KHÁC 100 lần so với 0.5 audit cũ ghi (nhưng số '40%' cuối trong moTa cũ vẫn khớp 0.005×80, cùng kiểu lỗi lưu heSo1 như id454). Gán PlayersBes.cs:10049 (goc). Tiêu thụ PlayersBes.cs:10073-10078. Bị case 612 (Thăng Thiên) ghi đè gián tiếp qua field ULPT chung, xem PlayersBes.cs:10364-10366.",
    },
    {
      index: 6,
      id: 455,
      ten: "Hắc hoa mạn khai",
      loai: "goc",
      heSo1: 0.01,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "ĐÍNH CHÍNH LỚN so với audit cũ: field KHÔNG hề chết — có 4 nơi tiêu thụ thật. (1)-(3) Nới tầm đánh chiêu: World.神女PK距离×(1+field) khi PK chiêu, World.神女打怪距离×(1+field) khi đánh quái PvE, và bản PK đòn tay tương tự — ở trần 60 điểm field=0.6 → nới tầm đánh tối đa +60% cho cả 3 loại hình, hiệu ứng thật và đáng kể. (4) Cộng vào bán kính nổ cơ chế 'Yama Bạo' (BOM của idx9/id458 khi áp lên quái, xem id616): NpcClass.cs:646 `阎王爆爆炸距离 += (int)field`. Do field bị ép kiểu (int) và heSo1 rất nhỏ, ở mọi mức đầu tư thực tế field luôn <1.0 nên phần đóng góp này luôn = 0 trên thực tế dù công thức tồn tại thật.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Field ThanNu_HacHoaManKhai. Gán PlayersBes.cs:10052. Reset PlayersBes.cs:6993. 4 nơi tiêu thụ: A8_Players_03MagicAttack.cs:257; A8_Players_01SystemAttack.cs:487; A8_Players_02PhysicalAttack.cs:1001; X3_NpcClass\\NpcClass.cs:646 (hàm 触发阎王爆, dòng 632-659). DB xác nhận heSo1=0.01 (audit cũ ghi 1.0 — sai). Đảo ngược hoàn toàn so với verdict CHET_HOAN_TOAN cũ — chưa rõ đây là do code đã được nối lại trong phiên chỉnh sửa gần đây hay audit cũ đã rà sai từ đầu; nên đối chiếu thêm với V22 nếu cần biết chắc.",
    },
    {
      index: 7,
      id: 456,
      ten: "Diệu thủ hồi xuân",
      loai: "goc",
      heSo1: 0.002,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "ĐÍNH CHÍNH so với audit cũ nhưng theo hướng tinh vi hơn: field CÓ được đọc trong 1 công thức thật (hàm 内功恢复 — tick hồi HP định kỳ), KHÔNG phải 'gán rồi bỏ không'. Công thức: num=(int)(ThanNuTrangThai_BatThuong[46].FLD_NUM×(1+field)), chỉ áp dụng khi người chơi đang mang trạng thái nội bộ 46 (cấp bởi khí công 6002301/6002302, thời hạn 60 giây). VẤN ĐỀ: ở cả 2 nơi tạo trạng thái 46, tham số FLD_NUM được truyền CỨNG = 0.0 — nên num = (int)(0×(1+field)) = 0 VĨNH VIỄN bất kể đầu tư bao nhiêu điểm. Kết quả thực tế: đầu tư điểm vẫn không tạo thêm HP hồi nào — trùng kết luận cuối của audit cũ nhưng lý do khác hẳn (không phải thiếu công thức, mà công thức luôn nhân 0 — nhiều khả năng do thiếu bước truyền FLD_NUM thật khi tạo trạng thái 46, một dạng thiếu sót/lỗi tinh vi hơn 'mồ côi hoàn toàn'). Nhánh phụ dùng key 47 trong cùng hàm chắc chắn không bao giờ chạy tới vì không nơi nào TryAdd key 47.",
      trangThai: "CON_LOI_CHUA_SUA",
      ghiChu:
        "Field ThanNu_DieuThuHoiXuan. Gán PlayersBes.cs:10055. Reset PlayersBes.cs:6994. Tiêu thụ thật Players.cs:42084-42091 (nhưng luôn nhân 0 — xem moTa); nơi tạo trạng thái 46: A8_Players_03MagicAttack.cs:2467-2475 (case 6002301, cá nhân) và 2478-2497 (case 6002302, toàn đội), cả 2 truyền FLD_NUM=0.0. Field song sinh DAIPHU_DieuThuHoiXuan (Đại Phu) XÁC NHẬN có 3 nơi tiêu thụ thật với FLD_NUM khác 0 — A8_Players_03MagicAttack.cs:1529/1544/1564. DB xác nhận heSo1=0.002 (audit cũ ghi 1.0 — sai).",
    },
    {
      index: 8,
      id: 457,
      ten: "Trường công kích lực (Thần nữ)",
      loai: "goc",
      heSo1: 0.002,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Xác nhận đúng cơ chế audit cũ (hệ số nhân dame chiêu trực tiếp, không qua proc, luôn áp dụng) nhưng SAI đáng kể về độ lớn VÀ chiều PvE/PK. num48 ×= (1+field) ở PK (MagicAttack_Player, dòng 1110) và num10 ×= (1+field×2.0) ở PvE (ComputingAttack, dòng 3685) — hệ số nhân đôi ở PvE so với PK, bất đối xứng mà audit cũ không ghi nhận (và có bản nháp trước của file này ghi ngược chiều — đã xác minh lại trực tiếp qua ranh giới hàm: MagicAttack_Player dòng 56-1516 = PK, ComputingAttack từ dòng 3082 = PvE). Với heSo1 DB thật=0.002 và trần 60 điểm: field=0.12 → tối đa CHỈ +12% dame PK / +24% dame PvE — audit cũ ghi tới +120% sai đáng kể (ngay cả dùng heSo1 cũ 0.01 với trần 80 cũng chỉ ra +80%, không phải +120% — số +120% trong audit cũ không tự nhất quán với chính heSo1 nó ghi).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Field ThanNu_TruongCongKichLuc. Gán PlayersBes.cs:10058. Reset cùng nhóm PlayersBes.cs:6985-7001. Tiêu thụ A8_Players_03MagicAttack.cs:1110 (PK) và :3685 (PvE, hệ số ×2.0). DB xác nhận heSo1=0.002 — sai khác lớn so với 0.01 audit cũ, kéo theo số '%tối đa' trong moTa cũ sai theo.",
    },
    {
      index: 9,
      id: 458,
      ten: "Hắc hoa tập trung",
      loai: "goc",
      heSo1: 0.5,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Công thức proc thật ở 10 vị trí đã lấy mẫu trong A8_Players_03MagicAttack.cs: RNG.Next(1,100) <= 60.0 + field — chance CƠ BẢN 60% cộng thêm tối đa +điểm×0.5, KHÁC HẲN công thức 'nhân ×5.0/×3.0 + Math.Min(...,99.0)' mà audit cũ mô tả (không tìm thấy dấu vết Math.Min hay hệ số ×5/×3 nào ở các vị trí đã kiểm — có thể code đã được viết lại từ đợt vá 02/09). Ở trần 60 điểm: field=30 → chance tối đa 60+30=90%, VẪN có yếu tố ngẫu nhiên thật (RNG.Next(1,100) cho 1-99), không guaranteed-hit ở mức đầu tư tối đa mặc định server. Mỗi nhánh còn bị 2 lớp kháng của ĐỐI PHƯƠNG chặn trước (THANNU_ChongLaiThanPhap rồi KIEM_BachDocBatXam). Cơ chế BOM (trạng thái 44, 8 giây) chỉ gắn lên quái có cờ 怪物阎王爆=true khi dùng đúng chiêu 6002206 (tối đa 4 mục tiêu/lần cast); khi hết giờ nổ theo công thức của id616, tối đa 5 mục tiêu. CHƯA xác minh độc lập trong lần rà soát này: hiệu ứng giảm tác dụng khí công địch, DOT định kỳ, cờ miễn nhiễm tạm thời, cú đánh cố định 30% Max HP, và 'tự buff = nửa mức debuff' — các claim này giữ nguyên từ audit cũ với độ tin cậy THẤP HƠN.",
      trangThai: "DA_SUA",
      ghiChu:
        "Field ThanNu_HacHoaTapTrung. Gán PlayersBes.cs:10061. Reset PlayersBes.cs:6996. 10 vị trí roll lấy mẫu: A8_Players_03MagicAttack.cs:2296,2334,2372,2445,2519,2560,2652,2694,2732,2826. Trạng thái BOM (44) timer-end: X_Than_Nu_Di_Thuong_Trang_Thai_Loai.cs:152-154 gọi Play.触发人物阎王爆() (bản NHỎ, mục tiêu người chơi, Players.cs:66385-66404) — bản LỚN dùng tích luỹ sát thương thật cho mục tiêu quái ở NpcClass.cs:632-659. KHÔNG tìm thấy 'Gsconfig' hay danh sách buff dispel nào trong toàn RxjhServer (đã grep, 0 kết quả) — claim 'kích hoạt 611 mỗi lần cast' của audit cũ KHÔNG được xác nhận, xem entry id611. DB xác nhận heSo1=0.5, khớp audit cũ.",
    },
    {
      index: 10,
      id: 459,
      ten: "Chân vũ tuyệt kích (Thần nữ)",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 1.4,
      batBuocThangThien: null,
      moTa:
        "Cổng proc: field (theo điểm đầu tư) >= RNG.Next(1,100) — % thành công CHÍNH LÀ điểm đầu tư trực tiếp, ở trần 60 điểm = 60% (audit cũ không mô tả cổng theo cách này, chỉ nói 'proc dame chuẩn'). Khi trúng và đối phương không phản bằng HanBaoQuan_ChanKhiHoanNguyen: dame ×= 得到气功加成值(13,10,2) — đây là TRA CỨU ĐỘNG từ DB (TBL_XWWL_SKILL, job13/index10/type2), KHÔNG PHẢI hard-code ×1.3 như audit cũ khẳng định. Giá trị DB hiện tại = 1.4 (không phải 1.3); nếu Admin chỉnh DB thì dame proc đổi ngay không cần sửa code. CHƯA xác minh độc lập claim 'buff tạm +10/-10 chồng lên nền gốc' của audit cũ trong lần rà soát này.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Field ThanNu_ChanVu_TuyetKich. Gán PlayersBes.cs:10064. Reset PlayersBes.cs:6997. Tiêu thụ A8_Players_03MagicAttack.cs:1122-1134 (PK, hàm MagicAttack_Player) và :3699-3703 (PvE, hàm ComputingAttack). DB xác nhận heSo2 (FLD_每点加成比率值2, job13/index10) = 1.4 — audit cũ ghi 1.3 là sai, và bản chất tra cứu là ĐỘNG (qua hàm 得到气功加成值) chứ không hard-code như audit cũ mô tả.",
    },
    {
      index: 11,
      id: 460,
      ten: "Vạn độc bất xâm",
      loai: "goc",
      heSo1: 1.5,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Cổng proc thật: RNG.Next(1,130) <= field (KHÔNG PHẢI RNG.Next(1,110) như audit cũ ghi), chỉ tìm thấy DUY NHẤT 1 vị trí áp dụng. Khi trúng: num38 ×= 0.8 và num45 ×= 0.8 — dựa theo ngữ cảnh hàm bao quanh (num45 = phòng ngự võ công của ĐỐI PHƯƠNG × hệ số giảm; num38 tăng lên khi đối phương phản đòn 'Chuyển Công Vi Thủ' của nghề khác), cách diễn giải hợp lý nhất là field làm GIẢM 20% phần phòng ngự/hấp thụ của ĐỐI PHƯƠNG trong đòn đánh này (kiểu phá giáp/xuyên giáp có lợi cho Thần Nữ tấn công) — KHÔNG PHẢI 'tự kháng/miễn nhiễm 1 hiệu ứng của địch' như audit cũ mô tả (hiệu ứng hiển thị 1023 cũng hiện lên đối phương value2, không phải bản thân, củng cố cách hiểu này). Độ tin cậy hướng diễn giải: TRUNG BÌNH — chưa trace toàn bộ hàm bao quanh (rất dài) để chắc chắn tuyệt đối ý nghĩa num38/num45. Ở trần 60 điểm: field=90 so với roll tối đa 129 → xác suất trúng ~70%, không có nguy cơ luôn-trúng.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Field ThanNu_VanDocBatXam. Gán PlayersBes.cs:10067. Reset PlayersBes.cs:6998. Tiêu thụ DUY NHẤT tìm thấy: A8_Players_03MagicAttack.cs:549-554. KHÔNG tìm thấy Math.Min(...,110.0) hay clamp tường minh nào quanh field này trong lần rà soát — khác claim 'đã vá bằng Math.Min' của audit cũ; RNG range hiện tại (1,130) tự nó đã đủ rộng để không tràn ở trần điểm hiện hành. Đổi nhãn từ DA_SUA (audit cũ) sang BINH_THUONG vì không tìm được bằng chứng cụ thể của 1 lần 'vá' — chỉ xác nhận được trạng thái HIỆN TẠI hoạt động hợp lý.",
    },
    {
      index: null,
      id: 582,
      ten: "Khí công bí cấp (Thăng Thiên 6 thức - Thần Nữ)",
      loai: "thang_thien",
      heSo1: 0.6,
      heSo2: null,
      batBuocThangThien: 11,
      moTa:
        "ĐÍNH CHÍNH LỚN: field HOÀN TOÀN KHÔNG CHẾT. Tên field thật là THANNU_ChongLaiThanPhap (CÓ tiền tố THANNU_, khác claim cũ 'không có tiền tố'). Đây là cơ chế KHÁNG PHÒNG THỦ quan trọng của Thần Nữ: tại tối thiểu 14 vị trí rải khắp Players.cs / A8_Players_02PhysicalAttack.cs / A8_Players_03MagicAttack.cs, mỗi khi Thần Nữ (người BỊ NHẮM) sắp lãnh 1 hiệu ứng khống chế cưỡng bức từ khí công Thăng Thiên 4/5 thức của NGHỀ KHÁC (ThangThien_5_TriTan, ThangThien_4_LietNhatViemViem, ThangThien_4_DocXaXuatDong, ThangThien_4_AiHongBienDa...) — hoặc thậm chí từ chính họ chiêu Hắc Hoa Tập Trung (id458) của 1 Thần Nữ khác (case 6002101/6002102) — code roll RNG.Next(1,100) <= THANNU_ChongLaiThanPhap TRƯỚC TIÊN; nếu trúng thì hiệu ứng khống chế đó bị VÔ HIỆU HOÀN TOÀN (hiệu ứng hiển thị 582), bỏ qua toàn bộ xử lý phía sau. Một trong những khí công phòng thủ quan trọng và có tác dụng rộng nhất của Thần Nữ — trái ngược hoàn toàn kết luận CHET_HOAN_TOAN của audit cũ. Ở trần 60 điểm: field=36 → 36% cơ hội kháng mỗi lần bị nhắm.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Field THANNU_ChongLaiThanPhap (X_Khi_Cong_Thuoc_Tinh.cs:617/413). Gán PlayersBes.cs:10479 (switch value.KhiCongID case 582, vòng lặp Thăng Thiên). Reset PlayersBes.cs:6801. Tiêu thụ (liệt kê không đầy đủ, tối thiểu 14 điểm): Players.cs:40056,40121,40166; A8_Players_02PhysicalAttack.cs:1871; A8_Players_03MagicAttack.cs:1158,2286,2324,2509,2550,2642,2684,2722,2775,2814. DB (bảng 升天气功, 气功ID=582) xác nhận heSo1=0.6, khác xa 0.1 audit cũ ghi.",
    },
    {
      index: null,
      id: 610,
      ten: "Khí công bí tịch (Thăng Thiên 1 thức - Phẫn nộ điều tiết)",
      loai: "thang_thien",
      heSo1: 0.3,
      heSo2: null,
      batBuocThangThien: 6,
      moTa:
        "Xác nhận cơ chế: chỉ 1 vị trí roll duy nhất tìm thấy (trong khối switch(Player_Job) case 13 dùng chung với các proc khác của Thần Nữ) — field > 0 và field > RNG.Next(1,100) thì cưỡng chế kết thúc sớm trạng thái Nộ Khí của đối phương (xoá SP nếu chưa Nộ Khí, hoặc gọi 清除怒气() nếu đang Nộ Khí). CHỈ 1 lần roll — xác nhận claim 'đã sửa lỗi roll trùng 2 lần' của audit cũ vẫn đúng ở code hiện tại. Chưa xác minh độc lập 100% việc khối này CHỈ áp dụng cho chiêu PK (không PvE) do khối bao quanh khá lớn, nhưng không tìm thấy vị trí thứ 2 nào khác dùng field này.",
      trangThai: "DA_SUA",
      ghiChu:
        "Field ThanNu_PhanNoDieuTiet. Gán PlayersBes.cs:10359 (case 610). Reset PlayersBes.cs:6999. Tiêu thụ DUY NHẤT A8_Players_03MagicAttack.cs:1140-1152. DB (bảng 升天气功, 气功ID=610) xác nhận heSo1=0.3, khớp audit cũ.",
    },
    {
      index: null,
      id: 611,
      ten: "Khí công bí tịch (Thăng Thiên 2 thức - Cổ độc giải trừ)",
      loai: "thang_thien",
      heSo1: 0.4,
      heSo2: null,
      batBuocThangThien: 7,
      moTa:
        "ĐÍNH CHÍNH TOÀN BỘ mô tả cũ: field KHÔNG PHẢI 'dispel toàn bộ buff đối phương trong danh sách ~22 ID cấu hình Gsconfig'. Grep 'Gsconfig' toàn bộ mã nguồn RxjhServer cho 0 kết quả — cơ chế đó không tồn tại trong code hiện tại. Thực tế field chỉ là 1 proc DAME đơn giản dùng chung khối switch(Player_Job) case 13 với các proc khác của Thần Nữ: field >= RNG.Next(1,100) thì dame ×= 1.1 (PvE hoặc PK) — tức +10% sát thương chiêu khi trúng, áp dụng cho MỌI đòn chiêu của Thần Nữ (không giới hạn 'mỗi lần cast họ chiêu Hắc Hoa Tập Trung' như audit cũ mô tả, và chỉ 2 vị trí, không phải 12). Ở trần 60 điểm: field=24 → 24% cơ hội +10% dame mỗi đòn chiêu.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Field ThanNu_CoDocGiaiTru. Gán PlayersBes.cs:10362 (case 611). Reset PlayersBes.cs:7000. Tiêu thụ CHỈ 2 vị trí: A8_Players_03MagicAttack.cs:1135 (PK, hàm MagicAttack_Player), :3704 (PvE, hàm ComputingAttack) — không tìm thấy 12 điểm gọi như audit cũ mô tả, không tìm thấy hàm dispel buff tương ứng. Hiệu ứng ×1.1 giống nhau cả 2 phía, không có bất đối xứng PvE/PK ở khí công này. DB (bảng 升天气功, 气功ID=611) xác nhận heSo1=0.4, khác 0.1 audit cũ. Nhãn trạng thái không đổi (BINH_THUONG) nhưng bản chất cơ chế đã viết lại HOÀN TOÀN khác audit cũ.",
    },
    {
      index: null,
      id: 612,
      ten: "Khí công bí tịch (Thăng Thiên 3 thức - Thần lực bảo hộ)",
      loai: "thang_thien",
      heSo1: 15.0,
      heSo2: null,
      batBuocThangThien: 8,
      moTa:
        "LỖI THẬT MỚI PHÁT HIỆN, chưa từng được audit cũ ghi nhận. Field 'ThanNu_ThanLucBaoHo' mà audit cũ mô tả KHÔNG TỒN TẠI trong code hiện tại — case 612 gán TRỰC TIẾP vào field dùng chung: `NhanVat_KhiCong_ThemVao_LucPhongNguVoCong = (int)(num11×num12)` (phép gán '=', KHÔNG PHẢI '+='). Đây CHÍNH LÀ field mà khí công gốc idx5 (id193, Khí Trầm Đan Điền) cũng cộng vào bằng '+=' ở vòng lặp Gốc chạy TRƯỚC. Vì vòng lặp Thăng Thiên chạy SAU, nếu người chơi đầu tư CẢ 2 khí công (id193 và id612), phần ULPT vừa được id193 cộng sẽ BỊ GHI ĐÈ MẤT hoàn toàn (không cộng dồn, chỉ còn giá trị của id612). Đây KHÔNG PHẢI cơ chế 'piggyback +60 giây theo chiêu khác' như audit cũ mô tả — không tìm thấy ràng buộc thời gian hay điều kiện proc nào; hiệu ứng có ngay và thường trực, y hệt 1 khí công gốc bình thường. Với heSo1 DB thật=15.0 (rất lớn), ở trần 60 điểm: field=900 ULPT cộng thêm — con số khổng lồ áp đảo phần đóng góp của id193 (chỉ vài trăm tuỳ Phòng Ngự cơ bản), nên bug ghi đè ít khi gây thiệt hại lớn trong THỰC TẾ (612 luôn thắng), nhưng vẫn là lỗi logic cần vá ('=' → '+=') để không mất tác dụng id193 khi 612 chưa đầu tư đủ hoặc nếu World.限制气功点数 bị chỉnh nhỏ lại.",
      trangThai: "CON_LOI_CHUA_SUA",
      ghiChu:
        "KHÔNG tìm thấy field 'ThanNu_ThanLucBaoHo' ở bất kỳ đâu trong RxjhServer (đã grep toàn bộ, 0 kết quả) — tên field audit cũ ghi có thể đã lỗi thời hoặc chưa từng đúng. Gán PlayersBes.cs:10365 (case 612). Đọc lại tại PlayersBes.cs:2228 (getter tổng ULPT); tương tác chéo với PlayersBes.cs:10077 (id193 cộng dồn '+='). DB (bảng 升天气功, 气功ID=612) xác nhận heSo1=15.0 — sai khác cực lớn so với 0.1 audit cũ, cần Admin xác nhận đây là giá trị chủ đích hay nhập nhầm.",
    },
    {
      index: null,
      id: 613,
      ten: "Khí công bí tịch (Thăng Thiên 4 thức - Mãn nguyệt cuồng phong)",
      loai: "thang_thien",
      heSo1: 0.5,
      heSo2: null,
      batBuocThangThien: 9,
      moTa:
        "Xác nhận cơ chế cốt lõi nhưng nhiều số liệu SAI trong audit cũ. field > RNG.Next(1,100) và đang trong tổ đội (TeamID != 0) thì cấp Nộ Khí (NoKhi=true) cho thành viên tổ đội trong phạm vi World.群体辅助组队范围 (hằng số CẤU HÌNH ĐƯỢC qua ini, mặc định = 400, KHÔNG PHẢI 300 như audit cũ ghi cứng), thời hạn 5000ms = 5 GIÂY (không phải 3 giây). NGOÀI Nộ Khí, còn cộng thêm +25% tấn công và +25% phòng ngự (ThemVaoTiLePhanTram_ManYue_CongKich/PhongNgu=0.25) cho mỗi thành viên nhận hiệu ứng — chi tiết audit cũ hoàn toàn không đề cập. Field dùng chung với các case khác (nghề khác) như audit cũ ghi đúng.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Field ThangThien_4_ManNguyetCuongPhong (dùng chung). Gán PlayersBes.cs:10368 (case 613; cũng gán ở case 373 dòng 10121 và case 393 dòng 10185 cho nghề khác, cùng 1 field). Tiêu thụ Players.cs:40139-40162. DB (bảng 升天气功, 气功ID=613) xác nhận heSo1=0.5, khác 0.1 audit cũ.",
    },
    {
      index: null,
      id: 614,
      ten: "Khí công bí tịch (Thăng Thiên 4 thức - Vọng mai thiêm hoa)",
      loai: "thang_thien",
      heSo1: 3.5,
      heSo2: null,
      batBuocThangThien: 9,
      moTa:
        "Xác nhận cơ chế proc-gate cho hiệu ứng tự buff/team buff nhưng thời hạn và mối liên kết với id612 đã LỖI THỜI. Nhiều nhánh tiêu thụ tìm thấy, gồm bản DÀNH RIÊNG BẢN THÂN và bản LAN TOẢ TOÀN ĐỘI (phạm vi 500) — cấp trạng thái +1000 Max HP TẠM THỜI, thời hạn 5000ms = 5 GIÂY (không phải 3 giây như audit cũ ghi), có xoá timer trạng thái cũ trước khi cấp lại. KHÔNG tìm thấy bất kỳ liên kết nào với khí công id612 (Thần Lực Bảo Hộ) trong code đã đọc — và bản thân id612 hiện đã xác nhận KHÔNG còn là cơ chế 'buff tạm 60 giây' nữa (xem entry id612), nên claim 'piggyback +60s ULPT nếu đã đầu 612' của audit cũ chắc chắn đã lỗi thời/không còn đúng với code hiện tại.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Field ThangThien_4_VongMaiThiemHoa (dùng chung). Gán PlayersBes.cs:10371 (case 614; cũng gán case 374 dòng 10124, case 394 dòng 10188 cho nghề khác). Tiêu thụ Players.cs:40004,40357-40380; A8_Players_03MagicAttack.cs:2851,2894. DB (bảng 升天气功, 气功ID=614) xác nhận heSo1=3.5, khác rất xa 0.1 audit cũ.",
    },
    {
      index: null,
      id: 616,
      ten: "Khí công bí tịch (Thăng Thiên 5 thức - Thi độc bạo phát)",
      loai: "thang_thien",
      heSo1: 0.012,
      heSo2: null,
      batBuocThangThien: 19,
      moTa:
        "Xác nhận công thức cốt lõi của audit cũ về cơ bản đúng, bổ sung 1 cơ chế song song chưa từng được ghi nhận. Bản QUÁI (PvE, khi trạng thái BOM 44 do idx9/id458 gắn lên NPC hết hạn sau 8 giây): num=(int)(阎王爆累计伤害×(1+field))/World.阎王爆伤害降低百分比 — sát thương tích luỹ nhân (1+field) rồi CHIA cho % giảm sát thương cấu hình server (phép chia này audit cũ bỏ sót). Bán kính nổ = World.阎王爆爆炸距离 + (int)HacHoaManKhai (idx6, thường=0), tối đa 5 mục tiêu. PHÁT HIỆN MỚI: khi trạng thái 44 hết hạn trên 1 NGƯỜI CHƠI (không phải quái), thay vào đó gọi 触发人物阎王爆() — công thức HOÀN TOÀN KHÁC và nhỏ hơn nhiều: num=(int)(1+field-PhanCong_ThanNu_KhiCong_ThiDocBaoPhat), trừ trực tiếp vào HP mục tiêu (không dựa trên sát thương tích luỹ) — 2 cơ chế song song cho 2 loại mục tiêu, audit cũ chỉ mô tả bản QUÁI.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Field ThanNu_ThiDocBaoPhat (riêng, không dùng chung — xác nhận đúng audit cũ). Gán PlayersBes.cs:10389 (case 616). Tiêu thụ: NpcClass.cs:632-659 (bản Quái/PvE) và Players.cs:66385-66404 (bản Người chơi/PK). Trạng thái 44 thời hạn 8000ms xác nhận qua X_Than_Nu_Di_Thuong_Trang_Thai_Loai.cs:152-154 (case 44 → gọi Play.触发人物阎王爆()); điều kiện gắn trạng thái 44 lên quái: A8_Players_02PhysicalAttack.cs~3709-3722 (chiêu 6002206, cờ NPC.怪物阎王爆, tối đa 4 mục tiêu). DB (bảng 升天气功, 气功ID=616) xác nhận heSo1=0.012, nhỏ hơn ~8 lần so với 0.1 audit cũ.",
    },
  ],
};
