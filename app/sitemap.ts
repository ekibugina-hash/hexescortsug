import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { staticProfiles } from '@/data/staticProfiles'

export const revalidate = 3600; // Refresh once per hour

const BASE_URL = 'https://www.hexescortsug.com'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const cities = [
  'kampala', 'entebbe', 'jinja', 'mbarara', 'gulu', 'fort-portal', 'mbale', 'tororo', 'mukono', 
  'masaka', 'arua', 'lira', 'kasese', 'hoima', 'soroti', 'busia', 'mubende', 'wakiso',
  'lugazi', 'kanyanya', 'kasangati', 'mityana', 'bombo', 'kitgum', 'kotido', 'moroto'
];

const kampalaSuburbs = [
  "banda", "bugolobi", "bukesa", "bukoto", "bunamwaya", "bunga", 
  "busega", "buwate", "buziga", "bwaise", "central", "ggaba", "kabalagala", "kabowa", 
  "kampala town", "kamwokya", "kansanga", "kanyanya", "kasubi", "katooke", 
  "kawempe", "kazo", "kibuli", "kireka", "kirinnya", "kisaasi", "kisugu", 
  "kitintale", "kiwatule", "kololo", "komamboga", "kulambiro", "kyaliwajjala", 
  "kyambogo", "kyanja", "kyebando", "lubaga", "lugala", "lugogo", "lungujja", 
  "luzira", "makerere", "makindye", "masajja", "masanafu", "mawanda road", 
  "mbuya", "mengo", "mpererwe", "mulago", "munyonyo", "mutundwe", "mutungo", 
  "muyenga", "naalya", "nabulagala", "nabweru", "naguru", "najjanankumbi", 
  "najjera", "nakasero", "nakawa", "nakulabye", "namasuba", "namirembe", 
  "namungoona", "namuwongo", "nateete", "nkuba", "nsambya", "ntinda", 
  "rubaga", "salaama rd", "sir apollo kagwa", "wandegeya"
];

const topCategories = ['thick', 'slim', 'curvy', 'vip', 'massage'];

const slugify = (text: string) => text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Static Pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/become-escort`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/vip`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/escorts-in`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.85 },
  ];

  // 2. Fetch Profiles to dynamically determine active locations and categories
  let activeProfiles: any[] = [];
  try {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, location, body_type, is_pinned, is_vip, services, updated_at')
      .eq('is_archived', false);

    if (profiles && profiles.length > 0) {
      activeProfiles = profiles;
    } else {
      activeProfiles = staticProfiles.filter(p => !p.isArchived);
    }
  } catch (e) {
    activeProfiles = staticProfiles.filter(p => !p.isArchived);
  }

  const activeCities = new Set<string>();
  const activeSuburbs = new Set<string>();
  const activeCategoryCities = new Set<string>();
  const profileUrlMap = new Map<string, MetadataRoute.Sitemap[number]>();

  activeProfiles.forEach(p => {
    const profileLoc = (p.location || p.location === '' ? p.location : '').toLowerCase().trim();
    if (!profileLoc) return;

    let matchedCity = '';
    let matchedSuburb = '';

    // Check Kampala Suburbs first
    const foundSuburb = kampalaSuburbs.find(sub => profileLoc.includes(sub) || sub.includes(profileLoc));
    if (foundSuburb) {
      matchedCity = 'kampala';
      matchedSuburb = foundSuburb;
    } else {
      // Check other cities
      const foundCity = cities.find(c => c !== 'kampala' && (profileLoc.includes(c) || c.includes(profileLoc)));
      if (foundCity) {
        matchedCity = foundCity;
      } else if (profileLoc.includes('kampala')) {
        matchedCity = 'kampala';
      } else {
        // Fallback to slugified location
        matchedCity = slugify(profileLoc);
      }
    }

    if (matchedCity) activeCities.add(matchedCity);
    if (matchedSuburb) activeSuburbs.add(matchedSuburb);

    // Build categories for this profile
    const categories: string[] = [];
    const bodyType = (p.body_type || p.bodyType || '').toLowerCase();
    if (bodyType.includes('slim')) categories.push('slim');
    if (bodyType.includes('curvy')) categories.push('curvy');
    if (bodyType.includes('thick')) categories.push('thick');

    if (p.is_vip || p.isVip || p.is_pinned || p.isPinned) categories.push('vip');

    const services = p.services || [];
    if (services.some((s: string) => s.toLowerCase().includes('massage'))) {
      categories.push('massage');
    }

    categories.forEach(cat => {
      if (matchedCity) {
        activeCategoryCities.add(`${cat}-escorts-in/${matchedCity}`);
      }
    });

    // Profile URL — use a Map keyed by slug to automatically deduplicate
    // if two profiles share the same name, the most recently updated one wins
    const profileSlug = slugify(p.name);
    const existing = profileUrlMap.get(profileSlug);
    const lastMod = p.updated_at ? new Date(p.updated_at) : new Date();
    if (!existing || lastMod > existing.lastModified) {
      profileUrlMap.set(profileSlug, {
        url: `${BASE_URL}/profile/${profileSlug}`,
        lastModified: lastMod,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      });
    }
  });

  // 3. Active Location Pages
  const locationUrls: MetadataRoute.Sitemap = Array.from(activeCities).map(city => ({
    url: `${BASE_URL}/escorts-in/${city}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.95,
  }));

  // 4. Active Suburb Pages
  const suburbUrls: MetadataRoute.Sitemap = Array.from(activeSuburbs).map(suburb => ({
    url: `${BASE_URL}/escorts-in/kampala/${slugify(suburb)}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  // 5. Active Category Pages
  const categoryUrls: MetadataRoute.Sitemap = Array.from(activeCategoryCities).map(path => ({
    url: `${BASE_URL}/${path}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  const profileUrls = Array.from(profileUrlMap.values());
  return [...staticPages, ...locationUrls, ...suburbUrls, ...categoryUrls, ...profileUrls];
}
