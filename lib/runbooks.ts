/**
 * Quy trình bắt buộc cho hai thao tác nguy hiểm nhất của hệ thống:
 * bảo trì hàng tuần và reset dữ liệu sau giai đoạn test.
 *
 * Nội dung các bước lấy từ đúng những gì công cụ trên VPS thực sự làm,
 * không viết theo trí nhớ:
 *   - C:\HKServer\Tools\ServerMaintenance.ps1      (nút BAO TRI SERVER)
 *   - C:\HKServer\Tools\Apply-PendingUpdates.ps1   (bước 52% của bảo trì)
 *   - C:\HKServer\Tools\Reset-HK-TestData.ps1      (nút MO TOOL RESET AN TOAN)
 *   - C:\HKServer\Tools\Reset-HK-TestData.sql      (52 lệnh DELETE)
 *   - HUONG_DAN_RESET_SERVER_SAU_TEST.md
 *
 * Trang web KHÔNG tự chạy hai thao tác này. Chúng cần quyền Administrator
 * ngay trên VPS và có nhiều lớp xác nhận riêng. Trang này là bảng quy trình
 * có tick tiến độ, để không bỏ sót bước nào và biết đang tới đâu.
 */

export type RunbookPhase = "truoc" | "trong" | "sau";

export type RunbookStep = {
  id: string;
  phase: RunbookPhase;
  title: string;
  /** Vì sao bước này tồn tại. Bỏ qua thì hỏng cái gì. */
  detail: string;
  /** Lệnh, đường dẫn hoặc nút bấm cụ thể. */
  target?: string;
  /** Bước bỏ qua là mất dữ liệu hoặc hỏng bản build. */
  critical?: boolean;
};

export type Runbook = {
  id: "bao-tri" | "reset-sau-test";
  title: string;
  summary: string;
  /** Nhập đúng chuỗi này mới mở khoá quy trình. Bỏ trống là không cần. */
  confirmCode?: string;
  tool: string;
  steps: RunbookStep[];
};

export const PHASE_LABEL: Record<RunbookPhase, string> = {
  truoc: "Trước khi chạy",
  trong: "Trong khi chạy",
  sau: "Sau khi chạy",
};

