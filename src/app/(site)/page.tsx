import { Suspense } from "react";
import { ArrowUpRight } from "lucide-react";
import PageLoading from "@/components/ui/page-loading";
import { HomeHeroMotion } from "@/components/home/home-hero-motion";
import Link from "@/components/ui/nav-link";
import { StudioCard } from "@/components/catalog/studio-card";
import { EquipmentCard } from "@/components/catalog/equipment-card";
import { getCatalog } from "@/lib/catalog";
import { context, href } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";

export function generateMetadata() {
  return pageMetadata(
    { vi: "Oni Studio — Trang chủ", en: "Oni Studio — Home" },
    {
      vi: "Trang chủ tối giản để xem nhanh không gian chụp, thiết bị nổi bật và đi tới từng trang chi tiết.",
      en: "A minimal homepage to quickly browse studio spaces, featured equipment and dedicated detail pages.",
    },
    "/",
  );
}

async function HomeContent() {
  const [{ locale }, { studios, equipment, categories }] = await Promise.all([
    context(),
    getCatalog(),
  ]);

  const vi = locale === "vi";
  const featuredStudios = studios.slice(0, 2);
  const featuredEquipment = equipment.filter((item) => item.featured).slice(0, 4);
  const equipmentPreview =
    featuredEquipment.length > 0 ? featuredEquipment : equipment.slice(0, 4);
  const maxArea =
    studios.length > 0 ? Math.max(...studios.map((studio) => studio.area)) : null;



  return (
    <div className="home-clean-v3 home-clean-v33">
      <HomeHeroMotion
        locale={locale}
        spacesHref={href(locale, "/studios")}
        equipmentHref={href(locale, "/equipment")}
        studioCount={studios.length}
        equipmentCount={equipment.length}
        maxArea={maxArea}
      />

      <section className="home-clean-v3-section section">
        <div className="container">
          <div className="home-clean-v3-heading-row">
            <div>
              <p className="eyebrow">01 / SPACES</p>
              <h2>{vi ? "Chọn phòng nhanh hơn." : "Pick the right room faster."}</h2>
              <p>
                {vi
                  ? "Hai không gian chính được giới thiệu ngay tại đây. Toàn bộ hình ảnh và thông tin sâu hơn nằm trong trang Không gian."
                  : "The two main spaces are introduced here. Full imagery and deeper information stay on the Spaces page."}
              </p>
            </div>

            <Link
              className="home-clean-v3-text-link"
              href={href(locale, "/studios")}
            >
              {vi ? "Tất cả không gian" : "All spaces"}
              <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="home-clean-v3-card-grid home-clean-v3-card-grid--two">
            {featuredStudios.map((studio) => (
              <StudioCard key={studio.id} studio={studio} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      <section className="home-clean-v3-section section section-soft">
        <div className="container">
          <div className="home-clean-v3-heading-row">
            <div>
              <p className="eyebrow">02 / EQUIPMENT</p>
              <h2>
                {vi
                  ? "Thiết bị nổi bật. Không cần xem quá nhiều."
                  : "Featured equipment. No need to show everything."}
              </h2>
              <p>
                {vi
                  ? "Chỉ giữ vài thiết bị tiêu biểu ở trang chủ để người xem hiểu nhanh dịch vụ mà không bị ngợp."
                  : "Only a small selection appears here so visitors understand the offer without being overwhelmed."}
              </p>
            </div>

            <Link
              className="home-clean-v3-text-link"
              href={href(locale, "/equipment")}
            >
              {vi ? "Mở danh mục thiết bị" : "Open equipment catalog"}
              <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="home-clean-v3-card-grid home-clean-v3-card-grid--four">
            {equipmentPreview.map((item) => (
              <EquipmentCard
                key={item.id}
                item={item}
                categories={categories}
                allEquipment={equipment}
                locale={locale}
              />
            ))}
          </div>
        </div>
      </section>

          </div>
  );
}

function HomeFallback() {
  return <PageLoading />;
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeFallback />}>
      <HomeContent />
    </Suspense>
  );
}
