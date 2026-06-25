import LocationPageClient from "@/screens/LocationPage";
import { fetchAllProfiles } from "@/data/allProfiles";
import type { Metadata } from 'next';
import Breadcrumbs from "@/components/Breadcrumbs";

export const revalidate = 60; // Refresh data every 60 seconds

export const metadata: Metadata = {
  title: 'Independent Escorts in Uganda - Real & Verified Call Girls | Hex Escorts UG',
  description: 'Find independent escorts in Uganda with 100% verified photos and direct WhatsApp contacts. Browse elite companions, Call Girls, and hookups across Kampala, Entebbe, Jinja, and countrywide.',
  keywords: 'escorts in Uganda, Uganda escorts, Kampala escorts, Entebbe escorts, Jinja escorts, verified escorts Uganda',
  alternates: {
    canonical: 'https://www.hexescortsug.com/escorts-in',
  }
};

export default async function Page() {
  // Generate a fresh seed for every request to ensure a new shuffle on refresh
  const seed = Math.random().toString(36).substring(2, 10);
  
  // Fetch all profiles for index/all locations
  const rawProfiles = await fetchAllProfiles(seed);

  const breadcrumbItems = [
    { label: "Escorts in Uganda", href: "/escorts-in", current: true }
  ];

  return (
    <main className="min-h-screen bg-black pt-4 pb-8">
      <div className="container mx-auto px-4">
        <Breadcrumbs items={breadcrumbItems} />
        <LocationPageClient 
          cityParam={undefined} 
          suburbParam={undefined}
          initialProfiles={rawProfiles} 
          shuffleSeed={seed} 
        />
      </div>
    </main>
  );
}
