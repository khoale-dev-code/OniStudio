import { Suspense } from "react";
import PageLoading from "@/components/ui/page-loading";
import { PinterestGallery } from "@/components/catalog/pinterest-gallery";
import { getGalleryPhotos } from "@/lib/gallery-photos";
import { pageMetadata } from "@/lib/metadata";

export function generateMetadata() {
  return pageMetadata(
    { vi: "Hình ảnh thực tế", en: "Real photos" },
    {
      vi: "Thư viện hình ảnh thực tế tại Oni Studio.",
      en: "A visual gallery from Oni Studio.",
    },
    "/gallery",
  );
}

async function Content() {
  const photos = await getGalleryPhotos();

  return (
    <main className="gallery-pinterest-page-v2">
      <section className="gallery-pinterest-section-v2">
        <PinterestGallery photos={photos} />
      </section>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Content />
    </Suspense>
  );
}
