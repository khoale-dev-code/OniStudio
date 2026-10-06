"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  deleteBackdrop,
  deleteProp,
  saveBackdrop,
  saveProp,
} from "@/app/admin/actions";
import type { Backdrop, PropItem } from "@/types/catalog";
import { DeleteForm } from "./delete-form";
import { ImageUpload } from "./image-upload";
import { VndInput } from "./vnd-input";

type AssetType = "backdrop" | "prop";
type RentalAsset = Backdrop | PropItem;

function toSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function RentalAssetForm({
  item,
  assetType,
}: {
  item?: RentalAsset;
  assetType: AssetType;
}) {
  const saveAction =
    assetType === "backdrop"
      ? saveBackdrop.bind(null, item?.id ?? null)
      : saveProp.bind(null, item?.id ?? null);

  const [state, action, pending] = useActionState(saveAction, {});
  const [mediaBlocked, setMediaBlocked] = useState(false);
  const [pricingMode, setPricingMode] = useState<"free" | "paid">(
    item?.included ? "free" : "paid",
  );
  const [nameValue, setNameValue] = useState(item?.name ?? "");
  const [slugValue, setSlugValue] = useState(
    item?.slug ?? toSlug(item?.name ?? ""),
  );
  const [slugEdited, setSlugEdited] = useState(Boolean(item?.slug));

  const isBackdrop = assetType === "backdrop";
  const backdropKind =
    isBackdrop && item && "kind" in item ? item.kind : "color";
  const listHref = isBackdrop ? "/admin/backdrops" : "/admin/props";
  const coverCount = item?.images?.length
    ? item.images.length
    : item?.image_url
      ? 1
      : 0;

  function handleNameChange(nextValue: string) {
    setNameValue(nextValue);

    if (!slugEdited) {
      setSlugValue(toSlug(nextValue));
    }
  }

  function generateSlug() {
    setSlugValue(toSlug(nameValue));
    setSlugEdited(true);
  }

  return (
    <div className="rental-editor-root">
      <form action={action} className="rental-editor-form">
        <input
          type="hidden"
          name="sort_order"
          value={String(item?.sort_order ?? 100000)}
          readOnly
        />

        <div className="rental-editor-layout">
          <div className="rental-editor-main">
            <section className="form-panel rental-editor-card">
              <div className="rental-panel-head">
                <div>
                  <h2>Thông tin chính</h2>
                  <p>
                    Nhập tên, slug và loại nội dung. Thứ tự hiển thị được quản
                    lý ở trang tổng bằng kéo thả.
                  </p>
                </div>
              </div>

              <div className="form-grid rental-form-grid">
                <label className="form-field">
                  <span>
                    {isBackdrop ? "Tên / mã phông (VN)" : "Tên đạo cụ (VN)"}
                  </span>
                  <input
                    name="name"
                    value={nameValue}
                    onChange={(event) => handleNameChange(event.target.value)}
                    required
                    maxLength={160}
                    placeholder={isBackdrop ? "Apple / 512" : "Ghế kim loại"}
                  />
                </label>

                <label className="form-field">
                  <span>
                    {isBackdrop ? "Tên / mã phông (EN)" : "Tên đạo cụ (EN)"}
                  </span>
                  <input
                    name="name_en"
                    defaultValue={item?.name_en}
                    required
                    maxLength={160}
                    placeholder={isBackdrop ? "Apple / 512" : "Metal chair"}
                  />
                </label>

                <label className="form-field full">
                  <span>Slug đường dẫn</span>
                  <div className="rental-slug-row">
                    <input
                      name="slug"
                      value={slugValue}
                      onChange={(event) => {
                        setSlugValue(event.target.value);
                        setSlugEdited(true);
                      }}
                      required
                      maxLength={120}
                      pattern="[a-z0-9]+(-[a-z0-9]+)*"
                      placeholder={isBackdrop ? "apple-512" : "ghe-kim-loai"}
                    />

                    <button
                      type="button"
                      className="button button-outline rental-slug-button"
                      onClick={generateSlug}
                    >
                      Tạo slug
                    </button>
                  </div>
                  <small>Chữ thường không dấu, số và dấu gạch nối.</small>
                </label>

                {isBackdrop && (
                  <label className="form-field">
                    <span>Loại phông</span>
                    <select name="kind" defaultValue={backdropKind}>
                      <option value="color">Phông màu</option>
                      <option value="effect">Phông màu hiệu ứng</option>
                    </select>
                  </label>
                )}
              </div>
            </section>

            <section className="form-panel rental-editor-card">
              <div className="rental-panel-head">
                <div>
                  <h2>Mức phí & mô tả</h2>
                  <p>
                    Chọn miễn phí hoặc có phí. Giá sẽ hiển thị ngay dưới tên
                    trên card ngoài website.
                  </p>
                </div>
              </div>

              <div className="form-grid rental-form-grid">
                <fieldset className="form-field full rental-pricing-fieldset">
                  <legend>Mức phí</legend>

                  <input
                    type="hidden"
                    name="included"
                    value={pricingMode === "free" ? "on" : ""}
                  />

                  <div className="rental-pricing-options">
                    <label
                      className={`rental-pricing-option ${
                        pricingMode === "free" ? "is-active" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="pricing_mode"
                        value="free"
                        checked={pricingMode === "free"}
                        onChange={() => setPricingMode("free")}
                      />
                      <span>
                        <strong>Miễn phí</strong>
                        <small>Hiển thị nhãn “Miễn phí”.</small>
                      </span>
                    </label>

                    <label
                      className={`rental-pricing-option ${
                        pricingMode === "paid" ? "is-active" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="pricing_mode"
                        value="paid"
                        checked={pricingMode === "paid"}
                        onChange={() => setPricingMode("paid")}
                      />
                      <span>
                        <strong>Có phí</strong>
                        <small>Hiển thị giá thuê.</small>
                      </span>
                    </label>
                  </div>
                </fieldset>

                {pricingMode === "paid" && (
                  <label className="form-field">
                    <span>Giá thuê</span>
                    <VndInput name="price" defaultValue={item?.price} />
                    <small>Ví dụ: 400.000 VNĐ.</small>
                  </label>
                )}

                <label className="form-field">
                  <span>Mô tả (VI)</span>
                  <textarea
                    name="description_vi"
                    maxLength={3000}
                    defaultValue={item?.description.vi}
                    placeholder="Mô tả ngắn, có thể để trống."
                  />
                </label>

                <label className="form-field">
                  <span>Mô tả (EN)</span>
                  <textarea
                    name="description_en"
                    maxLength={3000}
                    defaultValue={item?.description.en}
                    placeholder="Optional short description."
                  />
                </label>
              </div>
            </section>

            <section className="form-panel rental-editor-card">
              <div className="rental-panel-head">
                <div>
                  <h2>Album hình ảnh</h2>
                  <p>
                    Ảnh đầu tiên là ảnh bìa. Các ảnh còn lại sẽ mở trong gallery
                    khi khách bấm vào card.
                  </p>
                </div>
              </div>

              <div className="rental-inline-note">
                Kéo ảnh để đổi ảnh bìa và thứ tự gallery trước khi lưu.
              </div>

              <ImageUpload
                initialUrls={
                  item?.images?.length
                    ? item.images
                    : item?.image_url
                      ? [item.image_url]
                      : []
                }
                onBlockedChange={setMediaBlocked}
                max={12}
              />
            </section>
          </div>

          <aside className="rental-editor-side">
            <section className="form-panel rental-side-card">
              <div className="rental-panel-head compact">
                <div>
                  <h2>Trạng thái</h2>
                  <p>Kiểm tra nhanh nội dung trước khi lưu.</p>
                </div>
              </div>

              <div className="rental-side-stack">
                <div className="rental-status-pills">
                  <span className="rental-status-pill">
                    {pricingMode === "free" ? "Miễn phí" : "Có phí"}
                  </span>
                  <span className="rental-status-pill">
                    {isBackdrop ? "Phông" : "Đạo cụ"}
                  </span>
                  <span className="rental-status-pill">{coverCount} ảnh</span>
                </div>

                <label className="check-field">
                  <input
                    type="checkbox"
                    name="published"
                    defaultChecked={item?.published ?? true}
                  />
                  Hiển thị công khai
                </label>

                <div className="rental-side-note">
                  Sau khi lưu, vào trang tổng để kéo thả thay đổi thứ tự hiển
                  thị.
                </div>
              </div>
            </section>

            <section className="form-panel rental-side-card rental-save-card">
              <div className="rental-panel-head compact">
                <div>
                  <h2>Lưu thay đổi</h2>
                  <p>Lưu xong hệ thống sẽ quay lại danh sách.</p>
                </div>
              </div>

              {state.error && (
                <p className="notice error" role="alert">
                  {state.error}
                </p>
              )}

              {state.success && (
                <p className="notice success" role="status">
                  {state.success}
                </p>
              )}

              <div className="rental-action-stack">
                <button className="button" disabled={pending || mediaBlocked}>
                  {pending
                    ? "Đang lưu..."
                    : isBackdrop
                      ? "Lưu phông"
                      : "Lưu đạo cụ"}
                </button>

                <Link className="button button-outline" href={listHref}>
                  Quay lại danh sách
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </form>

      {item && (
        <section className="form-panel rental-danger-card">
          <div className="rental-danger-copy">
            <h2>Xóa mục này</h2>
            <p>
              Xóa bản ghi khỏi website. File gốc trên Cloudinary vẫn được giữ.
            </p>
          </div>

          <DeleteForm
            action={
              isBackdrop
                ? deleteBackdrop.bind(null, item.id)
                : deleteProp.bind(null, item.id)
            }
            label={isBackdrop ? "phông" : "đạo cụ"}
          />
        </section>
      )}
    </div>
  );
}
