"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Xem nhật ký lỗi GameServer.
 *
 * Khác các nhật ký khác, lỗi nằm ở file trong thư mục logs của từng kênh chứ không
 * phải trong database. Gateway chạy ngay trên máy chủ nên đọc file rồi gom các dòng
 * cùng kiểu lại — Admin thấy ngay lỗi nào đang lặp nhiều nhất thay vì cuộn từng dòng.
 *
 * Một sự kiện lỗi thường trải nhiều dòng (stack trace), gateway đã gộp sẵn.
 */

type DayInfo = { date: string; file: string; sizeKb: number; updated: string };
type Group = { key: string; sample: string; count: number; first: string; last: string };
type Record = { time: string; text: string };

type ErrorLogPayload = {
  channel: number;
  date: string;
  total: number;
  truncated?: boolean;
  Groups: Group[];
  Records: Record[];
};

export default function ErrorLogViewer() {
  const [channel, setChannel] = useState(1);
  const [days, setDays] = useState<DayInfo[]>([]);
  const [date, setDate] = useState("");
  const [group, setGroup] = useState("");
  const [data, setData] = useState<ErrorLogPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setGroup("");
    fetch(`/api/gm/error-logs?days=1&channel=${channel}`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Không đọc được danh sách ngày."))))
      .then((payload) => {
        if (cancelled) return;
        const list: DayInfo[] = Array.isArray(payload?.Days) ? payload.Days : [];
        setDays(list);
        setDate(list.length > 0 ? list[0].date : "");
      })
      .catch((reason: Error) => {
        if (!cancelled) setError(reason.message);
      });
    return () => {
      cancelled = true;
    };
  }, [channel]);

  const load = useCallback(async () => {
    if (!date) {
      setData(null);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({ channel: String(channel), date, take: "100" });
      if (group) query.set("group", group);
      const response = await fetch(`/api/gm/error-logs?${query.toString()}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok || payload?.Success === false) {
        throw new Error(payload?.Message ?? payload?.message ?? "Không đọc được nhật ký lỗi.");
      }
      setData(payload as ErrorLogPayload);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không đọc được nhật ký lỗi.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [channel, date, group]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="game-log-viewer">
      <div className="operations-tabs" role="tablist" aria-label="Chọn kênh">
        {[1, 2].map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={value === channel}
            className={value === channel ? "active" : ""}
            onClick={() => setChannel(value)}
          >
            Kênh {value}
          </button>
        ))}
      </div>

      <div className="game-log-filters">
        <label>
          <span>Ngày</span>
          <select value={date} onChange={(event) => { setDate(event.target.value); setGroup(""); }}>
            {days.length === 0 ? <option value="">Không có file log</option> : null}
            {days.map((item) => (
              <option key={item.date} value={item.date}>
                {item.date} · {item.sizeKb} KB
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={() => void load()} disabled={loading || !date}>
          {loading ? "Đang đọc…" : "Làm mới"}
        </button>
        {group ? (
          <button type="button" onClick={() => setGroup("")}>
            Bỏ lọc nhóm
          </button>
        ) : null}
      </div>

      {error ? <p className="game-log-error">{error}</p> : null}

      {data ? (
        <p className="game-log-summary">
          Kênh {data.channel} · ngày {data.date} · <b>{data.total.toLocaleString("vi-VN")}</b> sự kiện
          {data.truncated ? " (đã cắt bớt vì file quá dài)" : ""}
          {group ? " · đang lọc theo một nhóm" : ""}
        </p>
      ) : null}

      {data && data.Groups.length > 0 ? (
        <div className="game-log-table-wrap">
          <table className="game-log-table">
            <thead>
              <tr>
                <th>Số lần</th>
                <th>Kiểu lỗi</th>
                <th>Lần đầu</th>
                <th>Lần cuối</th>
              </tr>
            </thead>
            <tbody>
              {data.Groups.map((item) => (
                <tr
                  key={item.key}
                  onClick={() => setGroup(item.key === group ? "" : item.key)}
                  className={item.key === group ? "error-group-active" : "error-group-row"}
                >
                  <td className="nowrap">{item.count.toLocaleString("vi-VN")}</td>
                  <td>{item.sample}</td>
                  <td className="nowrap">{item.first}</td>
                  <td className="nowrap">{item.last}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <div className="game-log-table-wrap">
        <table className="game-log-table">
          <thead>
            <tr>
              <th>Thời điểm</th>
              <th>Nội dung</th>
            </tr>
          </thead>
          <tbody>
            {data && data.Records.length > 0 ? (
              data.Records.map((row, index) => (
                <tr key={`${row.time}-${index}`}>
                  <td className="nowrap">{row.time}</td>
                  <td className="game-log-detail">{row.text}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="game-log-empty">
                  {loading ? "Đang đọc…" : "Không có dòng nào."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
