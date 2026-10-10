"use client";

import { AdminSafeImage } from "@/components/admin/admin-safe-image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  ImageIcon,
  LoaderCircle,
  Pencil,
  Search,
} from "lucide-react";
import {
  useMemo,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import {
  reorderBackdrops,
  reorderProps,
} from "@/app/admin/actions";

type AssetType = "backdrop" | "prop";
type BackdropKind = "color" | "effect";
type BackdropTab = "all" | BackdropKind;
type PropTab = "all" | "published" | "hidden";
type FeeFilter = "all" | "free" | "paid";

export type RentalAdminItem = {
  id: string;
  name: string;
  name_en: string;
  cover: string | null;
  kind: BackdropKind | "prop";
  included: boolean;
  price: number | null;
  published: boolean;
  imageCount: number;
};

function money(value: number) {
  return `${new Intl.NumberFormat("vi-VN").format(value)} VNĐ`;
}

function feeLabel(item: RentalAdminItem) {
  if (item.included) return "Miễn phí";
  if (item.price === null) return "Liên hệ";
  return money(item.price);
}

function kindLabel(item: RentalAdminItem) {
  if (item.kind === "effect") return "Phông màu hiệu ứng";
  if (item.kind === "color") return "Phông màu";
  return "Đạo cụ";
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

export function RentalAssetAdminManager({
  assetType,
  items: initialItems,
}: {
  assetType: AssetType;
  items: RentalAdminItem[];
}) {
  const action =
    assetType === "backdrop" ? reorderBackdrops : reorderProps;
  const [pending, startSaving] = useTransition();
  const [status, setStatus] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [items, setItems] = useState<RentalAdminItem[]>(initialItems);
  const [dragId, setDragId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [feeFilter, setFeeFilter] = useState<FeeFilter>("all");
  const [backdropTab, setBackdropTab] = useState<BackdropTab>("all");
  const [propTab, setPropTab] = useState<PropTab>("all");
  const [dirty, setDirty] = useState(false);

  const counts = useMemo(() => {
    const color = items.filter((item) => item.kind === "color").length;
    const effect = items.filter((item) => item.kind === "effect").length;
    const published = items.filter((item) => item.published).length;
    const hidden = items.length - published;

    return {
      all: items.length,
      color,
      effect,
      published,
      hidden,
    };
  }, [items]);

  const hasFilter =
    query.trim().length > 0 ||
    feeFilter !== "all" ||
    (assetType === "backdrop"
      ? backdropTab !== "all"
      : propTab !== "all");

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("vi");

    return items.filter((item) => {
      if (assetType === "backdrop" && backdropTab !== "all") {
        if (item.kind !== backdropTab) return false;
      }

      if (assetType === "prop" && propTab !== "all") {
        if (propTab === "published" && !item.published) return false;
        if (propTab === "hidden" && item.published) return false;
      }

      if (feeFilter === "free" && !item.included) return false;
      if (feeFilter === "paid" && item.included) return false;

      if (
        normalizedQuery &&
        !`${item.name} ${item.name_en}`
          .toLocaleLowerCase("vi")
          .includes(normalizedQuery)
      ) {
        return false;
      }

      return true;
    });
  }, [
    assetType,
    backdropTab,
    feeFilter,
    items,
    propTab,
    query,
  ]);

  const payload = useMemo(
    () => JSON.stringify(items.map((item) => item.id)),
    [items],
  );

  function move(index: number, direction: -1 | 1) {
    if (hasFilter || pending) return;

    setItems((current) => {
      const next = moveItem(current, index, index + direction);
      return next;
    });
    setDirty(true);
  }

  function dropOn(targetId: string) {
    if (!dragId || dragId === targetId || hasFilter || pending) {
      setDragId(null);
      return;
    }

    setItems((current) => {
      const from = current.findIndex((item) => item.id === dragId);
      const to = current.findIndex((item) => item.id === targetId);
      return moveItem(current, from, to);
    });

    setDirty(true);
    setDragId(null);
  }

  function resetFilters() {
    setQuery("");
    setFeeFilter("all");
    setBackdropTab("all");
    setPropTab("all");
  }

  function saveOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (pending || hasFilter || !dirty || items.length === 0) return;

    const form = new FormData(event.currentTarget);
    setStatus(null);

    startSaving(async () => {
      const result = await action({}, form);

      if (result.error) {
        setStatus({ type: "error", text: result.error });
        return;
      }

      setDirty(false);
      setStatus({
        type: "success",
        text: result.success || "Đã cập nhật thứ tự hiển thị.",
      });
    });
  }

  const noun = assetType === "backdrop" ? "phông" : "đạo cụ";

  return (
    <div className="rental-admin-manager-v3">
      {status && (
        <p
          className={`notice ${status.type === "error" ? "error" : "success"}`}
          role={status.type === "error" ? "alert" : "status"}
        >
          {status.text}
        </p>
      )}

      <div className="rental-admin-toolbar-v3">
        <div className="rental-admin-tabs-v3" role="group" aria-label="Bộ lọc nhanh">
          {assetType === "backdrop" ? (
            <>
              <button
                type="button"
                className={backdropTab === "all" ? "is-active" : ""}
                onClick={() => setBackdropTab("all")}
              >
                Tất cả <strong>{counts.all}</strong>
              </button>
              <button
                type="button"
                className={backdropTab === "color" ? "is-active" : ""}
                onClick={() => setBackdropTab("color")}
              >
                Phông màu <strong>{counts.color}</strong>
              </button>
              <button
                type="button"
                className={backdropTab === "effect" ? "is-active" : ""}
                onClick={() => setBackdropTab("effect")}
              >
                Hiệu ứng <strong>{counts.effect}</strong>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={propTab === "all" ? "is-active" : ""}
                onClick={() => setPropTab("all")}
              >
                Tất cả <strong>{counts.all}</strong>
              </button>
              <button
                type="button"
                className={propTab === "published" ? "is-active" : ""}
                onClick={() => setPropTab("published")}
              >
                Đang hiển thị <strong>{counts.published}</strong>
              </button>
              <button
                type="button"
                className={propTab === "hidden" ? "is-active" : ""}
                onClick={() => setPropTab("hidden")}
              >
                Đang ẩn <strong>{counts.hidden}</strong>
              </button>
            </>
          )}
        </div>

        <label className="rental-admin-search-v3">
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">Tìm kiếm</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Tìm theo tên ${noun}...`}
          />
        </label>

        <label className="rental-admin-fee-filter-v3">
          <span className="sr-only">Lọc mức phí</span>
          <select
            value={feeFilter}
            onChange={(event) =>
              setFeeFilter(event.target.value as FeeFilter)
            }
          >
            <option value="all">Tất cả mức phí</option>
            <option value="free">Miễn phí</option>
            <option value="paid">Có phí / liên hệ</option>
          </select>
        </label>
      </div>

      <div className="rental-admin-filter-summary-v3">
        <span>
          Hiển thị <strong>{visibleItems.length}</strong> / {items.length} {noun}
        </span>

        {hasFilter && (
          <button type="button" onClick={resetFilters}>
            Xóa bộ lọc
          </button>
        )}
      </div>

      <section className="rental-admin-table-v3">
        <div className="rental-admin-table-head-v3">
          <div>
            <h2>
              {assetType === "backdrop" ? "Danh sách phông" : "Danh sách đạo cụ"}
            </h2>
            <p>
              {hasFilter
                ? "Đang lọc danh sách. Xóa bộ lọc để kéo thả thay đổi thứ tự."
                : "Kéo tay nắm hoặc dùng nút lên / xuống để thay đổi vị trí ngoài website."}
            </p>
          </div>

          <div className="rental-admin-order-status-v3">
            <GripVertical size={16} aria-hidden="true" />
            <span>
              {hasFilter
                ? "Sắp xếp đang khóa khi lọc"
                : dirty
                  ? "Có thay đổi chưa lưu"
                  : "Thứ tự đã đồng bộ"}
            </span>
          </div>
        </div>

        <form onSubmit={saveOrder} className="rental-admin-order-form-v3">
          <input type="hidden" name="ids" value={payload} readOnly />

          <div
            className={`rental-admin-list-head-v3 ${
              assetType === "backdrop" ? "is-backdrop" : "is-prop"
            }`}
            aria-hidden="true"
          >
            <span>Vị trí</span>
            <span>{assetType === "backdrop" ? "Phông" : "Đạo cụ"}</span>
            <span>{assetType === "backdrop" ? "Loại" : "Mức phí"}</span>
            <span>{assetType === "backdrop" ? "Giá" : "Hình ảnh"}</span>
            <span>Hiển thị</span>
            <span>Thao tác</span>
          </div>

          <ol className="rental-admin-row-list-v3">
            {visibleItems.map((item) => {
              const realIndex = items.findIndex(
                (candidate) => candidate.id === item.id,
              );
              const editHref =
                assetType === "backdrop"
                  ? `/admin/backdrops/${item.id}`
                  : `/admin/props/${item.id}`;

              return (
                <li
                  className={`rental-admin-row-v3 ${
                    assetType === "backdrop"
                      ? "is-backdrop"
                      : "is-prop"
                  } ${dragId === item.id ? "is-dragging" : ""}`}
                  draggable={!pending && !hasFilter}
                  key={item.id}
                  onDragStart={() => {
                    if (!hasFilter) setDragId(item.id);
                  }}
                  onDragEnd={() => setDragId(null)}
                  onDragOver={(event) => {
                    if (!hasFilter) event.preventDefault();
                  }}
                  onDrop={() => dropOn(item.id)}
                >
                  <div className="rental-admin-position-v3">
                    <button
                      type="button"
                      className="rental-admin-drag-v3"
                      disabled={pending || hasFilter}
                      aria-label={`Kéo ${item.name} để đổi vị trí`}
                      title={
                        hasFilter
                          ? "Xóa bộ lọc để sắp xếp"
                          : "Giữ và kéo để đổi vị trí"
                      }
                    >
                      <GripVertical size={18} />
                    </button>

                    <span className="rental-admin-index-v3">
                      {String(realIndex + 1).padStart(2, "0")}
                    </span>

                    <div className="rental-admin-move-v3">
                      <button
                        type="button"
                        disabled={
                          pending ||
                          hasFilter ||
                          realIndex <= 0
                        }
                        onClick={() => move(realIndex, -1)}
                        aria-label={`Di chuyển ${item.name} lên`}
                      >
                        <ArrowUp size={16} />
                      </button>

                      <button
                        type="button"
                        disabled={
                          pending ||
                          hasFilter ||
                          realIndex >= items.length - 1
                        }
                        onClick={() => move(realIndex, 1)}
                        aria-label={`Di chuyển ${item.name} xuống`}
                      >
                        <ArrowDown size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="rental-admin-product-v3">
                    <div className="rental-admin-thumb-v3">
                      {item.cover ? (
                        <AdminSafeImage
                          src={item.cover}
                          alt=""
                          fill
                          sizes="92px"
                        />
                      ) : (
                        <span>ONI</span>
                      )}
                    </div>

                    <div className="rental-admin-product-copy-v3">
                      <strong>{item.name}</strong>
                      {item.name_en && item.name_en !== item.name && (
                        <small>{item.name_en}</small>
                      )}
                    </div>
                  </div>

                  {assetType === "backdrop" ? (
                    <>
                      <div className="rental-admin-cell-v3">
                        <span className="rental-admin-type-v3">
                          {kindLabel(item)}
                        </span>
                      </div>

                      <div className="rental-admin-cell-v3">
                        <span
                          className={`rental-admin-fee-v3 ${
                            item.included
                              ? "is-free"
                              : item.price !== null
                                ? "is-paid"
                                : ""
                          }`}
                        >
                          {feeLabel(item)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="rental-admin-cell-v3">
                        <span
                          className={`rental-admin-fee-v3 ${
                            item.included
                              ? "is-free"
                              : item.price !== null
                                ? "is-paid"
                                : ""
                          }`}
                        >
                          {feeLabel(item)}
                        </span>
                      </div>

                      <div className="rental-admin-cell-v3">
                        <span className="rental-admin-images-v3">
                          <ImageIcon size={15} aria-hidden="true" />
                          {item.imageCount} ảnh
                        </span>
                      </div>
                    </>
                  )}

                  <div className="rental-admin-cell-v3">
                    <span
                      className={`rental-admin-visibility-v3 ${
                        item.published ? "is-live" : "is-hidden"
                      }`}
                    >
                      {item.published ? "Công khai" : "Đang ẩn"}
                    </span>
                  </div>

                  <div className="rental-admin-actions-v3">
                    <Link href={editHref} prefetch={false}>
                      <Pencil size={15} aria-hidden="true" />
                      Chỉnh sửa
                    </Link>
                  </div>
                </li>
              );
            })}
          </ol>

          {!visibleItems.length && (
            <div className="rental-admin-empty-v3">
              Không tìm thấy {noun} phù hợp với bộ lọc hiện tại.
            </div>
          )}

          <div className="rental-admin-savebar-v3">
            <div>
              <strong>
                {dirty ? "Thứ tự đã thay đổi" : "Sắp xếp hiển thị"}
              </strong>
              <span>
                {hasFilter
                  ? "Xóa bộ lọc trước khi đổi vị trí."
                  : "Thứ tự từ trên xuống sẽ được dùng ngoài website."}
              </span>
            </div>

            <button
              className="button"
              disabled={
                pending ||
                !dirty ||
                hasFilter ||
                items.length === 0
              }
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
      </section>
    </div>
  );
}
