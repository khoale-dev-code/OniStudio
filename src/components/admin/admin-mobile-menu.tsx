"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/actions";

const adminNavigation = [
  { href: "/admin", label: "Tổng quan", exact: true },
  { href: "/admin/equipment", label: "Thiết bị" },
  { href: "/admin/backdrops", label: "Phông" },
  { href: "/admin/props", label: "Đạo cụ" },
  { href: "/admin/studios", label: "Không gian" },
  { href: "/admin/gallery", label: "Hình ảnh" },
] as const;

export function AdminMobileMenu() {
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  function openMenu() {
    const node = dialog.current;
    if (!node || node.open) return;

    node.showModal();
    setIsOpen(true);
  }

  function closeMenu() {
    const node = dialog.current;
    if (!node?.open) return;

    node.close();
  }

  useEffect(() => {
    if (!isOpen) return;

    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
    };
  }, [isOpen]);

  return (
    <>
      <button
        className="admin-mobile-toggle admin-mobile-toggle-v3"
        type="button"
        aria-label="Mở menu quản trị"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={openMenu}
      >
        <Menu size={22} strokeWidth={1.75} />
      </button>

      <dialog
        ref={dialog}
        className="admin-mobile-dialog"
        aria-label="Điều hướng quản trị"
        onClose={() => setIsOpen(false)}
        onCancel={(event) => {
          event.preventDefault();
          closeMenu();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeMenu();
        }}
      >
        <div className="admin-mobile-dialog-content">
          <div className="admin-mobile-dialog-head admin-mobile-dialog-head-v3">
            <Link
              className="admin-mobile-brand-v3"
              href="/admin"
              onClick={closeMenu}
              aria-label="Oni Admin"
            >
              <Image
                src="/images/oni-studio-admin-brand.png"
                width={46}
                height={46}
                alt=""
                className="admin-mobile-brand-logo-v3"
              />
              <span className="admin-mobile-brand-copy-v3">
                <span className="admin-mobile-brand-name-v3">oni</span>
                <span className="admin-mobile-brand-badge-v3">ADMIN</span>
              </span>
            </Link>

            <button
              className="admin-mobile-close"
              type="button"
              aria-label="Đóng menu quản trị"
              onClick={closeMenu}
            >
              <X size={22} strokeWidth={1.7} />
            </button>
          </div>

          <nav className="admin-mobile-nav" aria-label="Quản trị">
            {adminNavigation.map((item) => {
              const active =
                "exact" in item && item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  className="admin-mobile-nav-link"
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={closeMenu}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <a
              className="admin-mobile-nav-link admin-mobile-site-link"
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
            >
              <span>Website</span>
              <ExternalLink size={16} aria-hidden="true" />
            </a>
          </nav>

          <div className="admin-mobile-dialog-footer">
            <form action={logout}>
              <button className="admin-mobile-logout" type="submit">
                Đăng xuất
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}
