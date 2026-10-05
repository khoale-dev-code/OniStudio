import { PageHeading } from "@/components/ui/section";
import { ServiceGrid } from "@/components/home/services-section";
import { ContactCTA } from "@/components/layout/contact-cta";
import { context } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
export function generateMetadata() {
  return pageMetadata(
    { vi: "Dịch vụ", en: "Services" },
    {
      vi: "Thuê studio, thiết bị và trao đổi nhu cầu chụp ảnh, video, livestream, hỗ trợ sản xuất.",
      en: "Studio and equipment rental, photography, video, livestream and production enquiries.",
    },
    "/services",
  );
}
export default async function Services() {
  const { locale } = await context();
  return (
    <>
      <PageHeading
        eyebrow="WHAT WE DO"
        title={
          locale === "vi"
            ? "Cùng bạn tạo nên khung hình."
            : "Let’s bring your vision to life."
        }
        description={
          locale === "vi"
            ? "Từ thuê không gian đến trao đổi giải pháp cho buổi chụp. Phạm vi, nhân sự và báo giá được xác nhận theo từng yêu cầu."
            : "From room rental to planning your production. Scope, crew and pricing are confirmed for each brief."
        }
      />
      <section className="section-bottom container services-light">
        <ServiceGrid locale={locale} />
      </section>
      <ContactCTA locale={locale} />
    </>
  );
}
