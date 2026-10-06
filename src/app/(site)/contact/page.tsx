import {
  ArrowUpRight,
  Check,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { context } from "@/lib/i18n";
import { site } from "@/data/site";
import { pageMetadata } from "@/lib/metadata";

export function generateMetadata() {
  return pageMetadata(
    { vi: "Liên hệ & địa chỉ", en: "Contact & visit" },
    {
      vi: "Liên hệ Oni Studio, xem địa chỉ, bản đồ, số điện thoại và các kênh nhắn tin để chuẩn bị buổi chụp.",
      en: "Contact Oni Studio, find the address, map, phone number and messaging channels to prepare your shoot.",
    },
    "/contact",
  );
}

export default async function Contact() {
  const { locale } = await context();
  const vi = locale === "vi";

  const visitSteps = vi
    ? [
        "Gửi concept hoặc moodboard để Oni hiểu hướng chụp.",
        "Cho Oni biết ngày chụp, thời lượng và nhu cầu thiết bị.",
        "Chờ xác nhận lịch trước khi di chuyển đến studio.",
      ]
    : [
        "Send your concept or moodboard so Oni understands the direction.",
        "Share the shoot date, duration and equipment needs.",
        "Wait for booking confirmation before travelling to the studio.",
      ];

  return (
    <main className="contact-page-v2">
      <section className="contact-v2-hero">
        <div className="container contact-v2-hero-grid">
          <div className="contact-v2-hero-copy">
            <p className="eyebrow">ONI STUDIO · CONTACT</p>

            <h1>
              {vi ? (
                <>
                  Hẹn gặp bạn
                  <br />
                  tại Oni.
                </>
              ) : (
                <>
                  See you
                  <br />
                  at Oni.
                </>
              )}
            </h1>

            <p className="contact-v2-lead">
              {vi
                ? "Gửi concept, ngày chụp và nhu cầu thiết bị. Oni sẽ cùng bạn kiểm tra không gian phù hợp và xác nhận lịch trước khi buổi chụp bắt đầu."
                : "Share your concept, shoot date and equipment needs. Oni will help confirm the right space and availability before your session."}
            </p>
          </div>

          <div className="contact-v2-primary-actions">
            <p className="contact-v2-action-label">
              {vi ? "Liên hệ nhanh" : "Quick contact"}
            </p>

            <a
              className="contact-v2-action contact-v2-action-primary"
              href={site.messenger}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="contact-v2-action-icon">
                <MessageCircle size={20} aria-hidden="true" />
              </span>
              <span>
                <small>Messenger</small>
                <strong>
                  {vi ? "Nhắn Oni Studio" : "Message Oni Studio"}
                </strong>
              </span>
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>

            <a
              className="contact-v2-action"
              href={`tel:${site.phoneHref}`}
            >
              <span className="contact-v2-action-icon">
                <Phone size={20} aria-hidden="true" />
              </span>
              <span>
                <small>{vi ? "Điện thoại" : "Phone"}</small>
                <strong>{site.phone}</strong>
              </span>
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="container contact-v2-info-strip">
        <article>
          <span className="contact-v2-info-icon">
            <MapPin size={19} aria-hidden="true" />
          </span>
          <div>
            <p>{vi ? "Địa chỉ" : "Address"}</p>
            <strong>{site.address[locale]}</strong>
          </div>
        </article>

        <article>
          <span className="contact-v2-info-icon">
            <Mail size={19} aria-hidden="true" />
          </span>
          <div>
            <p>Email</p>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </div>
        </article>

        <article>
          <span className="contact-v2-info-icon">
            <Facebook size={19} aria-hidden="true" />
          </span>
          <div>
            <p>{vi ? "Mạng xã hội" : "Social"}</p>
            <div className="contact-v2-social-inline">
              <a
                href={site.facebook}
                target="_blank"
                rel="noopener noreferrer"
              >
                Facebook
              </a>
              {site.instagram && (
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
              )}
            </div>
          </div>
        </article>
      </section>

      <section className="container contact-v2-main">
        <div className="contact-v2-map-panel">
          <div className="contact-v2-section-head">
            <div>
              <p className="eyebrow">
                {vi ? "ĐƯỜNG ĐẾN ONI" : "FIND ONI"}
              </p>
              <h2>
                {vi ? "220/29 Âu Cơ, Tân Hoà." : "220/29 Au Co, Tan Hoa."}
              </h2>
            </div>

            <a
              className="contact-v2-map-link"
              href={site.map}
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Maps
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>

          <div className="contact-v2-map-frame">
            <iframe
              title={
                vi
                  ? "Bản đồ đến Oni Studio"
                  : "Directions to Oni Studio"
              }
              src={site.mapEmbed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>

          <p className="contact-v2-map-note">
            {vi
              ? "Vui lòng xác nhận giờ đến với studio trước khi di chuyển."
              : "Please confirm your arrival time with the studio before travelling."}
          </p>
        </div>

        <aside className="contact-v2-visit-card">
          <div>
            <p className="eyebrow">
              {vi ? "TRƯỚC KHI ĐẾN" : "BEFORE YOU VISIT"}
            </p>
            <h2>
              {vi
                ? "Chuẩn bị nhanh cho buổi chụp."
                : "A quick prep for your shoot."}
            </h2>
            <p>
              {vi
                ? "Ba thông tin đơn giản giúp Oni kiểm tra lịch và chuẩn bị nhanh hơn."
                : "Three simple details help Oni confirm availability and prepare faster."}
            </p>
          </div>

          <ol className="contact-v2-checklist">
            {visitSteps.map((step, index) => (
              <li key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{step}</p>
                <Check size={17} aria-hidden="true" />
              </li>
            ))}
          </ol>

          <div className="contact-v2-visit-actions">
            <a
              className="button button-accent"
              href={site.messenger}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={18} aria-hidden="true" />
              {vi ? "Nhắn Oni" : "Message Oni"}
            </a>

            <a
              className="button button-outline"
              href={`mailto:${site.email}`}
            >
              <Mail size={18} aria-hidden="true" />
              Email
            </a>
          </div>
        </aside>
      </section>

      <section className="container contact-v2-social-section">
        <div className="contact-v2-social-copy">
          <p className="eyebrow">
            {vi ? "THEO DÕI ONI" : "FOLLOW ONI"}
          </p>
          <h2>
            {vi
              ? "Xem thêm hình ảnh và cập nhật mới."
              : "See more work and studio updates."}
          </h2>
        </div>

        <div className="contact-v2-social-cards">
          <a
            href={site.facebook}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Facebook size={22} aria-hidden="true" />
            <span>
              <small>Facebook</small>
              <strong>@onistudiovn</strong>
            </span>
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>

          {site.instagram && (
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram size={22} aria-hidden="true" />
              <span>
                <small>Instagram</small>
                <strong>@onistudiovn</strong>
              </span>
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          )}
        </div>
      </section>
    </main>
  );
}
