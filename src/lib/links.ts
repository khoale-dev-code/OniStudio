import type { Locale } from "@/types/catalog";

export function href(locale: Locale, path = "/") {
  return locale === "en" ? `/en${path === "/" ? "" : path}` : path;
}

export function formatMoney(value: number, locale: Locale = "vi") {
  const formatted = new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
    maximumFractionDigits: 0,
  }).format(value);
  return `${formatted} ${locale === "vi" ? "VNĐ" : "VND"}`;
}
