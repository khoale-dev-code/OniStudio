"use client";

import {
  useMemo,
  useRef,
  useState,
  type UIEvent,
} from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Images,
  Maximize2,
  UserRound,
  X,
} from "lucide-react";
import type {
  GalleryCategory,
  GalleryItem,
  Locale,
} from "@/types/catalog";

type GalleryVariant = "home" | "page";

function imagesFor(item: GalleryItem) {
  return item.images?.length ? item.images : [item.image_url].filter(Boolean);
}

function categoryName(
  categories: GalleryCategory[],
  slug: string,
  locale: Locale,
) {
  return categories.find((category) => category.slug === slug)?.name[locale] || slug;
}

function AlbumSlider({
  item,
  locale,
  onOpen,
}: {
  item: GalleryItem;
  locale: Locale;
  onOpen: (index: number) => void;
}) {
  const images = imagesFor(item);
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const vi = locale === "vi";

  function goTo(index: number) {
    if (!track.current || !images.length) return;

    const next = Math.max(0, Math.min(index, images.length - 1));
    track.current.scrollTo({
      left: track.current.clientWidth * next,
      behavior: "smooth",
    });
    setActive(next);
  }

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    const element = event.currentTarget;
    if (!element.clientWidth) return;

    const next = Math.round(element.scrollLeft / element.clientWidth);
    if (next !== active && next >= 0 && next < images.length) {
      setActive(next);
    }
  }

  return (
    <div className="gallery-project-media">
      <div
        className="gallery-project-track"
        ref={track}
        onScroll={handleScroll}
        aria-label={vi ? "Ảnh trong album" : "Album images"}
      >
        {images.map((src, index) => (
          <div className="gallery-project-slide" key={`${src}-${index}`}>
            <Image
              src={src}
              alt={`${item.title[locale]} — ${vi ? "ảnh" : "image"} ${index + 1}`}
              fill
              sizes="(max-width: 760px) 100vw, 64vw"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            className="gallery-project-arrow gallery-project-arrow-left"
            aria-label={vi ? "Ảnh trước" : "Previous image"}
            disabled={active === 0}
            onClick={() => goTo(active - 1)}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            className="gallery-project-arrow gallery-project-arrow-right"
            aria-label={vi ? "Ảnh tiếp" : "Next image"}
            disabled={active === images.length - 1}
            onClick={() => goTo(active + 1)}
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      <div className="gallery-project-media-footer">
        <span className="gallery-project-index">
          {active + 1} / {images.length}
        </span>

        {images.length > 1 && (
          <div
            className="gallery-project-dots"
            aria-label={vi ? "Vị trí ảnh" : "Image position"}
          >
            {images.slice(0, 8).map((_, index) => (
              <button
                type="button"
                key={index}
                aria-label={`${vi ? "Xem ảnh" : "View image"} ${index + 1}`}
                aria-pressed={active === index}
                onClick={() => goTo(index)}
              />
            ))}
            {images.length > 8 && (
              <span className="gallery-project-dots-more">+{images.length - 8}</span>
            )}
          </div>
        )}

        <button
          type="button"
          className="gallery-project-expand"
          onClick={() => onOpen(active)}
        >
          <Maximize2 size={15} aria-hidden="true" />
          {vi ? "Toàn màn hình" : "Fullscreen"}
        </button>
      </div>

      {images.length > 1 && (
        <span className="gallery-project-swipe-hint">
          {vi ? "Vuốt để xem thêm ảnh" : "Swipe for more"}
        </span>
      )}
    </div>
  );
}

function HomeGallery({
  items,
  locale,
  onOpen,
}: {
  items: GalleryItem[];
  locale: Locale;
  onOpen: (item: GalleryItem, index?: number) => void;
}) {
  const vi = locale === "vi";

  return (
    <div className="gallery-home-grid">
      {items.map((item) => {
        const images = imagesFor(item);
        const cover = images[0];

        return (
          <article className="gallery-home-card" key={item.id}>
            <button
              type="button"
              className="gallery-home-cover"
              onClick={() => onOpen(item, 0)}
              aria-label={
                vi
                  ? `Mở bộ ảnh ${item.title.vi}`
                  : `Open album ${item.title.en}`
              }
            >
              {cover && (
                <Image
                  src={cover}
                  alt={item.title[locale]}
                  fill
                  sizes="(max-width: 760px) 100vw, 33vw"
                />
              )}
              <span className="gallery-home-count">
                <Images size={14} aria-hidden="true" />
                {images.length}
              </span>
            </button>

            <div className="gallery-home-copy">
              <h3>{item.title[locale]}</h3>
              {item.photographer_name && (
                <p>
                  <UserRound size={13} aria-hidden="true" />
                  {item.photographer_name}
                </p>
              )}
              <button
                type="button"
                className="text-link"
                onClick={() => onOpen(item, 0)}
              >
                {vi ? "Xem bộ ảnh" : "View project"}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function GalleryGrid({
  items,
  categories,
  locale,
  variant = "home",
}: {
  items: GalleryItem[];
  categories: GalleryCategory[];
  locale: Locale;
  variant?: GalleryVariant;
}) {
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const [current, setCurrent] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const touchStartX = useRef<number | null>(null);

  const filtered = useMemo(
    () =>
      items.filter((item) => category === "all" || item.category === category),
    [items, category],
  );

  const selectedImages = selected ? imagesFor(selected) : [];
  const safeCurrent =
    selectedImages.length > 0
      ? Math.min(current, selectedImages.length - 1)
      : 0;

  function openAlbum(item: GalleryItem, index = 0) {
    setSelected(item);
    setCurrent(index);
    dialog.current?.showModal();
  }

  function step(delta: number) {
    if (!selectedImages.length) return;

    setCurrent(
      (index) =>
        (index + delta + selectedImages.length) % selectedImages.length,
    );
  }

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null) return;

    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(delta) < 45) return;
    step(delta > 0 ? -1 : 1);
  }

  const vi = locale === "vi";

  return (
    <>
      {variant === "page" && (
        <div className="gallery-public-toolbar">
          <div
            className="gallery-public-filters"
            aria-label={vi ? "Lọc bộ ảnh" : "Filter albums"}
          >
            <button
              className="gallery-filter-pill"
              aria-pressed={category === "all"}
              onClick={() => setCategory("all")}
            >
              {vi ? "Tất cả" : "All"}
            </button>

            {categories.map((entry) => (
              <button
                className="gallery-filter-pill"
                aria-pressed={entry.slug === category}
                key={entry.id}
                onClick={() => setCategory(entry.slug)}
              >
                {entry.name[locale]}
              </button>
            ))}
          </div>

          <p className="gallery-public-result-count">
            {filtered.length} {vi ? "dự án" : filtered.length === 1 ? "project" : "projects"}
          </p>
        </div>
      )}

      {filtered.length ? (
        variant === "page" ? (
          <div className={`gallery-project-list${filtered.length === 1 ? " is-single" : ""}`}>
            {filtered.map((item, index) => {
              const images = imagesFor(item);
              const categoryLabel = categoryName(categories, item.category, locale);

              return (
                <article className="gallery-project-card" key={item.id}>
                  <AlbumSlider
                    item={item}
                    locale={locale}
                    onOpen={(imageIndex) => openAlbum(item, imageIndex)}
                  />

                  <div className="gallery-project-copy">
                    <div className="gallery-project-topline">
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <span>{categoryLabel}</span>
                      <span>
                        {images.length} {vi ? "ảnh" : "images"}
                      </span>
                    </div>

                    <h2>{item.title[locale]}</h2>

                    {item.photographer_name && (
                      <div className="gallery-project-photographer">
                        <UserRound size={15} aria-hidden="true" />
                        <span>
                          Photographer · <strong>{item.photographer_name}</strong>
                        </span>
                        {item.photographer_facebook_url && (
                          <a
                            href={item.photographer_facebook_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            FB
                          </a>
                        )}
                        {item.photographer_instagram_url && (
                          <a
                            href={item.photographer_instagram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            IG
                          </a>
                        )}
                      </div>
                    )}

                    {item.description?.[locale] && (
                      <p className="gallery-project-description">
                        {item.description[locale]}
                      </p>
                    )}

                    <div className="gallery-project-tags">
                      {item.oni_production && (
                        <span>{vi ? "Oni thực hiện" : "Produced by Oni"}</span>
                      )}
                      {item.oni_lighting && (
                        <span>{vi ? "Ánh sáng bởi Oni" : "Lighting by Oni"}</span>
                      )}
                      {item.shot_at_oni && (
                        <span>{vi ? "Chụp tại Oni Studio" : "Shot at Oni"}</span>
                      )}
                    </div>

                    <div className="gallery-project-actions">
                      <button
                        type="button"
                        className="gallery-project-open"
                        onClick={() => openAlbum(item, 0)}
                      >
                        <Images size={16} aria-hidden="true" />
                        {vi ? "Xem toàn bộ album" : "View full album"}
                      </button>

                      {(item.facebook_url || item.instagram_url) && (
                        <div className="gallery-project-socials">
                          {item.facebook_url && (
                            <a
                              href={item.facebook_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Facebook <ExternalLink size={13} />
                            </a>
                          )}
                          {item.instagram_url && (
                            <a
                              href={item.instagram_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Instagram <ExternalLink size={13} />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <HomeGallery
            items={filtered}
            locale={locale}
            onOpen={openAlbum}
          />
        )
      ) : (
        <div className="empty-state gallery-empty">
          <Images size={36} strokeWidth={1} />
          <h2>
            {vi
              ? "Những khung hình đang được chuẩn bị."
              : "Our visual stories are on their way."}
          </h2>
          <p>
            {vi
              ? "Oni sẽ cập nhật các dự án, hậu trường và những buổi chụp tại studio ở đây."
              : "Projects, behind-the-scenes stories and studio shoots will appear here."}
          </p>
        </div>
      )}

      <dialog
        className="gallery-viewer-dialog"
        ref={dialog}
        aria-label={vi ? "Album hình ảnh" : "Photo album"}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") step(-1);
          if (event.key === "ArrowRight") step(1);
          if (event.key === "Escape") dialog.current?.close();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <button
          className="gallery-viewer-close"
          aria-label={vi ? "Đóng album" : "Close album"}
          onClick={() => dialog.current?.close()}
        >
          <X />
        </button>

        {selected && selectedImages.length > 0 && (
          <div className="gallery-viewer-layout">
            <div className="gallery-viewer-media">
              <div
                className="gallery-viewer-stage"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <Image
                  key={selectedImages[safeCurrent]}
                  src={selectedImages[safeCurrent]}
                  alt={`${selected.title[locale]} — ${vi ? "ảnh" : "image"} ${safeCurrent + 1}`}
                  fill
                  sizes="(max-width: 900px) 100vw, 74vw"
                />

                {selectedImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="gallery-viewer-arrow gallery-viewer-arrow-left"
                      aria-label={vi ? "Ảnh trước" : "Previous image"}
                      onClick={() => step(-1)}
                    >
                      <ChevronLeft />
                    </button>
                    <button
                      type="button"
                      className="gallery-viewer-arrow gallery-viewer-arrow-right"
                      aria-label={vi ? "Ảnh tiếp" : "Next image"}
                      onClick={() => step(1)}
                    >
                      <ChevronRight />
                    </button>
                  </>
                )}

                <span className="gallery-viewer-position">
                  {safeCurrent + 1} / {selectedImages.length}
                </span>

                {selectedImages.length > 1 && (
                  <span className="gallery-viewer-swipe-hint">
                    {vi ? "Vuốt trái / phải" : "Swipe left / right"}
                  </span>
                )}
              </div>

              {selectedImages.length > 1 && (
                <div className="gallery-viewer-thumbnails">
                  {selectedImages.map((src, index) => (
                    <button
                      type="button"
                      key={`${src}-${index}`}
                      aria-label={`${vi ? "Xem ảnh" : "View image"} ${index + 1}`}
                      aria-pressed={safeCurrent === index}
                      onClick={() => setCurrent(index)}
                    >
                      <Image src={src} alt="" fill sizes="76px" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <aside className="gallery-viewer-info">
              <p className="eyebrow">ONI PROJECT</p>
              <h2>{selected.title[locale]}</h2>

              {selected.photographer_name && (
                <div className="gallery-viewer-photographer">
                  <UserRound size={17} aria-hidden="true" />
                  <div>
                    <span>Photographer</span>
                    <strong>{selected.photographer_name}</strong>
                  </div>

                  <div className="gallery-viewer-photographer-links">
                    {selected.photographer_facebook_url && (
                      <a
                        href={selected.photographer_facebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        FB
                      </a>
                    )}
                    {selected.photographer_instagram_url && (
                      <a
                        href={selected.photographer_instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        IG
                      </a>
                    )}
                  </div>
                </div>
              )}

              {selected.description?.[locale] && (
                <p className="gallery-viewer-description">
                  {selected.description[locale]}
                </p>
              )}

              <div className="gallery-project-tags">
                {selected.oni_production && (
                  <span>{vi ? "Oni thực hiện" : "Produced by Oni"}</span>
                )}
                {selected.oni_lighting && (
                  <span>{vi ? "Ánh sáng bởi Oni" : "Lighting by Oni"}</span>
                )}
                {selected.shot_at_oni && (
                  <span>{vi ? "Chụp tại Oni Studio" : "Shot at Oni"}</span>
                )}
              </div>

              {(selected.facebook_url || selected.instagram_url) && (
                <div className="gallery-viewer-links">
                  {selected.facebook_url && (
                    <a
                      href={selected.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Facebook dự án <ExternalLink size={14} />
                    </a>
                  )}
                  {selected.instagram_url && (
                    <a
                      href={selected.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Instagram dự án <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              )}
            </aside>
          </div>
        )}
      </dialog>
    </>
  );
}
