/**
 * Nguồn duy nhất định nghĩa các trang của Dashboard.
 * Sidebar, tiêu đề trang và router đều đọc từ đây, không khai báo lặp ở nơi khác.
 */
export type RouteId =
  | "overview"
  | "shop"
  | "players"
  | "ranking"
  | "enhancement"
  | "game-logs"
  | "error-logs"
  | "bai-quai"
  | "tran-do-hiem"
  | "su-kien-drop"
  | "maps"
  | "game-commands"
  | "khi-cong"
  | "the-luc-chien"
  | "tools"
  | "accounts"
  | "maintenance"
  | "reset-after-test";

export type RouteDef = {
  id: RouteId;
  path: string;
  label: string;
  /** Nhãn phụ hiện dưới tiêu đề trang. */
  mota: string;
  /** Nhóm trong sidebar. */
  nhom: "dieu-hanh";
  /** Chỉ trang Tổng quan mới hiện dải chào mừng và 4 ô chỉ số. */
  hienTongQuan?: boolean;
  /** Trang có ô tìm kiếm trên thanh tiêu đề. */
  coTimKiem?: boolean;
};

export const ROUTES: RouteDef[] = [
  {
    id: "overview",
    path: "/",
    label: "Tổng quan",
    mota: "Theo dõi GameServer và vận hành HK Ngạo Thiên từ một nơi duy nhất.",
    nhom: "dieu-hanh",
    hienTongQuan: true,
  },
  {
    id: "shop",
    path: "/bach-bao-cac",
    label: "Bách Bảo Các",
    mota: "Đọc trực tiếp ITEMSELL, tìm theo PID hoặc tên và tải lại vào GameServer.",
    nhom: "dieu-hanh",
  },
  {
    id: "players",
    path: "/nguoi-choi",
    label: "Người chơi",
    mota: "Tra cứu nhân vật, túi đồ và hỗ trợ trực tiếp trong game.",
    nhom: "dieu-hanh",
  },
  {
    id: "ranking",
    path: "/bang-xep-hang",
    label: "Bảng xếp hạng",
    mota: "Xếp hạng theo cấp độ, cường hóa và thành tựu.",
    nhom: "dieu-hanh",
    coTimKiem: true,
  },
  {
    id: "enhancement",
    path: "/cuong-hoa",
    label: "Cường hóa",
    mota: "Nhật ký cường hóa và hợp thành theo thời gian thực.",
    nhom: "dieu-hanh",
    coTimKiem: true,
  },
  {
    id: "game-logs",
    path: "/nhat-ky",
    label: "Nhật ký",
    mota: "Giao dịch, mua bán NPC, mở hộp, dùng vật phẩm, đăng nhập — lọc theo loại và nhân vật.",
    nhom: "dieu-hanh",
  },
  {
    id: "error-logs",
    path: "/nhat-ky-loi",
    label: "Nhật ký lỗi",
    mota: "Lỗi GameServer theo ngày, gom theo kiểu để thấy lỗi nào đang lặp nhiều nhất.",
    nhom: "dieu-hanh",
  },
  {
    id: "bai-quai",
    path: "/bai-quai",
    label: "Bãi quái đặc biệt",
    mota: "Mở một vùng cày có hệ số rơi riêng và túi hạn mức riêng, chia đều theo múi giờ.",
    nhom: "dieu-hanh",
  },
  {
    id: "tran-do-hiem",
    path: "/tran-do-hiem",
    label: "Trần đồ hiếm",
    mota: "Số món hiếm đã rơi so với trần từng ngày, tách riêng bảng Drop boss.",
    nhom: "dieu-hanh",
  },
  {
    id: "su-kien-drop",
    path: "/su-kien-drop",
    label: "Sự kiện & Tỉ lệ Drop",
    mota: "Tỉ lệ rơi đồ quái train, bật/tắt & đổi giờ thả Boss, quản lý phần thưởng toàn bộ sự kiện.",
    nhom: "dieu-hanh",
  },
  {
    id: "maps",
    path: "/quan-ly-map",
    label: "Bản Đồ & Map Vé / VIP",
    mota: "Quản lý bản đồ VIP, Tu Luyện Chi Địa, Đảo Pi Pi, Làng Lãng Quên, Thế Ngoại Võ Lâm, phó bản & công tắc Bật/Tắt map real-time.",
    nhom: "dieu-hanh",
    coTimKiem: true,
  },
  {
    id: "game-commands",
    path: "/quan-ly-lenh",
    label: "Lệnh Trong Game",
    mota: "Toàn bộ danh sách lệnh chat (! và @), phân loại chi tiết và công tắc Bật/Tắt lệnh real-time.",
    nhom: "dieu-hanh",
    coTimKiem: true,
  },
  {
    id: "khi-cong",
    path: "/khi-cong",
    label: "Khí công",
    mota: "Tra cứu khí công 13 nghề: tên, icon, cách hoạt động và trạng thái công thức (đã sửa/lỗi/chết).",
    nhom: "dieu-hanh",
  },
  {
    id: "the-luc-chien",
    path: "/the-luc-chien",
    label: "Thế Lực Chiến",
    mota: "Điều khiển từng bước, xem thành viên kèm IP, mạng PK, AFK bị đá và đặt lịch.",
    nhom: "dieu-hanh",
  },
  {
    id: "tools",
    path: "/cong-cu",
    label: "Công cụ vận hành",
    mota: "Mọi thao tác đều qua quyền GM8, có xác nhận và ghi nhật ký.",
    nhom: "dieu-hanh",
  },
  {
    id: "accounts",
    path: "/tai-khoan-gm",
    label: "Tài khoản GM",
    mota: "Quản lý tài khoản quản trị và phân quyền.",
    nhom: "dieu-hanh",
  },
  {
    id: "maintenance",
    path: "/bao-tri",
    label: "Bảo trì hàng tuần",
    mota: "Quy trình dừng an toàn, sao lưu, áp gói chờ rồi mở lại server.",
    nhom: "dieu-hanh",
  },
  {
    id: "reset-after-test",
    path: "/reset-sau-test",
    label: "Reset sau test",
    mota: "Xóa dữ liệu test, chỉ giữ tài khoản admin. Cần mã xác nhận.",
    nhom: "dieu-hanh",
  },
];

export const DEFAULT_ROUTE: RouteId = "overview";

export function getRoute(id: RouteId): RouteDef {
  return ROUTES.find((route) => route.id === id) ?? ROUTES[0];
}

export function routeIdFromPath(pathname: string): RouteId {
  const clean = pathname.replace(/\/+$/, "") || "/";
  return ROUTES.find((route) => route.path === clean)?.id ?? DEFAULT_ROUTE;
}
