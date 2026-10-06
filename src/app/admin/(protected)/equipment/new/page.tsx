import { EquipmentForm } from "@/components/admin/equipment-form";
import { requireAdminPage } from "@/lib/auth";
import { defaultEquipmentCategories } from "@/data/site";
import type {
  EquipmentCategory,
  EquipmentOption,
} from "@/types/catalog";

export default async function New() {
  const { db } = await requireAdminPage();

  const [categoriesResult, optionsResult] = await Promise.all([
    db
      .from("equipment_categories")
      .select("id,slug,name,sort_order")
      .neq("slug", "backdrop")
      .order("sort_order"),
    db
      .from("equipment")
      .select("id,name,name_en,category,rental_source")
      .neq("category", "backdrop")
      .order("name"),
  ]);

  const categories = categoriesResult.error
    ? defaultEquipmentCategories
    : ((categoriesResult.data || []) as EquipmentCategory[]);

  const equipmentOptions = optionsResult.error
    ? []
    : ((optionsResult.data || []) as EquipmentOption[]);

  return (
    <>
      <div className="admin-title">
        <div>
          <h1>Thêm thiết bị cho thuê</h1>
          <p>
            Chọn thiết bị tại Oni hoặc thiết bị thuê ngoài, sau đó thêm ảnh và
            thông tin hiển thị.
          </p>
        </div>
      </div>

      <EquipmentForm
        categories={categories}
        equipmentOptions={equipmentOptions}
      />
    </>
  );
}
