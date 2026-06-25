import LocationPageClient from "@/screens/LocationPage";
import { fetchProfilesByLocation } from "@/data/allProfiles";
import type { Metadata } from 'next';

export const revalidate = 3600; 
export const dynamicParams = true;

type Props = {
  params: { category: string, location: string[] }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const categoryName = params.category.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  const city = params.location[0].replace(/-/g, ' ');
  const suburb = params.location[1] ? params.location[1].replace(/-/g, ' ') : null;
  
  const rawLocation = suburb ? `${suburb}, ${city}` : city;
  const locationName = rawLocation.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  const routePath = `${params.category}/${params.location.join('/')}`;

  // Check if there are profiles for this category-location combination
  const locationProfiles = await fetchProfilesByLocation(city);
  let profiles = locationProfiles;
  if (suburb) {
    const targetSuburb = suburb.toLowerCase().trim();
    profiles = locationProfiles.filter(p => {
      const pLoc = (p.location || '').toLowerCase();
      return pLoc === targetSuburb || pLoc.includes(targetSuburb);
    });
  }

  const cat = params.category.toLowerCase().replace(/-/g, ' ');
  profiles = profiles.filter(profile => {
    const bodyTypeMatch = profile.bodyType?.toLowerCase() === cat || profile.bodyType?.toLowerCase().includes(cat);
    const serviceMatch = profile.services?.some((s: string) => s.toLowerCase().includes(cat));
    const vipMatch = (cat === 'vip' || cat === 'premium') ? profile.isVip || profile.isPinned : false;
    
    return bodyTypeMatch || serviceMatch || vipMatch;
  });
  const hasProfiles = profiles.length > 0;
  
  return {
    title: `${categoryName} Escorts in ${locationName} - Verified Call Girls`,
    description: `Looking for ${categoryName.toLowerCase()} escorts in ${locationName}? Browse our exclusive selection of verified Ugandan call girls, VIP companions, and discreet hookups in ${locationName}.`,
    keywords: `${categoryName.toLowerCase()} escorts in ${locationName}, ${locationName} ${categoryName.toLowerCase()} call girls, ${categoryName.toLowerCase()} hookups ${locationName}`,
    openGraph: {
      title: `${categoryName} Escorts & Call Girls in ${locationName}`,
      description: `Browse verified ${categoryName.toLowerCase()} escorts and hot girls available in ${locationName}, Uganda. 100% Real & Verified profiles.`,
      url: `https://www.hexescortsug.com/${params.category}-escorts-in/${params.location.join('/')}`,
      siteName: 'Hex Escorts UG',
    },
    alternates: {
      canonical: `https://www.hexescortsug.com/${params.category}-escorts-in/${params.location.join('/')}`,
    },
    robots: {
      index: hasProfiles,
      follow: true,
    }
  }
}

export default async function CategoryLocationPage({ params }: Props) {
  const category = params.category.replace(/-/g, ' ');
  const city = params.location[0].replace(/-/g, ' ');
  const suburb = params.location[1] ? params.location[1].replace(/-/g, ' ') : null;
  
  const rawLocation = suburb ? `${suburb}, ${city}` : city;
  const locationName = rawLocation.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  const categoryName = category.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');

  // Fetch only the specific profiles for this location (Cache-protected)
  const locationProfiles = await fetchProfilesByLocation(city);

  // Fresh seed for client-side shuffling
  const seed = Math.random().toString(36).substring(2, 10);

  // Generate FAQ Schema for Google Rich Snippets
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `Are the ${categoryName.toLowerCase()} escorts in ${locationName} verified?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Yes, all ${categoryName.toLowerCase()} escorts listed on Hex Escorts UG for ${locationName} go through a strict verification process to ensure authenticity, safety, and a premium experience.`
        }
      },
      {
        "@type": "Question",
        "name": `How much do ${categoryName.toLowerCase()} escorts cost in ${locationName}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Prices vary depending on the companion, duration, and specific services. You can view individual rates on each verified profile for ${categoryName.toLowerCase()} escorts available in ${locationName}.`
        }
      },
      {
        "@type": "Question",
        "name": `Can I book an outcall to my hotel in ${locationName}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Absolutely. Many of our high-class ${categoryName.toLowerCase()} call girls in ${locationName} offer discreet outcall services to premium hotels, apartments, and private residences.`
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <LocationPageClient 
        cityParam={city} 
        suburbParam={suburb || undefined}
        categoryParam={category}
        initialProfiles={locationProfiles} 
        shuffleSeed={seed} 
      />
    </>
  );
}
