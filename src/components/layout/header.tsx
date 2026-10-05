import Image from "next/image";
import Link from "@/components/ui/nav-link";
import { context, href } from "@/lib/i18n";
import { HeaderNavigation } from "./header-navigation";
export async function Header() {
  const { locale } = await context();
  return (
    <header className="site-header">
      <div className="header-inner container">
        <Link
          className="brand"
          href={href(locale)}
          aria-label="Oni Studio — Home"
        >
          <Image
            src="/images/oni-logo.png"
            width={48}
            height={48}
            alt=""
            className="brand-icon"
          />
          <span className="wordmark">
            oni<span>STUDIO</span>
          </span>
        </Link>
        <HeaderNavigation locale={locale} />
      </div>
    </header>
  );
}
