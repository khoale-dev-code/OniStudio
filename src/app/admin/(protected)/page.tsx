import Link from "next/link";
import { requireAdminPage } from "@/lib/auth";
export default async function Dashboard() {
  const { db, user } = await requireAdminPage();
  const [equipment, backdrops, props, studios, gallery] = await Promise.all([
    db.from("equipment").select("id", { count: "exact", head: true }).neq("category", "backdrop"),
    db.from("backdrops").select("id", { count: "exact", head: true }),
    db.from("props").select("id", { count: "exact", head: true }),
    db.from("studios").select("id", { count: "exact", head: true }),
    db.from("gallery").select("id", { count: "exact", head: true }),
  ]);
  if (equipment.error || studios.error || gallery.error) throw new Error("Dashboard unavailable");
  const cards = [
    ["Thiết bị cho thuê", "/admin/equipment", equipment.count ?? 0],
    ["Phông", "/admin/backdrops", backdrops.error ? 0 : backdrops.count ?? 0],
    ["Đạo cụ", "/admin/props", props.error ? 0 : props.count ?? 0],
    ["Không gian", "/admin/studios", studios.count ?? 0],
    ["Hình ảnh thực tế", "/admin/gallery", gallery.count ?? 0],
  ] as const;
  return <>
    <div className="admin-title"><div><p className="eyebrow">ONI STUDIO / ADMIN</p><h1>Tổng quan</h1><p>{user.email}</p></div><Link className="button" href="/admin/equipment/new">Thêm thiết bị</Link></div>
    {(backdrops.error || props.error) && <p className="notice error" role="alert">Chưa có bảng Phông / Đạo cụ. Hãy chạy migration 100_rental_catalog_split.sql trên Supabase.</p>}
    <div className="admin-grid admin-grid-rental">{cards.map(([label, href, count]) => <Link className="stat-card" href={href} key={href}><span>{label}</span><strong>{count}</strong></Link>)}</div>
    <div className="form-panel"><h2>Quản trị đã tách đúng theo loại tài sản.</h2><p className="admin-hint">Thiết bị, Phông và Đạo cụ được lưu và quản lý riêng. Phông và Đạo cụ có tên, hình ảnh, mức phí hoặc miễn phí, thứ tự và trạng thái công khai riêng.</p></div>
  </>;
}
