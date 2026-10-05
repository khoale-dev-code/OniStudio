import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/auth";
import { EquipmentForm } from "@/components/admin/equipment-form";
import { InventoryManager } from "@/components/admin/inventory-manager";
import { defaultEquipmentCategories } from "@/data/site";
import type {
  Equipment,
  EquipmentCategory,
  EquipmentUnit,
} from "@/types/catalog";

export default async function Edit({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, { db }] = await Promise.all([params, requireAdminPage()]);
  const [equipmentResult, categoriesResult, unitsResult] = await Promise.all([
    db.from("equipment").select("*").eq("id", id).maybeSingle(),
    db.from("equipment_categories").select("*").order("sort_order"),
    db
      .from("equipment_units")
      .select("*")
      .eq("equipment_id", id)
      .order("sort_order"),
  ]);

  if (equipmentResult.error || !equipmentResult.data) notFound();

  const categories = categoriesResult.error
    ? defaultEquipmentCategories
    : ((categoriesResult.data || []) as EquipmentCategory[]);
  const units = unitsResult.error
    ? []
    : ((unitsResult.data || []) as EquipmentUnit[]);

  return (
    <>
      <div className="admin-title">
        <div>
          <h1>Chỉnh sửa thiết bị</h1>
          <p>
            Quản lý thông tin chung, giá thuê, danh mục và tồn kho theo từng
            thiết bị vật lý.
          </p>
        </div>
      </div>
      {(categoriesResult.error || unitsResult.error) && (
        <p className="notice error" role="alert">
          Chưa có cấu trúc danh mục/tồn kho mới. Hãy chạy migration
          003_admin_categories_inventory.sql trên Supabase.
        </p>
      )}
      <EquipmentForm
        item={equipmentResult.data as Equipment}
        categories={categories}
      />
      <InventoryManager equipmentId={id} units={units} />
    </>
  );
}
