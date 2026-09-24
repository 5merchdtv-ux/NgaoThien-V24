"use client";

import {
  type ClipboardEvent as ReactClipboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import EventTemplateTool from "./EventTemplateTool";
import FixLogTool from "./FixLogTool";
import HopQua29Editor from "./HopQua29Editor";
import Portal from "./Portal";

type Module = "launcher" | "voucher" | "npc-shop" | "event" | "fixlog" | "hopqua29";

type NewsPost = {
  id: string;
  badge: string;
  title: string;
  description: string;
  date: string;
  imageUrl: string;
  author: string;
  status: "draft" | "published" | "scheduled";
  pinned: boolean;
  publishAtUtc?: string | null;
  updatedAtUtc: string;
};

type VoucherRewardItem = {
  itemId: number; itemName: string; quantity: number;
  magic0: number; magic1: number; magic2: number; magic3: number; magic4: number;
  basicSoul: number; advancedSoul: number; evolution: number; locked: number; days: number;
};
type VoucherReward = {
  id: number; type: number; rewards: string; note: string;
  availableCodes: number; items: VoucherRewardItem[];
};
type VoucherBatch = {
  batchId: string; name: string; rewardType: number; total: number; status: string;
  createdBy: string; createdAtUtc: string; remaining: number; redeemed: number; revoked: number;
};
type VoucherCode = { code: string; status: string };
type ItemCatalogEntry = { itemId: number; name: string; level: number; jobLevel: number; questItem: boolean };

type NpcShopItem = {
  id: number; npcName: string; nid: number; slot: number; itemId: number; itemName: string;
  money: number; magic0: number; magic1: number; magic2: number; magic3: number; magic4: number;
  honor: number; coin: number; mapId: number | null; mapName: string;
};
/** Một dòng shop ĐÃ GỠ, đọc từ bảng lưu trữ. `dangBanLai` = NPC hiện lại có món này. */
type NpcShopArchiveItem = {
  archiveId: number; originalId: number; npcName: string; nid: number; slot: number;
  itemId: number; itemName: string; money: number; honor: number; coin: number;
  removedAt: string; removedBy: string; dangBanLai: boolean;
};
type NpcShopMap = { mapId: number; mapName: string; npcCount: number; shopNpcCount: number };
type NpcShopNpc = {
  id: number; nid: number; npcName: string; mapId: number;
  x: number; y: number; z: number; itemCount: number; batTat: boolean;
};

const emptyNews = {
  id: "", badge: "NEW", title: "", description: "", date: new Date().toLocaleDateString("vi-VN"),
  imageUrl: "", author: "TRIEUHOANG", pinned: false, publishAt: "",
};

type LauncherContentBlock =
  | { type: "text"; value: string }
  | { type: "image"; url: string; alt: string };

const inlineImagePattern = /^!\[([^\]]*)\]\((https:\/\/[^\s)]+)\)$/i;
const directImagePattern = /^https:\/\/[^\s]+\.(?:avif|gif|jpe?g|png|webp)(?:\?[^\s]*)?$/i;

function launcherContentBlocks(value: string): LauncherContentBlock[] {
  const blocks: LauncherContentBlock[] = [];
  let textLines: string[] = [];
  const flushText = () => {
    if (!textLines.length) return;
    blocks.push({ type: "text", value: textLines.join("\n") });
    textLines = [];
  };

  value.replace(/\r\n?/g, "\n").split("\n").forEach((line) => {
    const trimmed = line.trim();
    const markdownImage = trimmed.match(inlineImagePattern);
    if (markdownImage) {
      flushText();
      blocks.push({ type: "image", alt: markdownImage[1] || "Hình ảnh bài viết", url: markdownImage[2] });
      return;
    }
    if (directImagePattern.test(trimmed)) {
      flushText();
      blocks.push({ type: "image", alt: "Hình ảnh bài viết", url: trimmed });
      return;
    }
    textLines.push(line);
  });
  flushText();
  return blocks;
}

function LauncherArticlePreview({
  badge,
  title,
  description,
  date,
  author,
  imageUrl,
  expanded = false,
}: {
  badge: string;
  title: string;
  description: string;
  date: string;
  author: string;
  imageUrl: string;
  expanded?: boolean;
}) {
  const content = launcherContentBlocks(description);
  return (
    <article className={`launcher-preview ${expanded ? "expanded" : ""}`}>
      {imageUrl.trim() ? <img className="launcher-preview-cover" src={imageUrl.trim()} alt="" /> : null}
      <div className="launcher-preview-meta">
        <span>{badge || "NEW"}</span>
        <small>{date || new Date().toLocaleDateString("vi-VN")} · {author || "Ban quản trị"}</small>
      </div>
      <strong>{title || "Tiêu đề tin Launcher"}</strong>
      <div className="launcher-preview-content">
        {content.length ? content.map((block, index) => block.type === "image" ? (
          <figure key={`${block.url}-${index}`}>
            <img src={block.url} alt={block.alt} loading="lazy" />
            {block.alt && block.alt !== "Hình ảnh bài viết" ? <figcaption>{block.alt}</figcaption> : null}
          </figure>
        ) : <p key={index}>{block.value}</p>) : <p>Nội dung xem trước sẽ hiển thị tại đây.</p>}
      </div>
    </article>
  );
}

const emptyNpcItem = {
  npcName: "", nid: 0, slot: 0, itemId: 0, money: 0,
  magic0: 0, magic1: 0, magic2: 0, magic3: 0, magic4: 0, honor: 0, coin: 0,
};

async function readJson(response: Response) {
  const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) throw new Error(String(payload.message ?? "Thao tác chưa thành công."));
  return payload;
}

export default function OperationsSuite({ active, onSelect }: { active: Module; onSelect: (value: Module) => void }) {
  return (
    <section className="glass-panel operations-suite" id="operations-suite">
      <div className="panel-title-row operations-heading">
        <div>
          <span className="section-kicker">CÔNG CỤ VẬN HÀNH MỞ RỘNG</span>
          <h2>Launcher, Voucher, Shop NPC và Event</h2>
          <p className="section-copy">Mọi thay đổi đều qua quyền GM8, có xác nhận và nhật ký. Không tự reset Kênh 1/Kênh 2.</p>
        </div>
        <div className="operations-tabs" role="tablist" aria-label="Chọn công cụ vận hành">
          <button className={active === "launcher" ? "active" : ""} onClick={() => onSelect("launcher")}>Tin Launcher</button>
          <button className={active === "voucher" ? "active" : ""} onClick={() => onSelect("voucher")}>Voucher</button>
          <button className={active === "npc-shop" ? "active" : ""} onClick={() => onSelect("npc-shop")}>Shop NPC</button>
          <button className={active === "event" ? "active" : ""} onClick={() => onSelect("event")}>Event</button>
          <button className={active === "hopqua29" ? "active" : ""} onClick={() => onSelect("hopqua29")}>Hộp Quà 2/9</button>
          <button className={active === "fixlog" ? "active" : ""} onClick={() => onSelect("fixlog")}>Nhật ký sửa lỗi</button>
        </div>
      </div>
      {active === "launcher" ? <LauncherNewsTool /> : null}
      {active === "voucher" ? <VoucherTool /> : null}
      {active === "npc-shop" ? <NpcShopTool /> : null}
      {active === "event" ? <EventTemplateTool /> : null}
      {active === "hopqua29" ? <HopQua29Editor /> : null}
      {active === "fixlog" ? <FixLogTool /> : null}
    </section>
  );
}

