using System;
using System.Collections.Generic;
using System.Data;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;

namespace HKGMRemoteHost;

public sealed class VipPillMember
{
    [JsonPropertyName("pid")]
    public int Pid { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("enabled")]
    public bool Enabled { get; set; }

    [JsonPropertyName("note")]
    public string Note { get; set; } = string.Empty;

    [JsonPropertyName("addedAt")]
    public string AddedAt { get; set; } = string.Empty;
}

public sealed class VipPillConfigDto
{
    [JsonPropertyName("bundlePid")]
    public int BundlePid { get; set; } = 1008006001;

    [JsonPropertyName("durationHours")]
    public int DurationHours { get; set; } = 24;

    [JsonPropertyName("priceLuong")]
    public long PriceLuong { get; set; }

    [JsonPropertyName("maxBuyOnce")]
    public int MaxBuyOnce { get; set; } = 100;
}

public sealed class VipPillResponse
{
    [JsonPropertyName("success")]
    public bool Success { get; set; } = true;

    [JsonPropertyName("config")]
    public VipPillConfigDto Config { get; set; } = new();

    [JsonPropertyName("bundleName")]
    public string BundleName { get; set; } = string.Empty;

    [JsonPropertyName("members")]
    public List<VipPillMember> Members { get; set; } = new();
}

public sealed record VipPillAddRequest(int Pid, string? Note);

public sealed record VipPillPidRequest(int Pid);

public sealed record VipPillToggleRequest(int Pid, bool Enabled);

public sealed record VipPillConfigRequest(int? DurationHours, long? PriceLuong, int? MaxBuyOnce);

/// <summary>
/// Goi Pill VIP: danh sach pill thanh vien + cau hinh o 24pub (TBL_HKNT_VIPPILL_MEMBER / TBL_HKNT_VIPPILL_CONFIG).
/// Server Kenh 2 doc lai khi nhan lenh "reloaditems".
/// </summary>
public static class VipPillStore
{
    private const string EnsureSql = @"
IF OBJECT_ID('dbo.TBL_HKNT_VIPPILL_MEMBER') IS NULL
CREATE TABLE dbo.TBL_HKNT_VIPPILL_MEMBER (FLD_PID int NOT NULL PRIMARY KEY, FLD_NAME nvarchar(120) NULL, FLD_ENABLED int NOT NULL DEFAULT 1, FLD_NOTE nvarchar(200) NULL, FLD_ADDED datetime NOT NULL DEFAULT GETDATE());
IF OBJECT_ID('dbo.TBL_HKNT_VIPPILL_CONFIG') IS NULL
CREATE TABLE dbo.TBL_HKNT_VIPPILL_CONFIG (FLD_KEY varchar(50) NOT NULL PRIMARY KEY, FLD_VALUE nvarchar(200) NULL, FLD_NOTE nvarchar(200) NULL);";

    private static async Task EnsureAsync(SqlConnection conn, CancellationToken ct)
    {
        using var cmd = new SqlCommand(EnsureSql, conn);
        await cmd.ExecuteNonQueryAsync(ct);
    }

    public static async Task<VipPillResponse> GetAsync(string publicConnStr, CancellationToken ct)
    {
        var res = new VipPillResponse();
        using var conn = new SqlConnection(publicConnStr);
        await conn.OpenAsync(ct);
        await EnsureAsync(conn, ct);

        using (var cmd = new SqlCommand("SELECT FLD_KEY, FLD_VALUE FROM dbo.TBL_HKNT_VIPPILL_CONFIG", conn))
        using (var rd = await cmd.ExecuteReaderAsync(ct))
        {
            while (await rd.ReadAsync(ct))
            {
                string key = rd.GetString(0);
                string val = rd.IsDBNull(1) ? string.Empty : rd.GetString(1).Trim();
                if (key == "BundlePid" && int.TryParse(val, out int bp)) res.Config.BundlePid = bp;
                else if (key == "DurationHours" && int.TryParse(val, out int h)) res.Config.DurationHours = h;
                else if (key == "PriceLuong" && long.TryParse(val, out long p)) res.Config.PriceLuong = p;
                else if (key == "MaxBuyOnce" && int.TryParse(val, out int m)) res.Config.MaxBuyOnce = m;
            }
        }

        using (var cmd = new SqlCommand("SELECT FLD_NAME FROM dbo.TBL_XWWL_ITEM WHERE FLD_PID = @Pid", conn))
        {
            cmd.Parameters.AddWithValue("@Pid", res.Config.BundlePid);
            object? n = await cmd.ExecuteScalarAsync(ct);
            res.BundleName = n?.ToString() ?? string.Empty;
        }

        const string memberSql = @"
SELECT m.FLD_PID, ISNULL(i.FLD_NAME, m.FLD_NAME), m.FLD_ENABLED, ISNULL(m.FLD_NOTE, ''), CONVERT(varchar(19), m.FLD_ADDED, 120)
FROM dbo.TBL_HKNT_VIPPILL_MEMBER m
LEFT JOIN dbo.TBL_XWWL_ITEM i ON i.FLD_PID = m.FLD_PID
ORDER BY m.FLD_ADDED, m.FLD_PID";
        using (var cmd = new SqlCommand(memberSql, conn))
        using (var rd = await cmd.ExecuteReaderAsync(ct))
        {
            while (await rd.ReadAsync(ct))
            {
                res.Members.Add(new VipPillMember
                {
                    Pid = rd.GetInt32(0),
                    Name = rd.IsDBNull(1) ? string.Empty : rd.GetString(1),
                    Enabled = rd.GetInt32(2) != 0,
                    Note = rd.GetString(3),
                    AddedAt = rd.IsDBNull(4) ? string.Empty : rd.GetString(4)
                });
            }
        }
        return res;
    }

