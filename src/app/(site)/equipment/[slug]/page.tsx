import Link from "@/components/ui/nav-link";
import { ProductGallery } from "@/components/catalog/product-gallery";
import { equipmentImages } from "@/data/equipment-images";
import { getCatalog } from "@/lib/catalog";
import { context, href } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const item = (await getCatalog()).equipment.find(
    (entry) => entry.slug === slug,
  );

  return pageMetadata(
    {
      vi: item?.name || "Không tìm thấy thiết bị",
      en: item?.name_en || "Equipment not found",
    },
    item?.description || {
      vi: "Hình ảnh thiết bị Oni Studio",
      en: "Oni Studio equipment images",
    },
    `/equipment/${slug}`,
  );
}

export default async function EquipmentDetail({ params }: Props) {
  const [{ slug }, { locale }, { equipment }] = await Promise.all([
    params,
    context(),
    getCatalog(),
  ]);

  const item = equipment.find((entry) => entry.slug === slug);
  if (!item) notFound();

  const { images } = equipmentImages(item);
  if (!images.length) notFound();

  const name = locale === "en" ? item.name_en : item.name;

  return (
    <div className="equipment-gallery-only">
      <div className="container equipment-gallery-nav">
        <Link className="text-link" href={href(locale, "/equipment")}>
          {locale === "vi" ? "← Quay lại thiết bị" : "← Back to equipment"}
        </Link>
        <span>
          {images.length} {locale === "vi" ? "ảnh" : "images"}
        </span>
      </div>

      <section
        className="container equipment-gallery-shell"
        aria-label={
          locale === "vi"
            ? `Hình ảnh ${name}`
            : `${name} images`
        }
      >
        <ProductGallery
          images={images}
          name={name}
          locale={locale}
          fit="contain"
        />
      </section>
    </div>
  );
}
