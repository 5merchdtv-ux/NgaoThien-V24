using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;

namespace HKGMRemoteHost;

public sealed class PillLocation
{
    [JsonPropertyName("type")]
    public string Type { get; set; } = string.Empty;

    [JsonPropertyName("targetName")]
    public string TargetName { get; set; } = string.Empty;

    [JsonPropertyName("mapName")]
    public string MapName { get; set; } = string.Empty;

    [JsonPropertyName("costOrRate")]
    public string CostOrRate { get; set; } = string.Empty;

    [JsonPropertyName("details")]
    public string Details { get; set; } = string.Empty;
}

public sealed class PillSourceDetail
{
    [JsonPropertyName("mainSource")]
    public string MainSource { get; set; } = string.Empty;

    [JsonPropertyName("locations")]
    public List<PillLocation> Locations { get; set; } = new();

    [JsonPropertyName("eventInfo")]
    public string EventInfo { get; set; } = string.Empty;

    [JsonPropertyName("howToGet")]
    public string HowToGet { get; set; } = string.Empty;

    [JsonPropertyName("stackingTips")]
    public string StackingTips { get; set; } = string.Empty;
}

public sealed class PillItem
{
    [JsonPropertyName("pid")]
    public int Pid { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("originalName")]
    public string OriginalName { get; set; } = string.Empty;

    [JsonPropertyName("groupId")]
    public string GroupId { get; set; } = string.Empty;

    [JsonPropertyName("groupName")]
    public string GroupName { get; set; } = string.Empty;

    [JsonPropertyName("source")]
    public string Source { get; set; } = string.Empty;

    [JsonPropertyName("isCashShop")]
    public bool IsCashShop { get; set; }

    [JsonPropertyName("effectDescription")]
    public string EffectDescription { get; set; } = string.Empty;

    [JsonPropertyName("duration")]
    public string Duration { get; set; } = string.Empty;

    [JsonPropertyName("stackRule")]
    public string StackRule { get; set; } = string.Empty;

    [JsonPropertyName("itemKind")]
    public string ItemKind { get; set; } = "statPill";

    [JsonPropertyName("itemKindLabel")]
    public string ItemKindLabel { get; set; } = "Pill cộng chỉ số";

    [JsonPropertyName("effectSlots")]
    public List<string> EffectSlots { get; set; } = new();

    [JsonPropertyName("handlingRule")]
    public string HandlingRule { get; set; } = string.Empty;

    [JsonPropertyName("sourceTags")]
    public List<string> SourceTags { get; set; } = new();

    [JsonPropertyName("isLocked")]
    public bool IsLocked { get; set; }

    [JsonPropertyName("price")]
    public long Price { get; set; }

    [JsonPropertyName("sourceDetail")]
    public PillSourceDetail SourceDetail { get; set; } = new();
}

public sealed class PillGroup
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    [JsonPropertyName("icon")]
    public string Icon { get; set; } = string.Empty;

    [JsonPropertyName("mechanic")]
    public string Mechanic { get; set; } = string.Empty;

    [JsonPropertyName("stackBehavior")]
    public string StackBehavior { get; set; } = string.Empty;

    [JsonPropertyName("pills")]
    public List<PillItem> Pills { get; set; } = new();
}

public sealed class PillsResponse
{
    [JsonPropertyName("success")]
    public bool Success { get; set; } = true;

    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;

    [JsonPropertyName("totalPills")]
    public int TotalPills { get; set; }

    [JsonPropertyName("activeCount")]
    public int ActiveCount { get; set; }

    [JsonPropertyName("lockedCount")]
    public int LockedCount { get; set; }

    [JsonPropertyName("groups")]
    public List<PillGroup> Groups { get; set; } = new();
}

public static class PillsStore
{
    private sealed record PillDefinition(
        int Pid,
        string Name,
        string GroupId,
        string GroupName,
        string Effects,
        string Duration,
        string StackRule,
        string HowToGet,
        string StackingTips,
        string EventInfo = ""
    );

