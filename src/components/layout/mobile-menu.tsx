"use client";

import { useEffect, useRef, useState } from "react";
import Link from "@/components/ui/nav-link";
import { Menu, X } from "lucide-react";
import type { Locale } from "@/types/catalog";
import { navigation, site } from "@/data/site";
import { href } from "@/lib/links";

export function MobileMenu({
  locale,
  path,
}: {
  locale: Locale;
  path: string;
}) {
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
        className="icon-button mobile-toggle"
        type="button"
        aria-label={locale === "vi" ? "Mở menu" : "Open menu"}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={openMenu}
      >
        <Menu />
      </button>

      <dialog
        ref={dialog}
        className="mobile-dialog oni-mobile-drawer"
        aria-label={locale === "vi" ? "Điều hướng" : "Navigation"}
        onClose={() => setIsOpen(false)}
        onCancel={(event) => {
          event.preventDefault();
          closeMenu();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeMenu();
        }}
      >
        <div className="mobile-dialog-content oni-mobile-drawer-content">
          <div className="oni-mobile-drawer-head">
            <Link
              className="oni-mobile-wordmark"
              href={href(locale)}
              onClick={closeMenu}
              aria-label="Oni Studio"
            >
              <span className="oni-mobile-wordmark-main">oni</span>
              <span className="oni-mobile-wordmark-divider" aria-hidden="true" />
              <span className="oni-mobile-wordmark-studio">STUDIO</span>
            </Link>

            <button
              className="oni-mobile-close"
              type="button"
              aria-label={locale === "vi" ? "Đóng menu" : "Close menu"}
              onClick={closeMenu}
            >
              <X size={24} strokeWidth={1.7} />
            </button>
          </div>

          <nav className="oni-mobile-nav" aria-label="Mobile">
            {navigation.map((item) => {
              const active =
                item.path === "/"
                  ? path === "/"
                  : path.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  className="oni-mobile-nav-link"
                  href={href(locale, item.path)}
                  aria-current={active ? "page" : undefined}
                  onClick={closeMenu}
                >
                  <span>{item.label[locale]}</span>
                </Link>
              );
            })}
          </nav>

          <div className="oni-mobile-drawer-footer">
            <a
              className="oni-mobile-message"
              href={site.messenger}
              target="_blank"
              rel="noopener noreferrer"
            >
              {locale === "vi" ? "Nhắn Oni Studio" : "Message Oni Studio"}
            </a>
          </div>
        </div>
      </dialog>
    </>
  );
}
