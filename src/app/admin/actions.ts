"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAuthClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/supabase/config";
import { requireAdmin } from "@/lib/auth";
import {
  equipmentPayload,
  imageList,
  integer,
  inventoryStatus,
  slug,
  text,
  uuid,
} from "@/lib/validation";
import type { ActionState } from "@/types/catalog";

export async function login(
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  if (!isConfigured()) {
    return {
      error:
        "Chưa cấu hình Supabase. Xem README để kết nối database và tạo tài khoản admin.",
    };
  }
  const email = String(form.get("email") || "").trim();
  const password = String(form.get("password") || "");
  if (!email || email.length > 254 || password.length > 256 || !password) {
    return { error: "Kiểm tra email và mật khẩu." };
  }
  const db = await createAuthClient();
  const { error } = await db.auth.signInWithPassword({ email, password });
  if (error) {
    return {
      error: "Đăng nhập không thành công. Kiểm tra thông tin hoặc thử lại sau.",
    };
  }
  const { data: allowed } = await db.rpc("is_admin");
  if (allowed !== true) {
    await db.auth.signOut();
    return { error: "Tài khoản chưa được cấp quyền quản trị." };
  }
  redirect("/admin");
}

export async function logout() {
  const db = await createAuthClient();
  await db.auth.signOut();
  redirect("/admin/login");
}

function dbMessage(code?: string) {
  if (["PGRST204", "42703", "42P01"].includes(code || "")) {
    return "Database chưa có cấu trúc danh mục/tồn kho mới. Hãy chạy migration 003_admin_categories_inventory.sql trong Supabase.";
  }
  if (code === "23505") {
    return "Dữ liệu bị trùng. Kiểm tra slug hoặc mã thiết bị.";
  }
  if (code === "23503") {
    return "Dữ liệu đang được sử dụng hoặc tham chiếu không hợp lệ.";
  }
  return "Không thể lưu dữ liệu. Kiểm tra kết nối và quyền Supabase.";
}

function revalidateEquipment(equipmentId?: string) {
  revalidatePath("/");
  revalidatePath("/equipment");
  revalidatePath("/equipment/[slug]", "page");
  revalidatePath("/pricing");
  revalidatePath("/admin/equipment");
  if (equipmentId) revalidatePath(`/admin/equipment/${equipmentId}`);
}

function revalidateEquipmentCategories() {
  revalidatePath("/");
  revalidatePath("/equipment");
  revalidatePath("/pricing");
  revalidatePath("/admin/equipment");
  revalidatePath("/admin/categories");
}

function revalidateStudios(studioId?: string) {
  revalidatePath("/");
  revalidatePath("/studios");
  revalidatePath("/studios/[slug]", "page");
  revalidatePath("/pricing");
  revalidatePath("/admin/studios");
  if (studioId) revalidatePath(`/admin/studios/${studioId}`);
}

function revalidateGallery(galleryId?: string) {
  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
  if (galleryId) revalidatePath(`/admin/gallery/${galleryId}`);
}

function revalidateGalleryCategories() {
  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
  revalidatePath("/admin/gallery/categories");
}

export async function saveEquipment(
  id: string | null,
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  let payload;
  try {
    payload = equipmentPayload(form);
    if (id) uuid(id);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Dữ liệu không hợp lệ.",
    };
  }

  const session = await requireAdmin().catch(() => null);
  if (!session) {
    return { error: "Phiên quản trị đã hết hạn. Vui lòng đăng nhập lại." };
  }

  const query = id
    ? session.db.from("equipment").update(payload).eq("id", id)
    : session.db.from("equipment").insert(payload);
  const { data, error } = await query.select("id").single();

  if (error?.code === "23503") {
    return { error: "Danh mục đã bị xóa hoặc không tồn tại." };
  }
  if (error || !data) return { error: dbMessage(error?.code) };

  revalidateEquipment(data.id);
  redirect("/admin/equipment?saved=1");
}

