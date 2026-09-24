import type { NgheData } from "../khicong-data/types";

// Đối chiếu Ver24 THẬT — đọc lại code SRCGameServerV24B hiện tại (PlayersBes.cs UpdateKhiCong(),
// Players.cs + A8_Players_02PhysicalAttack.cs/A8_Players_03MagicAttack.cs sau khi code đã bị tách
// thành các file partial-class, không dùng lại audit cũ 02/09 mà không kiểm chứng), biên soạn 15/09/2026.
//
// GHI CHÚ CHUNG QUAN TRỌNG:
// - Player_Job==5, mỗi khí công GỐC ứng với "case <index>" trong khối switch(Player_Job){case 5: switch(i){...}}
//   của UpdateKhiCong() (PlayersBes.cs, quanh dòng 9648-9687), KHÔNG PHẢI switch trực tiếp theo KhiCongID/PID.
//   num2 = điểm đầu tư đã cộng dồn (trang bị/nhân vật/buff/dược phẩm) và giới hạn theo World.限制气功点数
//   (mặc định 60, có thể chỉnh qua GameServer.ini "限制气功点数"/"限制气功百分比" — audit cũ giả định "~70-80 điểm"
//   là số đã chỉnh trên server thật, KHÔNG PHẢI default code).
//   num3/num4 = 得到气功加成值(Player_Job, i, 1|2) — đọc trực tiếp FLD_每点加成比率值1/2 của bảng
//   TBL_XWWL_SKILL (PublicDb) theo (FLD_JOB, FLD_INDEX) = chính là heSo1/heSo2 bên dưới.
// - Khí công THĂNG THIÊN dùng PID riêng, switch(value.KhiCongID) trong cùng UpdateKhiCong() (khối
//   "DanhSach_ThangThienKhiCong", quanh dòng 10096 trở đi); num12 = 得到升天气功加成值(PID) đọc thẳng
//   cột FLD_每点加成比率值ị của bảng 升天气功 (PublicDb) theo 气功ID — đây là heSo1 của các dòng
//   loai:"thang_thien" bên dưới (bảng này không có cột thứ 2 nên heSo2 luôn null).
// - Đã spot-check trực tiếp DB (sqlcmd -d 24pub, bảng TBL_XWWL_SKILL và 升天气功) cho TOÀN BỘ khí công
//   job5 — phát hiện heSo1/heSo2 của audit 02/09 sai lệch khá nhiều so với DB THẬT hiện tại ở nhiều dòng
//   (xem ghiChu từng dòng). Đã cập nhật heSo1/heSo2 theo DB thật, KHÔNG giữ nguyên số cũ một cách mù quáng.
export const JOB_05_DAI_PHU_V24: NgheData = {
  job: 5,
  tenNghe: "Đại Phu",
  khiCong: [
    {
      index: 0,
      id: 50,
      ten: "Vận khí hành tâm",
      loai: "goc",
      heSo1: 0.04,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "XÁC NHẬN ĐÚNG như audit cũ. base.DAIPHU_VanKhiLieuTam = điểm×0.04 (case index0, job5). " +
        "Tiêu thụ trong 加魔()(AddMana): sl = sl × (1 + DAIPHU_VanKhiLieuTam), chỉ áp dụng khi Player_Job==5. " +
        "Tăng thẳng % lượng MP hồi mỗi lần hồi (đan dược/tự nhiên đều đi qua hàm này).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs dòng 9652 (reset 0.0 tại 6852). Tiêu thụ: PlayersBes.cs dòng 22510-22512 (加魔()). " +
        "DB TBL_XWWL_SKILL (24pub) FLD_JOB=5 FLD_INDEX=0: heSo1=0.04, heSo2=0.0 — khớp audit cũ.",
    },
    {
      index: 1,
      id: 51,
      ten: "Thái cực tâm pháp",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "XÁC NHẬN ĐÚNG như audit cũ. base.DAIPHU_ThaiCucTamPhap = điểm×1.0. Tiêu thụ trong 魔法使用()(hàm dùng MP " +
        "khi thi triển chiêu): num3 = DAIPHU_ThaiCucTamPhap×0.01; mp -= mp×num3. Không có Math.Min nào bọc num3 " +
        "trong code, nhưng vì trần điểm đầu tư (World.限制气功点数, mặc định 60) × heSo1(1.0) = tối đa 60 " +
        "→ giảm tối đa 60% chi phí MP, không thể vượt 100%. Vẫn là 'mẫu chuẩn không vượt trần' hợp lệ.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs dòng 9655. Tiêu thụ: Players.cs hàm 魔法使用(double mp), case 5 (job), dòng 40706-40718. " +
        "DB: heSo1=1.0, heSo2=0.0 — khớp audit cũ.",
    },
    {
      index: 2,
      id: 52,
      ten: "Thể huyết bội tăng",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "XÁC NHẬN ĐÚNG hướng như audit cũ, làm rõ thêm cơ chế: NhanVat_KhiCong_ThemVao_HP = (int)(điểm×1.0) — " +
        "đây là một lượng HP CỘNG THẲNG (không phải %), nhưng được cộng vào TRƯỚC khi cả cụm bị nhân với " +
        "(1 + tổng các % Max HP khác) trong công thức CharacterMax_HP, nên gián tiếp cũng hưởng lợi từ các " +
        "% HP khác trong hệ thống. Field này dùng chung nhiều job (không riêng Đại Phu).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs dòng 9658. Tiêu thụ: PlayersBes.cs dòng 2301 (getter CharacterMax_HP). " +
        "DB: heSo1=1.0, heSo2=0.0 — khớp audit cũ.",
    },
    {
      index: 3,
      id: 53,
      ten: "Tẩy tủy dịch cân",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "PHÁT HIỆN MỚI, KHÁC audit cũ: field NHẬN gán (NhanVat_KhiCong_ThemVao_MP = điểm×1.0) nhưng KHÔNG hề " +
        "được công thức CharacterMax_MP đọc tới — CharacterMax_MP (PlayersBes.cs dòng 2313) dùng một field " +
        "KHÁC tên là NhanVat_KhiCong_ThemVao_TiLePhanTram_MP (chỉ được job khác gán, ví dụ Thần Nữ case index4 " +
        "dòng 10046, hay case7/CamSu dòng 9848 — job5 KHÔNG đụng tới field này ở đâu cả). Đã grep toàn bộ " +
        "repo: nơi ĐỌC duy nhất của NhanVat_KhiCong_ThemVao_MP là UserIdList.cs dòng 123 — một hàm debug " +
        "dump chỉ số ra chuỗi (GM/log), KHÔNG ảnh hưởng gameplay. Vậy đầu tư điểm vào khí công này không có " +
        "bất kỳ tác dụng thực tế nào trong game hiện tại.",
      trangThai: "CHET_HOAN_TOAN",
      ghiChu:
        "KHÁC audit cũ (audit cũ ghi BINH_THUONG 'tương tự idx2' — SAI, đã kiểm chứng lại toàn bộ). " +
        "Gán: PlayersBes.cs dòng 9661 (reset 0 tại 6588/7190/9428). Đọc duy nhất: UserIdList.cs dòng 123 (debug). " +
        "CharacterMax_MP thật sự dùng NhanVat_KhiCong_ThemVao_TiLePhanTram_MP (PlayersBes.cs:2313), field khác hẳn. " +
        "DB: heSo1=1.0, heSo2=0.0 — số khớp audit cũ, chỉ có hành vi tiêu thụ là sai/chết.",
    },
    {
      index: 4,
      id: 54,
      ten: "Diệu thủ hồi xuân",
      loai: "goc",
      heSo1: 2.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "XÁC NHẬN ĐÚNG như audit cũ, bổ sung chi tiết: base.DAIPHU_DieuThuHoiXuan = 10.0 + điểm×2.0 (có nền " +
        "+10 cố định kể cả 0 điểm). Tiêu thụ trực tiếp trong công thức hồi máu 3 chiêu 501201/501202/501203: " +
        "heal = (110|140|160 + DieuThuHoiXuan) × (1 + DAIPHU_CuuThienChanKhi×10). Không phải xác suất, cộng " +
        "thẳng vào lượng máu hồi cơ bản, không có nguy cơ vượt trần.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs dòng 9664. Tiêu thụ: Players/A8_Players_03MagicAttack.cs, hàm MagicAttack_Buff, " +
        "dòng 1526-1568 (case 501201/501202/501203). DB: heSo1=2.0, heSo2=0.0 — khớp audit cũ.",
    },
    {
      index: 5,
      id: 55,
      ten: "Trường công kích lực",
      loai: "goc",
      heSo1: 0.02,
      heSo2: 0.01,
      batBuocThangThien: null,
      moTa:
        "KHÁC audit cũ cả về heSo LẪN cơ chế. base.DAIPHU_TruongCongKichLuc = điểm (KHÔNG nhân hệ số nào lúc " +
        "gán — chỉ là điểm đầu tư đã giới hạn trần). Hệ số thực sự được lấy TRỰC TIẾP lúc tiêu thụ qua " +
        "得到气功加成值(5,5,type), và PvE/PK dùng type KHÁC NHAU: " +
        "PK (MagicAttack_Player, đấu người) dùng type=2 (heSo2=0.01): dame×=1+TruongCongKichLuc×0.01. " +
        "PvE (MagicAttack_Npc, đấu quái) dùng type=1 (heSo1=0.02): dame×=1+TruongCongKichLuc×0.02 — " +
        "tức PvE được nhân hệ số GẤP ĐÔI PK cho cùng số điểm đầu tư. Đây không phải audit cũ mô tả " +
        "(audit cũ ghi 1 hệ số 0.01 dùng chung cả 2 phía).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "KHÁC audit cũ: heSo1 0.01→0.02, heSo2 0.0→0.01 (DB thật), và cơ chế PvE/PK tách hệ số. " +
        "Gán: PlayersBes.cs dòng 9667. Tiêu thụ PK: A8_Players_03MagicAttack.cs dòng 723 (hàm MagicAttack_Player). " +
        "Tiêu thụ PvE: A8_Players_03MagicAttack.cs dòng 3368 (hàm MagicAttack_Npc). " +
        "DB TBL_XWWL_SKILL FLD_JOB=5 FLD_INDEX=5: heSo1=0.02, heSo2=0.01.",
    },
    {
      index: 6,
      id: 185,
      ten: "Khí trầm đan điền",
      loai: "goc",
      heSo1: 0.005,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Cơ chế XÁC NHẬN ĐÚNG như audit cũ (slot dùng chung mọi nghề, base.DonKhi_DanDien = điểm×heSo1, quy " +
        "đổi % phòng ngự hiện có thành cả HP cộng thêm lẫn Lực Phòng Ngự Võ Công cộng thêm ngay trong " +
        "UpdateKhiCong()), NHƯNG heSo1 trong audit cũ (0.5) SAI LỆCH 100 LẦN so với DB thật (0.005) — với " +
        "heSo1=0.5 như audit cũ ghi, ở trần 60 điểm sẽ ra hệ số 30 (tức +3000% phòng ngự quy đổi, vô lý); " +
        "với heSo1=0.005 thật thì ở trần 60 điểm chỉ ra 0.3 (30% phòng ngự hiện có được quy đổi thêm), " +
        "hợp lý hơn nhiều về mặt cân bằng.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "KHÁC audit cũ: heSo1 0.5→0.005 (sai lệch 100 lần, DB thật xác nhận). Gán: PlayersBes.cs dòng 9670 " +
        "(job5 idx6, mẫu chung nhiều job khác cũng case tương tự idx6). Tiêu thụ chung: PlayersBes.cs dòng " +
        "10073-10078 (if DonKhi_DanDien>0 → NhanVat_KhiCong_ThemVao_HP += FLD_PhongNgu×DonKhi_DanDien/100; " +
        "NhanVat_KhiCong_ThemVao_LucPhongNguVoCong += cùng lượng). DB TBL_XWWL_SKILL FLD_INDEX=6: heSo1=0.005, heSo2=0.0.",
    },
    {
      index: 7,
      id: 57,
      ten: "Chân vũ tuyệt kích",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 1.45,
      batBuocThangThien: null,
      moTa:
        "Cơ chế XÁC NHẬN ĐÚNG như audit cũ (proc nhân sát thương: base.ChanVu_TuyetKich = điểm×1.0 vừa là % " +
        "xác suất proc vừa gate; trúng thì dame×=得到气功加成值(5,7,2)), nhưng heSo2 audit cũ ghi 1.3, DB thật " +
        "là 1.45. Ở PK còn có thêm cơ chế phản: nếu đối thủ cũng trúng roll khí công riêng " +
        "HanBaoQuan_ChanKhiHoanNguyen (job8) thì hệ số bị trung hoà về ×1.0 (không nhân); cơ chế phản này " +
        "chỉ tồn tại ở nhánh PK, không có ở PvE (quái không có khí công này).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "KHÁC audit cũ: heSo2 1.3→1.45 (DB thật). Gán: PlayersBes.cs dòng 9673. Tiêu thụ PK: " +
        "A8_Players_03MagicAttack.cs dòng 724-735. Tiêu thụ PvE: A8_Players_03MagicAttack.cs dòng 3369-3373. " +
        "DB FLD_INDEX=7: heSo1=1.0, heSo2=1.45.",
    },
    {
      index: 8,
      id: 56,
      ten: "Hấp tinh đại pháp",
      loai: "goc",
      heSo1: 15000.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "Cơ chế XÁC NHẬN ĐÚNG như audit cũ (kéo dài thời lượng buff — cộng thẳng số mili-giây vào các hằng số " +
        "thời lượng buff, VD 180000.0+HapTinhDaiPhap, 600000.0+HapTinhDaiPhap), nhưng heSo1 audit cũ ghi 15.0 " +
        "— sai đơn vị/thiếu 3 số 0 so với DB thật (15000.0). Vì đơn vị tiêu thụ là mili-giây, heSo1=15000 " +
        "(15 giây/điểm) mới hợp lý; heSo1=15.0 (15 mili-giây/điểm) gần như vô nghĩa trên thực tế. Không phải " +
        "xác suất nên không có rủi ro overflow, chỉ là cộng thời lượng.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "KHÁC audit cũ: heSo1 15.0→15000.0 (chênh 1000 lần — rất có thể audit cũ đọc nhầm số mũ khoa học " +
        "trong DB). Gán: PlayersBes.cs dòng 9676. Tiêu thụ (6 điểm buff đội tìm thấy trong " +
        "MagicAttack_Buff): A8_Players_03MagicAttack.cs dòng 1873, 1896, 1965, 2043, 2104, 2165. " +
        "DB FLD_INDEX=8: heSo1=15000.0, heSo2=0.0.",
    },
    {
      index: 9,
      id: 350,
      ten: "Cuồng ý hộ thể",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "KHÁC audit cũ về mức độ độc lập của 2 proc. Cả 2 vẫn dùng Random() riêng (new Random(), không phải " +
        "RNG chung) và cùng chỉ kích hoạt trong chiêu 501203 group-heal, LẶP theo từng thành viên đội: " +
        "(1) roll < CuongYHoThe(=điểm×1.0) → SP += Max_SP/20 (tức +5%); " +
        "(2) roll < CuongYHoThe×0.5 (xác suất bằng NỬA proc (1)) → gắn trạng thái 700350, cộng % phòng ngự " +
        "= max(0, CuongYHoThe − DAIPHU_VoTrungSinhHuu)×0.005. Tức mức cộng phòng ngự của proc (2) KHÔNG chỉ " +
        "phụ thuộc điểm đầu tư khí công này mà còn bị TRỪ theo điểm đã đầu tư vào 'Vô trung sinh hữu' " +
        "(idx10/id351) — 2 khí công có quan hệ đánh đổi ngầm, audit cũ mô tả chúng 'độc lập' là chưa chính xác.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "KHÁC audit cũ: heSo1 0.5→1.0 (DB thật), và bổ sung phát hiện quan hệ trừ chéo với id351. " +
        "Gán: PlayersBes.cs dòng 9679. Tiêu thụ: A8_Players_03MagicAttack.cs dòng 1570-1613 (trong case 501203 " +
        "của MagicAttack_Buff). DB FLD_INDEX=9: heSo1=1.0, heSo2=0.0.",
    },
    {
      index: 10,
      id: 351,
      ten: "Vô trung sinh hữu",
      loai: "goc",
      heSo1: 1.0,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "CÔNG THỨC ĐÃ ĐƯỢC VIẾT LẠI HOÀN TOÀN so với mô tả trong audit cũ (audit cũ mô tả nhánh ×1.6/×1.1 — " +
        "KHÔNG còn tồn tại trong code hiện tại). Cơ chế THẬT hiện nay: base.DAIPHU_VoTrungSinhHuu = điểm×1.0. " +
        "Cổng roll: RNG.Next(1,100) <= VoTrungSinhHuu (trừ thêm bộ đếm phản-khí-công của đối thủ " +
        "PhanCong_DAIPHU_VoTrungSinhHuu ở PK, không trừ gì ở PvE). Nếu trúng: mức dame cộng thêm (%) = " +
        "max(0, VoTrungSinhHuu − DAIPHU_CuongYHoThe)×0.01 — GIẢM nếu đã đầu tư nhiều vào 'Cuồng ý hộ thể' " +
        "(idx9/id350, xem đối chiếu ở đó); nếu khí công Thăng Thiên lồng bên trong 'Minh kính chỉ thủy' " +
        "(id352, cần thêm điều kiện dùng chiêu loại 3 + cấp kỹ năng kết hôn ≥5) CŨNG trúng roll riêng thì mức " +
        "này NHÂN ĐÔI. Cuối cùng cộng thêm vào dame gốc: dame += (int)(dame×mức%). Bản thân cổng gốc " +
        "(idx10) không có dấu hiệu lỗi tự vượt trần (heSo1=1.0/điểm, trần mặc định 60 điểm → tối đa 60%).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "KHÁC HẲN audit cũ: toàn bộ nhánh ×1.6/×1.1 mà audit cũ mô tả đã biến mất, thay bằng công thức % cộng " +
        "thêm dựa trên hiệu CuongYHoThe/VoTrungSinhHuu — nhiều khả năng bị viết lại trong đợt sửa code hôm nay. " +
        "heSo2 audit cũ ghi 1.0 nhưng KHÔNG hề được code đọc tới (hệ số nhân đôi 2.0 và hệ số 0.01 đều là hằng " +
        "số cứng trong code, không lấy từ 得到气功加成值 type=2) — đã sửa heSo2 về 0.0 theo DB thật. " +
        "Gán: PlayersBes.cs dòng 9682. Tiêu thụ PK: A8_Players_03MagicAttack.cs dòng 737-755. Tiêu thụ PvE: " +
        "A8_Players_03MagicAttack.cs dòng 3374-3392. DB FLD_INDEX=10: heSo1=1.0, heSo2=0.0.",
    },
    {
      index: 11,
      id: 59,
      ten: "Cửu thiên chân khí",
      loai: "goc",
      heSo1: 0.006,
      heSo2: 0.0,
      batBuocThangThien: null,
      moTa:
        "XÁC NHẬN ĐÚNG hướng như audit cũ. base.DAIPHU_CuuThienChanKhi = điểm×0.006. Đa dụng thật: " +
        "(1) hệ số nhân thêm lượng hồi máu 3 chiêu 501201/501202/501203: heal ×=(1+CuuThienChanKhi×10) " +
        "— ở trần 60 điểm, CuuThienChanKhi=0.36 → heal ×4.6, khá mạnh; " +
        "(2) cộng trực tiếp (không nhân hệ số) vào biên độ % buff đội (ATT/DEF/CX/NT/HP...) khi Đại Phu cast " +
        "buff chủ động, ví dụ num22 = 0.05 + CuuThienChanKhi rồi truyền vào AddFLD_ThemVaoTiLePhanTram_PhongNgu.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs dòng 9685. Tiêu thụ hồi máu: A8_Players_03MagicAttack.cs dòng 1529/1544/1564. " +
        "Tiêu thụ buff đội (biên độ): A8_Players_03MagicAttack.cs dòng 1875-1877 (và các khối tương tự dòng " +
        "1898, 1967, 2045, 2106, 2167). DB FLD_INDEX=11: heSo1=0.006, heSo2=0.0 — khớp audit cũ.",
    },
    {
      index: null,
      id: 58,
      ten: "Thăng Thiên 1: Hộ thân khí giáp",
      loai: "thang_thien",
      heSo1: 0.005,
      heSo2: null,
      batBuocThangThien: 6,
      moTa:
        "KHÁC audit cũ — PHÁT HIỆN MỚI: code hiện tại gán vào field SAI/CHẾT. Case PID=58 hiện nay là: " +
        "FLD_NhanVat_KhiCong_PhongNgu += (int)(điểm×0.005×FLD_NhanVatCoBan_CongKich) — chú thích ngay trong " +
        "code còn ghi rõ '// Nhân vật cơ bản_Tấn công' (tức nhân với chỉ số TẤN CÔNG cơ bản, không phải phòng " +
        "ngự — giống lỗi copy-paste từ case khác). Quan trọng hơn: field FLD_NhanVat_KhiCong_PhongNgu mà nó " +
        "ghi vào KHÔNG hề được bất kỳ công thức phòng ngự/damage nào trong toàn bộ repo đọc lại — nơi đọc duy " +
        "nhất là UserIdList.cs (hàm debug dump chỉ số ra GM/log). Field thật sự nuôi 'Lực Phòng Ngự Võ Công' " +
        "(công thức PlayersBes.cs dòng 2228) là NhanVat_KhiCong_ThemVao_LucPhongNguVoCong — MỘT FIELD KHÁC HẲN " +
        "mà case PID=58 không hề đụng tới. Kết luận: đầu tư điểm vào khí công này hiện KHÔNG có tác dụng gì.",
      trangThai: "CHET_HOAN_TOAN",
      ghiChu:
        "KHÁC audit cũ (audit cũ ghi BINH_THUONG, 'đổ vào TotalSkillDefense' — tên field đó không tồn tại " +
        "trong code hiện tại; đã kiểm chứng lại: field thật ghi vào là FLD_NhanVat_KhiCong_PhongNgu, field " +
        "chết, và công thức còn nhân nhầm theo tấn công thay vì phòng ngự). Gán: PlayersBes.cs dòng 10108-10110. " +
        "Field thật cho Lực Phòng Ngự Võ Công: PlayersBes.cs dòng 2228 (không dùng field này). " +
        "DB bảng 升天气功 (气功ID=58): FLD_每点加成比率值=0.005 (khớp audit cũ, chỉ hành vi tiêu thụ sai).",
    },
    {
      index: null,
      id: 150,
      ten: "Thăng Thiên 2: Vạn vật hồi xuân",
      loai: "thang_thien",
      heSo1: 1.0,
      heSo2: null,
      batBuocThangThien: 7,
      moTa:
        "XÁC NHẬN ĐÚNG như audit cũ. base.DAIPHU_ThangThien_2_KhiCong_VanVatHoiXuan = điểm×1.0. Proc nhân đôi " +
        "(×2.0) lượng hồi máu của cả 3 chiêu 501201/501202/501203 khi RNG.Next(1,100) <= giá trị. Trần mặc " +
        "định 60 điểm × heSo 1.0 = tối đa 60% xác suất, không vượt trần.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "Gán: PlayersBes.cs dòng 10105-10107 (case PID=150). Tiêu thụ: A8_Players_03MagicAttack.cs dòng " +
        "1530-1534, 1545-1549, 1565-1569. DB bảng 升天气功 (气功ID=150): heSo1=1.0 — khớp audit cũ.",
    },
    {
      index: null,
      id: 352,
      ten: "Thăng Thiên 3: Minh kính chỉ thủy",
      loai: "thang_thien",
      heSo1: 2.0,
      heSo2: null,
      batBuocThangThien: 8,
      moTa:
        "BẤT ĐỒNG VỚI AUDIT CŨ — bản fix 03/09 mà audit cũ ghi nhận (bọc Math.Min(giá trị,99.0)) HIỆN KHÔNG " +
        "CÒN trong code ở cả 2 vị trí tiêu thụ đã kiểm tra lại (PK và PvE): giá trị base." +
        "DAIPHU_ThangThien_3_KhiCong_MinhKinhChiThuy = điểm×2.0 được dùng THẲNG trong RNG.Next(1,100) <= giá " +
        "trị mà không có bất kỳ giới hạn nào — hễ đầu tư ≥50 điểm (2.0×50=100) là roll LUÔN ĐÚNG, y hệt lỗi " +
        "gốc mà audit cũ mô tả trước khi 'fix'. Ngoài ra phát hiện THÊM một điều kiện gate MỚI không có trong " +
        "audit cũ: nhánh này giờ chỉ được xét khi 'value.FLD_VoCongLoaiHinh==3 && base.KyNangKetHon_CapDo>=5' " +
        "(điều kiện đang dùng chiêu loại 3 — vẻ như là 'chiêu vợ chồng' — và có cấp kỹ năng kết hôn ≥5), " +
        "một điều kiện xuất hiện lặp lại ở ~11 chỗ khác trong cùng file cho nhiều job khác nhau nên nhiều khả " +
        "năng là chủ đích thiết kế (không phải lỗi copy-paste riêng lẻ), nhưng KHÔNG hề được audit cũ nhắc " +
        "tới và làm cho nhánh proc này gần như không bao giờ kích hoạt được với đa số người chơi thường " +
        "(không kết hôn / chưa đủ cấp kỹ năng kết hôn) bất kể đầu bao nhiêu điểm.",
      trangThai: "CON_LOI_CHUA_SUA",
      ghiChu:
        "BẤT ĐỒNG VỚI AUDIT CŨ (audit cũ: DA_SUA, có Math.Min(99) — đã kiểm chứng lại KHÔNG THẤY cap này ở " +
        "code hiện tại, và phát hiện thêm gate 'chiêu vợ chồng cấp≥5' mới). Gán: PlayersBes.cs dòng 10271-10273. " +
        "Tiêu thụ PK: A8_Players_03MagicAttack.cs dòng 746-754 (lồng trong nhánh id351). Tiêu thụ PvE: " +
        "A8_Players_03MagicAttack.cs dòng 3383-3391. DB bảng 升天气功 (气功ID=352): heSo1=2.0 — khớp audit cũ.",
    },
    {
      index: null,
      id: 353,
      ten: "Thăng Thiên 4: Mãn nguyệt cuồng phong",
      loai: "thang_thien",
      heSo1: 0.5,
      heSo2: null,
      batBuocThangThien: 9,
      moTa:
        "Cơ chế đúng hướng audit cũ (field dùng chung nhiều PID/nhiều job tier Thăng Thiên 4: base." +
        "ThangThien_4_ManNguyetCuongPhong = điểm×heSo1 riêng theo job), nhưng heSo1 audit cũ ghi 0.05 — sai " +
        "lệch 10 lần so với DB thật (0.5). Với 0.5 thật, ở trần 60 điểm xác suất tối đa ~30% (không phải " +
        "~3.5-4% như audit cũ suy đoán). Khi trúng: buff cả đội (theo TeamID, trong phạm vi " +
        "World.群体辅助组队范围) +25% tấn công và +25% phòng ngự trong 5000ms cho từng thành viên hợp lệ.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "KHÁC audit cũ: heSo1 0.05→0.5 (DB thật, sai lệch 10 lần). Gán: PlayersBes.cs dòng 10274-10276 (case " +
        "PID=353, dùng chung field với PID 373/393/313/323/327/333/343/613/... của các job khác). Tiêu thụ: " +
        "Players.cs dòng 40139-40162. DB bảng 升天气功 (气功ID=353): heSo1=0.5.",
    },
    {
      index: null,
      id: 354,
      ten: "Thăng Thiên 4: Vọng mai thiêm hoa",
      loai: "thang_thien",
      heSo1: 3.5,
      heSo2: null,
      batBuocThangThien: 9,
      moTa:
        "Cơ chế đúng hướng audit cũ (field dùng chung base.ThangThien_4_VongMaiThiemHoa = điểm×heSo1, proc " +
        "buff khi có chiêu VoCongMoi[1,25]), nhưng heSo1 audit cũ ghi 0.5 — sai lệch 7 lần so với DB thật " +
        "(3.5). Phát hiện thêm: field này được ĐỌC ở 3 vị trí với 3 kiểu roll KHÁC NHAU — Players.cs dòng " +
        "40004 dùng new Random().Next(1,500) (mẫu số 500), Players.cs dòng 40357 dùng mẫu 100 kèm điều kiện " +
        "VoCongMoi[1,25]!=null, và A8_Players_03MagicAttack.cs dòng 2851/2894 dùng RNG.Next(1,100) (mẫu 100) " +
        "— tức xác suất thực tế phụ thuộc vào vị trí kích hoạt, không đồng nhất như audit cũ ngầm giả định.",
      trangThai: "BINH_THUONG",
      ghiChu:
        "KHÁC audit cũ: heSo1 0.5→3.5 (DB thật, sai lệch 7 lần); bổ sung phát hiện 3 vị trí tiêu thụ với mẫu " +
        "số roll khác nhau (500 vs 100). Gán: PlayersBes.cs dòng 10277-10279 (case PID=354, dùng chung field " +
        "với PID 614 của job khác). Tiêu thụ: Players.cs dòng 40004, 40357; A8_Players_03MagicAttack.cs dòng " +
        "2851, 2894. DB bảng 升天气功 (气功ID=354): heSo1=3.5.",
    },
    {
      index: null,
      id: 387,
      ten: "Thăng Thiên 1: Cuồng phong thiên ý",
      loai: "thang_thien",
      heSo1: 0.2,
      heSo2: null,
      batBuocThangThien: 6,
      moTa:
        "CƠ CHẾ ĐÃ THAY ĐỔI HOÀN TOÀN so với audit cũ. Không còn roll RNG.Next(1,150) và không còn trạng thái " +
        "700387 (+20% ATT/+20% DEF) — cả hai đều KHÔNG tìm thấy trong code hiện tại (đã grep '700387' toàn bộ " +
        "repo, không có kết quả). Cơ chế THẬT hiện nay gồm 2 phần tách biệt: " +
        "(1) khi bị tấn công (PvE lẫn PK), roll RNG.Next(1,100) <= ThangThien_1_KhiCong_CuongPhongThienY(=" +
        "điểm×0.2) và chưa ở trạng thái NoKhi → SP được đặt thẳng lên Max_SP+5 (tức làm đầy/tràn nhẹ thanh SP, " +
        "kích hoạt sớm chế độ 'phẫn nộ' status 700014 dùng chung mọi job); " +
        "(2) khi chế độ phẫn nộ (700014) được kích hoạt cho job5, hệ số này CHỈ còn ảnh hưởng THỜI LƯỢNG của " +
        "trạng thái (10000 + điểm×0.2×3000 + 3000 ms), còn mức cộng % tấn công/phòng ngự của trạng thái " +
        "700014 cho job5 là CỐ ĐỊNH +15% tấn công / +20% phòng ngự, KHÔNG scale theo điểm đầu tư (khác hẳn " +
        "mô tả '+20%/+20%' gắn liền với khí công của audit cũ).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "KHÁC audit cũ: heSo1 1.0→0.2 (DB thật); mẫu roll 150→100; toàn bộ cơ chế thực thi đã viết lại (SP " +
        "tràn kích hoạt phẫn nộ sớm hơn + kéo dài thời lượng, thay vì tự cộng % tấn công/phòng ngự trực " +
        "tiếp qua state 700387 không còn tồn tại). Gán: PlayersBes.cs dòng 10168-10173 (if Player_Job==5). " +
        "Tiêu thụ proc SP: NpcClass.cs dòng 1342; A8_Players_02PhysicalAttack.cs dòng 1726; " +
        "A8_Players_03MagicAttack.cs dòng 1224. Tiêu thụ thời lượng phẫn nộ: Players.cs dòng 61877-61882. " +
        "DB bảng 升天气功 (气功ID=387): heSo1=0.2.",
    },
    {
      index: null,
      id: 574,
      ten: "Khí công bí cấp (Thăng Thiên 6 thức - Đại Phu)",
      loai: "thang_thien",
      heSo1: 0.7,
      heSo2: null,
      batBuocThangThien: 11,
      moTa:
        "ĐÃ SỬA THẬT SỰ so với audit cũ — không còn là khí công 'chỉ hiện thông báo'. Field vật lý cũng đã " +
        "đổi tên (hiện là base.DAIPHU_VanTam_NguyetTinh, tên chiêu DB thật '云心月性'/Vân Tâm Nguyệt Tính — " +
        "không còn field 'ThangThien_6_JOB_5_KHI_CONG_1' mà audit cũ nhắc tới). Cơ chế hiện tại (cả PvE lẫn " +
        "PK, khi Đại Phu là người BỊ tấn công): roll RNG.Next(1,100) <= giá trị (PK trừ thêm bộ đếm phản-khí- " +
        "công của đối thủ PhanCong_DAIPHU_VanTamNguyetTinh, PvE thì không trừ), kèm điều kiện chưa mang " +
        "trạng thái 700574 và đã qua ít nhất 10 giây kể từ lần kích hoạt trước (cooldown nội bộ). Khi trúng: " +
        "VÔ HIỆU HOÀN TOÀN đòn đánh đó (dame=0) VÀ gắn trạng thái 700574 trong 5000ms — trong toàn bộ 5 giây " +
        "đó, MỌI đòn đánh tiếp theo cũng tự động bị vô hiệu hoàn toàn (kiểm tra GetAddState(700574) độc lập, " +
        "không cần roll lại) — tức đây thực chất là một 'khiên miễn nhiễm sát thương tạm thời' khi kích hoạt, " +
        "mạnh hơn nhiều so với chỉ chặn 1 đòn.",
      trangThai: "DA_SUA",
      ghiChu:
        "BẤT ĐỒNG MẠNH VỚI AUDIT CŨ (audit cũ: CON_LOI_CHUA_SUA, 'chỉ hiện thông báo, không có tác dụng' — " +
        "KHÔNG còn đúng, đã kiểm chứng lại 2 vị trí tiêu thụ và thấy dame=0 + gắn trạng thái miễn nhiễm 5s). " +
        "Rất có thể được sửa trong đợt chỉnh sửa code hôm nay 15/09. Gán: PlayersBes.cs dòng 10453-10455 " +
        "(case PID=574, field DAIPHU_VanTam_NguyetTinh). Tiêu thụ PK: A8_Players_03MagicAttack.cs dòng " +
        "1234-1243. Tiêu thụ PvE: A8_Players_02PhysicalAttack.cs dòng 1736-1745. " +
        "DB bảng 升天气功 (气功ID=574): heSo1=0.7 (audit cũ ghi 0.1 — sai lệch 7 lần, đã cập nhật).",
    },
    {
      index: null,
      id: 683,
      ten: "[Y Sư] Khí công bí cấp thư (Hình di yêu tương, Thăng Thiên 5 thức)",
      loai: "thang_thien",
      heSo1: 0.2,
      heSo2: null,
      batBuocThangThien: 10,
      moTa:
        "Cơ chế XÁC NHẬN ĐÚNG như audit cũ (khi bị tấn công, roll RNG.Next(1,100) <= " +
        "ThangThien_5_HinhDiYeuTuong thì VÔ HIỆU HOÀN TOÀN đòn đánh đến, dame=0, cả PvE lẫn PK), nhưng heSo1 " +
        "audit cũ ghi 0.5 — sai lệch 2.5 lần so với DB thật (0.2). Với 0.2 thật, ở trần mặc định 60 điểm xác " +
        "suất miễn nhiễm tối đa chỉ ~12% (không phải ~35-40% như audit cũ ước tính dựa trên heSo1 sai).",
      trangThai: "BINH_THUONG",
      ghiChu:
        "KHÁC audit cũ: heSo1 0.5→0.2 (DB thật, sai lệch 2.5 lần) → xác suất tối đa thực tế thấp hơn nhiều " +
        "so với audit cũ ước tính. Gán: PlayersBes.cs dòng 10310-10312. Tiêu thụ PK: " +
        "A8_Players_03MagicAttack.cs dòng 1228-1233. Tiêu thụ PvE: A8_Players_02PhysicalAttack.cs dòng " +
        "1730-1735. DB bảng 升天气功 (气功ID=683): heSo1=0.2.",
    },
    {
      index: null,
      id: null,
      ten: "Thần Nông Tiên Thuật",
      loai: "goc",
      heSo1: null,
      heSo2: null,
      batBuocThangThien: null,
      moTa:
        "XÁC NHẬN ĐÚNG như audit cũ, vẫn còn mồ côi sau khi đọc lại toàn bộ UpdateKhiCong() hiện tại: đã grep " +
        "'DAIPHU_ThanNongTienThuat' toàn bộ repo — không có case nào (cả switch theo index lẫn switch theo " +
        "KhiCongID) gán giá trị cho field này, chỉ có dòng reset về 0.0. Tiêu thụ duy nhất: tỉ lệ chế dược " +
        "thành công trong hàm chế dược của Players.cs — num5=80 (cố định); random.Next(0,110) <= num5 + " +
        "DAIPHU_ThanNongTienThuat. Vì field luôn = 0.0, tỉ lệ luôn cố định 80/110 ≈ 72.7%, không phụ thuộc " +
        "bất kỳ khí công nào của người chơi.",
      trangThai: "CHET_HOAN_TOAN",
      ghiChu:
        "Reset: PlayersBes.cs dòng 6856. Tiêu thụ: Players.cs dòng 9326-9332 (vòng lặp chế dược, num5=80 " +
        "dòng 9328). Không rõ ý đồ thiết kế gốc (PID/KhiCongID nào lẽ ra nên map vào field này), chưa tự chế " +
        "công thức thay thế — cần Admin xác nhận trước khi sửa.",
    },
  ],
};
