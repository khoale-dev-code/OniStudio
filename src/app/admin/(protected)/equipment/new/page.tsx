import { EquipmentForm } from "@/components/admin/equipment-form";
import { requireAdminPage } from "@/lib/auth";
import { defaultEquipmentCategories } from "@/data/site";
import type { EquipmentCategory } from "@/types/catalog";

export default async function New() {
  const { db } = await requireAdminPage();
  const { data, error } = await db
    .from("equipment_categories")
    .select("*")
    .order("sort_order");

  const categories = error
    ? defaultEquipmentCategories
    : ((data || []) as EquipmentCategory[]);

  return (
    <>
      <div className="admin-title">
        <div>
          <h1>Thêm thiết bị</h1>
          <p>
            Lưu thiết bị trước, sau đó mở lại để khai báo số lượng và trạng thái
            từng thiết bị vật lý.
          </p>
        </div>
      </div>
      {error && (
        <p className="notice error" role="alert">
          Chưa có bảng danh mục mới. Hãy chạy migration
          003_admin_categories_inventory.sql trên Supabase.
        </p>
      )}
      <EquipmentForm categories={categories} />
    </>
  );
}
