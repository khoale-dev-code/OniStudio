import Link from "@/components/ui/nav-link";
import { context, href } from "@/lib/i18n";
import { navigation, site } from "@/data/site";
export async function Footer() {
  const { locale } = await context();
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link className="wordmark" href={href(locale)}>
            oni<span>STUDIO</span>
          </Link>
          <p>
            {locale === "vi"
              ? "Không gian của bạn. Cảm hứng của bạn."
              : "Your space. Your inspiration."}
          </p>
          <p className="muted">{site.address[locale]}</p>
        </div>
        <div>
          <h2>{locale === "vi" ? "Khám phá" : "Explore"}</h2>
          <div className="footer-links">
            {navigation.map((n) => (
              <Link key={n.path} href={href(locale, n.path)}>
                {n.label[locale]}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h2>{locale === "vi" ? "Kết nối với Oni" : "Let’s connect"}</h2>
          <div className="footer-links">
            <a href={`tel:${site.phoneHref}`}>{site.phone}</a>
            <a href={`mailto:${site.email}`}>{site.email}</a>
            <a href={site.facebook} target="_blank" rel="noopener noreferrer">
              Facebook
            </a>
            {site.instagram && <a href={site.instagram}>Instagram</a>}
            {site.tiktok && <a href={site.tiktok}>TikTok</a>}
            <Link href={href(locale, "/contact")}>
              {locale === "vi" ? "Chỉ đường & liên hệ" : "Directions & contact"}
            </Link>
          </div>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© Oni Studio</span>
        <span>
          {locale === "vi"
            ? "Dành cho những góc nhìn khác biệt."
            : "Made for a different perspective."}
        </span>
        <Link href="/admin">{locale === "vi" ? "Quản trị" : "Admin"}</Link>
      </div>
    </footer>
  );
}