    /// <summary>Them pill vao goi. Tra ve: 1 = da them, 0 = da co san, -1 = khong ton tai trong TBL_XWWL_ITEM, -2 = la chinh vien goi.</summary>
    public static async Task<int> AddAsync(string publicConnStr, int pid, string? note, CancellationToken ct)
    {
        using var conn = new SqlConnection(publicConnStr);
        await conn.OpenAsync(ct);
        await EnsureAsync(conn, ct);
        int bundlePid = 1008006001;
        using (var cfg = new SqlCommand("SELECT FLD_VALUE FROM dbo.TBL_HKNT_VIPPILL_CONFIG WHERE FLD_KEY = 'BundlePid'", conn))
        {
            object? v = await cfg.ExecuteScalarAsync(ct);
            if (v != null && int.TryParse(v.ToString(), out int b)) bundlePid = b;
        }
        if (pid == bundlePid) return -2;
        string sql = @"
IF NOT EXISTS (SELECT 1 FROM dbo.TBL_XWWL_ITEM WHERE FLD_PID = @Pid) SELECT -1
ELSE IF EXISTS (SELECT 1 FROM dbo.TBL_HKNT_VIPPILL_MEMBER WHERE FLD_PID = @Pid) SELECT 0
ELSE
BEGIN
    INSERT INTO dbo.TBL_HKNT_VIPPILL_MEMBER (FLD_PID, FLD_NAME, FLD_ENABLED, FLD_NOTE)
    SELECT FLD_PID, FLD_NAME, 1, @Note FROM dbo.TBL_XWWL_ITEM WHERE FLD_PID = @Pid;
    SELECT 1
END";
        using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Pid", pid);
        cmd.Parameters.AddWithValue("@Note", note ?? string.Empty);
        object? r = await cmd.ExecuteScalarAsync(ct);
        return Convert.ToInt32(r);
    }

    public static async Task<bool> RemoveAsync(string publicConnStr, int pid, CancellationToken ct)
    {
        using var conn = new SqlConnection(publicConnStr);
        await conn.OpenAsync(ct);
        await EnsureAsync(conn, ct);
        using var cmd = new SqlCommand("DELETE FROM dbo.TBL_HKNT_VIPPILL_MEMBER WHERE FLD_PID = @Pid", conn);
        cmd.Parameters.AddWithValue("@Pid", pid);
        return await cmd.ExecuteNonQueryAsync(ct) > 0;
    }

    public static async Task<bool> ToggleAsync(string publicConnStr, int pid, bool enabled, CancellationToken ct)
    {
        using var conn = new SqlConnection(publicConnStr);
        await conn.OpenAsync(ct);
        await EnsureAsync(conn, ct);
        using var cmd = new SqlCommand("UPDATE dbo.TBL_HKNT_VIPPILL_MEMBER SET FLD_ENABLED = @E WHERE FLD_PID = @Pid", conn);
        cmd.Parameters.AddWithValue("@E", enabled ? 1 : 0);
        cmd.Parameters.AddWithValue("@Pid", pid);
        return await cmd.ExecuteNonQueryAsync(ct) > 0;
    }

    public static async Task SetConfigAsync(string publicConnStr, VipPillConfigRequest req, CancellationToken ct)
    {
        using var conn = new SqlConnection(publicConnStr);
        await conn.OpenAsync(ct);
        await EnsureAsync(conn, ct);
        async Task Upsert(string key, string value)
        {
            const string sql = @"
IF EXISTS (SELECT 1 FROM dbo.TBL_HKNT_VIPPILL_CONFIG WHERE FLD_KEY = @K) UPDATE dbo.TBL_HKNT_VIPPILL_CONFIG SET FLD_VALUE = @V WHERE FLD_KEY = @K
ELSE INSERT INTO dbo.TBL_HKNT_VIPPILL_CONFIG (FLD_KEY, FLD_VALUE) VALUES (@K, @V)";
            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@K", key);
            cmd.Parameters.AddWithValue("@V", value);
            await cmd.ExecuteNonQueryAsync(ct);
        }
        if (req.DurationHours is int h && h >= 1 && h <= 500) await Upsert("DurationHours", h.ToString());
        if (req.PriceLuong is long p && p >= 0 && p <= 4_000_000_000L) await Upsert("PriceLuong", p.ToString());
        if (req.MaxBuyOnce is int m && m >= 1 && m <= 999) await Upsert("MaxBuyOnce", m.ToString());
    }
}
