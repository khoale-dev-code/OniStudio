import { equipmentImages } from "@/data/equipment-images";
import { ProductGallery } from "@/components/catalog/product-gallery";
import Link from "@/components/ui/nav-link";
import { Aperture } from "lucide-react";
import { notFound } from "next/navigation";
import { getCatalog } from "@/lib/catalog";
import { context, href, money } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import {
  categoryLabel,
  inventoryAvailabilityLabel,
  inventorySummary,
} from "@/lib/equipment";
import { inventoryStatusLabels, statusLabels } from "@/data/site";
import { ContactActions } from "@/components/ui/contact-actions";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const e = (await getCatalog()).equipment.find((item) => item.slug === slug);
  return pageMetadata(
    {
      vi: e?.name || "Không tìm thấy thiết bị",
      en: e?.name_en || "Equipment not found",
    },
    e?.description || { vi: "Thiết bị Oni Studio", en: "Oni equipment" },
    `/equipment/${slug}`,
  );
}

export default async function EquipmentDetail({ params }: Props) {
  const [{ slug }, { locale }, { equipment, categories }] = await Promise.all([
    params,
    context(),
    getCatalog(),
  ]);
  const e = equipment.find((item) => item.slug === slug);
  if (!e) notFound();

  const { images, reference } = equipmentImages(e);
  const name = locale === "en" ? e.name_en : e.name;
  const category = categoryLabel(categories, e.category, locale);
  const inventory = inventorySummary(e.inventory);
  const inventoryLabel = inventoryAvailabilityLabel(e.inventory, locale);

  return (
    <div className="container detail-page">
      <Link className="text-link" href={href(locale, "/equipment")}>
        {locale === "vi" ? "Tất cả thiết bị" : "All equipment"}
      </Link>

      <div className="product-detail">
        {images.length ? (
          <ProductGallery
            images={images}
            name={name}
            locale={locale}
            caption={
              reference
                ? locale === "vi"
                  ? "Ảnh sản phẩm từ hãng · Xác nhận bộ phụ kiện với Oni"
                  : "Manufacturer reference · Confirm accessories with Oni"
                : undefined
            }
          />
        ) : (
          <div className="product-image">
            <div className="equipment-placeholder">
              <Aperture size={96} strokeWidth={0.8} />
              <p>
                {locale === "vi"
                  ? "Hình thiết bị đang được cập nhật"
                  : "Equipment photograph coming soon"}
              </p>
            </div>
          </div>
        )}

        <div>
          <p className="eyebrow">{category}</p>
          <h1>{name}</h1>
          <p className="pill status-pill">
            {inventoryLabel || statusLabels[e.status][locale]}
          </p>
          <p className="lead">{e.description[locale]}</p>

          {inventory.total > 0 && (
            <div className="public-inventory-summary">
              <div>
                <strong>{inventory.total}</strong>
                <span>{locale === "vi" ? "Tổng số" : "Total"}</span>
              </div>
              <div>
                <strong>{inventory.available}</strong>
                <span>{inventoryStatusLabels.available[locale]}</span>
              </div>
              <div>
                <strong>{inventory.rented}</strong>
                <span>{inventoryStatusLabels.rented[locale]}</span>
              </div>
              <div>
                <strong>{inventory.maintenance}</strong>
                <span>{inventoryStatusLabels.maintenance[locale]}</span>
              </div>
            </div>
          )}

          <p className="product-price">
            {e.included ? (
              locale === "vi" ? (
                "Miễn phí khi thuê phòng"
              ) : (
                "Included with room rental"
              )
            ) : e.price !== null ? (
              <>
                {money(e.price, locale)} <span>/ {e.unit[locale]}</span>
              </>
            ) : locale === "vi" ? (
              "Liên hệ báo giá"
            ) : (
              "Ask for a quote"
            )}
          </p>

          <p className="small muted">
            {locale === "vi"
              ? "Giá và tình trạng được cập nhật theo tồn kho. Vui lòng xác nhận lịch thuê trực tiếp với Oni."
              : "Price and availability follow current inventory. Please confirm the rental schedule directly with Oni."}
          </p>

          <ContactActions locale={locale} />

          <div className="specifications">
            <h2>
              {locale === "vi"
                ? "Thông số & cấu hình"
                : "Specifications & configuration"}
            </h2>
            <p>{e.specifications[locale]}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
