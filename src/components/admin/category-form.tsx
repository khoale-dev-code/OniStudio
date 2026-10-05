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
  deleteEquipmentCategory,
  saveEquipmentCategory,
} from "@/app/admin/actions";
import { DeleteForm } from "./delete-form";
import type { EquipmentCategory } from "@/types/catalog";

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

function EquipmentCategoryEditor({
  item,
  compact = false,
}: {
  item?: EquipmentCategory;
  compact?: boolean;
}) {
  const [state, action, pending] = useActionState(
    saveEquipmentCategory.bind(null, item?.id ?? null),
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
      className={`equipment-category-editor${
        compact ? " equipment-category-editor--compact" : ""
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
          placeholder="Đèn LED"
        />
      </label>

      <label className="form-field">
        <span>Tên danh mục (EN)</span>
        <input
          name="name_en"
          defaultValue={item?.name.en}
          required
          maxLength={120}
          placeholder="Continuous light"
        />
      </label>

      <div className="form-field equipment-category-slug-field">
        <span>Slug</span>
        <div className="equipment-category-slug-control">
          <input
            name="slug"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            required
            maxLength={120}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            placeholder="den-led"
          />
          <button
            type="button"
            className="equipment-category-auto-slug"
            onClick={generateSlug}
            disabled={!nameVi.trim()}
            title="Tạo slug tự động từ tên tiếng Việt"
          >
            <WandSparkles size={15} aria-hidden="true" />
            <span>Tự động</span>
          </button>
        </div>
        <small>Chữ thường, không dấu, số và dấu gạch nối.</small>
      </div>

      <label className="form-field equipment-category-order-field">
        <span>Thứ tự</span>
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

      {state.error && (
        <p className="notice error equipment-category-message" role="alert">
          {state.error}
        </p>
      )}

      {state.success && (
        <p className="notice success equipment-category-message" role="status">
          {state.success}
        </p>
      )}

      <div className="equipment-category-editor-actions">
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

export function CategoryForm({ item }: { item?: EquipmentCategory }) {
  if (!item) {
    return (
      <div className="equipment-category-create-card">
        <div className="equipment-category-create-icon" aria-hidden="true">
          <Tags size={18} />
        </div>

        <div className="equipment-category-create-content">
          <div className="equipment-category-create-heading">
            <div>
              <p className="eyebrow">DANH MỤC MỚI</p>
              <h3>Tạo danh mục thiết bị</h3>
            </div>
            <span className="equipment-category-create-badge">Bản ghi mới</span>
          </div>

          <EquipmentCategoryEditor />
        </div>
      </div>
    );
  }

  return (
    <details className="equipment-category-row">
      <summary>
        <span className="equipment-category-row-index">
          {String(item.sort_order + 1).padStart(2, "0")}
        </span>

        <span className="equipment-category-row-name">
          <strong>{item.name.vi}</strong>
          <small>{item.name.en}</small>
        </span>

        <code className="equipment-category-row-slug">/{item.slug}</code>

        <span className="equipment-category-row-order">
          Thứ tự {item.sort_order}
        </span>

        <span className="equipment-category-row-action">
          <PencilLine size={15} aria-hidden="true" />
          Sửa
        </span>

        <ChevronDown
          className="equipment-category-row-chevron"
          size={18}
          aria-hidden="true"
        />
      </summary>

      <div className="equipment-category-row-panel">
        <EquipmentCategoryEditor item={item} compact />

        <div className="equipment-category-danger">
          <div>
            <strong>Xóa danh mục</strong>
            <p>
              Chỉ có thể xóa khi không còn thiết bị nào đang dùng danh mục này.
            </p>
          </div>

          <DeleteForm
            action={deleteEquipmentCategory.bind(null, item.id)}
            label={`danh mục "${item.name.vi}"`}
          />
        </div>
      </div>
    </details>
  );
}
