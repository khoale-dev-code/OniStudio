import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { requireAdminPage } from "@/lib/auth";
import { deleteStudio } from "@/app/admin/actions";
import { DeleteForm } from "@/components/admin/delete-form";
import type { Studio } from "@/types/catalog";

function formatVnd(value: number) {
  return `${new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(value)} VNĐ`;
}

export default async function Rooms({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  const [{ db }, query] = await Promise.all([requireAdminPage(), searchParams]);
  const { data, error } = await db
    .from("studios")
    .select("id,name,area,capacity,price,published,sort_order")
    .order("sort_order");

  if (error) throw new Error("Studios unavailable");

  const rooms = (data || []) as Studio[];
  const canDelete = rooms.length > 1;

  return (
    <div className="studio-admin-page">
      <div className="admin-title studio-admin-title">
        <div>
          <p className="eyebrow">STUDIO ROOMS</p>
          <h1>Phòng studio</h1>
          <p>
            Thêm, sửa, xóa phòng và quản lý giá thuê. Hệ thống luôn giữ tối thiểu
            một phòng.
          </p>
        </div>
        <Link className="button studio-add-button" href="/admin/studios/new">
          <Plus size={18} aria-hidden="true" />
          <span>Thêm phòng</span>
        </Link>
      </div>

      {query.saved && (
        <p className="notice success" role="status">
          Đã lưu phòng studio.
        </p>
      )}
      {query.deleted && (
        <p className="notice success" role="status">
          Đã xóa phòng studio.
        </p>
      )}

      <div className="studio-admin-summary">
        <div>
          <span>Tổng số phòng</span>
          <strong>{rooms.length}</strong>
        </div>
        <p>
          {canDelete
            ? "Có thể xóa phòng, nhưng phải giữ lại ít nhất 1 phòng."
            : "Đây là phòng cuối cùng nên chức năng xóa đang được khóa."}
        </p>
      </div>

      <div className="studio-admin-grid">
        {rooms.map((room) => (
          <article className="studio-admin-card" key={room.id}>
            <div className="studio-admin-card-top">
              <div>
                <span className="studio-admin-room-order">#{room.sort_order + 1}</span>
                <h2>{room.name}</h2>
                <p>
                  {room.area} m² · {room.capacity} người
                </p>
              </div>
              <span
                className={`studio-admin-visibility ${room.published ? "is-published" : "is-hidden"}`}
              >
                {room.published ? "Đang hiển thị" : "Đang ẩn"}
              </span>
            </div>

            <div className="studio-admin-price">
              <span>Giá mỗi giờ</span>
              <strong>{formatVnd(room.price)}</strong>
            </div>

            <div className="studio-admin-card-actions">
              <Link
                className="button button-outline studio-edit-button"
                href={`/admin/studios/${room.id}`}
              >
                <Pencil size={16} aria-hidden="true" />
                <span>Chỉnh sửa</span>
              </Link>

              {canDelete ? (
                <DeleteForm
                  action={deleteStudio.bind(null, room.id)}
                  label={`phòng "${room.name}"`}
                />
              ) : (
                <button className="button danger-button" type="button" disabled>
                  <Trash2 size={16} aria-hidden="true" />
                  <span>Giữ phòng cuối</span>
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}