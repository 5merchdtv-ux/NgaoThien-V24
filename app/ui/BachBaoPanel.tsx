"use client";

import {
  History,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";

type ShopItem = {
  id: number;
  itemId: number;
  name: string;
  price: number;
  description: string;
  type: number;
  return: number;
  amount: number;
  magic1: number;
  magic2: number;
  magic3: number;
  magic4: number;
  magic5: number;
  primarySoul: number;
  intermediateSoul: number;
  evolution: number;
  locked: number;
  days: number;
};

type ShopDraft = Omit<ShopItem, "id">;

type ShopAudit = {
  time: string;
  action: string;
  accountId: string;
  detail: string;
};

const EMPTY_ITEM: ShopDraft = {
  itemId: 0,
  name: "",
  price: 0,
  description: "",
  type: 1,
  return: 0,
  amount: 1,
  magic1: 0,
  magic2: 0,
  magic3: 0,
  magic4: 0,
  magic5: 0,
  primarySoul: 0,
  intermediateSoul: 0,
  evolution: 0,
  locked: 0,
  days: 0,
};

const numericFields: Array<{ key: keyof ShopDraft; label: string; min?: number; max?: number }> = [
  { key: "magic1", label: "Dòng thuộc tính 1" },
  { key: "magic2", label: "Dòng thuộc tính 2" },
  { key: "magic3", label: "Dòng thuộc tính 3" },
  { key: "magic4", label: "Dòng thuộc tính 4" },
  { key: "magic5", label: "Dòng thuộc tính 5" },
  { key: "primarySoul", label: "Sơ cấp phụ hồn" },
  { key: "intermediateSoul", label: "Trung cấp phụ hồn" },
  { key: "evolution", label: "Tiến hóa" },
];

function currencyLabel(type: number) {
  if (type === 4) return "Cash X";
  if (type === 10) return "Coin";
  return "Cash";
}

function actionLabel(action: string) {
  if (action === "SHOP_CREATE") return "Thêm";
  if (action === "SHOP_UPDATE") return "Sửa";
  if (action === "SHOP_DELETE") return "Xóa";
  return action;
}

export default function BachBaoPanel() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loaiFilter, setLoaiFilter] = useState<"all" | "cash" | "cashx" | "coin">("all");
  const [history, setHistory] = useState<ShopAudit[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [editor, setEditor] = useState<{ mode: "create" | "edit"; id?: number; expectedItemId?: number } | null>(null);
  const [draft, setDraft] = useState<ShopDraft>(EMPTY_ITEM);
  const [deleteTarget, setDeleteTarget] = useState<ShopItem | null>(null);

  const loadHistory = useCallback(async () => {
    const response = await fetch("/api/gm/shop?view=history", { cache: "no-store" });
    const payload = (await response.json()) as { success?: boolean; entries?: ShopAudit[] };
    if (response.status === 401) {
      window.dispatchEvent(new Event("hknt:open-gm-login"));
      return;
    }
    if (response.ok && payload.success === true) setHistory(payload.entries ?? []);
  }, []);

  const load = useCallback(async (search = "", keepNotice = false) => {
    setLoading(true);
    if (!keepNotice) setNotice(null);
    try {
      const response = await fetch(`/api/gm/shop?query=${encodeURIComponent(search)}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as {
        success?: boolean;
        message?: string;
        items?: ShopItem[];
      };
      if (response.status === 401) {
        window.dispatchEvent(new Event("hknt:open-gm-login"));
        throw new Error("Phiên GM chưa kết nối hoặc đã hết hạn. Hãy đăng nhập ở thanh trên.");
      }
      if (!response.ok || payload.success !== true) {
        throw new Error(payload.message ?? "Không tải được Bách Bảo Các.");
      }
      setItems(payload.items ?? []);
    } catch (error) {
      setItems([]);
      setNotice({
        tone: "error",
        message: error instanceof Error ? error.message : "Không tải được Bách Bảo Các.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    void loadHistory();
    const refresh = () => {
      void load();
      void loadHistory();
    };
    window.addEventListener("hknt:gm-session-changed", refresh);
    return () => window.removeEventListener("hknt:gm-session-changed", refresh);
  }, [load, loadHistory]);

  // Khóa cuộn nền và cho Escape đóng — dùng chung cho CẢ trình sửa lẫn hộp xác nhận xóa.
  // Trước đây chỉ có trình sửa; hộp xóa nằm inline phía trên lưới mặt hàng nên bấm "Xóa" ở
  // thẻ dưới màn hình là hộp hiện tít trên đầu, ngoài tầm nhìn — người dùng tưởng nút chết.
  useEffect(() => {
    if (!editor && !deleteTarget) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (editor) {
        setEditor(null);
        return;
      }
      setDeleteTarget(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [editor, deleteTarget]);

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void load(query.trim());
  }

  function openCreate() {
    setDraft({ ...EMPTY_ITEM });
    setEditor({ mode: "create" });
    setDeleteTarget(null);
    setNotice(null);
  }

  function openEdit(item: ShopItem) {
    const { id: _id, ...values } = item;
    setDraft(values);
    setEditor({ mode: "edit", id: item.id, expectedItemId: item.itemId });
    setDeleteTarget(null);
    setNotice(null);
  }

  function setNumber(field: keyof ShopDraft, value: string) {
    const parsed = Number(value);
    setDraft((current) => ({
      ...current,
      [field]: Number.isFinite(parsed) ? Math.trunc(parsed) : 0,
    }));
  }

  async function saveItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editor) return;
    setBusy("save");
    setNotice(null);
    try {
      const isCreate = editor.mode === "create";
      const response = await fetch("/api/gm/shop", {
        method: isCreate ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isCreate
          ? { action: "create", item: draft }
          : {
              id: editor.id,
              expectedItemId: editor.expectedItemId,
              item: draft,
            }),
      });
      const payload = (await response.json()) as { success?: boolean; message?: string };
      if (response.status === 401) {
        window.dispatchEvent(new Event("hknt:open-gm-login"));
      }
      if (!response.ok || payload.success !== true) {
        throw new Error(payload.message ?? "Không thể lưu mặt hàng.");
      }
      setNotice({ tone: "success", message: payload.message ?? "Đã lưu mặt hàng." });
      setEditor(null);
      await Promise.all([load(query.trim(), true), loadHistory()]);
    } catch (error) {
      setNotice({
        tone: "error",
        message: error instanceof Error ? error.message : "Không thể lưu mặt hàng.",
      });
    } finally {
      setBusy("");
    }
  }

  async function deleteItem() {
    if (!deleteTarget) return;
    setBusy("delete");
    setNotice(null);
    try {
      const response = await fetch("/api/gm/shop", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: deleteTarget.id,
          itemId: deleteTarget.itemId,
          // Chuỗi xác nhận nay do giao diện tự dựng thay vì bắt người dùng gõ tay.
          // Cả API route lẫn gateway vẫn kiểm chuỗi này nên KHÔNG được bỏ — bỏ đi là 400.
          confirmation: `XOA ${deleteTarget.itemId}`,
        }),
      });
      const payload = (await response.json()) as { success?: boolean; message?: string };
      if (response.status === 401) {
        window.dispatchEvent(new Event("hknt:open-gm-login"));
      }
      if (!response.ok || payload.success !== true) {
        throw new Error(payload.message ?? "Không thể xóa mặt hàng.");
      }
      setNotice({ tone: "success", message: payload.message ?? "Đã xóa mặt hàng." });
      setDeleteTarget(null);
      await Promise.all([load(query.trim(), true), loadHistory()]);
    } catch (error) {
      setNotice({
        tone: "error",
        message: error instanceof Error ? error.message : "Không thể xóa mặt hàng.",
      });
    } finally {
      setBusy("");
    }
  }

  async function reloadGameServer() {
    setBusy("reload");
    setNotice(null);
    try {
      const response = await fetch("/api/gm/shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reload" }),
      });
      const payload = (await response.json()) as { success?: boolean; message?: string };
      if (response.status === 401) {
        window.dispatchEvent(new Event("hknt:open-gm-login"));
      }
      if (!response.ok || payload.success !== true) {
        throw new Error(payload.message ?? "GameServer từ chối tải lại.");
      }
      setNotice({ tone: "success", message: "Đã tải lại dữ liệu Bách Bảo Các trên cả hai kênh đang hoạt động." });
      await load(query.trim(), true);
    } catch (error) {
      setNotice({
        tone: "error",
        message: error instanceof Error ? error.message : "Không thể tải lại Bách Bảo Các.",
      });
    } finally {
      setBusy("");
    }
  }

  return (
    <section className="bach-bao-page">
      <div className="glass-panel bach-bao-toolbar">
        <div>
          <span className="section-kicker">DỮ LIỆU ITEMSELL · KÊNH 1 + KÊNH 2</span>
          <h2>Bách Bảo Các</h2>
          <p>Thêm, sửa hoặc xóa mặt hàng thật; GameServer tự nhận lại dữ liệu sau mỗi lần lưu.</p>
        </div>
        <form onSubmit={search}>
          <Search size={17} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm ID, PID hoặc tên vật phẩm"
          />
          <button type="submit" disabled={loading}>Tìm</button>
        </form>
        <div className="bach-bao-toolbar-actions">
          <button type="button" className="bach-bao-create" onClick={openCreate}>
            <Plus size={17} /> Thêm mặt hàng
          </button>
          <button
            type="button"
            className="bach-bao-reload"
            onClick={() => void reloadGameServer()}
            disabled={busy === "reload"}
          >
            {busy === "reload" ? <LoaderCircle className="spinning" size={17} /> : <RefreshCw size={17} />}
            Tải lại GameServer
          </button>
        </div>
      </div>

      {notice ? <div className={`gm-notice ${notice.tone}`}>{notice.message}</div> : null}

      {editor ? (
        <div className="bach-bao-modal-backdrop">
        <form
          className="glass-panel bach-bao-editor"
          onSubmit={saveItem}
          role="dialog"
          aria-modal="true"
          aria-label={editor.mode === "create" ? "Thêm mặt hàng Bách Bảo Các" : "Sửa mặt hàng Bách Bảo Các"}
        >
          <div className="bach-bao-editor-heading">
            <div className="bach-bao-editor-preview">
              <img
                src={`/item-icons/${draft.itemId}.jpg`}
                alt="Ảnh vật phẩm"
                width={64}
                height={64}
                onError={(event) => { event.currentTarget.style.opacity = "0.25"; }}
              />
            </div>
            <div>
              <span className="section-kicker">{editor.mode === "create" ? "TẠO MỚI" : `CHỈNH SỬA #${editor.id}`}</span>
              <h3>{draft.name || "Mặt hàng mới"}</h3>
              <p>PID phải tồn tại trong dữ liệu game và không được trùng mặt hàng khác.</p>
            </div>
            <button type="button" className="icon-button" onClick={() => setEditor(null)} aria-label="Đóng">
              <X size={19} />
            </button>
          </div>

          <div className="bach-bao-editor-grid">
            <label>
              <span>PID vật phẩm</span>
              <input type="number" min={1} value={draft.itemId || ""} onChange={(event) => setNumber("itemId", event.target.value)} required />
            </label>
            <label className="wide-two">
              <span>Tên hiển thị</span>
              <input value={draft.name} maxLength={255} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} required />
            </label>
            <label>
              <span>Giá bán</span>
              <input type="number" min={0} value={draft.price} onChange={(event) => setNumber("price", event.target.value)} required />
            </label>
            <label>
              <span>Loại tiền / mục</span>
              <select value={draft.type} onChange={(event) => setNumber("type", event.target.value)}>
                <option value={1}>1 · Cash</option>
                <option value={2}>2 · Cash</option>
                <option value={3}>3 · Cash</option>
                <option value={4}>4 · Cash X</option>
                <option value={5}>5 · Cash</option>
                <option value={10}>10 · Coin</option>
              </select>
            </label>
            <label>
              <span>Số lượng</span>
              <input type="number" min={1} max={9999} value={draft.amount} onChange={(event) => setNumber("amount", event.target.value)} required />
            </label>
            <label>
              <span>Giá trị hoàn trả</span>
              <input type="number" min={0} value={draft.return} onChange={(event) => setNumber("return", event.target.value)} />
            </label>
            <label>
              <span>Hạn dùng (ngày)</span>
              <input type="number" min={0} max={3650} value={draft.days} onChange={(event) => setNumber("days", event.target.value)} />
            </label>
            <label className="bach-bao-lock-field">
              <input type="checkbox" checked={draft.locked === 1} onChange={(event) => setDraft((current) => ({ ...current, locked: event.target.checked ? 1 : 0 }))} />
              <span>Khóa vật phẩm khi mua</span>
            </label>
            <label className="wide-all">
              <span>Mô tả trong shop</span>
              <textarea value={draft.description} maxLength={1000} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} />
            </label>
          </div>

          <details className="bach-bao-advanced">
            <summary>Thuộc tính vật phẩm nâng cao</summary>
            <div className="bach-bao-advanced-grid">
              {numericFields.map((field) => (
                <label key={field.key}>
                  <span>{field.label}</span>
                  <input
                    type="number"
                    min={field.min ?? 0}
                    max={field.max ?? 2_000_000_000}
                    value={draft[field.key] as number}
                    onChange={(event) => setNumber(field.key, event.target.value)}
                  />
                </label>
              ))}
            </div>
          </details>

          <div className="bach-bao-editor-actions">
            <button type="button" onClick={() => setEditor(null)}>Hủy</button>
            <button type="submit" className="primary" disabled={busy === "save"}>
              {busy === "save" ? <LoaderCircle className="spinning" size={17} /> : <Save size={17} />}
              {editor.mode === "create" ? "Thêm vào Bách Bảo Các" : "Lưu thay đổi"}
            </button>
          </div>
        </form>
        </div>
      ) : null}

      {deleteTarget ? (
        <div
          className="bach-bao-modal-backdrop"
          onClick={(event) => {
            if (event.target !== event.currentTarget) return;
            setDeleteTarget(null);
          }}
        >
        <div className="glass-panel bach-bao-delete-box" role="dialog" aria-modal="true">
          <div>
            <span className="section-kicker">XÓA MẶT HÀNG</span>
            <h3>{deleteTarget.name}</h3>
            <p>PID <strong>{deleteTarget.itemId}</strong> · giá {deleteTarget.price.toLocaleString("vi-VN")}</p>
            <p>Xóa khỏi bảng ITEMSELL và tải lại Bách Bảo Các trên các kênh đang chạy. Không hoàn tác được.</p>
          </div>
          <div className="bach-bao-delete-actions">
            <button type="button" onClick={() => setDeleteTarget(null)}>Hủy</button>
            <button
              type="button"
              className="danger"
              disabled={busy === "delete"}
              onClick={() => void deleteItem()}
            >
              {busy === "delete" ? <LoaderCircle className="spinning" size={17} /> : <Trash2 size={17} />}
              Xóa vĩnh viễn
            </button>
          </div>
        </div>
        </div>
      ) : null}

      <div className="bach-bao-summary">
        <ShoppingBag size={18} />
        <strong>{loading ? "Đang đọc dữ liệu…" : `${items.length} mặt hàng`}</strong>
        <span>Loại 4 dùng Cash X · loại 10 dùng Coin · các loại còn lại dùng Cash.</span>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "0 0 12px" }}>
        {([
          { key: "all", label: "Tất cả" },
          { key: "cash", label: "Cash" },
          { key: "cashx", label: "Cash X (loại 4)" },
          { key: "coin", label: "Coin (loại 10)" },
        ] as const).map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setLoaiFilter(f.key)}
            style={{
              padding: "5px 12px",
              borderRadius: 8,
              fontSize: 13,
              cursor: "pointer",
              border: loaiFilter === f.key ? "1px solid #f5a623" : "1px solid rgba(255,255,255,0.14)",
              background: loaiFilter === f.key ? "rgba(245,166,35,0.18)" : "rgba(255,255,255,0.04)",
              color: "inherit",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bach-bao-grid">
        {loading
          ? Array.from({ length: 12 }, (_, index) => <div className="bach-bao-card skeleton" key={index} />)
          : items
              .filter((it) =>
                loaiFilter === "all"
                  ? true
                  : loaiFilter === "cashx"
                    ? it.type === 4
                    : loaiFilter === "coin"
                      ? it.type === 10
                      : it.type !== 4 && it.type !== 10,
              )
              .map((item) => {
              const magic = [item.magic1, item.magic2, item.magic3, item.magic4, item.magic5]
                .filter((value) => value > 0)
                .join(" · ");
              return (
                <article className="bach-bao-card" key={item.id}>
                  <div className="bach-bao-icon">
                    <img
                      src={`/item-icons/${item.itemId}.jpg`}
                      alt={item.name}
                      width={58}
                      height={58}
                      loading="lazy"
                      onError={(event) => { event.currentTarget.style.opacity = "0.25"; }}
                    />
                    <span>#{item.id}</span>
                  </div>
                  <div className="bach-bao-card-copy">
                    <h3>{item.name || `PID ${item.itemId}`}</h3>
                    <p>PID {item.itemId} · SL {item.amount}</p>
                    <strong>{item.price.toLocaleString("vi-VN")} {currencyLabel(item.type)}</strong>
                    <small>
                      {magic ? `Thuộc tính: ${magic}` : "Không có dòng thuộc tính"}
                      {item.locked ? " · Khóa" : ""}
                      {item.days > 0 ? ` · ${item.days} ngày` : ""}
                    </small>
                  </div>
                  <div className="bach-bao-card-actions">
                    <button type="button" onClick={() => openEdit(item)}><Pencil size={15} /> Sửa</button>
                    <button
                      type="button"
                      className="danger"
                      onClick={() => { setDeleteTarget(item); setEditor(null); }}
                    >
                      <Trash2 size={15} /> Xóa
                    </button>
                  </div>
                </article>
              );
            })}
      </div>

      <section className="glass-panel bach-bao-history">
        <div className="bach-bao-history-heading">
          <History size={18} />
          <div>
            <strong>Lịch sử thay đổi gần đây</strong>
            <span>Ghi lại tài khoản quản trị và ID/PID đã thao tác.</span>
          </div>
        </div>
        {history.length === 0 ? <p>Chưa có thao tác thêm, sửa hoặc xóa.</p> : (
          <div className="bach-bao-history-list">
            {history.slice(0, 20).map((entry, index) => (
              <div key={`${entry.time}-${index}`}>
                <strong>{actionLabel(entry.action)}</strong>
                <span>{entry.accountId}</span>
                <code>{entry.detail}</code>
                <time>{new Date(entry.time).toLocaleString("vi-VN")}</time>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