export const MAINTENANCE_RUNBOOK: Runbook = {
  id: "bao-tri",
  title: "Bảo trì server hàng tuần",
  summary:
    "Dừng an toàn cả hai kênh, sao lưu 5 database, áp các gói đang chờ, bảo trì SQL rồi mở lại. Toàn bộ người chơi sẽ bị ngắt kết nối trong thời gian này.",
  tool: "Desktop VPS → Trieuhoang.cmd → nút BAO TRI SERVER",
  steps: [
    {
      id: "bt-thong-bao",
      phase: "truoc",
      title: "Báo trước cho người chơi ít nhất 15 phút",
      detail:
        "Đăng tin trên Launcher để người chơi kịp về thành và thoát. Bảo trì ngắt kết nối tất cả, không có thông báo trong game.",
      target: "Trieuhoang.cmd → Quản lý tin tức Launcher",
    },
    {
      id: "bt-online",
      phase: "truoc",
      title: "Xác nhận số người online bằng 0",
      detail:
        "Nút bảo trì chỉ bật khi không còn ai online. Còn người online mà ép tắt thì có nguy cơ mất đồ trong túi và kho.",
      target: "Nút hiện chữ BAO TRI SERVER (CAN 0 ONLINE) khi chưa đạt",
      critical: true,
    },
    {
      id: "bt-hang-doi",
      phase: "truoc",
      title: "Soát hàng đợi PendingReset trước khi bấm",
      detail:
        "Bước 52% của bảo trì sẽ tự áp các gói trong C:\\HKServer\\Staging\\PendingReset. Một gói bị áp khi có đủ ba điều kiện: có pending-update.json, CHƯA có .applied.json, và autoApplyOnMaintenance = true. Gói chứa RxjhServer.exe cũ mà lọt qua là hạ cấp GameServer ngay lập tức.",
      target: "C:\\HKServer\\Staging\\PendingReset",
      critical: true,
    },
    {
      id: "bt-ver-truoc",
      phase: "truoc",
      title: "Chạy Check-GameBuild và ghi lại kết quả",
      detail:
        "Ghi số hiệu và SHA-256 của hai kênh trước khi bảo trì, để sau khi mở lại có cái mà đối chiếu. Bước 52% có thể áp gói ghi đè GameServer nên đây là mốc so sánh bắt buộc.",
      target: "powershell -File C:\\HKServer\\Tools\\Check-GameBuild.ps1",
      critical: true,
    },
    {
      id: "bt-chon-kenh",
      phase: "trong",
      title: "Bấm BAO TRI SERVER và chọn kênh mở lại",
      detail:
        "Hộp thoại hỏi mở lại Kênh 1, Kênh 2 hay cả hai. Chọn sai thì sau bảo trì kênh kia không tự bật.",
      target: "Trieuhoang.cmd → BAO TRI SERVER",
    },
    {
      id: "bt-luu-nhan-vat",
      phase: "trong",
      title: "Chờ bước 5% lưu toàn bộ nhân vật và kho đồ",
      detail:
        "Công cụ gọi Stop-GameSafely cho cả hai kênh. Đây là bước bảo vệ đồ của người chơi, không được tắt cửa sổ giữa chừng.",
      critical: true,
    },
    {
      id: "bt-tat-dich-vu",
      phase: "trong",
      title: "Chờ bước 25% tắt các dịch vụ nền",
      detail:
        "Tắt HKLauncherGateApi, HKAccountApi, WMSServer và loginServer.",
    },
    {
      id: "bt-backup",
      phase: "trong",
      title: "Chờ bước 40% sao lưu đủ 5 database",
      detail:
        "Không có backup thì mọi bước sau đều không quay lui được. Bước này phải chạy xong mới đi tiếp.",
      critical: true,
    },
    {
      id: "bt-pending",
      phase: "trong",
      title: "Đọc dòng PENDING trong nhật ký ở bước 52%",
      detail:
        "Nhật ký ghi rõ gói nào được áp và gói nào bị bỏ qua. Nếu thấy một gói bị áp ngoài dự tính thì dừng lại đối chiếu ngay, đừng để server mở lại.",
      critical: true,
    },
    {
      id: "bt-sql",
      phase: "trong",
      title: "Chờ bước 65% kiểm tra và cập nhật thống kê SQL",
      detail: "Bước này làm database chạy nhanh trở lại sau một tuần hoạt động.",
    },
    {
      id: "bt-log",
      phase: "trong",
      title: "Chờ bước 80% nén log cũ hơn 7 ngày",
      detail: "Log cũ được gom vào gói sao lưu của lần bảo trì này.",
    },
    {
      id: "bt-khoi-dong",
      phase: "trong",
      title: "Chờ bước 90–100% khởi động lại và kiểm tra sức khỏe",
      detail:
        "Công cụ chờ tối đa 120 giây để server báo sống. Quá thời gian mà chưa lên thì xem nhật ký, đừng bấm lại chồng lên.",
    },
    {
      id: "bt-ver-sau",
      phase: "sau",
      title: "Chạy lại Check-GameBuild sau khi server mở lại",
      detail:
        "Kết quả phải giống hệt lúc trước bảo trì. Khác đi nghĩa là một gói PendingReset đã ghi đè GameServer — phải khôi phục ngay từ thư mục backup của lần bảo trì này.",
      target: "powershell -File C:\\HKServer\\Tools\\Check-GameBuild.ps1",
      critical: true,
    },
    {
      id: "bt-vao-game",
      phase: "sau",
      title: "Đăng nhập thử một nhân vật",
      detail:
        "Kiểm tra vào được map, mở túi đồ và kho, đánh một con quái. Xong mới coi là bảo trì đạt.",
    },
    {
      id: "bt-go-thong-bao",
      phase: "sau",
      title: "Gỡ thông báo bảo trì trên Launcher",
      detail: "Để sót thông báo thì người chơi tưởng server vẫn đang đóng.",
    },
  ],
};

