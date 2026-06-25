import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Manually load environment variables from .env.local
const envLocalPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envLocalPath, 'utf8');
const envVars = Object.fromEntries(
  envContent
    .split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => {
      const firstEq = line.indexOf('=');
      if (firstEq === -1) return [line.trim(), ''];
      return [line.slice(0, firstEq).trim(), line.slice(firstEq + 1).trim()];
    })
);

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const OUTPUT_FILE = './src/data/staticProfiles.ts';

function transformUrl(url) {
  if (!url) return url;
  // Replace Supabase storage URLs with local paths
  return url.replace(/https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\//g, '/storage/');
}

async function run() {
  console.log('Fetching profiles from Supabase...');
  const { data: profiles, error } = await supabase.from('profiles').select('*');
  
  if (error) {
    console.error('Error fetching profiles:', error);
    process.exit(1);
  }
  
  console.log(`Found ${profiles.length} profiles. Formatting and saving...`);

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

  const content = `import { ProfileType } from "@/types/profile";\n\nexport const staticProfiles: ProfileType[] = ${JSON.stringify(transformedProfiles, null, 2)};\n`;

  fs.writeFileSync(OUTPUT_FILE, content);
  console.log(`✅ Local database backup updated successfully at ${OUTPUT_FILE}`);
}

run().catch(console.error);
