"use client";

import { KeyRound, LoaderCircle, Save, ShieldCheck, UserPlus } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";

type GmAccount = {
  accountId: string;
  displayName: string;
  role: number;
  enabled: boolean;
};

type Payload = {
  success?: boolean;
  administratorName?: string;
  accounts?: GmAccount[];
  message?: string;
};

export default function GmAccountManager({
  administratorName,
  onAdministratorNameChange,
}: {
  administratorName: string;
  onAdministratorNameChange: (name: string) => void;
}) {
  const [accounts, setAccounts] = useState<GmAccount[]>([]);
  const [profileName, setProfileName] = useState(administratorName);
  const [draftNames, setDraftNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/gm-accounts", { cache: "no-store" });
      const payload = (await response.json()) as Payload;
      if (!response.ok) throw new Error(payload.message ?? "Không thể đọc danh sách GM.");
      const values = payload.accounts ?? [];
      setAccounts(values);
      setDraftNames(Object.fromEntries(values.map((account) => [account.accountId, account.displayName])));
      if (payload.administratorName) {
        setProfileName(payload.administratorName);
        onAdministratorNameChange(payload.administratorName);
      }
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "Không thể đọc danh sách GM." });
    } finally {
      setLoading(false);
    }
  }, [onAdministratorNameChange]);

  useEffect(() => void load(), [load]);

  async function saveAdministratorName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving("administrator");
    setNotice(null);
    try {
      const response = await fetch("/api/admin/gm-accounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "administrator", displayName: profileName }),
      });
      const payload = (await response.json()) as Payload;
      if (!response.ok) throw new Error(payload.message ?? "Không thể đổi tên quản trị viên.");
      onAdministratorNameChange(profileName.trim());
      setNotice({ tone: "success", text: "Đã đổi tên quản trị viên trên toàn trang." });
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "Không thể đổi tên quản trị viên." });
    } finally {
      setSaving("");
    }
  }

  async function createAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setSaving("create");
    setNotice(null);
    try {
      const response = await fetch("/api/admin/gm-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: values.get("accountId"),
          displayName: values.get("displayName"),
          password: values.get("password"),
        }),
      });
      const payload = (await response.json()) as Payload;
      if (!response.ok) throw new Error(payload.message ?? "Không thể tạo tài khoản GM.");
      form.reset();
      setNotice({ tone: "success", text: "Đã tạo tài khoản GM full quyền. Có thể đăng nhập ngay." });
      await load();
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "Không thể tạo tài khoản GM." });
    } finally {
      setSaving("");
    }
  }

  async function saveGmName(accountId: string) {
    setSaving(accountId);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/gm-accounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "gm", accountId, displayName: draftNames[accountId] }),
      });
      const payload = (await response.json()) as Payload;
      if (!response.ok) throw new Error(payload.message ?? "Không thể đổi tên GM.");
      setAccounts((current) => current.map((account) =>
        account.accountId === accountId
          ? { ...account, displayName: draftNames[accountId].trim() }
          : account,
      ));
      setNotice({ tone: "success", text: `Đã cập nhật tên cho ${accountId}.` });
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "Không thể đổi tên GM." });
    } finally {
      setSaving("");
    }
  }

  return (
    <div className="gm-account-manager">
      <section className="glass-panel gm-account-profile">
        <div className="gm-account-heading">
          <span><ShieldCheck size={24} /></span>
          <div>
            <small>HỒ SƠ QUẢN TRỊ NỘI BỘ</small>
            <h2>Tên quản trị viên</h2>
            <p>Tên này hiển thị ở thanh bên và lời chào của trang quản trị.</p>
          </div>
        </div>
        <form onSubmit={saveAdministratorName}>
          <input
            value={profileName}
            onChange={(event) => setProfileName(event.target.value)}
            minLength={2}
            maxLength={50}
            required
          />
          <button className="gold-button" disabled={saving === "administrator"}>
            {saving === "administrator" ? <LoaderCircle className="spinning" size={17} /> : <Save size={17} />}
            Lưu tên
          </button>
        </form>
      </section>

      <section className="glass-panel gm-account-create">
        <div className="gm-account-heading">
          <span><UserPlus size={24} /></span>
          <div>
            <small>TẠO TÀI KHOẢN GM MỚI</small>
            <h2>GM full quyền</h2>
            <p>Mỗi người dùng một tài khoản riêng và có đầy đủ quyền như GM TH.</p>
          </div>
        </div>
        <form onSubmit={createAccount} className="gm-account-create-grid">
          <label>
            <span>ID đăng nhập</span>
            <input name="accountId" pattern="[A-Za-z0-9_.-]{3,32}" placeholder="Ví dụ: gmmode" required />
          </label>
          <label>
            <span>Tên hiển thị</span>
            <input name="displayName" minLength={2} maxLength={50} placeholder="Ví dụ: GM mode" required />
          </label>
          <label>
            <span>Mật khẩu riêng</span>
            <input name="password" type="password" minLength={8} maxLength={50} autoComplete="new-password" required />
          </label>
          <button className="gold-button" disabled={saving === "create"}>
            {saving === "create" ? <LoaderCircle className="spinning" size={17} /> : <KeyRound size={17} />}
            Tạo GM full quyền
          </button>
        </form>
      </section>

      {notice ? <div className={`gm-notice ${notice.tone}`} role="status">{notice.text}</div> : null}

      <section className="glass-panel gm-account-list">
        <div className="gm-account-list-title">
          <div>
            <small>DANH SÁCH TÀI KHOẢN GM</small>
            <h2>Quyền truy cập hiện tại</h2>
          </div>
          <strong>{accounts.length} tài khoản</strong>
        </div>
        {loading ? (
          <div className="gm-account-loading"><LoaderCircle className="spinning" size={22} /> Đang tải…</div>
        ) : (
          <div className="gm-account-rows">
            {accounts.map((account) => (
              <article key={account.accountId}>
                <div className="gm-account-badge"><ShieldCheck size={20} /></div>
                <div className="gm-account-id">
                  <strong>{account.accountId}</strong>
                  <small>Full quyền · Mode {account.role}</small>
                </div>
                <input
                  value={draftNames[account.accountId] ?? account.displayName}
                  onChange={(event) => setDraftNames((current) => ({
                    ...current,
                    [account.accountId]: event.target.value,
                  }))}
                  minLength={2}
                  maxLength={50}
                />
                <button
                  type="button"
                  onClick={() => void saveGmName(account.accountId)}
                  disabled={saving === account.accountId}
                >
                  {saving === account.accountId ? <LoaderCircle className="spinning" size={16} /> : <Save size={16} />}
                  Lưu tên
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
