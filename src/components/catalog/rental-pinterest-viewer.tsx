"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Minus,
  Plus,
  Share2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/types/catalog";

function cloudinaryVariant(src: string, mode: "viewer" | "blur" | "download") {
  const marker = "/image/upload/";
  const index = src.indexOf(marker);
  if (index < 0) return src;

  const prefix = src.slice(0, index + marker.length);
  const rest = src.slice(index + marker.length);

  if (mode === "viewer") {
    return `${prefix}f_auto,q_auto,c_limit,w_2000,h_2000/${rest}`;
  }

  if (mode === "blur") {
    return `${prefix}f_auto,q_auto:eco,c_fill,w_520,h_700,e_blur:900/${rest}`;
  }

  return `${prefix}fl_attachment/${rest}`;
}

export function RentalPinterestViewer({
  images,
  collectionHref,
  locale,
}: {
  images: string[];
  collectionHref: string;
  locale: Locale;
}) {
  const [selected, setSelected] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [copied, setCopied] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const current = images[Math.min(selected, images.length - 1)] ?? null;
  const vi = locale === "vi";

  const backgroundImages = useMemo(
    () => images.slice(0, Math.min(images.length, 12)),
    [images],
  );

  function step(delta: number) {
    if (images.length < 2) return;
    setZoom(1);
    setSelected((value) => (value + delta + images.length) % images.length);
  }

  function zoomIn() {
    setZoom((value) => Math.min(2.5, Number((value + 0.25).toFixed(2))));
  }

  function zoomOut() {
    setZoom((value) => Math.max(1, Number((value - 0.25).toFixed(2))));
  }

  async function shareCurrent() {
    const shareData = {
      title: "Oni Studio",
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // User cancelled native share or clipboard was unavailable.
    }
  }

  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = html.style.overflow;

    body.style.overflow = "hidden";
    html.style.overflow = "hidden";

    return () => {
      body.style.overflow = previousBodyOverflow;
      html.style.overflow = previousHtmlOverflow;
    };
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "ArrowRight") step(1);
      if (event.key === "+" || event.key === "=") zoomIn();
      if (event.key === "-") zoomOut();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  if (!current) {
    return (
      <div className="rental-pinterest-detail-v3 rental-pinterest-empty-v3">
        <Link href={collectionHref}>
          <X size={24} aria-hidden="true" />
          <span className="sr-only">
            {vi ? "Quay lại danh sách" : "Back to collection"}
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div className="rental-pinterest-detail-v3">
      <div className="rental-pinterest-backdrop-v3" aria-hidden="true">
        {backgroundImages.map((src, index) => (
          <div className="rental-pinterest-backdrop-tile-v3" key={`${src}-${index}`}>
            <Image
              src={cloudinaryVariant(src, "blur")}
              alt=""
              fill
              sizes="25vw"
              unoptimized
            />
          </div>
        ))}
      </div>

      <div className="rental-pinterest-dim-v3" aria-hidden="true" />

      <div className="rental-pinterest-topbar-v3">
        <Link
          className="rental-pinterest-close-v3"
          href={collectionHref}
          aria-label={vi ? "Quay lại danh sách" : "Back to collection"}
        >
          <X size={27} strokeWidth={1.65} aria-hidden="true" />
        </Link>

        <div className="rental-pinterest-actions-v3">
          <button
            className="rental-pinterest-share-v3"
            type="button"
            onClick={shareCurrent}
          >
            <Share2 size={17} aria-hidden="true" />
            <span>{copied ? (vi ? "Đã sao chép" : "Copied") : vi ? "Chia sẻ" : "Share"}</span>
          </button>

          <a
            className="rental-pinterest-save-v3"
            href={cloudinaryVariant(current, "download")}
          >
            <Download size={17} aria-hidden="true" />
            <span>{vi ? "Lưu ảnh" : "Save"}</span>
          </a>
        </div>
      </div>

      <div
        className="rental-pinterest-stage-v3"
        onTouchStart={(event) => {
          touchStart.current = {
            x: event.touches[0]?.clientX ?? 0,
            y: event.touches[0]?.clientY ?? 0,
          };
        }}
        onTouchEnd={(event) => {
          if (!touchStart.current || zoom > 1) return;

          const endX = event.changedTouches[0]?.clientX ?? touchStart.current.x;
          const endY = event.changedTouches[0]?.clientY ?? touchStart.current.y;
          const dx = endX - touchStart.current.x;
          const dy = endY - touchStart.current.y;
          touchStart.current = null;

          if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) {
            step(dx > 0 ? -1 : 1);
          }
        }}
      >
        <div className="rental-pinterest-image-shell-v3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={current}
            src={cloudinaryVariant(current, "viewer")}
            alt=""
            className="rental-pinterest-image-v3"
            draggable={false}
            style={{ transform: `scale(${zoom})` }}
          />
        </div>
      </div>

      {images.length > 1 && (
        <>
          <button
            className="rental-pinterest-nav-v3 is-left"
            type="button"
            aria-label={vi ? "Ảnh trước" : "Previous image"}
            onClick={() => step(-1)}
          >
            <ChevronLeft size={24} aria-hidden="true" />
          </button>

          <button
            className="rental-pinterest-nav-v3 is-right"
            type="button"
            aria-label={vi ? "Ảnh tiếp theo" : "Next image"}
            onClick={() => step(1)}
          >
            <ChevronRight size={24} aria-hidden="true" />
          </button>

          <div className="rental-pinterest-counter-v3" aria-live="polite">
            {selected + 1} / {images.length}
          </div>
        </>
      )}

      <div className="rental-pinterest-zoom-v3">
        <button
          type="button"
          aria-label={vi ? "Phóng to" : "Zoom in"}
          onClick={zoomIn}
          disabled={zoom >= 2.5}
        >
          <Plus size={24} aria-hidden="true" />
        </button>

        <button
          type="button"
          aria-label={vi ? "Thu nhỏ" : "Zoom out"}
          onClick={zoomOut}
          disabled={zoom <= 1}
        >
          <Minus size={24} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
