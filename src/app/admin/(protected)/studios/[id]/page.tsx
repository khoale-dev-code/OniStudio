import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/auth";
import type { Studio } from "@/types/catalog";
import { StudioForm } from "@/components/admin/studio-form";

export default async function Edit({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, { db }] = await Promise.all([params, requireAdminPage()]);
  const [studioResult, countResult] = await Promise.all([
    db.from("studios").select("*").eq("id", id).maybeSingle(),
    db.from("studios").select("id", { count: "exact", head: true }),
  ]);

  if (studioResult.error || !studioResult.data) notFound();
  if (countResult.error) throw new Error("Studio count unavailable");

  return (
    <>
      <div className="admin-title">
        <div>
          <p className="eyebrow">EDIT ROOM</p>
          <h1>Chỉnh sửa phòng</h1>
          <p>Cập nhật thông tin, giá thuê, hình ảnh hoặc xóa phòng khi không còn sử dụng.</p>
        </div>
      </div>
      <StudioForm
        item={studioResult.data as Studio}
        canDelete={(countResult.count ?? 0) > 1}
      />
    </>
  );
}
