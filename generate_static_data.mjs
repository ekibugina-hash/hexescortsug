import fs from 'fs';
import path from 'path';

const BACKUP_DIR = './backup/2026-04-19T17-51-38-126Z';
const OUTPUT_FILE = './src/data/staticProfiles.ts';

function transformUrl(url) {
  if (!url) return url;
  // Replace Supabase storage URLs with local paths
  return url.replace(/https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\//g, '/storage/');
}

async function run() {
  const profilesRaw = fs.readFileSync(path.join(BACKUP_DIR, 'profiles.json'), 'utf8');
  const profiles = JSON.parse(profilesRaw);

  const transformedProfiles = profiles.map(p => ({
    id: String(p.id),
    name: p.name,
    age: p.age || undefined,
    height: p.height || undefined,
    bodyType: p.body_type || undefined,
    complexion: p.complexion || undefined,
    location: p.location,
    rating: Number(p.rating) || 4.5,
    profileImage: transformUrl(p.profile_image),
    images: (p.images || []).map(transformUrl),
    shortBio: p.short_bio || "",
    description: p.description || "",
    phone: p.phone || undefined,
    whatsapp: p.whatsapp || undefined,
    email: p.email || undefined,
    instagram: p.instagram || undefined,
    services: p.services || [],
    videos: (p.videos || []).map(transformUrl),
    reviews: [],
    isPinned: p.is_pinned || false,
    isArchived: p.is_archived || false,
    isVip: p.is_vip || false,
    isPremium: p.is_premium || false,
  }));

  const content = `import { ProfileType } from "@/types/profile";

export const staticProfiles: ProfileType[] = ${JSON.stringify(transformedProfiles, null, 2)};
`;

  fs.writeFileSync(OUTPUT_FILE, content);
  console.log(`✅ Static profiles generated at ${OUTPUT_FILE}`);
}

run().catch(console.error);
