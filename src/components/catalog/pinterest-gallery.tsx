/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ImageOff, Minus, Plus, X } from "lucide-react";
import type { GalleryPhoto } from "@/lib/gallery-photos";

function cloudinaryVariant(
  src: string,
  transformation: "thumb" | "viewer",
) {
  const marker = "/image/upload/";
  const index = src.indexOf(marker);
  if (index < 0) return src;

  const options =
    transformation === "thumb"
      ? "f_auto,q_auto,c_limit,w_760"
      : "f_auto,q_auto,c_limit,w_2200,h_2200";

  return `${src.slice(0, index + marker.length)}${options}/${src.slice(index + marker.length)}`;
}

function PinterestPin({
  photo,
  index,
  onOpen,
  onImageSize,
  width,
  height,
}: {
  photo: GalleryPhoto;
  index: number;
  onOpen: () => void;
  onImageSize: (ratio: number) => void;
  width?: number;
  height?: number;
}) {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return (
      <div
        className="gallery-pinterest-pin-v2 gallery-pinterest-pin-broken-v2"
        style={width && height ? { width, height } : undefined}
        aria-label={`Ảnh ${index + 1} không còn tồn tại`}
      >
        <ImageOff size={24} aria-hidden="true" />
      </div>
    );
  }

  return (
    <button
      className="gallery-pinterest-pin-v2"
      style={width && height ? { width, height } : undefined}
      type="button"
      onClick={onOpen}
      aria-label={`Mở ảnh ${index + 1}`}
    >
      <img
        src={cloudinaryVariant(photo.image_url, "thumb")}
        alt=""
        loading={index < 6 ? "eager" : "lazy"}
        decoding="async"
        onLoad={(event) => {
          const { naturalWidth, naturalHeight } = event.currentTarget;
          if (naturalWidth > 0 && naturalHeight > 0) {
            onImageSize(naturalWidth / naturalHeight);
          }
        }}
        onError={() => setBroken(true)}
      />
    </button>
  );
}

type MasonryColumn = { indexes: number[]; height: number };

function makeMasonryColumns(
  photos: GalleryPhoto[],
  width: number,
  imageRatios: Record<string, number>,
): MasonryColumn[] {
  const count = width >= 1580 ? 6 : width >= 1220 ? 5 : width >= 940 ? 4 : width >= 768 ? 3 : 2;
  const columns: MasonryColumn[] = Array.from({ length: count }, () => ({ indexes: [], height: 0 }));
  const gap = width >= 1220 ? 16 : 12;
  const columnWidth = Math.max(1, (Math.max(width, 320) - gap * (count - 1)) / count);

  photos.forEach((photo, index) => {
    const ratio = Math.max(0.4, Math.min(3.5, imageRatios[photo.id] ?? 1));
    let shortest = 0;
    for (let i = 1; i < columns.length; i += 1) {
      if (columns[i].height < columns[shortest].height) shortest = i;
    }
    columns[shortest].indexes.push(index);
    columns[shortest].height += columnWidth / ratio + gap;
  });

  return columns;
}

