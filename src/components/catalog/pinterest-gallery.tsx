/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
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
}: {
  photo: GalleryPhoto;
  index: number;
  onOpen: () => void;
}) {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return (
      <div
        className="gallery-pinterest-pin-v2 gallery-pinterest-pin-broken-v2"
        aria-label={`Ảnh ${index + 1} không còn tồn tại`}
      >
        <ImageOff size={24} aria-hidden="true" />
      </div>
    );
  }

  return (
    <button
      className="gallery-pinterest-pin-v2"
      type="button"
      onClick={onOpen}
      aria-label={`Mở ảnh ${index + 1}`}
    >
      <img
        src={cloudinaryVariant(photo.image_url, "thumb")}
        alt=""
        loading={index < 6 ? "eager" : "lazy"}
        decoding="async"
        onError={() => setBroken(true)}
      />
    </button>
  );
}

export function PinterestGallery({
  photos,
}: {
  photos: GalleryPhoto[];
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [viewerBroken, setViewerBroken] = useState(false);
  const [zoom, setZoom] = useState(1);
  const dialog = useRef<HTMLDialogElement>(null);
  const touchStartX = useRef<number | null>(null);

  const active =
    activeIndex === null ? null : photos[activeIndex] ?? null;

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
      <div className="gallery-pinterest-grid-v2">
        {photos.map((photo, index) => (
          <PinterestPin
            photo={photo}
            index={index}
            key={photo.id}
            onOpen={() => open(index)}
          />
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
