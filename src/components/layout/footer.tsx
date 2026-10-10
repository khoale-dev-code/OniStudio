import Image from "next/image";
import Link from "@/components/ui/nav-link";
import {
  ArrowUpRight,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { navigation, site } from "@/data/site";
import { context, href } from "@/lib/i18n";

export async function Footer() {
  const { locale } = await context();
  const vi = locale === "vi";

  return (
    <footer className="site-footer site-footer-v3">
      <div className="container footer-v3-shell">
        <div className="footer-v3-masthead">
          <Link className="footer-v3-brand" href={href(locale)} aria-label="Oni Studio">
            <span className="footer-v3-brand-image">
              <Image
                src="/images/oni-studio-footer-logo.png"
                width={112}
                height={112}
                sizes="64px"
                alt=""
              />
            </span>
            <span className="footer-v3-brand-text">
              <strong>oni studio<span className="footer-v3-brand-dot">.</span></strong>
              <small>SAIGON · VIETNAM</small>
            </span>
          </Link>

          <div className="footer-v3-socials" aria-label={vi ? "Mạng xã hội" : "Social media"}>
            <a href={site.facebook} target="_blank" rel="noopener noreferrer" aria-label="Oni Studio Facebook">
              <Facebook size={17} aria-hidden="true" />
              <span>Facebook</span>
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
            <a href={site.instagram} target="_blank" rel="noopener noreferrer" aria-label="Oni Studio Instagram">
              <Instagram size={17} aria-hidden="true" />
              <span>Instagram</span>
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="footer-v3-content">
          <div className="footer-v3-statement">
            <p className="footer-v3-eyebrow">{vi ? "KHÔNG GIAN SÁNG TẠO" : "A CREATIVE SPACE"}</p>
            <h2>
              {vi ? (
                <>
                  <span>Không gian cho</span>
                  <span>những góc nhìn</span>
                  <span>khác biệt.</span>
                </>
              ) : (
                <>
                  <span>A space for</span>
                  <span>a different</span>
                  <span>perspective.</span>
                </>
              )}
            </h2>
            <p className="footer-v3-description">
              {vi
                ? "Không gian chụp và thiết bị được chuẩn bị chỉn chu, để bạn tập trung vào sáng tạo."
                : "Thoughtfully prepared studio spaces and equipment, so you can focus on creating."}
            </p>
          </div>

          <div className="footer-v3-information">
            <section className="footer-v3-info-group" aria-label={vi ? "Liên hệ trực tiếp" : "Contact"}>
              <h3>{vi ? "Liên hệ" : "Contact"}</h3>
              <a className="footer-v3-info-link" href={`tel:${site.phoneHref}`}>
                <Phone size={18} aria-hidden="true" />
                <span>{site.phone}</span>
              </a>
              <a className="footer-v3-info-link" href={`mailto:${site.email}`}>
                <Mail size={18} aria-hidden="true" />
                <span>{site.email}</span>
              </a>
              <a className="footer-v3-action-link" href={site.messenger} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={17} aria-hidden="true" />
                <span>{vi ? "Nhắn tin cho Oni" : "Message Oni"}</span>
                <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            </section>

            <section className="footer-v3-info-group" aria-label={vi ? "Địa chỉ studio" : "Studio address"}>
              <h3>{vi ? "Địa chỉ" : "Find us"}</h3>
              <a className="footer-v3-info-link footer-v3-address" href={site.map} target="_blank" rel="noopener noreferrer">
                <MapPin size={18} aria-hidden="true" />
                <span>{site.address[locale]}</span>
              </a>
              <Link className="footer-v3-action-link footer-v3-direction" href={href(locale, "/contact")}>
                <span>{vi ? "Chỉ đường & liên hệ" : "Directions & contact"}</span>
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </section>
          </div>
        </div>

        <div className="footer-v3-explore">
          <p className="footer-v3-explore-label">{vi ? "KHÁM PHÁ" : "EXPLORE"}</p>
          <nav className="footer-v3-nav" aria-label={vi ? "Khám phá Oni Studio" : "Explore Oni Studio"}>
            {navigation.map((item) => (
              <Link key={item.path} href={href(locale, item.path)}>
                <span>{item.label[locale]}</span>
                <ArrowUpRight size={13} aria-hidden="true" />
              </Link>
            ))}
          </nav>
        </div>

        <div className="footer-v3-bottom">
          <span>© Oni Studio</span>
          <span>{vi ? "Không gian của bạn. Cảm hứng của bạn." : "Your space. Your inspiration."}</span>
          <Link href="/admin">{vi ? "Quản trị" : "Admin"}</Link>
        </div>
      </div>
    </footer>
  );
}
