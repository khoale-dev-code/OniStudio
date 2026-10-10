"use client";

import Image from "next/image";
import { useState } from "react";

// This is only the display URL. The saved Supabase image URL stays unchanged.
function previewUrl(source: string, width: number): string {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloud || source.startsWith("blob:")) return source;
  const prefix = `https://res.cloudinary.com/${cloud}/image/upload/`;
  if (!source.startsWith(prefix)) return source;
  const pathname = source.slice(prefix.length);
  // Do not stack a transformation on top of another transform from older patches.
  if (!/^v\d+\//.test(pathname)) return source;
  const safeWidth = Math.min(720, Math.max(100, width));
  return `${prefix}c_limit,w_${safeWidth},q_auto,f_auto/${pathname}`;
}

type AdminSafeImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  className?: string;
  draggable?: boolean;
};

export function AdminSafeImage({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes,
  className,
  draggable = false,
}: AdminSafeImageProps) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  if (failedSource === src) {
    return (
      <span
        className={className}
        title="Ảnh không còn tồn tại trên Cloudinary. Vui lòng thay ảnh."
        role="img"
        aria-label={alt || "Ảnh không tải được"}
        style={{
          display: "grid",
          placeItems: "center",
          position: fill ? "absolute" : "relative",
          inset: fill ? 0 : undefined,
          width: fill ? "100%" : width ?? 58,
          height: fill ? "100%" : height ?? 58,
          background: "#ecece7",
          color: "#70746d",
          fontSize: 10,
          lineHeight: 1.4,
          textAlign: "center",
          padding: 4,
          borderRadius: 8,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        Ảnh lỗi
      </span>
    );
  }

  return (
    <Image
      src={previewUrl(src, fill ? 420 : 160)}
      alt={alt}
      fill={fill}
      width={fill ? undefined : width ?? 58}
      height={fill ? undefined : height ?? 58}
      sizes={sizes}
      className={className}
      unoptimized
      loading="lazy"
      decoding="async"
      draggable={draggable}
      onError={() => setFailedSource(src)}
    />
  );
}
