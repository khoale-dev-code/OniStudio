import { Suspense } from "react";
import PageLoading from "@/components/ui/page-loading";
import { PageHeading } from "@/components/ui/section";
import { StudioCard } from "@/components/catalog/studio-card";

import { getCatalog } from "@/lib/catalog";
import { context } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";

export function generateMetadata() {
  return pageMetadata(
    { vi: "Không gian studio", en: "Studio spaces" },
    {
      vi: "Khám phá các phòng chụp tại Oni Studio: diện tích, kích thước, tiện ích và giá thuê.",
      en: "Explore Oni Studio spaces: floor area, dimensions, facilities and rental rates.",
    },
    "/studios",
  );
}

async function StudiosContent() {
  const [{ locale }, { studios }] = await Promise.all([
    context(),
    getCatalog(),
  ]);

  return (
    <>
      <PageHeading
        eyebrow="THE SPACES"
        title={
          locale === "vi"
            ? "Không gian cho mọi góc nhìn."
            : "Make space for your perspective."
        }
        description={
          locale === "vi"
            ? "Chọn phòng phù hợp với concept, kích thước và cách set up của buổi chụp. Oni xác nhận lịch trực tiếp qua tin nhắn."
            : "Choose a room that fits your concept, dimensions and setup. Oni confirms availability directly by message."
        }
      />

      <section className="container section-bottom studios-showcase">
        <div className="studios-showcase-head">
          <div>
            <p className="eyebrow">CHOOSE YOUR SPACE</p>
            <h2>
              {locale === "vi"
                ? "Chọn đúng không gian cho buổi chụp của bạn."
                : "Choose the right space for your shoot."}
            </h2>
          </div>
          <p className="studios-showcase-note">
            {locale === "vi"
              ? `${studios.length} không gian hiện có · Giá theo giờ · Liên hệ Oni để kiểm tra lịch trống.`
              : `${studios.length} spaces available · Hourly rates · Contact Oni to check availability.`}
          </p>
        </div>

        <div className="studio-grid studio-grid-v2">
          {studios.map((studio, index) => (
            <StudioCard
              key={studio.id}
              studio={studio}
              locale={locale}
              index={index + 1}
            />
          ))}
        </div>
      </section>
    </>
  );
}

export default function Studios() {
  return (
    <Suspense fallback={<PageLoading />}>
      <StudiosContent />
    </Suspense>
  );
}
