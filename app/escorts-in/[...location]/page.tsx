import LocationPageClient from "@/screens/LocationPage";
import { fetchProfilesByLocation } from "@/data/allProfiles";
import type { Metadata } from 'next';
import Breadcrumbs from "@/components/Breadcrumbs";

// 3600 = 1 hour. This means Supabase is only hit ONCE per hour per location.
// Vercel's Edge Network serves all other traffic for free!
export const revalidate = 3600; 
export const dynamicParams = true;

type Props = {
  params: { location: string[] }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const city = params.location[0].replace(/-/g, ' ');
  const suburb = params.location[1] ? params.location[1].replace(/-/g, ' ') : null;
  
  const rawLocation = suburb ? `${suburb}, ${city}` : city;
  const locationName = rawLocation.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  const routePath = params.location.join('/');

  // Check if there are profiles for this location
  const locationProfiles = await fetchProfilesByLocation(city);
  let profiles = locationProfiles;
  if (suburb) {
    const targetSuburb = suburb.toLowerCase().trim();
    profiles = locationProfiles.filter(p => {
      const pLoc = (p.location || '').toLowerCase();
      return pLoc === targetSuburb || pLoc.includes(targetSuburb);
    });
  }
  const hasProfiles = profiles.length > 0;
  
  return {
    title: `${locationName} Escorts - #1 Verified Sexy Call Girls & Hookups`,
    description: `Looking for hot escorts in ${locationName}? Browse our exclusive selection of verified Ugandan call girls, VIP companions, and discreet hookups in ${locationName}.`,
    keywords: `escorts in ${locationName}, ${locationName} call girls, hookups ${locationName}, hot girls ${locationName}`,
    openGraph: {
      title: `Top Escorts & Call Girls in ${locationName}`,
      description: `Browse verified sexy escorts and hot girls available in ${locationName}, Uganda. 100% Real & Verified profiles.`,
      url: `https://www.hexescortsug.com/escorts-in/${routePath}`,
      siteName: 'Hex Escorts UG',
    },
    alternates: {
      canonical: `https://www.hexescortsug.com/escorts-in/${routePath}`,
    },
    robots: {
      index: hasProfiles,
      follow: true,
    }
  }
}

export default async function EscortsInLocationPage({ params }: Props) {
  const city = params.location[0].replace(/-/g, ' ');
  const suburb = params.location[1] ? params.location[1].replace(/-/g, ' ') : null;
  
  const rawLocation = suburb ? `${suburb}, ${city}` : city;
  const locationName = rawLocation.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');

  // Fetch only the specific profiles for this location (Cache-protected)
  // If suburb exists, we pass it to the fetcher, else just city
  const locationProfiles = await fetchProfilesByLocation(city);

  // Deterministic seed per 1-hour block for location pages so Next.js ISR can properly cache
  const seed = Math.floor(Date.now() / (1000 * 3600)).toString(36);

  // Generate FAQ Schema for Google Rich Snippets
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `Are the escorts in ${locationName} verified?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Yes, all escorts listed on Hex Escorts UG for ${locationName} go through a strict verification process to ensure authenticity, safety, and a premium experience.`
        }
      },
      {
        "@type": "Question",
        "name": `How much do escorts cost in ${locationName}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Prices vary depending on the companion, duration, and specific services. You can view individual rates on each verified profile for escorts available in ${locationName}.`
        }
      },
      {
        "@type": "Question",
        "name": `Can I book an outcall to my hotel in ${locationName}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Absolutely. Many of our high-class call girls in ${locationName} offer discreet outcall services to premium hotels, apartments, and private residences.`
        }
      }
    ]
  };

  const breadcrumbItems = [
    { label: "Escorts in Uganda", href: "/escorts-in" },
    ...(city ? [{ label: city.charAt(0).toUpperCase() + city.slice(1), href: `/escorts-in/${city}` }] : []),
    ...(suburb ? [{ label: suburb.charAt(0).toUpperCase() + suburb.slice(1), href: `/escorts-in/${city}/${suburb.replace(/\s+/g, '-')}`, current: true }] : (city ? [{ label: "All Areas", href: "#", current: true }] : []))
  ];

  return (
    <main className="min-h-screen bg-black pt-4 pb-8">
      <div className="container mx-auto px-4">
        <Breadcrumbs items={breadcrumbItems} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <LocationPageClient 
          cityParam={city} 
          suburbParam={suburb || undefined}
          initialProfiles={locationProfiles} 
          shuffleSeed={seed} 
        />
      </div>
    </main>
  );
}
