import { Suspense } from "react";
import PageLoading from "@/components/ui/page-loading";
import { PageHeading } from "@/components/ui/section";
import { GalleryGrid } from "@/components/catalog/gallery-grid";
import { getCatalog } from "@/lib/catalog";
import { context } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";

export function generateMetadata() {
  return pageMetadata(
    { vi: "Thư viện hình ảnh", en: "Gallery" },
    {
      vi: "Thời trang, chân dung, sản phẩm, thương mại và hậu trường tại Oni Studio.",
      en: "Fashion, portraits, products, commercial work and behind the scenes at Oni Studio.",
    },
    "/gallery",
  );
}

async function GalleryContent() {
  const [{ locale }, { gallery, galleryCategories }] = await Promise.all([
    context(),
    getCatalog(),
  ]);

  return (
    <div className="gallery-public-page">
      <PageHeading
        eyebrow="THROUGH THE LENS"
        title={
          locale === "vi"
            ? "Những câu chuyện bằng hình ảnh."
            : "Stories, frame by frame."
        }
        description={
          locale === "vi"
            ? "Một góc nhìn về không gian, con người, photographer và những buổi sáng tạo tại Oni."
            : "A perspective on the space, photographers, people and creative sessions at Oni."
        }
      />
      <section className="container section-bottom gallery-public-section">
        <GalleryGrid
          items={gallery}
          categories={galleryCategories}
          locale={locale}
          variant="page"
        />
      </section>
    </div>
  );
}

export default function Gallery() {
  return (
    <Suspense fallback={<PageLoading />}>
      <GalleryContent />
    </Suspense>
  );
}
