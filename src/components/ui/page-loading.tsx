import { context } from "@/lib/i18n";
export default async function Loading() {
  const { locale } = await context();
  return (
    <div className="container route-loading" role="status" aria-busy="true">
      <p className="eyebrow">ONI STUDIO</p>
      <p>
        {locale === "vi"
          ? "Đang mở không gian tiếp theo…"
          : "Opening your next space…"}
      </p>
      <div className="skeleton skeleton-title" />
      <div className="loading-grid">
        {[0, 1, 2].map((n) => (
          <div className="skeleton skeleton-card" key={n} />
        ))}
      </div>
    </div>
  );
}
