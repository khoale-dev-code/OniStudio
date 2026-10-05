import Link from "next/link";
import { redirect } from "next/navigation";
import { adminSession } from "@/lib/auth";
import { logout } from "@/app/admin/actions";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await adminSession())) redirect("/admin/login");

  return (
    <div className="admin-shell">
      <header className="admin-header admin-header-light">
        <div className="container admin-header-inner">
          <Link className="wordmark admin-wordmark" href="/admin">
            oni<span>ADMIN</span>
          </Link>

          <nav className="admin-nav" aria-label="Quản trị">
            <Link className="admin-nav-link" href="/admin">
              Tổng quan
            </Link>
            <Link className="admin-nav-link" href="/admin/equipment">
              Thiết bị
            </Link>
            <Link className="admin-nav-link" href="/admin/categories">
              Danh mục
            </Link>
            <Link className="admin-nav-link" href="/admin/studios">
              Phòng
            </Link>
            <Link className="admin-nav-link" href="/admin/gallery">
              Thư viện
            </Link>
            <Link
              className="admin-nav-link admin-nav-site"
              href="/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Website
            </Link>
            <form action={logout} className="admin-logout-form">
              <button className="admin-logout-button" type="submit">
                Đăng xuất
              </button>
            </form>
          </nav>
        </div>
      </header>

      <main id="main" className="container admin-content">
        {children}
      </main>
    </div>
  );
}
