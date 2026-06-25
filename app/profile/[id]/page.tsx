import ProfileDetailPageClient from "@/screens/ProfileDetailPage";
import { fetchAllProfiles, fetchProfileById } from "@/data/allProfiles";
import type { Metadata, ResolvingMetadata } from 'next';
import { slugify } from "@/lib/utils";
import { notFound, permanentRedirect } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";

export const revalidate = 60; // Refresh profile data every 60 seconds to save Edge Requests
export const dynamicParams = true;

type Props = {
  params: { id: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id;
  
  const profile = await fetchProfileById(id);

  if (!profile) {
    return { title: 'Profile Not Found | Escorts UG' };
  }

  return {
    title: `${profile.name} - Verified Sexy Escort in ${profile.location} | Hex Escorts UG`,
    description: `Book ${profile.name}, a verified companion in ${profile.location}, Uganda. View pictures and services on Hex Escorts UG.`,
    keywords: `${profile.name}, escorts ${profile.location}, sexy girls ${profile.location}, hot girls Uganda, hex escorts, companions Uganda`,
    openGraph: {
      title: `${profile.name} - Verified Escort in ${profile.location}`,
      description: `Book ${profile.name}, a verified sexy companion located in ${profile.location}. Contact on Hex Escorts UG.`,
      images: [profile.profileImage],
    },
    alternates: {
      canonical: `https://www.hexescortsug.com/profile/${slugify(profile.name)}`,
    },
  }
}

export default async function Page({ params }: Props) {
  const { id } = params;
  
  const profile = await fetchProfileById(id);

  if (!profile) {
    notFound();
  }

  // SEO Optimization: If accessed via ID instead of Slug, redirect to Slug
  const profileSlug = slugify(profile.name);
  if (id !== profileSlug && id !== profile.id) {
     // This handles cases where ID is used but it's not the canonical slug
     // We allow the exact ID for backward compatibility but redirect to slug
     permanentRedirect(`/profile/${profileSlug}`);
  } else if (id === profile.id && id !== profileSlug) {
    // If accessed via actual database ID, redirect to slug
    permanentRedirect(`/profile/${profileSlug}`);
  }

  // Deterministic review count based on ID to avoid "duplicate content" flags
  const reviewCount = (parseInt(profile.id.substring(0, 8), 16) % 100) + 45;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `${profile.name} - Elite Escort in ${profile.location}`,
    "image": profile.profileImage,
    "description": profile.description || profile.shortBio || `Book ${profile.name}, a verified sexy companion in ${profile.location}.`,
    "brand": {
      "@type": "Brand",
      "name": "Hex Escorts UG"
    },
    // This is the magic that gives you Star Ratings in Google!
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": profile.rating?.toString() || "4.8",
      "reviewCount": reviewCount.toString(),
      "bestRating": "5",
      "worstRating": "1"
    },
    // This adds the "Price" snippet in Google Search
    "offers": {
      "@type": "Offer",
      "url": `https://www.hexescortsug.com/profile/${profileSlug}`,
      "priceCurrency": "UGX",
      "price": "100000",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Hex Escorts UG"
      }
    }
  };

  const breadcrumbItems = [
    { label: "Escorts in Uganda", href: "/escorts-in" },
    { label: profile.location, href: `/escorts-in/${slugify(profile.location)}` },
    { label: profile.name, href: `/profile/${profileSlug}`, current: true }
  ];

  return (
    <main className="min-h-screen bg-black pt-4 pb-8">
      <div className="container mx-auto px-4">
        <Breadcrumbs items={breadcrumbItems} />
        {jsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        )}
        <ProfileDetailPageClient profileId={id} initialProfile={profile} />
      </div>
    </main>
  );
}
