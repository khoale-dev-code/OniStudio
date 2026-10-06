import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";

export function StudioDetailShortcut({
  studioId,
}: {
  studioId?: string;
}) {
  if (!studioId) {
    return (
      <div className="studio-detail-shortcut is-disabled" aria-disabled="true">
        <span className="studio-detail-shortcut-icon">
          <FileText size={20} aria-hidden="true" />
        </span>

        <div className="studio-detail-shortcut-copy">
          <p className="eyebrow">ROOM DETAIL CONTENT</p>
          <strong>Nội dung trang chi tiết phòng</strong>
          <span>
            Tạo phòng trước, sau đó bạn có thể mở một trang riêng để chỉnh nội
            dung chi tiết.
          </span>
        </div>
      </div>
    );
  }

  return (
    <Link
      className="studio-detail-shortcut"
      href={`/admin/studios/${studioId}/detail`}
      prefetch={false}
    >
      <span className="studio-detail-shortcut-icon">
        <FileText size={20} aria-hidden="true" />
      </span>

      <div className="studio-detail-shortcut-copy">
        <p className="eyebrow">ROOM DETAIL CONTENT</p>
        <strong>Nội dung trang chi tiết phòng</strong>
        <span>
          Mở trang riêng để chỉnh thông tin nhanh, giới thiệu, tiện ích, quy
          định và nội dung liên hệ.
        </span>
      </div>

      <span className="studio-detail-shortcut-action">
        Chỉnh nội dung
        <ArrowRight size={17} aria-hidden="true" />
      </span>
    </Link>
  );
}
