"use client";

import { useActionState, useState } from "react";
import { Save, Trash2 } from "lucide-react";
import { deleteStudio, saveStudio } from "@/app/admin/actions";
import { ImageUpload } from "./image-upload";
import { DeleteForm } from "./delete-form";
import { VndInput } from "./vnd-input";
import type { Studio } from "@/types/catalog";

export function StudioForm({
  item,
  canDelete = true,
}: {
  item?: Studio;
  canDelete?: boolean;
}) {
  const [state, action, pending] = useActionState(
    saveStudio.bind(null, item?.id ?? null),
    {},
  );
  const [mediaBlocked, setMediaBlocked] = useState(false);
  const editing = Boolean(item);

  return (
    <div className="studio-admin-editor">
      <form className="form-panel studio-admin-form" action={action}>
        <div className="studio-admin-form-head">
          <div>
            <p className="eyebrow">{editing ? "EDIT ROOM" : "NEW ROOM"}</p>
            <h2>{editing ? item?.name : "Tạo phòng studio mới"}</h2>
            <p className="muted">
              Quản lý thông tin, giá thuê, hình ảnh và trạng thái hiển thị của phòng.
            </p>
          </div>
        </div>

        <div className="form-grid studio-admin-form-grid">
          <label className="form-field">
            <span>Tên phòng</span>
            <input
              name="name"
              required
              maxLength={160}
              defaultValue={item?.name ?? ""}
              placeholder="Room D"
            />
          </label>

          <label className="form-field">
            <span>Slug</span>
            <input
              name="slug"
              required
              maxLength={120}
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              defaultValue={item?.slug ?? ""}
              placeholder="room-d"
            />
            <small>Chữ thường không dấu, số và dấu gạch nối.</small>
          </label>

          <label className="form-field">
            <span>Diện tích (m²)</span>
            <input
              name="area"
              type="number"
              min="1"
              step="1"
              max="100000"
              required
              defaultValue={item?.area ?? 80}
            />
          </label>

          <label className="form-field">
            <span>Sức chứa (người)</span>
            <input
              name="capacity"
              type="number"
              min="1"
              step="1"
              max="10000"
              required
              defaultValue={item?.capacity ?? 10}
            />
          </label>

          <label className="form-field">
            <span>Giá mỗi giờ (VNĐ)</span>
            <VndInput
              name="price"
              defaultValue={item?.price}
              placeholder="300.000"
            />
            <small>Ví dụ: nhập 300000 sẽ hiển thị 300.000 VNĐ.</small>
          </label>

          <label className="form-field">
            <span>Số đèn Nanlite 300B đi kèm</span>
            <input
              name="led_count"
              type="number"
              min="0"
              step="1"
              max="100"
              required
              defaultValue={item?.led_count ?? 1}
            />
          </label>

          <label className="form-field">
            <span>Thứ tự</span>
            <input
              name="sort_order"
              type="number"
              min="0"
              step="1"
              max="100000"
              required
              defaultValue={item?.sort_order ?? 0}
            />
          </label>

          <label className="form-field studio-admin-description">
            <span>Mô tả (VI)</span>
            <textarea
              name="description_vi"
              required
              maxLength={5000}
              defaultValue={item?.description.vi ?? ""}
              placeholder="Mô tả không gian, concept phù hợp và tiện ích của phòng."
            />
          </label>

          <label className="form-field studio-admin-description">
            <span>Mô tả (EN)</span>
            <textarea
              name="description_en"
              required
              maxLength={5000}
              defaultValue={item?.description.en ?? ""}
              placeholder="Describe the space, suitable concepts and room facilities."
            />
          </label>

          <ImageUpload
            initialUrls={item?.images ?? []}
            onBlockedChange={setMediaBlocked}
          />

          <label className="check-field studio-admin-publish">
            <input
              type="checkbox"
              name="published"
              defaultChecked={item?.published ?? true}
            />
            Hiển thị công khai
          </label>
        </div>

        {state.error && (
          <p role="alert" className="notice error">
            {state.error}
          </p>
        )}

        {state.success && (
          <p role="status" className="notice success">
            {state.success}
          </p>
        )}

        <div className="form-actions studio-admin-form-actions">
          <button className="button" disabled={pending || mediaBlocked}>
            <Save size={17} aria-hidden="true" />
            <span>
              {pending
                ? "Đang lưu..."
                : editing
                  ? "Lưu thay đổi"
                  : "Thêm phòng"}
            </span>
          </button>
        </div>
      </form>

      {item && (
        <section className="studio-admin-danger-zone" aria-labelledby="studio-delete-heading">
          <div>
            <p className="eyebrow">DANGER ZONE</p>
            <h3 id="studio-delete-heading">Xóa phòng</h3>
            <p className="muted">
              Hệ thống luôn giữ tối thiểu một phòng studio. Ảnh gốc trên Cloudinary
              không bị xóa khi xóa bản ghi phòng.
            </p>
          </div>
          {canDelete ? (
            <DeleteForm
              action={deleteStudio.bind(null, item.id)}
              label={`phòng "${item.name}"`}
            />
          ) : (
            <button className="button danger-button" type="button" disabled>
              <Trash2 size={17} aria-hidden="true" />
              <span>Không thể xóa phòng cuối cùng</span>
            </button>
          )}
        </section>
      )}
    </div>
  );
}