import { NextResponse } from "next/server";
import { staticProfiles } from "@/data/staticProfiles";

// MASTER KILL-SWITCH: Set to false to immediately render this API dead
export const IS_PARTNER_DASH_ENABLED = true;

const PARTNER_PASSWORD = "Kakomando.";

function maskPhone(phone?: string | null): string {
  if (!phone) return "";
  const cleaned = phone.replace(/\s+/g, "");
  if (cleaned.length <= 4) return "••••••";
  const prefix = cleaned.slice(0, 4);
  const suffix = cleaned.slice(-2);
  return `${prefix} ••• ••${suffix}`;
}

function maskEmail(email?: string | null): string {
  if (!email) return "";
  const [user, domain] = email.split("@");
  if (!domain) return "•••••@gmail.com";
  return `${user.slice(0, 2)}•••••@${domain}`;
}

const mockApplications = [
  {
    id: "app-801",
    name: "Priscilla N.",
    age: 22,
    location: "Kololo, Kampala",
    phone: "0758 ••• ••39",
    whatsapp: "0758 ••• ••39",
    short_bio: "Independent classy model available for outcalls in upscale hotels.",
    body_type: "Curvy",
    complexion: "Medium",
    payment_method: "MTN MoMo",
    payment_phone: "0772 ••• ••14",
    transaction_id: "MTN-••••••••91B",
    status: "pending_verification",
    plan: "VIP 30-Days",
    profile_image: "/storage/profile-images/1776367731615-tju7piadu4i.jpg",
    images: ["/storage/profile-images/1776367731615-tju7piadu4i.jpg"],
    videos: [],
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "app-802",
    name: "Latifah K.",
    age: 24,
    location: "Entebbe Town",
    phone: "0701 ••• ••82",
    whatsapp: "0701 ••• ••82",
    short_bio: "Discreet VIP companion for airport pickups, dinner dates and weekend stays.",
    body_type: "Slim",
    complexion: "Light",
    payment_method: "Airtel Money",
    payment_phone: "0704 ••• ••66",
    transaction_id: "AIR-••••••••44F",
    status: "pending_verification",
    plan: "Standard 14-Days",
    profile_image: "/storage/profile-images/1775302329710-ad72ilzdpv.jpg",
    images: ["/storage/profile-images/1775302329710-ad72ilzdpv.jpg"],
    videos: [],
    created_at: new Date(Date.now() - 3600000 * 7).toISOString(),
  },
  {
    id: "app-803",
    name: "Chloe M.",
    age: 21,
    location: "Naguru, Kampala",
    phone: "0785 ••• ••21",
    whatsapp: "0785 ••• ••21",
    short_bio: "University student offering exclusive companionship and massage.",
    body_type: "Athletic",
    complexion: "Brown",
    payment_method: "MTN MoMo",
    payment_phone: "0785 ••• ••21",
    transaction_id: "MTN-••••••••09X",
    status: "pending_payment",
    plan: "VIP 30-Days",
    profile_image: "/storage/profile-images/1775430367662-1cdhkr6xad7.jpg",
    images: ["/storage/profile-images/1775430367662-1cdhkr6xad7.jpg"],
    videos: [],
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: "app-804",
    name: "Vanessa B.",
    age: 25,
    location: "Muyenga, Kampala",
    phone: "0742 ••• ••90",
    whatsapp: "0742 ••• ••90",
    short_bio: "High-end executive escort. Discreet, elegant, fluent English.",
    body_type: "Thick",
    complexion: "Medium",
    payment_method: "Airtel Money",
    payment_phone: "0742 ••• ••90",
    transaction_id: "AIR-••••••••32K",
    status: "approved",
    plan: "VIP 60-Days",
    profile_image: "/storage/profile-images/1776367731615-tju7piadu4i.jpg",
    images: ["/storage/profile-images/1776367731615-tju7piadu4i.jpg"],
    videos: [],
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  }
];

export async function POST(req: Request) {
  if (!IS_PARTNER_DASH_ENABLED) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  try {
    const { password } = await req.json();

    if (password !== PARTNER_PASSWORD) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Return full profile data including real contact details
    const sanitizedProfiles = staticProfiles.map(p => ({
      id: p.id,
      name: p.name,
      age: p.age || null,
      height: p.height || null,
      body_type: p.bodyType || null,
      complexion: p.complexion || null,
      location: p.location,
      phone: p.phone || "",
      whatsapp: p.whatsapp || "",
      email: p.email || "",
      instagram: p.instagram || null,
      short_bio: p.shortBio || "",
      description: p.description || "",
      services: p.services || [],
      profile_image: p.profileImage || null,
      images: p.images || [],
      videos: p.videos || [],
      is_pinned: !!p.isPinned,
      is_archived: !!p.isArchived,
      is_ad: !!p.isAd,
      is_verified: !!p.isVerified,
      ad_images: p.adImages || [],
    }));

    return NextResponse.json({
      success: true,
      profiles: sanitizedProfiles,
      applications: mockApplications,
    });
  } catch (err) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}