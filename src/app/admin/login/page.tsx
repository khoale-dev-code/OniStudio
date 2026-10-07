import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { adminSession } from "@/lib/auth";
import { isConfigured } from "@/lib/supabase/config";
import { LoginForm } from "@/components/admin/login-form";

export default async function Login() {
  if (await adminSession()) redirect("/admin");

  return (
    <main id="main" className="login-page login-page-v2">
      <section className="login-brand-panel" aria-label="Oni Studio">
        <div className="login-brand-panel-inner">
          <div className="login-brand-topline">
            <span>ONI STUDIO</span>
            <span>ADMIN PORTAL</span>
          </div>

          <div className="login-brand-copy">
            <p className="login-brand-kicker">PRIVATE WORKSPACE</p>
            <h1>
              Quản lý Oni
              <br />
              trong một nơi.
            </h1>
            <p>
              Thiết bị, phòng studio, hình ảnh và nội dung website được quản lý
              trong một giao diện gọn và thống nhất.
            </p>
          </div>

          <div className="login-brand-footer">
            <span>© Oni Studio</span>
            <span>Saigon</span>
          </div>
        </div>
      </section>

      <section className="login-form-panel">
        <div className="login-card login-card-v2">
          <Link
            className="login-logo-v21"
            href="/"
            aria-label="Về website Oni Studio"
          >
            <Image
              src="/images/oni-studio-admin-logo.png"
              width={750}
              height={750}
              priority
              alt="Oni Studio"
            />
          </Link>

          <div className="login-card-heading">
            <div className="login-card-icon">
              <ShieldCheck size={20} aria-hidden="true" />
            </div>

            <div>
              <p className="login-card-eyebrow">ADMIN ACCESS</p>
              <h2>Chào mừng trở lại.</h2>
            </div>
          </div>

          <p className="login-card-description">
            Đăng nhập để tiếp tục quản lý website Oni Studio.
          </p>

          {!isConfigured() && (
            <div className="notice">
              Website đang dùng dữ liệu có sẵn. Cấu hình Supabase trong
              .env.local, chạy SQL và cấp quyền admin theo README để đăng nhập.
            </div>
          )}

          <LoginForm configured={isConfigured()} />

          <div className="login-card-footer">
            <Link className="admin-back admin-back-v2" href="/">
              <ArrowLeft size={16} aria-hidden="true" />
              Về website Oni Studio
            </Link>

            <span>Private admin area</span>
          </div>
        </div>
      </section>
    </main>
  );
}
