import type { NgheData } from "./types";

export const JOB_01_DAO: NgheData = {
  job: 1,
  tenNghe: "Đao",
  khiCong: [
    {
      index: 0,
      id: 10,
      ten: "Lục phách hoàn sơn",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 0.01,
      batBuocThangThien: null,
      moTa:
        "Cộng thẳng vào Công Kích GỐC, không phải một đòn/chiêu proc riêng. Công thức: Công Kích Thấp Nhất × điểm đầu tư × 1.0 / 100 / 2 (tối thiểu 1). Giá trị này được cộng vào công thức công kích cơ bản nên có tác dụng ĐỀU cho mọi đòn đánh — PvE tay, PvE chiêu, PK tay, PK chiêu — không phân biệt, không roll ngẫu nhiên. Hệ số 2 (0.01) tồn tại trong DB nhưng KHÔNG được code đọc tới ở nhánh Đao.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "PlayersBes.cs ~7839-7847 (gán); PlayersBes.cs ~2074 FLD_NhanVatCoBan_CongKich (tiêu thụ, dùng ở mọi công thức PvE/PK).",
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
        "Cộng thẳng vào Chính Xác (Trúng Địch) GỐC. Công thức: FLD_TrungDich × (0.1 + điểm×0.01) — thêm tối đa 90% giá trị Trúng Địch gốc khi đầu đủ 80 điểm. Cộng vào chỉ số nền nên áp dụng cho mọi đòn đánh, không phải proc ngẫu nhiên.",
      trangThai: "BINH_THUONG",
      ghiChu: "PlayersBes.cs ~7849-7850 (gán); ~2104 (tiêu thụ).",
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
        "Tỉ lệ proc đòn tay: DAO_LienHoanPhiVu = 10 + điểm×1.0 (tối đa 90 ở 80 điểm). CHỈ áp dụng cho ĐÒN TAY (cả PvE lẫn PK), KHÔNG áp dụng cho chiêu. PK tay roll RNG.Next(1,100) <= giá trị; nếu trúng, đòn tay gây sát thương gấp đôi. PvE tay TRƯỚC ĐÂY roll RNG.Next(1,80) trong khi giá trị tối đa là 90, khiến từ 70 điểm trở lên LUÔN đúng 100% — ĐÃ SỬA thành RNG.Next(1,100) khớp PK tay.",
      trangThai: "DA_SUA",
      ghiChu:
        "Players.cs ~40088-40100 (PK tay, vốn đã đúng), ~40760-40769 (PvE tay, ĐÃ SỬA 02/09). Không xuất hiện ở chiêu. Log VET_DAO_LHPV.",
    },
    {
      index: 3,
      id: 14,
      ten: "Cuồng phong vạn phá",
      loai: "goc",
      heSo1: 3000.0,
      heSo2: 0.05,
      batBuocThangThien: null,
      moTa:
        "Không phải proc sát thương mà kéo dài THỜI LƯỢNG buff Nộ Khí Xung Thiên (rage tự kích hoạt khi thanh Nộ đầy). Công thức: CuongPhong_VanPha = điểm × 3000.0 (mili-giây). Khi kích hoạt, thời lượng buff = 10000 + CuongPhong_VanPha: 10 giây cơ bản, cộng thêm 3 giây/điểm, tối đa +240 giây (4 phút) ở 80 điểm. Không roll, áp dụng bất kể tay/chiêu, PvE/PK.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Players.cs ~69569-69573 (áp thời lượng buff); PlayersBes.cs ~7855-7857 (gán). Mức tăng khá lớn, ghi nhận để tham khảo.",
    },
    {
      index: 4,
      id: 19,
      ten: "Kim cang bất quái",
      loai: "goc",
      heSo1: 0.03,
      heSo2: 2.0,
      batBuocThangThien: null,
      moTa:
        "Hai hiệu ứng passive song song: (1) cộng thêm % Phòng Ngự gốc = FLD_PhongNgu × điểm × 0.03; (2) cộng thẳng HP tối đa = điểm × 2.0. Áp dụng đều cho mọi tình huống chiến đấu vì là chỉ số nền, không phải proc theo đòn.",
      trangThai: "BINH_THUONG",
      ghiChu: "PlayersBes.cs ~7858-7861 (gán); ~2087, ~2124 (tiêu thụ).",
    },
    {
      index: 5,
      id: 16,
      ten: "Bá khí phá giáp",
      loai: "goc",
      heSo1: 0.88,
      heSo2: 1.2,
      batBuocThangThien: null,
      moTa:
        "Tỉ lệ proc: PhaGiap_TiLe = 5 + điểm×0.88 (tối đa 75.4% ở 80 điểm, roll RNG.Next(1,110)). Xuất hiện ở cả 4 đường. PK tay và PK chiêu: TRƯỚC ĐÂY nhân hệ số 1.2 THẲNG vào phòng ngự đối phương đã trừ sẵn — làm TĂNG giáp đối phương 20% mỗi lần proc (~75% cơ hội), tự làm yếu chính mình. ĐÃ SỬA thành nhân (2.0 − hệ số) = 0.8, tức giảm giáp đối phương 20% — đúng nghĩa 'phá giáp'. PvE tay/chiêu vốn nhân THẲNG hệ số vào sát thương của chính mình nên không có lỗi, giữ nguyên từ đầu.",
      trangThai: "DA_SUA",
      ghiChu:
        "Players.cs ~39628 (PK tay, ĐÃ SỬA), ~44559 (PK chiêu, ĐÃ SỬA), ~39209 (PvE tay, đúng từ đầu), ~41203 (PvE chiêu, đúng từ đầu). Log VET_DAO_BKPG.",
    },
    {
      index: 6,
      id: 181,
      ten: "Khí trầm đan điền (Đao)",
      loai: "goc",
      heSo1: 0.5,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Passive không roll, dùng chung cơ chế với nhiều nghề khác qua field DonKhi_DanDien = điểm × 0.5. Sau khi UpdateKhiCong gán xong khí công, giá trị quy đổi (FLD_PhongNgu × DonKhi_DanDien / 100) được cộng vào CẢ HP tối đa LẪN Lực Phòng Ngự Võ Công (ULPT). Áp dụng đều cho mọi tình huống vì là chỉ số nền.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "PlayersBes.cs ~7865-7867 (gán), ~8537-8542 (tiêu thụ, cùng file — không phải 'chết' như tưởng ban đầu).",
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
        "Tỉ lệ proc = ChanVu_TuyetKich = điểm × 1.0 (tối đa 80% ở 80 điểm). CHỈ xuất hiện ở CHIÊU (PvE + PK), KHÔNG xuất hiện ở đòn tay — đầu điểm vào khí công này vô dụng khi đánh tay. Khi trúng, sát thương chiêu nhân thêm hệ số 1.3 (+30%).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Players.cs ~41208 (PvE chiêu), ~44873 (PK chiêu). RÀ LẠI 03/09: skill buff đồng đội VoCong_ID 401303 (case job1, Players.cs ~42801-42806) cộng +10.0 vào field này khi cast — trước ghi là 'không tự giảm', nhưng đã đọc kỹ X_Them_Vao_Trang_Thai_Loai.cs case401303 (~282-291): có decrement -10.0 đối xứng khi buff hết hạn TỰ NHIÊN, VÀ khi tái cast trước hạn thì Players.cs ~42791-42794 chủ động gọi ThoiGianKetThucSuKien() để expire-sớm (trừ đúng -10.0) TRƯỚC KHI cộng lại +10.0 mới — không cộng dồn chồng. Không phải bug, huỷ ghi chú rủi ro cũ.",
    },
    {
      index: 8,
      id: 15,
      ten: "Tữ lưỡng thiên kim",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 0.3,
      batBuocThangThien: null,
      moTa:
        "Không phải proc sát thương của Đao mà là tỉ lệ PHẢN SÁT THƯƠNG khi bị đánh trúng. QuaiVat_PhanSatThuong_TiLe = 10 + điểm×1.0 (phản khi bị QUÁI đánh, chỉ tính khi đòn quái gây > 50 sát thương) và NguoiChoi_PhanSatThuong_Tile = 3 + điểm×0.3 (phản khi bị NGƯỜI CHƠI đánh, cả tay lẫn chiêu).",
      trangThai: "DA_SUA",
      ghiChu:
        "PlayersBes.cs ~7871-7874 (gán); Players.cs ~40271-40299, ~48776-48809 (PK); NpcClass.cs ~1745-1814 (PvE). ĐÃ SỬA 03/09 trên K2: bật đủ 4 khoá còn lại của bộ vá PhanSatThuong.cs (bản .244, đã có sẵn từ 23/08 nhưng để OFF chờ Admin) — PhanSatThuong_VaLoiQuai=1 (quái chỉ trừ máu 1 lần thay vì 2-3), PhanDao_DaoVanAn=100 (Đao chịu đủ sát thương phản đòn tay thay vì ăn 0), PhanDao_GocDonTayChiaDoi=1 (số phản đòn tay dùng đúng dame thật thay vì gấp đôi chưa chia), PhanDao_PhanSauNe=1 (roll né trước, đòn trượt thì không phản). PhanDao_MotRollMoiDon=1 đã bật sẵn từ trước. Đọc config sống, không cần khởi động lại K2. Dùng chung với khí công Thăng Thiên 311 (Cùng Đồ Mạt Lộ). Lệnh !phandao cho GM tự tra số thật để verify.",
    },
    {
      index: 9,
      id: 18,
      ten: "Ám ảnh sát kích",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 1.2,
      batBuocThangThien: null,
      moTa:
        "Tỉ lệ proc = 5 + điểm×1.0 (tối đa 85% ở 80 điểm). Xuất hiện ở PvE tay, PvE chiêu, PK chiêu. KHÔNG xuất hiện ở PK tay. Khi trúng, nhân sát thương +20%.",
      trangThai: "BINH_THUONG",
      ghiChu: "Players.cs ~39214 (PvE tay), ~41213 (PvE chiêu), ~44878 (PK chiêu). Không có ở PK tay.",
    },
    {
      index: 10,
      id: 312,
      ten: "Mãnh long sát trận",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 0.3,
      batBuocThangThien: null,
      moTa:
        "Tỉ lệ proc = điểm × 1.0. CHỈ xuất hiện ở CHIÊU (PvE + PK), KHÔNG xuất hiện ở đòn tay. Khi trúng, sát thương nhân thêm (1.0 + hệ số 2 + khí công Thăng Thiên 'Hỏa Long Chi Hỏa' id13) — 2 nguồn cộng dồn vào cùng 1 lần proc.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Players.cs ~41218-41227 (PvE chiêu), ~44883-44892 (PK chiêu). Cộng dồn ngưỡng proc với khí công Thăng Thiên 679 (Long Hồn Phụ Thể), cộng dồn sát thương với id13.",
    },
    {
      index: 11,
      id: 110,
      ten: "Thiết huyết phùng linh",
      loai: "goc",
      heSo1: 0.002,
      heSo2: 1.0,
      batBuocThangThien: null,
      moTa:
        "Không phải proc ngẫu nhiên — hệ số nhân cố định khi >0: LuuQuang_LoanVu = điểm × 0.002 (tối đa +16% ở 80 điểm). CHỈ có tác dụng trong PvE: nhân thẳng vào sát thương chiêu đánh quái, và tăng số mục tiêu + sát thương một số chiêu diện rộng. KHÔNG xuất hiện ở bất kỳ nhánh PK nào.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "PlayersBes.cs ~7881-7882 (gán); Players.cs ~41199-41201, ~46809-46811, ~46894 (tiêu thụ, đều nhánh đánh NPC).",
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
        "Không tự roll, chỉ CỘNG DỒN vào sát thương khi khí công gốc Mãnh Long Sát Trận (idx10) đã proc: num7 += DAO_ThangThien_3_KhiCong_HoaLong_ChiHoa trước khi nhân vào sát thương. KHÔNG có tác dụng ở đòn tay, và KHÔNG có tác dụng nếu Mãnh Long Sát Trận chưa proc.",
      trangThai: "BINH_THUONG",
      ghiChu: "PlayersBes.cs ~8567-8568 (gán); Players.cs ~41221-41223 (PvE chiêu), ~44887-44889 (PK chiêu).",
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
        "Cơ chế 2 pha, CHỈ ở CHIÊU. Pha 1 — nếu chưa có buff riêng (700310), roll RNG.Next(0,110) < giá trị; trúng thì tự cộng +10% Phòng Ngự trong 10 giây, không gây thêm sát thương lần đó. Pha 2 — nếu buff đang có hiệu lực, mọi đòn chiêu tiếp theo tự động nhân sát thương ×1.3, không cần roll lại.",
      trangThai: "BINH_THUONG",
      ghiChu: "PlayersBes.cs ~8656-8657 (gán); Players.cs ~41228-41237 (PvE chiêu), ~44893-44903 (PK chiêu).",
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
        "Không phải khí công tấn công độc lập — là NHÁNH THỨ HAI của hệ thống phản sát thương dùng chung với khí công gốc Tữ Lưỡng Thiên Kim (idx8). Trong PK, roll nhánh này SAU khi nhánh thường đã trượt, mẫu số 110; mức phản khi trúng là 200% sát thương (gấp đôi nhánh thường).",
      trangThai: "DA_SUA",
      ghiChu: "PlayersBes.cs ~8659-8660 (gán); dùng chung PhanSatThuong.cs với idx8 — đã bật đủ 4 khoá vá còn lại trên K2 03/09, xem chi tiết ở idx8.",
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
        "Buff đồng đội diện rộng (yêu cầu Level>=140 và Thăng Thiên>=9), CHỈ khi hàm dùng chung được gọi KHÔNG kèm mục tiêu — PvE tay/chiêu và PK chiêu. Khi trúng, toàn bộ đồng đội trong phạm vi 300 được +150 Công Kích và +150 Phòng Ngự trong 3 giây. KHÔNG xuất hiện ở PK đòn tay (rẽ sang nhánh id314 và return sớm).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "PlayersBes.cs ~8662-8663 (field dùng chung với nhiều mã khác); Players.cs ~46333-46386, gọi từ ~39141 và nhiều chỗ trong MagicAttack.",
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
        "Debuff câm-proc: CHỈ được xét khi hàm dùng chung AscensionFourQigongTrigger được gọi KÈM mục tiêu thật — tức CHỈ trong PK, cả đòn tay lẫn chiêu (PvE gọi với Playe=null nên vô tác dụng, giống hệt id313 cạnh nó). Khi trúng, gắn trạng thái 'Độc Xà Xuất Động' (id 1008001170, 3 giây) lên ĐỐI PHƯƠNG đang bị Đao tấn công — đúng ý đồ, cùng hàm cùng tham số Playe với id313 (đã xác nhận debuff -15% phòng ngự đối phương). Trạng thái này SUY YẾU chứ không phải tăng cường người mang: tại ~10 vị trí proc đặc trưng của Kiếm (Nộ Hải Cuồng Lan)/Cung (Tâm Thần Ngưng Tụ, Trí Mệnh Tuyệt Sát, Vô Minh Ám Thị)/Đàm Hoa Liên (Nộ Hải Cuồng Lan)/Ninja (Tâm Thần Ngưng Tụ, Liên Hoàn Phi Vũ)/Đao-HanBaoQuan (Bá Khí Phá Giáp), roll bị NHÂN ×1000 TRƯỚC khi so sánh '<' hoặc '<=' với một khí công nhỏ (tối đa ~100-130) — khiến điều kiện gần như LUÔN SAI, tức PROC BỊ KHOÁ chứ không phải tự động trúng. Vậy Đao gắn được khí công này lên đối thủ = tạm khoá một loạt proc đặc trưng của đối thủ trong 3 giây — đúng bản chất một khí công tấn công/khống chế.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "PlayersBes.cs case314 (gán). Players.cs: hàm dùng chung AscensionFourQigongTrigger (áp trạng thái lên Playe/đối phương, gọi value3 ở PK-tay ~40652 và PK-chiêu ~45928, gọi null ở PvE nên no-op); các điểm đọc trạng thái (roll×1000 trước so sánh, suy yếu proc của người MANG trạng thái) rải khắp PhysicalAttack/MagicAttack — vd ~39624/39656/39668/39772/39794/39910/39942/39991/40097/40670/44617/44657/44703/45698/46012/46328. RÀ LẠI 03/09: bản ghi CON_LOI_CHUA_SUA trước đó đọc nhầm ý nghĩa 'roll×1000' (tưởng là tăng cường, thực ra là khoá proc) — đã đọc kỹ toàn bộ điểm tiêu thụ, xác nhận thiết kế đúng, không phải bug.",
    },
    {
      index: null,
      id: 570,
      ten: "Khí công bí cấp (Thăng Thiên 6 thức - Đao)",
      loai: "thang_thien",
      heSo1: 0.1,
      heSo2: null,
      batBuocThangThien: 11,
      moTa:
        "Passive thuần, không roll, RIÊNG cho Đao. Công thức cộng THẲNG vào HP tối đa: NhanVat_KhiCong_ThemVao_HP += FLD_PhongNgu × (int)(điểm × 0.1). Toàn bộ nằm gọn trong PlayersBes.cs, áp dụng đều cho mọi tình huống.",
      trangThai: "BINH_THUONG",
      ghiChu: "PlayersBes.cs ~8868-8870 (gán + tiêu thụ, cùng một chỗ).",
    },
    {
      index: null,
      id: 679,
      ten: "[Đao] Khí công bí cấp thư (Thăng Thiên 5 thức - Long Hồn Phụ Thể)",
      loai: "thang_thien",
      heSo1: 0.2,
      heSo2: null,
      batBuocThangThien: 10,
      moTa:
        "Không tự roll — chỉ CỘNG DỒN vào NGƯỠNG PROC (không phải sát thương) của khí công gốc Mãnh Long Sát Trận (idx10). Xuất hiện đúng ở 2 vị trí trùng với Mãnh Long Sát Trận (PvE chiêu + PK chiêu), KHÔNG có ở đòn tay, và không có tác dụng độc lập nếu chưa đầu tư Mãnh Long Sát Trận.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "PlayersBes.cs ~8760-8762 (gán); Players.cs ~41218 (PvE chiêu), ~44883 (PK chiêu). Cộng dồn ngưỡng proc với idx10, còn id13 cộng dồn sát thương khi đã proc.",
    },
  ],
};
