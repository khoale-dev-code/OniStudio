"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { GalleryCategory } from "@/types/catalog";

const GalleryForm = dynamic(
  () =>
    import("./gallery-form").then((module) => module.GalleryForm),
  {
    ssr: false,
    loading: () => (
      <div className="form-panel gallery-deferred-loading" aria-live="polite">
        <strong>Đang tải trình tạo album...</strong>
        <p className="admin-hint">
          Chỉ tải công cụ upload khi bạn thật sự cần thêm album để giảm JavaScript
          ban đầu trên mobile.
        </p>
      </div>
    ),
  },
);

export function DeferredGalleryCreate({
  categories,
  nextSortOrder,
}: {
  categories: GalleryCategory[];
  nextSortOrder: number;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <div className="form-panel gallery-deferred-create">
        <div>
          <p className="eyebrow">NEW ALBUM</p>
          <h2>Thêm album khi cần</h2>
          <p className="admin-hint">
            Trình upload ảnh được trì hoãn để trang thư viện mở nhanh và nhẹ hơn,
            đặc biệt trên điện thoại.
          </p>
        </div>

        <button
          className="button"
          type="button"
          onClick={() => setOpen(true)}
        >
          Mở trình thêm album
        </button>
      </div>
    );
  }

  return (
    <div className="gallery-deferred-create-open">
      <div className="gallery-deferred-create-toolbar">
        <div>
          <strong>Album mới</strong>
          <span>Trình upload đã được tải.</span>
        </div>
        <button
          className="button button-outline"
          type="button"
          onClick={() => setOpen(false)}
        >
          Đóng
        </button>
      </div>

      <GalleryForm categories={categories} nextSortOrder={nextSortOrder} />
    </div>
  );
}
