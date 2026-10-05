import type { Metadata } from "next";
import { context, href } from "./i18n";
import type { Localized } from "@/types/catalog";
export async function pageMetadata(
  title: Localized,
  description: Localized,
  path: string,
): Promise<Metadata> {
  const { locale } = await context();
  return {
    title: title[locale],
    description: description[locale],
    alternates: {
      canonical: href(locale, path),
      languages: { vi: href("vi", path), en: href("en", path) },
    },
    openGraph: {
      title: `${title[locale]} | Oni Studio`,
      description: description[locale],
      type: "website",
      locale: locale === "vi" ? "vi_VN" : "en_US",
      url: href(locale, path),
    },
  };
}