function LauncherNewsTool() {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [form, setForm] = useState(emptyNews);
  const [busy, setBusy] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [rightPanel, setRightPanel] = useState<"preview" | "posts">("preview");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const payload = await readJson(await fetch("/api/gm/launcher-news", { cache: "no-store" }));
      setPosts((payload.posts as NewsPost[]) ?? []);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Không tải được tin Launcher."); }
    finally { setBusy(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!editorOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setEditorOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [editorOpen]);

  function edit(post: NewsPost) {
    setForm({
      id: post.id, badge: post.badge, title: post.title, description: post.description,
      date: post.date, imageUrl: post.imageUrl, author: post.author, pinned: post.pinned,
      publishAt: post.publishAtUtc ? new Date(post.publishAtUtc).toISOString().slice(0, 16) : "",
    });
    setRightPanel("preview");
    setMessage(`Đang sửa: ${post.title}`);
  }

  function insertDescription(text: string, start: number, end: number) {
    setForm((current) => ({
      ...current,
      description: `${current.description.slice(0, start)}${text}${current.description.slice(end)}`.slice(0, 20_000),
    }));
  }

  async function handleImagePaste(event: ReactClipboardEvent<HTMLTextAreaElement>) {
    const clipboardItem = Array.from(event.clipboardData.items).find((item) => item.type.startsWith("image/"));
    const file = clipboardItem?.getAsFile();
    if (!file) return;
    event.preventDefault();
    if (file.size > 4 * 1024 * 1024) {
      setMessage("Ảnh dán vào vượt quá 4 MB. Hãy dùng ảnh nhỏ hơn.");
      return;
    }

    const target = event.currentTarget;
    const selectionStart = target.selectionStart;
    const selectionEnd = target.selectionEnd;
    setUploadingImage(true);
    setMessage("Đang tải ảnh đã dán...");
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.onerror = () => reject(new Error("Không đọc được ảnh trong bộ nhớ tạm."));
        reader.readAsDataURL(file);
      });
      const payload = await readJson(await fetch("/api/gm/launcher-news/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl, fileName: file.name || "anh-bai-viet.png" }),
      }));
      const url = String(payload.url ?? "");
      if (!url) throw new Error("Máy chủ không trả về đường dẫn ảnh.");
      const prefix = selectionStart > 0 && form.description[selectionStart - 1] !== "\n" ? "\n" : "";
      const suffix = form.description[selectionEnd] && form.description[selectionEnd] !== "\n" ? "\n" : "";
      const inserted = `${prefix}![Hình ảnh bài viết](${url})${suffix}`;
      insertDescription(inserted, selectionStart, selectionEnd);
      setForm((current) => current.imageUrl.trim() ? current : { ...current, imageUrl: url });
      setMessage("Đã chèn ảnh đúng vị trí con trỏ.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không tải được ảnh đã dán.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function save(status: "draft" | "published" | "scheduled") {
    if (!form.title.trim()) { setMessage("Hãy nhập tiêu đề tin Launcher."); return; }
    if (status === "scheduled" && !form.publishAt) { setMessage("Hãy chọn thời gian phát hành."); return; }
    setBusy(true);
    try {
      const firstInlineImage = launcherContentBlocks(form.description)
        .find((block): block is Extract<LauncherContentBlock, { type: "image" }> => block.type === "image");
      const payload = await readJson(await fetch("/api/gm/launcher-news", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          imageUrl: form.imageUrl.trim() || firstInlineImage?.url || "",
          status,
          publishAtUtc: status === "scheduled" ? new Date(form.publishAt).toISOString() : null,
        }),
      }));
      setMessage(String(payload.message ?? "Đã lưu tin Launcher."));
      setForm(emptyNews);
      await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Không lưu được tin."); }
    finally { setBusy(false); }
  }

  async function changeStatus(post: NewsPost, status: "draft" | "published") {
    setBusy(true);
    try {
      const payload = await readJson(await fetch("/api/gm/launcher-news", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: post.id, status }),
      }));
      setMessage(String(payload.message ?? "Đã đổi trạng thái."));
      await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Không đổi được trạng thái."); }
    finally { setBusy(false); }
  }

  async function remove(post: NewsPost) {
    if (!window.confirm(`Xóa bài “${post.title}”?`)) return;
    setBusy(true);
    try {
      const payload = await readJson(await fetch(`/api/gm/launcher-news?id=${encodeURIComponent(post.id)}`, { method: "DELETE" }));
      setMessage(String(payload.message ?? "Đã xóa bài."));
      if (form.id === post.id) setForm(emptyNews);
      await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Không xóa được bài."); }
    finally { setBusy(false); }
  }

  return (
    <div className="operations-body">
      {message ? <div className="operations-message">{message}</div> : null}
      <div className="operations-split">
        <div className="operations-form">
          <h3>{form.id ? "Sửa nội dung Launcher" : "Soạn tin Launcher"}</h3>
          <div className="form-grid compact-form-grid">
            <label><span>Nhãn</span><select value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })}><option>HOT</option><option>NEW</option><option>LỊCH</option><option>SỰ KIỆN</option><option>HƯỚNG DẪN GAME</option></select></label>
            <label><span>Ngày hiển thị</span><input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
            <label className="wide"><span>Tiêu đề</span><input value={form.title} maxLength={120} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
            <label className="wide launcher-content-field">
              <span className="launcher-field-heading">
                <span>Nội dung</span>
                <span className="launcher-field-actions">
                  <small>{form.description.length.toLocaleString("vi-VN")}/20.000 ký tự</small>
                  <button type="button" onClick={() => setEditorOpen(true)}>Phóng lớn</button>
                </span>
              </span>
              <textarea
                rows={7}
                value={form.description}
                maxLength={20_000}
                placeholder={"Viết nội dung tại đây.\nXuống dòng và chữ hoa/thường sẽ được giữ nguyên.\nDán link ảnh ở một dòng riêng hoặc Ctrl+V ảnh đã sao chép."}
                onPaste={(event) => void handleImagePaste(event)}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <small className="field-help">{uploadingImage ? "Đang tải ảnh..." : "Ảnh: dán link HTTPS ở một dòng riêng hoặc Ctrl+V trực tiếp vào ô nội dung."}</small>
            </label>
            <label className="wide"><span>Ảnh bìa HTTPS (không bắt buộc)</span><input value={form.imageUrl} placeholder="https://..." onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} /></label>
            <label><span>Tác giả</span><input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /></label>
            <label><span>Hẹn giờ</span><input type="datetime-local" value={form.publishAt} onChange={(e) => setForm({ ...form, publishAt: e.target.value })} /></label>
          </div>
          <label className="check-row"><input type="checkbox" checked={form.pinned} onChange={(e) => setForm({ ...form, pinned: e.target.checked })} /> Ghim bài lên đầu Launcher</label>
          <div className="operations-actions">
            <button disabled={busy} onClick={() => void save("draft")}>Lưu nháp</button>
            <button className="secondary" disabled={busy || !form.publishAt} onClick={() => void save("scheduled")}>Hẹn giờ</button>
            <button className="primary" disabled={busy} onClick={() => void save("published")}>Phát hành ngay</button>
            {form.id ? <button className="ghost" onClick={() => setForm(emptyNews)}>Tạo bài mới</button> : null}
          </div>
        </div>
        <div className="operations-list">
          <div className="launcher-side-header">
            <div>
              <h3>{rightPanel === "preview" ? "Xem trước bài viết mới" : "Tin đã đăng và bản nháp"}</h3>
              <small>{rightPanel === "preview" ? "Nội dung cập nhật tức thời khi bạn đang viết." : "Chọn một bài để đưa lại vào khung chỉnh sửa."}</small>
            </div>
            <div className="launcher-side-tabs">
              <button className={rightPanel === "preview" ? "active" : ""} onClick={() => setRightPanel("preview")}>Xem trước</button>
              <button className={rightPanel === "posts" ? "active" : ""} onClick={() => setRightPanel("posts")}>Đã lưu ({posts.length})</button>
            </div>
          </div>
          {rightPanel === "preview" ? (
            <LauncherArticlePreview
              badge={form.badge}
              title={form.title}
              description={form.description}
              date={form.date}
              author={form.author}
              imageUrl={form.imageUrl}
              expanded
            />
          ) : (
            <div className="launcher-posts-scroll">
              <div className="subsection-title launcher-refresh-row"><small>Danh sách phát hành và bản nháp</small><button onClick={() => void load()} disabled={busy}>Làm mới</button></div>
              {([
                ["published", "TIN ĐANG HIỂN THỊ TRÊN LAUNCHER"],
                ["scheduled", "TIN ĐÃ HẸN GIỜ"],
                ["draft", "BẢN NHÁP"],
              ] as const).map(([status, heading]) => {
                const entries = posts.filter((post) => post.status === status);
                if (!entries.length) return null;
                return <div className="news-status-group" key={status}>
                  <div className="news-status-heading"><strong>{heading}</strong><span>{entries.length} bài</span></div>
                  {entries.map((post) => (
                    <article className="operation-row selectable-news-row" key={post.id} onClick={() => edit(post)}>
                      <div><span className={`status-pill ${post.status}`}>{post.status === "published" ? "Đang phát" : post.status === "scheduled" ? "Đã hẹn" : "Bản nháp"}</span>{post.pinned ? <span className="status-pill pinned">Đã ghim</span> : null}</div>
                      <strong>{post.title}</strong><p>{post.description}</p><small>{post.badge} · {post.date} · {post.author}</small>
                      <div className="row-actions"><button onClick={(event) => { event.stopPropagation(); edit(post); }}>Sửa nội dung</button>{post.status === "published" ? <button onClick={(event) => { event.stopPropagation(); void changeStatus(post, "draft"); }}>Gỡ xuống</button> : <button onClick={(event) => { event.stopPropagation(); void changeStatus(post, "published"); }}>Phát hành</button>}<button className="danger" onClick={(event) => { event.stopPropagation(); void remove(post); }}>Xóa</button></div>
                    </article>
                  ))}
                </div>;
              })}
              {!busy && posts.length === 0 ? <p className="empty-state">Chưa có bài viết.</p> : null}
            </div>
          )}
        </div>
      </div>
      {editorOpen ? (
        <Portal>
        <div className="launcher-editor-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.currentTarget === event.target) setEditorOpen(false);
        }}>
          <section className="launcher-editor-modal" role="dialog" aria-modal="true" aria-labelledby="launcher-editor-title">
            <header>
              <div><span className="section-kicker">TRÌNH SOẠN THẢO RỘNG</span><h3 id="launcher-editor-title">Nội dung bài viết</h3></div>
              <button type="button" onClick={() => setEditorOpen(false)}>Thu nhỏ</button>
            </header>
            <textarea
              autoFocus
              value={form.description}
              maxLength={20_000}
              placeholder={"Viết nội dung tại đây...\nDán link ảnh ở một dòng riêng hoặc Ctrl+V ảnh đã sao chép."}
              onPaste={(event) => void handleImagePaste(event)}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
            <footer>
              <span>{uploadingImage ? "Đang tải ảnh..." : "Giữ nguyên chữ hoa/thường và toàn bộ xuống dòng."}</span>
              <strong>{form.description.length.toLocaleString("vi-VN")}/20.000 ký tự</strong>
            </footer>
          </section>
        </div>
        </Portal>
      ) : null}
    </div>
  );
}

