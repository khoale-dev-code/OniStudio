import type { EquipmentCategory, GalleryCategory, Localized } from "@/types/catalog";
export const site = {
  name: "Oni Studio",
  phone: "0707 271 407",
  phoneHref: "+84707271407",
  email: "onistudiovn@gmail.com",
  address: {
    vi: "220/29 Âu Cơ, Phường Tân Hoà, TP. Hồ Chí Minh",
    en: "220/29 Au Co, Tan Hoa Ward, Ho Chi Minh City",
  },
  facebook: "https://www.facebook.com/onistudiovn",
  messenger: "https://m.me/onistudiovn",
  zalo: process.env.NEXT_PUBLIC_ZALO_URL || "",
  instagram: "https://www.instagram.com/onistudiovn",
  tiktok: process.env.NEXT_PUBLIC_TIKTOK_URL || "",
  map: "https://www.google.com/maps?q=220%2F29%20Au%20Co%20Ho%20Chi%20Minh%20City",
  mapEmbed:
    "https://www.google.com/maps?q=220%2F29%20Au%20Co%20Ho%20Chi%20Minh%20City&output=embed",
};
export const navigation: { path: string; label: Localized }[] = [
  { path: "/equipment", label: { vi: "Thiết Bị", en: "Equipment Rental" } },
  { path: "/studios", label: { vi: "Không Gian Phòng", en: "Studio Spaces" } },
  { path: "/effect-backdrops", label: { vi: "Phông Màu Hiệu Ứng", en: "Effect Backdrops" } },
  { path: "/backdrops", label: { vi: "Phông Màu", en: "Color Backdrops" } },
  { path: "/props", label: { vi: "Đạo Cụ", en: "Props" } },
  { path: "/gallery", label: { vi: "Hình Ảnh Thực Tế", en: "Photo Gallery" } },
  { path: "/contact", label: { vi: "Địa Chỉ", en: "Address" } },
];
export const categories = {
  continuous: { vi: "Đèn LED", en: "Continuous light" },
  flash: { vi: "Đèn flash", en: "Flash" },
  modifier: { vi: "Tạo hình ánh sáng", en: "Light modifiers" },
  support: { vi: "Phụ kiện", en: "Support" },
};
export const defaultEquipmentCategories: EquipmentCategory[] = Object.entries(
  categories,
).map(([slug, name], sort_order) => ({
  id: `local-${slug}`,
  slug,
  name,
  sort_order,
}));
export const statusLabels = {
  contact: { vi: "Liên hệ kiểm tra lịch", en: "Check availability" },
  available: { vi: "Sẵn sàng cho thuê", en: "Available" },
  maintenance: { vi: "Đang bảo trì", en: "Maintenance" },
  unavailable: { vi: "Tạm ngừng cho thuê", en: "Unavailable" },
};
export const inventoryStatusLabels = {
  available: { vi: "Sẵn sàng", en: "Available" },
  rented: { vi: "Đang cho thuê", en: "Rented" },
  maintenance: { vi: "Bảo trì", en: "Maintenance" },
  unavailable: { vi: "Tạm ngừng", en: "Unavailable" },
};
export const defaultGalleryCategories: GalleryCategory[] = [
  { id: "local-fashion", slug: "fashion", name: { vi: "Thời trang", en: "Fashion" }, sort_order: 0 },
  { id: "local-portrait", slug: "portrait", name: { vi: "Chân dung", en: "Portrait" }, sort_order: 1 },
  { id: "local-product", slug: "product", name: { vi: "Sản phẩm", en: "Product" }, sort_order: 2 },
  { id: "local-commercial", slug: "commercial", name: { vi: "Thương mại", en: "Commercial" }, sort_order: 3 },
  { id: "local-bts", slug: "bts", name: { vi: "Hậu trường", en: "Behind the scenes" }, sort_order: 4 },
];
export const galleryCategories = [
  { id: "all", vi: "Tất cả", en: "All" },
  ...defaultGalleryCategories.map((category) => ({
    id: category.slug,
    vi: category.name.vi,
    en: category.name.en,
  })),
];