export async function deleteEquipment(
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
  if (!session) return { error: "Vui lòng đăng nhập lại." };

  const { data, error } = await session.db
    .from("equipment")
    .delete()
    .eq("id", id)
    .select("id")
    .single();

  if (error || !data) return { error: "Không thể xóa thiết bị." };

  revalidateEquipment(id);
  redirect("/admin/equipment?deleted=1");
}

export async function saveEquipmentCategory(
  id: string | null,
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  let payload;
  try {
    if (id) uuid(id);
    payload = {
      slug: slug(form),
      name: {
        vi: text(form, "name_vi", 120),
        en: text(form, "name_en", 120),
      },
      sort_order: integer(form, "sort_order", 100000),
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Danh mục không hợp lệ.",
    };
  }

  const session = await requireAdmin().catch(() => null);
  if (!session) return { error: "Vui lòng đăng nhập lại." };

  const query = id
    ? session.db.from("equipment_categories").update(payload).eq("id", id)
    : session.db.from("equipment_categories").insert(payload);
  const { data, error } = await query.select("id").single();

  if (error || !data) {
    if (error?.code === "23505") {
      return { error: "Slug danh mục đã tồn tại." };
    }
    return { error: dbMessage(error?.code) };
  }

  revalidateEquipmentCategories();

  if (id) {
    return { success: "Đã cập nhật danh mục." };
  }

  redirect("/admin/categories?saved=1");
}

export async function deleteEquipmentCategory(
  id: string,
  _previous: ActionState,
): Promise<ActionState> {
  void _previous;
  try {
    uuid(id);
  } catch {
    return { error: "ID danh mục không hợp lệ." };
  }

  const session = await requireAdmin().catch(() => null);
  if (!session) return { error: "Vui lòng đăng nhập lại." };

  const { data, error } = await session.db
    .from("equipment_categories")
    .delete()
    .eq("id", id)
    .select("id")
    .single();

  if (error?.code === "23503") {
    return {
      error:
        "Không thể xóa danh mục đang có thiết bị. Hãy chuyển thiết bị sang danh mục khác trước.",
    };
  }
  if (error || !data) return { error: dbMessage(error?.code) };

  revalidateEquipmentCategories();
  return { success: "Đã xóa danh mục." };
}

export async function addEquipmentUnits(
  equipmentId: string,
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  let count: number;
  let status;
  try {
    uuid(equipmentId);
    count = integer(form, "count", 50) ?? 0;
    if (count < 1) throw new Error("Số lượng thêm phải từ 1 đến 50.");
    status = inventoryStatus(form);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Số lượng không hợp lệ.",
    };
  }

  const session = await requireAdmin().catch(() => null);
  if (!session) return { error: "Vui lòng đăng nhập lại." };

  const { data: existing, error: listError } = await session.db
    .from("equipment_units")
    .select("label,sort_order")
    .eq("equipment_id", equipmentId)
    .order("sort_order");

  if (listError) return { error: dbMessage(listError.code) };

  const used = new Set((existing || []).map((row) => String(row.label)));
  const maxOrder = Math.max(
    -1,
    ...(existing || []).map((row) => Number(row.sort_order) || 0),
  );
  const rows = [];
  let sequence = 1;

  while (rows.length < count) {
    const label = `#${String(sequence).padStart(2, "0")}`;
    sequence += 1;
    if (used.has(label)) continue;
    used.add(label);
    rows.push({
      equipment_id: equipmentId,
      label,
      status,
      sort_order: maxOrder + rows.length + 1,
    });
  }

  const { error } = await session.db.from("equipment_units").insert(rows);
  if (error) return { error: dbMessage(error.code) };

  revalidateEquipment(equipmentId);
  return { success: `Đã thêm ${count} thiết bị vào tồn kho.` };
}

