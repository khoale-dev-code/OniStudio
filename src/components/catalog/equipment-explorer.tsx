"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { EquipmentCard } from "./equipment-card";
import type {
  Equipment,
  EquipmentCategory,
  Locale,
} from "@/types/catalog";

function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase();
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
  const [mode, setMode] = useState("all");
  const [sort, setSort] = useState("default");

  const filtered = items
    .filter(
      (item) =>
        (category === "all" || item.category === category) &&
        (mode === "all" ||
          (mode === "included" ? item.included : !item.included)) &&
        normalize(
          `${item.name} ${item.name_en} ${item.description[locale]}`,
        ).includes(normalize(query)),
    )
    .sort((a, b) =>
      sort === "low"
        ? (a.price ?? 0) - (b.price ?? 0)
        : sort === "high"
          ? (b.price ?? 0) - (a.price ?? 0)
          : a.sort_order - b.sort_order,
    );

  const visibleCategories = categories.filter((entry) =>
    items.some((item) => item.category === entry.slug),
  );

  return (
    <>
      <div className="catalog-toolbar">
        <label className="search-field">
          <Search size={18} />
          <span className="sr-only">
            {locale === "vi" ? "Tìm thiết bị" : "Search equipment"}
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={
              locale === "vi" ? "Tìm theo tên thiết bị…" : "Search equipment…"
            }
          />
        </label>

        <label className="select-field">
          <span>{locale === "vi" ? "Hình thức" : "Rental type"}</span>
          <select value={mode} onChange={(event) => setMode(event.target.value)}>
            <option value="all">{locale === "vi" ? "Tất cả" : "All"}</option>
            <option value="rental">
              {locale === "vi" ? "Thuê thêm" : "Extra rental"}
            </option>
            <option value="included">
              {locale === "vi" ? "Miễn phí kèm phòng" : "Included with room"}
            </option>
          </select>
        </label>

        <label className="select-field">
          <span>{locale === "vi" ? "Sắp xếp" : "Sort by"}</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="default">
              {locale === "vi" ? "Mặc định" : "Default"}
            </option>
            <option value="low">
              {locale === "vi" ? "Giá tăng dần" : "Price: low to high"}
            </option>
            <option value="high">
              {locale === "vi" ? "Giá giảm dần" : "Price: high to low"}
            </option>
          </select>
        </label>
      </div>

      <div
        className="filter-chips"
        aria-label={locale === "vi" ? "Loại thiết bị" : "Equipment category"}
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

      <p className="result-count" aria-live="polite">
        {filtered.length}{" "}
        {locale === "vi"
          ? "thiết bị · Trạng thái tồn kho được cập nhật theo từng thiết bị vật lý."
          : "items · Inventory status is tracked per physical item."}
      </p>

      {filtered.length ? (
        <div className="equipment-grid">
          {filtered.map((item) => (
            <EquipmentCard
              key={item.id}
              item={item}
              categories={categories}
              locale={locale}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>
            {locale === "vi"
              ? "Chưa tìm thấy thiết bị phù hợp"
              : "No matching equipment"}
          </h2>
          <p>
            {locale === "vi"
              ? "Thử tên ngắn hơn hoặc thay đổi bộ lọc."
              : "Try a shorter name or change the filters."}
          </p>
          <button
            className="button button-outline"
            onClick={() => {
              setQuery("");
              setCategory("all");
              setMode("all");
            }}
          >
            {locale === "vi" ? "Xóa bộ lọc" : "Clear filters"}
          </button>
        </div>
      )}
    </>
  );
}
