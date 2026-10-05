export type Locale = "vi" | "en";
export type Localized = { vi: string; en: string };
export type Category = string;
export type EquipmentStatus =
  | "contact"
  | "available"
  | "maintenance"
  | "unavailable";
export type EquipmentUnitStatus =
  | "available"
  | "rented"
  | "maintenance"
  | "unavailable";

export interface EquipmentCategory {
  id: string;
  slug: string;
  name: Localized;
  sort_order: number;
}

export interface EquipmentUnit {
  id: string;
  equipment_id: string;
  label: string;
  status: EquipmentUnitStatus;
  sort_order: number;
}

export interface Equipment {
  id: string;
  slug: string;
  name: string;
  name_en: string;
  category: Category;
  description: Localized;
  specifications: Localized;
  price: number | null;
  unit: Localized;
  included: boolean;
  status: EquipmentStatus;
  image_url: string | null;
  images?: string[];
  featured: boolean;
  published: boolean;
  sort_order: number;
  inventory?: EquipmentUnit[];
}

export interface Studio {
  id: string;
  slug: string;
  name: string;
  description: Localized;
  area: number;
  capacity: number;
  price: number;
  led_count: number;
  images: string[];
  published: boolean;
  sort_order: number;
}

export interface GalleryCategory {
  id: string;
  slug: string;
  name: Localized;
  sort_order: number;
}

export interface GalleryItem {
  id: string;
  title: Localized;
  description?: Localized;
  category: string;
  image_url: string;
  images?: string[];
  facebook_url?: string | null;
  instagram_url?: string | null;
  photographer_name?: string | null;
  photographer_facebook_url?: string | null;
  photographer_instagram_url?: string | null;
  oni_production?: boolean;
  oni_lighting?: boolean;
  shot_at_oni?: boolean;
  published: boolean;
  sort_order: number;
}

export type ActionState = { error?: string; success?: string };
