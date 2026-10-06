import { Suspense } from "react";
import { ArrowDown, ArrowDownRight, Check } from "lucide-react";
import PageLoading from "@/components/ui/page-loading";

import { RoomRateCard } from "@/components/pricing/room-rate-card";
import { EquipmentRates } from "@/components/pricing/equipment-rates";
import { PricingNotes } from "@/components/pricing/pricing-notes";
import { getCatalog } from "@/lib/catalog";
import { context } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import "@/styles/pricing.css";

export function generateMetadata() {
  return pageMetadata(
    { vi: "Bảng giá", en: "Pricing" },
    {
      vi: "Giá phòng, thuê thiết bị và phụ phí theo bảng giá Oni Studio.",
      en: "Room rates, equipment rental and extra charges from Oni Studio’s price sheet.",
    },
    "/pricing",
  );
}
async function PricingContent() {
  const [{ locale }, { studios, equipment, categories }] = await Promise.all([
    context(),
    getCatalog(),
  ]);
  const vi = locale === "vi";
  const largestArea = studios.length
    ? Math.max(...studios.map((studio) => studio.area))
    : 0;
  const smallestArea = studios.length
    ? Math.min(...studios.map((studio) => studio.area))
    : 0;
  return (
    <div className="pricing-page">
      <section className="rate-hero container" aria-labelledby="pricing-title">
        <div className="rate-hero-top">
          <p className="rate-kicker">
            <span className="rate-dot" />
            ONI STUDIO / {vi ? "BẢNG GIÁ" : "PRICING"}
          </p>
          <span className="rate-hero-caption">
            SPACE TO CREATE. ROOM TO BE YOU.
          </span>
        </div>
        <div className="rate-hero-grid">
          <div>
            <h1 id="pricing-title">
              {vi ? "Rõ ràng chi phí." : "Clear on cost."}
              <br />
              <span>{vi ? "Trọn vẹn sáng tạo." : "Free to create."}</span>
            </h1>
            <p className="rate-hero-description">
              {vi
                ? "Từ không gian đến ánh sáng, chọn những gì bạn cần cho buổi chụp. Oni cùng bạn chuẩn bị phần còn lại."
                : "From space to lighting, choose what your shoot needs. Oni will help you take care of the rest."}
            </p>
          </div>
          <div className="rate-hero-aside">
            <ArrowDownRight size={46} strokeWidth={1} aria-hidden="true" />
            <p>
              {vi
                ? "Một nơi cho ý tưởng.\nMột mức giá rõ ràng."
                : "A place for your ideas.\nA price you can plan around."}
            </p>
            <div>
              <span>
                <Check size={15} />
                {vi ? "Giá phòng gồm VAT" : "Room VAT included"}
              </span>
              <span>
                <Check size={15} />
                {vi ? "Đặt từ 2 giờ" : "Book from 2 hours"}
              </span>
            </div>
          </div>
        </div>
        <nav
          className="rate-jump-links"
          aria-label={vi ? "Mục trong bảng giá" : "Pricing sections"}
        >
          {[
            { id: "rooms", vi: "Không gian studio", en: "Studio spaces" },
            {
              id: "equipment-rates",
              vi: "Thiết bị & ánh sáng",
              en: "Equipment & lighting",
            },
            { id: "extras", vi: "Phụ phí & lưu ý", en: "Extras & details" },
          ].map((item, index) => (
            <a key={item.id} href={`#${item.id}`}>
              <span className="rate-jump-number">0{index + 1}</span>
              <span>{item[locale]}</span>
              <ArrowDown size={16} />
            </a>
          ))}
        </nav>
      </section>
      <section
        id="rooms"
        className="rate-section rate-rooms container"
        aria-labelledby="rooms-heading"
      >
        <div className="rate-section-heading">
          <div>
            <p className="rate-kicker">
              01 / {vi ? "KHÔNG GIAN" : "THE SPACES"}
            </p>
            <h2 id="rooms-heading">
              {vi
                ? "Chọn phòng cho góc nhìn của bạn."
                : "A room for your point of view."}
            </h2>
          </div>
          <p>
            {vi
              ? "Lịch phòng và thiết bị được xác nhận trực tiếp cùng Oni trước khi đặt."
              : "Confirm room and equipment availability directly with Oni before booking."}
          </p>
        </div>
        <div className="rate-rooms-grid">
          {studios.map((studio) => (
            <RoomRateCard
              key={studio.id}
              studio={studio}
              locale={locale}
              spacious={
                largestArea > smallestArea && studio.area === largestArea
              }
            />
          ))}
        </div>
        {!studios.length && (
          <p className="rate-empty">
            {vi
              ? "Danh sách phòng đang được cập nhật. Nhắn Oni để được tư vấn."
              : "Room listings are being updated. Contact Oni for assistance."}
          </p>
        )}
      </section>
      <section
        id="equipment-rates"
        className="rate-equipment-section"
        aria-labelledby="equipment-rates-heading"
      >
        <div className="container rate-section">
          <div className="rate-section-heading">
            <div>
              <p className="rate-kicker">
                02 / {vi ? "THIẾT BỊ & ÁNH SÁNG" : "EQUIPMENT & LIGHTING"}
              </p>
              <h2 id="equipment-rates-heading">
                {vi ? "Hoàn thiện setup của bạn." : "Complete your setup."}
              </h2>
            </div>
            <p>
              {vi
                ? "Từ một nguồn sáng đến cả bộ thiết bị. Tìm nhanh món bạn cần và xem giá ngay bên dưới."
                : "From one light to a full kit. Find the tools you need and their rental rates below."}
            </p>
          </div>
          <EquipmentRates
            items={equipment}
            categories={categories}
            locale={locale}
          />
        </div>
      </section>
      <PricingNotes locale={locale} />
      
    </div>
  );
}
export default function Pricing() {
  return (
    <Suspense fallback={<PageLoading />}>
      <PricingContent />
    </Suspense>
  );
}