    private static readonly List<PillDefinition> DefinedPills = new()
    {
        // ================= GROUP 1: CHÍ TÔN PHÙ (VIP) =================
        new(1008000312, @"Chí Tôn Nhiệt Huyết Phù (30 ngày)", @"Group_ChiTonPhu", @"1. Chí Tôn Phù (VIP)", @"Kinh nghiệm +50%, Lịch luyện +40%, Võ huân x1.5, Hồi sinh tại chỗ, Hành trang x2, Rơi đồ +20%, Công/Thủ +20%", @"30 Ngày", @"Độc lập tuyệt đối. Cắn mới sẽ ghi đè hạn dùng mới (yyMMddHHmm) và kích hoạt VIP", @"Mua tại Bách Bảo Các hoặc NPC Bình Thập Chỉ tại Huyền Bột Phái (Giá 5 Tỷ Lượng).", @"Nên cắn kèm Chí Tôn Hoàn + Cô Điệp Phù + Thần Thụ để hưởng tối đa +70% EXP và +35% toàn bộ chỉ số.", @"Sự kiện VIP & Đua Top"),
        new(1008000311, @"Nhiệt Huyết Phù (30 ngày)", @"Group_ChiTonPhu", @"1. Chí Tôn Phù (VIP)", @"Kinh nghiệm +20%, Rèn luyện +20%, Công kích +5%, Phòng thủ +5%, Giảm mất mát khi chết", @"30 Ngày", @"Độc lập tuyệt đối. Cắn mới làm mới hạn dùng VIP", @"Mua tại Bách Bảo Các hoặc mở hộp quà sự kiện.", @"Cộng dồn trọn vẹn với các loại Hoàn, Thảo và Chỉ thêu.", @""),
        new(1008001584, @"Hội Viên VIP (30 ngày)", @"Group_ChiTonPhu", @"1. Chí Tôn Phù (VIP)", @"Kích hoạt danh vị Hội Viên VIP 30 ngày: Nhận buff toàn diện chỉ số, ưu tiên hàng chờ và hỗ trợ GM", @"30 Ngày", @"Độc lập tuyệt đối. Cắn mới làm mới hạn dùng VIP", @"Mua trong Bách Bảo Các (5.000 Cash) hoặc quà nạp tích lũy VIP.", @"Kích hoạt trạng thái VIP toàn server.", @"Bách Bảo Các"),
        new(1008001187, @"Phù Hồn Nguyên Thăng Thiên (10 Ngày)", @"Group_ChiTonPhu", @"1. Chí Tôn Phù (VIP)", @"Gia tăng +30% uy lực công kích và phòng ngự cho nhân vật Thăng Thiên, hồi phục nhanh", @"10 Ngày", @"Độc lập tuyệt đối. Gia hạn khi dùng tiếp", @"Mua trong Bách Bảo Các (5.000 Cash).", @"Dành riêng cho các cao thủ Thăng Thiên muốn tối đa hóa sức mạnh.", @"Bách Bảo Các"),
        new(1008000195, @"Phương Thiên Linh Thuẫn (10 ngày)", @"Group_ChiTonPhu", @"1. Chí Tôn Phù (VIP)", @"Linh thuẫn hộ thể: Giảm 20% toàn bộ sát thương nhận vào, tăng 15% kháng hiệu ứng khống chế", @"10 Ngày", @"Độc lập tuyệt đối. Gia hạn khi dùng tiếp", @"Mua trong Bách Bảo Các (500 Cash).", @"Lớp giáp phòng ngự siêu cấp cho PK và đánh Boss lớn.", @"Bách Bảo Các"),
        new(900000619, @"Phù Hộ Thân Chế Độ An Toàn", @"Group_ChiTonPhu", @"1. Chí Tôn Phù (VIP)", @"Bảo vệ an toàn tuyệt đối: Không mất điểm kinh nghiệm, trang bị hay tiền vàng khi nhân vật tử vong", @"30 Ngày", @"Độc lập tuyệt đối", @"Mua trong Bách Bảo Các (800 Cash).", @"Bảo hiểm sinh mệnh khi train bãi nguy hiểm.", @"Bách Bảo Các"),
        new(1008000029, @"Huyền Vũ Xích Luyện Phù (30 ngày)", @"Group_ChiTonPhu", @"1. Chí Tôn Phù (VIP)", @"Kinh nghiệm +20%, Lịch luyện +50%, Tiền +20%, Hồi sinh tại chỗ, Thổ Linh Phù lưu 30 điểm", @"30 Ngày", @"Độc lập tuyệt đối. Ghi đè hạn dùng mới", @"Mua trong Bách Bảo Các hoặc quà nạp tích lũy.", @"Độc lập với tất cả các nhóm buff khác.", @""),
        new(1008000030, @"KIm Cang Phù(PC)(Kim Cang PC PHù)", @"Group_ChiTonPhu", @"1. Chí Tôn Phù (VIP)", @"Kinh nghiệm +20%, Lịch luyện +50%, Tiền +20%, Hồi sinh tại chỗ", @"10 Ngày", @"Độc lập tuyệt đối. Ghi đè hạn dùng mới", @"Mua trong Bách Bảo Các.", @"Độc lập với tất cả các nhóm buff khác.", @""),
        new(1008000028, @"Thiên Khải Ngân Tôn Phù (30 ngày)", @"Group_ChiTonPhu", @"1. Chí Tôn Phù (VIP)", @"Kinh nghiệm +20%, Lịch luyện +50%, Tiền +20%, Hồi sinh tại chỗ", @"24 Giờ", @"Độc lập tuyệt đối. Ghi đè hạn dùng mới", @"Mua trong Bách Bảo Các hoặc phần thưởng tân thủ.", @"Độc lập với tất cả các nhóm buff khác.", @""),
        new(1008000031, @"Hàn Ngọc Phù(PC)(Hàn Ngọc PC Phù)", @"Group_ChiTonPhu", @"1. Chí Tôn Phù (VIP)", @"Kinh nghiệm +20%, Tấn công +10%, Phòng thủ +10%, HP/MP +100", @"30 Ngày", @"Độc lập tuyệt đối. Ghi đè hạn dùng mới", @"Bách Bảo Các hoặc quà sự kiện VIP.", @"Cộng dồn cùng tất cả các loại Hoàn và Thần Đan.", @""),
        new(1008000032, @"Ngân Tôn Phù (10 ngày)", @"Group_ChiTonPhu", @"1. Chí Tôn Phù (VIP)", @"Kinh nghiệm +20%, Tấn công +10%, Phòng thủ +10%, HP/MP +100", @"10 Ngày", @"Độc lập tuyệt đối. Ghi đè hạn dùng mới", @"Bách Bảo Các.", @"Cộng dồn cùng tất cả các loại Hoàn và Thần Đan.", @""),
        new(1008000033, @"Đê Giai Cửu Chuyển Đơn", @"Group_ChiTonPhu", @"1. Chí Tôn Phù (VIP)", @"Kinh nghiệm +20%, Tấn công +10%, Phòng thủ +10%, HP/MP +100", @"24 Giờ", @"Độc lập tuyệt đối. Ghi đè hạn dùng mới", @"Bách Bảo Các hoặc sự kiện.", @"Cộng dồn cùng tất cả các loại Hoàn và Thần Đan.", @""),
        new(1008000100, @"Tặng Phẩm Ngũ Sắc Thần Đơn(Event)", @"Group_ChiTonPhu", @"1. Chí Tôn Phù (VIP)", @"Tự động kích hoạt các chức năng hỗ trợ Thần Nông VIP, tăng tỉ lệ rơi đồ và may mắn", @"30 Ngày", @"Độc lập tuyệt đối", @"Bách Bảo Các.", @"Hỗ trợ tự động hóa và tối ưu săn đồ.", @""),

        // ================= GROUP 2: CHÍ TÔN HOÀN =================
        new(1008000169, @"Chí Tôn Hoàn", @"Group_ChiTonHoan", @"2. Chí Tôn Hoàn", @"Tấn công +11%, Phòng thủ +13%, Skill Att +13%, Skill Def +11%, HP +500, EXP +10%", @"24 Giờ", @"Stack song song với Chí Tôn Phù & Cô Điệp Phù. Cùng loại cắn tiếp gia hạn thời gian", @"Mua tại NPC Bình Thập Chỉ tại Huyền Bột Phái (40.000.000 Lượng) hoặc Bách Bảo Các.", @"Cộng dồn 100% song song với Phù VIP và Cô Điệp Phù.", @""),
        new(1008000170, @"Chí Tôn Hoàn (7 ngày)", @"Group_ChiTonHoan", @"2. Chí Tôn Hoàn", @"Tấn công +11%, Phòng thủ +13%, Skill Att +13%, Skill Def +11%, HP +500, EXP +10%", @"7 Ngày", @"Stack song song với Chí Tôn Phù & Cô Điệp Phù. Cùng loại cắn tiếp gia hạn thời gian", @"Mua trong Bách Bảo Các (250 Cash).", @"Cộng dồn 100% song song với Phù VIP và Cô Điệp Phù.", @""),
        new(1008000171, @"Chí Tôn Hoàn (30 ngày)", @"Group_ChiTonHoan", @"2. Chí Tôn Hoàn", @"Tấn công +15%, Phòng thủ +15%, Skill Att +15%, Skill Def +15%, HP +800, EXP +15%", @"30 Ngày", @"Stack song song với Chí Tôn Phù & Cô Điệp Phù. Cùng loại cắn tiếp gia hạn thời gian", @"Mua trong Bách Bảo Các (900 Cash) hoặc sự kiện nạp.", @"Cộng dồn 100% song song với Phù VIP và Cô Điệp Phù.", @""),
        new(1008000248, @"Phúc Thọ Kim Trừ Hoàn (5)", @"Group_ChiTonHoan", @"2. Chí Tôn Hoàn", @"Ban phước kim trừ: Tăng 15% Công/Thủ và phúc thọ may mắn suốt 5 lần đăng nhập", @"5 Lần Đăng Nhập", @"Độc lập. Giảm 1 lượt sau mỗi lần đăng nhập", @"Mua trong Bách Bảo Các (400 Cash).", @"Cộng dồn cùng Chí Tôn Hoàn.", @"Bách Bảo Các"),
        new(1008000049, @"Thiên Võ Kỳ Th", @"Group_ChiTonHoan", @"2. Chí Tôn Hoàn", @"Tăng +10% Công kích và +10% Phòng thủ cơ bản", @"24 Giờ", @"Cộng dồn cùng Phù VIP. Cùng loại gia hạn giờ", @"Mua tại NPC hoặc Bách Bảo Các.", @"Cắn kèm Cô Điệp Phù và Chỉ Thêu để tăng sức phòng thủ.", @""),
        new(1008000050, @"Chí Tôn Kim", @"Group_ChiTonHoan", @"2. Chí Tôn Hoàn", @"Tăng +15% Uy lực võ công, +10% Phòng thủ", @"24 Giờ", @"Cộng dồn cùng Phù VIP. Cùng loại gia hạn giờ", @"Bách Bảo Các hoặc săn Boss Thế Giới.", @"Tối ưu hóa sát thương kỹ năng PK.", @""),
        new(1008000051, @"Chí Tôn Ngân", @"Group_ChiTonHoan", @"2. Chí Tôn Hoàn", @"Tăng +10% Công kích, +10% Phòng thủ, +5% Khí công", @"24 Giờ", @"Cộng dồn cùng Phù VIP. Cùng loại gia hạn giờ", @"Bách Bảo Các.", @"Gia tăng toàn diện sức mạnh phái.", @""),

        // ================= GROUP 3: CÔ ĐIỆP PHÙ =================
        new(1008000243, @"Cô Điệp Phù / Ngải Quả", @"Group_CoDiepPhu", @"3. Cô Điệp Phù", @"Sức tấn công +15%, Phòng thủ +15%, HP +200, Tấn công võ công +3%", @"24 Giờ", @"Stack song song với Chí Tôn Phù & Chí Tôn Hoàn. Cắn tiếp gia hạn thời gian", @"Mua tại NPC Bình Thập Chỉ tại Huyền Bột Phái (30.000.000 Lượng) hoặc Bách Bảo Các (800 Cash).", @"Cộng dồn song song với Chí Tôn Phù & Chí Tôn Hoàn.", @"Bách Bảo Các"),
        new(1008000244, @"Yêu Hóa Ma Võ (đ.biệt)(1)", @"Group_CoDiepPhu", @"3. Cô Điệp Phù", @"Sức tấn công +15%, Phòng thủ +15%, HP +200, Tấn công võ công +3%", @"7 Ngày", @"Stack song song với Chí Tôn Phù & Chí Tôn Hoàn. Cắn tiếp gia hạn thời gian", @"Mua trong Bách Bảo Các (300 Cash).", @"Cộng dồn song song với Chí Tôn Phù & Chí Tôn Hoàn.", @""),
        new(1008000245, @"Tịnh tâm chay", @"Group_CoDiepPhu", @"3. Cô Điệp Phù", @"Sức tấn công +18%, Phòng thủ +18%, HP +300, Tấn công võ công +5%", @"30 Ngày", @"Stack song song với Chí Tôn Phù & Chí Tôn Hoàn. Cắn tiếp gia hạn thời gian", @"Mua trong Bách Bảo Các (1.000 Cash).", @"Cộng dồn song song với Chí Tôn Phù & Chí Tôn Hoàn.", @""),

        // ================= GROUP 4: YÊU HOA THANH THẢO =================
        new(1008000251, @"Yêu Hoa Thanh Thảo — Hoa (24 giờ)", @"Group_YeuHoaThanhThao", @"4. Yêu Hoa Thanh Thảo", @"Kinh nghiệm +5%, Công kích +30, Công kích võ công +3%, Tất cả cấp độ khí công +1", @"24 Giờ", @"Stack song song với toàn bộ các loại Phù. Cắn tiếp gia hạn thời gian", @"Mua tại NPC Bình Thập Chỉ (2.000.000 Lượng) hoặc Bách Bảo Các.", @"Stack cùng tất cả các loại phù khác.", @""),
        new(1008001111, @"Yêu Hoa Thanh Thảo - Kẹo (Ngọt)", @"Group_YeuHoaThanhThao", @"4. Yêu Hoa Thanh Thảo", @"Kẹo ngọt thanh thảo: Kinh nghiệm +10%, Công kích +50, CLVC +5%, Tất cả khí công +1", @"7 Ngày", @"Stack song song với toàn bộ các loại Phù. Cùng loại gia hạn thời gian", @"Mua trong Bách Bảo Các (300 Cash).", @"Cực kỳ tiết kiệm cho 1 tuần luyện cấp.", @"Bách Bảo Các"),
        new(1008001112, @"Yêu Hoa Thanh Thảo - Kẹo (Mật)", @"Group_YeuHoaThanhThao", @"4. Yêu Hoa Thanh Thảo", @"Kẹo mật thanh thảo: Kinh nghiệm +15%, Công kích +80, CLVC +8%, Tất cả khí công +2", @"30 Ngày", @"Stack song song với toàn bộ các loại Phù. Cùng loại gia hạn thời gian", @"Mua trong Bách Bảo Các (1.750 Cash).", @"Gói buff thanh thảo tối thượng suốt 30 ngày.", @"Bách Bảo Các"),
        new(1008000252, @"Sức Mạnh Bóng Đêm(10)", @"Group_YeuHoaThanhThao", @"4. Yêu Hoa Thanh Thảo", @"Kinh nghiệm +5%, Công kích +30, Công kích võ công +3%, Tất cả cấp độ khí công +1", @"7 Ngày", @"Stack song song với toàn bộ các loại Phù. Cắn tiếp gia hạn thời gian", @"Mua trong Bách Bảo Các.", @"Stack cùng tất cả các loại phù khác.", @""),
        new(1008000253, @"Vé vào hôn lễ (long thiệm điện)", @"Group_YeuHoaThanhThao", @"4. Yêu Hoa Thanh Thảo", @"Kinh nghiệm +10%, Công kích +50, Công kích võ công +5%, Tất cả cấp độ khí công +1", @"30 Ngày", @"Stack song song với toàn bộ các loại Phù. Cắn tiếp gia hạn thời gian", @"Mua trong Bách Bảo Các.", @"Stack cùng tất cả các loại phù khác.", @""),
        new(1008000254, @"Vé vào hôn lễ (hoa hôn điện)", @"Group_YeuHoaThanhThao", @"4. Yêu Hoa Thanh Thảo", @"Biến đổi hình dạng vũ khí, tăng +5% Uy lực võ công", @"24 Giờ", @"Cộng dồn cùng Yêu Hoa Thanh Thảo", @"Bách Bảo Các hoặc sự kiện thời trang.", @"Tăng ngoại hình và sức mạnh kỹ năng.", @""),
        new(1008000255, @"Vé vào hôn lễ (thánh lễ điện)", @"Group_YeuHoaThanhThao", @"4. Yêu Hoa Thanh Thảo", @"Phòng thủ +30, Né tránh +50, HP +100", @"24 Giờ", @"Cộng dồn song song cùng Yêu Hoa - Hoa", @"Bách Bảo Các.", @"Tăng phòng ngự bền bỉ.", @""),
        new(1008000256, @"Chí Tôn Hỏa Dương Đơn (3)", @"Group_YeuHoaThanhThao", @"4. Yêu Hoa Thanh Thảo", @"EXP +10%, Lịch luyện +20%, Chính xác +30", @"24 Giờ", @"Cộng dồn song song", @"Bách Bảo Các.", @"Thích hợp luyện cấp.", @""),

        // ================= GROUP 5: CHỈ THÊU LONG HỔ =================
        new(1008001024, @"Bạch Long Chỉ Thêu (24 giờ)", @"Group_ChiTheu", @"5. Chỉ Thêu Long Hổ", @"EXP +15%, Cường Lực Võ Công (CLVC) +5%, HP +200", @"24 Giờ", @"Bạch Long và Hắc Long cắn cùng lúc hưởng cả 2 buff. Cùng loại gia hạn giờ", @"Mua tại NPC Bình Thập Chỉ (200.000.000 Lượng) hoặc Bách Bảo Các.", @"Nên cắn cùng Hắc Long Chỉ Thêu để nhận cả công lẫn thủ.", @""),
        new(1008001025, @"Hắc Long Chỉ Thêu (24 giờ)", @"Group_ChiTheu", @"5. Chỉ Thêu Long Hổ", @"Uy Lực Phòng Thủ (ULPT) +5%, Phòng thủ +50, Né tránh +100", @"24 Giờ", @"Bạch Long và Hắc Long cắn cùng lúc hưởng cả 2 buff. Cùng loại gia hạn giờ", @"Mua tại NPC Bình Thập Chỉ (60.000.000 Lượng) hoặc Bách Bảo Các.", @"Nên cắn cùng Bạch Long Chỉ Thêu để nhận cả công lẫn thủ.", @""),
        new(1008001026, @"Kim Long Chỉ Thêu (7 ngày)", @"Group_ChiTheu", @"5. Chỉ Thêu Long Hổ", @"EXP +15%, Cường Lực Võ Công (CLVC) +5%, HP +200", @"7 Ngày", @"Cộng dồn cùng Hắc Long Chỉ Thêu", @"Mua trong Bách Bảo Các (500 Cash).", @"Cộng dồn cùng Hắc Long Chỉ Thêu.", @""),
        new(1008001027, @"Bích Long Chỉ Thêu (7 ngày)", @"Group_ChiTheu", @"5. Chỉ Thêu Long Hổ", @"Uy Lực Phòng Thủ (ULPT) +5%, Phòng thủ +50, Né tránh +100", @"7 Ngày", @"Cộng dồn cùng Bạch Long Chỉ Thêu", @"Mua trong Bách Bảo Các (500 Cash).", @"Cộng dồn cùng Bạch Long Chỉ Thêu.", @""),
        new(1008001028, @"Xích Long Chỉ Thêu (7 ngày)", @"Group_ChiTheu", @"5. Chỉ Thêu Long Hổ", @"EXP +20%, CLVC +7%, HP +300", @"30 Ngày", @"Cộng dồn cùng Hắc Long Chỉ Thêu", @"Bách Bảo Các hoặc sự kiện nạp.", @"Buff dài hạn tốt nhất cho cày cấp.", @""),
        new(1008001029, @"Bạch Long Chỉ Thêu (7 ngày)", @"Group_ChiTheu", @"5. Chỉ Thêu Long Hổ", @"ULPT +7%, Phòng thủ +70, Né tránh +150", @"30 Ngày", @"Cộng dồn cùng Bạch Long Chỉ Thêu", @"Bách Bảo Các hoặc sự kiện nạp.", @"Buff dài hạn phòng thủ đỉnh cao.", @""),

        // ================= GROUP 6: MA VÕ HẢI SẢN & TƯƠI SỐNG =================
        new(1008000305, @"Yêu Hóa Ma Võ (Hải sản)(đ.biệt)", @"Group_MaVoHaiSan", @"6. Ma Võ Hải Sản & Tươi Sống", @"Tấn công +50, Tất cả khí công +1, HP +100, CLVC +5%", @"24 Giờ", @"Hải Sản và Tươi Sống stack song song. Cùng loại gia hạn giờ", @"Mua tại NPC Bình Thập Chỉ (200.000.000 Lượng) hoặc Bách Bảo Các.", @"Cắn cùng lúc với Tươi Sống để tối ưu cả công và thủ.", @""),
        new(1008000306, @"Yêu Hóa Ma Võ (Tươi sống)(nhỏ)", @"Group_MaVoHaiSan", @"6. Ma Võ Hải Sản & Tươi Sống", @"Tấn công +50, Tất cả khí công +1, HP +100, CLVC +5%", @"7 Ngày", @"Hải Sản và Tươi Sống stack song song. Cùng loại gia hạn giờ", @"Mua trong Bách Bảo Các (400 Cash).", @"Cắn cùng lúc với Tươi Sống để tối ưu cả công và thủ.", @""),
        new(1008000307, @"Yêu Hóa Ma Võ (Tươi sống)(đ.biệt)", @"Group_MaVoHaiSan", @"6. Ma Võ Hải Sản & Tươi Sống", @"Phòng thủ +50, MP +100, Uy lực phòng thủ +5%, Né tránh +50", @"24 Giờ", @"Hải Sản và Tươi Sống stack song song. Cùng loại gia hạn giờ", @"Mua tại NPC Bình Thập Chỉ (100.000.000 Lượng) hoặc Bách Bảo Các.", @"Cắn cùng lúc với Hải Sản để tối ưu cả công và thủ.", @""),
        new(1008000308, @"Yêu Hóa Ma Võ Tươi Sống (7 ngày)", @"Group_MaVoHaiSan", @"6. Ma Võ Hải Sản & Tươi Sống", @"Phòng thủ +50, MP +100, Uy lực phòng thủ +5%, Né tránh +50", @"7 Ngày", @"Hải Sản và Tươi Sống stack song song. Cùng loại gia hạn giờ", @"Mua trong Bách Bảo Các (400 Cash).", @"Cắn cùng lúc với Hải Sản để tối ưu cả công và thủ.", @""),

        // ================= GROUP 7: THẦN THỤ TÂM PHÁP CHÂN ẤN =================
        new(1008001478, @"Thiên Uy Đấu Thần Đan / Thần Thụ Chân Ấn", @"Group_ThanThu", @"7. Thần Thụ Tâm Pháp Chân Ấn", @"Tăng cực đại EXP, Tấn công +100, Tất cả cấp độ khí công +2, CLVC +10%", @"24 Giờ", @"Độc lập đặc biệt. Stack song song với mọi pill khác trong game", @"Mua tại NPC Bình Thập Chỉ tại Huyền Bột Phái (2.000.000.000 Lượng) hoặc Bách Bảo Các (1.000 Cash).", @"Độc lập 100%! Có thể kết hợp cùng mọi loại Phù, Hoàn, Thảo và Thuốc lắc.", @"Bách Bảo Các & NPC BTC"),
        new(1008001479, @"Thân thụ tâm pháp (kỹ năng)", @"Group_ThanThu", @"7. Thần Thụ Tâm Pháp Chân Ấn", @"Tăng mạnh EXP, Tấn công +100, Tất cả cấp độ khí công +2, CLVC +10%", @"7 Ngày", @"Độc lập đặc biệt. Stack song song", @"Bách Bảo Các (800 Cash).", @"Độc lập 100%!", @""),
        new(1008001480, @"Tử Hà Thần Đan (30 ngày )", @"Group_ThanThu", @"7. Thần Thụ Tâm Pháp Chân Ấn", @"Tăng mạnh EXP, Tấn công +120, Tất cả cấp độ khí công +3, CLVC +12%", @"30 Ngày", @"Độc lập đặc biệt. Stack song song", @"Bách Bảo Các hoặc sự kiện nạp.", @"Tuyệt phẩm hỗ trợ tăng sát thương tối thượng.", @""),
        new(1008001814, @"Tử Hà Thần Đan", @"Group_ThanThu", @"7. Thần Thụ Tâm Pháp Chân Ấn", @"Tăng mạnh EXP, Tấn công +100, Tất cả khí công +2, Tỉ lệ bạo kích +5%", @"24 Giờ", @"Độc lập đặc biệt. Stack song song", @"Mua trong Bách Bảo Các (500 Cash).", @"Tuyệt phẩm thần dược cho cả cày cấp lẫn giao tranh PK.", @"Bách Bảo Các"),

        // ================= GROUP 8: THẦN ĐAN BÁCH BẢO =================
        new(1008000041, @"Bá Vương Đơn (24 Giờ)", @"Group_ThanDan", @"8. Thần Đan Bách Bảo", @"Tăng +20% Cường Lực Võ Công (CLVC) và +100 Công kích vật lý", @"24 Giờ", @"Mỗi loại thần đan có slot riêng. Cắn cùng lúc nhận đủ cả 3", @"Mua trong Bách Bảo Các (500 Cash) hoặc săn Boss Dã Ngoại.", @"Cắn cùng lúc Bá Vương Đơn + Siêu Cấp Huyền Sắc + Thái Cực Thần Đơn để tối đa chỉ số.", @"Bách Bảo Các"),
        new(1008000185, @"Siêu Cấp Huyền Sắc Đan", @"Group_ThanDan", @"8. Thần Đan Bách Bảo", @"Tăng +20% Uy Lực Phòng Thủ (ULPT) và +100 Phòng thủ cơ bản", @"24 Giờ", @"Mỗi loại thần đan có slot riêng. Cắn cùng lúc nhận đủ cả 3", @"Mua trong Bách Bảo Các (300 Cash) hoặc săn Boss Dã Ngoại.", @"Bảo vệ nhân vật trước các đòn dứt điểm sát thương lớn.", @"Bách Bảo Các"),
        new(1008000188, @"Thái Cực Thần Đơn", @"Group_ThanDan", @"8. Thần Đan Bách Bảo", @"Tăng +2 Tất cả cấp độ khí công, +500 HP và +500 MP tối đa", @"24 Giờ", @"Mỗi loại thần đan có slot riêng. Cắn cùng lúc nhận đủ cả 3", @"Mua trong Bách Bảo Các (150 Cash).", @"Gia tăng toàn diện lượng máu và điểm khí công phái.", @"Bách Bảo Các"),
        new(1008000197, @"Đại Chiến Thần Đan", @"Group_ThanDan", @"8. Thần Đan Bách Bảo", @"Thần đan chiến tướng: Tăng +15% Công kích, +15% Phòng thủ, +10% CLVC", @"24 Giờ", @"Cộng dồn cùng các loại thần đan khác", @"Mua trong Bách Bảo Các (300 Cash).", @"Dùng khi tham gia Thế Lực Chiến hoặc săn Boss Thế Giới.", @"Bách Bảo Các"),
        new(1008000212, @"Nghịch Thiên Chiến Cuồng Đan (12)", @"Group_ThanDan", @"8. Thần Đan Bách Bảo", @"Cuồng nộ nghịch thiên: Tăng +25% CLVC và +15% Tốc độ xuất chiêu kỹ năng", @"12 Giờ", @"Cộng dồn cùng các loại thần đan khác", @"Mua trong Bách Bảo Các (500 Cash).", @"Tối đa hóa tốc độ combo dồn sát thương PK kết liễu.", @"Bách Bảo Các"),
        new(1008000213, @"Long Lân Hộ Thể Đan (12)", @"Group_ThanDan", @"8. Thần Đan Bách Bảo", @"Vảy rồng hộ thể: Tăng +25% Uy Lực Phòng Thủ và +150 Phòng thủ", @"12 Giờ", @"Cộng dồn cùng các loại thần đan khác", @"Mua trong Bách Bảo Các (500 Cash).", @"Lớp phòng thủ vảy rồng kiên cố chống chịu đòn đánh.", @"Bách Bảo Các"),
        new(1008000533, @"Combo Dược Phẩm", @"Group_ThanDan", @"8. Thần Đan Bách Bảo", @"Gói tổng hợp toàn bộ các loại Thần Đan, Phù VIP, Hoàn và Thảo đỉnh cao nhất", @"Tức thời (Mở Túi)", @"Mở nhận trọn bộ dược phẩm cao cấp", @"Mua trong Bách Bảo Các (38.888 Cash).", @"Gói quà giá trị tối thượng cho đại gia giang hồ.", @"Bách Bảo Các VIP"),
        new(1008000502, @"Túi Quà Truyền Thuyết Bí Lộ", @"Group_ThanDan", @"8. Thần Đan Bách Bảo", @"Mở nhận trọn bộ dược liệu bí truyền và thần đan cổ đại huyền thoại", @"Tức thời (Mở Túi)", @"Mở nhận vật phẩm", @"Mua trong Bách Bảo Các (8.000 Cash).", @"Dược phẩm bí truyền nâng tầm lực chiến.", @"Bách Bảo Các"),
        new(1008000503, @"Túi Quà Hỏa Long Bảo Châu", @"Group_ThanDan", @"8. Thần Đan Bách Bảo", @"Mở nhận linh dược hỏa long, ngọc bảo châu và phù tăng lực", @"Tức thời (Mở Túi)", @"Mở nhận vật phẩm", @"Mua trong Bách Bảo Các (15.000 Cash).", @"Cung cấp tài nguyên đan dược dồi dào.", @"Bách Bảo Các"),
        new(1008000551, @"Bộ PVP Hắc Nguyệt 160", @"Group_ThanDan", @"8. Thần Đan Bách Bảo", @"Gói dược phẩm và trang bị hộ thân chuyên dụng cho giao tranh PVP cấp 160", @"Tức thời (Mở Túi)", @"Mở nhận vật phẩm", @"Mua trong Bách Bảo Các (800 Cash).", @"Trang bị sẵn sàng cho chiến trường PK rực lửa.", @"Bách Bảo Các"),
        new(1008000042, @"Huyền Vũ Hoàn (2 giờ)", @"Group_ThanDan", @"8. Thần Đan Bách Bảo", @"Tăng +20% Uy Lực Phòng Thủ (ULPT)", @"2 Giờ", @"Mỗi loại thần đan có slot riêng. Cắn cùng lúc nhận đủ cả 3", @"Mua trong Bách Bảo Các hoặc săn Boss Dã Ngoại.", @"Cắn cùng lúc Ngũ Sắc + Huyền Vũ + Bách Bảo để nhận đủ 3 dòng thuộc tính.", @""),
        new(1008000043, @"Bách Bảo Đan (24 giờ)", @"Group_ThanDan", @"8. Thần Đan Bách Bảo", @"Tăng +2 Tất cả cấp độ khí công", @"24 Giờ", @"Mỗi loại thần đan có slot riêng. Cắn cùng lúc nhận đủ cả 3", @"Mua trong Bách Bảo Các hoặc đổi thưởng cống hiến bang.", @"Cắn cùng lúc Ngũ Sắc + Huyền Vũ + Bách Bảo để nhận đủ 3 dòng thuộc tính.", @""),
        new(1008000044, @"Vô Song Cửu Chuyển Đơn", @"Group_ThanDan", @"8. Thần Đan Bách Bảo", @"Tăng +30 Công kích và +30 Phòng thủ", @"24 Giờ", @"Cộng dồn cùng các loại thần đan khác", @"Bách Bảo Các hoặc đổi thưởng sự kiện.", @"Dùng khi train quái hoặc tham gia săn Boss.", @""),
        new(1008000045, @"Vô Song Thiên Niên Tuyết Sâm", @"Group_ThanDan", @"8. Thần Đan Bách Bảo", @"Tăng +500 HP và +500 MP tối đa", @"24 Giờ", @"Cộng dồn cùng các loại thần đan khác", @"Bách Bảo Các hoặc đổi thưởng sự kiện.", @"Gia tăng lượng máu và nội lực sinh tồn.", @""),
        new(1008000046, @"Thần Đan Tổng Hợp", @"Group_ThanDan", @"8. Thần Đan Bách Bảo", @"Tăng +50 Tấn công, +50 Phòng thủ, +5% CLVC", @"24 Giờ", @"Cộng dồn cùng các loại thần đan khác", @"Bách Bảo Các.", @"Cực phẩm tăng toàn diện chỉ số.", @""),

        // ================= GROUP 9: EXP & VÕ HUÂN ĐAN =================
        new(1000000290, @"Võ Huân Đan (Ngẫu Nhiên)", @"Group_ExpVoHuan", @"9. EXP & Võ Huân Đan", @"Nhấp chuột phải mở ngẫu nhiên nhận ngay 5.000 ~ 50.000 Điểm Võ Huân", @"Tức thời (Mở Ngay)", @"Cộng trực tiếp điểm Võ Huân vào nhân vật", @"Mua trong Bách Bảo Các (120 Cash) hoặc mở rương sự kiện.", @"Tăng cấp bậc danh xưng và áo choàng võ huân nhanh chóng.", @"Bách Bảo Các"),
        new(1008000016, @"Tiên dược Cần Công Hoàn", @"Group_ExpVoHuan", @"9. EXP & Võ Huân Đan", @"Tăng +20% EXP nhận được khi tiêu diệt quái", @"2 Giờ", @"Cùng bậc gia hạn thời gian; cắn đè bậc cao hơn sẽ thay thế bậc thấp hơn", @"Mua trong Bách Bảo Các hoặc nhận từ bãi quái train.", @"Không cắn đè đan cấp thấp lên đan cấp cao.", @""),
        new(1008000017, @"Thái Cực Hoàn (10)", @"Group_ExpVoHuan", @"9. EXP & Võ Huân Đan", @"Tăng +40% EXP nhận được khi tiêu diệt quái", @"2 Giờ", @"Cùng bậc gia hạn thời gian; cắn đè bậc cao hơn sẽ thay thế bậc thấp hơn", @"Mua trong Bách Bảo Các hoặc mở Hộp Quà Tân Thủ.", @"Không cắn đè đan cấp thấp lên đan cấp cao.", @""),
        new(1008000018, @"Thâm Lam Thần Thảo", @"Group_ExpVoHuan", @"9. EXP & Võ Huân Đan", @"Tăng +60% EXP nhận được khi tiêu diệt quái", @"2 Giờ", @"Cùng bậc gia hạn thời gian; cắn đè bậc cao hơn sẽ thay thế bậc thấp hơn", @"Mua trong Bách Bảo Các hoặc mở Hộp Trang Bị Bảo Hộp.", @"Không cắn đè đan cấp thấp lên đan cấp cao.", @""),
        new(1008000019, @"Bích Lục Thần Thảo", @"Group_ExpVoHuan", @"9. EXP & Võ Huân Đan", @"Tăng +100% EXP nhận được khi tiêu diệt quái", @"2 Giờ", @"Cùng bậc gia hạn thời gian; cắn đè bậc cao hơn sẽ thay thế bậc thấp hơn", @"Mua trong Bách Bảo Các hoặc quà sự kiện Đua Top.", @"Không cắn đè đan cấp thấp lên đan cấp cao.", @""),
        new(1008000020, @"Xuyên Châm Dẫn Tuyến", @"Group_ExpVoHuan", @"9. EXP & Võ Huân Đan", @"Tăng +100% EXP nhận được liên tục trong 24 giờ", @"24 Giờ", @"Gia hạn thời gian khi cắn tiếp", @"Bách Bảo Các hoặc phần thưởng Top 1 TLC.", @"Phù hợp nhất cho cắm máy cày đêm.", @""),
        new(909000031, @"Thẻ Võ Huân (10.000)", @"Group_ExpVoHuan", @"9. EXP & Võ Huân Đan", @"Tăng +50% điểm Võ Huân khi tham gia Thế Lực Chiến và Boss", @"2 Giờ", @"Cùng loại gia hạn thời gian", @"Mở từ Hộp Báu Trang Bị (1000001051) hoặc mua Bách Bảo Các.", @"Cắn trước khi vào map 801 Thế Lực Chiến.", @""),
        new(909000032, @"Thẻ Võ Huân (20.000)", @"Group_ExpVoHuan", @"9. EXP & Võ Huân Đan", @"Tăng +100% điểm Võ Huân khi tham gia Thế Lực Chiến và Boss", @"2 Giờ", @"Cùng loại gia hạn thời gian", @"Mở từ Hộp Báu Trang Bị hoặc Bách Bảo Các.", @"Cắn trước khi vào map 801 Thế Lực Chiến.", @""),
        new(909000033, @"Thẻ Võ Huân (50.000)", @"Group_ExpVoHuan", @"9. EXP & Võ Huân Đan", @"Tăng +150% điểm Võ Huân khi tham gia Thế Lực Chiến và Boss", @"2 Giờ", @"Cùng loại gia hạn thời gian", @"Phần thưởng Top Thế Lực Chiến hoặc Bách Bảo Các.", @"Cắn trước khi vào map 801 Thế Lực Chiến.", @""),
        new(9000085, @"Đoạt Mệnh Đan (2 giờ)", @"Group_ExpVoHuan", @"9. EXP & Võ Huân Đan", @"Tăng +5% Tỉ lệ đòn đánh chí mạng", @"2 Giờ", @"Cùng loại gia hạn giờ", @"Bách Bảo Các hoặc rơi từ Boss.", @"Dùng khi PK hoặc đánh Boss.", @""),
        new(9000120, @"Ngưng Thần Đan (2 giờ)", @"Group_ExpVoHuan", @"9. EXP & Võ Huân Đan", @"Tăng +10% Độ chính xác đòn đánh", @"2 Giờ", @"Cùng loại gia hạn giờ", @"Bách Bảo Các hoặc rơi từ Boss.", @"Dùng khi đối đầu các phái né cao.", @""),

        // ================= GROUP 10: BÌNH MÁU / SÂM SIÊU CẤP AUTO =================
        new(900000731, @"Bơm Đầy Thuốc 1 Chạm", @"Group_BinhMauSamAuto", @"10. Bình HP/MP Siêu Cấp Auto", @"Nạp đầy tức thì 100% dung lượng toàn bộ các loại bình máu và sâm trên người", @"Tức thời (Sử Dụng)", @"Tác dụng nạp đầy toàn bộ bình dược phẩm trên người", @"Mua trong Bách Bảo Các (3.000 Cash).", @"Tiết kiệm công sức mua lại dược phẩm mới.", @"Bách Bảo Các"),
        new(1008000077, @"Vô Song Cửu Chuyển Đan", @"Group_BinhMauSamAuto", @"10. Bình HP/MP Siêu Cấp Auto", @"Lưu trữ 20.000.000 HP siêu khủng, tự động hồi phục tức thì khi máu <= 50%", @"Dung Lượng", @"Lưu trữ dung lượng. Cắn bình mới sẽ GHI ĐÈ dung lượng bình cũ", @"Mua trong Bách Bảo Các (200 Cash).", @"Dung lượng cực đại dùng cho PK Thế Lực Chiến và cày đêm.", @"Bách Bảo Các"),
        new(1008000078, @"Vô Song Thiên Niên Tuyết Sâm", @"Group_BinhMauSamAuto", @"10. Bình HP/MP Siêu Cấp Auto", @"Lưu trữ 20.000.000 MP siêu khủng, tự động hồi phục tức thì khi nội lực <= 30%", @"Dung Lượng", @"Lưu trữ dung lượng. Cắn bình mới sẽ GHI ĐÈ dung lượng bình cũ", @"Mua trong Bách Bảo Các (200 Cash).", @"Dung lượng nội lực vô tận cho train quái xả skill liên tục.", @"Bách Bảo Các"),
        new(1008000009, @"Trường Bạch Đơn", @"Group_BinhMauSamAuto", @"10. Bình HP/MP Siêu Cấp Auto", @"Lưu trữ 5.000.000 MP, tự động hồi phục khi nội lực <= 30%", @"Dung Lượng", @"Lưu trữ dung lượng. Cắn bình mới sẽ GHI ĐÈ dung lượng bình cũ", @"Mua trong Bách Bảo Các (50 Cash) hoặc đổi thưởng sự kiện lớn.", @"Dung lượng sâm cực đại cho train và PK kéo dài.", @"Bách Bảo Các"),
        new(1008000010, @"Tiểu Trường Bạch Đơn", @"Group_BinhMauSamAuto", @"10. Bình HP/MP Siêu Cấp Auto", @"Lưu trữ 2.000.000 MP, tự động hồi phục khi nội lực <= 30%", @"Dung Lượng", @"Lưu trữ dung lượng", @"Mua trong Bách Bảo Các (20 Cash).", @"Dung lượng sâm tiện lợi cho cày cấp.", @"Bách Bảo Các"),
        new(1008000022, @"Trường Bạch Phấn", @"Group_BinhMauSamAuto", @"10. Bình HP/MP Siêu Cấp Auto", @"Lưu trữ 5.000.000 HP, tự động hồi phục khi máu <= 50%", @"Dung Lượng", @"Lưu trữ dung lượng. Cắn bình mới sẽ GHI ĐÈ dung lượng bình cũ", @"Mua trong Bách Bảo Các (50 Cash).", @"Bình máu dung lượng cao chuẩn Bách Bảo Các.", @"Bách Bảo Các"),
        new(1000000113, @"Trường Bạch Sơn Sâm", @"Group_BinhMauSamAuto", @"10. Bình HP/MP Siêu Cấp Auto", @"Lưu trữ 3.000.000 MP thiên nhiên nguyên chất", @"Dung Lượng", @"Lưu trữ dung lượng", @"Mua trong Bách Bảo Các (100 Cash).", @"Hồi phục nội lực dồi dào.", @"Bách Bảo Các"),
        new(1000000122, @"Thanh Tâm Đan", @"Group_BinhMauSamAuto", @"10. Bình HP/MP Siêu Cấp Auto", @"Thanh lọc tâm trí: Hóa giải toàn bộ trạng thái trúng độc và hồi phục 1.000.000 HP", @"Dung Lượng / Hóa Giải", @"Tác dụng giải độc và hồi máu", @"Mua trong Bách Bảo Các (50 Cash).", @"Khắc chế các chiêu thức độc công đối thủ.", @"Bách Bảo Các"),
        new(1008000001, @"Cửu Chuyển Đan (100.000 HP)", @"Group_BinhMauSamAuto", @"10. Bình HP/MP Siêu Cấp Auto", @"Lưu trữ 100.000 HP, tự động hồi phục khi máu <= 50%", @"Dung Lượng", @"Lưu trữ dung lượng. Cắn bình mới sẽ GHI ĐÈ dung lượng bình cũ", @"Mua trong Bách Bảo Các hoặc nhận từ Quà Tân Thủ.", @"Không cắn bình mới khi bình cũ chưa hết điểm tích lũy.", @""),
        new(1008000002, @"Sinh Mệnh Đan (500.000 HP)", @"Group_BinhMauSamAuto", @"10. Bình HP/MP Siêu Cấp Auto", @"Lưu trữ 500.000 HP, tự động hồi phục khi máu <= 50%", @"Dung Lượng", @"Lưu trữ dung lượng. Cắn bình mới sẽ GHI ĐÈ dung lượng bình cũ", @"Mua trong Bách Bảo Các hoặc nhận từ Túi Quà cấp 100.", @"Không cắn bình mới khi bình cũ chưa hết điểm tích lũy.", @""),
        new(1008000003, @"Cửu Chuyển Đơn (Lễ vật)", @"Group_BinhMauSamAuto", @"10. Bình HP/MP Siêu Cấp Auto", @"Lưu trữ 1.000.000 HP, tự động hồi phục khi máu <= 50%", @"Dung Lượng", @"Lưu trữ dung lượng. Cắn bình mới sẽ GHI ĐÈ dung lượng bình cũ", @"Mua trong Bách Bảo Các.", @"Không cắn bình mới khi bình cũ chưa hết điểm tích lũy.", @""),
        new(1008000004, @"Cửu Chuyển Đơn (Siêu Lớn)(Event)", @"Group_BinhMauSamAuto", @"10. Bình HP/MP Siêu Cấp Auto", @"Lưu trữ 5.000.000 HP, tự động hồi phục khi máu <= 50%", @"Dung Lượng", @"Lưu trữ dung lượng. Cắn bình mới sẽ GHI ĐÈ dung lượng bình cũ", @"Bách Bảo Các hoặc phần thưởng Bang Chủ xuất sắc.", @"Bình máu dung lượng cực đại dùng cho PK Thế Lực Chiến.", @""),
        new(1008000005, @"Thiên Niên Tuyết Sâm (Siêu Lớn)(Event)", @"Group_BinhMauSamAuto", @"10. Bình HP/MP Siêu Cấp Auto", @"Lưu trữ 10.000.000 HP siêu khủng, tự động bơm liên tục", @"Dung Lượng", @"Lưu trữ dung lượng", @"Bách Bảo Các hoặc sự kiện lớn.", @"Dung lượng máu vô song cho mọi trận đánh.", @""),
        new(1008000006, @"Thiên Niên Tuyết Sâm (Lễ vật)", @"Group_BinhMauSamAuto", @"10. Bình HP/MP Siêu Cấp Auto", @"Lưu trữ 100.000 MP, tự động hồi phục khi nội lực <= 30%", @"Dung Lượng", @"Lưu trữ dung lượng. Cắn bình mới sẽ GHI ĐÈ dung lượng bình cũ", @"Mua trong Bách Bảo Các hoặc nhận từ Quà Tân Thủ.", @"Không cắn bình mới khi bình cũ chưa hết điểm tích lũy.", @""),
        new(1008000007, @"Cửu Chuyển Đan", @"Group_BinhMauSamAuto", @"10. Bình HP/MP Siêu Cấp Auto", @"Lưu trữ 500.000 MP, tự động hồi phục khi nội lực <= 30%", @"Dung Lượng", @"Lưu trữ dung lượng. Cắn bình mới sẽ GHI ĐÈ dung lượng bình cũ", @"Mua trong Bách Bảo Các hoặc nhận từ Túi Quà cấp 100.", @"Không cắn bình mới khi bình cũ chưa hết điểm tích lũy.", @""),
        new(1008000008, @"Thiên Niên Tuyết Sâm", @"Group_BinhMauSamAuto", @"10. Bình HP/MP Siêu Cấp Auto", @"Lưu trữ 1.000.000 MP, tự động hồi phục khi nội lực <= 30%", @"Dung Lượng", @"Lưu trữ dung lượng. Cắn bình mới sẽ GHI ĐÈ dung lượng bình cũ", @"Mua trong Bách Bảo Các.", @"Không cắn bình mới khi bình cũ chưa hết điểm tích lũy.", @""),

        // ================= GROUP 11: KẸO HỒ LÔ & BÁNH SỰ KIỆN =================
        new(1008000060, @"Kẹo Hồ Lô Công Kích (10)", @"Group_KeoHoLo", @"11. Kẹo Hồ Lô & Bánh Sự Kiện", @"Tăng +20 Công kích cơ bản", @"1 Giờ", @"Khác loại (Công, Thủ, HP) stack song song; cùng loại cắn tiếp gia hạn thời gian", @"Nhận từ sự kiện Lễ Hội, Mưa Lì Xì hoặc đổi quà minigame GM.", @"Cắn cùng lúc 3 loại kẹo: Kẹo Công + Kẹo Thủ + Kẹo HP để tối ưu chỉ số.", @""),
        new(1008000061, @"Kẹo Hồ Lô Phòng Thủ (2)", @"Group_KeoHoLo", @"11. Kẹo Hồ Lô & Bánh Sự Kiện", @"Tăng +20 Phòng thủ cơ bản", @"1 Giờ", @"Khác loại (Công, Thủ, HP) stack song song; cùng loại cắn tiếp gia hạn thời gian", @"Nhận từ sự kiện Lễ Hội, Mưa Lì Xì hoặc đổi quà minigame GM.", @"Cắn cùng lúc 3 loại kẹo: Kẹo Công + Kẹo Thủ + Kẹo HP để tối ưu chỉ số.", @""),
        new(1008000062, @"Kẹo Hồ Lô Sinh Mệnh (2)", @"Group_KeoHoLo", @"11. Kẹo Hồ Lô & Bánh Sự Kiện", @"Tăng +300 HP tối đa", @"1 Giờ", @"Khác loại (Công, Thủ, HP) stack song song; cùng loại cắn tiếp gia hạn thời gian", @"Nhận từ sự kiện Lễ Hội, Mưa Lì Xì hoặc đổi quà minigame GM.", @"Cắn cùng lúc 3 loại kẹo: Kẹo Công + Kẹo Thủ + Kẹo HP để tối ưu chỉ số.", @""),
        new(1008000063, @"Kim Phù Long Bào(30)", @"Group_KeoHoLo", @"11. Kẹo Hồ Lô & Bánh Sự Kiện", @"Tăng +300 MP tối đa", @"1 Giờ", @"Khác loại stack song song; cùng loại gia hạn giờ", @"Nhận từ sự kiện Lễ Hội, Mưa Lì Xì.", @"Cắn kết hợp cùng Kẹo Công và Kẹo Thủ.", @""),
        new(1008000064, @"Kẹo Né Tránh (6)", @"Group_KeoHoLo", @"11. Kẹo Hồ Lô & Bánh Sự Kiện", @"Tăng +30 Điểm né tránh đòn đánh", @"1 Giờ", @"Khác loại stack song song; cùng loại gia hạn giờ", @"Nhận từ sự kiện Lễ Hội.", @"Thích hợp cho Cung Thủ và Thích Khách.", @""),
        new(1008000065, @"Cửu Chuyến Đơn (Thần Thú)", @"Group_KeoHoLo", @"11. Kẹo Hồ Lô & Bánh Sự Kiện", @"Tăng +30 Điểm chính xác đòn đánh", @"1 Giờ", @"Khác loại stack song song; cùng loại gia hạn giờ", @"Nhận từ sự kiện Lễ Hội.", @"Thích hợp khi đối đầu quái/người chơi né cao.", @""),
        new(1008000070, @"Bánh Trung Thu Đặc Biệt", @"Group_KeoHoLo", @"11. Kẹo Hồ Lô & Bánh Sự Kiện", @"Tăng +30 Công kích, +30 Phòng thủ, +300 HP", @"2 Giờ", @"Cùng loại gia hạn thời gian", @"Sự kiện Tết Trung Thu hoặc đổi quà NPC Hồng Nương.", @"Buff toàn diện 3 chỉ số công thủ máu.", @""),
        new(1008000071, @"Bánh Chưng Tết (20%)", @"Group_KeoHoLo", @"11. Kẹo Hồ Lô & Bánh Sự Kiện", @"Tăng +10% EXP nhận được, +20 Công kích, +20 Phòng thủ", @"2 Giờ", @"Cùng loại gia hạn thời gian", @"Sự kiện Tết Nguyên Đán.", @"Buff cày cấp và giao tranh dịp lễ.", @""),
        new(1008000072, @"Sức Phẩm Kỹ Thuật Phù (cao cấp)", @"Group_KeoHoLo", @"11. Kẹo Hồ Lô & Bánh Sự Kiện", @"Tăng +5% Tốc độ di chuyển, +50 HP/MP", @"2 Giờ", @"Cùng loại gia hạn giờ", @"Sự kiện Quốc tế Thiếu nhi.", @"Tăng tốc độ chạy làm nhiệm vụ và săn boss.", @""),
        new(1008000073, @"Phúc vận phù (20%)(Event)", @"Group_KeoHoLo", @"11. Kẹo Hồ Lô & Bánh Sự Kiện", @"Tăng +10% May mắn khi cường hóa và hợp thành, +50 HP", @"2 Giờ", @"Cùng loại gia hạn giờ", @"Sự kiện Lễ Tình Nhân Valentine.", @"Cắn trước khi đập đồ tại Đao Kiếm Tiếu.", @""),

        // ================= GROUP 12: THUỐC LẮC PK & CHIẾN ĐẤU =================
        new(1000000014, @"Tử Hà Đan (Công Kích)", @"Group_ThuocLacPK", @"12. Thuốc Lắc PK & Chiến Đấu", @"Tăng +20 Công kích cơ bản và +5% Cường Lực Võ Công (CLVC)", @"10 Phút", @"Khác dòng chỉ số stack song song; cùng dòng chỉ số cắn tiếp làm mới thời gian", @"Rơi từ quái train tại các bản đồ cấp cao (Nam Lâm, Bắc Hải, Thần Võ Môn) hoặc chế tạo thuốc.", @"Khác dòng chỉ số (Công, Thủ, Né, CX) cắn cùng nhau được hưởng tất cả các dòng.", @""),
        new(1000000015, @"Thanh Can Đan (Phòng Thủ)", @"Group_ThuocLacPK", @"12. Thuốc Lắc PK & Chiến Đấu", @"Tăng +20 Phòng thủ cơ bản và +5% Uy Lực Phòng Thủ (ULPT)", @"10 Phút", @"Khác dòng chỉ số stack song song; cùng dòng chỉ số cắn tiếp làm mới thời gian", @"Rơi từ quái train tại các bản đồ cấp cao hoặc chế tạo thuốc.", @"Khác dòng chỉ số cắn cùng lúc để hưởng trọn vẹn.", @""),
        new(1000000016, @"Sinh Mệnh Đan (HP Tối Đa)", @"Group_ThuocLacPK", @"12. Thuốc Lắc PK & Chiến Đấu", @"Tăng +200 HP tối đa trong thời gian hiệu lực", @"10 Phút", @"Khác dòng chỉ số stack song song; cùng dòng chỉ số cắn tiếp làm mới thời gian", @"Rơi từ quái train tại các bản đồ cấp cao hoặc chế tạo thuốc.", @"Tăng lượng máu tối đa khi giao tranh khốc liệt.", @""),
        new(1000000017, @"Kháng Thể Đan (Kháng Hiệu Ứng)", @"Group_ThuocLacPK", @"12. Thuốc Lắc PK & Chiến Đấu", @"Tăng +15% Kháng tất cả hiệu ứng khống chế (Choáng, Ngã, Chậm)", @"10 Phút", @"Khác dòng chỉ số stack song song; cùng dòng chỉ số cắn tiếp làm mới thời gian", @"Rơi từ quái cao thủ hoặc chế tạo đan dược.", @"Cực kỳ hữu ích trong Thế Lực Chiến và Tỷ Võ.", @""),
        new(1000000018, @"Thần Dũng Đan (Né Tránh)", @"Group_ThuocLacPK", @"12. Thuốc Lắc PK & Chiến Đấu", @"Tăng +30 Điểm né tránh đòn đánh vật lý và võ công", @"10 Phút", @"Khác dòng chỉ số stack song song; cùng dòng chỉ số cắn tiếp làm mới thời gian", @"Rơi từ quái train hoặc chế tạo thuốc.", @"Cộng dồn cùng Tử Hà Đan và Thanh Can Đan.", @""),
        new(1000000019, @"Chính Xác Đan", @"Group_ThuocLacPK", @"12. Thuốc Lắc PK & Chiến Đấu", @"Tăng +30 Điểm chính xác đòn đánh", @"10 Phút", @"Khác dòng chỉ số stack song song; cùng dòng chỉ số cắn tiếp làm mới thời gian", @"Rơi từ quái train hoặc chế tạo thuốc.", @"Cộng dồn cùng Tử Hà Đan và Thanh Can Đan.", @""),
        new(1000000020, @"Dưỡng Thần Đan (Hồi Phục Ngồi)", @"Group_ThuocLacPK", @"12. Thuốc Lắc PK & Chiến Đấu", @"Tăng tốc độ hồi phục HP/MP khi ngồi thiền +50%", @"10 Phút", @"Khác dòng chỉ số stack song song", @"Rơi từ quái train hoặc mua tại tiệm thuốc.", @"Hồi phục nhanh giữa các đợt giao tranh.", @""),
        new(1000000021, @"Hộp Đơn Thanh Bảo", @"Group_ThuocLacPK", @"12. Thuốc Lắc PK & Chiến Đấu", @"Tự động hồi phục +50 HP mỗi 3 giây liên tục", @"10 Phút", @"Cộng dồn cùng Tử Hà Đan", @"Chế tạo dược liệu hoặc bãi train.", @"Tăng độ bền bỉ khi PK dài hơi.", @""),
        new(1000000022, @"Lực Đột Phá Đan", @"Group_ThuocLacPK", @"12. Thuốc Lắc PK & Chiến Đấu", @"Tăng +10% Sát thương đòn đánh vật lý cơ bản", @"10 Phút", @"Cộng dồn cùng Tử Hà Đan", @"Chế tạo thuốc.", @"Tăng sát thương đánh thường.", @""),

        // ================= GROUP 13: TÚI VÕ HOÀNG TỆ =================
        new(909000034, @"Túi Võ Hoàng Tệ (500)", @"Group_TuiVoHoangTe", @"13. Túi Võ Hoàng Tệ", @"Nhấp chuột phải mở nhận ngay 500 điểm Võ Hoàng Tệ vào thanh x/17000", @"Tức thời (Mở Ngay)", @"Vật phẩm mở nhận điểm tức thì vào thanh x/17000. Độc lập, không chiếm slot buff", @"Nhận thưởng khi hoàn thành Nhiệm vụ Bang hằng ngày (!nhanbangquest / !trabangquest) hoặc tham gia Thế Lực Chiến.", @"Vật phẩm mở nhận điểm thẳng vào nhân vật, không bị giới hạn thời gian buff.", @"Nhiệm Vụ Bang Hội & Thế Lực Chiến"),
        new(909000035, @"Túi Võ Hoàng Tệ (1.000)", @"Group_TuiVoHoangTe", @"13. Túi Võ Hoàng Tệ", @"Nhấp chuột phải mở nhận ngay 1.000 điểm Võ Hoàng Tệ vào thanh x/17000", @"Tức thời (Mở Ngay)", @"Vật phẩm mở nhận điểm tức thì vào thanh x/17000. Độc lập, không chiếm slot buff", @"Nhận thưởng khi hoàn thành Nhiệm vụ Bang hằng ngày hoặc Thế Lực Chiến.", @"Vật phẩm mở nhận điểm thẳng vào nhân vật, không bị giới hạn thời gian buff.", @"Nhiệm Vụ Bang Hội & Thế Lực Chiến"),
        new(909000037, @"Túi Võ Hoàng Tệ (3.000)", @"Group_TuiVoHoangTe", @"13. Túi Võ Hoàng Tệ", @"Nhấp chuột phải mở nhận ngay 3.000 điểm Võ Hoàng Tệ vào thanh x/17000", @"Tức thời (Mở Ngay)", @"Vật phẩm mở nhận điểm tức thì vào thanh x/17000. Độc lập, không chiếm slot buff", @"Nhận từ Thế Lực Chiến thắng hoặc Boss Thế Giới.", @"Vật phẩm mở nhận điểm thẳng vào nhân vật, không bị giới hạn thời gian buff.", @"Thế Lực Chiến & Boss"),
        new(909000038, @"Túi Võ Hoàng Tệ (5.000)", @"Group_TuiVoHoangTe", @"13. Túi Võ Hoàng Tệ", @"Nhấp chuột phải mở nhận ngay 5.000 điểm Võ Hoàng Tệ vào thanh x/17000", @"Tức thời (Mở Ngay)", @"Vật phẩm mở nhận điểm tức thì vào thanh x/17000. Độc lập, không chiếm slot buff", @"Nhận từ Top 1 Thế Lực Chiến hoặc Boss Kỳ Lân.", @"Vật phẩm mở nhận điểm thẳng vào nhân vật, không bị giới hạn thời gian buff.", @"Thế Lực Chiến & Boss Kỳ Lân"),
        new(909000036, @"Bát Bảo Võ Hoàng Tệ (10.000)", @"Group_TuiVoHoangTe", @"13. Túi Võ Hoàng Tệ", @"Nhấp chuột phải mở nhận ngay 10.000 điểm Võ Hoàng Tệ vào thanh x/17000", @"Tức thời (Mở Ngay)", @"Vật phẩm mở nhận điểm tức thì vào thanh x/17000. Độc lập, không chiếm slot buff", @"Phần thưởng đặc biệt Đua Top Bang Hội hoặc sự kiện Bang.", @"Vật phẩm mở nhận điểm thẳng vào nhân vật, không bị giới hạn thời gian buff.", @"Đua Top Bang Hội"),
        new(999005005, @"Bát Bảo Võ Hoàng Tệ (10.000) [Special]", @"Group_TuiVoHoangTe", @"13. Túi Võ Hoàng Tệ", @"Nhấp chuột phải mở nhận ngay 10.000 điểm Võ Hoàng Tệ vào thanh x/17000", @"Tức thời (Mở Ngay)", @"Vật phẩm mở nhận điểm tức thì vào thanh x/17000. Độc lập, không chiếm slot buff", @"Phần thưởng đặc biệt Đua Top Bang Hội hoặc sự kiện Bang.", @"Vật phẩm mở nhận điểm thẳng vào nhân vật, không bị giới hạn thời gian buff.", @"Đua Top Bang Hội"),

        // ================= GROUP 14: BÙA THẾ LỰC & BÔNG TLC =================
        new(1008000204, @"Bùa thể lực", @"Group_TlcBonus", @"14. Bùa Thế Lực & Bông TLC", @"Tăng điểm thưởng Thế Lực Chiến, gia tăng sát thương và kháng đòn trong bản đồ TLC 801", @"Thời Gian Trận Đấu", @"Cộng dồn cùng Phù VIP và Thuốc lắc PK. Kích hoạt hiệu ứng trong map TLC", @"Mua tại NPC Tiệm Tạp Hóa hoặc nhận quà chuẩn bị Thế Lực Chiến.", @"Nên cắn ngay khi vào map 801 trước khi vòng đấu bắt đầu.", @"Chiến Trường Thế Lực Chiến (TLC-New)"),
        new(1000000409, @"Bùa Thể Lực (Đặc Biệt)", @"Group_TlcBonus", @"14. Bùa Thế Lực & Bông TLC", @"Tăng mạnh điểm thưởng vinh dự và chỉ số sinh tồn trong Thế Lực Chiến", @"Thời Gian Trận Đấu", @"Gia hạn thời gian khi cắn tiếp", @"Nhận thưởng xếp hạng TLC hoặc mở Hộp Quà Chiến Thắng.", @"Dùng trong các trận TLC quyết định.", @"Thế Lực Chiến"),
        new(1008000388, @"Ngày lễ tết của thế lực (Ăn Mừng Chiến Thắng TLC)", @"Group_TlcBonus", @"14. Bùa Thế Lực & Bông TLC", @"Tăng siêu cấp +300% Kinh Nghiệm (EXP x4 lần) khi đánh quái kéo dài 30 phút / 2 giờ", @"30 Phút / 2 Giờ", @"Hiệu ứng đặc biệt Thế Lực Chiến. Không thể dùng chung với Điện Thạch Chúc Phúc", @"Hệ thống tự động phát vào túi đồ người chơi phe THẮNG ngay khi kết thúc trận Thế Lực Chiến (TLC-New).", @"Cắn ngay sau khi thắng trận TLC để hưởng x4 tốc độ cày cấp trong bãi train.", @"Thế Lực Chiến Thắng (300% EXP)"),
        new(1008000389, @"Quyết tâm của thế lực (Ý Chí Trỗi Dậy TLC)", @"Group_TlcBonus", @"14. Bùa Thế Lực & Bông TLC", @"Tăng +150% Kinh Nghiệm (EXP) khi đánh quái kéo dài 30 phút / 2 giờ", @"30 Phút / 2 Giờ", @"Hiệu ứng đặc biệt Thế Lực Chiến. Không thể dùng chung với Điện Thạch Chúc Phúc", @"Hệ thống tự động phát vào túi đồ người chơi phe THUA sau khi kết thúc trận Thế Lực Chiến (TLC-New).", @"Hỗ trợ phe thất bại nhanh chóng bắt kịp cấp độ.", @"Thế Lực Chiến Thua (150% EXP)"),
        new(1008021836, @"Điện Thạch Chúc Phúc (TLC 300% EXP)", @"Group_TlcBonus", @"14. Bùa Thế Lực & Bông TLC", @"Hào quang thanh khí: Tăng +300% Kinh Nghiệm (EXP x4) kéo dài trong 30 phút", @"30 Phút", @"Không thể dùng chung với Quyết tâm / Ngày lễ tết của thế lực", @"Phần thưởng sự kiện Thế Lực Chiến đặc biệt hoặc Bách Bảo Các.", @"Cắn khi train quái bãi đông.", @"Sự Kiện TLC (300% EXP)"),
        new(1008000441, @"Chiến thắng của Thể Lực", @"Group_TlcBonus", @"14. Bùa Thế Lực & Bông TLC", @"Buff vinh danh phe thắng: +15% EXP, +10% Rơi đồ trong 2 giờ sau trận TLC", @"2 Giờ", @"Tự động kích hoạt hoặc cắn vật phẩm sau trận", @"Phần thưởng dành cho phe chiến thắng Thế Lực Chiến.", @"Tận dụng 2 giờ buff sau TLC để cày cấp bãi train.", @"Thế Lực Chiến Thắng"),
        new(1008000442, @"Bại chiến của Thể Lực", @"Group_TlcBonus", @"14. Bùa Thế Lực & Bông TLC", @"Buff an ủi phe bại: +10% EXP nhận được để phục hồi sức mạnh", @"2 Giờ", @"Tự động kích hoạt sau trận", @"Phần thưởng hỗ trợ phe thất bại Thế Lực Chiến.", @"Dùng để gỡ gạc kinh nghiệm sau trận đấu.", @"Thế Lực Chiến"),

        // ================= GROUP 15: HỘ TÂM & HOÀNG LONG =================
        new(1008000362, @"Hộ Tâm Đan (150%) 2 Giờ", @"Group_ExpHoTam", @"15. Hộ Tâm & Hoàng Long (150% - 300%)", @"Tăng +150% Kinh Nghiệm (EXP) nhận được khi đánh quái", @"2 Giờ", @"Cùng nhóm gia hạn thời gian; cắn đè loại cao hơn sẽ thay thế loại thấp hơn", @"Mua trong Bách Bảo Các (80 Cash).", @"Cực kỳ thích hợp cắn lúc cày cấp tại bãi VIP.", @"Bách Bảo Các"),
        new(1008000363, @"Hộ Tâm Đan (150%) 24 Giờ", @"Group_ExpHoTam", @"15. Hộ Tâm & Hoàng Long (150% - 300%)", @"Tăng +150% Kinh Nghiệm (EXP) liên tục trong 24 giờ", @"24 Giờ", @"Cùng nhóm gia hạn thời gian", @"Mua trong Bách Bảo Các (650 Cash).", @"Phù hợp treo máy cày cấp cả ngày đêm.", @"Bách Bảo Các"),
        new(1008000348, @"Hộ Tâm Đơn (150%) (2 giờ) (Event)", @"Group_ExpHoTam", @"15. Hộ Tâm & Hoàng Long (150% - 300%)", @"Tăng +150% Kinh Nghiệm (EXP) nhận được khi đánh quái", @"2 Giờ", @"Cùng nhóm gia hạn thời gian", @"Nhận từ Sự Kiện Event hoặc Bách Bảo Các.", @"Cắn khi train bãi đông quái.", @"Sự Kiện & Bách Bảo Các"),
        new(1008000349, @"Hộ Tâm Đơn (150%) (24 giờ) (Event)", @"Group_ExpHoTam", @"15. Hộ Tâm & Hoàng Long (150% - 300%)", @"Tăng +150% Kinh Nghiệm (EXP) liên tục trong 24 giờ", @"24 Giờ", @"Cùng nhóm gia hạn thời gian", @"Nhận từ Sự Kiện Event hoặc Bách Bảo Các.", @"Phù hợp treo máy cày cấp cả ngày đêm.", @"Sự Kiện Đặc Biệt"),
        new(1008001518, @"Hộ tâm đơn (150%) (1 ngày)", @"Group_ExpHoTam", @"15. Hộ Tâm & Hoàng Long (150% - 300%)", @"Tăng +150% Kinh Nghiệm (EXP) nhận được trong 24 giờ", @"24 Giờ", @"Cùng nhóm gia hạn thời gian", @"Bách Bảo Các hoặc phần thưởng nạp tích lũy.", @"Cộng dồn cùng Phù VIP và Chí Tôn Hoàn.", @"Bách Bảo Các"),
        new(1008001517, @"Hộ tâm đơn (150%) (30 ngày)", @"Group_ExpHoTam", @"15. Hộ Tâm & Hoàng Long (150% - 300%)", @"Tăng +150% Kinh Nghiệm (EXP) liên tục suốt 30 ngày", @"30 Ngày", @"Cùng nhóm gia hạn thời gian", @"Bách Bảo Các hoặc phần thưởng Đua Top cấp độ.", @"Tối đa hóa tốc độ thăng cấp dài hạn.", @"Bách Bảo Các"),
        new(1008001519, @"Hộ Tâm Đan (150%) (1 ngày) (Event)", @"Group_ExpHoTam", @"15. Hộ Tâm & Hoàng Long (150% - 300%)", @"Tăng +150% Kinh Nghiệm (EXP) nhận được trong 24 giờ", @"24 Giờ", @"Cùng nhóm gia hạn thời gian", @"Sự kiện máy chủ mới hoặc ngày lễ.", @"Cắn kèm EXP Tổ Đội Đa Dạng Nghề để đạt mốc +200% EXP.", @"Sự Kiện Máy Chủ"),
        new(1008000356, @"Gói vật phẩm Hoàng Long Đơn(150%) (2 giờ)", @"Group_ExpHoTam", @"15. Hộ Tâm & Hoàng Long (150% - 300%)", @"Tăng +150% EXP và +50% Điểm kĩ năng rèn luyện", @"2 Giờ", @"Cùng nhóm gia hạn thời gian", @"Bách Bảo Các hoặc đổi quà sự kiện.", @"Vừa lên cấp nhanh vừa tích lũy điểm học võ công.", @"Bách Bảo Các"),
        new(1008000357, @"Gói vật phẩm Hoàng Long Đơn(150%) (24 giờ)", @"Group_ExpHoTam", @"15. Hộ Tâm & Hoàng Long (150% - 300%)", @"Tăng +150% EXP và +50% Điểm kĩ năng rèn luyện liên tục 24h", @"24 Giờ", @"Cùng nhóm gia hạn thời gian", @"Bách Bảo Các.", @"Tối ưu hóa học skill và cày cấp.", @"Bách Bảo Các"),
        new(1008000926, @"Hoàng Long Đơn(150%) (2 giờ)", @"Group_ExpHoTam", @"15. Hộ Tâm & Hoàng Long (150% - 300%)", @"Tăng +150% EXP nhận được khi tiêu diệt quái", @"2 Giờ", @"Cùng nhóm gia hạn thời gian", @"Rơi từ Boss Dã Ngoại hoặc mở Hộp Trang Bị.", @"Dùng khi train bãi đông quái.", @"Boss Dã Ngoại"),
        new(1008000927, @"Hoàng Long Đơn(150%) (24 giờ)", @"Group_ExpHoTam", @"15. Hộ Tâm & Hoàng Long (150% - 300%)", @"Tăng +150% EXP nhận được trong 24 giờ", @"24 Giờ", @"Cùng nhóm gia hạn thời gian", @"Bách Bảo Các hoặc Boss Thế Giới.", @"Dùng khi treo máy luyện cấp.", @"Boss Thế Giới"),
        new(1008000924, @"Hoàng Thánh Đơn(200%) (2 giờ)", @"Group_ExpHoTam", @"15. Hộ Tâm & Hoàng Long (150% - 300%)", @"Tăng siêu cấp +200% Kinh Nghiệm (EXP) khi đánh quái", @"2 Giờ", @"Cùng nhóm gia hạn thời gian; cắn đè loại thấp hơn", @"Phần thưởng Top Đua Cấp hoặc mở Rương Hoàng Kim.", @"Cắn trong giờ vàng nhân đôi exp server để đạt x4 exp.", @"Đua Top Server"),
        new(1008000925, @"Hoàng Thánh Đơn(200%) (24 giờ)", @"Group_ExpHoTam", @"15. Hộ Tâm & Hoàng Long (150% - 300%)", @"Tăng siêu cấp +200% Kinh Nghiệm (EXP) liên tục 24 giờ", @"24 Giờ", @"Cùng nhóm gia hạn thời gian", @"Phần thưởng Top 1 Đua Cấp hoặc Bách Bảo Các.", @"Tốc độ cày cấp nhanh nhất game.", @"Đua Top Server"),
        new(1008000941, @"Huyền Ma Thần Châm (200%) (2 giờ)", @"Group_ExpHoTam", @"15. Hộ Tâm & Hoàng Long (150% - 300%)", @"Tăng +200% EXP và +10% Tấn công võ công", @"2 Giờ", @"Cùng nhóm gia hạn thời gian", @"Săn Boss Nam Lâm hoặc Boss Kỳ Lân.", @"Vừa tăng tốc cày cấp vừa tăng dame diệt quái nhanh.", @"Boss Nam Lâm"),
        new(1008000943, @"Huyền Ma Thần Châm (200%) (24 giờ)", @"Group_ExpHoTam", @"15. Hộ Tâm & Hoàng Long (150% - 300%)", @"Tăng +200% EXP và +10% Tấn công võ công suốt 24h", @"24 Giờ", @"Cùng nhóm gia hạn thời gian", @"Phần thưởng Boss Thế Giới.", @"Trợ thủ đắc lực cho các bãi train cấp cao.", @"Boss Thế Giới"),
        new(1008000942, @"Huyền Ma Thần Đan (150%) (2 giờ)", @"Group_ExpHoTam", @"15. Hộ Tâm & Hoàng Long (150% - 300%)", @"Tăng +150% EXP và +10% Phòng thủ cơ bản", @"2 Giờ", @"Cùng nhóm gia hạn thời gian", @"Săn Boss Dã Ngoại.", @"Bảo vệ an toàn khi cày cấp bãi quái mạnh.", @"Boss Dã Ngoại"),

        // ================= GROUP 16: HỎA LONG & HIỆU ỨNG BIẾN THÂN =================
        new(999001059, @"Hỏa Châu - [Hồng Phấn]", @"Group_HoaDuongDan", @"16. Hỏa Long & Hiệu Ứng Biến Thân", @"Hiệu ứng hào quang hồng phấn huyền ảo bao quanh nhân vật, tăng +30 Công kích và +30 Phòng thủ", @"30 Ngày", @"Trang bị vào ô hiệu ứng hoặc cắn kích hoạt", @"Mua trong Bách Bảo Các (5.888 Cash).", @"Hiệu ứng thị giác rực rỡ và gia tăng lực chiến.", @"Bách Bảo Các"),
        new(999001060, @"Hỏa Châu - [Xanh Dương]", @"Group_HoaDuongDan", @"16. Hỏa Long & Hiệu Ứng Biến Thân", @"Hào quang ngọc lam xanh dương, tăng +20 Công kích, +20 Phòng thủ và +50 Né tránh", @"30 Ngày", @"Trang bị vào ô hiệu ứng", @"Mua trong Bách Bảo Các (3.888 Cash).", @"Hào quang xanh ngọc phong cách.", @"Bách Bảo Các"),
        new(999001061, @"Hỏa Châu - [Xám]", @"Group_HoaDuongDan", @"16. Hỏa Long & Hiệu Ứng Biến Thân", @"Hào quang khí xám ma mị, tăng +15 Công kích và +15 Phòng thủ", @"30 Ngày", @"Trang bị vào ô hiệu ứng", @"Mua trong Bách Bảo Các (2.888 Cash).", @"Khí chất ma đạo huyền bí.", @"Bách Bảo Các"),
        new(999001062, @"Hỏa Châu - [Cam Vàng]", @"Group_HoaDuongDan", @"16. Hỏa Long & Hiệu Ứng Biến Thân", @"Hào quang cam vàng hoàng kim rực rỡ, tăng +10 Công kích và +10 Phòng thủ", @"30 Ngày", @"Trang bị vào ô hiệu ứng", @"Mua trong Bách Bảo Các (1.888 Cash).", @"Hào quang vương giả hoàng tộc.", @"Bách Bảo Các"),
        new(999001063, @"Hỏa Châu - [Đỏ]", @"Group_HoaDuongDan", @"16. Hỏa Long & Hiệu Ứng Biến Thân", @"Hào quang xích hỏa đỏ rực, tăng +5 Công kích và +5 Phòng thủ", @"30 Ngày", @"Trang bị vào ô hiệu ứng", @"Mua trong Bách Bảo Các (800 Cash).", @"Hào quang lửa đỏ nhiệt huyết.", @"Bách Bảo Các"),
        new(900000285, @"Lv5 - Gió Hóa", @"Group_HoaDuongDan", @"16. Hỏa Long & Hiệu Ứng Biến Thân", @"Thần phong biến hóa cấp 5: Tăng 20% tốc độ di chuyển và cuồng phong hộ thể sát thương", @"Vĩnh Viễn / Buff", @"Kỹ năng thần phong hộ thể đặc biệt", @"Mua trong Bách Bảo Các (6.000 Cash).", @"Bứt phá tốc độ di chuyển và độ cơ động.", @"Bách Bảo Các"),
        new(1008002560, @"Rương Báu (Biến Thân - Yết Dụ) (1 ngày)", @"Group_HoaDuongDan", @"16. Hỏa Long & Hiệu Ứng Biến Thân", @"Biến thân thành Boss Yết Dụ dũng mãnh, tăng +100 Công kích và +1000 HP trong 24 giờ", @"24 Giờ", @"Biến hình ngoại hình và chỉ số", @"Mua trong Bách Bảo Các (400 Cash).", @"Trải nghiệm sức mạnh của Boss ma tộc.", @"Bách Bảo Các"),
        new(1008002563, @"Rương Báu (Biến Thân - Yết Dụ) (7 ngày)", @"Group_HoaDuongDan", @"16. Hỏa Long & Hiệu Ứng Biến Thân", @"Biến thân Boss Yết Dụ dũng mãnh suốt 7 ngày, tăng mạnh chỉ số chiến đấu", @"7 Ngày", @"Biến hình ngoại hình", @"Mua trong Bách Bảo Các (1.500 Cash).", @"Duy trì hình thái Boss suốt tuần.", @"Bách Bảo Các"),
        new(1008002566, @"Rương Báu (Biến Thân - Tiểu Thiết Quan) (1 ngày)", @"Group_HoaDuongDan", @"16. Hỏa Long & Hiệu Ứng Biến Thân", @"Biến thân Tiểu Thiết Quan nhanh nhẹn, tăng +50 Né tránh và +10% Tốc độ đánh", @"24 Giờ", @"Biến hình ngoại hình", @"Mua trong Bách Bảo Các (400 Cash).", @"Tăng tốc độ xuất chiêu và né đòn.", @"Bách Bảo Các"),
        new(1008002569, @"Rương Báu (Biến Thân - Tiểu Thiết Quan) (7 ngày)", @"Group_HoaDuongDan", @"16. Hỏa Long & Hiệu Ứng Biến Thân", @"Biến thân Tiểu Thiết Quan nhanh nhẹn suốt 7 ngày", @"7 Ngày", @"Biến hình ngoại hình", @"Mua trong Bách Bảo Các (1.500 Cash).", @"Duy trì hình thái sát thủ nhanh nhẹn.", @"Bách Bảo Các"),

        // ================= GROUP 17: BÍ TRUYỀN & TRANG SỨC ĐẶC BIỆT =================
        new(1000000200, @"Bí Truyền Võ Công (Tấn Công)", @"Group_HealerBuff", @"17. Bí Truyền & Trang Sức Đặc Biệt", @"Sách học bí truyền kỹ năng công kích uy lực cao cho mọi ngành nghề", @"Tức thời (Học Skill)", @"Học kỹ năng mới vĩnh viễn", @"Mua trong Bách Bảo Các (100 Cash).", @"Mở khóa chiêu thức sát thương đặc biệt.", @"Bách Bảo Các"),
        new(1000000213, @"Bí Truyền Võ Công (Hỗ Trợ)", @"Group_HealerBuff", @"17. Bí Truyền & Trang Sức Đặc Biệt", @"Sách học bí truyền kỹ năng trị liệu và buff hộ thân", @"Tức thời (Học Skill)", @"Học kỹ năng hỗ trợ vĩnh viễn", @"Mua trong Bách Bảo Các (100 Cash).", @"Gia tăng khả năng hỗ trợ đồng đội.", @"Bách Bảo Các"),
        new(1008001075, @"Rương Báu Dây Chuyền Ma Diệt (7 Ngày)", @"Group_HealerBuff", @"17. Bí Truyền & Trang Sức Đặc Biệt", @"Mở nhận Dây Chuyền Ma Diệt cấp cao: +50 Phòng thủ, +300 HP hạn 7 ngày", @"7 Ngày", @"Mở ra trang sức trang bị", @"Mua trong Bách Bảo Các (1.200 Cash).", @"Trang sức phòng thủ ma diệt cao cấp.", @"Bách Bảo Các"),
        new(1008001076, @"Rương Báu Nhẫn Ma Diệt (7 Ngày)", @"Group_HealerBuff", @"17. Bí Truyền & Trang Sức Đặc Biệt", @"Mở nhận Nhẫn Ma Diệt: +7% Cường Lực Võ Công, +50 Công kích hạn 7 ngày", @"7 Ngày", @"Mở ra trang sức trang bị", @"Mua trong Bách Bảo Các (1.200 Cash).", @"Trang sức công kích võ công cực mạnh.", @"Bách Bảo Các"),
        new(1008001077, @"Rương Báu Bông Tai Ma Diệt (7 Ngày)", @"Group_HealerBuff", @"17. Bí Truyền & Trang Sức Đặc Biệt", @"Mở nhận Bông Tai Ma Diệt: +3 Tất cả cấp độ khí công, +300 MP hạn 7 ngày", @"7 Ngày", @"Mở ra trang sức trang bị", @"Mua trong Bách Bảo Các (1.200 Cash).", @"Gia tăng cấp độ khí công võ học tối thượng.", @"Bách Bảo Các"),
        new(1008001956, @"Rương Báu Bông Tai Ma Diệt (7 Ngày) (Mai)", @"Group_HealerBuff", @"17. Bí Truyền & Trang Sức Đặc Biệt", @"Bông Tai Ma Diệt chuyên dụng phái Mai Liễu Chân (+3 Khí công, +300 MP)", @"7 Ngày", @"Mở ra trang sức", @"Mua trong Bách Bảo Các (1.200 Cash).", @"Dành riêng cho phái Mai Liễu Chân.", @"Bách Bảo Các"),
        new(1008001957, @"Rương Báu Nhẫn Ma Diệt (7 Ngày) (Mai)", @"Group_HealerBuff", @"17. Bí Truyền & Trang Sức Đặc Biệt", @"Nhẫn Ma Diệt chuyên dụng phái Mai Liễu Chân (+7% CLVC, +50 Công kích)", @"7 Ngày", @"Mở ra trang sức", @"Mua trong Bách Bảo Các (1.200 Cash).", @"Dành riêng cho phái Mai Liễu Chân.", @"Bách Bảo Các"),
        new(1008001958, @"Rương Báu Dây Chuyền Ma Diệt (7 Ngày) (Mai)", @"Group_HealerBuff", @"17. Bí Truyền & Trang Sức Đặc Biệt", @"Dây Chuyền Ma Diệt chuyên dụng phái Mai Liễu Chân (+50 Phòng thủ, +300 HP)", @"7 Ngày", @"Mở ra trang sức", @"Mua trong Bách Bảo Các (1.200 Cash).", @"Dành riêng cho phái Mai Liễu Chân.", @"Bách Bảo Các"),
        new(1000000416, @"Nhẫn Đôi Tình Nhân", @"Group_HealerBuff", @"17. Bí Truyền & Trang Sức Đặc Biệt", @"Nhẫn định tình trọn đời: Tăng +20 Công kích, +20 Phòng thủ và +200 HP/MP cho cặp đôi kết hôn", @"Vĩnh Viễn", @"Trang sức đôi kết hôn", @"Mua trong Bách Bảo Các (1.314 Cash).", @"Minh chứng tình yêu vĩnh cửu và gia tăng chỉ số.", @"Bách Bảo Các"),
        new(1008001993, @"Gói Icon Cún Cưng (7 ngày)", @"Group_HealerBuff", @"17. Bí Truyền & Trang Sức Đặc Biệt", @"Icon danh hiệu cún cưng ngộ nghĩnh trên đầu nhân vật, tăng +10% may mắn", @"7 Ngày", @"Trang bị danh hiệu icon", @"Mua trong Bách Bảo Các (500 Cash).", @"Danh hiệu độc đáo và phong cách.", @"Bách Bảo Các"),

        // ================= GROUP 18: MŨI TÊN & CUNG TIỄN BUFF CUNG THỦ =================
        new(1008000109, @"Kim Cang Đơn (Lễ vật)", @"Group_ArcherArrows", @"18. Mũi Tên & Cung Tiễn Buff Cung Thủ", @"Sức tấn công +80, Né tránh +30, Tốc độ xuất chiêu +5%", @"Vĩnh Viễn / Tiêu Hao", @"Trang bị vào ô Mũi Tên (Slot 13)", @"Bách Bảo Các.", @"Tăng tốc độ xả skill và độ cơ động.", @"Bách Bảo Các"),
        new(1008000110, @"Cành cây phục chế(nhỏ)", @"Group_ArcherArrows", @"18. Mũi Tên & Cung Tiễn Buff Cung Thủ", @"Sức tấn công +100, Bỏ qua 10% phòng thủ đối thủ, CLVC +10%", @"Vĩnh Viễn / Tiêu Hao", @"Trang bị vào ô Mũi Tên (Slot 13)", @"Boss Thế Giới hoặc Đua Top Cung Thủ.", @"Mũi tên thần thoại mạnh nhất dành cho Cung Thủ cao cấp.", @"Boss Thế Giới"),

        // ================= GROUP 19: LINH THÚ & THÚ CƯỠI =================
        new(1008000194, @"Chí Tôn Huyết Thú Đan (3)", @"Group_PetBuff", @"19. Linh Thú & Thú Cưỡi", @"Tăng siêu cấp +300% EXP nuôi dưỡng Linh Thú và hồi phục 100% sinh lực", @"Tức thời (Cắn Ngay)", @"Cắn trực tiếp tăng cấp cho Linh Thú", @"Mua trong Bách Bảo Các (1.200 Cash).", @"Thần dược bứt phá cấp độ thú nuôi nhanh nhất.", @"Bách Bảo Các"),
        new(1008000129, @"Phù Biến Thân Linh Thú", @"Group_PetBuff", @"19. Linh Thú & Thú Cưỡi", @"Biến đổi hình dạng Linh Thú sang hình thái chiến thần hoàng kim huyền ảo", @"30 Ngày", @"Biến hình thú nuôi", @"Mua trong Bách Bảo Các (250 Cash).", @"Thay đổi ngoại hình linh thú bắt mắt.", @"Bách Bảo Các"),
        new(999000055, @"Phù Chuyển Thuộc Tính [Thú Cưng]", @"Group_PetBuff", @"19. Linh Thú & Thú Cưỡi", @"Chuyển đổi toàn bộ chỉ số thuộc tính và cấp độ giữa 2 linh thú an toàn", @"Tức thời", @"Độc lập", @"Mua trong Bách Bảo Các (100 Cash).", @"Tiện lợi khi muốn đổi sang nuôi loại linh thú mới.", @"Bách Bảo Các"),
        new(1008001940, @"Phù Ấp Trứng Linh Sủng Ngay Lập Tức", @"Group_PetBuff", @"19. Linh Thú & Thú Cưỡi", @"Ấp nở trứng linh sủng tức thì trong 1 giây mà không cần chờ thời gian ấp", @"Tức thời", @"Sử dụng khi ấp trứng", @"Mua trong Bách Bảo Các (100 Cash).", @"Nở trứng nhận Pet ngay lập tức.", @"Bách Bảo Các"),
        new(1008001941, @"Phù Tiến Hóa Linh Sủng", @"Group_PetBuff", @"19. Linh Thú & Thú Cưỡi", @"Nâng bậc tiến hóa Linh Sủng lên cấp tiếp theo với tỉ lệ thành công 100%", @"Tiêu Hao Khi Tiến Hóa", @"Dùng khi tiến hóa Pet", @"Mua trong Bách Bảo Các (120 Cash).", @"Tiến hóa linh thú không lo thất bại.", @"Bách Bảo Các"),
        new(1008001942, @"Phù Thanh Ngọc Linh Sủng", @"Group_PetBuff", @"19. Linh Thú & Thú Cưỡi", @"Tăng 50% chỉ số chiến đấu và tốc độ di chuyển cho Linh Sủng trợ chiến", @"30 Ngày", @"Gia hạn khi dùng tiếp", @"Mua trong Bách Bảo Các (150 Cash).", @"Tối ưu hóa khả năng hỗ trợ chiến đấu của Pet.", @"Bách Bảo Các"),
        new(1008001963, @"Túi Phong Ấn Linh Sủng", @"Group_PetBuff", @"19. Linh Thú & Thú Cưỡi", @"Phong ấn linh thú vào túi để cất giữ an toàn hoặc trao đổi buôn bán", @"Tức thời", @"Phong ấn thú nuôi", @"Mua trong Bách Bảo Các (150 Cash).", @"Bảo quản thú nuôi quý giá.", @"Bách Bảo Các"),
        new(1008001988, @"Thạch Lấy Ngọc Linh Sủng", @"Group_PetBuff", @"19. Linh Thú & Thú Cưỡi", @"Tách ngọc đã ốp vào trang bị thú cưng bảo toàn nguyên vẹn 100%", @"Tiêu Hao", @"Tách ngọc Pet", @"Mua trong Bách Bảo Các (1.200 Cash).", @"Thu hồi ngọc quý của trang bị linh thú.", @"Bách Bảo Các"),
        new(1000001446, @"Linh Sủng Đoàn Đoàn", @"Group_PetBuff", @"19. Linh Thú & Thú Cưỡi", @"Triệu hồi Linh Sủng Gấu Trúc Đoàn Đoàn siêu đáng yêu trợ chiến và nhặt đồ", @"Vĩnh Viễn", @"Linh Sủng Trợ Chiến", @"Mua trong Bách Bảo Các (8.000 Cash).", @"Bạn đồng hành trung thành trên mọi nẻo đường giang hồ.", @"Bách Bảo Các"),
        new(1000002004, @"Linh Thú Gấu Trúc", @"Group_PetBuff", @"19. Linh Thú & Thú Cưỡi", @"Linh thú Panda Huyền Thoại với bộ kỹ năng độc nhất vô nhị và sức mạnh vượt trội", @"Vĩnh Viễn", @"Linh Thú Chiến Thần", @"Mua trong Bách Bảo Các (9.999 Cash).", @"Linh thú tối thượng đẳng cấp nhất server.", @"Bách Bảo Các VIP"),
        new(1008001109, @"Rương Báu Yên Ngự Thú (30 ngày)", @"Group_PetBuff", @"19. Linh Thú & Thú Cưỡi", @"Trang bị yên cưỡi tăng +15% tốc độ chạy suốt 30 ngày cho mọi loại thú cưỡi", @"30 Ngày", @"Trang bị yên thú", @"Mua trong Bách Bảo Các (50 Cash).", @"Tăng tốc độ di chuyển khắp các bản đồ.", @"Bách Bảo Các"),
        new(1008001344, @"Rương Báu Yên Ngự Thú - Sinh Mệnh (7 ngày)", @"Group_PetBuff", @"19. Linh Thú & Thú Cưỡi", @"Yên thú cưỡi tăng +500 HP cho nhân vật", @"7 Ngày", @"Trang bị yên thú", @"Mua trong Bách Bảo Các (300 Cash).", @"Gia tăng lượng máu tối đa.", @"Bách Bảo Các"),
        new(1008001345, @"Rương Báu Yên Ngự Thú - Võ Công (7 ngày)", @"Group_PetBuff", @"19. Linh Thú & Thú Cưỡi", @"Yên thú cưỡi tăng +5% Cường Lực Võ Công", @"7 Ngày", @"Trang bị yên thú", @"Mua trong Bách Bảo Các (300 Cash).", @"Tăng sát thương kỹ năng.", @"Bách Bảo Các"),
        new(1008001346, @"Rương Báu Yên Ngự Thú - Võ Phòng (7 ngày)", @"Group_PetBuff", @"19. Linh Thú & Thú Cưỡi", @"Yên thú cưỡi tăng +5% Uy Lực Phòng Thủ", @"7 Ngày", @"Trang bị yên thú", @"Mua trong Bách Bảo Các (300 Cash).", @"Tăng phòng thủ kỹ năng.", @"Bách Bảo Các"),
        new(1008001347, @"Rương Báu Yên Ngự Thú - Tấn Công (7 ngày)", @"Group_PetBuff", @"19. Linh Thú & Thú Cưỡi", @"Yên thú cưỡi tăng +50 Công kích vật lý", @"7 Ngày", @"Trang bị yên thú", @"Mua trong Bách Bảo Các (300 Cash).", @"Tăng sức mạnh đòn đánh.", @"Bách Bảo Các"),
        new(1008001348, @"Rương Báu Yên Ngự Thú - Phòng Ngự (7 ngày)", @"Group_PetBuff", @"19. Linh Thú & Thú Cưỡi", @"Yên thú cưỡi tăng +50 Phòng thủ cơ bản", @"7 Ngày", @"Trang bị yên thú", @"Mua trong Bách Bảo Các (300 Cash).", @"Tăng giáp phòng ngự.", @"Bách Bảo Các"),
        new(1008001349, @"Rương Báu Yên Ngự Thú - KN Linh Thú (7 ngày)", @"Group_PetBuff", @"19. Linh Thú & Thú Cưỡi", @"Yên thú cưỡi tăng +30% EXP nuôi dưỡng Pet", @"7 Ngày", @"Trang bị yên thú", @"Mua trong Bách Bảo Các (300 Cash).", @"Tăng tốc độ luyện cấp cho Pet.", @"Bách Bảo Các"),
        new(1000000065, @"Pet Chuột (Thuần hóa)", @"Group_PetBuff", @"19. Linh Thú & Thú Cưỡi", @"Tăng 50.000 điểm kinh nghiệm nuôi dưỡng Linh Thú và Thú Cưỡi", @"Tức thời (Cắn Ngay)", @"Cắn trực tiếp tăng cấp cho Pet đang triệu hồi", @"Mua tại NPC Huấn Luyện Thú hoặc rơi từ quái train.", @"Triệu hồi Pet ra trước khi cắn đan kinh nghiệm.", @"Huấn Luyện Thú"),
        new(1000000066, @"Pet Chim (Thuần hóa)", @"Group_PetBuff", @"19. Linh Thú & Thú Cưỡi", @"Tăng 200.000 điểm kinh nghiệm nuôi dưỡng Linh Thú", @"Tức thời (Cắn Ngay)", @"Cắn trực tiếp tăng cấp cho Pet", @"Bách Bảo Các hoặc mở hộp quà.", @"Nâng cấp thú nuôi nhanh chóng.", @""),
        new(1000000067, @"Pet Báo (Thuần hóa)", @"Group_PetBuff", @"19. Linh Thú & Thú Cưỡi", @"Tăng 1.000.000 điểm kinh nghiệm nuôi dưỡng Linh Thú", @"Tức thời (Cắn Ngay)", @"Cắn trực tiếp tăng cấp cho Pet", @"Bách Bảo Các hoặc Boss Dã Ngoại.", @"Bứt phá cấp độ Pet lên chuyển chức.", @""),
        new(1000000068, @"Pet Hổ (Thuần hóa)", @"Group_PetBuff", @"19. Linh Thú & Thú Cưỡi", @"Hồi phục 100% độ no và tăng +10% thuộc tính Pet trong 2 giờ", @"2 Giờ", @"Cùng loại gia hạn giờ", @"Mua tại NPC Huấn Luyện Thú.", @"Giữ Pet luôn ở trạng thái no để đạt 100% sức mạnh hỗ trợ.", @""),
        new(1000000069, @"Hồi Sinh Linh Thú", @"Group_PetBuff", @"19. Linh Thú & Thú Cưỡi", @"Hồi sinh Linh Thú ngay lập tức và phục hồi toàn bộ sinh lực", @"Tức thời", @"Sử dụng khi Pet chết", @"Mua tại NPC hoặc Bách Bảo Các.", @"Hồi sinh thú cưng ngay trong trận đánh mà không cần về thành.", @""),
        new(1000000070, @"Tẩy Tủy Đan Linh Thú", @"Group_PetBuff", @"19. Linh Thú & Thú Cưỡi", @"Tẩy toàn bộ điểm tiềm năng đã cộng của Linh Thú để cộng lại từ đầu", @"Tức thời", @"Độc lập", @"Bách Bảo Các.", @"Dùng khi muốn tái phân phối điểm công/thủ cho Pet.", @""),
        new(1008000501, @"Khí Linh Thú Cưỡi", @"Group_PetBuff", @"19. Linh Thú & Thú Cưỡi", @"Tăng +20% sức tấn công và phòng thủ của thú cưỡi, tăng 10% tốc độ chạy", @"30 Ngày", @"Gia hạn khi cắn tiếp", @"Bách Bảo Các.", @"Trang bị cưỡi thú di chuyển thần tốc.", @""),

        // ================= GROUP 20: TẨY ĐIỂM, TẨY KHÍ & ĐỔI TÊN =================
        new(1008000126, @"Phù Đổi Tên", @"Group_ResetChange", @"20. Tẩy Điểm, Tẩy Khí & Đổi Tên", @"Cho phép đổi tên nhân vật đang chơi sang một danh xưng mới", @"Tức thời", @"Độc lập", @"Mua trong Bách Bảo Các (3.000 Cash).", @"Nhập tên mới theo ý muốn và đăng nhập lại.", @"Bách Bảo Các"),
        new(1008000130, @"Cách Thế Truyền Công", @"Group_ResetChange", @"20. Tẩy Điểm, Tẩy Khí & Đổi Tên", @"Truyền toàn bộ cấp độ, khí công và võ công từ nhân vật cũ sang nhân vật mới", @"Tức thời", @"Độc lập", @"Mua trong Bách Bảo Các (3.500 Cash).", @"Chuyển đổi nhân vật chơi mà không mất công cày lại từ đầu.", @"Bách Bảo Các"),
        new(1008002413, @"Đông Lãnh Vong Khước Thảo", @"Group_ResetChange", @"20. Tẩy Điểm, Tẩy Khí & Đổi Tên", @"Tẩy sạch toàn bộ điểm khí công Đông Lãnh để phân phối lại từ đầu", @"Tức thời", @"Sử dụng tức thì", @"Mua trong Bách Bảo Các (200 Cash).", @"Dành cho các phái Đông Lãnh muốn đổi hướng build khí công.", @"Bách Bảo Các"),
        new(1008002416, @"Đông Lãnh Mạnh Bà Trà", @"Group_ResetChange", @"20. Tẩy Điểm, Tẩy Khí & Đổi Tên", @"Tẩy điểm tiềm năng và tái lập toàn bộ chỉ số nhân vật Đông Lãnh", @"Tức thời", @"Sử dụng tức thì", @"Mua trong Bách Bảo Các (1.500 Cash).", @"Tái cơ cấu toàn diện chỉ số võ học.", @"Bách Bảo Các"),
        new(1000000909, @"Phù Giải Trừ An Toàn", @"Group_ResetChange", @"20. Tẩy Điểm, Tẩy Khí & Đổi Tên", @"Giải trừ khóa an toàn khẩn cấp cho tài khoản và trang bị", @"Tức thời", @"Sử dụng tức thì", @"Mua trong Bách Bảo Các (1.800 Cash).", @"Xử lý sự cố quên mật khẩu an toàn trang bị.", @"Bách Bảo Các"),
        new(1000000010, @"Socola (Tẩy Điểm)", @"Group_ResetChange", @"20. Tẩy Điểm, Tẩy Khí & Đổi Tên", @"Tẩy toàn bộ điểm tiềm năng nhân vật để phân phối lại", @"Tức thời", @"Sử dụng tức thì", @"Mua tại Bách Bảo Các hoặc đổi quà sự kiện.", @"Dùng khi muốn điều chỉnh lại toàn bộ hướng build chỉ số nhân vật.", @""),
        new(1000000011, @"Thần Bí Thanh Thảo", @"Group_ResetChange", @"20. Tẩy Điểm, Tẩy Khí & Đổi Tên", @"Phục hồi 100% lượng EXP bị mất do tử vong", @"Tức thời", @"Sử dụng sau khi chết", @"Bách Bảo Các hoặc tiệm thuốc.", @"Cứu vãn điểm kinh nghiệm quý giá khi chết ở cấp cao.", @""),
        new(1000000012, @"Thần Bí Lục Thảo", @"Group_ResetChange", @"20. Tẩy Điểm, Tẩy Khí & Đổi Tên", @"Tẩy sạch toàn bộ điểm khí công đã nâng để cộng lại toàn bộ", @"Tức thời", @"Sử dụng tức thì", @"Bách Bảo Các.", @"Cực kỳ quan trọng khi muốn đổi build khí công PK / Train.", @""),
        new(1008000210, @"Hộp triệu hồi Hồng Bao", @"Group_ResetChange", @"20. Tẩy Điểm, Tẩy Khí & Đổi Tên", @"Cho phép đổi tên nhân vật đang chơi sang một danh xưng mới", @"Tức thời", @"Độc lập", @"Bách Bảo Các.", @"Nhập tên mới theo ý muốn và đăng nhập lại.", @""),
        new(1008000211, @"Chuyển Phái Phù (Chính / Tà)", @"Group_ResetChange", @"20. Tẩy Điểm, Tẩy Khí & Đổi Tên", @"Chuyển đổi thế lực nhân vật từ Chính phái sang Tà phái hoặc ngược lại", @"Tức thời", @"Độc lập", @"Bách Bảo Các hoặc sự kiện GM.", @"Chuyển đổi phe phái và hệ thống kỹ năng tương ứng.", @""),

        // ================= GROUP 21: BÙA MAY MẮN & CƯỜNG HÓA / HỢP THÀNH =================
        new(1008001829, @"Phù May Mắn (30%)", @"Group_EnchantLuck", @"21. Bùa May Mắn & Cường Hóa / Hợp Thành", @"Gia tăng siêu cấp +30% tỉ lệ thành công khi Cường Hóa và Hợp Thành trang bị", @"Tiêu Hao Khi Ép", @"Đặt vào ô Phù May Mắn tại NPC Đao Kiếm Tiếu", @"Mua trong Bách Bảo Các (3.000 Cash).", @"Tỉ lệ may mắn cao nhất dành cho các mốc ép đồ siêu cấp +10 trở lên.", @"Bách Bảo Các"),
        new(1008000137, @"Phù Nâng Cấp Thuộc Tính Thành Phẩm", @"Group_EnchantLuck", @"21. Bùa May Mắn & Cường Hóa / Hợp Thành", @"Nâng cấp dòng thuộc tính trang bị đã hoàn thiện lên bậc cao hơn", @"Tiêu Hao Khi Nâng", @"Dùng khi nâng cấp thuộc tính", @"Mua trong Bách Bảo Các (800 Cash).", @"Tối ưu hóa sức mạnh trang bị đã ốp full dòng.", @"Bách Bảo Các"),
        new(1008001118, @"Phù Nâng Cấp Thuộc Tính Chí Tôn", @"Group_EnchantLuck", @"21. Bùa May Mắn & Cường Hóa / Hợp Thành", @"Nâng cấp thuộc tính chí tôn cho vũ khí và phòng cụ cấp cao", @"Tiêu Hao Khi Nâng", @"Dùng khi nâng cấp", @"Mua trong Bách Bảo Các (800 Cash).", @"Đột phá ngưỡng thuộc tính của trang bị.", @"Bách Bảo Các"),
        new(1008001078, @"Phù Thuộc Tính Áo Choàng Thành Phẩm", @"Group_EnchantLuck", @"21. Bùa May Mắn & Cường Hóa / Hợp Thành", @"Kích hoạt hoặc nâng cấp dòng thuộc tính đặc biệt trên Áo Choàng", @"Tiêu Hao", @"Dùng tại NPC Đao Kiếm Tiếu", @"Mua trong Bách Bảo Các (1.200 Cash).", @"Tăng cường sức mạnh cho trang phục thời trang.", @"Bách Bảo Các"),
        new(1008001134, @"Phù Thuộc Tính Áo Choàng Ngũ Hành (24h)", @"Group_EnchantLuck", @"21. Bùa May Mắn & Cường Hóa / Hợp Thành", @"Gia tăng toàn diện thuộc tính ngũ hành áo choàng (+50 Công/Thủ, +5% CLVC) trong 24h", @"24 Giờ", @"Kích hoạt buff ngũ hành", @"Mua trong Bách Bảo Các (600 Cash).", @"Buff áo choàng thời trang cao cấp.", @"Bách Bảo Các"),
        new(1008000112, @"Phù Lấy Ngọc [Vũ Khí]", @"Group_EnchantLuck", @"21. Bùa May Mắn & Cường Hóa / Hợp Thành", @"Tách lấy lại ngọc đã hợp thành trong Vũ Khí an toàn 100% không làm hỏng phôi", @"Tiêu Hao Khi Tách", @"Dùng tại NPC Đao Kiếm Tiếu", @"Mua trong Bách Bảo Các (500 Cash).", @"Thu hồi các viên ngọc quý giá.", @"Bách Bảo Các"),
        new(1008000115, @"Phù Lấy Ngọc [Phòng Cụ]", @"Group_EnchantLuck", @"21. Bùa May Mắn & Cường Hóa / Hợp Thành", @"Tách lấy lại ngọc đã hợp thành trong Phòng Cụ an toàn 100%", @"Tiêu Hao Khi Tách", @"Dùng tại NPC Đao Kiếm Tiếu", @"Mua trong Bách Bảo Các (250 Cash).", @"Thu hồi ngọc phòng ngự.", @"Bách Bảo Các"),
        new(1008001057, @"Chí Tôn Phù Lấy Ngọc [Vũ Khí]", @"Group_EnchantLuck", @"21. Bùa May Mắn & Cường Hóa / Hợp Thành", @"Tách ngọc vũ khí cao cấp bảo toàn cả vũ khí lẫn toàn bộ số ngọc đã ốp", @"Tiêu Hao", @"Dùng tại NPC Đao Kiếm Tiếu", @"Mua trong Bách Bảo Các (500 Cash).", @"Tách ngọc vũ khí không rủi ro.", @"Bách Bảo Các"),
        new(1008001058, @"Chí Tôn Phù Lấy Ngọc [Phòng Cụ]", @"Group_EnchantLuck", @"21. Bùa May Mắn & Cường Hóa / Hợp Thành", @"Tách ngọc áo/hộ thủ/hài cao cấp bảo toàn 100% ngọc và phòng cụ", @"Tiêu Hao", @"Dùng tại NPC Đao Kiếm Tiếu", @"Mua trong Bách Bảo Các (400 Cash).", @"Tách ngọc phòng ngự tối ưu.", @"Bách Bảo Các"),
        new(1000001168, @"Vải Lấy Ngọc Áo Choàng", @"Group_EnchantLuck", @"21. Bùa May Mắn & Cường Hóa / Hợp Thành", @"Tách ngọc thuộc tính trên Áo Choàng thời trang không mất phôi", @"Tiêu Hao", @"Dùng tại NPC Đao Kiếm Tiếu", @"Mua trong Bách Bảo Các (300 Cash).", @"Bảo tồn áo choàng hiếm.", @"Bách Bảo Các"),
        new(1008001061, @"Phù Chuyển Cường Hóa [Vũ Khí] (Thăng Thiên 4)", @"Group_EnchantLuck", @"21. Bùa May Mắn & Cường Hóa / Hợp Thành", @"Chuyển cấp cường hóa +7..+10 giữa các vũ khí Thăng Thiên 4", @"Tiêu Hao", @"Dùng tại NPC Đao Kiếm Tiếu", @"Mua trong Bách Bảo Các (3.500 Cash).", @"Đổi vũ khí mới giữ nguyên mức đập đồ.", @"Bách Bảo Các"),
        new(1008001062, @"Phù Chuyển Cường Hóa [Phòng Cụ] (Thăng Thiên 4)", @"Group_EnchantLuck", @"21. Bùa May Mắn & Cường Hóa / Hợp Thành", @"Chuyển cấp cường hóa giữa các phòng cụ Thăng Thiên 4", @"Tiêu Hao", @"Dùng tại NPC Đao Kiếm Tiếu", @"Mua trong Bách Bảo Các (3.500 Cash).", @"Đổi áo giáp giữ nguyên cấp cường hóa.", @"Bách Bảo Các"),
        new(1008000072, @"Phù Pha Lê [Trang Sức]", @"Group_EnchantLuck", @"21. Bùa May Mắn & Cường Hóa / Hợp Thành", @"Tăng tỉ lệ cường hóa và hợp thành thành công cho Trang Sức", @"Tiêu Hao", @"Dùng tại NPC Đao Kiếm Tiếu", @"Mua trong Bách Bảo Các (400 Cash).", @"Cường hóa dây chuyền, nhẫn và bông tai.", @"Bách Bảo Các"),
        new(1008001753, @"Hồn Luyện Kim Thuật Sư", @"Group_EnchantLuck", @"21. Bùa May Mắn & Cường Hóa / Hợp Thành", @"Khai mở linh hồn luyện kim, tăng 100% tốc độ và tỉ lệ chế tạo dược phẩm", @"30 Ngày", @"Gia hạn khi dùng tiếp", @"Mua trong Bách Bảo Các (50 Cash).", @"Hữu ích cho các cao thủ chế tạo dược.", @"Bách Bảo Các"),
        new(800000046, @"Kỳ Ngọc Thạch Sơ Cấp", @"Group_EnchantLuck", @"21. Bùa May Mắn & Cường Hóa / Hợp Thành", @"Đá quý sơ cấp dùng hợp thành thuộc tính đặc biệt vào trang bị", @"Tiêu Hao", @"Dùng khi ốp ngọc", @"Mua trong Bách Bảo Các (50 Cash).", @"Nguyên liệu hợp thành căn bản.", @"Bách Bảo Các"),
        new(800000047, @"Kỳ Ngọc Thạch Trung Cấp", @"Group_EnchantLuck", @"21. Bùa May Mắn & Cường Hóa / Hợp Thành", @"Đá quý trung cấp gia tăng uy lực thuộc tính võ học", @"Tiêu Hao", @"Dùng khi ốp ngọc", @"Mua trong Bách Bảo Các (150 Cash).", @"Nguyên liệu hợp thành cao cấp.", @"Bách Bảo Các"),
        new(1000000330, @"Tập Hồn Thạch Trung Cấp", @"Group_EnchantLuck", @"21. Bùa May Mắn & Cường Hóa / Hợp Thành", @"Đá thu thập linh hồn trung cấp để thức tỉnh vũ khí và phòng cụ", @"Tiêu Hao", @"Thức tỉnh trang bị", @"Mua trong Bách Bảo Các (300 Cash).", @"Tăng linh hồn trang bị.", @"Bách Bảo Các"),
        new(1000000365, @"Tập Hồn Thạch Sơ Cấp Thiên Nhiên", @"Group_EnchantLuck", @"21. Bùa May Mắn & Cường Hóa / Hợp Thành", @"Đá thu thập linh hồn thiên nhiên sơ cấp", @"Tiêu Hao", @"Thức tỉnh trang bị", @"Mua trong Bách Bảo Các (150 Cash).", @"Nguyên liệu thức tỉnh.", @"Bách Bảo Các"),
        new(1000001122, @"Tập Hồn Thạch Tứ Thần [Huyền Vũ]", @"Group_EnchantLuck", @"21. Bùa May Mắn & Cường Hóa / Hợp Thành", @"Thần thú Huyền Vũ: Tăng cực đại phòng thủ và kháng sát thương chí mạng", @"Tiêu Hao", @"Thức tỉnh tứ thần", @"Mua trong Bách Bảo Các (1.000 Cash).", @"Thức tỉnh thuộc tính Huyền Vũ.", @"Bách Bảo Các"),
        new(1000001123, @"Tập Hồn Thạch Tứ Thần [Chu Tước]", @"Group_EnchantLuck", @"21. Bùa May Mắn & Cường Hóa / Hợp Thành", @"Thần thú Chu Tước: Tăng sát thương hỏa công thiêu đốt mục tiêu", @"Tiêu Hao", @"Thức tỉnh tứ thần", @"Mua trong Bách Bảo Các (1.000 Cash).", @"Thức tỉnh thuộc tính Chu Tước.", @"Bách Bảo Các"),
        new(1000001124, @"Tập Hồn Thạch Tứ Thần [Bạch Hổ]", @"Group_EnchantLuck", @"21. Bùa May Mắn & Cường Hóa / Hợp Thành", @"Thần thú Bạch Hổ: Tăng sức xuyên giáp và đòn đánh chí mạng", @"Tiêu Hao", @"Thức tỉnh tứ thần", @"Mua trong Bách Bảo Các (1.000 Cash).", @"Thức tỉnh thuộc tính Bạch Hổ.", @"Bách Bảo Các"),
        new(1000001125, @"Tập Hồn Thạch Tứ Thần [Thanh Long]", @"Group_EnchantLuck", @"21. Bùa May Mắn & Cường Hóa / Hợp Thành", @"Thần thú Thanh Long: Tăng toàn diện uy lực võ công và tỉ lệ bạo kích", @"Tiêu Hao", @"Thức tỉnh tứ thần", @"Mua trong Bách Bảo Các (1.000 Cash).", @"Thức tỉnh thuộc tính Thanh Long.", @"Bách Bảo Các"),
        new(1000000853, @"Kim Cương Thủy Ngọc", @"Group_EnchantLuck", @"21. Bùa May Mắn & Cường Hóa / Hợp Thành", @"Ngọc nước kim cương quý hiếm cường hóa trang bị siêu cấp", @"Tiêu Hao", @"Dùng khi ép đồ", @"Mua trong Bách Bảo Các (1.000 Cash).", @"Bảo ngọc cường hóa thượng phẩm.", @"Bách Bảo Các"),
        new(1000000854, @"Kim Ty Nhện", @"Group_EnchantLuck", @"21. Bùa May Mắn & Cường Hóa / Hợp Thành", @"Tơ nhện hoàng kim dùng dệt áo choàng và hợp thành trang bị", @"Tiêu Hao", @"Dùng khi hợp thành", @"Mua trong Bách Bảo Các (500 Cash).", @"Nguyên liệu may dệt hoàng kim.", @"Bách Bảo Các"),
        new(1000000926, @"Bá Ngọc Kim Thạch", @"Group_EnchantLuck", @"21. Bùa May Mắn & Cường Hóa / Hợp Thành", @"Ngọc thạch bá vương cường hóa thuộc tính vũ khí", @"Tiêu Hao", @"Dùng khi ép đồ", @"Mua trong Bách Bảo Các (50 Cash).", @"Ngọc thạch cường hóa.", @"Bách Bảo Các"),
        new(1000000935, @"Bá Ngọc Kim Bách", @"Group_EnchantLuck", @"21. Bùa May Mắn & Cường Hóa / Hợp Thành", @"Bách ngọc hoàng kim nâng cấp chỉ số phòng cụ", @"Tiêu Hao", @"Dùng khi ép đồ", @"Mua trong Bách Bảo Các (50 Cash).", @"Bách ngọc phòng ngự.", @"Bách Bảo Các"),
        new(1008001137, @"Chân Long Bảo Khí [Vũ Khí]", @"Group_EnchantLuck", @"21. Bùa May Mắn & Cường Hóa / Hợp Thành", @"Bảo khí rồng hộ trì vũ khí phát huy 120% uy lực công kích", @"Tiêu Hao", @"Dùng cường hóa vũ khí", @"Mua trong Bách Bảo Các (1.500 Cash).", @"Long khí hộ trì vũ khí.", @"Bách Bảo Các"),
        new(1008001138, @"Chân Long Bảo Cụ [Phòng Cụ]", @"Group_EnchantLuck", @"21. Bùa May Mắn & Cường Hóa / Hợp Thành", @"Bảo cụ rồng hộ trì phòng cụ tăng 120% sức phòng thủ", @"Tiêu Hao", @"Dùng cường hóa phòng cụ", @"Mua trong Bách Bảo Các (1.200 Cash).", @"Long cụ hộ trì áo giáp.", @"Bách Bảo Các"),
        new(1008000080, @"Thiên Niên Tuyết Sâm (Vô Song)(Event)", @"Group_EnchantLuck", @"21. Bùa May Mắn & Cường Hóa / Hợp Thành", @"Gia tăng +1% tỉ lệ thành công khi cường hóa và hợp thành trang bị", @"Tiêu Hao Khi Ép", @"Đặt vào ô Phù May Mắn tại NPC Đao Kiếm Tiếu", @"Rơi từ quái train hoặc mở rương.", @"Tăng tỉ lệ thành công khi đập đồ.", @""),
        new(1008000081, @"Phù May Mắn (3%)", @"Group_EnchantLuck", @"21. Bùa May Mắn & Cường Hóa / Hợp Thành", @"Gia tăng +3% tỉ lệ thành công khi cường hóa và hợp thành trang bị", @"Tiêu Hao Khi Ép", @"Đặt vào ô Phù May Mắn", @"Rơi từ quái train hoặc mở rương.", @"Tăng tỉ lệ thành công khi đập đồ.", @""),
        new(1008000083, @"Phù May Mắn (10%)", @"Group_EnchantLuck", @"21. Bùa May Mắn & Cường Hóa / Hợp Thành", @"Gia tăng +10% tỉ lệ thành công khi cường hóa và hợp thành trang bị", @"Tiêu Hao Khi Ép", @"Đặt vào ô Phù May Mắn", @"Bách Bảo Các hoặc Boss Dã Ngoại.", @"Dùng khi ép đồ cấp cao từ +6 trở lên.", @""),
        new(1008000084, @"Phù May Mắn (15%)", @"Group_EnchantLuck", @"21. Bùa May Mắn & Cường Hóa / Hợp Thành", @"Gia tăng +15% tỉ lệ thành công khi cường hóa và hợp thành trang bị", @"Tiêu Hao Khi Ép", @"Đặt vào ô Phù May Mắn", @"Bách Bảo Các hoặc săn Boss Thế Giới.", @"Dùng khi ép đồ giá trị cao từ +8 trở lên.", @""),
        new(1008000085, @"Phù May Mắn (20%)", @"Group_EnchantLuck", @"21. Bùa May Mắn & Cường Hóa / Hợp Thành", @"Gia tăng +20% tỉ lệ thành công khi cường hóa và hợp thành trang bị", @"Tiêu Hao Khi Ép", @"Đặt vào ô Phù May Mắn", @"Sự kiện Đua Top hoặc Boss Kỳ Lân.", @"Bùa may mắn cao cấp cho các mốc cường hóa +10.", @""),
        new(1008000086, @"Phù May Mắn (25%)", @"Group_EnchantLuck", @"21. Bùa May Mắn & Cường Hóa / Hợp Thành", @"Gia tăng siêu cấp +25% tỉ lệ thành công khi cường hóa và hợp thành", @"Tiêu Hao Khi Ép", @"Đặt vào ô Phù May Mắn", @"Phần thưởng Top 1 Sự Kiện.", @"Tỉ lệ may mắn cao nhất server.", @""),
        new(1008000090, @"Kim Phù (Bảo Vệ Cường Hóa)", @"Group_EnchantLuck", @"21. Bùa May Mắn & Cường Hóa / Hợp Thành", @"Bảo vệ trang bị không bị phá hủy khi cường hóa thất bại", @"Tiêu Hao Khi Thất Bại", @"Đặt vào ô bảo hiểm khi đập đồ", @"Bách Bảo Các hoặc đổi thưởng bang hội.", @"Bảo hiểm tuyệt đối cho vũ khí và trang bị quý giá.", @""),
        new(1008000091, @"Ngân Phù (Bảo Vệ Hợp Thành)", @"Group_EnchantLuck", @"21. Bùa May Mắn & Cường Hóa / Hợp Thành", @"Bảo vệ các dòng hợp thành đã có không bị mất khi hợp thành xịt", @"Tiêu Hao Khi Thất Bại", @"Đặt vào ô bảo hiểm khi ốp ngọc", @"Bách Bảo Các.", @"Giữ nguyên 3 dòng ngọc quý khi cố ốp dòng 4.", @""),
        new(1008000092, @"Thần Nông Khí Phù", @"Group_EnchantLuck", @"21. Bùa May Mắn & Cường Hóa / Hợp Thành", @"Tăng 100% tỉ lệ thành công khi hợp thành ngọc dòng 1 và dòng 2", @"Tiêu Hao", @"Đặt khi ốp ngọc", @"Bách Bảo Các.", @"Tiết kiệm ngọc và tiền khi build đồ mới.", @""),

        // ================= GROUP 22: TRÀ ĐẠO & NGƯNG THẦN CHÂU =================
        new(1008000282, @"Ngưng Thần Châu (20 Tỷ)", @"Group_TeaWine", @"22. Trà Đạo & Tiệc Rượu Bang Hội", @"Lưu trữ và ngưng tụ 20.000.000.000 điểm kinh nghiệm, cắn trực tiếp tăng cấp siêu tốc", @"Tức thời (Cắn Ngay)", @"Cắn trực tiếp tăng cấp", @"Mua trong Bách Bảo Các (500 Cash).", @"Kho báu kinh nghiệm lớn nhất game.", @"Bách Bảo Các"),
        new(1008000280, @"Ngưng Thần Châu (Liên) (50 triệu)", @"Group_TeaWine", @"22. Trà Đạo & Tiệc Rượu Bang Hội", @"Tăng +30 Sức tấn công và +100 HP, tăng tinh thần chiến đấu", @"2 Giờ", @"Cộng dồn cùng các loại Phù và Hoàn", @"Sự kiện Bang Hội, Lễ Hội Rượu hoặc đổi điểm cống hiến.", @"Cực kỳ thích hợp uống trước khi mở tiệc bang hội hoặc đi săn Boss.", @""),
        new(1008000281, @"Ngưng Thần Châu (Liên) (100 triệu)", @"Group_TeaWine", @"22. Trà Đạo & Tiệc Rượu Bang Hội", @"Tăng +30 Phòng thủ và +100 MP, giảm sát thương nhận vào", @"2 Giờ", @"Cộng dồn cùng các loại Phù và Hoàn", @"Đổi quà sự kiện Lễ Hội.", @"Gia tăng khả năng chống chịu.", @""),
        new(1008000285, @"Ngưng Thần Châu (Liên) (80 triệu)", @"Group_TeaWine", @"22. Trà Đạo & Tiệc Rượu Bang Hội", @"Tăng +30 Điểm chính xác và thanh tẩy tâm trí, giảm tiêu hao MP 20%", @"2 Giờ", @"Cộng dồn cùng các loại Phù", @"Mua tại NPC Trà Quán hoặc hái lượm.", @"Tiết kiệm mana khi spam võ công kéo dài.", @""),
        new(1008000286, @"Ngưng Thần Châu (Liên) (90 triệu)", @"Group_TeaWine", @"22. Trà Đạo & Tiệc Rượu Bang Hội", @"Tăng +30 Điểm né tránh và tăng tốc độ hồi sinh lực khi ngồi", @"2 Giờ", @"Cộng dồn cùng các loại Phù", @"Mua tại NPC Trà Quán.", @"Hỗ trợ né đòn và hồi máu hiệu quả.", @""),
        new(1008000287, @"Bích Loa Xuân (2 giờ)", @"Group_TeaWine", @"22. Trà Đạo & Tiệc Rượu Bang Hội", @"Tăng +10% Tốc độ di chuyển và +1 Cấp độ toàn bộ khí công", @"2 Giờ", @"Cộng dồn cùng các loại Phù", @"Sự kiện Trà Đạo Giang Hồ.", @"Gia tăng độ linh hoạt và sức mạnh võ học.", @""),

        // ================= GROUP 23: THỔ LINH PHÙ & DỊCH CHUYỂN / TIỆN ÍCH =================
        new(1008000142, @"Phù Sinh Tử (5)", @"Group_TeleportScrolls", @"23. Thổ Linh Phù & Dịch Chuyển", @"Bùa sinh tử: Hồi sinh tại chỗ 5 lần với 100% HP/MP và không bị mất điểm kinh nghiệm", @"5 Lần Dùng", @"Tiêu hao 1 lần khi hồi sinh", @"Mua trong Bách Bảo Các (500 Cash).", @"Cực kỳ đắc lực khi PK săn Boss hoặc tham gia Thế Lực Chiến.", @"Bách Bảo Các"),
        new(1008001190, @"Vé Vào Nơi Tu Luyện (2h)", @"Group_TeleportScrolls", @"23. Thổ Linh Phù & Dịch Chuyển", @"Vé thông hành dịch chuyển vào bản đồ Tu Luyện bãi quái VIP nhân đôi EXP trong 2 giờ", @"2 Giờ", @"Kích hoạt vào map tu luyện", @"Mua trong Bách Bảo Các (300 Cash).", @"Bãi quái VIP không bị quấy rầy.", @"Bách Bảo Các"),
        new(1008001328, @"Vé Vào Lăng Bị Lãng Quên (2h)", @"Group_TeleportScrolls", @"23. Thổ Linh Phù & Dịch Chuyển", @"Vé thông hành dịch chuyển vào Lăng Bị Lãng Quên săn trang bị hiếm suốt 2 giờ", @"2 Giờ", @"Kích hoạt vào lăng", @"Mua trong Bách Bảo Các (400 Cash).", @"Săn đồ và nguyên liệu quý hiếm.", @"Bách Bảo Các"),
        new(1008001513, @"Vé Vào Đảo Pi Pi (24h)", @"Group_TeleportScrolls", @"23. Thổ Linh Phù & Dịch Chuyển", @"Vé nghỉ dưỡng và săn Boss Đảo Pi Pi suốt 24 giờ", @"24 Giờ", @"Kích hoạt vào đảo", @"Mua trong Bách Bảo Các (800 Cash).", @"Bản đồ đặc biệt với lượng phần thưởng giá trị.", @"Bách Bảo Các"),
        new(1008002585, @"Vòng Tay Thông Hành (24h)", @"Group_TeleportScrolls", @"23. Thổ Linh Phù & Dịch Chuyển", @"Vòng tay đặc quyền di chuyển tự do vào tất cả các phụ bản VIP suốt 24 giờ", @"24 Giờ", @"Đặc quyền dịch chuyển", @"Mua trong Bách Bảo Các (800 Cash).", @"Tự do khám phá mọi phụ bản bí cảnh.", @"Bách Bảo Các"),
        new(1007000025, @"Sư Tử Hống Toàn Server (50)", @"Group_TeleportScrolls", @"23. Thổ Linh Phù & Dịch Chuyển", @"Phát loa truyền thanh thông điệp màu vàng trên toàn bộ máy chủ 50 lần", @"50 Lần", @"Tiêu hao 1 lần/tin nhắn", @"Mua trong Bách Bảo Các (1.200 Cash).", @"Giao lưu và buôn bán toàn server.", @"Bách Bảo Các"),
        new(1007000029, @"Sinh Nhật - Sư Tử Hống Toàn Server (50)", @"Group_TeleportScrolls", @"23. Thổ Linh Phù & Dịch Chuyển", @"Loa phát thanh sự kiện sinh nhật với hiệu ứng pháo hoa rực rỡ 50 lần", @"50 Lần", @"Tiêu hao 1 lần/tin nhắn", @"Mua trong Bách Bảo Các (1.500 Cash).", @"Hiệu ứng pháo hoa sinh nhật nổi bật.", @"Bách Bảo Các"),
        new(999001073, @"[Lệnh Bài Treo Máy Đám Mây]", @"Group_TeleportScrolls", @"23. Thổ Linh Phù & Dịch Chuyển", @"Lệnh bài ủy thác offline: Tự động train quái và nhặt đồ khi tắt máy tính suốt 30 ngày", @"30 Ngày", @"Kích hoạt ủy thác offline", @"Mua trong Bách Bảo Các (15.000 Cash).", @"Treo máy không lo hao mòn máy tính hay mất điện.", @"Bách Bảo Các VIP"),
        new(1008000145, @"Thẻ Gia Hạn Túi Đồ (30 ngày)", @"Group_TeleportScrolls", @"23. Thổ Linh Phù & Dịch Chuyển", @"Mở rộng thêm 36 ô hành trang phụ trong 30 ngày", @"30 Ngày", @"Gia hạn túi", @"Mua trong Bách Bảo Các (150 Cash).", @"Tăng gấp đôi sức chứa vật phẩm.", @"Bách Bảo Các"),
        new(1008000146, @"Thẻ Gia Hạn Túi Đồ (60 ngày)", @"Group_TeleportScrolls", @"23. Thổ Linh Phù & Dịch Chuyển", @"Mở rộng thêm 36 ô hành trang phụ trong 60 ngày", @"60 Ngày", @"Gia hạn túi", @"Mua trong Bách Bảo Các (300 Cash).", @"Tiện lợi chứa đồ dài hạn suốt 2 tháng.", @"Bách Bảo Các"),
        new(1008001507, @"Túi Đồ Áo Choàng", @"Group_TeleportScrolls", @"23. Thổ Linh Phù & Dịch Chuyển", @"Mở rộng ngăn chứa chuyên dụng cho bộ sưu tập áo choàng thời trang", @"Vĩnh Viễn", @"Mở rộng túi áo choàng", @"Mua trong Bách Bảo Các (288 Cash).", @"Thỏa sức lưu giữ áo choàng thời trang.", @"Bách Bảo Các"),
        new(1008000216, @"Chìa Khóa Kho Báu", @"Group_TeleportScrolls", @"23. Thổ Linh Phù & Dịch Chuyển", @"Chìa khóa vạn năng mở Rương Kho Báu và Rương Phong Ấn Bách Bảo", @"Tiêu Hao Khi Mở", @"Mở rương kho báu", @"Mua trong Bách Bảo Các (35 Cash).", @"Mở khóa các phần thưởng giá trị ẩn giấu.", @"Bách Bảo Các"),
        new(1000000426, @"Rương Phong Ấn", @"Group_TeleportScrolls", @"23. Thổ Linh Phù & Dịch Chuyển", @"Rương phong ấn cổ đại chứa vũ khí và bí kíp võ công thất truyền", @"Tức thời (Cần Chìa)", @"Dùng Chìa Khóa Kho Báu mở", @"Mua trong Bách Bảo Các (188 Cash).", @"Tìm kiếm bí kíp và trang bị quý hiếm.", @"Bách Bảo Các"),
        new(1008000131, @"Túi Đồ Hiệp Khách (Rương Báu)", @"Group_TeleportScrolls", @"23. Thổ Linh Phù & Dịch Chuyển", @"Túi quà hiệp khách chứa dược phẩm hồi phục và vé phụ bản", @"Tức thời (Mở Túi)", @"Mở nhận quà", @"Mua trong Bách Bảo Các (50 Cash).", @"Túi quà hỗ trợ hiệp khách phiêu bạt.", @"Bách Bảo Các"),
        new(1008000025, @"Hộ Linh Phu", @"Group_TeleportScrolls", @"23. Thổ Linh Phù & Dịch Chuyển", @"Cho phép ghi nhớ và dịch chuyển tức thì đến 30 vị trí bất kỳ trên bản đồ", @"24 Giờ", @"Độc lập. Cắn mới gia hạn thời gian", @"Mua tại NPC Bình Thập Chỉ hoặc Bách Bảo Các.", @"Công cụ không thể thiếu để đi lại bãi train và săn Boss.", @""),
        new(1008000026, @"Giải Thạch Phu", @"Group_TeleportScrolls", @"23. Thổ Linh Phù & Dịch Chuyển", @"Cho phép ghi nhớ và dịch chuyển tức thì đến 30 vị trí bất kỳ trên bản đồ", @"7 Ngày", @"Độc lập. Cắn mới gia hạn thời gian", @"Bách Bảo Các.", @"Tiện lợi duy trì suốt tuần cày cấp.", @""),
        new(1008000027, @"Vô Cực Kim Tôn Phù (30 ngày)", @"Group_TeleportScrolls", @"23. Thổ Linh Phù & Dịch Chuyển", @"Cho phép ghi nhớ và dịch chuyển tức thì đến 50 vị trí cao cấp khắp giang hồ", @"30 Ngày", @"Độc lập. Cắn mới gia hạn thời gian", @"Bách Bảo Các.", @"Gói dịch chuyển tối thượng dài hạn.", @""),
        new(1008000021, @"Hồi Thành Phù", @"Group_TeleportScrolls", @"23. Thổ Linh Phù & Dịch Chuyển", @"Dịch chuyển tức thì nhân vật trở về điểm hồi sinh của thành trì gần nhất", @"Tức thời (Tiêu Hao)", @"Tiêu hao 1 lá bùa khi dùng", @"Mua tại NPC Tiệm Tạp Hóa ở mọi thành trì.", @"Về thành nhanh chóng khi hoàn thành nhiệm vụ hoặc hết dược phẩm.", @""),
        new(1008000022, @"Trướng bạch đan ( Hồng)", @"Group_TeleportScrolls", @"23. Thổ Linh Phù & Dịch Chuyển", @"Dịch chuyển tức thì đến vị trí của thành viên tổ đội hoặc bạn bè", @"Tức thời (Tiêu Hao)", @"Tiêu hao khi dùng", @"Bách Bảo Các hoặc đổi điểm bang.", @"Tập hợp đội hình tức thì khi có giao tranh hoặc săn boss.", @""),

        // ================= GROUP 24: THUỐC EVENT / BÁCH BẢO CÁC PHÁT SINH =================
        new(1008000055, @"Ngũ Sắc Thần Đan", @"Group_ThuocSuKien", @"24. Thuốc Event & Bách Bảo Các Phát Sinh", @"Tấn công +10%, Phòng thủ +10%, Cường hóa áo +1, Cường hóa vũ khí +2, HP +300", @"1 Giờ", @"Thuốc cộng nhiều chỉ số. Cùng slot chỉ số thì ưu tiên loại mạnh hơn hoặc gia hạn thời gian theo code.", @"Ghi nhận dùng thực tế trong log thuốc và Bách Bảo Các/event.", @"Đưa vào ma trận cộng dồn theo các slot Tấn công, Phòng thủ, Cường hóa và HP.", @"Log thuốc 24log + Bách Bảo Các"),
        new(1008000082, @"Ngũ Sắc Thần Đan (24h)", @"Group_ThuocSuKien", @"24. Thuốc Event & Bách Bảo Các Phát Sinh", @"HP +300, Tấn công +10%, Phòng thủ +10%, hiệu lực 24 giờ", @"24 Giờ", @"Thuốc cộng chỉ số theo thời gian, không xếp chung với bùa may mắn ép đồ.", @"Bách Bảo Các hoặc sự kiện.", @"Cần xử lý như pill chỉ số, không tính là Phù May Mắn.", @"Bách Bảo Các / Event"),
        new(1008000162, @"Huyền Vũ Hoàn", @"Group_ThuocSuKien", @"24. Thuốc Event & Bách Bảo Các Phát Sinh", @"EXP +40%, lịch luyện/skill EXP tăng, Tấn công +10%, Phòng thủ +10%, Cường hóa vũ khí +2, Cường hóa áo +1", @"1 Giờ", @"Thuốc cộng nhiều chỉ số. Cùng nhóm hiệu ứng cao hơn sẽ thay thế thấp hơn nếu trùng slot.", @"Ghi nhận dùng thực tế trong log thuốc.", @"Đưa vào ma trận slot EXP, Tấn công, Phòng thủ, Cường hóa.", @"Log thuốc 24log"),
        new(1008000187, @"Vô Cực", @"Group_ThuocSuKien", @"24. Thuốc Event & Bách Bảo Các Phát Sinh", @"HP +300, tất cả khí công +1", @"Theo thời hạn vật phẩm", @"Thuốc cộng HP và khí công. Cắn trùng cần kiểm tra slot khí công để tránh cộng lố.", @"Ghi nhận dùng thực tế trong log thuốc.", @"Đưa vào slot HP và Khí công.", @"Log thuốc 24log"),
        new(1008000232, @"Mèo Tài Phú", @"Group_ThuocSuKien", @"24. Thuốc Event & Bách Bảo Các Phát Sinh", @"Rơi đồ +20%, tiền +40%, HP +100", @"2 Giờ / 10 lần dùng", @"Thuốc event có chỉ số nhân vật và drop/tiền. Cùng loại gia hạn hoặc giảm lượt theo code.", @"Ghi nhận dùng thực tế trong log thuốc.", @"Đưa vào slot Rơi đồ, Tiền và HP.", @"Log thuốc 24log"),
        new(1008000326, @"Yêu Hoa Thanh Thảo - World Cup 24h", @"Group_ThuocSuKien", @"24. Thuốc Event & Bách Bảo Các Phát Sinh", @"Tấn công +40, Phòng thủ +40, Công kích võ công +5%, EXP +10%, HP +300", @"24 Giờ", @"Thuốc event cộng nhiều chỉ số, cần gom chung họ Yêu Hoa khi xét trùng.", @"Ghi nhận dùng thực tế trong log thuốc.", @"Đưa vào slot Tấn công, Phòng thủ, CLVC, EXP và HP.", @"Log thuốc 24log"),
        new(1007000007, @"Đại Bồi Nguyên Đan (8)", @"Group_ThuocSuKien", @"24. Thuốc Event & Bách Bảo Các Phát Sinh", @"HP tối đa +700, online 1 giờ, tối đa 8 lần dùng, không cộng dồn cùng loại", @"1 Giờ Online", @"Giới hạn lượt dùng và không stack cùng loại.", @"Ghi nhận dùng thực tế trong log thuốc.", @"Đưa vào slot HP tối đa.", @"Log thuốc 24log"),

        // ================= GROUP 25: THUỐC HÁI / CHẾ TỪ MAP =================
        new(1000000815, @"Đại Ngũ Bổ Hoàn", @"Group_ThuocHaiChe", @"25. Thuốc Hái/Chế Từ Map", @"Khôi phục trạng thái bị giảm sức tấn công", @"Tức thời", @"Thuốc giải trạng thái, không phải buff cộng chỉ số dài hạn.", @"Chế dược / hái thuốc ở map.", @"Theo dõi riêng ở tab thuốc hái/chế, không đưa vào ma trận cộng dồn dài hạn.", @"Bảng chế dược"),
        new(1000000820, @"Hoàng Liên Giải Độc Thang", @"Group_ThuocHaiChe", @"25. Thuốc Hái/Chế Từ Map", @"Giải độc", @"Tức thời", @"Thuốc giải trạng thái.", @"Chế dược / hái thuốc ở map.", @"Không đưa vào ma trận pill cộng chỉ số.", @"Bảng chế dược"),
        new(1000000822, @"Hoắc Hương Chính Khí Tán", @"Group_ThuocHaiChe", @"25. Thuốc Hái/Chế Từ Map", @"Khôi phục trạng thái im lặng / bất lợi", @"Tức thời", @"Thuốc giải trạng thái.", @"Chế dược / hái thuốc ở map.", @"Không đưa vào ma trận pill cộng chỉ số.", @"Bảng chế dược"),
        new(1000000823, @"Chân Võ Thang", @"Group_ThuocHaiChe", @"25. Thuốc Hái/Chế Từ Map", @"Khôi phục trạng thái giảm HP", @"Tức thời", @"Thuốc giải trạng thái.", @"Chế dược / hái thuốc ở map.", @"Không đưa vào ma trận pill cộng chỉ số.", @"Bảng chế dược"),
        new(1000000824, @"Thất Khí Thang", @"Group_ThuocHaiChe", @"25. Thuốc Hái/Chế Từ Map", @"Khôi phục trạng thái giảm MP", @"Tức thời", @"Thuốc giải trạng thái.", @"Chế dược / hái thuốc ở map.", @"Không đưa vào ma trận pill cộng chỉ số.", @"Bảng chế dược"),
        new(1000000825, @"Bát Trân Thang", @"Group_ThuocHaiChe", @"25. Thuốc Hái/Chế Từ Map", @"Khôi phục trạng thái giảm HP/MP", @"Tức thời", @"Thuốc giải trạng thái.", @"Chế dược / hái thuốc ở map.", @"Không đưa vào ma trận pill cộng chỉ số.", @"Bảng chế dược"),
        new(1000000834, @"Hoàng Cầm Thang", @"Group_ThuocHaiChe", @"25. Thuốc Hái/Chế Từ Map", @"Hiệu quả hồi HP/MP tăng 1.5 lần", @"10 Phút", @"Thuốc hái/chế có hiệu ứng theo thời gian.", @"Chế dược / hái thuốc ở map.", @"Theo dõi riêng, nếu muốn tính cộng dồn thì map vào slot hồi phục.", @"Bảng chế dược"),
        new(1000000835, @"Thần Tiên Phụ Ích Đơn", @"Group_ThuocHaiChe", @"25. Thuốc Hái/Chế Từ Map", @"MP tối đa +5%", @"10 Phút", @"Thuốc hái/chế cộng MP tối đa.", @"Chế dược / hái thuốc ở map.", @"Đưa vào slot MP nếu bật kiểm soát cộng dồn thuốc chế.", @"Bảng chế dược"),
        new(1000000836, @"Chính Khí Thiên Hương Thang", @"Group_ThuocHaiChe", @"25. Thuốc Hái/Chế Từ Map", @"HP tối đa +5%", @"10 Phút", @"Thuốc hái/chế cộng HP tối đa.", @"Chế dược / hái thuốc ở map.", @"Đưa vào slot HP nếu bật kiểm soát cộng dồn thuốc chế.", @"Bảng chế dược"),
        new(1000000838, @"Chỉ Xuất Hoàn", @"Group_ThuocHaiChe", @"25. Thuốc Hái/Chế Từ Map", @"Hồi phục 1200 HP", @"Tức thời", @"Thuốc hồi phục tức thời.", @"Chế dược / hái thuốc ở map.", @"Không đưa vào ma trận pill cộng chỉ số dài hạn.", @"Bảng chế dược"),
        new(1000000839, @"Hòa Lan Thanh Tâm Hoàn", @"Group_ThuocHaiChe", @"25. Thuốc Hái/Chế Từ Map", @"Khôi phục một số trạng thái bất lợi", @"Tức thời", @"Thuốc giải trạng thái.", @"Chế dược / hái thuốc ở map.", @"Không đưa vào ma trận pill cộng chỉ số.", @"Bảng chế dược"),
        new(1000000850, @"Chư Long Huyết Độc", @"Group_ThuocHaiChe", @"25. Thuốc Hái/Chế Từ Map", @"Giảm hiệu quả hồi phục của mục tiêu 20%", @"30 Giây", @"Thuốc/debuff PK tác động mục tiêu.", @"Chế dược / hái thuốc ở map.", @"Theo dõi riêng vì đây là debuff lên mục tiêu, không phải buff nhân vật.", @"Bảng chế dược"),
        new(1000000852, @"Huyền Huân Hoàn", @"Group_ThuocHaiChe", @"25. Thuốc Hái/Chế Từ Map", @"Giảm sức tấn công của mục tiêu 20%", @"60 Giây", @"Thuốc/debuff PK tác động mục tiêu.", @"Chế dược / hái thuốc ở map.", @"Theo dõi riêng vì đây là debuff lên mục tiêu, không phải buff nhân vật.", @"Bảng chế dược"),

        // ================= GROUP 26: KHÔNG PHẢI PILL =================
        new(1000000415, @"Kết Hôn Giới Chỉ", @"Group_KhongPhaiPill", @"26. Không Phải Pill", @"Nhẫn dịch chuyển tới người yêu / bạn đời", @"Tiện ích", @"Không phải thuốc cộng chỉ số.", @"Ghi nhận trong log dùng vật phẩm nhưng không phải pill.", @"Loại khỏi ma trận pill.", @"Log thuốc 24log"),
        new(1000000899, @"Búa / Dụng cụ sự kiện", @"Group_KhongPhaiPill", @"26. Không Phải Pill", @"Vật phẩm công cụ, không cộng chỉ số nhân vật theo thời gian", @"Tiêu hao", @"Không phải thuốc cộng chỉ số.", @"Ghi nhận trong log dùng vật phẩm.", @"Loại khỏi ma trận pill.", @"Log thuốc 24log")
    };

