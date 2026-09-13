import { ProfileType } from "@/types/profile";
import { mockProfiles } from "@/data/mockProfiles";
import { staticProfiles } from "@/data/staticProfiles";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/utils";
import { unstable_cache } from 'next/cache';

// Set this to false to use live database updates while serving images locally to save quota
const FORCE_STATIC_DATA = false;

// Supabase project storage base URL (for converting local /storage/ paths to full URLs)
const SUPABASE_STORAGE_BASE = "https://dkyikirsvpauhbexbhvu.supabase.co/storage/v1/object/public";

export function createSeededRand(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return () => {
    h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
    h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
    h = (h ^ (h >>> 16)) >>> 0;
    return h / 4294967296;
  };
}

export function shuffleArray<T>(array: T[], rand?: () => number): T[] {
  const arr = [...array];
  const r = rand || Math.random;
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function sortAndShuffleProfiles(profiles: ProfileType[], seed?: string): ProfileType[] {
  if (!seed) return profiles;
  const rand = createSeededRand(seed);
  const pinned = profiles.filter(p => p.isPinned);
  const regular = profiles.filter(p => !p.isPinned);

  return [...shuffleArray(pinned, rand), ...shuffleArray(regular, rand)];
}

/**
 * Transforms ANY image URL to a wsrv.nl-proxied URL for reliable, CDN-cached delivery.
 *
 * Handles three cases:
 *  1. Full Supabase storage URLs  → wsrv.nl proxy
 *  2. Local /storage/... paths    → convert to full Supabase URL → wsrv.nl proxy
 *  3. Everything else             → pass through unchanged
 *
 * This ensures images NEVER depend on static files being present in /public/storage/,
 * which was the root cause of recurring broken-image incidents.
 */
function transformUrl(url: string | null | undefined): string {
  if (!url) return "/placeholder.svg";

  const isImage = /\.(jpg|jpeg|png|webp|jfif|avif)$/i.test(url);

  // Case 1: Full Supabase storage URL — route through wsrv.nl
  if (url.includes(".supabase.co") && url.includes("/storage/v1/object/public/")) {
    if (isImage) {
      return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=800&output=webp&q=80`;
    }
    return url; // videos etc — pass through
  }

  // Case 2: Local /storage/profile-images/... path — convert to Supabase URL then wsrv.nl
  if (url.startsWith("/storage/profile-images/")) {
    const fileName = url.replace("/storage/profile-images/", "");
    const supabaseUrl = `${SUPABASE_STORAGE_BASE}/profile-images/${fileName}`;
    if (isImage) {
      return `https://wsrv.nl/?url=${encodeURIComponent(supabaseUrl)}&w=800&output=webp&q=80`;
    }
    return supabaseUrl; // non-image files
  }

  // Case 3: /storage/avatars/... path
  if (url.startsWith("/storage/avatars/")) {
    const fileName = url.replace("/storage/avatars/", "");
    const supabaseUrl = `${SUPABASE_STORAGE_BASE}/avatars/${fileName}`;
    if (isImage) {
      return `https://wsrv.nl/?url=${encodeURIComponent(supabaseUrl)}&w=800&output=webp&q=80`;
    }
    return supabaseUrl;
  }

  // Case 4: Anything else (placeholder, external URLs, etc.) — pass through
  return url;
}

function mapDbProfile(p: any): ProfileType {
  return {
    id: String(p.id),
    name: p.name,
    age: p.age ?? undefined,
    height: p.height ?? undefined,
    bodyType: p.body_type ?? undefined,
    complexion: p.complexion ?? undefined,
    location: p.location,
    rating: Number(p.rating) || 4.5,
    profileImage: transformUrl(p.profile_image || (p.images && p.images.length > 0 ? p.images[0] : null)),
    images: (p.images && p.images.length > 0) ? p.images.map(transformUrl) : [transformUrl(p.profile_image)],
    shortBio: p.short_bio || "",
    description: p.description || "",
    phone: p.phone ?? undefined,
    whatsapp: p.whatsapp ?? undefined,
    email: p.email ?? undefined,
    instagram: p.instagram ?? undefined,
    services: p.services || [],
    videos: (p.videos || []).map(transformUrl),
    reviews: [],
    isPinned: p.is_pinned || false,
    isArchived: p.is_archived || false,
    isVip: p.is_vip || false,
    isPremium: p.is_premium || false,
    isAd: p.is_ad || false,
    isVerified: p.is_verified || false,
    adImages: (p.ad_images || []).map(transformUrl),
  };
}

export async function fetchAllProfiles(seed?: string) {
  if (FORCE_STATIC_DATA) {
    return seed ? sortAndShuffleProfiles(staticProfiles, seed) : staticProfiles;
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn("No Supabase URL; using static fallback.");
    return seed ? sortAndShuffleProfiles(staticProfiles, seed) : staticProfiles;
  }
  
  try {
    // @ts-ignore - Supabase type chain depth limit
    const { data, error } = await (supabase as any)
      .from("profiles")
      .select("*")
      .eq("is_archived", false)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error (likely quota hit), using local backup:", error);
      return seed ? sortAndShuffleProfiles(staticProfiles, seed) : staticProfiles;
    }

    const dbProfiles: ProfileType[] = (data || []).map(mapDbProfile);
    return seed ? sortAndShuffleProfiles(dbProfiles, seed) : dbProfiles;
  } catch (err) {
    console.error("Fetch exception, using static fallback:", err);
    return seed ? sortAndShuffleProfiles(staticProfiles, seed) : staticProfiles;
  }
}

