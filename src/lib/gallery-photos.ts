import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import local from "@/data/catalog.json";
import { CATALOG_CACHE_TAG } from "@/lib/cache-tags";
import { isConfigured, supabaseConfig } from "@/lib/supabase/config";

export type GalleryPhoto = {
  id: string;
  image_url: string;
  sort_order: number;
};

const loadGalleryPhotos = unstable_cache(
  async (): Promise<GalleryPhoto[]> => {
    if (!isConfigured()) {
      const fallback = local as {
        gallery?: Array<{
          id: string;
          image_url?: string | null;
          images?: string[];
        }>;
      };

      const seen = new Set<string>();
      const photos: GalleryPhoto[] = [];

      for (const item of fallback.gallery ?? []) {
        const urls =
          item.images?.length
            ? item.images
            : item.image_url
              ? [item.image_url]
              : [];

        for (const url of urls) {
          if (!url || seen.has(url)) continue;
          seen.add(url);
          photos.push({
            id: `${item.id}-${photos.length}`,
            image_url: url,
            sort_order: photos.length,
          });
        }
      }

      return photos;
    }

    const { url, key } = supabaseConfig();
    const db = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await db
      .from("gallery_photos")
      .select("id,image_url,sort_order")
      .order("sort_order")
      .order("id");

    if (error) {
      console.error("Gallery photo query failed:", error.code);
      throw new Error(
        "Gallery photo stream unavailable. Run migration 140_gallery_pinterest_stream.sql.",
      );
    }

    return (data ?? []) as GalleryPhoto[];
  },
  ["oni-gallery-photo-stream-v1"],
  {
    tags: [CATALOG_CACHE_TAG],
    revalidate: 300,
  },
);

export const getGalleryPhotos = cache(loadGalleryPhotos);
