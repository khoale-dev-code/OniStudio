import { ProductGallery } from "@/components/catalog/product-gallery";
import Link from "@/components/ui/nav-link";
import { notFound } from "next/navigation";
import { Users, Maximize2, Clock, Check } from "lucide-react";
import { getCatalog } from "@/lib/catalog";
import { context, href, money } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { ContactActions } from "@/components/ui/contact-actions";
import { includedGroups } from "@/data/content";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const s = (await getCatalog()).studios.find((s) => s.slug === slug);
  return pageMetadata(
    { vi: s?.name || "Không tìm thấy phòng", en: s?.name || "Room not found" },
    s?.description || { vi: "Không gian Oni Studio", en: "Oni Studio space" },
    `/studios/${slug}`,
  );
}
export default async function StudioDetail({ params }: Props) {
  const [{ slug }, { locale }, { studios }] = await Promise.all([
    params,
    context(),
    getCatalog(),
  ]);
  const s = studios.find((s) => s.slug === slug);
  if (!s) notFound();
  return (
    <div className="container detail-page">
      <Link className="text-link" href={href(locale, "/studios")}>
        {locale === "vi" ? "Tất cả không gian" : "All spaces"}
      </Link>
      <div className="detail-heading">
        <div>
          <p className="eyebrow">ONI STUDIO / THE SPACES</p>
          <h1>{s.name}</h1>
          <p>{s.description[locale]}</p>
        </div>
        <div className="detail-price">
          <strong>{money(s.price, locale)}</strong>
          <span>
            / {locale === "vi" ? "giờ · đã gồm VAT" : "hour · VAT included"}
          </span>
        </div>
      </div>
      <ProductGallery
        images={s.images.length ? s.images : ["/images/studio-concept.webp"]}
        name={s.name}
        locale={locale}
        fit="cover"
        caption={
          !s.images.length
            ? locale === "vi"
              ? "Ảnh minh họa · Hình phòng thực tế sẽ được cập nhật"
              : "Illustration · Actual room photographs to follow"
            : undefined
        }
      />
      <div className="detail-grid">
        <div>
          <div className="detail-facts">
            <span>
              <Maximize2 />
              {s.area} m²
            </span>
            <span>
              <Users />
              {s.capacity} {locale === "vi" ? "người" : "people"}
            </span>
            <span>
              <Clock />
              {locale === "vi" ? "Tối thiểu 2 giờ" : "2-hour minimum"}
            </span>
          </div>
          <h2>
            {locale === "vi"
              ? "Sẵn sàng cho buổi chụp"
              : "Ready for your session"}
          </h2>
          <p>
            {locale === "vi"
              ? `Miễn phí đèn flash studio và ${s.led_count} đèn LED Nanlite 300B. Hỗ trợ setup ánh sáng theo layout mẫu. Xác nhận danh sách và số lượng thiết bị khi đặt phòng.`
              : `Studio flashes and ${s.led_count} Nanlite 300B LED light(s) included. Reference-layout lighting assistance. Confirm the equipment list and quantities when reserving.`}
          </p>
          <div className="amenity-grid">
            {includedGroups.map((g) => (
              <div key={g.title.en}>
                <h3>{g.title[locale]}</h3>
                <p>{g.items[locale]}</p>
              </div>
            ))}
          </div>
          <h2>
            {locale === "vi" ? "Quy định & lưu ý" : "House rules & notes"}
          </h2>
          <ul className="check-list">
            <li>
              <Check />
              {locale === "vi"
                ? "Hỗ trợ makeup tối đa 1 giờ trước lịch, tại khu chung."
                : "Up to one hour of early makeup in the shared area."}
            </li>
            <li>
              <Check />
              {locale === "vi"
                ? "Khu vực chờ: tối đa 4 người mỗi ê-kíp."
                : "Waiting area: up to four people per crew."}
            </li>
            <li>
              <Check />
              {locale === "vi"
                ? "Thêm người: 50.000đ/người; sau 22:00: +50.000đ/giờ."
                : "Extra person: 50,000 VND/person; after 10 pm: +50,000 VND/hour."}
            </li>
            <li>
              <Check />
              {locale === "vi"
                ? "Đèn LED tổng công suất trên 500W: +50.000đ/giờ."
                : "LED use over 500W total: +50,000 VND/hour."}
            </li>
          </ul>
          <p className="muted">
            {locale === "vi"
              ? "Vui lòng trao đổi quy định đặt cọc, đổi/hủy lịch và hoàn tiền với Oni trước khi xác nhận."
              : "Confirm deposit, rescheduling, cancellation and refund terms with Oni before booking."}
          </p>
        </div>
        <aside className="inquiry-card">
          <p className="eyebrow">YOUR NEXT SHOOT</p>
          <h2>
            {locale === "vi" ? "Cùng lên lịch nhé?" : "Plan your next shoot?"}
          </h2>
          <p>
            {locale === "vi"
              ? `Gửi tên ${s.name}, ngày chụp, thời lượng và số người cho Oni để kiểm tra lịch.`
              : `Send Oni the room name (${s.name}), date, duration and crew size to check availability.`}
          </p>
          <ContactActions locale={locale} />
          <p className="small muted">
            {locale === "vi"
              ? "Lịch được xác nhận trực tiếp với studio."
              : "Reservations are confirmed directly with the studio."}
          </p>
        </aside>
      </div>
    </div>
  );
}
