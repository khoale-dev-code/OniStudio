"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Search, SlidersHorizontal } from "lucide-react";
import Link from "@/components/ui/nav-link";
import { equipmentImages } from "@/data/equipment-images";
import { categoryLabel } from "@/lib/equipment";
import { href, formatMoney } from "@/lib/links";
import type {
  Equipment,
  EquipmentCategory,
  Locale,
} from "@/types/catalog";

function searchable(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim();
}

export function EquipmentRates({
  items,
  categories,
  locale,
}: {
  items: Equipment[];
  categories: EquipmentCategory[];
  locale: Locale;
}) {
  const vi = locale === "vi";
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [included, setIncluded] = useState(false);

  const rentalItems = items.filter((item) => item.included === included);
  const visible = rentalItems.filter(
    (item) =>
      (category === "all" || item.category === category) &&
      searchable(`${item.name} ${item.name_en}`).includes(searchable(query)),
  );
  const availableCategories = categories.filter((entry) =>
    rentalItems.some((item) => item.category === entry.slug),
  );

  function reset() {
    setQuery("");
    setCategory("all");
  }

  return (
    <div className="rate-equipment-browser">
      <div className="rate-equipment-toolbar">
        <div
          className="rate-mode"
          role="group"
          aria-label={vi ? "Hình thức thuê" : "Rental type"}
        >
          {[false, true].map((mode) => (
            <button
              key={String(mode)}
              type="button"
              aria-pressed={included === mode}
              onClick={() => {
                setIncluded(mode);
                setCategory("all");
              }}
            >
              {mode
                ? vi
                  ? "Kèm phòng"
                  : "Included"
                : vi
                  ? "Thuê thêm"
                  : "Extra rental"}
              <span>
                {items.filter((item) => item.included === mode).length}
              </span>
            </button>
          ))}
        </div>

        <label className="rate-search">
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">
            {vi ? "Tìm giá thiết bị" : "Search equipment prices"}
          </span>
          <input
            type="search"
            placeholder={vi ? "Tìm thiết bị…" : "Search equipment…"}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>

      <div
        className="rate-categories"
        role="group"
        aria-label={vi ? "Loại thiết bị" : "Equipment category"}
      >
        <button
          type="button"
          aria-pressed={category === "all"}
          onClick={() => setCategory("all")}
        >
          {vi ? "Tất cả" : "All"}
        </button>
        {availableCategories.map((entry) => (
          <button
            type="button"
            key={entry.id}
            aria-pressed={category === entry.slug}
            onClick={() => setCategory(entry.slug)}
          >
            {entry.name[locale]}
          </button>
        ))}
      </div>

      <div className="rate-list-heading">
        <p aria-live="polite" aria-atomic="true">
          {visible.length} {vi ? "thiết bị" : "items"}
        </p>
        <span>{vi ? "Giá thuê / đơn vị" : "Price / unit"}</span>
      </div>

      {visible.length ? (
        <ul className="rate-equipment-list">
          {visible.map((item) => {
            const { images, reference } = equipmentImages(item);
            const name = vi ? item.name : item.name_en;
            return (
              <li key={item.id}>
                <Link
                  className="rate-equipment-row"
                  href={href(locale, `/equipment/${item.slug}`)}
                >
                  <span className="rate-equipment-thumb" aria-hidden="true">
                    {images[0] ? (
                      <Image
                        src={images[0]}
                        alt=""
                        width={64}
                        height={64}
                        sizes="64px"
                      />
                    ) : (
                      <SlidersHorizontal size={23} strokeWidth={1.3} />
                    )}
                  </span>
                  <span className="rate-equipment-name">
                    <strong>{name}</strong>
                    <small>
                      {categoryLabel(categories, item.category, locale)}
                      {reference
                        ? vi
                          ? " · Ảnh từ hãng"
                          : " · Manufacturer image"
                        : ""}
                    </small>
                  </span>
                  <span className="rate-equipment-cost">
                    <strong>
                      {item.included
                        ? vi
                          ? "Kèm phòng"
                          : "Included"
                        : item.price !== null
                          ? formatMoney(item.price, locale)
                          : vi
                            ? "Liên hệ"
                            : "Enquire"}
                    </strong>
                    <small>
                      {item.included
                        ? vi
                          ? "Không tính thêm"
                          : "No extra charge"
                        : `/ ${item.unit[locale]}`}
                    </small>
                  </span>
                  <ArrowUpRight
                    className="rate-row-arrow"
                    size={18}
                    aria-hidden="true"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rate-empty">
          <Search size={26} />
          <h3>{vi ? "Chưa tìm thấy thiết bị" : "No matching equipment"}</h3>
          <p>
            {vi
              ? "Thử tên ngắn hơn hoặc chọn nhóm thiết bị khác."
              : "Try a shorter name or another category."}
          </p>
          <button
            className="button button-outline"
            type="button"
            onClick={reset}
          >
            {vi ? "Xóa bộ lọc" : "Clear filters"}
          </button>
        </div>
      )}

      <p className="rate-equipment-note">
        {included
          ? vi
            ? "Thiết bị đi kèm tùy phòng và lịch sử dụng. Vui lòng xác nhận cùng Oni trước buổi chụp."
            : "Included equipment depends on the room and schedule. Please confirm with Oni before your shoot."
          : vi
            ? "Đơn vị theo bảng giá: đèn, bộ, cây, cặp, dây hoặc buổi. Vui lòng xác nhận thời lượng thuê cùng Oni trước khi đặt."
            : "Prices use the listed unit: light, set, tube, pair, cable or session. Please confirm rental duration with Oni before booking."}
      </p>
    </div>
  );
}
