import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { PageHeading } from "@/components/ui/section";
import { context } from "@/lib/i18n";
import { site } from "@/data/site";
import { pageMetadata } from "@/lib/metadata";
export function generateMetadata() {
  return pageMetadata(
    { vi: "Liên hệ", en: "Contact" },
    {
      vi: "Địa chỉ, số điện thoại, Messenger và chỉ đường đến Oni Studio.",
      en: "Address, phone, Messenger and directions to Oni Studio.",
    },
    "/contact",
  );
}
export default async function Contact() {
  const { locale } = await context();
  return (
    <>
      <PageHeading
        eyebrow="LET’S TALK"
        title={locale === "vi" ? "Hẹn gặp bạn tại Oni." : "See you at Oni."}
        description={
          locale === "vi"
            ? "Gửi concept, ngày chụp và số lượng thành viên. Oni sẽ cùng bạn kiểm tra phòng, thiết bị và báo giá."
            : "Share your concept, shoot date and crew size. We’ll check rooms, equipment and pricing together."
        }
      />
      <section className="container section-bottom contact-grid">
        <div className="contact-details">
          <div>
            <MapPin />
            <h2>{locale === "vi" ? "Địa chỉ" : "Address"}</h2>
            <p>{site.address[locale]}</p>
            <a
              className="text-link"
              href={site.map}
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Maps
            </a>
          </div>
          <div>
            <Phone />
            <h2>{locale === "vi" ? "Điện thoại" : "Phone"}</h2>
            <a href={`tel:${site.phoneHref}`}>{site.phone}</a>
          </div>
          <div>
            <Mail />
            <h2>Email</h2>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </div>
          <div>
            <MessageCircle />
            <h2>
              {locale === "vi"
                ? "Nhắn tin & đặt lịch"
                : "Messages & reservations"}
            </h2>
            <div className="social-links">
              <a href={site.facebook} target="_blank" rel="noopener noreferrer">
                Facebook
              </a>
              {site.instagram && <a href={site.instagram}>Instagram</a>}
              {site.tiktok && <a href={site.tiktok}>TikTok</a>}
            </div>
          </div>
        </div>
        <div className="map-wrap">
          <iframe
            title={
              locale === "vi"
                ? "Bản đồ đến Oni Studio"
                : "Directions to Oni Studio"
            }
            src={site.mapEmbed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
          <p className="small muted">
            {locale === "vi"
              ? "Vui lòng xác nhận giờ đến với studio trước khi di chuyển."
              : "Please confirm your arrival time with the studio before travelling."}
          </p>
        </div>
      </section>
    </>
  );
}
