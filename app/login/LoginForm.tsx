"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.get("username"),
        password: form.get("password"),
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      setError(payload?.message ?? "Không thể đăng nhập lúc này.");
      setLoading(false);
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <label>
        <span>Tài khoản quản trị</span>
        <input
          name="username"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          autoFocus
          placeholder="Nhập tài khoản"
        />
      </label>
      <label>
        <span>Mật khẩu</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={12}
          placeholder="Nhập mật khẩu"
        />
      </label>
      {error ? (
        <div className="form-error" role="alert">
          {error}
        </div>
      ) : null}
      <button className="primary-button" type="submit" disabled={loading}>
        {loading ? "ĐANG XÁC THỰC…" : "ĐĂNG NHẬP HỆ THỐNG"}
      </button>
    </form>
  );
}

