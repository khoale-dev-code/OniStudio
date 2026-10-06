"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  LoaderCircle,
  Pencil,
} from "lucide-react";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  reorderBackdrops,
  reorderProps,
} from "@/app/admin/actions";

type AssetType = "backdrop" | "prop";

type SortableItem = {
  id: string;
  name: string;
  name_en: string;
  cover: string | null;
  kind: string;
  included: boolean;
  price: number | null;
  published: boolean;
};

function formatPrice(item: SortableItem) {
  if (item.included) return "Miễn phí";
  if (item.price === null) return "Liên hệ";
  return `${new Intl.NumberFormat("vi-VN").format(item.price)} VNĐ`;
}

function moveItem<T>(items: T[], from: number, to: number) {
  if (from === to || from < 0 || to < 0 || to >= items.length) {
    return items;
  }

  const next = [...items];
  const [picked] = next.splice(from, 1);
  next.splice(to, 0, picked);
  return next;
}

export function RentalAssetSorter({
  assetType,
  items,
}: {
  assetType: AssetType;
  items: SortableItem[];
}) {
  const action =
    assetType === "backdrop" ? reorderBackdrops : reorderProps;

  const [state, formAction, pending] = useActionState(action, {});
  const [list, setList] = useState(items);
  const [dragId, setDragId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

  const payload = useMemo(
    () => JSON.stringify(list.map((item) => item.id)),
    [list],
  );

  function move(index: number, direction: -1 | 1) {
    setList((current) => moveItem(current, index, index + direction));
  }

  function dropOn(targetId: string) {
    if (!dragId || dragId === targetId) return;

    setList((current) => {
      const from = current.findIndex((item) => item.id === dragId);
      const to = current.findIndex((item) => item.id === targetId);
      return moveItem(current, from, to);
    });

    setDragId(null);
  }

  return (
    <div className="rental-sorter rental-sorter-v2">
      {state.error && (
        <p className="notice error" role="alert">
          {state.error}
        </p>
      )}

      {state.success && (
        <p className="notice success" role="status">
          {state.success}
        </p>
      )}

      <form action={formAction} className="rental-sort-form">
        <input name="ids" type="hidden" value={payload} readOnly />

        <div className="rental-sort-help">
          <div>
            <strong>Kéo để sắp xếp</strong>
            <span>
              Thứ tự từ trên xuống chính là thứ tự hiển thị ngoài website.
            </span>
          </div>

          <span className="rental-sort-count">
            {list.length} {assetType === "backdrop" ? "phông" : "đạo cụ"}
          </span>
        </div>

        <ol className="rental-sort-list">
          {list.map((item, index) => {
            const editHref =
              assetType === "backdrop"
                ? `/admin/backdrops/${item.id}`
                : `/admin/props/${item.id}`;

            return (
              <li
                className={`rental-sort-row rental-sort-row-v2 ${
                  dragId === item.id ? "is-dragging" : ""
                }`}
                draggable={!pending}
                key={item.id}
                onDragStart={() => setDragId(item.id)}
                onDragEnd={() => setDragId(null)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => dropOn(item.id)}
              >
                <div
                  className="rental-sort-drag-handle"
                  title="Giữ và kéo để đổi vị trí"
                  aria-hidden="true"
                >
                  <GripVertical size={18} />
                </div>

                <div className="rental-sort-media">
                  {item.cover ? (
                    <Image
                      src={item.cover}
                      alt=""
                      fill
                      sizes="72px"
                    />
                  ) : (
                    <span className="admin-equipment-empty">ONI</span>
                  )}
                </div>

                <div className="rental-sort-content">
                  <div className="rental-sort-title-row">
                    <div className="rental-sort-title">
                      <strong>{item.name}</strong>
                      {item.name_en && item.name_en !== item.name && (
                        <span>{item.name_en}</span>
                      )}
                    </div>

                    <span
                      className={`rental-sort-price ${
                        item.included ? "is-free" : ""
                      }`}
                    >
                      {formatPrice(item)}
                    </span>
                  </div>

                  <div className="rental-sort-tags">
                    <span>{item.kind}</span>
                    <span className={item.published ? "is-live" : "is-hidden"}>
                      {item.published ? "Đang hiển thị" : "Đang ẩn"}
                    </span>
                  </div>
                </div>

                <div className="rental-sort-desktop-action">
                  <Link
                    className="rental-sort-edit"
                    href={editHref}
                    aria-label={`Chỉnh sửa ${item.name}`}
                  >
                    <Pencil size={15} />
                    <span>Chỉnh sửa</span>
                  </Link>
                </div>

                <div className="rental-sort-mobile-actions">
                  <button
                    type="button"
                    className="rental-sort-mobile-button"
                    disabled={pending || index === 0}
                    onClick={() => move(index, -1)}
                    aria-label={`Di chuyển ${item.name} lên`}
                  >
                    <ArrowUp size={17} />
                    <span>Lên</span>
                  </button>

                  <button
                    type="button"
                    className="rental-sort-mobile-button"
                    disabled={pending || index === list.length - 1}
                    onClick={() => move(index, 1)}
                    aria-label={`Di chuyển ${item.name} xuống`}
                  >
                    <ArrowDown size={17} />
                    <span>Xuống</span>
                  </button>

                  <Link
                    className="rental-sort-mobile-button"
                    href={editHref}
                    aria-label={`Chỉnh sửa ${item.name}`}
                  >
                    <Pencil size={15} />
                    <span>Sửa</span>
                  </Link>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="rental-sort-footer rental-sort-footer-v2">
          <p>
            Desktop có thể kéo thả trực tiếp. Trên điện thoại dùng nút
            <strong> Lên / Xuống</strong>.
          </p>

          <button
            className="button rental-sort-save"
            disabled={pending || list.length === 0}
          >
            {pending ? (
              <>
                <LoaderCircle className="spin" size={17} />
                Đang lưu...
              </>
            ) : (
              "Lưu thứ tự"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
