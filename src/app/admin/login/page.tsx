import Link from "next/link";
import { redirect } from "next/navigation";
import { adminSession } from "@/lib/auth";
import { isConfigured } from "@/lib/supabase/config";
import { LoginForm } from "@/components/admin/login-form";
export default async function Login() {
  if (await adminSession()) redirect("/admin");
  return (
    <main id="main" className="login-page">
      <div className="login-card">
        <Link className="wordmark" href="/">
          oni<span>STUDIO</span>
        </Link>
        <h1>Chào mừng trở lại.</h1>
        <p>Đăng nhập để quản lý thiết bị, phòng studio và hình ảnh.</p>
        {!isConfigured() && (
          <div className="notice">
            Website đang dùng dữ liệu có sẵn. Cấu hình Supabase trong
            .env.local, chạy SQL và cấp quyền admin theo README để đăng nhập.
          </div>
        )}
        <LoginForm configured={isConfigured()} />
        <Link className="admin-back" href="/">
          Về website Oni Studio
        </Link>
      </div>
    </main>
  );
}
