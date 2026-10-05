"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  ChevronDown,
  ExternalLink,
  Images,
  Lightbulb,
  Link2,
  MapPin,
  Settings2,
  Sparkles,
  UserRound,
} from "lucide-react";
import { saveGallery } from "@/app/admin/actions";
import { ImageUpload } from "./image-upload";
import type { GalleryCategory, GalleryItem } from "@/types/catalog";

function SocialToggle({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`gallery-social-toggle${active ? " is-active" : ""}`}
      aria-pressed={active}
      onClick={onClick}
    >
      <span className="gallery-social-toggle-dot" aria-hidden="true" />
      {label}
    </button>
  );
}

export function GalleryForm({
  item,
  categories,
  nextSortOrder = 0,
}: {
  item?: GalleryItem;
  categories: GalleryCategory[];
  nextSortOrder?: number;
}) {
  const [state, action, pending] = useActionState(
    saveGallery.bind(null, item?.id ?? null),
    {},
  );
  const [mediaBlocked, setMediaBlocked] = useState(false);
  const editing = Boolean(item);

  const initialImages = item?.images?.length
    ? item.images
    : item?.image_url
      ? [item.image_url]
      : [];

  const [showPhotographer, setShowPhotographer] = useState(
    Boolean(
      item?.photographer_name ||
        item?.photographer_facebook_url ||
        item?.photographer_instagram_url,
    ),
  );
  const [projectFacebook, setProjectFacebook] = useState(Boolean(item?.facebook_url));
  const [projectInstagram, setProjectInstagram] = useState(Boolean(item?.instagram_url));
  const [photoFacebook, setPhotoFacebook] = useState(
    Boolean(item?.photographer_facebook_url),
  );
  const [photoInstagram, setPhotoInstagram] = useState(
    Boolean(item?.photographer_instagram_url),
  );

  return (
    <form className="gallery-editor-card" action={action}>
      <div className="gallery-editor-head">
        <div>
          <p className="eyebrow">{editing ? "EDIT ALBUM" : "NEW ALBUM"}</p>
          <h2>{editing ? "Chỉnh sửa bộ ảnh" : "Tạo bộ ảnh mới"}</h2>
          <p className="muted">
            Chỉ những mục bạn bật mới hiện ô nhập liệu. Nội dung phụ được gom
            vào phần nâng cao để form ngắn và dễ thao tác hơn.
          </p>
        </div>
        <span className="gallery-editor-count">
          <Images size={16} aria-hidden="true" />
          {initialImages.length} ảnh
        </span>
      </div>

      <section className="gallery-form-section gallery-form-section-main">
        <div className="gallery-form-section-title">
          <span className="gallery-form-step">01</span>
          <div>
            <h3>Thông tin chính</h3>
            <p>Tên dự án, danh mục và mô tả ngắn.</p>
          </div>
        </div>

        <div className="gallery-compact-grid">
          <label className="form-field gallery-span-2">
            <span>Tiêu đề bộ ảnh</span>
            <input
              name="title_vi"
              required
              maxLength={200}
              defaultValue={item?.title.vi}
              placeholder="Back To Cool — Work for UnUnMeoMeo"
            />
          </label>

          <label className="form-field">
            <span>Danh mục</span>
            <select
              name="category"
              defaultValue={item?.category ?? categories[0]?.slug}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name.vi}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field gallery-span-3">
            <span>Mô tả / credit</span>
            <textarea
              name="description_vi"
              maxLength={3000}
              rows={3}
              defaultValue={item?.description?.vi ?? ""}
              placeholder="Product by Image.Workshop · Location: Oni Studio..."
            />
          </label>
        </div>
      </section>

      <section className="gallery-form-section">
        <div className="gallery-form-section-title gallery-form-section-title-row">
          <div className="gallery-form-title-group">
            <span className="gallery-form-step">02</span>
            <div>
              <h3>Photographer</h3>
              <p>Chỉ bật khi cần hiển thị credit photographer.</p>
            </div>
          </div>

          <label className="gallery-switch">
            <input
              type="checkbox"
              checked={showPhotographer}
              onChange={(event) => setShowPhotographer(event.target.checked)}
            />
            <span aria-hidden="true" />
            {showPhotographer ? "Đang bật" : "Không dùng"}
          </label>
        </div>

        {showPhotographer ? (
          <div className="gallery-reveal-panel">
            <label className="form-field">
              <span>Tên photographer</span>
              <div className="gallery-icon-input">
                <UserRound size={16} aria-hidden="true" />
                <input
                  name="photographer_name"
                  maxLength={160}
                  defaultValue={item?.photographer_name ?? ""}
                  placeholder="Tuệ Trần"
                />
              </div>
            </label>

            <div className="gallery-social-control">
              <span className="gallery-control-label">Liên kết photographer</span>
              <div className="gallery-toggle-row">
                <SocialToggle
                  label="Facebook"
                  active={photoFacebook}
                  onClick={() => setPhotoFacebook((value) => !value)}
                />
                <SocialToggle
                  label="Instagram"
                  active={photoInstagram}
                  onClick={() => setPhotoInstagram((value) => !value)}
                />
              </div>
            </div>

            {photoFacebook ? (
              <label className="form-field gallery-span-2">
                <span>Facebook photographer</span>
                <div className="gallery-icon-input">
                  <ExternalLink size={16} aria-hidden="true" />
                  <input
                    name="photographer_facebook_url"
                    type="url"
                    maxLength={1200}
                    defaultValue={item?.photographer_facebook_url ?? ""}
                    placeholder="https://www.facebook.com/..."
                  />
                </div>
              </label>
            ) : (
              <input type="hidden" name="photographer_facebook_url" value="" />
            )}

            {photoInstagram ? (
              <label className="form-field gallery-span-2">
                <span>Instagram photographer</span>
                <div className="gallery-icon-input">
                  <ExternalLink size={16} aria-hidden="true" />
                  <input
                    name="photographer_instagram_url"
                    type="url"
                    maxLength={1200}
                    defaultValue={item?.photographer_instagram_url ?? ""}
                    placeholder="https://www.instagram.com/..."
                  />
                </div>
              </label>
            ) : (
              <input type="hidden" name="photographer_instagram_url" value="" />
            )}
          </div>
        ) : (
          <>
            <input type="hidden" name="photographer_name" value="" />
            <input type="hidden" name="photographer_facebook_url" value="" />
            <input type="hidden" name="photographer_instagram_url" value="" />
          </>
        )}
      </section>

      <section className="gallery-form-section">
        <div className="gallery-form-section-title">
          <span className="gallery-form-step">03</span>
          <div>
            <h3>Liên kết dự án</h3>
            <p>Chọn kênh nào cần hiển thị rồi mới nhập link.</p>
          </div>
        </div>

        <div className="gallery-toggle-row gallery-project-link-toggles">
          <SocialToggle
            label="Facebook"
            active={projectFacebook}
            onClick={() => setProjectFacebook((value) => !value)}
          />
          <SocialToggle
            label="Instagram"
            active={projectInstagram}
            onClick={() => setProjectInstagram((value) => !value)}
          />
        </div>

        {(projectFacebook || projectInstagram) && (
          <div className="gallery-link-fields">
            {projectFacebook ? (
              <label className="form-field">
                <span>Facebook dự án</span>
                <div className="gallery-icon-input">
                  <Link2 size={16} aria-hidden="true" />
                  <input
                    name="facebook_url"
                    type="url"
                    maxLength={1200}
                    defaultValue={item?.facebook_url ?? ""}
                    placeholder="https://www.facebook.com/..."
                  />
                </div>
              </label>
            ) : (
              <input type="hidden" name="facebook_url" value="" />
            )}

            {projectInstagram ? (
              <label className="form-field">
                <span>Instagram dự án</span>
                <div className="gallery-icon-input">
                  <Link2 size={16} aria-hidden="true" />
                  <input
                    name="instagram_url"
                    type="url"
                    maxLength={1200}
                    defaultValue={item?.instagram_url ?? ""}
                    placeholder="https://www.instagram.com/p/..."
                  />
                </div>
              </label>
            ) : (
              <input type="hidden" name="instagram_url" value="" />
            )}
          </div>
        )}

        {!projectFacebook && (
          <input type="hidden" name="facebook_url" value="" />
        )}
        {!projectInstagram && (
          <input type="hidden" name="instagram_url" value="" />
        )}
      </section>

      <section className="gallery-form-section">
        <div className="gallery-form-section-title">
          <span className="gallery-form-step">04</span>
          <div>
            <h3>Vai trò của Oni</h3>
            <p>Chọn những phần Oni thực sự tham gia trong dự án.</p>
          </div>
        </div>

        <div className="gallery-role-grid">
          <label className="gallery-role-option">
            <input
              type="checkbox"
              name="oni_production"
              defaultChecked={item?.oni_production}
            />
            <span className="gallery-role-icon">
              <Sparkles size={17} aria-hidden="true" />
            </span>
            <span>
              <strong>Oni Production</strong>
              <small>Oni thực hiện dự án / production.</small>
            </span>
          </label>

          <label className="gallery-role-option">
            <input
              type="checkbox"
              name="oni_lighting"
              defaultChecked={item?.oni_lighting}
            />
            <span className="gallery-role-icon">
              <Lightbulb size={17} aria-hidden="true" />
            </span>
            <span>
              <strong>Lighting by Oni</strong>
              <small>Oni phụ trách setup / vận hành ánh sáng.</small>
            </span>
          </label>

          <label className="gallery-role-option">
            <input
              type="checkbox"
              name="shot_at_oni"
              defaultChecked={item?.shot_at_oni}
            />
            <span className="gallery-role-icon">
              <MapPin size={17} aria-hidden="true" />
            </span>
            <span>
              <strong>Shot at Oni</strong>
              <small>Dự án được chụp tại Oni Studio.</small>
            </span>
          </label>
        </div>
      </section>

      <details className="gallery-details" open={!editing}>
        <summary>
          <span className="gallery-summary-icon">
            <Images size={17} aria-hidden="true" />
          </span>
          <span>
            <strong>Hình ảnh album</strong>
            <small>Ảnh đầu tiên là ảnh bìa · tối đa 24 ảnh.</small>
          </span>
          <ChevronDown className="gallery-summary-chevron" size={18} />
        </summary>
        <div className="gallery-details-body">
          <ImageUpload
            initialUrls={initialImages}
            onBlockedChange={setMediaBlocked}
            max={24}
          />
        </div>
      </details>

      <details className="gallery-details gallery-details-secondary">
        <summary>
          <span className="gallery-summary-icon">
            <Settings2 size={17} aria-hidden="true" />
          </span>
          <span>
            <strong>Nội dung EN & thiết lập nâng cao</strong>
            <small>Không bắt buộc. Dùng khi cần chỉnh bản tiếng Anh hoặc thứ tự.</small>
          </span>
          <ChevronDown className="gallery-summary-chevron" size={18} />
        </summary>
        <div className="gallery-details-body gallery-advanced-grid">
          <label className="form-field">
            <span>Tiêu đề (EN)</span>
            <input
              name="title_en"
              maxLength={200}
              defaultValue={item?.title.en ?? ""}
              placeholder="Bỏ trống để dùng tiêu đề tiếng Việt"
            />
          </label>

          <label className="form-field">
            <span>Thứ tự</span>
            <input
              name="sort_order"
              type="number"
              min="0"
              max="99988"
              required
              defaultValue={item?.sort_order ?? nextSortOrder}
            />
          </label>

          <label className="form-field gallery-span-2">
            <span>Mô tả / credit (EN)</span>
            <textarea
              name="description_en"
              maxLength={3000}
              rows={3}
              defaultValue={item?.description?.en ?? ""}
              placeholder="Optional English description"
            />
          </label>
        </div>
      </details>

      <div className="gallery-editor-footer">
        <label className="check-field gallery-publish-check">
          <input
            type="checkbox"
            name="published"
            defaultChecked={item?.published ?? true}
          />
          Hiển thị công khai
        </label>

        <div className="gallery-editor-actions">
          {editing && (
            <Link className="button button-outline" href="/admin/gallery">
              Quay lại
            </Link>
          )}
          <Link className="button button-outline" href="/admin/gallery/categories">
            Quản lý danh mục
          </Link>
          <button className="button" disabled={pending || mediaBlocked}>
            {pending
              ? editing
                ? "Đang lưu..."
                : "Đang tạo..."
              : editing
                ? "Lưu thay đổi"
                : "Tạo bộ ảnh"}
          </button>
        </div>
      </div>

      {state.error && (
        <p role="alert" className="notice error gallery-editor-notice">
          {state.error}
        </p>
      )}
    </form>
  );
}
