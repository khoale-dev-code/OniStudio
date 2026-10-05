import type {
  EquipmentCategory,
  EquipmentUnit,
  Locale,
} from "@/types/catalog";

export function categoryLabel(
  categories: EquipmentCategory[],
  slug: string,
  locale: Locale,
) {
  const match = categories.find((category) => category.slug === slug);
  return match?.name[locale] || slug;
}

export function inventorySummary(units: EquipmentUnit[] | undefined) {
  const summary = {
    total: 0,
    available: 0,
    rented: 0,
    maintenance: 0,
    unavailable: 0,
  };

  for (const unit of units || []) {
    summary.total += 1;
    summary[unit.status] += 1;
  }

  return summary;
}

export function inventoryAvailabilityLabel(
  units: EquipmentUnit[] | undefined,
  locale: Locale,
) {
  const summary = inventorySummary(units);
  if (!summary.total) return null;

  if (summary.available > 0) {
    return locale === "vi"
      ? `${summary.available}/${summary.total} sẵn sàng`
      : `${summary.available}/${summary.total} available`;
  }

  if (summary.rented > 0) {
    return locale === "vi"
      ? `${summary.rented}/${summary.total} đang cho thuê`
      : `${summary.rented}/${summary.total} rented`;
  }

  if (summary.maintenance === summary.total) {
    return locale === "vi" ? "Tất cả đang bảo trì" : "All under maintenance";
  }

  return locale === "vi" ? "Tạm chưa sẵn sàng" : "Temporarily unavailable";
}