    public static async Task<PillsResponse> GetPillsAsync(string publicConnStr, string bbgConnStr, CancellationToken cancellationToken)
    {
        var dbItems = new Dictionary<int, (string name, int isLocked)>();
        var sellMap = new Dictionary<int, List<PillLocation>>();
        var bbgMap = new Dictionary<int, (int price, string name, string desc)>();
        var craftPids = new HashSet<int>();
        var craftIngredientPids = new HashSet<int>();
        var craftRecipes = new Dictionary<int, (string name, List<int> ingredients)>();
        var openRewardPids = new HashSet<int>();

        try
        {
            using var connPub = new SqlConnection(publicConnStr);
            await connPub.OpenAsync(cancellationToken);

            try
            {
                using var cmdCraftAll = new SqlCommand("SELECT 物品ID, 物品名, 需要物品 FROM dbo.制药物品列表 WITH (NOLOCK)", connPub);
                using var rCraftAll = await cmdCraftAll.ExecuteReaderAsync(cancellationToken);
                while (await rCraftAll.ReadAsync(cancellationToken))
                {
                    int pid = Convert.ToInt32(rCraftAll.GetValue(0));
                    string name = rCraftAll.IsDBNull(1) ? "" : rCraftAll.GetString(1);
                    string requiredJson = rCraftAll.IsDBNull(2) ? "[]" : rCraftAll.GetString(2);
                    var ingredients = ParseCraftIngredientPids(requiredJson);
                    craftPids.Add(pid);
                    foreach (int ingredientPid in ingredients)
                    {
                        craftIngredientPids.Add(ingredientPid);
                    }
                    craftRecipes[pid] = (name, ingredients);
                }
            }
            catch { }

            var pidsList = DefinedPills
                .Select(p => p.Pid)
                .Concat(craftPids)
                .Concat(craftIngredientPids)
                .Distinct()
                .ToList();
            var pidsStr = string.Join(",", pidsList);

            using (var cmd = new SqlCommand($"SELECT FLD_PID, FLD_NAME, FLD_LOCK FROM TBL_XWWL_ITEM WHERE FLD_PID IN ({pidsStr})", connPub))
            using (var reader = await cmd.ExecuteReaderAsync(cancellationToken))
            {
                while (await reader.ReadAsync(cancellationToken))
                {
                    int pid = reader.GetInt32(0);
                    string name = reader.GetString(1);
                    int isLock = reader.GetInt32(2);
                    dbItems[pid] = (name, isLock);
                }
            }

            try
            {
                using var cmdOpen = new SqlCommand($"SELECT DISTINCT FLD_PIDX FROM dbo.TBL_XWWL_OPEN WITH (NOLOCK) WHERE FLD_PIDX IN ({pidsStr})", connPub);
                using var rOpen = await cmdOpen.ExecuteReaderAsync(cancellationToken);
                while (await rOpen.ReadAsync(cancellationToken))
                {
                    if (!rOpen.IsDBNull(0))
                    {
                        openRewardPids.Add(Convert.ToInt32(rOpen.GetValue(0)));
                    }
                }
            }
            catch { }

            try
            {
                string sellSql = $@"
                    SELECT s.FLD_PID, s.FLD_PRICE, s.FLD_NPC, n.FLD_NAME AS NpcName, m.FLD_NAME AS MapName
                    FROM TBL_XWWL_SELL s
                    LEFT JOIN TBL_XWWL_NPC n ON s.FLD_NPC = n.FLD_INDEX
                    LEFT JOIN TBL_XWWL_MAP m ON n.FLD_MAP = m.FLD_MAP_INDEX
                    WHERE s.FLD_PID IN ({pidsStr})";

                using var cmdSell = new SqlCommand(sellSql, connPub);
                using var rSell = await cmdSell.ExecuteReaderAsync(cancellationToken);
                while (await rSell.ReadAsync(cancellationToken))
                {
                    int pid = rSell.GetInt32(0);
                    long price = rSell.GetInt64(1);
                    int npcId = rSell.IsDBNull(2) ? 0 : rSell.GetInt32(2);
                    string npcName = rSell.IsDBNull(3) ? $"NPC #{npcId}" : rSell.GetString(3).Trim();
                    string mapName = rSell.IsDBNull(4) ? "Bản đồ chung" : rSell.GetString(4).Trim();

                    if (!sellMap.ContainsKey(pid))
                        sellMap[pid] = new List<PillLocation>();

                    sellMap[pid].Add(new PillLocation
                    {
                        Type = "NPC Shop",
                        TargetName = npcName,
                        MapName = mapName,
                        CostOrRate = $"{price:N0} Lượng",
                        Details = $"Mua trực tiếp tại {npcName} ({mapName}) với giá {price:N0} Lượng"
                    });
                }
            }
            catch { }
        }
        catch { }

        try
        {
            if (!string.IsNullOrWhiteSpace(bbgConnStr))
            {
                using var connBbg = new SqlConnection(bbgConnStr);
                await connBbg.OpenAsync(cancellationToken);
                using var cmdBbg = new SqlCommand("SELECT FLD_PID, FLD_PRICE, FLD_NAME, FLD_DESC FROM dbo.ITEMSELL WITH (NOLOCK)", connBbg);
                using var rBbg = await cmdBbg.ExecuteReaderAsync(cancellationToken);
                while (await rBbg.ReadAsync(cancellationToken))
                {
                    int pid = rBbg.GetInt32(0);
                    int price = rBbg.GetInt32(1);
                    string name = rBbg.IsDBNull(2) ? "" : rBbg.GetString(2);
                    string desc = rBbg.IsDBNull(3) ? "" : rBbg.GetString(3);
                    bbgMap[pid] = (price, name, desc);
                }
            }
        }
        catch { }

        var pillList = new List<PillItem>();

        var allDefinitions = BuildDefinitions(dbItems, craftPids, craftIngredientPids, craftRecipes);

        foreach (var def in allDefinitions)
        {
            bool existsInDb = dbItems.TryGetValue(def.Pid, out var dbItem);
            string displayName = def.Name;
            string originalName = existsInDb ? dbItem.name : def.Name;
            bool isLocked = existsInDb ? dbItem.isLocked == 1 : false;

            sellMap.TryGetValue(def.Pid, out var locations);
            locations ??= new List<PillLocation>();

            bool isCash = bbgMap.TryGetValue(def.Pid, out var bbgInfo);
            bool isCraft = craftPids.Contains(def.Pid);
            bool isOpenReward = openRewardPids.Contains(def.Pid);
            long price = 0;

            if (isCash)
            {
                price = bbgInfo.price;
                locations.Insert(0, new PillLocation
                {
                    Type = "Bách Bảo Các (CashShop)",
                    TargetName = "Bách Bảo Các",
                    MapName = "Toàn Server",
                    CostOrRate = $"{bbgInfo.price:N0} Cash (KNB)",
                    Details = $"Vật phẩm bày bán chính thức trong Bách Bảo Các (Phím Ctrl + E) với giá {bbgInfo.price:N0} Cash"
                });
            }

            if (isCraft)
            {
                locations.Add(new PillLocation
                {
                    Type = "Thuốc hái/chế",
                    TargetName = "Bảng chế dược",
                    MapName = "Các map có nguyên liệu thuốc",
                    CostOrRate = "Nguyên liệu hái/chế",
                    Details = "PID này có trong bảng chế dược dbo.制药物品列表."
                });
            }

            if (isOpenReward)
            {
                locations.Add(new PillLocation
                {
                    Type = "Hộp / Event",
                    TargetName = "TBL_XWWL_OPEN",
                    MapName = "Phần thưởng mở hộp",
                    CostOrRate = "Theo tỉ lệ hộp",
                    Details = "PID này xuất hiện trong bảng phần thưởng mở hộp dbo.TBL_XWWL_OPEN."
                });
            }

            var npcLoc = locations.FirstOrDefault(l => l.Type == "NPC Shop");
            if (npcLoc != null)
            {
                string rawCost = npcLoc.CostOrRate.Replace(" Lượng", "").Replace(",", "").Trim();
                if (long.TryParse(rawCost, out long p))
                {
                    if (!isCash) price = p;
                }
            }

            string source = isCash
                ? "Bách Bảo Các (Cash Shop)"
                : (locations.FirstOrDefault(l => l.Type == "NPC Shop") is { } npcSource
                    ? $"NPC {npcSource.TargetName}"
                    : (isCraft ? "Thuốc hái/chế" : (isOpenReward ? "Hộp / Event" : "Sự Kiện & Bãi Quái")));
            var effectSlots = GetEffectSlots(def);
            string itemKind = GetItemKind(def, isCraft);
            string itemKindLabel = GetItemKindLabel(itemKind);
            var sourceTags = GetSourceTags(isCash, locations.Any(l => l.Type == "NPC Shop"), isCraft, isOpenReward, def.EventInfo, def.HowToGet);
            string handlingRule = GetHandlingRule(def, itemKind, effectSlots);

            var sourceDetail = new PillSourceDetail
            {
                MainSource = source,
                Locations = locations,
                EventInfo = def.EventInfo,
                HowToGet = def.HowToGet,
                StackingTips = def.StackingTips
            };

            pillList.Add(new PillItem
            {
                Pid = def.Pid,
                Name = displayName,
                OriginalName = originalName,
                GroupId = def.GroupId,
                GroupName = def.GroupName,
                Source = source,
                IsCashShop = isCash,
                EffectDescription = def.Effects,
                Duration = def.Duration,
                StackRule = def.StackRule,
                ItemKind = itemKind,
                ItemKindLabel = itemKindLabel,
                EffectSlots = effectSlots,
                HandlingRule = handlingRule,
                SourceTags = sourceTags,
                IsLocked = isLocked,
                Price = price,
                SourceDetail = sourceDetail
            });
        }

        var groupDefinitions = new List<(string id, string name, string desc, string icon, string mechanic, string stack)>
        {
            (@"Group_ChiTonPhu", @"1. Chí Tôn Phù (VIP)", @"Phù VIP kích hoạt tài khoản, tăng 20% ~ 50% toàn bộ chỉ số và EXP.", @"Award", @"TimeMedicine (FLD_VIP)", @"Độc lập tuyệt đối. Cắn mới gia hạn hạn dùng yyMMddHHmm và bật VIP."),
            (@"Group_ChiTonHoan", @"2. Chí Tôn Hoàn", @"Dược hoàn cao cấp tăng 11% ~ 15% Công/Thủ, EXP và Khí công +1.", @"Flame", @"AppendStatusNewList (Slot 1)", @"Cộng dồn song song với Phù VIP, Cô Điệp, Yêu Hoa. Cắn tiếp gia hạn giờ."),
            (@"Group_CoDiepPhu", @"3. Cô Điệp Phù", @"Bùa tăng 15% ~ 18% Công/Thủ và 3% ~ 5% Tấn công võ công.", @"Sparkles", @"AppendStatusNewList (Slot 2)", @"Cộng dồn song song với Phù VIP, Chí Tôn Hoàn. Cắn tiếp gia hạn giờ."),
            (@"Group_YeuHoaThanhThao", @"4. Yêu Hoa Thanh Thảo", @"Thảo dược tăng 5% ~ 15% EXP, Công kích võ công và Khí công +1~2.", @"Layers", @"AppendStatusNewList (Slot 3)", @"Cộng dồn song song với toàn bộ các loại Phù. Cắn tiếp gia hạn giờ."),
            (@"Group_ChiTheu", @"5. Chỉ Thêu Long Hổ", @"Bạch Long (EXP & CLVC) và Hắc Long (Phòng thủ & Né tránh).", @"Sparkles", @"AppendStatusNewList (Slot 4)", @"Bạch Long và Hắc Long cắn cùng lúc hưởng cả 2. Cùng loại gia hạn giờ."),
            (@"Group_MaVoHaiSan", @"6. Ma Võ Hải Sản & Tươi Sống", @"Hải Sản (+ATK, +Khí công) và Tươi Sống (+DEF, +MP).", @"Zap", @"AppendStatusNewList (Slot 5)", @"Hải Sản và Tươi Sống cắn cùng lúc hưởng cả 2. Cùng loại gia hạn giờ."),
            (@"Group_ThanThu", @"7. Thần Thụ Tâm Pháp Chân Ấn", @"Chân ấn thần thụ tăng uy lực công kích cực đại và EXP.", @"ShieldCheck", @"AppendStatusNewList (Slot 6)", @"Độc lập đặc biệt. Cộng dồn song song 100% với mọi pill khác."),
            (@"Group_ThanDan", @"8. Thần Đan Bách Bảo", @"Bá Vương Đơn (CLVC), Huyền Sắc (ULPT), Thái Cực (Khí công), Nghịch Thiên, Long Lân.", @"Award", @"AppendStatusNewList (Slot 7..9)", @"Mỗi loại thần đan có slot riêng. Cắn cùng lúc nhận đủ cả 3."),
            (@"Group_ExpVoHuan", @"9. EXP & Võ Huân Đan", @"Kinh nghiệm đan các cấp và thẻ / đan tăng điểm võ huân.", @"Layers", @"AppendStatusList", @"Cùng bậc gia hạn giờ; cắn đè bậc cao hơn sẽ thay thế bậc thấp hơn."),
            (@"Group_BinhMauSamAuto", @"10. Bình HP/MP Siêu Cấp Auto", @"Cửu Chuyển, Sinh Mệnh, Tuyết Sâm, Trường Bạch và Bơm Đầy Thuốc 1 Chạm.", @"Heart", @"Player_CZY_HP / Player_TCS_MP", @"Lưu trữ dung lượng. Cắn bình mới sẽ GHI ĐÈ dung lượng bình cũ."),
            (@"Group_KeoHoLo", @"11. Kẹo Hồ Lô & Bánh Sự Kiện", @"Kẹo tăng Công, Thủ, HP tối đa từ sự kiện lễ hội.", @"Package", @"PublicDrugs", @"Khác loại (Công + Thủ + HP) cộng dồn; cùng loại gia hạn giờ."),
            (@"Group_ThuocLacPK", @"12. Thuốc Lắc PK & Chiến Đấu", @"Tử Hà, Thanh Can, Thần Dũng, Kim Cang dùng khi giao tranh PK.", @"Swords", @"PublicDrugs", @"Khác dòng chỉ số cộng dồn song song; cùng dòng làm mới giờ."),
            (@"Group_TuiVoHoangTe", @"13. Túi Võ Hoàng Tệ", @"Bộ 5 túi gấm mở nhận 500 ~ 10.000 điểm Võ Hoàng Tệ.", @"Award", @"OpenItem", @"Mở nhận điểm tức thì vào thanh x/17000. Độc lập, không chiếm ô buff."),
            (@"Group_TlcBonus", @"14. Bùa Thế Lực & Bông TLC", @"Bùa và bông hỗ trợ tăng điểm thưởng & kháng cự trong Thế Lực Chiến map 801.", @"ShieldCheck", @"AppendStatusList", @"Cộng dồn cùng Phù VIP và Thuốc lắc PK. Kích hoạt hiệu ứng trong map TLC."),
            (@"Group_ExpHoTam", @"15. Hộ Tâm & Hoàng Long (150% - 300%)", @"Hộ Tâm Đơn, Hoàng Long Đơn, Hoàng Thánh Đơn tăng 150% ~ 300% EXP.", @"Zap", @"AppendStatusList", @"Cùng nhóm gia hạn giờ; cắn đè loại cao hơn sẽ thay thế loại thấp hơn."),
            (@"Group_HoaDuongDan", @"16. Hỏa Long & Hiệu Ứng Biến Thân", @"Hỏa Châu ngũ sắc, Thần phong gió hóa và Rương Biến Thân Boss.", @"Flame", @"AppendStatusNewList (Slot 10)", @"Độc lập cao cấp. Cộng dồn song song với toàn bộ Phù VIP và Hoàn."),
            (@"Group_HealerBuff", @"17. Bí Truyền & Trang Sức Đặc Biệt", @"Bí truyền võ công tấn công / hỗ trợ, Rương trang sức Ma Diệt và Nhẫn đôi.", @"Sparkles", @"AppendStatusList", @"Mở nhận trang sức hoặc học kỹ năng bí truyền vĩnh viễn."),
            (@"Group_ArcherArrows", @"18. Mũi Tên & Cung Tiễn Buff Cung Thủ", @"Mộc Tiễn, Thanh Đồng, Truy Tả, Võ Công, Ngân Quang, Bạch Hoa Tiễn.", @"Package", @"ArrowEquipment (Slot 13)", @"Trang bị trực tiếp vào ô mũi tên của Cung Thủ để tăng công kích và chính xác."),
            (@"Group_PetBuff", @"19. Linh Thú & Thú Cưỡi", @"Huyết Thú Đan, Thức ăn Pet, Hồi sinh, Ấp trứng, Tiến hóa, Gấu Trúc và Rương Yên Thú.", @"Heart", @"PlayersBes", @"Cắn trực tiếp tăng cấp hoặc hồi phục cho thú cưng đang triệu hồi."),
            (@"Group_ResetChange", @"20. Tẩy Điểm, Tẩy Khí & Đổi Tên", @"Phù Đổi Tên, Cách Thế Truyền Công, Đông Lãnh Vong Khước Thảo, Mạnh Bà Trà, Chuyển Phái.", @"Flame", @"SpecialFunction", @"Sử dụng tức thì để tái phân phối thuộc tính, đổi tên hoặc chuyển thế lực."),
            (@"Group_EnchantLuck", @"21. Bùa May Mắn & Cường Hóa / Hợp Thành", @"Phù May Mắn 1%~30%, Phù Nâng Cấp Thuộc Tính, Kim Phù, Tứ Thần Thạch, Bảo Khí.", @"ShieldCheck", @"EnchantBonus", @"Đặt vào ô phù hỗ trợ tại NPC Đao Kiếm Tiếu khi ép đồ."),
            (@"Group_TeaWine", @"22. Trà Đạo & Tiệc Rượu Bang Hội", @"Ngưng Thần Châu 20 Tỷ, Trà Thiết Quan Âm, Long Tỉnh, Bích Loa Xuân.", @"Sparkles", @"PublicDrugs", @"Cộng dồn cùng mọi loại buff. Thích hợp cho tiệc bang hội và liên hoan."),
            (@"Group_TeleportScrolls", @"23. Thổ Linh Phù & Dịch Chuyển", @"Phù Sinh Tử 5 lần, Vé Tu Luyện / Lăng / Pi Pi, Sư Tử Hống, Treo Máy Đám Mây, Mở Rộng Rương.", @"Zap", @"TeleportFunction", @"Dịch chuyển tức thì đến bãi train, thành trì, phục sinh tại chỗ hoặc ủy thác offline."),
            (@"Group_ThuocSuKien", @"24. Thuốc Event & Bách Bảo Các Phát Sinh", @"Các pill/thuốc có log dùng thực tế, cộng chỉ số nhân vật theo thời gian nhưng chưa nằm trong 23 nhóm cũ.", @"Sparkles", @"MixedStatusEffects", @"Phân rã theo slot chỉ số; cùng slot dùng mốc mạnh hơn hoặc gia hạn theo code thực tế."),
            (@"Group_ThuocHaiChe", @"25. Thuốc Hái/Chế Từ Map", @"Thuốc chế dược, thuốc giải trạng thái, thuốc buff ngắn hạn hái/chế từ map.", @"Package", @"CraftMedicine", @"Tách riêng khỏi pill cash dài hạn; chỉ đưa vào ma trận nếu có cộng chỉ số theo thời gian."),
            (@"Group_KhongPhaiPill", @"26. Không Phải Pill", @"Vật phẩm xuất hiện trong log dùng nhưng không cộng chỉ số nhân vật theo thời gian.", @"Info", @"UtilityItem", @"Loại khỏi ma trận pill cộng chỉ số."),
        };

        var finalGroups = new List<PillGroup>();
        foreach (var def in groupDefinitions)
        {
            var matchedPills = pillList.Where(p => p.GroupId == def.id).ToList();
            if (matchedPills.Count > 0)
            {
                finalGroups.Add(new PillGroup
                {
                    Id = def.id,
                    Name = def.name,
                    Description = def.desc,
                    Icon = def.icon,
                    Mechanic = def.mechanic,
                    StackBehavior = def.stack,
                    Pills = matchedPills
                });
            }
        }

        return new PillsResponse
        {
            Success = true,
            TotalPills = pillList.Count,
            ActiveCount = pillList.Count(p => !p.IsLocked),
            LockedCount = pillList.Count(p => p.IsLocked),
            Groups = finalGroups
        };
    }

