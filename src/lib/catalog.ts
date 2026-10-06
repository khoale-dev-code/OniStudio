import "server-only";
import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import local from "@/data/catalog.json";
import {
  defaultEquipmentCategories,
  defaultGalleryCategories,
} from "@/data/site";
import type {
  Backdrop,
  Equipment,
  EquipmentCategory,
  GalleryCategory,
  GalleryItem,
  IncludedEquipmentSummary,
  PropItem,
  Studio,
} from "@/types/catalog";
import { isConfigured, supabaseConfig } from "./supabase/config";

type Catalog = {
  studios: Studio[];
  equipment: Equipment[];
  backdrops: Backdrop[];
  props: PropItem[];
  gallery: GalleryItem[];
  categories: EquipmentCategory[];
  galleryCategories: GalleryCategory[];
};

function normalizeEquipment(item: Equipment): Equipment {
  return {
    ...item,
    rental_source: item.rental_source === "external" ? "external" : "internal",
    included_equipment_ids: Array.isArray(item.included_equipment_ids)
      ? item.included_equipment_ids
      : [],
    included_equipment_items: Array.isArray(item.included_equipment_items)
      ? item.included_equipment_items
      : [],
  };
}

function attachIncludedEquipmentNames(
  items: Equipment[],
  summaries: IncludedEquipmentSummary[],
) {
  const byId = new Map(summaries.map((summary) => [summary.id, summary]));

  return items.map((item) => {
    const resolved = (item.included_equipment_ids ?? [])
      .map((id) => byId.get(id))
      .filter(
        (summary): summary is IncludedEquipmentSummary => Boolean(summary),
      );

    return {
      ...item,
      included_equipment_items:
        resolved.length > 0
          ? resolved
          : item.included_equipment_items ?? [],
    };
  });
}

export const getCatalog = cache(async (): Promise<Catalog> => {
  if (!isConfigured()) {
    const fallback = local as {
      studios: Studio[];
      equipment: Equipment[];
      gallery: GalleryItem[];
    };

    return {
      ...fallback,
      equipment: fallback.equipment
        .filter((item) => item.category !== "backdrop")
        .map(normalizeEquipment),
      backdrops: [],
      props: [],
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
    backdropsResult,
    propsResult,
    galleryResult,
    categoriesResult,
    galleryCategoriesResult,
  ] = await Promise.all([
    db.from("studios").select("*").eq("published", true).order("sort_order"),
    db
      .from("equipment")
      .select("*")
      .eq("published", true)
      .neq("category", "backdrop")
      .order("sort_order"),
    db.from("backdrops").select("*").eq("published", true).order("sort_order"),
    db.from("props").select("*").eq("published", true).order("sort_order"),
    db.from("gallery").select("*").eq("published", true).order("sort_order"),
    db
      .from("equipment_categories")
      .select("*")
      .neq("slug", "backdrop")
      .order("sort_order"),
    db.from("gallery_categories").select("*").order("sort_order"),
  ]);

  const required = [studiosResult, equipmentResult, galleryResult];
  if (required.some((result) => result.error)) {
    console.error(
      "Catalogue query failed:",
      required.map((result) => result.error?.code),
    );
    throw new Error("Catalogue temporarily unavailable");
  }

  if (backdropsResult.error) {
    console.warn(
      "Backdrops unavailable; run migration 100_rental_catalog_split.sql:",
      backdropsResult.error.code,
    );
  }

  if (propsResult.error) {
    console.warn(
      "Props unavailable; run migration 100_rental_catalog_split.sql:",
      propsResult.error.code,
    );
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

  const publicEquipment = ((equipmentResult.data || []) as Equipment[]).map(
    normalizeEquipment,
  );

  const includedIds = Array.from(
    new Set(
      publicEquipment.flatMap((item) => item.included_equipment_ids ?? []),
    ),
  );

  let equipment = publicEquipment;

  // If RLS allows the referenced rows to be read, refresh their names live.
  // If it does not (for example unpublished accessories), preserve the
  // included_equipment_items snapshot stored on the external-rental row.
  if (includedIds.length > 0) {
    const { data: includedRows, error: includedError } = await db
      .from("equipment")
      .select("id,name,name_en")
      .in("id", includedIds);

    if (!includedError) {
      equipment = attachIncludedEquipmentNames(
        publicEquipment,
        (includedRows || []) as IncludedEquipmentSummary[],
      );
    }
  }

  return {
    studios: (studiosResult.data || []) as Studio[],
    equipment,
    backdrops: backdropsResult.error
      ? []
      : ((backdropsResult.data || []) as Backdrop[]),
    props: propsResult.error
      ? []
      : ((propsResult.data || []) as PropItem[]),
    gallery: (galleryResult.data || []) as GalleryItem[],
    categories: categoriesResult.error
      ? defaultEquipmentCategories
      : ((categoriesResult.data || []) as EquipmentCategory[]),
    galleryCategories: galleryCategoriesResult.error
      ? defaultGalleryCategories
      : ((galleryCategoriesResult.data || []) as GalleryCategory[]),
  };
});
