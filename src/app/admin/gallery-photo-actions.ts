"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { CATALOG_CACHE_TAG } from "@/lib/cache-tags";
import type { ActionState } from "@/types/catalog";

function parseGalleryUrls(form: FormData) {
  if (form.get("media_blocked") === "1") {
    throw new Error("Chờ ảnh tải xong hoặc bỏ ảnh lỗi trước khi lưu.");
  }

  const raw = String(form.get("images") ?? "");
  if (raw.length > 100000) {
    throw new Error("Danh sách ảnh quá lớn.");
  }

  const urls = Array.from(
    new Set(
      raw
        .split("\n")
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );

  if (urls.length > 120) {
    throw new Error("Thư viện hỗ trợ tối đa 120 ảnh.");
  }

  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  for (const value of urls) {
    let parsed: URL;

    try {
      parsed = new URL(value);
    } catch {
      throw new Error("Có URL ảnh không hợp lệ.");
    }

    if (
      parsed.protocol !== "https:" ||
      parsed.hostname !== "res.cloudinary.com" ||
      !cloud ||
      !parsed.pathname.startsWith(`/${cloud}/image/upload/`) ||
      parsed.username ||
      parsed.password ||
      parsed.hash
    ) {
      throw new Error("Ảnh phải là URL Cloudinary của Oni Studio.");
    }
  }

  return urls;
}

function galleryDbMessage(code?: string) {
  if (["42883", "PGRST202", "42P01"].includes(code || "")) {
    return "Chưa có bản sửa Gallery V1.1. Hãy chạy migration 141_gallery_pinterest_repair.sql.";
  }

  if (code === "42501") {
    return "Phiên quản trị không còn quyền cập nhật. Hãy đăng xuất rồi đăng nhập lại.";
  }

  if (code === "22023") {
    return "Thư viện đang vượt quá giới hạn 120 ảnh.";
  }

  return `Không thể cập nhật thư viện ảnh${code ? ` (mã ${code})` : ""}. Vui lòng thử lại.`;
}

export async function saveGalleryPhotos(
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  let urls: string[];

  try {
    urls = parseGalleryUrls(form);
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Danh sách ảnh không hợp lệ.",
    };
  }

  const session = await requireAdmin().catch(() => null);
  if (!session) {
    return { error: "Phiên quản trị đã hết hạn. Vui lòng đăng nhập lại." };
  }

  const startedAt = performance.now();

  const { error } = await session.db.rpc("replace_gallery_photos", {
    p_urls: urls,
  });

  if (error) {
    console.error("[gallery] replace_gallery_photos failed", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      count: urls.length,
      durationMs: Math.round(performance.now() - startedAt),
    });

    return { error: galleryDbMessage(error.code) };
  }

  console.info("[gallery] saved", {
    count: urls.length,
    durationMs: Math.round(performance.now() - startedAt),
  });

  updateTag(CATALOG_CACHE_TAG);
  revalidatePath("/gallery");
  revalidatePath("/en/gallery");
  revalidatePath("/admin/gallery");

  return {
    success: urls.length
      ? `Đã cập nhật ${urls.length} ảnh trên website.`
      : "Đã làm trống thư viện ảnh.",
  };
}
