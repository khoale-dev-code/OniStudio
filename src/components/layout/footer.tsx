import Image from "next/image";
import {
  ArrowUpRight,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import Link from "@/components/ui/nav-link";
import { context, href } from "@/lib/i18n";
import { navigation, site } from "@/data/site";

export async function Footer() {
  const { locale } = await context();
  const vi = locale === "vi";

  return (
    <footer className="site-footer site-footer-v2">
      <div className="container footer-v2-shell">
        <div className="footer-v2-top">
          <p className="footer-v2-kicker">ONI STUDIO · SAIGON</p>

          <div className="footer-v2-socials">
            <a
              href={site.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook Oni Studio"
            >
              <Facebook size={17} aria-hidden="true" />
              <span>Facebook</span>
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>

            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram Oni Studio"
            >
              <Instagram size={17} aria-hidden="true" />
              <span>Instagram</span>
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="footer-v2-hero">
          <h2>
            {vi ? (
              <>
                Không gian cho
                <br />
                những góc nhìn
                <br />
                khác biệt.
              </>
            ) : (
              <>
                A space for
                <br />
                a different
                <br />
                perspective.
              </>
            )}
          </h2>

          <p>
            {vi
              ? "Không gian chụp, thiết bị và trải nghiệm được chuẩn bị để bạn tập trung vào phần sáng tạo."
              : "Studio spaces, equipment and the experience are prepared so you can focus on creating."}
          </p>
        </div>

        <div className="footer-v2-main-grid">
          <div className="footer-v2-brand-panel">
            <Link
              className="footer-v2-logo-link"
              href={href(locale)}
              aria-label="Oni Studio"
            >
              <Image
                src="/images/oni-studio-footer-logo.png"
                width={360}
                height={360}
                sizes="(max-width: 700px) 180px, 220px"
                alt="Oni Studio"
                className="footer-v2-logo"
              />
            </Link>

            <p>
              {vi
                ? "Không gian của bạn. Cảm hứng của bạn."
                : "Your space. Your inspiration."}
            </p>
          </div>

          <div className="footer-v2-contact-panel">
            <p className="footer-v2-label">
              {vi ? "Liên hệ trực tiếp" : "Direct enquiries"}
            </p>

            <a className="footer-v2-contact-link" href={`tel:${site.phoneHref}`}>
              <Phone size={20} aria-hidden="true" />
              <span>{site.phone}</span>
            </a>

            <a className="footer-v2-contact-link" href={`mailto:${site.email}`}>
              <Mail size={20} aria-hidden="true" />
              <span>{site.email}</span>
            </a>
          </div>

          <div className="footer-v2-location-panel">
            <p className="footer-v2-label">
              {vi ? "Ghé Oni" : "Visit Oni"}
            </p>

            <a
              className="footer-v2-location-link"
              href={site.map}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MapPin size={20} aria-hidden="true" />
              <span>{site.address[locale]}</span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>

            <Link
              className="footer-v2-inline-link"
              href={href(locale, "/contact")}
            >
              {vi ? "Chỉ đường & liên hệ" : "Directions & contact"}
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="footer-v2-link-row">
          <div>
            <p className="footer-v2-label">
              {vi ? "Khám phá" : "Explore"}
            </p>

            <nav className="footer-v2-nav" aria-label={vi ? "Khám phá" : "Explore"}>
              {navigation.map((item) => (
                <Link key={item.path} href={href(locale, item.path)}>
                  <span>{item.label[locale]}</span>
                  <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
              ))}
            </nav>
          </div>

          <div className="footer-v2-follow">
            <p className="footer-v2-label">
              {vi ? "Theo dõi Oni" : "Follow Oni"}
            </p>

            <a
              href={site.facebook}
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>

            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="footer-v2-bottom">
          <span>© Oni Studio</span>

          <span>
            {vi
              ? "Dành cho những góc nhìn khác biệt."
              : "Made for a different perspective."}
          </span>

          <Link href="/admin">
            {vi ? "Quản trị" : "Admin"}
          </Link>
        </div>
      </div>
    </footer>
  );
}
