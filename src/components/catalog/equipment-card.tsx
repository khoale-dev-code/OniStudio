import Link from "@/components/ui/nav-link";
import Image from "next/image";
import {
  Aperture,
  Lightbulb,
  Scan,
  SlidersHorizontal,
  Layers,
} from "lucide-react";
import { statusLabels } from "@/data/site";
import {
  categoryLabel,
  inventoryAvailabilityLabel,
} from "@/lib/equipment";
import { href, formatMoney } from "@/lib/links";
import { equipmentImages } from "@/data/equipment-images";
import type {
  Equipment,
  EquipmentCategory,
  Locale,
} from "@/types/catalog";

const icons = {
  continuous: Lightbulb,
  flash: Aperture,
  modifier: Scan,
  support: SlidersHorizontal,
  backdrop: Layers,
};

export function EquipmentCard({
  item,
  categories,
  locale,
}: {
  item: Equipment;
  categories: EquipmentCategory[];
  locale: Locale;
}) {
  const Icon =
    icons[item.category as keyof typeof icons] || SlidersHorizontal;
  const { images, reference } = equipmentImages(item);
  const cover = images[0];
  const name = locale === "en" ? item.name_en : item.name;
  const category = categoryLabel(categories, item.category, locale);
  const inventoryLabel = inventoryAvailabilityLabel(item.inventory, locale);

  return (
    <article className="equipment-card">
      <Link
        className="equipment-image"
        href={href(locale, `/equipment/${item.slug}`)}
      >
        {cover ? (
          <Image
            src={cover}
            alt={name}
            fill
            sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="equipment-placeholder">
            <Icon size={54} strokeWidth={1} />
            <span>{category}</span>
          </div>
        )}
        {reference && (
          <span className="equipment-reference">
            {locale === "vi"
              ? "Ảnh sản phẩm từ hãng"
              : "Manufacturer reference"}
          </span>
        )}
        <span className="equipment-tag">
          {item.included
            ? locale === "vi"
              ? "Kèm phòng"
              : "Included"
            : category}
        </span>
      </Link>

      <div className="card-body">
        <p className="small muted">
          {inventoryLabel || statusLabels[item.status][locale]}
        </p>
        <h3>
          <Link href={href(locale, `/equipment/${item.slug}`)}>{name}</Link>
        </h3>
        <p className="equipment-price">
          {item.included ? (
            locale === "vi" ? (
              "Miễn phí khi thuê phòng"
            ) : (
              "Included with room"
            )
          ) : item.price !== null ? (
            <>
              <strong>{formatMoney(item.price, locale)}</strong>
              <span> / {item.unit[locale]}</span>
            </>
          ) : locale === "vi" ? (
            "Liên hệ báo giá"
          ) : (
            "Contact for a quote"
          )}
        </p>
      </div>
    </article>
  );
}
