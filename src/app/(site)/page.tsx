import { Suspense } from "react";
import PageLoading from "@/components/ui/page-loading";
import Image from "next/image";
import Link from "@/components/ui/nav-link";
import { Check, Aperture, Sparkles, Coffee } from "lucide-react";
import { Hero } from "@/components/home/hero";
import { SectionHeading } from "@/components/ui/section";
import { StudioCard } from "@/components/catalog/studio-card";
import { EquipmentCard } from "@/components/catalog/equipment-card";
import { ServiceGrid } from "@/components/home/services-section";
import { FAQ } from "@/components/home/faq";
import { GalleryGrid } from "@/components/catalog/gallery-grid";
import { ContactCTA } from "@/components/layout/contact-cta";
import { getCatalog } from "@/lib/catalog";
import { context, href, money } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
export function generateMetadata() {
  return pageMetadata(
    { vi: "Không gian cho sáng tạo", en: "Space for your creativity" },
    {
      vi: "Khám phá ba phòng chụp, thiết bị và bảng giá Oni Studio tại TP. Hồ Chí Minh. Liên hệ trực tiếp để đặt lịch.",
      en: "Explore Oni Studio’s three photography rooms, equipment and prices in Ho Chi Minh City. Contact us to plan your shoot.",
    },
    "/",
  );
}
async function HomeContent() {
  const [{ locale }, { studios, equipment, gallery, categories, galleryCategories }] = await Promise.all([
    context(),
    getCatalog(),
  ]);
  return (
    <>
      <Hero locale={locale} studios={studios} />
      <section className="section container intro-grid">
        <div>
          <p className="eyebrow">01 / HELLO, WE’RE ONI</p>
          <h2>
            {locale === "vi"
              ? "Bạn mang đến ý tưởng. Oni chuẩn bị không gian."
              : "Bring your vision. We’ll make space for it."}
          </h2>
        </div>
        <div>
          <p className="lead">
            {locale === "vi"
              ? "Một nơi để photographer, người mẫu và ê-kíp cùng tạo nên những khung hình mang dấu ấn riêng."
              : "A place for photographers, models and crews to create images with a point of view."}
          </p>
          <p className="muted">
            {locale === "vi"
              ? "Không gian linh hoạt, thiết bị sẵn sàng và sự hỗ trợ từ những bước setup đầu tiên. Tập trung vào sáng tạo, bắt đầu cùng Oni."
              : "Flexible spaces, studio equipment and help with the first lighting setup. Get ready to focus on the creative work."}
          </p>
          <Link className="text-link" href={href(locale, "/about")}>
            {locale === "vi" ? "Câu chuyện của Oni" : "Meet Oni Studio"}
          </Link>
        </div>
      </section>
      <section className="section section-soft">
        <div className="container">
          <SectionHeading
            eyebrow="02 / THE SPACES"
            title={
              locale === "vi"
                ? "Chọn không gian. Kể câu chuyện."
                : "Choose your space. Tell your story."
            }
            description={
              locale === "vi"
                ? "Ba phòng chụp. Linh hoạt theo quy mô và concept của bạn."
                : "Three studios, ready for your concept and crew."
            }
            link={{
              label: locale === "vi" ? "Tất cả không gian" : "All spaces",
              href: href(locale, "/studios"),
            }}
          />
          <div className="studio-grid">
            {studios.map((s) => (
              <StudioCard studio={s} locale={locale} key={s.id} />
            ))}
          </div>
        </div>
      </section>
      <section className="section container">
        <SectionHeading
          eyebrow="03 / YOUR CREATIVE TOOLKIT"
          title={
            locale === "vi"
              ? "Ánh sáng đúng. Khung hình khác."
              : "The right light changes everything."
          }
          description={
            locale === "vi"
              ? "Khám phá thiết bị cho thuê để hoàn thiện setup của bạn."
              : "Explore the equipment that brings your setup together."
          }
          link={{
            label: locale === "vi" ? "Xem thiết bị" : "Explore equipment",
            href: href(locale, "/equipment"),
          }}
        />
        <div className="equipment-grid">
          {equipment
            .filter((e) => e.featured)
            .slice(0, 4)
            .map((e) => (
              <EquipmentCard
                key={e.id}
                item={e}
                categories={categories}
                locale={locale}
              />
            ))}
        </div>
      </section>
      <section className="section section-navy">
        <div className="container">
          <SectionHeading
            eyebrow="04 / WHAT WE DO"
            title={
              locale === "vi" ? "Hơn cả một phòng chụp." : "More than a studio."
            }
          />
          <ServiceGrid locale={locale} />
        </div>
      </section>
      <section className="section container">
        <SectionHeading
          eyebrow="05 / SIMPLE, CLEAR PRICING"
          title={
            locale === "vi"
              ? "Một buổi chụp, bắt đầu từ đây."
              : "Your next shoot starts here."
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
        <div className="pricing-grid">
          {studios.map((s, i) => (
            <article
              key={s.id}
              className={`price-card ${i === 2 ? "price-featured" : ""}`}
            >
              <p className="eyebrow">
                {s.name} · {s.area} M²
              </p>
              <h3>
                {money(s.price, locale)}
                <span> / {locale === "vi" ? "giờ" : "hour"}</span>
              </h3>
              <ul>
                <li>
                  <Check />
                  {locale === "vi"
                    ? `Tối đa ${s.capacity} người`
                    : `Up to ${s.capacity} people`}
                </li>
                <li>
                  <Check />
                  {locale === "vi"
                    ? "Đèn flash studio miễn phí"
                    : "Studio flashes included"}
                </li>
                <li>
                  <Check />
                  {s.led_count} × Nanlite 300B
                </li>
                <li>
                  <Check />
                  {locale === "vi"
                    ? "Hỗ trợ setup ánh sáng"
                    : "Lighting setup support"}
                </li>
              </ul>
              <Link
                className={`button ${i === 2 ? "button-cream" : "button-outline"}`}
                href={href(locale, `/studios/${s.slug}`)}
              >
                {locale === "vi" ? "Xem phòng" : "View room"}
              </Link>
            </article>
          ))}
        </div>
      </section>
      <section className="section section-soft">
        <div className="container">
          <SectionHeading
            eyebrow="06 / THROUGH THE LENS"
            title={
              locale === "vi"
                ? "Mỗi khung hình, một góc nhìn."
                : "Every frame, a new perspective."
            }
          />
          <GalleryGrid
            items={gallery.slice(0, 6)}
            categories={galleryCategories}
            locale={locale}
          />
        </div>
      </section>
      <section className="section container why-grid">
        <div className="brand-panel">
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
          />
          {[
            {
              Icon: Aperture,
              title:
                locale === "vi" ? "Không gian linh hoạt" : "Flexible spaces",
              text:
                locale === "vi"
                  ? "Diện tích 80–160m² cho ê-kíp từ nhỏ đến lớn."
                  : "80–160m² spaces for different crew sizes.",
            },
            {
              Icon: Sparkles,
              title: locale === "vi" ? "Cùng bạn setup" : "Ready to set up",
              text:
                locale === "vi"
                  ? "Hỗ trợ ánh sáng theo layout mẫu và thiết bị kèm phòng."
                  : "Reference lighting setup support and included equipment.",
            },
            {
              Icon: Coffee,
              title:
                locale === "vi" ? "Chuẩn bị thoải mái" : "Prepare comfortably",
              text:
                locale === "vi"
                  ? "Khu makeup chung và mini canteen cho buổi chụp."
                  : "A shared makeup area and mini canteen for your session.",
            },
          ].map((x) => (
            <div className="why-item" key={x.title}>
              <x.Icon size={23} />
              <div>
                <h3>{x.title}</h3>
                <p>{x.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="section section-soft">
        <div className="container faq-grid">
          <SectionHeading
            eyebrow="08 / GOOD TO KNOW"
            title={
              locale === "vi" ? "Trước khi đến Oni." : "Before your visit."
            }
          />
          <FAQ locale={locale} />
        </div>
      </section>
      <ContactCTA locale={locale} />
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<PageLoading />}>
      <HomeContent />
    </Suspense>
  );
}