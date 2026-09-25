"use client";

import {
  Activity,
  BarChart3,
  Bell,
  Boxes,
  ChevronLeft,
  ChevronRight,
  CircleGauge,
  ClipboardList,
  CloudCog,
  Database,
  Gamepad2,
  Gift,
  History,
  Layers,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Menu,
  PackageOpen,
  RefreshCw,
  Search,
  Server,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Crown,
  Flame,
  MapPin,
  Compass,
  Sparkles,
  Store,
  Swords,
  Terminal,
  UserCog,
  Wrench,
  ShieldAlert,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  DashboardPayload,
  ItemEvent,
  RankingEntry,
  RankingType,
} from "@/lib/types";
import { FIX_LOG } from "@/lib/fix-log";
import { ROUTES, type RouteId } from "@/lib/routes";
import Modal from "./Modal";
import { RouterProvider, useRoute } from "./Router";
import GmConsole from "./GmConsole";
import GameLogViewer from "./GameLogViewer";
import ErrorLogViewer from "./ErrorLogViewer";
import BaiQuaiTool from "./BaiQuaiTool";
import BachBaoTabs from "./BachBaoTabs";
import RareDropQuotaTool from "./RareDropQuotaTool";
import DropAndEventsTool from "./DropAndEventsTool";
import { MapsManagementTool } from "./MapsManagementTool";
import GameCommandsTool from "./GameCommandsTool";
import KhiCongTool from "./KhiCongTool";
import PillsManagementTool from "./PillsManagementTool";
import TheLucChienTool from "./TheLucChienTool";
import GlobalGmAccess from "./GlobalGmAccess";
import GmAccountManager from "./GmAccountManager";
import AdvancedOperations from "./AdvancedOperations";
import OperationsSuite from "./OperationsSuite";
import RunbookTool from "./RunbookTool";
import { MAINTENANCE_RUNBOOK, RESET_RUNBOOK } from "@/lib/runbooks";

type View = "overview" | "shop" | "players" | "ranking" | "enhancement" | "game-logs" | "error-logs" | "bai-quai" | "tools" | "accounts";
type EventFilter = "all" | "enhance" | "combine" | "success" | "failure";

const JOB_NAMES: Record<number, string> = {
  1: "Đao",
  2: "Kiếm",
  3: "Thương",
  4: "Cung",
  5: "Đại phu",
  6: "Ninja",
  7: "Cầm sư",
  8: "Hàn Bảo Quân",
  9: "Đàm Hoa Liên",
  10: "Quyền sư",
  11: "Mai Liễu Chân",
  12: "Tử Hào",
  13: "Thần nữ",
};

const RANKING_LABELS: Record<RankingType, string> = {
  level: "Cấp độ",
  wx: "Võ huân",
  pvp: "PVP",
  online: "Thời gian online",
};

/**
 * Tên cột giá trị. Khác nhãn tab ở đúng hạng "Cấp độ": cột đó từng ghi "Chuyển chức N" nhưng
 * gần hết nhóm đầu bảng đã kịch chuyển chức 9 nên con số không còn nói lên gì. Đổi sang số lần
 * Trùng Sinh — thứ đang thật sự phân hạng, vì trùng sinh đặt lại cấp về 100.
 */
const RANKING_COLUMN_LABELS: Record<RankingType, string> = {
  ...RANKING_LABELS,
  level: "Trùng sinh",
};

/** Icon cho từng trang; danh sách trang lấy từ lib/routes.ts. */
const NAV_ICONS: Record<RouteId, typeof LayoutDashboard> = {
  overview: LayoutDashboard,
  shop: ShoppingBag,
  players: Users,
  ranking: BarChart3,
  enhancement: Sparkles,
  "game-logs": ClipboardList,
  "error-logs": ShieldAlert,
  "bai-quai": MapPin,
  "tran-do-hiem": Crown,
  "su-kien-drop": Flame,
  maps: Compass,
  "game-commands": Terminal,
  "khi-cong": Sparkles,
  pills: Layers,
  "the-luc-chien": Swords,
  tools: Settings2,
  accounts: UserCog,
  maintenance: Wrench,
  "reset-after-test": ShieldAlert,
};

