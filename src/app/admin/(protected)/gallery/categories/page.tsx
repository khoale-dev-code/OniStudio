import Link from "next/link";
import { ArrowLeft, Tags } from "lucide-react";
import { requireAdminPage } from "@/lib/auth";
import { GalleryCategoryForm } from "@/components/admin/gallery-category-form";
import type { GalleryCategory } from "@/types/catalog";

export default async function GalleryCategoriesAdmin() {
  const { db } = await requireAdminPage();

  const { data, error } = await db
    .from("gallery_categories")
    .select("*")
    .order("sort_order");

  if (error) {
    throw new Error(
      "Gallery categories unavailable. Run migration 006_gallery_categories_photographer.sql.",
    );
  }

  const categories = (data || []) as GalleryCategory[];

  return (
    <div className="gallery-taxonomy-page">
      <header className="gallery-taxonomy-header">
        <div>
          <p className="eyebrow">GALLERY TAXONOMY</p>
          <h1>Danh mục thư viện</h1>
          <p>
            Tổ chức các nhóm dự án hiển thị trên trang Thư viện. Slug có thể tạo
            tự động từ tên tiếng Việt.
          </p>
        </div>

        <div className="gallery-taxonomy-header-actions">
          <span className="gallery-taxonomy-count">
            <Tags size={15} aria-hidden="true" />
            {categories.length} danh mục
          </span>
          <Link className="button button-outline" href="/admin/gallery">
            <ArrowLeft size={16} aria-hidden="true" />
            Quay lại thư viện
          </Link>
        </div>
      </header>

      <section className="gallery-taxonomy-create">
        <div className="gallery-taxonomy-section-head">
          <div>
            <p className="eyebrow">CREATE</p>
            <h2>Thêm danh mục mới</h2>
            <p>
              Nhập tên, bấm <strong>Tự động</strong> để tạo slug rồi thêm danh
              mục.
            </p>
          </div>
        </div>

        <GalleryCategoryForm />
      </section>

      <section className="gallery-taxonomy-manage">
        <div className="gallery-taxonomy-section-head">
          <div>
            <p className="eyebrow">MANAGE</p>
            <h2>Danh mục hiện có</h2>
            <p>
              Danh sách được thu gọn. Bấm <strong>Sửa</strong> để mở form của
              từng danh mục.
            </p>
          </div>
        </div>

        <div className="gallery-taxonomy-list">
          {categories.map((category) => (
            <GalleryCategoryForm item={category} key={category.id} />
          ))}

          {!categories.length && (
            <div className="notice">Chưa có danh mục thư viện.</div>
          )}
        </div>
      </section>
    </div>
  );
}