export async function fetchProfileById(id: string) {
  if (FORCE_STATIC_DATA) {
    return staticProfiles.find(p => p.id === id || slugify(p.name) === id) || null;
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return staticProfiles.find(p => p.id === id || slugify(p.name) === id) || null;
  }

  try {
    // First try by ID
    // @ts-ignore
    const { data: idData, error: idError } = await (supabase as any)
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (idData) return mapDbProfile(idData);

    // If not found, try searching all profiles for a slug match (more reliable than ILike if names have weird chars)
    const { data: allProfiles, error: allErr } = await (supabase as any)
      .from("profiles")
      .select("*")
      .eq("is_archived", false);

    if (allProfiles) {
      const match = allProfiles.find((p: any) => slugify(p.name) === id);
      if (match) return mapDbProfile(match);
    }

    // Fallback to static lookup by slug or ID
    return staticProfiles.find(p => p.id === id || slugify(p.name) === id) || null;
  } catch (err) {
    console.error("Fetch exception, using static fallback:", err);
    return staticProfiles.find(p => p.id === id || slugify(p.name) === id) || null;
  }
}

// Quota-Safe Fetcher for Location Pages
export const fetchProfilesByLocation = unstable_cache(
  async (location: string) => {
    if (FORCE_STATIC_DATA || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      // Fallback to static data if needed
      return staticProfiles.filter(p => 
        p.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    try {
      // @ts-ignore
      const { data, error } = await (supabase as any)
        .from("profiles")
        // CRITICAL: Only select lightweight columns to save egress! No descriptions or large arrays.
        .select("id, name, location, profile_image, rating, is_pinned, is_vip, is_premium, is_verified")
        .eq("is_archived", false)
        // CRITICAL: Filter in the DB so we only download profiles for this location
        .ilike("location", `%${location}%`) 
        .order("is_pinned", { ascending: false });

      if (error) throw error;
      
      // Map it using your existing mapDbProfile logic
      return (data || []).map(mapDbProfile);
    } catch (err) {
      console.error(`Error fetching profiles for ${location}:`, err);
      return [];
    }
  },
  ['location-profiles'], // Cache key prefix
  { revalidate: 3600 } // Cache in Next.js for 1 hour (3600 seconds) to protect Supabase
);
