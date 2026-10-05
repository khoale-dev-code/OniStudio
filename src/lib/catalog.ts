import "server-only";

import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import local from "@/data/catalog.json";
import {
  defaultEquipmentCategories,
  defaultGalleryCategories,
} from "@/data/site";
import type {
  Equipment,
  EquipmentCategory,
  EquipmentUnit,
  GalleryCategory,
  GalleryItem,
  Studio,
} from "@/types/catalog";
import { isConfigured, supabaseConfig } from "./supabase/config";

type Catalog = {
  studios: Studio[];
  equipment: Equipment[];
  gallery: GalleryItem[];
  categories: EquipmentCategory[];
  galleryCategories: GalleryCategory[];
};

export const getCatalog = cache(async (): Promise<Catalog> => {
  if (!isConfigured()) {
    const fallback = local as {
      studios: Studio[];
      equipment: Equipment[];
      gallery: GalleryItem[];
    };

    return {
      ...fallback,
      equipment: fallback.equipment.map((item) => ({
        ...item,
        inventory: [],
      })),
      categories: defaultEquipmentCategories,
      galleryCategories: defaultGalleryCategories,
    };
  }

  const { url, key } = supabaseConfig();
  const db = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const [
    studiosResult,
    equipmentResult,
    galleryResult,
    categoriesResult,
    galleryCategoriesResult,
    unitsResult,
  ] = await Promise.all([
    db.from("studios").select("*").eq("published", true).order("sort_order"),
    db.from("equipment").select("*").eq("published", true).order("sort_order"),
    db.from("gallery").select("*").eq("published", true).order("sort_order"),
    db.from("equipment_categories").select("*").order("sort_order"),
    db.from("gallery_categories").select("*").order("sort_order"),
    db.from("equipment_units").select("*").order("sort_order"),
  ]);

  const required = [studiosResult, equipmentResult, galleryResult];

  if (required.some((result) => result.error)) {
    console.error(
      "Catalogue query failed:",
      required.map((result) => result.error?.code),
    );
    throw new Error("Catalogue temporarily unavailable");
  }

  if (categoriesResult.error) {
    console.warn(
      "Equipment categories unavailable; using built-in fallback:",
      categoriesResult.error.code,
    );
  }

  if (galleryCategoriesResult.error) {
    console.warn(
      "Gallery categories unavailable; using built-in fallback:",
      galleryCategoriesResult.error.code,
    );
  }

  if (unitsResult.error) {
    console.warn(
      "Equipment inventory unavailable; using legacy status:",
      unitsResult.error.code,
    );
  }

  const units = unitsResult.error
    ? []
    : ((unitsResult.data || []) as EquipmentUnit[]);

  const unitsByEquipment = new Map<string, EquipmentUnit[]>();

  for (const unit of units) {
    const list = unitsByEquipment.get(unit.equipment_id) || [];
    list.push(unit);
    unitsByEquipment.set(unit.equipment_id, list);
  }

  return {
    studios: (studiosResult.data || []) as Studio[],
    equipment: ((equipmentResult.data || []) as Equipment[]).map((item) => ({
      ...item,
      inventory: unitsByEquipment.get(item.id) || [],
    })),
    gallery: (galleryResult.data || []) as GalleryItem[],
    categories: categoriesResult.error
      ? defaultEquipmentCategories
      : ((categoriesResult.data || []) as EquipmentCategory[]),
    galleryCategories: galleryCategoriesResult.error
      ? defaultGalleryCategories
      : ((galleryCategoriesResult.data || []) as GalleryCategory[]),
  };
});
