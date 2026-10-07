import { requireAdminPage } from "@/lib/auth";
import { GalleryPhotoManager } from "@/components/admin/gallery-photo-manager";

type GalleryPhotoRow = {
  id: string;
  image_url: string;
  sort_order: number;
};

export default async function GalleryAdmin() {
  const { db } = await requireAdminPage();

  const { data, error } = await db
    .from("gallery_photos")
    .select("id,image_url,sort_order")
    .order("sort_order")
    .order("id");

  if (error) {
    if (["42P01", "PGRST205"].includes(error.code || "")) {
      throw new Error(
        "Gallery mới chưa được khởi tạo. Hãy chạy migration 140_gallery_pinterest_stream.sql trong Supabase.",
      );
    }

    throw new Error("Không thể tải thư viện hình ảnh.");
  }

  const rows = (data ?? []) as GalleryPhotoRow[];

  return (
    <GalleryPhotoManager
      initialUrls={rows.map((row) => row.image_url)}
    />
  );
}
