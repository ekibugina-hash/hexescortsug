import { ProfileType } from "@/types/profile";
import { mockProfiles } from "@/data/mockProfiles";
import { staticProfiles } from "@/data/staticProfiles";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/utils";
import { unstable_cache } from 'next/cache';

// Set this to true ONLY if you want to bypass Supabase entirely and use static data
const FORCE_STATIC_DATA = false;

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
 * Transforms ANY image reference to a local Vercel static storage path.
 * Images are served from /public/storage/profile-images/ committed in the repo
 * via Vercel's global Edge CDN (zero CPU, zero Supabase egress, zero bandwidth cost).
 */
function transformUrl(url: string | null | undefined): string {
  if (!url) return "/placeholder.svg";

  // R2 Public CDN URLs — keep as-is
  if (url.includes(".r2.dev/") || url.includes("cloudflarestorage.com")) return url;

  // Local Vercel static CDN paths — keep as-is
  if (url.startsWith("/storage/")) return url;

  // Root-relative paths — keep as-is
  if (url.startsWith("/")) return url;

  // Extract filename from any legacy Supabase or wsrv.nl URL
  const match = url.match(/([a-zA-Z0-9.\-_]+\.(?:jpg|jpeg|png|webp|jfif|avif|mp4|mov))/i);
  if (match && match[1]) {
    return `/storage/profile-images/${match[1]}`;
  }

  return url;
}

/**
 * Get active (non-archived) static profiles to use as offline fallback.
 * Filtering here prevents archived profiles from ever showing publicly when Supabase is unavailable.
 */
function getActiveStaticProfiles() {
  return staticProfiles.filter(p => !p.isArchived);
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
  const fallback = getActiveStaticProfiles();

  if (FORCE_STATIC_DATA) {
    return seed ? sortAndShuffleProfiles(fallback, seed) : fallback;
  }

  try {
    const apiRes = await fetch("/api/profiles");
    if (apiRes.ok) {
      const d1Profiles = await apiRes.json();
      if (Array.isArray(d1Profiles) && d1Profiles.length > 0) {
        return seed ? sortAndShuffleProfiles(d1Profiles, seed) : d1Profiles;
      }
    }
  } catch (e) {
    console.warn("Cloudflare D1 fetch error, using active static fallback:", e);
  }

  return seed ? sortAndShuffleProfiles(fallback, seed) : fallback;
}

export async function fetchProfileById(id: string) {
  const allStatic = staticProfiles;

  if (FORCE_STATIC_DATA) {
    return allStatic.find(p => p.id === id || slugify(p.name) === id) || null;
  }

  try {
    // @ts-ignore
    const { data: idData } = await (supabase as any)
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (idData) return mapDbProfile(idData);

    // Try slug match across all non-archived profiles
    const { data: allProfiles } = await (supabase as any)
      .from("profiles")
      .select("*")
      .eq("is_archived", false);

    if (allProfiles) {
      const match = allProfiles.find((p: any) => slugify(p.name) === id);
      if (match) return mapDbProfile(match);
    }

    return allStatic.find(p => p.id === id || slugify(p.name) === id) || null;
  } catch (err) {
    console.error("Fetch exception, using static fallback:", err);
    return allStatic.find(p => p.id === id || slugify(p.name) === id) || null;
  }
}

// Quota-Safe Fetcher for Location Pages
export const fetchProfilesByLocation = unstable_cache(
  async (location: string) => {
    const fallback = getActiveStaticProfiles().filter(p =>
      p.location.toLowerCase().includes(location.toLowerCase())
    );

    if (FORCE_STATIC_DATA) {
      return fallback;
    }

    try {
      // @ts-ignore
      const { data, error } = await (supabase as any)
        .from("profiles")
        .select("id, name, location, profile_image, rating, is_pinned, is_vip, is_premium, is_verified")
        .eq("is_archived", false)
        .ilike("location", `%${location}%`)
        .order("is_pinned", { ascending: false });

      if (error || !data || data.length === 0) return fallback;
      return data.map(mapDbProfile);
    } catch (err) {
      console.error(`Error fetching profiles for ${location}:`, err);
      return fallback;
    }
  },
  ['location-profiles'],
  { revalidate: 300 }
);