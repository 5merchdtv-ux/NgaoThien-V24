export type FixStatus = "da-xong" | "dang-theo-doi" | "chua-lam";

export type FixKind = "loi" | "kiem-tra";

/**
 * Một lần chỉnh sửa của CÙNG một nhóm lỗi.
 * Mỗi lần sửa lại thì thêm một bản ghi vào `lichSu` của chính nhóm lỗi đó,
 * KHÔNG tạo nhóm lỗi mới, để theo dõi được cũ là gì và mới là gì.
 */
export type FixRevision = {
  version: string;
  ngay: string;
  cu: string;
  moi: string;
  ketQua: "dat" | "khong-dat";
  ghiChu?: string;
};

export type FixEntry = {
  id: string;
  loai: FixKind;
  nhom: string;
  tieuDe: string;
  trieuChung: string;
  nguyenNhan: string;
  trangThai: FixStatus;
  phienBanHienTai: string;
  kenh: string;
  file: string[];
  hoSo?: string;
  bangChung?: string;
  lichSu: FixRevision[];
};

export const FIX_LOG_META = {
  maThayDoi: "HKNT-20260730-001-fix-vang-game-trung-sinh",
  hoSo: "HKNT_RECOVERY_REPO/changes/HKNT-20260730-001-fix-vang-game-trung-sinh/CHANGE.md",
  capNhat: "2026-07-30",
  sourceChuan: "HKNT_RECOVERY_REPO/src/GameServer-K1",
};

