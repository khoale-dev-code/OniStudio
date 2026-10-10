/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AdminSafeImage } from "@/components/admin/admin-safe-image";
import {
  ArrowLeft,
  ArrowRight,
  GripVertical,
  UploadCloud,
  X,
  RotateCcw,
  ImagePlus,
} from "lucide-react";
import { useMediaUpload } from "@/hooks/use-media-upload";

function GalleryNaturalImageV7({ src, alt }: { src: string; alt: string }) {
  const [failedSource, setFailedSource] = useState<string | null>(null);

  if (failedSource === src) {
    return (
      <span className="gallery-admin-natural-fallback-v7" role="img" aria-label={alt || "Ảnh lỗi"}>
        Ảnh không tải được
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="gallery-admin-natural-image-v7"
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={() => setFailedSource(src)}
    />
  );
}

export function ImageUpload({
  initialUrls = [],
  onBlockedChange,
  onUrlsChange,
  max = 12,
  name = "images",
  purpose = "default",
  showUrlInput = true,
}: {
  initialUrls?: string[];
  onBlockedChange: (blocked: boolean) => void;
  onUrlsChange?: (urls: string[]) => void;
  max?: number;
  name?: string;
  purpose?: "default" | "gallery";
  showUrlInput?: boolean;
}) {
  const { items, message, addFiles, remove, retry, move, addUrl } =
    useMediaUpload(initialUrls, max, purpose === "gallery");
  const [over, setOver] = useState(false);
  const [drag, setDrag] = useState<{ from: string; to: string } | null>(null);
  const [url, setUrl] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const manager = useRef<HTMLElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const dragId = drag?.from;
  const galleryMode = purpose === "gallery";
  const readyUrlsValue = items
    .filter((item) => item.status === "ready")
    .map((item) => item.url)
    .join("\n");

  useEffect(() => {
    if (!dragId) return;
    const from = dragId;
    let frame: number;

    function scrollWhileDragging() {
      const { x, y } = pointer.current;
      const speed = y < 80 ? -10 : y > window.innerHeight - 80 ? 10 : 0;

      if (speed) {
        window.scrollBy({ top: speed, behavior: "instant" });
        const element = document
          .elementFromPoint(x, y)
          ?.closest<HTMLElement>("[data-media-id]");

        if (element && manager.current?.contains(element)) {
          const to = element.dataset.mediaId!;
          setDrag((previous) =>
            previous && previous.from === from && previous.to !== to
              ? { from, to }
              : previous,
          );
        }
      }

      frame = requestAnimationFrame(scrollWhileDragging);
    }

    frame = requestAnimationFrame(scrollWhileDragging);
    return () => cancelAnimationFrame(frame);
  }, [dragId]);

  const id = useId();
  const blocked = items.some((item) => item.status !== "ready");
  const uploading = items.filter(
    (item) => item.status === "uploading" || item.status === "queued",
  ).length;

  useEffect(() => {
    onBlockedChange(blocked);
  }, [blocked, onBlockedChange]);

  useEffect(() => {
    // Update the parent only when the saved URL list actually changes.
    onUrlsChange?.(readyUrlsValue ? readyUrlsValue.split("\n") : []);
  }, [readyUrlsValue, onUrlsChange]);

  useEffect(() => {
    if (!blocked) return;

    function preventExit(event: BeforeUnloadEvent) {
      event.preventDefault();
    }

    window.addEventListener("beforeunload", preventExit);
    return () => window.removeEventListener("beforeunload", preventExit);
  }, [blocked]);

  return (
    <section
      ref={manager}
      className={`media-manager form-field full${galleryMode ? " is-gallery-stream" : ""}`}
      aria-labelledby={`${id}-title`}
    >
      <div className="media-heading">
        <div>
          <h3 id={`${id}-title`}>
            {galleryMode ? "Hình ảnh hiển thị" : "Hình ảnh"}
          </h3>
          <p>
            {galleryMode
              ? "Kéo tay nắm để đổi vị trí. Thứ tự ở đây chính là thứ tự ngoài website."
              : "Ảnh đầu tiên là ảnh bìa. Kéo tay nắm để đổi thứ tự, hoặc dùng các nút mũi tên."}
          </p>
        </div>

        <span className="pill">
          {items.length} / {max}
        </span>
      </div>

      <input type="hidden" name={name} value={readyUrlsValue} />
      <input type="hidden" name="media_blocked" value={blocked ? "1" : "0"} />

      <div
        className={`upload-dropzone ${over ? "is-over" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          setOver(true);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setOver(false);
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          setOver(false);
          addFiles(Array.from(event.dataTransfer.files));
        }}
      >
        <UploadCloud size={28} strokeWidth={1.5} />
        <strong>Kéo thả ảnh vào đây</strong>
        <span>JPEG, PNG, WebP · Tối đa 8 MB / ảnh</span>

        <button
          className="button button-small"
          type="button"
          disabled={items.length >= max}
          onClick={() => input.current?.click()}
        >
          <ImagePlus size={16} />
          Chọn nhiều ảnh
        </button>

        <input
          ref={input}
          id={`${id}-files`}
          aria-label="Chọn ảnh tải lên"
          className="sr-only"
          tabIndex={-1}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(event) => {
            addFiles(Array.from(event.target.files || []));
            event.target.value = "";
          }}
        />
      </div>

      <div className="media-status" role="status" aria-live="polite">
        {uploading
          ? `Đang tải ${uploading} ảnh. Bạn vẫn có thể sắp xếp hoặc thêm ảnh.`
          : blocked
            ? "Có ảnh tải lỗi. Thử lại hoặc bỏ ảnh lỗi trước khi lưu."
            : items.length
              ? galleryMode
                ? "Ảnh đã sẵn sàng. Kéo để sắp xếp rồi bấm Cập nhật thư viện."
                : "Ảnh đã sẵn sàng. Bấm Lưu để cập nhật website."
              : "Chọn ảnh để bắt đầu."}{" "}
        {message}
      </div>

      <ol className={galleryMode ? "media-grid gallery-admin-natural-grid-v7" : "media-grid"}>
        {items.map((item, index) => (
          <li
            key={item.id}
            data-media-id={item.id}
            className={`media-tile ${drag?.from === item.id ? "is-dragging" : ""} ${
              drag?.to === item.id && drag.from !== item.id ? "is-target" : ""
            }`}
          >
            <div className={galleryMode ? "media-preview gallery-admin-natural-preview-v7" : "media-preview"}>
              {galleryMode ? (
                <GalleryNaturalImageV7 src={item.url} alt={item.name} />
              ) : (
              <AdminSafeImage
                src={item.url}
                alt={item.name}
                fill
                sizes="(max-width: 600px) 40vw, 220px"
                draggable={false}
              />
              )}

              <span className="media-position">
                {galleryMode
                  ? String(index + 1).padStart(2, "0")
                  : index === 0
                    ? "Ảnh bìa"
                    : String(index + 1).padStart(2, "0")}
              </span>

              <button
                type="button"
                className="media-remove icon-button"
                aria-label={`Bỏ ảnh ${index + 1}`}
                onClick={() => remove(item.id)}
              >
                <X size={17} />
              </button>
            </div>

            <div className="media-tile-info">
              <p title={item.name}>{item.name}</p>

              {item.status === "uploading" ? (
                <>
                  <progress
                    value={item.progress}
                    max={100}
                    aria-label={`Tải ảnh ${index + 1}`}
                  />
                  <small>
                    {item.progress === 100
                      ? "Đang xử lý trên Cloudinary…"
                      : `Đang gửi ${item.progress}%`}
                  </small>
                </>
              ) : item.status === "queued" ? (
                <small>Đang chờ tải…</small>
              ) : item.status === "error" ? (
                <>
                  <small role="alert" className="upload-error">
                    {item.error}
                  </small>
                  <button
                    type="button"
                    className="text-link"
                    onClick={() => retry(item.id)}
                  >
                    <RotateCcw size={14} />
                    Thử lại
                  </button>
                </>
              ) : (
                <small>Đã tải lên</small>
              )}
            </div>

            <div className="media-controls">
              <button
                type="button"
                className="icon-button drag-handle"
                aria-label={`Di chuyển ảnh ${index + 1}, dùng phím trái hoặc phải`}
                aria-describedby={`${id}-help`}
                onPointerDown={(event) => {
                  if (event.button !== 0) return;
                  pointer.current = { x: event.clientX, y: event.clientY };
                  event.currentTarget.setPointerCapture(event.pointerId);
                  setDrag({ from: item.id, to: item.id });
                }}
                onPointerMove={(event) => {
                  pointer.current = { x: event.clientX, y: event.clientY };

                  if (
                    !drag ||
                    !event.currentTarget.hasPointerCapture(event.pointerId)
                  ) {
                    return;
                  }

                  const tile = document
                    .elementFromPoint(event.clientX, event.clientY)
                    ?.closest<HTMLElement>("[data-media-id]");
                  const target = tile?.dataset.mediaId;

                  if (target && tile && manager.current?.contains(tile)) {
                    setDrag((previous) =>
                      previous && previous.to !== target
                        ? { ...previous, to: target }
                        : previous,
                    );
                  }
                }}
                onPointerUp={(event) => {
                  if (drag) move(drag.from, drag.to);
                  setDrag(null);

                  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                    event.currentTarget.releasePointerCapture(event.pointerId);
                  }
                }}
                onPointerCancel={() => setDrag(null)}
                onLostPointerCapture={() => setDrag(null)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setDrag(null);

                  const next =
                    event.key === "ArrowLeft" || event.key === "ArrowUp"
                      ? index - 1
                      : event.key === "ArrowRight" || event.key === "ArrowDown"
                        ? index + 1
                        : -1;

                  if (
                    [
                      "ArrowLeft",
                      "ArrowRight",
                      "ArrowUp",
                      "ArrowDown",
                    ].includes(event.key)
                  ) {
                    event.preventDefault();
                    if (items[next]) move(item.id, items[next].id);
                  }
                }}
              >
                <GripVertical size={19} />
              </button>

              <button
                type="button"
                className="icon-button"
                aria-label={`Đưa ảnh ${index + 1} lên trước`}
                disabled={index === 0}
                onClick={() => move(item.id, items[index - 1].id)}
              >
                <ArrowLeft size={16} />
              </button>

              <button
                type="button"
                className="icon-button"
                aria-label={`Đưa ảnh ${index + 1} ra sau`}
                disabled={index === items.length - 1}
                onClick={() => move(item.id, items[index + 1].id)}
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </li>
        ))}
      </ol>

      <p id={`${id}-help`} className="sr-only">
        Kéo tay nắm tới ảnh khác rồi thả. Trên bàn phím, dùng các phím mũi tên.
      </p>

      {showUrlInput && (
        <details className="media-url">
          <summary>Dùng URL ảnh Cloudinary có sẵn</summary>
          <label htmlFor={`${id}-url`}>URL ảnh</label>
          <div>
            <input
              id={`${id}-url`}
              type="url"
              value={url}
              maxLength={2048}
              placeholder="https://res.cloudinary.com/..."
              onChange={(event) => setUrl(event.target.value)}
            />
            <button
              type="button"
              className="button button-outline"
              disabled={!url || items.length >= max}
              onClick={() => {
                if (addUrl(url.trim())) setUrl("");
              }}
            >
              Thêm ảnh
            </button>
          </div>
        </details>
      )}

      {!galleryMode && (
        <small>
          Bỏ ảnh chỉ gỡ khỏi danh sách đang chỉnh sửa; không xóa file gốc trên
          Cloudinary.
        </small>
      )}
    </section>
  );
}