    private static List<int> ParseCraftIngredientPids(string json)
    {
        var result = new List<int>();
        if (string.IsNullOrWhiteSpace(json)) return result;
        try
        {
            using JsonDocument doc = JsonDocument.Parse(json);
            if (doc.RootElement.ValueKind != JsonValueKind.Array) return result;
            foreach (JsonElement item in doc.RootElement.EnumerateArray())
            {
                if (item.TryGetProperty("Id", out JsonElement idElement) && idElement.TryGetInt32(out int id) && id > 0)
                    result.Add(id);
            }
        }
        catch { }
        return result;
    }

    private static List<PillDefinition> BuildDefinitions(
        Dictionary<int, (string name, int isLocked)> dbItems,
        HashSet<int> craftPids,
        HashSet<int> craftIngredientPids,
        Dictionary<int, (string name, List<int> ingredients)> craftRecipes)
    {
        var definitions = DefinedPills.ToList();
        var known = new HashSet<int>(definitions.Select(p => p.Pid));

        foreach (int pid in craftIngredientPids.OrderBy(pid => pid))
        {
            if (known.Contains(pid)) continue;
            string name = dbItems.TryGetValue(pid, out var db) ? db.name : $"Nguyên liệu hái thuốc #{pid}";
            definitions.Add(new PillDefinition(
                pid,
                name,
                "Group_ThuocHaiChe",
                "25. Thuốc Hái/Chế Từ Map",
                "Nguyên liệu hái thuốc dùng trong công thức chế dược; bản thân không phải pill cộng chỉ số khi đứng riêng.",
                "Nguyên liệu",
                "Không cộng dồn chỉ số; dùng để chế thuốc thành phẩm.",
                "Hái ở các map hoặc nhận qua hệ thống nguyên liệu chế dược.",
                "Hiển thị để GM không bỏ sót nguồn thuốc hái/chế.",
                "Nguyên liệu chế dược"));
            known.Add(pid);
        }

        foreach (int pid in craftPids.OrderBy(pid => pid))
        {
            if (known.Contains(pid)) continue;
            string name = dbItems.TryGetValue(pid, out var db) ? db.name : (craftRecipes.TryGetValue(pid, out var recipe) ? recipe.name : $"Thuốc chế #{pid}");
            string ingredientText = craftRecipes.TryGetValue(pid, out var row) && row.ingredients.Count > 0
                ? $"Công thức dùng nguyên liệu: {string.Join(", ", row.ingredients)}."
                : "Có trong bảng chế dược.";
            definitions.Add(new PillDefinition(
                pid,
                name,
                "Group_ThuocHaiChe",
                "25. Thuốc Hái/Chế Từ Map",
                "Thuốc thành phẩm từ hệ thống hái/chế dược; tác dụng cụ thể cần đối chiếu code sử dụng PID.",
                "Theo thuốc",
                "Theo cơ chế thuốc chế; cùng loại thường làm mới thời gian hoặc tiêu hao tức thời.",
                ingredientText,
                "Tự động lấy từ bảng chế dược dbo.制药物品列表.",
                "Thuốc thành phẩm chế dược"));
            known.Add(pid);
        }

        return definitions;
    }

