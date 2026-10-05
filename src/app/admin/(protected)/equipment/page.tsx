import Link from "next/link";
import Image from "next/image";
import { requireAdminPage } from "@/lib/auth";
import { defaultEquipmentCategories, statusLabels } from "@/data/site";
import { categoryLabel, inventorySummary } from "@/lib/equipment";
import { money } from "@/lib/i18n";
import type {
  Equipment,
  EquipmentCategory,
  EquipmentUnit,
} from "@/types/catalog";

export default async function EquipmentAdmin({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  const [{ db }, query] = await Promise.all([requireAdminPage(), searchParams]);
  const [equipmentResult, categoriesResult, unitsResult] = await Promise.all([
    db
      .from("equipment")
      .select(
        "id,slug,name,category,price,included,status,images,image_url,published,sort_order",
      )
      .order("sort_order"),
    db
      .from("equipment_categories")
      .select("id,slug,name,sort_order")
      .order("sort_order"),
    db.from("equipment_units").select("equipment_id,status").order("sort_order"),
  ]);

  if (equipmentResult.error) throw new Error("Equipment unavailable");

  const items = (equipmentResult.data || []) as Equipment[];
  const categories = categoriesResult.error
    ? defaultEquipmentCategories
    : ((categoriesResult.data || []) as EquipmentCategory[]);
  const units = unitsResult.error
    ? []
    : ((unitsResult.data || []) as EquipmentUnit[]);
  const unitsByEquipment = new Map<string, EquipmentUnit[]>();

  for (const unit of units) {
    const list = unitsByEquipment.get(unit.equipment_id) || [];
    list.push(unit);
    unitsByEquipment.set(unit.equipment_id, list);
  }

  return (
    <>
      <div className="admin-title">
        <div>
          <h1>Thiết bị</h1>
          <p>
            {items.length} mục · Quản lý giá, danh mục và số lượng theo trạng
            thái.
          </p>
        </div>
        <div className="button-row">
          <Link className="button button-outline" href="/admin/categories">
            Danh mục
          </Link>
          <Link className="button" href="/admin/equipment/new">
            Thêm thiết bị
          </Link>
        </div>
      </div>

      {(categoriesResult.error || unitsResult.error) && (
        <p className="notice error" role="alert">
          Chưa có cấu trúc danh mục/tồn kho mới. Hãy chạy migration
          003_admin_categories_inventory.sql trên Supabase.
        </p>
      )}

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

      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>Tên thiết bị</th>
              <th>Danh mục</th>
              <th>Giá</th>
              <th>Tồn kho</th>
              <th>Công khai</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const itemUnits = unitsByEquipment.get(item.id) || [];
              const inventory = inventorySummary(itemUnits);
              return (
                <tr key={item.id}>
                  <td>
                    <div className="admin-equipment-name">
                      {item.images?.[0] || item.image_url ? (
                        <Image
                          src={item.images?.[0] || item.image_url!}
                          alt=""
                          width={54}
                          height={54}
                          className="admin-equipment-thumb"
                        />
                      ) : (
                        <span
                          className="admin-equipment-empty"
                          aria-hidden="true"
                        >
                          ONI
                        </span>
                      )}
                      <div>
                        {item.name}
                        <small>
                          {item.images?.length || (item.image_url ? 1 : 0)} ảnh
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>{categoryLabel(categories, item.category, "vi")}</td>
                  <td>
                    {item.included
                      ? "Kèm phòng"
                      : item.price !== null
                        ? money(item.price)
                        : "Liên hệ"}
                  </td>
                  <td>
                    {inventory.total ? (
                      <div className="inventory-table-summary">
                        <strong>{inventory.total} thiết bị</strong>
                        <small>
                          {inventory.available} sẵn sàng · {inventory.rented}{" "}
                          đang thuê · {inventory.maintenance} bảo trì
                        </small>
                      </div>
                    ) : (
                      <span>{statusLabels[item.status].vi}</span>
                    )}
                  </td>
                  <td>{item.published ? "Có" : "Ẩn"}</td>
                  <td>
                    <Link href={`/admin/equipment/${item.id}`}>Chỉnh sửa</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {items.length === 0 && (
          <p className="notice">
            Chưa có thiết bị. Chạy seed SQL hoặc thêm thiết bị đầu tiên.
          </p>
        )}
      </div>
    </>
  );
}