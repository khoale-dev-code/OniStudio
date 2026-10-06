import { Suspense } from "react";
import PageLoading from "@/components/ui/page-loading";
import { PageHeading } from "@/components/ui/section";
import { EquipmentExplorer } from "@/components/catalog/equipment-explorer";
import { getCatalog } from "@/lib/catalog";
import { context } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";

export function generateMetadata() {
  return pageMetadata(
    { vi: "Thiết bị cho thuê", en: "Equipment rental" },
    {
      vi: "Thiết bị tại Oni và thiết bị thuê ngoài cho buổi chụp, sản xuất và set ánh sáng.",
      en: "Equipment at Oni plus external rental options for shoots and productions.",
    },
    "/equipment",
  );
}

async function Content() {
  const [{ locale }, { equipment, categories }] = await Promise.all([
    context(),
    getCatalog(),
  ]);

  return (
    <>
      <PageHeading
        eyebrow="EQUIPMENT RENTAL"
        title={
          locale === "vi"
            ? "Thiết bị cho thuê."
            : "Equipment for your set."
        }
        description={
          locale === "vi"
            ? " "
            : " "
        }
      />

      <section className="container section-bottom">
        <EquipmentExplorer
          items={equipment}
          categories={categories}
          locale={locale}
        />
      </section>
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Content />
    </Suspense>
  );
}