    private static readonly HashSet<string> NonPillGroups = new(StringComparer.OrdinalIgnoreCase)
    {
        "Group_TuiVoHoangTe",
        "Group_BinhMauSamAuto",
        "Group_HealerBuff",
        "Group_ArcherArrows",
        "Group_PetBuff",
        "Group_ResetChange",
        "Group_EnchantLuck",
        "Group_TeleportScrolls",
        "Group_KhongPhaiPill"
    };

    private static readonly HashSet<int> NonPillPids = new()
    {
        909000031, 909000032, 909000033, 1000000290,
        1000000200, 1000000213, 1000000415, 1000000899,
        1008000142, 1008001190, 1008001328, 1008001513, 1008002585
    };

    private static readonly HashSet<int> HerbOrEventPids = new()
    {
        1007000007, 1008000055, 1008000082, 1008000162, 1008000187, 1008000232, 1008000326,
        1000000815, 1000000820, 1000000822, 1000000823, 1000000824, 1000000825,
        1000000834, 1000000835, 1000000836, 1000000838, 1000000839, 1000000850, 1000000852
    };

    private static string GetItemKind(PillDefinition def, bool isCraft)
    {
        if (NonPillPids.Contains(def.Pid) || NonPillGroups.Contains(def.GroupId))
            return "nonPill";

        if (isCraft || HerbOrEventPids.Contains(def.Pid) || def.GroupId == "Group_ThuocSuKien" || def.GroupId == "Group_ThuocHaiChe")
            return "herbOrEventPill";

        return "statPill";
    }

