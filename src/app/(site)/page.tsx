import { Suspense } from "react";
import Image from "next/image";
import { Check, ArrowUpRight, Aperture, Sparkles, Coffee } from "lucide-react";
import PageLoading from "@/components/ui/page-loading";
import Link from "@/components/ui/nav-link";
import { Hero } from "@/components/home/hero";
import { SectionHeading } from "@/components/ui/section";
import { StudioCard } from "@/components/catalog/studio-card";
import { EquipmentCard } from "@/components/catalog/equipment-card";
import { ServiceGrid } from "@/components/home/services-section";
import { FAQ } from "@/components/home/faq";
import { GalleryGrid } from "@/components/catalog/gallery-grid";

import { getCatalog } from "@/lib/catalog";
import { context, href, money } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";

export function generateMetadata() {
  return pageMetadata(
    { vi: "Không gian cho sáng tạo", en: "Space for your creativity" },
    {
      vi: "Khám phá không gian studio, thiết bị, bảng giá và các dự án hình ảnh tại Oni Studio. Liên hệ trực tiếp để trao đổi lịch chụp.",
      en: "Explore Oni Studio spaces, equipment, pricing and visual projects. Contact us directly to plan your shoot.",
    },
    "/",
  );
}

async function HomeContent() {
  const [
    { locale },
    { studios, equipment, gallery, categories, galleryCategories },
  ] = await Promise.all([context(), getCatalog()]);

  const featuredEquipment = equipment
    .filter((item) => item.featured)
    .slice(0, 4);

  return (
    <div className="home-redesign-v2">
      <Hero locale={locale} studios={studios} />

      <section className="home-intro section container">
        <div className="home-intro-heading">
          <p className="eyebrow">01 / HELLO, WE’RE ONI</p>
          <h2>
            {locale === "vi"
              ? "Bạn mang ý tưởng. Oni chuẩn bị phần còn lại."
              : "Bring the idea. Oni prepares the rest."}
          </h2>
        </div>

        <div className="home-intro-copy">
          <p className="lead">
            {locale === "vi"
              ? "Một hành trình gọn hơn cho photographer, model và ê-kíp: xem phòng, chọn thiết bị, dự trù chi phí rồi nhắn Oni khi đã sẵn sàng."
              : "A cleaner journey for photographers, talents and crews: browse rooms, select gear, estimate costs and message Oni when ready."}
          </p>
          <p className="muted">
            {locale === "vi"
              ? "Không gian linh hoạt, thông tin minh bạch và giao diện được ưu tiên cho cả desktop lẫn thao tác vuốt trên mobile."
              : "Flexible spaces, transparent information and an interface designed for both desktop viewing and natural mobile swiping."}
          </p>
          <Link className="home-inline-link" href={href(locale, "/about")}>
            {locale === "vi" ? "Khám phá câu chuyện Oni" : "Discover Oni Studio"}
            <ArrowUpRight size={17} />
          </Link>
        </div>

        <div className="home-intro-metrics">
          <div>
            <strong>{String(studios.length).padStart(2, "0")}</strong>
            <span>{locale === "vi" ? "không gian studio" : "studio spaces"}</span>
          </div>
          <div>
            <strong>{featuredEquipment.length || equipment.length}</strong>
            <span>{locale === "vi" ? "thiết bị nổi bật" : "featured equipment"}</span>
          </div>
          <div>
            <strong>{gallery.length}</strong>
            <span>{locale === "vi" ? "dự án hình ảnh" : "visual projects"}</span>
          </div>
        </div>
      </section>

      <section className="home-spaces section section-soft">
        <div className="container">
          <SectionHeading
            eyebrow="02 / THE SPACES"
            title={
              locale === "vi"
                ? "Chọn không gian. Bắt đầu câu chuyện."
                : "Choose the space. Start the story."
            }
            description={
              locale === "vi"
                ? "Mỗi phòng được trình bày rõ hình ảnh, diện tích, sức chứa và giá để bạn quyết định nhanh hơn."
                : "Each room shows visuals, area, capacity and pricing up front so you can decide faster."
            }
            link={{
              label: locale === "vi" ? "Tất cả không gian" : "All spaces",
              href: href(locale, "/studios"),
            }}
          />

          <div className="home-swipe-hint">
            {locale === "vi" ? "Vuốt để xem thêm trên mobile" : "Swipe for more on mobile"}
          </div>

          <div className="studio-grid home-horizontal-scroll">
            {studios.map((studio, index) => (
              <StudioCard
                studio={studio}
                locale={locale}
                index={index + 1}
                key={studio.id}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="home-equipment section container">
        <SectionHeading
          eyebrow="03 / YOUR CREATIVE TOOLKIT"
          title={
            locale === "vi"
              ? "Thiết bị đúng. Setup gọn hơn."
              : "The right gear. A cleaner setup."
          }
          description={
            locale === "vi"
              ? "Những thiết bị nổi bật được ưu tiên hiển thị lớn, dễ quét nhanh và dễ chạm trên màn hình nhỏ."
              : "Featured equipment is presented with larger visuals, faster scanning and comfortable touch targets."
          }
          link={{
            label: locale === "vi" ? "Xem toàn bộ thiết bị" : "Browse all equipment",
            href: href(locale, "/equipment"),
          }}
        />

        <div className="equipment-grid home-horizontal-scroll">
          {featuredEquipment.map((item) => (
            <EquipmentCard
              key={item.id}
              item={item}
              allEquipment={equipment}
              categories={categories}
              locale={locale}
            />
          ))}
        </div>
      </section>

      <section className="home-services section section-navy">
        <div className="container">
          <SectionHeading
            eyebrow="04 / WHAT WE DO"
            title={
              locale === "vi"
                ? "Hơn cả một phòng chụp."
                : "More than a studio room."
            }
            description={
              locale === "vi"
                ? "Từ phòng chụp đến ánh sáng và production support, Oni giúp ekip bớt phải ghép nhiều đầu việc rời rạc."
                : "From studio space to lighting and production support, Oni helps reduce fragmented prep work."
            }
          />
          <ServiceGrid locale={locale} />
        </div>
      </section>

      <section className="home-pricing section container">
        <SectionHeading
          eyebrow="05 / SIMPLE, CLEAR PRICING"
          title={
            locale === "vi"
              ? "Chi phí rõ ngay từ đầu."
              : "Clear costs from the start."
          }
          description={
            locale === "vi"
              ? "Giá phòng đã bao gồm VAT. Thời gian đặt tối thiểu 2 giờ."
              : "Room prices include VAT. Minimum booking: 2 hours."
          }
          link={{
            label: locale === "vi" ? "Bảng giá chi tiết" : "Full price list",
            href: href(locale, "/pricing"),
          }}
        />

        <div className="pricing-grid home-pricing-grid">
          {studios.map((studio, index) => (
            <article
              key={studio.id}
              className={`price-card home-price-card ${
                index === 0 ? "home-price-card-featured" : ""
              }`}
            >
              <div className="home-price-top">
                <div>
                  <p className="eyebrow">{studio.name}</p>
                  <h3>
                    {money(studio.price, locale)}
                    <span> / {locale === "vi" ? "giờ" : "hour"}</span>
                  </h3>
                </div>
                <span className="home-price-area">{studio.area}m²</span>
              </div>

              <ul>
                <li>
                  <Check />
                  {locale === "vi"
                    ? `Tối đa ${studio.capacity} người`
                    : `Up to ${studio.capacity} people`}
                </li>
                <li>
                  <Check />
                  {locale === "vi"
                    ? "Đèn flash studio miễn phí"
                    : "Studio flashes included"}
                </li>
                <li>
                  <Check />
                  {studio.led_count} × Nanlite 300B
                </li>
                <li>
                  <Check />
                  {locale === "vi"
                    ? "Hỗ trợ setup ánh sáng"
                    : "Lighting setup support"}
                </li>
              </ul>

              <Link
                className="home-price-link"
                href={href(locale, `/studios/${studio.slug}`)}
              >
                {locale === "vi" ? "Xem chi tiết phòng" : "View room details"}
                <ArrowUpRight size={17} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="home-gallery section section-soft">
        <div className="container">
          <SectionHeading
            eyebrow="06 / THROUGH THE LENS"
            title={
              locale === "vi"
                ? "Mỗi khung hình, một góc nhìn."
                : "Every frame, a new perspective."
            }
            description={
              locale === "vi"
                ? "Các project nổi bật được đưa lên homepage như một phần portfolio — ảnh lớn hơn và dễ mở album hơn."
                : "Selected projects appear as a portfolio preview with larger visuals and easier album access."
            }
            link={{
              label: locale === "vi" ? "Mở thư viện" : "Open gallery",
              href: href(locale, "/gallery"),
            }}
          />

          <GalleryGrid
            items={gallery.slice(0, 6)}
            categories={galleryCategories}
            locale={locale}
          />
        </div>
      </section>

      <section className="home-why section container why-grid">
        <div className="brand-panel home-brand-panel">
          <div className="home-brand-glow" aria-hidden="true" />
          <Image
            src="/images/oni-logo.png"
            width={270}
            height={270}
            alt="Logo Oni Studio"
          />
          <span>YOUR SPACE TO CREATE.</span>
        </div>

        <div>
          <SectionHeading
            eyebrow="07 / THE ONI WAY"
            title={
              locale === "vi"
                ? "Để bạn tập trung vào sáng tạo."
                : "More room for creativity."
            }
            description={
              locale === "vi"
                ? "Những gì cần biết đều được đưa ra đúng lúc, giúp ekip giảm thời gian hỏi đi hỏi lại trước buổi chụp."
                : "The information you need appears at the right moment, reducing back-and-forth before the shoot."
            }
          />

          {[
            {
              Icon: Aperture,
              title:
                locale === "vi" ? "Không gian linh hoạt" : "Flexible spaces",
              text:
                locale === "vi"
                  ? "Diện tích và sức chứa được trình bày rõ để chọn phòng nhanh hơn."
                  : "Area and capacity stay visible so choosing the room takes less time.",
            },
            {
              Icon: Sparkles,
              title:
                locale === "vi" ? "Hỗ trợ setup" : "Setup support",
              text:
                locale === "vi"
                  ? "Thiết bị đi kèm và phương án ánh sáng được mô tả rõ trước khi liên hệ."
                  : "Included equipment and lighting support are clear before you contact us.",
            },
            {
              Icon: Coffee,
              title:
                locale === "vi" ? "Chuẩn bị thoải mái" : "Prepare comfortably",
              text:
                locale === "vi"
                  ? "Khu makeup và tiện ích hỗ trợ ekip trong suốt buổi làm việc."
                  : "Makeup and support amenities help the crew throughout the session.",
            },
          ].map((item, index) => (
            <div className="why-item home-why-item" key={item.title}>
              <span className="home-why-index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <item.Icon size={22} />
              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="home-faq section section-soft">
        <div className="container faq-grid">
          <SectionHeading
            eyebrow="08 / GOOD TO KNOW"
            title={
              locale === "vi"
                ? "Trước khi đến Oni."
                : "Before your visit."
            }
            description={
              locale === "vi"
                ? "Các câu hỏi quan trọng được gom gọn để khách có thể đọc nhanh trước khi nhắn tin."
                : "The most useful questions stay compact so visitors can scan them before reaching out."
            }
          />
          <FAQ locale={locale} />
        </div>
      </section>

      
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<PageLoading />}>
      <HomeContent />
    </Suspense>
  );
}
