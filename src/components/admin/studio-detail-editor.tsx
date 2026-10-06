"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { saveStudioDetailContent } from "@/app/admin/actions";
import type {
  Locale,
  StudioDetailContent,
} from "@/types/catalog";

type GroupItem = {
  id: string;
  title: string;
  body: string;
};

type RuleItem = {
  id: string;
  text: string;
};

type SnackbarState = {
  type: "success" | "error";
  text: string;
};

const localeLabel: Record<Locale, string> = {
  vi: "Tiếng Việt",
  en: "English",
};

function cleanLegacyText(value: string, locale: Locale) {
  let next = value || "";

  if (locale === "vi") {
    next = next
      .replace(
        "Gửi tên {room_name}, ngày chụp, thời lượng và nhu cầu thiết bị cho Oni để kiểm tra lịch.",
        "Gửi ngày chụp, thời lượng và nhu cầu thiết bị cho Oni để kiểm tra lịch.",
      )
      .replace(
        "{led_count} đèn LED Nanlite 300B",
        "đèn LED Nanlite 300B",
      )
      .replaceAll("{room_name}", "phòng")
      .replaceAll("{led_count}", "");
  } else {
    next = next
      .replace(
        "Send Oni the room name ({room_name}), date, duration and equipment needs to check availability.",
        "Send Oni the date, duration and equipment needs to check availability.",
      )
      .replace(
        "{led_count} Nanlite 300B LED light(s)",
        "Nanlite 300B LED lighting",
      )
      .replaceAll("{room_name}", "the room")
      .replaceAll("{led_count}", "");
  }

  return next.replace(/\s{2,}/g, " ").trim();
}

function parseGroups(raw: string, locale: Locale): GroupItem[] {
  const rows = cleanLegacyText(raw, locale)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const parsed = rows.map((line, index) => {
    const separator = line.indexOf("|");

    if (separator < 0) {
      return {
        id: `${locale}-group-${index}`,
        title: locale === "vi" ? `Nhóm ${index + 1}` : `Group ${index + 1}`,
        body: line,
      };
    }

    return {
      id: `${locale}-group-${index}`,
      title: line.slice(0, separator).trim(),
      body: line.slice(separator + 1).trim(),
    };
  });

  return parsed.length
    ? parsed
    : [
        {
          id: `${locale}-group-0`,
          title: "",
          body: "",
        },
      ];
}

function serializeGroups(items: GroupItem[]) {
  return items
    .map((item) => {
      const title = item.title.trim();
      const body = item.body.trim();

      if (!title && !body) return "";
      if (!title) return body;
      if (!body) return title;

      return `${title} | ${body}`;
    })
    .filter(Boolean)
    .join("\n");
}

function parseRules(raw: string, locale: Locale): RuleItem[] {
  const rows = cleanLegacyText(raw, locale)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return rows.length
    ? rows.map((text, index) => ({
        id: `${locale}-rule-${index}`,
        text,
      }))
    : [
        {
          id: `${locale}-rule-0`,
          text: "",
        },
      ];
}

function serializeRules(items: RuleItem[]) {
  return items
    .map((item) => item.text.trim())
    .filter(Boolean)
    .join("\n");
}

function newId(prefix: string, currentLength: number) {
  return `${prefix}-${currentLength}-${Math.random().toString(36).slice(2, 7)}`;
}

