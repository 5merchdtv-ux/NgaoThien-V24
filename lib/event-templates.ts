export type EventRewardEntry = {
  label: string;
  detail: string;
  rate?: string;
  pid?: number;
};

export type EventTemplate = {
  id: string;
  template: true;
  name: string;
  playerName: string;
  status: "disabled";
  runtimeConnected: false;
  version: number;
  description: string;
  schedule: {
    durationDays: number;
    startDate: string | null;
    endDate: string | null;
    dailyStart: string;
    dailyEnd: string;
    timezone: string;
    bossWaves: string[];
  };
  channel: {
    value: string | null;
    label: string;
  };
  map: {
    id: number;
    name: string;
    moveCommand: string;
    entry: string;
  };
  monsters: Array<{
    role: "scout" | "boss";
    name: string;
    level: number;
    candidatePids: number[];
    alive?: number;
    respawnSeconds?: number;
    perWave?: number;
  }>;
  rules: string[];
  participationRewards: EventRewardEntry[];
  bossRewards: EventRewardEntry[];
  pillPool: EventRewardEntry[];
  cloakPool: EventRewardEntry[];
  milestones: Array<{ day: number; reward: string }>;
  blockers: string[];
};

export const EVENT_TEMPLATES: EventTemplate[] = [
  {
    id: "TRUY_SAT_HAC_PHONG",
    template: true,
    name: "Truy Sát Hắc Phong",
    playerName: "TRUY SÁT HẮC PHONG",
    status: "disabled",
    runtimeConnected: false,
    version: 1,
    description:
      "PT tranh last-hit trên Bắc Hải Băng Cung, tìm Trinh Sát lấy Dấu Vết rồi săn Hắc Phong Ma Chủ.",
    schedule: {
      durationDays: 10,
      startDate: null,
      endDate: null,
      dailyStart: "19:00",
      dailyEnd: "20:00",
      timezone: "Asia/Bangkok",
      bossWaves: ["19:10", "19:20", "19:30", "19:40", "19:50"],
    },
    channel: {
      value: null,
      label: "Chưa chọn kênh chạy",
    },
    map: {
      id: 5001,
      name: "Bắc Hải Băng Cung",
      moveCommand: "!move bhbc",
      entry: "Thành BHBC · khoảng 1900, -900",
    },
    monsters: [
      {
        role: "scout",
        name: "Hắc Phong Trinh Sát",
        level: 100,
        candidatePids: [16415, 16416, 16417, 16419],
        alive: 32,
        respawnSeconds: 60,
      },
      {
        role: "boss",
        name: "Hắc Phong Ma Chủ",
        level: 110,
        candidatePids: [15422],
        perWave: 2,
      },
    ],
    rules: [
      "PT hợp lệ từ 3–8 người, level 80–120.",
      "PT cần last-hit 3 Trinh Sát để đủ 3 Dấu Vết.",
      "Tranh quái và Boss tự do; không khóa first-hit, không tính tổng sát thương.",
      "Boss được tính cho PT có thành viên tung đòn kết liễu hợp lệ.",
      "Quà tham gia và quà thắng Boss là hai nhóm độc lập.",
      "Mỗi tài khoản chỉ nhận quà thắng Boss một lần mỗi ngày.",
    ],
    participationRewards: [
      {
        label: "Hộp Hạt Ngọc Trung Cấp",
        detail: "Random CAM / ĐỎ / XÁM; 1 ngày 99%, 30 ngày 1%",
      },
      {
        label: "Huyền Vũ Hoàn",
        detail: "1 viên 50% · 2 viên 35% · 3 viên 15%",
        pid: 1008000162,
      },
      {
        label: "Tiến độ tích lũy",
        detail: "+1 ngày khi tham gia hợp lệ",
      },
    ],
    bossRewards: [
      {
        label: "Hộp Đan Truy Sát",
        detail: "1 hộp; mỗi hộp quay 1 pill và 1 Áo Choàng Hắc Phong",
      },
      {
        label: "Gold ngẫu nhiên",
        detail: "100 triệu đến 1 tỷ",
        rate: "50 / 25 / 15 / 7 / 2 / 1%",
      },
    ],
    pillPool: [
      { label: "Chí Tôn Hỏa Dương Đơn", detail: "Một lần dùng, hiệu lực 2 giờ", rate: "70%", pid: 1008000194 },
      { label: "Kim Long Chỉ Thiêu", detail: "Pill trong Hộp Đan", rate: "20%", pid: 1008001021 },
      { label: "Nghịch Chiến Cuồng Đan", detail: "Giữ cấu hình 10 lần", rate: "5%", pid: 1008000212 },
      { label: "Long Lân Hộ Thể Đan", detail: "Giữ cấu hình 10 lần", rate: "5%", pid: 1008000213 },
    ],
    cloakPool: [
      { label: "Áo Choàng Hắc Phong 1 ngày", detail: "Khóa, không giao dịch", rate: "99%" },
      { label: "Áo Choàng Hắc Phong 30 ngày", detail: "Khóa, không giao dịch", rate: "1%" },
    ],
    milestones: [
      { day: 2, reward: "5.000 Võ Huân" },
      { day: 4, reward: "1 tỷ Gold" },
      { day: 5, reward: "Thêm 15.000 Võ Huân" },
      { day: 6, reward: "Chí Tôn Phù 30 ngày · PID 1008000312" },
      { day: 8, reward: "Thêm 3 tỷ Gold" },
      { day: 9, reward: "Trứng Heaven Pet · PID 1000001151" },
      {
        day: 10,
        reward:
          "Thêm 30.000 Võ Huân + Áo Choàng Hắc Phong 30 ngày + 5 Hộp Đan riêng",
      },
    ],
    blockers: [
      "Chưa chọn ngày bắt đầu và ngày kết thúc.",
      "Chưa chọn kênh chạy.",
      "Chưa duyệt tọa độ sinh quái/Boss trên client.",
      "Chưa có PID chính thức cho Áo Choàng Hắc Phong 1 ngày và 30 ngày.",
      "Event Engine GameServer chưa được kết nối với Dashboard.",
    ],
  },
];

