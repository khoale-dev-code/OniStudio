import {
  ArrowRight,
  ArrowUpRight,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import Image from "next/image";
import { ContactMotion } from "@/components/contact/contact-motion";
import { context } from "@/lib/i18n";
import { site } from "@/data/site";
import { pageMetadata } from "@/lib/metadata";

export function generateMetadata() {
  return pageMetadata(
    { vi: "Liên hệ & địa chỉ", en: "Contact & visit" },
    {
      vi: "Liên hệ Oni Studio, xem địa chỉ, bản đồ và các kênh nhắn tin để chuẩn bị buổi chụp.",
      en: "Contact Oni Studio, find the address, map and messaging channels to prepare your shoot.",
    },
    "/contact",
  );
}

export default async function Contact() {
  const { locale } = await context();
  const vi = locale === "vi";

  return (
    <main className="contact-page-v3 contact-refresh">
      <ContactMotion />
      <section className="contact-v3-hero">
        <div className="container contact-v3-hero-grid">
          <div className="contact-v3-hero-copy">
            <p className="eyebrow">ONI STUDIO · CONTACT</p>

            <h1>
              {vi ? (
                <>
                  Bắt đầu từ
                  <br />
                  một cuộc trò chuyện.
                </>
              ) : (
                <>
                  Start with
                  <br />
                  a conversation.
                </>
              )}
            </h1>

            <p>
              {vi
                ? "Gửi cho Oni concept, ngày chụp và nhu cầu thiết bị. Phần còn lại sẽ được trao đổi trực tiếp để bạn có một buổi chụp gọn và rõ ràng hơn."
                : "Send Oni your concept, shoot date and equipment needs. We’ll confirm the rest directly so your shoot can stay simple and clear."}
            </p>

            <div className="contact-v3-hero-actions">
              <a
                className="button button-accent"
                href={site.messenger}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={18} aria-hidden="true" />
                {vi ? "Nhắn Oni Studio" : "Message Oni Studio"}
              </a>

              <a
                className="button button-outline"
                href={`tel:${site.phoneHref}`}
              >
                <Phone size={18} aria-hidden="true" />
                {site.phone}
              </a>
            </div>
          </div>

          <div className="contact-v3-hero-note">
            <p className="contact-v3-small-label">
              {vi ? "CHUẨN BỊ CHO BUỔI CHỤP" : "PREPARE YOUR SHOOT"}
            </p>
            <h2 className="contact-refresh-note-title">{vi ? "Thông tin nên gửi" : "What to send"}</h2>
            <p className="contact-refresh-note-intro">{vi ? "Chỉ cần 3 thông tin để Oni tư vấn nhanh và chính xác hơn." : "Three details help Oni respond with the right setup."}</p>

            <div className="contact-v3-note-list">
              <span>01</span>
              <p>{vi ? "Concept / moodboard" : "Concept / moodboard"}</p>

              <span>02</span>
              <p>{vi ? "Ngày & thời lượng chụp" : "Shoot date & duration"}</p>

              <span>03</span>
              <p>{vi ? "Nhu cầu thiết bị" : "Equipment needs"}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container contact-v3-quick-grid">
        <a
          href={site.map}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-v3-quick-card"
        >
          <span className="contact-v3-icon">
            <MapPin size={20} aria-hidden="true" />
          </span>
          <div>
            <small>{vi ? "Địa chỉ" : "Address"}</small>
            <strong>{site.address[locale]}</strong>
          </div>
          <ArrowUpRight size={17} aria-hidden="true" />
        </a>

        <a
          href={`mailto:${site.email}`}
          className="contact-v3-quick-card"
        >
          <span className="contact-v3-icon">
            <Mail size={20} aria-hidden="true" />
          </span>
          <div>
            <small>Email</small>
            <strong>{site.email}</strong>
          </div>
          <ArrowUpRight size={17} aria-hidden="true" />
        </a>

        <a
          href={site.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-v3-quick-card"
        >
          <span className="contact-v3-icon">
            <Facebook size={20} aria-hidden="true" />
          </span>
          <div>
            <small>Facebook</small>
            <strong>@onistudiovn</strong>
          </div>
          <ArrowUpRight size={17} aria-hidden="true" />
        </a>

        {site.instagram && (
          <a
            href={site.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-v3-quick-card"
          >
            <span className="contact-v3-icon">
              <Instagram size={20} aria-hidden="true" />
            </span>
            <div>
              <small>Instagram</small>
              <strong>@onistudiovn</strong>
            </div>
            <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        )}
      </section>

      <section className="container contact-v3-map-section">
        <div className="contact-v3-map-head">
          <div>
            <p className="eyebrow">{vi ? "GHÉ ONI" : "VISIT ONI"}</p>
            <h2>
              {vi
                ? "Tìm đường đến studio."
                : "Find your way to the studio."}
            </h2>
          </div>

          <a
            className="contact-v3-map-link"
            href={site.map}
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Maps
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>

        <div className="contact-v3-map-layout">
          <div className="contact-v3-map-frame">
            <iframe
              title={vi ? "Bản đồ đến Oni Studio" : "Directions to Oni Studio"}
              src={site.mapEmbed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>

          <aside className="contact-v3-map-aside">
            <div className="contact-refresh-logo-wrap">
              <Image src="/images/oni-contact-logo.webp" alt="Oni Studio" width={164} height={164} className="contact-refresh-logo" />
              <svg className="contact-refresh-orbit" viewBox="0 0 220 220" role="img" aria-label={vi ? "Nét trang trí chuyển động quanh logo" : "Decorative line around the logo"}><circle cx="110" cy="110" r="101" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 10" /><path d="M 10 110 A 100 100 0 0 1 110 10" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
            </div>
            <div className="contact-refresh-aside-bottom">
            <p className="contact-v3-small-label">
              {vi ? "TRƯỚC KHI DI CHUYỂN" : "BEFORE YOU TRAVEL"}
            </p>

            <h3>
              {vi
                ? "Xác nhận lịch trước khi đến."
                : "Confirm your booking before arrival."}
            </h3>

            <p>
              {vi
                ? "Oni sẽ xác nhận lại phòng, thời lượng và nhu cầu thiết bị trước buổi chụp."
                : "Oni will confirm the room, duration and equipment requirements before your session."}
            </p>

            <a
              href={site.messenger}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-v3-aside-link"
            >
              {vi ? "Nhắn Oni để xác nhận" : "Message Oni to confirm"}
              <ArrowRight size={16} aria-hidden="true" />
            </a>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
