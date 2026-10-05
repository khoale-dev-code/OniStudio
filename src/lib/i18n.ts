import { headers } from "next/headers";
import type { Locale, Localized } from "@/types/catalog";
export function tr(value: Localized, locale: Locale) {
  return value[locale];
}
export { href } from "./links";
export async function context() {
  const h = await headers();
  return {
    locale: (h.get("x-oni-locale") === "en" ? "en" : "vi") as Locale,
    path: h.get("x-oni-path") || "/",
  };
}
export { formatMoney as money } from "./links";
