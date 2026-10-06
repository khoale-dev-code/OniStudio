import { PageHeading } from "@/components/ui/section";
import { RentalAssetGrid } from "@/components/catalog/rental-asset-card";
import { getCatalog } from "@/lib/catalog";
import { context } from "@/lib/i18n";

export async function RentalAssetPublicPage({
  mode,
}: {
  mode: "effect" | "color" | "prop";
}) {
  const [{ locale }, catalog] = await Promise.all([context(), getCatalog()]);
  const isProp = mode === "prop";
  const items = isProp
    ? catalog.props
    : catalog.backdrops.filter((item) => item.kind === mode);

  const titleVi =
    mode === "effect"
      ? "Phông màu hiệu ứng."
      : mode === "color"
        ? "Phông màu."
        : "Đạo cụ cho set chụp.";

  const titleEn =
    mode === "effect"
      ? "Effect backdrops."
      : mode === "color"
        ? "Color backdrops."
        : "Props for your set.";

  const eyebrow =
    mode === "effect"
      ? "EFFECT BACKDROPS"
      : mode === "color"
        ? "COLOR BACKDROPS"
        : "PROPS";

  return (
    <div className="rental-public-page">
      <PageHeading
        eyebrow={eyebrow}
        title={locale === "vi" ? titleVi : titleEn}
        description=""
      />

      <section className="container section-bottom rental-public-grid-section">
        <RentalAssetGrid
          items={items}
          locale={locale}
          type={isProp ? "prop" : "backdrop"}
        />
      </section>

    </div>
  );
}