    private static string GetItemKindLabel(string itemKind) => itemKind switch
    {
        "herbOrEventPill" => "Thuốc hái/chế & event",
        "nonPill" => "Không phải pill",
        _ => "Pill cộng chỉ số"
    };

    private static List<string> GetEffectSlots(PillDefinition def)
    {
        var text = $"{def.Name} {def.Effects} {def.StackRule}".ToLowerInvariant();
        var slots = new List<string>();

        void AddIf(bool condition, string label)
        {
            if (condition && !slots.Contains(label))
                slots.Add(label);
        }

        AddIf(text.Contains("exp") || text.Contains("kinh nghiệm"), "EXP");
        AddIf(text.Contains("lịch luyện") || text.Contains("rèn luyện") || text.Contains("skill exp"), "Lịch luyện");
        AddIf(text.Contains("tấn công") || text.Contains("công kích") || text.Contains("attack") || text.Contains("sát thương"), "Tấn công");
        AddIf(text.Contains("phòng thủ") || text.Contains("phòng ngự") || text.Contains("def"), "Phòng thủ");
        AddIf(text.Contains("clvc") || text.Contains("cường lực võ công") || text.Contains("uy lực võ công") || text.Contains("skill att"), "CLVC");
        AddIf(text.Contains("ulpt") || text.Contains("uy lực phòng thủ") || text.Contains("skill def"), "ULPT");
        AddIf(text.Contains("khí công") || text.Contains("qigong"), "Khí công");
        AddIf(text.Contains("hp") || text.Contains("sinh lực") || text.Contains("máu"), "HP");
        AddIf(text.Contains("mp") || text.Contains("nội lực"), "MP");
        AddIf(text.Contains("né tránh") || text.Contains("né"), "Né tránh");
        AddIf(text.Contains("chính xác"), "Chính xác");
        AddIf(text.Contains("tốc độ"), "Tốc độ");
        AddIf(text.Contains("rơi đồ") || text.Contains("drop"), "Rơi đồ");
        AddIf(text.Contains("tiền") || text.Contains("lượng"), "Tiền");
        AddIf(text.Contains("cường hóa vũ khí") || text.Contains("cường hóa áo") || text.Contains("cường hóa"), "Cường hóa");
        AddIf(text.Contains("hồi phục") || text.Contains("hồi hp") || text.Contains("hồi mp"), "Hồi phục");
        AddIf(text.Contains("giảm sức tấn công") || text.Contains("giảm hiệu quả hồi phục"), "Debuff mục tiêu");

        return slots;
    }

