import { fetchAllProfiles } from "@/data/allProfiles";
import VipPage from "@/screens/VipPage";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Elite VIP Escorts in Uganda | Premium Companions - Hex Escorts UG',
  description: 'Experience true luxury with our hand-picked elite VIP escorts in Kampala and across Uganda. The most premium companions for the most discerning clients.',
  alternates: {
    canonical: 'https://www.hexescortsug.com/vip',
  }
};

export const revalidate = 60;

export default async function Page() {
  // Generate a fresh seed for every request
  const seed = Math.random().toString(36).substring(2, 10);
  
  const rawProfiles = await fetchAllProfiles(seed);
  return <VipPage initialProfiles={rawProfiles} shuffleSeed={seed} />;
}
