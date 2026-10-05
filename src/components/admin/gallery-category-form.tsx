"use client";

import { useActionState, useState } from "react";
import {
  ChevronDown,
  PencilLine,
  Plus,
  Save,
  Tags,
  WandSparkles,
} from "lucide-react";
import {
  deleteGalleryCategory,
  saveGalleryCategory,
} from "@/app/admin/actions";
import { DeleteForm } from "./delete-form";
import type { GalleryCategory } from "@/types/catalog";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function CategoryEditor({
  item,
  compact = false,
}: {
  item?: GalleryCategory;
  compact?: boolean;
}) {
  const [state, action, pending] = useActionState(
    saveGalleryCategory.bind(null, item?.id ?? null),
    {},
  );

  const [nameVi, setNameVi] = useState(item?.name.vi ?? "");
  const [slug, setSlug] = useState(item?.slug ?? "");

  function generateSlug() {
    setSlug(slugify(nameVi));
  }

  return (
    <form
      action={action}
      className={`gallery-category-editor${
        compact ? " gallery-category-editor--compact" : ""
      }`}
    >
      <label className="form-field">
        <span>Tên danh mục (VN)</span>
        <input
          name="name_vi"
          value={nameVi}
          onChange={(event) => setNameVi(event.target.value)}
          required
          maxLength={120}
          placeholder="Thời trang"
        />
      </label>

      <label className="form-field">
        <span>Tên danh mục (EN)</span>
        <input
          name="name_en"
          defaultValue={item?.name.en}
          required
          maxLength={120}
          placeholder="Fashion"
        />
      </label>

      <div className="form-field gallery-category-slug-field">
        <span>Slug</span>
        <div className="gallery-category-slug-control">
          <input
            name="slug"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            required
            maxLength={120}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            placeholder="thoi-trang"
          />
          <button
            type="button"
            className="gallery-category-auto-slug"
            onClick={generateSlug}
            disabled={!nameVi.trim()}
            title="Tạo slug từ tên tiếng Việt"
          >
            <WandSparkles size={15} aria-hidden="true" />
            <span>Tự động</span>
          </button>
        </div>
        <small>
          Chỉ gồm chữ thường, số và dấu gạch nối.
        </small>
      </div>

      <label className="form-field gallery-category-order-field">
        <span>Thứ tự</span>
        <input
          name="sort_order"
          type="number"
          min="0"
          max="100000"
          step="1"
          required
          defaultValue={item?.sort_order ?? 0}
        />
      </label>

      {state.error && (
        <p className="notice error gallery-category-editor-message" role="alert">
          {state.error}
        </p>
      )}

      {state.success && (
        <p className="notice success gallery-category-editor-message" role="status">
          {state.success}
        </p>
      )}

      <div className="gallery-category-editor-actions">
        <button className="button button-small" disabled={pending}>
          {item ? (
            <Save size={16} aria-hidden="true" />
          ) : (
            <Plus size={16} aria-hidden="true" />
          )}
          {pending
            ? "Đang lưu..."
            : item
              ? "Lưu thay đổi"
              : "Thêm danh mục"}
        </button>
      </div>
    </form>
  );
}

export function GalleryCategoryForm({
  item,
}: {
  item?: GalleryCategory;
}) {
  if (!item) {
    return (
      <div className="gallery-category-create-card">
        <div className="gallery-category-create-icon" aria-hidden="true">
          <Tags size={18} />
        </div>
        <div className="gallery-category-create-body">
          <CategoryEditor />
        </div>
      </div>
    );
  }

  return (
    <details className="gallery-category-row">
      <summary>
        <div className="gallery-category-row-index">
          {String(item.sort_order + 1).padStart(2, "0")}
        </div>

        <div className="gallery-category-row-main">
          <strong>{item.name.vi}</strong>
          <span>{item.name.en}</span>
        </div>

        <code className="gallery-category-row-slug">/{item.slug}</code>

        <span className="gallery-category-row-order">
          Thứ tự {item.sort_order}
        </span>

        <span className="gallery-category-row-edit">
          <PencilLine size={15} aria-hidden="true" />
          Sửa
        </span>

        <ChevronDown
          className="gallery-category-row-chevron"
          size={18}
          aria-hidden="true"
        />
      </summary>

      <div className="gallery-category-row-editor">
        <CategoryEditor item={item} compact />

        <div className="gallery-category-row-danger">
          <div>
            <strong>Xóa danh mục</strong>
            <p>
              Chỉ có thể xóa khi không còn album nào đang dùng danh mục này.
            </p>
          </div>
          <DeleteForm
            action={deleteGalleryCategory.bind(null, item.id)}
            label={`danh mục "${item.name.vi}"`}
          />
        </div>
      </div>
    </details>
  );
}
