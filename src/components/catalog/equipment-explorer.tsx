"use client";

import { useState } from "react";
import {
  Building2,
  Search,
  SlidersHorizontal,
  Truck,
} from "lucide-react";
import { EquipmentCard } from "./equipment-card";
import type {
  Equipment,
  EquipmentCategory,
  Locale,
} from "@/types/catalog";

type SourceFilter = "all" | "internal" | "external";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase();
}

function sourceRank(item: Equipment) {
  return item.rental_source === "external" ? 1 : 0;
}

export function EquipmentExplorer({
  items,
  categories,
  locale,
}: {
  items: Equipment[];
  categories: EquipmentCategory[];
  locale: Locale;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [source, setSource] = useState<SourceFilter>("all");
  const [sort, setSort] = useState("default");

  const externalCount = items.filter(
    (item) => item.rental_source === "external",
  ).length;
  const internalCount = items.length - externalCount;

  const sourceItems = items.filter((item) => {
    const itemSource =
      item.rental_source === "external" ? "external" : "internal";
    return source === "all" || itemSource === source;
  });

  const filtered = sourceItems
    .filter(
      (item) =>
        (category === "all" || item.category === category) &&
        normalize(
          `${item.name} ${item.name_en} ${item.description[locale]}`,
        ).includes(normalize(query)),
    )
    .sort((a, b) => {
      if (sort === "low") {
        return (a.price ?? 0) - (b.price ?? 0);
      }

      if (sort === "high") {
        return (b.price ?? 0) - (a.price ?? 0);
      }

      if (source === "all") {
        const sourceDifference = sourceRank(a) - sourceRank(b);
        if (sourceDifference !== 0) return sourceDifference;
      }

      return a.sort_order - b.sort_order || a.name.localeCompare(b.name);
    });

  const visibleCategories = categories.filter((entry) =>
    sourceItems.some((item) => item.category === entry.slug),
  );

  function chooseSource(next: SourceFilter) {
    setSource(next);
    setCategory("all");
  }

  const sourceLabel =
    source === "external"
      ? locale === "vi"
        ? "thiết bị thuê ngoài"
        : "external rental items"
      : source === "internal"
        ? locale === "vi"
          ? "thiết bị tại Oni"
          : "items at Oni"
        : locale === "vi"
          ? "thiết bị"
          : "items";

  return (
    <>
      <div className="equipment-catalog-controls-v4">
        <div className="equipment-controls-main">
          <div
            className="equipment-source-tabs-v4"
            role="group"
            aria-label={
              locale === "vi" ? "Nguồn thiết bị" : "Equipment source"
            }
          >
            <button
              type="button"
              aria-pressed={source === "all"}
              onClick={() => chooseSource("all")}
            >
              <span>{locale === "vi" ? "Tất cả" : "All"}</span>
              <strong>{items.length}</strong>
            </button>

            <button
              type="button"
              aria-pressed={source === "internal"}
              onClick={() => chooseSource("internal")}
            >
              <Building2 size={16} aria-hidden="true" />
              <span>{locale === "vi" ? "Tại Oni" : "At Oni"}</span>
              <strong>{internalCount}</strong>
            </button>

            <button
              type="button"
              aria-pressed={source === "external"}
              onClick={() => chooseSource("external")}
            >
              <Truck size={16} aria-hidden="true" />
              <span>{locale === "vi" ? "Thuê ngoài" : "External"}</span>
              <strong>{externalCount}</strong>
            </button>
          </div>

          <div className="equipment-toolbar-v4">
            <label className="equipment-search-v4">
              <Search size={17} aria-hidden="true" />
              <span className="sr-only">
                {locale === "vi" ? "Tìm thiết bị" : "Search equipment"}
              </span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={
                  locale === "vi"
                    ? "Tìm theo tên thiết bị..."
                    : "Search equipment..."
                }
              />
            </label>

            <label className="equipment-sort-v4">
              <SlidersHorizontal size={15} aria-hidden="true" />
              <span className="sr-only">
                {locale === "vi" ? "Sắp xếp" : "Sort"}
              </span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="default">
                  {locale === "vi" ? "Mặc định" : "Default"}
                </option>
                <option value="low">
                  {locale === "vi"
                    ? "Giá tăng dần"
                    : "Price: low to high"}
                </option>
                <option value="high">
                  {locale === "vi"
                    ? "Giá giảm dần"
                    : "Price: high to low"}
                </option>
              </select>
            </label>
          </div>
        </div>

        <div className="equipment-controls-categories">
          <span className="equipment-category-label">
            {locale === "vi" ? "Danh mục" : "Category"}
          </span>

          <div
            className="filter-chips equipment-category-chips-v4"
            aria-label={
              locale === "vi" ? "Loại thiết bị" : "Equipment category"
            }
          >
            <button
              className="chip"
              aria-pressed={category === "all"}
              onClick={() => setCategory("all")}
            >
              {locale === "vi" ? "Tất cả" : "All"}
            </button>

            {visibleCategories.map((entry) => (
              <button
                key={entry.id}
                className="chip"
                aria-pressed={category === entry.slug}
                onClick={() => setCategory(entry.slug)}
              >
                {entry.name[locale]}
              </button>
            ))}
          </div>

          <p className="equipment-result-count-v4" aria-live="polite">
            <strong>{filtered.length}</strong> {sourceLabel}
          </p>
        </div>
      </div>

      {filtered.length ? (
        <div className="equipment-grid">
          {filtered.map((item) => (
            <EquipmentCard
              key={item.id}
              item={item}
              allEquipment={items}
              categories={categories}
              locale={locale}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>
            {locale === "vi"
              ? "Chưa có thiết bị phù hợp"
              : "No matching equipment"}
          </h2>
          <p>
            {locale === "vi"
              ? source === "external"
                ? "Hiện chưa có thiết bị thuê ngoài phù hợp với bộ lọc này."
                : "Thử tên ngắn hơn hoặc thay đổi bộ lọc."
              : "Try a shorter name or change the filters."}
          </p>
          <button
            className="button button-outline"
            onClick={() => {
              setQuery("");
              setCategory("all");
              setSource("all");
            }}
          >
            {locale === "vi" ? "Xóa bộ lọc" : "Clear filters"}
          </button>
        </div>
      )}
    </>
  );
}
