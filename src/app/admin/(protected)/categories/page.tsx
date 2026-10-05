import { Layers3 } from "lucide-react";
import { requireAdminPage } from "@/lib/auth";
import { CategoryForm } from "@/components/admin/category-form";
import type { EquipmentCategory } from "@/types/catalog";

export default async function CategoriesAdmin({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ db }, query] = await Promise.all([requireAdminPage(), searchParams]);

  const { data, error } = await db
    .from("equipment_categories")
    .select("id,slug,name,sort_order")
    .order("sort_order");

  if (error) {
    throw new Error(
      "Equipment categories unavailable. Run migration 003_admin_categories_inventory.sql.",
    );
  }

  const items = (data || []) as EquipmentCategory[];

  return (
    <div className="equipment-taxonomy-page">
      <header className="equipment-taxonomy-hero">
        <div>
          <p className="eyebrow">EQUIPMENT TAXONOMY</p>
          <h1>Danh mục thiết bị</h1>
          <p>
            Tạo và sắp xếp nhóm thiết bị dùng trong trang quản trị và website.
            Danh sách bên dưới được thu gọn để thao tác nhanh hơn.
          </p>
        </div>

        <div className="equipment-taxonomy-stat">
          <span className="equipment-taxonomy-stat-icon">
            <Layers3 size={18} aria-hidden="true" />
          </span>
          <span>
            <small>Tổng danh mục</small>
            <strong>{items.length}</strong>
          </span>
        </div>
      </header>

      {query.saved && (
        <p className="notice success" role="status">
          Đã lưu danh mục.
        </p>
      )}

      <section className="equipment-taxonomy-section">
        <div className="equipment-taxonomy-section-head">
          <div>
            <p className="eyebrow">CREATE</p>
            <h2>Thêm danh mục mới</h2>
            <p>
              Nhập tên và dùng nút <strong>Tự động</strong> nếu muốn tạo slug từ
              tên tiếng Việt.
            </p>
          </div>
        </div>

        <CategoryForm />
      </section>

      <section className="equipment-taxonomy-section">
        <div className="equipment-taxonomy-section-head equipment-taxonomy-manage-head">
          <div>
            <p className="eyebrow">MANAGE</p>
            <h2>Danh mục hiện có</h2>
            <p>
              Bấm <strong>Sửa</strong> để mở chi tiết. Danh mục đang có thiết bị
              sẽ không thể xóa.
            </p>
          </div>

          <span className="equipment-taxonomy-count">
            {items.length} danh mục
          </span>
        </div>

        <div className="equipment-category-list">
          {items.map((item) => (
            <CategoryForm item={item} key={item.id} />
          ))}

          {!items.length && (
            <div className="notice">Chưa có danh mục thiết bị.</div>
          )}
        </div>
      </section>
    </div>
  );
}