import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/auth";
import type { Backdrop, PropItem } from "@/types/catalog";
import { RentalAssetForm } from "./rental-asset-form";
import { RentalAssetAdminManager } from "./rental-asset-admin-manager";

type AssetType = "backdrop" | "prop";
type Asset = Backdrop | PropItem;

type RentalAdminListRow = {
  id: string;
  name: string;
  name_en: string;
  kind?: "color" | "effect";
  price: number | null;
  included: boolean;
  image_url: string | null;
  image_count: number;
  published: boolean;
  sort_order: number;
};

function cfg(type: AssetType) {
  return type === "backdrop"
    ? {
        table: "backdrops",
        list: "/admin/backdrops",
        add: "/admin/backdrops/new",
        title: "Phông",
        singular: "phông",
      }
    : {
        table: "props",
        list: "/admin/props",
        add: "/admin/props/new",
        title: "Đạo cụ",
        singular: "đạo cụ",
      };
}

export async function RentalAssetAdminList({
  assetType,
  searchParams,
}: {
  assetType: AssetType;
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  const [{ db }] = await Promise.all([requireAdminPage(), searchParams]);
  const meta = cfg(assetType);

  const { data, error } =
    assetType === "backdrop"
      ? await db
          .from("backdrops")
          .select(
            "id,name,name_en,kind,price,included,image_url,image_count,published,sort_order",
          )
          .order("sort_order")
      : await db
          .from("props")
          .select(
            "id,name,name_en,price,included,image_url,image_count,published,sort_order",
          )
          .order("sort_order");

  if (error) {
    throw new Error(
      `${meta.title} unavailable. Run migration 100_rental_catalog_split.sql.`,
    );
  }

  const items = (data || []) as RentalAdminListRow[];

  const managerItems = items.map((item) => ({
    id: item.id,
    name: item.name,
    name_en: item.name_en,
    cover: item.image_url,
    kind:
      assetType === "backdrop"
        ? item.kind ?? "color"
        : ("prop" as const),
    included: item.included,
    price: item.price,
    published: item.published,
    imageCount: Number(item.image_count || 0),
  }));

  return (
    <div className="rental-admin-unified">
      <div className="admin-title rental-admin-title">
        <div>
          <h1>{meta.title}</h1>
          <p>
            {assetType === "backdrop"
              ? `${items.length} phông. Quản lý phông màu và phông hiệu ứng trong cùng một bảng.`
              : `${items.length} đạo cụ. Tìm kiếm, kiểm tra trạng thái và sắp xếp trực tiếp trong một bảng.`}
          </p>
        </div>

        <Link className="button" href={meta.add}>
          Thêm {meta.singular}
        </Link>
      </div>

      <RentalAssetAdminManager
        key={items
          .map((item) => `${item.id}:${item.sort_order}`)
          .join("|")}
        assetType={assetType}
        items={managerItems}
      />
    </div>
  );
}


export async function RentalAssetAdminEditor({
  assetType,
  id,
}: {
  assetType: AssetType;
  id?: string;
}) {
  const meta = cfg(assetType);
  let item: Asset | undefined;

  if (id) {
    const { db } = await requireAdminPage();
    const { data, error } = await db.from(meta.table).select("*").eq("id", id).maybeSingle();

    if (error || !data) {
      notFound();
    }

    item = data as Asset;
  }

  return (
    <>
      <div className="admin-title rental-admin-title">
        <div>
          <h1>{id ? `Chỉnh sửa ${meta.singular}` : `Thêm ${meta.singular}`}</h1>
          <p>
            {assetType === "backdrop"
              ? "Cập nhật tên phông, loại phông, giá, mô tả và album hình ảnh trong một bố cục gọn hơn."
              : "Cập nhật tên đạo cụ, giá, mô tả và album hình ảnh trong một bố cục dễ thao tác hơn."}
          </p>
        </div>
      </div>

      <RentalAssetForm item={item} assetType={assetType} />
    </>
  );
}
