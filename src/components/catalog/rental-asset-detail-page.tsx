import Link from "@/components/ui/nav-link";
import { ProductGallery } from "@/components/catalog/product-gallery";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getCatalog } from "@/lib/catalog";
import { context } from "@/lib/i18n";
import { href } from "@/lib/links";
import { pageMetadata } from "@/lib/metadata";
import type {
  Backdrop,
  Locale,
  PropItem,
} from "@/types/catalog";

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

function typeLabel(mode: RentalDetailMode, locale: Locale) {
  if (mode === "prop") return locale === "vi" ? "Đạo cụ" : "Prop";
  if (mode === "effect") {
    return locale === "vi"
      ? "Phông màu hiệu ứng"
      : "Effect backdrop";
  }
  return locale === "vi" ? "Phông màu" : "Color backdrop";
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
  const name = locale === "en" ? item.name_en : item.name;
  const collectionHref = href(locale, backPath(mode));

  return (
    <div className="rental-detail-page">
      <div className="container rental-detail-inner">
        <div className="rental-detail-nav">
          <Link href={collectionHref}>
            <ArrowLeft size={16} aria-hidden="true" />
            <span>
              {locale === "vi"
                ? `Quay lại ${typeLabel(mode, locale).toLocaleLowerCase("vi")}`
                : `Back to ${typeLabel(mode, locale).toLowerCase()}`}
            </span>
          </Link>

          <span>
            {images.length} {locale === "vi" ? "ảnh" : "images"}
          </span>
        </div>

        <div className="rental-detail-heading">
          <span>{typeLabel(mode, locale)}</span>
          <h1>{name}</h1>
        </div>

        {images.length ? (
          <div className="rental-detail-gallery">
            <ProductGallery
              images={images}
              name={name}
              locale={locale}
              fit="contain"
            />
          </div>
        ) : (
          <div className="empty-state rental-detail-empty">
            <h2>
              {locale === "vi"
                ? "Hình ảnh đang được cập nhật"
                : "Images are being updated"}
            </h2>
          </div>
        )}
      </div>
    </div>
  );
}
