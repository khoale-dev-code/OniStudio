import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/auth";
import { normalizeStudioDetailContent } from "@/data/studio-detail";
import { StudioDetailEditor } from "@/components/admin/studio-detail-editor";
import type { Studio } from "@/types/catalog";

export default async function StudioDetailAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, { db }] = await Promise.all([
    params,
    requireAdminPage(),
  ]);

  const { data, error } = await db
    .from("studios")
    .select("id,slug,name,led_count,detail_content")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) notFound();

  const studio = data as Pick<
    Studio,
    "id" | "slug" | "name" | "led_count" | "detail_content"
  >;

  const detail = normalizeStudioDetailContent(
    studio.detail_content,
    studio.led_count,
  );

  return (
    <div className="studio-detail-admin-page">
      <div className="studio-detail-admin-nav">
        <Link
          className="button button-outline"
          href={`/admin/studios/${studio.id}`}
          prefetch={false}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Quay lại chỉnh phòng
        </Link>

        <Link
          className="button button-outline"
          href={`/studios/${studio.slug}`}
          target="_blank"
          prefetch={false}
        >
          Xem trang Client
          <ExternalLink size={16} aria-hidden="true" />
        </Link>
      </div>

      <div className="admin-title studio-detail-admin-title">
        <div>
          <p className="eyebrow">ROOM DETAIL CONTENT</p>
          <h1>{studio.name}</h1>
          <p>
            Chỉ quản lý nội dung của trang chi tiết phòng tại đây. Các thông tin
            Card, giá, hình ảnh và kích thước được chỉnh ở trang phòng chính.
          </p>
        </div>
      </div>

      <form className="studio-detail-standalone-form">
        <StudioDetailEditor
          detail={detail}
          studioId={studio.id}
        />
      </form>
    </div>
  );
}
