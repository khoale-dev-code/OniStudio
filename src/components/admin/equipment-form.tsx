"use client";

import {
  useActionState,
  useMemo,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import {
  PackagePlus,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import {
  deleteEquipmentV2,
  quickCreateEquipmentAccessory,
  saveEquipmentV2,
} from "@/app/admin/equipment-v2-actions";
import { ImageUpload } from "./image-upload";
import { DeleteForm } from "./delete-form";
import { VndInput } from "./vnd-input";
import type {
  Equipment,
  EquipmentCategory,
  EquipmentOption,
  EquipmentRentalSource,
} from "@/types/catalog";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function EquipmentForm({
  item,
  categories,
  equipmentOptions,
}: {
  item?: Equipment;
  categories: EquipmentCategory[];
  equipmentOptions: EquipmentOption[];
}) {
  const [state, action, pending] = useActionState(
    saveEquipmentV2.bind(null, item?.id ?? null),
    {},
  );
  const [mediaBlocked, setMediaBlocked] = useState(false);
  const [name, setName] = useState(item?.name ?? "");
  const [slugValue, setSlugValue] = useState(item?.slug ?? "");
  const [source, setSource] = useState<EquipmentRentalSource>(
    item?.rental_source === "external" ? "external" : "internal",
  );
  const [options, setOptions] = useState(equipmentOptions);
  const [selectedAccessoryIds, setSelectedAccessoryIds] = useState<string[]>(
    item?.included_equipment_ids ?? [],
  );
  const [accessoryQuery, setAccessoryQuery] = useState("");
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickName, setQuickName] = useState("");
  const [quickCategory, setQuickCategory] = useState(
    item?.category || categories[0]?.slug || "",
  );
  const [quickError, setQuickError] = useState("");
  const [quickSuccess, setQuickSuccess] = useState("");
  const [quickPending, startQuickAdd] = useTransition();

  const selectableEquipment = useMemo(() => {
    const query = accessoryQuery.trim().toLowerCase();
    return options
      .filter((option) => option.id !== item?.id)
      .filter((option) => {
        if (!query) return true;
        return `${option.name} ${option.name_en}`
          .toLowerCase()
          .includes(query);
      });
  }, [accessoryQuery, item?.id, options]);

  function toggleAccessory(id: string, checked: boolean) {
    setSelectedAccessoryIds((current) => {
      if (checked) {
        return current.includes(id) ? current : [...current, id];
      }
      return current.filter((value) => value !== id);
    });
  }

  function handleQuickAdd() {
    setQuickError("");
    setQuickSuccess("");

    startQuickAdd(async () => {
      const result = await quickCreateEquipmentAccessory({
        name: quickName,
        category: quickCategory,
      });

      if (result.error || !result.item) {
        setQuickError(result.error || "Không thể tạo sản phẩm.");
        return;
      }

      setOptions((current) => [...current, result.item!]);
      setSelectedAccessoryIds((current) =>
        current.includes(result.item!.id)
          ? current
          : [...current, result.item!.id],
      );
      setQuickName("");
      setQuickSuccess(`Đã thêm và chọn "${result.item.name}".`);
    });
  }

  return (
    <>
      <form action={action} className="form-panel equipment-form-v2">
        <section className="equipment-form-section">
          <div className="equipment-form-section-head">
            <div>
              <h2>Thông tin thiết bị</h2>
              <p>Tên, danh mục, đường dẫn và giá hiển thị trên website.</p>
            </div>
          </div>

          <div className="form-grid">
            <label className="form-field">
              <span>Tên thiết bị (VN)</span>
              <input
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                maxLength={160}
              />
            </label>

            <label className="form-field">
              <span>Tên thiết bị (EN)</span>
              <input
                name="name_en"
                defaultValue={item?.name_en}
                required
                maxLength={160}
              />
            </label>

            <div className="form-field full">
              <span>Slug đường dẫn</span>
              <div className="equipment-slug-row">
                <input
                  name="slug"
                  value={slugValue}
                  onChange={(event) => setSlugValue(event.target.value)}
                  required
                  maxLength={120}
                  pattern="[a-z0-9]+(-[a-z0-9]+)*"
                  placeholder="aputure-storm-400x"
                />
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => setSlugValue(slugify(name))}
                >
                  <Sparkles size={16} aria-hidden="true" />
                  Tạo slug
                </button>
              </div>
              <small>
                URL công khai: /equipment/{slugValue || "ten-thiet-bi"}
              </small>
            </div>

            <label className="form-field">
              <span>Danh mục</span>
              <select
                name="category"
                defaultValue={item?.category || categories[0]?.slug || ""}
                required
              >
                {categories.map((category) => (
                  <option value={category.slug} key={category.id}>
                    {category.name.vi}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Giá thuê</span>
              <VndInput name="price" defaultValue={item?.price} />
              <small>
                Để trống nếu cần liên hệ báo giá. Giao diện tự định dạng VNĐ.
              </small>
            </label>

            {(["vi", "en"] as const).map((lang) => (
              <label key={lang} className="form-field">
                <span>Đơn vị ({lang.toUpperCase()})</span>
                <input
                  name={`unit_${lang}`}
                  required
                  maxLength={40}
                  defaultValue={
                    item?.unit[lang] || (lang === "vi" ? "đèn" : "light")
                  }
                />
              </label>
            ))}
          </div>
        </section>

        <section className="equipment-form-section">
          <div className="equipment-form-section-head">
            <div>
              <h2>Nguồn thiết bị</h2>
              <p>
                Tách rõ thiết bị Oni đang có và thiết bị cần thuê từ đơn vị bên
                ngoài.
              </p>
            </div>
          </div>

          <div className="equipment-source-admin">
            <label
              className={`equipment-source-option ${
                source === "internal" ? "is-active" : ""
              }`}
            >
              <input
                type="radio"
                name="rental_source"
                value="internal"
                checked={source === "internal"}
                onChange={() => setSource("internal")}
              />
              <span>
                <strong>Thiết bị tại Oni</strong>
                <small>Thiết bị Oni trực tiếp quản lý và cho thuê.</small>
              </span>
            </label>

            <label
              className={`equipment-source-option ${
                source === "external" ? "is-active" : ""
              }`}
            >
              <input
                type="radio"
                name="rental_source"
                value="external"
                checked={source === "external"}
                onChange={() => setSource("external")}
              />
              <span>
                <strong>Thiết bị thuê ngoài</strong>
                <small>
                  Thiết bị từ đối tác; có thể chọn thêm sản phẩm đi kèm.
                </small>
              </span>
            </label>
          </div>

          {source === "external" && (
            <div className="equipment-accessory-panel">
              {selectedAccessoryIds.map((id) => (
                <input
                  key={id}
                  type="hidden"
                  name="included_equipment_ids"
                  value={id}
                />
              ))}

              <div className="equipment-accessory-head">
                <div>
                  <PackagePlus size={20} aria-hidden="true" />
                  <div>
                    <strong>Sản phẩm đi kèm</strong>
                    <p>
                      Chọn thiết bị có sẵn hoặc thêm nhanh một sản phẩm mới.
                    </p>
                  </div>
                </div>

                <div className="equipment-accessory-tools">
                  <input
                    type="search"
                    value={accessoryQuery}
                    onChange={(event) =>
                      setAccessoryQuery(event.target.value)
                    }
                    placeholder="Tìm sản phẩm..."
                    aria-label="Tìm sản phẩm đi kèm"
                  />

                  <button
                    type="button"
                    className="button button-outline equipment-quick-toggle"
                    onClick={() => setQuickOpen((current) => !current)}
                    aria-expanded={quickOpen}
                  >
                    {quickOpen ? (
                      <X size={16} aria-hidden="true" />
                    ) : (
                      <Plus size={16} aria-hidden="true" />
                    )}
                    {quickOpen ? "Đóng" : "Thêm nhanh"}
                  </button>
                </div>
              </div>

              {quickOpen && (
                <div className="equipment-quick-add">
                  <div>
                    <strong>Thêm nhanh sản phẩm đi kèm</strong>
                    <p>
                      Sản phẩm mới được tạo ở trạng thái ẩn. Bạn có thể chỉnh
                      ảnh, giá và nội dung đầy đủ sau.
                    </p>
                  </div>

                  <label>
                    <span>Tên sản phẩm</span>
                    <input
                      value={quickName}
                      onChange={(event) => setQuickName(event.target.value)}
                      placeholder="Ví dụ: Softbox 90cm"
                      maxLength={160}
                    />
                  </label>

                  <label>
                    <span>Danh mục</span>
                    <select
                      value={quickCategory}
                      onChange={(event) =>
                        setQuickCategory(event.target.value)
                      }
                    >
                      {categories.map((category) => (
                        <option value={category.slug} key={category.id}>
                          {category.name.vi}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button
                    type="button"
                    className="button"
                    disabled={quickPending || !quickName.trim()}
                    onClick={handleQuickAdd}
                  >
                    {quickPending ? "Đang thêm..." : "Thêm & chọn"}
                  </button>

                  {quickError && (
                    <p className="equipment-quick-message is-error" role="alert">
                      {quickError}
                    </p>
                  )}

                  {quickSuccess && (
                    <p
                      className="equipment-quick-message is-success"
                      role="status"
                    >
                      {quickSuccess}
                    </p>
                  )}
                </div>
              )}

              <div className="equipment-accessory-selection-summary">
                <span>Đã chọn</span>
                <strong>{selectedAccessoryIds.length} sản phẩm</strong>
              </div>

              <div className="equipment-accessory-list">
                {selectableEquipment.map((option) => (
                  <label
                    className={`equipment-accessory-item ${
                      selectedAccessoryIds.includes(option.id)
                        ? "is-selected"
                        : ""
                    }`}
                    key={option.id}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAccessoryIds.includes(option.id)}
                      onChange={(event) =>
                        toggleAccessory(option.id, event.target.checked)
                      }
                    />
                    <span>
                      <strong>{option.name}</strong>
                      <small>
                        {option.rental_source === "external"
                          ? "Thuê ngoài"
                          : "Tại Oni"}
                      </small>
                    </span>
                  </label>
                ))}

                {!selectableEquipment.length && (
                  <p className="muted">
                    Không tìm thấy sản phẩm phù hợp.
                  </p>
                )}
              </div>
            </div>
          )}
        </section>

        <section className="equipment-form-section">
          <div className="equipment-form-section-head">
            <div>
              <h2>Nội dung hiển thị</h2>
              <p>Mô tả dùng trên card; trang chi tiết chỉ hiển thị album ảnh.</p>
            </div>
          </div>

          <div className="form-grid">
            {(["vi", "en"] as const).map((lang) => (
              <label key={lang} className="form-field">
                <span>Mô tả ({lang.toUpperCase()})</span>
                <textarea
                  name={`description_${lang}`}
                  required
                  maxLength={5000}
                  rows={4}
                  defaultValue={item?.description[lang]}
                />
              </label>
            ))}

            {(["vi", "en"] as const).map((lang) => (
              <label key={lang} className="form-field">
                <span>Thông số ({lang.toUpperCase()})</span>
                <textarea
                  name={`specifications_${lang}`}
                  required
                  maxLength={5000}
                  rows={4}
                  defaultValue={item?.specifications[lang]}
                />
              </label>
            ))}
          </div>
        </section>

        <section className="equipment-form-section">
          <div className="equipment-form-section-head">
            <div>
              <h2>Album hình ảnh</h2>
              <p>
                Ảnh đầu tiên là ảnh bìa card. Có thể thêm nhiều ảnh để khách
                lướt tại /equipment/[slug].
              </p>
            </div>
          </div>

          <ImageUpload
            initialUrls={
              item?.images?.length
                ? item.images
                : item?.image_url
                  ? [item.image_url]
                  : []
            }
            onBlockedChange={setMediaBlocked}
          />
        </section>

        <section className="equipment-form-section equipment-form-options">
          <div className="form-field full">
            {source === "internal" && (
              <label className="check-field">
                <input
                  type="checkbox"
                  name="included"
                  defaultChecked={item?.included}
                />
                Miễn phí kèm phòng
              </label>
            )}

            <label className="check-field">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={item?.featured}
              />
              Thiết bị nổi bật trên trang chủ
            </label>

            <label className="check-field">
              <input
                type="checkbox"
                name="published"
                defaultChecked={item?.published ?? true}
              />
              Hiển thị công khai
            </label>
          </div>
        </section>

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

        <div className="form-actions">
          <button className="button" disabled={pending || mediaBlocked}>
            {pending ? "Đang lưu..." : "Lưu thiết bị"}
          </button>
          <Link className="button button-outline" href="/admin/equipment">
            Quay lại
          </Link>
          <Link className="text-link" href="/admin/categories">
            Quản lý danh mục
          </Link>
        </div>
      </form>

      {item && (
        <div className="equipment-danger-zone">
          <div>
            <strong>Xóa thiết bị</strong>
            <p>
              Xóa bản ghi khỏi website. Ảnh gốc trên Cloudinary vẫn được giữ.
            </p>
          </div>
          <DeleteForm
            action={deleteEquipmentV2.bind(null, item.id)}
            label={`thiết bị "${item.name}"`}
          />
        </div>
      )}
    </>
  );
}
