import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import Dashboard from "../ui/Dashboard";

export const dynamic = "force-dynamic";

/**
 * Catch-all để mọi đường dẫn trang trong lib/routes.ts đều mở được khi tải lại
 * hoặc khi dán link trực tiếp. Các route cụ thể hơn như /login và /api/* vẫn
 * được Next.js ưu tiên trước.
 */
export default async function DashboardPage() {
  const session = await getAdminSession();
  if (!session) redirect("/login");

  return <Dashboard username={session.sub} />;
}
