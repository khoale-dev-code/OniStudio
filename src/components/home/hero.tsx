import Image from "next/image";
import Link from "@/components/ui/nav-link";
import { ArrowDownRight, ArrowUpRight, Aperture } from "lucide-react";
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
  const min = areas.length ? Math.min(...areas) : null;
  const max = areas.length ? Math.max(...areas) : null;
  const price = studios.length
    ? Math.min(...studios.map((studio) => studio.price))
    : null;
  const photo = studios.find((s) => s.images.length)?.images[0];
  return (
    <section className="hero editorial-hero">
      <div className="container">
        <div className="hero-kicker">
          <span>
            <i /> SAIGON, VIETNAM
          </span>
          <span>PHOTOGRAPHY · FILM · CREATIVE SPACE</span>
        </div>
        <div className="hero-editorial-grid">
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
          <div className="hero-editorial-copy">
            <p>
              {vi
                ? "Bạn mang đến góc nhìn. Oni chuẩn bị không gian, ánh sáng và thiết bị để ý tưởng thành hình."
                : "Bring your perspective. We’ll bring the space, lighting and equipment to make it happen."}
            </p>
            <div className="hero-buttons">
              <Link
                className="button button-accent"
                href={href(locale, "/studios")}
              >
                {vi ? "Khám phá không gian" : "Explore the spaces"}
                <ArrowUpRight size={18} />
              </Link>
              <Link className="text-link" href={href(locale, "/pricing")}>
                {vi ? "Xem bảng giá" : "View pricing"}
              </Link>
            </div>
          </div>
        </div>
        <figure className="hero-editorial-visual">
          <Image
            src={photo || "/images/studio-concept.webp"}
            alt={
              photo
                ? vi
                  ? "Không gian phòng chụp tại Oni Studio"
                  : "A photography space at Oni Studio"
                : vi
                  ? "Ảnh minh họa không gian chụp với phông vô cực"
                  : "Illustrative studio concept with infinity wall"
            }
            fill
            priority
            sizes="(max-width: 1440px) 100vw, 1360px"
          />
          <div className="hero-frame-label">
            <Aperture size={20} />
            <span>ONI / THE CREATIVE SPACE</span>
          </div>
          <figcaption className="hero-caption">
            <span>
              {photo
                ? vi
                  ? "Không gian cho góc nhìn của bạn"
                  : "Space for your perspective"
                : vi
                  ? "Ảnh không gian minh họa"
                  : "Illustrative studio concept"}
            </span>
            <span>01 — ONI STUDIO</span>
          </figcaption>
          <Link
            className="hero-discover"
            href={href(locale, "/studios")}
            aria-label={vi ? "Xem các phòng studio" : "Discover the studios"}
          >
            <ArrowDownRight size={32} />
          </Link>
        </figure>
        <div className="hero-editorial-stats">
          <p>
            {vi
              ? "Một điểm hẹn.\nNhiều cách sáng tạo."
              : "One destination.\nEndless ways to create."}
          </p>
          <div>
            <strong>{String(studios.length).padStart(2, "0")}</strong>
            <span>{vi ? "Phòng chụp linh hoạt" : "Flexible studios"}</span>
          </div>
          <div>
            <strong>
              {min === null ? "—" : min === max ? min : `${min}–${max}`}{" "}
              <small>m²</small>
            </strong>
            <span>{vi ? "Diện tích mỗi phòng" : "Space in each room"}</span>
          </div>
          <div>
            <strong>{price === null ? "—" : money(price, locale)}</strong>
            <span>
              {vi ? "Từ / giờ · đã gồm VAT" : "From / hour · VAT included"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
