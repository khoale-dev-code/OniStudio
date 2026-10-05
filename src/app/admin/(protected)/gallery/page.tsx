import Image from "next/image";
import Link from "next/link";
import { Images, PencilLine, Tags, UserRound } from "lucide-react";
import { requireAdminPage } from "@/lib/auth";
import { GalleryForm } from "@/components/admin/gallery-form";
import type { GalleryCategory, GalleryItem } from "@/types/catalog";

function albumImages(item: GalleryItem) {
  return item.images?.length ? item.images : [item.image_url].filter(Boolean);
}

export default async function GalleryAdmin({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ db }, query] = await Promise.all([requireAdminPage(), searchParams]);

  const [galleryResult, categoryResult] = await Promise.all([
    db
      .from("gallery")
      .select(
        "id,title,category,image_url,images,published,sort_order,photographer_name,oni_production,oni_lighting,shot_at_oni",
      )
      .order("sort_order"),
    db
      .from("gallery_categories")
      .select("id,slug,name,sort_order")
      .order("sort_order"),
  ]);

  if (galleryResult.error) throw new Error("Gallery unavailable");
  if (categoryResult.error) {
    throw new Error(
      "Gallery categories unavailable. Run migration 006_gallery_categories_photographer.sql.",
    );
  }

  const items = (galleryResult.data || []) as GalleryItem[];
  const categories = (categoryResult.data || []) as GalleryCategory[];
  const categoryMap = new Map(
    categories.map((category) => [category.slug, category.name.vi]),
  );

  const nextSortOrder = Math.min(
    99988,
    Math.max(-1, ...items.map((item) => item.sort_order)) + 1,
  );

  return (
    <div className="gallery-admin-page gallery-admin-page-compact">
      <div className="admin-title gallery-compact-title">
        <div>
          <p className="eyebrow">ONI / PROJECT LIBRARY</p>
          <h1>Thư viện hình ảnh</h1>
          <p>
            Quản lý album theo dự án. Chỉ bật các trường cần dùng để giữ form
            ngắn, rõ ràng và nhanh thao tác.
          </p>
        </div>

        <div className="gallery-compact-title-actions">
          <Link className="button button-outline" href="/admin/gallery/categories">
            <Tags size={16} aria-hidden="true" />
            Danh mục
          </Link>
          <span className="gallery-compact-count">
            <Images size={16} aria-hidden="true" />
            <strong>{items.length}</strong> album
          </span>
        </div>
      </div>

      {query.saved && (
        <p className="notice success" role="status">
          Đã lưu bộ ảnh.
        </p>
      )}

      <div className="gallery-admin-workspace">
        <aside className="gallery-library-pane">
          <div className="gallery-library-pane-head">
            <div>
              <h2>Album hiện có</h2>
              <p>{items.length} bộ ảnh</p>
            </div>
          </div>

          <div className="gallery-library-list">
            {items.length ? (
              items.map((item) => {
                const images = albumImages(item);
                const cover = images[0];

                return (
                  <article className="gallery-library-row" key={item.id}>
                    <div className="gallery-library-thumb">
                      {cover ? (
                        <Image
                          src={cover}
                          alt=""
                          fill
                          sizes="96px"
                        />
                      ) : (
                        <Images size={22} aria-hidden="true" />
                      )}
                      <span>{images.length}</span>
                    </div>

                    <div className="gallery-library-copy">
                      <div className="gallery-library-meta">
                        <span>{categoryMap.get(item.category) || item.category}</span>
                        <span>{item.published ? "Công khai" : "Ẩn"}</span>
                      </div>
                      <h3>{item.title.vi}</h3>
                      {item.photographer_name && (
                        <p className="gallery-library-photographer">
                          <UserRound size={13} aria-hidden="true" />
                          {item.photographer_name}
                        </p>
                      )}
                      <div className="gallery-library-tags">
                        {item.oni_production && <span>Production</span>}
                        {item.oni_lighting && <span>Lighting</span>}
                        {item.shot_at_oni && <span>Oni Studio</span>}
                      </div>
                    </div>

                    <Link
                      className="gallery-library-edit"
                      href={`/admin/gallery/${item.id}`}
                      aria-label={`Chỉnh sửa ${item.title.vi}`}
                    >
                      <PencilLine size={16} aria-hidden="true" />
                    </Link>
                  </article>
                );
              })
            ) : (
              <div className="gallery-library-empty">
                <Images size={24} aria-hidden="true" />
                <p>Chưa có album.</p>
              </div>
            )}
          </div>
        </aside>

        <main className="gallery-editor-pane">
          <GalleryForm categories={categories} nextSortOrder={nextSortOrder} />
        </main>
      </div>
    </div>
  );
}