export async function saveEquipmentUnit(
  equipmentId: string,
  unitId: string,
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  let payload;
  try {
    uuid(equipmentId);
    uuid(unitId);
    payload = {
      label: text(form, "label", 80),
      status: inventoryStatus(form),
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Tồn kho không hợp lệ.",
    };
  }

  const session = await requireAdmin().catch(() => null);
  if (!session) return { error: "Vui lòng đăng nhập lại." };

  const { data, error } = await session.db
    .from("equipment_units")
    .update(payload)
    .eq("id", unitId)
    .eq("equipment_id", equipmentId)
    .select("id")
    .single();

  if (error || !data) return { error: dbMessage(error?.code) };

  revalidateEquipment(equipmentId);
  return { success: "Đã cập nhật tình trạng." };
}

export async function deleteEquipmentUnit(
  equipmentId: string,
  unitId: string,
  _previous: ActionState,
): Promise<ActionState> {
  void _previous;
  try {
    uuid(equipmentId);
    uuid(unitId);
  } catch {
    return { error: "ID tồn kho không hợp lệ." };
  }

  const session = await requireAdmin().catch(() => null);
  if (!session) return { error: "Vui lòng đăng nhập lại." };

  const { data, error } = await session.db
    .from("equipment_units")
    .delete()
    .eq("id", unitId)
    .eq("equipment_id", equipmentId)
    .select("id")
    .single();

  if (error || !data) return { error: dbMessage(error?.code) };

  revalidateEquipment(equipmentId);
  return { success: "Đã xóa một thiết bị khỏi tồn kho." };
}

/* oni-rental-catalog-actions-v1:start */
function revalidateBackdrops(id?: string) { revalidatePath("/backdrops"); revalidatePath("/effect-backdrops"); revalidatePath("/admin/backdrops"); if (id) revalidatePath(`/admin/backdrops/${id}`); }
function revalidateProps(id?: string) { revalidatePath("/props"); revalidatePath("/admin/props"); if (id) revalidatePath(`/admin/props/${id}`); }
function rentalAssetPayload(form: FormData) {
 const images=imageList(form); const included=form.get("included")==="on"; const price=included?null:integer(form,"price",1000000000,true);
 if (!included && price===null) throw new Error("Hãy nhập giá thuê hoặc chọn Miễn phí.");
 return { name:text(form,"name",160), name_en:text(form,"name_en",160), slug:slug(form), description:{vi:text(form,"description_vi",3000,false),en:text(form,"description_en",3000,false)}, price:included?null:price, included, image_url:images[0]||null, images, published:form.get("published")==="on", sort_order:integer(form,"sort_order",100000)??0 };
}
export async function saveBackdrop(id:string|null,_previous:ActionState,form:FormData):Promise<ActionState>{ let payload; try { if(id)uuid(id); const kind=text(form,"kind",20); if(!["color","effect"].includes(kind)) throw new Error("Loại phông không hợp lệ."); payload={...rentalAssetPayload(form),kind}; } catch(error){ return {error:error instanceof Error?error.message:"Dữ liệu phông không hợp lệ."}; } const session=await requireAdmin().catch(()=>null); if(!session)return{error:"Vui lòng đăng nhập lại."}; const query=id?session.db.from("backdrops").update(payload).eq("id",id):session.db.from("backdrops").insert(payload); const {data,error}=await query.select("id").single(); if(error?.code==="23505")return{error:"Slug phông đã tồn tại."}; if(error||!data)return{error:"Không thể lưu phông. Kiểm tra migration 100_rental_catalog_split.sql và quyền Supabase."}; revalidateBackdrops(data.id); redirect("/admin/backdrops?saved=1"); }
export async function deleteBackdrop(id:string,_previous:ActionState):Promise<ActionState>{ void _previous; try{uuid(id)}catch{return{error:"ID phông không hợp lệ."}} const session=await requireAdmin().catch(()=>null); if(!session)return{error:"Vui lòng đăng nhập lại."}; const {data,error}=await session.db.from("backdrops").delete().eq("id",id).select("id").single(); if(error||!data)return{error:"Không thể xóa phông."}; revalidateBackdrops(id); redirect("/admin/backdrops?deleted=1"); }
export async function saveProp(id:string|null,_previous:ActionState,form:FormData):Promise<ActionState>{ let payload; try{if(id)uuid(id);payload=rentalAssetPayload(form)}catch(error){return{error:error instanceof Error?error.message:"Dữ liệu đạo cụ không hợp lệ."}} const session=await requireAdmin().catch(()=>null); if(!session)return{error:"Vui lòng đăng nhập lại."}; const query=id?session.db.from("props").update(payload).eq("id",id):session.db.from("props").insert(payload); const {data,error}=await query.select("id").single(); if(error?.code==="23505")return{error:"Slug đạo cụ đã tồn tại."}; if(error||!data)return{error:"Không thể lưu đạo cụ. Kiểm tra migration 100_rental_catalog_split.sql và quyền Supabase."}; revalidateProps(data.id); redirect("/admin/props?saved=1"); }
export async function deleteProp(id:string,_previous:ActionState):Promise<ActionState>{ void _previous; try{uuid(id)}catch{return{error:"ID đạo cụ không hợp lệ."}} const session=await requireAdmin().catch(()=>null); if(!session)return{error:"Vui lòng đăng nhập lại."}; const {data,error}=await session.db.from("props").delete().eq("id",id).select("id").single(); if(error||!data)return{error:"Không thể xóa đạo cụ."}; revalidateProps(id); redirect("/admin/props?deleted=1"); }
/* oni-rental-catalog-actions-v1:end */

