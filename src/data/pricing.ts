// Existing published pricing terms. Room and equipment rates come from getCatalog().
export const pricingExtras = [
  {
    id: "people",
    amount: 50000,
    unit: { vi: "người", en: "person" },
    title: { vi: "Thêm thành viên", en: "Extra crew" },
    description: {
      vi: "Áp dụng cho mỗi người vượt sức chứa của phòng.",
      en: "For each person beyond the room’s stated capacity.",
    },
  },
  {
    id: "power",
    amount: 50000,
    unit: { vi: "giờ", en: "hour" },
    title: { vi: "Thêm công suất LED", en: "Extra LED power" },
    description: {
      vi: "Khi tổng công suất đèn LED sử dụng trên 500W.",
      en: "When combined LED power in use exceeds 500W.",
    },
  },
  {
    id: "late",
    amount: 50000,
    unit: { vi: "giờ", en: "hour" },
    title: { vi: "Chụp sau 22:00", en: "After 10 pm" },
    description: {
      vi: "Áp dụng cho thời gian sử dụng phòng sau 22:00.",
      en: "Applies to room use after 10 pm.",
    },
  },
] as const;
