"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { saveEquipment, deleteEquipment } from "@/app/admin/actions";
import { statusLabels } from "@/data/site";
import { ImageUpload } from "./image-upload";
import { DeleteForm } from "./delete-form";
import { VndInput } from "./vnd-input";
import type { Equipment, EquipmentCategory } from "@/types/catalog";

export function EquipmentForm({
  item,
  categories,
}: {
  item?: Equipment;
  categories: EquipmentCategory[];
}) {
  const [state, action, pending] = useActionState(
    saveEquipment.bind(null, item?.id ?? null),
    {},
  );
  const [mediaBlocked, setMediaBlocked] = useState(false);

  return (
    <>
      <form action={action} className="form-panel">
        <div className="form-grid">
          <label className="form-field">
            <span>Tên thiết bị (VN)</span>
            <input
              name="name"
              defaultValue={item?.name}
              required
              maxLength={160}
            />
          </label>
          <label className="form-field">
            <span>Tên thiết bị (EN)</span>
            <input
              name="name_en"
              defaultValue={item?.name_en}
              required
              maxLength={160}
            />
          </label>
          <label className="form-field">
            <span>Slug đường dẫn</span>
            <input
              name="slug"
              defaultValue={item?.slug}
              required
              maxLength={120}
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              placeholder="aputure-storm-400x"
            />
            <small>Chữ thường không dấu, số và dấu gạch nối.</small>
          </label>
          <label className="form-field">
            <span>Danh mục</span>
            <select
              name="category"
              defaultValue={item?.category || categories[0]?.slug || ""}
              required
            >
              {categories.map((category) => (
                <option value={category.slug} key={category.id}>
                  {category.name.vi}
                </option>
              ))}
            </select>
            <small>
              Có thể thêm, sửa hoặc xóa danh mục tại trang Quản lý danh mục.
            </small>
          </label>
          <label className="form-field">
            <span>Tình trạng mặc định</span>
            <select name="status" defaultValue={item?.status || "contact"}>
              {Object.entries(statusLabels).map(([key, label]) => (
                <option value={key} key={key}>
                  {label.vi}
                </option>
              ))}
            </select>
            <small>
              Dùng khi chưa khai báo tồn kho. Khi đã có tồn kho, website ưu tiên
              số lượng và trạng thái từng thiết bị.
            </small>
          </label>
          <label className="form-field">
            <span>Giá thuê</span>
            <VndInput name="price" defaultValue={item?.price} />
            <small>
              Nhập số tiền, giao diện tự định dạng. Ví dụ: 250.000 VNĐ. Để
              trống nếu cần liên hệ báo giá.
            </small>
          </label>
          <label className="form-field">
            <span>Thứ tự hiển thị</span>
            <input
              type="number"
              name="sort_order"
              min="0"
              max="100000"
              step="1"
              required
              defaultValue={item?.sort_order ?? 0}
            />
          </label>
          {(["vi", "en"] as const).map((lang) => (
            <label key={lang} className="form-field">
              <span>Đơn vị ({lang.toUpperCase()})</span>
              <input
                name={`unit_${lang}`}
                required
                maxLength={40}
                defaultValue={
                  item?.unit[lang] || (lang === "vi" ? "đèn" : "light")
                }
              />
            </label>
          ))}
          {(["vi", "en"] as const).map((lang) => (
            <label key={lang} className="form-field">
              <span>Mô tả ({lang.toUpperCase()})</span>
              <textarea
                name={`description_${lang}`}
                required
                maxLength={5000}
                defaultValue={item?.description[lang]}
              />
            </label>
          ))}
          {(["vi", "en"] as const).map((lang) => (
            <label key={lang} className="form-field">
              <span>Thông số ({lang.toUpperCase()})</span>
              <textarea
                name={`specifications_${lang}`}
                required
                maxLength={5000}
                defaultValue={item?.specifications[lang]}
              />
            </label>
          ))}
          <ImageUpload
            initialUrls={
              item?.images?.length
                ? item.images
                : item?.image_url
                  ? [item.image_url]
                  : []
            }
            onBlockedChange={setMediaBlocked}
          />
          <div className="form-field full">
            <label className="check-field">
              <input
                type="checkbox"
                name="included"
                defaultChecked={item?.included}
              />
              Miễn phí kèm phòng
            </label>
            <label className="check-field">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={item?.featured}
              />
              Thiết bị nổi bật trên trang chủ
            </label>
            <label className="check-field">
              <input
                type="checkbox"
                name="published"
                defaultChecked={item?.published ?? true}
              />
              Hiển thị công khai
            </label>
          </div>
        </div>
        {state.error && (
          <p className="notice error" role="alert">
            {state.error}
          </p>
        )}
        <div className="form-actions">
          <button className="button" disabled={pending || mediaBlocked}>
            {pending ? "Đang lưu..." : "Lưu thiết bị"}
          </button>
          <Link className="button button-outline" href="/admin/equipment">
            Quay lại
          </Link>
          <Link className="text-link" href="/admin/categories">
            Quản lý danh mục
          </Link>
        </div>
      </form>
      {item && (
        <div className="form-actions">
          <DeleteForm
            action={deleteEquipment.bind(null, item.id)}
            label="thiết bị"
          />
        </div>
      )}
    </>
  );
}