export async function saveStudio(
  id: string | null,
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  void _previous;
  let payload;
  try {
    if (id) uuid(id);
    const area = integer(form, "area", 100000);
    const capacity = integer(form, "capacity", 10000);
    if (!area || !capacity) {
      throw new Error("Diện tích và sức chứa phải lớn hơn 0.");
    }
    payload = {
      name: text(form, "name", 160),
      slug: slug(form),
      description: {
        vi: text(form, "description_vi"),
        en: text(form, "description_en"),
      },
      area,
      capacity,
      price: integer(form, "price"),
      led_count: integer(form, "led_count", 100),
      images: imageList(form),
      published: form.get("published") === "on",
      sort_order: integer(form, "sort_order", 100000),
    };
    if (payload.images.length > 12) {
      throw new Error("Tối đa 12 ảnh cho một phòng.");
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Dữ liệu không hợp lệ.",
    };
  }

  const session = await requireAdmin().catch(() => null);
  if (!session) return { error: "Vui lòng đăng nhập lại." };

  if (id) {
    const { data, error } = await session.db
      .from("studios")
      .update(payload)
      .eq("id", id)
      .select("id")
      .single();

    if (error || !data) return { error: dbMessage(error?.code) };
  } else {
    const { data, error } = await session.db
      .from("studios")
      .insert(payload)
      .select("id")
      .single();

    if (error || !data) return { error: dbMessage(error?.code) };
  }

  revalidateStudios(id ?? undefined);
  redirect("/admin/studios?saved=1");
}

export async function deleteStudio(
  id: string,
  _previous: ActionState,
): Promise<ActionState> {
  void _previous;
  try {
    uuid(id);
  } catch {
    return { error: "ID phòng không hợp lệ." };
  }

  const session = await requireAdmin().catch(() => null);
  if (!session) return { error: "Vui lòng đăng nhập lại." };

  const { count, error: countError } = await session.db
    .from("studios")
    .select("id", { count: "exact", head: true });

  if (countError) {
    return { error: "Không thể kiểm tra số lượng phòng hiện tại." };
  }
  if ((count ?? 0) <= 1) {
    return { error: "Oni Studio phải có tối thiểu 1 phòng. Không thể xóa phòng cuối cùng." };
  }

  const { error } = await session.db.from("studios").delete().eq("id", id);
  if (error) {
    if (error.message?.includes("at_least_one_studio_required")) {
      return { error: "Oni Studio phải có tối thiểu 1 phòng. Không thể xóa phòng cuối cùng." };
    }
    return { error: "Không thể xóa phòng. Kiểm tra kết nối và quyền Supabase." };
  }

  revalidateStudios(id);
  redirect("/admin/studios?deleted=1");
}

