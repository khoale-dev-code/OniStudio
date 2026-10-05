import Image from "next/image";
import {
  ArrowUpRight,
  Users,
  Zap,
  Moon,
  Plus,
  Sparkles,
  FileText,
} from "lucide-react";
import { pricingExtras } from "@/data/pricing";
import { site } from "@/data/site";
import { formatMoney } from "@/lib/links";
import type { Locale } from "@/types/catalog";
const icons = { people: Users, power: Zap, late: Moon };

export function PricingNotes({ locale }: { locale: Locale }) {
  const vi = locale === "vi";
  return (
    <section
      id="extras"
      className="rate-section rate-extras container"
      aria-labelledby="extras-heading"
    >
      <div className="rate-section-heading">
        <div>
          <p className="rate-kicker">
            03 / {vi ? "TRƯỚC BUỔI CHỤP" : "BEFORE YOUR SHOOT"}
          </p>
          <h2 id="extras-heading">
            {vi ? "Những điều nhỏ, cần rõ." : "The details, made clear."}
          </h2>
        </div>
        <p>
          {vi
            ? "Nắm trước phụ phí để chủ động chuẩn bị cho buổi chụp của bạn."
            : "Plan your shoot with a clear view of any extra charges."}
        </p>
      </div>
      <div className="rate-extras-grid">
        {pricingExtras.map((extra) => {
          const Icon = icons[extra.id];
          return (
            <article className="rate-extra" key={extra.id}>
              <Icon size={23} strokeWidth={1.5} />
              <h3>{extra.title[locale]}</h3>
              <p>
                <strong>+{formatMoney(extra.amount, locale)}</strong>
                <span> / {extra.unit[locale]}</span>
              </p>
              <p>{extra.description[locale]}</p>
            </article>
          );
        })}
      </div>
      <div className="rate-makeup">
        <Sparkles size={20} />
        <p>
          {vi
            ? "Thêm thời gian chuẩn bị: hỗ trợ makeup trước tối đa 1 giờ tại khu vực chung."
            : "A little time to prepare: up to one hour of early makeup in the shared area."}
        </p>
      </div>
      <div className="rate-package">
        <div>
          <p className="rate-kicker">
            {vi
              ? "MỘT BUỔI CHỤP, NHIỀU NHU CẦU?"
              : "A SHOOT WITH MORE MOVING PARTS?"}
          </p>
          <h3>
            {vi ? "Cùng Oni lên setup của bạn." : "Build your setup with Oni."}
          </h3>
          <p>
            {vi
              ? "Gửi phòng, thiết bị và thời lượng dự kiến. Oni sẽ tư vấn và báo giá theo nhu cầu; hiện chưa có giá combo cố định."
              : "Share your room, equipment and timing. Oni will help you plan and quote for your needs; there is no fixed package price."}
          </p>
        </div>
        <a
          className="button button-accent"
          href={site.messenger}
          target="_blank"
          rel="noopener noreferrer"
        >
          {vi ? "Trao đổi với Oni" : "Talk to Oni"}
          <ArrowUpRight size={18} />
        </a>
      </div>
      <details className="rate-source">
        <summary>
          <span>
            <FileText size={19} />
            {vi ? "Tham khảo bảng giá gốc" : "Reference price sheet"}
          </span>
          <Plus size={20} />
        </summary>
        <div className="rate-source-content">
          <p>
            {vi
              ? "Bảng giá gốc để tham khảo. Giá phòng và thiết bị hiển thị phía trên được cập nhật từ danh mục hiện tại; xác nhận báo giá cuối cùng với Oni trước khi đặt."
              : "The original sheet is for reference. Room and equipment prices above reflect the current catalog; confirm your final quote with Oni before booking."}
          </p>
          <Image
            src="/images/oni-price-list.png"
            alt={
              vi
                ? "Bảng giá dịch vụ gốc do Oni Studio cung cấp"
                : "Original service price sheet supplied by Oni Studio"
            }
            width={906}
            height={1280}
            sizes="(max-width: 700px) 90vw, 600px"
          />
        </div>
      </details>
    </section>
  );
}
