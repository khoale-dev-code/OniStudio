"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  imageList,
  integer,
  slug,
  text,
  uuid,
} from "@/lib/validation";
import type {
  ActionState,
  Category,
  EquipmentOption,
  EquipmentRentalSource,
  IncludedEquipmentSummary,
} from "@/types/catalog";

function revalidateEquipmentV2(equipmentId?: string) {
  revalidatePath("/");
  revalidatePath("/equipment");
  revalidatePath("/en/equipment");
  revalidatePath("/equipment/[slug]", "page");
  revalidatePath("/en/equipment/[slug]", "page");
  revalidatePath("/pricing");
  revalidatePath("/admin/equipment");

  if (equipmentId) {
    revalidatePath(`/admin/equipment/${equipmentId}`);
  }
}

function dbMessage(code?: string) {
  if (["PGRST204", "42703", "42P01"].includes(code || "")) {
    return "Database chưa có cấu trúc Thiết bị thuê ngoài / snapshot sản phẩm đi kèm. Hãy chạy migration 111_equipment_included_snapshot.sql trong Supabase.";
  }

  if (code === "23505") {
    return "Slug đã tồn tại. Hãy tạo slug khác.";
  }

  if (code === "23503") {
    return "Danh mục không tồn tại hoặc dữ liệu tham chiếu không hợp lệ.";
  }

  return "Không thể lưu thiết bị. Kiểm tra kết nối và quyền Supabase.";
}

function rentalSource(form: FormData): EquipmentRentalSource {
  const value = String(form.get("rental_source") || "internal");
  if (value !== "internal" && value !== "external") {
    throw new Error("Nguồn thiết bị không hợp lệ.");
  }
  return value;
}

function accessoryIds(form: FormData) {
  const values = form
    .getAll("included_equipment_ids")
    .map((value) => String(value).trim())
    .filter(Boolean);

  const unique = Array.from(new Set(values));
  unique.forEach((value) => uuid(value));
  return unique;
}

function slugFromText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function plainText(value: unknown, label: string, max: number) {
  const result = String(value || "").trim();

  if (!result) {
    throw new Error(`${label} không được để trống.`);
  }

  if (result.length > max) {
    throw new Error(`${label} tối đa ${max} ký tự.`);
  }

  return result;
}

async function nextSortOrder(
  db: Awaited<ReturnType<typeof requireAdmin>>["db"],
) {
  const { data } = await db
    .from("equipment")
    .select("sort_order")
    .neq("category", "backdrop")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  return Math.min(Math.max(Number(data?.sort_order ?? -1) + 1, 0), 100000);
}

async function uniqueEquipmentSlug(
  db: Awaited<ReturnType<typeof requireAdmin>>["db"],
  rawBase: string,
) {
  const fallback = `equipment-${Date.now()}`;
  const base = slugFromText(rawBase) || fallback;

  for (let suffix = 0; suffix < 60; suffix += 1) {
    const candidate = suffix === 0 ? base : `${base}-${suffix + 1}`;
    const { data, error } = await db
      .from("equipment")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) {
      throw new Error("Không thể kiểm tra slug thiết bị.");
    }

    if (!data) {
      return candidate;
    }
  }

  throw new Error("Không thể tạo slug duy nhất cho thiết bị.");
}

function equipmentPayloadV2(form: FormData) {
  const images = imageList(form);
  const category = text(form, "category", 120);
  const source = rentalSource(form);
  const included = source === "internal" && form.get("included") === "on";

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(category)) {
    throw new Error("Danh mục không hợp lệ.");
  }

  return {
    name: text(form, "name", 160),
    name_en: text(form, "name_en", 160),
    slug: slug(form),
    category: category as Category,
    description: {
      vi: text(form, "description_vi"),
      en: text(form, "description_en"),
    },
    specifications: {
      vi: text(form, "specifications_vi"),
      en: text(form, "specifications_en"),
    },
    unit: {
      vi: text(form, "unit_vi", 40),
      en: text(form, "unit_en", 40),
    },
    price: integer(form, "price", 1000000000, true),
    included,
    images,
    image_url: images[0] || null,
    featured: form.get("featured") === "on",
    published: form.get("published") === "on",
    rental_source: source,
    included_equipment_ids: source === "external" ? accessoryIds(form) : [],
  };
}

