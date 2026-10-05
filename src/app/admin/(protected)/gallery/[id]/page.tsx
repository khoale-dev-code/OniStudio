import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/auth";
import { GalleryForm } from "@/components/admin/gallery-form";
import { DeleteForm } from "@/components/admin/delete-form";
import { deleteGallery } from "@/app/admin/actions";
import type {
  GalleryCategory,
  GalleryItem,
} from "@/types/catalog";

export default async function EditGalleryAlbum({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, { db }] = await Promise.all([params, requireAdminPage()]);

  const [galleryResult, categoryResult] = await Promise.all([
    db.from("gallery").select("*").eq("id", id).maybeSingle(),
    db.from("gallery_categories").select("*").order("sort_order"),
  ]);

  if (galleryResult.error || !galleryResult.data) notFound();
  if (categoryResult.error) {
    throw new Error(
      "Gallery categories unavailable. Run migration 006_gallery_categories_photographer.sql.",
    );
  }

  const item = galleryResult.data as GalleryItem;
  const categories = (categoryResult.data || []) as GalleryCategory[];

  return (
    <div className="gallery-admin-edit-page">
      <div className="admin-title">
        <div>
          <p className="eyebrow">EDIT ALBUM</p>
          <h1>Chỉnh sửa bộ ảnh</h1>
          <p>
            Cập nhật nội dung, photographer, danh mục, link social, vai trò của
            Oni và toàn bộ ảnh trong album.
          </p>
        </div>
      </div>

      <GalleryForm item={item} categories={categories} />

      <div className="gallery-admin-danger-zone">
        <div>
          <h2>Xóa bộ ảnh</h2>
          <p className="muted">
            Chỉ xóa bản ghi khỏi website. File gốc trên Cloudinary vẫn được giữ.
          </p>
        </div>
        <DeleteForm
          action={deleteGallery.bind(null, item.id)}
          label={`bộ ảnh "${item.title.vi}"`}
        />
      </div>
    </div>
  );
}
