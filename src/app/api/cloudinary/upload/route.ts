import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { adminSession } from "@/lib/auth";
export const runtime = "nodejs";
const fail = (error: string, status: number) =>
  NextResponse.json({ error }, { status });
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const allowed = new Set(
    [new URL(request.url).origin, process.env.NEXT_PUBLIC_SITE_URL].filter(
      Boolean,
    ),
  );
  let sameHost = false;
  try {
    const parsed = new URL(origin || "");
    sameHost =
      ["http:", "https:"].includes(parsed.protocol) &&
      parsed.host === request.headers.get("host");
  } catch {
    sameHost = false;
  }
  if (!origin || (!allowed.has(origin) && !sameHost))
    return fail("Nguồn yêu cầu không hợp lệ.", 403);
  if (!(await adminSession())) return fail("Bạn cần đăng nhập quản trị.", 401);
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    key = process.env.CLOUDINARY_API_KEY,
    secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud || !key || !secret)
    return fail("Chưa cấu hình Cloudinary trên máy chủ.", 503);
  if (Number(request.headers.get("content-length")) > 9 * 1024 * 1024)
    return fail("Ảnh tối đa 8 MB.", 413);
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (
      !(file instanceof File) ||
      file.size === 0 ||
      file.size > 8 * 1024 * 1024
    )
      return fail("Ảnh trống hoặc lớn hơn 8 MB.", 400);
    const bytes = new Uint8Array(await file.arrayBuffer());
    const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    const png = bytes.slice(0, 8).join(",") === "137,80,78,71,13,10,26,10";
    const webp =
      Buffer.from(bytes.slice(0, 4)).toString() === "RIFF" &&
      Buffer.from(bytes.slice(8, 12)).toString() === "WEBP";
    if (
      !(jpeg && file.type === "image/jpeg") &&
      !(png && file.type === "image/png") &&
      !(webp && file.type === "image/webp")
    )
      return fail("Chỉ hỗ trợ ảnh JPEG, PNG, WebP hợp lệ.", 400);
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const folder = "oni-studio";
    const signature = createHash("sha1")
      .update(`folder=${folder}&timestamp=${timestamp}${secret}`)
      .digest("hex");
    const payload = new FormData();
    payload.set("file", file);
    payload.set("folder", folder);
    payload.set("timestamp", timestamp);
    payload.set("api_key", key);
    payload.set("signature", signature);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud)}/image/upload`,
      { method: "POST", body: payload, signal: AbortSignal.timeout(30000) },
    );
    const data = (await res.json()) as {
      secure_url?: string;
      public_id?: string;
    };
    if (!res.ok || !data.secure_url)
      return fail(
        "Cloudinary chưa nhận được ảnh. Kiểm tra cấu hình hoặc thử lại.",
        502,
      );
    return NextResponse.json(
      { url: data.secure_url, publicId: data.public_id },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return fail("Không thể tải ảnh. Vui lòng thử lại.", 500);
  }
}
