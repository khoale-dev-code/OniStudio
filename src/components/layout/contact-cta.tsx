import type { Locale } from "@/types/catalog";
import { ContactActions } from "@/components/ui/contact-actions";
export function ContactCTA({ locale }: { locale: Locale }) {
  return (
    <section className="contact-cta">
      <div className="container cta-inner">
        <div>
          <p className="eyebrow">LET’S CREATE SOMETHING</p>
          <h2>
            {locale === "vi"
              ? "Một ý tưởng hay bắt đầu từ cuộc trò chuyện."
              : "Good ideas start with a conversation."}
          </h2>
          <p>
            {locale === "vi"
              ? "Gửi Oni concept, ngày chụp và số lượng thành viên. Tụi mình cùng chuẩn bị phần còn lại."
              : "Send us your concept, shoot date and crew size. Let’s prepare the rest together."}
          </p>
        </div>
        <ContactActions locale={locale} />
      </div>
    </section>
  );
}
