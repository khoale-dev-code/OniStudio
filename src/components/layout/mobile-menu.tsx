"use client";
import { useRef } from "react";
import Link from "@/components/ui/nav-link";
import { Menu, X } from "lucide-react";
import type { Locale } from "@/types/catalog";
import { navigation, site } from "@/data/site";
import { href } from "@/lib/links";
export function MobileMenu({ locale, path }: { locale: Locale; path: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        className="icon-button mobile-toggle"
        aria-label={locale === "vi" ? "Mở menu" : "Open menu"}
        onClick={() => dialog.current?.showModal()}
      >
        <Menu />
      </button>
      <dialog
        ref={dialog}
        className="mobile-dialog"
        aria-label={locale === "vi" ? "Điều hướng" : "Navigation"}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        <div className="mobile-dialog-content">
          <div className="flex items-center justify-between">
            <span className="wordmark">
              oni<span>STUDIO</span>
            </span>
            <button
              className="icon-button"
              aria-label={locale === "vi" ? "Đóng menu" : "Close menu"}
              onClick={() => dialog.current?.close()}
            >
              <X />
            </button>
          </div>
          <nav>
            {navigation.map((n) => (
              <Link
                key={n.path}
                href={href(locale, n.path)}
                aria-current={path.startsWith(n.path) ? "page" : undefined}
                onClick={() => dialog.current?.close()}
              >
                {n.label[locale]}
              </Link>
            ))}
            <Link
              href={href(locale, "/contact")}
              onClick={() => dialog.current?.close()}
            >
              {locale === "vi" ? "Liên hệ" : "Contact"}
            </Link>
          </nav>
          <a
            className="button"
            href={site.messenger}
            target="_blank"
            rel="noopener noreferrer"
          >
            {locale === "vi" ? "Trao đổi lịch chụp" : "Plan your shoot"}
          </a>
        </div>
      </dialog>
    </>
  );
}