export const RESET_RUNBOOK: Runbook = {
  id: "reset-sau-test",
  title: "Reset dữ liệu sau giai đoạn test",
  summary:
    "Xóa toàn bộ tài khoản và nhân vật trừ tài khoản admin, dọn log và lịch sử test. Thao tác này KHÔNG hoàn tác được ngoài việc khôi phục từ backup.",
  confirmCode: "Abc@admin123",
  tool: "Desktop VPS → Trieuhoang.cmd → nút MO TOOL RESET AN TOAN",
  steps: [
    {
      id: "rs-kiem-tra-build",
      phase: "truoc",
      title: "Chạy Check-GameBuild và bắt buộc phải đạt",
      detail:
        "Script đối chiếu phiên bản hai kênh với bản đã duyệt. Mã thoát 0 là được phép làm tiếp; 1 là có kênh lệch bản, 2 là chưa ghi nhận bản duyệt. Khác 0 thì DỪNG, không reset.",
      target: "powershell -File C:\\HKServer\\Tools\\Check-GameBuild.ps1",
      critical: true,
    },
    {
      id: "rs-dong-bo-build",
      phase: "truoc",
      title: "Đồng bộ binary kênh Production lên đúng bản đã duyệt",
      detail:
        "Chỉ làm khi bước trên báo lệch. Reset KHÔNG đổi binary — nó khởi động lại đúng file đang nằm trên đĩa, nên kênh Production còn bản cũ thì sau reset người chơi vẫn chạy bản cũ đó. Đồng bộ xong phải chạy lại Check-GameBuild cho ra mã thoát 0.",
      target:
        "Ghi nhận bản chuẩn: Check-GameBuild.ps1 -SetApproved <số kênh>",
      critical: true,
    },
    {
      id: "rs-thoat-het",
      phase: "truoc",
      title: "Xác nhận toàn bộ người chơi đã thoát",
      detail:
        "Công cụ có ô đánh dấu xác nhận riêng cho việc này. Còn người trong game thì dữ liệu đang mở có thể ghi đè lên kết quả reset.",
      critical: true,
    },
    {
      id: "rs-mot-admin",
      phase: "truoc",
      title: "Kiểm tra database có đúng một tài khoản admin",
      detail:
        "Công cụ tự kiểm tra và dừng nếu số lượng khác 1. Không phải 1 thì phải xử lý trước, đừng ép chạy.",
      target: "v22Account_HKgiangho.dbo.TBL_ACCOUNT",
      critical: true,
    },
    {
      id: "rs-ghi-so-lieu",
      phase: "truoc",
      title: "Ghi lại số tài khoản và nhân vật sẽ bị xóa",
      detail:
        "Màn hình công cụ hiện sẵn các con số này. Chụp lại để sau reset có cái đối chiếu.",
    },
    {
      id: "rs-mo-cong-cu",
      phase: "trong",
      title: "Mở module Reset an toàn",
      detail:
        "Bấm nút chỉ mở module, chưa xóa gì. Module chạy bằng quyền Administrator ngay trên VPS, không gọi được từ Internet hay Launcher.",
      target: "Trieuhoang.cmd → MO TOOL RESET AN TOAN",
    },
    {
      id: "rs-go-chuoi",
      phase: "trong",
      title: "Nhập chính xác chuỗi RESET SAU TEST",
      detail: "Sai một ký tự là công cụ không cho đi tiếp.",
    },
    {
      id: "rs-ma-ngau-nhien",
      phase: "trong",
      title: "Nhập lại mã ngẫu nhiên 6 số",
      detail:
        "Công cụ sinh mã tại chỗ để tránh bấm nhầm theo thói quen.",
    },
    {
      id: "rs-xac-nhan-cuoi",
      phase: "trong",
      title: "Xác nhận hộp thoại cuối cùng",
      detail: "Sau bước này công cụ bắt đầu dừng server và sao lưu.",
      critical: true,
    },
    {
      id: "rs-backup",
      phase: "trong",
      title: "Chờ sao lưu 5 database và RESTORE VERIFYONLY đạt",
      detail:
        "Công cụ chỉ chạy phần xóa sau khi backup được kiểm tra đạt. Backup nằm ở C:\\HKServer\\ResetBackups\\<thời điểm>\\ kèm file SHA256_BACKUP.txt.",
      critical: true,
    },
    {
      id: "rs-transaction",
      phase: "trong",
      title: "Chờ transaction xóa và kiểm tra sau reset",
      detail:
        "Phần xóa nằm trong một transaction SQL. Kiểm tra sau reset không đạt thì công cụ dừng và KHÔNG mở server, phải khôi phục từ backup vừa tạo.",
      critical: true,
    },
    {
      id: "rs-con-admin",
      phase: "sau",
      title: "Kiểm tra chỉ còn lại tài khoản admin",
      detail:
        "Đối chiếu với số liệu đã ghi ở bước chuẩn bị và file AFTER.txt trong thư mục reset.",
    },
    {
      id: "rs-giftcode",
      phase: "sau",
      title: "Cấu hình lại GiftCode",
      detail:
        "Reset xóa sạch bảng GIFTCODE. Không dựng lại thì mọi mã quà đã phát đều mất tác dụng; dựng lại ẩu thì có nguy cơ phát trùng mã cũ.",
      critical: true,
    },
    {
      id: "rs-publicdb",
      phase: "sau",
      title: "Kiểm tra PublicDB còn nguyên",
      detail:
        "Reset chỉ đụng 3 database v22Account, v22Game và v22Bbg. Toàn bộ item, rate, drop, NPC, map nằm ở v22PublicDB và phải còn nguyên. Mở thử Bách Bảo Các và một vài vật phẩm để xác nhận.",
    },
    {
      id: "rs-ver-sau",
      phase: "sau",
      title: "Đối chiếu phiên bản binary sau khi server mở lại",
      detail:
        "Xác nhận đúng bản đã đồng bộ ở bước đầu, không phải bản cũ.",
      critical: true,
    },
    {
      id: "rs-vao-game",
      phase: "sau",
      title: "Đăng nhập bằng admin và kiểm tra trong game",
      detail:
        "Nhân vật, túi đồ, kho và pet của admin phải còn đủ. Tạo thử một tài khoản mới để chắc chắn hệ thống đăng ký vẫn chạy.",
    },
    {
      id: "rs-luu-duong-dan",
      phase: "sau",
      title: "Lưu lại đường dẫn thư mục backup của lần reset",
      detail:
        "Ghi vào hồ sơ vận hành. Đây là đường lui duy nhất nếu vài ngày sau phát hiện mất dữ liệu.",
    },
  ],
};

export const RUNBOOKS: Runbook[] = [MAINTENANCE_RUNBOOK, RESET_RUNBOOK];

export function getRunbook(id: Runbook["id"]): Runbook {
  return RUNBOOKS.find((item) => item.id === id) ?? RUNBOOKS[0];
}