export async function saveGallery(
  id: string | null,
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  let payload;
  let selectedCategory = "";

  try {
    if (id) uuid(id);

    selectedCategory = text(form, "category", 120);

    const images = imageList(form);
    if (!images.length) {
      throw new Error("Cần chọn ít nhất một ảnh cho bộ ảnh.");
    }
    if (images.length > 24) {
      throw new Error("Một bộ ảnh tối đa 24 hình.");
    }

    function optionalUrl(key: string) {
      const value = text(form, key, 1200, false);
      if (!value) return null;

      let parsed: URL;
      try {
        parsed = new URL(value);
      } catch {
        throw new Error(`Link ${key} không hợp lệ.`);
      }

      if (!["http:", "https:"].includes(parsed.protocol)) {
        throw new Error(`Link ${key} phải bắt đầu bằng http hoặc https.`);
      }

      return parsed.toString();
    }

    payload = {
      title: {
        vi: text(form, "title_vi", 200),
        en: text(form, "title_en", 200, false) || text(form, "title_vi", 200),
      },
      description: {
        vi: text(form, "description_vi", 3000, false),
        en: text(form, "description_en", 3000, false),
      },
      category: selectedCategory,
      image_url: images[0],
      images,
      facebook_url: optionalUrl("facebook_url"),
      instagram_url: optionalUrl("instagram_url"),
      photographer_name: text(form, "photographer_name", 160, false) || null,
      photographer_facebook_url: optionalUrl("photographer_facebook_url"),
      photographer_instagram_url: optionalUrl("photographer_instagram_url"),
      oni_production: form.get("oni_production") === "on",
      oni_lighting: form.get("oni_lighting") === "on",
      shot_at_oni: form.get("shot_at_oni") === "on",
      published: form.get("published") === "on",
      sort_order: integer(form, "sort_order", 99988) ?? 0,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Dữ liệu không hợp lệ.",
    };
  }

  const session = await requireAdmin().catch(() => null);
  if (!session) return { error: "Vui lòng đăng nhập lại." };

  const query = id
    ? session.db.from("gallery").update(payload).eq("id", id)
    : session.db.from("gallery").insert(payload);
  const { data, error } = await query.select("id").single();

  if (error?.code === "23503") {
    return { error: "Danh mục thư viện không tồn tại hoặc đã bị xóa." };
  }
  if (error || !data) return { error: dbMessage(error?.code) };

  revalidateGallery(data.id);
  redirect("/admin/gallery?saved=1");
}

export async function saveGalleryCategory(
  id: string | null,
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  let payload;

  try {
    if (id) uuid(id);

    const rawSlug = text(form, "slug", 120).toLowerCase();
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(rawSlug)) {
      throw new Error("Slug chỉ gồm chữ thường, số và dấu gạch nối.");
    }

    payload = {
      slug: rawSlug,
      name: {
        vi: text(form, "name_vi", 120),
        en: text(form, "name_en", 120),
      },
      sort_order: integer(form, "sort_order", 100000) ?? 0,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Dữ liệu không hợp lệ.",
    };
  }

  const session = await requireAdmin().catch(() => null);
  if (!session) return { error: "Vui lòng đăng nhập lại." };

  const query = id
    ? session.db
        .from("gallery_categories")
        .update(payload)
        .eq("id", id)
        .select("id")
        .single()
    : session.db
        .from("gallery_categories")
        .insert(payload)
        .select("id")
        .single();

  const { data, error } = await query;

  if (error?.code === "23505") {
    return { error: "Slug danh mục đã tồn tại." };
  }

  if (error || !data) {
    return {
      error:
        "Không thể lưu danh mục. Kiểm tra migration 006 và quyền Supabase.",
    };
  }

  revalidateGalleryCategories();
  return { success: id ? "Đã cập nhật danh mục." : "Đã thêm danh mục." };
}