export function StudioDetailEditor({
  detail,
  studioId,
}: {
  detail: StudioDetailContent;
  studioId?: string;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const [locale, setLocale] = useState<Locale>("vi");
  const [pending, startSaving] = useTransition();
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null);

  const initialAmenities = useMemo(
    () => ({
      vi: parseGroups(detail.amenities.vi, "vi"),
      en: parseGroups(detail.amenities.en, "en"),
    }),
    [detail],
  );

  const initialRules = useMemo(
    () => ({
      vi: parseRules(detail.rules.vi, "vi"),
      en: parseRules(detail.rules.en, "en"),
    }),
    [detail],
  );

  const [amenities, setAmenities] = useState(initialAmenities);
  const [rules, setRules] = useState(initialRules);

  useEffect(() => {
    if (!snackbar) return;

    const timer = window.setTimeout(() => {
      setSnackbar(null);
    }, 3600);

    return () => window.clearTimeout(timer);
  }, [snackbar]);

  function updateGroup(
    currentLocale: Locale,
    id: string,
    field: "title" | "body",
    value: string,
  ) {
    setAmenities((current) => ({
      ...current,
      [currentLocale]: current[currentLocale].map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function addGroup(currentLocale: Locale) {
    setAmenities((current) => ({
      ...current,
      [currentLocale]: [
        ...current[currentLocale],
        {
          id: newId(`${currentLocale}-group`, current[currentLocale].length),
          title: "",
          body: "",
        },
      ],
    }));
  }

  function removeGroup(currentLocale: Locale, id: string) {
    setAmenities((current) => {
      const next = current[currentLocale].filter((item) => item.id !== id);

      return {
        ...current,
        [currentLocale]:
          next.length > 0
            ? next
            : [
                {
                  id: newId(`${currentLocale}-group`, 0),
                  title: "",
                  body: "",
                },
              ],
      };
    });
  }

  function updateRule(
    currentLocale: Locale,
    id: string,
    value: string,
  ) {
    setRules((current) => ({
      ...current,
      [currentLocale]: current[currentLocale].map((item) =>
        item.id === id ? { ...item, text: value } : item,
      ),
    }));
  }

  function addRule(currentLocale: Locale) {
    setRules((current) => ({
      ...current,
      [currentLocale]: [
        ...current[currentLocale],
        {
          id: newId(`${currentLocale}-rule`, current[currentLocale].length),
          text: "",
        },
      ],
    }));
  }

  function removeRule(currentLocale: Locale, id: string) {
    setRules((current) => {
      const next = current[currentLocale].filter((item) => item.id !== id);

      return {
        ...current,
        [currentLocale]:
          next.length > 0
            ? next
            : [
                {
                  id: newId(`${currentLocale}-rule`, 0),
                  text: "",
                },
              ],
      };
    });
  }

  function saveDetailContent() {
    if (!studioId) {
      setSnackbar({
        type: "error",
        text: "Hãy tạo phòng trước khi lưu riêng nội dung trang chi tiết.",
      });
      return;
    }

    const form = rootRef.current?.closest("form");

    if (!form) {
      setSnackbar({
        type: "error",
        text: "Không tìm thấy form chỉnh sửa phòng.",
      });
      return;
    }

    const formData = new FormData(form);
    setSnackbar(null);

    startSaving(async () => {
      const result = await saveStudioDetailContent(studioId, formData);

      if (result.error) {
        setSnackbar({
          type: "error",
          text: result.error,
        });
        return;
      }

      setSnackbar({
        type: "success",
        text: result.success || "Đã cập nhật nội dung trang chi tiết.",
      });
    });
  }

  return (
    <section ref={rootRef} className="studio-detail-editor-v3">
      <div className="studio-detail-editor-head studio-detail-editor-head-save">
        <div>
          <p className="eyebrow">ROOM DETAIL CONTENT</p>
          <h3>Nội dung trang chi tiết phòng</h3>
          <p>
            Chỉnh nội dung theo từng mục rõ ràng. Không cần nhớ cú pháp hoặc
            nhập mã đặc biệt.
          </p>
        </div>

        <div className="studio-detail-editor-actions">
          <div className="studio-detail-language-tabs" role="tablist">
            {(["vi", "en"] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={locale === value}
                className={
                  locale === value
                    ? "studio-detail-language-tab is-active"
                    : "studio-detail-language-tab"
                }
                onClick={() => setLocale(value)}
              >
                {localeLabel[value]}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="button studio-detail-save-button"
            disabled={pending || !studioId}
            onClick={saveDetailContent}
            title={
              studioId
                ? "Lưu riêng nội dung trang chi tiết"
                : "Tạo phòng trước để dùng chức năng này"
            }
          >
            <Save size={16} aria-hidden="true" />
            {pending ? "Đang lưu..." : "Cập nhật nội dung"}
          </button>
        </div>
      </div>

      {(["vi", "en"] as const).map((value) => {
        const vi = value === "vi";

        return (
          <div
            key={value}
            className="studio-detail-language-panel"
            role="tabpanel"
            hidden={locale !== value}
          >
            <section className="studio-detail-content-card">
              <div className="studio-detail-content-card-head">
                <div>
                  <strong>{vi ? "Thông tin nhanh" : "Quick information"}</strong>
                  <span>
                    {vi
                      ? "Thông tin ngắn hiển thị cạnh biểu tượng đồng hồ."
                      : "Short information shown beside the clock icon."}
                  </span>
                </div>
              </div>

              <label className="form-field">
                <span>
                  {vi ? "Thời gian thuê tối thiểu" : "Minimum booking"}
                </span>
                <input
                  name={`detail_minimum_booking_${value}`}
                  maxLength={120}
                  defaultValue={cleanLegacyText(
                    detail.minimum_booking[value],
                    value,
                  )}
                  placeholder={
                    vi ? "Ví dụ: Tối thiểu 2 giờ" : "Example: 2-hour minimum"
                  }
                />
              </label>
            </section>

            <section className="studio-detail-content-card">
              <div className="studio-detail-content-card-head">
                <div>
                  <strong>{vi ? "1. Giới thiệu" : "1. Introduction"}</strong>
                  <span>
                    {vi
                      ? "Phần mở đầu ngay dưới thông số của phòng."
                      : "The opening section below the room facts."}
                  </span>
                </div>
              </div>

              <div className="studio-detail-content-fields">
                <label className="form-field">
                  <span>{vi ? "Tiêu đề" : "Title"}</span>
                  <input
                    name={`detail_intro_title_${value}`}
                    maxLength={180}
                    defaultValue={cleanLegacyText(
                      detail.intro_title[value],
                      value,
                    )}
                  />
                </label>

                <label className="form-field studio-detail-field-wide">
                  <span>{vi ? "Nội dung giới thiệu" : "Introduction"}</span>
                  <textarea
                    name={`detail_intro_body_${value}`}
                    maxLength={5000}
                    defaultValue={cleanLegacyText(
                      detail.intro_body[value],
                      value,
                    )}
                  />
                </label>
              </div>
            </section>

            <section className="studio-detail-content-card">
              <div className="studio-detail-content-card-head">
                <div>
                  <strong>
                    {vi ? "2. Tiện ích & thiết bị" : "2. Amenities & equipment"}
                  </strong>
                  <span>
                    {vi
                      ? "Mỗi khối gồm tên nhóm và nội dung. Có thể thêm hoặc xóa tùy ý."
                      : "Each block has a group name and content. Add or remove blocks as needed."}
                  </span>
                </div>

                <button
                  type="button"
                  className="button button-outline studio-detail-add-button"
                  onClick={() => addGroup(value)}
                >
                  <Plus size={15} aria-hidden="true" />
                  {vi ? "Thêm nhóm" : "Add group"}
                </button>
              </div>

              <input
                type="hidden"
                name={`detail_amenities_${value}`}
                value={serializeGroups(amenities[value])}
                readOnly
              />

              <div className="studio-detail-repeat-list">
                {amenities[value].map((item, index) => (
                  <div className="studio-detail-repeat-card" key={item.id}>
                    <div className="studio-detail-repeat-index">
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <button
                        type="button"
                        className="studio-detail-remove-button"
                        onClick={() => removeGroup(value, item.id)}
                        aria-label={vi ? "Xóa nhóm" : "Remove group"}
                      >
                        <Trash2 size={15} aria-hidden="true" />
                      </button>
                    </div>

                    <div className="studio-detail-repeat-fields">
                      <label className="form-field">
                        <span>{vi ? "Tên nhóm" : "Group name"}</span>
                        <input
                          value={item.title}
                          onChange={(event) =>
                            updateGroup(
                              value,
                              item.id,
                              "title",
                              event.target.value,
                            )
                          }
                          placeholder={
                            vi ? "Ví dụ: Softbox" : "Example: Softboxes"
                          }
                        />
                      </label>

                      <label className="form-field">
                        <span>{vi ? "Nội dung" : "Content"}</span>
                        <textarea
                          value={item.body}
                          onChange={(event) =>
                            updateGroup(
                              value,
                              item.id,
                              "body",
                              event.target.value,
                            )
                          }
                          placeholder={
                            vi
                              ? "Nhập danh sách thiết bị hoặc tiện ích..."
                              : "Enter equipment or amenity details..."
                          }
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="studio-detail-content-card">
              <div className="studio-detail-content-card-head">
                <div>
                  <strong>
                    {vi ? "3. Quy định & lưu ý" : "3. Rules & notes"}
                  </strong>
                  <span>
                    {vi
                      ? "Thêm từng quy định thành một mục riêng."
                      : "Add each rule as a separate item."}
                  </span>
                </div>

                <button
                  type="button"
                  className="button button-outline studio-detail-add-button"
                  onClick={() => addRule(value)}
                >
                  <Plus size={15} aria-hidden="true" />
                  {vi ? "Thêm quy định" : "Add rule"}
                </button>
              </div>

              <label className="form-field">
                <span>{vi ? "Tiêu đề phần" : "Section title"}</span>
                <input
                  name={`detail_rules_title_${value}`}
                  maxLength={180}
                  defaultValue={cleanLegacyText(
                    detail.rules_title[value],
                    value,
                  )}
                />
              </label>

              <input
                type="hidden"
                name={`detail_rules_${value}`}
                value={serializeRules(rules[value])}
                readOnly
              />

              <div className="studio-detail-rule-list">
                {rules[value].map((item, index) => (
                  <div className="studio-detail-rule-row" key={item.id}>
                    <span className="studio-detail-rule-number">
                      {index + 1}
                    </span>

                    <textarea
                      value={item.text}
                      onChange={(event) =>
                        updateRule(value, item.id, event.target.value)
                      }
                      aria-label={
                        vi
                          ? `Quy định ${index + 1}`
                          : `Rule ${index + 1}`
                      }
                    />

                    <button
                      type="button"
                      className="studio-detail-remove-button"
                      onClick={() => removeRule(value, item.id)}
                      aria-label={vi ? "Xóa quy định" : "Remove rule"}
                    >
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>

              <label className="form-field">
                <span>{vi ? "Ghi chú cuối" : "Closing note"}</span>
                <textarea
                  name={`detail_note_${value}`}
                  maxLength={3000}
                  defaultValue={cleanLegacyText(
                    detail.note[value],
                    value,
                  )}
                />
              </label>
            </section>

            <section className="studio-detail-content-card">
              <div className="studio-detail-content-card-head">
                <div>
                  <strong>{vi ? "4. Liên hệ" : "4. Contact"}</strong>
                  <span>
                    {vi
                      ? "Viết trực tiếp nội dung khách hàng sẽ đọc. Không cần dùng biến hoặc mã."
                      : "Write exactly what customers should read. No variables or special codes are needed."}
                  </span>
                </div>
              </div>

              <div className="studio-detail-content-fields">
                <label className="form-field">
                  <span>{vi ? "Tiêu đề" : "Title"}</span>
                  <input
                    name={`detail_inquiry_title_${value}`}
                    maxLength={180}
                    defaultValue={cleanLegacyText(
                      detail.inquiry_title[value],
                      value,
                    )}
                  />
                </label>

                <label className="form-field studio-detail-field-wide">
                  <span>{vi ? "Nội dung" : "Message"}</span>
                  <textarea
                    name={`detail_inquiry_body_${value}`}
                    maxLength={3000}
                    defaultValue={cleanLegacyText(
                      detail.inquiry_body[value],
                      value,
                    )}
                    placeholder={
                      vi
                        ? "Ví dụ: Gửi ngày chụp và thời lượng mong muốn cho Oni để kiểm tra lịch."
                        : "Example: Send Oni your preferred date and duration to check availability."
                    }
                  />
                </label>
              </div>
            </section>
          </div>
        );
      })}
      {snackbar && (
        <p
          className={`notice ${
            snackbar.type === "success" ? "success" : "error"
          }`}
          role={snackbar.type === "success" ? "status" : "alert"}
        >
          {snackbar.text}
        </p>
      )}
    </section>
  );
}
