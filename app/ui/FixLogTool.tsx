"use client";

import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  FileCode2,
  Folder,
  FolderOpen,
  Search,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { FIX_LOG, FIX_LOG_META, type FixEntry, type FixStatus } from "@/lib/fix-log";

const STATUS_LABEL: Record<FixStatus, string> = {
  "da-xong": "Đã xong",
  "dang-theo-doi": "Đang theo dõi",
  "chua-lam": "Chưa làm",
};

function StatusChip({ status }: { status: FixStatus }) {
  return (
    <span className={`fixlog-status ${status}`}>
      <i /> {STATUS_LABEL[status]}
    </span>
  );
}

function RevisionList({ entry }: { entry: FixEntry }) {
  if (entry.lichSu.length === 0) {
    return (
      <div className="fixlog-empty-revision">
        <Clock size={15} /> Chưa có lần sửa nào được ghi nhận.
      </div>
    );
  }

  return (
    <ol className="fixlog-revisions">
      {entry.lichSu.map((rev, index) => (
        // Khóa phải kèm id nhóm lỗi và thứ tự: nhiều bản ghi có thể cùng số
        // hiệu phiên bản, trùng khóa làm React vẽ lẫn nội dung giữa các mục.
        <li key={`${entry.id}-${index}-${rev.version}`} className={rev.ketQua}>
          <div className="fixlog-revision-head">
            <strong>{rev.version}</strong>
            <span>{rev.ngay}</span>
            <em className={rev.ketQua}>
              {rev.ketQua === "dat" ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
              {rev.ketQua === "dat" ? "Đạt" : "Không đạt"}
            </em>
          </div>
          <div className="fixlog-diff">
            <div className="fixlog-diff-col cu">
              <span>CŨ</span>
              <p>{rev.cu}</p>
            </div>
            <ArrowRight size={16} className="fixlog-diff-arrow" />
            <div className="fixlog-diff-col moi">
              <span>MỚI</span>
              <p>{rev.moi}</p>
            </div>
          </div>
          {rev.ghiChu ? <p className="fixlog-revision-note">{rev.ghiChu}</p> : null}
        </li>
      ))}
    </ol>
  );
}

export default function FixLogTool() {
  const [selectedId, setSelectedId] = useState(FIX_LOG[0]?.id ?? "");
  const [keyword, setKeyword] = useState("");
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const [closedGroups, setClosedGroups] = useState<string[]>([]);

  const filtered = FIX_LOG.filter((entry) => {
    if (!keyword.trim()) return true;
    const haystack = `${entry.tieuDe} ${entry.nhom} ${entry.trieuChung} ${entry.nguyenNhan}`.toLowerCase();
    return haystack.includes(keyword.trim().toLowerCase());
  });

  const selected = FIX_LOG.find((entry) => entry.id === selectedId) ?? filtered[0] ?? FIX_LOG[0];

  // Gom theo nhóm, giữ đúng thứ tự xuất hiện trong FIX_LOG.
  const groups = useMemo(() => {
    const map = new Map<string, FixEntry[]>();
    for (const entry of filtered) {
      const list = map.get(entry.nhom);
      if (list) list.push(entry);
      else map.set(entry.nhom, [entry]);
    }
    return [...map.entries()];
  }, [filtered]);

  // Mặc định mở nhóm chứa mục đang xem; khi đang tìm thì mở hết cho dễ thấy.
  const isGroupOpen = (nhom: string) => {
    if (closedGroups.includes(nhom)) return false;
    if (keyword.trim()) return true;
    return openGroups.includes(nhom) || selected?.nhom === nhom;
  };

  const toggleGroup = (nhom: string) => {
    if (isGroupOpen(nhom)) {
      setClosedGroups((current) => [...new Set([...current, nhom])]);
      setOpenGroups((current) => current.filter((name) => name !== nhom));
    } else {
      setClosedGroups((current) => current.filter((name) => name !== nhom));
      setOpenGroups((current) => [...new Set([...current, nhom])]);
    }
  };

  const soXong = FIX_LOG.filter((entry) => entry.trangThai === "da-xong").length;
  const soConLai = FIX_LOG.length - soXong;

  return (
    <div className="operations-body fixlog-tool">
      <div className="fixlog-header">
        <div>
          <span className="fixlog-label">NHẬT KÝ SỬA LỖI</span>
          <h3>Theo dõi lỗi đã xử lý</h3>
          <p>
            Mỗi nhóm lỗi là một mục duy nhất. Sửa lại lần nữa thì ghi thêm bản
            ghi cũ → mới vào chính mục đó, không tách thành dòng mới.
          </p>
        </div>
        <div className="fixlog-counters">
          <div>
            <strong>{soXong}</strong>
            <span>Đã xong</span>
          </div>
          <div>
            <strong>{soConLai}</strong>
            <span>Còn lại</span>
          </div>
        </div>
      </div>

      <div className="operations-message">
        Dữ liệu đóng gói sẵn trong Dashboard, không gọi API. Mã thay đổi{" "}
        <code>{FIX_LOG_META.maThayDoi}</code> · Cập nhật {FIX_LOG_META.capNhat} · Source chuẩn{" "}
        <code>{FIX_LOG_META.sourceChuan}</code>
      </div>

      <div className="fixlog-layout">
        <aside className="fixlog-list" aria-label="Danh sách nhóm lỗi">
          <div className="fixlog-search">
            <Search size={15} />
            <input
              type="text"
              value={keyword}
              placeholder="Tìm theo tên lỗi hoặc triệu chứng"
              onChange={(event) => setKeyword(event.target.value)}
            />
          </div>
          <div className="fixlog-list-title">
            <strong>{groups.length} nhóm</strong>
            <span>{filtered.length}/{FIX_LOG.length} lỗi</span>
          </div>
          <div className="fixlog-list-scroll">
          {groups.map(([nhom, entries]) => {
            const expanded = isGroupOpen(nhom);
            const done = entries.filter((entry) => entry.trangThai === "da-xong").length;
            return (
              <div className={`fixlog-group ${expanded ? "open" : ""}`} key={nhom}>
                <button
                  type="button"
                  className="fixlog-group-head"
                  aria-expanded={expanded}
                  onClick={() => toggleGroup(nhom)}
                >
                  <ChevronRight size={15} className="fixlog-group-caret" />
                  {expanded ? <FolderOpen size={16} /> : <Folder size={16} />}
                  <strong>{nhom}</strong>
                  <em>{done}/{entries.length}</em>
                </button>
                {expanded ? (
                  <div className="fixlog-group-body">
                    {entries.map((entry) => (
                      <button
                        type="button"
                        key={entry.id}
                        className={`fixlog-entry ${selected?.id === entry.id ? "active" : ""}`}
                        onClick={() => setSelectedId(entry.id)}
                      >
                        <strong>{entry.tieuDe}</strong>
                        <small>
                          {entry.lichSu.length > 0
                            ? `${entry.lichSu.length} lần sửa · ${entry.phienBanHienTai}`
                            : "Chưa sửa"}
                        </small>
                        <StatusChip status={entry.trangThai} />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
          {filtered.length === 0 ? <p className="fixlog-no-result">Không tìm thấy nhóm lỗi nào.</p> : null}
          </div>
        </aside>

        {selected ? (
          <main className="fixlog-detail">
            <header className="fixlog-detail-head">
              <div>
                <div className="fixlog-meta">
                  <span className="fixlog-label">{selected.nhom}</span>
                  <span>{selected.kenh}</span>
                  <span>Bản hiện tại: {selected.phienBanHienTai}</span>
                  {selected.hoSo ? <code className="fixlog-hoso">{selected.hoSo}</code> : null}
                  {selected.loai === "kiem-tra" ? <span className="fixlog-kind">KIỂM TRA</span> : null}
                </div>
                <h2>{selected.tieuDe}</h2>
              </div>
              <StatusChip status={selected.trangThai} />
            </header>

            <section className="fixlog-block">
              <h4>Triệu chứng</h4>
              <p>{selected.trieuChung}</p>
            </section>

            <section className="fixlog-block">
              <h4>Nguyên nhân</h4>
              <p>{selected.nguyenNhan}</p>
            </section>

            {selected.bangChung ? (
              <section className="fixlog-block evidence">
                <h4>Bằng chứng xác minh</h4>
                <p>{selected.bangChung}</p>
              </section>
            ) : null}

            <section className="fixlog-block">
              <h4>
                <ClipboardList size={16} /> Lịch sử sửa
              </h4>
              <RevisionList entry={selected} />
            </section>

            <section className="fixlog-block">
              <h4>
                <FileCode2 size={16} /> File đã sửa
              </h4>
              <div className="fixlog-files">
                {selected.file.map((file) => (
                  <code key={file}>{file}</code>
                ))}
              </div>
            </section>
          </main>
        ) : null}
      </div>
    </div>
  );
}
