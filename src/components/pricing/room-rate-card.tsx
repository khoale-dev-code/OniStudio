import {
  Aperture,
  ArrowUpRight,
  Check,
  Maximize2,
} from "lucide-react";
import Link from "@/components/ui/nav-link";
import { href, formatMoney } from "@/lib/links";
import { normalizeStudioDetailContent, studioDimensions } from "@/data/studio-detail";
import type { Locale, Studio } from "@/types/catalog";

export function RoomRateCard({
  studio,
  locale,
  spacious,
}: {
  studio: Studio;
  locale: Locale;
  spacious: boolean;
}) {
  const vi = locale === "vi";
  const dimensions = studioDimensions(studio, locale);
  const detail = normalizeStudioDetailContent(studio.detail_content);

  return (
    <article className={`rate-room${spacious ? " rate-room-featured" : ""}`}>
      <div className="rate-room-top">
        <span className="rate-room-symbol" aria-hidden="true">
          <Aperture size={26} strokeWidth={1.4} />
        </span>
        <span className="rate-room-tag">
          {spacious
            ? vi
              ? "Thêm không gian sáng tạo"
              : "More space to create"
            : "ONI / STUDIO"}
        </span>
      </div>

      <h3>{studio.name}</h3>

      <div className="rate-room-specs">
        <span>
          <Maximize2 size={16} />
          {studio.area} m²
        </span>

        {dimensions && (
          <span>
            <Maximize2 size={16} />
            {dimensions}
          </span>
        )}
      </div>

      <p className="rate-room-price">
        <strong>{formatMoney(studio.price, locale)}</strong>
        <span>/ {vi ? "giờ" : "hour"}</span>
      </p>

      <p className="rate-room-tax">
        {vi ? "Đã gồm VAT · " : "VAT included · "}
        {detail.minimum_booking[locale]}
      </p>

      <ul className="rate-room-inclusions">
        <li>
          <Check size={16} />
          <span>{studio.led_count} × Nanlite 300B</span>
        </li>
        <li>
          <Check size={16} />
          <span>
            {vi ? "Đèn flash studio đi kèm" : "Studio flashes included"}
          </span>
        </li>
        <li>
          <Check size={16} />
          <span>
            {vi
              ? "Hỗ trợ makeup trước 1 giờ ở khu chung"
              : "1 hour of early makeup in the shared area"}
          </span>
        </li>
      </ul>

      <Link
        className="button rate-room-button"
        href={href(locale, `/studios/${studio.slug}`)}
        aria-label={vi ? `Khám phá ${studio.name}` : `Explore ${studio.name}`}
      >
        {vi ? "Khám phá phòng" : "Explore room"}
        <ArrowUpRight size={19} />
      </Link>
    </article>
  );
}