    private static List<string> GetSourceTags(bool isCash, bool isNpc, bool isCraft, bool isOpenReward, string eventInfo, string howToGet)
    {
        var tags = new List<string>();
        if (isCash) tags.Add("Bách Bảo Các");
        if (isNpc) tags.Add("NPC Shop");
        if (isCraft) tags.Add("Hái/chế thuốc");
        if (isOpenReward) tags.Add("Mở hộp/event");
        if (!string.IsNullOrWhiteSpace(eventInfo)) tags.Add("Sự kiện");
        if (howToGet.Contains("Boss", StringComparison.OrdinalIgnoreCase)) tags.Add("Boss");
        if (howToGet.Contains("quái", StringComparison.OrdinalIgnoreCase) || howToGet.Contains("bãi", StringComparison.OrdinalIgnoreCase)) tags.Add("Bãi quái");
        if (tags.Count == 0) tags.Add("Chưa rõ nguồn DB");
        return tags.Distinct(StringComparer.OrdinalIgnoreCase).ToList();
    }

    private static string GetHandlingRule(PillDefinition def, string itemKind, List<string> effectSlots)
    {
        if (itemKind == "nonPill")
            return "Không đưa vào ma trận pill cộng chỉ số; quản lý như vật phẩm tiện ích/tiêu hao riêng.";

        if (effectSlots.Count == 0)
            return "Cần đối chiếu code effect thực tế trước khi cho cộng dồn.";

        if (itemKind == "herbOrEventPill")
            return $"Theo dõi riêng thuốc event/hái-chế; khi cộng dồn chỉ xét các slot: {string.Join(", ", effectSlots)}.";

        return $"Pill cộng chỉ số chuẩn; cùng slot ({string.Join(", ", effectSlots)}) dùng mốc mạnh hơn hoặc gia hạn theo cơ chế GameServer.";
    }

