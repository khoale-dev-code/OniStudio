import Image from "next/image";
import Link from "@/components/ui/nav-link";
import {
  ArrowRight,
  ArrowUpRight,
  Aperture,
  Camera,
  CheckCircle2,
} from "lucide-react";
import { href, money } from "@/lib/i18n";
import type { Locale, Studio } from "@/types/catalog";

export function Hero({
  locale,
  studios,
}: {
  locale: Locale;
  studios: Studio[];
}) {
  const vi = locale === "vi";
  const areas = studios.map((studio) => studio.area);
  const minArea = areas.length ? Math.min(...areas) : null;
  const maxArea = areas.length ? Math.max(...areas) : null;
  const minPrice = studios.length
    ? Math.min(...studios.map((studio) => studio.price))
    : null;
  const featuredStudio = studios.find((studio) => studio.images.length) ?? studios[0];
  const photo = featuredStudio?.images[0] || "/images/studio-concept.webp";

  return (
    <section className="home-hero-v2">
      <div className="home-hero-v2-bg" aria-hidden="true" />

      <div className="container home-hero-v2-inner">
        <div className="home-hero-v2-copy">
          <div className="home-hero-v2-badge">
            <Camera size={15} />
            <span>ONI STUDIO · SAIGON</span>
          </div>

          <h1>
            {vi ? (
              <>
                Không gian mở.
                <br />
                <span>Cảm hứng riêng.</span>
              </>
            ) : (
              <>
                Space to create.
                <br />
                <span>Room to be you.</span>
              </>
            )}
          </h1>

          <p className="home-hero-v2-lead">
            {vi
              ? "Không gian studio cho photographer, model và ekip cần một workflow gọn: xem phòng, chọn thiết bị, dự trù chi phí và liên hệ trực tiếp để chốt lịch."
              : "A studio experience for photographers, talents and crews who want a cleaner workflow: browse the room, pick gear, estimate costs and contact Oni directly."}
          </p>

          <div className="home-hero-v2-actions">
            <Link
              className="button button-accent"
              href={href(locale, "/studios")}
            >
              {vi ? "Khám phá không gian" : "Explore the spaces"}
              <ArrowRight size={17} />
            </Link>

            <Link
              className="button button-outline home-hero-secondary"
              href={href(locale, "/pricing")}
            >
              {vi ? "Xem bảng giá" : "View pricing"}
            </Link>
          </div>

          <div className="home-hero-v2-points">
            <span>
              <CheckCircle2 size={16} />
              {vi ? "Giá rõ ràng" : "Clear pricing"}
            </span>
            <span>
              <CheckCircle2 size={16} />
              {vi ? "Thiết bị dễ chọn" : "Easy gear selection"}
            </span>
            <span>
              <CheckCircle2 size={16} />
              {vi ? "Liên hệ trực tiếp" : "Direct contact"}
            </span>
          </div>
        </div>

        <div className="home-hero-v2-showcase">
          <div className="home-hero-v2-photo">
            <Image
              src={photo}
              alt={
                vi
                  ? "Không gian phòng chụp Oni Studio"
                  : "Oni Studio photography space"
              }
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 48vw"
            />

            <div className="home-hero-v2-photo-top">
              <span>
                <Aperture size={16} />
                {vi ? "Studio chụp ảnh" : "Photo studio"}
              </span>
              {featuredStudio && (
                <span>{featuredStudio.name}</span>
              )}
            </div>

            <div className="home-hero-v2-photo-bottom">
              <div>
                <small>{vi ? "Giá từ" : "From"}</small>
                <strong>
                  {minPrice === null ? "—" : money(minPrice, locale)}
                </strong>
                <span>/ {vi ? "giờ" : "hour"}</span>
              </div>

              <Link
                className="home-hero-v2-round-link"
                href={href(locale, "/studios")}
                aria-label={vi ? "Xem các phòng studio" : "View studios"}
              >
                <ArrowUpRight size={22} />
              </Link>
            </div>
          </div>

          <div className="home-hero-v2-stats">
            <div>
              <strong>{String(studios.length).padStart(2, "0")}</strong>
              <span>{vi ? "phòng studio" : "studio spaces"}</span>
            </div>
            <div>
              <strong>
                {minArea === null
                  ? "—"
                  : minArea === maxArea
                    ? `${minArea}m²`
                    : `${minArea}–${maxArea}m²`}
              </strong>
              <span>{vi ? "diện tích linh hoạt" : "flexible area"}</span>
            </div>
            <div>
              <strong>VAT</strong>
              <span>{vi ? "đã gồm trong giá phòng" : "included in room rate"}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
