import { NextResponse } from "next/server";

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const DB_ID = process.env.CLOUDFLARE_D1_DATABASE_ID;
const D1_TOKEN = process.env.CLOUDFLARE_D1_TOKEN;

export async function GET() {
  if (!ACCOUNT_ID || !DB_ID || !D1_TOKEN) {
    return NextResponse.json([]);
  }

  const D1_URI = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DB_ID}/query`;

  try {
    const res = await fetch(D1_URI, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${D1_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sql: "SELECT * FROM profiles WHERE is_archived = 0 ORDER BY is_pinned DESC, created_at DESC;",
      }),
      next: { revalidate: 60 }
    });
    const data = await res.json();
    if (data.success && data.result?.[0]?.results) {
      const dbProfiles = data.result[0].results.map((p: any) => ({
        id: String(p.id),
        name: p.name,
        age: p.age ?? undefined,
        height: p.height ?? undefined,
        bodyType: p.body_type ?? undefined,
        complexion: p.complexion ?? undefined,
        location: p.location,
        rating: Number(p.rating) || 4.5,
        profileImage: p.profile_image || "/placeholder.svg",
        images: typeof p.images === "string" ? JSON.parse(p.images) : (p.images || []),
        videos: typeof p.videos === "string" ? JSON.parse(p.videos) : (p.videos || []),
        shortBio: p.short_bio || "",
        description: p.description || "",
        phone: p.phone ?? undefined,
        whatsapp: p.whatsapp ?? undefined,
        email: p.email ?? undefined,
        instagram: p.instagram ?? undefined,
        services: typeof p.services === "string" ? JSON.parse(p.services) : (p.services || []),
        isPinned: Boolean(p.is_pinned),
        isArchived: Boolean(p.is_archived),
        isVip: Boolean(p.is_vip),
        isPremium: Boolean(p.is_premium),
        isAd: Boolean(p.is_ad),
        isVerified: Boolean(p.is_verified),
        adImages: typeof p.ad_images === "string" ? JSON.parse(p.ad_images) : (p.ad_images || []),
      }));
      return NextResponse.json(dbProfiles);
    }
    return NextResponse.json([]);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to fetch profiles from D1" }, { status: 500 });
  }
}