function formatNumber(value: string | number): string {
  try {
    return BigInt(value).toLocaleString("vi-VN");
  } catch {
    return String(value);
  }
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatShortTime(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

function factionName(faction: number): string {
  if (faction === 1) return "Chính phái";
  if (faction === 2) return "Tà phái";
  return "Trung lập";
}

function jobName(job: number): string {
  return JOB_NAMES[job] ?? `Hệ phái ${job}`;
}

function eventTypeName(eventType: string): string {
  const normalized = eventType.toUpperCase();
  if (normalized.includes("CUONG") || normalized.includes("ENHANCE")) {
    return "Cường hóa";
  }
  if (normalized.includes("HOP") || normalized.includes("COMBINE")) {
    return "Hợp thành";
  }
  if (normalized.includes("JEWEL")) return "Gia công";
  if (normalized.includes("CLOAK")) return "Áo choàng";
  return eventType.replaceAll("_", " ");
}

function isCombine(event: ItemEvent): boolean {
  const value = event.eventType.toUpperCase();
  return value.includes("HOP") || value.includes("COMBINE");
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Users;
  title: string;
  description: string;
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={24} />
      </div>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}

function LoadingTable() {
  return (
    <div className="loading-table" aria-label="Đang tải dữ liệu">
      {Array.from({ length: 7 }).map((_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}

function StatusPill({
  online,
  children,
}: {
  online: boolean;
  children: React.ReactNode;
}) {
  return (
    <span className={`status-pill ${online ? "online" : "offline"}`}>
      <i />
      {children}
    </span>
  );
}

function RankingTable({
  entries,
  rankingType,
}: {
  entries: RankingEntry[];
  rankingType: RankingType;
}) {
  if (!entries.length) {
    return (
      <EmptyState
        icon={BarChart3}
        title="Chưa có dữ liệu xếp hạng"
        description="Dữ liệu sẽ tự xuất hiện khi GameServer cập nhật."
      />
    );
  }

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th className="align-center">Hạng</th>
            <th>Nhân vật</th>
            <th>Môn phái</th>
            <th>Thế lực</th>
            <th className="align-center">Cấp</th>
            <th>Bang hội</th>
            <th className="align-right">{RANKING_COLUMN_LABELS[rankingType]}</th>
            <th className="align-center">Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={`${rankingType}-${entry.characterName}`}>
              <td className="align-center">
                <span className={`rank-number rank-${entry.rank}`}>
                  {entry.rank}
                </span>
              </td>
              <td>
                <strong className="primary-cell">{entry.characterName}</strong>
              </td>
              <td>{jobName(entry.job)}</td>
              <td>
                <span className={`faction faction-${entry.faction}`}>
                  {factionName(entry.faction)}
                </span>
              </td>
              <td className="align-center">
                <span className="level-badge">{entry.level}</span>
              </td>
              <td className="secondary-cell">{entry.guildName || "—"}</td>
              <td className="align-right value-cell">
                {rankingType === "level"
                  ? `Trùng sinh ${entry.rebirth ?? 0}`
                  : formatNumber(entry.achievement)}
              </td>
              <td className="align-center">
                <StatusPill online={entry.online}>
                  {entry.online ? "Online" : "Offline"}
                </StatusPill>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EventsTable({ events }: { events: ItemEvent[] }) {
  if (!events.length) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Không có hoạt động phù hợp"
        description="Thử đổi bộ lọc hoặc chờ hoạt động mới từ GameServer."
      />
    );
  }

  return (
    <div className="table-scroll">
      <table className="data-table event-table">
        <thead>
          <tr>
            <th>Thời gian</th>
            <th className="align-center">Kênh</th>
            <th>Nhân vật</th>
            <th>Thao tác</th>
            <th>Trang bị</th>
            <th>Ngọc / Bùa</th>
            <th className="align-center">Thay đổi</th>
            <th className="align-center">Kết quả</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.eventId}>
              <td className="secondary-cell">{formatTime(event.createdAt)}</td>
              <td className="align-center">
                <span className="channel-badge">K{event.channelId}</span>
              </td>
              <td>
                <strong className="primary-cell">{event.characterName}</strong>
              </td>
              <td>{eventTypeName(event.eventType)}</td>
              <td>
                <strong className="item-cell">{event.itemName || "—"}</strong>
                {event.attributeText ? <small>{event.attributeText}</small> : null}
              </td>
              <td className="secondary-cell">{event.materialName || "—"}</td>
              <td className="align-center value-cell">
                +{event.beforeLevel} <span className="arrow">→</span> +
                {event.afterLevel}
              </td>
              <td className="align-center">
                <span
                  className={`result-badge ${
                    event.success ? "success" : "failure"
                  }`}
                >
                  {event.success ? "Thành công" : "Thất bại"}
                </span>
                {!event.success && event.failureEffect ? (
                  <small className="failure-effect">{event.failureEffect}</small>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Overview({
  data,
  onNavigate,
}: {
  data: DashboardPayload;
  onNavigate: (view: View) => void;
}) {
  const channel1Online = data.gameChannels.activeChannels.includes(1);
  const channel2Online = data.gameChannels.activeChannels.includes(2);
  const systemOnline =
    data.serverStatus.online && channel1Online && channel2Online && data.launcherGateOnline;
  const services = [
    {
      name: "GameServer Kênh 1",
      detail: channel1Online
        ? "Đang hoạt động · GM API sẵn sàng"
        : "Chưa kết nối GM API",
      online: channel1Online,
      icon: Gamepad2,
    },
    {
      name: "GameServer Kênh 2",
      detail: channel2Online
        ? "Đang hoạt động · GM API sẵn sàng"
        : "Chưa kết nối GM API",
      online: channel2Online,
      icon: Swords,
    },
    {
      name: "LoginServer",
      detail: data.serverStatus.loginOnline ? "Xác thực bình thường" : "Đang dừng",
      online: data.serverStatus.loginOnline,
      icon: LockKeyhole,
    },
    {
      name: "Launcher Gate",
      detail: data.launcherGateOnline ? "API sẵn sàng" : "Không phản hồi",
      online: data.launcherGateOnline,
      icon: CloudCog,
    },
  ];

  return (
    <div className="overview-grid">
      <section className="glass-panel server-health-panel">
        <div className="panel-title-row">
          <div>
            <span className="section-kicker">SỨC KHỎE HỆ THỐNG</span>
            <h2>Dịch vụ đang vận hành</h2>
          </div>
          <StatusPill online={systemOnline}>
            {systemOnline ? "Hai kênh ổn định" : "Cần kiểm tra"}
          </StatusPill>
        </div>
        <div className="service-list">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <article key={service.name} className="service-row">
                <span className="service-icon">
                  <Icon size={20} />
                </span>
                <div>
                  <strong>{service.name}</strong>
                  <small>{service.detail}</small>
                </div>
                <StatusPill online={service.online}>
                  {service.online ? "Online" : "Offline"}
                </StatusPill>
              </article>
            );
          })}
        </div>
      </section>

      <section className="glass-panel quick-actions-panel">
        <div className="panel-title-row">
          <div>
            <span className="section-kicker">TRUY CẬP NHANH</span>
            <h2>Công việc thường dùng</h2>
          </div>
        </div>
        <div className="quick-actions">
          <button type="button" onClick={() => onNavigate("players")}>
            <Users size={21} />
            <span>
              <strong>Quản lý người chơi</strong>
              <small>Xem nhân vật và hỗ trợ GM</small>
            </span>
            <ChevronRight size={18} />
          </button>
          <button type="button" onClick={() => onNavigate("enhancement")}>
            <Sparkles size={21} />
            <span>
              <strong>Nhật ký cường hóa</strong>
              <small>Kiểm tra 100 hoạt động mới nhất</small>
            </span>
            <ChevronRight size={18} />
          </button>
          <button type="button" onClick={() => onNavigate("tools")}>
            <Settings2 size={21} />
            <span>
              <strong>Trung tâm công cụ</strong>
              <small>Voucher, server, shop và rate</small>
            </span>
            <ChevronRight size={18} />
          </button>
        </div>
      </section>

      <section className="glass-panel recent-panel">
        <div className="panel-title-row">
          <div>
            <span className="section-kicker">HOẠT ĐỘNG GẦN NHẤT</span>
            <h2>Cường hóa vừa diễn ra</h2>
          </div>
          <button
            className="text-button"
            type="button"
            onClick={() => onNavigate("enhancement")}
          >
            Xem tất cả <ChevronRight size={16} />
          </button>
        </div>
        <div className="activity-feed">
          {data.events.slice(0, 6).map((event) => (
            <article key={event.eventId}>
              <span className={`event-dot ${event.success ? "success" : "failure"}`}>
                {event.success ? <Zap size={15} /> : <X size={15} />}
              </span>
              <div>
                <strong>
                  {event.characterName} · {event.itemName}
                </strong>
                <small>
                  Kênh {event.channelId} · +{event.beforeLevel} → +
                  {event.afterLevel}
                  {!event.success && event.failureEffect
                    ? ` · ${event.failureEffect}`
                    : ""}
                </small>
              </div>
              <time>{formatShortTime(event.createdAt)}</time>
            </article>
          ))}
        </div>
      </section>

      <section className="glass-panel security-panel">
        <div className="security-mark">
          <ShieldCheck size={28} />
        </div>
        <div>
          <span className="section-kicker">BẢO VỆ QUẢN TRỊ</span>
          <h2>Kết nối an toàn</h2>
          <p>
            Trình duyệt không kết nối SQL hay VPS trực tiếp. Mọi thao tác GM đều
            qua API giới hạn lệnh, xác thực riêng và nhật ký phía GameServer.
          </p>
          <div className="security-points">
            <span>
              <ShieldCheck size={15} /> Chặn truy cập ẩn danh
            </span>
            <span>
              <LockKeyhole size={15} /> Cookie chỉ phía máy chủ
            </span>
            <span>
              <Activity size={15} /> Theo dõi thao tác
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

function ToolCenter({ onNavigate }: { onNavigate: (view: View) => void }) {
  const [activeTool, setActiveTool] = useState<
    "advanced" | "launcher" | "voucher" | "npc-shop" | "event" | "fixlog" | "hopqua29" | null
  >(null);
  const [activeOperationsModule, setActiveOperationsModule] = useState<
    "launcher" | "voucher" | "npc-shop" | "event" | "fixlog" | "hopqua29"
  >("launcher");

  // Công cụ mở trong hộp thoại nổi nên không cần cuộn trang tới panel nữa.
  const openOperationsModule = (
    module: "launcher" | "voucher" | "npc-shop" | "event" | "fixlog" | "hopqua29",
  ) => {
    setActiveOperationsModule(module);
    setActiveTool(module);
  };

  const openAdvancedOperations = () => {
    setActiveTool("advanced");
  };

  const tools = [
    {
      id: "players",
      category: "NHÂN VẬT",
      title: "Hỗ trợ nhân vật",
      description: "Xem túi đồ, đổi Char/Chính-Tà/Nam-Nữ, chỉnh chỉ số, tạo và xóa vật phẩm.",
      icon: Users,
      status: "Sẵn sàng Kênh 1 + 2",
      tone: "ready",
      action: () => onNavigate("players"),
    },
    {
      id: "shop",
      category: "CỬA HÀNG",
      title: "Bách Bảo Các",
      description: "Đọc trực tiếp ITEMSELL, tìm theo PID/tên, xem giá và tải lại vào GameServer.",
      icon: ShoppingBag,
      status: "Ưu tiên · Sẵn sàng",
      tone: "ready",
      action: () => onNavigate("shop"),
    },
    {
      id: "launcher",
      category: "NỘI DUNG",
      title: "Tin tức Launcher",
      description: "Soạn, xem trước, hẹn giờ và phát hành nội dung Launcher.",
      icon: Bell,
      status: "Sẵn sàng",
      tone: "ready",
      action: () => openOperationsModule("launcher"),
    },
    {
      id: "voucher",
      category: "QUÀ TẶNG",
      title: "Voucher & quà tặng",
      description: "Tạo đợt giftcode, định nghĩa quà và theo dõi lượt nhận.",
      icon: Gift,
      status: "Sẵn sàng",
      tone: "ready",
      action: () => openOperationsModule("voucher"),
    },
    {
      id: "npc-shop",
      category: "SHOP NPC",
      title: "Shop NPC theo map",
      description: "Kiểm tra từng shop NPC, xem chỉ số, cập nhật, thêm hoặc gỡ món đồ.",
      icon: Store,
      status: "Sẵn sàng",
      tone: "ready",
      action: () => openOperationsModule("npc-shop"),
    },
    {
      id: "event",
      category: "TEMPLATE",
      title: "Trung tâm Event",
      description: "Lưu mẫu, nhân bản và chuẩn bị lịch, map, quái, Boss, phần thưởng cùng thông báo Event.",
      icon: Swords,
      status: "1 template đã lưu",
      tone: "ready",
      action: () => openOperationsModule("event"),
    },
    {
      id: "hopqua29",
      category: "EVENT 2/9",
      title: "Hộp Quà 2/9",
      description: "Cấu hình box mặc định (luôn ra) và các box tỉ lệ (quay số theo trọng số) cho Hộp Quà 2/9 ở Kênh 2.",
      icon: PackageOpen,
      status: "Sẵn sàng · Kênh 2",
      tone: "ready",
      action: () => openOperationsModule("hopqua29"),
    },
    {
      id: "fixlog",
      category: "NHẬT KÝ",
      title: "Nhật ký sửa lỗi",
      description: "Theo dõi từng nhóm lỗi đã xử lý, xem cũ là gì và mới là gì qua từng bản vá.",
      icon: ClipboardList,
      status: `${FIX_LOG.filter((entry) => entry.trangThai === "da-xong").length}/${FIX_LOG.length} đã xong`,
      tone: "ready",
      action: () => openOperationsModule("fixlog"),
    },
    {
      id: "advanced",
      category: "QUẢN TRỊ",
      title: "Vận hành nâng cao",
      description: "Cấp quyền vào Kênh 2, VIP Name, Pill ID, hồ sơ nhân vật offline và lịch sử thao tác quản trị.",
      icon: ShieldCheck,
      status: "Công cụ 12–15",
      tone: "ready",
      action: openAdvancedOperations,
    },
    {
      id: "server",
      category: "HỆ THỐNG",
      title: "Điều khiển máy chủ",
      description: "Mở, dừng an toàn và bảo trì riêng từng kênh.",
      icon: Server,
      status: "Chờ Gateway VPS",
      tone: "building",
    },
    {
      id: "rates",
      category: "CẤU HÌNH",
      title: "Rate & Drop",
      description: "Xem cấu hình hiện tại, duyệt thay đổi và hoàn tác.",
      icon: CircleGauge,
      status: "Chờ Gateway VPS",
      tone: "building",
    },
  ];

  const toolChecklist = [
    ["Kết nối quyền Admin GM mode 8 và danh sách nhân vật online", "done"],
    ["Xem hồ sơ nhân vật, trang bị, túi đồ và các kho", "done"],
    ["Cập nhật Level, Gold, Cash, Cash X, Coin, Donate, ATK, DEF, HP, MP, Võ huân", "done"],
    ["Tạo item đủ nhóm thuộc tính và gửi cá nhân/Chính/Tà/toàn bộ hai kênh", "done"],
    ["Chuyển Char, Chính/Tà, Nam/Nữ; reset và hoàn khí công", "done"],
    ["Xóa đúng vật phẩm theo kho + slot + PID, lưu log và relog", "done"],
    ["Kick nhân vật và khóa tài khoản có xác nhận", "done"],
    ["Bách Bảo Các: danh sách thật, thumbnail, tìm kiếm và reload GameServer", "done"],
    ["Bách Bảo Các: thêm/sửa/xóa mặt hàng và lưu lịch sử thay đổi", "done"],
    ["Túi Trang Bị Phụ, túi Thần và túi Nhiệm Vụ riêng", "done"],
    ["Sửa trực tiếp thuộc tính của món đồ đang có · Kênh 1", "done"],
    ["PET: gọi về, triệu hồi, kho linh thú và túi thú nuôi · Kênh 1", "done"],
    ["VIP Name: thiết lập, xem danh sách và xóa", "done"],
    ["Danh sách Pill ID và công cụ kiểm tra Pill", "done"],
    ["Mở nhân vật offline, khóa/mở khóa tài khoản và lịch sử thao tác", "done"],
  ] as const;

  const phaseTwoChecklist = [
    ["Hỗ trợ nhân vật: hoàn thiện 15/15 chức năng và nhật ký vận hành", "done"],
    ["Bách Bảo Các: danh sách thật, thêm/sửa/xóa, reload và lịch sử", "done"],
    ["Tin tức Launcher: tạo/sửa/xóa bản nháp và xem trước nội dung", "done"],
    ["Tin tức Launcher: phát hành, hẹn giờ, ghim bài và lưu lịch sử phiên bản", "done"],
    ["Voucher: tạo đợt phát hành và quản lý danh sách mã", "done"],
    ["Voucher: định nghĩa nhóm quà theo định dạng GameServer", "done"],
    ["Voucher: tra cứu lượt nhận, tạm dừng và sao chép mã còn lại", "done"],
    ["Shop NPC: đã xác định Tool Shop NPC cũ và nguồn TBL_XWWL_SELL", "done"],
    ["Shop NPC: lọc theo map, NPC/NID, vị trí ô và PID vật phẩm", "done"],
    ["Shop NPC: xem đầy đủ tên, giá, Magic 0-4, Võ huân và Coin", "done"],
    ["Shop NPC: thêm mới, cập nhật hoặc gỡ món với xác nhận", "done"],
    ["Shop NPC: tải lại dữ liệu riêng từng kênh sau khi duyệt thay đổi", "next"],
    ["Điều khiển máy chủ: đọc trạng thái dịch vụ và người chơi riêng Kênh 1/Kênh 2", "pending"],
    ["Điều khiển máy chủ: mở/dừng/bảo trì từng kênh với xác nhận hai bước", "pending"],
    ["Rate & Drop: đọc cấu hình hiện tại và so sánh riêng từng kênh", "pending"],
    ["Rate & Drop: tạo bản nháp, duyệt áp dụng và hoàn tác cấu hình", "pending"],
  ] as const;

  return (
    <div className="tool-page">
      <div className="notice-card">
        <ShieldCheck size={22} />
        <div>
          <strong>Nguyên tắc vận hành an toàn</strong>
          <p>
            Web chỉ mở những lệnh được định nghĩa sẵn. Không có ô chạy SQL,
            PowerShell hoặc lệnh hệ thống tùy ý.
          </p>
        </div>
      </div>
      <div className="tool-grid">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              type="button"
              className={`tool-card ${activeTool === tool.id ? "active" : ""}`}
              onClick={tool.action}
              disabled={!tool.action}
              aria-pressed={activeTool === tool.id}
              key={tool.title}
            >
              <div className="tool-card-top">
                <span className="tool-icon">
                  <Icon size={23} />
                </span>
                <span className={`tool-category ${tool.tone}`}>{tool.category}</span>
              </div>
              <h3>{tool.title}</h3>
              <p>{tool.description}</p>
              <span className="tool-card-action">
                {tool.action ? (activeTool === tool.id ? "Đang mở" : tool.status) : "Chưa cho phép thao tác"}
                {tool.action ? <ChevronRight size={16} /> : <LockKeyhole size={14} />}
              </span>
            </button>
          );
        })}
      </div>
      <Modal
        open={activeTool !== null}
        onClose={() => setActiveTool(null)}
        kicker="CÔNG CỤ VẬN HÀNH"
        title={tools.find((tool) => tool.id === activeTool)?.title ?? "Vận hành nâng cao"}
        size={activeTool === "advanced" ? "full" : "wide"}
      >
        {activeTool === "advanced" ? (
          <AdvancedOperations onClose={() => setActiveTool(null)} />
        ) : activeTool ? (
          <OperationsSuite
            active={activeOperationsModule}
            onSelect={(module) => {
              setActiveOperationsModule(module);
              setActiveTool(module);
            }}
          />
        ) : null}
      </Modal>
      <section className="glass-panel roadmap-panel tool-source-checklist">
        <div className="panel-title-row">
          <div>
            <span className="section-kicker">CHECKLIST TOOL TRIỀU HOÀNG</span>
            <h2>Danh sách xử lý lần lượt</h2>
          </div>
        </div>
        <div className="tool-checklist-grid">
          {toolChecklist.map(([label, status], index) => (
            <span className={status} key={label}>
              <i>{status === "done" ? "✓" : index + 1}</i>
              <strong>{label}</strong>
              <em>{status === "done" ? "Hoàn tất" : status === "next" ? "Làm kế tiếp" : "Chờ xử lý"}</em>
            </span>
          ))}
        </div>
      </section>
      <section className="glass-panel roadmap-panel tool-source-checklist">
        <div className="panel-title-row">
          <div>
            <span className="section-kicker">CHECKLIST GIAI ĐOẠN 2</span>
            <h2>Các phần xử lý tiếp theo</h2>
            <p className="section-copy">
              Làm lần lượt theo từng nhóm; thao tác máy chủ và cấu hình luôn tách riêng Kênh 1/Kênh 2.
            </p>
          </div>
        </div>
        <div className="tool-checklist-grid">
          {phaseTwoChecklist.map(([label, status], index) => (
            <span className={status} key={label}>
              <i>{status === "done" ? "✓" : index + 1}</i>
              <strong>{label}</strong>
              <em>{status === "done" ? "Hoàn tất" : status === "next" ? "Làm kế tiếp" : "Chờ xử lý"}</em>
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function Dashboard({ username }: { username: string }) {
  return (
    <RouterProvider>
      <DashboardShell username={username} />
    </RouterProvider>
  );
}

function DashboardShell({ username }: { username: string }) {
  const { routeId: view, route, navigate: goToRoute } = useRoute();
  const [rankingType, setRankingType] = useState<RankingType>("level");
  const [eventFilter, setEventFilter] = useState<EventFilter>("all");
  const [search, setSearch] = useState("");
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [administratorName, setAdministratorName] = useState(username);

  useEffect(() => {
    setSidebarCollapsed(window.localStorage.getItem("hknt-sidebar-collapsed") === "1");
    void fetch("/api/admin/gm-accounts", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((payload: { administratorName?: string } | null) => {
        if (payload?.administratorName) setAdministratorName(payload.administratorName);
      })
      .catch(() => undefined);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((collapsed) => {
      const next = !collapsed;
      window.localStorage.setItem("hknt-sidebar-collapsed", next ? "1" : "0");
      return next;
    });
  }, []);

  const loadData = useCallback(
    async (silent = false) => {
      if (!silent) setRefreshing(true);
      setError("");

      try {
        const response = await fetch(`/api/dashboard?ranking=${rankingType}`, {
          cache: "no-store",
        });
        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }
        const payload = (await response.json()) as
          | DashboardPayload
          | { message?: string };
        if (!response.ok || !("rankings" in payload)) {
          throw new Error(
            "message" in payload
              ? payload.message
              : "Không thể cập nhật dữ liệu.",
          );
        }
        setData(payload);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Không thể cập nhật dữ liệu.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [rankingType],
  );

  useEffect(() => {
    setLoading(true);
    void loadData(true);
  }, [loadData]);

  // Tự làm mới mỗi 60 giây và BỎ QUA khi tab đang bị ẩn. Trước đây để 20 giây
  // và chạy cả khi không ai nhìn: một tab mở suốt ngày tự nó đốt khoảng
  // 130.000 lượt gọi hàm mỗi tháng trên Vercel mà không phục vụ ai.
  // Khi quay lại tab thì làm mới ngay để số liệu không bị cũ.
  useEffect(() => {
    const refreshIfVisible = () => {
      if (document.visibilityState === "visible") void loadData(true);
    };
    const timer = window.setInterval(refreshIfVisible, 60_000);
    document.addEventListener("visibilitychange", refreshIfVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshIfVisible);
    };
  }, [loadData]);

  const navigate = useCallback(
    (nextView: RouteId) => {
      goToRoute(nextView);
      setSearch("");
      setMobileOpen(false);
    },
    [goToRoute],
  );

  const query = search.trim().toLocaleLowerCase("vi");

  const filteredRankings = useMemo(() => {
    if (!data || !query) return data?.rankings ?? [];
    return data.rankings.filter((entry) =>
      [entry.characterName, jobName(entry.job), entry.guildName].some((value) =>
        value.toLocaleLowerCase("vi").includes(query),
      ),
    );
  }, [data, query]);

  const filteredEvents = useMemo(() => {
    if (!data) return [];
    return data.events.filter((event) => {
      const matchesFilter =
        eventFilter === "all" ||
        (eventFilter === "enhance" && !isCombine(event)) ||
        (eventFilter === "combine" && isCombine(event)) ||
        (eventFilter === "success" && event.success) ||
        (eventFilter === "failure" && !event.success);
      const matchesSearch =
        !query ||
        [
          event.characterName,
          event.itemName,
          event.materialName,
          event.failureEffect,
        ].some((value) => value.toLocaleLowerCase("vi").includes(query));
      return matchesFilter && matchesSearch;
    });
  }, [data, eventFilter, query]);

  const title = route.label;
  const successCount = data?.events.filter((event) => event.success).length ?? 0;

  return (
    <main className={`control-center ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <div className="background-art" />
      <div className="background-overlay" />

      <aside className={`main-sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="brand-area">
          <img src="/hknt-logo.png" alt="" />
          <div>
            <strong>HK NGẠO THIÊN</strong>
            <span>GM CONTROL CENTER</span>
          </div>
          <button
            className="mobile-close"
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Đóng menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-label">ĐIỀU HÀNH</div>
        <nav aria-label="Điều hướng quản trị">
          {ROUTES.map((item) => {
            const Icon = NAV_ICONS[item.id];
            return (
              <button
                key={item.id}
                type="button"
                className={view === item.id ? "active" : ""}
                onClick={() => navigate(item.id)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
                {item.id === "players" ? (
                  <em>{data?.serverStatus.playersOnline ?? 0}</em>
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-label">HỆ THỐNG</div>
        <div className="sidebar-system">
          <div>
            <span
              className={`system-light ${
                data?.serverStatus.online ? "online" : "offline"
              }`}
            />
            <div>
              <strong>VPS HKNT</strong>
              <small>
                {data?.serverStatus.online ? "Kết nối ổn định" : "Đang kiểm tra"}
              </small>
            </div>
          </div>
          <div>
            <Database size={17} />
            <span>SQL qua API bảo vệ</span>
          </div>
          <div>
            <ShieldCheck size={17} />
            <span>WAF & chống DDoS</span>
          </div>
        </div>

        <div className="sidebar-account">
          <div className="account-avatar">{administratorName.charAt(0).toUpperCase() || "A"}</div>
          <div>
            <strong className="admin-power-name">{administratorName}</strong>
            <small>Quản trị viên</small>
          </div>
          <form action="/api/auth/logout" method="post">
            <button type="submit" title="Đăng xuất" aria-label="Đăng xuất">
              <LogOut size={18} />
            </button>
          </form>
        </div>
      </aside>

      <button
        type="button"
        className="sidebar-collapse-toggle"
        onClick={toggleSidebar}
        aria-label={sidebarCollapsed ? "Mở thanh điều hướng" : "Thu gọn thanh điều hướng"}
        title={sidebarCollapsed ? "Mở thanh điều hướng" : "Thu gọn thanh điều hướng"}
      >
        {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      {mobileOpen ? (
        <button
          type="button"
          className="mobile-backdrop"
          aria-label="Đóng menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <section className="content-shell">
        <header className="top-header">
          <button
            className="mobile-menu"
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Mở menu"
          >
            <Menu size={22} />
          </button>
          <div>
            <span className="page-breadcrumb">TRUNG TÂM ĐIỀU HÀNH /</span>
            <h1>{title}</h1>
          </div>
          <div className="header-actions">
            <GlobalGmAccess />
            {(view === "ranking" || view === "enhancement") && (
              <label className="global-search">
                <Search size={18} />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tìm nhân vật, vật phẩm…"
                />
              </label>
            )}
            <button
              className="refresh-action"
              type="button"
              disabled={refreshing}
              onClick={() => void loadData()}
            >
              <RefreshCw size={18} className={refreshing ? "spinning" : ""} />
              <span>{refreshing ? "Đang tải" : "Làm mới"}</span>
            </button>
          </div>
        </header>

        <div className="content-scroll">
        <div className="content-inner">

        {view === "overview" ? (
        <>
        <section className="hero-strip">
          <div>
            <span className="live-label">
              <i />
              DỮ LIỆU TRỰC TIẾP
            </span>
            <h2>Chào mừng trở lại, {administratorName}</h2>
            <p>
              Theo dõi GameServer và vận hành HK Ngạo Thiên từ một nơi duy nhất.
            </p>
          </div>
          <div className="hero-updated">
            <History size={18} />
            <span>
              Cập nhật gần nhất
              <strong>{data ? formatTime(data.fetchedAt) : "Đang kết nối…"}</strong>
            </span>
          </div>
        </section>

        <section className="metric-grid" aria-label="Chỉ số hệ thống">
          <article>
            <span className="metric-icon green">
              <Users size={23} />
            </span>
            <div>
              <small>NGƯỜI CHƠI ONLINE</small>
              <strong>{data?.serverStatus.playersOnline ?? "—"}</strong>
              <em>đang kết nối</em>
            </div>
          </article>
          <article>
            <span className="metric-icon gold">
              <Boxes size={23} />
            </span>
            <div>
              <small>TỔNG NHÂN VẬT</small>
              <strong>{data?.allCharacters.length ?? "—"}</strong>
              <em>đã ghi nhận</em>
            </div>
          </article>
          <article>
            <span className="metric-icon orange">
              <Sparkles size={23} />
            </span>
            <div>
              <small>SỰ KIỆN CƯỜNG HÓA</small>
              <strong>{data?.events.length ?? "—"}</strong>
              <em>lần mới nhất</em>
            </div>
          </article>
          <article>
            <span className="metric-icon blue">
              <Activity size={23} />
            </span>
            <div>
              <small>TỶ LỆ THÀNH CÔNG</small>
              <strong>
                {data?.events.length
                  ? `${Math.round((successCount / data.events.length) * 100)}%`
                  : "—"}
              </strong>
              <em>trong dữ liệu gần nhất</em>
            </div>
          </article>
        </section>
        </>
        ) : (
          <p className="page-lead">{route.mota}</p>
        )}

        {error ? (
          <div className="error-banner" role="alert">
            <X size={18} />
            <div>
              <strong>Chưa thể cập nhật dữ liệu mới</strong>
              <span>{error}</span>
            </div>
            <button type="button" onClick={() => void loadData()}>
              Thử lại
            </button>
          </div>
        ) : null}

        <section className="view-content">
          {loading || !data ? (
            <section className="glass-panel">
              <LoadingTable />
            </section>
          ) : null}

          {!loading && data && view === "overview" ? (
            <Overview data={data} onNavigate={navigate} />
          ) : null}

          {!loading && data && view === "shop" ? <BachBaoTabs /> : null}

          {!loading && data && view === "players" ? (
            <GmConsole
              publicPlayerCount={data.serverStatus.playersOnline}
              publicOnlineNames={data.onlineCharacters.map((entry) => entry.characterName)}
              jobName={jobName}
              factionName={factionName}
            />
          ) : null}

          {!loading && data && view === "ranking" ? (
            <section className="glass-panel table-panel">
              <div className="panel-title-row table-heading">
                <div>
                  <span className="section-kicker">THÀNH TÍCH GIANG HỒ</span>
                  <h2>Bảng xếp hạng nhân vật</h2>
                  <p>Dữ liệu tổng hợp trực tiếp từ GameServer.</p>
                </div>
                <div className="segmented-control" role="tablist">
                  {(Object.keys(RANKING_LABELS) as RankingType[]).map((type) => (
                    <button
                      type="button"
                      role="tab"
                      aria-selected={rankingType === type}
                      className={rankingType === type ? "active" : ""}
                      key={type}
                      onClick={() => setRankingType(type)}
                    >
                      {RANKING_LABELS[type]}
                    </button>
                  ))}
                </div>
              </div>
              <RankingTable
                entries={filteredRankings}
                rankingType={rankingType}
              />
            </section>
          ) : null}

          {!loading && data && view === "enhancement" ? (
            <section className="glass-panel table-panel">
              <div className="panel-title-row table-heading">
                <div>
                  <span className="section-kicker">NHẬT KÝ TRANG BỊ</span>
                  <h2>Cường hóa và hợp thành</h2>
                  <p>100 hoạt động mới nhất trên Kênh 1 và Kênh 2.</p>
                </div>
                <div className="segmented-control" role="group">
                  {(
                    [
                      ["all", "Tất cả"],
                      ["enhance", "Cường hóa"],
                      ["combine", "Hợp thành"],
                      ["success", "Thành công"],
                      ["failure", "Thất bại"],
                    ] as [EventFilter, string][]
                  ).map(([filter, label]) => (
                    <button
                      type="button"
                      className={eventFilter === filter ? "active" : ""}
                      key={filter}
                      onClick={() => setEventFilter(filter)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <EventsTable events={filteredEvents} />
            </section>
          ) : null}

          {!loading && data && view === "game-logs" ? (
            <section className="glass-panel table-panel">
              <div className="panel-title-row table-heading">
                <div>
                  <span className="section-kicker">NHẬT KÝ GAME</span>
                  <h2>Theo dõi theo phân loại</h2>
                  <p>Giao dịch, mua bán NPC, mở hộp, cường hóa, dùng vật phẩm, đăng nhập — lọc theo nhân vật và khoảng thời gian.</p>
                </div>
              </div>
              <GameLogViewer />
            </section>
          ) : null}

          {!loading && data && view === "error-logs" ? (
            <section className="glass-panel table-panel">
              <div className="panel-title-row table-heading">
                <div>
                  <span className="section-kicker">NHẬT KÝ LỖI</span>
                  <h2>Lỗi GameServer theo ngày</h2>
                  <p>Gom các dòng cùng kiểu để thấy ngay lỗi nào đang lặp nhiều nhất. Bấm vào một kiểu để xem riêng các dòng của nó.</p>
                </div>
              </div>
              <ErrorLogViewer />
            </section>
          ) : null}

          {!loading && data && view === "bai-quai" ? (
            <section className="glass-panel table-panel">
              <div className="panel-title-row table-heading">
                <div>
                  <span className="section-kicker">BÃI QUÁI ĐẶC BIỆT</span>
                  <h2>Vùng cày có hệ số rơi riêng</h2>
                  <p>Quái chết trong vùng được nhân hệ số rơi, và số món hiếm đếm vào túi hạn mức riêng của bãi nên không ăn vào trần chung của server.</p>
                </div>
              </div>
              <BaiQuaiTool />
            </section>
          ) : null}

          {!loading && data && view === "tran-do-hiem" ? (
            <section className="glass-panel table-panel">
              <div className="panel-title-row table-heading">
                <div>
                  <span className="section-kicker">TRẦN ĐỒ HIẾM</span>
                  <h2>Đã rơi so với trần, theo từng ngày</h2>
                  <p>Bảng Drop boss tách riêng khỏi quái thường. Hết suất thì món đó không rơi và cũng không ghi vào nhật ký, nên sổ vắng không có nghĩa là hệ thống không quay.</p>
                </div>
              </div>
              <RareDropQuotaTool />
            </section>
          ) : null}

          {!loading && data && view === "su-kien-drop" ? (
            <DropAndEventsTool />
          ) : null}

          {!loading && data && view === "maps" ? (
            <MapsManagementTool />
          ) : null}

          {!loading && data && view === "game-commands" ? (
            <GameCommandsTool />
          ) : null}

          {!loading && data && view === "khi-cong" ? (
            <section className="glass-panel table-panel">
              <div className="panel-title-row table-heading">
                <div>
                  <span className="section-kicker">KHÍ CÔNG</span>
                  <h2>Tra cứu khí công 13 nghề</h2>
                  <p>Tên, icon, cách hoạt động thật và trạng thái công thức từng khí công — biên soạn từ đợt audit 02/09/2026.</p>
                </div>
              </div>
              <KhiCongTool />
            </section>
          ) : null}

          {!loading && data && view === "pills" ? (
            <PillsManagementTool />
          ) : null}

          {!loading && data && view === "the-luc-chien" ? (
            <section className="glass-panel table-panel">
              <div className="panel-title-row table-heading">
                <div>
                  <span className="section-kicker">THẾ LỰC CHIẾN</span>
                  <h2>Điều khiển trận và soi thành viên</h2>
                  <p>Cả hai kênh điều khiển được năm bước. Kênh 1 đang có người chơi thật nên bấm là ăn ngay vào trận của họ — muốn thử thì chọn Kênh 2.</p>
                </div>
              </div>
              <TheLucChienTool />
            </section>
          ) : null}

          {!loading && data && view === "tools" ? (
            <ToolCenter onNavigate={navigate} />
          ) : null}

          {!loading && data && view === "accounts" ? (
            <GmAccountManager
              administratorName={administratorName}
              onAdministratorNameChange={setAdministratorName}
            />
          ) : null}

          {/* Hai trang quy trình KHÔNG chờ dữ liệu dashboard. Lúc bảo trì hoặc
              reset thì GameServer đang tắt, /api/dashboard sẽ lỗi — mà đó lại
              đúng lúc cần xem checklist nhất. */}
          {view === "maintenance" ? <RunbookTool runbook={MAINTENANCE_RUNBOOK} /> : null}

          {view === "reset-after-test" ? <RunbookTool runbook={RESET_RUNBOOK} /> : null}
        </section>
        </div>
        </div>
      </section>
    </main>
  );
}
