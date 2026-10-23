import { ProfileType } from "@/types/profile";
import { mockProfiles } from "@/data/mockProfiles";
import { staticProfiles } from "@/data/staticProfiles";
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

const R2_PUBLIC_BASE = "https://pub-aa01e6dca81f482ab084275e93025a99.r2.dev";

/**
 * Transforms ANY image reference to Cloudflare R2 Public CDN / local static path.
 */
function transformUrl(url: string | null | undefined): string {
  if (!url) return "/placeholder.svg";

  // Full HTTP/HTTPS URLs (including R2 CDN URLs) — keep exact URL as-is
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  // Relative storage paths
  if (url.startsWith("/storage/profile-images/")) {
    return `${R2_PUBLIC_BASE}${url}`;
  }
  if (url.startsWith("/profile-images/")) {
    return `${R2_PUBLIC_BASE}${url}`;
  }

  // Root-relative paths (like /placeholder.svg) — keep as-is
  if (url.startsWith("/")) return url;

  // Extract filename from any string filename
  const match = url.match(/([a-zA-Z0-9.\-_]+\.(?:jpg|jpeg|png|webp|jfif|avif|mp4|mov))/i);
  if (match && match[1]) {
    return `${R2_PUBLIC_BASE}/storage/profile-images/${match[1]}`;
  }

  return url;
}

/**
 * Get active (non-archived) static profiles to use as offline fallback.
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

const ACCOUNT_ID = process.env.CLOUDFLARE_D1_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID || "b07234f65853d0f9f8e6fa1896cf06db";
const DB_ID = process.env.CLOUDFLARE_D1_DATABASE_ID || "9914bf44-9661-4a24-903f-d49c73d6b1fe";
const D1_TOKEN = process.env.CLOUDFLARE_D1_TOKEN;

async function fetchProfilesDirectFromD1(): Promise<ProfileType[] | null> {
  if (!D1_TOKEN) return null;

  try {
    const D1_URI = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DB_ID}/query`;
    const res = await fetch(D1_URI, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${D1_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sql: "SELECT * FROM profiles WHERE is_archived = 0 ORDER BY is_pinned DESC, created_at DESC;",
        params: [],
      }),
      signal: AbortSignal.timeout(2500),
      next: { revalidate: 60 },
    });
    const data = await res.json();
    if (data.success && data.result?.[0]?.results) {
      const results = data.result[0].results;
      return results.map((p: any) => ({
        id: String(p.id),
        name: p.name,
        age: p.age ?? undefined,
        height: p.height ?? undefined,
        bodyType: p.body_type ?? undefined,
        complexion: p.complexion ?? undefined,
        location: p.location,
        rating: Number(p.rating) || 4.5,
        profileImage: transformUrl(p.profile_image || (p.images && p.images.length > 0 ? p.images[0] : null)),
        images: (typeof p.images === "string" ? JSON.parse(p.images) : (p.images || [])).map(transformUrl),
        videos: (typeof p.videos === "string" ? JSON.parse(p.videos) : (p.videos || [])).map(transformUrl),
        shortBio: p.short_bio || "",
        description: p.description || "",
        phone: p.phone ?? undefined,
        whatsapp: p.whatsapp ?? undefined,
        email: p.email ?? undefined,
        instagram: p.instagram ?? undefined,
        services: typeof p.services === "string" ? JSON.parse(p.services) : (p.services || []),
        reviews: [],
        isPinned: Boolean(p.is_pinned),
        isArchived: Boolean(p.is_archived),
        isVip: Boolean(p.is_vip),
        isPremium: Boolean(p.is_premium),
        isAd: Boolean(p.is_ad),
        isVerified: Boolean(p.is_verified),
        adImages: (typeof p.ad_images === "string" ? JSON.parse(p.ad_images) : (p.ad_images || [])).map(transformUrl),
      }));
    }
  } catch (e) {
    console.error("Direct D1 query error in fetchProfilesDirectFromD1:", e);
  }
  return null;
}

export async function fetchAllProfiles(seed?: string) {
  const fallback = getActiveStaticProfiles();

  if (FORCE_STATIC_DATA) {
    return seed ? sortAndShuffleProfiles(fallback, seed) : fallback;
  }

  // Direct Cloudflare D1 query when executing on Server Side (Vercel Server Components)
  if (typeof window === "undefined") {
    try {
      const directD1 = await fetchProfilesDirectFromD1();
      if (directD1 && directD1.length > 0) {
        return seed ? sortAndShuffleProfiles(directD1, seed) : directD1;
      }
    } catch (e) {
      console.warn("Direct D1 server fetch failed, trying HTTP fallback:", e);
    }
  }

  // On the server, NEVER perform a recursive self-fetch over HTTP as it causes worker deadlocks & timeouts.
  // Instead, immediately fall back to the pre-rendered static profiles.
  if (typeof window === "undefined") {
    return seed ? sortAndShuffleProfiles(fallback, seed) : fallback;
  }

  try {
    const apiRes = await fetch("/api/profiles", { signal: AbortSignal.timeout(3000) });
    if (apiRes.ok) {
      const d1Profiles = await apiRes.json();
      if (Array.isArray(d1Profiles) && d1Profiles.length > 0) {
        // Map transformUrl across all images in profiles
        const mapped = d1Profiles.map((p: any) => ({
          ...p,
          profileImage: transformUrl(p.profileImage),
          images: Array.isArray(p.images) ? p.images.map(transformUrl) : [],
          videos: Array.isArray(p.videos) ? p.videos.map(transformUrl) : [],
          adImages: Array.isArray(p.adImages) ? p.adImages.map(transformUrl) : [],
        }));
        return seed ? sortAndShuffleProfiles(mapped, seed) : mapped;
      }
    }
  } catch (e) {
    console.warn("Cloudflare D1 fetch error, using active static fallback:", e);
  }

  return seed ? sortAndShuffleProfiles(fallback, seed) : fallback;
}

export async function fetchProfileById(id: string) {
  const fallbackProfiles = getActiveStaticProfiles();
  const normalizedTarget = decodeURIComponent(id).toLowerCase().trim();
  const targetSlug = slugify(normalizedTarget);

  try {
    const allProfiles = await fetchAllProfiles();
    const match = allProfiles.find((p: ProfileType) => 
      p.id === id || 
      slugify(p.name) === id || 
      p.name.toLowerCase().trim() === normalizedTarget ||
      slugify(p.name) === targetSlug
    );
    if (match) return match;
  } catch (err) {
    console.error("Fetch exception in fetchProfileById:", err);
  }

  return fallbackProfiles.find(p => 
    p.id === id || 
    slugify(p.name) === id || 
    p.name.toLowerCase().trim() === normalizedTarget ||
    slugify(p.name) === targetSlug
  ) || null;
}

// Quota-Safe Fetcher for Location Pages using Cloudflare D1
export async function fetchProfilesByLocation(location: string) {
  const fallback = getActiveStaticProfiles().filter(p =>
    p.location.toLowerCase().includes(location.toLowerCase())
  );

  try {
    const allProfiles = await fetchAllProfiles();
    const matched = allProfiles.filter((p: ProfileType) =>
      p.location.toLowerCase().includes(location.toLowerCase())
    );
    return matched.length > 0 ? matched : fallback;
  } catch (err) {
    console.error(`Error fetching profiles for ${location}:`, err);
    return fallback;
  }
}