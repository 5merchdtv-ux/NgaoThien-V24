import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/");

  return (
    <main className="login-shell">
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-mark" aria-hidden="true">
          天
        </div>
        <div className="eyebrow">KHU VỰC NỘI BỘ</div>
        <h1 id="login-title">HK Ngạo Thiên</h1>
        <p className="login-copy">
          Đăng nhập bằng tài khoản quản trị để xem dữ liệu máy chủ.
        </p>
        <LoginForm />
        <div className="login-security">
          <span aria-hidden="true">◆</span>
          Phiên đăng nhập được mã hóa · Tự hết hạn sau 8 giờ
        </div>
      </section>
      <p className="login-footer">Dành riêng cho ban quản trị HK Ngạo Thiên</p>
    </main>
  );
}