export function PinterestGallery({
  photos,
}: {
  photos: GalleryPhoto[];
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [viewerBroken, setViewerBroken] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [galleryWidth, setGalleryWidth] = useState(0);
  const [imageRatios, setImageRatios] = useState<Record<string, number>>({});
  const imageRatiosRef = useRef<Record<string, number>>({});
  const ratioFrame = useRef<number | null>(null);
  const grid = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const touchStartX = useRef<number | null>(null);

  const active =
    activeIndex === null ? null : photos[activeIndex] ?? null;

  const trackImageRatio = useCallback((id: string, value: number) => {
    const ratio = Math.max(0.4, Math.min(3.5, value));
    if (Math.abs((imageRatiosRef.current[id] ?? 0) - ratio) < 0.02) return;
    imageRatiosRef.current[id] = ratio;
    // Batch fast image onLoad callbacks to avoid many layout updates.
    if (ratioFrame.current !== null) return;
    ratioFrame.current = requestAnimationFrame(() => {
      ratioFrame.current = null;
      setImageRatios({ ...imageRatiosRef.current });
    });
  }, []);

  useEffect(() => {
    const node = grid.current;
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      const nextWidth = Math.round(entries[0]?.contentRect.width ?? 0);
      if (nextWidth > 0) {
        setGalleryWidth((previous) => previous === nextWidth ? previous : nextWidth);
      }
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
      if (ratioFrame.current !== null) cancelAnimationFrame(ratioFrame.current);
    };
  }, []);

  const columns = useMemo(
    () => makeMasonryColumns(photos, galleryWidth, imageRatios),
    [photos, galleryWidth, imageRatios],
  );

  function open(index: number) {
    setZoom(1);
    setViewerBroken(false);
    setActiveIndex(index);

    const node = dialog.current;
    if (node && !node.open) node.showModal();
  }

  function close() {
    dialog.current?.close();
    setActiveIndex(null);
    setViewerBroken(false);
    setZoom(1);
  }

  function step(delta: number) {
    if (activeIndex === null || !photos.length) return;

    setZoom(1);
    setViewerBroken(false);
    setActiveIndex(
      (activeIndex + delta + photos.length) % photos.length,
    );
  }

  function zoomIn() {
    setZoom((value) => Math.min(2.5, Number((value + 0.25).toFixed(2))));
  }

  function zoomOut() {
    setZoom((value) => Math.max(1, Number((value - 0.25).toFixed(2))));
  }

  useEffect(() => {
    const node = dialog.current;
    if (!node) return;

    function handleClose() {
      setActiveIndex(null);
      setViewerBroken(false);
      setZoom(1);
    }

    node.addEventListener("close", handleClose);
    return () => node.removeEventListener("close", handleClose);
  }, []);

  useEffect(() => {
    if (activeIndex === null) return;

    const body = document.body;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [activeIndex]);

  if (!photos.length) {
    return <div className="gallery-pinterest-empty-v2" aria-hidden="true" />;
  }

  return (
    <>
      {/* Keep the desktop justified rows and use independent vertical stacks on mobile. */}
      <div className="gallery-pinterest-mobile-masonry-v5">
        {[0, 1].map((column) => (
          <div className="gallery-pinterest-mobile-column-v5" key={column}>
            {photos.map((photo, index) =>
              index % 2 === column ? (
                <PinterestPin
                  key={photo.id}
                  photo={photo}
                  index={index}
                  onOpen={() => open(index)}
                  onImageSize={(ratio) => trackImageRatio(photo.id, ratio)}
                />
              ) : null,
            )}
          </div>
        ))}
      </div>
      <div
        ref={grid}
        className="gallery-pinterest-desktop-masonry-v7"
        style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
      >
        {columns.map((column, columnIndex) => (
          <div className="gallery-pinterest-desktop-column-v7" key={columnIndex}>
            {column.indexes.map((index) => {
              const photo = photos[index];
              return (
                <PinterestPin
                  key={photo.id}
                  photo={photo}
                  index={index}
                  onOpen={() => open(index)}
                  onImageSize={(ratio) => trackImageRatio(photo.id, ratio)}
                />
              );
            })}
          </div>
        ))}
      </div>

      <dialog
        ref={dialog}
        className="gallery-pinterest-dialog-v2"
        aria-label="Xem hình ảnh"
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") step(-1);
          if (event.key === "ArrowRight") step(1);
          if (event.key === "Escape") close();
          if (event.key === "+" || event.key === "=") zoomIn();
          if (event.key === "-") zoomOut();
        }}
      >
        <button
          className="gallery-pinterest-close-v2"
          type="button"
          aria-label="Đóng ảnh"
          onClick={close}
        >
          <X size={25} aria-hidden="true" />
        </button>

        {active && (
          <div
            className="gallery-pinterest-stage-v2"
            onTouchStart={(event) => {
              touchStartX.current = event.touches[0]?.clientX ?? null;
            }}
            onTouchEnd={(event) => {
              if (touchStartX.current === null || zoom > 1) return;

              const end =
                event.changedTouches[0]?.clientX ?? touchStartX.current;
              const delta = end - touchStartX.current;
              touchStartX.current = null;

              if (Math.abs(delta) > 55) step(delta > 0 ? -1 : 1);
            }}
          >
            {viewerBroken ? (
              <div
                className="gallery-pinterest-viewer-broken-v2"
                aria-hidden="true"
              >
                <ImageOff size={36} />
              </div>
            ) : (
              <img
                key={active.image_url}
                className="gallery-pinterest-viewer-image-v2"
                src={cloudinaryVariant(active.image_url, "viewer")}
                alt=""
                draggable={false}
                onError={() => setViewerBroken(true)}
                style={{ transform: `scale(${zoom})` }}
              />
            )}
          </div>
        )}

        <div className="gallery-pinterest-zoom-v2">
          <button
            type="button"
            aria-label="Phóng to"
            onClick={zoomIn}
            disabled={zoom >= 2.5}
          >
            <Plus size={23} aria-hidden="true" />
          </button>

          <button
            type="button"
            aria-label="Thu nhỏ"
            onClick={zoomOut}
            disabled={zoom <= 1}
          >
            <Minus size={23} aria-hidden="true" />
          </button>
        </div>
      </dialog>
    </>
  );
}
