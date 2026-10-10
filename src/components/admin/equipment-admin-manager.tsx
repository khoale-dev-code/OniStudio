"use client";

import { AdminSafeImage } from "@/components/admin/admin-safe-image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import {
  cloneEquipmentAsExternal,
  reorderEquipmentSource,
} from "@/app/admin/equipment-v2-actions";
import { categoryLabel } from "@/lib/equipment";
import { formatMoney as money } from "@/lib/links";
import type {
  Equipment,
  EquipmentCategory,
  EquipmentRentalSource,
} from "@/types/catalog";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

type AdminEquipment = Equipment & {
  created_at?: string | null;
};

type SourceView = "all" | EquipmentRentalSource;

function sourceOf(item: AdminEquipment): EquipmentRentalSource {
  return item.rental_source === "external" ? "external" : "internal";
}

function byOrder(a: AdminEquipment, b: AdminEquipment) {
  return a.sort_order - b.sort_order || a.name.localeCompare(b.name, "vi");
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase();
}

function orderedSource(
  items: AdminEquipment[],
  source: EquipmentRentalSource,
) {
  return items.filter((item) => sourceOf(item) === source).sort(byOrder);
}

function reorderSourceItems(
  items: AdminEquipment[],
  source: EquipmentRentalSource,
  draggedId: string,
  targetId: string,
) {
  if (draggedId === targetId) return items;

  const group = orderedSource(items, source);
  const from = group.findIndex((item) => item.id === draggedId);
  const to = group.findIndex((item) => item.id === targetId);

  if (from < 0 || to < 0) return items;

  const nextGroup = [...group];
  const [moved] = nextGroup.splice(from, 1);
  nextGroup.splice(to, 0, moved);

  const orderById = new Map(
    nextGroup.map((item, index) => [item.id, index]),
  );

  return items.map((item) => {
    if (sourceOf(item) !== source) return item;
    const nextOrder = orderById.get(item.id);
    return nextOrder === undefined
      ? item
      : { ...item, sort_order: nextOrder };
  });
}

