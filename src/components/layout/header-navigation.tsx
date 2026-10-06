"use client";
import Link from "@/components/ui/nav-link";
import { usePathname } from "next/navigation";
import { navigation } from "@/data/site";
import { href } from "@/lib/links";
import type { Locale } from "@/types/catalog";
import { MobileMenu } from "./mobile-menu";
export function HeaderNavigation({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const path = pathname.replace(/^\/en(?=\/|$)/, "") || "/";
  return <>
    <nav className="desktop-nav client-rental-nav" aria-label={locale === "vi" ? "Điều hướng chính" : "Main navigation"}>
      {navigation.map((n) => <Link key={n.path} href={href(locale, n.path)} aria-current={path.startsWith(n.path) ? "page" : undefined}>{n.label[locale]}</Link>)}
    </nav>
    <div className="header-actions">
      <div className="language-switch" aria-label="Language">
        <a href={href("vi", path)} lang="vi" aria-current={locale === "vi" ? "true" : undefined}>VN</a><span>/</span>
        <a href={href("en", path)} lang="en" aria-current={locale === "en" ? "true" : undefined}>EN</a>
      </div>
      <MobileMenu locale={locale} path={path} />
    </div>
  </>;
}
