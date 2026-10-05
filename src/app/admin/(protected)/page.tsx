import Link from "next/link";
import { requireAdminPage } from "@/lib/auth";
export default async function Dashboard() {
  const { db, user } = await requireAdminPage();
  const results = await Promise.all(
    ["equipment", "studios", "gallery"].map((t) =>
      db.from(t).select("id", { count: "exact", head: true }),
    ),
  );
  if (results.some((r) => r.error)) throw new Error("Dashboard unavailable");
  return (
    <>
      <div className="admin-title">
        <div>
          <p className="eyebrow">ONI STUDIO / ADMIN</p>
          <h1>Tổng quan</h1>
          <p>{user.email}</p>
        </div>
        <Link className="button" href="/admin/equipment/new">
          Thêm thiết bị
        </Link>
      </div>
      <div className="admin-grid">
        {["Thiết bị", "Phòng studio", "Ảnh thư viện"].map((t, i) => (
          <Link
            className="stat-card"
            href={["/admin/equipment", "/admin/studios", "/admin/gallery"][i]}
            key={t}
          >
            <span>{t}</span>
            <strong>{results[i].count ?? 0}</strong>
          </Link>
        ))}
      </div>
      <div className="form-panel">
        <h2>Sẵn sàng cho buổi chụp tiếp theo.</h2>
        <p className="admin-hint">
          Cập nhật giá, tình trạng và hình ảnh thiết bị. Mục tắt “Hiển thị công
          khai” sẽ được ẩn khỏi website. Ảnh upload được lưu ở Cloudinary; dữ
          liệu được lưu trong Supabase.
        </p>
        <p className="admin-hint">
          Xóa mục chỉ xóa bản ghi website, không xóa ảnh gốc ở Cloudinary.
        </p>
      </div>
    </>
  );
}
