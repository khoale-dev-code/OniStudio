"use client";
import { useEffect, useRef, useState } from "react";

export type MediaItem = {
  id: string;
  url: string;
  name: string;
  file?: File;
  status: "ready" | "queued" | "uploading" | "error";
  progress: number;
  error?: string;
};
const LIMIT = 8 * 1024 * 1024;
export function useMediaUpload(initial: string[], max: number) {
  const [items, setItems] = useState<MediaItem[]>(() =>
    initial.map((url, i) => ({
      id: `saved-${i}`,
      url,
      name: `Ảnh ${i + 1}`,
      status: "ready",
      progress: 100,
    })),
  );
  const [message, setMessage] = useState("");
  const current = useRef(items);
  const active = useRef(new Map<string, XMLHttpRequest>());
  const previews = useRef(new Set<string>());
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    const requests = active.current;
    const urls = previews.current;
    return () => {
      alive.current = false;
      requests.forEach((xhr) => xhr.abort());
      requests.clear();
      urls.forEach(URL.revokeObjectURL);
      urls.clear();
    };
  }, []);
  function commit(next: MediaItem[]) {
    current.current = next;
    if (alive.current) setItems(next);
  }
  function update(id: string, patch: Partial<MediaItem>) {
    commit(current.current.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }
  function pump() {
    if (!alive.current) return;
    for (const item of current.current.filter((x) => x.status === "queued")) {
      if (active.current.size >= 3) break;
      const xhr = new XMLHttpRequest();
      active.current.set(item.id, xhr);
      update(item.id, { status: "uploading", error: undefined });
      xhr.open("POST", "/api/cloudinary/upload");
      xhr.timeout = 65000;
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable)
          update(item.id, {
            progress: Math.round((event.loaded / event.total) * 100),
          });
      };
      let settled = false;
      function finish(error?: string, url?: string) {
        if (settled) return;
        settled = true;
        active.current.delete(item.id);
        if (!alive.current) return;
        if (url) {
          update(item.id, {
            url,
            status: "ready",
            progress: 100,
            file: undefined,
          });
          URL.revokeObjectURL(item.url);
          previews.current.delete(item.url);
        } else if (error) update(item.id, { status: "error", error });
        pump();
      }
      xhr.onload = () => {
        try {
          const result = JSON.parse(xhr.responseText) as {
            url?: string;
            error?: string;
          };
          if (
            xhr.status >= 200 &&
            xhr.status < 300 &&
            result.url?.startsWith("https://res.cloudinary.com/")
          )
            finish(undefined, result.url);
          else finish(result.error || "Không tải được ảnh. Hãy thử lại.");
        } catch {
          finish("Phản hồi tải ảnh không hợp lệ. Hãy thử lại.");
        }
      };
      xhr.onerror = () => finish("Mất kết nối. Bạn có thể thử lại ảnh này.");
      xhr.ontimeout = () => finish("Tải ảnh quá lâu. Hãy thử lại.");
      xhr.onabort = () => finish();
      const data = new FormData();
      data.append("file", item.file!);
      xhr.send(data);
    }
  }
  function addFiles(files: File[]) {
    const errors: string[] = [];
    const next = [...current.current];
    for (const file of files) {
      if (next.length >= max) {
        errors.push(`Tối đa ${max} ảnh. Các ảnh vượt giới hạn chưa được thêm.`);
        break;
      }
      if (
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size > LIMIT ||
        !file.size
      ) {
        errors.push(`${file.name}: cần JPEG, PNG hoặc WebP, tối đa 8 MB.`);
        continue;
      }
      const url = URL.createObjectURL(file);
      previews.current.add(url);
      next.push({
        id: crypto.randomUUID(),
        url,
        name: file.name,
        file,
        status: "queued",
        progress: 0,
      });
    }
    commit(next);
    setMessage(errors.join(" "));
    pump();
  }
  function remove(id: string) {
    const item = current.current.find((x) => x.id === id);
    commit(current.current.filter((x) => x.id !== id));
    active.current.get(id)?.abort();
    if (item?.url.startsWith("blob:")) {
      URL.revokeObjectURL(item.url);
      previews.current.delete(item.url);
    }
    pump();
  }
  function retry(id: string) {
    update(id, { status: "queued", progress: 0, error: undefined });
    pump();
  }
  function move(id: string, target: string) {
    const next = [...current.current];
    const from = next.findIndex((x) => x.id === id),
      to = next.findIndex((x) => x.id === target);
    if (from < 0 || to < 0 || from === to) return;
    next.splice(to, 0, next.splice(from, 1)[0]);
    commit(next);
    setMessage(`Đã chuyển ảnh đến vị trí ${to + 1}.`);
  }
  function addUrl(url: string) {
    try {
      const parsed = new URL(url);
      const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      if (
        parsed.protocol !== "https:" ||
        parsed.hostname !== "res.cloudinary.com" ||
        !cloud ||
        !parsed.pathname.startsWith(`/${cloud}/image/upload/`) ||
        parsed.username ||
        parsed.password ||
        parsed.hash ||
        url.length > 2048
      )
        throw new Error();
      if (current.current.length >= max) throw new Error();
      if (current.current.some((x) => x.url === url)) {
        setMessage("Ảnh này đã có trong danh sách.");
        return false;
      }
      commit([
        ...current.current,
        {
          id: crypto.randomUUID(),
          url,
          name: "Ảnh Cloudinary",
          status: "ready",
          progress: 100,
        },
      ]);
      setMessage("");
      return true;
    } catch {
      setMessage(`Cần URL ảnh Cloudinary của dự án và tối đa ${max} ảnh.`);
      return false;
    }
  }
  return { items, message, addFiles, remove, retry, move, addUrl };
}