export async function saveEquipmentV2(
  id: string | null,
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  let payload;

  try {
    payload = equipmentPayloadV2(form);
    if (id) uuid(id);

    if (id && payload.included_equipment_ids.includes(id)) {
      return { error: "Thiết bị không thể tự chọn chính nó làm sản phẩm đi kèm." };
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Dữ liệu không hợp lệ.",
    };
  }

  const session = await requireAdmin().catch(() => null);
  if (!session) {
    return { error: "Phiên quản trị đã hết hạn. Vui lòng đăng nhập lại." };
  }

  let includedEquipmentItems: IncludedEquipmentSummary[] = [];

  if (payload.included_equipment_ids.length) {
    const { data: matches, error: matchError } = await session.db
      .from("equipment")
      .select("id,name,name_en")
      .in("id", payload.included_equipment_ids);

    if (
      matchError ||
      (matches || []).length !== payload.included_equipment_ids.length
    ) {
      return { error: "Một hoặc nhiều sản phẩm đi kèm không còn tồn tại." };
    }

    const byId = new Map(
      (matches || []).map((match) => [
        match.id,
        {
          id: match.id,
          name: match.name,
          name_en: match.name_en,
        } satisfies IncludedEquipmentSummary,
      ]),
    );

    includedEquipmentItems = payload.included_equipment_ids
      .map((accessoryId) => byId.get(accessoryId))
      .filter(
        (item): item is IncludedEquipmentSummary => Boolean(item),
      );
  }

  const writePayload = {
    ...payload,
    included_equipment_items: includedEquipmentItems,
  };

  if (id) {
    const { data, error } = await session.db
      .from("equipment")
      .update(writePayload)
      .eq("id", id)
      .select("id")
      .single();

    if (error || !data) {
      return { error: dbMessage(error?.code) };
    }

    revalidateEquipmentV2(data.id);
    redirect("/admin/equipment?saved=1");
  }

  const nextOrder = await nextSortOrder(session.db);
  const { data, error } = await session.db
    .from("equipment")
    .insert({
      ...writePayload,
      status: "contact",
      sort_order: nextOrder,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: dbMessage(error?.code) };
  }

  revalidateEquipmentV2(data.id);
  redirect("/admin/equipment?saved=1");
}

export async function quickCreateEquipmentAccessory(input: {
  name: string;
  category: string;
}): Promise<{ error?: string; item?: EquipmentOption }> {
  let name: string;
  let category: string;

  try {
    name = plainText(input.name, "Tên sản phẩm", 160);
    category = plainText(input.category, "Danh mục", 120);

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(category)) {
      throw new Error("Danh mục không hợp lệ.");
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Dữ liệu không hợp lệ.",
    };
  }

  const session = await requireAdmin().catch(() => null);
  if (!session) {
    return { error: "Phiên quản trị đã hết hạn. Vui lòng đăng nhập lại." };
  }

  const { data: categoryRow, error: categoryError } = await session.db
    .from("equipment_categories")
    .select("slug")
    .eq("slug", category)
    .neq("slug", "backdrop")
    .maybeSingle();

  if (categoryError || !categoryRow) {
    return { error: "Danh mục thiết bị không tồn tại." };
  }

  let quickSlug: string;
  let sortOrder: number;

  try {
    [quickSlug, sortOrder] = await Promise.all([
      uniqueEquipmentSlug(session.db, name),
      nextSortOrder(session.db),
    ]);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Không thể tạo sản phẩm.",
    };
  }

  const { data, error } = await session.db
    .from("equipment")
    .insert({
      name,
      name_en: name,
      slug: quickSlug,
      category,
      description: {
        vi: "Sản phẩm đi kèm. Có thể cập nhật nội dung đầy đủ sau.",
        en: "Included accessory. Full content can be updated later.",
      },
      specifications: {
        vi: "Cập nhật thông số khi cần.",
        en: "Update specifications when needed.",
      },
      price: null,
      unit: { vi: "món", en: "item" },
      included: false,
      status: "contact",
      image_url: null,
      images: [],
      featured: false,
      published: false,
      sort_order: sortOrder,
      rental_source: "internal",
      included_equipment_ids: [],
      included_equipment_items: [],
    })
    .select("id,name,name_en,category,rental_source")
    .single();

  if (error || !data) {
    return { error: dbMessage(error?.code) };
  }

  revalidateEquipmentV2(data.id);

  return {
    item: data as EquipmentOption,
  };
}

