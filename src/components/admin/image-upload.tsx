"use client";
import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
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

export function ImageUpload({
  initialUrls = [],
  onBlockedChange,
  max = 12,
  name = "images",
}: {
  initialUrls?: string[];
  onBlockedChange: (blocked: boolean) => void;
  max?: number;
  name?: string;
}) {
  const { items, message, addFiles, remove, retry, move, addUrl } =
    useMediaUpload(initialUrls, max);
  const [over, setOver] = useState(false);
  const [drag, setDrag] = useState<{ from: string; to: string } | null>(null);
  const [url, setUrl] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const manager = useRef<HTMLElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const dragId = drag?.from;
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
      className="media-manager form-field full"
      aria-labelledby={`${id}-title`}
    >
      <div className="media-heading">
        <div>
          <h3 id={`${id}-title`}>Hình ảnh</h3>
          <p>
            Ảnh đầu tiên là ảnh bìa. Kéo tay nắm để đổi thứ tự, hoặc dùng các
            nút mũi tên.
          </p>
        </div>
        <span className="pill">
          {items.length} / {max}
        </span>
      </div>
      <input
        type="hidden"
        name={name}
        value={items
          .filter((x) => x.status === "ready")
          .map((x) => x.url)
          .join("\n")}
      />
      <input type="hidden" name="media_blocked" value={blocked ? "1" : "0"} />
      <div
        className={`upload-dropzone ${over ? "is-over" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null))
            setOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          addFiles(Array.from(e.dataTransfer.files));
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
          <ImagePlus size={16} /> Chọn nhiều ảnh
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
          onChange={(e) => {
            addFiles(Array.from(e.target.files || []));
            e.target.value = "";
          }}
        />
      </div>
      <div className="media-status" role="status" aria-live="polite">
        {uploading
          ? `Đang tải ${uploading} ảnh. Bạn vẫn có thể sắp xếp hoặc thêm ảnh.`
          : blocked
            ? "Có ảnh tải lỗi. Thử lại hoặc bỏ ảnh lỗi trước khi lưu."
            : items.length
              ? "Ảnh đã sẵn sàng. Bấm Lưu để cập nhật website."
              : "Chọn ảnh để bắt đầu."}{" "}
        {message}
      </div>
      <ol className="media-grid">
        {items.map((item, index) => (
          <li
            key={item.id}
            data-media-id={item.id}
            className={`media-tile ${drag?.from === item.id ? "is-dragging" : ""} ${drag?.to === item.id && drag.from !== item.id ? "is-target" : ""}`}
          >
            <div className="media-preview">
              <Image
                src={item.url}
                alt={item.name}
                fill
                sizes="(max-width: 600px) 40vw, 220px"
                unoptimized
                draggable={false}
              />
              <span className="media-position">
                {index === 0 ? "Ảnh bìa" : String(index + 1).padStart(2, "0")}
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
                    <RotateCcw size={14} /> Thử lại
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
                onPointerDown={(e) => {
                  if (e.button !== 0) return;
                  pointer.current = { x: e.clientX, y: e.clientY };
                  e.currentTarget.setPointerCapture(e.pointerId);
                  setDrag({ from: item.id, to: item.id });
                }}
                onPointerMove={(e) => {
                  pointer.current = { x: e.clientX, y: e.clientY };
                  if (!drag || !e.currentTarget.hasPointerCapture(e.pointerId))
                    return;
                  const target = document
                    .elementFromPoint(e.clientX, e.clientY)
                    ?.closest<HTMLElement>("[data-media-id]")?.dataset.mediaId;
                  if (target && items.some((x) => x.id === target))
                    setDrag({ from: drag.from, to: target });
                }}
                onPointerUp={(e) => {
                  if (drag) move(drag.from, drag.to);
                  setDrag(null);
                  if (e.currentTarget.hasPointerCapture(e.pointerId))
                    e.currentTarget.releasePointerCapture(e.pointerId);
                }}
                onPointerCancel={() => setDrag(null)}
                onLostPointerCapture={() => setDrag(null)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setDrag(null);
                  const next =
                    e.key === "ArrowLeft" || e.key === "ArrowUp"
                      ? index - 1
                      : e.key === "ArrowRight" || e.key === "ArrowDown"
                        ? index + 1
                        : -1;
                  if (
                    [
                      "ArrowLeft",
                      "ArrowRight",
                      "ArrowUp",
                      "ArrowDown",
                    ].includes(e.key)
                  ) {
                    e.preventDefault();
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
        Ảnh đầu tiên là ảnh bìa.
      </p>
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
            onChange={(e) => setUrl(e.target.value)}
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
      <small>
        Bỏ ảnh chỉ gỡ khỏi danh sách đang chỉnh sửa; không xóa file gốc trên
        Cloudinary.
      </small>
    </section>
  );
}
