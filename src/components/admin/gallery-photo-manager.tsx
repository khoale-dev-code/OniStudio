"use client";

import { useActionState, useCallback, useState } from "react";
import {
  CheckCircle2,
  Images,
  LayoutGrid,
  Save,
  Sparkles,
} from "lucide-react";
import { saveGalleryPhotos } from "@/app/admin/gallery-photo-actions";
import { ImageUpload } from "@/components/admin/image-upload";

export function GalleryPhotoManager({
  initialUrls,
}: {
  initialUrls: string[];
}) {
  const [state, action, pending] = useActionState(saveGalleryPhotos, {});
  const [mediaBlocked, setMediaBlocked] = useState(false);
  const [count, setCount] = useState(initialUrls.length);

  const handleUrlsChange = useCallback((urls: string[]) => {
    setCount(urls.length);
  }, []);

  return (
    <form className="gallery-photo-admin gallery-photo-admin-v2" action={action}>
      <header className="gallery-photo-admin-hero-v2">
        <div className="gallery-photo-admin-hero-copy-v2">
          <p className="eyebrow">ONI / IMAGE LIBRARY</p>
          <h1>Thư viện hình ảnh</h1>
          <p>
            Ảnh mới sẽ ở vị trí đầu tiên. Kéo thả để thay đổi thứ tự;
            thứ tự trong Admin sẽ được hiển thị ngoài website.
          </p>
        </div>

        <div className="gallery-photo-admin-summary-v2">
          <span className="gallery-photo-admin-summary-icon-v2">
            <Images size={19} aria-hidden="true" />
          </span>
          <div>
            <strong>{count}</strong>
            <span>ảnh đang hiển thị</span>
          </div>
        </div>
      </header>

      <div className="gallery-photo-toolbar-v2">
        <div className="gallery-photo-toolbar-copy-v2">
          <span className="gallery-photo-toolbar-icon-v2">
            <LayoutGrid size={17} aria-hidden="true" />
          </span>
          <div>
            <strong>Sắp xếp thư viện</strong>
            <span>Kéo biểu tượng ⋮⋮ ở mỗi ảnh để đổi vị trí.</span>
          </div>
        </div>

        <button
          className="button gallery-photo-save-button-v2"
          disabled={pending || mediaBlocked}
        >
          <Save size={17} aria-hidden="true" />
          {pending ? "Đang cập nhật..." : "Cập nhật thư viện"}
        </button>
      </div>

      <section className="gallery-photo-admin-panel-v2">
        <div className="gallery-photo-admin-panel-head-v2">
          <div>
            <span className="gallery-photo-admin-panel-icon-v2">
              <Sparkles size={17} aria-hidden="true" />
            </span>
            <div>
              <strong>Hình ảnh</strong>
              <p>
                Ảnh mới lên đầu danh sách. Bạn vẫn có thể kéo thả để sắp xếp.
              </p>
            </div>
          </div>

          <span className="gallery-photo-admin-limit-v2">{count} / 120</span>
        </div>

        <div className="gallery-photo-admin-editor-v2">
          <ImageUpload
            initialUrls={initialUrls}
            onBlockedChange={setMediaBlocked}
            onUrlsChange={handleUrlsChange}
            max={120}
            purpose="gallery"
            showUrlInput={false}
          />
        </div>
      </section>

      <div className="gallery-photo-mobile-save-v2">
        <button
          className="button gallery-photo-save-button-v2"
          disabled={pending || mediaBlocked}
        >
          <Save size={17} aria-hidden="true" />
          {pending ? "Đang cập nhật..." : "Cập nhật thư viện"}
        </button>
      </div>

      {state.error && (
        <p className="notice error gallery-photo-action-notice-v2" role="alert">
          {state.error}
        </p>
      )}

      {state.success && (
        <p
          className="notice success gallery-photo-action-notice-v2"
          role="status"
        >
          <CheckCircle2 size={16} aria-hidden="true" />
          {state.success}
        </p>
      )}
    </form>
  );
}
