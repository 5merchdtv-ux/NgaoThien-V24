"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fixVietnameseName } from "@/lib/vni-fix";

/**
 * Xem nhật ký game theo phân loại.
 *
 * Toàn bộ dữ liệu ở đây do GameServer tự ghi vào database từ trước; trang này chỉ đọc.
 * Mỗi loại nằm ở một bảng riêng với sơ đồ cột khác nhau, gateway đã nắn về cùng bốn
 * cột hiển thị nên ở đây chỉ cần một bảng duy nhất cho mọi loại.
 */

type LogKind = { key: string; title: string; table: string };

type LogRow = {
  time: string;
  account: string;
  character: string;
  summary: string;
  detail: string;
};

type LogPage = {
  kind: string;
  title: string;
  page: number;
  pageSize: number;
  days: number;
  total: number;
  rows: LogRow[];
};

const DAY_CHOICES = [1, 3, 7, 30, 90];

export default function GameLogViewer() {
  const [kinds, setKinds] = useState<LogKind[]>([]);
  const [kind, setKind] = useState("giaodich");
  const [character, setCharacter] = useState("");
  const [appliedCharacter, setAppliedCharacter] = useState("");
  const [days, setDays] = useState(7);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<LogPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/gm/game-logs?kinds=1", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Không đọc được danh mục."))))
      .then((payload) => {
        if (cancelled) return;
        const list: LogKind[] = Array.isArray(payload?.Kinds) ? payload.Kinds : [];
        setKinds(list);
        if (list.length > 0 && !list.some((item) => item.key === kind)) setKind(list[0].key);
      })
      .catch((reason: Error) => {
        if (!cancelled) setError(reason.message);
      });
    return () => {
      cancelled = true;
    };
    // Chỉ nạp danh mục một lần khi mở trang.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({
        kind,
        days: String(days),
        page: String(page),
        pageSize: "50",
      });
      if (appliedCharacter) query.set("character", appliedCharacter);
      const response = await fetch(`/api/gm/game-logs?${query.toString()}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.message ?? "Không đọc được nhật ký.");
      setData(payload as LogPage);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không đọc được nhật ký.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [kind, days, page, appliedCharacter]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalPages = useMemo(() => {
    if (!data || data.total === 0) return 1;
    return Math.max(1, Math.ceil(data.total / data.pageSize));
  }, [data]);

  function chooseKind(next: string) {
    setKind(next);
    setPage(1);
  }

  function applyFilter() {
    setAppliedCharacter(character.trim());
    setPage(1);
  }

  return (
    <section className="game-log-viewer">
      <div className="operations-tabs" role="tablist" aria-label="Chọn loại nhật ký">
        {kinds.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={item.key === kind}
            className={item.key === kind ? "active" : ""}
            onClick={() => chooseKind(item.key)}
          >
            {item.title}
          </button>
        ))}
      </div>

      <div className="game-log-filters">
        <label>
          <span>Nhân vật</span>
          <input
            value={character}
            maxLength={50}
            placeholder="Để trống là xem tất cả"
            onChange={(event) => setCharacter(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") applyFilter();
            }}
          />
        </label>
        <label>
          <span>Khoảng thời gian</span>
          <select
            value={days}
            onChange={(event) => {
              setDays(Number(event.target.value));
              setPage(1);
            }}
          >
            {DAY_CHOICES.map((value) => (
              <option key={value} value={value}>
                {value} ngày gần nhất
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={applyFilter}>
          Lọc
        </button>
        <button type="button" onClick={() => void load()} disabled={loading}>
          {loading ? "Đang đọc…" : "Làm mới"}
        </button>
      </div>

      {error ? <p className="game-log-error">{error}</p> : null}

      {data ? (
        <p className="game-log-summary">
          <b>{data.title}</b> · {data.total.toLocaleString("vi-VN")} bản ghi trong {data.days} ngày
          {appliedCharacter ? ` · nhân vật ${appliedCharacter}` : ""}
        </p>
      ) : null}

      <div className="game-log-table-wrap">
        <table className="game-log-table">
          <thead>
            <tr>
              <th>Thời điểm</th>
              <th>Tài khoản</th>
              <th>Nhân vật</th>
              <th>Nội dung</th>
              <th>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {data && data.rows.length > 0 ? (
              data.rows.map((row, index) => (
                <tr key={`${row.time}-${index}`}>
                  <td className="nowrap">{row.time}</td>
                  <td>{row.account}</td>
                  <td>{row.character}</td>
                  {/*
                    Tên vật phẩm trong database lưu ở dạng mã cũ ("U Minh-Saìt Phâòt"),
                    nắn lại chỉ để hiển thị. Không sửa ngược vào database vì game vẫn
                    đang đọc tên từ đó.
                  */}
                  <td>{fixVietnameseName(row.summary)}</td>
                  <td className="game-log-detail">{fixVietnameseName(row.detail)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="game-log-empty">
                  {loading ? "Đang đọc…" : "Không có bản ghi nào khớp bộ lọc."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="game-log-pager">
        <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page <= 1 || loading}>
          Trang trước
        </button>
        <span>
          Trang {data?.page ?? page} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => setPage((value) => value + 1)}
          disabled={loading || page >= totalPages}
        >
          Trang sau
        </button>
      </div>
    </section>
  );
}