export async function cloneEquipmentAsExternal(id: string) {
  uuid(id);

  const session = await requireAdmin();

  const { data: source, error: sourceError } = await session.db
    .from("equipment")
    .select("*")
    .eq("id", id)
    .neq("category", "backdrop")
    .maybeSingle();

  if (sourceError || !source) {
    redirect("/admin/equipment?cloneError=1");
  }

  if (source.rental_source === "external") {
    redirect(`/admin/equipment/${source.id}`);
  }

  const externalBaseSlug = `${source.slug}-thue-ngoai`;

  const { data: existing } = await session.db
    .from("equipment")
    .select("id")
    .eq("rental_source", "external")
    .like("slug", `${externalBaseSlug}%`)
    .order("sort_order")
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    redirect(`/admin/equipment/${existing.id}?externalExists=1`);
  }

  const [externalSlug, sortOrder] = await Promise.all([
    uniqueEquipmentSlug(session.db, externalBaseSlug),
    nextSortOrder(session.db),
  ]);

  const { data: clone, error: cloneError } = await session.db
    .from("equipment")
    .insert({
      name: source.name,
      name_en: source.name_en,
      slug: externalSlug,
      category: source.category,
      description: source.description,
      specifications: source.specifications,
      price: source.price,
      unit: source.unit,
      included: false,
      status: "contact",
      image_url: source.image_url,
      images: Array.isArray(source.images) ? source.images : [],
      featured: false,
      published: false,
      sort_order: sortOrder,
      rental_source: "external",
      included_equipment_ids: [],
      included_equipment_items: [],
    })
    .select("id")
    .single();

  if (cloneError || !clone) {
    redirect("/admin/equipment?cloneError=1");
  }

  revalidateEquipmentV2(clone.id);
  redirect(`/admin/equipment/${clone.id}?externalCopy=1`);
}


export async function reorderEquipmentSource(
  source: EquipmentRentalSource,
  ids: string[],
): Promise<{ error?: string; success?: boolean }> {
  if (source !== "internal" && source !== "external") {
    return { error: "Nguồn thiết bị không hợp lệ." };
  }

  if (!Array.isArray(ids) || ids.length > 500) {
    return { error: "Danh sách sắp xếp không hợp lệ." };
  }

  try {
    ids.forEach((id) => uuid(id));
  } catch {
    return { error: "Danh sách thiết bị có ID không hợp lệ." };
  }

  if (new Set(ids).size !== ids.length) {
    return { error: "Danh sách thiết bị bị trùng." };
  }

  const session = await requireAdmin().catch(() => null);
  if (!session) {
    return { error: "Phiên quản trị đã hết hạn. Vui lòng đăng nhập lại." };
  }

  const { error } = await session.db.rpc("reorder_equipment", {
    p_source: source,
    p_ids: ids,
  });

  if (error) {
    if (["42883", "PGRST202"].includes(error.code || "")) {
      return {
        error:
          "Chưa có hàm sắp xếp trong Supabase. Hãy chạy migration 112_equipment_admin_ordering.sql.",
      };
    }

    return { error: "Không thể lưu thứ tự thiết bị. Vui lòng thử lại." };
  }

  revalidateEquipmentV2();
  return { success: true };
}

export async function deleteEquipmentV2(
  id: string,
  _previous: ActionState,
): Promise<ActionState> {
  void _previous;

  try {
    uuid(id);
  } catch {
    return { error: "ID không hợp lệ." };
  }

  const session = await requireAdmin().catch(() => null);
  if (!session) {
    return { error: "Vui lòng đăng nhập lại." };
  }

  const { data: packages, error: packagesError } = await session.db
    .from("equipment")
    .select("id,included_equipment_ids,included_equipment_items");

  if (
    packagesError &&
    !["42703", "PGRST204"].includes(packagesError.code || "")
  ) {
    return { error: "Không thể kiểm tra các gói thiết bị liên quan." };
  }

  if (!packagesError) {
    const affected = (packages || []).filter((item) =>
      Array.isArray(item.included_equipment_ids)
        ? item.included_equipment_ids.includes(id)
        : false,
    );

    const cleanupResults = await Promise.all(
      affected.map((item) =>
        session.db
          .from("equipment")
          .update({
            included_equipment_ids: item.included_equipment_ids.filter(
              (value: string) => value !== id,
            ),
            included_equipment_items: Array.isArray(
              item.included_equipment_items,
            )
              ? item.included_equipment_items.filter(
                  (value: IncludedEquipmentSummary) => value.id !== id,
                )
              : [],
          })
          .eq("id", item.id),
      ),
    );

    if (cleanupResults.some((result) => result.error)) {
      return {
        error: "Không thể cập nhật các gói thiết bị đang tham chiếu mục này.",
      };
    }
  }

  const { data, error } = await session.db
    .from("equipment")
    .delete()
    .eq("id", id)
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Không thể xóa thiết bị." };
  }

  revalidateEquipmentV2(id);
  redirect("/admin/equipment?deleted=1");
}
