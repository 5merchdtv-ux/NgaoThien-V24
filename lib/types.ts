export type RankingType = "level" | "wx" | "pvp" | "online";

export type RankingEntry = {
  rank: number;
  characterName: string;
  job: number;
  faction: number;
  level: number;
  jobLevel: number;
  /**
   * Số lần Trùng Sinh (FLD_ZS). Chỉ có khi bảng xếp hạng lấy từ gateway; API công khai của
   * Launcher Gate không trả trường này nên để trống và coi như 0.
   */
  rebirth?: number;
  guildName: string;
  achievement: string;
  online: boolean;
};

export type ItemEvent = {
  eventId: number;
  channelId: number;
  characterName: string;
  eventType: string;
  itemPid: number;
  itemName: string;
  materialPid: number;
  materialName: string;
  attributeText: string;
  beforeLevel: number;
  afterLevel: number;
  success: boolean;
  failureEffect: string;
  createdAt: string;
};

export type ServerStatus = {
  online: boolean;
  loginOnline: boolean;
  gameOnline: boolean;
  playersOnline: number;
};

export type GameChannelStatus = {
  targetChannels: number[];
  activeChannels: number[];
  channels?: Array<{
    channel: number;
    apiOnline: boolean;
    message: string;
    members: string[];
    hangingMembers?: string[];
    playingCount?: number;
    hangingCount?: number;
  }>;
  playingCount?: number;
  hangingCount?: number;
};

export type DashboardPayload = {
  rankingType: RankingType;
  rankings: RankingEntry[];
  allCharacters: RankingEntry[];
  onlineCharacters: RankingEntry[];
  events: ItemEvent[];
  serverStatus: ServerStatus;
  gameChannels: GameChannelStatus;
  launcherGateOnline: boolean;
  fetchedAt: string;
};

export type GmSessionStatus = {
  connected: boolean;
  accountId?: string;
  displayName?: string;
  role?: number;
  targetChannels?: number[];
  activeChannels?: number[];
};

export type GmMemberSummary = {
  userName: string;
};

/**
 * Một "pill"/buff đang có hiệu lực trên nhân vật — gộp từ 5 nguồn của GameServer:
 * TitleDrug (称号药品, buff gắn danh hiệu), TimeMedicine (时间药品, buff theo thời hạn thường),
 * PublicDrugs (公有药品, ví dụ "Chí Tôn Phù"), AppendStatusList (buff tạm thời khác, ví dụ
 * thưởng Top10 vũ huân), và huy hiệu VIP (suy ra từ FLD_VIP/FLD_VIPTIM).
 * Chỉ gồm pill CÒN hiệu lực — server đã lọc pill hết hạn.
 */
export type PillSummary = {
  duocPhamID: number;
  /** Tên vật phẩm tra từ TBL_XWWL_ITEM. Nếu không tìm thấy thì là "Thuoc #<id>". */
  name: string;
  kind: "title" | "time" | "status" | "vip" | "public";
  /** ISO string thời điểm hết hạn. */
  expiresAt: string;
  /** Số giây còn lại tính tại thời điểm GameServer trả lời — không tự đếm ngược trên trình duyệt. */
  remainingSeconds: number;
};

export type GmMemberChannel = GmMemberSummary & {
  channelId: number;
  /**
   * Nhân vật vẫn nằm trong thế giới GameServer nhưng tài khoản đã đăng xuất khỏi socket —
   * tức đang treo offline (đánh quái/bán hàng tự động). Gateway suy ra từ `FLD_ONLINE = 0`.
   * Thiếu trường này (gateway cũ) thì coi như không rõ và không hiện nhãn.
   */
  hangingOffline?: boolean;
  /** Pill đang có hiệu lực, chỉ có khi lấy từ pipe trực tiếp (action "members" trên GameServer). */
  pills?: PillSummary[];
};

export type GmItemSnapshot = {
  slot: number;
  globalId?: string;
  itemId: number;
  amount: number;
  name: string;
  enhancement: number;
  magic0?: number;
  magic1: number;
  magic2: number;
  magic3: number;
  magic4: number;
  locked: boolean;
};

export type GmPetSummary = {
  petId: string;
  name: string;
  ownerName?: string;
  loyalty: number;
  experience?: string;
  level: number;
  appearance?: number;
  job: number;
  jobLevel: number;
  hp: number;
  maxHp?: number;
  mp: number;
  maxMp?: number;
  attack?: number;
  defense?: number;
  accuracy?: number;
  dodge?: number;
  mounted?: boolean;
  magic1?: number;
  magic2?: number;
  magic3?: number;
  magic4?: number;
  magic5?: number;
};

export type GmMemberSnapshot = {
  success: boolean;
  message: string;
  userName: string;
  userId: string;
  mail: string;
  ip: string;
  online: boolean;
  locked?: boolean;
  job: number;
  faction: number;
  sex: number;
  jobLevel: number;
  level: number;
  money: number;
  cash: number;
  cashX: number;
  coin: number;
  donate: number;
  attackBonus: number;
  defenseBonus: number;
  hpBonus: number;
  mpBonus: number;
  honor: number;
  /** Trạng thái VIP đọc từ TBL_ACCOUNT.FLD_VIP — có ở cả nhân vật online (Snapshot) lẫn offline. */
  vip?: boolean;
  /** TBL_ACCOUNT.FLD_VIPTIM (ISO string). null/undefined nếu tài khoản chưa từng là VIP. */
  vipExpiresAt?: string | null;
  /** Pill đang có hiệu lực trên nhân vật — chỉ có khi đọc từ Snapshot trực tiếp (nhân vật online). */
  pills?: PillSummary[];
  personalWarehouseMoney: number;
  publicWarehouseMoney: number;
  wear: GmItemSnapshot[];
  bag: GmItemSnapshot[];
  personalWarehouse: GmItemSnapshot[];
  publicWarehouse: GmItemSnapshot[];
  heavenWarehouse: GmItemSnapshot[];
  petBag: GmItemSnapshot[];
  petEquipment?: GmItemSnapshot[];
  activePet?: GmPetSummary | null;
  pets?: GmPetSummary[];
  auxiliaryEquipment?: GmItemSnapshot[];
  spiritBag?: GmItemSnapshot[];
  questBag?: GmItemSnapshot[];
  liveOperationsAvailable?: boolean;
  source?: string;
};