export const FIX_LOG: FixEntry[] = [
  {
    id: "gm-support-snapshot-startindex",
    loai: "loi",
    nhom: "GM Support",
    tieuDe: "GM Support snapshot failed: StartIndex cannot be less than zero",
    trieuChung:
      "Log GameServer lặp liên tục dòng 'GM Support snapshot failed: StartIndex cannot be less than zero'. GM Support không xem được túi đồ, chỉ số và PET của nhân vật bị dính.",
    nguyenNhan:
      "Property FLD_CuongHoaSoLuong trong X_Vat_Pham_Loai.cs cắt chuỗi bằng text.Substring(text.Length - 2, 2) mà chỉ chặn giá trị nhỏ hơn hoặc bằng 0, không kiểm tra độ dài. Vật phẩm có FLD_MAGIC0 là số một chữ số (1–9) làm chỉ số cắt thành -1 và ném ArgumentOutOfRangeException. Lời gọi nằm ngoài khối try/catch của ToItems nên lỗi vọt lên tận Handle() và làm hỏng toàn bộ snapshot của nhân vật đó.",
    trangThai: "da-xong",
    phienBanHienTai: "22.5.2.17",
    kenh: "Kênh 1",
    file: ["RxjhServer/X_Vat_Pham_Loai.cs"],
    bangChung:
      "Đường đi: GmSupportPipeServer.cs:102 snapshot → ToItems() dòng 704 đọc item.FLD_CuongHoaSoLuong → X_Vat_Pham_Loai.cs:3562 ném lỗi → bắt tại GmSupportPipeServer.cs:112 và ghi log.",
    lichSu: [
      {
        version: "22.5.2.17",
        ngay: "2026-07-30",
        cu: "text.Substring(text.Length - 2, 2) không kiểm tra độ dài; FLD_MAGIC0 một chữ số làm chỉ số cắt âm và ném lỗi, hỏng cả snapshot.",
        moi: "Thêm kiểm tra độ dài, trả về 0 thay vì ném lỗi: text.Length < 2 ? 0 : ... Áp dụng cùng cách cho FLD_CuongHoaLoaiHinh (cắt Length - 8, còn mong manh hơn vì mọi FLD_MAGIC0 dưới 8 chữ số đều nổ).",
        ketQua: "dat",
        ghiChu:
          "Đúng khuôn mẫu SafeEnhancement đã có sẵn tại GmSupportPipeServer.cs:445. Hai property FLDThuocTinh* không cần sửa vì đã có điều kiện lớn hơn 1000000000 nên luôn đủ 10 chữ số. Không mất dữ liệu, chỉ ảnh hưởng khả năng xem của GM Support.",
      },
    ],
  },
  {
    id: "characterrelog-vang-game-11-chuc-nang",
    loai: "loi",
    nhom: "Toàn server",
    tieuDe: "11 chức năng văng game do dùng chung CharacterRelog()",
    trieuChung:
      "Admin xác nhận đã tự gặp: dùng các chức năng này thì game đóng phụt về desktop. Gồm đổi tên nhân vật, đổi giới tính Nam/Nữ, chuyển thể lực Chính/Tà Phái, chuyển char, tẩy điểm khí công, Kích thể chiến công, xóa thời gian online và một vật phẩm đặc biệt giá 100 triệu Gold.",
    nguyenNhan:
      "Cả 11 chức năng đều gọi chung hàm CharacterRelog(), tức vẫn bắn gói char-select 0357/0363 xuống client đang ở trong map — đúng cơ chế đã chứng minh gây crash ở Trùng Sinh. Bản vá Trùng Sinh trước đó chỉ cho riêng Trùng Sinh thôi dùng hàm này, không sửa bản thân hàm.",
    trangThai: "da-xong",
    phienBanHienTai: "22.5.2.16",
    kenh: "Kênh 1",
    file: ["RxjhServer/Players.cs"],
    bangChung:
      "KHÔNG mất dữ liệu ở bản cũ: thứ tự thực thi là Logout() chạy trước (lưu nhân vật, lưu 3 kho, rời tổ đội, đặt FLD_ONLINE=0), rồi mới gửi gói gây crash. Thiệt hại chỉ ở trải nghiệm.",
    lichSu: [
      {
        version: "22.5.2.16",
        ngay: "2026-07-30",
        cu: "CharacterRelog() đặt Exiting = true, gọi Logout(), Thread.Sleep(500) rồi bắn gói char-select → client đóng phụt về desktop ở cả 11 chức năng.",
        moi: "CharacterRelog() lưu 4 nhóm dữ liệu rồi Client.Dispose(), không gửi gói tin nào và không đặt Exiting = true. Client hiện hộp thoại Mất kết nối có nút Đồng ý. Sửa đúng một hàm nên cả 11 chức năng khỏi cùng lúc.",
        ketQua: "dat",
        ghiChu:
          "Gộp chung logic với hàm Trùng Sinh đã chạy tốt để không tồn tại hai bản trùng nhau; thêm tham số lý do để nhãn log phân biệt được từng chức năng. Không đụng BackToPeopleList() vì nút bấm tay của client vẫn chạy đúng. Cần test đổi tên nhân vật và tẩy điểm khí công để nghiệm thu.",
      },
    ],
  },
  {
    id: "ts-exp-to-doi",
    loai: "loi",
    nhom: "Trùng Sinh",
    tieuDe: "EXP tổ đội áp theo Trùng Sinh của người giết quái",
    trieuChung:
      "Thành viên tổ đội nhận EXP theo hệ số Trùng Sinh của người giết quái thay vì của chính mình. Acc TS8 chỉ cần đi tổ đội để acc TS0 giết quái là né sạch phạt EXP, hưởng nguyên 100%.",
    nguyenNhan:
      "NpcClass.cs nhân hệ số EXP theo TRUNG_SINH_SO_LAN của người giết, sau đó Players.cs mới chia đều cho tổ đội. Vòng lặp chia cho từng thành viên có cộng bonus riêng của họ nhưng không áp hệ số Trùng Sinh của chính họ.",
    trangThai: "dang-theo-doi",
    phienBanHienTai: "22.5.2.15",
    kenh: "Kênh 1",
    file: ["RxjhServer/NpcClass.cs", "RxjhServer/Players.cs"],
    bangChung:
      "Đã xác minh cả 5 nơi gọi ThuDuocKinhNghiem đều đổ về PhanPhoiKinhNghiemLichLuyenTienTai nên không sót nhánh nào. Chuỗi tính EXP toàn phép nhân nên người đánh lẻ không đổi kết quả.",
    lichSu: [
      {
        version: "22.5.2.15",
        ngay: "2026-07-30",
        cu: "TS8 giết, thành viên TS0 nhận 60%. TS0 giết, thành viên TS8 nhận 100%.",
        moi: "TS8 giết, thành viên TS0 nhận đúng 100%. TS0 giết, thành viên TS8 nhận đúng 60%. Mỗi người hưởng theo Trùng Sinh của chính mình ở cả nhánh tổ đội và nhánh đánh lẻ.",
        ketQua: "dat",
        ghiChu:
          "Lỗi có sẵn từ trước, không do các thay đổi ngày 30/07 gây ra. Trái với mục checklist cũ 'Party có TS khác nhau nhận EXP đúng theo từng người' — mục đó chưa từng đạt thật. CHỜ NGHIỆM THU: cần 2 acc khác số lần TS đi chung tổ đội để xác nhận.",
      },
    ],
  },
  {
    id: "ts-vang-game",
    loai: "loi",
    nhom: "Trùng Sinh",
    tieuDe: "Trùng sinh xong bị văng game",
    trieuChung:
      "Gõ !trungsinh xong, client đóng hẳn về desktop. Không kịp hiện thông báo nào.",
    nguyenNhan:
      "CharacterRelog() tự bắn 2 gói 'về màn hình chọn nhân vật' (opcode 0357/0363) xuống client trong lúc nhân vật vẫn đang ở trong map. Client không xử lý được gói này khi chưa dọn cảnh game nên crash. Nút bấm tay chạy được là vì client tự dọn cảnh trước rồi mới gửi yêu cầu lên server.",
    trangThai: "da-xong",
    phienBanHienTai: "22.5.2.14",
    kenh: "Kênh 1",
    file: ["RxjhServer/Players.cs", "RxjhServer/World.cs"],
    bangChung:
      "Log Disconnect_2026_07_30: lần hỏng 10:26:50 → 10:26:53 cách nhau 3 giây và thiếu dòng 'Disconnect-Logout: 1'. Lần đạt 10:57:49 cả 3 dòng cùng một giây và CÓ dòng ': 1'.",
    lichSu: [
      {
        version: "22.5.2.13",
        ngay: "2026-07-30",
        cu: "CharacterRelog() gọi Logout(), Thread.Sleep(500) rồi bắn 2 gói char-select.",
        moi: "Tách hàm riêng cho Trùng Sinh, bỏ Thread.Sleep(500), thêm nhãn log riêng 'Disconnect-Logout: TrungSinh' để truy vết.",
        ketQua: "khong-dat",
        ghiChu:
          "Vẫn văng. Nhờ nhãn log mới mới loại trừ được giả thuyết Thread.Sleep chỉ sau một lần test: nguyên nhân thật là client không nhận được gói char-select khi đang trong map.",
      },
      {
        version: "22.5.2.14",
        ngay: "2026-07-30",
        cu: "Vẫn gửi gói char-select xuống client đang ở trong map.",
        moi: "Bỏ hẳn việc gửi gói. Làm theo đúng cơ chế bảo trì: lưu 4 nhóm dữ liệu rồi Client.Dispose() để kết nối đứt tự nhiên. Client xử lý mất kết nối bình thường như mỗi lần bảo trì.",
        ketQua: "dat",
      },
    ],
  },
  {
    id: "ts-khong-don-trang-thai",
    loai: "loi",
    nhom: "Trùng Sinh",
    tieuDe: "Trùng sinh xong không dọn trạng thái cũ",
    trieuChung:
      "Sau trùng sinh nhân vật vẫn còn trong tổ đội dù đã về level 100; buff, gian hàng, giao dịch và trạng thái PET vẫn giữ nguyên.",
    nguyenNhan:
      "Bản 22.5.2.13 bỏ relog nhưng đặt Exiting = true, làm NetState bỏ qua nhánh gọi Player.Logout(). Toàn bộ 10 mục dọn dẹp của Logout() không chạy: rời tổ đội, lưu nhân vật và 3 kho, xóa buff/trạng thái, rời map, đóng gian hàng, thoát shop người khác, xóa trạng thái PET, hủy giao dịch, dừng timer AutomaticAttack_Char.",
    trangThai: "da-xong",
    phienBanHienTai: "22.5.2.14",
    kenh: "Kênh 1",
    file: ["RxjhServer/Players.cs"],
    bangChung:
      "Dòng 'Disconnect-Logout: 1' chỉ được ghi khi !Player.Exiting, ngay trước Player.Logout(). Log 10:57:49 đã có dòng này.",
    lichSu: [
      {
        version: "22.5.2.13",
        ngay: "2026-07-30",
        cu: "CharacterRelog() gọi Logout() nên vẫn dọn đủ trạng thái.",
        moi: "Bỏ relog và đặt Exiting = true → mất toàn bộ phần dọn dẹp.",
        ketQua: "khong-dat",
        ghiChu:
          "Lỗi do chính bản vá sinh ra. Admin phát hiện qua việc nhân vật vẫn còn trong tổ đội sau trùng sinh.",
      },
      {
        version: "22.5.2.14",
        ngay: "2026-07-30",
        cu: "Đặt Exiting = true nên Player.Logout() bị bỏ qua.",
        moi: "Cố ý KHÔNG đặt Exiting = true. Khi socket đứt, NetState thấy !Player.Exiting và chạy đầy đủ Player.Logout(), dọn sạch cả 10 mục.",
        ketQua: "dat",
      },
    ],
  },
  {
    id: "auto-danh-thuong-sau-trung-sinh",
    loai: "loi",
    nhom: "Chiến đấu",
    tieuDe: "Bật Auto sau Trùng Sinh nhưng chỉ đánh thường",
    trieuChung:
      "Nhân vật sau Trùng Sinh bật treo Auto nhưng chỉ đánh thường, không dùng võ công. Có trường hợp đánh skill một phát rồi tự quay về đánh thường.",
    nguyenNhan:
      "Hai nguyên nhân khác nhau, sửa ở hai bản khác nhau. (1) Bộ chọn skill Auto phụ thuộc thứ tự SQL, thoát khi gặp phần tử null, và chỉ nhận skill đúng bậc nghề hiện tại; nhân vật bậc nghề cao nhưng level sau Trùng Sinh chưa đủ dùng skill đúng bậc nên ID Auto giữ 0 và packet chuyển sang đánh thường. (2) Client crash khi trùng sinh làm mất cấu hình bảng Hộp Auto.",
    trangThai: "da-xong",
    phienBanHienTai: "22.5.2.14",
    kenh: "Kênh 1",
    file: ["RxjhServer/Players.cs"],
    hoSo: "KT-20260730-01",
    bangChung:
      "Đã kiểm tra riêng phần thời gian chờ skill: CheckHackSpeed_Skill_Time tính lại từ FLD_CDTIME mỗi lần bấm skill, không phụ thuộc level hay số lần Trùng Sinh — không có lỗi ở cooldown.",
    lichSu: [
      {
        version: "22.5.2.12",
        ngay: "2026-07-30",
        cu: "Bộ chọn skill Auto phụ thuộc thứ tự SQL, thoát khi gặp null, chỉ nhận skill đúng bậc nghề hiện tại → ID Auto giữ 0 sau Trùng Sinh.",
        moi: "Chọn xác định skill tấn công theo level, công lực và PID; cho phép skill bậc thấp hơn và phe trung lập; loại buff/passive khỏi danh sách Auto.",
        ketQua: "dat",
      },
      {
        version: "22.5.2.14",
        ngay: "2026-07-30",
        cu: "Client vẫn crash khi trùng sinh nên mất cấu hình Hộp Auto, người chơi thấy vẫn rơi về đánh thường.",
        moi: "Client không còn crash nên Hộp Auto giữ nguyên cấu hình. Admin xác nhận hết lỗi.",
        ketQua: "dat",
      },
    ],
  },
  {
    id: "vo-cong-null-exception",
    loai: "loi",
    nhom: "Chiến đấu",
    tieuDe: "Võ công null gây NullReferenceException lặp",
    trieuChung:
      "Nhân vật dùng võ công 401401 (Hồi Lưu Cường Khí) làm log lặp System.NullReferenceException tại numcheck[12].",
    nguyenNhan:
      "Tra cứu Kongfu có thể trả về phần tử null nhưng luồng kích hoạt dùng ngay thuộc tính MP. Ngoài ra dictionary Kongfu cũ bị xóa/thêm trực tiếp trong lúc các luồng gameplay đang đọc.",
    trangThai: "da-xong",
    phienBanHienTai: "22.5.2.12",
    kenh: "Kênh 1",
    file: ["RxjhServer/Players.cs"],
    hoSo: "KT-20260730-01",
    bangChung:
      "Test null Kongfu và Auto sau Trùng Sinh 12/12 PASS. Sau triển khai không còn log mới khớp numcheck[12] hoặc NullReferenceException.",
    lichSu: [
      {
        version: "22.5.2.12",
        ngay: "2026-07-30",
        cu: "Dùng ngay thuộc tính MP của phần tử Kongfu có thể null; sửa dictionary trực tiếp trong lúc luồng khác đang đọc.",
        moi: "Thêm null guard tại kích hoạt, học võ công và tính thời gian hồi. Nạp Kongfu vào dictionary tạm rồi thay tham chiếu nguyên khối.",
        ketQua: "dat",
      },
    ],
  },
  {
    id: "mai-lieu-chan-ne-tranh",
    loai: "loi",
    nhom: "Chiến đấu",
    tieuDe: "Mai Liễu Chân bị quái đánh liên tục hiện Né tránh",
    trieuChung:
      "Quái đánh Mai Liễu Chân liên tục hiện chữ Né tránh thay vì gây sát thương.",
    nguyenNhan:
      "Nhánh PvE tính lá chắn bằng sát thương × điểm lá chắn × 2% nhưng không có trần theo sát thương đầu vào. Khi tổng điểm hiệu lực vượt 50, lượng hấp thụ vượt 100% làm sát thương cuối bằng 0 hoặc âm; client biểu diễn thành Né tránh. Nhánh Hỏa Long cũ trừ AP lá chắn nhưng vẫn trừ toàn bộ sát thương vào HP.",
    trangThai: "da-xong",
    phienBanHienTai: "22.5.2.11",
    kenh: "Kênh 1",
    file: [
      "RxjhServer/MaiLieuChanBarrierPolicy.cs",
      "RxjhServer/NpcClass.cs",
      "RxjhServer/EVENT_Boss_Event_FireDragon_Loai.cs",
    ],
    hoSo: "KT-20260729-02",
    bangChung:
      "Smoke test policy thật 199.263/199.263 PASS. Điểm 0–45 giữ nguyên công thức cũ, trên 45 bị chặn ở 90%. MrTest1 trạng thái buff 92% được chặn còn 90%.",
    lichSu: [
      {
        version: "22.5.2.11",
        ngay: "2026-07-29",
        cu: "Không có trần hấp thụ; hấp thụ có thể vượt 100% làm sát thương 0 hoặc âm.",
        moi: "Thêm policy chung MaiLieuChanBarrierPolicy, giữ hệ số 2%/điểm nhưng đặt trần 90%, chặn theo sát thương đầu vào và AP hiện có, bảo đảm sát thương cuối tối thiểu 1. Hỏa Long trừ HP theo sát thương sau lá chắn.",
        ketQua: "dat",
        ghiChu:
          "Kênh 2 cố ý chưa nhận bản vá để làm đối chứng. Né tránh hợp lệ từ cơ chế khác vẫn có thể xuất hiện.",
      },
    ],
  },
  {
    id: "treo-offline-24h",
    loai: "loi",
    nhom: "Treo offline",
    tieuDe: "Treo offline giới hạn 24 giờ và các lỗi kèm theo",
    trieuChung:
      "Phiên treo offline không có giới hạn thời gian; kèm nhiều lỗi phụ về timer chạy chồng, hồi máu sai và vị trí lưu sai.",
    nguyenNhan:
      "Timer offline có thể chạy chồng cho cùng một nhân vật; kích hoạt/hủy không có khóa một lần; cập nhật vị trí offline không ghi đủ X, Y và bản đồ; có nhánh ghi nhầm EXP bằng level.",
    trangThai: "da-xong",
    phienBanHienTai: "22.5.2.11",
    kenh: "Kênh 1",
    file: ["RxjhServer/Players.cs", "Gsconfig.ini"],
    hoSo: "KT-20260729-01",
    bangChung:
      "Hồi quy offline 49/49 PASS. Mô phỏng đồng thời 10.000 lần kích hoạt, 10.000 lần hủy và 10.000 tick timer. Biên thời gian 23:59:59 vẫn chạy, đủ 24:00:00 thì dừng.",
    lichSu: [
      {
        version: "22.5.2.11",
        ngay: "2026-07-29",
        cu: "Treo offline không giới hạn; timer có thể chạy chồng; hồi HP/MP miễn phí; giữ mục tiêu quái đã chết; vị trí và EXP lưu sai.",
        moi: "Giới hạn 1440 phút mỗi phiên, lưu định kỳ 5 phút. Khóa kích hoạt/hủy một lần duy nhất, đặt trạng thái offline trước khi ngắt socket. Chỉ dùng pill thật trong túi. Khi PK chết thì ghi lịch sử đúng một lần rồi về map 101 và dừng treo.",
        ketQua: "dat",
        ghiChu:
          "Cấu hình OfflineAuto_MaxMinutes=1440 và OfflineAuto_SaveMinutes=5 trong mục [GameServer].",
      },
    ],
  },
  {
    id: "cung-ninja-danh-thuong-delay",
    loai: "loi",
    nhom: "Chiến đấu",
    tieuDe: "Cung và Ninja đánh thường bị delay, mất nhịp sau kỹ năng",
    trieuChung:
      "Đòn đánh thường của Cung và Ninja bị khựng hoặc mất nhịp, rõ nhất là sau khi dùng kỹ năng hoặc khí công hỗ trợ.",
    nguyenNhan:
      "Bộ lọc đánh thường dùng chung mốc toàn cục 1.000 ms và còn phụ thuộc thời điểm đánh kỹ năng. Gói đánh đến sớm làm dừng timer tự đánh trước khi qua kiểm tra thời gian. Nhịp xác nhận phía client của Ninja là 750 ms (hoặc 375 ms khi có trạng thái 801201) nhưng server vẫn chặn theo 1.000 ms.",
    trangThai: "da-xong",
    phienBanHienTai: "22.5.2.3",
    kenh: "Kênh 1 + Kênh 2",
    file: ["RxjhServer/Players.cs"],
    hoSo: "KT-20260726-03",
    bangChung:
      "Giải mã ngược binary xác nhận có đủ logic đánh thường. Cần theo dõi phản hồi thực chiến trong phiên đông người.",
    lichSu: [
      {
        version: "22.5.2.3",
        ngay: "2026-07-26",
        cu: "Nhịp đánh thường gắn với thời điểm dùng kỹ năng; server chặn cứng 1.000 ms cho mọi nghề; gói đến sớm làm dừng timer tự đánh.",
        moi: "Tách nhịp đánh thường khỏi thời điểm dùng kỹ năng. Đồng bộ nhịp server: Cung 1.000 ms, Ninja 750 ms, Ninja có trạng thái 801201 là 375 ms. Không dừng timer khi gói đến sớm.",
        ketQua: "dat",
      },
    ],
  },
  {
    id: "auto-attack-level-200",
    loai: "loi",
    nhom: "Chiến đấu",
    tieuDe: "Nhân vật level 200 gây KeyNotFoundException",
    trieuChung:
      "Nhân vật đạt level 200 làm server phát sinh lỗi KeyNotFoundException trong AutomaticAttackEvent.",
    nguyenNhan:
      "Code cũ đọc trực tiếp World.lever[Player_Level + 1]. Level 200 cần khóa 201 nhưng khóa này không tồn tại trong bảng.",
    trangThai: "da-xong",
    phienBanHienTai: "22.5.2.3",
    kenh: "Kênh 1 + Kênh 2",
    file: ["RxjhServer/Players.cs"],
    hoSo: "KT-20260726-01",
    lichSu: [
      {
        version: "22.5.2.3",
        ngay: "2026-07-26",
        cu: "Đọc trực tiếp World.lever[Player_Level + 1] nên level 200 ném KeyNotFoundException.",
        moi: "Tra bảng EXP bằng TryGetValue. Khi không có level kế tiếp thì mức EXP mất là 0 nhưng luồng chết/hồi sinh vẫn tiếp tục. Thêm kiểm tra an toàn cho trạng thái bảo vệ EXP và PublicDrugs.",
        ketQua: "dat",
      },
    ],
  },
  {
    id: "clvc-30-32-khong-rot",
    loai: "loi",
    nhom: "Vật phẩm & drop",
    tieuDe: "Ngọc CLVC 30, 31, 32 không rơi",
    trieuChung:
      "Các dòng CLVC 30–32 vẫn tồn tại trong bảng drop SQL nhưng không rơi được qua bất kỳ cơ chế nào.",
    nguyenNhan:
      "CLVC 30–32 dùng chung PID 800000061 với CLVC 33–35. Bộ lọc rare-drop mới chặn toàn bộ PID này khỏi bảng drop SQL cũ, trong khi vòng rare pool mới chỉ sinh CLVC 33–35. Kết quả là CLVC 30–32 kẹt giữa hai cơ chế.",
    trangThai: "da-xong",
    phienBanHienTai: "22.5.2.3",
    kenh: "Kênh 1 + Kênh 2",
    file: ["RxjhServer/RareDropPolicy.cs", "RxjhServer/NpcClass.cs"],
    hoSo: "KT-20260726-02",
    bangChung:
      "Bộ test drop 62/62 PASS, quét 1.000.000 giá trị quay cho từng nguồn DROP, DROP_GS và BOSS. Không sửa database và không tự đặt rate mới.",
    lichSu: [
      {
        version: "22.5.2.3",
        ngay: "2026-07-26",
        cu: "Rare pool chặn toàn bộ PID 800000061 nhưng chỉ sinh được CLVC 33–35, nên CLVC 30–32 không rơi đường nào.",
        moi: "Rare pool chỉ quản MAGIC0 700033, 700034, 700035. CLVC 30–32 (700030, 700031, 700032) quay lại cơ chế drop SQL cũ với FLD_PP và nguồn drop sẵn có.",
        ketQua: "dat",
      },
    ],
  },
  {
    id: "doi-gold-sang-cash",
    loai: "loi",
    nhom: "Kinh tế",
    tieuDe: "Lệnh đổi Gold sang Cash",
    trieuChung:
      "Lệnh cũ !doigoldsangcash nhận số lượng tùy ý nên không khóa được tỷ lệ, và nằm trong khối quyền GM nên người chơi thường không dùng được.",
    nguyenNhan:
      "Lệnh cũ đặt bên trong khối GMMode == 8 và lấy số lượng từ tham số thay vì khóa cứng tỷ lệ vận hành đã chốt.",
    trangThai: "da-xong",
    phienBanHienTai: "22.5.2.3",
    kenh: "Kênh 1 + Kênh 2",
    file: ["RxjhServer/Players.cs"],
    hoSo: "KT-20260726-04",
    bangChung:
      "Giải mã ngược binary xác nhận !doicash nằm trước khối GMMode == 8, có hướng dẫn trong !help, mức đổi 2.000.000 Gold/Cash và không còn chuỗi !doigoldsangcash.",
    lichSu: [
      {
        version: "22.5.2.3",
        ngay: "2026-07-26",
        cu: "!doigoldsangcash nhận số lượng tùy ý, không khóa tỷ lệ.",
        moi: "Khóa cứng tỷ lệ: đủ tiền thì trừ đúng 1.000.000.000 Gold và cộng đúng 500 Cash; không đủ thì từ chối giao dịch.",
        ketQua: "dat",
        ghiChu: "Bước 1, theo hồ sơ KT-20260726-03.",
      },
      {
        version: "22.5.2.3",
        ngay: "2026-07-26",
        cu: "Lệnh vẫn nằm trong khối GMMode == 8 nên người chơi thường không dùng được, và chỉ đổi cố định 1 tỷ Gold.",
        moi: "Đổi cú pháp thành !doicash <số Cash>, đưa ra ngoài khối quyền GM cho toàn server. Tỷ lệ 2.000.000 Gold = 1 Cash. Mỗi lần đổi 10–1.000 Cash, không giới hạn theo ngày. Yêu cầu cấp 100 và bắt buộc đóng kho, giao dịch, cửa hàng. Có ghi nhật ký.",
        ketQua: "dat",
        ghiChu:
          "Bước 2, theo hồ sơ KT-20260726-04. Không thay đổi lệnh !doicashsanggold trong khối GM.",
      },
    ],
  },
  {
    id: "ts-doi-chieu-bang-can-bang",
    loai: "kiem-tra",
    nhom: "Trùng Sinh",
    tieuDe: "Đối chiếu bảng cân bằng Trùng Sinh",
    trieuChung:
      "Kiểm tra hệ số EXP, sát thương, phòng thủ và điều kiện từng mốc có khớp bảng thiết kế không.",
    nguyenNhan: "Đối chiếu RebirthBalance.cs với bảng trong BAO_CAO_KY_THUAT_VA_CHECKLIST.md.",
    trangThai: "da-xong",
    phienBanHienTai: "22.5.2.15",
    kenh: "Kênh 1",
    file: ["RxjhServer/RebirthBalance.cs", "RxjhServer/PlayersBes.cs"],
    bangChung:
      "ATK 1+n×0,05 = 105→140%. DEF 1+n×0,04 = 104→132%. EXP 1−n×0,05 = 95→60%. ATK quái 1+n×0,04 = 104→132%. DEF quái 1+n×0,03 = 103→124%. Level 145→180, Gold 1+2n tỷ = 1/3/5/7/9/11/13/15 tỷ, Võ Huân 0/0/100k→350k, giới hạn level 145→180. Thăng thiên 4/5 ứng với Player_Job_level 9/10.",
    lichSu: [
      {
        version: "22.5.2.15",
        ngay: "2026-07-30",
        cu: "Chưa đối chiếu lại sau các thay đổi.",
        moi: "Khớp 100%, không lệch chỗ nào. Điểm Trùng Sinh cũ được cộng vào tổng trước rồi mới nhân phần trăm lên chỉ số hoàn chỉnh, đúng đặc tả. Mỗi hệ số chỉ nhân đúng một lần. Không còn sót lớp chia EXP cũ theo (TS+1).",
        ketQua: "dat",
      },
    ],
  },
];
