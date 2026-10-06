import Link from "next/link";
import { requireAdminPage } from "@/lib/auth";
import { defaultEquipmentCategories } from "@/data/site";
import { EquipmentAdminManager } from "@/components/admin/equipment-admin-manager";
import type {
  Equipment,
  EquipmentCategory,
} from "@/types/catalog";

type AdminEquipment = Equipment & {
  created_at?: string | null;
};

export default async function EquipmentAdmin({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
    deleted?: string;
    cloneError?: string;
  }>;
}) {
  const [{ db }, query] = await Promise.all([
    requireAdminPage(),
    searchParams,
  ]);

  const [equipmentResult, categoriesResult] = await Promise.all([
    db
      .from("equipment")
      .select(
        "id,name,name_en,category,price,included,image_url,published,sort_order,rental_source,included_equipment_items,created_at",
      )
      .neq("category", "backdrop")
      .order("rental_source")
      .order("sort_order")
      .order("name"),
    db
      .from("equipment_categories")
      .select("id,slug,name,sort_order")
      .neq("slug", "backdrop")
      .order("sort_order"),
  ]);

  if (equipmentResult.error) {
    throw new Error("Equipment unavailable");
  }

  const items = (equipmentResult.data || []) as AdminEquipment[];
  const categories = categoriesResult.error
    ? defaultEquipmentCategories
    : ((categoriesResult.data || []) as EquipmentCategory[]);

  const externalCount = items.filter(
    (item) => item.rental_source === "external",
  ).length;

  const recentIds = [...items]
    .filter((item) => Boolean(item.created_at))
    .sort((a, b) =>
      String(b.created_at || "").localeCompare(String(a.created_at || "")),
    )
    .slice(0, 5)
    .map((item) => item.id);

  return (
    <div className="equipment-admin-page-v4">
      <div className="admin-title equipment-admin-title-v3">
        <div>
          <h1>Thiết bị cho thuê</h1>
          <p>
            {items.length} thiết bị · {externalCount} thuê ngoài. Kéo thả để
            chỉnh thứ tự hiển thị ngoài website.
          </p>
        </div>

        <div className="button-row">
          <Link className="button button-outline" href="/admin/categories">
            Danh mục thiết bị
          </Link>
          <Link className="button" href="/admin/equipment/new">
            Thêm thiết bị
          </Link>
        </div>
      </div>

      {query.saved && (
        <p className="notice success" role="status">
          Đã lưu thiết bị.
        </p>
      )}

      {query.deleted && (
        <p className="notice success" role="status">
          Đã xóa thiết bị.
        </p>
      )}

      {query.cloneError && (
        <p className="notice error" role="alert">
          Không thể tạo bản thiết bị thuê ngoài. Vui lòng thử lại.
        </p>
      )}

      <EquipmentAdminManager
        initialItems={items}
        categories={categories}
        recentIds={recentIds}
      />
    </div>
  );
}
