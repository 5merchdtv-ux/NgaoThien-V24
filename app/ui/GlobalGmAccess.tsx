"use client";

import {
  KeyRound,
  LoaderCircle,
  LogOut,
  ShieldCheck,
  X,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import type { GmSessionStatus } from "@/lib/types";
import Portal from "./Portal";

type SessionPayload = GmSessionStatus & {
  expired?: boolean;
  message?: string;
};

export const GM_SESSION_CHANGED_EVENT = "hknt:gm-session-changed";
export const OPEN_GM_LOGIN_EVENT = "hknt:open-gm-login";

export default function GlobalGmAccess() {
  const [session, setSession] = useState<SessionPayload>({ connected: false });
  const [checking, setChecking] = useState(true);
  const [open, setOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [message, setMessage] = useState("");

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch("/api/gm/session", { cache: "no-store" });
      const payload = (await response.json()) as SessionPayload;
      setSession(payload);
      if (payload.expired) {
        setMessage("Phiên GM đã hết sau khi Gateway khởi động lại. Vui lòng kết nối lại một lần.");
      }
    } catch {
      setSession({ connected: false });
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    void checkSession();
    // 60 giây thay vì 15, và không gọi khi tab đang ẩn. Phiên GM không hết hạn
    // trong vài chục giây nên nhịp dày hơn không đem lại gì, chỉ tốn hạn mức.
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void checkSession();
    }, 60_000);
    const refresh = () => void checkSession();
    const showLogin = () => {
      setMessage("");
      setOpen(true);
    };
    window.addEventListener(GM_SESSION_CHANGED_EVENT, refresh);
    window.addEventListener(OPEN_GM_LOGIN_EVENT, showLogin);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener(GM_SESSION_CHANGED_EVENT, refresh);
      window.removeEventListener(OPEN_GM_LOGIN_EVENT, showLogin);
    };
  }, [checkSession]);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  async function connect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setConnecting(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/gm/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.get("username"),
          password: form.get("password"),
        }),
      });
      const payload = (await response.json()) as SessionPayload;
      if (!response.ok || !payload.connected) {
        throw new Error(payload.message ?? "Không thể kết nối quyền GM.");
      }
      setSession(payload);
      setOpen(false);
      window.dispatchEvent(new Event(GM_SESSION_CHANGED_EVENT));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể kết nối quyền GM.");
    } finally {
      setConnecting(false);
    }
  }

  async function disconnect() {
    await fetch("/api/gm/connect", { method: "DELETE" });
    setSession({ connected: false });
    setOpen(false);
    window.dispatchEvent(new Event(GM_SESSION_CHANGED_EVENT));
  }

  return (
    <div className="global-gm-access">
      <button
        type="button"
        className={`global-gm-trigger ${session.connected ? "connected" : ""}`}
        onClick={() => {
          setMessage("");
          setOpen(true);
        }}
        aria-label={session.connected ? "Xem phiên GM dùng chung" : "Kết nối quyền GM dùng chung"}
      >
        {checking ? (
          <LoaderCircle className="spinning" size={17} />
        ) : session.connected ? (
          <ShieldCheck size={17} />
        ) : (
          <KeyRound size={17} />
        )}
        <span>
          <small>QUYỀN GM DÙNG CHUNG</small>
          <strong>
            {checking
              ? "Đang kiểm tra"
              : session.connected
                ? `${session.displayName ?? session.accountId} · Full quyền`
                : "Chưa kết nối"}
          </strong>
        </span>
      </button>

      {open ? (
        <Portal>
        <div className="global-gm-modal" role="presentation" onMouseDown={() => setOpen(false)}>
          <section
            className="global-gm-dialog glass-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="global-gm-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="global-gm-close"
              onClick={() => setOpen(false)}
              aria-label="Đóng"
            >
              <X size={18} />
            </button>
            <div className="gm-connect-icon"><KeyRound size={27} /></div>
            <span className="section-kicker">MỘT PHIÊN CHO TOÀN BỘ CÔNG CỤ</span>
            <h2 id="global-gm-title">
              {session.connected ? "Quyền GM đang hoạt động" : "Kết nối quyền GameServer"}
            </h2>
            <p>
              Đăng nhập một lần tại đây. Hỗ trợ người chơi, Bách Bảo Các và các công cụ vận hành
              sẽ cùng sử dụng phiên này.
            </p>

            {session.connected ? (
              <div className="global-gm-connected-card">
                <ShieldCheck size={23} />
                <span>
                  <small>Tài khoản đang dùng</small>
                  <strong>{session.displayName ?? session.accountId} · Full quyền GM</strong>
                </span>
                <button type="button" onClick={() => void disconnect()}>
                  <LogOut size={16} /> Ngắt kết nối
                </button>
              </div>
            ) : (
              <form onSubmit={connect} className="gm-connect-form">
                <label>
                  <span>Tài khoản GM</span>
                  <input name="username" autoComplete="username" required autoCapitalize="none" />
                </label>
                <label>
                  <span>Mật khẩu GameServer</span>
                  <input
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    minLength={6}
                    required
                  />
                </label>
                {message ? <div className="gm-notice error" role="alert">{message}</div> : null}
                <button className="gold-button" type="submit" disabled={connecting}>
                  {connecting ? <LoaderCircle className="spinning" size={18} /> : <ShieldCheck size={18} />}
                  {connecting ? "Đang xác thực…" : "Kết nối dùng chung"}
                </button>
              </form>
            )}
          </section>
        </div>
        </Portal>
      ) : null}
    </div>
  );
}
