import Image from "next/image";
import { PageHeading, SectionHeading } from "@/components/ui/section";
import { ContactCTA } from "@/components/layout/contact-cta";
import { context } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
export function generateMetadata() {
  return pageMetadata(
    { vi: "Về Oni Studio", en: "About Oni Studio" },
    {
      vi: "Tìm hiểu không gian, thiết bị và tinh thần sáng tạo của Oni Studio.",
      en: "Discover the spaces, equipment and creative approach at Oni Studio.",
    },
    "/about",
  );
}
export default async function About() {
  const { locale } = await context();
  return (
    <>
      <PageHeading
        eyebrow="HELLO, WE’RE ONI"
        title={
          locale === "vi"
            ? "Dành một khoảng cho sáng tạo."
            : "Make room for creativity."
        }
        description={
          locale === "vi"
            ? "Oni Studio là điểm hẹn để photographer, người mẫu và ê-kíp phát triển những góc nhìn riêng."
            : "Oni Studio is a meeting point for photographers, models and creative crews to explore their own perspectives."
        }
      />
      <section className="container section-bottom about-grid">
        <div className="brand-panel">
          <Image
            src="/images/oni-logo.png"
            alt="Oni Studio"
            width={350}
            height={350}
          />
        </div>
        <div>
          <SectionHeading
            eyebrow="OUR SPACE"
            title={
              locale === "vi"
                ? "Ý tưởng của bạn, không gian của Oni."
                : "Your ideas. Our space."
            }
          />
          <p>
            {locale === "vi"
              ? "Ba phòng chụp A, B, C với diện tích 80–160m²; hệ thống phông, đèn flash và phụ kiện giúp bạn chuẩn bị buổi chụp theo nhu cầu thực tế."
              : "Rooms A, B and C offer 80–160m² of space, with backdrops, flashes and accessories for your session."}
          </p>
          <p>
            {locale === "vi"
              ? "Đội ngũ studio hỗ trợ setup ánh sáng theo layout mẫu, trao đổi thiết bị và hướng dẫn sử dụng không gian. Nhân sự chụp ảnh và sản xuất được trao đổi riêng theo từng brief."
              : "The studio team supports reference lighting setups, equipment discussions and space preparation. Photography and production crew arrangements are discussed for each brief."}
          </p>
          <h2>{locale === "vi" ? "Tinh thần Oni" : "The Oni approach"}</h2>
          <div className="values-grid">
            {(locale === "vi"
              ? [
                  "Rõ ràng từ khâu chuẩn bị",
                  "Tôn trọng góc nhìn riêng",
                  "Linh hoạt cùng ê-kíp",
                ]
              : [
                  "Clarity in preparation",
                  "Respect for your perspective",
                  "Flexibility for your crew",
                ]
            ).map((v, i) => (
              <div key={v}>
                <span>0{i + 1}</span>
                <h3>{v}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
      <ContactCTA locale={locale} />
    </>
  );
}
