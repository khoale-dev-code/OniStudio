import { notFound } from "next/navigation";
import { RentalPinterestViewer } from "@/components/catalog/rental-pinterest-viewer";
import { getCatalog } from "@/lib/catalog";
import { context } from "@/lib/i18n";
import { href } from "@/lib/links";
import { pageMetadata } from "@/lib/metadata";
import type { Backdrop, PropItem } from "@/types/catalog";

type RentalDetailMode = "effect" | "color" | "prop";
type RentalAsset = Backdrop | PropItem;

function getImages(item: RentalAsset) {
  return Array.from(
    new Set(
      [
        ...(item.images || []),
        ...(item.image_url ? [item.image_url] : []),
      ].filter(Boolean),
    ),
  );
}

function findItem(
  catalog: Awaited<ReturnType<typeof getCatalog>>,
  mode: RentalDetailMode,
  slug: string,
) {
  if (mode === "prop") {
    return catalog.props.find(
      (item) => item.slug === slug && item.published,
    );
  }

  return catalog.backdrops.find(
    (item) =>
      item.slug === slug &&
      item.kind === mode &&
      item.published,
  );
}

function backPath(mode: RentalDetailMode) {
  if (mode === "prop") return "/props";
  if (mode === "effect") return "/effect-backdrops";
  return "/backdrops";
}

export async function rentalAssetMetadata({
  mode,
  slug,
}: {
  mode: RentalDetailMode;
  slug: string;
}) {
  const catalog = await getCatalog();
  const item = findItem(catalog, mode, slug);

  return pageMetadata(
    {
      vi: item?.name || "Không tìm thấy sản phẩm",
      en: item?.name_en || "Product not found",
    },
    {
      vi:
        item?.description?.vi ||
        "Hình ảnh sản phẩm tại Oni Studio.",
      en:
        item?.description?.en ||
        "Product images at Oni Studio.",
    },
    `${backPath(mode)}/${slug}`,
  );
}

export async function RentalAssetDetailPage({
  mode,
  slug,
}: {
  mode: RentalDetailMode;
  slug: string;
}) {
  const [{ locale }, catalog] = await Promise.all([
    context(),
    getCatalog(),
  ]);

  const item = findItem(catalog, mode, slug);
  if (!item) notFound();

  const images = getImages(item);

  return (
    <RentalPinterestViewer
      images={images}
      locale={locale}
      collectionHref={href(locale, backPath(mode))}
    />
  );
}
