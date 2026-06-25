import { ProfileType } from "@/types/profile";
import { mockProfiles } from "@/data/mockProfiles";
import { staticProfiles } from "@/data/staticProfiles";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/utils";
import { unstable_cache } from 'next/cache';

// Set this to false to use live database updates while serving images locally to save quota
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

// Create a set of IDs that we have locally backed up for fast lookup
const BACKED_UP_IDS = new Set(staticProfiles.map(p => p.id));

function mapDbProfile(p: any): ProfileType {
  const isLocal = BACKED_UP_IDS.has(String(p.id));

  // Helper to convert Supabase storage URLs to our smart media proxy
  // The proxy (app/api/media) will automatically check local backup first, then fallback to Supabase
  const transformUrl = (url: string | null | undefined): string => {
    if (!url) return "/placeholder.svg";
    
    // If it's already a local path or static reference, keep it
    if (url.startsWith('/storage/') || url.startsWith('/') || !url.includes('.supabase.co')) {
      return url;
    }
    
    // Route ALL Supabase storage URLs through our smart proxy
    if (url.includes("/storage/v1/object/public/")) {
      const match = url.match(/\.supabase\.co\/storage\/v1\/object\/public\/(.*)/);
      if (match && match[1]) {
        return `/api/media/${match[1]}`;
      }
    }
    
    return url;
  };

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
    // @ts-ignore – Supabase type chain depth limit
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
