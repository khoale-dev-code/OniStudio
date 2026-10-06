import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/auth";
import { EquipmentForm } from "@/components/admin/equipment-form";
import { defaultEquipmentCategories } from "@/data/site";
import type {
  Equipment,
  EquipmentCategory,
  EquipmentOption,
} from "@/types/catalog";

export default async function Edit({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    externalCopy?: string;
    externalExists?: string;
  }>;
}) {
  const [{ id }, query, { db }] = await Promise.all([
    params,
    searchParams,
    requireAdminPage(),
  ]);

  const [equipmentResult, categoriesResult, optionsResult] = await Promise.all([
    db
      .from("equipment")
      .select("*")
      .eq("id", id)
      .neq("category", "backdrop")
      .maybeSingle(),
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

  if (equipmentResult.error || !equipmentResult.data) notFound();

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
          <h1>Chỉnh sửa thiết bị</h1>
          <p>
            Quản lý hình ảnh, giá, nguồn thiết bị và các sản phẩm đi kèm.
          </p>
        </div>
      </div>

      {query.externalCopy && (
        <p className="notice success" role="status">
          Đã tạo bản thiết bị thuê ngoài. Hãy kiểm tra giá và chọn các sản phẩm
          đi kèm trước khi bật hiển thị công khai.
        </p>
      )}

      {query.externalExists && (
        <p className="notice" role="status">
          Thiết bị này đã có một bản thuê ngoài. Bạn đang chỉnh bản đó.
        </p>
      )}

      <EquipmentForm
        item={equipmentResult.data as Equipment}
        categories={categories}
        equipmentOptions={equipmentOptions}
      />
    </>
  );
}
