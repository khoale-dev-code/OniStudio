import Image from "next/image";
import Link from "@/components/ui/nav-link";
import { ArrowUpRight, Lightbulb, Maximize2, Users } from "lucide-react";
import { href, money } from "@/lib/i18n";
import type { Locale, Studio } from "@/types/catalog";

export function StudioCard({
  studio,
  locale,
  index,
}: {
  studio: Studio;
  locale: Locale;
  index?: number;
}) {
  const detailHref = href(locale, `/studios/${studio.slug}`);
  const description = studio.description[locale];

  return (
    <article className="studio-card studio-card-v2">
      <Link href={detailHref} className="room-visual studio-card-media">
        <Image
          src={studio.images[0] || "/images/studio-concept.webp"}
          fill
          sizes="(max-width: 767px) 100vw, (max-width: 1100px) 50vw, 680px"
          alt={
            studio.images.length
              ? studio.name
              : locale === "vi"
                ? "Minh họa không gian chụp ảnh"
                : "Photography space concept"
          }
          className={`room-image room-${studio.slug}`}
        />

        <div className="studio-card-media-shade" aria-hidden="true" />

        <div className="studio-card-media-top">
          <span className="studio-card-index">
            {String(index ?? 1).padStart(2, "0")}
          </span>
          <span className="studio-card-type">
            {locale === "vi" ? "Studio chụp ảnh" : "Photo studio"}
          </span>
        </div>

        <div className="studio-card-media-bottom">
          <span>{studio.name}</span>
          <ArrowUpRight size={22} aria-hidden="true" />
        </div>

        {!studio.images.length && (
          <span className="image-caption">
            {locale === "vi" ? "Ảnh không gian minh họa" : "Illustrative space"}
          </span>
        )}
      </Link>

      <div className="studio-card-content">
        <div className="studio-card-title-row">
          <div>
            <p className="studio-card-kicker">
              {locale === "vi" ? "Không gian studio" : "Studio space"}
            </p>
            <h3>
              <Link href={detailHref}>{studio.name}</Link>
            </h3>
          </div>
          <span className="studio-card-availability">
            {locale === "vi" ? "Liên hệ lịch" : "Check dates"}
          </span>
        </div>

        <p className="studio-card-description">{description}</p>

        <div className="studio-card-facts" aria-label={locale === "vi" ? "Thông tin phòng" : "Room details"}>
          <span>
            <Maximize2 size={17} aria-hidden="true" />
            <strong>{studio.area}</strong> m²
          </span>
          <span>
            <Users size={18} aria-hidden="true" />
            {locale === "vi"
              ? `Tối đa ${studio.capacity} người`
              : `Up to ${studio.capacity} people`}
          </span>
          {studio.led_count > 0 && (
            <span>
              <Lightbulb size={18} aria-hidden="true" />
              {locale === "vi"
                ? `${studio.led_count} đèn đi kèm`
                : `${studio.led_count} included light${studio.led_count > 1 ? "s" : ""}`}
            </span>
          )}
        </div>

        <div className="studio-card-footer">
          <div className="studio-price-block">
            <span>{locale === "vi" ? "Giá thuê từ" : "From"}</span>
            <p>
              <strong>{money(studio.price, locale)}</strong>
              <small> / {locale === "vi" ? "giờ" : "hour"}</small>
            </p>
          </div>

          <Link className="studio-explore-button" href={detailHref}>
            <span>{locale === "vi" ? "Xem chi tiết" : "View details"}</span>
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