function VoucherTool() {
  const [rewards, setRewards] = useState<VoucherReward[]>([]);
  const [batches, setBatches] = useState<VoucherBatch[]>([]);
  const [selectedType, setSelectedType] = useState<number | "new" | null>(null);
  const [rewardForm, setRewardForm] = useState({ type: 0, note: "" });
  const [draftItems, setDraftItems] = useState<VoucherRewardItem[]>([]);
  const [batchForm, setBatchForm] = useState({ name: "", count: 10 });
  const [catalogQuery, setCatalogQuery] = useState("");
  const [catalogItems, setCatalogItems] = useState<ItemCatalogEntry[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [codes, setCodes] = useState<VoucherCode[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const payload = await readJson(await fetch("/api/gm/vouchers", { cache: "no-store" }));
      const nextRewards = (payload.rewards as VoucherReward[]) ?? [];
      setRewards(nextRewards); setBatches((payload.batches as VoucherBatch[]) ?? []);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Không tải được Voucher."); }
    finally { setBusy(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (selectedType !== null || rewards.length === 0) return;
    selectReward(rewards[0]);
  }, [rewards, selectedType]);

  useEffect(() => {
    const query = catalogQuery.trim();
    if (!query) { setCatalogItems([]); setCatalogLoading(false); return; }
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setCatalogLoading(true);
      try {
        const response = await fetch(`/api/gm/items?query=${encodeURIComponent(query)}`, { cache: "no-store", signal: controller.signal });
        const payload = await response.json() as { success?: boolean; items?: ItemCatalogEntry[] };
        setCatalogItems(response.ok && payload.success ? payload.items ?? [] : []);
      } catch { if (!controller.signal.aborted) setCatalogItems([]); }
      finally { if (!controller.signal.aborted) setCatalogLoading(false); }
    }, 260);
    return () => { window.clearTimeout(timeout); controller.abort(); };
  }, [catalogQuery]);

  function selectReward(reward: VoucherReward) {
    setSelectedType(reward.type);
    setRewardForm({ type: reward.type, note: reward.note });
    setDraftItems((reward.items ?? []).map((item) => ({ ...item })));
    setMessage(`Đang sửa nhóm quà Type ${reward.type}.`);
  }

  function newReward() {
    const nextType = rewards.length ? Math.max(...rewards.map((reward) => reward.type)) + 1 : 0;
    setSelectedType("new"); setRewardForm({ type: nextType, note: "" }); setDraftItems([]);
    setBatchForm({ name: `Voucher Type ${nextType}`, count: 10 }); setMessage("Đang tạo nhóm quà mới.");
  }

  function addCatalogItem(item: ItemCatalogEntry) {
    setDraftItems((current) => {
      const existing = current.findIndex((entry) => entry.itemId === item.itemId);
      if (existing >= 0) return current.map((entry, index) => index === existing ? { ...entry, quantity: Math.min(9999, entry.quantity + 1) } : entry);
      if (current.length >= 20) { setMessage("Mỗi nhóm quà tối đa 20 món."); return current; }
      return [...current, { itemId: item.itemId, itemName: item.name, quantity: 1, magic0: 0, magic1: 0, magic2: 0, magic3: 0, magic4: 0, basicSoul: 0, advancedSoul: 0, evolution: 0, locked: 0, days: 0 }];
    });
  }

  function updateDraft(index: number, key: "quantity" | "magic0" | "magic1" | "magic2" | "magic3" | "magic4" | "basicSoul" | "advancedSoul" | "evolution" | "locked" | "days", value: number) {
    const minimum = key === "quantity" ? 1 : 0;
    const maximum = key === "quantity" ? 9999 : 2_000_000_000;
    setDraftItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: Math.max(minimum, Math.min(maximum, Number.isFinite(value) ? Math.trunc(value) : minimum)) } : item));
  }

  function encodedRewards() {
    return draftItems.map((item) => [item.itemId,item.quantity,item.magic0,item.magic1,item.magic2,item.magic3,item.magic4,item.basicSoul,item.advancedSoul,item.evolution,item.locked,item.days].join(",")).join(";");
  }

  async function saveReward(showSuccess = true) {
    if (draftItems.length === 0) { setMessage("Hãy tìm và thêm ít nhất một vật phẩm vào gói quà."); return false; }
    setBusy(true);
    try {
      const payload = await readJson(await fetch("/api/gm/vouchers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "reward", type: rewardForm.type, note: rewardForm.note, rewards: encodedRewards() }) }));
      if (showSuccess) setMessage(String(payload.message ?? "Đã lưu nhóm quà."));
      setSelectedType(rewardForm.type); await load(); return true;
    } catch (error) { setMessage(error instanceof Error ? error.message : "Không lưu được nhóm quà."); return false; }
    finally { setBusy(false); }
  }

  async function publishVoucher() {
    if (batchForm.name.trim().length < 2) { setMessage("Hãy nhập tên đợt Voucher."); return; }
    if (batchForm.count < 1 || batchForm.count > 200) { setMessage("Số Voucher phải từ 1 đến 200."); return; }
    if (!await saveReward(false)) return;
    setBusy(true);
    try {
      const payload = await readJson(await fetch("/api/gm/vouchers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "batch", name: batchForm.name, count: batchForm.count, rewardType: rewardForm.type }) }));
      const created = ((payload.codes as string[]) ?? []).map((code) => ({ code, status: "active" }));
      setCodes(created); setSelectedBatch(String((payload.batch as VoucherBatch)?.batchId ?? ""));
      setMessage(`Đã tạo ${created.length} Voucher Type ${rewardForm.type}. Mỗi mã nhận ${draftItems.length} món.`); await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Không tạo được Voucher."); }
    finally { setBusy(false); }
  }

  async function showCodes(batchId: string) {
    setBusy(true);
    try {
      const payload = await readJson(await fetch(`/api/gm/vouchers?batchId=${encodeURIComponent(batchId)}`, { cache: "no-store" }));
      setCodes((payload.codes as VoucherCode[]) ?? []); setSelectedBatch(batchId);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Không tải được danh sách mã."); }
    finally { setBusy(false); }
  }

  async function changeBatch(batch: VoucherBatch) {
    const next = batch.status === "active" ? "suspended" : "active";
    if (!window.confirm(next === "suspended" ? "Tạm dừng toàn bộ mã chưa dùng trong đợt này?" : "Mở lại các mã đã tạm dừng?")) return;
    setBusy(true);
    try {
      const payload = await readJson(await fetch("/api/gm/vouchers", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ batchId: batch.batchId, status: next }) }));
      setMessage(String(payload.message ?? "Đã cập nhật đợt Voucher.")); await load(); if (selectedBatch === batch.batchId) await showCodes(batch.batchId);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Không đổi được trạng thái."); }
    finally { setBusy(false); }
  }

  const copyableCodes = codes.filter((code) => code.status === "active").map((code) => code.code).join("\n");
  const rewardByType = useMemo(() => new Map(rewards.map((reward) => [reward.type, reward])), [rewards]);
  return (
    <div className="operations-body voucher-builder">
      {message ? <div className="operations-message">{message}</div> : null}
      <div className="voucher-steps"><span className="active"><b>1</b>Tìm vật phẩm</span><span className={draftItems.length ? "active" : ""}><b>2</b>Chọn quà và số lượng</span><span><b>3</b>Nhập số Voucher và phát hành</span></div>
      <div className="voucher-workspace">
        <section className="voucher-column voucher-catalog-panel">
          <div className="voucher-column-title"><div><strong>Kho vật phẩm</strong><small>Tìm theo tên tiếng Việt hoặc PID</small></div></div>
          <input className="voucher-item-search" autoComplete="off" placeholder="Ví dụ: Ngũ Sắc Thần Đan hoặc 1008000055" value={catalogQuery} onChange={(event) => setCatalogQuery(event.target.value)} />
          <div className="voucher-catalog-results">{catalogLoading ? <div className="voucher-reward-empty">Đang tìm vật phẩm...</div> : null}{!catalogLoading && catalogQuery && catalogItems.length === 0 ? <div className="voucher-reward-empty">Không tìm thấy vật phẩm.</div> : null}{catalogItems.map((item) => <button key={item.itemId} onClick={() => addCatalogItem(item)}><img src={`/item-icons/${item.itemId}.jpg`} alt="" onError={(event) => { event.currentTarget.src = "/item-icons/0.jpg"; }} /><span><strong>{item.name || `PID ${item.itemId}`}</strong><small>PID {item.itemId} · Cấp {item.level}</small></span><b>+</b></button>)}</div>
        </section>

        <section className="voucher-column voucher-draft-panel">
          <div className="voucher-column-title"><div><strong>Gói quà Voucher</strong><small>{draftItems.length}/20 món đã chọn</small></div><button onClick={newReward}>+ Nhóm mới</button></div>
          <div className="voucher-group-line"><select value={selectedType ?? "new"} onChange={(event) => { const reward = rewards.find((entry) => entry.type === Number(event.target.value)); if (reward) selectReward(reward); else newReward(); }}><option value="new">Tạo nhóm quà mới</option>{rewards.map((reward) => <option key={reward.type} value={reward.type}>Type {reward.type} · {reward.note} · {reward.availableCodes} mã</option>)}</select><input type="number" min={0} max={999999} aria-label="Type Voucher" value={rewardForm.type} onChange={(event) => { setSelectedType("new"); setRewardForm({ ...rewardForm, type: Number(event.target.value) }); }} /></div>
          <input placeholder="Tên/ghi chú nhóm quà" value={rewardForm.note} onChange={(event) => setRewardForm({ ...rewardForm, note: event.target.value })} />
          <div className="voucher-draft-items">{draftItems.map((item, index) => <article className="voucher-draft-item" key={`${item.itemId}-${index}`}><img src={`/item-icons/${item.itemId}.jpg`} alt="" onError={(event) => { event.currentTarget.src = "/item-icons/0.jpg"; }} /><div className="voucher-draft-main"><strong>{item.itemName || `PID ${item.itemId}`}</strong><small>PID {item.itemId}</small><label><span>Số lượng người chơi nhận</span><div><button onClick={() => updateDraft(index, "quantity", item.quantity - 1)}>−</button><input type="number" min={1} max={9999} value={item.quantity} onChange={(event) => updateDraft(index, "quantity", Number(event.target.value))} /><button onClick={() => updateDraft(index, "quantity", item.quantity + 1)}>+</button></div></label><details><summary>Chỉ số nâng cao</summary><div className="voucher-attribute-grid">{(["magic0","magic1","magic2","magic3","magic4"] as const).map((key, magicIndex) => <label key={key}><span>Magic {magicIndex}</span><input type="number" value={item[key]} onChange={(event) => updateDraft(index, key, Number(event.target.value))} /></label>)}<label><span>Phụ hồn sơ cấp</span><input type="number" value={item.basicSoul} onChange={(event) => updateDraft(index, "basicSoul", Number(event.target.value))} /></label><label><span>Phụ hồn trung cấp</span><input type="number" value={item.advancedSoul} onChange={(event) => updateDraft(index, "advancedSoul", Number(event.target.value))} /></label><label><span>Tiến hóa</span><input type="number" value={item.evolution} onChange={(event) => updateDraft(index, "evolution", Number(event.target.value))} /></label><label><span>Khóa</span><select value={item.locked} onChange={(event) => updateDraft(index, "locked", Number(event.target.value))}><option value={0}>Không</option><option value={1}>Có</option></select></label><label><span>Số ngày</span><input type="number" value={item.days} onChange={(event) => updateDraft(index, "days", Number(event.target.value))} /></label></div></details></div><button className="voucher-remove-item" title="Bỏ món khỏi gói quà" onClick={() => setDraftItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}>×</button></article>)}{draftItems.length === 0 ? <div className="voucher-draft-empty"><strong>Chưa có vật phẩm</strong><span>Tìm món ở cột bên trái rồi bấm dấu +.</span></div> : null}</div>
          <div className="voucher-draft-footer"><details><summary>Xem chuỗi kỹ thuật</summary><textarea readOnly rows={3} value={encodedRewards()} /></details><button disabled={busy || draftItems.length === 0} onClick={() => void saveReward()}>Lưu riêng nhóm quà</button></div>
        </section>

        <section className="voucher-column voucher-publish-panel">
          <div className="voucher-column-title"><div><strong>Phát hành Voucher</strong><small>Tạo mã dùng một lần cho gói quà bên trái</small></div></div>
          <div className="voucher-publish-form"><label><span>Tên đợt phát hành</span><input placeholder="Ví dụ: Quà khai mở tháng 8" value={batchForm.name} onChange={(event) => setBatchForm({ ...batchForm, name: event.target.value })} /></label><label><span>Số lượng mã Voucher muốn tạo</span><input className="voucher-count-input" type="number" min={1} max={200} value={batchForm.count} onChange={(event) => setBatchForm({ ...batchForm, count: Number(event.target.value) })} /></label><div className="voucher-publish-summary"><span>TYPE {rewardForm.type}</span><strong>{draftItems.length} món / mỗi mã</strong><small>Tạo {batchForm.count || 0} mã · mỗi mã chỉ dùng 1 lần</small></div><button className="voucher-publish-button" disabled={busy || draftItems.length === 0 || batchForm.count < 1} onClick={() => void publishVoucher()}>{busy ? "Đang xử lý..." : `Tạo ${batchForm.count || 0} Voucher`}</button></div>
          {selectedBatch ? <div className="voucher-codes compact"><div className="subsection-title"><h3>Mã vừa chọn</h3><button disabled={!copyableCodes} onClick={() => void navigator.clipboard.writeText(copyableCodes)}>Sao chép</button></div><textarea readOnly rows={5} value={codes.map((code) => `${code.code} · ${code.status === "active" ? "còn dùng" : code.status === "redeemed" ? "đã nhận" : "thu hồi"}`).join("\n")} /></div> : null}
          <div className="voucher-history-title"><strong>Đợt đã tạo</strong><button onClick={() => void load()} disabled={busy}>Làm mới</button></div>
          <div className="voucher-batch-list">{batches.map((batch) => { const reward = rewardByType.get(batch.rewardType); return <article className="voucher-batch-compact" key={batch.batchId}><div><span className={`status-pill ${batch.status}`}>{batch.status === "active" ? "Đang mở" : "Tạm dừng"}</span><strong>{batch.name}</strong></div><p>Type {batch.rewardType} · Còn {batch.remaining}/{batch.total} · Đã nhận {batch.redeemed}</p><VoucherRewardItems items={reward?.items ?? []} compact /><div className="row-actions"><button onClick={() => void showCodes(batch.batchId)}>Xem mã</button><button className={batch.status === "active" ? "danger" : ""} onClick={() => void changeBatch(batch)}>{batch.status === "active" ? "Dừng" : "Mở"}</button></div></article>; })}{!batches.length ? <div className="voucher-reward-empty">Chưa có đợt Voucher được tạo từ web.</div> : null}</div>
        </section>
      </div>
    </div>
  );
}

function VoucherRewardItems({ items, compact = false }: { items: VoucherRewardItem[]; compact?: boolean }) {
  if (!items.length) return <div className="voucher-reward-empty">Chưa đọc được vật phẩm từ chuỗi phần thưởng.</div>;
  return <div className={`voucher-reward-items ${compact ? "compact" : ""}`}>
    {items.map((item, index) => {
      const magic = [item.magic0, item.magic1, item.magic2, item.magic3, item.magic4];
      const extras = [
        magic.some(Boolean) ? `Magic ${magic.join(" · ")}` : "",
        item.basicSoul ? `Sơ cấp ${item.basicSoul}` : "",
        item.advancedSoul ? `Trung cấp ${item.advancedSoul}` : "",
        item.evolution ? `Tiến hóa ${item.evolution}` : "",
        item.locked ? "Khóa vật phẩm" : "",
        item.days ? `${item.days} ngày` : "",
      ].filter(Boolean);
      return <div className="voucher-reward-item" key={`${item.itemId}-${index}`}>
        <img src={`/item-icons/${item.itemId}.jpg`} alt={item.itemName || `Vật phẩm ${item.itemId}`} onError={(event) => { event.currentTarget.src = "/item-icons/0.jpg"; }} />
        <div><strong>{item.itemName || `Vật phẩm PID ${item.itemId}`}</strong><span>PID {item.itemId} · Số lượng <b>×{item.quantity}</b></span>{!compact ? <small>{extras.join(" · ") || "Không có thuộc tính cộng thêm"}</small> : null}</div>
      </div>;
    })}
  </div>;
}

function NpcShopTool() {
  const [items, setItems] = useState<NpcShopItem[]>([]);
  const [maps, setMaps] = useState<NpcShopMap[]>([]);
  const [npcs, setNpcs] = useState<NpcShopNpc[]>([]);
  const [filters, setFilters] = useState({ query: "", mapId: "", nid: "" });
  const [form, setForm] = useState(emptyNpcItem);
  const [selected, setSelected] = useState<NpcShopItem | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  // Gỡ hàng loạt: NPC võ huân có 156 dòng, gỡ lẻ thì phải gõ xác nhận 156 lần.
  const [chon, setChon] = useState<Set<number>>(new Set());
  const [xacNhanNhieu, setXacNhanNhieu] = useState("");
function boDau(str: string) {
  return (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

  // Bên "đã gỡ": đọc từ bảng lưu trữ, chọn để trả về NPC.
  const [daGo, setDaGo] = useState<NpcShopArchiveItem[]>([]);
  const [chonTra, setChonTra] = useState<Set<number>>(new Set());
  const [xacNhanTra, setXacNhanTra] = useState("");
  // Tìm kiếm NPC nhanh
  const [locNpc, setLocNpc] = useState("");
  // Bật/tắt NPC theo map: chọn nhiều NPC trong map đang mở, và chọn map muốn GIỮ MỞ khi tắt hết.
  const [chonNpcBatTat, setChonNpcBatTat] = useState<Set<number>>(new Set());
  const [chonMapGiuMo, setChonMapGiuMo] = useState<Set<number>>(new Set());
  const [locMapGiuMo, setLocMapGiuMo] = useState("");
  const [xacNhanTatCa, setXacNhanTatCa] = useState("");
  // Trạng thái thu gọn/mở rộng giao diện để bảng không chiếm diện tích màn hình
  const [hienBatTatMap, setHienBatTatMap] = useState(false);
  const [hienTatAll, setHienTatAll] = useState(false);

  const queryString = useMemo(() => {
    const values = new URLSearchParams(); if (filters.query) values.set("query", filters.query); if (filters.nid) values.set("nid", filters.nid); if (filters.mapId) values.set("mapId", filters.mapId); return values.toString();
  }, [filters]);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const payload = await readJson(await fetch(`/api/gm/npc-shop?${queryString}`, { cache: "no-store" }));
      const nextMaps = (payload.maps as NpcShopMap[]) ?? [];
      const nextNpcs = (payload.npcs as NpcShopNpc[]) ?? [];
      setMaps(nextMaps); setNpcs(nextNpcs); setItems((payload.items as NpcShopItem[]) ?? []);
      setDaGo((payload.daGo as NpcShopArchiveItem[]) ?? []);
      if (!filters.mapId && nextMaps.length) {
        setFilters((current) => ({ ...current, mapId: String(nextMaps[0].mapId), nid: "" }));
      } else if (filters.mapId && !filters.nid && nextNpcs.length) {
        const firstShop = nextNpcs.find((npc) => npc.itemCount > 0) ?? nextNpcs[0];
        setFilters((current) => ({ ...current, nid: String(firstShop.nid) }));
      }
    }
    catch (error) { setMessage(error instanceof Error ? error.message : "Không tải được shop NPC."); }
    finally { setBusy(false); }
  }, [filters.mapId, filters.nid, queryString]);
  useEffect(() => { void load(); }, [load]);

  const selectedMap = maps.find((map) => String(map.mapId) === filters.mapId);
  const selectedNpc = npcs.find((npc) => String(npc.nid) === filters.nid);

  const dedupNpcs = useMemo(() => {
    const map = new Map<number, { npc: NpcShopNpc; count: number; coords: string[] }>();
    for (const npc of npcs) {
      const existing = map.get(npc.nid);
      if (existing) {
        existing.count++;
        existing.coords.push(`(${Math.round(npc.x)}, ${Math.round(npc.y)})`);
        if (npc.itemCount > existing.npc.itemCount) existing.npc = npc;
      } else {
        map.set(npc.nid, { npc, count: 1, coords: [`(${Math.round(npc.x)}, ${Math.round(npc.y)})`] });
      }
    }
    return Array.from(map.values()).map(({ npc, count, coords }) => ({
      ...npc,
      spawnCount: count,
      coordsText: coords.join(", "),
    }));
  }, [npcs]);

  const NPC_ALIASES: Record<number, string[]> = {
    302: ["son bich", "ton bich", "cong ton bich"],
  };

  const dsNpcLoc = useMemo(() => {
    if (!locNpc.trim()) return dedupNpcs;
    const keyword = boDau(locNpc);
    return dedupNpcs.filter((npc) => {
      const aliasMatch = NPC_ALIASES[npc.nid]?.some((alias) => alias.includes(keyword) || keyword.includes(alias));
      return aliasMatch || boDau(npc.npcName).includes(keyword) || String(npc.nid).includes(keyword);
    });
  }, [dedupNpcs, locNpc]);

  function choose(item: NpcShopItem) {
    setSelected(item);
    setForm({ npcName: item.npcName, nid: item.nid, slot: item.slot, itemId: item.itemId, money: item.money, magic0: item.magic0, magic1: item.magic1, magic2: item.magic2, magic3: item.magic3, magic4: item.magic4, honor: item.honor, coin: item.coin });
    setConfirmation("");
  }

  function newItem() {
    if (!selectedNpc) return;
    const nextSlot = items.length ? Math.max(...items.map((item) => item.slot)) + 1 : 0;
    setSelected(null); setConfirmation("");
    setForm({ ...emptyNpcItem, npcName: selectedNpc.npcName, nid: selectedNpc.nid, slot: nextSlot });
  }

  async function saveItem() {
    setBusy(true);
    try {
      const response = await fetch("/api/gm/npc-shop", { method: selected ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(selected ? { id: selected.id, expectedItemId: selected.itemId, item: form } : { item: form }) });
      const payload = await readJson(response); setMessage(String(payload.message ?? "Đã lưu món shop NPC.")); setSelected(null); setForm({ ...emptyNpcItem, npcName: form.npcName, nid: form.nid, slot: form.slot + 1 }); await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Không lưu được món."); }
    finally { setBusy(false); }
  }

  function doiChon(id: number) {
    setChon((truoc) => {
      const sau = new Set(truoc);
      if (sau.has(id)) sau.delete(id); else sau.add(id);
      return sau;
    });
  }

  const chuoiXacNhanNhieu = `XOA ${chon.size} MON NID ${filters.nid || 0}`;
  const chuoiXacNhanTra = `KHOI PHUC ${chonTra.size} MON NID ${filters.nid || 0}`;

  function doiChonTra(archiveId: number) {
    setChonTra((truoc) => {
      const sau = new Set(truoc);
      if (sau.has(archiveId)) sau.delete(archiveId); else sau.add(archiveId);
      return sau;
    });
  }

  async function restoreSelected() {
    if (chonTra.size === 0 || !selectedNpc) return;
    setBusy(true);
    try {
      const payload = await readJson(await fetch("/api/gm/npc-shop/khoi-phuc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nid: selectedNpc.nid, archiveIds: Array.from(chonTra), xacNhan: xacNhanTra }),
      }));
      setMessage(String(payload.message ?? "Đã trả món về NPC."));
      setChonTra(new Set()); setXacNhanTra("");
      await load();
    }
    catch (error) { setMessage(error instanceof Error ? error.message : "Không khôi phục được."); }
    finally { setBusy(false); }
  }

  async function removeSelected() {
    if (chon.size === 0 || !selectedNpc) return;
    setBusy(true);
    try {
      const payload = await readJson(await fetch("/api/gm/npc-shop", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nid: selectedNpc.nid, ids: Array.from(chon), xacNhan: xacNhanNhieu }),
      }));
      setMessage(String(payload.message ?? "Đã gỡ các món đã chọn."));
      setChon(new Set()); setXacNhanNhieu(""); setSelected(null);
      await load();
    }
    catch (error) { setMessage(error instanceof Error ? error.message : "Không gỡ được các món đã chọn."); }
    finally { setBusy(false); }
  }

  async function removeItem() {
    if (!selected) return;
    setBusy(true);
    try { const payload = await readJson(await fetch("/api/gm/npc-shop", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: selected.id, itemId: selected.itemId, confirmation }) })); setMessage(String(payload.message ?? "Đã gỡ món.")); setSelected(null); setForm({ ...emptyNpcItem, npcName: selected.npcName, nid: selected.nid, slot: selected.slot }); setConfirmation(""); await load(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Không gỡ được món."); }
    finally { setBusy(false); }
  }

  // Bat/tat MOT NPC cu the khoi map dang chay (theo FLD_INDEX cua dong dang chon, khong theo PID).
  async function toggleNpc() {
    if (!selectedNpc) return;
    setBusy(true);
    try {
      const nextOn = !selectedNpc.batTat;
      const payload = await readJson(await fetch(`/api/gm/npc-shop/npc/${selectedNpc.id}/bat-tat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ on: nextOn }),
      }));
      setMessage(String(payload.message ?? (nextOn ? "Đã bật NPC." : "Đã tắt NPC.")));
      await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Không đổi được trạng thái NPC."); }
    finally { setBusy(false); }
  }

  function doiChonNpcBatTat(id: number) {
    setChonNpcBatTat((truoc) => { const sau = new Set(truoc); if (sau.has(id)) sau.delete(id); else sau.add(id); return sau; });
  }

  // Bat/tat NHIEU NPC da chon trong map dang mo cung luc.
  async function apDungBatTatNhieu(on: boolean) {
    if (chonNpcBatTat.size === 0) return;
    setBusy(true);
    try {
      const payload = await readJson(await fetch("/api/gm/npc-shop/npc/bat-tat-nhieu", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rowIndexes: Array.from(chonNpcBatTat), on }),
      }));
      setMessage(String(payload.message ?? "Đã đổi trạng thái các NPC đã chọn."));
      setChonNpcBatTat(new Set());
      await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Không đổi được trạng thái các NPC đã chọn."); }
    finally { setBusy(false); }
  }

  function doiChonMapGiuMo(mapId: number) {
    setChonMapGiuMo((truoc) => { const sau = new Set(truoc); if (sau.has(mapId)) sau.delete(mapId); else sau.add(mapId); return sau; });
  }

  const chuoiXacNhanTatCa = chonMapGiuMo.size === 0 ? "TAT TAT CA NPC MOI MAP" : `TAT TAT CA TRU ${chonMapGiuMo.size} MAP`;

  // Tat TOAN BO NPC moi map, tru cac map duoc chon giu mo. Rui ro cao (~50.000 dong) - can xac
  // nhan go dung chuoi truoc khi gui, khop dung chuoi backend yeu cau.
  async function apDungTatTatCa() {
    if (xacNhanTatCa !== chuoiXacNhanTatCa) return;
    setBusy(true);
    try {
      const payload = await readJson(await fetch("/api/gm/npc-shop/npc/tat-tat-ca-tru-map", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keepOnMapIds: Array.from(chonMapGiuMo), xacNhan: xacNhanTatCa }),
      }));
      setMessage(String(payload.message ?? "Đã tắt toàn bộ NPC theo lựa chọn."));
      setXacNhanTatCa("");
      await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Không thực hiện được thao tác tắt toàn bộ NPC."); }
    finally { setBusy(false); }
  }

  const dsMapLoc = locMapGiuMo
    ? maps.filter((map) => boDau(map.mapName).includes(boDau(locMapGiuMo)) || String(map.mapId).includes(locMapGiuMo.trim()))
    : maps;

  return <div className="operations-body">
    {message ? <div className="operations-message">{message}</div> : null}
    <div className="npc-shop-filters npc-shop-selector">
      <label><span>1. Chọn bản đồ</span><select value={filters.mapId} onChange={(e) => { setSelected(null); setItems([]); setNpcs([]); setChon(new Set()); setXacNhanNhieu(""); setDaGo([]); setChonTra(new Set()); setXacNhanTra(""); setLocNpc(""); setFilters({ query: "", mapId: e.target.value, nid: "" }); }}><option value="">Chọn map</option>{maps.map((map) => <option key={map.mapId} value={map.mapId}>Map {map.mapId} · {map.mapName} ({map.npcCount} NPC)</option>)}</select></label>
      <label>
        <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>2. Chọn NPC trong map</span>
          {locNpc.trim() ? <small style={{ color: "#38bdf8", fontWeight: "normal" }}>Khớp {dsNpcLoc.length}/{dedupNpcs.length}</small> : null}
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          <input
            type="text"
            placeholder="🔍 Tìm tên/NID..."
            value={locNpc}
            disabled={!filters.mapId}
            onChange={(e) => setLocNpc(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && dsNpcLoc.length > 0) {
                const firstNpc = dsNpcLoc[0];
                setSelected(null); setItems([]); setChon(new Set()); setXacNhanNhieu(""); setDaGo([]); setChonTra(new Set()); setXacNhanTra("");
                setFilters((f) => ({ ...f, query: "", nid: String(firstNpc.nid) }));
                setForm({ ...emptyNpcItem, npcName: firstNpc.npcName, nid: firstNpc.nid });
              }
            }}
            style={{ width: "135px", flexShrink: 0 }}
            title="Gõ tên NPC hoặc NID để lọc. Nhấn Enter để chọn NPC đầu tiên."
          />
          <select
            value={filters.nid}
            disabled={!filters.mapId}
            onChange={(e) => {
              const npc = npcs.find((entry) => String(entry.nid) === e.target.value);
              setSelected(null); setItems([]); setChon(new Set()); setXacNhanNhieu(""); setDaGo([]); setChonTra(new Set()); setXacNhanTra("");
              setFilters({ ...filters, query: "", nid: e.target.value });
              if (npc) setForm({ ...emptyNpcItem, npcName: npc.npcName, nid: npc.nid });
            }}
            style={{ flex: 1, minWidth: 0 }}
          >
            <option value="">Chọn NPC ({dsNpcLoc.length}/{dedupNpcs.length} NPC)</option>
            {dsNpcLoc.map((npc) => (
              <option key={npc.nid} value={npc.nid}>
                {npc.batTat ? "" : "[TẮT] "}NID {npc.nid} · {npc.npcName} ({npc.itemCount} món bán){npc.spawnCount > 1 ? ` [Có ${npc.spawnCount} vị trí spawn]` : ""}
              </option>
            ))}
          </select>
        </div>
      </label>
      <label><span>3. Tìm trong NPC đã chọn</span><input placeholder="Tên món hoặc PID" value={filters.query} onChange={(e) => setFilters({ ...filters, query: e.target.value })} /></label>
      <button onClick={() => void load()} disabled={busy}>Làm mới dữ liệu</button>
    </div>
    <div className="npc-shop-context"><div><strong>{selectedMap ? `${selectedMap.mapName} · Map ${selectedMap.mapId}` : "Chưa chọn map"}</strong><span>{selectedNpc ? `${selectedNpc.npcName} · NID ${selectedNpc.nid} · ${npcs.filter((n) => n.nid === selectedNpc.nid).length > 1 ? `Có ${npcs.filter((n) => n.nid === selectedNpc.nid).length} vị trí trên map: ${npcs.filter((n) => n.nid === selectedNpc.nid).map((n) => `(${Math.round(n.x)}, ${Math.round(n.y)})`).join(", ")}` : `Tọa độ (${Math.round(selectedNpc.x)}, ${Math.round(selectedNpc.y)})`}${selectedNpc.batTat ? "" : " · ĐANG TẮT"}` : "Hãy chọn NPC để xem đồ đang bán"}</span></div><div className="npc-shop-context-actions"><button disabled={!selectedNpc || busy} className={selectedNpc && selectedNpc.batTat ? "danger" : undefined} onClick={() => void toggleNpc()}>{selectedNpc && !selectedNpc.batTat ? "Bật lại NPC này" : "Tắt NPC này khỏi map"}</button><button disabled={!selectedNpc} onClick={newItem}>+ Thêm món vào NPC này</button></div></div>

    {/* Bat/tat NPC theo map: an/hien danh sach bat tat */}
    <div className="npc-batTat-panel">
      <div className="subsection-title" style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }} onClick={() => setHienBatTatMap(!hienBatTatMap)}>
        <div>
          <h3>
            Bật/tắt NPC trong map {selectedMap ? `"${selectedMap.mapName}"` : "đang chọn"}
            <span className={`status-pill ${hienBatTatMap ? "active" : ""}`} style={{ marginLeft: 8, fontSize: 12 }}>
              {hienBatTatMap ? "▲ Đang mở" : "▼ Đang thu gọn"}
            </span>
          </h3>
          <small>{npcs.length} điểm spawn NPC trong map này · {hienBatTatMap ? "Bấm để thu gọn danh sách" : "Bấm nút bên phải hoặc bấm vào đây để mở rộng danh sách bật/tắt"}</small>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button type="button" className={hienBatTatMap ? "secondary" : "primary"} onClick={(e) => { e.stopPropagation(); setHienBatTatMap(!hienBatTatMap); }}>
            {hienBatTatMap ? "Thu gọn ▲" : `Mở danh sách (${npcs.length} NPC) ▼`}
          </button>
        </div>
      </div>

      {hienBatTatMap ? (
        <>
          {npcs.length > 0 ? (
            <div className="npc-bulk-tools" style={{ marginTop: 8 }}>
              <button type="button" onClick={() => setChonNpcBatTat(new Set(npcs.map((npc) => npc.id)))} disabled={busy}>Chọn tất cả ({npcs.length})</button>
              <button type="button" onClick={() => setChonNpcBatTat(new Set())} disabled={busy || chonNpcBatTat.size === 0}>Bỏ chọn</button>
              <span className="npc-bulk-count">{chonNpcBatTat.size > 0 ? `Đã chọn ${chonNpcBatTat.size}` : "Chưa chọn NPC nào"}</span>
            </div>
          ) : null}

          {npcs.length === 0 ? <p className="muted">Chưa có map nào được chọn, hoặc map này không có NPC.</p> : <div className="npc-archive-list">
            {npcs.map((npc) => {
              const sameNid = npcs.filter((n) => n.nid === npc.nid);
              const spawnIndex = sameNid.length > 1 ? sameNid.findIndex((n) => n.id === npc.id) + 1 : 0;
              return <label key={npc.id} className={`npc-toggle-row ${chonNpcBatTat.has(npc.id) ? "picked" : ""}`}>
                <input type="checkbox" checked={chonNpcBatTat.has(npc.id)} onChange={() => doiChonNpcBatTat(npc.id)} />
                <span className="npc-archive-name">
                  <strong>{npc.npcName}{spawnIndex > 0 ? ` (Vị trí ${spawnIndex}/${sameNid.length})` : ""}{npc.batTat ? "" : " · ĐANG TẮT"}</strong>
                  <small>NID {npc.nid} · FLD_INDEX {npc.id} · Tọa độ ({Math.round(npc.x)}, {Math.round(npc.y)}) · {npc.itemCount} món bán</small>
                </span>
              </label>;
            })}
          </div>}

          {chonNpcBatTat.size > 0 ? <div className="npc-bulk-tools" style={{ marginTop: 8 }}>
            <button type="button" className="danger" disabled={busy} onClick={() => void apDungBatTatNhieu(false)}>Tắt {chonNpcBatTat.size} NPC đã chọn</button>
            <button type="button" disabled={busy} onClick={() => void apDungBatTatNhieu(true)}>Bật {chonNpcBatTat.size} NPC đã chọn</button>
          </div> : null}
        </>
      ) : null}
    </div>

    {/* Tat toan bo NPC moi map, tru cac map duoc chon giu mo */}
    <div className="npc-batTat-panel delete-zone">
      <div className="subsection-title" style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }} onClick={() => setHienTatAll(!hienTatAll)}>
        <div>
          <h3>
            ⚠️ Tắt tất cả NPC (mọi map)
            <span className={`status-pill ${hienTatAll ? "danger" : ""}`} style={{ marginLeft: 8, fontSize: 12 }}>
              {hienTatAll ? "▲ Đang mở" : "▼ Đang thu gọn"}
            </span>
          </h3>
          <small>Tắt toàn bộ ~{maps.reduce((tong, map) => tong + map.npcCount, 0).toLocaleString("vi-VN")} NPC trên {maps.length} map · Chỉ áp dụng Kênh 2</small>
        </div>
        <button type="button" className={hienTatAll ? "secondary" : "danger"} onClick={(e) => { e.stopPropagation(); setHienTatAll(!hienTatAll); }}>
          {hienTatAll ? "Thu gọn ▲" : "Mở công cụ ▼"}
        </button>
      </div>

      {hienTatAll ? (
        <>
          <input style={{ marginTop: 8 }} placeholder="Lọc tên/mã map muốn giữ mở..." value={locMapGiuMo} onChange={(e) => setLocMapGiuMo(e.target.value)} />
          <div className="npc-map-giumo-list">
            {dsMapLoc.map((map) => <label key={map.mapId} className={`npc-toggle-row ${chonMapGiuMo.has(map.mapId) ? "picked" : ""}`}>
              <input type="checkbox" checked={chonMapGiuMo.has(map.mapId)} onChange={() => doiChonMapGiuMo(map.mapId)} />
              <span className="npc-archive-name"><strong>{map.mapName}</strong><small>Map {map.mapId} · {map.npcCount} NPC</small></span>
            </label>)}
          </div>
          <p>{chonMapGiuMo.size === 0 ? "Chưa chọn map nào giữ mở — sẽ TẮT HẾT toàn bộ NPC mọi map." : `Sẽ giữ mở NPC ở ${chonMapGiuMo.size} map đã chọn, tắt hết NPC ở các map còn lại.`}</p>
          <p>Gõ <code>{chuoiXacNhanTatCa}</code> để xác nhận.</p>
          <input value={xacNhanTatCa} onChange={(e) => setXacNhanTatCa(e.target.value)} placeholder={chuoiXacNhanTatCa} />
          <button className="danger" disabled={busy || xacNhanTatCa !== chuoiXacNhanTatCa} onClick={() => void apDungTatTatCa()}>Thực hiện tắt hàng loạt</button>
        </>
      ) : null}
    </div>

    <div className="operations-split npc-shop-layout">
      <div className="operations-list npc-item-gallery-wrap">
        <div className="subsection-title">
          <div><h3>Đồ đang bán trong NPC</h3><small>{items.length} vật phẩm · bấm vào ảnh để xem và sửa</small></div>
          {items.length > 0 ? <div className="npc-bulk-tools">
            <button type="button" onClick={() => setChon(new Set(items.map((item) => item.id)))} disabled={busy}>Chọn tất cả ({items.length})</button>
            <button type="button" onClick={() => { setChon(new Set()); setXacNhanNhieu(""); }} disabled={busy || chon.size === 0}>Bỏ chọn</button>
            <span className="npc-bulk-count">{chon.size > 0 ? `Đã chọn ${chon.size}` : "Chưa chọn món nào"}</span>
          </div> : null}
        </div>
        <div className="npc-item-card-grid">{items.map((item) => {
          const prices: string[] = [];
          if (item.honor > 0) prices.push(`${item.honor.toLocaleString("vi-VN")} Võ Hoàng Tệ`);
          if (item.money > 0) prices.push(`${item.money.toLocaleString("vi-VN")} Gold`);
          if (item.coin > 0) prices.push(`${item.coin.toLocaleString("vi-VN")} Coin`);
          const priceText = prices.length > 0 ? prices.join(" + ") : "0 Gold (Miễn phí)";
          return <div className="npc-item-card-wrap" key={item.id}>
            <label className="npc-item-pick" title="Chọn để gỡ hàng loạt"><input type="checkbox" checked={chon.has(item.id)} onChange={() => doiChon(item.id)} /></label>
            <button type="button" className={`npc-item-card ${selected?.id === item.id ? "selected" : ""} ${chon.has(item.id) ? "picked" : ""}`} onClick={() => choose(item)} onDoubleClick={() => { choose(item); document.getElementById("npc-item-editor")?.scrollIntoView({ behavior: "smooth", block: "center" }); }}><span className="npc-item-slot">Ô {item.slot}</span><span className="npc-item-thumb"><img src={`/item-icons/${item.itemId}.jpg`} alt={item.itemName || `Vật phẩm ${item.itemId}`} loading="lazy" onError={(event) => { event.currentTarget.src = "/item-icons/0.jpg"; }} /></span><strong>{item.itemName || "Chưa có tên vật phẩm"}</strong><code>PID {item.itemId}</code><span className="npc-item-price">{priceText}</span>{[item.magic0,item.magic1,item.magic2,item.magic3,item.magic4].some(Boolean) ? <small>M: {[item.magic0,item.magic1,item.magic2,item.magic3,item.magic4].join(" · ")}</small> : <small>Không có Magic</small>}</button>
          </div>;
        })}</div>
        {chon.size > 0 ? <div className="delete-zone npc-bulk-delete">
          <strong>Gỡ {chon.size} món đã chọn khỏi {selectedNpc?.npcName ?? "NPC"}</strong>
          <p>Gõ <code>{chuoiXacNhanNhieu}</code> để xác nhận. Mọi dòng gỡ đi đều được chép sang bảng lưu trữ nên khôi phục lại được.</p>
          <input value={xacNhanNhieu} onChange={(e) => setXacNhanNhieu(e.target.value)} placeholder={chuoiXacNhanNhieu} />
          <button className="danger" disabled={busy || xacNhanNhieu !== chuoiXacNhanNhieu} onClick={() => void removeSelected()}>Gỡ {chon.size} món</button>
        </div> : null}

        {/* Ben "da go": doc tu HK_NPC_SHOP_ARCHIVE cua dung NPC dang mo. Khong co cho xem thi go
            xong la mat dau, phai mo SQL moi biet da go nhung gi. */}
        {selectedNpc ? <div className="npc-archive-pane">
          <div className="subsection-title">
            <div><h3>Đồ đã gỡ khỏi NPC này</h3><small>{daGo.length} dòng trong bảng lưu trữ · chọn để trả về NPC</small></div>
            {daGo.length > 0 ? <div className="npc-bulk-tools">
              <button type="button" onClick={() => setChonTra(new Set(daGo.map((row) => row.archiveId)))} disabled={busy}>Chọn tất cả ({daGo.length})</button>
              <button type="button" onClick={() => { setChonTra(new Set()); setXacNhanTra(""); }} disabled={busy || chonTra.size === 0}>Bỏ chọn</button>
              <span className="npc-bulk-count">{chonTra.size > 0 ? `Đã chọn ${chonTra.size}` : "Chưa chọn món nào"}</span>
            </div> : null}
          </div>
          {daGo.length === 0 ? <p className="muted">Chưa gỡ món nào khỏi NPC này.</p> : <div className="npc-archive-list">
            {daGo.map((row) => <label key={row.archiveId} className={`npc-archive-row ${chonTra.has(row.archiveId) ? "picked" : ""}`}>
              <input type="checkbox" checked={chonTra.has(row.archiveId)} onChange={() => doiChonTra(row.archiveId)} />
              <img src={`/item-icons/${row.itemId}.jpg`} alt="" loading="lazy" onError={(event) => { event.currentTarget.src = "/item-icons/0.jpg"; }} />
              <span className="npc-archive-name">
                <strong>{row.itemName || `PID ${row.itemId}`}</strong>
                <small>Ô {row.slot} · PID {row.itemId} · {row.honor > 0 ? `${row.honor.toLocaleString("vi-VN")} Võ Hoàng Tệ` : row.coin > 0 ? `${row.coin.toLocaleString("vi-VN")} Coin` : `${row.money.toLocaleString("vi-VN")} Gold`}</small>
              </span>
              <span className="npc-archive-meta">
                <small>{new Date(row.removedAt).toLocaleString("vi-VN")}</small>
                <small>bởi {row.removedBy || "—"}</small>
                {row.dangBanLai ? <small className="npc-archive-warn">NPC đang có món này</small> : null}
              </span>
            </label>)}
          </div>}
          {chonTra.size > 0 ? <div className="delete-zone npc-restore-zone">
            <strong>Trả {chonTra.size} món về {selectedNpc.npcName}</strong>
            <p>Gõ <code>{chuoiXacNhanTra}</code> để xác nhận. Món về đúng ô cũ; ô đã bị chiếm thì xuống ô trống tiếp theo.</p>
            <input value={xacNhanTra} onChange={(e) => setXacNhanTra(e.target.value)} placeholder={chuoiXacNhanTra} />
            <button className="primary" disabled={busy || xacNhanTra !== chuoiXacNhanTra} onClick={() => void restoreSelected()}>Khôi phục {chonTra.size} món</button>
          </div> : null}
        </div> : null}
        {!busy && selectedNpc && items.length === 0 ? <div className="empty-state"><strong>NPC này chưa có vật phẩm</strong><p>Bấm “Thêm món vào NPC này” để tạo dòng shop đầu tiên.</p></div> : null}
        {!selectedNpc ? <div className="empty-state"><strong>Chưa chọn NPC</strong><p>Chọn map rồi chọn NPC ở phía trên.</p></div> : null}
      </div>
      <div className="operations-form npc-item-editor" id="npc-item-editor"><h3>{selected ? `Sửa món · ${selected.itemName}` : selectedNpc ? `Thêm món vào ${selectedNpc.npcName}` : "Chọn NPC và vật phẩm"}</h3>{form.itemId > 0 ? <div className="selected-item-preview"><img src={`/item-icons/${form.itemId}.jpg`} alt="" onError={(event) => { event.currentTarget.src = "/item-icons/0.jpg"; }} /><div><strong>{selected?.itemName || `PID ${form.itemId}`}</strong><span>Ô {form.slot} · NID {form.nid}</span></div></div> : null}<div className="form-grid compact-form-grid"><label><span>NID shop</span><input type="number" readOnly value={form.nid} /></label><label><span>Tên NPC</span><input readOnly value={form.npcName} /></label><label><span>Vị trí ô</span><input type="number" value={form.slot} onChange={(e) => setForm({ ...form, slot: Number(e.target.value) })} /></label><label><span>PID vật phẩm</span><input type="number" value={form.itemId} onChange={(e) => setForm({ ...form, itemId: Number(e.target.value) })} /></label><label><span>Giá Võ Hoàng Tệ (WHTB)</span><input type="number" value={form.honor} onChange={(e) => setForm({ ...form, honor: Number(e.target.value) })} placeholder="0" /></label><label><span>Giá Gold (Lượng)</span><input type="number" value={form.money} onChange={(e) => setForm({ ...form, money: Number(e.target.value) })} placeholder="0" /></label><label><span>Giá Coin (Băng Phách)</span><input type="number" value={form.coin} onChange={(e) => setForm({ ...form, coin: Number(e.target.value) })} placeholder="0" /></label>{([0,1,2,3,4] as const).map((index) => <label key={index}><span>Magic {index}</span><input type="number" value={form[`magic${index}`]} onChange={(e) => setForm({ ...form, [`magic${index}`]: Number(e.target.value) })} /></label>)}</div><div className="operations-actions"><button className="primary" disabled={busy || !selectedNpc || form.itemId <= 0} onClick={() => void saveItem()}>{selected ? "Cập nhật món" : "Thêm món"}</button><button disabled={!selectedNpc} onClick={newItem}>Tạo món mới</button></div>
        {selected ? <div className="delete-zone"><strong>Gỡ món khỏi shop</strong><p>Nhập <code>XOA {selected.itemId}</code> để xác nhận.</p><input value={confirmation} onChange={(e) => setConfirmation(e.target.value)} /><button className="danger" disabled={busy || confirmation !== `XOA ${selected.itemId}`} onClick={() => void removeItem()}>Gỡ vật phẩm</button></div> : null}
      </div>
    </div>
  </div>;
}