export function EquipmentAdminManager({
  initialItems,
  categories,
  recentIds,
}: {
  initialItems: AdminEquipment[];
  categories: EquipmentCategory[];
  recentIds: string[];
}) {
  const [items, setItems] = useState<AdminEquipment[]>(() =>
    initialItems.map(
      (item): AdminEquipment => ({
        ...item,
        rental_source:
          item.rental_source === "external" ? "external" : "internal",
      }),
    ),
  );
  const itemsRef = useRef(items);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const [source, setSource] = useState<SourceView>("all");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [recentOnly, setRecentOnly] = useState(false);
  const [dragging, setDragging] = useState<{
    id: string;
    source: EquipmentRentalSource;
  } | null>(null);
  const dragBackup = useRef<AdminEquipment[] | null>(null);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [saving, startSaving] = useTransition();

  const recentIdSet = useMemo(
    () => new Set(recentIds),
    [recentIds],
  );

  const counts = useMemo(() => {
    const internal = items.filter(
      (item) => sourceOf(item) === "internal",
    ).length;
    const external = items.length - internal;
    const recent = items.filter((item) => recentIdSet.has(item.id)).length;

    return { internal, external, recent };
  }, [items, recentIdSet]);

  const filtered = useMemo(() => {
    const normalizedQuery = normalize(query.trim());

    return items.filter((item) => {
      if (source !== "all" && sourceOf(item) !== source) return false;
      if (category !== "all" && item.category !== category) return false;

      if (recentOnly && !recentIdSet.has(item.id)) {
        return false;
      }

      if (
        normalizedQuery &&
        !normalize(`${item.name} ${item.name_en}`).includes(normalizedQuery)
      ) {
        return false;
      }

      return true;
    });
  }, [category, items, query, recentIdSet, recentOnly, source]);

  const internalItems = filtered
    .filter((item) => sourceOf(item) === "internal")
    .sort(byOrder);

  const externalItems = filtered
    .filter((item) => sourceOf(item) === "external")
    .sort(byOrder);

  const canReorder =
    !query.trim() && category === "all" && !recentOnly && !saving;

  function isRecent(item: AdminEquipment) {
    return recentIdSet.has(item.id);
  }

  async function persistOrder(sourceType: EquipmentRentalSource) {
    const ids = orderedSource(itemsRef.current, sourceType).map(
      (item) => item.id,
    );

    setStatus(null);

    startSaving(async () => {
      const result = await reorderEquipmentSource(sourceType, ids);

      if (result.error) {
        if (dragBackup.current) {
          setItems(dragBackup.current);
        }
        setStatus({ type: "error", text: result.error });
        return;
      }

      dragBackup.current = null;
      setStatus({
        type: "success",
        text:
          sourceType === "external"
            ? "Đã lưu thứ tự thiết bị thuê ngoài."
            : "Đã lưu thứ tự thiết bị tại Oni.",
      });
    });
  }

  function handlePointerDown(
    event: React.PointerEvent<HTMLButtonElement>,
    item: AdminEquipment,
  ) {
    if (!canReorder) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragBackup.current = itemsRef.current.map((current) => ({ ...current }));
    setDragging({ id: item.id, source: sourceOf(item) });
    setStatus(null);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    if (!dragging || !canReorder) return;

    const target = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>("[data-equipment-row-id]");

    if (!target) return;
    if (target.dataset.equipmentSource !== dragging.source) return;

    const targetId = target.dataset.equipmentRowId;
    if (!targetId || targetId === dragging.id) return;

    setItems((current) =>
      reorderSourceItems(
        current,
        dragging.source,
        dragging.id,
        targetId,
      ),
    );
  }

  function finishPointerDrag() {
    if (!dragging) return;
    const sourceType = dragging.source;
    setDragging(null);
    void persistOrder(sourceType);
  }

  function moveBy(
    item: AdminEquipment,
    direction: -1 | 1,
  ) {
    if (!canReorder) return;

    const sourceType = sourceOf(item);
    const group = orderedSource(itemsRef.current, sourceType);
    const index = group.findIndex((current) => current.id === item.id);
    const target = group[index + direction];

    if (!target) return;

    dragBackup.current = itemsRef.current.map((current) => ({ ...current }));
    setItems((current) =>
      reorderSourceItems(current, sourceType, item.id, target.id),
    );

    queueMicrotask(() => {
      void persistOrder(sourceType);
    });
  }

  function renderGroup(
    title: string,
    sourceType: EquipmentRentalSource,
    groupItems: AdminEquipment[],
  ) {
    if (
      (source !== "all" && source !== sourceType) ||
      (source === "all" && groupItems.length === 0)
    ) {
      return null;
    }

    const total =
      sourceType === "external" ? counts.external : counts.internal;

    return (
      <section className="equipment-admin-group" key={sourceType}>
        <div className="equipment-admin-group-head">
          <div>
            <h2>{title}</h2>
            <p>
              {groupItems.length === total
                ? `${total} thiết bị`
                : `${groupItems.length}/${total} thiết bị`}
            </p>
          </div>

          <div className="equipment-admin-order-note">
            <GripVertical size={15} aria-hidden="true" />
            <span>
              {canReorder
                ? "Kéo tay nắm để đổi vị trí trên website"
                : "Xóa bộ lọc để kéo sắp xếp"}
            </span>
          </div>
        </div>

        <div className="equipment-admin-list-v3">
          <div className="equipment-admin-list-head" aria-hidden="true">
            <span>Vị trí</span>
            <span>Thiết bị</span>
            <span>Danh mục</span>
            <span>Giá</span>
            <span>
              {sourceType === "external" ? "Đi kèm" : "Hiển thị"}
            </span>
            <span>Thao tác</span>
          </div>

          {groupItems.map((item, index) => {
            const cover = item.images?.[0] || item.image_url;
            const accessoryCount =
              item.included_equipment_ids?.length ??
              item.included_equipment_items?.length ??
              0;
            const activeDrag = dragging?.id === item.id;

            return (
              <article
                key={item.id}
                className={`equipment-admin-row-v3 ${
                  activeDrag ? "is-dragging" : ""
                }`}
                data-equipment-row-id={item.id}
                data-equipment-source={sourceType}
              >
                <div className="equipment-admin-order-cell">
                  <button
                    type="button"
                    className="equipment-drag-handle"
                    aria-label={`Kéo để đổi vị trí ${item.name}`}
                    title={
                      canReorder
                        ? "Giữ và kéo để thay đổi vị trí"
                        : "Xóa bộ lọc để sắp xếp"
                    }
                    disabled={!canReorder}
                    onPointerDown={(event) =>
                      handlePointerDown(event, item)
                    }
                    onPointerMove={handlePointerMove}
                    onPointerUp={finishPointerDrag}
                    onPointerCancel={() => setDragging(null)}
                  >
                    <GripVertical size={18} aria-hidden="true" />
                  </button>

                  <span className="equipment-position-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="equipment-order-buttons">
                    <button
                      type="button"
                      disabled={!canReorder || index === 0}
                      onClick={() => moveBy(item, -1)}
                      aria-label={`Đưa ${item.name} lên`}
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={
                        !canReorder || index === groupItems.length - 1
                      }
                      onClick={() => moveBy(item, 1)}
                      aria-label={`Đưa ${item.name} xuống`}
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>
                </div>

                <div className="equipment-admin-product-cell">
                  {cover ? (
                    <AdminSafeImage
                      src={cover}
                      alt=""
                      width={58}
                      height={58}
                      className="admin-equipment-thumb"
                    />
                  ) : (
                    <span className="admin-equipment-empty">ONI</span>
                  )}

                  <div>
                    <div className="equipment-admin-name-line">
                      <strong>{item.name}</strong>
                      {isRecent(item) && (
                        <span className="equipment-new-badge">Mới</span>
                      )}
                    </div>
                    <small>{item.name_en}</small>
                  </div>
                </div>

                <div className="equipment-admin-meta-cell">
                  <span className="equipment-admin-mobile-label">
                    Danh mục
                  </span>
                  <span>
                    {categoryLabel(categories, item.category, "vi")}
                  </span>
                </div>

                <div className="equipment-admin-meta-cell">
                  <span className="equipment-admin-mobile-label">Giá</span>
                  <span>
                    {item.included
                      ? "Kèm phòng"
                      : item.price !== null
                        ? money(item.price)
                        : "Liên hệ"}
                  </span>
                </div>

                <div className="equipment-admin-meta-cell">
                  <span className="equipment-admin-mobile-label">
                    {sourceType === "external" ? "Đi kèm" : "Hiển thị"}
                  </span>
                  {sourceType === "external" ? (
                    <span>
                      {accessoryCount > 0
                        ? `${accessoryCount} sản phẩm`
                        : "Chưa chọn"}
                    </span>
                  ) : (
                    <span>{item.published ? "Công khai" : "Đang ẩn"}</span>
                  )}
                </div>

                <div className="equipment-admin-actions equipment-admin-actions-v3">
                  <Link
                    href={`/admin/equipment/${item.id}`}
                    prefetch={false}
                  >
                    Chỉnh sửa
                  </Link>

                  {sourceType === "internal" && (
                    <form
                      action={cloneEquipmentAsExternal.bind(null, item.id)}
                    >
                      <button type="submit">Tạo thuê ngoài</button>
                    </form>
                  )}
                </div>
              </article>
            );
          })}

          {groupItems.length === 0 && (
            <div className="equipment-admin-empty">
              Không có thiết bị phù hợp với bộ lọc.
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <div className="equipment-admin-manager-v3">
      <div className="equipment-admin-toolbar-v3">
        <div className="equipment-admin-source-tabs" role="group">
          <button
            type="button"
            aria-pressed={source === "all"}
            onClick={() => setSource("all")}
          >
            Tất cả
            <strong>{items.length}</strong>
          </button>
          <button
            type="button"
            aria-pressed={source === "internal"}
            onClick={() => setSource("internal")}
          >
            Tại Oni
            <strong>{counts.internal}</strong>
          </button>
          <button
            type="button"
            aria-pressed={source === "external"}
            onClick={() => setSource("external")}
          >
            Thuê ngoài
            <strong>{counts.external}</strong>
          </button>
        </div>

        <label className="equipment-admin-search">
          <Search size={16} aria-hidden="true" />
          <span className="sr-only">Tìm thiết bị</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            type="search"
            placeholder="Tìm theo tên thiết bị..."
          />
        </label>

        <label className="equipment-admin-category-filter">
          <SlidersHorizontal size={15} aria-hidden="true" />
          <span className="sr-only">Lọc danh mục</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((entry) => (
              <option key={entry.id} value={entry.slug}>
                {entry.name.vi}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className="equipment-recent-filter"
          aria-pressed={recentOnly}
          onClick={() => setRecentOnly((current) => !current)}
        >
          <Sparkles size={15} aria-hidden="true" />
          Mới thêm
          <strong>{counts.recent}</strong>
        </button>
      </div>

      <div className="equipment-admin-filter-summary">
        <span>
          Hiển thị <strong>{filtered.length}</strong> / {items.length} thiết bị
        </span>
        {recentOnly && <span>5 thiết bị được thêm gần nhất</span>}
        {!canReorder && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("all");
              setRecentOnly(false);
            }}
          >
            Xóa bộ lọc để sắp xếp
          </button>
        )}
      </div>

      {status && (
        <p
          className={`notice ${
            status.type === "error" ? "error" : "success"
          } equipment-order-status`}
          role={status.type === "error" ? "alert" : "status"}
        >
          {status.text}
        </p>
      )}

      {renderGroup(
        "Thiết bị tại Oni",
        "internal",
        internalItems,
      )}
      {renderGroup(
        "Thiết bị thuê ngoài",
        "external",
        externalItems,
      )}
    </div>
  );
}
