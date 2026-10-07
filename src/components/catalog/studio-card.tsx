import { StudioCardAutoImages } from "@/components/catalog/studio-card-auto-images";
import Link from "@/components/ui/nav-link";
import {
  ArrowUpRight,
  Lightbulb,
  Maximize2,
} from "lucide-react";
import { href, money } from "@/lib/i18n";
import {
  normalizeStudioDetailContent,
  studioDimensions,
} from "@/data/studio-detail";
import type { Locale, Studio } from "@/types/catalog";

export function StudioCard({
  studio,
  locale,
  index,
  autoRotate = false,
}: {
  studio: Studio;
  locale: Locale;
  index?: number;
  autoRotate?: boolean;
}) {
  const detailHref = href(locale, `/studios/${studio.slug}`);
  const description = studio.description[locale];
  const dimensions = studioDimensions(studio, locale);
  const card = normalizeStudioDetailContent(
    studio.detail_content,
    studio.led_count,
  ).card;

  return (
    <article className="studio-card studio-card-v2">
      <Link href={detailHref} className="room-visual studio-card-media">
        <StudioCardAutoImages
          images={studio.images}
          slug={studio.slug}
          autoRotate={autoRotate}
          priority={(index ?? 99) <= 2}
          alt={
            studio.images.length
              ? studio.name
              : locale === "vi"
                ? "Minh họa không gian chụp ảnh"
                : "Photography space concept"
          }
        />

        <div className="studio-card-media-shade" aria-hidden="true" />

        <div className="studio-card-media-top">
          <span className="studio-card-index">
            {String(index ?? 1).padStart(2, "0")}
          </span>

          {card.show_type && (
            <span className="studio-card-type">
              {card.type_label[locale]}
            </span>
          )}
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
            {card.show_kicker && (
              <p className="studio-card-kicker">
                {card.kicker[locale]}
              </p>
            )}

            <h3>
              <Link href={detailHref}>{studio.name}</Link>
            </h3>
          </div>

          {card.show_availability && (
            <span className="studio-card-availability">
              {card.availability_label[locale]}
            </span>
          )}
        </div>

        {card.show_price && (
          <div className="studio-card-price-inline">
            <strong>{money(studio.price, locale)}</strong>
            <span>{card.price_suffix[locale]}</span>
          </div>
        )}

        {card.show_description && description && (
          <p className="studio-card-description">{description}</p>
        )}

        {(card.show_area ||
          (card.show_dimensions && dimensions) ||
          (card.show_extra_fact && card.extra_fact[locale])) && (
          <div
            className="studio-card-facts"
            aria-label={
              locale === "vi" ? "Thông tin phòng" : "Room details"
            }
          >
            {card.show_area && (
              <span>
                <Maximize2 size={17} aria-hidden="true" />
                <strong>{studio.area}</strong> m²
              </span>
            )}

            {card.show_dimensions && dimensions && (
              <span className="studio-card-dimensions">
                <Maximize2 size={17} aria-hidden="true" />
                {dimensions}
              </span>
            )}

            {card.show_extra_fact && card.extra_fact[locale] && (
              <span>
                <Lightbulb size={18} aria-hidden="true" />
                {card.extra_fact[locale]}
              </span>
            )}
          </div>
        )}

        {card.show_cta && (
          <div className="studio-card-footer studio-card-footer-action-only">
            <Link className="studio-explore-button" href={detailHref}>
              <span>{card.cta_label[locale]}</span>
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}
