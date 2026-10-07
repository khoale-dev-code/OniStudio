import { RentalPinterestViewer } from "@/components/catalog/rental-pinterest-viewer";
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

  return (
    <RentalPinterestViewer
      images={images}
      locale={locale}
      collectionHref={href(locale, "/equipment")}
    />
  );
}
