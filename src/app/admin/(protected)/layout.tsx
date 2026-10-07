import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { redirect } from "next/navigation";
import { adminSession } from "@/lib/auth";
import { logout } from "@/app/admin/actions";
import { AdminMobileMenu } from "@/components/admin/admin-mobile-menu";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await adminSession())) redirect("/admin/login");

  return (
    <div className="admin-shell">
      <header className="admin-header admin-header-light admin-header-brand-v3">
        <div className="container admin-header-inner admin-header-inner-v3">
          <Link className="admin-brand-v3" href="/admin" aria-label="Oni Admin">
            <Image
              src="/images/oni-studio-admin-brand.png"
              width={52}
              height={52}
              alt=""
              className="admin-brand-logo-v3"
              priority
            />
            <span className="admin-brand-copy-v3">
              <span className="admin-brand-name-v3">oni</span>
              <span className="admin-brand-divider-v3" aria-hidden="true" />
              <span className="admin-brand-badge-v3">ADMIN</span>
            </span>
          </Link>

          <nav className="admin-nav admin-nav-v3" aria-label="Quản trị">
            <Link className="admin-nav-link" href="/admin">
              Tổng quan
            </Link>
            <Link className="admin-nav-link" href="/admin/equipment">
              Thiết bị
            </Link>
            <Link className="admin-nav-link" href="/admin/backdrops">
              Phông
            </Link>
            <Link className="admin-nav-link" href="/admin/props">
              Đạo cụ
            </Link>
            <Link className="admin-nav-link" href="/admin/studios">
              Không gian
            </Link>
            <Link className="admin-nav-link" href="/admin/gallery">
              Hình ảnh
            </Link>

            <Link
              className="admin-nav-link admin-nav-site admin-nav-site-v3"
              href="/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>Website</span>
              <ExternalLink size={14} aria-hidden="true" />
            </Link>

            <form action={logout} className="admin-logout-form">
              <button
                className="admin-logout-button admin-logout-button-v3"
                type="submit"
              >
                Đăng xuất
              </button>
            </form>
          </nav>

          <AdminMobileMenu />
        </div>
      </header>

      <main id="main" className="container admin-content">
        {children}
      </main>
    </div>
  );
}