    public static async Task<bool> TogglePillAsync(string publicConnStr, int pid, bool enable, CancellationToken cancellationToken)
    {
        using var conn = new SqlConnection(publicConnStr);
        await conn.OpenAsync(cancellationToken);
        int lockVal = enable ? 0 : 1;
        using var cmd = new SqlCommand("UPDATE TBL_XWWL_ITEM SET FLD_LOCK = @Lock WHERE FLD_PID = @Pid", conn);
        cmd.Parameters.AddWithValue("@Lock", lockVal);
        cmd.Parameters.AddWithValue("@Pid", pid);
        int affected = await cmd.ExecuteNonQueryAsync(cancellationToken);
        return affected > 0;
    }

    public static async Task<int> ToggleGroupAsync(string publicConnStr, string bbgConnStr, string groupId, bool enable, CancellationToken cancellationToken)
    {
        var all = await GetPillsAsync(publicConnStr, bbgConnStr, cancellationToken);
        var targetGroup = all.Groups.FirstOrDefault(g => g.Id == groupId);
        if (targetGroup == null || targetGroup.Pills.Count == 0) return 0;

        var targetPids = targetGroup.Pills.Select(p => p.Pid).ToList();

        using var conn = new SqlConnection(publicConnStr);
        await conn.OpenAsync(cancellationToken);
        int lockVal = enable ? 0 : 1;

        string inClause = string.Join(",", targetPids);
        using var cmd = new SqlCommand($"UPDATE TBL_XWWL_ITEM SET FLD_LOCK = {lockVal} WHERE FLD_PID IN ({inClause})", conn);
        return await cmd.ExecuteNonQueryAsync(cancellationToken);
    }
}
