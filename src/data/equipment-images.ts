import type { Equipment } from "@/types/catalog";
// Manufacturer reference photos only. Uploaded studio photos always take priority.
// Sources and image usage notes: docs/ASSETS.md.
const references: Record<string, string[]> = {
  "amaran-t4c": [
    "/images/equipment/amaran-t4c.webp",
    "/images/equipment/amaran-t4c-detail.webp",
  ],
  "aputure-storm-400x": ["/images/equipment/aputure-storm-400x.webp"],
  "nanlite-fs300b": ["/images/equipment/nanlite-fs300b.webp"],
  "amaran-300c": ["/images/equipment/amaran-300c.webp"],
};
export function equipmentImages(item: Equipment) {
  if (item.images?.length) return { images: item.images, reference: false };
  if (item.image_url) return { images: [item.image_url], reference: false };
  return {
    images: references[item.slug] || [],
    reference: Boolean(references[item.slug]),
  };
}