export async function deleteGalleryCategory(
  id: string,
  _previous: ActionState,
): Promise<ActionState> {
  void _previous;

  try {
    uuid(id);
  } catch {
    return { error: "ID danh mục không hợp lệ." };
  }

  const session = await requireAdmin().catch(() => null);
  if (!session) return { error: "Vui lòng đăng nhập lại." };

  const { data: category, error: categoryError } = await session.db
    .from("gallery_categories")
    .select("slug")
    .eq("id", id)
    .maybeSingle();

  if (categoryError) {
    return {
      error:
        "Không thể đọc danh mục. Kiểm tra migration 006 và quyền Supabase.",
    };
  }

  if (!category) return { error: "Danh mục không tồn tại." };

  const { count, error: usageError } = await session.db
    .from("gallery")
    .select("id", { count: "exact", head: true })
    .eq("category", category.slug);

  if (usageError) {
    return { error: "Không thể kiểm tra album đang sử dụng danh mục." };
  }

  if ((count || 0) > 0) {
    return {
      error: `Danh mục đang được ${count} bộ ảnh sử dụng. Hãy đổi danh mục cho các album trước khi xóa.`,
    };
  }

  const { data, error } = await session.db
    .from("gallery_categories")
    .delete()
    .eq("id", id)
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Không thể xóa danh mục." };
  }

  revalidateGalleryCategories();
  return { success: "Đã xóa danh mục." };
}

export async function deleteGallery(
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
  if (!session) return { error: "Vui lòng đăng nhập lại." };

  const { error } = await session.db.from("gallery").delete().eq("id", id);
  if (error) return { error: "Không thể xóa ảnh." };

  revalidateGallery();
  return { success: "Đã xóa ảnh khỏi thư viện website." };
}


export async function reorderBackdrops(
  _previous: { error?: string; success?: string },
  form: FormData,
): Promise<{ error?: string; success?: string }> {
  return reorderRentalAssets("backdrop", form);
}

export async function reorderProps(
  _previous: { error?: string; success?: string },
  form: FormData,
): Promise<{ error?: string; success?: string }> {
  return reorderRentalAssets("prop", form);
}

async function reorderRentalAssets(
  assetType: "backdrop" | "prop",
  form: FormData,
): Promise<{ error?: string; success?: string }> {
  const rawIds = String(form.get("ids") ?? "[]");
  let ids: string[] = [];

  try {
    ids = JSON.parse(rawIds) as string[];
  } catch {
    return { error: "Dữ liệu sắp xếp không hợp lệ." };
  }

  if (
    !Array.isArray(ids) ||
    !ids.length ||
    ids.some((id) => typeof id !== "string" || !id.trim())
  ) {
    return { error: "Danh sách sắp xếp không hợp lệ." };
  }

  const session = await requireAdmin().catch(() => null);

  if (!session) {
    return { error: "Vui lòng đăng nhập lại." };
  }

  const table = assetType === "backdrop" ? "backdrops" : "props";
  const results = await Promise.all(
    ids.map((id, index) =>
      session.db.from(table).update({ sort_order: index }).eq("id", id),
    ),
  );

  const failed = results.find((result) => result.error);

  if (failed?.error) {
    return { error: "Không thể cập nhật thứ tự hiển thị." };
  }

  if (assetType === "backdrop") {
    revalidatePath("/backdrops");
    revalidatePath("/effect-backdrops");
    revalidatePath("/admin/backdrops");
  } else {
    revalidatePath("/props");
    revalidatePath("/admin/props");
  }

  return { success: "Đã cập nhật thứ tự hiển thị." };
}

