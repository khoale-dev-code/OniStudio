import { Suspense } from "react";
import PageLoading from "@/components/ui/page-loading";
import { PageHeading } from "@/components/ui/section";
import { EquipmentExplorer } from "@/components/catalog/equipment-explorer";
import { getCatalog } from "@/lib/catalog";
import { context } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
export function generateMetadata() {
  return pageMetadata(
    { vi: "Thiết bị studio", en: "Studio equipment" },
    {
      vi: "Tìm và lọc đèn LED, flash, phông nền và phụ kiện tại Oni Studio.",
      en: "Search and filter continuous lights, flashes, backdrops and accessories at Oni Studio.",
    },
    "/equipment",
  );
}
async function EquipmentContent() {
  const [{ locale }, { equipment, categories }] = await Promise.all([
    context(),
    getCatalog(),
  ]);
  return (
    <>
      <PageHeading
        eyebrow="YOUR CREATIVE TOOLKIT"
        title={
          locale === "vi"
            ? "Thiết bị cho ý tưởng của bạn."
            : "Tools for your next idea."
        }
        description={
          locale === "vi"
            ? "Từ ánh sáng chủ đạo đến những phụ kiện nhỏ. Tìm setup phù hợp và nhắn Oni để kiểm tra lịch."
            : "From your key light to the smallest accessory. Find your setup and ask Oni about availability."
        }
      />
      <section className="container section-bottom">
        <EquipmentExplorer items={equipment} categories={categories} locale={locale} />
      </section>
    </>
  );
}

export default function Equipment() {
  return (
    <Suspense fallback={<PageLoading />}>
      <EquipmentContent />
    </Suspense>
  );
}