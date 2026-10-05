import type {
  Category,
  EquipmentStatus,
  EquipmentUnitStatus,
} from "@/types/catalog";

export function text(
  form: FormData,
  key: string,
  max = 5000,
  required = true,
) {
  const value = form.get(key);
  if (
    typeof value !== "string" ||
    (required && !value.trim()) ||
    value.length > max
  ) {
    throw new Error(`Kiểm tra trường ${key} (tối đa ${max} ký tự).`);
  }
  return value.trim();
}

export function uuid(value: string) {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value,
    )
  ) {
    throw new Error("ID không hợp lệ.");
  }
  return value;
}

export function slug(form: FormData, key = "slug") {
  const value = text(form, key, 120);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    throw new Error("Slug chỉ gồm chữ thường không dấu, số và dấu gạch nối.");
  }
  return value;
}

export function integer(
  form: FormData,
  key: string,
  max = 1000000000,
  nullable = false,
) {
  const value = text(form, key, 20, false);
  if (!value && nullable) return null;
  if (!/^\d+$/.test(value)) {
    throw new Error(`Trường ${key} cần là số nguyên không âm.`);
  }
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n < 0 || n > max) {
    throw new Error(`Trường ${key} nằm ngoài giới hạn.`);
  }
  return n;
}

export function imageUrl(value: string) {
  if (!value) return null;
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloud) throw new Error("Cần cấu hình Cloudinary trước khi thêm ảnh.");
  try {
    const u = new URL(value);
    if (
      u.protocol !== "https:" ||
      u.hostname !== "res.cloudinary.com" ||
      !u.pathname.startsWith(`/${cloud}/image/upload/`) ||
      u.username ||
      u.password ||
      u.hash ||
      value.length > 2048
    ) {
      throw new Error();
    }
    return u.toString();
  } catch {
    throw new Error("Ảnh phải là URL HTTPS từ Cloudinary của dự án.");
  }
}

export function imageList(form: FormData): string[] {
  if (form.get("media_blocked") === "1") {
    throw new Error("Chờ tải xong hoặc bỏ ảnh lỗi trước khi lưu.");
  }
  const raw = text(form, "images", 25000, false)
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
  if (raw.length > 12) throw new Error("Tối đa 12 ảnh.");
  return [...new Set(raw.map((x) => imageUrl(x)!))];
}

export function inventoryStatus(form: FormData, key = "status") {
  const status = text(form, key, 30);
  if (
    !["available", "rented", "maintenance", "unavailable"].includes(status)
  ) {
    throw new Error("Tình trạng tồn kho không hợp lệ.");
  }
  return status as EquipmentUnitStatus;
}

export function equipmentPayload(form: FormData) {
  const images = imageList(form);
  const category = text(form, "category", 120);
  const status = text(form, "status", 30);

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(category)) {
    throw new Error("Danh mục không hợp lệ.");
  }
  if (
    !["contact", "available", "maintenance", "unavailable"].includes(status)
  ) {
    throw new Error("Tình trạng không hợp lệ.");
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
    included: form.get("included") === "on",
    status: status as EquipmentStatus,
    images,
    image_url: images[0] || null,
    featured: form.get("featured") === "on",
    published: form.get("published") === "on",
    sort_order: integer(form, "sort_order", 100000),
  };
}
